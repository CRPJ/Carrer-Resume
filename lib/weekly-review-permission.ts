import type { SupabaseClient } from "@supabase/supabase-js";

// Weekly Review 작성 가능 여부 판정 (서버 공용)
//   - 기본 시간 윈도우: 주차 월요일 00:00 KST 기준 +144h+1min ~ +252h
//   - 운영진이 부여한 weekly_review_grants.deadline > now() 도 허용
//   - 어드민은 호출 측에서 별도로 우회시키는 것이 권장 (이 함수는 일반 크루 기준만 본다)
export async function canWriteWeeklyReview(
  supabase: SupabaseClient,
  userId: string,
  weekCardId: string
): Promise<{ allowed: boolean; inDefaultWindow: boolean; grantDeadline: string | null }> {
  let inDefaultWindow = false;
  try {
    const { data: week } = await supabase
      .from("weeks")
      .select("start_date")
      .eq("id", weekCardId)
      .maybeSingle();
    if (week?.start_date) {
      const anchorMs = new Date(`${week.start_date}T00:00:00+09:00`).getTime();
      const openMs = anchorMs + 144 * 3600 * 1000 + 60 * 1000;
      const closeMs = anchorMs + 252 * 3600 * 1000;
      const now = Date.now();
      inDefaultWindow = now >= openMs && now < closeMs;
    }
  } catch {
    // weeks 조회 실패 시 기본 윈도우는 false 로 두고 grant 만 확인
  }

  let grantDeadline: string | null = null;
  try {
    const { data: grant } = await supabase
      .from("weekly_review_grants")
      .select("deadline")
      .eq("user_id", userId)
      .eq("week_card_id", weekCardId)
      .maybeSingle();
    grantDeadline = grant?.deadline ?? null;
  } catch {
    grantDeadline = null;
  }

  const grantActive = !!grantDeadline && new Date(grantDeadline).getTime() > Date.now();
  return {
    allowed: inDefaultWindow || grantActive,
    inDefaultWindow,
    grantDeadline,
  };
}
