import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const email = session.user.email;

    // 1. user_profiles에서 승인된 사용자 확인
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("id, display_name, email, growth_status")
      .eq("email", email)
      .maybeSingle();

    if (profile) {
      return NextResponse.json({
        success: true,
        status: "approved",
        message: "승인된 사용자입니다.",
        data: {
          id: profile.id,
          displayName: profile.display_name,
          email: profile.email,
          growthStatus: profile.growth_status,
        },
      });
    }

    // 2. applicants에서 대기 중인 지원자 확인
    const { data: applicant } = await supabaseAdmin
      .from("applicants")
      .select("id, name, email, status, applied_date")
      .eq("email", email)
      .maybeSingle();

    if (applicant) {
      return NextResponse.json({
        success: true,
        status: "pending",
        message: "아직 회원 상태가 어드민 승인 대기 중입니다.",
        data: {
          id: applicant.id,
          name: applicant.name,
          email: applicant.email,
          applicantStatus: applicant.status,
          appliedDate: applicant.applied_date,
        },
      });
    }

    // 3. 둘 다 없으면 등록되지 않은 사용자
    return NextResponse.json({
      success: true,
      status: "not_registered",
      message: "등록되지 않은 사용자입니다.",
    });
  } catch (error) {
    console.error("check-status API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
