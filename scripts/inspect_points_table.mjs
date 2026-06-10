import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(readFileSync(resolve(__dirname, "../.env.local"), "utf8").split("\n").map(l=>l.trim()).filter(l=>l&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,"")];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data } = await sb.from("points").select("*").limit(3);
console.log("points cols:", data && data[0] ? Object.keys(data[0]) : "(빈)");
console.log("points 샘플:", JSON.stringify(data, null, 1));
// point_type 분포
const { data: all } = await sb.from("points").select("point_type").limit(2000);
const dist = {}; (all||[]).forEach(r=>{dist[r.point_type]=(dist[r.point_type]||0)+1;});
console.log("point_type 분포:", JSON.stringify(dist));
// 베타 크루(김나우) 한 명의 points 샘플 — 주차별 star/shield 어떻게 들어가는지
const { data: nawoo } = await sb.from("user_profiles").select("id").eq("display_name","김나우").maybeSingle();
if (nawoo) {
  const { data: np } = await sb.from("points").select("week_id, point_type, points, line_id, given_at").eq("user_id", nawoo.id).limit(12);
  console.log("\n김나우 points 샘플:", JSON.stringify(np, null, 1));
}
