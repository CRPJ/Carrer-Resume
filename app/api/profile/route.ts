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

    const today = new Date().toISOString().split('T')[0];

    // 모든 쿼리를 병렬로 실행 (성능 최적화)
    const [
      joinedWeekResult,
      growthEndDateResult,
      weeklyActivitiesResult,
      cumulativePointsResult,
      seasonHistoriesResult,
      gradeStatsResult,
      growthStatsResult,
      allWeeksResult,
      allRestsResult,
      allSeasonsResult,
      userActivitiesResult,
      userRoleHistoryResult,
      activityRecordsResult,
      userActivityDetailsResult
    ] = await Promise.all([
      // 성장 시작일 (joined_week_id로 weeks 조회) - 시즌 정보 포함
      profile.joined_week_id
        ? supabaseAdmin.from("weeks").select("start_date, week_number, seasons (year, name)").eq("id", profile.joined_week_id).maybeSingle()
        : Promise.resolve({ data: null }),

      // 성장 종료일 - 시즌 정보 포함
      profile.status === 'suspended' && profile.suspended_week_id
        ? supabaseAdmin.from("weeks").select("end_date, week_number, seasons (year, name)").eq("id", profile.suspended_week_id).maybeSingle()
        : profile.status === 'graduated'
          ? supabaseAdmin.from("user_season_histories")
              .select(`seasons (year, name, end_date)`)
              .eq("user_id", profile.id)
              .eq("progress_status", "completed")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),

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
      supabaseAdmin.from("user_growth_stats").select("approved_weeks, unapproved_weeks, rest_weeks, club_break_weeks, available_weeks, available_weeks_club, available_seasons, rest_seasons, approved_seasons, reliability_rate").eq("user_id", profile.id).maybeSingle(),

      // 모든 주차 (실시간 계산용)
      supabaseAdmin.from("weeks").select("id, start_date, end_date, is_club_break, season_id, week_number").lte("start_date", today).order("start_date", { ascending: true }),

      // 해당 유저의 승인된 휴식 요청
      supabaseAdmin.from("rest_requests").select("week_id").eq("user_id", profile.id).eq("status", "approved"),

      // 모든 시즌 (성장 가능 시즌 계산용)
      supabaseAdmin.from("seasons").select("id, name, year, start_date, end_date").order("start_date", { ascending: true }),

      // 해당 유저의 승인된 활동 (주차별)
      supabaseAdmin.from("activities").select("week_id").eq("user_id", profile.id).eq("status", "approved"),

      // 해당 유저의 역할 이력
      supabaseAdmin.from("user_role_history").select("id, user_id, role, started_at, ended_at").eq("user_id", profile.id),

      // 해당 유저의 활동 이행 기록 (강화 상태 판단용)
      supabaseAdmin.from("activity_records").select("week_id, activity_type_id, is_completed").eq("user_id", profile.id),

      // 해당 유저의 2차 정보 (서브타이틀, 아웃풋링크)
      supabaseAdmin.from("user_activity_details").select("week_id, activity_type_id, sub_title, output_links").eq("user_id", profile.id)
    ]);

    // 시즌 이름 변환 맵 (영문 → 한글)
    const seasonNameKoreanMap: { [key: string]: string } = {
      'spring': '봄',
      'summer': '여름',
      'fall': '가을',
      'winter': '겨울'
    };

    // 결과 처리
    const growthStartDate = joinedWeekResult.data?.start_date || null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const joinedWeekData = joinedWeekResult.data as any;
    const growthStartWeekInfo = joinedWeekData ? {
      year: joinedWeekData.seasons?.year || null,
      seasonName: seasonNameKoreanMap[joinedWeekData.seasons?.name] || joinedWeekData.seasons?.name || null,
      weekNumber: joinedWeekData.week_number || null
    } : null;

    let growthEndDate = null;
    let growthEndWeekInfo = null;
    if (profile.status === 'suspended') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const endWeekData = growthEndDateResult.data as any;
      growthEndDate = endWeekData?.end_date || null;
      growthEndWeekInfo = endWeekData ? {
        year: endWeekData.seasons?.year || null,
        seasonName: seasonNameKoreanMap[endWeekData.seasons?.name] || endWeekData.seasons?.name || null,
        weekNumber: endWeekData.week_number || null
      } : null;
    } else if (profile.status === 'graduated') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const graduatedData = growthEndDateResult.data as any;
      growthEndDate = graduatedData?.seasons?.end_date || null;
      growthEndWeekInfo = graduatedData?.seasons ? {
        year: graduatedData.seasons.year || null,
        seasonName: seasonNameKoreanMap[graduatedData.seasons.name] || graduatedData.seasons.name || null,
        weekNumber: null // 졸업의 경우 주차 정보 없음
      } : null;
    }

    // activity_records에서 is_completed=true인 것만 필터링 (기존 activities 테이블 대체)
    const activityRecordsData = activityRecordsResult.data || [];
    const activitiesData = activityRecordsData.filter((ar: { is_completed: boolean }) => ar.is_completed);
    const weeklyActivities = weeklyActivitiesResult.data;
    const cumulativePoints = cumulativePointsResult.data;
    const seasonHistories = seasonHistoriesResult.data;
    const gradeStats = gradeStatsResult.data;
    const growthStats = growthStatsResult.data;
    const allWeeks = allWeeksResult.data || [];
    const allRests = allRestsResult.data || [];
    const allSeasons = allSeasonsResult.data || [];
    const userActivities = userActivitiesResult.data || [];

    // 실시간 성장 기간 통계 계산 (user_growth_stats 테이블에 데이터가 없을 때)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRestWeekIds = new Set(allRests.map((r: any) => r.week_id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activityByWeek = new Map(userActivities.map((a: any) => [a.week_id, a]));

    // 가입 주차 시작일 찾기
    const joinedWeekStartDate = growthStartDate;

    // 가입 이후 지나간 주차 필터링
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passedWeeksForUser = allWeeks.filter((w: any) => {
      if (!joinedWeekStartDate) return false;
      return w.start_date >= joinedWeekStartDate;
    });

    // 주차별 통계 계산
    let approvedWeeksCount = 0;      // a: 활동 인정 주차
    let unapprovedWeeksCount = 0;    // b: 활동 미인정 주차
    let restWeeksCount = 0;          // c: 활동 휴식 주차
    let clubBreakWeeksCount = 0;     // d: 공식 휴식 주차

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passedWeeksForUser.forEach((week: any) => {
      const hasActivity = activityByWeek.has(week.id);
      const hasRest = userRestWeekIds.has(week.id);
      const isClubBreak = week.is_club_break;

      // 특수 케이스: 공식 휴식 주차인데 활동 인정 받은 경우 → a에만 +1
      if (isClubBreak && hasActivity) {
        approvedWeeksCount++;
        return;
      }

      // 공식 휴식 주차 (d)
      if (isClubBreak) {
        clubBreakWeeksCount++;
        return;
      }

      // 개인 휴식 주차 (c)
      if (hasRest) {
        restWeeksCount++;
        return;
      }

      // 활동 인정 (a)
      if (hasActivity) {
        approvedWeeksCount++;
        return;
      }

      // 활동 미인정 (b)
      unapprovedWeeksCount++;
    });

    // e: 활동 가능 주차 = a + b + c
    const availableWeeksCount = approvedWeeksCount + unapprovedWeeksCount + restWeeksCount;

    // break 시즌 ID 목록 (전환 시즌)
    const breakSeasonIds = new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allSeasons.filter((s: any) => s.name?.toLowerCase().includes('break')).map((s: any) => s.id)
    );

    // 성장 가능 시즌 수 계산 (가입 이후 클럽 정상 운영 시즌, break 시즌 제외)
    let availableSeasonsCount = 0;
    if (joinedWeekStartDate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      availableSeasonsCount = allSeasons.filter((season: any) => {
        // break 시즌 제외
        if (breakSeasonIds.has(season.id)) return false;

        // 가입 이후 시작된 시즌 또는 가입일이 해당 시즌 내인 경우
        const seasonStartsAfterJoin = season.start_date >= joinedWeekStartDate;
        const joinedDuringSeason = season.start_date <= joinedWeekStartDate && season.end_date >= joinedWeekStartDate;

        if (!seasonStartsAfterJoin && !joinedDuringSeason) return false;

        // 현재까지 시작된 시즌만
        return season.start_date <= today;
      }).length;
    }

    // 성장 가능 주차 수 계산 (클럽 정상 운영 주차, break 시즌/공식 휴식 제외)
    let availableWeeksClubCount = 0;
    if (joinedWeekStartDate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      availableWeeksClubCount = allWeeks.filter((week: any) => {
        // 가입 이전 주차 제외
        if (week.start_date < joinedWeekStartDate) return false;

        // 클럽 공식 휴식 주차 체크 (활동 인정 받은 경우 예외)
        if (week.is_club_break) {
          const hasApprovedActivity = activityByWeek.has(week.id);
          if (!hasApprovedActivity) return false;
        }

        // 전환 시즌(break) 주차 제외
        if (week.season_id && breakSeasonIds.has(week.season_id)) return false;

        // 현재까지 시작된 주차만
        return week.start_date <= today;
      }).length;
    }

    // 일정 신뢰도 실시간 계산: (a + c) / (a + b + c) * 100
    let calculatedReliabilityRate = 0;
    if (availableWeeksCount > 0) {
      calculatedReliabilityRate = Math.ceil(((approvedWeeksCount + restWeeksCount) / availableWeeksCount) * 100);
    }

    // DB 데이터가 있으면 사용, 없으면 실시간 계산 값 사용
    const finalGrowthPeriodStats = {
      approvedWeeks: growthStats?.approved_weeks ?? approvedWeeksCount,
      unapprovedWeeks: growthStats?.unapproved_weeks ?? unapprovedWeeksCount,
      restWeeks: growthStats?.rest_weeks ?? restWeeksCount,
      clubBreakWeeks: growthStats?.club_break_weeks ?? clubBreakWeeksCount,
      availableWeeks: growthStats?.available_weeks ?? availableWeeksCount,
      availableSeasons: growthStats?.available_seasons ?? availableSeasonsCount,
      restSeasons: growthStats?.rest_seasons ?? 0,
      approvedSeasons: growthStats?.approved_seasons ?? 0,
      reliabilityRate: growthStats?.reliability_rate ? parseFloat(growthStats.reliability_rate) : calculatedReliabilityRate,
    };

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
      reliabilityRate: finalGrowthPeriodStats.reliabilityRate,
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
        startWeekInfo: growthStartWeekInfo,
        endWeekInfo: growthEndWeekInfo,
      },
      gradeStats: gradeStats ? {
        avgPercentile: parseFloat(gradeStats.avg_percentile) || 0,
        grade: gradeStats.grade || 10,
        gradeLabel: gradeStats.grade_label || '정 9품',
      } : null,
      growthPeriodStats: {
        approvedWeeks: finalGrowthPeriodStats.approvedWeeks,
        unapprovedWeeks: finalGrowthPeriodStats.unapprovedWeeks,
        restWeeks: finalGrowthPeriodStats.restWeeks,
        clubBreakWeeks: finalGrowthPeriodStats.clubBreakWeeks,
        availableWeeks: growthStats?.available_weeks_club ?? availableWeeksClubCount, // DB 우선, 없으면 실시간 계산
        availableSeasons: growthStats?.available_seasons ?? availableSeasonsCount, // DB 우선, 없으면 실시간 계산
        restSeasons: finalGrowthPeriodStats.restSeasons,
        approvedSeasons: finalGrowthPeriodStats.approvedSeasons,
      },
      // 활동/휴식 주차 ID 목록 (클라이언트에서 사용)
      activityWeekIds: activitiesData?.map((a: { week_id: string }) => a.week_id) || [],
      restWeekIds: allRests?.map((r: { week_id: string }) => r.week_id) || [],
      // 역할 이력 (클라이언트에서 사용)
      userRoleHistory: userRoleHistoryResult.data || [],
      // 승인된 활동 전체 (주차별 강화 집계용) - activity_records에서 is_completed=true인 것
      approvedActivities: activitiesData || [],
      // 활동 이행 기록 전체 (강화 상태 판단용: is_completed 포함)
      activityRecords: activityRecordsData,
      // 2차 정보 (서브타이틀, 아웃풋링크)
      activityDetails: userActivityDetailsResult.data || [],
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
