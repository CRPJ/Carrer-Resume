// ────────────────────────────────────────────────────────────────────────────
// 파일럿 마이그레이션 DRY-RUN (실제 쓰기 없음)
//   - OLD(oranke_base, MySQL over SSH) → NEW(Supabase) backfill 시뮬레이션
//   - 출력: ① OLD↔NEW 매칭 결과  ② user_profiles 필드별 diff  ③ educations/points 계획
//   - 실행: node scripts/migrate_pilot_dryrun.mjs
// ────────────────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { normalizeSchool, normalizeMajor } = require("../lib/schoolNormalize.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// ─── 파일럿 대상 (oranke_base.user_info.id) ───────────────────────────────────
const OLD_DB = "oranke_base";
const CLUB = "오랑캐";
const PILOT_OLD_IDS = [1213, 1290, 1373]; // 이수현(삼육대), 이윤서(경기대), 조선규(가천대)

// 🔒 엔터팀 15명 — 예전에 제대로 마이그레이션된 크루. 기존 NEW 데이터 절대 건드리지 않음.
//    (app/api/crews/route.ts 의 BETA_TESTERS 와 동일 명단)
const LOCKED_NAMES = new Set([
  "박건희", "김시영", "김예령", "김현진", "정우현",
  "이용준", "김혜윤", "김나우", "김승민", "김수현",
  "정재웅", "고수림", "최희원", "윤재윤", "빵떡이",
]);

