// 김나우 다양한 컬럼/마스킹 패턴으로 검색
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

// 1) user_profiles 스키마 한 행 보기 (어떤 컬럼이 있는지)
const { data: sample } = await sb.from("user_profiles").select("*").limit(1);
console.log("=== user_profiles 컬럼 ===");
if (sample?.[0]) console.log(Object.keys(sample[0]).join(", "));

// 2) 베타 15명 전부 조회 (display_name 정확 일치)
const BETA = ["박건희","김시영","김예령","김현진","정우현","이용준","김혜윤","김나우","김승민","김수현","정재웅","고수림","최희원","윤재윤","빵떡이"];
const { data: betas } = await sb.from("user_profiles")
  .select("id, display_name, team, club, onboarding_week_id")
  .in("display_name", BETA);
console.log(`\n=== display_name in BETA (정확 일치) — ${betas?.length || 0}건 ===`);
for (const b of betas || []) console.log(" ", b.display_name, b.id, "team=", b.team);

// 3) 김나우 ilike 패턴 모두
for (const col of ["display_name"]) {
  const { data, error } = await sb.from("user_profiles")
    .select(`id, ${col}`).ilike(col, "%나우%");
  console.log(`\n=== ${col} ilike '%나우%' === `, error ? `ERR: ${error.message}` : `${data.length}건`);
  for (const x of (data || []).slice(0, 10)) console.log(" ", x);
}
