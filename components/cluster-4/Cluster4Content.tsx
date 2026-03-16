"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useDataMasking } from "@/hooks/useDataMasking";

// TODO: 피그마 점검용 임시 더미 데이터 - 점검 완료 후 제거
const DUMMY_SEASON_ROLES = [
  { teamName: '엔터테인먼트 팀', partName: '내돈내산 파트', roleLabel: '운영진(앰배서더)', isAdmin: false, adminGeneration: 3, startedAt: '2025-03-23', profileImage: '/images/0/crew profile/여 1.jpg' },
  { teamName: '운영진(3기)', partName: '클럽 단위', roleLabel: '팀장(헬스케어 팀)', isAdmin: false, adminGeneration: 3, startedAt: '2025-03-23', profileImage: '/images/0/crew profile/여 2.jpg' },
  { teamName: '운영진(4기)', partName: '클럽 단위', roleLabel: '앰배서더', isAdmin: false, adminGeneration: 4, startedAt: '2025-03-23', profileImage: '/images/0/crew profile/여 3.jpg' },
];

// TODO: 피그마 점검용 임시 더미 데이터 - 점검 완료 후 제거
const DUMMY_SEASON_REPUTATIONS = [
  {
    id: 'dummy-rep-1',
    rating: 6,
    keyword_1: '추진력추진력력',
    keyword_2: '추진력추진력력',
    content: '안녕하세요 이 시즌안녕하세요 이 시즌일이삼사오육칠팔구십',
    reviewer: {
      display_name: '안유현', gender: '여', birth_date: '2002-01-01',
      university: '서울대학교', major_first: '미디어커뮤니케이션학과',
      teamName: '엔터테인먼트팀', partName: '내돈내산파트', vision: '엔비디아구글테슬라쿵',
      profile_photo_url: '/images/0/crew profile/여 4.webp',
    },
  },
  {
    id: 'dummy-rep-2',
    rating: 6,
    keyword_1: '추진력추진력력',
    keyword_2: '추진력추진력력',
    content: '안녕하세요 이 시즌안녕하세요 이 시즌일이삼사오육칠팔구십',
    reviewer: {
      display_name: '이지민', gender: '여', birth_date: '2002-01-01',
      university: '서울대학교', major_first: '미디어커뮤니케이션학과',
      teamName: '엔터테인먼트팀', partName: '내돈내산파트', vision: '엔비디아구글테슬라쿵',
      profile_photo_url: '/images/0/crew profile/여 5.jpg',
    },
  },
  {
    id: 'dummy-rep-3',
    rating: 6,
    keyword_1: '추진력추진력력',
    keyword_2: '추진력추진력력',
    content: '안녕하세요 이 시즌안녕하세요 이 시즌일이삼사오육칠팔구십',
    reviewer: {
      display_name: '유성이', gender: '여', birth_date: '2002-01-01',
      university: '서울대학교', major_first: '미디어커뮤니케이션학과',
      teamName: '엔터테인먼트팀', partName: '내돈내산파트', vision: '엔비디아구글테슬라쿵',
      profile_photo_url: '/images/0/crew profile/여 6.jpg',
    },
  },
];

// 기본 시즌 데이터 (데이터가 없을 때 사용)
const defaultSeasonData = {
  id: 'dummy-season-1',
  year: '2025',
  season: '여름',
  dateRange: '2025 - 03 - 23 (월) ~ 2025 - 08 - 22 (일)',
  status: '시즌 진행 중',
  statusClass: 'in-progress',
  image: '/images/0/cluster4/cluster4-1/image.png',
  approvedWeeks: 8,
  totalWeeks: 10,
  roleInSeason: '운영진(앰배서더)',
  isQualified: true,
  seasonRoles: [
    { teamName: '엔터테인먼트 팀', partName: '내돈내산 파트', roleLabel: '운영진(앰배서더)', isAdmin: false, adminGeneration: 3, startedAt: '2025-03-23', profileImage: '/images/0/cluster4/cluster4-1/Ellipse 7.png' },
    { teamName: '운영진(3기)', partName: '클럽 단위', roleLabel: '팀장(헬스케어 팀)', isAdmin: false, adminGeneration: 4, startedAt: '2025-03-23', profileImage: '/images/0/cluster4/cluster4-1/Ellipse 8.png' },
    { teamName: '운영진(4기)', partName: '클럽 단위', roleLabel: '앰배서더', isAdmin: false, adminGeneration: 5, startedAt: '2025-03-23', profileImage: '/images/0/cluster4/cluster4-1/Ellipse 9.png' },
  ],
  stats: { dangam: 25, injeolmi: 30, eoheung: -2 },
  rating: 6,
  review: '이번시즌 30자 평을 해보라는데, 어디까지 갈 수 있나',
  reviewLink: '',
  circles: {
    weekUsage: 80,
    scheduleReliability: 90,
    seasonGrowth: 70,
    approvedWeeks: 8,
    totalOperatingWeeks: 10,
    reliableWeeks: 9,
    completedActivities: 75,
    totalActivities: 120
  },
  progress: {
    info: { total: 40, completed: 20, rate: 50 },
    competency: { total: 40, completed: 30, rate: 80 },
    experience: { total: 40, completed: 40, rate: 100 },
    career: { total: 40, completed: 4, rate: 10 }
  }
};

