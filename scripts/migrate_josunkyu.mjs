// ────────────────────────────────────────────────────────────────────────────
// 조선규 클럽1.0 → 1.5 실제 마이그레이션 (멱등). 파일럿 1호.
//   프로필/학력 backfill + 주차별 실무경험 라인(클럽1.0 임시데이터) + 주차별 단감/인절미 + 누적
//   DRY=true 면 쓰기 없이 계획만 출력.
//   실행: node scripts/migrate_josunkyu.mjs          (실제 반영)
//        DRY=1 node scripts/migrate_josunkyu.mjs     (드라이런)
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
const env = Object.fromEntries(readFileSync(resolve(__dirname, "../.env.local"), "utf8").split("\n").map(l=>l.trim()).filter(l=>l&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,"")];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const DRY = !!process.env.DRY;
const NOW = "2026-06-10T00:00:00.000Z";

const OLD_USER_ID = 1373;
const NEW_USER_ID = "9a546cd2-becf-4d96-baa0-f087af6d4803";
const LINE_ID = "club1_legacy_data";
const POINT_REASON = "클럽1.0 임시데이터 마이그레이션";
const TEAM_MAP = { "신입": "클럽온보딩" };
const PART_MAP = { "신입": "신입OT" };

// ─── OLD MySQL ────────────────────────────────────────────────────────────────
const SSH_KEY = `${env.USERPROFILE || process.env.USERPROFILE}/.ssh/${env.OLD_SSH_KEY}`;
const runOldSql = (sql) => execFileSync("ssh", ["-i", SSH_KEY, "-o","StrictHostKeyChecking=accept-new","-o","ConnectTimeout=30",
  `${env.OLD_SSH_USER}@${env.OLD_SSH_HOST}`, `MYSQL_PWD='${env.OLD_DB_PASS}' mysql -u '${env.OLD_DB_USER}' --default-character-set=utf8mb4 -N`],
  { input: sql, encoding: "utf8", maxBuffer: 64*1024*1024 });
const j = (sql) => JSON.parse(runOldSql(sql).trim() || "null");