// ─── OLD MySQL 쿼리 (SQL을 stdin 으로 파이프 → 따옴표 이슈 회피) ───────────────
const SSH_KEY = `${env.USERPROFILE || process.env.USERPROFILE}/.ssh/${env.OLD_SSH_KEY}`;
function runOldSql(sql) {
  const remote = `MYSQL_PWD='${env.OLD_DB_PASS}' mysql -u '${env.OLD_DB_USER}' --default-character-set=utf8mb4 -N`;
  const out = execFileSync("ssh", [
    "-i", SSH_KEY, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=25",
    `${env.OLD_SSH_USER}@${env.OLD_SSH_HOST}`, remote,
  ], { input: sql, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return out;
}
function fetchOldCrews(ids) {
  const idList = ids.join(",");
  const sql = `SELECT CAST(JSON_ARRAYAGG(JSON_OBJECT(
      'old_id', u.id, 'name', u.name, 'birthDay', u.birthDay, 'gender', u.gender,
      'school', u.school, 'major', u.major, 'major2', u.major2, 'major3', u.major3,
      'address', u.address, 'contact', u.contact, 'mail', u.mail,
      'schoolState', u.schoolState, 'engName', u.engName,
      'team', c.team, 'part', c.part, 'week', c.week, 'startDate', c.startDate,
      'state', c.state, 'slogan', c.slogan, 'appealMent', c.appealMent,
      'totalPoint', p.totalPoint, 'totalAdvantage', p.totalAdvantage
    )) AS CHAR)
    FROM ${OLD_DB}.user_info u
    LEFT JOIN ${OLD_DB}.crew_info  c ON c.user_id = u.id
    LEFT JOIN ${OLD_DB}.crew_point p ON p.user_id = u.id
    WHERE u.id IN (${idList});`;
  return JSON.parse(runOldSql(sql).trim() || "[]");
}

// ─── 변환 규칙 ────────────────────────────────────────────────────────────────
const clean = (v) => (v == null ? null : String(v).trim() === "" ? null : String(v).trim());
function toBirthDate(yymmdd) {           // "020503" → "2002-05-03"
  const s = clean(yymmdd);
  if (!s || !/^\d{6}$/.test(s)) return null;
  return `20${s.slice(0, 2)}-${s.slice(2, 4)}-${s.slice(4, 6)}`;
}
function toPhone(raw) {                   // "01044951006" → "010-4495-1006"
  const d = clean(raw)?.replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return d;
}
function splitMajor(major, major2) {     // "A/B" 또는 별도컬럼 → [m1, m2] (정규화 적용)
  const parts = [];
  const m = clean(major);
  if (m) m.split("/").map(s => s.trim()).filter(Boolean).forEach(x => parts.push(x));
  const m2 = clean(major2);
  if (m2) parts.push(m2);
  return [parts[0] ? normalizeMajor(parts[0]) : null, parts[1] ? normalizeMajor(parts[1]) : null];
}
// OLD 한 명 → NEW user_profiles 후보 값 (학교/전공 정규화 적용)
function toNewProfile(o) {
  const [m1, m2] = splitMajor(o.major, o.major2);
  const school = clean(o.school);
  return {
    display_name: clean(o.name),
    gender: clean(o.gender),
    birth_date: toBirthDate(o.birthDay),
    university: school ? normalizeSchool(school) : null,
    major_first: m1,
    major_second: m2,
    phone: toPhone(o.contact),
    email: clean(o.mail),
    auth_email: clean(o.mail),
    eng_name: clean(o.engName),
    address: clean(o.address),
  };
}

// ─── NEW 값이 "비어있음"으로 간주되는가 (placeholder 포함) ─────────────────────
const isPlaceholderEmail = (e) => /@club15\.local$/i.test(e || "");
const isEmptyNew = (field, val) => val == null || String(val).trim() === "" ||
  (field === "email" || field === "auth_email" ? isPlaceholderEmail(val) : false);

// ─── 매칭: OLD → NEW ──────────────────────────────────────────────────────────
function buildMatchers(newRows) {
  const byOldId = new Map();   // placeholder 메일에 박힌 OLD id
  const byBirthName = new Map();
  const byPhone = new Map();
  for (const r of newRows) {
    const m = (r.email || "").match(/^crew(\d+)@club15\.local$/i);
    if (m) byOldId.set(Number(m[1]), r);
    if (r.birth_date && r.display_name) byBirthName.set(`${r.birth_date}|${r.display_name}`, r);
    const ph = (r.phone || "").replace(/\D/g, "");
    if (ph) byPhone.set(ph, r);
  }
  return { byOldId, byBirthName, byPhone };
}
function matchOldToNew(o, cand, M) {
  if (M.byOldId.has(o.old_id)) return { row: M.byOldId.get(o.old_id), via: "placeholder-id" };
  const bn = `${cand.birth_date}|${cand.display_name}`;
  if (cand.birth_date && M.byBirthName.has(bn)) return { row: M.byBirthName.get(bn), via: "birth+name" };
  const ph = (cand.phone || "").replace(/\D/g, "");
  if (ph && M.byPhone.has(ph)) return { row: M.byPhone.get(ph), via: "phone" };
  return { row: null, via: "none" };
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
const PROFILE_FIELDS = ["display_name", "gender", "birth_date", "university",
  "major_first", "major_second", "phone", "email", "auth_email", "eng_name", "address"];

(async () => {
  console.log("OLD 데이터 로딩...");
  const olds = fetchOldCrews(PILOT_OLD_IDS);
  console.log(`OLD 크루 ${olds.length}명 로드\n`);

  const { data: newRows } = await sb.from("user_profiles")
    .select("id, display_name, gender, birth_date, university, major_first, major_second, phone, email, auth_email, eng_name, address, club, crew_serial, growth_status")
    .eq("club", CLUB);
  const M = buildMatchers(newRows || []);

  // 매칭된 NEW 유저들의 기존 학력행 조회 (create vs update 판정용)
  const matchedIds = [];
  for (const o of olds) { const r = matchOldToNew(o, toNewProfile(o), M).row; if (r) matchedIds.push(r.id); }
  const { data: existingEdu } = matchedIds.length
    ? await sb.from("user_educations").select("user_id, school_name, sort_order").in("user_id", matchedIds)
    : { data: [] };
  const eduByUser = new Map();
  (existingEdu || []).forEach(e => { if (!eduByUser.has(e.user_id)) eduByUser.set(e.user_id, []); eduByUser.get(e.user_id).push(e); });

  let fill = 0, change = 0, same = 0, newInsert = 0;
  const eduPlan = [], pointPlan = [];

  for (const o of olds) {
    const cand = toNewProfile(o);
    const { row: nw, via } = matchOldToNew(o, cand, M);

    console.log("═".repeat(78));
    console.log(`▶ OLD #${o.old_id}  ${o.name}  (${o.school} / ${o.major})  [state=${o.state}]`);
    if (!nw) {
      console.log(`  매칭: ❌ NEW 없음 → 신규 INSERT 대상 (이번 파일럿 범위 밖일 수 있음)`);
      newInsert++;
      console.log("");
      continue;
    }
    console.log(`  매칭: ✅ NEW serial=${nw.crew_serial} (id=${nw.id})  via ${via}`);
    if (LOCKED_NAMES.has(nw.display_name)) {
      console.log(`  🔒 LOCKED — 엔터팀 15명에 포함. backfill 제외(기존 데이터 보존), 변경 0건.`);
      console.log("");
      continue;
    }
    console.log("  ┌─ 필드 ──────────┬─ 기존 NEW ───────────────┬─ OLD(새 값) ─────────────┬─ 조치");
    for (const f of PROFILE_FIELDS) {
      const oldV = cand[f];
      const curV = nw[f];
      if (oldV == null) continue;                       // OLD에 값 없으면 건드릴 것 없음
      let action;
      if (isEmptyNew(f, curV)) action = oldV !== curV ? "FILL" : "same";
      else if (String(curV) === String(oldV)) action = "same";
      else action = "CHANGE";
      if (action === "same") { same++; continue; }
      if (action === "FILL") fill++; else change++;
      const tag = action === "CHANGE" ? "⚠️ CHANGE" : "➕ FILL";
      const fmt = (x) => (x == null ? "·(빈값)" : isPlaceholderEmail(x) ? `${x} (placeholder)` : String(x));
      console.log(`  │ ${f.padEnd(15)}│ ${fmt(curV).padEnd(24)}│ ${fmt(oldV).padEnd(24)}│ ${tag}`);
    }
    console.log("  └─────────────────┴──────────────────────────┴──────────────────────────┴───────");

    // educations / points 계획 (참고용 — 별도 테이블)
    const [m1, m2] = splitMajor(o.major, o.major2);
    const school = clean(o.school);
    const existing = eduByUser.get(nw.id) || [];
    eduPlan.push({
      name: o.name, school: school ? normalizeSchool(school) : null, m1, m2,
      status: clean(o.schoolState), op: existing.length ? `UPDATE (기존 ${existing.length}행)` : "CREATE",
    });
    pointPlan.push({ name: o.name, total_stars: o.totalPoint ?? 0, totalAdvantage: o.totalAdvantage ?? 0 });
    console.log("");
  }

  console.log("═".repeat(78));
  console.log("📚 user_educations 계획 (school/전공 → 학력행 생성·갱신)");
  eduPlan.forEach(e => console.log(`   - ${e.name} [${e.op}]: school_name=${e.school}, major_name_1=${e.m1}, major_name_2=${e.m2 || "·"}, status=${e.status}`));
  console.log("");
  console.log("⭐ user_cumulative_points 계획 (totalPoint → total_stars)");
  pointPlan.forEach(p => console.log(`   - ${p.name}: total_stars=${p.total_stars}  (totalAdvantage=${p.totalAdvantage} ← 매핑 대상 미정)`));
  console.log("");
  console.log("─".repeat(78));
  console.log(`요약:  FILL(빈칸채움) ${fill}건  |  CHANGE(틀린값교정) ${change}건  |  변화없음 ${same}건  |  NEW없음(신규) ${newInsert}명`);
  console.log("※ DRY-RUN — 실제 DB 쓰기는 전혀 하지 않았습니다.");
})().catch(e => { console.error("오류:", e.message); process.exit(1); });
