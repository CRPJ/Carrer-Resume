// 윤재윤 2026 봄 10주차 '실무 경험'(practical_experience) 샘플 데이터 삽입
//  - activity_records: 했다(is_completed=true) 라인 기록
//  - user_activity_details: 2차 정보 (sub_title + growth_point + output_links)
// 멱등: 이미 있으면 activity_records는 건너뛰고, user_activity_details는 upsert
// 실행: node scripts/apply_yunjaeyoon_week10_experience_sample.mjs
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

const USER_ID = "11a3b954-dff0-46fb-99ec-5c459a1d2600"; // 윤재윤
const WEEK_ID = "05a5de8b-de2d-4e4d-80be-abeb0967542c"; // 2026 봄 10주차
const now = new Date().toISOString();

// 실무 경험(practical_experience) 라인별 샘플
const LINES = [
  {
    activity_type_id: "contents_marketing_practical", // [콘텐츠] 마케팅 실무
    sub_title:
      "이번 주에는 담당 채널의 콘텐츠 마케팅 실무를 직접 운영하며 기획부터 발행까지 전 과정을 경험했습니다. 주제 선정, 후킹 카피 작성, 썸네일 제작, 발행 시간대 테스트까지 한 사이클을 끝까지 돌려보며 콘텐츠가 실제 지표로 이어지는 흐름을 체득했습니다.",
    growth_point:
      "콘텐츠를 '만드는 일'에서 '결과를 만드는 일'로 보는 관점이 생겼습니다. 발행 후 저장수·체류시간 데이터를 보고 다음 콘텐츠 기획에 반영하는 루프를 스스로 돌릴 수 있게 되었습니다.",
    output_links: [
      { desc: "발행 콘텐츠", url: "https://www.instagram.com/p/sample-contents-1/" },
      { desc: "성과 리포트", url: "https://docs.google.com/spreadsheets/d/sample-report-1/" },
    ],
  },
  {
    activity_type_id: "performance_marketing_practical", // [퍼포먼스] 마케팅 실무
    sub_title:
      "소액 예산으로 퍼포먼스 마케팅 캠페인을 직접 세팅하고 운영했습니다. 타겟 오디언스 분리, 소재 A/B 테스트, 일 단위 예산 조정을 진행하며 CPC와 전환율을 기준으로 소재를 최적화하는 실무를 경험했습니다.",
    growth_point:
      "'감'이 아니라 지표 기반으로 의사결정하는 습관이 생겼습니다. 성과가 낮은 소재를 빠르게 끄고 예산을 재배분하는 판단 기준이 명확해졌습니다.",
    output_links: [
      { desc: "캠페인 대시보드", url: "https://business.facebook.com/sample-campaign-1/" },
      { desc: "소재 테스트 정리", url: "https://docs.google.com/document/d/sample-ab-1/" },
    ],
  },
  {
    activity_type_id: "productivity_feedback", // [생산성] 상호 피드백
    sub_title:
      "동료 크루들과 서로의 산출물에 대해 상호 피드백을 주고받았습니다. 피드백을 '받는 입장'과 '주는 입장'을 모두 경험하며, 구체적이고 실행 가능한 피드백을 작성하는 방법을 연습했습니다.",
    growth_point:
      "막연한 칭찬·지적이 아니라 '무엇을·왜·어떻게'를 담은 피드백을 줄 수 있게 되었고, 받은 피드백을 방어 없이 다음 작업에 반영하는 태도가 생겼습니다.",
    output_links: [
      { desc: "피드백 기록", url: "https://www.notion.so/sample-feedback-log-1" },
    ],
  },
  {
    activity_type_id: "career_marketer_launch", // [커리어] 마케터 Launch
    // 이 라인은 'subtitle만' 넣어서 데이터 변형 케이스 확보
    sub_title:
      "마케터로서의 커리어 방향을 구체화하기 위해 직무 정의서를 작성하고, 지원하고 싶은 회사·포지션을 리서치했습니다. 내 강점과 시장이 요구하는 역량의 간극을 정리하며 다음 분기 학습 로드맵을 세웠습니다.",
  },
];

console.log(`대상: 윤재윤 / 2026 봄 10주차 / 실무 경험 ${LINES.length}개 라인\n`);

// 1) activity_records — 이미 있으면 건너뜀, 없으면 INSERT (했다 기록)
const { data: existingAR } = await sb
  .from("activity_records")
  .select("activity_type_id")
  .eq("user_id", USER_ID)
  .eq("week_id", WEEK_ID)
  .in("activity_type_id", LINES.map(l => l.activity_type_id));
const existingARSet = new Set((existingAR || []).map(r => r.activity_type_id));

const arToInsert = LINES
  .filter(l => !existingARSet.has(l.activity_type_id))
  .map(l => ({
    user_id: USER_ID,
    week_id: WEEK_ID,
    activity_type_id: l.activity_type_id,
    is_completed: true,
    status: "completed",
    completed_at: now,
  }));

if (arToInsert.length) {
  const { data, error } = await sb.from("activity_records").insert(arToInsert).select("activity_type_id");
  if (error) { console.error("activity_records INSERT 실패:", error); process.exit(1); }
  console.log("✓ activity_records INSERT:", data.map(d => d.activity_type_id).join(", "));
} else {
  console.log("· activity_records: 신규 삽입 없음 (모두 기존 존재)");
}
if (existingARSet.size) console.log("· activity_records 기존 존재(건너뜀):", [...existingARSet].join(", "));

// 2) user_activity_details — upsert (UNIQUE user_id,week_id,activity_type_id)
const uadPayload = LINES.map(l => ({
  user_id: USER_ID,
  week_id: WEEK_ID,
  activity_type_id: l.activity_type_id,
  sub_title: l.sub_title ?? null,
  growth_point: l.growth_point ?? null,
  output_links: l.output_links ?? null,
  updated_at: now,
}));

const { data: uadData, error: uadErr } = await sb
  .from("user_activity_details")
  .upsert(uadPayload, { onConflict: "user_id,week_id,activity_type_id" })
  .select("activity_type_id, sub_title");
if (uadErr) { console.error("user_activity_details UPSERT 실패:", uadErr); process.exit(1); }
console.log("\n✓ user_activity_details UPSERT:");
for (const r of uadData) console.log(`  - ${r.activity_type_id}: ${r.sub_title.slice(0, 40)}...`);

// 3) 검증 — 다시 조회
const { data: verifyAR } = await sb
  .from("activity_records")
  .select("activity_type_id, is_completed, status")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID)
  .in("activity_type_id", LINES.map(l => l.activity_type_id));
const { data: verifyUAD } = await sb
  .from("user_activity_details")
  .select("activity_type_id, sub_title, growth_point, output_links")
  .eq("user_id", USER_ID).eq("week_id", WEEK_ID)
  .in("activity_type_id", LINES.map(l => l.activity_type_id));

console.log("\n=== 검증: activity_records ===");
for (const r of verifyAR || []) console.log(`  ${r.activity_type_id}: completed=${r.is_completed} status=${r.status}`);
console.log("\n=== 검증: user_activity_details ===");
for (const r of verifyUAD || []) {
  console.log(`  ${r.activity_type_id}: sub_title=${r.sub_title ? "O" : "X"}, growth_point=${r.growth_point ? "O" : "X"}, links=${(r.output_links || []).length}`);
}
console.log("\n완료.");
