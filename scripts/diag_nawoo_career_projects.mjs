// career_projects 비교 — 김수현 vs 김나우 line/project 차이
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

// 해당 주차의 career_projects 모두
const { data: projects } = await sb
  .from("career_projects")
  .select("*")
  .eq("week_id", WEEK_ID);
console.log(`=== career_projects (week=${WEEK_ID}) — ${projects?.length || 0}건 ===`);
for (const p of projects || []) {
  console.log(`\n  project: ${p.id}`);
  console.log(`    company_name: ${p.company_name}`);
  console.log(`    project_name: ${p.project_name}`);
  console.log(`    line_code: ${p.line_code}`);
  console.log(`    line_name: ${p.line_name}`);
  console.log(`    is_active: ${p.is_active}`);
  console.log(`    secondary_info_deadline: ${p.secondary_info_deadline}`);
  console.log(`    output_links: ${JSON.stringify(p.output_links)}`);
}

// 두 유저 career_records → 어떤 project 에 매칭되는지
const ksProjectId = "e3138b13-b899-4deb-be28-24f08eb617d0"; // 김수현
const knwProjectId = "92a729e0-3fc6-4051-a6ea-7a39fcb8b7a6"; // 김나우

console.log("\n\n=== 김수현 project ===");
const { data: ksP } = await sb.from("career_projects").select("*").eq("id", ksProjectId).single();
console.log(ksP);

console.log("\n=== 김나우 project ===");
const { data: knwP } = await sb.from("career_projects").select("*").eq("id", knwProjectId).single();
console.log(knwP);

// activity_types 확인 — practical_career 외에 cluster 다른 거 있나
console.log("\n=== activity_types 전체 (clustering 확인) ===");
const { data: allAT } = await sb.from("activity_types").select("id, name, cluster_id, line_code").order("cluster_id");
const byCluster = {};
for (const at of allAT || []) {
  byCluster[at.cluster_id || "null"] = (byCluster[at.cluster_id || "null"] || []);
  byCluster[at.cluster_id || "null"].push(at);
}
for (const [c, list] of Object.entries(byCluster)) {
  console.log(`  cluster=${c}: ${list.length}개`);
  for (const x of list) console.log(`    - ${x.id} (${x.name}, line_code=${x.line_code})`);
}
