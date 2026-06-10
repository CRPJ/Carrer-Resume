// NEW user_profiles 필드 저장 컨벤션 파악 (마이그레이션 플래닝용)
// 실행: node scripts/inspect_new_conventions.mjs
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

const distinct = async (col) => {
  const { data } = await sb.from("user_profiles").select(col);
  const m = {};
  (data || []).forEach(r => { const v = r[col]; const k = v === null ? "(null)" : String(v); m[k] = (m[k] || 0) + 1; });
  return m;
};

console.log("gender:", JSON.stringify(await distinct("gender")));
console.log("growth_status:", JSON.stringify(await distinct("growth_status")));
console.log("status:", JSON.stringify(await distinct("status")));
console.log("role:", JSON.stringify(await distinct("role")));
console.log("univ_status:", JSON.stringify(await distinct("univ_status")));
console.log("contact_available:", JSON.stringify(await distinct("contact_available")));

// 샘플 2명 핵심 필드 (포맷 확인용)
const { data: sample } = await sb.from("user_profiles")
  .select("display_name, gender, birth_date, university, major_first, major_second, club, role, growth_status, status, crew_serial, crew_unique_number, vision, onboarding_week_id, joined_week_id, joined_season_id, contact_available, phone, email, auth_email")
  .in("display_name", ["고수림", "김나우"]).limit(2);
console.log("\n샘플 행:");
(sample || []).forEach(r => console.log(JSON.stringify(r, null, 1)));

// crew_unique_number / crew_serial 현황 (배정 규칙 파악)
const { data: nums } = await sb.from("user_profiles").select("crew_unique_number, crew_serial");
const uns = (nums || []).map(r => r.crew_unique_number).filter(v => v != null);
const sers = (nums || []).map(r => r.crew_serial).filter(v => v != null);
const numStat = (arr) => arr.length ? { count: arr.length, min: arr.slice().sort((a,b)=>a-b)[0], max: arr.slice().sort((a,b)=>b-a)[0], sample: arr.slice(0,5) } : "전부 null";
console.log("\ncrew_unique_number:", JSON.stringify(numStat(uns)));
console.log("crew_serial:", JSON.stringify(numStat(sers)));
console.log("birth_date 샘플:", JSON.stringify((nums||[]).slice(0,1)));
