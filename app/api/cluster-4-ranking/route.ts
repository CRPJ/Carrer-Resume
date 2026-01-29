import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 활동 타입별 분류 (실무 카테고리 - activity_type_id/line_code 기반)
// weekly_activities.activity_type_id는 line_code 형식 (예: 'calendar', 'essay' 등)
const infoTypeIds = ['calendar', 'essay', 'forum', 'infodesk', 'session', 'wisdom', 'etc_a'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekId = searchParams.get('weekId');

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "서버 설정 오류" },
        { status: 500 }
      );
    }

    // 1. 모든 시즌과 주차 가져오기 (break 시즌 제외, 완료된 주차만)
    // 현재 진행 중인 주차는 제외 (end_date < today)
    const today = new Date().toISOString().split('T')[0];
    const { data: allWeeks, error: weeksError } = await supabaseAdmin
      .from('weeks')
      .select('id, week_number, start_date, end_date, is_club_break, holiday_name, seasons (id, year, name)')
      .lt('end_date', today)
      .order('start_date', { ascending: false });

    if (weeksError) {
      console.error("주차 조회 오류:", weeksError);
      return NextResponse.json({ error: "주차 데이터를 가져오는데 실패했습니다." }, { status: 500 });
    }

    // 시즌 이름 매핑 (break 시즌도 포함)
    const seasonNameMap: { [key: string]: string } = {
      'spring': '봄',
      'summer': '여름',
      'fall': '가을',
      'winter': '겨울'
    };

    // break 시즌 이름 파싱 (spring_summer_break -> "봄→여름, 전환")
    const parseBreakSeasonName = (rawName: string): { displayName: string; isBreak: boolean } => {
      if (!rawName || !rawName.toLowerCase().includes('break')) {
        return { displayName: seasonNameMap[rawName] || rawName, isBreak: false };
      }
      // spring_summer_break -> ['spring', 'summer']
      const parts = rawName.replace('_break', '').split('_');
      if (parts.length >= 2) {
        const fromSeason = seasonNameMap[parts[0]] || parts[0];
        const toSeason = seasonNameMap[parts[1]] || parts[1];
        return { displayName: `${fromSeason}→${toSeason}, 전환`, isBreak: true };
      }
      return { displayName: rawName, isBreak: true };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredWeeks = (allWeeks || []).map((week: any) => {
      const seasonData = week.seasons;
      const rawSeasonName = seasonData?.name || '';
      const { displayName, isBreak } = parseBreakSeasonName(rawSeasonName);
      return {
        id: week.id,
        weekNumber: week.week_number,
        seasonYear: seasonData?.year || 0,
        seasonName: displayName,
        rawSeasonName: rawSeasonName,
        startDate: week.start_date,
        endDate: week.end_date,
        isClubBreak: week.is_club_break || false,
        isBreakSeason: isBreak,
        holidayName: week.holiday_name,
        label: isBreak
          ? `${seasonData?.year}년 ${displayName} ${week.week_number}주차`
          : `${seasonData?.year}년 ${displayName} 시즌, ${week.week_number}주차`
      };
    });

    // 주차 목록만 요청한 경우
    if (!weekId) {
      return NextResponse.json({
        success: true,
        weeks: filteredWeeks
      });
    }

    // 2. 특정 주차의 정보 가져오기
    const selectedWeek = filteredWeeks.find(w => w.id === weekId);
    if (!selectedWeek) {
      return NextResponse.json({ error: "해당 주차를 찾을 수 없습니다." }, { status: 404 });
    }

    // 3. 해당 주차에 가입되어 있던 모든 사용자 가져오기
    // 먼저 모든 주차의 start_date를 가져옴 (가입 주차 비교용)
    const { data: allWeeksData } = await supabaseAdmin
      .from('weeks')
      .select('id, start_date');

    const weekStartDateMap = new Map<string, string>();
    (allWeeksData || []).forEach(w => weekStartDateMap.set(w.id, w.start_date));

    const selectedWeekStartDate = selectedWeek.startDate;

    // 해당 주차 시점에 가입되어 있던 모든 활성 사용자 가져오기
    // (joined_week의 start_date <= 해당 주차의 start_date)
    const { data: allProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name, profile_photo_url, status, role, joined_week_id, onboarding_week_id')
      .not('joined_week_id', 'is', null)
      .in('status', ['active', 'seasonal_rest', 'weekly_rest', 'graduated']);

    // 해당 주차에 이미 가입되어 있던 사용자만 필터링
    const eligibleProfiles = (allProfiles || []).filter(profile => {
      if (!profile.joined_week_id) return false;
      const joinedWeekStartDate = weekStartDateMap.get(profile.joined_week_id);
      if (!joinedWeekStartDate) return false;
      return joinedWeekStartDate <= selectedWeekStartDate;
    });

    // 온보딩 주차 ID 매핑 (userId -> onboarding_week_id)
    const userOnboardingWeekMap = new Map<string, string>();
    eligibleProfiles.forEach(p => {
      if (p.onboarding_week_id) {
        userOnboardingWeekMap.set(p.id, p.onboarding_week_id);
      }
    });

    const userIds = new Set<string>();
    eligibleProfiles.forEach(p => userIds.add(p.id));

    if (userIds.size === 0) {
      return NextResponse.json({
        success: true,
        weeks: filteredWeeks,
        selectedWeek,
        rankings: []
      });
    }

    // 주차별 종료 날짜 매핑 (누적 주차 필터링용)
    const weekEndDateMap = new Map<string, string>();
    (allWeeks || []).forEach(w => weekEndDateMap.set(w.id, w.end_date));

    const userIdArray = Array.from(userIds);

    // ============ 모든 독립적인 쿼리를 병렬로 실행 ============
    const [
      weeklyGrowthResult,
      successWeeksResult,
      pointsResult,
      allPointsResult,
      teamsResult,
      partsResult,
      userTeamPartsResult,
      roleHistoriesResult,
      activityTypesResult,
      weeklyActivitiesResult,
      allCompletedActivityRecordsResult,
      careerRecordsResult
    ] = await Promise.all([
      // 해당 주차의 성장 기록
      supabaseAdmin
        .from('user_weekly_growth')
        .select('user_id, is_success, is_resting, is_club_break')
        .eq('week_id', weekId),
      // 성공 주차 데이터 (누적 계산용)
      supabaseAdmin
        .from('user_weekly_growth')
        .select('user_id, week_id, weeks!inner(end_date)')
        .in('user_id', userIdArray)
        .eq('is_success', true),
      // 해당 주차 포인트
      supabaseAdmin
        .from('points')
        .select('user_id, point_type, points')
        .eq('week_id', weekId),
      // 모든 포인트 데이터 (누적 인절미 계산용)
      supabaseAdmin
        .from('points')
        .select('user_id, week_id, point_type, points')
        .in('user_id', userIdArray),
      // 팀 정보
      supabaseAdmin.from('teams').select('id, name'),
      // 파트 정보
      supabaseAdmin.from('parts').select('id, name, team_id'),
      // 사용자 팀/파트 정보
      supabaseAdmin.from('user_team_parts').select('user_id, team_id, part_id, joined_at, left_at').in('user_id', userIdArray),
      // 역할 이력
      supabaseAdmin
        .from('user_role_history')
        .select('user_id, role, started_at, ended_at')
        .in('user_id', userIdArray),
      // 활동 타입 정보
      supabaseAdmin
        .from('activity_types')
        .select('id, line_code, cluster_id, eligible_min_approved_weeks, eligible_max_approved_weeks, count_once_in_total'),
      // 해당 주차 열린 활동
      supabaseAdmin
        .from('weekly_activities')
        .select('id, activity_type_id, is_active, opened_at')
        .eq('week_id', weekId)
        .eq('is_active', true),
      // 모든 완료된 활동 기록 (해당 주차 + 이전 주차 모두)
      supabaseAdmin
        .from('activity_records')
        .select('user_id, week_id, activity_type_id')
        .in('user_id', userIdArray)
        .eq('is_completed', true),
      // 실무 경력 데이터
      supabaseAdmin
        .from('career_records')
        .select('user_id, week_id, enhancement_status')
        .eq('week_id', weekId)
        .in('user_id', userIdArray)
        .in('enhancement_status', ['pending', 'enhanced'])
    ]);

    const weeklyGrowthData = weeklyGrowthResult.data;
    const successWeeksData = successWeeksResult.data;
    const pointsData = pointsResult.data;
    const allPointsData = allPointsResult.data;
    const teams = teamsResult.data || [];
    const parts = partsResult.data || [];
    const userTeamParts = userTeamPartsResult.data || [];
    const roleHistories = roleHistoriesResult.data;
    const activityTypes = activityTypesResult.data;
    const activeActivities = weeklyActivitiesResult.data || [];
    const allCompletedActivityRecords = allCompletedActivityRecordsResult.data;
    const careerRecordsData = careerRecordsResult.data;

    // 4. 사용자 프로필 정보 (이미 가져옴)
    const profiles = eligibleProfiles;

    // 활동 타입 ID -> 정보 매핑
    const competencyTypeIds: string[] = [];
    const experienceTypeIds: string[] = [];

    interface ExperienceTypeInfo {
      id: string;
      eligible_min_approved_weeks: number | null;
      eligible_max_approved_weeks: number | null;
      count_once_in_total: boolean;
    }
    const experienceTypeInfos: ExperienceTypeInfo[] = [];

    (activityTypes || []).forEach(at => {
      if (at.cluster_id === 'practical_competency') competencyTypeIds.push(at.id);
      else if (at.cluster_id === 'practical_experience') {
        experienceTypeIds.push(at.id);
        experienceTypeInfos.push({
          id: at.id,
          eligible_min_approved_weeks: at.eligible_min_approved_weeks,
          eligible_max_approved_weeks: at.eligible_max_approved_weeks,
          count_once_in_total: at.count_once_in_total || false
        });
      }
    });

    // ============ 빠른 조회를 위한 Map 생성 ============
    // 사용자별 포인트 Map
    const userPointsMap = new Map<string, typeof pointsData>();
    (pointsData || []).forEach(p => {
      if (!userPointsMap.has(p.user_id)) userPointsMap.set(p.user_id, []);
      userPointsMap.get(p.user_id)!.push(p);
    });

    // 사용자별 전체 포인트 Map
    const userAllPointsMap = new Map<string, typeof allPointsData>();
    (allPointsData || []).forEach(p => {
      if (!userAllPointsMap.has(p.user_id)) userAllPointsMap.set(p.user_id, []);
      userAllPointsMap.get(p.user_id)!.push(p);
    });

    // 사용자별 성장 기록 Map
    const userGrowthMap = new Map<string, { is_success: boolean; is_resting: boolean; is_club_break: boolean }>();
    (weeklyGrowthData || []).forEach(wg => {
      userGrowthMap.set(wg.user_id, wg);
    });

    // 사용자별 성공 주차 Map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userSuccessWeeksMap = new Map<string, any[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (successWeeksData || []).forEach((sw: any) => {
      if (!userSuccessWeeksMap.has(sw.user_id)) userSuccessWeeksMap.set(sw.user_id, []);
      userSuccessWeeksMap.get(sw.user_id)!.push(sw);
    });

    // 사용자별 완료 활동 Map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userCompletedActivitiesMap = new Map<string, any[]>();
    (allCompletedActivityRecords || []).forEach(ar => {
      if (!userCompletedActivitiesMap.has(ar.user_id)) userCompletedActivitiesMap.set(ar.user_id, []);
      userCompletedActivitiesMap.get(ar.user_id)!.push(ar);
    });

    // 사용자별 경력 기록 Map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userCareerMap = new Map<string, any[]>();
    (careerRecordsData || []).forEach(cr => {
      if (!userCareerMap.has(cr.user_id)) userCareerMap.set(cr.user_id, []);
      userCareerMap.get(cr.user_id)!.push(cr);
    });

    // 프로필 Map
    const profileMap = new Map<string, typeof profiles[0]>();
    profiles.forEach(p => profileMap.set(p.id, p));

    // 역할 라벨 매핑
    const roleLabels: { [key: string]: string } = {
      'crew_regular': '일반',
      'crew_normal': '일반',
      'part_leader': '심화(파트장)',
      'crew_partleader': '심화(파트장)',
      'crew_advanced_part_leader': '심화(파트장)',
      'crew_agent': '심화(에이전트)',
      'crew_advanced_agent': '심화(에이전트)',
      'crew_ambassador': '운영진(앰배서더)',
      'admin_ambassador': '운영진(앰배서더)',
      'operations_ambassador': '운영진(앰배서더)',
      'crew_team_leader': '운영진(팀장)',
      'admin_team_leader': '운영진(팀장)',
    };

    // 팀/파트 Map 생성 (O(1) 조회용)
    const teamMap = new Map(teams.map(t => [t.id, t]));
    const partMap = new Map(parts.map(p => [p.id, p]));

    // 주차 시작일 (한 번만 계산)
    const weekStartDate = new Date(selectedWeek.startDate);
    const selectedWeekEndDate = weekEndDateMap.get(weekId) || selectedWeek.endDate;

    // 9. 사용자별 데이터 집계
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rankings: any[] = [];

    for (const userId of userIdArray) {
      const profile = profileMap.get(userId);
      if (!profile) continue;

      // 해당 주차 포인트 계산 (Map 사용 - O(1))
      const userPoints = userPointsMap.get(userId) || [];
      let star = 0, lightning = 0, shield = 0;
      for (const p of userPoints) {
        if (p.point_type === 'star') star += p.points;
        else if (p.point_type === 'lightning') lightning += p.points;
        else if (p.point_type === 'shield') shield += p.points;
      }

      // 누적 인절미 계산 (Map 사용 - O(1) 조회 후 필터)
      const userAllPoints = userAllPointsMap.get(userId) || [];
      let cumulativeShield = 0, cumulativeLightning = 0;
      for (const p of userAllPoints) {
        const pointWeekEndDate = weekEndDateMap.get(p.week_id);
        if (pointWeekEndDate && pointWeekEndDate <= selectedWeekEndDate) {
          if (p.point_type === 'shield') cumulativeShield += p.points;
          else if (p.point_type === 'lightning') cumulativeLightning += p.points;
        }
      }
      const cumulativeInjeolmi = cumulativeShield - cumulativeLightning;

      // 온보딩 주차 확인 (위에서 한 번만 선언하고 이후 재사용)
      const userOnboardingWeekId = userOnboardingWeekMap.get(userId);
      const isOnboardingWeek = weekId === userOnboardingWeekId;

      // 성장 상태 (Map 사용 - O(1))
      const weeklyGrowth = userGrowthMap.get(userId);
      let growthStatus = '실패';

      // 전환 주차(break 시즌)인 경우 특별 처리
      if (selectedWeek.isBreakSeason) {
        if (isOnboardingWeek) {
          growthStatus = '성공'; // 전환 주차에 온보딩 했으면 성공
        } else {
          growthStatus = '휴식(공식)'; // 전환 주차는 기본적으로 휴식(공식)
        }
      } else if (weeklyGrowth) {
        if (weeklyGrowth.is_club_break) growthStatus = '휴식(공식)';
        else if (weeklyGrowth.is_resting) growthStatus = '휴식(개인)';
        else if (weeklyGrowth.is_success) growthStatus = '성공';
      }

      // 팀/파트 정보 (filter 대신 find 사용 - 첫 번째 매칭만 필요)
      const userTP = userTeamParts.find(utp => {
        if (utp.user_id !== userId) return false;
        const joinedAt = new Date(utp.joined_at);
        const leftAt = utp.left_at ? new Date(utp.left_at) : null;
        return joinedAt <= weekStartDate && (!leftAt || leftAt > weekStartDate);
      });
      const team = userTP?.team_id ? teamMap.get(userTP.team_id) : null;
      const part = userTP?.part_id ? partMap.get(userTP.part_id) : null;

      // 역할 정보
      const userRole = (roleHistories || []).find(rh => {
        if (rh.user_id !== userId) return false;
        const startedAt = new Date(rh.started_at);
        const endedAt = rh.ended_at ? new Date(rh.ended_at) : null;
        return startedAt <= weekStartDate && (!endedAt || endedAt > weekStartDate);
      });
      const roleLabel = userRole ? (roleLabels[userRole.role] || userRole.role) : (profile.role ? roleLabels[profile.role] || profile.role : '일반');

      // 해당 유저의 성공 주차 필터링 (Map 사용 - O(1) 조회)
      const allUserSuccessWeeks = userSuccessWeeksMap.get(userId) || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userSuccessWeeks = allUserSuccessWeeks.filter((sw: any) => {
        const weekEndDate = sw.weeks?.end_date;
        return weekEndDate && weekEndDate <= selectedWeekEndDate;
      });

      let cumulativeApprovedWeeks = userSuccessWeeks.length;

      // 온보딩 주차 추가
      if (userOnboardingWeekId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onboardingAlreadyCounted = userSuccessWeeks.some((sw: any) => sw.week_id === userOnboardingWeekId);
        if (!onboardingAlreadyCounted) {
          const onboardingEndDate = weekEndDateMap.get(userOnboardingWeekId);
          if (onboardingEndDate && onboardingEndDate <= selectedWeekEndDate) {
            cumulativeApprovedWeeks++;
          }
        }
      }

      // 유저의 모든 완료된 활동 (Map 사용 - O(1))
      const userAllCompletedActivities = (userCompletedActivitiesMap.get(userId) || [])
        .map(ar => ({ week_id: ar.week_id, activity_type_id: ar.activity_type_id }));

      // ===== 실무 정보 (info) - cluster-4-card와 동일: is_completed 기준 =====
      const infoTotal = isOnboardingWeek ? 0 : activeActivities.filter(a => infoTypeIds.includes(a.activity_type_id)).length;
      const infoCount = isOnboardingWeek ? 0 : userAllCompletedActivities.filter(a =>
        a.week_id === weekId && infoTypeIds.includes(a.activity_type_id)
      ).length;

      // ===== 실무 역량 (competency) - cluster-4-card와 동일: is_completed 기준, total=1 =====
      const competencyTotal = isOnboardingWeek ? 0 : 1;
      const rawCompetencyCount = userAllCompletedActivities.filter(a =>
        a.week_id === weekId && competencyTypeIds.includes(a.activity_type_id)
      ).length;
      const competencyCount = isOnboardingWeek ? 0 : Math.min(rawCompetencyCount, 1);

      // ===== 실무 경험 (experience) - cluster-4-card와 동일: eligible 조건 + is_completed 기준 =====
      let experienceTotal = 0;
      if (!isOnboardingWeek) {
        const experienceActivities = activeActivities.filter(a => experienceTypeIds.includes(a.activity_type_id));

        experienceActivities.forEach(a => {
          const typeInfo = experienceTypeInfos.find(info => info.id === a.activity_type_id);

          if (!typeInfo) {
            experienceTotal++;
            return;
          }

          // eligible_min/max 체크 (null이면 제한 없음)
          const minWeek = typeInfo.eligible_min_approved_weeks ?? 1;
          const maxWeek = typeInfo.eligible_max_approved_weeks ?? 999;

          // 누적 주차가 eligible 범위 내인지 확인
          if (cumulativeApprovedWeeks >= minWeek && cumulativeApprovedWeeks <= maxWeek) {
            // count_once_in_total 체크 (1회만 가능한 활동)
            if (typeInfo.count_once_in_total) {
              // 이미 이전 주차에서 완료했는지 확인
              const previouslyCompleted = userAllCompletedActivities.some(
                ca => ca.activity_type_id === a.activity_type_id && ca.week_id !== weekId
              );
              if (!previouslyCompleted) {
                experienceTotal++;
              }
            } else {
              experienceTotal++;
            }
          }
        });
      }
      const experienceCount = isOnboardingWeek ? 0 : userAllCompletedActivities.filter(a =>
        a.week_id === weekId && experienceTypeIds.includes(a.activity_type_id)
      ).length;

      // ===== 실무 경력 (career) - career_records 기반 (Map 사용) =====
      // total: pending 또는 enhanced 상태인 프로젝트 수 (최대 5개)
      // count: enhanced 상태인 프로젝트 수 (최대 total개)
      const userCareerRecords = userCareerMap.get(userId) || [];
      const careerRawTotal = userCareerRecords.length;
      const careerTotal = Math.min(careerRawTotal, 5);
      const careerEnhancedCount = userCareerRecords.filter(cr => cr.enhancement_status === 'enhanced').length;
      const careerCount = Math.min(careerEnhancedCount, careerTotal);

      const totalActivities = infoTotal + competencyTotal + experienceTotal + careerTotal;
      const completedActivities = infoCount + competencyCount + experienceCount + careerCount;

      // 성장률 계산 (cluster-4-card와 동일: 온보딩 주차이고 total=0이면 100%)
      const growthRateValue = totalActivities > 0
        ? Math.round((completedActivities / totalActivities) * 100)
        : (isOnboardingWeek ? 100 : 0);

      rankings.push({
        userId,
        displayName: profile.display_name,
        profilePhotoUrl: profile.profile_photo_url,
        status: profile.status,
        teamName: team?.name || null,
        partName: part?.name || null,
        roleLabel,
        star,
        lightning,
        shield,
        injeolmi: cumulativeInjeolmi,
        growthStatus,
        cumulativeApprovedWeeks,
        growthRate: {
          total: totalActivities,
          count: completedActivities,
          rate: growthRateValue
        },
        infoRate: { total: infoTotal, count: infoCount, rate: infoTotal > 0 ? Math.round((infoCount / infoTotal) * 100) : (isOnboardingWeek ? 100 : 0) },
        competencyRate: { total: competencyTotal, count: competencyCount, rate: competencyTotal > 0 ? Math.round((competencyCount / competencyTotal) * 100) : (isOnboardingWeek ? 100 : 0) },
        experienceRate: { total: experienceTotal, count: experienceCount, rate: experienceTotal > 0 ? Math.round((experienceCount / experienceTotal) * 100) : (isOnboardingWeek ? 100 : 0) },
        careerRate: { total: careerTotal, count: careerCount, rate: careerTotal > 0 ? Math.round((careerCount / careerTotal) * 100) : (isOnboardingWeek ? 100 : 0) }
      });
    }

    // 단감(star) 순서로 정렬 (높은 순)
    rankings.sort((a, b) => b.star - a.star);

    return NextResponse.json({
      success: true,
      weeks: filteredWeeks,
      selectedWeek,
      rankings
    });

  } catch (error) {
    console.error("주차별 랭킹 API 오류:", error);
    return NextResponse.json(
      { error: "데이터를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