// ─── 변환 ─────────────────────────────────────────────────────────────────────
const clean = (v) => (v==null||String(v).trim()===""?null:String(v).trim());
const toPhone = (r) => { const d=clean(r)?.replace(/\D/g,""); if(!d) return null; if(d.length===11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`; if(d.length===10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`; return d; };
const firstMajor = (m) => { const s=clean(m); if(!s) return null; return normalizeMajor(s.split("/")[0].trim()); };
const normAddr = (a) => { let s=clean(a); if(!s) return null; s=s.replace(/[!~.\s]+$/,"").replace("서울특별시","서울시").replace("특별자치시","시").replace("광역시","시"); return s.trim()||null; };

(async () => {
  console.log(`=== 조선규 마이그레이션 ${DRY?"[DRY-RUN]":"[실제 반영]"} ===\n`);

  // ── OLD 데이터 ──
  const prof = j(`SELECT CAST(JSON_OBJECT('name',u.name,'mail',u.mail,'contact',u.contact,'school',u.school,'major',u.major,'address',u.address,'birthDay',u.birthDay,'gender',u.gender) AS CHAR)
    FROM oranke_base.user_info u WHERE u.id=${OLD_USER_ID};`);
  const acts = j(`SELECT CAST(JSON_ARRAYAGG(JSON_OBJECT('start',DATE_FORMAT(StartDate,'%Y-%m-%d'),'team',UserTeam,'part',UserPart,'level',UserLevel,'active',IsActive,'activity',Activity)) AS CHAR)
    FROM oranke.useractivities WHERE UserId=${OLD_USER_ID} AND StartDate>'2000-01-01' ORDER BY StartDate;`) || [];
  const pts = j(`SELECT CAST(JSON_ARRAYAGG(JSON_OBJECT('wkmon',wkmon,'star_pos',star_pos,'star_all',star_all,'shield_pos',shield_pos,'shield_all',shield_all)) AS CHAR) FROM (
      SELECT DATE_FORMAT(DATE_SUB(ActivityTime, INTERVAL WEEKDAY(ActivityTime) DAY),'%Y-%m-%d') wkmon,
        SUM(GREATEST(Star,0)) star_pos, SUM(Star) star_all, SUM(GREATEST(Shield,0)) shield_pos, SUM(Shield) shield_all
      FROM oranke.pointlogs WHERE UserID=${OLD_USER_ID} AND IsDeleted=0 AND ActivityTime>'2000-01-01' GROUP BY wkmon) t;`) || [];

  // ── NEW weeks ──
  const { data: weeks } = await sb.from("weeks").select("id, season_id, week_number, start_date, is_club_break");
  const weekByStart = new Map(weeks.map(w => [w.start_date, w]));
  const { data: restReq } = await sb.from("rest_requests").select("week_id").eq("user_id", NEW_USER_ID).eq("status","approved");
  const personalRest = new Set((restReq||[]).map(r=>r.week_id));
  const onboardStart = acts.length ? acts.map(a=>a.start).sort()[0] : null;
  const onboardWeek = onboardStart ? weekByStart.get(onboardStart) : null;
  const isRest = (w) => w.is_club_break || personalRest.has(w.id) || (onboardWeek && w.id===onboardWeek.id);

  // ── 주차별 병합 ──
  const perWeek = new Map();
  const slot = (w) => { if(!perWeek.has(w.id)) perWeek.set(w.id,{week:w,star:0,shield:0,act:null}); return perWeek.get(w.id); };
  for (const p of pts) {
    let w = weekByStart.get(p.wkmon);
    if (onboardStart && p.wkmon < onboardStart) w = onboardWeek; // 가입 전 → 온보딩 합산
    if (!w) { console.log(`  ⚠️ 포인트 주차 매칭실패 ${p.wkmon}`); continue; }
    const s = slot(w);
    if (isRest(w)) { s.star += p.star_pos; s.shield += p.shield_pos; } else { s.star += p.star_all; s.shield += p.shield_all; }
  }
  for (const a of acts) { const w = weekByStart.get(a.start); if(w) slot(w).act = a; }

  // ───────────────────── 1) 프로필 backfill ─────────────────────
  const profPatch = {
    university: prof.school ? normalizeSchool(clean(prof.school)) : null,
    major_first: firstMajor(prof.major),
    phone: toPhone(prof.contact),
    email: clean(prof.mail), auth_email: clean(prof.mail),
    address: normAddr(prof.address),
    onboarding_week_id: onboardWeek?.id || null,
    joined_week_id: onboardWeek?.id || null,
    joined_season_id: onboardWeek?.season_id || null,
    updated_at: NOW,
  };
  console.log("1) user_profiles patch:", JSON.stringify(profPatch));
  if (!DRY) { const { error } = await sb.from("user_profiles").update(profPatch).eq("id", NEW_USER_ID); if(error) throw error; }

  // ───────────────────── 2) user_educations (없으면 생성) ─────────────────────
  const { data: edu } = await sb.from("user_educations").select("id").eq("user_id", NEW_USER_ID);
  if (!edu?.length) {
    // 입학년도·졸업년도·재학상태·성적은 1.0에 데이터 없어 비움(admission_year 는 NOT NULL → 빈 문자열).
    const eduRow = { user_id: NEW_USER_ID, education_level: "university", school_name: profPatch.university, // status 는 CHECK 제약(enrolled/graduated/...) → OLD schoolState='재학' = enrolled. 입학년도/성적은 빈 채.
    major_name_1: profPatch.major_first, admission_year: "", graduation_year: null, status: "enrolled", sort_order: 0, created_at: NOW, updated_at: NOW };
    console.log("2) user_educations CREATE:", JSON.stringify(eduRow));
    if (!DRY) { const { error } = await sb.from("user_educations").insert(eduRow); if(error) throw error; }
  } else console.log(`2) user_educations: 기존 ${edu.length}행 존재 → 스킵`);

  // ───────────────────── 3) 주차별 activity_records + user_activity_details ─────────────────────
  const actWeeks = [...perWeek.values()].filter(s => s.act);
  console.log(`3) 실무경험 '클럽1.0 임시데이터' 라인: ${actWeeks.length}주차`);
  for (const s of actWeeks) {
    const { data: exist } = await sb.from("activity_records").select("id").eq("user_id",NEW_USER_ID).eq("week_id",s.week.id).eq("activity_type_id",LINE_ID).maybeSingle();
    if (!exist && !DRY) await sb.from("activity_records").insert({ user_id:NEW_USER_ID, week_id:s.week.id, activity_type_id:LINE_ID, is_completed:true, status:"completed", completed_at:NOW });
    if (!DRY) await sb.from("user_activity_details").upsert({ user_id:NEW_USER_ID, week_id:s.week.id, activity_type_id:LINE_ID, sub_title:s.act.activity, updated_at:NOW }, { onConflict:"user_id,week_id,activity_type_id" });
    console.log(`   - ${s.week.start_date} (W${s.week.week_number}) ${exist?"기록존재":"신규"} | ${(s.act.activity||"").replace(/\s+/g," ").slice(0,30)}…`);
  }

  // ───────────────────── 4) 주차별 단감/인절미 (points) — 멱등: 마이그레이션 행 재생성 ─────────────────────
  if (!DRY) await sb.from("points").delete().eq("user_id",NEW_USER_ID).eq("reason",POINT_REASON);
  const pointRows = [];
  for (const s of perWeek.values()) {
    if (s.star) pointRows.push({ user_id:NEW_USER_ID, week_id:s.week.id, point_type:"star", points:s.star, reason:POINT_REASON, given_by:NEW_USER_ID, given_at:NOW });
    if (s.shield) pointRows.push({ user_id:NEW_USER_ID, week_id:s.week.id, point_type:"shield", points:s.shield, reason:POINT_REASON, given_by:NEW_USER_ID, given_at:NOW });
  }
  console.log(`4) points: ${pointRows.length}행 (star/shield)`);
  if (!DRY && pointRows.length) { const { error } = await sb.from("points").insert(pointRows); if(error) throw error; }

  // ───────────────────── 5) user_weekly_growth (주차별 is_success + earned_stars) ─────────────────────
  const growthRows = [...perWeek.values()].map(s => ({
    user_id: NEW_USER_ID, week_id: s.week.id,
    is_success: s.act ? (s.act.team==="신입" ? true : !!s.act.active) : (s.star > 0),
    earned_stars: s.star,
    is_club_break: !!s.week.is_club_break,
    calculated_at: NOW, updated_at: NOW,
  }));
  console.log(`5) user_weekly_growth: ${growthRows.length}주차 upsert`);
  if (!DRY) { const { error } = await sb.from("user_weekly_growth").upsert(growthRows, { onConflict:"user_id,week_id" }); if(error) throw error; }

  // ───────────────────── 6) user_cumulative_points (누적) ─────────────────────
  let totStar=0, totShield=0; for (const s of perWeek.values()) { totStar+=s.star; totShield+=s.shield; }
  const cum = { user_id:NEW_USER_ID, total_stars:totStar, total_shields:totShield, total_lightnings:0, last_calculated_at:NOW, updated_at:NOW };
  console.log(`6) user_cumulative_points: 단감 ${totStar} / 인절미 ${totShield} / 어흥 0`);
  if (!DRY) { const { error } = await sb.from("user_cumulative_points").upsert(cum, { onConflict:"user_id" }); if(error) throw error; }

  console.log(`\n${DRY?"※ DRY-RUN — 쓰기 없음.":"✓ 완료. cluster-4-card 에서 봄 9주차 등 확인하세요."}`);
})().catch(e => { console.error("오류:", e.message, e.details||""); process.exit(1); });
