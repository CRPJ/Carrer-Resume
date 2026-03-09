import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserProfile } from "@/lib/get-user-profile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 사용자 프로필 사진 조회 (userId 쿼리 파라미터로 다른 유저 조회 가능)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    let profileId: string;
    let profilePhotoUrl: string | null = null;

    if (targetUserId) {
      // 특정 유저 조회: 프로필 + 서브사진 병렬 조회
      const [profileResult, introResult] = await Promise.all([
        supabaseAdmin
          .from("user_profiles")
          .select("id, profile_photo_url")
          .eq("id", targetUserId)
          .maybeSingle(),
        supabaseAdmin
          .from("user_introductions")
          .select("sub_photo_1, sub_photo_2, sub_photo_3, sub_photo_4")
          .eq("user_id", targetUserId)
          .maybeSingle(),
      ]);

      if (profileResult.error || !profileResult.data) {
        return NextResponse.json(
          { error: "프로필을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      const introduction = introResult.data;
      return NextResponse.json({
        success: true,
        data: {
          mainPhoto: profileResult.data.profile_photo_url,
          subPhotos: introduction
            ? [introduction.sub_photo_1, introduction.sub_photo_2, introduction.sub_photo_3, introduction.sub_photo_4]
            : [null, null, null, null],
        },
      });
    } else {
      const { profile, error } = await getUserProfile<{ id: string; profile_photo_url: string | null }>("id, profile_photo_url");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }

      profileId = profile.id;
      profilePhotoUrl = profile.profile_photo_url;
    }

    // user_introductions에서 서브 사진 조회
    const { data: introduction } = await supabaseAdmin
      .from("user_introductions")
      .select("sub_photo_1, sub_photo_2, sub_photo_3, sub_photo_4")
      .eq("user_id", profileId)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        mainPhoto: profilePhotoUrl,
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
    const { profile, error } = await getUserProfile();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    const body = await request.json();
    const { mainPhoto, subPhotos } = body;

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
