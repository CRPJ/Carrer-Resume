import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 슬로건 조회 (userId 파라미터로 다른 유저 조회 가능)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    let profile;

    if (targetUserId) {
      // 특정 유저의 슬로건 조회 (공개 접근 가능)
      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .select("id, eng_name")
        .eq("id", targetUserId)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json(
          { error: "프로필을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      profile = data;
    } else {
      // 현재 로그인 유저의 슬로건 조회 (로그인 필요)
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .select("id, eng_name")
        .eq("email", session.user.email)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json(
          { error: "프로필을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      profile = data;
    }

    // user_introductions에서 슬로건 조회
    const { data: introduction } = await supabaseAdmin
      .from("user_introductions")
      .select("slogan_1, slogan_2, slogan_3, slogan_1_tag, slogan_2_tag, slogan_3_tag")
      .eq("user_id", profile.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        slogan1: {
          content: introduction?.slogan_1 || null,
          option: introduction?.slogan_1_tag || null,
        },
        slogan2: {
          content: introduction?.slogan_2 || null,
          option: introduction?.slogan_2_tag || null,
        },
        slogan3: {
          content: introduction?.slogan_3 || null,
          option: introduction?.slogan_3_tag || null,
        },
        engName: profile.eng_name || null,
      },
    });
  } catch (error) {
    console.error("슬로건 조회 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 슬로건 저장
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    const body = await request.json();
    const { slogan1, slogan2, slogan3 } = body;

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

    const sloganData = {
      slogan_1: slogan1?.content || null,
      slogan_1_tag: slogan1?.option || null,
      slogan_2: slogan2?.content || null,
      slogan_2_tag: slogan2?.option || null,
      slogan_3: slogan3?.content || null,
      slogan_3_tag: slogan3?.option || null,
      updated_at: new Date().toISOString(),
    };

    if (existingIntro) {
      // 업데이트
      const { error: updateError } = await supabaseAdmin
        .from("user_introductions")
        .update(sloganData)
        .eq("user_id", profile.id);

      if (updateError) {
        console.error("슬로건 업데이트 오류:", updateError);
        return NextResponse.json(
          { error: "슬로건 저장에 실패했습니다." },
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
          ...sloganData,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("슬로건 생성 오류:", insertError);
        return NextResponse.json(
          { error: "슬로건 저장에 실패했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "슬로건이 성공적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error("슬로건 저장 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
