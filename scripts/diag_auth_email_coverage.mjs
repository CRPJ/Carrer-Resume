// auth_email 채움 비율 + 동명이인 분포 점검
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const PAGE = 1000;
  let from = 0;
  const all = [];
  while (true) {
    const { data, error } = await sb
      .from("user_profiles")
      .select("id, display_name, email, auth_email, status, role")
      .range(from, from + PAGE - 1);
    if (error) { console.error(error); return; }
    all.push(...(data || []));
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`전체 user_profiles: ${all.length}`);

  const active = all.filter(u => u.status === "active");
  const withAuth = active.filter(u => !!u.auth_email);
  const withoutAuth = active.filter(u => !u.auth_email);
  console.log(`active: ${active.length}  / auth_email 채워짐: ${withAuth.length}  / NULL: ${withoutAuth.length}`);

  // 동명이인 — display_name이 2회 이상 등장
  const nameCount = new Map();
  for (const u of all) {
    nameCount.set(u.display_name, (nameCount.get(u.display_name) || 0) + 1);
  }
  const dupNames = [...nameCount.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);
  console.log(`\n동명이인 (display_name 2명 이상): ${dupNames.length} 그룹`);
  console.log(dupNames.slice(0, 20));

  // auth_email 채워진 사용자 샘플 (어떻게 들어가있는지 확인)
  console.log(`\n[auth_email 샘플 5건]`);
  console.log(withAuth.slice(0, 5).map(u => ({ name: u.display_name, email: u.email, auth_email: u.auth_email })));
}

main().catch(e => { console.error(e); process.exit(1); });
