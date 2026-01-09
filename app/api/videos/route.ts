import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 영상 URL 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // user_profiles에서 사용자 ID와 영어 이름 조회
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("id, eng_name")
      .eq("email", session.user.email)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // user_introductions에서 영상 URL 조회
    const { data: introduction } = await supabaseAdmin
      .from("user_introductions")
      .select("video_url_1, video_url_2, video_url_3")
      .eq("user_id", profile.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        videoUrl1: introduction?.video_url_1 || null,
        videoUrl2: introduction?.video_url_2 || null,
        videoUrl3: introduction?.video_url_3 || null,
        engName: profile.eng_name || null,
      },
    });
  } catch (error) {
    console.error("영상 조회 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 영상 URL 저장
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { videoUrl1, videoUrl2, videoUrl3 } = body;

    // user_profiles에서 사용자 ID 조회
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("email", session.user.email)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 레코드 확인
    const { data: existingIntro } = await supabaseAdmin
      .from("user_introductions")
      .select("id")
      .eq("user_id", profile.id)
      .maybeSingle();

    const videoData = {
      video_url_1: videoUrl1 || null,
      video_url_2: videoUrl2 || null,
      video_url_3: videoUrl3 || null,
      updated_at: new Date().toISOString(),
    };

    if (existingIntro) {
      // 업데이트
      const { error: updateError } = await supabaseAdmin
        .from("user_introductions")
        .update(videoData)
        .eq("user_id", profile.id);

      if (updateError) {
        console.error("영상 URL 업데이트 오류:", updateError);
        return NextResponse.json(
          { error: "영상 URL 저장에 실패했습니다." },
          { status: 500 }
        );
      }
    } else {
      // 새로 생성
      const { error: insertError } = await supabaseAdmin
        .from("user_introductions")
        .insert({
          id: crypto.randomUUID(),
          user_id: profile.id,
          ...videoData,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("영상 URL 생성 오류:", insertError);
        return NextResponse.json(
          { error: "영상 URL 저장에 실패했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "영상 URL이 성공적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error("영상 저장 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
