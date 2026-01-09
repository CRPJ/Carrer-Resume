import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 사용자 프로필 사진 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // user_profiles에서 사용자 정보 조회
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("id, profile_photo_url")
      .eq("email", session.user.email)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // user_introductions에서 서브 사진 조회
    const { data: introduction } = await supabaseAdmin
      .from("user_introductions")
      .select("sub_photo_1, sub_photo_2, sub_photo_3, sub_photo_4")
      .eq("user_id", profile.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        mainPhoto: profile.profile_photo_url,
        subPhotos: introduction
          ? [
              introduction.sub_photo_1,
              introduction.sub_photo_2,
              introduction.sub_photo_3,
              introduction.sub_photo_4,
            ]
          : [null, null, null, null],
      },
    });
  } catch (error) {
    console.error("사진 조회 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 사용자 프로필 사진 저장
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
    const { mainPhoto, subPhotos } = body;

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

    // 메인 사진 업데이트 (user_profiles)
    if (mainPhoto !== undefined) {
      const { error: mainError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          profile_photo_url: mainPhoto,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (mainError) {
        console.error("메인 사진 업데이트 오류:", mainError);
        return NextResponse.json(
          { error: "메인 사진 저장에 실패했습니다." },
          { status: 500 }
        );
      }
    }

    // 서브 사진 업데이트 (user_introductions)
    if (subPhotos && Array.isArray(subPhotos)) {
      // 기존 레코드 확인
      const { data: existingIntro } = await supabaseAdmin
        .from("user_introductions")
        .select("id")
        .eq("user_id", profile.id)
        .maybeSingle();

      const subPhotoData = {
        sub_photo_1: subPhotos[0] || null,
        sub_photo_2: subPhotos[1] || null,
        sub_photo_3: subPhotos[2] || null,
        sub_photo_4: subPhotos[3] || null,
        updated_at: new Date().toISOString(),
      };

      if (existingIntro) {
        // 업데이트
        const { error: subError } = await supabaseAdmin
          .from("user_introductions")
          .update(subPhotoData)
          .eq("user_id", profile.id);

        if (subError) {
          console.error("서브 사진 업데이트 오류:", subError);
          return NextResponse.json(
            { error: "서브 사진 저장에 실패했습니다." },
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
            ...subPhotoData,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("서브 사진 생성 오류:", insertError);
          return NextResponse.json(
            { error: "서브 사진 저장에 실패했습니다." },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "사진이 성공적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error("사진 저장 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
