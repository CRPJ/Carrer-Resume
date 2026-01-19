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

    // break 시즌 필터링
    const seasonNameMap: { [key: string]: string } = {
      'spring': '봄',
      'summer': '여름',
      'fall': '가을',
      'winter': '겨울'
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredWeeks = (allWeeks || []).filter((week: any) => {
      const seasonData = week.seasons;
      const rawSeasonName = seasonData?.name || '';
      return !rawSeasonName.toLowerCase().includes('break');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).map((week: any) => {
      const seasonData = week.seasons;
      return {
        id: week.id,
        weekNumber: week.week_number,
        seasonYear: seasonData?.year || 0,
        seasonName: seasonNameMap[seasonData?.name] || seasonData?.name || '',
        startDate: week.start_date,
        endDate: week.end_date,
        isClubBreak: week.is_club_break || false,
        holidayName: week.holiday_name,
        label: `${seasonData?.year}년 ${seasonNameMap[seasonData?.name] || seasonData?.name} 시즌, ${week.week_number}주차`
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

    // 해당 주차의 성장 기록
    const { data: weeklyGrowthData } = await supabaseAdmin
      .from('user_weekly_growth')
      .select('user_id, is_success, is_resting, is_club_break')
      .eq('week_id', weekId);

    // 해당 주차까지의 모든 성장 기록 가져오기 (누적 성공 주차 수 계산용)
    const { data: allGrowthData } = await supabaseAdmin
      .from('user_weekly_growth')
      .select('user_id, week_id, is_success')
      .in('user_id', Array.from(userIds));

    // 주차별 종료 날짜 매핑 (누적 주차 필터링용)
    const weekEndDateMap = new Map<string, string>();
    (allWeeks || []).forEach(w => weekEndDateMap.set(w.id, w.end_date));

    // 해당 주차에 포인트가 있는 사용자들
    const { data: pointsData } = await supabaseAdmin
      .from('points')
      .select('user_id, point_type, points')
      .eq('week_id', weekId);

    // 4. 사용자 프로필 정보 (이미 가져옴)
    const profiles = eligibleProfiles;

    // 5. 팀/파트 정보 가져오기
    const [teamsResult, partsResult, userTeamPartsResult] = await Promise.all([
      supabaseAdmin.from('teams').select('id, name'),
      supabaseAdmin.from('parts').select('id, name, team_id'),
      supabaseAdmin.from('user_team_parts').select('user_id, team_id, part_id, joined_at, left_at').in('user_id', Array.from(userIds))
    ]);

    const teams = teamsResult.data || [];
    const parts = partsResult.data || [];
    const userTeamParts = userTeamPartsResult.data || [];

    // 6. 역할 이력 가져오기
    const { data: roleHistories } = await supabaseAdmin
      .from('user_role_history')
      .select('user_id, role, started_at, ended_at')
      .in('user_id', Array.from(userIds));

    // 7. 활동 기록 가져오기 (강화율 계산용 - 해당 주차)
    const { data: activityRecords } = await supabaseAdmin
      .from('activity_records')
      .select('user_id, activity_type_id, is_completed')
      .eq('week_id', weekId)
      .eq('is_completed', true);

    // 7-1. 모든 활동 기록 가져오기 (누적 주차 계산용 - 활동이 있는 주차 = 성공)
    const { data: allActivityRecords } = await supabaseAdmin
      .from('activity_records')
      .select('user_id, week_id')
      .in('user_id', Array.from(userIds))
      .eq('is_completed', true);

    // 8. 활동 타입 정보 가져오기 (cluster_id 포함)
    const { data: activityTypes } = await supabaseAdmin
      .from('activity_types')
      .select('id, line_code, cluster_id');

    // 활동 타입 ID -> 정보 매핑
    // weekly_activities.activity_type_id는 activity_types.id와 동일 (line_code 형식의 문자열)
    const competencyTypeIds: string[] = [];
    const experienceTypeIds: string[] = [];
    const careerTypeIds: string[] = [];

    (activityTypes || []).forEach(at => {
      if (at.cluster_id === 'practical_competency') competencyTypeIds.push(at.id);
      else if (at.cluster_id === 'practical_experience') experienceTypeIds.push(at.id);
      else if (at.cluster_id === 'practical_career') careerTypeIds.push(at.id);
    });

    // 9. 해당 주차의 열린 활동 가져오기 (weekly_activities)
    const { data: weeklyActivities } = await supabaseAdmin
      .from('weekly_activities')
      .select('id, activity_type_id, is_active')
      .eq('week_id', weekId)
      .eq('is_active', true);

    const activeActivities = weeklyActivities || [];

    // 디버그 로그
    console.log('[Ranking API] activeActivities:', activeActivities.length, activeActivities.map(a => a.activity_type_id));
    console.log('[Ranking API] infoTypeIds:', infoTypeIds);
    console.log('[Ranking API] competencyTypeIds:', competencyTypeIds);
    console.log('[Ranking API] experienceTypeIds:', experienceTypeIds);
    console.log('[Ranking API] careerTypeIds:', careerTypeIds);
    console.log('[Ranking API] activityRecords count:', (activityRecords || []).length);
    console.log('[Ranking API] allGrowthData count:', (allGrowthData || []).length);

    // 역할 라벨 매핑
    const roleLabels: { [key: string]: string } = {
      'crew_regular': '일반',
      'part_leader': '심화(파트장)',
      'crew_agent': '심화(에이전트)',
      'crew_ambassador': '운영진(앰배서더)',
      'crew_team_leader': '운영진(팀장)',
    };

    // 9. 사용자별 데이터 집계
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rankings: any[] = [];
    const userIdArray = Array.from(userIds);

    for (const userId of userIdArray) {
      const profile = (profiles || []).find(p => p.id === userId);
      if (!profile) continue;

      // 포인트 계산
      const userPoints = (pointsData || []).filter(p => p.user_id === userId);
      const star = userPoints.filter(p => p.point_type === 'star').reduce((sum, p) => sum + p.points, 0);
      const lightning = userPoints.filter(p => p.point_type === 'lightning').reduce((sum, p) => sum + p.points, 0);
      const shield = userPoints.filter(p => p.point_type === 'shield').reduce((sum, p) => sum + p.points, 0);

      // 성장 상태
      const weeklyGrowth = (weeklyGrowthData || []).find(wg => wg.user_id === userId);
      let growthStatus = '실패';
      if (weeklyGrowth) {
        if (weeklyGrowth.is_club_break) growthStatus = '휴식(공식)';
        else if (weeklyGrowth.is_resting) growthStatus = '휴식(개인)';
        else if (weeklyGrowth.is_success) growthStatus = '성공';
      }

      // 팀/파트 정보
      const weekStartDate = new Date(selectedWeek.startDate);
      const userTP = userTeamParts.find(utp => {
        if (utp.user_id !== userId) return false;
        const startDate = new Date(utp.joined_at);
        const endDate = utp.left_at ? new Date(utp.left_at) : null;
        return startDate <= weekStartDate && (!endDate || endDate >= weekStartDate);
      });
      const team = teams.find(t => t.id === userTP?.team_id);
      const part = parts.find(p => p.id === userTP?.part_id);

      // 역할 정보
      const userRole = (roleHistories || []).find(rh => {
        if (rh.user_id !== userId) return false;
        const startDate = new Date(rh.started_at);
        const endDate = rh.ended_at ? new Date(rh.ended_at) : null;
        return startDate <= weekStartDate && (!endDate || endDate >= weekStartDate);
      });
      const roleLabel = userRole ? (roleLabels[userRole.role] || userRole.role) : (profile.role ? roleLabels[profile.role] || profile.role : '일반');

      // 활동 강화율 계산 (cluster-4와 동일한 방식)
      // weekly_activities.activity_type_id는 activity_types.id와 동일 (예: 'calendar', 'essay', 'optional_unit' 등)
      const userCompletedActivities = (activityRecords || []).filter(ar => ar.user_id === userId);
      const completedTypeIds = new Set(userCompletedActivities.map(ar => ar.activity_type_id));

      // 열린 활동 수 (total) - weekly_activities에서 is_active=true인 것
      const infoTotal = activeActivities.filter(a => infoTypeIds.includes(a.activity_type_id)).length;
      const competencyTotal = activeActivities.filter(a => competencyTypeIds.includes(a.activity_type_id)).length;
      const experienceTotal = activeActivities.filter(a => experienceTypeIds.includes(a.activity_type_id)).length;
      const careerTotal = activeActivities.filter(a => careerTypeIds.includes(a.activity_type_id)).length;

      // 완료된 활동 수 (count) - activity_records에서 is_completed=true인 것
      const infoCount = activeActivities.filter(a =>
        infoTypeIds.includes(a.activity_type_id) && completedTypeIds.has(a.activity_type_id)
      ).length;
      const competencyCount = activeActivities.filter(a =>
        competencyTypeIds.includes(a.activity_type_id) && completedTypeIds.has(a.activity_type_id)
      ).length;
      const experienceCount = activeActivities.filter(a =>
        experienceTypeIds.includes(a.activity_type_id) && completedTypeIds.has(a.activity_type_id)
      ).length;
      const careerCount = activeActivities.filter(a =>
        careerTypeIds.includes(a.activity_type_id) && completedTypeIds.has(a.activity_type_id)
      ).length;

      const totalActivities = infoTotal + competencyTotal + experienceTotal + careerTotal;
      const completedActivities = infoCount + competencyCount + experienceCount + careerCount;

      // 디버그: 첫 번째 사용자의 데이터 로그
      if (userId === userIdArray[0]) {
        console.log('[Ranking API] First user stats:', {
          userId,
          displayName: profile.display_name,
          infoTotal, infoCount,
          competencyTotal, competencyCount,
          experienceTotal, experienceCount,
          careerTotal, careerCount,
          totalActivities, completedActivities,
          completedTypeIds: Array.from(completedTypeIds)
        });
      }

      // 해당 주차까지의 누적 성공 주차 수 계산 (활동 기록 기반 + 온보딩 주차)
      // cluster-4-card와 동일한 방식: activity_records에서 활동이 있는 주차 = 성공
      const selectedWeekEndDate = weekEndDateMap.get(weekId) || selectedWeek.endDate;

      // 해당 사용자의 활동이 있는 주차 ID 목록
      const userActivityWeekIds = new Set(
        (allActivityRecords || [])
          .filter(ar => ar.user_id === userId)
          .map(ar => ar.week_id)
      );

      // 해당 주차까지의 모든 주차 중 활동이 있는 주차 수 계산
      let cumulativeApprovedWeeks = 0;
      weekEndDateMap.forEach((wEndDate, wId) => {
        if (wEndDate <= selectedWeekEndDate && userActivityWeekIds.has(wId)) {
          cumulativeApprovedWeeks++;
        }
      });

      // 온보딩 주차 추가 (온보딩 주차가 activity_records에 없더라도 성공으로 카운트)
      const userOnboardingWeekId = userOnboardingWeekMap.get(userId);
      if (userOnboardingWeekId) {
        const onboardingEndDate = weekEndDateMap.get(userOnboardingWeekId);
        // 온보딩 주차가 선택된 주차 이전이고, 아직 카운트되지 않았으면 추가
        if (onboardingEndDate && onboardingEndDate <= selectedWeekEndDate && !userActivityWeekIds.has(userOnboardingWeekId)) {
          cumulativeApprovedWeeks++;
        }
      }

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
        injeolmi: shield - lightning,
        growthStatus,
        cumulativeApprovedWeeks,
        growthRate: {
          total: totalActivities,
          count: completedActivities,
          rate: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
        },
        infoRate: { total: infoTotal, count: infoCount, rate: infoTotal > 0 ? Math.round((infoCount / infoTotal) * 100) : 0 },
        competencyRate: { total: competencyTotal, count: competencyCount, rate: competencyTotal > 0 ? Math.round((competencyCount / competencyTotal) * 100) : 0 },
        experienceRate: { total: experienceTotal, count: experienceCount, rate: experienceTotal > 0 ? Math.round((experienceCount / experienceTotal) * 100) : 0 },
        careerRate: { total: careerTotal, count: careerCount, rate: careerTotal > 0 ? Math.round((careerCount / careerTotal) * 100) : 0 }
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
