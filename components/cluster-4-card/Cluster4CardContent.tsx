"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Cluster4CardContentProps {
  weekId: string;
}

// DB에서 가져온 주차 데이터 타입
interface DBWeekData {
  id: string;
  weekNumber: number;
  seasonYear: number;
  seasonName: string;
  startDate: string;
  endDate: string;
  isClubBreak: boolean;
  holidayName: string | null;
  growthStatus: string;
}

interface SelectedColleague {
  id: number;
  name: string;
  gender: string;
  age: number;
  profileImg: string;
  university: string;
  major: string;
  team: string;
  part: string;
  nickname: string;
  rank: number;
  message: string;
}

const Cluster4CardContent = ({ weekId }: Cluster4CardContentProps) => {
  // 세션 및 본인 프로필 여부 확인
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get('userId');
  const isOwner = !urlUserId || (session?.user?.id === urlUserId);

  // DB에서 가져온 주차 데이터 상태
  const [weekData, setWeekData] = useState<DBWeekData | null>(null);
  const [isLoadingWeek, setIsLoadingWeek] = useState(true);

  // 팀/파트/역할/포인트 데이터 상태
  const [teamName, setTeamName] = useState<string | null>(null);
  const [partName, setPartName] = useState<string | null>(null);
  const [generation, setGeneration] = useState<number | null>(null);
  const [managedTeamName, setManagedTeamName] = useState<string | null>(null);
  const [roleLabel, setRoleLabel] = useState<string | null>(null);
  const [weekPoints, setWeekPoints] = useState<{ star: number; lightning: number; shield: number }>({ star: 0, lightning: 0, shield: 0 });
  const [cumulativeInjeolmi, setCumulativeInjeolmi] = useState<number>(0);
  const [cumulativeApprovedWeeks, setCumulativeApprovedWeeks] = useState<number>(0);

  // 이전/다음 주차 ID
  const [prevWeekId, setPrevWeekId] = useState<string | null>(null);
  const [nextWeekId, setNextWeekId] = useState<string | null>(null);

  // 현재 유저 ID (저장 시 사용)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 주간 활동 데이터 (실무정보 모달용)
  interface WeeklyActivity {
    id: string;
    activity_type_id: string;
    title: string | null;
    is_active: boolean;
    opened_at: string | null;  // 개설 시각 (48시간 이내에만 2차 정보 작성 가능)
    output_links: OutputLink[] | null;  // 운영진이 입력한 output links
  }
  const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivity[]>([]);

  // 유저 활동 데이터 (강화 성공 집계용)
  interface UserActivity {
    id: string;
    weekly_activity_id: string;
    status: string;
    activity_type_id?: string;
  }
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  // 파트별 강화 집계 (P: 열린 총 활동 수, R: 강화 성공 수)
  interface PracticalStats {
    total: number;  // P
    success: number; // R
  }
  const [infoStats, setInfoStats] = useState<PracticalStats>({ total: 0, success: 0 });
  const [competencyStats, setCompetencyStats] = useState<PracticalStats>({ total: 0, success: 0 });
  const [experienceStats, setExperienceStats] = useState<PracticalStats>({ total: 0, success: 0 });
  const [careerStats, setCareerStats] = useState<PracticalStats>({ total: 0, success: 0 });

  // 강화 상태 판단용 (해당 주차 데이터)
  interface ActivityRecord { week_id: string; activity_type_id: string; is_completed: boolean; }
  const [weekActivityRecords, setWeekActivityRecords] = useState<ActivityRecord[]>([]);
  const [weekApprovedTypes, setWeekApprovedTypes] = useState<Set<string>>(new Set());

  // 2차 정보 (서브타이틀, 아웃풋링크) - 해당 주차 데이터
  interface OutputLink { desc: string; url: string; }
  interface ActivityDetail {
    week_id: string;
    activity_type_id: string;
    sub_title: string | null;
    output_links: OutputLink[] | null;
  }
  const [weekActivityDetails, setWeekActivityDetails] = useState<ActivityDetail[]>([]);

  // 활동별 평점 (activity_type_id → points)
  const [activityRatings, setActivityRatings] = useState<Map<string, number>>(new Map());

  // DB에서 가져온 activity_types 정보
  interface ActivityTypeInfo {
    id: string;
    name: string;
    line_code: string;
    cluster_id: string;
    description: string | null;
  }
  const [activityTypesMap, setActivityTypesMap] = useState<Map<string, ActivityTypeInfo>>(new Map());
  const [competencyTypeIds, setCompetencyTypeIds] = useState<string[]>([]);
  const [experienceTypeIds, setExperienceTypeIds] = useState<string[]>([]);
  const [careerTypeIds, setCareerTypeIds] = useState<string[]>([]);

  // 모달 편집 상태 (activity_type_id별로 관리)
  const [editingDetails, setEditingDetails] = useState<{
    [activityType: string]: {
      subTitle: string;
      outputLinks: OutputLink[];
    };
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  // activity_type_id별 파트 분류 (기본값 - DB에서 가져온 후 업데이트됨)
  const infoTypes = ['calendar', 'essay', 'forum', 'infodesk', 'session', 'wisdom', 'etc_a'];
  // competencyTypes, experienceTypes, careerTypes는 이제 state로 관리됨

  // 역할 라벨 매핑
  const roleLabels: { [key: string]: string } = {
    'crew_regular': '일반',
    'part_leader': '심화(파트장)',
    'crew_partleader': '심화(파트장)',
    'crew_agent': '심화(에이전트)',
    'operations_ambassador': '운영진(앰배서더)',
    'operations_teamleader': '운영진(팀장)',
    'operations_clubleader': '운영진(클럽장)',
  };

  // 실무 역량 아이콘 매핑 (activity_type_id → 이미지 파일명)
  const competencyIconMap: { [key: string]: string } = {
    'contents_series_understanding': '실무 역량 - [콘텐츠]시리즈_이해.png',
    'contents_series_planning': '실무 역량 - [콘텐츠]시리즈_기획.png',
    'contents_series_production': '실무 역량 - [콘텐츠]시리즈_제작.png',
    'contents_series_publish': '실무 역량 - [콘텐츠]시리즈_발행.png',
    'contents_viral_marketing': '실무 역량 - [콘텐츠] 바이럴 마케팅.png',
    'job_contents_marketing': '실무 역량 - [Job]콘텐츠 마케팅.png',
    'job_performance_marketing': '실무 역량 - [Job]퍼포먼스 마케팅.png',
    'job_branding_marketing': '실무 역량 - [Job]브랜딩 마케팅.png',
    'practical_info_inhouse_agency': '실무 역량 - [실무 Info]인하우스 & 에이전시.png',
    'practical_info_marketing_terms': '실무 역량 - [실무 Info]마케팅 용어 & 개념.png',
    'practical_resource_iboss': '실무 역량 - 아이보스.png',
    'work_resource_openads': '실무 역량 - 오픈애즈.png',
    'work_resource_free_choice': '실무 역량 - [Reference]자유 선택.png',
    'practical_skill_google': '실무 역량 - 구글.png',
    'practical_skill_listly': '실무 역량 - 리스틀리.png',
    'practical_skill_kakao': '실무 역량 - 카카오.png',
    'practical_skill_naver': '실무 역량 - 네이버.png',
    'reference_instagram': '실무 역량 - 인스타그램.png',
    'reference_naver': '실무 역량 - 네이버.png',
    'reference_free_choice': '실무 역량 - [Reference]자유 선택.png',
    'practical_planning_online_marketing': '실무 역량 - [실무 기획] 온라인 마케팅.png',
  };

  // 실무 역량 아이콘 경로 가져오기 헬퍼 함수
  const getCompetencyIconPath = (activityTypeId: string): string => {
    const fileName = competencyIconMap[activityTypeId];
    if (fileName) {
      return `/images/0/cluster 4/icon/실무 역량/${fileName}`;
    }
    return '/images/0/cluster 4/icon/실무 역량/실무 역량 - default.png';
  };

  // 실무 경험 아이콘 매핑 (activity_type_id → 이미지 파일명)
  const experienceIconMap: { [key: string]: string } = {
    'career_marketer_launch': '실무 경험 - [커리어]마케터 Launch.png',
    'productivity_feedback': '실무 경험 - [생산성]상호 피드백.png',
    'contents_marketing_practical': '실무 경험 - [콘텐츠]마케팅 실무.png',
    'performance_marketing_practical': '실무 경험 - [퍼포먼스]마케팅 실무.png',
  };

  // 실무 경험 아이콘 경로 가져오기 헬퍼 함수
  const getExperienceIconPath = (activityTypeId: string): string => {
    const fileName = experienceIconMap[activityTypeId];
    if (fileName) {
      return `/images/0/cluster 4/icon/실무 경험/${fileName}`;
    }
    return '/images/0/cluster 4/icon/실무 경험/실무 경험 - default.png';
  };

  // 시즌 이름 변환 맵
  const seasonNameMap: { [key: string]: string } = {
    'spring': '봄',
    'summer': '여름',
    'fall': '가을',
    'winter': '겨울'
  };

  // 날짜 포맷 함수 (2026-01-05 → 2026 - 01 - 05 (월))
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayOfWeek = days[date.getDay()];
    return `${year} - ${month} - ${day} (${dayOfWeek})`;
  };

  // DB에서 주차 데이터 및 관련 정보 가져오기
  useEffect(() => {
    const fetchWeekData = async () => {
      if (!weekId) return;

      console.log('[DEBUG] fetchWeekData started for weekId:', weekId);

      // 상태 리셋
      setPrevWeekId(null);
      setNextWeekId(null);

      try {
        setIsLoadingWeek(true);

        // 0. activity_types 정보 가져오기 (클러스터별 분류용)
        const { data: activityTypesData } = await supabase
          .from('activity_types')
          .select('id, name, line_code, cluster_id, description')
          .eq('is_active', true);

        // 변수를 if 블록 밖에 선언해서 나중에 사용 가능하게 함
        const typesMap = new Map<string, ActivityTypeInfo>();
        const competencyIds: string[] = [];
        const experienceIds: string[] = [];
        const careerIds: string[] = [];

        if (activityTypesData) {
          activityTypesData.forEach((at) => {
            typesMap.set(at.id, at);
            if (at.cluster_id === 'practical_competency') {
              competencyIds.push(at.id);
            } else if (at.cluster_id === 'practical_experience') {
              experienceIds.push(at.id);
            } else if (at.cluster_id === 'practical_career') {
              careerIds.push(at.id);
            }
          });

          setActivityTypesMap(typesMap);
          setCompetencyTypeIds(competencyIds);
          setExperienceTypeIds(experienceIds);
          setCareerTypeIds(careerIds);
        }

        // 1. 현재 주차 정보 가져오기
        const { data: currentWeek, error: weekError } = await supabase
          .from('weeks')
          .select('id, week_number, start_date, end_date, is_club_break, holiday_name, seasons (id, year, name)')
          .eq('id', weekId)
          .single();

        if (weekError) throw weekError;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const seasonData = currentWeek.seasons as any;
        const rawSeasonName = seasonData?.name || '';
        const seasonName = seasonNameMap[rawSeasonName] || rawSeasonName;

        // 2. 현재 유저 정보 가져오기
        const response = await fetch('/api/profile');
        const profileResult = await response.json();

        if (!response.ok || !profileResult.data?.id) {
          console.error('Failed to fetch profile');
          return;
        }

        const userId = profileResult.data.id;
        setCurrentUserId(userId);  // 저장 시 사용하기 위해 state에 저장
        const apiActivityWeekIds = profileResult.activityWeekIds || [];
        const apiRestWeekIds = profileResult.restWeekIds || [];
        const apiApprovedActivities = profileResult.approvedActivities || [];
        const apiActivityRecords = profileResult.activityRecords || [];
        const apiActivityDetails = profileResult.activityDetails || [];
        const apiActivityPoints = profileResult.activityPoints || [];

        // 성장 상태 결정 (user_weekly_growth 테이블에서 조회)
        let growthStatus = '실패';
        const { data: weeklyGrowth, error: weeklyGrowthError } = await supabase
          .from('user_weekly_growth')
          .select('is_success, is_resting, is_club_break, failure_reason')
          .eq('user_id', userId)
          .eq('week_id', weekId)
          .maybeSingle();

        console.log('[DEBUG] weeklyGrowth query:', { userId, weekId, weeklyGrowth, error: weeklyGrowthError });

        if (weeklyGrowth) {
          // user_weekly_growth 테이블에 데이터가 있으면 해당 데이터 사용
          if (weeklyGrowth.is_club_break) {
            growthStatus = '휴식(공식)';
          } else if (weeklyGrowth.is_resting) {
            growthStatus = '휴식(개인)';
          } else if (weeklyGrowth.is_success) {
            growthStatus = '성공';
          } else {
            growthStatus = '실패';
          }
        } else {
          // user_weekly_growth 테이블에 데이터가 없으면 기존 로직으로 폴백
          if (currentWeek.is_club_break) {
            growthStatus = '휴식(공식)';
          } else if (apiRestWeekIds.includes(currentWeek.id)) {
            growthStatus = '휴식(개인)';
          } else if (apiActivityWeekIds.includes(currentWeek.id)) {
            growthStatus = '성공';
          }
        }

        console.log('[DEBUG] final growthStatus:', growthStatus, 'weeklyGrowth exists:', !!weeklyGrowth);

        setWeekData({
          id: currentWeek.id,
          weekNumber: currentWeek.week_number,
          seasonYear: seasonData?.year || 0,
          seasonName,
          startDate: currentWeek.start_date,
          endDate: currentWeek.end_date,
          isClubBreak: currentWeek.is_club_break || false,
          holidayName: currentWeek.holiday_name,
          growthStatus
        });

        // 3. 팀/파트 정보 가져오기
        const { data: userTeamPart } = await supabase
          .from('user_team_parts')
          .select('team_id, part_id, generation, managed_team_id')
          .eq('user_id', userId)
          .lte('joined_at', currentWeek.start_date)
          .or(`left_at.is.null,left_at.gte.${currentWeek.start_date}`)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (userTeamPart) {
          // 기수 설정
          setGeneration(userTeamPart.generation || null);

          // 팀 이름 가져오기
          if (userTeamPart.team_id) {
            const { data: team } = await supabase
              .from('teams')
              .select('name')
              .eq('id', userTeamPart.team_id)
              .single();
            setTeamName(team?.name || null);
          }
          // 파트 이름 가져오기
          if (userTeamPart.part_id) {
            const { data: part } = await supabase
              .from('parts')
              .select('name')
              .eq('id', userTeamPart.part_id)
              .single();
            setPartName(part?.name || null);
          }
          // 담당 팀 이름 가져오기 (팀장인 경우)
          if (userTeamPart.managed_team_id) {
            const { data: managedTeam } = await supabase
              .from('teams')
              .select('name')
              .eq('id', userTeamPart.managed_team_id)
              .single();
            setManagedTeamName(managedTeam?.name || null);
          }
        }

        // 4. 역할 정보 가져오기
        // 1순위: user_role_history 테이블에서 해당 날짜에 맞는 역할
        // 2순위: user_profiles.role 기본값
        const { data: userRole } = await supabase
          .from('user_role_history')
          .select('role')
          .eq('user_id', userId)
          .lte('started_at', currentWeek.start_date)
          .or(`ended_at.is.null,ended_at.gte.${currentWeek.start_date}`)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (userRole) {
          setRoleLabel(roleLabels[userRole.role] || userRole.role);
        } else if (profileResult.data?.role) {
          // 역할 이력이 없으면 user_profiles.role 기본값 사용
          setRoleLabel(roleLabels[profileResult.data.role] || profileResult.data.role);
        }

        // 5. 포인트 정보 가져오기 (해당 주차)
        const { data: points } = await supabase
          .from('points')
          .select('point_type, points')
          .eq('user_id', userId)
          .eq('week_id', weekId);

        if (points) {
          const star = points.filter(p => p.point_type === 'star').reduce((sum, p) => sum + p.points, 0);
          const lightning = points.filter(p => p.point_type === 'lightning').reduce((sum, p) => sum + p.points, 0);
          const shield = points.filter(p => p.point_type === 'shield').reduce((sum, p) => sum + p.points, 0);
          setWeekPoints({ star, lightning, shield });
        }

        // 6. 누적 인절미 계산 (해당 주차 종료일까지)
        const { data: allWeeksUntilCurrent } = await supabase
          .from('weeks')
          .select('id')
          .lte('end_date', currentWeek.end_date);

        if (allWeeksUntilCurrent) {
          const weekIds = allWeeksUntilCurrent.map(w => w.id);
          const { data: allPoints } = await supabase
            .from('points')
            .select('point_type, points')
            .eq('user_id', userId)
            .in('week_id', weekIds);

          if (allPoints) {
            const totalShield = allPoints.filter(p => p.point_type === 'shield').reduce((sum, p) => sum + p.points, 0);
            const totalLightning = allPoints.filter(p => p.point_type === 'lightning').reduce((sum, p) => sum + p.points, 0);
            setCumulativeInjeolmi(totalShield - totalLightning);
          }
        }

        // 7. 누적 성공 주차 수 계산
        if (allWeeksUntilCurrent) {
          const weekIds = allWeeksUntilCurrent.map(w => w.id);
          const approvedCount = weekIds.filter(wId => apiActivityWeekIds.includes(wId)).length;
          setCumulativeApprovedWeeks(approvedCount);
        }

        // 8. 이전/다음 주차 ID 가져오기
        const today = new Date().toISOString().split('T')[0];
        const userStartDate = profileResult.growthInfo?.startDate || '1900-01-01';

        // 사용자의 모든 주차 가져오기 (시즌 정보 포함)
        const { data: allUserWeeks, error: weeksError } = await supabase
          .from('weeks')
          .select('id, start_date, season_id, seasons(name)')
          .order('start_date', { ascending: false });

        console.log('[DEBUG] allUserWeeks query result:', allUserWeeks?.length, 'error:', weeksError);

        if (allUserWeeks && allUserWeeks.length > 0) {
          // 클라이언트에서 날짜 필터링 + break 시즌 제외
          const filteredWeeks = allUserWeeks.filter(w => {
            const seasonName = (w.seasons as any)?.name || '';
            const isBreakSeason = seasonName.toLowerCase().includes('break');
            return w.start_date >= userStartDate && w.start_date <= today && !isBreakSeason;
          });

          console.log('[DEBUG] filteredWeeks:', filteredWeeks.length, 'userStartDate:', userStartDate, 'today:', today);

          const currentIndex = filteredWeeks.findIndex(w => w.id === weekId);
          console.log('[DEBUG] currentIndex:', currentIndex, 'weekId:', weekId);

          if (currentIndex !== -1) {
            // 내림차순 정렬이므로: index-1 = 더 최근(다음), index+1 = 더 과거(이전)
            if (currentIndex > 0) {
              setNextWeekId(filteredWeeks[currentIndex - 1].id);
              console.log('[DEBUG] setNextWeekId:', filteredWeeks[currentIndex - 1].id);
            }
            if (currentIndex < filteredWeeks.length - 1) {
              setPrevWeekId(filteredWeeks[currentIndex + 1].id);
              console.log('[DEBUG] setPrevWeekId:', filteredWeeks[currentIndex + 1].id);
            }
          }
        }

        // 9. 주간 활동 데이터 가져오기 (실무정보 모달용) - output_links, opened_at 포함 (운영진 입력)
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('weekly_activities')
          .select('id, activity_type_id, title, is_active, opened_at, output_links')
          .eq('week_id', weekId);

        if (activitiesError) {
          console.error('주간 활동 데이터 로드 오류:', activitiesError);
        } else if (activitiesData) {
          setWeeklyActivities(activitiesData);
          console.log('[DEBUG] weeklyActivities loaded:', activitiesData.length);

          // 11. 파트별 강화 집계 계산
          // activity_type_id별 파트 분류 (DB에서 가져온 데이터 사용)
          const infoTypesList = ['calendar', 'essay', 'forum', 'infodesk', 'session', 'wisdom', 'etc_a'];
          const competencyTypesList = competencyIds.length > 0 ? competencyIds : [];
          const experienceTypesList = experienceIds.length > 0 ? experienceIds : [];
          const careerTypesList = careerIds.length > 0 ? careerIds : ['practical_project'];

          // P (열린 총 활동 수): is_active=true인 weekly_activities
          const activeActivities = activitiesData.filter(a => a.is_active);
          console.log('[DEBUG] activeActivities:', activeActivities.length, activeActivities.map(a => a.activity_type_id));

          // 10. 유저 활동 데이터 (profile API에서 가져온 데이터 활용 - RLS 우회)
          // 해당 주차의 approved activity_type_id 목록 추출
          const weekApprovedActivities = apiApprovedActivities.filter(
            (a: { week_id: string; activity_type_id: string }) => a.week_id === weekId
          );
          console.log('[DEBUG] weekApprovedActivities:', weekApprovedActivities.length, weekApprovedActivities);

          const approvedActivityTypes = new Set<string>(
            weekApprovedActivities.map((a: { activity_type_id: string }) => a.activity_type_id)
          );
          console.log('[DEBUG] approvedActivityTypes:', Array.from(approvedActivityTypes));

          // 11. 강화 상태 판단용 데이터 설정
          // 해당 주차의 activity_records 필터링
          const filteredActivityRecords = apiActivityRecords.filter(
            (ar: { week_id: string }) => ar.week_id === weekId
          );
          console.log('[DEBUG] weekActivityRecords:', filteredActivityRecords.length, filteredActivityRecords);
          setWeekActivityRecords(filteredActivityRecords);
          setWeekApprovedTypes(approvedActivityTypes);

          // 12. 2차 정보 (서브타이틀, 아웃풋링크) 필터링
          const filteredActivityDetails = apiActivityDetails.filter(
            (ad: { week_id: string }) => ad.week_id === weekId
          );
          console.log('[DEBUG] weekActivityDetails:', filteredActivityDetails.length, filteredActivityDetails);
          setWeekActivityDetails(filteredActivityDetails);

          // 13. 평점 매핑 (activity_records.id → points → activity_type_id)
          const ratingsMap = new Map<string, number>();
          filteredActivityRecords.forEach((ar: { id: string; activity_type_id: string }) => {
            const pointData = apiActivityPoints.find((p: { activity_id: string }) => p.activity_id === ar.id);
            if (pointData) {
              ratingsMap.set(ar.activity_type_id, pointData.points);
            }
          });
          console.log('[DEBUG] activityRatings:', ratingsMap);
          setActivityRatings(ratingsMap);

          // 각 파트별 집계 (2차 정보 기입 OR 48시간 경과 시 success로 카운트)
          const calcStats = (types: string[]) => {
            const total = activeActivities.filter(a => types.includes(a.activity_type_id)).length;
            const now = Date.now();
            const deadline = 48 * 60 * 60 * 1000; // 48시간 (밀리초)

            const success = activeActivities.filter(a => {
              if (!types.includes(a.activity_type_id)) return false;
              if (!approvedActivityTypes.has(a.activity_type_id)) return false; // is_completed = true 필요

              // 2차 정보 확인
              const detail = filteredActivityDetails.find(
                (d: { activity_type_id: string }) => d.activity_type_id === a.activity_type_id
              );
              const hasSecondaryInfo = detail && (
                (detail.sub_title && detail.sub_title.trim() !== '') ||
                (detail.output_links && detail.output_links.some((link: { url?: string }) => link?.url && link.url.trim() !== ''))
              );

              // 2차 정보가 있으면 바로 success
              if (hasSecondaryInfo) return true;

              // 48시간 경과 확인
              if (a.opened_at) {
                const openedTime = new Date(a.opened_at).getTime();
                const elapsed = now - openedTime;
                if (elapsed >= deadline) return true;
              }

              return false;
            }).length;

            return { total, success };
          };

          setInfoStats(calcStats(infoTypesList));
          setCompetencyStats(calcStats(competencyTypesList));
          setExperienceStats(calcStats(experienceTypesList));
          setCareerStats(calcStats(careerTypesList));

          console.log('[DEBUG] Stats calculated - info:', calcStats(infoTypesList),
            'competency:', calcStats(competencyTypesList),
            'experience:', calcStats(experienceTypesList),
            'career:', calcStats(careerTypesList));
        }

      } catch (error) {
        console.error('주차 데이터 로드 오류:', error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    fetchWeekData();
  }, [weekId]);

  // 모달 상태 관리
  const [workInfoModalOpen, setWorkInfoModalOpen] = useState(false);
  const [workAbilityModalOpen, setWorkAbilityModalOpen] = useState(false);
  const [workExpModalOpen, setWorkExpModalOpen] = useState(false);
  const [workCareerModalOpen, setWorkCareerModalOpen] = useState(false);

  // 상단 섹션 선택 모달 상태
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [headerModalOpen, setHeaderModalOpen] = useState(false);
  const [headerModalType, setHeaderModalType] = useState<'본인' | '타크루' | null>(null);

  // 연계 동료 선택 상태 (1st, 2nd, 3rd 각각 별도 저장)
  const [selectedColleagues, setSelectedColleagues] = useState<SelectedColleague[]>([
    {
      id: 7,
      name: "윤서영",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 5.jpg",
      university: "중앙대",
      major: "영화학과",
      team: "엔터테인먼트",
      part: "로봇",
      nickname: "영상편집마스터",
      rank: 1,
      message: "",
    },
    {
      id: 10,
      name: "오승우",
      gender: "남",
      age: 25,
      profileImg: "/images/0/crew profile/남 8.webp",
      university: "건국대",
      major: "미디어콘텐츠학과",
      team: "미디어",
      part: "AI",
      nickname: "아이디어뱅크",
      rank: 2,
      message: "",
    },
  ]);

  // 크루 검색어 상태
  const [crewSearchQuery, setCrewSearchQuery] = useState("");

  // 타크루 모달 상태 (주차 평판 카드 편집)
  const [selectedCrewForReputation, setSelectedCrewForReputation] = useState<number | null>(null);
  const [reputationEditData, setReputationEditData] = useState<{
    rating: number;
    content: string;
    keyword: string;
  }>({ rating: 0, content: "", keyword: "" });
  const [otherCrewSearchQuery, setOtherCrewSearchQuery] = useState("");

  // 주차 평판 카드 상세보기 모달 상태
  const [reputationViewModalOpen, setReputationViewModalOpen] = useState(false);
  const [selectedReputationCard, setSelectedReputationCard] = useState<any>(null);

  // 연계 동료 카드 상세보기 모달 상태
  const [colleagueViewModalOpen, setColleagueViewModalOpen] = useState(false);
  const [selectedColleagueCard, setSelectedColleagueCard] = useState<any>(null);
  const [selectedColleagueIndex, setSelectedColleagueIndex] = useState<number>(0);

  // 실무 정보 카드 상세보기 모달 상태
  const [workInfoViewModalOpen, setWorkInfoViewModalOpen] = useState(false);
  const [selectedWorkInfoCard, setSelectedWorkInfoCard] = useState<any>(null);

  // 실무 역량 카드 상세보기 모달 상태
  const [workAbilityViewModalOpen, setWorkAbilityViewModalOpen] = useState(false);

  // 실무 경험 카드 상세보기 모달 상태
  const [workExpViewModalOpen, setWorkExpViewModalOpen] = useState(false);
  const [selectedWorkExpCard, setSelectedWorkExpCard] = useState<any>(null);

  // 실무 경력 카드 상세보기 모달 상태
  const [workCareerViewModalOpen, setWorkCareerViewModalOpen] = useState(false);
  const [selectedWorkCareerCard, setSelectedWorkCareerCard] = useState<any>(null);

  // 동료 삭제 함수
  const removeColleague = (id: number) => {
    setSelectedColleagues(prev => prev.filter(c => c.id !== id));
  };

  // 동료 추가 함수 (순위 지정)
  const addColleague = (user: typeof allCrewData[0], rank: number) => {
    if (selectedColleagues.length >= 3) return;
    if (selectedColleagues.find(c => c.id === user.id)) return;
    // 해당 순위가 이미 사용중인지 확인
    if (selectedColleagues.find(c => c.rank === rank)) return;

    const newColleague = { ...user, message: "", rank };
    const newList = [...selectedColleagues, newColleague];

    // rank 순서대로 정렬
    newList.sort((a, b) => a.rank - b.rank);

    setSelectedColleagues(newList);
  };

  // 메시지 업데이트 함수
  const updateColleagueMessage = (id: number, message: string) => {
    setSelectedColleagues(prev => prev.map(c =>
      c.id === id ? { ...c, message } : c
    ));
  };

  // 타크루 선택 함수 (주차 평판 편집용)
  const selectCrewForReputation = (crewId: number) => {
    const crew = reputationData.find(u => u.id === crewId);
    if (crew && !crew.isEmpty) {
      setSelectedCrewForReputation(crewId);
      setReputationEditData({
        rating: crew.rating,
        content: crew.description,
        keyword: crew.tagText.replace('#', ''),
      });
    }
  };

  // 타크루 편집 뒤로가기
  const backToCrewList = () => {
    setSelectedCrewForReputation(null);
    setReputationEditData({ rating: 0, content: "", keyword: "" });
  };

  // 서브 타이틀 글자수 관리
  const [subTitleText, setSubTitleText] = useState("");

  // 기본값 설정
  const restImage = "/images/0/cluster%204/주차%20이미지/휴식(개인,공식).png";

  // 휴식 모드 체크 (휴식(개인), 휴식(공식)일 때 모든 카드 비활성화)
  const isRestMode = weekData?.growthStatus?.includes('휴식') || false;

  // 시즌명과 주차번호로 월/주차 계산하여 이미지 경로 생성
  const getWeekImagePath = (data: DBWeekData) => {
    // 시즌별 시작 월 매핑
    const seasonStartMonth: { [key: string]: number } = {
      '겨울': 1,  // 1월
      '봄': 3,    // 3월
      '여름': 7,  // 7월
      '가을': 9   // 9월
    };

    const startMonth = seasonStartMonth[data.seasonName] || 1;
    const monthOffset = Math.floor((data.weekNumber - 1) / 4);
    const month = startMonth + monthOffset;
    const weekOfMonth = ((data.weekNumber - 1) % 4) + 1;

    // 공휴일이 있는 경우 파일명에 추가
    const holidaySuffix = data.holidayName ? ` ${data.holidayName}` : '';

    // 파일명 형식: "겨울 1주차 (1월 1주차).png" 또는 "겨울 6주차 (2월 2주차 설,구정).png"
    return `/images/0/cluster 4/주차 이미지/${data.seasonName} ${data.weekNumber}주차 (${month}월 ${weekOfMonth}주차${holidaySuffix}).png`;
  };

  // 휴식 모드일 때는 휴식 전용 이미지 사용, 아닐 때는 시즌/주차에 맞는 이미지
  const currentImage = isRestMode
    ? restImage
    : weekData
      ? getWeekImagePath(weekData)
      : "/images/0/cluster 4/주차 이미지/겨울 1주차 (1월 1주차).png";
  const currentTitle = weekData
    ? `${weekData.seasonYear} ${weekData.seasonName} 시즌, ${weekData.weekNumber}주차`
    : "로딩 중...";

  // 날짜 포맷팅 함수 (2025 - 01 - 06 (월) 형식)
  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${year} - ${month} - ${day} (${dayName})`;
  };

  // 주차 기간 문자열 생성
  const weekDateRange = weekData
    ? `${formatDateWithDay(weekData.startDate)} ~ ${formatDateWithDay(weekData.endDate)}`
    : '날짜 로딩 중...';

  // 성장 상태에 따른 뱃지 정보
  const getStatusBadgeInfo = (status: string | undefined) => {
    switch (status) {
      case '성공':
        return {
          className: 'success',
          text: '성장(성공)',
          icon: '/images/0/cluster 4/icon/icon - 성장(성공).png'
        };
      case '실패':
        return {
          className: 'fail',
          text: '성장(실패)',
          icon: '/images/0/cluster 4/icon/icon - 성장(실패).png'
        };
      case '휴식(개인)':
        return {
          className: 'rest-personal',
          text: '휴식(개인)',
          icon: '/images/0/cluster 4/icon/icon - 휴식(개인).png'
        };
      case '휴식(공식)':
        return {
          className: 'rest-official',
          text: '휴식(공식)',
          icon: '/images/0/cluster 4/icon/icon - 휴식(공식).png'
        };
      default:
        return {
          className: 'success',
          text: '성장(성공)',
          icon: '/images/0/cluster 4/icon/icon - 성장(성공).png'
        };
    }
  };

  const statusBadgeInfo = getStatusBadgeInfo(weekData?.growthStatus);

  // 태그 색상 배열
  const tagColors = ['tag--pink', 'tag--red', 'tag--yellow', 'tag--purple', 'tag--green', 'tag--cyan', 'tag--mint', 'tag--dark'];

  // 주차 평판 데이터
  const reputationData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 3.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 3.5,
      ratingCount: "7 / 10",
      description: "팀 프로젝트에서 항상 적극적으로 참여하고 아이디어를 제시해주셔서 정말 감사했습니다. 덕분에 좋은 결과물을 만들 수 있었어요. 앞으로도 함께 일하고 싶은 동료입니다.",
      fm: 325,
      tagColor: 'tag--mint',
      tagText: '#추진력추진력추',
    },
    {
      id: 2,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/남 5.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 4.5,
      ratingCount: "9 / 10",
      description: "리더십이 뛰어나고 팀원들을 잘 이끌어주셨습니다. 어려운 상황에서도 침착하게 문제를 해결하는 모습이 인상적이었어요. 배울 점이 정말 많은 분이십니다.",
      fm: 325,
      tagColor: 'tag--purple',
      tagText: '#리더십리더십리',
    },
    {
      id: 3,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 7.webp",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 2.5,
      ratingCount: "5 / 10",
      description: "창의적인 아이디어로 프로젝트에 새로운 방향을 제시해주셨습니다. 독특한 시각으로 문제를 바라보는 능력이 탁월해요. 함께 브레인스토밍하면 좋은 결과가 나옵니다.",
      fm: 325,
      tagColor: 'tag--yellow',
      tagText: '#창의력창의력창',
    },
    {
      id: 4,
      name: "-",
      gender: "",
      age: "",
      profileImg: "",
      university: "",
      major: "",
      team: "",
      part: "",
      nickname: "",
      rating: 0,
      ratingCount: "- / 10",
      description: "-",
      fm: "-",
      tagColor: 'tag--dark',
      tagText: '-',
      isEmpty: true,
    },
  ];

  // 크루 검색용 더미 데이터
  const allCrewData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 3.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
    },
    {
      id: 2,
      name: "이준혁",
      gender: "남",
      age: 26,
      profileImg: "/images/0/crew profile/남 2.jpg",
      university: "연세대",
      major: "경영학과",
      team: "미디어",
      part: "브랜드",
      nickname: "마케팅마스터",
    },
    {
      id: 3,
      name: "박소연",
      gender: "여",
      age: 23,
      profileImg: "/images/0/crew profile/여 1.jpg",
      university: "고려대",
      major: "심리학과",
      team: "콘텐츠",
      part: "스타일",
      nickname: "콘텐츠퀸",
    },
    {
      id: 4,
      name: "정민수",
      gender: "남",
      age: 27,
      profileImg: "/images/0/crew profile/남 4.jpg",
      university: "성균관대",
      major: "컴퓨터공학",
      team: "헬스케어",
      part: "AI",
      nickname: "코딩천재개발자",
    },
    {
      id: 5,
      name: "최유진",
      gender: "여",
      age: 25,
      profileImg: "/images/0/crew profile/여 6.jpg",
      university: "이화여대",
      major: "디자인학부",
      team: "스타일",
      part: "브랜드",
      nickname: "디자인요정",
    },
    {
      id: 6,
      name: "강동현",
      gender: "남",
      age: 28,
      profileImg: "/images/0/crew profile/남 7.jpg",
      university: "한양대",
      major: "광고홍보학과",
      team: "라이프",
      part: "자동차",
      nickname: "광고의신",
    },
    {
      id: 7,
      name: "윤서영",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 5.jpg",
      university: "중앙대",
      major: "영화학과",
      team: "엔터테인먼트",
      part: "로봇",
      nickname: "영상편집마스터",
    },
    {
      id: 8,
      name: "임재현",
      gender: "남",
      age: 26,
      profileImg: "/images/0/crew profile/남 5.jpg",
      university: "서강대",
      major: "경제학과",
      team: "푸드",
      part: "디저트",
      nickname: "전략가임재현",
    },
    {
      id: 9,
      name: "한지민",
      gender: "여",
      age: 23,
      profileImg: "/images/0/crew profile/여 7.webp",
      university: "숙명여대",
      major: "언론정보학부",
      team: "콘텐츠",
      part: "내돈내산",
      nickname: "소통의달인",
    },
    {
      id: 10,
      name: "오승우",
      gender: "남",
      age: 25,
      profileImg: "/images/0/crew profile/남 8.webp",
      university: "건국대",
      major: "미디어콘텐츠학과",
      team: "미디어",
      part: "AI",
      nickname: "아이디어뱅크",
    },
    {
      id: 11,
      name: "김하늘",
      gender: "여",
      age: 22,
      profileImg: "/images/0/crew profile/여 2.jpg",
      university: "동국대",
      major: "광고홍보학과",
      team: "스타일",
      part: "스타일",
      nickname: "카피라이터하늘",
    },
    {
      id: 12,
      name: "신동욱",
      gender: "남",
      age: 27,
      profileImg: "/images/0/crew profile/남 3.jpg",
      university: "홍익대",
      major: "시각디자인과",
      team: "헬스케어",
      part: "로봇",
      nickname: "UX디자이너",
    },
  ];

  // 검색 필터링된 크루 목록 (이름과 닉네임으로만 검색)
  const filteredCrewData = allCrewData.filter(user => {
    if (!crewSearchQuery) return true;
    const query = crewSearchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.nickname.toLowerCase().includes(query)
    );
  }).filter(user => !selectedColleagues.find(c => c.id === user.id));

  // 연계 동료 데이터
  const colleagueData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 5.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "2025 - 12 - 22 (월)",
      message: "프로젝트에서 많은 도움을 주셔서 정말 감사합니다. 덕분에 성장할 수 있었어요! 앞으로도 함께 좋은 결과물 만들어가요. 항상 응원하겠습니다. 파이팅!일이삼사오육칠팔구십",
    },
    {
      id: 2,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/남 8.webp",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "2025 - 12 - 22 (월)",
      message: "항상 응원해주시고 조언해주셔서 감사합니다. 앞으로도 잘 부탁드려요! 함께 성장하며 멋진 프로젝트 완성해봐요. 최고의 파트너입니다!일이삼사오육칠팔구십 최고의 파트너입니다!!!!!!!",
    },
    {
      id: 3,
      name: "-",
      gender: "-",
      age: "-",
      profileImg: "",
      university: "-",
      major: "-",
      team: "-",
      part: "-",
      nickname: "-",
      date: "0000 - 00 - 00 (일)",
      message: "",
      isEmpty: true,
    },
  ];

  // 실무 정보 activity_type_id → UI 매핑
  const activityTypeConfig: { [key: string]: { category: string; tagColor: string; icon: string; isFruit: boolean } } = {
    'wisdom': { category: '위즈덤', tagColor: 'tag--red', icon: '/images/0/cluster 4/icon/실무 정보/실무 정보 - 위즈덤.png', isFruit: true },
    'essay': { category: '에세이', tagColor: 'tag--yellow', icon: '/images/0/cluster 4/icon/실무 정보/실무 정보 - 에세이.png', isFruit: true },
    'infodesk': { category: '인포데스크', tagColor: 'tag--purple', icon: '/images/0/cluster 4/icon/실무 정보/실무 정보 - 인포데스크.png', isFruit: true },
    'calendar': { category: '캘린더', tagColor: 'tag--dark', icon: '/images/0/cluster 4/icon/실무 정보/실무 정보 - 캘린더.png', isFruit: true },
    'forum': { category: '포럼', tagColor: 'tag--green', icon: '/images/0/cluster 4/icon/실무 정보/실무 정보 - 포럼.png', isFruit: true },
    'session': { category: '세션', tagColor: 'tag--cyan', icon: '/images/0/cluster 4/icon/실무 정보/실무 정보 - 세션.png', isFruit: true },
    'etc_a': { category: '기타a', tagColor: 'tag--mint', icon: '/images/0/cluster 4/icon/실무 정보/실무 정보 - 기타a.png', isFruit: false },
  };

  // 실무 정보에 해당하는 activity types
  const workInfoActivityTypes = ['wisdom', 'essay', 'infodesk', 'calendar', 'forum', 'session', 'etc_a'];
  // 실무 역량 activity types - DB에서 가져온 practical_competency 클러스터
  const workAbilityActivityTypes = competencyTypeIds;
  // 실무 경험 activity types - DB에서 가져온 practical_experience 클러스터
  const workExpActivityTypes = experienceTypeIds;
  // 실무 경력 activity types - DB에서 가져온 practical_career 클러스터
  const workCareerActivityTypes = careerTypeIds.length > 0 ? careerTypeIds : ['practical_project'];
  // 전체 activity types (2차 정보 저장용)
  const allActivityTypes = [...workInfoActivityTypes, ...workAbilityActivityTypes, ...workExpActivityTypes, ...workCareerActivityTypes];

  // 실무 역량: 유저가 완료한 활동 찾기 (is_completed = true인 것 중 첫 번째)
  const findFirstCompletedAbilityActivity = () => {
    for (const actType of workAbilityActivityTypes) {
      const activity = weeklyActivities.find(a => a.activity_type_id === actType && a.is_active);
      const record = weekActivityRecords.find(ar => ar.activity_type_id === actType);
      if (activity && record?.is_completed) return activity;
    }
    return null;
  };

  // 실무 역량: 첫 번째 개설된 활동 찾기 헬퍼
  const findFirstAbilityActivity = () => {
    for (const actType of workAbilityActivityTypes) {
      const activity = weeklyActivities.find(a => a.activity_type_id === actType && a.is_active);
      if (activity) return activity;
    }
    return null;
  };

  // 실무 역량: 첫 번째 존재하는 활동 타입 ID 가져오기
  const getFirstAbilityActivityType = (): string => {
    const activity = findFirstAbilityActivity();
    return activity?.activity_type_id || (workAbilityActivityTypes[0] || '');
  };

  // activity_type 정보 가져오기 헬퍼
  const getActivityTypeInfo = (activityTypeId: string): ActivityTypeInfo | undefined => {
    return activityTypesMap.get(activityTypeId);
  };

  // 강화 상태 판단 함수 (2차 정보 기입 OR 48시간 기준)
  // - 해당 없음: weekly_activities.is_active = false (활동 미개설)
  // - 강화 실패: 활동 개설됨 + 카페 댓글 집계에서 이행하지 않음 (is_completed = false)
  // - 강화 대기: 활동 개설됨 + 이행함 (is_completed = true) + 48시간 미경과 + 2차 정보 미기입
  // - 강화 성공: 활동 개설됨 + 이행함 (is_completed = true) + (48시간 경과 OR 2차 정보 기입)
  type EnhancementStatus = 'success' | 'waiting' | 'failed' | 'not_applicable';
  const getEnhancementStatus = (activityType: string): EnhancementStatus => {
    // 해당 활동 정보 가져오기
    const activity = weeklyActivities.find(a => a.activity_type_id === activityType);

    // 1. 해당 없음: 활동이 개설되지 않음
    if (!activity?.is_active) return 'not_applicable';

    // 2. activity_records에서 해당 activity_type의 이행 여부 확인
    const record = weekActivityRecords.find(ar => ar.activity_type_id === activityType);

    if (!record || !record.is_completed) {
      // 레코드 없거나 is_completed = false → 강화 실패
      return 'failed';
    }

    // 3. is_completed = true인 경우, 2차 정보 기입 여부 확인
    const detail = weekActivityDetails.find(d => d.activity_type_id === activityType);
    const hasSecondaryInfo = detail && (
      (detail.sub_title && detail.sub_title.trim() !== '') ||
      (detail.output_links && detail.output_links.some((link: { url?: string }) => link?.url && link.url.trim() !== ''))
    );

    // 2차 정보가 기입되어 있으면 바로 강화 성공
    if (hasSecondaryInfo) {
      return 'success';
    }

    // 4. 2차 정보 미기입 시, 48시간 경과 여부 확인
    const openedAt = activity.opened_at;
    if (!openedAt) {
      // 개설 시각이 없으면 대기 상태로 처리
      console.log(`[getEnhancementStatus] ${activityType}: no opened_at -> waiting`);
      return 'waiting';
    }

    const openedTime = new Date(openedAt).getTime();
    const now = Date.now();
    const elapsed = now - openedTime;
    const deadline = 48 * 60 * 60 * 1000; // 48시간 (밀리초)
    const hoursElapsed = Math.floor(elapsed / (60 * 60 * 1000));

    console.log(`[getEnhancementStatus] ${activityType}: openedAt=${openedAt}, elapsed=${hoursElapsed}h, deadline=48h, result=${elapsed >= deadline ? 'success' : 'waiting'}`);

    if (elapsed >= deadline) {
      // 48시간 경과 → 강화 성공 (2차 정보 없이도 자동 성공)
      return 'success';
    } else {
      // 48시간 미경과 + 2차 정보 미기입 → 강화 대기
      return 'waiting';
    }
  };

  // 강화 상태별 아이콘
  const enhancementStatusIcons: { [key in EnhancementStatus]: string } = {
    'success': '/images/0/cluster 4/icon/5 강화 성공.png',
    'waiting': '/images/0/cluster 4/icon/6 강화 대기.png',
    'failed': '/images/0/cluster 4/icon/7 강화 실패.png',
    'not_applicable': '/images/0/cluster 4/icon/8 해당 없음.png',
  };

  // 특정 activity_type의 2차 정보 가져오기
  const getActivityDetail = (activityType: string) => {
    return weekActivityDetails.find(ad => ad.activity_type_id === activityType);
  };

  // 48시간 이내인지 확인
  const isWithin48Hours = (openedAt: string | null): boolean => {
    if (!openedAt) return false;
    const openedTime = new Date(openedAt).getTime();
    const now = Date.now();
    const elapsed = now - openedTime;
    const deadline = 48 * 60 * 60 * 1000; // 48시간 (밀리초)
    return elapsed < deadline;
  };

  // 활동이 개설되었고 48시간 이내인지 확인 (운영진이 개설해야만 + 48시간 이내에만 사용자가 2차 정보 입력 가능)
  const isActivityActive = (activityType: string): boolean => {
    const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
    if (!activity?.is_active) return false;
    // 48시간 이내인지 확인
    return isWithin48Hours(activity.opened_at);
  };

  // 활동이 개설되었지만 48시간이 지났는지 확인 (마감 표시용)
  const isActivityExpired = (activityType: string): boolean => {
    const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
    if (!activity?.is_active) return false;
    // 개설은 되었지만 48시간이 지남
    return !isWithin48Hours(activity.opened_at);
  };

  // 실무 역량: 아무 activity type이나 개설되었는지 확인
  const isAnyAbilityActivityActive = (): boolean => {
    return workAbilityActivityTypes.some(actType => isActivityActive(actType));
  };

  // 실무 역량: 모든 activity type이 만료되었는지 확인
  const isAnyAbilityActivityExpired = (): boolean => {
    return workAbilityActivityTypes.some(actType => isActivityExpired(actType));
  };

  // 실무 역량: 첫 번째 활성화된 activity type ID 가져오기 (모달/저장용)
  const getActiveAbilityActivityType = (): string => {
    const activeType = workAbilityActivityTypes.find(actType => isActivityActive(actType));
    if (activeType) return activeType;
    // 활성화된 것이 없으면 개설된 것(만료 포함) 찾기
    const openedType = workAbilityActivityTypes.find(actType => {
      const activity = weeklyActivities.find(a => a.activity_type_id === actType);
      return activity?.is_active;
    });
    return openedType || workAbilityActivityTypes[0];
  };

  // 남은 시간 계산 (표시용)
  const getRemainingTime = (activityType: string): { hours: number; minutes: number } | null => {
    const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
    if (!activity?.is_active || !activity.opened_at) return null;

    const openedTime = new Date(activity.opened_at).getTime();
    const now = Date.now();
    const elapsed = now - openedTime;
    const deadline = 48 * 60 * 60 * 1000;
    const remaining = deadline - elapsed;

    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return { hours, minutes };
  };

  // 특정 activity types 중 하나라도 개설되었는지 확인
  const isAnyActivityActive = (activityTypes: string[]): boolean => {
    return activityTypes.some(type => isActivityActive(type));
  };

  // 빈 output links 배열 생성 헬퍼
  const createEmptyOutputLinks = (): OutputLink[] => {
    return [0, 1, 2, 3, 4].map(() => ({ desc: '', url: '' }));
  };

  // URL에 프로토콜이 없으면 https:// 추가
  const ensureProtocol = (url: string): string => {
    if (!url) return url;
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // 운영진이 입력한 output links 개수 가져오기
  const getAdminOutputLinksCount = (activityType: string): number => {
    const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
    return activity?.output_links?.filter(l => l.url?.trim())?.length || 0;
  };

  // 운영진이 입력한 output links 가져오기
  const getAdminOutputLinks = (activityType: string): OutputLink[] => {
    const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
    return activity?.output_links || [];
  };

  // 편집 모달 열 때 초기화
  const initializeEditingDetails = () => {
    const newEditingDetails: { [key: string]: { subTitle: string; outputLinks: OutputLink[] } } = {};

    // 모든 activity types에 대해 초기화 (실무 정보 + 실무 역량 + 실무 경험 + 실무 경력)
    allActivityTypes.forEach(activityType => {
      const detail = getActivityDetail(activityType);
      const adminLinks = getAdminOutputLinks(activityType);
      const userLinks = detail?.output_links || [];

      // 5개 슬롯 생성: 운영진 링크 → 사용자 링크 → 빈 슬롯
      const paddedLinks: OutputLink[] = [];
      const adminCount = adminLinks.filter(l => l.url?.trim()).length;

      for (let i = 0; i < 5; i++) {
        if (i < adminCount && adminLinks[i]?.url?.trim()) {
          // 운영진 링크 (수정 불가)
          paddedLinks.push({ ...adminLinks[i] });
        } else {
          // 사용자 링크 (수정 가능)
          const userLinkIndex = i - adminCount;
          if (userLinks[userLinkIndex]?.url?.trim()) {
            paddedLinks.push({ ...userLinks[userLinkIndex] });
          } else {
            paddedLinks.push({ desc: '', url: '' });
          }
        }
      }

      newEditingDetails[activityType] = {
        subTitle: detail?.sub_title || '',
        outputLinks: paddedLinks,
      };
    });

    setEditingDetails(newEditingDetails);
  };

  // 2차 정보 저장 (운영진 링크 제외, 사용자 링크만 저장)
  const saveActivityDetail = async (activityType: string) => {
    if (!currentUserId || !weekId) return;

    setIsSaving(true);
    try {
      const detail = editingDetails[activityType];
      if (!detail) return;

      // 운영진 링크 개수 확인
      const adminCount = getAdminOutputLinksCount(activityType);

      // 운영진 링크 이후의 사용자 링크만 필터링 (빈 링크 제외)
      const userLinks = detail.outputLinks.slice(adminCount).filter(link => link.url.trim() !== '');

      const response = await fetch('/api/activity-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          week_id: weekId,
          activity_type_id: activityType,
          sub_title: detail.subTitle || null,
          output_links: userLinks.length > 0 ? userLinks : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save activity detail:', error);
        alert('저장에 실패했습니다.');
        return;
      }

      console.log('[DEBUG] Activity detail saved for:', activityType);
    } catch (error) {
      console.error('Error saving activity detail:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 통계 재계산 함수 (저장 후 즉시 업데이트용)
  const recalculateStats = (updatedDetails: ActivityDetail[]) => {
    const activeActivities = weeklyActivities.filter(a => a.is_active);
    const now = Date.now();
    const deadline = 48 * 60 * 60 * 1000; // 48시간

    const calcStats = (types: string[]) => {
      const total = activeActivities.filter(a => types.includes(a.activity_type_id)).length;
      const success = activeActivities.filter(a => {
        if (!types.includes(a.activity_type_id)) return false;
        if (!weekApprovedTypes.has(a.activity_type_id)) return false;

        const detail = updatedDetails.find(d => d.activity_type_id === a.activity_type_id);
        const hasSecondaryInfo = detail && (
          (detail.sub_title && detail.sub_title.trim() !== '') ||
          (detail.output_links && detail.output_links.some((link: { url?: string }) => link?.url && link.url.trim() !== ''))
        );

        if (hasSecondaryInfo) return true;

        if (a.opened_at) {
          const openedTime = new Date(a.opened_at).getTime();
          const elapsed = now - openedTime;
          if (elapsed >= deadline) return true;
        }

        return false;
      }).length;

      return { total, success };
    };

    const infoTypes = ['calendar', 'essay', 'forum', 'infodesk', 'session', 'wisdom', 'etc_a'];
    setInfoStats(calcStats(infoTypes));
    setCompetencyStats(calcStats(competencyTypeIds));
    setExperienceStats(calcStats(experienceTypeIds));
    setCareerStats(calcStats(careerTypeIds));
  };

  // 저장 후 weekActivityDetails 상태 즉시 업데이트 (공통 함수)
  const updateWeekActivityDetailsAfterSave = (activityTypes: string[]) => {
    setWeekActivityDetails(prev => {
      const updatedDetails = [...prev];
      activityTypes.forEach(activityType => {
        const detail = editingDetails[activityType];
        const validLinks = detail?.outputLinks.filter(link => link.url.trim() !== '') || [];
        const newDetail = {
          week_id: weekId,
          activity_type_id: activityType,
          sub_title: detail?.subTitle || null,
          output_links: validLinks.length > 0 ? validLinks : null,
        };
        const existingIndex = updatedDetails.findIndex(d => d.activity_type_id === activityType);
        if (existingIndex >= 0) {
          updatedDetails[existingIndex] = newDetail;
        } else {
          updatedDetails.push(newDetail);
        }
      });

      // 통계 즉시 재계산
      recalculateStats(updatedDetails);

      return updatedDetails;
    });
  };

  // 모든 실무 정보 카드 저장
  const saveAllActivityDetails = async () => {
    setIsSaving(true);
    try {
      for (const activityType of workInfoActivityTypes) {
        await saveActivityDetail(activityType);
      }

      // 저장 후 weekActivityDetails 상태 즉시 업데이트
      updateWeekActivityDetailsAfterSave(workInfoActivityTypes);

      alert('저장되었습니다.');
      setWorkInfoModalOpen(false);
    } catch (error) {
      console.error('Error saving all activity details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 실무 정보 카드 데이터 (DB 데이터 기반 + 빈 카드 2개)
  const workInfoCards = [
    ...workInfoActivityTypes.map((activityType, index) => {
      const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
      const detail = weekActivityDetails.find(d => d.activity_type_id === activityType);
      const config = activityTypeConfig[activityType];
      const enhancementStatus = getEnhancementStatus(activityType);
      // DEBUG: 실무 정보 카드 데이터 확인
      console.log(`[workInfoCards] ${activityType}: title="${activity?.title}", status=${enhancementStatus}`);

      // Output Links 병합 (운영진 링크 + 사용자 링크)
      const adminLinks = activity?.output_links || [];
      const userLinks = detail?.output_links || [];
      const adminCount = adminLinks.filter((l: { url?: string }) => l.url?.trim()).length;
      const mergedOutputLinks: { desc: string; url: string }[] = [];
      for (let i = 0; i < 5; i++) {
        if (i < adminCount && adminLinks[i]?.url?.trim()) {
          // 운영진 링크
          mergedOutputLinks.push(adminLinks[i]);
        } else {
          // 사용자 링크 (운영진 링크 개수만큼 오프셋)
          const userLinkIndex = i - adminCount;
          if (userLinks[userLinkIndex]?.url?.trim()) {
            mergedOutputLinks.push(userLinks[userLinkIndex]);
          } else {
            mergedOutputLinks.push({ desc: '', url: '' });
          }
        }
      }

      return {
        id: index + 1,
        activityType,
        title: activity?.title || '-',  // 운영진이 입력한 Main Title (없으면 '-')
        subTitle: detail?.sub_title || '',
        verified: true,
        category: config?.category || activityType,
        tagColor: config?.tagColor || '',
        status: enhancementStatus,
        statusIcon: enhancementStatusIcons[enhancementStatus],
        icon: config?.icon || '',
        isFruit: config?.isFruit || false,
        isFailed: enhancementStatus === 'failed',
        isEmpty: false,
        outputLinks: mergedOutputLinks,
      };
    }),
    // 빈 카드 2개
    { id: 8, activityType: '', title: '', subTitle: '', verified: true, category: '', tagColor: '', status: 'not_applicable' as EnhancementStatus, statusIcon: '', icon: '', isFruit: false, isFailed: false, isEmpty: true, outputLinks: [] },
    { id: 9, activityType: '', title: '', subTitle: '', verified: true, category: '', tagColor: '', status: 'not_applicable' as EnhancementStatus, statusIcon: '', icon: '', isFruit: false, isFailed: false, isEmpty: true, outputLinks: [] },
  ];

  // 실무 경험 카드 데이터 (동적 생성)
  const workExpCards = workExpActivityTypes.map((activityTypeId, index) => {
    const activityType = activityTypesMap.get(activityTypeId);
    const activity = weeklyActivities.find(a => a.activity_type_id === activityTypeId);
    const detail = weekActivityDetails[activityTypeId];
    const enhStatus = getEnhancementStatus(activityTypeId);
    const hasActivity = !!activity;

    // 별점 계산 (points 테이블에서 가져온 평점 사용, 0~10 정수)
    const ratingScore = activityRatings.get(activityTypeId) || 0;
    const rating = ratingScore / 2; // 별 표시용 (0~5)

    return {
      id: index + 1,
      activityTypeId,
      code: activityType?.line_code || '-',
      badge: activityType?.name || '-',
      title: activity?.title || '-',
      verified: enhStatus === 'success',
      rating: rating,
      ratingCount: hasActivity ? `${ratingScore} / 10` : '- / 10',
      hasWeb: (detail?.output_links?.length || 0) > 0,
      icon: getExperienceIconPath(activityTypeId),
      isEmpty: !hasActivity,
      enhancementStatus: enhStatus,
    };
  });

  // 실무 경력 카드 데이터
  const workCareerCards = [
    { id: 1, code: "AA22-11111", badge: "마케팅|마이릿|축시 출시", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/배민.png", supervisorImg: "/images/0/crew profile/남 2.jpg", supervisorName: "이준혁", supervisorDept: "서비스기획팀", supervisorCompany: "우아한형제들", supervisorPosition: "대리", statusBadge: "/images/0/cluster 4/icon/5 강화 성공.png", grade: "S" },
    { id: 2, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/sm.webp", supervisorImg: "/images/0/crew profile/여 1.jpg", supervisorName: "김민지", supervisorDept: "마케팅팀", supervisorCompany: "네이버", supervisorPosition: "과장", statusBadge: "/images/0/cluster 4/icon/6 강화 대기.png", grade: "A" },
    { id: 3, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/Logo_tvN.svg.png", supervisorImg: "/images/0/crew profile/남 4.jpg", supervisorName: "박성호", supervisorDept: "전략기획팀", supervisorCompany: "카카오", supervisorPosition: "차장", statusBadge: "/images/0/cluster 4/icon/8 해당 없음.png", isNotApplicable: true, grade: "B" },
    { id: 4, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/naver%20webtoon.png", supervisorImg: "/images/0/cluster 4/4-1-card/조지 워싱턴.png", supervisorName: "조지 워싱턴", supervisorDept: "", supervisorCompany: "", supervisorPosition: "", statusBadge: "/images/0/cluster 4/icon/5 강화 성공.png", grade: "S" },
    { id: 5, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/CJ_logo.svg.png", supervisorImg: "/images/0/crew profile/남 7.jpg", supervisorName: "정재원", supervisorDept: "개발팀", supervisorCompany: "쿠팡", supervisorPosition: "사원", statusBadge: "/images/0/cluster 4/icon/8 해당 없음.png", isNotApplicable: true, grade: "C" },
    { id: 6, code: "", badge: "", title: "Main Title", verified: true, date: "0000 - 00 - 00 (월)", likes: "0.99", hasWeb: false, isEmpty: true, icon: "", supervisorImg: "", supervisorName: "", supervisorDept: "", supervisorCompany: "", supervisorPosition: "", statusBadge: "", grade: "" },
  ];

  // 별점 렌더링 함수 (반개 지원)
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // 채워진 별
        stars.push(
          <img
            key={i}
            src="/images/0/cluster 4/icon/icon - star.png"
            alt="star"
            className="star filled"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        // 반개 별
        stars.push(
          <span key={i} className="star half">
            <img src="/images/0/cluster 4/icon/icon - star.png" alt="star" className="star-half-filled" />
            <img src="/images/0/cluster 4/icon/icon - empty star.png" alt="star" className="star-half-empty" />
          </span>
        );
      } else {
        // 빈 별
        stars.push(
          <img
            key={i}
            src="/images/0/cluster 4/icon/icon - empty star.png"
            alt="star"
            className="star empty"
          />
        );
      }
    }
    return stars;
  };

  return (
    <div className="cluster4-card-content weekly-card-detail">
      {/* 탭 영역 */}
      <div className="top-tabs-wrapper">
        <div className="top-tabs">
          <Link href="/cluster-4" className="tab active">
            <img src="/images/0/cluster%204/icon/icon%20-%20%EC%A0%84%EA%B5%AC.png" alt="전구" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Weekly Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
          <Link href="/cluster-4-1" className="tab">
            <img src="/images/0/cluster%204/icon/icon%20-%20book.png" alt="book" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Season Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
        </div>
        {/* 디버그 정보 (개발 중 임시) */}
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>
          [DEBUG] weekId: {weekId} | prevWeekId: {prevWeekId || 'null'} | nextWeekId: {nextWeekId || 'null'}
        </div>
        <div className="nav-buttons">
          {prevWeekId ? (
            <Link href={`/cluster-4-card/${prevWeekId}`} className="nav-btn-prev">
              <span>이전 주</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20left.png" alt="left" className="arrow-icon" />
            </Link>
          ) : (
            <button className="nav-btn-prev disabled" disabled>
              <span>이전 주</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20left.png" alt="left" className="arrow-icon" />
            </button>
          )}
          {nextWeekId ? (
            <Link href={`/cluster-4-card/${nextWeekId}`} className="nav-btn-next">
              <span>다음 주</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20right.png" alt="right" className="arrow-icon" />
            </Link>
          ) : (
            <button className="nav-btn-next disabled" disabled>
              <span>다음 주</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20right.png" alt="right" className="arrow-icon" />
            </button>
          )}
          <Link href="/cluster-4" className="nav-btn-filled">
            <img src="/images/0/cluster%204/icon/icon%20-%201.png" alt="list" className="list-icon" />
            <span>전체 목록으로 돌아가기</span>
          </Link>
        </div>
      </div>

      {/* ========== 섹션 1: 주차 이미지 + 헤더 + 평판 + 동료 ========== */}
      <div className="section1-layout">
        {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => setSelectionModalOpen(true)} style={{ cursor: 'pointer' }}>
              <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
            </div>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
        )}
        {/* 왼쪽: 큰 주차 이미지 */}
        <div className="section1-left">
          <div className="main-image-container">
            <img src={currentImage} alt="주차 이미지" className="main-week-image" />
            {/* 뱃지 두 개 */}
            <div className="image-badges">
              <div className="badge-item heart-badge">
                <span className="badge-count">99</span>
                <i className="ti ti-heart"></i>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 정보 영역 */}
        <div className="section1-right">
          {/* 헤더 */}
          <div className="section1-header">
            <div className="header-title-row">
              <h1 className="section1-title">{currentTitle}</h1>
              <div className={`status-badge ${statusBadgeInfo.className}`}>
                <span>{statusBadgeInfo.text}</span>
                <img src={statusBadgeInfo.icon} alt={statusBadgeInfo.text} />
              </div>
            </div>
            <div className="header-info-row">
              <div className="info-badge date">
                <img src="/images/0/cluster 4/icon/icon - 6.png" alt="calendar" />
                <span>{weekData ? `${formatDate(weekData.startDate)} ~ ${formatDate(weekData.endDate)}` : '로딩 중...'}</span>
              </div>
              <div className="info-badge role">
                <img src="/images/0/cluster 4/icon/Interface/Star-3.png" alt="role" />
                <span>{roleLabel || '-'}</span>
              </div>
              <div className="info-badge week">
                <img src="/images/0/cluster 4/icon/icon - 7.png" alt="week" />
                <span><span className="highlight">{cumulativeApprovedWeeks}</span> / 30 주차</span>
              </div>
            </div>
            <div className="header-info-row2">
              <div className="info-group left">
                <span className="info-item team"><strong>[팀]</strong> <span className="text-gray">{
                  teamName === '운영진' && generation
                    ? `운영진(${generation}기)`
                    : (teamName || '-')
                }</span></span>
                <span className="info-divider">|</span>
                <span className="info-item part"><strong>[파트]</strong> <span className="text-gray">{
                  teamName === '운영진' && partName === '팀장' && managedTeamName
                    ? `팀장(${managedTeamName})`
                    : (partName || '-')
                }</span></span>
              </div>
              <div className="info-group right">
                <span className="info-item with-icon">
                  단감
                  <img src="/images/0/cluster 4/icon/icon - 단감.png" alt="단감" className="item-icon" />
                  <strong className="number-value">{weekPoints.star}</strong>
                  개
                </span>
                <span className="info-divider">·</span>
                <span className="info-item with-icon">
                  인절미
                  <img src="/images/0/cluster 4/icon/icon - 인절미.png" alt="인절미" className="item-icon" />
                  <strong className="number-value">{cumulativeInjeolmi}</strong>
                  개
                </span>
                <span className="info-divider">·</span>
                <span className="info-item with-icon">
                  어흥
                  <img src="/images/0/cluster 4/icon/icon - 어흥.png" alt="어흥" className="item-icon" />
                  <strong className="number-value">{weekPoints.lightning > 0 ? `-${weekPoints.lightning}` : weekPoints.lightning}</strong>
                  개
                </span>
              </div>
            </div>
          </div>

          {/* 주차 평판 */}
          <div className="reputation-section">
            <div className="section-title-row">
              <img src="/images/0/cluster 4/icon/icon - 주차 평판.png" alt="주차 평판" className="section-icon" />
              <span className="section-label">주차 평판</span>
              <span className="section-count"><span className="count-num">3</span>/3</span>
            </div>
            <div className="reputation-cards-grid">
              {reputationData.map((user, index) => {
                const isEmpty = user.isEmpty || isRestMode;
                return (
                <div
                  key={user.id}
                  className={`reputation-card ${isEmpty ? 'empty' : ''}`}
                  onClick={() => {
                    if (!isEmpty) {
                      setSelectedReputationCard(user);
                      setReputationViewModalOpen(true);
                    }
                  }}
                  style={{ cursor: isEmpty ? 'default' : 'pointer' }}
                >
                  <div className="card-profile">
                    <div className="profile-image">
                      {!isEmpty && user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}
                    </div>
                    <div className="profile-info">
                      <div className="profile-name"><span className="text">{isEmpty ? '-' : user.name}</span>{!isEmpty && <> | <span className="text">{user.gender}</span> | <span className="text">{user.age}</span></>}</div>
                      <div className="profile-details">
                        {isEmpty ? (
                          <>
                            <div className="detail-line"><span className="text">-</span></div>
                            <div className="detail-line"><span className="text">&nbsp;</span></div>
                            <div className="detail-line"><span className="text">&nbsp;</span></div>
                          </>
                        ) : (
                          <>
                            <div className="detail-line"><span className="text">{user.university}</span><span className="label">학교</span> | <span className="text">{user.major}</span><span className="label">학과</span></div>
                            <div className="detail-line"><span className="text">{user.team}</span><span className="label">팀</span> | <span className="text">{user.part}</span><span className="label">파트</span></div>
                            <div className="detail-line"><span className="nickname">{user.nickname}</span></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <div className="card-rating">
                    <div className="stars">{renderStars(isEmpty ? 0 : user.rating)}</div>
                    <span className="rating-count">{isEmpty ? '- / 10' : user.ratingCount}</span>
                  </div>
                  <div className="card-description">{isEmpty ? '-' : <>{user.description.slice(0, 20)}... <img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="more-icon" /></>}</div>
                  <div className="card-footer">
                    <span className="fm-badge"><img src="/images/0/cluster 4/icon - wifi.png" alt="wifi" className="wifi-icon" /> FM : {isEmpty ? '-' : user.fm}</span>
                    <span className="footer-divider">|</span>
                    <span className={`tag ${isEmpty ? 'tag--dark' : user.tagColor}`}>{isEmpty ? '-' : user.tagText}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* 연계 동료 */}
          <div className="colleague-section">
            <div className="section-title-row">
              <img src="/images/0/cluster 4/icon/icon - 연계 동료.png" alt="연계 동료" className="section-icon" />
              <span className="section-label">연계 동료</span>
              <span className="section-count"><span className="count-num">2</span>/3</span>
            </div>
            <div className="colleague-cards">
              {colleagueData.map((user, index) => {
                const isEmpty = user.isEmpty || isRestMode;
                return (
                <div
                  key={user.id}
                  className={`colleague-card ${isEmpty ? 'empty' : ''}`}
                  onClick={() => {
                    if (!isEmpty) {
                      setSelectedColleagueCard(user);
                      setSelectedColleagueIndex(index);
                      setColleagueViewModalOpen(true);
                    }
                  }}
                  style={{ cursor: isEmpty ? 'default' : 'pointer' }}
                >
                  <div className="card-profile">
                    <div className="profile-image">
                      {!isEmpty && user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}
                    </div>
                    <div className="profile-info">
                      <div className="profile-name-row">
                        <div className="profile-name"><span className="text">{isEmpty ? '-' : user.name}</span>{!isEmpty && <> | <span className="text">{user.gender}</span> | <span className="text">{user.age}</span></>}</div>
                        <div className="date-view">
                          <span className="date">{isEmpty ? '0000 - 00 - 00 (일)' : user.date}</span>
                          <img src="/images/0/cluster 4/icon/icon - 7 - eye.png" alt="view" className="view-icon" />
                        </div>
                      </div>
                      <div className="profile-details">
                        {isEmpty ? (
                          <span className="text">-</span>
                        ) : (
                          <><span className="text">{user.university}</span><span className="label">학교</span> | <span className="text">{user.major}</span><span className="label">학과</span> | <span className="text">{user.team}</span><span className="label">팀</span> | <span className="text">{user.part}</span><span className="label">파트</span> | <span className="nickname">{user.nickname}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========== 섹션 2: 주차 성장률 + 실무 정보 + 실무 역량 ========== */}
      <div className="section2-layout">
        {/* 주차 성장률 */}
        <div className="growth-rate-header">
          <div className="growth-left">
            <div className="progress-header">
              <span className="growth-title">주차 성장률</span>
              <span className="growth-count"><img src="/images/0/cluster 4/icon/icon - 0 - 3star.png" alt="star" className="star-icon" /> 총 {infoStats.total + competencyStats.total + experienceStats.total + careerStats.total} 개 중 <span className="highlight">{infoStats.success + competencyStats.success + experienceStats.success + careerStats.success}</span>개</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${(infoStats.total + competencyStats.total + experienceStats.total + careerStats.total) > 0 ? Math.round(((infoStats.success + competencyStats.success + experienceStats.success + careerStats.success) / (infoStats.total + competencyStats.total + experienceStats.total + careerStats.total)) * 100) : 0}%` }}></div>
            </div>
          </div>
          <div className="growth-center">
            <span className="progress-percent"><span className="number">{(infoStats.total + competencyStats.total + experienceStats.total + careerStats.total) > 0 ? Math.round(((infoStats.success + competencyStats.success + experienceStats.success + careerStats.success) / (infoStats.total + competencyStats.total + experienceStats.total + careerStats.total)) * 100) : 0}</span><span className="percent">%</span></span>
          </div>
          <div className="growth-right">
            <span className="growth-label">라인별 강화 결과</span>
            <div className="legend-items">
              <span className="legend-item"><img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" className="legend-icon" />강화 성공</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화 대기" className="legend-icon" />강화 대기</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화 실패" className="legend-icon" />강화 실패</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/8 해당 없음.png" alt="해당 없음" className="legend-icon glow" />해당 없음</span>
            </div>
          </div>
        </div>

        {/* 실무 정보 */}
        <div className="work-info-section">
          {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => {
                initializeEditingDetails();
                setWorkInfoModalOpen(true);
              }} style={{ cursor: 'pointer' }}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          )}
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/1 실무 정보.png" alt="실무 정보" className="section-icon" />
              <span className="section-name">실무 정보</span>
              <span className="section-count">총 {infoStats.total}개 중 <span className="highlight">{infoStats.success}</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value"><span className="highlight">{infoStats.total > 0 ? Math.round((infoStats.success / infoStats.total) * 100) : 0}</span>%</span>
            </div>
          </div>
          <div className="work-info-cards">
            {workInfoCards.map((card) => {
              const isEmpty = card.isEmpty || isRestMode;
              return (
              <div
                key={card.id}
                className={`work-info-card ${isEmpty ? 'empty' : ''}`}
                onClick={() => {
                  if (!isEmpty) {
                    setSelectedWorkInfoCard(card);
                    setWorkInfoViewModalOpen(true);
                  }
                }}
                style={{ cursor: isEmpty ? 'default' : 'pointer' }}
              >
                <div className="card-content-area">
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">Main Title</span>
                    <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                    <span className="verified-text">Verified</span>
                    {!isEmpty && card.category && <span className={`tag ${card.tagColor}`}>{card.category}</span>}
                  </div>
                  <div className="card-body-row">
                    <div className={`card-icon-area ${!isEmpty && card.isFruit ? 'fruit' : ''} ${!isEmpty && card.isFailed ? 'failed' : ''}`}>
                      {!isEmpty && card.icon ? (
                        <img
                          src={card.icon}
                          alt={card.category}
                          style={{ opacity: (card.status === 'failed' || card.status === 'not_applicable') ? 0.3 : 1 }}
                        />
                      ) : (
                        <div className="icon-placeholder"></div>
                      )}
                      {!isEmpty && card.isFailed && (
                        <div className="failed-overlay">
                          <span className="failed-text">강화 실패</span>
                          <span className="failed-emoji">😿</span>
                        </div>
                      )}
                    </div>
                    <span className="card-desc">{isEmpty ? '-' : <>{card.title || '-'}<img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" /></>}</span>
                  </div>
                </div>
                {!isEmpty && card.status && card.statusIcon && (
                  <div className="status-badge">
                    <img src={card.statusIcon} alt={card.status} />
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* 실무 역량 */}
        <div className="work-ability-section">
          {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => {
                initializeEditingDetails();
                setWorkAbilityModalOpen(true);
              }} style={{ cursor: 'pointer' }}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          )}
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/2 실무 역량.png" alt="실무 역량" className="section-icon" />
              <span className="section-name">실무 역량</span>
              <span className="section-count">총 {competencyStats.total}개 중 <span className="highlight">{competencyStats.success}</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value"><span className="highlight">{competencyStats.total > 0 ? Math.round((competencyStats.success / competencyStats.total) * 100) : 0}</span>%</span>
            </div>
          </div>
          {(() => {
            // 유저가 완료한 활동 또는 개설된 활동 찾기
            const completedActivity = findFirstCompletedAbilityActivity();
            const openedActivity = findFirstAbilityActivity();
            const displayActivity = completedActivity || openedActivity;
            const activityTypeInfo = displayActivity ? getActivityTypeInfo(displayActivity.activity_type_id) : null;
            const enhancementStatus = displayActivity ? getEnhancementStatus(displayActivity.activity_type_id) : 'not_applicable';
            const hasActivity = !!displayActivity;

            return (
              <div
                className={`work-ability-card ${isRestMode || !hasActivity ? 'empty' : ''}`}
                onClick={() => {
                  if (!isRestMode && hasActivity) {
                    setWorkAbilityViewModalOpen(true);
                  }
                }}
                style={{ cursor: (isRestMode || !hasActivity) ? 'default' : 'pointer' }}
              >
                <div className={`card-icon-area ${enhancementStatus === 'failed' ? 'failed' : ''}`}>
                  {!isRestMode && hasActivity && displayActivity && (
                    <img
                      src={getCompetencyIconPath(displayActivity.activity_type_id)}
                      alt="실무 역량"
                      style={{ opacity: enhancementStatus === 'failed' ? 0.3 : 1 }}
                    />
                  )}
                  {(isRestMode || !hasActivity) && <div className="icon-placeholder"></div>}
                  {enhancementStatus === 'failed' && (
                    <div className="failed-overlay">
                      <span className="failed-text">강화 실패</span>
                      <span className="failed-emoji">😿</span>
                    </div>
                  )}
                </div>
                <div className="card-content-area">
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">Main Title</span>
                    {hasActivity && enhancementStatus === 'success' && (
                      <>
                        <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                        <span className="verified-text">Verified</span>
                      </>
                    )}
                    {!isRestMode && hasActivity && activityTypeInfo && (
                      <>
                        <span className="code-tag">{activityTypeInfo.line_code}</span>
                        <span className="info-tag">{activityTypeInfo.name}</span>
                      </>
                    )}
                  </div>
                  <p className="main-desc">{(isRestMode || !hasActivity) ? '-' : (displayActivity?.title || '-')}</p>
                  <div className="sub-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                    <span className="sub-label">Sub Title</span>
                  </div>
                  <span className="sub-desc">{(isRestMode || !hasActivity) ? '-' : <>{weekActivityDetails.find(d => d.activity_type_id === displayActivity?.activity_type_id)?.sub_title || '-'}<img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" /></>}</span>
                </div>
                {!isRestMode && hasActivity && (
                  <div className="status-badge">
                    {enhancementStatus === 'success' && <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" />}
                    {enhancementStatus === 'waiting' && <img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화 대기" />}
                    {enhancementStatus === 'failed' && <img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화 실패" />}
                    {enhancementStatus === 'not_applicable' && <img src="/images/0/cluster 4/icon/8 해당 없음.png" alt="해당 없음" />}
                  </div>
                )}
              </div>
            );
          })()}
          <div className="character-image">
            <img src="/images/0/cluster 4/bg img 2.png" alt="character" />
          </div>
        </div>
      </div>

      {/* ========== 섹션 3: 실무 경험 + 실무 경력 ========== */}
      <div className="section3-layout">
        {/* 실무 경험 */}
        <div className="work-exp-section">
          {/* 플로팅 아이콘 - 본인 프로필일 때만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => {
                if (!isAnyActivityActive(workExpActivityTypes)) {
                  alert('아직 개설되지 않은 활동입니다. 운영진이 활동을 개설한 후 편집할 수 있습니다.');
                  return;
                }
                initializeEditingDetails();
                setWorkExpModalOpen(true);
              }} style={{ cursor: 'pointer' }}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          )}
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/3 실무 경험.png" alt="실무 경험" className="section-icon" />
              <span className="section-name">실무 경험</span>
              <span className="section-count">총 {experienceStats.total}개 중 <span className="highlight">{experienceStats.success}</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value"><span className="highlight">{experienceStats.total > 0 ? Math.round((experienceStats.success / experienceStats.total) * 100) : 0}</span>%</span>
            </div>
          </div>
          <div className="work-exp-cards">
            {workExpCards.map((card, cardIndex) => {
              const isEmpty = card.isEmpty || isRestMode;
              const expActivityType = workExpActivityTypes[cardIndex];
              return (
              <div
                key={card.id}
                className={`work-exp-card ${isEmpty ? 'empty' : ''}`}
                onClick={() => {
                  if (!isEmpty) {
                    setSelectedWorkExpCard(card);
                    setWorkExpViewModalOpen(true);
                  }
                }}
                style={{ cursor: isEmpty ? 'default' : 'pointer' }}
              >
                <div className="card-top-row">
                  <div className="card-icon-area">
                    {!isEmpty && card.icon ? <img src={card.icon} alt={card.badge} /> : <div className="icon-placeholder"></div>}
                  </div>
                  <div className="card-header-area">
                    <div className="card-header-row">
                      <span className="code-tag">{isEmpty ? '-' : card.code}</span>
                      <span className="badge-tag">{isEmpty ? '-' : card.badge}</span>
                    </div>
                    <div className="card-rating-row">
                      <div className="stars">
                        {[1,2,3,4,5].map((star) => (
                          <img
                            key={star}
                            src={isEmpty || star > card.rating ? "/images/0/cluster 4/icon/icon - empty star.png" : "/images/0/cluster 4/icon/icon - star.png"}
                            alt="star"
                            className="star"
                          />
                        ))}
                      </div>
                      <span className="rating-count">{isEmpty ? '- / 10' : card.ratingCount}</span>
                    </div>
                  </div>
                </div>
                <div className="card-bottom-area">
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">Main Title</span>
                    {!isEmpty && card.verified && (
                      <>
                        <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                        <span className="verified-text">Verified</span>
                      </>
                    )}
                  </div>
                  <p className="main-desc">{isEmpty ? '-' : card.title}</p>
                  <div className="sub-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                    <span className="sub-label">Sub Title</span>
                  </div>
                  <span className="sub-desc">{isEmpty ? '-' : (weekActivityDetails[card.activityTypeId]?.sub_title || '-')}{!isEmpty && <img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" />}</span>
                </div>
                {!isEmpty && (
                  <div className={`status-badge ${card.enhancementStatus}`}>
                    {(() => {
                      const statusImages: Record<string, string> = {
                        'success': '/images/0/cluster 4/icon/5 강화 성공.png',
                        'waiting': '/images/0/cluster 4/icon/6 강화 대기.png',
                        'failed': '/images/0/cluster 4/icon/7 강화 실패.png',
                        'not_applicable': '/images/0/cluster 4/icon/8 해당 없음.png'
                      };
                      return <img src={statusImages[card.enhancementStatus] || statusImages['not_applicable']} alt="강화 상태" />;
                    })()}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* 실무 경력 */}
        <div className="work-career-section">
          {/* 플로팅 아이콘 - 본인 프로필일 때만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => {
                if (!isAnyActivityActive(workCareerActivityTypes)) {
                  alert('아직 개설되지 않은 활동입니다. 운영진이 활동을 개설한 후 편집할 수 있습니다.');
                  return;
                }
                initializeEditingDetails();
                setWorkCareerModalOpen(true);
              }} style={{ cursor: 'pointer' }}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          )}
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/4 실무 경력.png" alt="실무 경력" className="section-icon" />
              <span className="section-name">실무 경력</span>
              <span className="section-count">총 {careerStats.total}개 중 <span className="highlight">{careerStats.success}</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value"><span className="highlight">{careerStats.total > 0 ? Math.round((careerStats.success / careerStats.total) * 100) : 0}</span>%</span>
            </div>
          </div>
          <div className="work-career-cards">
            {workCareerCards.map((card, cardIndex) => {
              const isEmpty = card.isEmpty || isRestMode;
              const careerActivityType = workCareerActivityTypes[cardIndex];
              return (
              <div
                key={card.id}
                className={`work-career-card ${isEmpty ? 'empty' : ''} ${!isEmpty && card.isNotApplicable ? 'not-applicable' : ''}`}
                onClick={() => {
                  if (!isEmpty && !card.isNotApplicable) {
                    setSelectedWorkCareerCard(card);
                    setWorkCareerViewModalOpen(true);
                  }
                }}
                style={{ cursor: (isEmpty || card.isNotApplicable) ? 'default' : 'pointer' }}
              >
                {!isEmpty && card.isNotApplicable && <div className="card-overlay"></div>}
                <div className="card-top-row">
                  <div className="card-icon-area">
                    {!isEmpty && card.icon ? <img src={card.icon} alt={card.badge} /> : <div className="icon-placeholder"></div>}
                  </div>
                  <div className="card-header-area">
                    <div className="card-header-row">
                      <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                      <span className="verified-text">Verified</span>
                      <span className="code-tag">{isEmpty ? '-' : card.code}</span>
                    </div>
                    <div className="grade-row">
                      <span className={`grade ${!isEmpty && card.grade === 'S' ? 'active' : ''}`}>S</span>
                      <span className={`grade ${!isEmpty && card.grade === 'A' ? 'active' : ''}`}>A</span>
                      <span className={`grade ${!isEmpty && card.grade === 'B' ? 'active' : ''}`}>B</span>
                      <span className={`grade ${!isEmpty && card.grade === 'C' ? 'active' : ''}`}>C</span>
                      <span className={`grade ${!isEmpty && card.grade === 'D' ? 'active' : ''}`}>D</span>
                    </div>
                  </div>
                </div>
                <div className="card-bottom-area">
                  <p className="category-text">{isEmpty ? '-' : '마케팅(바이럴) 혹시 몰라'}</p>
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">Main Title</span>
                  </div>
                  <p className="main-desc-white">{isEmpty ? '-' : (weeklyActivities.find(a => a.activity_type_id === careerActivityType)?.title || '-')}</p>
                  <div className="sub-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                    <span className="sub-label">Sub Title</span>
                  </div>
                  <span className="sub-desc">{isEmpty ? '-' : (weekActivityDetails.find(d => d.activity_type_id === careerActivityType)?.sub_title || '-')}{!isEmpty && <img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" />}</span>
                  <div className="supervisor-section">
                    <span className="supervisor-label">실무 기업 감독자</span>
                    <div className="supervisor-info">
                      <div className="supervisor-profile">
                        <div className={`profile-avatar ${isEmpty ? 'empty' : ''}`}>
                          {!isEmpty && card.supervisorImg && <img src={card.supervisorImg} alt="supervisor" />}
                        </div>
                        <div className="profile-text">
                          <span className="supervised-text">Supervised by:</span>
                          <span className="profile-name">{isEmpty ? '-' : <><strong>{card.supervisorName}</strong>{card.supervisorDept && <> | {card.supervisorDept}</>}{card.supervisorCompany && <> | {card.supervisorCompany}</>}{card.supervisorPosition && <> | {card.supervisorPosition}</>}</>}</span>
                        </div>
                      </div>
                    </div>
                    <div className="profile-divider"></div>
                  </div>
                  <div className="card-footer-row">
                    <span className="current-bid">Current Bid</span>
                    <div className="date-view">
                      <span className="date">{isEmpty ? '0000-00-00 (일)' : card.date}</span>
                      <span className="check-badge">
                        <i className="ti ti-check"></i>
                      </span>
                    </div>
                    <span className="likes"><img src="/images/0/cluster%204/icon/icon%20-%209.png" alt="likes" className="likes-icon" />{isEmpty ? '0,99' : card.likes}</span>
                  </div>
                </div>
                {!isEmpty && card.statusBadge && (
                  <div className="status-badge">
                    <img src={card.statusBadge} alt="status" />
                    {card.isNotApplicable && <span className="not-applicable-text">해당 없음</span>}
                  </div>
                )}
              </div>
              );
            })}
          </div>
          <div className="section-bottom-divider"></div>
        </div>
      </div>

      {/* ========== 실무 정보 모달 ========== */}
      {workInfoModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkInfoModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>실무 정보 편집</h3>
            </div>
            <div className="section-modal-body">
              {workInfoCards.filter(card => !card.isEmpty).map((card, index) => (
                <div key={card.id} className="modal-card-item modal-card-workinfo">
                  {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                  <div className="modal-card-header-row">
                    <div className="modal-card-left">
                      <div className={`modal-fruit-icon ${card.isFruit ? 'fruit' : ''} ${card.isFailed ? 'failed' : ''}`}>
                        {card.icon && <img src={card.icon} alt={card.category} />}
                      </div>
                      <div className="modal-card-info">
                        <span className={`modal-card-tag ${card.tagColor}`}>{card.category}</span>
                      </div>
                    </div>
                    <div className="modal-header-right">
                      <div className="modal-status-badge">
                        {card.status === "success" && (
                          <>
                            <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화성공" />
                            <span className="status-text success">강화성공</span>
                          </>
                        )}
                        {card.status === "waiting" && (
                          <>
                            <img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화대기" />
                            <span className="status-text waiting">강화대기</span>
                          </>
                        )}
                        {card.status === "failed" && (
                          <>
                            <img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화실패" />
                            <span className="status-text fail">강화실패</span>
                          </>
                        )}
                        {card.status === "not_applicable" && (
                          <>
                            <img src="/images/0/cluster 4/icon/8 해당 없음.png" alt="해당없음" />
                            <span className="status-text not-applicable">해당없음</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="modal-card-content">
                    {/* 타이틀 + 내용 (읽기 전용) */}
                    <div className="modal-title-section">
                      <div className="main-title">Main Title</div>
                      <div className="content-title">{card.title}</div>
                      <div className="modal-date-badge">
                        <span>{weekDateRange}</span>
                      </div>
                    </div>

                    {/* 미개설/강화실패/마감 안내 */}
                    {!isActivityActive(card.activityType) && (
                      <div style={{
                        padding: '16px',
                        backgroundColor: (getEnhancementStatus(card.activityType) === 'failed' || isActivityExpired(card.activityType)) ? '#fee2e2' : '#fff3cd',
                        border: (getEnhancementStatus(card.activityType) === 'failed' || isActivityExpired(card.activityType)) ? '1px solid #ef4444' : '1px solid #ffc107',
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}>
                        <p style={{ margin: 0, color: (getEnhancementStatus(card.activityType) === 'failed' || isActivityExpired(card.activityType)) ? '#dc2626' : '#856404', fontSize: '14px' }}>
                          {getEnhancementStatus(card.activityType) === 'failed'
                            ? '❌ 강화에 실패하여 2차 정보를 작성할 수 없습니다.'
                            : isActivityExpired(card.activityType)
                              ? '⏰ 2차 정보 작성 기간이 마감되었습니다. (개설 후 48시간 경과)'
                              : '⚠️ 이 활동은 아직 개설되지 않았습니다. 운영진이 개설한 후 편집할 수 있습니다.'}
                        </p>
                      </div>
                    )}

                    {/* Sub Title - 개설된 경우만 수정 가능 */}
                    <div className="modal-input-group">
                      <div className="section-label-row">
                        <div className="section-label">Sub Title</div>
                        <div className="char-counter"><span className={(editingDetails[card.activityType]?.subTitle || '').length > 0 ? 'active' : ''}>{(editingDetails[card.activityType]?.subTitle || '').length}</span> / 150</div>
                      </div>
                      <textarea
                        value={editingDetails[card.activityType]?.subTitle || ''}
                        onChange={(e) => setEditingDetails(prev => ({
                          ...prev,
                          [card.activityType]: {
                            ...prev[card.activityType],
                            subTitle: e.target.value,
                          }
                        }))}
                        placeholder={isActivityActive(card.activityType) ? "메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)" : ""}
                        rows={3}
                        maxLength={150}
                        disabled={!isActivityActive(card.activityType)}
                        style={!isActivityActive(card.activityType) ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                      ></textarea>
                    </div>

                    {/* Output Link - 운영진 입력은 읽기 전용, 미개설 시 전체 비활성화 */}
                    <div className="modal-input-group">
                      <div className="section-label">Output Link</div>
                      <div className="output-links-buttons">
                        {[0, 1, 2, 3, 4].map((idx) => {
                          const link = editingDetails[card.activityType]?.outputLinks?.[idx] || { desc: '', url: '' };
                          const hasContent = link.url.trim() !== '';
                          const adminCount = getAdminOutputLinksCount(card.activityType);
                          const isAdminLink = idx < adminCount;
                          const isDisabled = !isActivityActive(card.activityType) || isAdminLink;
                          return (
                            <div key={idx} className={`output-link-item ${hasContent ? 'active' : ''} ${isAdminLink ? 'admin-link' : ''}`}>
                              <div className="link-button">
                                <span className="link-num">{idx + 1}</span>
                                {isAdminLink && <span className="admin-badge" title="운영진 입력">A</span>}
                              </div>
                              <input
                                type="text"
                                className="link-desc"
                                placeholder={isDisabled ? '' : '링크 설명 (20자)'}
                                maxLength={20}
                                value={link.desc}
                                disabled={isDisabled}
                                style={isDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                                onChange={(e) => !isDisabled && setEditingDetails(prev => {
                                  const currentLinks = [...(prev[card.activityType]?.outputLinks || createEmptyOutputLinks())];
                                  currentLinks[idx] = { ...currentLinks[idx], desc: e.target.value };
                                  return {
                                    ...prev,
                                    [card.activityType]: {
                                      ...prev[card.activityType],
                                      outputLinks: currentLinks,
                                    }
                                  };
                                })}
                              />
                              <input
                                type="url"
                                className="link-url"
                                placeholder={isDisabled ? '' : 'URL'}
                                value={link.url}
                                disabled={isDisabled}
                                style={isDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                                onChange={(e) => !isDisabled && setEditingDetails(prev => {
                                  const currentLinks = [...(prev[card.activityType]?.outputLinks || createEmptyOutputLinks())];
                                  currentLinks[idx] = { ...currentLinks[idx], url: e.target.value };
                                  return {
                                    ...prev,
                                    [card.activityType]: {
                                      ...prev[card.activityType],
                                      outputLinks: currentLinks,
                                    }
                                  };
                                })}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {getAdminOutputLinksCount(card.activityType) > 0 && (
                        <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                          * 'A' 표시된 링크는 운영진이 입력한 것으로 수정할 수 없습니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkInfoModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={saveAllActivityDetails} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 역량 모달 ========== */}
      {workAbilityModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkAbilityModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>실무 역량 편집</h3>
            </div>
            <div className="section-modal-body">
              {(() => {
                const abilityActivity = findFirstAbilityActivity();
                const abilityActivityTypeInfo = abilityActivity ? getActivityTypeInfo(abilityActivity.activity_type_id) : null;
                // 강화 실패 여부 체크: 활동이 개설되어 있어도 강화 실패면 2차 정보 작성 불가
                const abilityEnhancementStatus = abilityActivity ? getEnhancementStatus(abilityActivity.activity_type_id) : 'not_applicable';
                const isAbilityFailed = abilityEnhancementStatus === 'failed';
                // 편집 가능 여부: 활동이 개설되어 있고, 48시간 내이고, 강화 실패가 아닌 경우에만 가능
                const canEditAbility = isAnyAbilityActivityActive() && !isAbilityFailed;
                return (
              <div className="modal-card-item modal-card-workinfo">
                {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                <div className="modal-card-header-row">
                  <div className="modal-card-left">
                    <div className="modal-fruit-icon fruit">
                      <img src={abilityActivity ? getCompetencyIconPath(abilityActivity.activity_type_id) : '/images/0/cluster 4/icon/실무 역량/실무 역량 - default.png'} alt="실무 역량" />
                    </div>
                    <div className="modal-card-info">
                      <span className="modal-card-tag tag--cyan">{abilityActivityTypeInfo?.name || '-'}</span>
                    </div>
                    <div className="modal-code-badge">
                      <span>{abilityActivityTypeInfo?.line_code || '-'}</span>
                    </div>
                  </div>
                  <div className="modal-header-right">
                    {(() => {
                      const statusLabels: Record<string, string> = {
                        'success': '강화성공',
                        'waiting': '강화대기',
                        'failed': '강화실패',
                        'not_applicable': '해당없음'
                      };
                      const statusImages: Record<string, string> = {
                        'success': '/images/0/cluster 4/icon/5 강화 성공.png',
                        'waiting': '/images/0/cluster 4/icon/6 강화 대기.png',
                        'failed': '/images/0/cluster 4/icon/7 강화 실패.png',
                        'not_applicable': '/images/0/cluster 4/icon/8 해당 없음.png'
                      };
                      return (
                        <div className={`modal-status-badge ${abilityEnhancementStatus}`}>
                          <img src={statusImages[abilityEnhancementStatus]} alt={statusLabels[abilityEnhancementStatus]} />
                          <span className={`status-text ${abilityEnhancementStatus}`}>{statusLabels[abilityEnhancementStatus]}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="modal-card-content">
                  {/* 타이틀 + 내용 (읽기 전용) */}
                  <div className="modal-title-section">
                    <div className="main-title">Main Title</div>
                    <div className="content-title">{abilityActivity?.title || '-'}</div>
                    <div className="modal-date-badge">
                      <span>{weekDateRange}</span>
                    </div>
                  </div>

                  {/* 미개설/강화실패/마감 안내 */}
                  {!canEditAbility && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: (isAbilityFailed || isAnyAbilityActivityExpired()) ? '#fee2e2' : '#fff3cd',
                      border: (isAbilityFailed || isAnyAbilityActivityExpired()) ? '1px solid #ef4444' : '1px solid #ffc107',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <p style={{ margin: 0, color: (isAbilityFailed || isAnyAbilityActivityExpired()) ? '#dc2626' : '#856404', fontSize: '14px' }}>
                        {isAbilityFailed
                          ? '❌ 강화에 실패하여 2차 정보를 작성할 수 없습니다.'
                          : isAnyAbilityActivityExpired()
                            ? '⏰ 2차 정보 작성 기간이 마감되었습니다. (개설 후 48시간 경과)'
                            : '⚠️ 이 활동은 아직 개설되지 않았습니다. 운영진이 개설한 후 편집할 수 있습니다.'}
                      </p>
                    </div>
                  )}

                  {/* Sub Title - 강화 성공/대기인 경우만 수정 가능 */}
                  <div className="modal-input-group">
                    <div className="section-label-row">
                      <div className="section-label">Sub Title</div>
                      <div className="char-counter"><span>{editingDetails[getActiveAbilityActivityType()]?.subTitle?.length || 0}</span> / 150</div>
                    </div>
                    <textarea
                      placeholder={canEditAbility ? "메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)" : ""}
                      rows={3}
                      maxLength={150}
                      value={editingDetails[getActiveAbilityActivityType()]?.subTitle || ''}
                      onChange={(e) => {
                        const actType = getActiveAbilityActivityType();
                        setEditingDetails(prev => ({
                          ...prev,
                          [actType]: { ...prev[actType], subTitle: e.target.value }
                        }));
                      }}
                      disabled={!canEditAbility}
                      style={!canEditAbility ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                    ></textarea>
                  </div>

                  {/* Output Link - 운영진 입력은 읽기 전용, 미개설/강화실패 시 전체 비활성화 */}
                  <div className="modal-input-group">
                    <div className="section-label">Output Link</div>
                    <div className="output-links-buttons">
                      {(editingDetails[getActiveAbilityActivityType()]?.outputLinks || []).map((link, linkIndex) => {
                        const actType = getActiveAbilityActivityType();
                        const adminCount = getAdminOutputLinksCount(actType);
                        const isAdminLink = linkIndex < adminCount;
                        const isDisabled = !canEditAbility || isAdminLink;
                        return (
                          <div key={linkIndex} className={`output-link-item ${link.url.trim() ? 'active' : ''} ${isAdminLink ? 'admin-link' : ''}`}>
                            <div className="link-button">
                              <span className="link-num">{linkIndex + 1}</span>
                              {isAdminLink && <span className="admin-badge" title="운영진 입력">A</span>}
                            </div>
                            <input
                              type="text"
                              className="link-desc"
                              placeholder={isDisabled ? '' : '링크 설명을 입력하세요'}
                              maxLength={20}
                              value={link.desc}
                              disabled={isDisabled}
                              style={isDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                              onChange={(e) => !isDisabled && setEditingDetails(prev => {
                                const newLinks = [...prev[actType].outputLinks];
                                newLinks[linkIndex] = { ...newLinks[linkIndex], desc: e.target.value };
                                return { ...prev, [actType]: { ...prev[actType], outputLinks: newLinks } };
                              })}
                            />
                            <input
                              type="url"
                              className="link-url"
                              placeholder={isDisabled ? '' : 'URL'}
                              value={link.url}
                              disabled={isDisabled}
                              style={isDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                              onChange={(e) => !isDisabled && setEditingDetails(prev => {
                                const newLinks = [...prev[actType].outputLinks];
                                newLinks[linkIndex] = { ...newLinks[linkIndex], url: e.target.value };
                                return { ...prev, [actType]: { ...prev[actType], outputLinks: newLinks } };
                              })}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {getAdminOutputLinksCount(getActiveAbilityActivityType()) > 0 && (
                      <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                        * 'A' 표시된 링크는 운영진이 입력한 것으로 수정할 수 없습니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>
                );
              })()}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkAbilityModalOpen(false)}>취소</button>
              {(() => {
                // 저장 버튼도 강화 실패 시 비활성화
                const abilityAct = findFirstAbilityActivity();
                const isAbilityFailed = abilityAct ? getEnhancementStatus(abilityAct.activity_type_id) === 'failed' : false;
                const canSave = isAnyAbilityActivityActive() && !isAbilityFailed && !isSaving;
                return (
                  <button
                    className="save-btn"
                    onClick={async () => {
                      const actType = getActiveAbilityActivityType();
                      await saveActivityDetail(actType);
                      updateWeekActivityDetailsAfterSave([actType]);
                      alert('저장되었습니다.');
                      setWorkAbilityModalOpen(false);
                    }}
                    disabled={!canSave}
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경험 모달 ========== */}
      {workExpModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkExpModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>실무 경험 편집</h3>
            </div>
            <div className="section-modal-body">
              {workExpCards.filter(card => !card.isEmpty).map((card, index) => (
                <div key={card.id} className="modal-card-item modal-card-workinfo">
                  {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                  <div className="modal-card-header-row">
                    <div className="modal-card-left">
                      <div className="modal-fruit-icon fruit">
                        {card.icon && <img src={card.icon} alt={card.badge} />}
                      </div>
                      <div className="modal-card-info">
                        <span className="modal-card-tag tag--purple">{card.badge}</span>
                      </div>
                      <div className="modal-code-badge">
                        <span>{card.code}</span>
                      </div>
                    </div>
                    <div className="modal-header-right">
                      {(() => {
                        const enhStatus = card.enhancementStatus;
                        const statusLabels: Record<string, string> = {
                          'success': '강화성공',
                          'waiting': '강화대기',
                          'failed': '강화실패',
                          'not_applicable': '해당없음'
                        };
                        const statusImages: Record<string, string> = {
                          'success': '/images/0/cluster 4/icon/5 강화 성공.png',
                          'waiting': '/images/0/cluster 4/icon/6 강화 대기.png',
                          'failed': '/images/0/cluster 4/icon/7 강화 실패.png',
                          'not_applicable': '/images/0/cluster 4/icon/8 해당 없음.png'
                        };
                        return (
                          <div className={`modal-status-badge ${enhStatus}`}>
                            <img src={statusImages[enhStatus]} alt={statusLabels[enhStatus]} />
                            <span className={`status-text ${enhStatus}`}>{statusLabels[enhStatus]}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="modal-card-content">
                    {/* 타이틀 + 내용 (읽기 전용) */}
                    <div className="modal-title-section">
                      <div className="main-title-row">
                        <div className="main-title">Main Title</div>
                        <div className="modal-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <img
                              key={star}
                              src={star <= card.rating ? "/images/0/cluster 4/icon/icon - star.png" : "/images/0/cluster 4/icon/icon - empty star.png"}
                              alt="star"
                              className="modal-star"
                            />
                          ))}
                          <span className="rating-count">{card.ratingCount}</span>
                        </div>
                      </div>
                      <div className="content-title">{card.title}</div>
                      <div className="modal-date-badge">
                        <span>{weekDateRange}</span>
                      </div>
                    </div>

                    {/* Sub Title - 수정 가능 */}
                    {(() => {
                      const activityType = card.activityTypeId;
                      const isActive = isActivityActive(activityType);
                      const isExpired = isActivityExpired(activityType);
                      const isFailed = getEnhancementStatus(activityType) === 'failed';
                      return (
                        <>
                          {/* 미개설/강화실패/마감 안내 */}
                          {!isActive && (
                            <div style={{
                              padding: '16px',
                              backgroundColor: (isFailed || isExpired) ? '#fee2e2' : '#fff3cd',
                              border: (isFailed || isExpired) ? '1px solid #ef4444' : '1px solid #ffc107',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <p style={{ margin: 0, color: (isFailed || isExpired) ? '#dc2626' : '#856404', fontSize: '14px' }}>
                                {isFailed
                                  ? '❌ 강화에 실패하여 2차 정보를 작성할 수 없습니다.'
                                  : isExpired
                                    ? '⏰ 2차 정보 작성 기간이 마감되었습니다. (개설 후 48시간 경과)'
                                    : '⚠️ 이 활동은 아직 개설되지 않았습니다. 운영진이 개설한 후 편집할 수 있습니다.'}
                              </p>
                            </div>
                          )}

                          <div className="modal-input-group">
                            <div className="section-label-row">
                              <div className="section-label">Sub Title</div>
                              <div className="char-counter"><span>{editingDetails[activityType]?.subTitle?.length || 0}</span> / 150</div>
                            </div>
                            <textarea
                              placeholder={isActive ? "메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)" : ""}
                              rows={3}
                              maxLength={150}
                              value={editingDetails[activityType]?.subTitle || ''}
                              onChange={(e) => setEditingDetails(prev => ({
                                ...prev,
                                [activityType]: { ...prev[activityType], subTitle: e.target.value }
                              }))}
                              disabled={!isActive}
                              style={!isActive ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                            ></textarea>
                          </div>

                          {/* Output Link - 운영진 입력은 읽기 전용, 미개설 시 전체 비활성화 */}
                          <div className="modal-input-group">
                            <div className="section-label">Output Link</div>
                            <div className="output-links-buttons">
                              {editingDetails[activityType]?.outputLinks.map((link, linkIndex) => {
                                const adminCount = getAdminOutputLinksCount(activityType);
                                const isAdminLink = linkIndex < adminCount;
                                const isDisabled = !isActive || isAdminLink;
                                return (
                                  <div key={linkIndex} className={`output-link-item ${link.url.trim() ? 'active' : ''} ${isAdminLink ? 'admin-link' : ''}`}>
                                    <div className="link-button">
                                      <span className="link-num">{linkIndex + 1}</span>
                                      {isAdminLink && <span className="admin-badge" title="운영진 입력">A</span>}
                                    </div>
                                    <input
                                      type="text"
                                      className="link-desc"
                                      placeholder={isDisabled ? '' : '링크 설명을 입력하세요'}
                                      maxLength={20}
                                      value={link.desc}
                                      disabled={isDisabled}
                                      style={isDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                                      onChange={(e) => !isDisabled && setEditingDetails(prev => {
                                        const newLinks = [...prev[activityType].outputLinks];
                                        newLinks[linkIndex] = { ...newLinks[linkIndex], desc: e.target.value };
                                        return { ...prev, [activityType]: { ...prev[activityType], outputLinks: newLinks } };
                                      })}
                                    />
                                    <input
                                      type="url"
                                      className="link-url"
                                      placeholder={isDisabled ? '' : 'URL'}
                                      value={link.url}
                                      disabled={isDisabled}
                                      style={isDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                                      onChange={(e) => !isDisabled && setEditingDetails(prev => {
                                        const newLinks = [...prev[activityType].outputLinks];
                                        newLinks[linkIndex] = { ...newLinks[linkIndex], url: e.target.value };
                                        return { ...prev, [activityType]: { ...prev[activityType], outputLinks: newLinks } };
                                      })}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            {getAdminOutputLinksCount(activityType) > 0 && (
                              <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                                * 'A' 표시된 링크는 운영진이 입력한 것으로 수정할 수 없습니다.
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkExpModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={async () => {
                setIsSaving(true);
                try {
                  for (const activityType of workExpActivityTypes) {
                    await saveActivityDetail(activityType);
                  }
                  updateWeekActivityDetailsAfterSave(workExpActivityTypes);
                  alert('저장되었습니다.');
                  setWorkExpModalOpen(false);
                } catch (error) {
                  console.error('Error saving work exp details:', error);
                } finally {
                  setIsSaving(false);
                }
              }} disabled={isSaving}>{isSaving ? '저장 중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경력 모달 ========== */}
      {workCareerModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkCareerModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>실무 경력 편집</h3>
            </div>
            <div className="section-modal-body">
              {workCareerCards.filter(card => !card.isEmpty).map((card, index) => (
                <div key={card.id} className="modal-card-item modal-card-workinfo">
                  {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                  <div className="modal-card-header-row">
                    <div className="modal-card-left">
                      <div className="modal-fruit-icon fruit">
                        {card.icon && <img src={card.icon} alt={card.badge} />}
                      </div>
                      <div className="modal-card-info">
                        <span className={`modal-card-tag ${card.grade === 'S' ? 'tag--yellow' : card.grade === 'A' ? 'tag--green' : card.grade === 'B' ? 'tag--cyan' : 'tag--purple'}`}>마케팅(바이럴) 혹시 몰라</span>
                      </div>
                      <div className="modal-code-badge">
                        <span>{card.code}</span>
                      </div>
                    </div>
                    <div className="modal-header-right">
                      <div className="modal-status-badge">
                        {card.statusBadge && <img src={card.statusBadge} alt="상태" />}
                        <span className="status-text success">강화성공</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-card-content">
                    {/* 타이틀 + 내용 (읽기 전용) */}
                    <div className="modal-title-section">
                      <div className="main-title-row">
                        <div className="main-title">{card.title}</div>
                        <div className="modal-grade">
                          <span className={`grade ${card.grade === 'S' ? 'active' : ''}`}>S</span>
                          <span className={`grade ${card.grade === 'A' ? 'active' : ''}`}>A</span>
                          <span className={`grade ${card.grade === 'B' ? 'active' : ''}`}>B</span>
                          <span className={`grade ${card.grade === 'C' ? 'active' : ''}`}>C</span>
                          <span className={`grade ${card.grade === 'D' ? 'active' : ''}`}>D</span>
                        </div>
                      </div>
                      <div className="content-title">{weeklyActivities.find(a => a.activity_type_id === workCareerActivityTypes[index])?.title || '-'}</div>
                      <div className="modal-date-badge">
                        <span>{weekDateRange}</span>
                      </div>
                    </div>

                    {/* Sub Title - 수정 가능 */}
                    {(() => {
                      const activityType = workCareerActivityTypes[index];
                      const isActive = isActivityActive(activityType);
                      const isExpired = isActivityExpired(activityType);
                      const isFailed = getEnhancementStatus(activityType) === 'failed';
                      return (
                        <>
                          {/* 미개설/강화실패/마감 안내 */}
                          {!isActive && (
                            <div style={{
                              padding: '16px',
                              backgroundColor: (isFailed || isExpired) ? '#fee2e2' : '#fff3cd',
                              border: (isFailed || isExpired) ? '1px solid #ef4444' : '1px solid #ffc107',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <p style={{ margin: 0, color: (isFailed || isExpired) ? '#dc2626' : '#856404', fontSize: '14px' }}>
                                {isFailed
                                  ? '❌ 강화에 실패하여 2차 정보를 작성할 수 없습니다.'
                                  : isExpired
                                    ? '⏰ 2차 정보 작성 기간이 마감되었습니다. (개설 후 48시간 경과)'
                                    : '⚠️ 이 활동은 아직 개설되지 않았습니다. 운영진이 개설한 후 편집할 수 있습니다.'}
                              </p>
                            </div>
                          )}

                          <div className="modal-input-group">
                            <div className="section-label-row">
                              <div className="section-label">Sub Title</div>
                              <div className="char-counter"><span>{editingDetails[activityType]?.subTitle?.length || 0}</span> / 150</div>
                            </div>
                            <textarea
                              placeholder={isActive ? "메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)" : ""}
                              rows={3}
                              maxLength={150}
                              value={editingDetails[activityType]?.subTitle || ''}
                              onChange={(e) => setEditingDetails(prev => ({
                                ...prev,
                                [activityType]: { ...prev[activityType], subTitle: e.target.value }
                              }))}
                              disabled={!isActive}
                              style={!isActive ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                            ></textarea>
                          </div>

                          {/* Output Link - 운영진 입력은 읽기 전용, 미개설 시 전체 비활성화 */}
                          <div className="modal-input-group">
                            <div className="section-label">Output Link</div>
                            <div className="output-links-buttons">
                              {editingDetails[activityType]?.outputLinks.map((link, linkIndex) => {
                                const adminCount = getAdminOutputLinksCount(activityType);
                                const isAdminLink = linkIndex < adminCount;
                                const isDisabled = !isActive || isAdminLink;
                                return (
                                  <div key={linkIndex} className={`output-link-item ${link.url.trim() ? 'active' : ''} ${isAdminLink ? 'admin-link' : ''}`}>
                                    <div className="link-button">
                                      <span className="link-num">{linkIndex + 1}</span>
                                      {isAdminLink && <span className="admin-badge" title="운영진 입력">A</span>}
                                    </div>
                                    <input
                                      type="text"
                                      className="link-desc"
                                      placeholder={isDisabled ? '' : '링크 설명을 입력하세요'}
                                      maxLength={20}
                                      value={link.desc}
                                      disabled={isDisabled}
                                      style={isDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                                      onChange={(e) => !isDisabled && setEditingDetails(prev => {
                                        const newLinks = [...prev[activityType].outputLinks];
                                        newLinks[linkIndex] = { ...newLinks[linkIndex], desc: e.target.value };
                                        return { ...prev, [activityType]: { ...prev[activityType], outputLinks: newLinks } };
                                      })}
                                    />
                                    <input
                                      type="url"
                                      className="link-url"
                                      placeholder={isDisabled ? '' : 'URL'}
                                      value={link.url}
                                      disabled={isDisabled}
                                      style={isDisabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                                      onChange={(e) => !isDisabled && setEditingDetails(prev => {
                                        const newLinks = [...prev[activityType].outputLinks];
                                        newLinks[linkIndex] = { ...newLinks[linkIndex], url: e.target.value };
                                        return { ...prev, [activityType]: { ...prev[activityType], outputLinks: newLinks } };
                                      })}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            {getAdminOutputLinksCount(activityType) > 0 && (
                              <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                                * 'A' 표시된 링크는 운영진이 입력한 것으로 수정할 수 없습니다.
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkCareerModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={async () => {
                setIsSaving(true);
                try {
                  for (const activityType of workCareerActivityTypes) {
                    await saveActivityDetail(activityType);
                  }
                  updateWeekActivityDetailsAfterSave(workCareerActivityTypes);
                  alert('저장되었습니다.');
                  setWorkCareerModalOpen(false);
                } catch (error) {
                  console.error('Error saving work career details:', error);
                } finally {
                  setIsSaving(false);
                }
              }} disabled={isSaving}>{isSaving ? '저장 중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 상단 섹션 선택 모달 ========== */}
      {selectionModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectionModalOpen(false); }}>
          <div className="section-modal section-modal-selection">
            <div className="section-modal-header">
              <h3>편집 대상 선택</h3>
            </div>
            <div className="section-modal-body selection-body">
              <p className="selection-desc">편집할 대상을 선택해주세요</p>
              <div className="selection-buttons">
                <button
                  className="selection-btn self"
                  onClick={() => {
                    setSelectionModalOpen(false);
                    setHeaderModalType('본인');
                    setHeaderModalOpen(true);
                  }}
                >
                  <div className="selection-icon">
                    <img src="/images/0/cluster 4/icon/icon - 주차 평판.png" alt="연계 동료 작성하기" />
                  </div>
                  <span className="selection-label">연계 동료<br />작성하기</span>
                  <span className="selection-sublabel">내 정보 편집하기</span>
                </button>
                <button
                  className="selection-btn other"
                  onClick={() => {
                    setSelectionModalOpen(false);
                    setHeaderModalType('타크루');
                    setHeaderModalOpen(true);
                  }}
                >
                  <div className="selection-icon">
                    <img src="/images/0/cluster 4/icon/icon - 연계 동료.png" alt="주차평판 남기기" />
                  </div>
                  <span className="selection-label">주차평판<br />남기기</span>
                  <span className="selection-sublabel">다른 크루 정보 보기</span>
                </button>
              </div>
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setSelectionModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 상단 섹션 본인 편집 모달 (연계 동료 편집) ========== */}
      {headerModalOpen && headerModalType === '본인' && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setHeaderModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>연계 동료 편집</h3>
            </div>
            <div className="section-modal-body">
              <div className="modal-card-item modal-card-header-edit">
                {/* 안내 문구 */}
                <div className="header-edit-section colleague-guide">
                  <div className="guide-text">
                    <p>이번 주차 동안 클럽에서 성장하며,<br/><span className="highlight">자신이 도움을 받았거나 기억에 남는 결과를 보여준 다른 크루를 선택해주세요.</span> <span className="guide-requirement">(최소 1명 필수)</span></p>
                  </div>
                </div>

                {/* 연계 동료 선택 */}
                <div className="header-edit-section">
                  <div className="header-edit-title">연계 동료 선택 <span className="count-badge">{selectedColleagues.length} / 3</span></div>

                  {/* 선택된 동료 목록 */}
                  <div className="selected-colleagues">
                    {selectedColleagues.map((colleague, index) => (
                      <div key={colleague.id} className="selected-colleague-card">
                        <div className="colleague-header">
                          <div className="to-badge">
                            <span className="to-text">To.</span>
                            <span className="rank-number">{colleague.rank}{colleague.rank === 1 ? 'st' : colleague.rank === 2 ? 'nd' : 'rd'}</span>
                          </div>
                          <button className="remove-btn" title="삭제" onClick={() => removeColleague(colleague.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="colleague-profile-row">
                          <div className="colleague-avatar">
                            <img src={colleague.profileImg} alt={colleague.name} />
                          </div>
                          <div className="colleague-info">
                            <div className="colleague-name">{colleague.name} | {colleague.gender} | {colleague.age}</div>
                            <div className="colleague-details">{colleague.team} 팀 | {colleague.part} 파트 | {colleague.nickname}</div>
                          </div>
                        </div>
                        <div className="colleague-message-section">
                          <label>Thank you message <span className="char-limit">(최대 50자)</span></label>
                          <div className="message-input-wrapper">
                            <textarea
                              placeholder="이 크루에게 어떤 도움을 받았는지, 감사의 표현을 작성해주세요 :)"
                              maxLength={50}
                              rows={1}
                              value={colleague.message}
                              onChange={(e) => updateColleagueMessage(colleague.id, e.target.value)}
                            ></textarea>
                            <span className="char-counter">{colleague.message.length} / 50</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 추가 버튼 (3명 미만일 때만 표시) */}
                    {selectedColleagues.length < 3 && (
                      <div className="add-colleague-card">
                        <div className="add-colleague-placeholder">
                          <div className="add-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </div>
                          <span>아래에서 크루를 검색하고 추가하세요</span>
                          <span className="add-sublabel">{3 - selectedColleagues.length}명 추가 가능</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 크루 검색 섹션 */}
                <div className="header-edit-section">
                  <div className="header-edit-title with-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="title-icon">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    크루 검색
                  </div>
                  <div className="header-edit-row">
                    <div className="edit-field full-width">
                      <div className="search-input-wrapper">
                        <input
                          type="text"
                          placeholder="크루 이름 또는 닉네임으로 검색..."
                          value={crewSearchQuery}
                          onChange={(e) => setCrewSearchQuery(e.target.value)}
                        />
                        <button className="search-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 검색 결과 목록 */}
                  <div className="crew-search-results">
                    {filteredCrewData.length === 0 ? (
                      <div className="no-results">
                        {selectedColleagues.length >= 3 ? '최대 3명까지만 선택 가능합니다.' : '검색 결과가 없습니다.'}
                      </div>
                    ) : (
                      filteredCrewData.map((user) => (
                        <div key={user.id} className="crew-search-item">
                          <div className="crew-profile">
                            <div className="crew-avatar">
                              <img src={user.profileImg} alt={user.name} />
                            </div>
                            <div className="crew-info">
                              <div className="crew-name">{user.name} | {user.gender} | {user.age}</div>
                              <div className="crew-details">{user.team} 팀 | {user.part} 파트 | {user.nickname}</div>
                            </div>
                          </div>
                          <div className="rank-select-buttons">
                            <button
                              className={`rank-btn ${selectedColleagues.find(c => c.rank === 1) ? 'disabled' : ''}`}
                              title="1순위로 선택"
                              onClick={() => addColleague(user, 1)}
                              disabled={!!selectedColleagues.find(c => c.rank === 1) || selectedColleagues.length >= 3}
                            >1st</button>
                            <button
                              className={`rank-btn ${selectedColleagues.find(c => c.rank === 2) ? 'disabled' : ''}`}
                              title="2순위로 선택"
                              onClick={() => addColleague(user, 2)}
                              disabled={!!selectedColleagues.find(c => c.rank === 2) || selectedColleagues.length >= 3}
                            >2nd</button>
                            <button
                              className={`rank-btn ${selectedColleagues.find(c => c.rank === 3) ? 'disabled' : ''}`}
                              title="3순위로 선택"
                              onClick={() => addColleague(user, 3)}
                              disabled={!!selectedColleagues.find(c => c.rank === 3) || selectedColleagues.length >= 3}
                            >3rd</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setHeaderModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={() => setHeaderModalOpen(false)}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 상단 섹션 타크루 모달 (타크루가 나에 대해 평판을 남김) ========== */}
      {headerModalOpen && headerModalType === '타크루' && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setHeaderModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>주차 평판</h3>
              <span className="modal-subtitle">해당 크루에게 평판을 남겨주세요</span>
            </div>
            <div className="section-modal-body">
              <div className="modal-card-item modal-card-header-edit reputation-form-modal">
                {/* 평판 작성 폼 */}
                <div className="reputation-form">
                  {/* 평점 */}
                  <div className="form-field">
                    <label>평점</label>
                    <div className="rating-row">
                      <div className="star-rating-sm">
                        {[1, 2, 3, 4, 5].map((starIndex) => {
                          const fullValue = starIndex * 2;
                          const halfValue = starIndex * 2 - 1;
                          const currentRating = reputationEditData.rating;
                          const isHalf = currentRating >= halfValue && currentRating < fullValue;
                          const isFull = currentRating >= fullValue;

                          return (
                            <div key={starIndex} className="star-wrapper">
                              {/* 배경 별 (빈 별) */}
                              <svg className="star-bg" viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              {/* 반개 채움 */}
                              {isHalf && (
                                <svg className="star-half-fill" viewBox="0 0 24 24">
                                  <defs>
                                    <clipPath id={`halfClip${starIndex}`}>
                                      <rect x="0" y="0" width="12" height="24" />
                                    </clipPath>
                                  </defs>
                                  <polygon
                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                                    fill="#FFA500"
                                    clipPath={`url(#halfClip${starIndex})`}
                                  />
                                </svg>
                              )}
                              {/* 전체 채움 */}
                              {isFull && (
                                <svg className="star-full-fill" viewBox="0 0 24 24" fill="#FFA500">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              )}
                              {/* 클릭 영역 */}
                              <button
                                className="star-click-area star-click-left"
                                type="button"
                                onClick={() => setReputationEditData(prev => ({ ...prev, rating: halfValue }))}
                              />
                              <button
                                className="star-click-area star-click-right"
                                type="button"
                                onClick={() => setReputationEditData(prev => ({ ...prev, rating: fullValue }))}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <span className="rating-value">{reputationEditData.rating} / 10</span>
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="form-field">
                    <label>내용 <span className="char-limit">(최대 100자)</span></label>
                    <div className="textarea-wrapper">
                      <textarea
                        placeholder="해당 크루에 대한 평가 내용을 작성해주세요..."
                        maxLength={100}
                        rows={3}
                        value={reputationEditData.content}
                        onChange={(e) => setReputationEditData(prev => ({ ...prev, content: e.target.value }))}
                      ></textarea>
                      <span className="char-counter">{reputationEditData.content.length} / 100</span>
                    </div>
                  </div>

                  {/* 키워드 */}
                  <div className="form-field">
                    <label>키워드 <span className="char-limit">(최대 7자)</span></label>
                    <div className="keyword-row">
                      <span className="hashtag">#</span>
                      <input
                        type="text"
                        placeholder="키워드를 입력하세요"
                        value={reputationEditData.keyword}
                        onChange={(e) => setReputationEditData(prev => ({ ...prev, keyword: e.target.value }))}
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setHeaderModalOpen(false)}>취소</button>
              <button
                className="save-btn"
                onClick={() => setHeaderModalOpen(false)}
                disabled={reputationEditData.rating === 0 || reputationEditData.content.trim() === '' || reputationEditData.keyword.trim() === ''}
              >저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 주차 평판 카드 상세보기 모달 ========== */}
      {reputationViewModalOpen && selectedReputationCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setReputationViewModalOpen(false); }}>
          <div className="section-modal reputation-view-modal">
            <div className="section-modal-header">
              <h3>주차 평판</h3>
              <button className="modal-close-btn" onClick={() => setReputationViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 프로필 */}
              <div className="reputation-view-profile">
                <div className="profile-image">
                  <img src={selectedReputationCard.profileImg} alt={selectedReputationCard.name} />
                </div>
                <div className="profile-info">
                  <div className="profile-name">
                    <span className="text">{selectedReputationCard.name}</span> | <span className="text">{selectedReputationCard.gender}</span> | <span className="text">{selectedReputationCard.age}</span>
                  </div>
                  <div className="profile-details">
                    <div className="detail-line">
                      <span className="text">{selectedReputationCard.university}</span><span className="label">학교</span> | <span className="text">{selectedReputationCard.major}</span><span className="label">학과</span>
                    </div>
                    <div className="detail-line">
                      <span className="text">{selectedReputationCard.team}</span><span className="label">팀</span> | <span className="text">{selectedReputationCard.part}</span><span className="label">파트</span>
                    </div>
                    <div className="detail-line">
                      <span className="nickname">{selectedReputationCard.nickname}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 평점 */}
              <div className="reputation-view-rating">
                <div className="rating-label">평점</div>
                <div className="rating-content">
                  <div className="stars">{renderStars(selectedReputationCard.rating)}</div>
                  <span className="rating-count">{selectedReputationCard.ratingCount}</span>
                </div>
              </div>

              {/* 내용 */}
              <div className="reputation-view-content">
                <div className="content-label">내용</div>
                <div className="content-text">{selectedReputationCard.description}</div>
              </div>

              {/* FM & 키워드 */}
              <div className="reputation-view-footer">
                <div className="footer-item">
                  <span className="footer-label">FM</span>
                  <span className="footer-value">{selectedReputationCard.fm}</span>
                </div>
                <span className="footer-divider">|</span>
                <div className="footer-item">
                  <span className="footer-label">키워드</span>
                  <span className={`tag ${selectedReputationCard.tagColor}`}>{selectedReputationCard.tagText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 연계 동료 카드 상세보기 모달 ========== */}
      {colleagueViewModalOpen && selectedColleagueCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setColleagueViewModalOpen(false); }}>
          <div className="section-modal colleague-view-modal">
            <div className="section-modal-header">
              <h3>연계 동료</h3>
              <button className="modal-close-btn" onClick={() => setColleagueViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* To. 뱃지 + 날짜 */}
              <div className="colleague-header-row">
                <div className="colleague-to-badge">
                  <span className="to-text">To.</span>
                  <span className="rank-number">{selectedColleagueIndex + 1}{selectedColleagueIndex === 0 ? 'st' : selectedColleagueIndex === 1 ? 'nd' : 'rd'}</span>
                </div>
                <div className="colleague-view-date">
                  <span className="date-value">{selectedColleagueCard.date}</span>
                </div>
              </div>

              {/* 프로필 */}
              <div className="colleague-view-profile">
                <div className="profile-image">
                  <img src={selectedColleagueCard.profileImg} alt={selectedColleagueCard.name} />
                </div>
                <div className="profile-info">
                  <div className="profile-name">
                    <span className="text">{selectedColleagueCard.name}</span> | <span className="text">{selectedColleagueCard.gender}</span> | <span className="text">{selectedColleagueCard.age}</span>
                  </div>
                  <div className="profile-details">
                    <div className="detail-line">
                      <span className="text">{selectedColleagueCard.university}</span><span className="label">학교</span> | <span className="text">{selectedColleagueCard.major}</span><span className="label">학과</span> | <span className="text">{selectedColleagueCard.team}</span><span className="label">팀</span> | <span className="text">{selectedColleagueCard.part}</span><span className="label">파트</span> | <span className="nickname">{selectedColleagueCard.nickname}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thank you message */}
              <div className="colleague-view-message">
                <div className="message-label">Thank you message</div>
                <div className="message-content">{selectedColleagueCard.message}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 정보 카드 상세보기 모달 ========== */}
      {workInfoViewModalOpen && selectedWorkInfoCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkInfoViewModalOpen(false); }}>
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 정보</h3>
              <button className="modal-close-btn" onClick={() => setWorkInfoViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 헤더: 아이콘 + 카테고리 제목 + 강화 상태 */}
              <div className="work-view-header-row">
                <div className="work-view-left">
                  <div className={`work-icon-box ${selectedWorkInfoCard.isFruit ? 'fruit' : ''}`}>
                    {selectedWorkInfoCard.icon && <img src={selectedWorkInfoCard.icon} alt={selectedWorkInfoCard.category} />}
                  </div>
                  <span className="category-title">{selectedWorkInfoCard.category}</span>
                </div>
                <div className="work-view-right">
                  {selectedWorkInfoCard.status === "success" && (
                    <div className="status-badge success">
                      <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화성공" />
                      <span>강화성공</span>
                    </div>
                  )}
                  {selectedWorkInfoCard.status === "waiting" && (
                    <div className="status-badge waiting">
                      <img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화대기" />
                      <span>강화대기</span>
                    </div>
                  )}
                  {selectedWorkInfoCard.status === "failed" && (
                    <div className="status-badge fail">
                      <img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화실패" />
                      <span>강화실패</span>
                    </div>
                  )}
                  {selectedWorkInfoCard.status === "not_applicable" && (
                    <div className="status-badge not-applicable">
                      <img src="/images/0/cluster 4/icon/8 해당 없음.png" alt="해당없음" />
                      <span>해당없음</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Title + Content */}
              <div className="work-view-title-section">
                <div className="main-title">Main Title</div>
                <div className="content-text">{selectedWorkInfoCard.title}</div>
                <div className="date-badge">{weekDateRange}</div>
              </div>

              {/* Sub Title */}
              <div className="work-view-section">
                <div className="section-label">Sub Title</div>
                <div className="section-content">{selectedWorkInfoCard.subTitle || '-'}</div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const link = selectedWorkInfoCard.outputLinks?.[idx];
                    const hasLink = link?.url && link.url.trim() !== '';
                    return (
                      <a
                        key={idx}
                        href={hasLink ? ensureProtocol(link.url) : undefined}
                        target={hasLink ? "_blank" : undefined}
                        rel={hasLink ? "noopener noreferrer" : undefined}
                        className={`output-link-item ${!hasLink ? 'disabled' : ''}`}
                        onClick={(e) => !hasLink && e.preventDefault()}
                      >
                        <span className="link-num">{idx + 1}</span>
                        <span className="link-desc">{hasLink ? (link.desc || '링크') : '-'}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 역량 카드 상세보기 모달 ========== */}
      {workAbilityViewModalOpen && (() => {
        const completedActivity = findFirstCompletedAbilityActivity();
        const openedActivity = findFirstAbilityActivity();
        const displayActivity = completedActivity || openedActivity;
        const activityTypeInfo = displayActivity ? getActivityTypeInfo(displayActivity.activity_type_id) : null;
        const enhancementStatus = displayActivity ? getEnhancementStatus(displayActivity.activity_type_id) : 'not_applicable';

        const statusLabels: Record<string, string> = {
          'success': '강화성공',
          'waiting': '강화대기',
          'failed': '강화실패',
          'not_applicable': '해당없음'
        };
        const statusImages: Record<string, string> = {
          'success': '/images/0/cluster 4/icon/5 강화 성공.png',
          'waiting': '/images/0/cluster 4/icon/6 강화 대기.png',
          'failed': '/images/0/cluster 4/icon/7 강화 실패.png',
          'not_applicable': '/images/0/cluster 4/icon/8 해당 없음.png'
        };

        return (
          <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkAbilityViewModalOpen(false); }}>
            <div className="section-modal work-view-modal">
              <div className="section-modal-header">
                <h3>실무 역량</h3>
                <button className="modal-close-btn" onClick={() => setWorkAbilityViewModalOpen(false)}>×</button>
              </div>
              <div className="section-modal-body">
                {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
                <div className="work-view-header-row">
                  <div className="work-view-left">
                    <div className="work-icon-box fruit">
                      <img src={displayActivity ? getCompetencyIconPath(displayActivity.activity_type_id) : '/images/0/cluster 4/icon/실무 역량/실무 역량 - default.png'} alt="실무 역량" />
                    </div>
                    <span className="category-title">{activityTypeInfo?.name || '-'}</span>
                    <span className="code-badge">{activityTypeInfo?.line_code || '-'}</span>
                  </div>
                  <div className="work-view-right">
                    <div className={`status-badge ${enhancementStatus}`}>
                      <img src={statusImages[enhancementStatus]} alt={statusLabels[enhancementStatus]} />
                      <span>{statusLabels[enhancementStatus]}</span>
                    </div>
                  </div>
                </div>

                {/* Main Title + Content */}
                <div className="work-view-title-section">
                  <div className="main-title">Main Title</div>
                  <div className="content-text">{displayActivity?.title || '-'}</div>
                  <div className="date-badge">{weekDateRange}</div>
                </div>

                {/* Sub Title */}
                <div className="work-view-section">
                  <div className="section-label">Sub Title</div>
                  <div className="section-content">{weekActivityDetails.find(d => d.activity_type_id === displayActivity?.activity_type_id)?.sub_title || '-'}</div>
                </div>

                {/* Output Link */}
                <div className="work-view-section">
                  <div className="section-label">Output Link</div>
                  <div className="output-links-view">
                    {(() => {
                      const activityType = displayActivity?.activity_type_id || '';
                      const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
                      const detail = weekActivityDetails.find(d => d.activity_type_id === activityType);
                      const adminLinks = activity?.output_links || [];
                      const userLinks = detail?.output_links || [];
                      return [0, 1, 2, 3, 4].map((idx) => {
                        const link = adminLinks[idx]?.url ? adminLinks[idx] : userLinks[idx];
                        const hasLink = link?.url && link.url.trim() !== '';
                        return (
                          <a
                            key={idx}
                            href={hasLink ? ensureProtocol(link.url) : undefined}
                            target={hasLink ? "_blank" : undefined}
                            rel={hasLink ? "noopener noreferrer" : undefined}
                            className={`output-link-item ${!hasLink ? 'disabled' : ''}`}
                            onClick={(e) => !hasLink && e.preventDefault()}
                          >
                            <span className="link-num">{idx + 1}</span>
                            <span className="link-desc">{hasLink ? (link.desc || '링크') : '-'}</span>
                          </a>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========== 실무 경험 카드 상세보기 모달 ========== */}
      {workExpViewModalOpen && selectedWorkExpCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkExpViewModalOpen(false); }}>
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 경험</h3>
              <button className="modal-close-btn" onClick={() => setWorkExpViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
              <div className="work-view-header-row">
                <div className="work-view-left">
                  <div className="work-icon-box fruit">
                    {selectedWorkExpCard.icon && <img src={selectedWorkExpCard.icon} alt={selectedWorkExpCard.badge} />}
                  </div>
                  <span className="category-title">{selectedWorkExpCard.badge}</span>
                  <span className="code-badge">{selectedWorkExpCard.code}</span>
                </div>
                <div className="work-view-right">
                  {(() => {
                    const enhStatus = selectedWorkExpCard.enhancementStatus;
                    const statusLabels: Record<string, string> = {
                      'success': '강화성공',
                      'waiting': '강화대기',
                      'failed': '강화실패',
                      'not_applicable': '해당없음'
                    };
                    const statusImages: Record<string, string> = {
                      'success': '/images/0/cluster 4/icon/5 강화 성공.png',
                      'waiting': '/images/0/cluster 4/icon/6 강화 대기.png',
                      'failed': '/images/0/cluster 4/icon/7 강화 실패.png',
                      'not_applicable': '/images/0/cluster 4/icon/8 해당 없음.png'
                    };
                    return (
                      <div className={`status-badge ${enhStatus}`}>
                        <img src={statusImages[enhStatus]} alt={statusLabels[enhStatus]} />
                        <span>{statusLabels[enhStatus]}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Main Title + 별점 + Content */}
              <div className="work-view-title-section">
                <div className="main-title-row">
                  <div className="main-title">Main Title</div>
                  <div className="rating-row">
                    <div className="stars">{renderStars(selectedWorkExpCard.rating)}</div>
                    <span className="rating-count">{selectedWorkExpCard.ratingCount}</span>
                  </div>
                </div>
                <div className="content-text">{selectedWorkExpCard.title}</div>
                <div className="date-badge">{weekDateRange}</div>
              </div>

              {/* Sub Title */}
              <div className="work-view-section">
                <div className="section-label">Sub Title</div>
                <div className="section-content">{weekActivityDetails[selectedWorkExpCard.activityTypeId]?.sub_title || '-'}</div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {(() => {
                    const activityType = selectedWorkExpCard.activityTypeId;
                    const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
                    const detail = weekActivityDetails[activityType];
                    const adminLinks = activity?.output_links || [];
                    const userLinks = detail?.output_links || [];
                    return [0, 1, 2, 3, 4].map((idx) => {
                      const link = adminLinks[idx]?.url ? adminLinks[idx] : userLinks[idx];
                      const hasLink = link?.url && link.url.trim() !== '';
                      return (
                        <a
                          key={idx}
                          href={hasLink ? ensureProtocol(link.url) : undefined}
                          target={hasLink ? "_blank" : undefined}
                          rel={hasLink ? "noopener noreferrer" : undefined}
                          className={`output-link-item ${!hasLink ? 'disabled' : ''}`}
                          onClick={(e) => !hasLink && e.preventDefault()}
                        >
                          <span className="link-num">{idx + 1}</span>
                          <span className="link-desc">{hasLink ? (link.desc || '링크') : '-'}</span>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경력 카드 상세보기 모달 ========== */}
      {workCareerViewModalOpen && selectedWorkCareerCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkCareerViewModalOpen(false); }}>
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 경력</h3>
              <button className="modal-close-btn" onClick={() => setWorkCareerViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
              <div className="work-view-header-row">
                <div className="work-view-left">
                  <div className="work-icon-box fruit">
                    {selectedWorkCareerCard.icon && <img src={selectedWorkCareerCard.icon} alt={selectedWorkCareerCard.badge} />}
                  </div>
                  <span className="category-title">마케팅(바이럴) 혹시 몰라</span>
                  <span className="code-badge">{selectedWorkCareerCard.code}</span>
                </div>
                <div className="work-view-right">
                  {selectedWorkCareerCard.statusBadge && (
                    <div className="status-badge success">
                      <img src={selectedWorkCareerCard.statusBadge} alt="상태" />
                      <span>강화성공</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Title + 등급 + Content */}
              <div className="work-view-title-section">
                <div className="main-title-row">
                  <div className="main-title">Main Title</div>
                  <div className="grade-row">
                    <span className={`grade ${selectedWorkCareerCard.grade === 'S' ? 'active' : ''}`}>S</span>
                    <span className={`grade ${selectedWorkCareerCard.grade === 'A' ? 'active' : ''}`}>A</span>
                    <span className={`grade ${selectedWorkCareerCard.grade === 'B' ? 'active' : ''}`}>B</span>
                    <span className={`grade ${selectedWorkCareerCard.grade === 'C' ? 'active' : ''}`}>C</span>
                    <span className={`grade ${selectedWorkCareerCard.grade === 'D' ? 'active' : ''}`}>D</span>
                  </div>
                </div>
                <div className="content-text">{selectedWorkCareerCard.title}</div>
                <div className="date-badge">{weekDateRange}</div>
              </div>

              {/* Sub Title */}
              <div className="work-view-section">
                <div className="section-label">Sub Title</div>
                <div className="section-content">{(() => {
                  const activityType = workCareerActivityTypes[selectedWorkCareerCard.id - 1];
                  return weekActivityDetails.find(d => d.activity_type_id === activityType)?.sub_title || '-';
                })()}</div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {(() => {
                    const activityType = workCareerActivityTypes[selectedWorkCareerCard.id - 1];
                    const activity = weeklyActivities.find(a => a.activity_type_id === activityType);
                    const detail = weekActivityDetails.find(d => d.activity_type_id === activityType);
                    const adminLinks = activity?.output_links || [];
                    const userLinks = detail?.output_links || [];
                    return [0, 1, 2, 3, 4].map((idx) => {
                      const link = adminLinks[idx]?.url ? adminLinks[idx] : userLinks[idx];
                      const hasLink = link?.url && link.url.trim() !== '';
                      return (
                        <a
                          key={idx}
                          href={hasLink ? ensureProtocol(link.url) : undefined}
                          target={hasLink ? "_blank" : undefined}
                          rel={hasLink ? "noopener noreferrer" : undefined}
                          className={`output-link-item ${!hasLink ? 'disabled' : ''}`}
                          onClick={(e) => !hasLink && e.preventDefault()}
                        >
                          <span className="link-num">{idx + 1}</span>
                          <span className="link-desc">{hasLink ? (link.desc || '링크') : '-'}</span>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cluster4CardContent;
