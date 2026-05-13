import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserProfile } from "@/lib/get-user-profile";
import { extractTargetUserId, isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 시즌 리뷰 조회 + 작성 가능 여부 (canEdit / grantDeadline)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonHistoryId = searchParams.get("seasonHistoryId");

    if (!seasonHistoryId) {
      return NextResponse.json({ error: "시즌 기록 ID가 필요합니다." }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("user_season_histories")
      .select("user_id, season_id, rating, review")
      .eq("id", seasonHistoryId)
      .maybeSingle();

    if (error) {
      console.error("시즌 리뷰 조회 오류:", error);
      return NextResponse.json({ error: "시즌 리뷰 조회에 실패했습니다." }, { status: 500 });
    }

    // 작성권 판정: 어드민이거나, 본인 데이터이며 (user_id, season_id) 에 활성 grant 가 있으면 true
    const session = await getServerSession(authOptions);
    const viewerIsAdmin = isAdminEmail(session?.user?.email);

    let canEdit = viewerIsAdmin;
    let grantDeadline: string | null = null;

    if (!viewerIsAdmin && data?.user_id && data?.season_id) {
      try {
        const viewerProfile = await getUserProfile();
        if (
          viewerProfile.profile &&
          (viewerProfile.profile as { id: string }).id === data.user_id
        ) {
          const { data: grant } = await supabaseAdmin
            .from("season_review_grants")
            .select("deadline")
            .eq("user_id", data.user_id)
            .eq("season_id", data.season_id)
            .maybeSingle();
          grantDeadline = grant?.deadline ?? null;
          canEdit =
            !!grantDeadline && new Date(grantDeadline).getTime() > Date.now();
        }
      } catch {
        // viewerProfile 조회 실패 시 canEdit 은 false 로 유지
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        rating: data?.rating || 0,
        review: data?.review || "",
      },
      canEdit,
      grantDeadline,
    });
  } catch (error) {
    console.error("시즌 리뷰 조회 API 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// PUT: 시즌 리뷰 저장
export async function PUT(request: Request) {
  try {
    const targetUserId = extractTargetUserId(request);
    const { profile, error } = await getUserProfile("id", targetUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    const body = await request.json();
    const { seasonHistoryId, rating, review } = body;

    if (!seasonHistoryId) {
      return NextResponse.json({ error: "시즌 기록 ID가 필요합니다." }, { status: 400 });
    }

    if (rating < 0 || rating > 5 || (rating * 2) % 1 !== 0) {
      return NextResponse.json({ error: "평점은 0.0~5.0 사이의 0.5 단위여야 합니다." }, { status: 400 });
    }

    if (!review || review.trim().length === 0) {
      return NextResponse.json({ error: "리뷰를 입력해주세요." }, { status: 400 });
    }

    if (review.length > 300) {
      return NextResponse.json({ error: "리뷰는 300자 이내로 작성해주세요." }, { status: 400 });
    }

    // 해당 season_history가 본인의 것인지 확인
    const { data: seasonHistory, error: seasonError } = await supabaseAdmin
      .from("user_season_histories")
      .select("id, user_id")
      .eq("id", seasonHistoryId)
      .maybeSingle();

    if (seasonError || !seasonHistory) {
      return NextResponse.json({ error: "시즌 기록을 찾을 수 없습니다." }, { status: 404 });
    }

    if (seasonHistory.user_id !== profile.id) {
      return NextResponse.json({ error: "본인의 시즌 기록만 수정할 수 있습니다." }, { status: 403 });
    }

    // 리뷰 업데이트
    const { error: updateError } = await supabaseAdmin
      .from("user_season_histories")
      .update({
        rating: rating,
        review: review.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", seasonHistoryId);

    if (updateError) {
      console.error("시즌 리뷰 저장 오류:", updateError);
      return NextResponse.json({ error: "시즌 리뷰 저장에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "시즌 리뷰가 성공적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error("시즌 리뷰 저장 API 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
