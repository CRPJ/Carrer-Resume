// 김나우 9주차 earned_stars=36의 구성 추적
// activity_records=1건(★10)인데 earned_stars=36 → 26점은 어디서?
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

const USER_ID = "89f3e14b-68c7-4d6c-bb98-7617cdbf3b8d";
const W9 = "de39b2c1-e8f2-4119-bb2a-90dbf5a409b4";
const W10 = "05a5de8b-de2d-4e4d-80be-abeb0967542c";

async function inspect(label, weekId) {
  console.log(`\n\n========== ${label} (week_id=${weekId}) ==========`);

  // 사용 가능한 점수 관련 테이블 후보
  for (const t of [
    "activity_records","weekly_reviews","season_reviews","club_reviews","user_ratings","unit_records",
    "user_activity_units","user_weekly_extras","user_star_logs","star_logs","reputation_records",
    "submitted_activities","output_cards","portfolio_cards","weekly_extras","reviews"
  ]) {
    const { data, error } = await sb.from(t).select("*").eq("user_id", USER_ID).eq("week_id", weekId).limit(20);
    if (error) {
      if (!error.message.includes("Could not find") && !error.message.includes("column")) {
        console.log(`  ${t}: ERR ${error.code} ${error.message.slice(0,100)}`);
      }
    } else {
      console.log(`  ${t}: ${data?.length || 0}건${data?.length ? "\n    " + JSON.stringify(data).slice(0,500) : ""}`);
    }
  }

  // weekly_reviews는 보통 author_user_id 등 다른 컬럼일 수 있음
  for (const t of ["weekly_reviews","season_reviews","club_reviews"]) {
    for (const col of ["author_id","reviewer_id","author_user_id","writer_id","reviewed_user_id","target_user_id"]) {
      const { data, error } = await sb.from(t).select("*").eq(col, USER_ID).eq("week_id", weekId).limit(10);
      if (!error && data?.length) {
        console.log(`  ${t}(${col}): ${data.length}건 → ${JSON.stringify(data).slice(0, 400)}`);
      }
    }
  }
}

await inspect("9주차", W9);
await inspect("10주차", W10);

// 9주차 uwg 전체 컬럼 다시 보기 + 모든 user_weekly_growth 컬럼 살펴보기
const { data: uwgCols } = await sb.from("user_weekly_growth").select("*").limit(1);
if (uwgCols?.[0]) console.log("\n=== user_weekly_growth 컬럼 ===\n", Object.keys(uwgCols[0]).join(", "));