const Cluster4Content = () => {
  // 세션 및 본인 프로필 여부 확인
  const { data: session } = useSession();
  const { mask } = useDataMasking();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get('userId') || searchParams.get('userID');
  const isOwner = !urlUserId || (session?.user?.id === urlUserId);

  // 승인 상태 확인 함수
  const checkApprovalStatus = async () => {
    if (!session) return false;

    try {
      const response = await fetch('/api/auth/check-status');
      const result = await response.json();

      if (result.success && result.status === 'approved') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('승인 상태 확인 오류:', error);
      return false;
    }
  };

  // 수정 버튼 클릭 핸들러 (승인 상태 체크)
  const handleEditClick = async (openModalFn: () => void) => {
    // 개발 모드: 비로그인 상태에서도 모달 열기 허용
    if (!session) {
      openModalFn();
      return;
    }

    const approved = await checkApprovalStatus();

    if (!approved) {
      alert('아직 회원 상태가 어드민 승인 대기 중입니다.');
      return;
    }

    openModalFn();
};

  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const [section3Page, setSection3Page] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isTextFading, setIsTextFading] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  // 시즌 평판 모달 상태
  const [seasonReputationModalOpen, setSeasonReputationModalOpen] = useState(false);
  const [seasonReputationEditData, setSeasonReputationEditData] = useState<{
    rating: number;
    content: string;
    keyword1: string;
    keyword2: string;
  }>({ rating: 0, content: "", keyword1: "", keyword2: "" });
  const [seasonReputationSaving, setSeasonReputationSaving] = useState(false);
  const [seasonReputationError, setSeasonReputationError] = useState<string | null>(null);
  const [seasonReputationSuccess, setSeasonReputationSuccess] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");

  // 평판 키워드 목록
  interface ReputationKeyword {
    id: string | number;
    cluster_number: number;
    cluster_name: string;
    cluster_color: string;
    keyword: string;
  }
  const [reputationKeywords, setReputationKeywords] = useState<ReputationKeyword[]>([]);

  // 커스텀 스크롤바 상태 (area-8: status-badges)
  const statusBadgesRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef8 = useRef<HTMLDivElement>(null);
  const [scrollThumbTop8, setScrollThumbTop8] = useState(0);
  const [isDragging8, setIsDragging8] = useState(false);
  const dragStartY8 = useRef(0);
  const dragStartScrollTop8 = useRef(0);

  // 커스텀 스크롤바 상태 (area-9: profile-cards)
  const profileCardsRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef9 = useRef<HTMLDivElement>(null);
  const [scrollThumbTop9, setScrollThumbTop9] = useState(0);
  const [isDragging9, setIsDragging9] = useState(false);
  const dragStartY9 = useRef(0);
  const dragStartScrollTop9 = useRef(0);

  // 시즌 평판 데이터 (DB에서 가져옴)
  interface SeasonReputationData {
    id: string;
    reviewer_id: string;
    target_user_id: string;
    season_history_id: string;
    rating: number;
    content: string;
    keyword_1: string | null;
    keyword_2: string | null;
    created_at: string;
    reviewer: {
      id: string;
      display_name: string;
      gender: string;
      birth_date: string | null;
      university: string;
      major_first: string | null;
      profile_photo_url: string | null;
      teamName: string | null;
      partName: string | null;
      vision: string | null;
    } | null;
  }
  const [seasonReputations, setSeasonReputations] = useState<SeasonReputationData[]>([
    {
      id: 'dummy-rep-1',
      reviewer_id: 'dummy-reviewer-1',
      target_user_id: 'dummy-target',
      season_history_id: 'dummy-season-1',
      rating: 6,
      content: '안녕하세요 이 시즌안녕하세요 이 시즌일이삼사오...',
      keyword_1: '#추진력추진력',
      keyword_2: '#추진력추진력',
      created_at: '2025-03-23',
      reviewer: {
        id: 'dummy-reviewer-1',
        display_name: '안유현',
        gender: '여',
        birth_date: '2002-01-01',
        university: '서울대학교',
        major_first: '미디어커뮤니케이션학과',
        profile_photo_url: '/images/0/cluster4/cluster4-1/Ellipse 10.png',
        teamName: '엔터테인먼트팀',
        partName: '내돈내산파트',
        vision: '엔비디아구글테슬라쿵'
      }
    },
    {
      id: 'dummy-rep-2',
      reviewer_id: 'dummy-reviewer-2',
      target_user_id: 'dummy-target',
      season_history_id: 'dummy-season-1',
      rating: 6,
      content: '안녕하세요 이 시즌안녕하세요 이 시즌일이삼사오...',
      keyword_1: '#추진력추진력',
      keyword_2: '#추진력추진력',
      created_at: '2025-03-23',
      reviewer: {
        id: 'dummy-reviewer-2',
        display_name: '이지민',
        gender: '여',
        birth_date: '2002-01-01',
        university: '서울대학교',
        major_first: '미디어커뮤니케이션학과',
        profile_photo_url:  '/images/0/cluster4/cluster4-1/Ellipse 11.png',
        teamName: '엔터테인먼트팀',
        partName: '내돈내산파트',
        vision: '엔비디아구글테슬라쿵'
      }
    },
    {
      id: 'dummy-rep-3',
      reviewer_id: 'dummy-reviewer-3',
      target_user_id: 'dummy-target',
      season_history_id: 'dummy-season-1',
      rating: 6,
      content: '',
      keyword_1: null,
      keyword_2: null,
      created_at: '2025-03-23',
      reviewer: {
        id: 'dummy-reviewer-3',
        display_name: '유성이',
        gender: '남',
        birth_date: '2002-01-01',
        university: '서울대학교',
        major_first: '미디어커뮤니케이션학과',
        profile_photo_url:  '/images/0/cluster4/cluster4-1/Ellipse 12.png',
        teamName: '엔터테인먼트팀',
        partName: '내돈내산파트',
        vision: '엔비디아구글테슬라쿵'
      }
    }
  ]);

  // 시즌 평판 상세 보기 모달
  const [reputationDetailModalOpen, setReputationDetailModalOpen] = useState(false);
  const [selectedReputation, setSelectedReputation] = useState<SeasonReputationData | null>(null);

  // 시즌 리뷰 모달 상태 (본인의 시즌 평가)
  const [seasonReviewModalOpen, setSeasonReviewModalOpen] = useState(false);
  const [seasonReviewEditData, setSeasonReviewEditData] = useState<{
    rating: number;
    review: string;
    link: string;
  }>({ rating: 0, review: "", link: "" });
  const [seasonReviewSaving, setSeasonReviewSaving] = useState(false);
  const [seasonReviewError, setSeasonReviewError] = useState<string | null>(null);
  const [seasonReviewSuccess, setSeasonReviewSuccess] = useState(false);

  // 활동 통계 (주차 성장률)
  const [activityStats, setActivityStats] = useState<{
    info: { total: number; success: number };
    competency: { total: number; success: number };
    experience: { total: number; success: number };
    career: { total: number; success: number };
  }>({
    info: { total: 0, success: 0 },
    competency: { total: 0, success: 0 },
    experience: { total: 0, success: 0 },
    career: { total: 0, success: 0 },
  });

  // 현재 시즌 정보 상태 (DB에서 가져옴)
  const [currentSeasonInfo, setCurrentSeasonInfo] = useState<{
    year: number;
    name: string;
    currentWeek: number;
    isClubBreak: boolean;
    holidayName: string | null;
    isBreakSeason: boolean;
    fromSeason: string | null;
    toSeason: string | null;
  } | null>(null);

  // 사용자의 상태 (status, growth_status)
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [growthStatus, setGrowthStatus] = useState<string | null>(null);
  // user_profiles.role 기본값 (역할 이력이 없을 때 사용)
  const [userDefaultRole, setUserDefaultRole] = useState<string | null>(null);

  // 성장 종료 정보
  const [growthEndInfo, setGrowthEndInfo] = useState<{
    year: number | null;
    seasonName: string | null;
    weekNumber: number | null;
    isBreak?: boolean;
  } | null>({
    year: 2024,
    seasonName: '가을',
    weekNumber: 14,
    isBreak: false
  });

  // 성장 시작 정보
  const [growthStartInfo, setGrowthStartInfo] = useState<{
    year: number | null;
    seasonName: string | null;
    weekNumber: number | null;
    isBreak?: boolean;
  } | null>({
    year: 2024,
    seasonName: '가을',
    weekNumber: 14,
    isBreak: false
  });

  // 성장 기간 통계 (시즌 기반)
  const [growthPeriodStats, setGrowthPeriodStats] = useState<{
    availableSeasons: number;
    approvedSeasons: number;
    restSeasons: number;
  } | null>({
    availableSeasons: 5,
    approvedSeasons: 4,
    restSeasons: 1
  });

  // 시즌 역할 이력 타입
  interface SeasonRoleItem {
    teamName: string | null;
    partName: string | null;
    roleLabel: string;
    isAdmin: boolean;  // 운영진(팀장, 앰배서더) 여부
    adminGeneration: number | null;  // 운영진 기수 (예: 3, 4)
    startedAt: string;
    profileImage?: string;
  }

  // 시즌 히스토리 (API에서 가져온 동적 데이터)
  interface SeasonHistoryData {
    id: string;
    year: string;
    season: string;
    dateRange: string;
    status: string;
    statusClass: string;
    image: string;
    approvedWeeks: number;
    totalWeeks: number;
    roleInSeason: string;
    // Qualified 승인 상태 (Part, Team, Cluv, Supervise 4개 도장)
    isQualified: boolean;
    // 시즌 상태 (역할/팀/파트 이력)
    seasonRoles?: SeasonRoleItem[];
    // 하드코딩 데이터와 호환을 위한 기본값 필드
    stats: { dangam: number; injeolmi: number; eoheung: number };
    rating: number;
    review: string;
    reviewLink: string;
    circles: {
      weekUsage: number;
      scheduleReliability: number;
      seasonGrowth: number;
      // 실제 값 표시용 추가 데이터
      approvedWeeks?: number;
      totalOperatingWeeks?: number;
      reliableWeeks?: number;
      completedActivities?: number;
      totalActivities?: number;
    };
    progress: {
      info: { total: number; completed: number; rate: number };
      competency: { total: number; completed: number; rate: number };
      experience: { total: number; completed: number; rate: number };
      career: { total: number; completed: number; rate: number };
    };
  }
  const [seasonHistories, setSeasonHistories] = useState<SeasonHistoryData[]>([]);

  // 역할 이력 데이터
  const [userRoleHistory, setUserRoleHistory] = useState<Array<{
    id: string;
    user_id: string;
    role: string;
    started_at: string;
    ended_at: string | null;
  }>>([]);

  // 팀/파트 이력 데이터
  const [userTeamParts, setUserTeamParts] = useState<Array<{
    user_id: string;
    team_id: string;
    part_id: string;
    joined_at: string;
    left_at: string | null;
  }>>([]);

  // 팀/파트 목록
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [parts, setParts] = useState<Array<{ id: string; name: string; team_id: string }>>([]);

  // 메인 프로필 사진
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>('/images/0/cluster4/cluster4-1/이안0.png');

  // 현재 선택된 시즌 데이터 (동적 데이터 우선, 없으면 기본 데이터)
  const currentSeason: SeasonHistoryData = seasonHistories.length > 0
    ? seasonHistories[section3Page] || seasonHistories[0]
    : defaultSeasonData as SeasonHistoryData;

  // 현재 시즌 정보 가져오기
  useEffect(() => {
    const fetchCurrentSeason = async () => {
      const today = new Date().toISOString().split('T')[0];

      // 현재 주차 정보 가져오기 (is_club_break, holiday_name 포함)
      const { data: currentWeekData } = await supabase
        .from('weeks')
        .select('id, week_number, is_club_break, holiday_name, seasons (id, name, year)')
        .lte('start_date', today)
        .gte('end_date', today)
        .maybeSingle();

      if (currentWeekData) {
        // 시즌 이름 변환 (spring -> 봄, summer -> 여름, fall -> 가을, winter -> 겨울)
        const seasonNameMap: { [key: string]: string } = {
          'spring': '봄',
          'summer': '여름',
          'fall': '가을',
          'winter': '겨울'
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const seasonData = currentWeekData.seasons as any;
        const rawSeasonName = seasonData?.name || '';

        // break 시즌인지 확인 (예: spring_summer_break, fall_winter_break)
        const isBreakSeason = rawSeasonName.toLowerCase().includes('break');
        let fromSeason: string | null = null;
        let toSeason: string | null = null;
        let displayName = seasonNameMap[rawSeasonName] || rawSeasonName;

        if (isBreakSeason) {
          // break 시즌 이름 파싱 (spring_summer_break -> 봄, 여름)
          const parts = rawSeasonName.replace('_break', '').split('_');
          if (parts.length >= 2) {
            fromSeason = seasonNameMap[parts[0]] || parts[0];
            toSeason = seasonNameMap[parts[1]] || parts[1];
          }
          displayName = '시즌 전환';
        }

        setCurrentSeasonInfo({
          year: seasonData?.year || 0,
          name: displayName,
          currentWeek: currentWeekData.week_number,
          isClubBreak: currentWeekData.is_club_break || false,
          holidayName: currentWeekData.holiday_name || null,
          isBreakSeason,
          fromSeason,
          toSeason
        });
      }
    };

    fetchCurrentSeason();
  }, []);

  // 활동 통계 가져오기 (현재 주차 기준)
  useEffect(() => {
    const fetchActivityStats = async () => {
      if (!session?.user?.id && !urlUserId) return;

      const today = new Date().toISOString().split('T')[0];
      const targetUserId = urlUserId || session?.user?.id;

      // 1. 현재 주차 정보 가져오기
      const { data: currentWeekData } = await supabase
        .from('weeks')
        .select('id, end_date')
        .lte('start_date', today)
        .gte('end_date', today)
        .maybeSingle();

      if (!currentWeekData) return;

      const weekId = currentWeekData.id;

      // 2. activity_types 정보 가져오기 (eligible 조건 포함)
      const { data: activityTypesData } = await supabase
        .from('activity_types')
        .select('id, cluster_id, eligible_min_approved_weeks, eligible_max_approved_weeks, count_once_in_total')
        .eq('is_active', true);

      if (!activityTypesData) return;

      // cluster-4-card와 동일한 하드코딩 리스트 사용
      const infoTypeIds = ['calendar', 'essay', 'forum', 'infodesk', 'session', 'wisdom', 'etc_a'];
      const competencyTypeIds: string[] = [];
      const experienceTypeIds: string[] = [];
      const careerTypeIds: string[] = [];
      type ExperienceTypeInfo = {
        id: string;
        eligible_min_approved_weeks: number | null;
        eligible_max_approved_weeks: number | null;
        count_once_in_total: boolean | null;
      };
      const experienceInfos: ExperienceTypeInfo[] = [];

      activityTypesData.forEach((at) => {
        if (at.cluster_id === 'practical_competency') {
          competencyTypeIds.push(at.id);
        } else if (at.cluster_id === 'practical_experience') {
          experienceTypeIds.push(at.id);
          experienceInfos.push({
            id: at.id,
            eligible_min_approved_weeks: at.eligible_min_approved_weeks,
            eligible_max_approved_weeks: at.eligible_max_approved_weeks,
            count_once_in_total: at.count_once_in_total,
          });
        } else if (at.cluster_id === 'practical_career') {
          careerTypeIds.push(at.id);
        }
      });

      // 3. weekly_activities 가져오기 (열린 활동)
      const { data: activitiesData } = await supabase
        .from('weekly_activities')
        .select('activity_type_id, is_active, opened_at')
        .eq('week_id', weekId);

      if (!activitiesData) return;

      const activeActivities = activitiesData.filter(a => a.is_active);

      // 4. 프로필 API에서 activity_records, activity_details 가져오기
      const res = await fetch(urlUserId ? `/api/users/${urlUserId}` : '/api/profile');
      if (!res.ok) return;

      const profileResult = await res.json();
      const apiActivityRecords = profileResult.activityRecords || [];
      const apiActivityDetails = profileResult.activityDetails || [];
      const onboardingWeekId = profileResult.onboardingWeekId || null;

      // 온보딩 주차 여부 확인
      const isOnboardingWeek = weekId === onboardingWeekId;

      // 5. 누적 성공 주차 수 계산 (cluster-4-card와 동일한 로직)
      const { data: successWeeksData } = await supabase
        .from('success_weeks')
        .select('week_id, weeks!inner(end_date)')
        .eq('user_id', targetUserId);

      let currentCumulativeApproved = 0;
      if (successWeeksData && successWeeksData.length > 0) {
        currentCumulativeApproved = successWeeksData.filter((sw: any) => {
          const weekEndDate = sw.weeks?.end_date;
          return weekEndDate && weekEndDate <= currentWeekData.end_date;
        }).length;
      }
      // 온보딩 주차도 누적에 포함 (success_weeks에 없는 경우)
      if (onboardingWeekId) {
        const onboardingAlreadyCounted = successWeeksData?.some((sw: any) => sw.week_id === onboardingWeekId);
        if (!onboardingAlreadyCounted) {
          const { data: onboardingWeekInfo } = await supabase
            .from('weeks')
            .select('end_date')
            .eq('id', onboardingWeekId)
            .maybeSingle();
          if (onboardingWeekInfo && onboardingWeekInfo.end_date <= currentWeekData.end_date) {
            currentCumulativeApproved += 1;
          }
        }
      }

      // 6. 유저의 모든 완료 활동 저장 (experience eligible - count_once_in_total 체크용)
      const allCompletedActivities = apiActivityRecords
        .filter((ar: { is_completed: boolean }) => ar.is_completed)
        .map((ar: { week_id: string; activity_type_id: string }) => ({
          week_id: ar.week_id,
          activity_type_id: ar.activity_type_id
        }));

      // 해당 주차의 approved activity_type_id 목록
      const weekApprovedActivities = apiActivityRecords.filter(
        (ar: { week_id: string; is_completed: boolean }) => ar.week_id === weekId && ar.is_completed
      );
      const approvedActivityTypes = new Set<string>(
        weekApprovedActivities.map((a: { activity_type_id: string }) => a.activity_type_id)
      );

      // 해당 주차의 activity_details
      const filteredActivityDetails = apiActivityDetails.filter(
        (ad: { week_id: string }) => ad.week_id === weekId
      );

      // 7. 각 클러스터별 통계 계산
      const calcStats = (typeIds: string[]) => {
        const total = activeActivities.filter(a => typeIds.includes(a.activity_type_id)).length;
        const now = Date.now();
        const deadline = 48 * 60 * 60 * 1000; // 48시간

        const success = activeActivities.filter(a => {
          if (!typeIds.includes(a.activity_type_id)) return false;
          if (!approvedActivityTypes.has(a.activity_type_id)) return false;

          // 2차 정보 확인
          const detail = filteredActivityDetails.find(
            (d: { activity_type_id: string }) => d.activity_type_id === a.activity_type_id
          );
          const hasSecondaryInfo = detail && (
            (detail.sub_title && detail.sub_title.trim() !== '') ||
            (detail.output_links && detail.output_links.some((link: { url?: string }) => link?.url && link.url.trim() !== ''))
          );

          if (hasSecondaryInfo) return true;

          // 48시간 경과 확인
          if (a.opened_at) {
            const openedTime = new Date(a.opened_at).getTime();
            if (now - openedTime >= deadline) return true;
          }

          return false;
        }).length;

        return { total, success };
      };

      // 8. 실무 경험 eligible 조건 체크 (cluster-4-card와 동일한 로직)
      const calcExperienceStats = () => {
        let experienceTotal = 0;
        const experienceActivities = activeActivities.filter(a => experienceTypeIds.includes(a.activity_type_id));

        experienceActivities.forEach(a => {
          const typeInfo = experienceInfos.find(info => info.id === a.activity_type_id);

          if (!typeInfo) {
            experienceTotal++; // 정보가 없으면 기본 포함
            return;
          }

          // eligible_min/max 체크 (null이면 제한 없음)
          const minWeek = typeInfo.eligible_min_approved_weeks ?? 1;
          const maxWeek = typeInfo.eligible_max_approved_weeks ?? 999;

          // 누적 주차가 eligible 범위 내인지 확인
          if (currentCumulativeApproved >= minWeek && currentCumulativeApproved <= maxWeek) {
            // count_once_in_total 체크 (1회만 가능한 활동)
            if (typeInfo.count_once_in_total) {
              // 이미 이전 주차에서 완료했는지 확인
              const previouslyCompleted = allCompletedActivities.some(
                (ca: { week_id: string; activity_type_id: string }) => ca.activity_type_id === a.activity_type_id && ca.week_id !== weekId
              );
              if (!previouslyCompleted) {
                experienceTotal++;
              }
            } else {
              experienceTotal++;
            }
          }
        });

        // success 계산 (강화 성공 기준: is_completed + (48시간 경과 OR 2차 정보 기입))
        const now = Date.now();
        const deadline = 48 * 60 * 60 * 1000; // 48시간

        const experienceSuccess = experienceActivities.filter(a => {
          if (!approvedActivityTypes.has(a.activity_type_id)) return false;

          // 2차 정보 확인
          const detail = filteredActivityDetails.find(
            (d: { activity_type_id: string }) => d.activity_type_id === a.activity_type_id
          );
          const hasSecondaryInfo = detail && (
            (detail.sub_title && detail.sub_title.trim() !== '') ||
            (detail.output_links && detail.output_links.some((link: { url?: string }) => link?.url && link.url.trim() !== ''))
          );

          if (hasSecondaryInfo) return true;

          // 48시간 경과 확인
          if (a.opened_at) {
            const openedTime = new Date(a.opened_at).getTime();
            if (now - openedTime >= deadline) return true;
          }

          return false;
        }).length;

        return { total: experienceTotal, success: experienceSuccess };
      };

      // 온보딩 주차면 모든 파트 total=0, 아니면 정상 계산
      if (isOnboardingWeek) {
        setActivityStats({
          info: { total: 0, success: 0 },
          competency: { total: 0, success: 0 },
          experience: { total: 0, success: 0 },
          career: { total: 0, success: 0 },
        });
      } else {
        const infoStats = calcStats(infoTypeIds);
        const competencyStats = calcStats(competencyTypeIds);
        const experienceStats = calcExperienceStats(); // eligible 조건 적용
        const careerStats = calcStats(careerTypeIds);

        setActivityStats({
          info: infoStats,
          // 실무 역량: 항상 total=1 (매주 최대 1개 선택 가능)
          competency: { total: 1, success: Math.min(competencyStats.success, 1) },
          experience: experienceStats,
          career: careerStats,
        });
      }
    };

    fetchActivityStats();
  }, [session?.user?.id, urlUserId]);

  // 사용자 프로필에서 status, growth_status, growthEndInfo, growthStartInfo, growthPeriodStats, role 가져오기
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        // urlUserId가 있으면 해당 사용자, 없으면 본인 프로필 조회
        if (urlUserId) {
          const res = await fetch(`/api/profile/?userId=${urlUserId}`);
          if (res.ok) {
            const json = await res.json();
            setUserStatus(json.growthInfo?.status || null);
            setGrowthStatus(json.growthInfo?.growthStatus || null);
            // user_profiles.role 기본값 저장
            if (json.data?.role) {
              setUserDefaultRole(json.data.role);
            }
            // 성장 시작 정보 설정
            if (json.growthInfo?.startWeekInfo) {
              setGrowthStartInfo({
                year: json.growthInfo.startWeekInfo.year,
                seasonName: json.growthInfo.startWeekInfo.seasonName,
                weekNumber: json.growthInfo.startWeekInfo.weekNumber,
                isBreak: json.growthInfo.startWeekInfo.isBreak
              });
            } else {
              setGrowthStartInfo(null);
            }
            // 성장 종료 정보 설정
            if (json.growthInfo?.endWeekInfo) {
              setGrowthEndInfo({
                year: json.growthInfo.endWeekInfo.year,
                seasonName: json.growthInfo.endWeekInfo.seasonName,
                weekNumber: json.growthInfo.endWeekInfo.weekNumber,
                isBreak: json.growthInfo.endWeekInfo.isBreak
              });
            } else {
              setGrowthEndInfo(null);
            }
            // 성장 기간 통계 설정
            if (json.growthPeriodStats) {
              setGrowthPeriodStats({
                availableSeasons: json.growthPeriodStats.availableSeasons ?? 0,
                approvedSeasons: json.growthPeriodStats.approvedSeasons ?? 0,
                restSeasons: json.growthPeriodStats.restSeasons ?? 0
              });
            }
            // 시즌 히스토리 설정
            if (json.seasonHistories && json.seasonHistories.length > 0) {
              const formattedSeasons = formatSeasonHistories(
                json.seasonHistories,
                json.userRoleHistory || [],
                json.userTeamParts || [],
                json.teams || [],
                json.parts || []
              );
              setSeasonHistories(formattedSeasons);
            }
            // 역할/팀/파트 이력 설정
            if (json.userRoleHistory) setUserRoleHistory(json.userRoleHistory);
            if (json.userTeamParts) setUserTeamParts(json.userTeamParts);
            if (json.teams) setTeams(json.teams);
            if (json.parts) setParts(json.parts);
            // 메인 프로필 사진 설정
            if (json.data?.profile_photo_url) setProfilePhotoUrl(json.data.profile_photo_url);
          }
        } else if (session?.user?.id) {
          const res = await fetch('/api/profile/');
          if (res.ok) {
            const json = await res.json();
            setUserStatus(json.growthInfo?.status || null);
            setGrowthStatus(json.growthInfo?.growthStatus || null);
            // user_profiles.role 기본값 저장
            if (json.data?.role) {
              setUserDefaultRole(json.data.role);
            }
            // 성장 시작 정보 설정
            if (json.growthInfo?.startWeekInfo) {
              setGrowthStartInfo({
                year: json.growthInfo.startWeekInfo.year,
                seasonName: json.growthInfo.startWeekInfo.seasonName,
                weekNumber: json.growthInfo.startWeekInfo.weekNumber,
                isBreak: json.growthInfo.startWeekInfo.isBreak
              });
            } else {
              setGrowthStartInfo(null);
            }
            // 성장 종료 정보 설정
            if (json.growthInfo?.endWeekInfo) {
              setGrowthEndInfo({
                year: json.growthInfo.endWeekInfo.year,
                seasonName: json.growthInfo.endWeekInfo.seasonName,
                weekNumber: json.growthInfo.endWeekInfo.weekNumber,
                isBreak: json.growthInfo.endWeekInfo.isBreak
              });
            } else {
              setGrowthEndInfo(null);
            }
            // 성장 기간 통계 설정
            if (json.growthPeriodStats) {
              setGrowthPeriodStats({
                availableSeasons: json.growthPeriodStats.availableSeasons ?? 0,
                approvedSeasons: json.growthPeriodStats.approvedSeasons ?? 0,
                restSeasons: json.growthPeriodStats.restSeasons ?? 0
              });
            }
            // 시즌 히스토리 설정
            if (json.seasonHistories && json.seasonHistories.length > 0) {
              const formattedSeasons = formatSeasonHistories(
                json.seasonHistories,
                json.userRoleHistory || [],
                json.userTeamParts || [],
                json.teams || [],
                json.parts || []
              );
              setSeasonHistories(formattedSeasons);
            }
            // 역할/팀/파트 이력 설정
            if (json.userRoleHistory) setUserRoleHistory(json.userRoleHistory);
            if (json.userTeamParts) setUserTeamParts(json.userTeamParts);
            if (json.teams) setTeams(json.teams);
            if (json.parts) setParts(json.parts);
            // 메인 프로필 사진 설정
            if (json.data?.profile_photo_url) setProfilePhotoUrl(json.data.profile_photo_url);
          }
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();
  }, [urlUserId, session?.user?.id]);

  // 시즌 평판 데이터 가져오기 함수
  const fetchSeasonReputations = async (targetId: string, seasonHistoryId: string) => {
    try {
      const res = await fetch(`/api/season-reputations?targetUserId=${targetId}&seasonHistoryId=${seasonHistoryId}`);
      if (res.ok) {
        const json = await res.json();
        console.log("[fetchSeasonReputations] API 응답:", json);
        if (json.success && json.data) {
          console.log("[fetchSeasonReputations] 평판 데이터:", json.data);
          if (json.data.length > 0) {
            console.log("[fetchSeasonReputations] 첫번째 평판의 reviewer:", json.data[0].reviewer);
          }
          setSeasonReputations(json.data);
        }
      }
    } catch (error) {
      console.error('Error fetching season reputations:', error);
    }
  };

  // 평판 키워드 목록 가져오기
  const fetchReputationKeywords = async () => {
    try {
      const res = await fetch('/api/reputation-keywords');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReputationKeywords(json.data);
        }
      }
    } catch (error) {
      console.error('Error fetching reputation keywords:', error);
    }
  };

  // 컴포넌트 마운트 시 키워드 목록 가져오기
  useEffect(() => {
    fetchReputationKeywords();
  }, []);

  // 시즌 평판 데이터 가져오기 (시즌 변경 시마다)
  useEffect(() => {
    // 대상 사용자 ID (urlUserId가 있으면 해당 사용자, 없으면 본인)
    const targetId = urlUserId || session?.user?.id;
    if (!targetId || !currentSeason?.id) return;

    console.log("[fetchSeasonReputations] 현재 시즌:", currentSeason);
    console.log("[fetchSeasonReputations] currentSeason.id:", currentSeason.id);
    console.log("[fetchSeasonReputations] targetId:", targetId);

    fetchSeasonReputations(targetId, currentSeason.id);
  }, [urlUserId, session?.user?.id, currentSeason?.id]);

  // 역할 라벨 매핑
  const roleLabels: { [key: string]: string } = {
    'crew': '일반',
    'crew_regular': '일반',
    'crew_normal': '일반',
    'crew_advanced_agent': '심화(에이전트)',
    'crew_agent': '심화(에이전트)',
    'crew_advanced_part_leader': '심화(파트장)',
    'crew_partleader': '심화(파트장)',
    'operations_partleader': '심화(파트장)',
    'part_leader': '심화(파트장)',
    'admin_team_leader': '운영진(팀장)',
    'crew_team_leader': '운영진(팀장)',
    'operations_teamleader': '운영진(팀장)',
    'admin_ambassador': '운영진(앰배서더)',
    'crew_ambassador': '운영진(앰배서더)',
    'operations_ambassador': '운영진(앰배서더)',
  };

  // 운영진 역할인지 확인
  const isAdminRole = (role: string): boolean => {
    return ['admin_team_leader', 'crew_team_leader', 'operations_teamleader', 'admin_ambassador', 'crew_ambassador', 'operations_ambassador'].includes(role);
  };

  // 시즌 히스토리 포맷팅 함수
  const formatSeasonHistories = (
    histories: Array<{
      id: string;
      role_in_season: string;
      approved_weeks: number;
      total_weeks: number;
      progress_status: string;
      is_qualified?: boolean;
      rating?: number;
      review?: string;
      review_link?: string;
      seasons: {
        id: string;
        year: number;
        name: string;
        start_date: string;
        end_date: string;
      };
      seasonPoints?: {
        stars: number;
        shields: number;
        lightnings: number;
      };
      seasonStats?: {
        weekUsageRate: number;
        approvedWeeks: number;
        totalOperatingWeeks: number;
        reliabilityRate: number;
        reliableWeeks: number;
        growthRate: number;
        completedActivities: number;
        totalActivities: number;
        clusterStats?: {
          info: { total: number; completed: number };
          competency: { total: number; completed: number };
          experience: { total: number; completed: number };
          career: { total: number; completed: number };
        };
      };
    }>,
    roleHistory: Array<{
      id: string;
      user_id: string;
      role: string;
      started_at: string;
      ended_at: string | null;
    }>,
    teamParts: Array<{
      user_id: string;
      team_id: string;
      part_id: string;
      joined_at: string;
      left_at: string | null;
    }>,
    teamsData: Array<{ id: string; name: string }>,
    partsData: Array<{ id: string; name: string; team_id: string }>
  ): SeasonHistoryData[] => {
    const seasonNameMap: { [key: string]: string } = {
      'spring': '봄',
      'summer': '여름',
      'fall': '가을',
      'winter': '겨울'
    };

    const seasonImageMap: { [key: string]: string } = {
      '봄': '/images/0/cluster4/시즌 이미지/봄_후보_1.png',
      '여름': '/images/0/cluster4/cluster4-1/image.png',
      '가을': '/images/0/cluster4/cluster4-1/image2.png',
      '겨울': '/images/0/cluster4/cluster4-1/image3.png'
    };

    const getStatusInfo = (progressStatus: string): { status: string; statusClass: string } => {
      switch (progressStatus) {
        case 'in_progress':
          return { status: '시즌 진행 중', statusClass: 'in-progress' };
        case 'completed':
          return { status: '시즌 성공', statusClass: 'completed' };
        case 'full_rest':
        case 'resting':
          return { status: '시즌 휴식', statusClass: 'resting' };
        case 'suspended':
          return { status: '시즌 중단', statusClass: 'suspended' };
        default:
          return { status: '시즌 진행 중', statusClass: 'in-progress' };
      }
    };

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayOfWeek = days[date.getDay()];
      return `${year} / ${month} / ${day} (${dayOfWeek})`;
    };

    return histories.map((sh: {
      id: string;
      role_in_season: string;
      approved_weeks: number;
      total_weeks: number;
      progress_status: string;
      is_qualified?: boolean;
      rating?: number;
      review?: string;
      review_link?: string;
      seasons: {
        id: string;
        year: number;
        name: string;
        start_date: string;
        end_date: string;
      };
      seasonPoints?: {
        stars: number;
        shields: number;
        lightnings: number;
      };
      seasonStats?: {
        weekUsageRate: number;
        approvedWeeks: number;
        totalOperatingWeeks: number;
        reliabilityRate: number;
        reliableWeeks: number;
        growthRate: number;
        completedActivities: number;
        totalActivities: number;
        clusterStats?: {
          info: { total: number; completed: number };
          competency: { total: number; completed: number };
          experience: { total: number; completed: number };
          career: { total: number; completed: number };
        };
      };
    }) => {
      const seasonName = seasonNameMap[sh.seasons?.name] || sh.seasons?.name || '';
      const statusInfo = getStatusInfo(sh.progress_status);
      const startDate = formatDate(sh.seasons?.start_date || '');
      const endDate = formatDate(sh.seasons?.end_date || '');

      // 시즌별 포인트 (API에서 가져온 데이터)
      const seasonPoints = sh.seasonPoints || { stars: 0, shields: 0, lightnings: 0 };
      // 시즌별 통계 (API에서 가져온 데이터)
      const seasonStats = sh.seasonStats || {
        weekUsageRate: 0,
        approvedWeeks: 0,
        totalOperatingWeeks: 0,
        reliabilityRate: 0,
        reliableWeeks: 0,
        growthRate: 0,
        completedActivities: 0,
        totalActivities: 0,
        clusterStats: {
          info: { total: 0, completed: 0 },
          competency: { total: 0, completed: 0 },
          experience: { total: 0, completed: 0 },
          career: { total: 0, completed: 0 }
        }
      };

      // 클러스터별 강화율 계산
      const clusterStats = seasonStats.clusterStats || {
        info: { total: 0, completed: 0 },
        competency: { total: 0, completed: 0 },
        experience: { total: 0, completed: 0 },
        career: { total: 0, completed: 0 }
      };

      // 해당 시즌 기간 내 역할/팀/파트 이력 계산
      const seasonStartDate = sh.seasons?.start_date || '';
      const seasonEndDate = sh.seasons?.end_date || '';
      const seasonYear = sh.seasons?.year || 0;

      // 시즌 기간 내에 유효한 역할/팀/파트 조합 찾기
      const seasonRoleItems: SeasonRoleItem[] = [];

      // 역할 이력 중 해당 시즌과 겹치는 것들 필터링
      const relevantRoles = roleHistory.filter(rh => {
        const roleStart = rh.started_at;
        const roleEnd = rh.ended_at || new Date().toISOString().split('T')[0];
        // 시즌 기간과 역할 기간이 겹치는지 확인
        return roleStart <= seasonEndDate && roleEnd >= seasonStartDate;
      });

      // 팀/파트 이력 중 해당 시즌과 겹치는 것들 필터링
      const relevantTeamParts = teamParts.filter(tp => {
        const tpStart = tp.joined_at?.split(' ')[0].split('T')[0] || '';
        const tpEnd = tp.left_at?.split(' ')[0].split('T')[0] || new Date().toISOString().split('T')[0];
        return tpStart <= seasonEndDate && tpEnd >= seasonStartDate;
      });

      // 역할/팀/파트 조합 생성 (변경 시점 기준으로 정렬)
      // 각 변경 시점마다 새로운 상태 항목 생성
      const changePoints = new Set<string>();
      relevantRoles.forEach(rh => changePoints.add(rh.started_at));
      relevantTeamParts.forEach(tp => changePoints.add(tp.joined_at));
      const sortedChangePoints = Array.from(changePoints).sort();

      // 역할 라벨 매핑 (함수 내부용)
      const roleLabelMap: { [key: string]: string } = {
        'crew': '일반',
        'crew_regular': '일반',
        'crew_normal': '일반',
        'crew_advanced_agent': '심화(에이전트)',
        'crew_agent': '심화(에이전트)',
        'crew_advanced_part_leader': '심화(파트장)',
        'crew_partleader': '심화(파트장)',
        'part_leader': '심화(파트장)',
        'admin_team_leader': '운영진(팀장)',
        'crew_team_leader': '운영진(팀장)',
        'operations_teamleader': '운영진(팀장)',
        'admin_ambassador': '운영진(앰배서더)',
        'crew_ambassador': '운영진(앰배서더)',
        'operations_ambassador': '운영진(앰배서더)',
      };

      // 운영진 역할 확인 함수
      const checkIsAdmin = (role: string): boolean => {
        return ['admin_team_leader', 'crew_team_leader', 'operations_teamleader', 'admin_ambassador', 'crew_ambassador', 'operations_ambassador'].includes(role);
      };

      // 각 변경 시점에서의 상태 계산
      sortedChangePoints.forEach(changePoint => {
        // 해당 시점에 유효한 역할 찾기
        const activeRole = relevantRoles.find(rh => {
          const roleStart = rh.started_at;
          const roleEnd = rh.ended_at || new Date().toISOString().split('T')[0];
          return roleStart <= changePoint && roleEnd >= changePoint;
        });

        // 해당 시점에 유효한 팀/파트 찾기 (left_at은 미포함, 즉 [joined_at, left_at) 범위)
        const activeTeamPart = relevantTeamParts.find(tp => {
          const tpStart = tp.joined_at?.split(' ')[0].split('T')[0] || '';
          const tpEnd = tp.left_at?.split(' ')[0].split('T')[0] || '9999-12-31';
          // left_at이 없으면(is_current) 포함, 있으면 미포함으로 처리
          return tpStart <= changePoint && (tp.left_at === null || changePoint < tpEnd);
        });

        if (activeRole || activeTeamPart) {
          const role = activeRole?.role || sh.role_in_season || 'crew_regular';
          const isAdmin = checkIsAdmin(role);
          const teamName = activeTeamPart ? teamsData.find(t => t.id === activeTeamPart.team_id)?.name || null : null;
          const partName = activeTeamPart ? partsData.find(p => p.id === activeTeamPart.part_id)?.name || null : null;

          // 운영진 역할의 경우 특별 처리
          let roleLabel = roleLabelMap[role] || role;
          let adminGeneration: number | null = null;

          if (isAdmin) {
            // 운영진 기수 계산 (시즌 년도 기반으로 계산 - 예시: 2025년 가을 시즌 = 3기, 2026년 = 4기 등)
            // 이 부분은 실제 비즈니스 로직에 맞게 조정 필요
            adminGeneration = seasonYear >= 2026 ? seasonYear - 2022 : seasonYear - 2022;

            // 팀장의 경우 팀 이름 포함
            if (role.includes('team_leader') && teamName) {
              roleLabel = `팀장(${teamName})`;
            } else if (role.includes('ambassador')) {
              roleLabel = '앰배서더';
            }
          }

          // 일반/심화 크루는 팀/파트 정보가 있어야만 표시
          // 운영진은 팀/파트 없어도 "클럽 단위"로 표시
          if (!isAdmin && (!teamName || !partName)) {
            return; // 일반/심화 크루인데 팀/파트 정보 없으면 스킵
          }

          // 중복 체크: 같은 조합이 이미 있는지 확인
          const isDuplicate = seasonRoleItems.some(item =>
            item.teamName === teamName &&
            item.partName === partName &&
            item.roleLabel === roleLabel &&
            item.isAdmin === isAdmin
          );

          if (!isDuplicate) {
            seasonRoleItems.push({
              teamName,
              partName,
              roleLabel,
              isAdmin,
              adminGeneration,
              startedAt: changePoint
            });
          }
        }
      });

      // 변경 이력이 없으면 기본 역할로 추가
      if (seasonRoleItems.length === 0 && sh.role_in_season) {
        const role = sh.role_in_season;
        const isAdmin = checkIsAdmin(role);
        let roleLabel = roleLabelMap[role] || role;
        let adminGeneration: number | null = null;

        // 시즌 기간 중 유효한 팀/파트 찾기 (가장 최근 것)
        const latestTeamPart = relevantTeamParts.length > 0
          ? relevantTeamParts.sort((a, b) => b.joined_at.localeCompare(a.joined_at))[0]
          : null;
        const teamName = latestTeamPart ? teamsData.find(t => t.id === latestTeamPart.team_id)?.name || null : null;
        const partName = latestTeamPart ? partsData.find(p => p.id === latestTeamPart.part_id)?.name || null : null;

        if (isAdmin) {
          adminGeneration = seasonYear >= 2026 ? seasonYear - 2022 : seasonYear - 2022;
          if (role.includes('ambassador')) {
            roleLabel = '앰배서더';
          } else if (role.includes('team_leader') && teamName) {
            roleLabel = `팀장(${teamName})`;
          }

          // 운영진은 팀/파트 없어도 추가
          seasonRoleItems.push({
            teamName: null,
            partName: null,
            roleLabel,
            isAdmin,
            adminGeneration,
            startedAt: seasonStartDate
          });
        } else if (teamName && partName) {
          // 일반/심화 크루는 팀/파트 정보가 있을 때만 추가
          seasonRoleItems.push({
            teamName,
            partName,
            roleLabel,
            isAdmin,
            adminGeneration,
            startedAt: seasonStartDate
          });
        }
      }

      return {
        id: sh.id,
        year: String(sh.seasons?.year || ''),
        season: seasonName,
        dateRange: `${startDate} - ${endDate}`,
        status: statusInfo.status,
        statusClass: statusInfo.statusClass,
        image: seasonImageMap[seasonName] || '/images/0/cluster4/시즌 이미지/봄_후보_1.png',
        approvedWeeks: sh.approved_weeks || 0,
        totalWeeks: sh.total_weeks || 0,
        roleInSeason: sh.role_in_season || '',
        // Qualified 승인 상태 (Part, Team, Cluv, Supervise 4개 도장)
        isQualified: sh.is_qualified || false,
        // 시즌 상태 (역할/팀/파트 이력) - 최대 6개, 발생 순서대로
        seasonRoles: seasonRoleItems.slice(0, 6),
        // 시즌별 포인트 (단감=별, 인절미=방패, 어흥=번개)
        stats: {
          dangam: seasonPoints.stars,
          injeolmi: seasonPoints.shields,
          eoheung: seasonPoints.lightnings
        },
        rating: sh.rating || 0,
        review: sh.review || '',
        reviewLink: sh.review_link || '',
        // 시즌별 통계 (주차 활용도, 일정 신뢰도, 시즌 성장률)
        circles: {
          weekUsage: seasonStats.weekUsageRate,
          scheduleReliability: seasonStats.reliabilityRate,
          seasonGrowth: seasonStats.growthRate,
          // 추가 데이터 (실제 값 표시용)
          approvedWeeks: seasonStats.approvedWeeks,
          totalOperatingWeeks: seasonStats.totalOperatingWeeks,
          reliableWeeks: seasonStats.reliableWeeks,
          completedActivities: seasonStats.completedActivities,
          totalActivities: seasonStats.totalActivities
        },
        progress: {
          info: {
            total: clusterStats.info.total,
            completed: clusterStats.info.completed,
            rate: clusterStats.info.total > 0 ? Math.round((clusterStats.info.completed / clusterStats.info.total) * 100) : 0
          },
          competency: {
            total: clusterStats.competency.total,
            completed: clusterStats.competency.completed,
            rate: clusterStats.competency.total > 0 ? Math.round((clusterStats.competency.completed / clusterStats.competency.total) * 100) : 0
          },
          experience: {
            total: clusterStats.experience.total,
            completed: clusterStats.experience.completed,
            rate: clusterStats.experience.total > 0 ? Math.round((clusterStats.experience.completed / clusterStats.experience.total) * 100) : 0
          },
          career: {
            total: clusterStats.career.total,
            completed: clusterStats.career.completed,
            rate: clusterStats.career.total > 0 ? Math.round((clusterStats.career.completed / clusterStats.career.total) * 100) : 0
          }
        }
      };
    });
  };

  // 성장 상태를 badge 텍스트로 변환 (status와 growth_status 두 개 사용)
  const getGrowthBadgeText = (status: string | null, growthStatus: string | null): string => {
    // 1. 성장 완료 체크 (최우선)
    if (
      status === 'graduated' ||
      growthStatus === '졸업 완료' ||
      growthStatus === '졸업 절차 중'
    ) {
      return '성장 완료';
    }

    // 2. 성장 중단 체크
    if (
      status === 'suspended' ||
      growthStatus === '활동 중단' ||
      growthStatus === '활동 유보'
    ) {
      return '성장 중단';
    }

    // 3. 성장 휴식 체크
    if (
      status === 'weekly_rest' ||
      status === 'seasonal_rest' ||
      growthStatus === '주차 휴식 중' ||
      growthStatus === '시즌 휴식 중' ||
      growthStatus === '공식 휴식 중'
    ) {
      return '성장 휴식';
    }

    // 4. 기본값
    return '성장 진행 중';
  };

  // 페이지 전환 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage === section3Page || isFlipping) return;

    setFlipDirection(newPage > section3Page ? 'next' : 'prev');
    setIsFlipping(true);
    setIsTextFading(true);

    // 페이드아웃 완료 후 데이터 변경
    setTimeout(() => {
      setSection3Page(newPage);
      setIsFlipping(false);
    }, 600);

    // 데이터 변경 후 잠시 뒤에 페이드인 시작
    setTimeout(() => {
      setIsTextFading(false);
    }, 650);
  };

  // 시즌 평판 모달 열기
  const openSeasonReputationModal = () => {
    setSeasonReputationEditData({ rating: 0, content: "", keyword1: "", keyword2: "" });
    setSeasonReputationError(null);
    setSeasonReputationSuccess(false);
    // 현재 보고 있는 시즌을 기본 선택
    setSelectedSeasonId(currentSeason?.id || "");
    setSeasonReputationModalOpen(true);
  };

  // 시즌 평판 저장 - 다른 사람에게 평판 남기기
  const handleSaveSeasonReputation = async () => {
    if (!urlUserId) {
      alert("평판을 남길 대상을 찾을 수 없습니다.");
      return;
    }

    if (!selectedSeasonId) {
      alert("시즌을 선택해주세요.");
      return;
    }

    setSeasonReputationSaving(true);
    setSeasonReputationError(null);

    try {
      const response = await fetch('/api/season-reputations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: urlUserId,
          seasonHistoryId: selectedSeasonId,
          rating: seasonReputationEditData.rating,
          content: seasonReputationEditData.content,
          keyword1: seasonReputationEditData.keyword1,
          keyword2: seasonReputationEditData.keyword2,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "저장에 실패했습니다.");
        return;
      }

      // 평판 목록 새로고침 (현재 보고 있는 시즌의 평판)
      if (urlUserId && currentSeason?.id) {
        fetchSeasonReputations(urlUserId, currentSeason.id);
      }

      alert("저장되었습니다.");
      setSeasonReputationModalOpen(false);
      setSeasonReputationEditData({ rating: 0, content: "", keyword1: "", keyword2: "" });
    } catch (error) {
      console.error("시즌 평판 저장 오류:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setSeasonReputationSaving(false);
    }
  };

  // 시즌 리뷰 모달 열기
  const openSeasonReviewModal = () => {
    // 현재 시즌의 rating, review, link 값을 가져와서 초기화
    setSeasonReviewEditData({
      rating: currentSeason.rating || 0,
      review: currentSeason.review || "",
      link: currentSeason.reviewLink || "",
    });
    setSeasonReviewError(null);
    setSeasonReviewSuccess(false);
    setSeasonReviewModalOpen(true);
  };

  // 시즌 리뷰 저장
  const handleSaveSeasonReview = async () => {
    if (!currentSeason?.id) {
      alert("시즌 정보를 찾을 수 없습니다.");
      return;
    }

    // 0.0~5.0 범위, 0.5 단위 검증
    if (seasonReviewEditData.rating < 0 || seasonReviewEditData.rating > 5 || (seasonReviewEditData.rating * 2) % 1 !== 0) {
      alert("평점은 0.0~5.0 사이의 0.5 단위여야 합니다.");
      return;
    }

    if (!seasonReviewEditData.review.trim()) {
      alert("리뷰를 입력해주세요.");
      return;
    }

    if (seasonReviewEditData.review.length > 30) {
      alert("리뷰는 30자 이내로 작성해주세요.");
      return;
    }

    if (!seasonReviewEditData.link.trim()) {
      alert("링크를 입력해주세요.");
      return;
    }

    setSeasonReviewSaving(true);
    setSeasonReviewError(null);

    try {
      const res = await fetch("/api/season-review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonHistoryId: currentSeason.id,
          rating: seasonReviewEditData.rating,
          review: seasonReviewEditData.review.trim(),
          link: seasonReviewEditData.link.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "저장에 실패했습니다.");
        return;
      }

      // 현재 시즌 데이터 업데이트
      setSeasonHistories(prev => prev.map((season) =>
        currentSeasonInfo && season.year === String(currentSeasonInfo.year) && season.season === currentSeasonInfo.name
          ? { ...season, rating: seasonReviewEditData.rating, review: seasonReviewEditData.review.trim(), reviewLink: seasonReviewEditData.link.trim() }
          : season
      ));

      alert("저장되었습니다.");
      setSeasonReviewModalOpen(false);
    } catch (error) {
      console.error("시즌 리뷰 저장 오류:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setSeasonReviewSaving(false);
    }
  };

  // 커스텀 스크롤바: area-8 (status-badges)
  const updateScrollbar8 = useCallback(() => {
    const container = statusBadgesRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const trackHeight = clientHeight;
    const thumbHeight = 61;
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;
    setScrollThumbTop8(thumbTop);
  }, []);

  const handleMouseDown8 = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging8(true);
    dragStartY8.current = e.clientY;
    dragStartScrollTop8.current = statusBadgesRef.current?.scrollTop || 0;
  }, []);

  // 커스텀 스크롤바: area-9 (profile-cards)
  const updateScrollbar9 = useCallback(() => {
    const container = profileCardsRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const trackHeight = clientHeight;
    const thumbHeight = 61;
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;
    setScrollThumbTop9(thumbTop);
  }, []);

  const handleMouseDown9 = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging9(true);
    dragStartY9.current = e.clientY;
    dragStartScrollTop9.current = profileCardsRef.current?.scrollTop || 0;
  }, []);

  // 드래그 이벤트 핸들러 (area-8)
  useEffect(() => {
    if (!isDragging8) return;
    const handleMouseMove = (e: MouseEvent) => {
      const container = statusBadgesRef.current;
      if (!container) return;
      const deltaY = e.clientY - dragStartY8.current;
      const { scrollHeight, clientHeight } = container;
      const trackHeight = clientHeight;
      const thumbHeight = 61;
      const maxThumbTop = trackHeight - thumbHeight;
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollDelta = maxThumbTop > 0 ? (deltaY / maxThumbTop) * maxScrollTop : 0;
      container.scrollTop = dragStartScrollTop8.current + scrollDelta;
    };
    const handleMouseUp = () => setIsDragging8(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging8]);

  // 드래그 이벤트 핸들러 (area-9)
  useEffect(() => {
    if (!isDragging9) return;
    const handleMouseMove = (e: MouseEvent) => {
      const container = profileCardsRef.current;
      if (!container) return;
      const deltaY = e.clientY - dragStartY9.current;
      const { scrollHeight, clientHeight } = container;
      const trackHeight = clientHeight;
      const thumbHeight = 61;
      const maxThumbTop = trackHeight - thumbHeight;
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollDelta = maxThumbTop > 0 ? (deltaY / maxThumbTop) * maxScrollTop : 0;
      container.scrollTop = dragStartScrollTop9.current + scrollDelta;
    };
    const handleMouseUp = () => setIsDragging9(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging9]);

  return (
    <div className="cluster4-content">
      {/* Section 1: CLUB CHALLENGE GROWTH */}
      <section className="cluster4-section1" ref={headerRef}>
        {/* 좌측 상단 탭 (세로 정렬) */}
        <div className="top-tabs">
          <div className="tab" style={{ width: '44px', height: '44px', background: '#161816' }}>
            <img src="/images/0/cluster4/icon/icon%20-%20%EC%A0%84%EA%B5%AC.png" alt="전구" className="tab-icon" />
            <div className="tab-badge" onClick={() => router.push(`/cluster-4${urlUserId ? `?userId=${urlUserId}` : ''}`)}>
              <span className="badge-text">Weekly Growth</span>
              <img src="/images/0/cluster4/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </div>
          <div className="tab" style={{ width: '44px', height: '44px', background: '#FAAB07' }}>
            <img src="/images/0/cluster4/icon/icon%20-%20book.png" alt="book" className="tab-icon" />
            <div className="tab-badge" onClick={() => router.push(`/cluster-4-1${urlUserId ? `?userId=${urlUserId}` : ''}`)}>
              <span className="badge-text">Season Growth</span>
              <img src="/images/0/cluster4/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </div>
        </div>

        {/* 타이틀 */}
        <div className="section1-title-wrapper">
          <div className="title-inner">
            <h2 className="section1-title">CLUB CHALLENGE GROWTH</h2>
          </div>
        </div>

        {/* 설명 텍스트 */}
        <div className="section1-description">
          <p>이 페이지에서는 주차별로(weekly), 시즌별로(season) 차곡차곡 성장한 크루의 내역이 나옵니다.</p>
          <p>잠깐의 열정과 객기는 누구나 가질 수 있지만, 역경과 부침, 짜증나는 고난과 요동치는 감정을 이겨내며 꾸준하게 성장할 수 있는 사람은 생각보다 적습니다.😊</p>
          <p className="small-text">1주, 1개월, 1분기, 1반기, 1년.. 세상에서 평가하는 나의 신뢰성은 어떠한가요?</p>
          <p className="quote-text">
            There is no magic to achievement. It's really about hard work, choices and persistence.
          </p>
          <p className="quote-highlight">"무언가를 성취하기 위해 부릴 수 있는 마법은 없다. 필요한 것은 오직 노력, 선택 그리고 꾸준함일 뿐이다."</p>
          <p className="quote-author">-미셸 오바마(Michelle Obama)-</p>
        </div>
      </section>

      {/* Section 2: SEASON GROWTH 카드 */}
      <section className="cluster4-section2">
        <div className="season-growth-card visible">
          {/* 왼쪽 콘텐츠 */}
          <div className="card-left">
            {/* 타이틀과 배지를 한 줄로 */}
            <div className="season-header-row">
              <div className="season-title-wrapper">
                <h3 className="season-title-shadow">SEASON GROWTH</h3>
                <h3 className="season-title">SEASON GROWTH</h3>
              </div>
              <div className="season-badge">
                <svg className="badge-outline" viewBox="0 0 124 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.84668 0.846558H122.847V26.7666L98.4467 48.8466H0.84668V0.846558Z" stroke="#FAAB07" strokeWidth="1.69311" fill="none"/>
                </svg>
                <svg className="badge-border" viewBox="0 0 124 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.84668 0.846558H122.847V26.7666L98.4467 48.8466H0.84668V0.846558Z" fill="#FAAB07" stroke="#FAAB07" strokeWidth="1.69311"/>
                </svg>
                <span className="badge-text">{getGrowthBadgeText(userStatus, growthStatus)}</span>
              </div>
            </div>

            {/* Add new collection 카드 */}
            <div className="collection-card">
              <div className="collection-icon">
                <img src="/images/0/cluster4/아호%20캐릭터.png" alt="아호 캐릭터" />
              </div>
              <div className="collection-content">
                <div className="collection-header">
                  <img src="/images/0/cluster4/icon/icon - plus.png" alt="plus" className="add-icon" />
                  <span className="collection-label">Add new passion, hardship and growth</span>
                </div>
                <p className="collection-text">
                  {currentSeasonInfo?.isBreakSeason ? (
                    <>현재 클럽은, <strong>{currentSeasonInfo.year}년 {currentSeasonInfo.fromSeason} 시즌</strong>에서 <strong>{currentSeasonInfo.year}년 {currentSeasonInfo.toSeason} 시즌</strong>으로 가는 휴식(시즌 전환) 중에 있습니다.</>
                  ) : (
                    <>현재 클럽은, <strong>{currentSeasonInfo ? `${currentSeasonInfo.year}년 ${currentSeasonInfo.name} 시즌, ${currentSeasonInfo.currentWeek}주차` : '로딩 중...'}</strong>를 {currentSeasonInfo?.isClubBreak ? `휴식(${currentSeasonInfo.holidayName || '공식'})` : '진행'} 중에 있습니다.</>
                  )}
                </p>
              </div>
            </div>

            {/* Details 카드 */}
            <div className="details-card">
              <div className="details-header">
                <img src="/images/0/cluster4/icon/icon - ppt.png" alt="details" className="toggle-icon" />
                <span className="toggle-text">Details</span>
                <span className="arrow-icon"></span>
              </div>

              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">성장 시작 시즌</span>
                  <span className="detail-value">
                    {growthStartInfo && growthStartInfo.year
                      ? growthStartInfo.isBreak
                        ? `${growthStartInfo.year}년, ${growthStartInfo.seasonName} 시즌, 전환 주차`
                        : `${growthStartInfo.year}년, ${growthStartInfo.seasonName} 시즌, ${growthStartInfo.weekNumber}주차`
                      : '-'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 가능 시즌</span>
                  <span className="detail-value"><span className="number">{growthPeriodStats?.availableSeasons ?? '-'}</span> <span className="white-text">개 시즌</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 성공 시즌</span>
                  <span className="detail-value"><span className="number">{growthPeriodStats?.approvedSeasons ?? '-'}</span> <span className="white-text">개 시즌</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 휴식 시즌</span>
                  <span className="detail-value"><span className="number">{growthPeriodStats?.restSeasons ?? '-'}</span> <span className="white-text">개 시즌</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 종료 시즌</span>
                  <span className="detail-value">
                    {growthEndInfo ? (
                      <>
                        {growthEndInfo.year}년, {growthEndInfo.seasonName} 시즌
                        {growthEndInfo.isBreak ? ', 전환 주차' : (growthEndInfo.weekNumber ? `, ${growthEndInfo.weekNumber}주차` : '')} ({getGrowthBadgeText(userStatus, growthStatus)})
                      </>
                    ) : (
                      <>~ing ({getGrowthBadgeText(userStatus, growthStatus)})</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 캐릭터 이미지 */}
          <div className="card-right">
            <img
              src="/images/0/cluster4/bg cha.png"
              alt="Character"
            />
          </div>
        </div>
      </section>

      {/* Section 3: 2025년도_여름 시즌 */}
      <section className="cluster4-section3">
        {/* SEASON CHALLENGE 배너 */}
        <div className="section3-banner">
          {/* Floating Icons - 다른 사용자 프로필 볼 때만 표시 (다른 사람에게 평판 남기기) */}
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" style={{ cursor: 'pointer' }} onClick={() => {
              if (isOwner) {
                alert('시즌 평판은 타 크루끼리 작성합니다.');
              } else {
                openSeasonReputationModal();
              }
            }}><i className="ti ti-pencil" style={{ fontSize: '11px', color: '#FFFFFF' }}></i></div>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
          <div className="section3-title-wrapper">
            <h2 className="section3-banner-text">SEASON CHALLENGE</h2>
          </div>
          <div className="section3-banner-description">
            <p>성장한 모든 '시즌'의 종합 결과치가, 각개의 카드로 하나씩 보여집니다.</p>
            <p>당신의 특별한 시즌은 언제였나요?</p>
          </div>
          <div className="section3-banner-notice">
            <p>*모든 시즌들이 누적된 결과는 위 탭 [Club Final Index]에서 확인하실 수 있습니다. 😊</p>
          </div>
        </div>

        <div className="season-detail-container" style={{ backgroundImage: `url('${currentSeason.image}')` }}>
          {/* 상단 헤더 영역 (영역 1 + 영역 2) */}
          <div className="top-header-row">
            {/* 영역 1: 타이틀 + 날짜 + 상태 */}
            <div className={`area-1-title ${isTextFading ? 'fading' : ''}`}>
              <div className="season-main-title">
                <span className="year-orange">{currentSeason.year}</span>년도<span style={{ display: 'inline-block', width: '1.2em' }}></span><span className="season-highlight">{currentSeason.season}</span> 시즌
              </div>
              <div className="date-status">
                <span className="date-range">{currentSeason.dateRange}</span>
                <button className={`status-badge ${currentSeason.statusClass}`}>{currentSeason.status}</button>
              </div>
            </div>

            {/* 영역 2: Qualified */}
            <div className={`area-2-qualified ${isTextFading ? 'fading' : ''}`}>
              <span className="qualified-text">Qualified</span>
              <div className="qualified-items">
                <div className={`item-group ${currentSeason.isQualified ? '' : 'inactive'}`}>
                  <span className="item">Part</span>
                  <img src="/images/0/cluster4/icon/icon - part.png" alt="Part" className="qualified-icon" />
                  <div className={`tooltip ${currentSeason.isQualified ? '' : 'unqualified'}`}>
                    {currentSeason.isQualified ? (
                      <img src="/images/0/cluster4/sign 1.png" alt="Part tooltip" />
                    ) : (
                      <span className="unqualified-text">UnQualified</span>
                    )}
                  </div>
                </div>
                <div className={`item-group ${currentSeason.isQualified ? '' : 'inactive'}`}>
                  <span className="item">Team</span>
                  <img src="/images/0/cluster4/icon/icon - team.png" alt="Team" className="qualified-icon" />
                  <div className={`tooltip ${currentSeason.isQualified ? '' : 'unqualified'}`}>
                    {currentSeason.isQualified ? (
                      <img src="/images/0/cluster4/sign 2.png" alt="Team tooltip" />
                    ) : (
                      <span className="unqualified-text">UnQualified</span>
                    )}
                  </div>
                </div>
                <div className={`item-group ${currentSeason.isQualified ? '' : 'inactive'}`}>
                  <span className="item">Cluv</span>
                  <img src="/images/0/cluster4/icon/icon - cluv.png" alt="Cluv" className="qualified-icon" />
                  <div className={`tooltip ${currentSeason.isQualified ? '' : 'unqualified'}`}>
                    {currentSeason.isQualified ? (
                      <img src="/images/0/cluster4/sign 3.png" alt="Cluv tooltip" />
                    ) : (
                      <span className="unqualified-text">UnQualified</span>
                    )}
                  </div>
                </div>
                <div className={`item-group ${currentSeason.isQualified ? '' : 'inactive'}`}>
                  <span className="item">Supervise</span>
                  <img src="/images/0/cluster4/icon/icon - supervise.png" alt="Supervise" className="qualified-icon" />
                  <div className={`tooltip ${currentSeason.isQualified ? '' : 'unqualified'}`}>
                    {currentSeason.isQualified ? (
                      <img src="/images/0/cluster4/sign 4.png" alt="Supervise tooltip" />
                    ) : (
                      <span className="unqualified-text">UnQualified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 영역 (3열) */}
          <div className="main-content-grid">
            {/* 영역 3: 왼쪽 이미지 스택 */}
            <div className="area-3-image">
              <div className={`season-image-stack ${isFlipping ? 'flipping' : ''}`}>
                <div className="image-card card-back">
                  <div className="card-frame">
                    <img src={seasonHistories.length > 0 ? (seasonHistories[(section3Page + 2) % seasonHistories.length]?.image || currentSeason.image) : '/images/0/cluster4/cluster4-1/image3.png'} alt="시즌" />
                  </div>
                </div>
                <div className="image-card card-middle">
                  <div className="card-frame">
                    <img src={seasonHistories.length > 0 ? (seasonHistories[(section3Page + 1) % seasonHistories.length]?.image || currentSeason.image) : '/images/0/cluster4/cluster4-1/image2.png'} alt="시즌" />
                  </div>
                </div>
                <div className="image-card card-front">
                  <div className="card-frame">
                    <img src={currentSeason.image} alt={`${currentSeason.season} 시즌`} />
                  </div>
                </div>
              </div>
            </div>

            {/* 중앙 열 (영역 4, 5, 6, 7) */}
            <div className={`center-column ${isTextFading ? 'fading' : ''}`}>
              {/* 영역 4: 통계 바 */}
              <div className="area-4-stats">
                <span className="stat">단감 <img src="/images/0/cluster4/icon/icon - 단감.png" alt="단감" className="stat-icon" /> <strong className="number">{currentSeason.stats.dangam}</strong><span className="unit">개</span></span>
                <span className="stat">인절미 <img src="/images/0/cluster4/icon/icon - 인절미.png" alt="인절미" className="stat-icon" /> <strong className="number">{currentSeason.stats.injeolmi}</strong><span className="unit">개</span></span>
                <span className="stat">어흥 <img src="/images/0/cluster4/icon/icon - 어흥.png" alt="어흥" className="stat-icon" /> <strong className="number">{currentSeason.stats.eoheung}</strong><span className="unit">개</span></span>
              </div>

              {/* 영역 5: 평점 및 리뷰 */}
              <div
                className="area-5-rating"
                style={{
                  position: 'relative',
                  cursor: currentSeason.reviewLink ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (currentSeason.reviewLink) {
                    let url = currentSeason.reviewLink;
                    if (!/^https?:\/\//i.test(url)) {
                      url = 'https://' + url;
                    }
                    window.open(url, '_blank');
                  }
                }}
              >
                <div className="rating-avatar">
                  <img src={profilePhotoUrl || '/images/avatar/avatar.png'} alt="Profile" />
                </div>
                <div className="rating-content">
                  <div className="top-row">
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFull = currentSeason.rating >= star;
                        const isHalf = currentSeason.rating >= star - 0.5 && currentSeason.rating < star;
                        return (
                          <img
                            key={star}
                            className={`star-icon ${isFull ? '' : isHalf ? 'half' : 'empty'}`}
                            src="/images/0/cluster4/icon - star.png"
                            alt="star"
                            style={{ opacity: isFull ? 1 : isHalf ? 0.6 : 0.3 }}
                          />
                        );
                      })}
                      <span className="rating-text">{currentSeason.rating || 0} / 10</span>
                    </div>
                    <span className="review-label">Season Review</span>
                  </div>
                  <p className="review-comment">"{currentSeason.review || '이번시즌 30자 평을 해보라는데, 어디까지 갈 수 있나'}"</p>
                </div>
                {/* 편집 아이콘 (본인만 표시) */}
                {(
                  <button
                    onClick={isOwner ? (e) => { e.stopPropagation(); handleEditClick(openSeasonReviewModal); } : (e) => { e.stopPropagation(); }}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(255, 165, 0, 0.2)',
                      border: '1px solid #FAAB07',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isOwner ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      opacity: isOwner ? 1 : 0.4,
                    }}
                    onMouseEnter={isOwner ? (e) => { e.currentTarget.style.background = 'rgba(255, 165, 0, 0.4)'; } : undefined}
                    onMouseLeave={isOwner ? (e) => { e.currentTarget.style.background = 'rgba(255, 165, 0, 0.2)'; } : undefined}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAAB07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 영역 6: 원형 차트 3개 */}
              <div className="area-6-circles">
                <div className="circle-item">
                  <div className="circle pink">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - currentSeason.circles.weekUsage / 100)} />
                    </svg>
                    <img src="/images/0/cluster4/icon/icon - 주차 활용도.png" alt="주차 활용도" className="circle-icon" />
                    <div className="percent">{currentSeason.circles.weekUsage}%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">주차 활용도</div>
                    <div className="label-sub">총 {currentSeason.circles.totalOperatingWeeks ?? 0}주 중 <span className="highlight">{currentSeason.circles.approvedWeeks ?? 0}</span>주</div>
                  </div>
                </div>
                <div className="circle-item">
                  <div className="circle yellow">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - currentSeason.circles.scheduleReliability / 100)} />
                    </svg>
                    <img src="/images/0/cluster4/icon/icon - 일정 신뢰도.png" alt="일정 신뢰도" className="circle-icon" />
                    <div className="percent">{currentSeason.circles.scheduleReliability}%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">일정 신뢰도</div>
                    <div className="label-sub">총 {currentSeason.circles.totalOperatingWeeks ?? 0}주 중 <span className="highlight">{currentSeason.circles.reliableWeeks ?? 0}</span>주</div>
                  </div>
                </div>
                <div className="circle-item">
                  <div className="circle green">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - currentSeason.circles.seasonGrowth / 100)} />
                    </svg>
                    <img src="/images/0/cluster4/icon/icon - 시즌 성장률.png" alt="시즌 성장률" className="circle-icon" />
                    <div className="percent">{currentSeason.circles.seasonGrowth}%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">시즌 성장률</div>
                    <div className="label-sub">총 {currentSeason.circles.totalActivities ?? 0}개 중 <span className="highlight">{currentSeason.circles.completedActivities ?? 0}</span>개</div>
                  </div>
                </div>
              </div>

              {/* 영역 7: 실무 성장률 프로그레스 바 (시즌 전체 데이터) */}
              <div className="area-7-progress">
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster4/icon/1 실무 정보.png" alt="1" className="progress-icon" /> 실무 정보 강화율 ({currentSeason.progress.info.rate}%)</span>
                    <span className="value"><img src="/images/0/cluster4/icon/stars.png" alt="stars" className="stars-icon" /> 총 {currentSeason.progress.info.total} 개 중 <span className="highlight">{currentSeason.progress.info.completed}</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: `${currentSeason.progress.info.rate}%` }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster4/icon/2 실무 역량.png" alt="2" className="progress-icon" /> 실무 역량 강화율 ({currentSeason.progress.competency.rate}%)</span>
                    <span className="value"><img src="/images/0/cluster4/icon/stars.png" alt="stars" className="stars-icon" /> 총 {currentSeason.progress.competency.total} 개 중 <span className="highlight">{currentSeason.progress.competency.completed}</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: `${currentSeason.progress.competency.rate}%` }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster4/icon/3 실무 경험.png" alt="3" className="progress-icon" /> 실무 경험 강화율 ({currentSeason.progress.experience.rate}%)</span>
                    <span className="value"><img src="/images/0/cluster4/icon/stars.png" alt="stars" className="stars-icon" /> 총 {currentSeason.progress.experience.total} 개 중 <span className="highlight">{currentSeason.progress.experience.completed}</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: `${currentSeason.progress.experience.rate}%` }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster4/icon/4 실무 경력.png" alt="4" className="progress-icon" /> 실무 경력 강화율 ({currentSeason.progress.career.rate}%)</span>
                    <span className="value"><img src="/images/0/cluster4/icon/stars.png" alt="stars" className="stars-icon" /> 총 {currentSeason.progress.career.total} 개 중 <span className="highlight">{currentSeason.progress.career.completed}</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: `${currentSeason.progress.career.rate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측 열 (영역 8, 9) */}
            <div className={`right-column ${isTextFading ? 'fading' : ''}`}>
              {/* 영역 8: 시즌 상태 */}
              <div className="area-8-season-status">
                <h4 className="section-title"><img className="section-icon" src="/images/0/cluster4/icon - 시즌 상태.png" alt="시즌 상태" /> 시즌 상태</h4>
                <div style={{ position: 'relative' }}>
                  <div ref={statusBadgesRef} className="status-badges" onScroll={updateScrollbar8}>
                    {(() => {
                      // TODO: 피그마 점검용 임시 더미 데이터 - 점검 완료 후 제거
                      const dbRoles = currentSeason.seasonRoles && currentSeason.seasonRoles.length > 0
                        ? currentSeason.seasonRoles
                        : [];
                      const totalSlots = 3;
                      // DB 데이터가 기준 미만이면 더미로 채움
                      const roles = dbRoles.length >= totalSlots
                        ? dbRoles.slice(0, totalSlots)
                        : [...dbRoles, ...DUMMY_SEASON_ROLES.slice(dbRoles.length, totalSlots)];
                      return roles.map((roleItem, index) => (
                        <div className="badge-item" key={index}>
                          <div className="badge-icon">
                            <img src={roleItem.profileImage || profilePhotoUrl || '/images/avatar/avatar.png'} alt="profile" />
                          </div>
                          <div className="badge-info">
                            {roleItem.isAdmin ? (
                              <span className="badge-text">
                                운영진({roleItem.adminGeneration}기) <span className="separator">|</span> <span className="sub-text">클럽 단위</span> <span className="separator">|</span>
                              </span>
                            ) : (
                              <span className="badge-text">
                                {roleItem.teamName || '-'} <span className="separator">|</span> <span className="sub-text">{roleItem.partName || '-'}</span> <span className="separator">|</span>
                              </span>
                            )}
                          </div>
                          <span className="badge-status yellow">{roleItem.roleLabel}</span>
                        </div>
                      ));
                    })()}
                  </div>
                  {/* 커스텀 스크롤바 (area-8) */}
                  <div style={{ position: 'absolute', right: 0, top: 0, width: '2px', height: '100%', background: 'rgba(255,227,170,0.15)', borderRadius: '2px' }}>
                    <div ref={scrollThumbRef8} onMouseDown={handleMouseDown8}
                      style={{ position: 'absolute', top: `${scrollThumbTop8}px`, width: '100%', height: 61, background: 'rgba(255,227,170,1)', borderRadius: '2px', cursor: 'pointer' }} />
                  </div>
                </div>
              </div>

              {/* 영역 9: 시즌 평판 */}
              <div className="area-9-season-reputation">
                <h4 className="section-title"><img className="section-icon" src="/images/0/cluster4/icon - 시즌 평판.png" alt="시즌 평판" /> 시즌 평판 <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>({seasonReputations.length}개)</span></h4>
                <div style={{ position: 'relative' }}>
                  <div ref={profileCardsRef} className="profile-cards" onScroll={updateScrollbar9}>
                    {(() => {
                      // TODO: 피그마 점검용 임시 더미 데이터 - 점검 완료 후 제거
                      const totalSlots = 3;
                      const dbReputations = seasonReputations.slice(0, totalSlots);
                      // DB 데이터가 기준 미만이면 더미로 채움
                      const allReputations = dbReputations.length >= totalSlots
                        ? dbReputations
                        : [...dbReputations, ...DUMMY_SEASON_REPUTATIONS.slice(dbReputations.length, totalSlots)];

                      return allReputations.map((reputation: any) => {
                        const reviewer = reputation.reviewer;
                        const currentYear = new Date().getFullYear();
                        const birthYear = reviewer?.birth_date ? new Date(reviewer.birth_date).getFullYear() : null;
                        const age = birthYear ? currentYear - birthYear : null;
                        const genderLabel = reviewer?.gender || '-';
                        const fullStars = Math.floor(reputation.rating / 2);
                        const hasHalfStar = reputation.rating % 2 === 1;
                        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

                        return (
                          <div className="profile-card" key={reputation.id}>
                            <div className="corner top-left"></div>
                            <div className="corner top-right"></div>
                            <div className="corner bottom-left"></div>
                            <div className="corner bottom-right"></div>
                            <div className="card-top">
                              <div className="avatar">
                                <img src={reviewer?.profile_photo_url || '/images/avatar/avatar.png'} alt="profile" />
                              </div>
                              <div className="info">
                                <div className="row1">
                                  {reviewer?.display_name || '익명'} <span className="separator">|</span> {genderLabel} <span className="separator">|</span> {mask.age(age)}세 <span className="separator">|</span> {mask.school(reviewer?.university)} <span className="separator">|</span> {mask.major(reviewer?.major_first)}
                                </div>
                                <div className="row2">
                                  {reviewer?.teamName || '-'} <span className="separator">|</span> {reviewer?.partName || '-'}{reviewer?.vision && <> <span className="separator">|</span> {reviewer.vision}</>}
                                </div>
                              </div>
                            </div>
                            <div className="tags">
                              {reputation.keyword_1 && <span className="tag">#{reputation.keyword_1}</span>}
                              {reputation.keyword_2 && <span className="tag-yellow">#{reputation.keyword_2}</span>}
                            </div>
                            <div
                              className="comment"
                              style={{ cursor: 'pointer' }}
                              onClick={() => { setSelectedReputation(reputation); setReputationDetailModalOpen(true); }}
                            >
                              <img className="speech-icon" src="/images/0/cluster4/icon - speech.png" alt="speech" />
                              <span className="comment-text">{reputation.content}</span>
                              <span className="arrow-icon" style={{
                                width: '15px',
                                height: '15px',
                                padding: '5px',
                                flexShrink: 0,
                                background: '#FAAB07',
                                borderRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <svg width="11" height="10" viewBox="0 0 11 10" fill="none">
                                  <path d="M1 9L9 1M9 1H3M9 1V7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            </div>
                            <div className="stats">
                              <span className="pm"><img className="wifi-icon" src="/images/0/cluster4/icon - wifi.png" alt="wifi" /> FM :325</span>
                              <span className="rating">
                                {[...Array(fullStars)].map((_, i) => (
                                  <img key={`full-${i}`} className="star-icon" src="/images/0/cluster4/icon - star.png" alt="star" />
                                ))}
                                {hasHalfStar && (
                                  <span className="star-half">
                                    <img className="star-half-filled" src="/images/0/cluster4/icon - star.png" alt="star" />
                                    <img className="star-half-empty" src="/images/0/cluster4/icon - star.png" alt="star" />
                                  </span>
                                )}
                                {[...Array(emptyStars)].map((_, i) => (
                                  <img key={`empty-${i}`} className="star-icon empty" src="/images/0/cluster4/icon - star.png" alt="star" />
                                ))}
                                <span className="rating-score">{reputation.rating} / 10</span>
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  {/* 커스텀 스크롤바 (area-9) */}
                  <div style={{ position: 'absolute', right: 0, top: 0, width: '2px', height: '100%', background: 'rgba(255,227,170,0.15)', borderRadius: '2px' }}>
                    <div ref={scrollThumbRef9} onMouseDown={handleMouseDown9}
                      style={{ position: 'absolute', top: `${scrollThumbTop9}px`, width: '100%', height: 61, background: 'rgba(255,227,170,1)', borderRadius: '2px', cursor: 'pointer' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="section3-pagination">
          {seasonHistories.length > 0 ? seasonHistories.map((_: SeasonHistoryData, index: number) => (
            <span
              key={index}
              className={`page-num ${section3Page === index ? 'active' : ''} ${index === seasonHistories.length - 1 ? 'last' : ''}`}
              onClick={() => handlePageChange(index)}
            >
              {index + 1}
            </span>
          )) : (
            <span className="page-num active last">1</span>
          )}
        </div>
      </section>

      {/* ========== 시즌 평판 모달 ========== */}
      
      {seasonReputationModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(5px)',
          }}
        >
          <div className="edit-modal-content" style={{
            width: '500px',
            maxWidth: '90vw',
            height: '620px',
            maxHeight: 'calc(100vh - 80px)',
            background: '#0d1117',
            border: '1px solid #FAAB07',
          }}>
            {/* Header */}
            <div className="edit-modal-header" style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <div>
                <h3 style={{ margin: 0 }}>✦ 시즌 평판</h3>
                <span className="modal-subtitle" style={{ display: 'block', marginTop: '8px' }}>이번 시즌에 대한 해당 크루의 평판을 남겨주세요</span>
              </div>
              <button className="modal-close" onClick={() => setSeasonReputationModalOpen(false)} style={{ marginLeft: '12px', flexShrink: 0 }}>&times;</button>
            </div>

            {/* Body */}
            <div className="edit-modal-body" style={{ padding: '20px 24px' }}>
              
              {/* 평점 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FAAB07', marginBottom: '10px' }}>평점</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const starValue = starIndex * 2; // 각 별 = 2점
                      const isFull = seasonReputationEditData.rating >= starValue;
                      const isHalf = !isFull && seasonReputationEditData.rating >= starValue - 1;
                      return (
                        <div
                          key={starIndex}
                          style={{ width: '28px', height: '28px', position: 'relative', cursor: 'pointer' }}
                          onClick={() => {
                            // 클릭 시: 이미 해당 값이면 -2 (토글), 아니면 해당 값으로
                            const newRating = seasonReputationEditData.rating === starValue ? starValue - 2 : starValue;
                            setSeasonReputationEditData(prev => ({ ...prev, rating: Math.max(0, newRating) }));
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill={isFull ? '#FAAB07' : 'none'} stroke="#FAAB07" strokeWidth="2" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {isHalf && (
                            <svg viewBox="0 0 24 24" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                              <defs><clipPath id={`sr-half-${starIndex}`}><rect x="0" y="0" width="12" height="24" /></clipPath></defs>
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FAAB07" clipPath={`url(#sr-half-${starIndex})`} />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#FAAB07' }}>
                    {seasonReputationEditData.rating} / 10
                  </span>
                </div>
              </div>

              {/* 내용 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FAAB07', marginBottom: '10px' }}>
                  내용 <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>(최대 100자)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    placeholder="해당 시즌에 대한 평가 내용을 작성해주세요..."
                    maxLength={100}
                    rows={4}
                    value={seasonReputationEditData.content}
                    onChange={(e) => setSeasonReputationEditData(prev => ({ ...prev, content: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      paddingBottom: '30px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      resize: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ position: 'absolute', right: '12px', bottom: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {seasonReputationEditData.content.length} / 100
                  </span>
                </div>
              </div>

              {/* 키워드 */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FAAB07', marginBottom: '10px' }}>
                  키워드 <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>(2개 선택, 총 {reputationKeywords.length}개)</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#FAAB07', minWidth: '20px' }}>#</span>
                    <select
                      value={seasonReputationEditData.keyword1}
                      onChange={(e) => setSeasonReputationEditData(prev => ({ ...prev, keyword1: e.target.value }))}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '44px',
                        padding: '0 10px',
                        background: '#1a1f2e',
                        border: '2px solid #FAAB07',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="">키워드 1 선택</option>
                      {reputationKeywords.length === 0 ? (
                        <option value="" disabled>키워드 로딩 중...</option>
                      ) : (
                        [1, 2, 3, 4, 5].map(clusterNum => {
                          const clusterKeywords = reputationKeywords.filter(k => k.cluster_number === clusterNum);
                          if (clusterKeywords.length === 0) return null;
                          const clusterInfo = clusterKeywords[0];
                          return (
                            <optgroup key={clusterNum} label={`${clusterNum}. ${clusterInfo.cluster_name}`}>
                              {clusterKeywords.map(k => (
                                <option key={k.id} value={k.keyword} disabled={k.keyword === seasonReputationEditData.keyword2}>{k.keyword}</option>
                              ))}
                            </optgroup>
                          );
                        })
                      )}
                    </select>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#FAAB07', minWidth: '20px' }}>#</span>
                    <select
                      value={seasonReputationEditData.keyword2}
                      onChange={(e) => setSeasonReputationEditData(prev => ({ ...prev, keyword2: e.target.value }))}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '44px',
                        padding: '0 10px',
                        background: '#1a1f2e',
                        border: '2px solid #FAAB07',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="">키워드 2 선택</option>
                      {reputationKeywords.length === 0 ? (
                        <option value="" disabled>키워드 로딩 중...</option>
                      ) : (
                        [1, 2, 3, 4, 5].map(clusterNum => {
                          const clusterKeywords = reputationKeywords.filter(k => k.cluster_number === clusterNum);
                          if (clusterKeywords.length === 0) return null;
                          const clusterInfo = clusterKeywords[0];
                          return (
                            <optgroup key={clusterNum} label={`${clusterNum}. ${clusterInfo.cluster_name}`}>
                              {clusterKeywords.map(k => (
                                <option key={k.id} value={k.keyword} disabled={k.keyword === seasonReputationEditData.keyword1}>{k.keyword}</option>
                              ))}
                            </optgroup>
                          );
                        })
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="edit-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <button
                onClick={() => setSeasonReputationModalOpen(false)}
                disabled={seasonReputationSaving}
                style={{
                  padding: '10px 24px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '14px',
                  borderRadius: '6px',
                  cursor: seasonReputationSaving ? 'not-allowed' : 'pointer',
                  opacity: seasonReputationSaving ? 0.5 : 1,
                }}
              >취소</button>
              <button
                onClick={handleSaveSeasonReputation}
                disabled={
                  seasonReputationSaving ||
                  seasonReputationSuccess ||
                  seasonReputationEditData.content.trim() === '' ||
                  (seasonReputationEditData.keyword1.trim() === '' && seasonReputationEditData.keyword2.trim() === '')
                }
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  background: '#FAAB07',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: (
                    seasonReputationSaving ||
                    seasonReputationSuccess ||
                    seasonReputationEditData.content.trim() === '' ||
                    (seasonReputationEditData.keyword1.trim() === '' && seasonReputationEditData.keyword2.trim() === '')
                  ) ? 'not-allowed' : 'pointer',
                  opacity: (
                    seasonReputationSaving ||
                    seasonReputationSuccess ||
                    seasonReputationEditData.content.trim() === '' ||
                    (seasonReputationEditData.keyword1.trim() === '' && seasonReputationEditData.keyword2.trim() === '')
                  ) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {seasonReputationSaving && (
                  <span style={{ width: '14px', height: '14px', border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                )}
                {seasonReputationSaving ? '저장 중...' : seasonReputationSuccess ? '저장 완료!' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 시즌 평판 상세 보기 모달 ========== */}
      {reputationDetailModalOpen && selectedReputation && (() => {
        const reviewer = selectedReputation.reviewer;
        const birthYear = reviewer?.birth_date ? parseInt(reviewer.birth_date.substring(0, 4)) : null;
        const currentYear = new Date().getFullYear();
        const age = birthYear ? currentYear - birthYear + 1 : null;
        const genderLabel = reviewer?.gender === '남' ? '남' : reviewer?.gender === '여' ? '여' : '-';
        const fullStars = Math.floor(selectedReputation.rating / 2);
        const hasHalfStar = selectedReputation.rating % 2 >= 1;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              backdropFilter: 'blur(5px)',
            }}
          >
            <div className="edit-modal-content" style={{
              width: '500px',
              maxHeight: '80vh',
              background: 'linear-gradient(145deg, #1a1d2e 0%, #0d0f1a 100%)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 165, 0, 0.1)',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div className="edit-modal-header" style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 165, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <h3 style={{ margin: 0, color: '#FAAB07', fontSize: '18px', fontWeight: 600 }}>시즌 평판 상세</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setReputationDetailModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '24px', cursor: 'pointer', padding: '4px' }}
                >×</button>
              </div>

              {/* Body */}
              <div className="edit-modal-body" style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(80vh - 80px)' }}>
                {/* Reviewer Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <img
                    src={reviewer?.profile_photo_url || '/images/avatar/avatar.png'}
                    alt="profile"
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255, 165, 0, 0.3)' }}
                  />
                  <div>
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {reviewer?.display_name || '익명'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                      {genderLabel} | {mask.age(age)}세 | {mask.school(reviewer?.university)} | {mask.major(reviewer?.major_first)}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>
                      {reviewer?.teamName || '-'} | {reviewer?.partName || '-'}{reviewer?.vision && ` | ${reviewer.vision}`}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {selectedReputation.keyword_1 && (
                    <span style={{ padding: '6px 12px', background: 'rgba(250, 171, 7, 0.2)', borderRadius: '20px', color: '#FAAB07', fontSize: '13px' }}>
                      #{selectedReputation.keyword_1}
                    </span>
                  )}
                  {selectedReputation.keyword_2 && (
                    <span style={{ padding: '6px 12px', background: 'rgba(255, 215, 0, 0.2)', borderRadius: '20px', color: '#FFD700', fontSize: '13px' }}>
                      #{selectedReputation.keyword_2}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 165, 0, 0.1)',
                }}>
                  <p style={{ color: '#fff', fontSize: '15px', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {selectedReputation.content}
                  </p>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>평점</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(fullStars)].map((_, i) => (
                          <img key={`full-${i}`} src="/images/0/cluster4/icon - star.png" alt="star" style={{ width: '18px', height: '18px' }} />
                        ))}
                        {hasHalfStar && (
                          <img src="/images/0/cluster4/icon - star.png" alt="star" style={{ width: '18px', height: '18px', opacity: 0.5 }} />
                        )}
                        {[...Array(emptyStars)].map((_, i) => (
                          <img key={`empty-${i}`} src="/images/0/cluster4/icon - star.png" alt="star" style={{ width: '18px', height: '18px', opacity: 0.2 }} />
                        ))}
                      </div>
                      <span style={{ color: '#FAAB07', fontSize: '14px', fontWeight: 600 }}>{selectedReputation.rating.toFixed(1)} / 10.0</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/images/0/cluster4/icon - wifi.png" alt="wifi" style={{ width: '16px', height: '16px', opacity: 0.8 }} />
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>FM : 3</span>
                    </div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                    {new Date(selectedReputation.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========== 시즌 리뷰 모달 ========== */}
      {seasonReviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(5px)',
          }}
        >
          <div className="edit-modal-content" style={{
            width: '450px',
            maxWidth: '90vw',
            background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)',
            border: '1px solid #FAAB07',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div className="edit-modal-header" style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 165, 0, 0.2)',
              background: 'rgba(255, 165, 0, 0.05)',
            }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#FAAB07' }}>✦ 시즌 리뷰</h3>
              <span className="modal-subtitle" style={{ color: '#999', fontSize: '14px' }}>이번 시즌에 대한 나의 평가를 남겨주세요</span>
            </div>

            {/* Body */}
            <div className="edit-modal-body" style={{ padding: '20px 24px' }}>
              {/* 평점 선택 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FAAB07', marginBottom: '10px' }}>평점</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select
                    value={seasonReviewEditData.rating.toString()}
                    onChange={(e) => setSeasonReviewEditData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                    style={{
                      display: 'block',
                      width: '100px',
                      height: '48px',
                      padding: '12px 14px',
                      background: '#1a1f2e',
                      border: '2px solid #FAAB07',
                      borderRadius: '8px',
                      color: '#FAAB07',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {[0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((val) => (
                      <option key={val} value={val.toString()} style={{ background: '#1a1f2e', color: '#fff' }}>{val.toFixed(1)}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const isFull = seasonReviewEditData.rating >= starIndex;
                      const isHalf = seasonReviewEditData.rating >= starIndex - 0.5 && seasonReviewEditData.rating < starIndex;
                      return (
                        <div key={starIndex} style={{ width: '24px', height: '24px', position: 'relative' }}>
                          <img
                            src="/images/0/cluster4/icon - star.png"
                            alt="star"
                            style={{
                              width: '100%',
                              height: '100%',
                              opacity: isFull ? 1 : isHalf ? 0.6 : 0.2,
                              filter: isFull || isHalf ? 'none' : 'grayscale(100%)',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#FAAB07' }}>
                    {seasonReviewEditData.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              {/* 리뷰 입력 */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FAAB07', marginBottom: '10px' }}>
                  한줄평 <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>(최대 30자)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="이번 시즌은 어땠나요? (30자 이내)"
                    maxLength={30}
                    value={seasonReviewEditData.review}
                    onChange={(e) => setSeasonReviewEditData(prev => ({ ...prev, review: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '56px',
                      padding: '16px 60px 16px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    {seasonReviewEditData.review.length} / 30
                  </span>
                </div>
              </div>

              {/* 링크 입력 */}
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FAAB07', marginBottom: '10px' }}>
                  링크
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={seasonReviewEditData.link}
                  onChange={(e) => setSeasonReviewEditData(prev => ({ ...prev, link: e.target.value }))}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '12px 16px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="edit-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid rgba(250, 171, 7, 0.2)', background: 'rgba(0,0,0,0.2)' }}>
              <button
                onClick={() => setSeasonReviewModalOpen(false)}
                disabled={seasonReviewSaving}
                style={{ padding: '10px 24px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '14px', borderRadius: '6px', cursor: seasonReviewSaving ? 'not-allowed' : 'pointer', opacity: seasonReviewSaving ? 0.5 : 1 }}
              >취소</button>
              <button
                onClick={handleSaveSeasonReview}
                disabled={seasonReviewSaving || seasonReviewSuccess || !seasonReviewEditData.review.trim() || !seasonReviewEditData.link.trim()}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  background: (seasonReviewSaving || seasonReviewSuccess || !seasonReviewEditData.review.trim() || !seasonReviewEditData.link.trim()) ? '#444' : 'linear-gradient(135deg, #FAAB07 0%, #E09A06 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: (seasonReviewSaving || seasonReviewSuccess || !seasonReviewEditData.review.trim() || !seasonReviewEditData.link.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                {seasonReviewSaving ? '저장 중...' : seasonReviewSuccess ? '완료!' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cluster4Content;
