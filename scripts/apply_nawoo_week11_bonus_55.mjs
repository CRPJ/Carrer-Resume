// 김나우 봄 11주차 보너스 단감 55개 추가 부여 + 활동 인정 (is_force_approved=true).
// 실행: node scripts/apply_nawoo_week11_bonus_55.mjs
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
const WEEK_ID = "5706135a-b917-4c2a-97e5-1f20d5744fa4"; // 2026 봄 11주차
const GIVEN_BY = "b0af9128-4f6b-4df5-8fe0-5c93bb6e3aff"; // 9/11주차 50점 부여와 동일 운영자
const POINTS = 55;
const REASON = "실무 경력 참여로 인한 포인트 부여(intensive 참여하여 주차 활동 인정) — 추가 보너스 55";
const FORCE_REASON = "운영진 예외 인정 — 보너스 단감 55 부여와 함께 주차 활동 인정";

// 1) idempotent guard — 같은 금액의 row 가 이미 있으면 중단.
const { data: existing } = await sb.from("points")
  .select("id, points, reason, given_at")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID)
  .eq("point_type", "star").eq("points", POINTS);
if (existing?.length) {
  console.log(`이미 ${POINTS}점 단감 row 존재 → points INSERT 스킵:`, existing);
} else {
  const now = new Date().toISOString();
  const payload = {
    user_id: USER_ID,
    week_id: WEEK_ID,
    point_type: "star",
    points: POINTS,
    reason: REASON,
    given_by: GIVEN_BY,
    given_at: now,
    vote_id: null,
    line_id: null,
  };
  console.log("INSERT points payload:\n", JSON.stringify(payload, null, 2));
  const { data, error } = await sb.from("points").insert(payload).select();
  if (error) { console.error("points INSERT 실패:", error); process.exit(1); }
  console.log("\n✓ points INSERT 완료:\n", JSON.stringify(data, null, 2));
}

// 2) user_weekly_growth — 행 있으면 UPDATE, 없으면 INSERT.
const { data: uwgRows } = await sb.from("user_weekly_growth")
  .select("*")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID);

if (uwgRows?.length) {
  const target = uwgRows[0];
  console.log("\n[uwg] 기존 row:", JSON.stringify(target, null, 2));
  const { data: upd, error: updErr } = await sb.from("user_weekly_growth")
    .update({
      is_force_approved: true,
      force_approved_reason: FORCE_REASON,
      is_success: true,
    })
    .eq("id", target.id)
    .select();
  if (updErr) { console.error("uwg UPDATE 실패:", updErr); process.exit(1); }
  console.log("\n✓ user_weekly_growth UPDATE 완료:\n", JSON.stringify(upd, null, 2));
} else {
  const insPayload = {
    user_id: USER_ID,
    week_id: WEEK_ID,
    is_force_approved: true,
    force_approved_reason: FORCE_REASON,
    is_success: true,
  };
  console.log("\n[uwg] 기존 row 없음 → INSERT:", JSON.stringify(insPayload, null, 2));
  const { data: ins, error: insErr } = await sb.from("user_weekly_growth")
    .insert(insPayload)
    .select();
  if (insErr) { console.error("uwg INSERT 실패:", insErr); process.exit(1); }
  console.log("\n✓ user_weekly_growth INSERT 완료:\n", JSON.stringify(ins, null, 2));
}

// 3) 검증 — 11주차 김나우 단감 합계 + uwg 최종 상태 출력
const { data: all } = await sb.from("points")
  .select("point_type, points, reason, given_at")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID)
  .order("given_at");
const starSum = (all || []).filter(p => p.point_type === "star").reduce((s, p) => s + (p.points || 0), 0);
console.log(`\n=== 김나우 11주차 points 합계: star=${starSum} (${all?.length || 0}건) ===`);
for (const p of all || []) {
  console.log(`  ${p.point_type}=${p.points} | ${p.reason} | ${p.given_at}`);
}
const { data: uwgFinal } = await sb.from("user_weekly_growth")
  .select("earned_stars, required_stars, is_success, is_force_approved, force_approved_reason")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID);
console.log(`\n[user_weekly_growth 최종]\n${JSON.stringify(uwgFinal, null, 2)}`);
