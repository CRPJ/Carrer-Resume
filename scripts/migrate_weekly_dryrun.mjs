// ────────────────────────────────────────────────────────────────────────────
// 주차별 활동·포인트 마이그레이션 DRY-RUN (실제 쓰기 없음)
//   활동텍스트+강화성공 ← oranke.useractivities   (StartDate → NEW weeks.start_date)
//   주차별 단감/인절미   ← oranke.pointlogs SUM    (ActivityTime 월요일주 버킷)
//   대상: 조선규 (OLD UserId 1373 / NEW user_id 9a546cd2-becf-4d96-baa0-f087af6d4803)
//   실행: node scripts/migrate_weekly_dryrun.mjs
// ────────────────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const OLD_USER_ID = 1373;
const NEW_USER_ID = "9a546cd2-becf-4d96-baa0-f087af6d4803"; // 조선규
const NEW_LINE_ID = "club1_legacy_data"; // 신규 activity_type ('클럽 1.0 임시데이터')

// 팀/파트 매핑 (OLD 자유텍스트 → NEW). 신입은 온보딩으로.
const TEAM_MAP = { "신입": "클럽온보딩" };
const PART_MAP = { "신입": "신입OT" };

// ─── OLD MySQL (SQL stdin 파이프) ─────────────────────────────────────────────
const SSH_KEY = `${env.USERPROFILE || process.env.USERPROFILE}/.ssh/${env.OLD_SSH_KEY}`;
function runOldSql(sql) {
  const remote = `MYSQL_PWD='${env.OLD_DB_PASS}' mysql -u '${env.OLD_DB_USER}' --default-character-set=utf8mb4 -N`;
  return execFileSync("ssh", ["-i", SSH_KEY, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=30",
    `${env.OLD_SSH_USER}@${env.OLD_SSH_HOST}`, remote], { input: sql, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}
const j = (sql) => JSON.parse(runOldSql(sql).trim() || "[]");

// ─── 메인 ─────────────────────────────────────────────────────────────────────
(async () => {
  // 1) OLD useractivities (활동텍스트)
  const acts = j(`SELECT CAST(JSON_ARRAYAGG(JSON_OBJECT(
      'season', Season, 'sweek', SeasonWeek, 'start', DATE_FORMAT(StartDate,'%Y-%m-%d'),
      'team', UserTeam, 'part', UserPart, 'level', UserLevel,
      'star', Star, 'active', IsActive, 'activity', Activity
    )) AS CHAR) FROM oranke.useractivities
    WHERE UserId=${OLD_USER_ID} AND StartDate > '2000-01-01' ORDER BY StartDate;`);

  // 2) OLD pointlogs 주차별(월요일주) — 양수/전체 분리 (휴식류 주차는 양수만 적용)
  const pts = j(`SELECT CAST(JSON_ARRAYAGG(JSON_OBJECT(
      'wkmon', wkmon, 'star_pos', star_pos, 'star_all', star_all,
      'shield_pos', shield_pos, 'shield_all', shield_all)) AS CHAR) FROM (
        SELECT DATE_FORMAT(DATE_SUB(ActivityTime, INTERVAL WEEKDAY(ActivityTime) DAY),'%Y-%m-%d') AS wkmon,
               SUM(GREATEST(Star,0)) star_pos,   SUM(Star) star_all,
               SUM(GREATEST(Shield,0)) shield_pos, SUM(Shield) shield_all
        FROM oranke.pointlogs
        WHERE UserID=${OLD_USER_ID} AND IsDeleted=0 AND ActivityTime > '2000-01-01'
        GROUP BY wkmon) t;`);

  // 3) NEW weeks + seasons + 개인휴식(rest_requests)
  const { data: weeks } = await sb.from("weeks").select("id, season_id, week_number, start_date, end_date, is_club_break, holiday_name");
  const { data: seasons } = await sb.from("seasons").select("id, name, year");
  const { data: restReq } = await sb.from("rest_requests").select("week_id").eq("user_id", NEW_USER_ID).eq("status", "approved");
  const seasonName = new Map((seasons || []).map(s => [s.id, `${s.year} ${s.name}`]));
  const weekByStart = new Map((weeks || []).map(w => [w.start_date, w]));
  const personalRest = new Set((restReq || []).map(r => r.week_id));

  // 온보딩 주차 = useractivities 최초 주차(신입). 그 이전 주차 포인트는 온보딩으로 접음.
  const onboardStart = acts.length ? acts.map(a => a.start).sort()[0] : null;
  const onboardWeek = onboardStart ? weekByStart.get(onboardStart) : null;
  // 휴식류 판정: 공식휴식(is_club_break) | 개인휴식 | 온보딩 주차 → 양수만 적용(패널티 무시)
  const isRestType = (w) => w.is_club_break || personalRest.has(w.id) || (onboardWeek && w.id === onboardWeek.id);

  // 4) 주차별 병합: NEW week_id 기준
  const perWeek = new Map(); // newWeekId -> {week, dangam, injeolmi, act}
  const getSlot = (w) => {
    if (!perWeek.has(w.id)) perWeek.set(w.id, { week: w, dangam: 0, injeolmi: 0, act: null });
    return perWeek.get(w.id);
  };
  const unmatched = [];

  for (const p of pts) {
    // 가입 이전 주차 포인트 → 온보딩 주차로 접기 (쟁점1)
    let w = weekByStart.get(p.wkmon);
    if (onboardStart && p.wkmon < onboardStart) w = onboardWeek;
    if (!w) { unmatched.push({ type: "point", date: p.wkmon, dangam: p.star_all, injeolmi: p.shield_all }); continue; }
    const s = getSlot(w);
    if (isRestType(w)) { s.dangam += p.star_pos; s.injeolmi += p.shield_pos; }   // 휴식류: 양수만 (쟁점2·3)
    else { s.dangam += p.star_all; s.injeolmi += p.shield_all; }                   // 일반: 전부
  }
  for (const a of acts) {
    const w = weekByStart.get(a.start);
    if (!w) { unmatched.push({ type: "act", date: a.start, season: a.season, sweek: a.sweek }); continue; }
    getSlot(w).act = a;
  }

  // 5) 출력
  console.log(`▶ 조선규 (OLD ${OLD_USER_ID} / NEW ${NEW_USER_ID})`);
  console.log(`  활동 ${acts.length}주차, 포인트 발생 ${pts.length}주차\n`);
  console.log("NEW주차".padEnd(22) + "│ 단감 │ 인절미│ 성공 │ 팀/파트(→NEW)        │ 라인'클럽1.0'(활동텍스트)");
  console.log("─".repeat(115));

  const ordered = [...perWeek.values()].sort((a, b) => a.week.start_date.localeCompare(b.week.start_date));
  let cumStar = 0, cumShield = 0, lineCount = 0;
  for (const s of ordered) {
    const w = s.week;
    cumStar += s.dangam; cumShield += s.injeolmi;
    const wlabel = `${seasonName.get(w.season_id)} ${w.week_number}주 (${w.start_date})`;
    const isBreak = w.is_club_break ? "휴식" : "";
    let teamPart = "", lineText = "";
    let success = s.dangam > 0 || (s.act && s.act.active); // 활동인정 or 포인트획득 → 성공
    if (s.act) {
      const t = TEAM_MAP[s.act.team] || s.act.team;
      const pt = PART_MAP[s.act.part] || s.act.part;
      teamPart = `${s.act.team}/${s.act.part}→${t}/${pt}`;
      lineText = (s.act.activity || "").replace(/\s+/g, " ").slice(0, 38);
      lineCount++;
      if (s.act.team === "신입") success = true; // 온보딩 무조건 성공
    } else {
      teamPart = isBreak ? "(공식휴식)" : "(활동행없음)";
    }
    console.log(
      wlabel.padEnd(22) + "│ " +
      String(s.dangam).padStart(4) + " │ " + String(s.injeolmi).padStart(4) + " │ " +
      (success ? " O  " : isBreak ? "휴식" : " ·  ") + " │ " +
      teamPart.padEnd(20) + " │ " + (lineText ? lineText + "…" : "—")
    );
  }

  console.log("─".repeat(115));
  console.log(`누적 결과 → user_cumulative_points:  total_stars += ${cumStar},  total_shields += ${cumShield},  total_lightnings += 0`);
  console.log(`실무경험 '클럽 1.0 임시데이터' 라인 생성: ${lineCount}개 주차 (activity_records + user_activity_details)`);
  console.log(`user_weekly_growth: ${ordered.length}개 주차에 earned_stars/earned_shields + is_success 기록`);
  if (unmatched.length) {
    console.log(`\n⚠️ NEW 주차 매칭 실패 ${unmatched.length}건 (확인 필요):`);
    unmatched.forEach(u => console.log(`   - ${u.type} ${u.date} ${u.season || ""}${u.sweek || ""} 단감${u.dangam ?? ""}`));
  }
  console.log("\n※ DRY-RUN — 실제 DB 쓰기는 전혀 하지 않았습니다.");
})().catch(e => { console.error("오류:", e.message); process.exit(1); });
