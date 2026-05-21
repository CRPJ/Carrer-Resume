// 김나우 실무경력 2차정보 저장 실패 진단 v2: 김수현 vs 김나우 비교 + 카드 표시 흐름
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

const WEEK_ID = "05a5de8b-de2d-4e4d-80be-abeb0967542c";
const USERS = {
  김수현: "b4413d76-bb2c-494d-89f4-08d6f60e9b55",
  김나우: "89f3e14b-68c7-4d6c-bb98-7617cdbf3b8d",
};

// career_records 스키마 확인
const { data: sampleCR } = await sb.from("career_records").select("*").limit(1);
console.log("=== career_records 컬럼 ===");
if (sampleCR?.[0]) console.log(Object.keys(sampleCR[0]).join(", "));
console.log("");

// career_projects 스키마 확인
const { data: sampleCP } = await sb.from("career_projects").select("*").limit(1);
console.log("=== career_projects 컬럼 ===");
if (sampleCP?.[0]) console.log(Object.keys(sampleCP[0]).join(", "));
console.log("");

// week 정보
const { data: weekInfo } = await sb.from("weeks")
  .select("id, start_date, end_date, season_id, week_number, seasons(year, name)")
  .eq("id", WEEK_ID).single();
console.log("=== 주차 정보 ===", weekInfo);
console.log("");

for (const [name, userId] of Object.entries(USERS)) {
  console.log(`\n========== ${name} (${userId}) ==========`);

  // career_records 전체 (week 무관)
  const { data: allCR } = await sb
    .from("career_records")
    .select("*")
    .eq("user_id", userId);
  console.log(`전체 career_records — ${allCR?.length || 0}건`);
  for (const r of (allCR || []).slice(0, 5)) console.log(" ", { id: r.id, week_id: r.week_id, project_id: r.project_id, enhancement_status: r.enhancement_status });

  // 주차 시작~종료 안 portfolio_records or career_records가 어떤 컬럼으로 묶이는지 보기
  const { data: weekCR } = await sb
    .from("career_records")
    .select("*")
    .eq("user_id", userId)
    .eq("week_id", WEEK_ID);
  console.log(`week=${WEEK_ID} career_records — ${weekCR?.length || 0}건`);
  for (const r of weekCR || []) console.log(" ", r);

  // career_projects (project 의 owner_user_id 가 사용자라면 — 스키마 확인)
  const { data: cp } = await sb
    .from("career_projects")
    .select("*")
    .eq("user_id", userId);
  console.log(`career_projects (user 보유) — ${cp?.length || 0}건`);
  for (const p of (cp || []).slice(0, 5)) console.log(" ", { id: p.id, week_id: p.week_id, project_name: p.project_name, company_name: p.company_name });
}

// 김나우의 user_activity_details 가 정말 없는지 다시 확인 + 직접 POST 시뮬레이션
console.log("\n\n=== 김나우 user_activity_details — 모든 주차/타입 (최근 10건) ===");
const { data: uadAll } = await sb
  .from("user_activity_details")
  .select("week_id, activity_type_id, sub_title, growth_point, updated_at")
  .eq("user_id", USERS.김나우)
  .order("updated_at", { ascending: false })
  .limit(10);
for (const d of uadAll || []) console.log(" ", d);

console.log("\n=== 김수현 user_activity_details — practical_project 만 ===");
const { data: ksUad } = await sb
  .from("user_activity_details")
  .select("week_id, activity_type_id, sub_title, growth_point, output_links, image_urls, updated_at")
  .eq("user_id", USERS.김수현)
  .eq("activity_type_id", "practical_project");
for (const d of ksUad || []) console.log(" ", { week: d.week_id, sub: d.sub_title?.slice(0, 30), growth: d.growth_point?.slice(0, 30), links: (d.output_links || []).length, imgs: (d.image_urls || []).length, updated_at: d.updated_at });
