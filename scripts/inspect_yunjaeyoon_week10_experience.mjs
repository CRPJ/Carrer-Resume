// 점검: 윤재윤 봄 10주차 '실무 경험'(practical_experience) 샘플 데이터 삽입 전 사전 조사
// 실행: node scripts/inspect_yunjaeyoon_week10_experience.mjs
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

const USER_ID = "11a3b954-dff0-46fb-99ec-5c459a1d2600"; // 윤재윤

// 1) 유저 확인
const { data: user } = await sb.from("users").select("id, name, nickname, club").eq("id", USER_ID).maybeSingle();
console.log("=== USER ===");
console.log(user);

// 2) 봄 시즌 + 10주차 week 찾기
const { data: seasons } = await sb.from("seasons").select("id, name, year");
console.log("\n=== SEASONS ===");
for (const s of seasons || []) console.log(`  ${s.id}  ${s.year} ${s.name}`);

const springSeasons = (seasons || []).filter(s => (s.name || "").includes("봄") || (s.name || "").toLowerCase().includes("spring"));
console.log("\n봄 시즌 후보:", springSeasons.map(s => `${s.year} ${s.name} (${s.id})`));

for (const ss of springSeasons) {
  const { data: w } = await sb.from("weeks")
    .select("id, week_number, start_date, end_date, season_id")
    .eq("season_id", ss.id).eq("week_number", 10).maybeSingle();
  console.log(`\n=== ${ss.year} ${ss.name} 10주차 ===`);
  console.log(w);
}

// 3) practical_experience 클러스터의 activity_types
const { data: types } = await sb.from("activity_types")
  .select("id, name, line_code, cluster_id, is_active, count_once_in_total, reward_star")
  .eq("cluster_id", "practical_experience");
console.log("\n=== activity_types (cluster_id='practical_experience') ===");
for (const t of types || []) console.log(`  ${t.id}  | ${t.name} | line=${t.line_code} | active=${t.is_active} | star=${t.reward_star}`);

// 4) activity_records 컬럼 구조 파악 (윤재윤 기존 row 샘플)
const { data: arSample } = await sb.from("activity_records").select("*").eq("user_id", USER_ID).limit(3);
console.log("\n=== activity_records 샘플 (윤재윤) ===");
console.log(JSON.stringify(arSample, null, 2));

// 5) 윤재윤 기존 user_activity_details 샘플
const { data: uadSample } = await sb.from("user_activity_details").select("*").eq("user_id", USER_ID).limit(3);
console.log("\n=== user_activity_details 샘플 (윤재윤) ===");
console.log(JSON.stringify(uadSample, null, 2));
