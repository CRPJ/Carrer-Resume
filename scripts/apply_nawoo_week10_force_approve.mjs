// 김나우 봄 10주차 force-approve INSERT (9주차 패턴과 동일)
// 실행: node scripts/apply_nawoo_week10_force_approve.mjs
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
const WEEK_ID = "05a5de8b-de2d-4e4d-80be-abeb0967542c"; // 2026 봄 10주차

const now = new Date().toISOString();

// 1) 이미 row 있으면 중단 (idempotent guard)
const { data: existing } = await sb.from("user_weekly_growth")
  .select("id, is_success, is_force_approved")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID);
if (existing?.length) {
  console.log("이미 row 존재:", existing);
  process.exit(0);
}

const payload = {
  user_id: USER_ID,
  week_id: WEEK_ID,
  is_success: true,
  earned_stars: 36,
  required_stars: 65,
  experience_completed: 0,
  experience_required: 3,
  experience_min_rating: 0,
  failure_reason: null,
  failure_details: null,
  is_first_week: false,
  is_resting: false,
  is_club_break: false,
  is_force_approved: true,
  force_approved_by: null,
  force_approved_at: now,
  force_approved_reason: "베타 면제 — 10주차 활동 인정 단감 미충족",
  calculated_at: now,
};

console.log("INSERT payload:", JSON.stringify(payload, null, 2));

const { data, error } = await sb.from("user_weekly_growth").insert(payload).select();
if (error) { console.error("INSERT 실패:", error); process.exit(1); }
console.log("\n✓ INSERT 완료:", JSON.stringify(data, null, 2));

// 검증: 다시 조회
const { data: check } = await sb.from("user_weekly_growth")
  .select("*").eq("user_id", USER_ID).eq("week_id", WEEK_ID).single();
console.log("\n=== 검증 (재조회) ===");
console.log(JSON.stringify(check, null, 2));

// 김나우 모든 success 주차 다시 출력
const { data: all } = await sb.from("user_weekly_growth")
  .select("week_id, is_success, is_resting, is_club_break, is_force_approved, weeks(week_number, seasons(name, year))")
  .eq("user_id", USER_ID).order("weeks(start_date)");
console.log("\n=== 김나우 전체 user_weekly_growth ===");
for (const r of all || []) {
  const w = r.weeks;
  const f = r.is_force_approved ? " [FORCE]" : "";
  console.log(`  ${w?.seasons?.year} ${w?.seasons?.name} ${w?.week_number}주차: success=${r.is_success}, rest=${r.is_resting}, break=${r.is_club_break}${f}`);
}
