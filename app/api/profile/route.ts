import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 프로필 조회 (userId 쿼리 파라미터로 다른 유저 조회 가능)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    console.log('[Profile API] Request URL:', request.url);
    console.log('[Profile API] Target userId:', targetUserId);

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "서버 설정 오류" },
        { status: 500 }
      );
    }

    let profile;

    if (targetUserId) {
      // 특정 유저 조회 (공개 접근 가능)
      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("id", targetUserId)
        .maybeSingle();

      if (error) {
        console.error("프로필 조회 오류:", error);
        return NextResponse.json(
          { error: "프로필을 가져오는데 실패했습니다." },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      profile = data;
    } else {
      // 현재 로그인 유저 조회 (로그인 필요)
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
        );
      }

      const { data, error } = await supabaseAdmin
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

      if (!data) {
        return NextResponse.json(
          { error: "승인된 프로필이 없습니다. 어드민 승인을 기다려주세요." },
          { status: 404 }
        );
      }

      profile = data;
    }

    console.log('[Profile API] Returning profile for:', profile.id, profile.display_name);

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
      userActivityDetailsResult,
      activityTypesResult,
      activityPointsResult,
      seasonPointsResult
    ] = await Promise.all([
      // 성장 시작일 (joined_week_id로 weeks 조회) - 시즌 정보 포함
      profile.joined_week_id
        ? supabaseAdmin.from("weeks").select("start_date, week_number, season_id, seasons (id, year, name)").eq("id", profile.joined_week_id).maybeSingle()
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

      // weekly_activities - 모든 열린 활동 조회 (completionRate 계산용)
      supabaseAdmin.from("weekly_activities").select("week_id, activity_type_id").eq("is_active", true),

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
          start_date,
          end_date
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

      // 해당 유저의 승인된 활동 (주차별) - activity_records 사용
      supabaseAdmin.from("activity_records").select("week_id").eq("user_id", profile.id).eq("is_completed", true),

      // 해당 유저의 역할 이력
      supabaseAdmin.from("user_role_history").select("id, user_id, role, started_at, ended_at").eq("user_id", profile.id),

      // 해당 유저의 활동 이행 기록 (강화 상태 판단용) - id 추가 (points 매핑용)
      supabaseAdmin.from("activity_records").select("id, week_id, activity_type_id, is_completed").eq("user_id", profile.id),

      // 해당 유저의 2차 정보 (서브타이틀, 아웃풋링크)
      supabaseAdmin.from("user_activity_details").select("week_id, activity_type_id, sub_title, output_links").eq("user_id", profile.id),

      // activity_types (cluster_id 기반 분류용)
      supabaseAdmin.from("activity_types").select("id, cluster_id"),

      // 해당 유저의 활동별 포인트 (평점용) - star 타입만
      supabaseAdmin.from("points").select("activity_id, points").eq("user_id", profile.id).eq("point_type", "star").not("activity_id", "is", null),

      // 해당 유저의 시즌별 포인트 (week_id를 통해 season 조인)
      supabaseAdmin.from("points").select("week_id, point_type, points, weeks!inner(season_id)").eq("user_id", profile.id)
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

    // 가입 이후 지나간 주차 필터링 (현재 주차 제외 - 아직 진행 중이므로)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passedWeeksForUser = allWeeks.filter((w: any) => {
      if (!joinedWeekStartDate) return false;
      // 가입 이후 주차만
      if (w.start_date < joinedWeekStartDate) return false;
      // 현재 주차 제외 (end_date가 오늘 이후인 경우 = 아직 진행 중인 주차)
      if (w.end_date >= today) return false;
      return true;
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
      const isOnboardingWeek = week.id === profile.onboarding_week_id;

      // 온보딩 주차는 무조건 성공 처리
      if (isOnboardingWeek) {
        approvedWeeksCount++;
        return;
      }

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
    console.log('[Profile API] joinedWeekStartDate:', joinedWeekStartDate);
    console.log('[Profile API] allWeeks count:', allWeeks.length);
    console.log('[Profile API] breakSeasonIds:', Array.from(breakSeasonIds));
    if (joinedWeekStartDate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filteredWeeks = allWeeks.filter((week: any) => {
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
      });
      availableWeeksClubCount = filteredWeeks.length;
      console.log('[Profile API] availableWeeksClubCount:', availableWeeksClubCount);
      console.log('[Profile API] filteredWeeks:', filteredWeeks.map((w: any) => ({ id: w.id, start_date: w.start_date, is_club_break: w.is_club_break })));
    }

    // 일정 신뢰도 실시간 계산: (a + c) / (a + b + c) * 100
    let calculatedReliabilityRate = 0;
    if (availableWeeksCount > 0) {
      calculatedReliabilityRate = Math.ceil(((approvedWeeksCount + restWeeksCount) / availableWeeksCount) * 100);
    }

    // 항상 실시간 계산 값 사용 (현재 진행 중인 주차 제외)
    const finalGrowthPeriodStats = {
      approvedWeeks: approvedWeeksCount,        // 성장 성공 주차
      unapprovedWeeks: unapprovedWeeksCount,    // 성장 실패 주차
      restWeeks: restWeeksCount,                // 성장 휴식 주차 (개인)
      clubBreakWeeks: clubBreakWeeksCount,      // 클럽 공식 휴식 주차
      availableWeeks: availableWeeksClubCount,  // 성장 가능 주차 (현재 주차 포함, break/공식휴식 제외)
      availableSeasons: growthStats?.available_seasons ?? availableSeasonsCount,
      restSeasons: growthStats?.rest_seasons ?? 0,
      approvedSeasons: growthStats?.approved_seasons ?? 0,
      reliabilityRate: calculatedReliabilityRate,
    };

    // activity_type_id → cluster_id 매핑 생성
    const activityTypes = activityTypesResult.data || [];
    const typeToClusterMap = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activityTypes.forEach((at: any) => {
      if (at.id && at.cluster_id) {
        typeToClusterMap.set(at.id, at.cluster_id);
      }
    });

    // cluster_id 기반으로 카운트
    const practicalCounts = activitiesData ? {
      competency: activitiesData.filter(a => typeToClusterMap.get(a.activity_type_id) === 'practical_competency').length,
      experience: activitiesData.filter(a => typeToClusterMap.get(a.activity_type_id) === 'practical_experience').length,
      info: activitiesData.filter(a => typeToClusterMap.get(a.activity_type_id) === 'practical_info').length,
      career: activitiesData.filter(a => typeToClusterMap.get(a.activity_type_id) === 'practical_career').length
    } : { competency: 0, experience: 0, info: 0, career: 0 };

    // completionRate 계산: (R / P) × 100
    // P = 가입 주차 이후 열린 모든 활동 수 (weekly_activities, break 시즌 제외)
    // R = 완료한 활동 수 (activity_records에서 is_completed=true)
    let completionRate = 0;
    console.log('[Profile API] completionRate 계산 시작 - growthStartDate:', growthStartDate, ', weeklyActivities count:', weeklyActivities?.length);
    if (growthStartDate && weeklyActivities && weeklyActivities.length > 0) {
      // 가입 주차 이후의 유효한 주차 ID 목록 (break 시즌 제외)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validWeekIds = new Set(allWeeks.filter((w: any) => {
        if (w.start_date < growthStartDate) return false;
        if (w.season_id && breakSeasonIds.has(w.season_id)) return false;
        return true;
      }).map((w: { id: string }) => w.id));

      // P: 가입 주차 이후 열린 활동 수
      const totalP = weeklyActivities.filter((wa: { week_id: string }) => validWeekIds.has(wa.week_id)).length;

      // R: 완료한 활동 수
      const totalR = activitiesData ? activitiesData.length : 0;

      console.log('[Profile API] completionRate - validWeekIds:', validWeekIds.size, ', totalP:', totalP, ', totalR:', totalR);

      if (totalP > 0) {
        completionRate = Math.round((totalR / totalP) * 100);
      }
      console.log('[Profile API] completionRate 결과:', completionRate);
    } else {
      console.log('[Profile API] completionRate 계산 스킵 - 조건 불충족');
    }

    // 시즌 이름에서 순서 매핑 (spring=1, summer=2, fall=3, winter=4)
    const seasonOrderMap: { [key: string]: number } = {
      'spring': 1,
      'summer': 2,
      'fall': 3,
      'winter': 4
    };

    // seasons 데이터가 있는 항목만 필터링 후 정렬 (년도 내림차순, 시즌 순서 내림차순)
    console.log('[Profile API] Raw seasonHistories:', JSON.stringify(seasonHistories, null, 2));

    let finalSeasonHistories = seasonHistories || [];

    // seasonHistories가 비어있으면 user_weekly_growth 기반으로 자동 생성
    if (!seasonHistories || seasonHistories.length === 0) {
      console.log('[Profile API] No season histories found, auto-generating from user_weekly_growth...');

      // user_weekly_growth에서 해당 유저의 모든 주차 기록 조회 (weeks, seasons 조인)
      const { data: weeklyGrowthData } = await supabaseAdmin
        .from('user_weekly_growth')
        .select(`
          week_id,
          is_success,
          weeks!inner (
            id,
            season_id,
            seasons!inner (
              id,
              year,
              name,
              start_date,
              end_date
            )
          )
        `)
        .eq('user_id', profile.id);

      console.log('[Profile API] Found user_weekly_growth records:', weeklyGrowthData?.length || 0);

      if (weeklyGrowthData && weeklyGrowthData.length > 0) {
        // 시즌별로 그룹화 (성공한 주차 수와 전체 참여 주차 수 카운트)
        const seasonMap = new Map<string, {
          seasonId: string;
          seasonData: { id: string; year: number; name: string; start_date: string; end_date: string };
          successWeekIds: Set<string>;
          totalWeekIds: Set<string>;
        }>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        weeklyGrowthData.forEach((record: any) => {
          const seasonId = record.weeks.season_id;
          const seasonData = record.weeks.seasons;
          const weekId = record.week_id;
          const isSuccess = record.is_success;

          if (!seasonMap.has(seasonId)) {
            seasonMap.set(seasonId, {
              seasonId,
              seasonData,
              successWeekIds: isSuccess ? new Set([weekId]) : new Set(),
              totalWeekIds: new Set([weekId])
            });
          } else {
            const existing = seasonMap.get(seasonId)!;
            existing.totalWeekIds.add(weekId);
            if (isSuccess) {
              existing.successWeekIds.add(weekId);
            }
          }
        });

        // 각 시즌에 대해 user_season_histories INSERT
        const today = new Date().toISOString().split('T')[0];
        const insertPromises = Array.from(seasonMap.values()).map(async ({ seasonId, seasonData, successWeekIds }) => {
          if (!supabaseAdmin) return; // null 체크
          const approvedWeeks = successWeekIds.size; // 성공한 주차 수
          // 이미 존재하는지 확인
          const { data: existing } = await supabaseAdmin
            .from('user_season_histories')
            .select('id')
            .eq('user_id', profile.id)
            .eq('season_id', seasonId)
            .maybeSingle();

          if (!existing) {
            // 해당 시즌의 총 주차 수 조회
            const { data: seasonWeeks } = await supabaseAdmin
              .from('weeks')
              .select('id')
              .eq('season_id', seasonId);

            const totalWeeks = seasonWeeks?.length || 13;

            // 시즌 종료일이 지났으면 승인완료, 아니면 검수중
            const isSeasonEnded = seasonData.end_date < today;
            const progressStatus = isSeasonEnded ? 'completed' : 'in_progress';
            const reviewStatus = isSeasonEnded ? 'approved' : 'reviewing';

            await supabaseAdmin
              .from('user_season_histories')
              .insert({
                user_id: profile.id,
                season_id: seasonId,
                role_in_season: profile.role || 'crew_regular',
                approved_weeks: approvedWeeks,
                total_weeks: totalWeeks,
                progress_status: progressStatus,
                review_status: reviewStatus
              });
          }
        });

        await Promise.all(insertPromises);

        // 다시 조회
        const { data: newSeasonHistories } = await supabaseAdmin
          .from('user_season_histories')
          .select(`
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
              start_date,
              end_date
            )
          `)
          .eq('user_id', profile.id);

        finalSeasonHistories = newSeasonHistories || [];
        console.log('[Profile API] Auto-generated season histories:', finalSeasonHistories.length);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedSeasonHistories = finalSeasonHistories
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => item.seasons !== null)
      // break 시즌 제외 (winter_spring_break, spring_summer_break 등)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => {
        const seasonName = item.seasons.name || '';
        return !seasonName.toLowerCase().includes('break');
      })
      // 아직 시작하지 않은 미래 시즌 제외 (시즌 시작일이 오늘 이후인 경우)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => {
        return item.seasons.start_date <= today;
      })
      // 가입일이 속한 시즌 이후만 표시 (가입 시즌 포함)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => {
        if (!growthStartDate) return true;
        // 시즌 종료일이 가입일 이후이면 표시 (가입 시즌 포함)
        return item.seasons.end_date >= growthStartDate;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => {
        const yearDiff = b.seasons.year - a.seasons.year;
        if (yearDiff !== 0) return yearDiff;
        return (seasonOrderMap[b.seasons.name] || 0) - (seasonOrderMap[a.seasons.name] || 0);
      });

    // 클럽 온보딩 주차 반영: 온보딩 시즌의 approved_weeks에 +1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onboardingWeek = allWeeks.find((w: any) => w.id === profile.onboarding_week_id);
    const onboardingSeasonId = onboardingWeek?.season_id;

    // 시즌별 포인트 집계
    const seasonPointsData = seasonPointsResult.data || [];
    const seasonPointsMap = new Map<string, { stars: number; lightnings: number; shields: number }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seasonPointsData.forEach((p: any) => {
      const seasonId = p.weeks?.season_id;
      if (!seasonId) return;

      if (!seasonPointsMap.has(seasonId)) {
        seasonPointsMap.set(seasonId, { stars: 0, lightnings: 0, shields: 0 });
      }

      const current = seasonPointsMap.get(seasonId)!;
      if (p.point_type === 'star') {
        current.stars += p.points || 0;
      } else if (p.point_type === 'lightning') {
        current.lightnings += p.points || 0;
      } else if (p.point_type === 'shield') {
        current.shields += p.points || 0;
      }
    });

    // 시즌별 주차/활동 통계 계산을 위한 데이터 준비
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRestWeekIdsForSeason = new Set(allRests.map((r: any) => r.week_id));
    const activityRecordsForSeason = activityRecordsResult.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedActivityRecords = activityRecordsForSeason.filter((ar: any) => ar.is_completed);

    // activity_type_id → cluster_id 매핑
    const activityTypesData = activityTypesResult.data || [];
    const typeToClusterMapForSeason = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activityTypesData.forEach((at: any) => {
      if (at.id && at.cluster_id) {
        typeToClusterMapForSeason.set(at.id, at.cluster_id);
      }
    });

    // 시즌별 통계 계산
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalSeasonHistoriesWithOnboarding = sortedSeasonHistories.map((item: any) => {
      const seasonId = item.seasons?.id;
      const seasonPoints = seasonPointsMap.get(seasonId) || { stars: 0, lightnings: 0, shields: 0 };
      // 인절미(방패)는 순수 방패 - 번개로 계산
      const netShields = seasonPoints.shields - seasonPoints.lightnings;

      // 현재 진행 중인 주차 찾기 (start_date <= today <= end_date)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentWeek = allWeeks.find((w: any) => w.start_date <= today && w.end_date >= today);
      const currentWeekId = currentWeek?.id;

      // 해당 시즌의 주차들 필터링 (유저 가입일 이후, 현재 진행 중인 주차 제외)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seasonWeeks = allWeeks.filter((w: any) => {
        if (w.season_id !== seasonId) return false;
        // 유저 가입일 이후 주차만 포함
        if (growthStartDate && w.start_date < growthStartDate) return false;
        // 현재 진행 중인 주차 제외
        if (currentWeekId && w.id === currentWeekId) return false;
        // 미래 주차 제외 (start_date가 오늘 이후면 아직 시작 안함)
        if (w.start_date > today) return false;
        return true;
      });
      // 운영 주차 (공식 휴식 제외)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const operatingWeeks = seasonWeeks.filter((w: any) => !w.is_club_break);
      const totalOperatingWeeks = operatingWeeks.length;

      // 해당 시즌의 주차 ID 목록
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seasonWeekIds = new Set(seasonWeeks.map((w: any) => w.id));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const operatingWeekIds = new Set(operatingWeeks.map((w: any) => w.id));

      // 인정받은 주차 수 (approved_weeks 사용)
      const approvedWeeksCount = item.approved_weeks || 0;

      // 개인 휴식 주차 수 (해당 시즌 내)
      let restWeeksInSeason = 0;
      operatingWeekIds.forEach((weekId: string) => {
        if (userRestWeekIdsForSeason.has(weekId)) {
          restWeeksInSeason++;
        }
      });

      // 주차 활용도: 인정받은 주차 / 운영 주차
      const weekUsageRate = totalOperatingWeeks > 0
        ? Math.round((approvedWeeksCount / totalOperatingWeeks) * 100)
        : 0;

      // 일정 신뢰도: (인정받은 주차 + 휴식 주차) / 운영 주차
      const reliableWeeks = approvedWeeksCount + restWeeksInSeason;
      const reliabilityRate = totalOperatingWeeks > 0
        ? Math.round((reliableWeeks / totalOperatingWeeks) * 100)
        : 0;

      // 시즌 성장률: 완료한 활동 / 열린 활동
      // 해당 시즌에 열린 활동 수 (온보딩 주차 제외)
      const weeklyActivitiesData = weeklyActivitiesResult.data || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seasonOpenedActivities = weeklyActivitiesData.filter((wa: any) => {
        if (!seasonWeekIds.has(wa.week_id)) return false;
        // 온보딩 주차의 활동 제외
        if (wa.week_id === profile.onboarding_week_id) return false;
        return true;
      });

      // 실무 역량용 운영 주차 수 계산 (공식 휴식 + 개인 휴식 + 온보딩 주차 제외)
      // operatingWeeks는 공식 휴식만 제외된 상태이므로, 개인 휴식과 온보딩 주차도 추가로 제외
      // 온보딩 주차가 해당 시즌의 운영 주차에 포함되어 있는지 확인
      const isOnboardingInThisSeason = profile.onboarding_week_id && operatingWeekIds.has(profile.onboarding_week_id);
      const competencyOperatingWeeks = totalOperatingWeeks - restWeeksInSeason - (isOnboardingInThisSeason ? 1 : 0);

      // 실무 경험용 "진행 주차" 기반 분모 계산
      // 진행 주차별 가능한 실무 경험 개수:
      // - 진행 1주차: 0개 (온보딩)
      // - 진행 2주차: 2개 (커리어 Launch 1회 + 콘텐츠)
      // - 진행 3주차: 2개 (생산성 + 콘텐츠)
      // - 진행 4주차~: 3개 (생산성 + 콘텐츠 + 퍼포먼스)
      const calculateExperienceTotal = () => {
        // 해당 시즌의 운영 주차 중 유저가 참여 가능한 주차 (개인 휴식 제외)
        const participatingWeeks = totalOperatingWeeks - restWeeksInSeason;
        if (participatingWeeks <= 0) return 0;

        // 온보딩 시즌인지 확인 (온보딩 주차가 이 시즌에 있는지)
        const isOnboardingSeason = isOnboardingInThisSeason;

        // 온보딩 시즌이 아니면 이미 진행 4주차 이상이므로 매주 3개
        if (!isOnboardingSeason) {
          return participatingWeeks * 3;
        }

        // 온보딩 시즌인 경우 진행 주차별로 계산
        let total = 0;
        for (let progressWeek = 1; progressWeek <= participatingWeeks; progressWeek++) {
          if (progressWeek === 1) {
            // 진행 1주차 (온보딩): 0개
            total += 0;
          } else if (progressWeek === 2) {
            // 진행 2주차: 2개 (커리어 Launch 1회 + 콘텐츠)
            total += 2;
          } else if (progressWeek === 3) {
            // 진행 3주차: 2개 (생산성 + 콘텐츠)
            total += 2;
          } else {
            // 진행 4주차~: 3개 (생산성 + 콘텐츠 + 퍼포먼스)
            total += 3;
          }
        }
        return total;
      };
      const experienceOpenedByProgressWeek = calculateExperienceTotal();

      // 클러스터별로 열린 활동 분류
      let infoOpenedCount = 0;
      let competencyOpenedCount = Math.max(0, competencyOperatingWeeks);  // 실무 역량: 한 주에 1개만 가능, 음수 방지
      let experienceOpenedCount = experienceOpenedByProgressWeek;  // 실무 경험: 진행 주차 기반 계산
      let careerOpenedCount = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      seasonOpenedActivities.forEach((wa: any) => {
        const clusterId = typeToClusterMapForSeason.get(wa.activity_type_id);
        if (clusterId === 'practical_info') infoOpenedCount++;
        // competency는 운영 주차 수로 이미 설정됨
        // experience는 진행 주차 기반으로 이미 설정됨
        else if (clusterId === 'practical_career') careerOpenedCount++;
      });

      // 전체 열린 활동 수 (실무 역량은 운영 주차 수로 계산)
      const totalOpenedActivities = infoOpenedCount + competencyOpenedCount + experienceOpenedCount + careerOpenedCount;

      // 해당 시즌에 완료한 활동 수 (온보딩 주차 제외)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seasonCompletedActivities = completedActivityRecords.filter((ar: any) => {
        if (!seasonWeekIds.has(ar.week_id)) return false;
        // 온보딩 주차의 활동 제외
        if (ar.week_id === profile.onboarding_week_id) return false;
        return true;
      });
      const totalCompletedActivities = seasonCompletedActivities.length;

      const growthRate = totalOpenedActivities > 0
        ? Math.round((totalCompletedActivities / totalOpenedActivities) * 100)
        : 0;

      // 클러스터별 활동 통계 (실무 강화율)
      const clusterStats = {
        info: { total: infoOpenedCount, completed: 0 },
        competency: { total: competencyOpenedCount, completed: 0 },  // 실무 역량: 운영 주차 수 (한 주에 1개만 가능)
        experience: { total: experienceOpenedCount, completed: 0 },
        career: { total: careerOpenedCount, completed: 0 }
      };

      // 해당 시즌에 완료한 활동을 클러스터별로 분류
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      seasonCompletedActivities.forEach((ar: any) => {
        const clusterId = typeToClusterMapForSeason.get(ar.activity_type_id);
        if (clusterId === 'practical_info') clusterStats.info.completed++;
        else if (clusterId === 'practical_competency') clusterStats.competency.completed++;
        else if (clusterId === 'practical_experience') clusterStats.experience.completed++;
        else if (clusterId === 'practical_career') clusterStats.career.completed++;
      });

      let updatedItem = {
        ...item,
        seasonPoints: {
          stars: seasonPoints.stars,           // 단감
          shields: netShields,                 // 인절미 (계산된 값)
          lightnings: seasonPoints.lightnings  // 어흥
        },
        seasonStats: {
          // 주차 활용도
          weekUsageRate,
          approvedWeeks: approvedWeeksCount,
          totalOperatingWeeks,
          // 일정 신뢰도
          reliabilityRate,
          reliableWeeks,
          // 시즌 성장률
          growthRate,
          completedActivities: totalCompletedActivities,
          totalActivities: totalOpenedActivities,
          // 클러스터별 활동 통계 (실무 강화율)
          clusterStats
        }
      };

      if (onboardingSeasonId && item.seasons?.id === onboardingSeasonId) {
        // 온보딩 주차 반영
        const newApprovedWeeks = approvedWeeksCount + 1;
        const newWeekUsageRate = totalOperatingWeeks > 0
          ? Math.round((newApprovedWeeks / totalOperatingWeeks) * 100)
          : 0;
        const newReliableWeeks = newApprovedWeeks + restWeeksInSeason;
        const newReliabilityRate = totalOperatingWeeks > 0
          ? Math.round((newReliableWeeks / totalOperatingWeeks) * 100)
          : 0;

        updatedItem = {
          ...updatedItem,
          approved_weeks: newApprovedWeeks,
          seasonStats: {
            ...updatedItem.seasonStats,
            weekUsageRate: newWeekUsageRate,
            approvedWeeks: newApprovedWeeks,
            reliabilityRate: newReliabilityRate,
            reliableWeeks: newReliableWeeks
          }
        };
      }
      return updatedItem;
    });

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
      seasonHistories: finalSeasonHistoriesWithOnboarding,
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
        approvedWeeks: growthStats?.approved_weeks ?? finalGrowthPeriodStats.approvedWeeks,           // DB 우선, 없으면 실시간 계산
        unapprovedWeeks: growthStats?.unapproved_weeks ?? finalGrowthPeriodStats.unapprovedWeeks,     // DB 우선, 없으면 실시간 계산
        restWeeks: growthStats?.rest_weeks ?? finalGrowthPeriodStats.restWeeks,                       // DB 우선, 없으면 실시간 계산
        clubBreakWeeks: growthStats?.club_break_weeks ?? finalGrowthPeriodStats.clubBreakWeeks,       // DB 우선, 없으면 실시간 계산
        availableWeeks: growthStats?.available_weeks ?? availableWeeksClubCount,                       // DB 우선, 없으면 실시간 계산
        availableSeasons: growthStats?.available_seasons ?? availableSeasonsCount,                    // DB 우선, 없으면 실시간 계산
        restSeasons: growthStats?.rest_seasons ?? finalGrowthPeriodStats.restSeasons,                 // DB 우선, 없으면 실시간 계산
        approvedSeasons: growthStats?.approved_seasons ?? finalGrowthPeriodStats.approvedSeasons,     // DB 우선, 없으면 실시간 계산
      },
      // 온보딩 주차 ID (클라이언트에서 성공 처리용)
      onboardingWeekId: profile.onboarding_week_id || null,
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
      // 활동별 포인트 (평점용) - activity_id → points 매핑
      activityPoints: activityPointsResult.data || [],
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
