// NEW 포인트/활동 스키마 심층 파악 (마이그레이션 설계용, 읽기 전용)
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(readFileSync(resolve(__dirname, "../.env.local"), "utf8").split("\n").map(l=>l.trim()).filter(l=>l&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,"")];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const keys = async (t, filt) => {
  let q = sb.from(t).select("*").limit(1);
  if (filt) q = filt(q);
  const { data, error } = await q;
  if (error) return `ERROR ${error.message}`;
  return data && data[0] ? Object.keys(data[0]) : "(빈 테이블)";
};

console.log("activity_types cols:", JSON.stringify(await keys("activity_types")));
const { data: at } = await sb.from("activity_types").select("*").eq("cluster_id","practical_experience").limit(1);
console.log("activity_types 샘플(1):", JSON.stringify(at && at[0], null, 1));

console.log("\nactivity_records cols:", JSON.stringify(await keys("activity_records")));
console.log("user_activity_details cols:", JSON.stringify(await keys("user_activity_details")));
console.log("user_weekly_growth cols:", JSON.stringify(await keys("user_weekly_growth")));
console.log("activity_clusters cols:", JSON.stringify(await keys("activity_clusters")));

// 주차별 포인트 저장 테이블 후보 탐색
for (const t of ["user_weekly_points","weekly_points","user_week_points","user_activity_points","point_records","user_points","star_records"]) {
  const { error } = await sb.from(t).select("*").limit(1);
  console.log(`probe ${t}: ${error ? "없음/접근불가" : "★존재"}`);
}

// activity_clusters 목록 (practical_experience 가 cluster 인지 확인)
const { data: clusters } = await sb.from("activity_clusters").select("*");
console.log("\nactivity_clusters:", JSON.stringify((clusters||[]).map(c=>({id:c.id, name:c.name})), null, 1));

// 윤재윤 user_weekly_growth 한 행 (주차별 star 저장되는지)
const { data: uwg } = await sb.from("user_weekly_growth").select("*").eq("user_id","11a3b954-dff0-46fb-99ec-5c459a1d2600").limit(2);
console.log("\nuser_weekly_growth 샘플:", JSON.stringify(uwg, null, 1));
