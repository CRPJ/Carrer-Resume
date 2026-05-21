// 김나우 봄 11주차 보너스 단감 50개 부여 (9주차 패턴 동일).
// 실행: node scripts/apply_nawoo_week11_bonus_stars.mjs
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
const GIVEN_BY = "b0af9128-4f6b-4df5-8fe0-5c93bb6e3aff"; // 9주차와 동일한 운영자 id

// idempotent guard — 같은 reason/금액으로 이미 부여된 행이 있으면 중단.
const REASON = "실무 경력 참여로 인한 포인트 부여(intensive 참여하여 주차 활동 인정)";
const { data: existing } = await sb.from("points")
  .select("id, points, reason, given_at")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID)
  .eq("point_type", "star").eq("points", 50);
if (existing?.length) {
  console.log("이미 50점 단감 row 존재:", existing);
  process.exit(0);
}

const now = new Date().toISOString();
const payload = {
  user_id: USER_ID,
  week_id: WEEK_ID,
  point_type: "star",
  points: 50,
  reason: REASON,
  given_by: GIVEN_BY,
  given_at: now,
  vote_id: null,
  line_id: null,
};

console.log("INSERT payload:\n", JSON.stringify(payload, null, 2));

const { data, error } = await sb.from("points").insert(payload).select();
if (error) { console.error("INSERT 실패:", error); process.exit(1); }
console.log("\n✓ INSERT 완료:\n", JSON.stringify(data, null, 2));

// 검증 — 11주차 김나우 단감 합계 출력
const { data: all } = await sb.from("points")
  .select("point_type, points, reason, given_at")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID);
const starSum = (all || []).filter(p => p.point_type === "star").reduce((s, p) => s + (p.points || 0), 0);
console.log(`\n=== 김나우 11주차 단감 합계: ${starSum} (${all?.length || 0}건) ===`);
for (const p of (all || []).sort((a, b) => a.given_at.localeCompare(b.given_at))) {
  console.log(`  ${p.point_type}=${p.points} | ${p.reason} | ${p.given_at}`);
}
