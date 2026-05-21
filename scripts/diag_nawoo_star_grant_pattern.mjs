// 김나우 봄 9, 10주차에 단감 50개를 어떻게 부여했는지 패턴 추적.
// points 테이블의 point_type='star' 행을 보고, line_id / 메타 / 시각 같이 출력.
import { createClient } from "@supabase/supabase-js";
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

const USER_ID = "89f3e14b-68c7-4d6c-bb98-7617cdbf3b8d"; // 김나우

const { data: weeksRaw } = await sb.from("weeks")
  .select("id, week_number, start_date, end_date, seasons(name, year)")
  .order("start_date");
const spring2026 = weeksRaw.filter(w => w.seasons?.year === 2026 && w.seasons?.name === "spring");
const wByNum = Object.fromEntries(spring2026.map(w => [w.week_number, w]));

for (const num of [9, 10, 11]) {
  const w = wByNum[num];
  if (!w) { console.log(`\n[${num}주차] 없음`); continue; }
  console.log(`\n\n========== 2026 봄 ${num}주차 (${w.start_date} ~ ${w.end_date}) ==========`);
  console.log(`week_id: ${w.id}`);

  const { data: pts } = await sb.from("points")
    .select("*").eq("user_id", USER_ID).eq("week_id", w.id).order("given_at");
  console.log(`\n[points] ${pts?.length || 0}건`);
  for (const p of pts || []) {
    console.log(`  - ${p.point_type}=${p.points}  line_id=${p.line_id}  given_at=${p.given_at}  ${JSON.stringify(p)}`);
  }
  const starSum = (pts || []).filter(p => p.point_type === "star").reduce((s, p) => s + (p.points || 0), 0);
  const lightningSum = (pts || []).filter(p => p.point_type === "lightning").reduce((s, p) => s + (p.points || 0), 0);
  const shieldSum = (pts || []).filter(p => p.point_type === "shield").reduce((s, p) => s + (p.points || 0), 0);
  console.log(`  → 합계: star=${starSum} lightning=${lightningSum} shield=${shieldSum}`);

  const { data: uwg } = await sb.from("user_weekly_growth")
    .select("earned_stars, required_stars, is_success, is_force_approved, force_approved_reason")
    .eq("user_id", USER_ID).eq("week_id", w.id);
  console.log(`[user_weekly_growth] ${JSON.stringify(uwg)}`);
}

// 50개 단감 granting 흔적이 있는지 후보 테이블도 탐색
console.log("\n\n========== 보너스 단감 부여 흔적 후보 ==========");
for (const t of ["points","user_star_grants","star_grants","manual_grants","admin_grants"]) {
  const { data, error } = await sb.from(t).select("*").eq("user_id", USER_ID).limit(50);
  if (error) {
    if (!error.message?.includes("Could not find") && !error.message?.includes("relation")) {
      console.log(`  ${t}: ERR ${error.message?.slice(0,80)}`);
    }
    continue;
  }
  if (!data?.length) continue;
  // points는 활동 별점 다수라 50점 단위만 필터
  const filtered = t === "points" ? data.filter(r => r.point_type === "star" && r.points === 50) : data;
  if (!filtered.length) continue;
  console.log(`  ${t}: ${filtered.length}건 (point_type='star' & points=50 만)`);
  for (const r of filtered) console.log(`    ${JSON.stringify(r)}`);
}
