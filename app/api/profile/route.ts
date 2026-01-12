import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 프로필 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "서버 설정 오류" },
        { status: 500 }
      );
    }

    const { data: profile, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("email", session.user.email)
      .maybeSingle();

    if (error) {
      console.error("프로필 조회 오류:", error);
      return NextResponse.json(
        { error: "프로필을 가져오는데 실패했습니다." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "승인된 프로필이 없습니다. 어드민 승인을 기다려주세요." },
        { status: 404 }
      );
    }

    // 모든 쿼리를 병렬로 실행 (성능 최적화)
    const [
      joinedWeekResult,
      growthEndDateResult,
      activitiesResult,
      weeklyActivitiesResult,
      cumulativePointsResult,
      seasonHistoriesResult,
      gradeStatsResult,
      growthStatsResult
    ] = await Promise.all([
      // 성장 시작일 (joined_week_id로 weeks 조회)
      profile.joined_week_id
        ? supabaseAdmin.from("weeks").select("start_date").eq("id", profile.joined_week_id).maybeSingle()
        : Promise.resolve({ data: null }),

      // 성장 종료일
      profile.status === 'suspended' && profile.suspended_week_id
        ? supabaseAdmin.from("weeks").select("end_date").eq("id", profile.suspended_week_id).maybeSingle()
        : profile.status === 'graduated'
          ? supabaseAdmin.from("user_season_histories")
              .select(`seasons (end_date)`)
              .eq("user_id", profile.id)
              .eq("progress_status", "completed")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),

      // activities 데이터 (실무 카드용)
      supabaseAdmin.from("activities").select("activity_type_id").eq("user_id", profile.id).eq("status", "approved"),

      // weekly_activities (활동 완료율)
      supabaseAdmin.from("weekly_activities").select("status").eq("user_id", profile.id),

      // cumulative_points (별, 번개, 방패)
      supabaseAdmin.from("user_cumulative_points").select("total_stars, total_lightnings, total_shields").eq("user_id", profile.id).maybeSingle(),

      // season_histories
      supabaseAdmin.from("user_season_histories").select(`
        id,
        role_in_season,
        approved_weeks,
        total_weeks,
        progress_status,
        review_status,
        seasons (
          id,
          year,
          name,
          start_date
        )
      `).eq("user_id", profile.id),

      // grade_stats (품계 정보)
      supabaseAdmin.from("user_grade_stats").select("avg_percentile, grade, grade_label").eq("user_id", profile.id).maybeSingle(),

      // growth_stats (성장 기간 집계 + reliability_rate)
      supabaseAdmin.from("user_growth_stats").select("approved_weeks, unapproved_weeks, rest_weeks, club_break_weeks, available_weeks, rest_seasons, approved_seasons, reliability_rate").eq("user_id", profile.id).maybeSingle()
    ]);

    // 결과 처리
    const growthStartDate = joinedWeekResult.data?.start_date || null;

    let growthEndDate = null;
    if (profile.status === 'suspended') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      growthEndDate = (growthEndDateResult.data as any)?.end_date || null;
    } else if (profile.status === 'graduated') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      growthEndDate = (growthEndDateResult.data as any)?.seasons?.end_date || null;
    }

    const activitiesData = activitiesResult.data;
    const weeklyActivities = weeklyActivitiesResult.data;
    const cumulativePoints = cumulativePointsResult.data;
    const seasonHistories = seasonHistoriesResult.data;
    const gradeStats = gradeStatsResult.data;
    const growthStats = growthStatsResult.data;

    // activity_type_id 별로 카운트
    const infoTypes = ['calendar', 'essay', 'forum', 'infodesk', 'session', 'wisdom'];
    const competencyTypes = ['optional_unit', 'practical_lecture'];
    const experienceTypes = ['required_unit'];
    const careerTypes = ['practical_project'];

    const practicalCounts = activitiesData ? {
      competency: activitiesData.filter(a => competencyTypes.includes(a.activity_type_id)).length,
      experience: activitiesData.filter(a => experienceTypes.includes(a.activity_type_id)).length,
      info: activitiesData.filter(a => infoTypes.includes(a.activity_type_id)).length,
      career: activitiesData.filter(a => careerTypes.includes(a.activity_type_id)).length
    } : { competency: 0, experience: 0, info: 0, career: 0 };

    let completionRate = 0;
    if (weeklyActivities && weeklyActivities.length > 0) {
      const completedCount = weeklyActivities.filter(
        (activity) => activity.status === "approved" || activity.status === "completed"
      ).length;
      completionRate = Math.round((completedCount / weeklyActivities.length) * 100);
    }

    // 시즌 이름에서 순서 매핑 (spring=1, summer=2, fall=3, winter=4)
    const seasonOrderMap: { [key: string]: number } = {
      'spring': 1,
      'summer': 2,
      'fall': 3,
      'winter': 4
    };

    // seasons 데이터가 있는 항목만 필터링 후 정렬 (년도 내림차순, 시즌 순서 내림차순)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedSeasonHistories = seasonHistories
      ? seasonHistories
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((item: any) => item.seasons !== null)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => {
            const yearDiff = b.seasons.year - a.seasons.year;
            if (yearDiff !== 0) return yearDiff;
            return (seasonOrderMap[b.seasons.name] || 0) - (seasonOrderMap[a.seasons.name] || 0);
          })
      : [];

    return NextResponse.json({
      success: true,
      data: profile,
      practicalCounts,
      reliabilityRate: growthStats?.reliability_rate ? parseFloat(growthStats.reliability_rate) : 0,
      completionRate,
      badges: {
        stars: cumulativePoints?.total_stars || 0,
        lightnings: cumulativePoints?.total_lightnings || 0,
        shields: cumulativePoints?.total_shields || 0,
      },
      seasonHistories: sortedSeasonHistories,
      growthInfo: {
        status: profile.status,
        growthStatus: profile.growth_status,
        startDate: growthStartDate,
        endDate: growthEndDate,
      },
      gradeStats: gradeStats ? {
        avgPercentile: parseFloat(gradeStats.avg_percentile) || 0,
        grade: gradeStats.grade || 10,
        gradeLabel: gradeStats.grade_label || '정 9품',
      } : null,
      growthPeriodStats: growthStats ? {
        approvedWeeks: growthStats.approved_weeks || 0,
        unapprovedWeeks: growthStats.unapproved_weeks || 0,
        restWeeks: growthStats.rest_weeks || 0,
        clubBreakWeeks: growthStats.club_break_weeks || 0,
        availableWeeks: growthStats.available_weeks || 0,
        restSeasons: growthStats.rest_seasons || 0,
        approvedSeasons: growthStats.approved_seasons || 0,
      } : null,
    });
  } catch (error) {
    console.error("프로필 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 프로필 수정
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const body = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    // user_profiles에서 기존 프로필 확인
    const { data: existingProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existingProfile) {
      return NextResponse.json(
        { error: "승인된 프로필이 없습니다. 어드민 승인을 기다려주세요." },
        { status: 403 }
      );
    }

    // 프로필 업데이트 데이터 준비
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 필드 매핑
    if (body.display_name !== undefined) updateData.display_name = body.display_name;
    if (body.eng_name !== undefined) updateData.eng_name = body.eng_name;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.birth_date !== undefined) updateData.birth_date = body.birth_date || null;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.profile_photo_url !== undefined) updateData.profile_photo_url = body.profile_photo_url;
    if (body.portfolio_files !== undefined) updateData.portfolio_files = body.portfolio_files;
    if (body.contact_available !== undefined) updateData.contact_available = body.contact_available;

    // 프로필 업데이트
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update(updateData)
      .eq("id", existingProfile.id)
      .select()
      .single();

    if (error) {
      console.error("프로필 수정 오류:", error);
      return NextResponse.json(
        { error: "프로필 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "프로필이 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("프로필 수정 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
