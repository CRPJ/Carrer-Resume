// '클럽 1.0 임시데이터' 실무 경험 라인 생성 (activity_types). 멱등.
//   cluster_id=practical_experience, is_active=true (per-user render 위해 활성),
//   reward 0 (포인트는 마이그레이션에서 직접 주입), eligible 제한 없음.
// 실행: node scripts/create_club1_legacy_activity_type.mjs
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

const ROW = {
  id: "club1_legacy_data",
  cluster_id: "practical_experience",
  name: "클럽 1.0 임시데이터",
  is_active: true,
  is_unit: false,
  count_once_in_total: false,
  reward_star: 0, reward_shield: 0, reward_lightning: 0,
  penalty_star: 0, penalty_shield: 0, penalty_lightning: 0,
  line_code: "EX00C-CLUB10",
  sort_order: 99,
  description: "클럽 1.0 활동 내역 마이그레이션 라인 (per-user, weekly_activities 무관).",
  eligible_min_approved_weeks: null,
  eligible_max_approved_weeks: null,
};

const { data: existing } = await sb.from("activity_types").select("id, name, cluster_id, is_active").eq("id", ROW.id).maybeSingle();
if (existing) {
  console.log("· 이미 존재:", JSON.stringify(existing));
} else {
  const { data, error } = await sb.from("activity_types").insert(ROW).select("id, name, cluster_id, is_active, line_code").single();
  if (error) { console.error("INSERT 실패:", error); process.exit(1); }
  console.log("✓ activity_types INSERT:", JSON.stringify(data));
}

// 검증: practical_experience 클러스터 라인 목록
const { data: lines } = await sb.from("activity_types").select("id, name, is_active").eq("cluster_id", "practical_experience").order("sort_order");
console.log("\npractical_experience 라인:");
for (const l of lines || []) console.log(`  ${l.id}  | ${l.name} | active=${l.is_active}`);
