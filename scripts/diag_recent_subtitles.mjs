// 최근 sub_title 작성한 크루 조회
// 1) user_activity_details.sub_title
// 2) portfolio_top_cards.sub_title
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

async function topRecent(table) {
  const { data, error } = await sb
    .from(table)
    .select("user_id, sub_title, updated_at, created_at")
    .not("sub_title", "is", null)
    .neq("sub_title", "")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) { console.error(table, error); return []; }
  return data || [];
}

function pickTopByUser(rows, n) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    if (seen.has(r.user_id)) continue;
    seen.add(r.user_id);
    out.push(r);
    if (out.length >= n) break;
  }
  return out;
}

async function nameMap(userIds) {
  if (!userIds.length) return new Map();
  const { data, error } = await sb
    .from("user_profiles")
    .select("id, display_name")
    .in("id", userIds);
  if (error) { console.error("user_profiles", error); return new Map(); }
  return new Map((data || []).map(u => [u.id, u.display_name]));
}

async function main() {
  const [a, b] = await Promise.all([
    topRecent("user_activity_details"),
    topRecent("portfolio_top_cards"),
  ]);

  const aTop = pickTopByUser(a, 3);
  const bTop = pickTopByUser(b, 3);

  const nm = await nameMap([...new Set([...aTop, ...bTop].map(r => r.user_id))]);

  console.log("\n[user_activity_details.sub_title] 최근 작성 크루 TOP 3");
  aTop.forEach((r, i) => console.log(`${i+1}. ${nm.get(r.user_id) || r.user_id}  | ${r.updated_at}  | "${(r.sub_title || "").slice(0, 60)}"`));

  console.log("\n[portfolio_top_cards.sub_title] 최근 작성 크루 TOP 3");
  bTop.forEach((r, i) => console.log(`${i+1}. ${nm.get(r.user_id) || r.user_id}  | ${r.updated_at}  | "${(r.sub_title || "").slice(0, 60)}"`));
}

main().catch(e => { console.error(e); process.exit(1); });
