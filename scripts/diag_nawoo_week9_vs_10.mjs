// 김나우 봄 9주차 / 10주차 비교 진단
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

async function main() {
  const { data: u } = await sb.from("user_profiles")
    .select("*").eq("id", USER_ID).single();
  console.log("=== USER ===", { id: u.id, display_name: u.display_name, growth_status: u.growth_status, onboarding_week_id: u.onboarding_week_id, joined_week_id: u.joined_week_id });

  const { data: weeksRaw } = await sb.from("weeks")
    .select("id, week_number, start_date, end_date, is_club_break, season_id, seasons(name, year)")
    .order("start_date");
  const spring2026 = weeksRaw.filter(w => w.seasons?.year === 2026 && w.seasons?.name === "spring");
  const w9 = spring2026.find(w => w.week_number === 9);
  const w10 = spring2026.find(w => w.week_number === 10);
  console.log("\n=== 2026 봄 9주차 ===", w9);
  console.log("=== 2026 봄 10주차 ===", w10);

  for (const w of [w9, w10]) {
    console.log(`\n\n========================================`);
    console.log(`====== 2026 봄 ${w.week_number}주차 (${w.start_date} ~ ${w.end_date}) week_id=${w.id} ======`);
    console.log(`========================================`);

    const { data: uwg } = await sb.from("user_weekly_growth")
      .select("*").eq("user_id", USER_ID).eq("week_id", w.id);
    console.log(`\n[user_weekly_growth] ${uwg?.length || 0}건`);
    for (const r of uwg || []) console.log(JSON.stringify(r, null, 2));

    const { data: ar } = await sb.from("activity_records")
      .select("*, activity_types(id, name, cluster_id, line_code, reward_star)")
      .eq("user_id", USER_ID).eq("week_id", w.id);
    console.log(`\n[activity_records] ${ar?.length || 0}건`);
    for (const r of ar || []) {
      const at = r.activity_types;
      const otherCols = Object.entries(r).filter(([k]) => !["activity_types","id","user_id","week_id","activity_type_id"].includes(k)).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join(" ");
      console.log(`  - ${at?.cluster_id} / ${at?.line_code} / ${at?.name} (★${at?.reward_star}) ar_id=${r.id}  | ${otherCols}`);
    }

    const { data: wa } = await sb.from("weekly_activities")
      .select("id, activity_type_id, is_active, team_id, activity_types(name, cluster_id, line_code, reward_star)")
      .eq("week_id", w.id);
    const byCluster = {};
    for (const r of wa || []) {
      const at = r.activity_types;
      if (!at) continue;
      const k = at.cluster_id;
      (byCluster[k] ||= []).push({ name: at.name, line_code: at.line_code, reward_star: at.reward_star, is_active: r.is_active, team_id: r.team_id });
    }
    console.log(`\n[weekly_activities 개설 클러스터별]`);
    for (const [k, v] of Object.entries(byCluster)) {
      console.log(`  [${k}] ${v.length}건`);
      for (const x of v) console.log(`    - ${x.line_code} / ${x.name} (★${x.reward_star}, is_active=${x.is_active}, team=${x.team_id || '-'})`);
    }
  }

  // 단감 추가 흔적 — 후보 테이블 점검
  console.log("\n\n=== 추가 단감 흔적 후보 테이블 ===");
  for (const t of [
    "user_star_bonuses","user_star_grants","star_grants","bonus_records",
    "user_weekly_bonuses","star_bonuses","user_rewards","admin_grants",
    "manual_grants","user_manual_stars","weekly_star_grants","star_adjustments"
  ]) {
    const { data, error } = await sb.from(t).select("*").eq("user_id", USER_ID).limit(5);
    if (error) console.log(`  ${t}: ${error.code || ''} ${error.message?.slice(0,80) || ''}`);
    else console.log(`  ${t}: ${data?.length || 0}건${data?.length ? " → " + JSON.stringify(data) : ""}`);
  }

  const { data: gs } = await sb.from("user_growth_stats").select("*").eq("user_id", USER_ID).maybeSingle();
  console.log("\n=== user_growth_stats (캐시) ===");
  console.log(JSON.stringify(gs, null, 2));

  // user_weekly_growth 전체 (다른 주차 비교용)
  const { data: allUwg } = await sb.from("user_weekly_growth")
    .select("week_id, is_success, is_resting, is_club_break, weeks(week_number, start_date, end_date, seasons(name, year))")
    .eq("user_id", USER_ID).order("weeks(start_date)");
  console.log(`\n=== user_weekly_growth 전체 ${allUwg?.length || 0}건 ===`);
  for (const r of allUwg || []) {
    const w = r.weeks;
    console.log(`  ${w?.seasons?.year} ${w?.seasons?.name} ${w?.week_number}주차 (${w?.end_date}): success=${r.is_success}, rest=${r.is_resting}, break=${r.is_club_break}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
