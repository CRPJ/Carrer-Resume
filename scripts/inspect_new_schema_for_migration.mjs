// NEW(Supabase) 스키마 형태 파악 — 마이그레이션 매핑 설계용 (읽기 전용, 컬럼명만 출력)
// 실행: node scripts/inspect_new_schema_for_migration.mjs
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

const tables = [
  "user_profiles", "user_educations", "user_team_parts",
  "user_cumulative_points", "user_introductions", "teams", "parts",
];

for (const t of tables) {
  const { data, error } = await sb.from(t).select("*").limit(1);
  if (error) { console.log(`\n## ${t}: ERROR ${error.message}`); continue; }
  const cols = data && data[0] ? Object.keys(data[0]) : [];
  console.log(`\n## ${t} (${cols.length} cols)`);
  console.log(cols.join(", ") || "(빈 테이블 — 컬럼 파악 불가)");
}

// 현재 NEW 의 club 분포 + 전체 크루 수 (중복 식별 기준 파악용)
const { data: clubs } = await sb.from("user_profiles").select("club");
const dist = {};
(clubs || []).forEach(r => { const k = r.club || "(null)"; dist[k] = (dist[k] || 0) + 1; });
console.log("\n## NEW user_profiles.club 분포:", JSON.stringify(dist));
console.log("## NEW 전체 user_profiles rows:", (clubs || []).length);

// teams / parts 현황 (team/part 매핑용)
const { data: teamRows } = await sb.from("teams").select("id, name");
const { data: partRows } = await sb.from("parts").select("id, name");
console.log("\n## NEW teams:", JSON.stringify((teamRows || []).map(t => t.name)));
console.log("## NEW parts:", JSON.stringify((partRows || []).map(p => p.name)));
