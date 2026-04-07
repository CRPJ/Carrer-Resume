"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useDataMasking } from "@/hooks/useDataMasking";
import { isDemoMode as checkDemoMode } from "@/utils/isDemoMode";
import { DUMMY_WEEKLY_LIST, DUMMY_WEEK_EXTRA } from "@/constants/dummyData";

interface Cluster4CardContentProps {
  weekId: string;
}

// DB에서 가져온 주차 데이터 타입
interface DBWeekData {
  id: string;
  weekNumber: number;
  seasonYear: number;
  seasonName: string;
  isBreakSeason: boolean;
  toSeasonName: string | null;
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
  role?: string;
  rank: number;
  message: string;
  createdAt?: string;
}

// 학교/학과 표시값에서 suffix 제거 함수 (라벨과 중복 방지)
const formatSchool = (value: string) => {
  if (!value || value === "-") return "-";
  if (value.endsWith("대학교")) return value.slice(0, -2); // "냥멍대학교" → "냥멍대" (+ 학교 라벨)
  if (value.endsWith("대학")) return value.slice(0, -1); // "서울대학" → "서울대" (+ 학교 라벨)
  if (value.endsWith("학교")) return value.slice(0, -2); // "OO학교" → "OO" (+ 학교 라벨)
  return value;
};

const formatMajor = (value: string) => {
  if (!value || value === "-") return "-";
  if (value.endsWith("학과")) return value.slice(0, -1); // "컴퓨터공학과" → "컴퓨터공학" (+ 학과 라벨)
  if (value.endsWith("학부")) return value.slice(0, -1); // "소프트웨어학부" → "소프트웨어학" (+ 부 라벨은 안 맞지만 일단)
  return value;
};

const Cluster4CardContent = ({ weekId }: Cluster4CardContentProps) => {
  // 세션 및 본인 프로필 여부 확인
  const { data: session } = useSession();
  const { mask } = useDataMasking();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId") || searchParams.get("userID");
  const isDemoMode = checkDemoMode();
  const NICKNAME_COLORS = ["rgba(101, 227, 255, 1)", "rgba(255, 97, 97, 1)", "rgba(157, 250, 7, 1)", "rgba(255, 234, 72, 1)"];
  const NICKNAME_COLOR_OFFSET = Math.floor(Math.random() * 4);

  const truncate = (text: string | null | undefined, maxLen: number = 5): string => {
    const t = text || "-";
    return t.length > maxLen ? t.slice(0, maxLen) + ".." : t;
  };
  const isOwner = !urlUserId || session?.user?.id === urlUserId;
  // TODO: 백엔드 연동 시 API에서 받아오기
  const isAdmin = false;

  // 승인 상태 확인 함수
  const checkApprovalStatus = async () => {
    if (!session) return false;

    try {
      const response = await fetch("/api/auth/check-status");
      const result = await response.json();

      if (result.success && result.status === "approved") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("승인 상태 확인 오류:", error);
      return false;
    }
  };

  // 수정 버튼 클릭 핸들러 (승인 상태 체크)
  const handleEditClick = async (openModalFn: () => void) => {
    if (isDemoMode) {
      openModalFn();
      return;
    } // 더미 모드: 체크 스킵
    // TODO: 개발 완료 후 로그인 체크 원복
    if (!session) {
      openModalFn();
      return;
    }

    const approved = await checkApprovalStatus();

    if (!approved) {
      alert("아직 회원 상태가 어드민 승인 대기 중입니다.");
      return;
    }

    openModalFn();
  };

  // DB에서 가져온 주차 데이터 상태
  const [weekData, setWeekData] = useState<DBWeekData | null>(null);
  const [isLoadingWeek, setIsLoadingWeek] = useState(!isDemoMode);

  // 팀/파트/역할/포인트 데이터 상태
  const [teamName, setTeamName] = useState<string | null>("미디어");
  const [partName, setPartName] = useState<string | null>("웹툰드라마");
  const [generation, setGeneration] = useState<number | null>(3);
  const [managedTeamName, setManagedTeamName] = useState<string | null>(null);
  const [roleLabel, setRoleLabel] = useState<string | null>("운영진(앰배서더)");
  const [weekPoints, setWeekPoints] = useState<{ star: number; lightning: number; shield: number }>({ star: 25, lightning: 30, shield: -2 });
  const [cumulativeInjeolmi, setCumulativeInjeolmi] = useState<number>(30);
  const [cumulativeApprovedWeeks, setCumulativeApprovedWeeks] = useState<number>(25);

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
    opened_at: string | null; // 개설 시각 (48시간 이내에만 2차 정보 작성 가능)
    output_links: OutputLink[] | null; // 운영진이 입력한 output links
  }
  const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivity[]>([
    { id: "wa-1", activity_type_id: "wisdom", title: "글로벌 마케팅 트렌드 분석 리포트", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    { id: "wa-2", activity_type_id: "essay", title: "브랜드 스토리텔링의 핵심 요소와 소비자 인식 변화에 대한 에세이 작성", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    { id: "wa-3", activity_type_id: "infodesk", title: "MZ세대 타겟 SNS 마케팅 채널별 성과 지표 비교 분석 및 최적 채널 믹스 전략 도출 과제", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    { id: "wa-4", activity_type_id: "calendar", title: "주간 마케팅 캘린더 일정 관리 및 팀 공유", is_active: true, opened_at: "2099-01-01T00:00:00Z", output_links: [] },
    {
      id: "wa-5",
      activity_type_id: "forum",
      title: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차일이삼사오육칠팔구십일이삼사오육칠팔구십",
      is_active: true,
      opened_at: "2025-01-01T00:00:00Z",
      output_links: [],
    },
    { id: "wa-6", activity_type_id: "session", title: "데이터 기반 의사결정을 위한 마케팅 분석 프레임워크 세션", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    { id: "wa-7", activity_type_id: "practical_lecture", title: "크로스 펑셔널 협업 프로젝트: 제품팀과 마케팅팀의 Go-to-Market 전략 수립 워크숍 결과물 정리", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    {
      id: "wa-8",
      activity_type_id: "comp-1",
      title: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차일이삼사오육칠팔구십일이삼사오육칠팔구십가나다라마바사아자차카타파하",
      is_active: true,
      opened_at: "2025-01-01T00:00:00Z",
      output_links: [],
    },
    { id: "wa-comp-2", activity_type_id: "comp-2", title: "역량 진단", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    { id: "wa-comp-3", activity_type_id: "comp-3", title: "마케터 역량 진단 테스트 결과", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    { id: "wa-comp-4", activity_type_id: "comp-4", title: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    { id: "wa-9", activity_type_id: "exp-1", title: "커리어 역량 진단 테스트 결과", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    { id: "wa-10", activity_type_id: "exp-2", title: "동료 크루 3인의 마케팅 포트폴리오를 상호 피드백하며 각자의 강점과 개선점을 발견하는 실습", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    {
      id: "wa-11",
      activity_type_id: "exp-3",
      title: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차일이삼사오육칠팔구십일이삼사오육칠팔구십",
      is_active: true,
      opened_at: "2025-01-01T00:00:00Z",
      output_links: [],
    },
    { id: "wa-12", activity_type_id: "exp-4", title: "퍼포먼스 마케팅 캠페인 ROAS 분석 및 예산 재배분 최적화 전략 수립", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
  ]);

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
    total: number; // P
    success: number; // R
  }
  const [infoStats, setInfoStats] = useState<PracticalStats>({ total: 8, success: 5 });
  const [competencyStats, setCompetencyStats] = useState<PracticalStats>({ total: 1, success: 1 });
  const [experienceStats, setExperienceStats] = useState<PracticalStats>({ total: 4, success: 4 });
  const [careerStats, setCareerStats] = useState<PracticalStats>({ total: 5, success: 3 });

  // 강화 상태 판단용 (해당 주차 데이터)
  interface ActivityRecord {
    week_id: string;
    activity_type_id: string;
    is_completed: boolean;
  }
  const [weekActivityRecords, setWeekActivityRecords] = useState<ActivityRecord[]>([
    { week_id: "dummy-1", activity_type_id: "wisdom", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "essay", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "infodesk", is_completed: false },
    { week_id: "dummy-1", activity_type_id: "calendar", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "forum", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "session", is_completed: false },
    { week_id: "dummy-1", activity_type_id: "practical_lecture", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "comp-1", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "comp-2", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "comp-3", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "comp-4", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "exp-1", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "exp-2", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "exp-1", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "exp-2", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "exp-3", is_completed: true },
    { week_id: "dummy-1", activity_type_id: "exp-4", is_completed: true }, // TODO: 더미 데이터 — DB 연동 후 제거
  ]);
  const [weekApprovedTypes, setWeekApprovedTypes] = useState<Set<string>>(new Set());

  // 2차 정보 (서브타이틀, 아웃풋링크) - 해당 주차 데이터
  interface OutputLink {
    desc: string;
    url: string;
  }
  interface ActivityDetail {
    week_id: string;
    activity_type_id: string;
    sub_title: string | null;
    output_links: OutputLink[] | null;
  }
  const [weekActivityDetails, setWeekActivityDetails] = useState<ActivityDetail[]>([
    {
      week_id: "dummy-1",
      activity_type_id: "comp-1",
      sub_title:
        "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아일이삼사오",
      output_links: [],
    },
    { week_id: "dummy-1", activity_type_id: "comp-2", sub_title: "진단 결과", output_links: [] },
    { week_id: "dummy-1", activity_type_id: "comp-3", sub_title: "마케터 역량 진단 결과 요약 및 성장 로드맵", output_links: [] },
    { week_id: "dummy-1", activity_type_id: "comp-4", sub_title: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하", output_links: [] },
    { week_id: "dummy-1", activity_type_id: "exp-1", sub_title: "마케터 역량 진단 결과 요약 및 성장 로드맵", output_links: [] },
    { week_id: "dummy-1", activity_type_id: "exp-2", sub_title: "동료 피드백을 통해 발견한 강점 3가지와 보완이 필요한 영역 2가지를 정리한 액션 플랜", output_links: [] },
    {
      week_id: "dummy-1",
      activity_type_id: "exp-3",
      sub_title:
        "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아일이삼사오",
      output_links: [],
    },
    { week_id: "dummy-1", activity_type_id: "exp-4", sub_title: "구글 애즈와 메타 광고 플랫폼을 활용한 퍼포먼스 마케팅 캠페인 최적화 실습 결과 보고서: ROAS 분석 포함", output_links: [] },
  ]);

  // 활동별 평점 (activity_type_id → points)
  const [activityRatings, setActivityRatings] = useState<Map<string, number>>(
    new Map([
      ["comp-1", 6],
      ["exp-1", 3],
      ["exp-2", 6],
      ["exp-3", 10],
      ["exp-4", 8],
    ]),
  );

  // DB에서 가져온 activity_types 정보
  interface ActivityTypeInfo {
    id: string;
    name: string;
    line_code: string;
    cluster_id: string;
    description: string | null;
  }
  const [activityTypesMap, setActivityTypesMap] = useState<Map<string, ActivityTypeInfo>>(
    new Map([
      ["comp-1", { id: "comp-1", name: "[실무 Info]일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십", line_code: "CP09 - UN010", cluster_id: "practical_competency", description: null }],
      ["comp-2", { id: "comp-2", name: "[실무 Info]마케팅", line_code: "CP02 - MK001", cluster_id: "practical_competency", description: null }],
      ["comp-3", { id: "comp-3", name: "[실무 Info]인하우스 & 에이전시", line_code: "CP03 - HA001", cluster_id: "practical_competency", description: null }],
      ["comp-4", { id: "comp-4", name: "[실무 Info]가나다라마바사아자차카타파하가나다라마바사", line_code: "CP04 - LG001", cluster_id: "practical_competency", description: null }],
      ["comp-5", { id: "comp-5", name: "-", line_code: "-", cluster_id: "practical_competency", description: null }],
      ["exp-1", { id: "exp-1", name: "[커리어]마케터 Launch", line_code: "EX01 - SFA01", cluster_id: "practical_experience", description: null }],
      ["exp-2", { id: "exp-2", name: "[생산성]상호 피드백", line_code: "EX02 - RUA99", cluster_id: "practical_experience", description: null }],
      ["exp-3", { id: "exp-3", name: "[콘텐츠]마케팅 실무", line_code: "EX03 - RUA99", cluster_id: "practical_experience", description: null }],
      ["exp-4", { id: "exp-4", name: "[퍼포먼스]마케팅 실무", line_code: "EX04 - PMP01", cluster_id: "practical_experience", description: null }],
    ]),
  );
  const [competencyTypeIds, setCompetencyTypeIds] = useState<string[]>(["comp-1", "comp-2", "comp-3", "comp-4", "comp-5"]);
  const [experienceTypeIds, setExperienceTypeIds] = useState<string[]>(["exp-1", "exp-2", "exp-3", "exp-4"]);
  const [careerTypeIds, setCareerTypeIds] = useState<string[]>([]);

  // 실무 경험 활동 타입 상세 정보 (주차별 eligible 조건 포함) - cluster-4-1과 동일
  interface ExperienceTypeInfo {
    id: string;
    eligible_min_approved_weeks: number | null;
    eligible_max_approved_weeks: number | null;
    count_once_in_total: boolean;
  }
  const [experienceTypeInfos, setExperienceTypeInfos] = useState<ExperienceTypeInfo[]>([]);

  // 유저의 모든 완료된 활동 기록 (experience eligible 체크용) - cluster-4-1과 동일
  const [allUserCompletedActivities, setAllUserCompletedActivities] = useState<{ week_id: string; activity_type_id: string }[]>([]);

  // 온보딩 주차 여부 (1주차는 클럽 온보딩 주차로 강화 해당 없음)
  const [isOnboardingWeek, setIsOnboardingWeek] = useState<boolean>(false);

  // DB에서 가져온 실무 경력 데이터 (프로젝트 기반)
  interface CareerRecord {
    // 프로젝트 정보
    id: string;
    project_id: string;
    week_id: string;
    company_name: string;
    company_logo_url: string | null;
    job_position: string;
    project_name: string | null;
    project_description: string | null;
    line_code: string | null;
    line_name: string | null;
    output_links: { desc: string; url: string }[] | null;
    secondary_info_deadline: string | null;
    created_at: string;
    weeks?: {
      id: string;
      week_number: number;
      start_date: string;
      end_date: string;
      season_id: string;
      seasons?: {
        id: string;
        year: number;
        name: string;
      };
    };
    // 사용자 기록 상태
    record_id: string | null;
    user_id: string;
    enhancement_status: "not_applicable" | "pending" | "enhanced" | "failed";
    grade: string | null;
    grade_points: number | null;
    career_code: string | null;
    // 감독자 정보
    supervisor_name: string | null;
    supervisor_position: string | null;
    supervisor_department: string | null;
    supervisor_company: string | null;
    supervisor_profile_img: string | null;
  }

  const makeDemoCareer = (index: number, company: string, status: string, grade: string, participated: boolean): CareerRecord => ({
    id: `cr-demo-${index}`,
    project_id: `p-demo-${index}`,
    week_id: "demo",
    company_name: company,
    company_logo_url: `/images/0/cluster4/icon/실무 경력/감독자${index % 2 === 0 ? "" : "2"}.${index % 2 === 0 ? "jpg" : "png"}`,
    job_position: `${company} 마케팅`,
    project_name: `${company} ${participated ? "마케팅 캠페인 기획 및 실행 프로젝트" : "해당 프로젝트"}`,
    project_description: participated
      ? ["짧은 설명", "마케팅 캠페인 전략", "소셜미디어 채널별 바이럴 콘텐츠 전략 수립 및 성과 분석", "브랜드 스토리텔링의 핵심 요소와 소비자 인식 변화에 대한 에세이 작성 및 결과물 정리 보고서 작성까지", "퍼포먼스 마케팅 ROAS 분석", `${company}에서 진행한 마케팅 프로젝트의 상세 설명입니다`][
          index % 6
        ]
      : null,
    line_code: `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 1) % 26))}${10 + index}-${10000 + index}`,
    line_name: `${company} 마케팅`,
    output_links: [],
    secondary_info_deadline: null,
    created_at: "2025-12-22T00:00:00Z",
    record_id: `r-demo-${index}`,
    user_id: "u1",
    enhancement_status: status as CareerRecord["enhancement_status"],
    grade: grade || null,
    grade_points: participated ? Math.floor(Math.random() * 100) : 0,
    career_code: `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 1) % 26))}${10 + index}-${10000 + index}`,
    supervisor_name: ["김민지", "박서연", "조워싱턴", "이지은", "최수현"][index % 5],
    supervisor_position: ["대리", "과장", "팀장", "차장", "부장"][index % 5],
    supervisor_department: `${company} 마케팅팀`,
    supervisor_company: company,
    supervisor_profile_img: `/images/0/cluster4/icon/실무 경력/감독자${index % 2 === 0 ? "" : "2"}.${index % 2 === 0 ? "jpg" : "png"}`,
  });

  const getDemoCareerRecords = (wId: string): CareerRecord[] => {
    const weekNum = parseInt(wId.replace(/\D/g, "")) || 0;
    const caseNum = weekNum % 6;
    switch (caseNum) {
      case 0:
        return [];
      case 1:
        return [makeDemoCareer(1, "네이버", "enhanced", "S", true), makeDemoCareer(2, "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십", "enhanced", "A", true), makeDemoCareer(3, "라인", "not_applicable", "", false), makeDemoCareer(4, "쿠팡", "not_applicable", "", false)];
      case 2:
        return [
          makeDemoCareer(1, "삼성전자", "not_applicable", "", false),
          makeDemoCareer(2, "LG전자", "not_applicable", "", false),
          makeDemoCareer(3, "SK하이닉스", "not_applicable", "", false),
          makeDemoCareer(4, "현대자동차", "not_applicable", "", false),
          makeDemoCareer(5, "KT", "not_applicable", "", false),
          makeDemoCareer(6, "POSCO", "not_applicable", "", false),
        ];
      case 3:
        return [
          makeDemoCareer(1, "구글코리아", "enhanced", "S", true),
          makeDemoCareer(2, "애플코리아", "enhanced", "A", true),
          makeDemoCareer(3, "마이크로소프트", "enhanced", "B", true),
          makeDemoCareer(4, "아마존웹서비스", "pending", "C", true),
          makeDemoCareer(5, "메타코리아", "enhanced", "A", true),
          makeDemoCareer(6, "테슬라코리아", "not_applicable", "", false),
          makeDemoCareer(7, "엔비디아", "not_applicable", "", false),
        ];
      case 4:
        return Array.from({ length: 15 }, (_, i) => {
          const companies = ["우아한형제들", "토스", "당근마켓", "비바리퍼블리카", "야놀자", "NHN", "넷마블", "엔씨소프트", "크래프톤", "스마일게이트", "하이브", "JYP", "YG", "CJ ENM", "롯데이노베이트"];
          const isP = i < 10;
          return makeDemoCareer(i + 1, companies[i], isP ? (i % 3 === 0 ? "enhanced" : i % 3 === 1 ? "pending" : "failed") : "not_applicable", isP ? ["S", "A", "B", "C", "D"][i % 5] : "", isP);
        });
      case 5:
        return [makeDemoCareer(1, "스타벅스코리아", "enhanced", "S", true)];
      default:
        return [];
    }
  };

  const getDemoSectionStates = (wId: string) => {
    const weekNum = parseInt(wId.replace(/\D/g, "")) || 0;
    const caseNum = weekNum % 10;
    return {
      competencyParticipated: ![3, 0].includes(caseNum),
      isRestWeek: [5, 7, 9].includes(caseNum),
      careerCase: caseNum,
    };
  };

  // 데모 모드 — 주차별 활동 레코드 (역량/경험 강화실패 분산)
  const getDemoActivityRecords = (wId: string): ActivityRecord[] => {
    const weekNum = parseInt(wId.replace(/\D/g, "")) || 0;
    const caseNum = weekNum % 10;
    const infoTypes = ["wisdom", "essay", "infodesk", "calendar", "forum", "session", "practical_lecture", "community", "etc_a"];

    // 실무 정보 레코드 — 전 주차 공통 (기본 is_completed: true)
    const infoRecords: ActivityRecord[] = infoTypes.map((t) => ({ week_id: wId, activity_type_id: t, is_completed: true }));

    // 실무 역량 — 주차별 분기
    const compCompleted = (() => {
      if ([3, 0].includes(caseNum)) return false; // 미참여 → 강화 실패
      if ([6].includes(caseNum)) return false; // 참여했지만 강화 실패
      return true;
    })();
    const compRecords: ActivityRecord[] = ["comp-1", "comp-2", "comp-3", "comp-4"].map((t) => ({
      week_id: wId,
      activity_type_id: t,
      is_completed: compCompleted,
    }));
    // comp-5는 보이드 (레코드 없음)

    // 실무 경험 — 주차별 분기
    const expStatuses: boolean[] = (() => {
      if ([3, 0].includes(caseNum)) return [false, false, false, false]; // 전부 실패
      if ([2].includes(caseNum)) return [true, true, false, false]; // 일부 성공, 일부 실패
      if ([6].includes(caseNum)) return [true, false, true, false]; // 일부 대기, 일부 실패
      return [true, true, true, true]; // 전부 성공
    })();
    const expRecords: ActivityRecord[] = ["exp-1", "exp-2", "exp-3", "exp-4"].map((t, i) => ({
      week_id: wId,
      activity_type_id: t,
      is_completed: expStatuses[i] ?? true,
    }));

    return [...infoRecords, ...compRecords, ...expRecords];
  };

  const [careerRecords, setCareerRecords] = useState<CareerRecord[]>([
    {
      id: "cr-1",
      project_id: "p1",
      week_id: "w1",
      company_name: "우아한형제들",
      company_logo_url: "/images/0/naver webtoon.png",
      job_position: "서비스기획팀",
      project_name: "배달의민족 브랜드 바이럴 마케팅 캠페인 기획 및 실행",
      project_description: "소셜미디어 채널별 바이럴 콘텐츠 전략 수립 및 성과 분석",
      line_code: "AA22-11111",
      line_name: "마케팅(바이럴)",
      output_links: [],
      secondary_info_deadline: null,
      created_at: "2025-12-22T00:00:00Z",
      record_id: "r1",
      user_id: "u1",
      enhancement_status: "enhanced",
      grade: "S",
      grade_points: 99,
      career_code: "AA22-11111",
      supervisor_name: "김민지",
      supervisor_position: "대리",
      supervisor_department: "서비스기획팀",
      supervisor_company: "우아한형제들",
      supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
    },
    {
      id: "cr-2",
      project_id: "p2",
      week_id: "w1",
      company_name: "에스엠엔터테인먼트",
      company_logo_url: "/images/0/CJ_logo.svg.png",
      job_position: "브랜드마케팅",
      project_name: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차일이",
      project_description:
        "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아일이삼사오",
      line_code: "BB33-22222",
      line_name: "퍼포먼스마케팅",
      output_links: [],
      secondary_info_deadline: null,
      created_at: "2025-12-22T00:00:00Z",
      record_id: "r2",
      user_id: "u1",
      enhancement_status: "enhanced",
      grade: "A",
      grade_points: 85,
      career_code: "BB33-22222",
      supervisor_name: "박서연",
      supervisor_position: "과장",
      supervisor_department: "브랜드마케팅",
      supervisor_company: "에스엠엔터",
      supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자2.png",
    },
    {
      id: "cr-3",
      project_id: "p3",
      week_id: "w1",
      company_name: "",
      company_logo_url: null,
      job_position: "",
      project_name: "개인 프로젝트",
      project_description: null,
      line_code: null,
      line_name: null,
      output_links: [],
      secondary_info_deadline: null,
      created_at: "2025-12-22T00:00:00Z",
      record_id: "r3",
      user_id: "u1",
      enhancement_status: "not_applicable",
      grade: "D",
      grade_points: 1,
      career_code: null,
      supervisor_name: "조워싱턴",
      supervisor_position: null,
      supervisor_department: null,
      supervisor_company: null,
      supervisor_profile_img: null,
    },
  ]);
  const [isLoadingCareerRecords, setIsLoadingCareerRecords] = useState(false);
  const [careerPage, setCareerPage] = useState(0);

  // 모달 편집 상태 (activity_type_id별로 관리)
  const [editingDetails, setEditingDetails] = useState<{
    [activityType: string]: {
      subTitle: string;
      outputLinks: OutputLink[];
    };
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  // activity_type_id별 파트 분류 (기본값 - DB에서 가져온 후 업데이트됨)
  const infoTypes = ["calendar", "essay", "forum", "infodesk", "session", "wisdom", "practical_lecture", "community", "etc_a"];
  // competencyTypes, experienceTypes, careerTypes는 이제 state로 관리됨

  // 역할 라벨 매핑
  const roleLabels: { [key: string]: string } = {
    crew: "일반",
    crew_regular: "일반",
    part_leader: "심화(파트장)",
    crew_partleader: "심화(파트장)",
    operations_partleader: "심화(파트장)",
    crew_agent: "심화(에이전트)",
    operations_ambassador: "운영진(앰배서더)",
    operations_teamleader: "운영진(팀장)",
    operations_clubleader: "운영진(클럽장)",
  };

  // 실무 역량 아이콘 매핑 (activity_type_id → 이미지 파일명)
  const competencyIconMap: { [key: string]: string } = {
    contents_series_understanding: "실무 역량 - [콘텐츠]시리즈_이해.png",
    contents_series_planning: "실무 역량 - [콘텐츠]시리즈_기획.png",
    contents_series_production: "실무 역량 - [콘텐츠]시리즈_제작.png",
    contents_series_publish: "실무 역량 - [콘텐츠]시리즈_발행.png",
    contents_viral_marketing: "실무 역량 - [콘텐츠] 바이럴 마케팅.png",
    job_contents_marketing: "실무 역량 - [Job]콘텐츠 마케팅.png",
    job_performance_marketing: "실무 역량 - [Job]퍼포먼스 마케팅.png",
    job_branding_marketing: "실무 역량 - [Job]브랜딩 마케팅.png",
    practical_info_inhouse_agency: "실무 역량 - [실무 Info]인하우스 & 에이전시.png",
    practical_info_marketing_terms: "실무 역량 - [실무 Info]마케팅 용어 & 개념.png",
    practical_resource_iboss: "실무 역량 - 아이보스.png",
    work_resource_openads: "실무 역량 - 오픈애즈.png",
    work_resource_free_choice: "실무 역량 - [Reference]자유 선택.png",
    practical_skill_google: "실무 역량 - 구글.png",
    practical_skill_listly: "실무 역량 - 리스틀리.png",
    practical_skill_kakao: "실무 역량 - 카카오.png",
    practical_skill_naver: "실무 역량 - 네이버.png",
    reference_instagram: "실무 역량 - 인스타그램.png",
    reference_naver: "실무 역량 - 네이버.png",
    reference_free_choice: "실무 역량 - [Reference]자유 선택.png",
    practical_planning_online_marketing: "실무 역량 - [실무 기획] 온라인 마케팅.png",
    "comp-1": "실무 역량 - [실무 Info]인하우스 & 에이전시.png",
  };

  // 실무 역량 아이콘 경로 가져오기 헬퍼 함수
  const getCompetencyIconPath = (activityTypeId: string): string => {
    const fileName = competencyIconMap[activityTypeId];
    if (fileName) {
      return `/images/0/cluster4/icon/실무 역량/${fileName}`;
    }
    return "/images/0/cluster4/icon/실무 역량/실무 역량 - default.png";
  };

  // 실무 경험 아이콘 매핑 (activity_type_id → 이미지 파일명)
  const experienceIconMap: { [key: string]: string } = {
    career_marketer_launch: "실무 경험 - [커리어]마케터 Launch.png",
    productivity_feedback: "실무 경험 - [생산성]상호 피드백.png",
    contents_marketing_practical: "실무 경험 - [콘텐츠]마케팅 실무.png",
    performance_marketing_practical: "실무 경험 - [퍼포먼스]마케팅 실무.png",
    "exp-1": "실무 경험 - [커리어]마케터 Launch.png",
    "exp-2": "실무 경험 - [생산성]상호 피드백.png",
    "exp-3": "실무 경험 - [콘텐츠]마케팅 실무.png",
    "exp-4": "실무 경험 - [퍼포먼스]마케팅 실무.png", // TODO: 더미 데이터 — DB 연동 후 제거
  };

  // 실무 경험 아이콘 경로 가져오기 헬퍼 함수
  const getExperienceIconPath = (activityTypeId: string): string => {
    const fileName = experienceIconMap[activityTypeId];
    if (fileName) {
      return `/images/0/cluster4/icon/실무 경험/${fileName}`;
    }
    return "/images/0/cluster4/icon/실무 경험/실무 경험 - default.png";
  };

  // 시즌 이름 변환 맵
  const seasonNameMap: { [key: string]: string } = {
    spring: "봄",
    summer: "여름",
    fall: "가을",
    winter: "겨울",
  };

  // 날짜 포맷 함수 (2026-01-05 → 2026 - 01 - 05 (월))
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayOfWeek = days[date.getDay()];
    return `${year} - ${month} - ${day} (${dayOfWeek})`;
  };

  // DB에서 주차 데이터 및 관련 정보 가져오기
  useEffect(() => {
    if (isDemoMode) {
      // weekId로 공유 더미 데이터 조회 (cluster-4 시즌 페이지와 동기화)
      const dummyWeek = DUMMY_WEEKLY_LIST.find((w) => w.id === weekId);
      const dummyExtra = DUMMY_WEEK_EXTRA[weekId];

      if (dummyWeek) {
        setWeekData({
          id: dummyWeek.id,
          weekNumber: dummyWeek.weekNumber,
          seasonYear: dummyWeek.seasonYear,
          seasonName: dummyWeek.seasonName,
          isBreakSeason: dummyWeek.isBreakSeason,
          toSeasonName: dummyWeek.toSeason,
          startDate: dummyWeek.startDate,
          endDate: dummyWeek.endDate,
          isClubBreak: dummyWeek.isClubBreak,
          holidayName: dummyWeek.holidayName,
          growthStatus: dummyWeek.growthStatus,
        });
      } else {
        setWeekData({
          id: "demo-week",
          weekNumber: 3,
          seasonYear: 2025,
          seasonName: "여름",
          isBreakSeason: false,
          toSeasonName: null,
          startDate: "2025-03-23",
          endDate: "2025-03-30",
          isClubBreak: false,
          holidayName: null,
          growthStatus: "성공",
        });
      }

      if (dummyExtra) {
        setTeamName(dummyExtra.teamPart.teamName);
        setPartName(dummyExtra.teamPart.partName);
        setRoleLabel(dummyExtra.roleLabel);
        setWeekPoints(dummyExtra.points);
        setCumulativeInjeolmi(dummyExtra.points.shield);
      }

      // 데모 모드 실무 경력 더미 데이터
      setCareerRecords(getDemoCareerRecords(weekId));
      setCareerPage(0);

      // 데모 모드 활동 레코드 (역량/경험 강화실패 분산)
      setWeekActivityRecords(getDemoActivityRecords(weekId));

      // 이전/다음 주차 ID 설정 (내림차순: index-1 = 더 최근(다음), index+1 = 더 과거(이전))
      const weekIndex = DUMMY_WEEKLY_LIST.findIndex((w) => w.id === weekId);
      if (weekIndex >= 0) {
        if (weekIndex > 0) setNextWeekId(DUMMY_WEEKLY_LIST[weekIndex - 1].id);
        if (weekIndex < DUMMY_WEEKLY_LIST.length - 1) setPrevWeekId(DUMMY_WEEKLY_LIST[weekIndex + 1].id);
      }

      // 데모 모드: urlUserId → API로 이름 조회 → 이름별 고정 competency 매핑
      if (urlUserId) {
        (async () => {
          try {
            const res = await fetch(`/api/profile/?userId=${urlUserId}`);
            const json = await res.json();
            const name = json.data?.display_name || null;
            const compMap: Record<string, string[]> = {
              윤재윤: ["comp-3"],
              전민경: ["comp-2"],
              곽예원: ["comp-5"],
              안지혜: ["comp-4"],
              김의환: ["comp-1"],
            };
            // 이름에서 매칭 (부분 일치도 허용)
            const matched = Object.entries(compMap).find(([key]) => name?.includes(key));
            if (matched) {
              setCompetencyTypeIds(matched[1]);
            }
          } catch (e) {
            // API 실패 시 기본값 유지
          }
        })();
      }

      return;
    }
    const fetchWeekData = async () => {
      if (!weekId) return;

      // 상태 리셋
      setPrevWeekId(null);
      setNextWeekId(null);

      try {
        setIsLoadingWeek(true);

        // ========== 1단계: 모든 독립 데이터 최대 병렬 로드 ==========
        const profileUrl = urlUserId ? `/api/profile?userId=${urlUserId}&context=card` : "/api/profile?context=card";
        const earlyUserId = urlUserId || null;

        // 기본 DB + 프로필 쿼리
        const basePromise = Promise.all([
          supabase.from("activity_types").select("id, name, line_code, cluster_id, description, eligible_min_approved_weeks, eligible_max_approved_weeks, count_once_in_total").eq("is_active", true),
          supabase.from("weeks").select("id, week_number, start_date, end_date, is_club_break, holiday_name, seasons (id, year, name)").eq("id", weekId).single(),
          fetch(profileUrl),
          supabase.from("weeks").select("id, start_date, end_date, season_id, seasons(name)").order("start_date", { ascending: false }),
          supabase.from("weekly_activities").select("id, activity_type_id, title, is_active, opened_at, output_links").eq("week_id", weekId),
        ]);

        // urlUserId가 있으면 API fetch + DB 쿼리도 동시 시작
        const earlyApiPromise = earlyUserId
          ? Promise.all([
              fetch(`/api/career-records?week_id=${weekId}&user_id=${earlyUserId}`, { cache: "no-store" })
                .then((r) => r.json())
                .catch(() => null),
              fetch(`/api/weekly-reputations?targetUserId=${earlyUserId}&weekCardId=${weekId}`)
                .then((r) => r.json())
                .catch(() => null),
              fetch(`/api/weekly-colleagues?userId=${earlyUserId}&weekCardId=${weekId}`)
                .then((r) => r.json())
                .catch(() => null),
            ])
          : Promise.resolve([null, null, null] as const);

        const earlyDbPromise = earlyUserId
          ? Promise.all([
              supabase.from("user_weekly_growth").select("is_success, is_resting, is_club_break, failure_reason").eq("user_id", earlyUserId).eq("week_id", weekId).maybeSingle(),
              supabase.from("points").select("week_id, point_type, points").eq("user_id", earlyUserId),
              supabase.from("user_weekly_growth").select("week_id, weeks!inner(end_date)").eq("user_id", earlyUserId).eq("is_success", true),
            ])
          : null;

        // 모든 병렬 요청 동시 대기
        const [baseResults, earlyApiResults, earlyDbResults] = await Promise.all([basePromise, earlyApiPromise, earlyDbPromise]);
        const [activityTypesResult, currentWeekResult, profileResponse, allUserWeeksResult, activitiesResult] = baseResults;
        const [earlyCareerResult, earlyReputationsResult, earlyColleaguesResult] = earlyApiResults;

        const activityTypesData = activityTypesResult.data;
        const currentWeek = currentWeekResult.data;
        const weekError = currentWeekResult.error;

        if (weekError) throw weekError;

        // activity_types 처리
        const typesMap = new Map<string, ActivityTypeInfo>();
        const competencyIds: string[] = [];
        const experienceIds: string[] = [];
        const careerIds: string[] = [];
        const experienceInfos: ExperienceTypeInfo[] = [];

        if (activityTypesData) {
          activityTypesData.forEach((at) => {
            typesMap.set(at.id, at);
            if (at.cluster_id === "practical_competency") {
              competencyIds.push(at.id);
            } else if (at.cluster_id === "practical_experience") {
              experienceIds.push(at.id);
              experienceInfos.push({
                id: at.id,
                eligible_min_approved_weeks: at.eligible_min_approved_weeks,
                eligible_max_approved_weeks: at.eligible_max_approved_weeks,
                count_once_in_total: at.count_once_in_total || false,
              });
            } else if (at.cluster_id === "practical_career") {
              careerIds.push(at.id);
            }
          });
          setActivityTypesMap(typesMap);
          setCompetencyTypeIds(competencyIds);
          setExperienceTypeIds(experienceIds);
          setCareerTypeIds(careerIds);
          setExperienceTypeInfos(experienceInfos);
        }

        // 현재 주차 정보 처리
        if (!currentWeek) throw new Error("Week not found");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const seasonData = currentWeek.seasons as any;
        const rawSeasonName = seasonData?.name || "";
        const isBreakSeason = rawSeasonName.toLowerCase().includes("break");
        let seasonName = seasonNameMap[rawSeasonName] || rawSeasonName;
        let toSeasonName: string | null = null;

        if (isBreakSeason) {
          const parts = rawSeasonName.replace("_break", "").split("_");
          if (parts.length >= 2) {
            toSeasonName = seasonNameMap[parts[1]] || parts[1];
          }
          seasonName = "시즌 전환";
        }

        // 프로필 정보 처리
        const profileResult = await profileResponse.json();
        if (!profileResponse.ok || !profileResult.data?.id) {
          console.error("Failed to fetch profile");
          return;
        }

        const userId = profileResult.data.id;
        setCurrentUserId(userId);
        const apiActivityWeekIds = profileResult.activityWeekIds || [];
        const apiRestWeekIds = profileResult.restWeekIds || [];
        const apiApprovedActivities = profileResult.approvedActivities || [];
        const apiActivityRecords = profileResult.activityRecords || [];
        const apiActivityDetails = profileResult.activityDetails || [];
        const apiActivityPoints = profileResult.activityPoints || [];

        // profile API에서 제공하는 teams, parts 사용
        const apiTeams = profileResult.teams || [];
        const apiParts = profileResult.parts || [];
        const apiUserTeamParts = profileResult.userTeamParts || [];

        // ========== 2단계: userId 의존 데이터 (Stage 1에서 선행 실행 안 된 경우만) ==========
        const today = new Date().toISOString().split("T")[0];
        const userStartDate = profileResult.growthInfo?.startDate || "1900-01-01";

        let weeklyGrowthResult, pointsResult, successWeeksResult;
        if (earlyDbResults) {
          // Stage 1에서 이미 병렬 실행됨
          [weeklyGrowthResult, pointsResult, successWeeksResult] = earlyDbResults;
        } else {
          // urlUserId가 없어서 profile에서 userId를 받은 후에야 실행 가능
          [weeklyGrowthResult, pointsResult, successWeeksResult] = await Promise.all([
            supabase.from("user_weekly_growth").select("is_success, is_resting, is_club_break, failure_reason").eq("user_id", userId).eq("week_id", weekId).maybeSingle(),
            supabase.from("points").select("week_id, point_type, points").eq("user_id", userId),
            supabase.from("user_weekly_growth").select("week_id, weeks!inner(end_date)").eq("user_id", userId).eq("is_success", true),
          ]);
        }

        // 누적 주차는 Stage 1의 allUserWeeksResult를 클라이언트 필터로 대체
        const allWeeksForCumulative = (allUserWeeksResult.data || []).filter((w: any) => w.end_date && w.end_date <= currentWeek.end_date);
        const allWeeksResult = { data: allWeeksForCumulative };

        // 성장 상태 결정
        const weeklyGrowth = weeklyGrowthResult.data;
        const onboardingWeekId = profileResult.onboardingWeekId;
        const isCurrentWeekOnboarding = weekId === onboardingWeekId;

        let growthStatus = "실패";
        // 온보딩 주차(무적 주차)는 무조건 성공
        if (isCurrentWeekOnboarding) {
          growthStatus = "성공";
        } else if (weeklyGrowth) {
          if (weeklyGrowth.is_club_break || isBreakSeason) {
            growthStatus = "휴식(공식)";
          } else if (weeklyGrowth.is_resting) {
            growthStatus = "휴식(개인)";
          } else if (weeklyGrowth.is_success) {
            growthStatus = "성공";
          } else {
            growthStatus = "실패";
          }
        } else {
          if (currentWeek.is_club_break || isBreakSeason) {
            growthStatus = "휴식(공식)";
          } else if (apiRestWeekIds.includes(currentWeek.id)) {
            growthStatus = "휴식(개인)";
          } else if (apiActivityWeekIds.includes(currentWeek.id)) {
            growthStatus = "성공";
          }
        }

        setWeekData({
          id: currentWeek.id,
          weekNumber: currentWeek.week_number,
          seasonYear: seasonData?.year || 0,
          seasonName,
          isBreakSeason,
          toSeasonName,
          startDate: currentWeek.start_date,
          endDate: currentWeek.end_date,
          isClubBreak: currentWeek.is_club_break || false,
          holidayName: currentWeek.holiday_name,
          growthStatus,
        });

        // 팀/파트 정보 처리 (profile API 데이터 활용)
        // left_at은 떠난 날이므로 그 날짜에는 이미 해당 팀/파트에 속하지 않음
        const userTeamPart = apiUserTeamParts.find((utp: any) => {
          const joinedAt = new Date(utp.joined_at);
          const leftAt = utp.left_at ? new Date(utp.left_at) : null;
          const weekStart = new Date(currentWeek.start_date);
          return joinedAt <= weekStart && (!leftAt || leftAt > weekStart);
        });

        if (userTeamPart) {
          setGeneration(userTeamPart.generation || null);
          const team = apiTeams.find((t: any) => t.id === userTeamPart.team_id);
          const part = apiParts.find((p: any) => p.id === userTeamPart.part_id);
          const managedTeam = apiTeams.find((t: any) => t.id === userTeamPart.managed_team_id);
          setTeamName(team?.name || null);
          setPartName(part?.name || null);
          setManagedTeamName(managedTeam?.name || null);
        }

        // 역할 정보 (profile API에서 제공하는 userRoleHistory 활용)
        // ended_at은 종료 날이므로 그 날짜에는 이미 해당 역할이 아님
        const apiUserRoleHistory = profileResult.userRoleHistory || [];
        const userRole = apiUserRoleHistory.find((urh: any) => {
          const startedAt = new Date(urh.started_at);
          const endedAt = urh.ended_at ? new Date(urh.ended_at) : null;
          const weekStart = new Date(currentWeek.start_date);
          return startedAt <= weekStart && (!endedAt || endedAt > weekStart);
        });

        if (userRole) {
          setRoleLabel(roleLabels[userRole.role] || userRole.role);
        } else if (profileResult.data?.role) {
          setRoleLabel(roleLabels[profileResult.data.role] || profileResult.data.role);
        }

        // 포인트 정보 처리
        const allPointsData = pointsResult.data || [];
        const weekPointsData = allPointsData.filter((p) => p.week_id === weekId);
        if (weekPointsData.length > 0) {
          const star = weekPointsData.filter((p) => p.point_type === "star").reduce((sum, p) => sum + p.points, 0);
          const lightning = weekPointsData.filter((p) => p.point_type === "lightning").reduce((sum, p) => sum + p.points, 0);
          const shield = weekPointsData.filter((p) => p.point_type === "shield").reduce((sum, p) => sum + p.points, 0);
          setWeekPoints({ star, lightning, shield });
        }

        // 누적 성공 주차 수 계산
        let currentApprovedCount = 0;
        const successWeeksData = successWeeksResult.data || [];
        if (successWeeksData.length > 0) {
          currentApprovedCount = successWeeksData.filter((sw: any) => {
            const weekEndDate = sw.weeks?.end_date;
            return weekEndDate && weekEndDate <= currentWeek.end_date;
          }).length;
        }

        // 온보딩 주차(무적 주차)는 성공 주차에 포함 (user_weekly_growth에 레코드가 없어도)
        const onboardingWeekIdForCount = profileResult.onboardingWeekId;
        if (onboardingWeekIdForCount) {
          // 온보딩 주차가 이미 successWeeksData에 포함되어 있는지 확인
          const onboardingAlreadyCounted = successWeeksData.some((sw: any) => sw.week_id === onboardingWeekIdForCount);
          if (!onboardingAlreadyCounted) {
            // allWeeksResult에서 온보딩 주차의 end_date 찾기
            const onboardingWeekInfo = allWeeksResult.data?.find((w: any) => w.id === onboardingWeekIdForCount);
            if (onboardingWeekInfo && onboardingWeekInfo.end_date <= currentWeek.end_date) {
              currentApprovedCount += 1;
            }
          }
        }
        setCumulativeApprovedWeeks(currentApprovedCount);

        // 이전/다음 주차 ID 가져오기
        const allUserWeeks = allUserWeeksResult.data;

        if (allUserWeeks && allUserWeeks.length > 0) {
          // 클라이언트에서 날짜 필터링 + break 시즌 제외
          const filteredWeeks = allUserWeeks.filter((w) => {
            const sName = (w.seasons as any)?.name || "";
            const isBreakSeason = sName.toLowerCase().includes("break");
            return w.start_date >= userStartDate && w.start_date <= today && !isBreakSeason;
          });

          const currentIndex = filteredWeeks.findIndex((w) => w.id === weekId);

          if (currentIndex !== -1) {
            // 내림차순 정렬이므로: index-1 = 더 최근(다음), index+1 = 더 과거(이전)
            if (currentIndex > 0) {
              setNextWeekId(filteredWeeks[currentIndex - 1].id);
            }
            if (currentIndex < filteredWeeks.length - 1) {
              setPrevWeekId(filteredWeeks[currentIndex + 1].id);
            }
          }
        }

        // 9. 주간 활동 데이터 처리 (이미 병렬로 가져옴)
        const activitiesData = activitiesResult.data;
        const activitiesError = activitiesResult.error;

        if (activitiesError) {
          console.error("주간 활동 데이터 로드 오류:", activitiesError);
        } else if (activitiesData) {
          setWeeklyActivities(activitiesData);

          // 11. 파트별 강화 집계 계산
          // activity_type_id별 파트 분류 (DB에서 가져온 데이터 사용)
          const infoTypesList = ["calendar", "essay", "forum", "infodesk", "session", "wisdom", "practical_lecture", "community", "etc_a"];
          const competencyTypesList = competencyIds.length > 0 ? competencyIds : [];
          const experienceTypesList = experienceIds.length > 0 ? experienceIds : [];
          const careerTypesList = careerIds.length > 0 ? careerIds : ["practical_project"];

          // P (열린 총 활동 수): is_active=true인 weekly_activities
          const activeActivities = activitiesData.filter((a) => a.is_active);

          // 10. 유저 활동 데이터 (profile API에서 가져온 데이터 활용 - RLS 우회)
          // 해당 주차의 approved activity_type_id 목록 추출
          const weekApprovedActivities = apiApprovedActivities.filter((a: { week_id: string; activity_type_id: string }) => a.week_id === weekId);

          const approvedActivityTypes = new Set<string>(weekApprovedActivities.map((a: { activity_type_id: string }) => a.activity_type_id));

          // 11. 강화 상태 판단용 데이터 설정
          // 해당 주차의 activity_records 필터링
          const filteredActivityRecords = apiActivityRecords.filter((ar: { week_id: string }) => ar.week_id === weekId);
          setWeekActivityRecords(filteredActivityRecords);
          setWeekApprovedTypes(approvedActivityTypes);

          // 12. 2차 정보 (서브타이틀, 아웃풋링크) 필터링
          const filteredActivityDetails = apiActivityDetails.filter((ad: { week_id: string }) => ad.week_id === weekId);
          setWeekActivityDetails(filteredActivityDetails);

          // 13. 평점 매핑 (activity_records.id → points → activity_type_id)
          const ratingsMap = new Map<string, number>();
          filteredActivityRecords.forEach((ar: { id: string; activity_type_id: string }) => {
            const pointData = apiActivityPoints.find((p: { activity_id: string }) => p.activity_id === ar.id);
            if (pointData) {
              ratingsMap.set(ar.activity_type_id, pointData.points);
            }
          });
          setActivityRatings(ratingsMap);

          // cluster-4-1과 동일한 로직으로 해당 주차 데이터 계산
          // 온보딩 주차 확인
          const onboardingWeekId = profileResult.onboardingWeekId;
          const isOnboardingWeekLocal = weekId === onboardingWeekId;
          setIsOnboardingWeek(isOnboardingWeekLocal);

          // 유저의 모든 완료 활동 저장 (experience eligible 체크용)
          const allCompletedActivities = apiActivityRecords
            .filter((ar: { is_completed: boolean }) => ar.is_completed)
            .map((ar: { week_id: string; activity_type_id: string }) => ({
              week_id: ar.week_id,
              activity_type_id: ar.activity_type_id,
            }));
          setAllUserCompletedActivities(allCompletedActivities);

          // 누적 성공 주차 수 (현재 주차 포함) - 위에서 계산된 값 사용
          const currentCumulativeApproved = currentApprovedCount;

          // 실무 정보: 온보딩 주차면 0 (강화율 계산에서 제외), 아니면 해당 주차의 활성화된 활동 수
          const infoTotal = isOnboardingWeekLocal ? 0 : activeActivities.filter((a) => infoTypesList.includes(a.activity_type_id)).length;

          // 실무 역량: 온보딩 주차면 0 (강화율 계산에서 제외), 아니면 1 (매주 최대 1개 선택 가능)
          const competencyTotal = isOnboardingWeekLocal ? 0 : 1;

          // 실무 경험: eligible 조건 체크 (cluster-4-1과 동일한 로직)
          let experienceTotal = 0;
          if (!isOnboardingWeekLocal) {
            const experienceActivities = activeActivities.filter((a) => experienceTypesList.includes(a.activity_type_id));

            experienceActivities.forEach((a) => {
              const typeInfo = experienceInfos.find((info) => info.id === a.activity_type_id);

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
                  const previouslyCompleted = allCompletedActivities.some((ca: { week_id: string; activity_type_id: string }) => ca.activity_type_id === a.activity_type_id && ca.week_id !== weekId);
                  if (!previouslyCompleted) {
                    experienceTotal++;
                  }
                } else {
                  experienceTotal++;
                }
              }
            });
          }

          // 실무 경력: career_records 기반으로 계산됨 (별도 useEffect에서 처리)
          // 여기서는 초기값 0으로 설정, career_records 로드 후 덮어씀

          // success 계산 (강화 성공 기준: is_completed + (48시간 경과 OR 2차 정보 기입))
          // 해당 주차의 완료된 활동만 필터링
          type CompletedActivity = { week_id: string; activity_type_id: string };
          const weekCompletedActivities = allCompletedActivities.filter((a: CompletedActivity) => a.week_id === weekId);

          // 강화 성공 여부 판단 헬퍼 함수 (getEnhancementStatus와 동일한 로직)
          const isEnhancementSuccess = (activityTypeId: string): boolean => {
            // 1. 활동 완료 여부 확인
            const isCompleted = weekCompletedActivities.some((a: CompletedActivity) => a.activity_type_id === activityTypeId);
            if (!isCompleted) return false;

            // 2. 2차 정보 기입 여부 확인
            const detail = filteredActivityDetails.find((d: { activity_type_id: string; sub_title: string | null; output_links: OutputLink[] | null }) => d.activity_type_id === activityTypeId);
            const hasSecondaryInfo = detail && (detail.sub_title || (detail.output_links && detail.output_links.length > 0));
            if (hasSecondaryInfo) return true;

            // 3. 48시간 경과 여부 확인
            const activity = activitiesData.find((a) => a.activity_type_id === activityTypeId);
            if (!activity?.opened_at) return false;

            const openedTime = new Date(activity.opened_at).getTime();
            const now = Date.now();
            const elapsed = now - openedTime;
            const deadline = 48 * 60 * 60 * 1000; // 48시간 (밀리초)

            return elapsed >= deadline;
          };

          const infoSuccess = infoTypesList.filter((activityTypeId) => isEnhancementSuccess(activityTypeId)).length;
          // 실무 역량 success: 온보딩 주차면 0 (강화율 계산에서 제외)
          const competencySuccess = isOnboardingWeekLocal ? 0 : competencyTypesList.some((activityTypeId) => isEnhancementSuccess(activityTypeId)) ? 1 : 0;
          const experienceSuccess = isOnboardingWeekLocal ? 0 : experienceTypesList.filter((activityTypeId) => isEnhancementSuccess(activityTypeId)).length;
          // 실무 경력 success: career_records 기반으로 계산됨 (별도 useEffect에서 처리)

          setInfoStats({ total: infoTotal, success: infoSuccess });
          setCompetencyStats({ total: competencyTotal, success: competencySuccess });
          setExperienceStats({ total: experienceTotal, success: experienceSuccess });
          // careerStats는 career_records useEffect에서 설정됨
        }

        // Stage 1에서 선행 로드된 데이터 적용
        if (earlyCareerResult?.success && earlyCareerResult.data) {
          setCareerRecords(earlyCareerResult.data);
        }
        if (earlyReputationsResult?.success && earlyReputationsResult.data) {
          setWeeklyReputations(earlyReputationsResult.data);
        }
        if (earlyColleaguesResult?.success && earlyColleaguesResult.data) {
          const colleagues = earlyColleaguesResult.data.map((item: any) => ({
            id: item.colleague?.id || item.colleague_id,
            name: item.colleague?.name || "-",
            gender: item.colleague?.gender || "-",
            age: item.colleague?.age || "-",
            profileImg: item.colleague?.profileImg || "",
            university: item.colleague?.university || "-",
            major: item.colleague?.major || "-",
            team: item.colleague?.team || "-",
            part: item.colleague?.part || "-",
            nickname: item.colleague?.nickname || "-",
            role: item.colleague?.role || "",
            rank: item.rank,
            message: item.message || "",
            createdAt: item.created_at || "",
          }));
          setSelectedColleagues(colleagues);
        }
      } catch (error) {
        console.error("주차 데이터 로드 오류:", error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    fetchWeekData();
  }, [weekId, urlUserId]);

  // DB에서 실무 경력 데이터 가져오기
  // career-records는 urlUserId가 있으면 Stage 1에서 이미 로드됨 (earlyCareerResult)
  // currentUserId만 있는 경우(본인 조회)에만 별도 fetch
  useEffect(() => {
    if (isDemoMode) return; // 데모 모드에서는 API 호출 스킵
    const fetchCareerRecords = async () => {
      if (!weekId) return;
      // urlUserId가 있으면 Stage 1에서 이미 처리됨
      if (urlUserId) return;
      if (!currentUserId) return;

      setIsLoadingCareerRecords(true);
      try {
        const params = new URLSearchParams({ week_id: weekId, user_id: currentUserId });
        const response = await fetch(`/api/career-records?${params.toString()}`, { cache: "no-store" });
        const result = await response.json();
        if (result.success && result.data) {
          setCareerRecords(result.data);
        }
      } catch (error) {
        console.error("Error fetching career records:", error);
      } finally {
        setIsLoadingCareerRecords(false);
      }
    };

    fetchCareerRecords();
  }, [currentUserId, weekId, urlUserId]);

  // 실무 경력 통계 업데이트 (computed status 기반)
  // total: 해당 주차의 전체 프로젝트 수 (제한 없음)
  // success: 강화 성공한 프로젝트 수 (computed enhanced - 최대 total개)
  useEffect(() => {
    // 전체 프로젝트 수 (제한 없음)
    const rawTotal = careerRecords.length;
    const total = rawTotal;
    // computed status 기반: pending이어도 2차 정보 작성 or 마감 경과 시 성공으로 카운트
    const enhancedCount = careerRecords.filter((r, index) => {
      if (r.enhancement_status === "enhanced") return true;
      if (r.enhancement_status === "pending") {
        const activityType = (careerTypeIds.length > 0 ? careerTypeIds : ["practical_project"])[index];
        const detail = activityType ? weekActivityDetails.find((d) => d.activity_type_id === activityType) : null;
        const hasSecondaryInfo = detail && ((detail.sub_title && detail.sub_title.trim() !== "") || (detail.output_links && detail.output_links.some((link: { url?: string }) => link?.url && link.url.trim() !== "")));
        const deadlinePassed = r.secondary_info_deadline ? new Date(r.secondary_info_deadline) <= new Date() : false;
        return hasSecondaryInfo || deadlinePassed;
      }
      return false;
    }).length;
    const success = Math.min(enhancedCount, total);
    setCareerStats({ total, success });
  }, [careerRecords, weekActivityDetails]);

  // 키워드 목록 가져오기 (모달 열릴 때 lazy load)
  const fetchKeywordsIfNeeded = async () => {
    if (isDemoMode) return; // 더미 모드: API 스킵
    if (reputationKeywords.length > 0) return;
    try {
      const res = await fetch("/api/reputation-keywords");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReputationKeywords(json.data);
        }
      }
    } catch (error) {
      console.error("키워드 목록 가져오기 오류:", error);
    }
  };

  // 주차 평판 데이터 가져오기 함수
  const fetchWeeklyReputations = async () => {
    if (!urlUserId || !weekId) return;
    try {
      const res = await fetch(`/api/weekly-reputations?targetUserId=${urlUserId}&weekCardId=${weekId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setWeeklyReputations(json.data);
        }
      }
    } catch (error) {
      console.error("주차 평판 데이터 가져오기 오류:", error);
    }
  };

  // 주차 평판 데이터 초기 로드 (urlUserId가 없는 경우만 - 있으면 Stage 1에서 이미 로드됨)
  useEffect(() => {
    if (isDemoMode) return; // 데모 모드에서는 API 호출 스킵
    if (!urlUserId) fetchWeeklyReputations();
  }, [urlUserId, weekId]);

  // 크루 목록 가져오기 (모달 열릴 때 lazy load)
  const fetchCrewListIfNeeded = async () => {
    if (isDemoMode) return; // 더미 모드: API 스킵
    if (allCrewList.length > 0) return; // 이미 로드됨
    try {
      const excludeId = urlUserId || session?.user?.id || "";
      const res = await fetch(`/api/crews?excludeUserId=${excludeId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAllCrewList(json.data);
        }
      }
    } catch (error) {
      console.error("크루 목록 가져오기 오류:", error);
    }
  };

  // 연계 동료 데이터 가져오기
  const fetchWeeklyColleagues = async () => {
    const targetUserId = urlUserId || session?.user?.id;
    if (!targetUserId || !weekId) return;
    try {
      const res = await fetch(`/api/weekly-colleagues?userId=${targetUserId}&weekCardId=${weekId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // API 데이터를 selectedColleagues 형식으로 변환
          const colleagues = json.data.map((item: any) => ({
            id: item.colleague?.id || item.colleague_id,
            name: item.colleague?.name || "-",
            gender: item.colleague?.gender || "-",
            age: item.colleague?.age || "-",
            profileImg: item.colleague?.profileImg || "",
            university: item.colleague?.university || "-",
            major: item.colleague?.major || "-",
            team: item.colleague?.team || "-",
            part: item.colleague?.part || "-",
            nickname: item.colleague?.nickname || "-",
            role: item.colleague?.role || "",
            rank: item.rank,
            message: item.message || "",
            createdAt: item.created_at || "",
          }));
          setSelectedColleagues(colleagues);
        }
      }
    } catch (error) {
      console.error("연계 동료 데이터 가져오기 오류:", error);
    }
  };

  // 연계 동료 초기 로드 (urlUserId가 없는 경우만 - 있으면 Stage 1에서 이미 로드됨)
  useEffect(() => {
    if (isDemoMode) return; // 데모 모드에서는 API 호출 스킵
    if (!urlUserId) fetchWeeklyColleagues();
  }, [urlUserId, weekId, session?.user?.id]);

  // 모달 상태 관리
  const [workInfoModalOpen, setWorkInfoModalOpen] = useState(false);
  const [workAbilityModalOpen, setWorkAbilityModalOpen] = useState(false);
  const [workExpModalOpen, setWorkExpModalOpen] = useState(false);
  const [workCareerModalOpen, setWorkCareerModalOpen] = useState(false);

  // 탭 팝오버 상태
  const [showWeeklyGrowthBadge, setShowWeeklyGrowthBadge] = useState(false);

  // 탭 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    if (!showWeeklyGrowthBadge) return;
    const handleClickOutside = () => setShowWeeklyGrowthBadge(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showWeeklyGrowthBadge]);

  // 상단 섹션 모달 상태
  const [headerModalOpen, setHeaderModalOpen] = useState(false);
  const [headerModalType, setHeaderModalType] = useState<"본인" | "타크루" | null>(null);

  // 연계 동료 선택 상태 (1st, 2nd, 3rd 각각 별도 저장)
  const [selectedColleagues, setSelectedColleagues] = useState<SelectedColleague[]>([]);

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

  // 주차 평판 키워드 목록 및 저장 상태
  const [reputationKeywords, setReputationKeywords] = useState<
    {
      id: string;
      cluster_number: number;
      cluster_name: string;
      cluster_color: string;
      keyword: string;
    }[]
  >([]);
  const [reputationSaving, setReputationSaving] = useState(false);
  const [reputationSaveSuccess, setReputationSaveSuccess] = useState(false);
  const [reputationSaveError, setReputationSaveError] = useState<string | null>(null);

  // 주차 평판 데이터 (API에서 가져옴)
  const [weeklyReputations, setWeeklyReputations] = useState<any[]>([]);

  // 크루 목록 (API에서 가져옴)
  const [allCrewList, setAllCrewList] = useState<any[]>([]);

  // 연계 동료 저장 상태
  const [colleagueSaving, setColleagueSaving] = useState(false);
  const [colleagueSaveSuccess, setColleagueSaveSuccess] = useState(false);
  const [colleagueSaveError, setColleagueSaveError] = useState<string | null>(null);

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

  // View 모달 편집 모드 상태
  const [workInfoViewIsEditing, setWorkInfoViewIsEditing] = useState(false);
  const [workAbilityViewIsEditing, setWorkAbilityViewIsEditing] = useState(false);
  const [workExpViewIsEditing, setWorkExpViewIsEditing] = useState(false);
  const [workCareerViewIsEditing, setWorkCareerViewIsEditing] = useState(false);

  // 모달 열릴 때 배경 스크롤 잠금
  useEffect(() => {
    const anyOpen = workInfoModalOpen || workAbilityModalOpen || workExpModalOpen || workCareerModalOpen || headerModalOpen || reputationViewModalOpen || colleagueViewModalOpen || workInfoViewModalOpen || workAbilityViewModalOpen || workExpViewModalOpen || workCareerViewModalOpen;
    if (anyOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [workInfoModalOpen, workAbilityModalOpen, workExpModalOpen, workCareerModalOpen, headerModalOpen, reputationViewModalOpen, colleagueViewModalOpen, workInfoViewModalOpen, workAbilityViewModalOpen, workExpViewModalOpen, workCareerViewModalOpen]);

  // card-desc의 … → .. 교체 (line-clamp 렌더링 완료 후)
  useEffect(() => {
    const replaceDots = () => {
      const descs = document.querySelectorAll(".work-info-section .card-desc");
      descs.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.scrollHeight > htmlEl.clientHeight + 1) {
          const text = htmlEl.innerText;
          if (text.endsWith("…")) {
            htmlEl.innerText = text.slice(0, -1) + "..";
          } else if (text.endsWith("...")) {
            htmlEl.innerText = text.slice(0, -3) + "..";
          }
        }
      });
    };
    const timer = setTimeout(replaceDots, 100);
    return () => clearTimeout(timer);
  });

  // 동료 삭제 함수
  const removeColleague = (id: number) => {
    setSelectedColleagues((prev) => prev.filter((c) => c.id !== id));
  };

  // 동료 추가 함수 (순위 지정)
  const addColleague = (user: any, rank: number) => {
    if (selectedColleagues.length >= 3) return;
    if (selectedColleagues.find((c) => c.id === user.id)) return;
    // 해당 순위가 이미 사용중인지 확인
    if (selectedColleagues.find((c) => c.rank === rank)) return;

    const newColleague = { ...user, message: "", rank };
    const newList = [...selectedColleagues, newColleague];

    // rank 순서대로 정렬
    newList.sort((a, b) => a.rank - b.rank);

    setSelectedColleagues(newList);
  };

  // 메시지 업데이트 함수
  const updateColleagueMessage = (id: number, message: string) => {
    setSelectedColleagues((prev) => prev.map((c) => (c.id === id ? { ...c, message } : c)));
  };

  // 타크루 선택 함수 (주차 평판 편집용)
  const selectCrewForReputation = (crewId: number) => {
    const crew = reputationData.find((u) => u.id === crewId);
    if (crew && !crew.isEmpty) {
      setSelectedCrewForReputation(crewId);
      setReputationEditData({
        rating: crew.rating,
        content: crew.description,
        keyword: crew.tagText.replace("#", ""),
      });
    }
  };

  // 타크루 편집 뒤로가기
  const backToCrewList = () => {
    setSelectedCrewForReputation(null);
    setReputationEditData({ rating: 0, content: "", keyword: "" });
  };

  // 연계 동료 저장 함수
  const saveWeeklyColleagues = async () => {
    if (selectedColleagues.length === 0) {
      const el = document.querySelector(".selected-colleagues, .add-colleague-card");
      if (el) {
        (el as HTMLElement).style.border = "1px solid #ff4444";
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (isDemoMode) {
      console.log("Demo: 연계 동료 저장", selectedColleagues);
      alert("저장되었습니다.");
      setHeaderModalOpen(false);
      return;
    }
    if (!weekId) {
      alert("주차 정보를 찾을 수 없습니다.");
      return;
    }

    setColleagueSaving(true);
    setColleagueSaveError(null);
    setColleagueSaveSuccess(false);

    try {
      const colleagues = selectedColleagues.map((c) => ({
        colleagueId: c.id,
        rank: c.rank,
        message: c.message || "",
      }));

      const res = await fetch("/api/weekly-colleagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekCardId: weekId,
          colleagues,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "저장에 실패했습니다.");
        return;
      }

      // 연계 동료 데이터 새로고침
      fetchWeeklyColleagues();
      alert("저장되었습니다.");
      setHeaderModalOpen(false);
    } catch (error) {
      console.error("연계 동료 저장 오류:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setColleagueSaving(false);
    }
  };

  // 주차 평판 저장 함수
  const saveWeeklyReputation = async () => {
    if (isDemoMode) {
      // weeklyReputations에 새 평판 추가 (UI 즉시 반영)
      setWeeklyReputations((prev) => [
        ...prev,
        {
          id: `demo-${Date.now()}`,
          rating: reputationEditData.rating,
          content: reputationEditData.content.trim(),
          keyword: reputationEditData.keyword,
          reviewer: {
            display_name: session?.user?.name || "데모 유저",
            gender: "-",
            birth_date: null,
            profile_photo_url: session?.user?.image || "",
            university: "-",
            major_first: "-",
            teamName: "-",
            partName: "-",
            vision: "-",
            role: "",
          },
        },
      ]);
      alert("저장되었습니다.");
      setHeaderModalOpen(false);
      setReputationEditData({ rating: 0, content: "", keyword: "" });
      return;
    }
    if (!urlUserId || !weekId) {
      alert("대상 사용자 또는 주차 정보를 찾을 수 없습니다.");
      return;
    }

    if (reputationEditData.rating === 0) {
      const el = document.querySelector(".reputation-form .form-field:nth-child(1)");
      if (el) {
        (el as HTMLElement).style.border = "1px solid #ff4444";
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!reputationEditData.content.trim()) {
      const el = document.querySelector(".reputation-form .form-field:nth-child(2)");
      if (el) {
        (el as HTMLElement).style.border = "1px solid #ff4444";
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!reputationEditData.keyword) {
      const el = document.querySelector(".reputation-form .form-field:nth-child(3)");
      if (el) {
        (el as HTMLElement).style.border = "1px solid #ff4444";
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setReputationSaving(true);
    setReputationSaveError(null);
    setReputationSaveSuccess(false);

    try {
      const res = await fetch("/api/weekly-reputations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: urlUserId,
          weekCardId: weekId,
          rating: reputationEditData.rating,
          content: reputationEditData.content.trim(),
          keyword: reputationEditData.keyword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "저장에 실패했습니다.");
        return;
      }

      // 주차 평판 데이터 새로고침
      fetchWeeklyReputations();
      alert("저장되었습니다.");
      setHeaderModalOpen(false);
      setReputationEditData({ rating: 0, content: "", keyword: "" });
    } catch (error) {
      console.error("주차 평판 저장 오류:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setReputationSaving(false);
    }
  };

  // 서브 타이틀 글자수 관리
  const [subTitleText, setSubTitleText] = useState("");

  // 기본값 설정
  const restImage = "/images/0/cluster4/주차%20이미지/휴식(개인,공식).png";

  // 휴식 모드 체크 (휴식(개인), 휴식(공식)일 때 모든 카드 비활성화)
  const isRestMode = weekData?.growthStatus?.includes("휴식") || false;

  // 시즌명과 주차번호로 월/주차 계산하여 이미지 경로 생성
  const getWeekImagePath = (data: DBWeekData) => {
    // 시즌별 시작 월 매핑
    const seasonStartMonth: { [key: string]: number } = {
      겨울: 1, // 1월
      봄: 3, // 3월
      여름: 7, // 7월
      가을: 9, // 9월
    };

    const startMonth = seasonStartMonth[data.seasonName] || 1;
    const monthOffset = Math.floor((data.weekNumber - 1) / 4);
    const month = startMonth + monthOffset;
    const weekOfMonth = ((data.weekNumber - 1) % 4) + 1;

    // 공휴일이 있는 경우 파일명에 추가
    const holidaySuffix = data.holidayName ? ` ${data.holidayName}` : "";

    // 파일명 형식: "겨울 1주차 (1월 1주차).png" 또는 "겨울 6주차 (2월 2주차 설,구정).png"
    return `/images/0/cluster4/주차 이미지/${data.seasonName} ${data.weekNumber}주차 (${month}월 ${weekOfMonth}주차${holidaySuffix}).png`;
  };

  // 휴식 모드일 때는 휴식 전용 이미지 사용, 아닐 때는 시즌/주차에 맞는 이미지
  const currentImage = isRestMode ? restImage : weekData ? getWeekImagePath(weekData) : "/images/0/cluster4/주차 이미지/겨울 1주차 (1월 1주차).png";
  const currentTitle = weekData ? (weekData.isBreakSeason ? `${weekData.seasonYear} ${weekData.toSeasonName} 시즌, 전환 주차` : `${weekData.seasonYear} ${weekData.seasonName} 시즌, ${weekData.weekNumber}주차`) : "로딩 중...";

  // 날짜 포맷팅 함수 (2025 - 01 - 06 (월) 형식)
  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = dayNames[date.getDay()];
    return `${year} - ${month} - ${day} (${dayName})`;
  };

  // 주차 기간 문자열 생성
  const weekDateRange = weekData ? `${formatDateWithDay(weekData.startDate)} ~ ${formatDateWithDay(weekData.endDate)}` : "날짜 로딩 중...";

  // 성장 상태에 따른 뱃지 정보
  const getStatusBadgeInfo = (status: string | undefined) => {
    switch (status) {
      case "성공":
        return {
          className: "success",
          text: "성장(성공)",
          icon: "/images/0/cluster4/icon/icon - 성장(성공).png",
        };
      case "실패":
        return {
          className: "fail",
          text: "성장(실패)",
          icon: "/images/0/cluster4/icon/icon - 성장(실패).png",
        };
      case "휴식(개인)":
        return {
          className: "rest-personal",
          text: "휴식(개인)",
          icon: "/images/0/cluster4/icon/icon - 휴식(개인).png",
        };
      case "휴식(공식)":
        return {
          className: "rest-official",
          text: "휴식(공식)",
          icon: "/images/0/cluster4/icon/icon - 휴식(공식).png",
        };
      default:
        return {
          className: "success",
          text: "성장(성공)",
          icon: "/images/0/cluster4/icon/icon - 성장(성공).png",
        };
    }
  };

  const statusBadgeInfo = getStatusBadgeInfo(weekData?.growthStatus);

  // 태그 색상 배열
  const tagColors = ["tag--pink", "tag--red", "tag--yellow", "tag--purple", "tag--green", "tag--cyan", "tag--mint", "tag--dark"];

  // 주차 평판 데이터 (API 데이터 기반)
  // 주차 평판 더미 데이터 (비로그인 / 데이터 미입력 시 폴백)
  const dummyReputations = [
    {
      id: "dummy-rep-1",
      name: "오준",
      gender: "남",
      age: 22,
      profileImg: "/images/0/crew profile/남 1.webp",
      university: "한대",
      major: "경영",
      team: "기획",
      part: "전략",
      nickname: "짧음",
      role: "심화",
      rating: 0.5,
      ratingCount: "1 / 10",
      description: "짧은코멘트",
      fm: 1,
      tagColor: "tag--pink",
      tagText: "#힘",
      isEmpty: false,
    },
    {
      id: "dummy-rep-2",
      name: "김서연아",
      gender: "여",
      age: 25,
      profileImg: "/images/0/crew profile/여 1.jpg",
      university: "성균관대학교",
      major: "컴퓨터공학",
      team: "마케팅전략",
      part: "브랜드콘텐츠",
      nickname: "중간닉네임임",
      role: "운영진(앰배서더)",
      rating: 3,
      ratingCount: "6 / 10",
      description: "중간길이의코멘트입니다이번주",
      fm: 42,
      tagColor: "tag--red",
      tagText: "#추진력있는",
      isEmpty: false,
    },
    {
      id: "dummy-rep-3",
      name: "알렉산더워싱턴",
      gender: "남",
      age: 29,
      profileImg: "/images/0/crew profile/남 2.jpg",
      university: "한국예술종합",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트사업",
      part: "글로벌마케팅전략",
      nickname: "엔비디아구글테슬라쿵",
      role: "일반(정규)",
      rating: 5,
      ratingCount: "10 / 10",
      description: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차일이",
      fm: 999,
      tagColor: "tag--yellow",
      tagText: "#끈기와인내의결과물",
      isEmpty: false,
    },
  ];

  const reputationData = useMemo(() => {
    // 태그 색상 배열
    const colors = ["tag--pink", "tag--red", "tag--yellow", "tag--purple", "tag--green", "tag--cyan", "tag--mint"];

    // API에서 가져온 데이터를 UI 형식으로 변환
    const apiData =
      weeklyReputations.length > 0
        ? weeklyReputations.map((rep, index) => {
            const reviewer = rep.reviewer;
            // 나이 계산
            let age: string | number = "-";
            if (reviewer?.birth_date) {
              const birthYear = new Date(reviewer.birth_date).getFullYear();
              const currentYear = new Date().getFullYear();
              age = currentYear - birthYear;
            }

            return {
              id: rep.id,
              name: reviewer?.display_name || "-",
              gender: reviewer?.gender || "-",
              age: age,
              profileImg: reviewer?.profile_photo_url || "",
              university: reviewer?.university || "-",
              major: reviewer?.major_first || "-",
              team: reviewer?.teamName || "-",
              part: reviewer?.partName || "-",
              nickname: reviewer?.vision || "-",
              role: reviewer?.role ? roleLabels[reviewer.role] || reviewer.role : "일반",
              rating: rep.rating / 2, // 10점 만점 → 5점 만점 변환 (별 표시용)
              ratingCount: `${rep.rating} / 10`,
              description: rep.content || "-",
              fm: 1, // FM은 항상 1
              tagColor: colors[index % colors.length],
              tagText: `#${rep.keyword || "-"}`,
              isEmpty: false,
            };
          })
        : dummyReputations; // 데이터 없으면 더미 데이터 폴백

    // 최대 4개까지, 빈 슬롯 채우기
    const result = [...apiData];
    while (result.length < 4) {
      result.push({
        id: `empty-${result.length}`,
        name: "-",
        gender: "",
        age: "",
        profileImg: "",
        university: "",
        major: "",
        team: "",
        part: "",
        nickname: "",
        role: "",
        rating: 0,
        ratingCount: "- / 10",
        description: "-",
        fm: 0,
        tagColor: "tag--dark",
        tagText: "-",
        isEmpty: true,
      });
    }

    return result.slice(0, 4); // 최대 4개만 반환
  }, [weeklyReputations]);

  // 검색 필터링된 크루 목록 (이름과 닉네임으로만 검색)
  const filteredCrewData = allCrewList
    .filter((user) => {
      if (!crewSearchQuery) return true;
      const query = crewSearchQuery.toLowerCase();
      return (user.name?.toLowerCase() || "").includes(query) || (user.nickname?.toLowerCase() || "").includes(query);
    })
    .filter((user) => !selectedColleagues.find((c) => c.id === user.id));

  // 연계 동료 더미 데이터 (비로그인 / 데이터 미입력 시 폴백)
  const dummyColleagues = [
    { id: "dummy-col-1", name: "윤아", gender: "여", age: "21", profileImg: "/images/0/crew profile/여 3.jpg", university: "한대", major: "경영", team: "기획", part: "전략", nickname: "윤아", role: "심화", date: "2026 - 03 - 01 (토)", message: "좋은 동료", isEmpty: false },
    {
      id: "dummy-col-2",
      name: "박진우",
      gender: "남",
      age: "26",
      profileImg: "/images/0/crew profile/남 2.jpg",
      university: "성균관대학교",
      major: "컴퓨터공학",
      team: "마케팅전략",
      part: "브랜드콘텐츠",
      nickname: "마케팅장인",
      role: "운영진(앰배서더)",
      date: "2026 - 03 - 02 (일)",
      message: "기술적인 부분에서 큰 도움을 받았고 앞으로도 함께 성장하고 싶습니다",
      isEmpty: false,
    },
    {
      id: "dummy-col-3",
      name: "크리스티나앤더슨",
      gender: "여",
      age: "28",
      profileImg: "/images/0/crew profile/여 4.webp",
      university: "한국예술종합",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트사업",
      part: "글로벌마케팅전략",
      nickname: "글로벌마케터의꿈나무",
      role: "일반(정규)",
      date: "2026 - 03 - 03 (월)",
      message: "다양한 관점에서 프로젝트를 바라보는 시각이 인상적이었고 특히 글로벌 마케팅 전략 수립 과정에서 보여준 리더십과 커뮤니케이션 능력이 뛰어났습니다",
      isEmpty: false,
    },
  ];

  // 연계 동료 데이터 (API 데이터 기반)
  const colleagueData = useMemo(() => {
    // 휴식 모드일 때 빈 카드 3개 반환
    if (isRestMode) {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `empty-colleague-${i}` as any,
        name: "-",
        gender: "-",
        age: "-",
        profileImg: "",
        university: "-",
        major: "-",
        team: "-",
        part: "-",
        nickname: "-",
        role: "",
        date: "-",
        message: "",
        isEmpty: true,
      }));
    }

    // API에서 가져온 selectedColleagues를 UI 형식으로 변환
    const apiData =
      selectedColleagues.length > 0
        ? selectedColleagues.map((c) => ({
            id: c.id,
            name: c.name || "-",
            gender: c.gender || "-",
            age: c.age || "-",
            profileImg: c.profileImg || "",
            university: c.university || "-",
            major: c.major || "-",
            team: c.team || "-",
            part: c.part || "-",
            nickname: c.nickname || "-",
            role: c.role || "일반",
            date: c.createdAt ? formatDate(c.createdAt) : "-",
            message: c.message || "",
            isEmpty: false,
          }))
        : dummyColleagues; // 데이터 없으면 더미 데이터 폴백

    // 최대 3개까지, 빈 슬롯 채우기
    const result = [...apiData];
    while (result.length < 3) {
      result.push({
        id: `empty-colleague-${result.length}` as any,
        name: "-",
        gender: "-",
        age: "-",
        profileImg: "",
        university: "-",
        major: "-",
        team: "-",
        part: "-",
        nickname: "-",
        role: "",
        date: "-",
        message: "",
        isEmpty: true,
      });
    }

    return result.slice(0, 3); // 최대 3개만 반환
  }, [selectedColleagues, isRestMode]);

  // 실무 정보 activity_type_id → UI 매핑
  const activityTypeConfig: { [key: string]: { category: string; tagColor: string; icon: string; isFruit: boolean } } = {
    wisdom: { category: "위즈덤", tagColor: "tag--red", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 위즈덤.png", isFruit: true },
    essay: { category: "에세이", tagColor: "tag--yellow", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 에세이.png", isFruit: true },
    infodesk: { category: "인포데스크", tagColor: "tag--purple", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 인포데스크.png", isFruit: true },
    calendar: { category: "캘린더", tagColor: "tag--dark", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 캘린더.png", isFruit: true },
    forum: { category: "포럼", tagColor: "tag--green", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 포럼.png", isFruit: true },
    session: { category: "세션", tagColor: "tag--cyan", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 세션.png", isFruit: true },
    practical_lecture: { category: "실무특강", tagColor: "tag--mint", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 실무특강.png", isFruit: true },
    community: { category: "커뮤니티", tagColor: "tag--dark", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 커뮤니티.png", isFruit: true },
    etc_a: { category: "기타a", tagColor: "tag--mint", icon: "/images/0/cluster4/icon/실무 정보/실무 정보 - 기타a.png", isFruit: true },
  };

  // 실무 정보에 해당하는 activity types
  const workInfoActivityTypes = ["wisdom", "essay", "infodesk", "calendar", "forum", "session", "practical_lecture", "community", "etc_a"];
  // 실무 역량 activity types - DB에서 가져온 practical_competency 클러스터
  const workAbilityActivityTypes = competencyTypeIds;
  // 실무 경험 activity types - DB에서 가져온 practical_experience 클러스터
  const workExpActivityTypes = experienceTypeIds;
  // 실무 경력 activity types - DB에서 가져온 practical_career 클러스터
  const workCareerActivityTypes = careerTypeIds.length > 0 ? careerTypeIds : ["practical_project"];
  // 전체 activity types (2차 정보 저장용)
  const allActivityTypes = [...workInfoActivityTypes, ...workAbilityActivityTypes, ...workExpActivityTypes, ...workCareerActivityTypes];

  // 실무 역량: 유저가 완료한 활동 찾기 (is_completed = true인 것 중 첫 번째)
  const findFirstCompletedAbilityActivity = () => {
    for (const actType of workAbilityActivityTypes) {
      const activity = weeklyActivities.find((a) => a.activity_type_id === actType && a.is_active);
      const record = weekActivityRecords.find((ar) => ar.activity_type_id === actType);
      if (activity && record?.is_completed) return activity;
    }
    return null;
  };

  // 실무 역량: 첫 번째 개설된 활동 찾기 헬퍼
  const findFirstAbilityActivity = () => {
    for (const actType of workAbilityActivityTypes) {
      const activity = weeklyActivities.find((a) => a.activity_type_id === actType && a.is_active);
      if (activity) return activity;
    }
    return null;
  };

  // 실무 역량: 유저가 선택한(record가 있는) 활동 찾기
  const findFirstSelectedAbilityActivity = () => {
    for (const actType of workAbilityActivityTypes) {
      const activity = weeklyActivities.find((a) => a.activity_type_id === actType && a.is_active);
      const record = weekActivityRecords.find((ar) => ar.activity_type_id === actType);
      if (activity && record) return activity; // record가 있으면 유저가 선택한 것
    }
    return null;
  };

  // 실무 역량: 첫 번째 존재하는 활동 타입 ID 가져오기
  const getFirstAbilityActivityType = (): string => {
    const activity = findFirstAbilityActivity();
    return activity?.activity_type_id || workAbilityActivityTypes[0] || "";
  };

  // activity_type 정보 가져오기 헬퍼
  const getActivityTypeInfo = (activityTypeId: string): ActivityTypeInfo | undefined => {
    return activityTypesMap.get(activityTypeId);
  };

  // 강화 상태 판단 함수 (2차 정보 기입 OR 48시간 기준)
  // - 해당 없음: weekly_activities.is_active = false (활동 미개설) 또는 온보딩 주차(무적 주차)
  // - 강화 실패: 활동 개설됨 + 카페 댓글 집계에서 이행하지 않음 (is_completed = false)
  // - 강화 대기: 활동 개설됨 + 이행함 (is_completed = true) + 48시간 미경과 + 2차 정보 미기입
  // - 강화 성공: 활동 개설됨 + 이행함 (is_completed = true) + (48시간 경과 OR 2차 정보 기입)
  type EnhancementStatus = "success" | "waiting" | "failed" | "not_applicable";
  const getEnhancementStatus = (activityType: string): EnhancementStatus => {
    // 해당 활동 정보 가져오기
    const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);

    // activity_records에서 해당 activity_type의 이행 여부 확인
    const record = weekActivityRecords.find((ar) => ar.activity_type_id === activityType);

    // 1. 해당 없음: 활동이 개설되지 않음 AND 크루가 참여하지도 않음
    if (!activity?.is_active && (!record || !record.is_completed)) return "not_applicable";

    if (!record || !record.is_completed) {
      // 레코드 없거나 is_completed = false → 강화 실패
      return "failed";
    }

    // 3. is_completed = true인 경우, 2차 정보 기입 여부 확인
    const detail = weekActivityDetails.find((d) => d.activity_type_id === activityType);
    const hasSecondaryInfo = detail && ((detail.sub_title && detail.sub_title.trim() !== "") || (detail.output_links && detail.output_links.some((link: { url?: string }) => link?.url && link.url.trim() !== "")));

    // 2차 정보가 기입되어 있으면 바로 강화 성공
    if (hasSecondaryInfo) {
      return "success";
    }

    // 4. 2차 정보 미기입 시, 48시간 경과 여부 확인
    const openedAt = activity?.opened_at;
    if (!openedAt) {
      // 개설 시각이 없으면 대기 상태로 처리
      console.log(`[getEnhancementStatus] ${activityType}: no opened_at -> waiting`);
      return "waiting";
    }

    const openedTime = new Date(openedAt).getTime();
    const now = Date.now();
    const elapsed = now - openedTime;
    const deadline = 48 * 60 * 60 * 1000; // 48시간 (밀리초)
    const hoursElapsed = Math.floor(elapsed / (60 * 60 * 1000));

    console.log(`[getEnhancementStatus] ${activityType}: openedAt=${openedAt}, elapsed=${hoursElapsed}h, deadline=48h, result=${elapsed >= deadline ? "success" : "waiting"}`);

    if (elapsed >= deadline) {
      // 48시간 경과 → 강화 성공 (2차 정보 없이도 자동 성공)
      return "success";
    } else {
      // 48시간 미경과 + 2차 정보 미기입 → 강화 대기
      return "waiting";
    }
  };

  // 강화 상태별 아이콘
  const enhancementStatusIcons: { [key in EnhancementStatus]: string } = {
    success: "/images/0/cluster4/icon/5 강화 성공.png",
    waiting: "/images/0/cluster4/icon/6 강화 대기.png",
    failed: "/images/0/cluster4/icon/7 강화 실패.png",
    not_applicable: "/images/0/cluster4/icon/8 해당 없음.png",
  };

  // 특정 activity_type의 2차 정보 가져오기
  const getActivityDetail = (activityType: string) => {
    return weekActivityDetails.find((ad) => ad.activity_type_id === activityType);
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
    const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);
    if (!activity?.is_active) return false;
    // 48시간 이내인지 확인
    return isWithin48Hours(activity.opened_at);
  };

  // 활동이 개설되었지만 48시간이 지났는지 확인 (마감 표시용)
  const isActivityExpired = (activityType: string): boolean => {
    const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);
    if (!activity?.is_active) return false;
    // 개설은 되었지만 48시간이 지남
    return !isWithin48Hours(activity.opened_at);
  };

  // 실무 역량: 아무 activity type이나 개설되었는지 확인
  const isAnyAbilityActivityActive = (): boolean => {
    return workAbilityActivityTypes.some((actType) => isActivityActive(actType));
  };

  // 실무 역량: 모든 activity type이 만료되었는지 확인
  const isAnyAbilityActivityExpired = (): boolean => {
    return workAbilityActivityTypes.some((actType) => isActivityExpired(actType));
  };

  // 실무 역량: 첫 번째 활성화된 activity type ID 가져오기 (모달/저장용)
  const getActiveAbilityActivityType = (): string => {
    const activeType = workAbilityActivityTypes.find((actType) => isActivityActive(actType));
    if (activeType) return activeType;
    // 활성화된 것이 없으면 개설된 것(만료 포함) 찾기
    const openedType = workAbilityActivityTypes.find((actType) => {
      const activity = weeklyActivities.find((a) => a.activity_type_id === actType);
      return activity?.is_active;
    });
    return openedType || workAbilityActivityTypes[0];
  };

  // 남은 시간 계산 (표시용)
  const getRemainingTime = (activityType: string): { hours: number; minutes: number } | null => {
    const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);
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
    return activityTypes.some((type) => isActivityActive(type));
  };

  // 빈 output links 배열 생성 헬퍼
  const createEmptyOutputLinks = (): OutputLink[] => {
    return [0, 1, 2, 3, 4].map(() => ({ desc: "", url: "" }));
  };

  // URL에 프로토콜이 없으면 https:// 추가
  const ensureProtocol = (url: string): string => {
    if (!url) return url;
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // 운영진이 입력한 output links 개수 가져오기
  const getAdminOutputLinksCount = (activityType: string): number => {
    // 실무 경력: career_projects의 output_links에서 가져옴
    const careerIndex = (careerTypeIds.length > 0 ? careerTypeIds : ["practical_project"]).indexOf(activityType);
    if (careerIndex >= 0 && careerRecords[careerIndex]) {
      return careerRecords[careerIndex].output_links?.filter((l: { url?: string }) => l.url?.trim())?.length || 0;
    }
    const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);
    return activity?.output_links?.filter((l) => l.url?.trim())?.length || 0;
  };

  // 운영진이 입력한 output links 가져오기
  const getAdminOutputLinks = (activityType: string): OutputLink[] => {
    // 실무 경력: career_projects의 output_links에서 가져옴
    const careerIndex = (careerTypeIds.length > 0 ? careerTypeIds : ["practical_project"]).indexOf(activityType);
    if (careerIndex >= 0 && careerRecords[careerIndex]) {
      return (careerRecords[careerIndex].output_links || []) as OutputLink[];
    }
    const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);
    return activity?.output_links || [];
  };

  // 편집 모달 열 때 초기화
  const initializeEditingDetails = () => {
    const newEditingDetails: { [key: string]: { subTitle: string; outputLinks: OutputLink[] } } = {};

    // 모든 activity types에 대해 초기화 (실무 정보 + 실무 역량 + 실무 경험 + 실무 경력)
    allActivityTypes.forEach((activityType) => {
      const detail = getActivityDetail(activityType);
      const adminLinks = getAdminOutputLinks(activityType);
      const userLinks = detail?.output_links || [];

      // 5개 슬롯 생성: 운영진 링크 → 사용자 링크 → 빈 슬롯
      const paddedLinks: OutputLink[] = [];
      const adminCount = adminLinks.filter((l) => l.url?.trim()).length;

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
            paddedLinks.push({ desc: "", url: "" });
          }
        }
      }

      newEditingDetails[activityType] = {
        subTitle: detail?.sub_title || "",
        outputLinks: paddedLinks,
      };
    });

    setEditingDetails(newEditingDetails);
  };

  // 2차 정보 저장 (운영진 링크 제외, 사용자 링크만 저장)
  const saveActivityDetail = async (activityType: string) => {
    if (isDemoMode) {
      console.log("Demo: 활동 상세 저장", activityType, editingDetails[activityType]);
      return;
    }
    if (!currentUserId || !weekId) return;

    setIsSaving(true);
    try {
      const detail = editingDetails[activityType];
      if (!detail) return;

      // 운영진 링크 개수 확인
      const adminCount = getAdminOutputLinksCount(activityType);

      // 운영진 링크 이후의 사용자 링크만 필터링 (빈 링크 제외)
      const userLinks = detail.outputLinks.slice(adminCount).filter((link) => link.url.trim() !== "");

      const response = await fetch("/api/activity-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        console.error("Failed to save activity detail:", error);
        alert("저장에 실패했습니다.");
        return;
      }
    } catch (error) {
      console.error("Error saving activity detail:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 통계 재계산 함수 (저장 후 즉시 업데이트용 - 강화 성공 기준: is_completed + (48시간 경과 OR 2차 정보 기입))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const recalculateStats = (updatedDetails: ActivityDetail[]) => {
    const activeActivities = weeklyActivities.filter((a) => a.is_active);

    // 강화 성공 여부 판단 헬퍼 함수
    const isEnhancementSuccessLocal = (activityTypeId: string): boolean => {
      // 1. 활동 완료 여부 확인
      if (!weekApprovedTypes.has(activityTypeId)) return false;

      // 2. 2차 정보 기입 여부 확인 (저장 후 업데이트된 데이터 사용)
      const detail = updatedDetails.find((d) => d.activity_type_id === activityTypeId);
      const hasSecondaryInfo = detail && (detail.sub_title || (detail.output_links && detail.output_links.length > 0));
      if (hasSecondaryInfo) return true;

      // 3. 48시간 경과 여부 확인
      const activity = weeklyActivities.find((a) => a.activity_type_id === activityTypeId);
      if (!activity?.opened_at) return false;

      const openedTime = new Date(activity.opened_at).getTime();
      const now = Date.now();
      const elapsed = now - openedTime;
      const deadline = 48 * 60 * 60 * 1000; // 48시간 (밀리초)

      return elapsed >= deadline;
    };

    const calcStats = (types: string[]) => {
      const total = activeActivities.filter((a) => types.includes(a.activity_type_id)).length;
      const success = types.filter((activityTypeId) => isEnhancementSuccessLocal(activityTypeId)).length;

      return { total, success };
    };

    const infoTypes = ["calendar", "essay", "forum", "infodesk", "session", "wisdom", "practical_lecture", "community", "etc_a"];
    // 온보딩 주차면 강화율 계산에서 제외 (이력은 보이되 수치에 미반영)
    if (isOnboardingWeek) {
      setInfoStats({ total: 0, success: 0 });
      setCompetencyStats({ total: 0, success: 0 });
      setExperienceStats({ total: 0, success: 0 });
      setCareerStats({ total: 0, success: 0 });
    } else {
      setInfoStats(calcStats(infoTypes));
      const competencyCalc = calcStats(competencyTypeIds);
      setCompetencyStats({ total: 1, success: competencyCalc.success > 0 ? 1 : 0 });
      setExperienceStats(calcStats(experienceTypeIds));
      setCareerStats(calcStats(careerTypeIds));
    }
  };

  // 저장 후 weekActivityDetails 상태 즉시 업데이트 (공통 함수)
  const updateWeekActivityDetailsAfterSave = (activityTypes: string[]) => {
    setWeekActivityDetails((prev) => {
      const updatedDetails = [...prev];
      activityTypes.forEach((activityType) => {
        const detail = editingDetails[activityType];
        // 운영진 링크 제외, 사용자 링크만 로컬 상태에 저장 (DB 저장과 동일하게)
        const adminCount = getAdminOutputLinksCount(activityType);
        const validLinks = detail?.outputLinks.slice(adminCount).filter((link) => link.url.trim() !== "") || [];
        const newDetail = {
          week_id: weekId,
          activity_type_id: activityType,
          sub_title: detail?.subTitle || null,
          output_links: validLinks.length > 0 ? validLinks : null,
        };
        const existingIndex = updatedDetails.findIndex((d) => d.activity_type_id === activityType);
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

      alert("저장되었습니다.");
      setWorkInfoModalOpen(false);
    } catch (error) {
      console.error("Error saving all activity details:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 실무 정보 카드 데이터 (DB 데이터 기반 + 빈 카드 2개)
  const workInfoCards = [
    ...workInfoActivityTypes.map((activityType, index) => {
      const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);
      const detail = weekActivityDetails.find((d) => d.activity_type_id === activityType);
      const config = activityTypeConfig[activityType];
      const enhancementStatus = getEnhancementStatus(activityType);

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
            mergedOutputLinks.push({ desc: "", url: "" });
          }
        }
      }

      return {
        id: index + 1,
        activityType,
        title: activity?.title || "-", // 운영진이 입력한 Main Title (없으면 '-')
        subTitle: detail?.sub_title || "",
        verified: true,
        category: config?.category || activityType,
        tagColor: config?.tagColor || "",
        status: enhancementStatus,
        statusIcon: enhancementStatusIcons[enhancementStatus],
        icon: config?.icon || "",
        isFruit: config?.isFruit || false,
        isFailed: enhancementStatus === "failed",
        isEmpty: false,
        outputLinks: mergedOutputLinks,
      };
    }),
  ];

  // 휴식 모드일 때 실무 정보 카드 전부 '해당 없음' + 보이드
  const effectiveWorkInfoCards = isRestMode
    ? [
        ...workInfoActivityTypes.map((activityType, index) => {
          const config = activityTypeConfig[activityType];
          return {
            id: index + 1,
            activityType,
            title: "-",
            subTitle: "",
            verified: false,
            category: config?.category || activityType,
            tagColor: config?.tagColor || "",
            status: "not_applicable" as EnhancementStatus,
            statusIcon: enhancementStatusIcons["not_applicable"],
            icon: config?.icon || "",
            isFruit: config?.isFruit || false,
            isFailed: false,
            isEmpty: false,
            outputLinks: [],
          };
        }),
      ]
    : workInfoCards;

  // 실무 경험 카드 데이터 (동적 생성 + 빈 카드)
  const workExpCards = [
    ...workExpActivityTypes.map((activityTypeId, index) => {
      const activityType = activityTypesMap.get(activityTypeId);
      const activity = weeklyActivities.find((a) => a.activity_type_id === activityTypeId);
      const detail = weekActivityDetails.find((d) => d.activity_type_id === activityTypeId);
      const enhStatus = getEnhancementStatus(activityTypeId);
      const hasActivity = !!activity;

      // 별점 계산 (points 테이블에서 가져온 평점 사용, 0~10 정수)
      const ratingScore = activityRatings.get(activityTypeId) || 0;
      const rating = ratingScore / 2; // 별 표시용 (0~5)

      // Fix C-1: 4번째 카드(index 3)는 보이드/빈 카드로 대체
      if (index === 3) {
        return {
          id: index + 1,
          activityTypeId: "",
          code: "-",
          badge: "-",
          title: "-",
          verified: false,
          rating: 0,
          ratingCount: "- / 10",
          hasWeb: false,
          icon: "",
          isEmpty: true,
          enhancementStatus: "not_applicable" as EnhancementStatus,
          hasActivity: false,
        };
      }

      return {
        id: index + 1,
        activityTypeId,
        code: activityType?.line_code || "-",
        badge: activityType?.name || "-",
        title: activity?.title || "-",
        verified: enhStatus === "success",
        rating: rating,
        ratingCount: hasActivity ? `${ratingScore} / 10` : "- / 10",
        hasWeb: (detail?.output_links?.length || 0) > 0,
        icon: getExperienceIconPath(activityTypeId),
        isEmpty: false,
        enhancementStatus: enhStatus,
        hasActivity,
      };
    }),
  ];

  // 휴식 모드일 때 실무 경험 카드 — 해당 없음 + 보이드
  const effectiveWorkExpCards = isRestMode
    ? workExpCards.map((card) => ({
        ...card,
        title: "-",
        hasActivity: false,
        enhancementStatus: "not_applicable" as EnhancementStatus,
        isFailed: false,
      }))
    : workExpCards;

  // 실무 경력 카드 데이터 (DB에서 가져온 프로젝트 기반 데이터 변환)
  const workCareerCards =
    careerRecords.length > 0
      ? careerRecords.map((record, index) => {
          // 강화 상태 계산: pending일 때 2차 정보 작성 또는 마감 기한 경과 시 강화 성공으로 표시
          let computedStatus = record.enhancement_status;
          if (record.enhancement_status === "pending") {
            const activityType = workCareerActivityTypes[index];
            const detail = activityType ? weekActivityDetails.find((d) => d.activity_type_id === activityType) : null;
            const hasSecondaryInfo = detail && ((detail.sub_title && detail.sub_title.trim() !== "") || (detail.output_links && detail.output_links.some((link: { url?: string }) => link?.url && link.url.trim() !== "")));
            const deadlinePassed = record.secondary_info_deadline ? new Date(record.secondary_info_deadline) <= new Date() : false;
            if (hasSecondaryInfo || deadlinePassed) {
              computedStatus = "enhanced";
            }
          }

          // 강화 상태에 따른 배지 결정
          const getStatusBadge = (enhStatus: string) => {
            if (enhStatus === "enhanced") return "/images/0/cluster4/icon/5 강화 성공.png";
            if (enhStatus === "failed") return "/images/0/cluster4/icon/7 강화 실패.png";
            if (enhStatus === "pending") return "/images/0/cluster4/icon/6 강화 대기.png";
            return "/images/0/cluster4/icon/8 해당 없음.png";
          };

          return {
            id: index + 1,
            code: record.line_code || record.career_code || "-",
            badge: record.company_name,
            title: record.project_name || record.job_position,
            verified: computedStatus === "enhanced",
            date: weekData?.startDate ? formatDate(weekData.startDate) : formatDate(record.created_at),
            likes: "0,99",
            hasWeb: (record.output_links?.length || 0) > 0,
            icon: record.company_logo_url || "/images/0/cluster4/icon/default-company.png",
            supervisorImg: record.supervisor_profile_img || "/images/0/crew profile/default.jpg",
            supervisorName: record.supervisor_name || "-",
            supervisorDept: record.supervisor_department || "",
            supervisorCompany: record.supervisor_company || "",
            supervisorPosition: record.supervisor_position || "",
            statusBadge: getStatusBadge(computedStatus),
            grade: record.grade || "",
            isNotApplicable: computedStatus === "not_applicable",
            isEmpty: false,
            isFailed: computedStatus === "failed",
            // 추가 정보 (상세 보기용)
            projectDescription: (() => {
              const activityType = workCareerActivityTypes[index];
              const detail = activityType ? weekActivityDetails.find((d) => d.activity_type_id === activityType) : null;
              return detail?.sub_title && detail.sub_title.trim() !== "" ? detail.sub_title : record.project_description || null;
            })(),
            gradePoints: record.grade_points,
            recordId: record.record_id,
            projectId: record.project_id,
            lineCode: record.line_code,
            lineName: record.line_name,
            outputLinks: record.output_links,
            secondaryInfoDeadline: record.secondary_info_deadline || null,
          };
        })
      : [];

  // 참여한 경력이 없으면 빈 카드 1개 표시
  // 빈 카드 템플릿
  const emptyCareerCard = (id: number) => ({
    id,
    code: "",
    badge: "",
    title: "",
    verified: false,
    date: "0000-00-00 (일)",
    likes: "0,99",
    hasWeb: false,
    isEmpty: true,
    icon: "",
    supervisorImg: "",
    supervisorName: "",
    supervisorDept: "",
    supervisorCompany: "",
    supervisorPosition: "",
    statusBadge: "",
    grade: "",
    isNotApplicable: false,
    isFailed: false,
    projectDescription: null as string | null,
    gradePoints: null as number | null,
    recordId: null as string | null,
    projectId: null as string | null,
    lineCode: null as string | null,
    lineName: null as string | null,
    outputLinks: null as { desc: string; url: string }[] | null,
    secondaryInfoDeadline: null as string | null,
  });

  // 휴식 모드일 때 실무 경력 카드 전부 '해당 없음'으로 강제
  const effectiveWorkCareerCards = isRestMode
    ? workCareerCards.map((card) => ({
        ...card,
        statusBadge: "/images/0/cluster4/icon/8 해당 없음.png",
        isNotApplicable: true,
        isFailed: false,
        verified: false,
      }))
    : workCareerCards;

  // 참여한 카드(a)를 앞으로, 해당 없음 카드(b)를 뒤로 정렬
  const sortedWorkCareerCards = [...effectiveWorkCareerCards].sort((a, b) => {
    if (a.isNotApplicable !== b.isNotApplicable) {
      return a.isNotApplicable ? 1 : -1;
    }
    const nameA = (a.badge || "").trim();
    const nameB = (b.badge || "").trim();
    return nameA.localeCompare(nameB, "ko", { sensitivity: "base" });
  });

  // 데이터 수만큼만 표시, 0개면 빈 카드 1개만
  const displayWorkCareerCards = sortedWorkCareerCards.length > 0 ? sortedWorkCareerCards : [emptyCareerCard(1)];

  // 페이지네이션: 6개씩 한 페이지
  const CAREER_CARDS_PER_PAGE = 6;
  const totalCareerPages = Math.ceil(displayWorkCareerCards.length / CAREER_CARDS_PER_PAGE);
  const currentCareerCards = displayWorkCareerCards.slice(careerPage * CAREER_CARDS_PER_PAGE, (careerPage + 1) * CAREER_CARDS_PER_PAGE);

  // 별점 렌더링 함수 (반개 지원)
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // 채워진 별
        stars.push(<img key={i} src="/images/0/cluster4/icon/icon - star.png" alt="star" className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        // 반개 별
        stars.push(
          <span key={i} className="star half">
            <img src="/images/0/cluster4/icon/icon - star.png" alt="star" className="star-half-filled" />
            <img src="/images/0/cluster4/icon/icon - empty star.png" alt="star" className="star-half-empty" />
          </span>,
        );
      } else {
        // 빈 별
        stars.push(<img key={i} src="/images/0/cluster4/icon/icon - empty star.png" alt="star" className="star empty" />);
      }
    }
    return stars;
  };

  return (
    <div className="cluster4-card-content weekly-card-detail" style={{ marginRight: "27px" }}>
      {/* 탭 영역 */}
      <div className="top-tabs-wrapper">
        <div className="top-tabs">
          <div
            className={`tab active${showWeeklyGrowthBadge ? " badge-visible" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowWeeklyGrowthBadge(!showWeeklyGrowthBadge);
            }}
            style={{ cursor: "pointer", width: "44px", height: "44px" }}
          >
            <img src="/images/0/cluster4/icon/icon%20-%20%EC%A0%84%EA%B5%AC.png" alt="전구" className="tab-icon" />
            <Link href={`/cluster-4${urlUserId ? `?userId=${urlUserId}` : ""}`} className="tab-badge" onClick={(e) => e.stopPropagation()}>
              <span className="badge-text">Weekly Growth</span>
              <img src="/images/0/cluster4/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </Link>
          </div>
          <Link href={`/cluster-4-1${urlUserId ? `?userId=${urlUserId}` : ""}`} className="tab" style={{ width: "44px", height: "44px" }}>
            <img src="/images/0/cluster4/icon/icon%20-%20book.png" alt="book" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Season Growth</span>
              <img src="/images/0/cluster4/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
        </div>
        {/* 디버그 정보 (개발 중 임시) */}
        <div style={{ fontSize: "10px", color: "#666", marginBottom: "5px" }}>
          [DEBUG] weekId: {weekId} | prevWeekId: {prevWeekId || "null"} | nextWeekId: {nextWeekId || "null"}
        </div>
        <div className="nav-buttons">
          {prevWeekId ? (
            <Link href={`/cluster-4-card/${prevWeekId}${urlUserId ? `?userId=${urlUserId}` : ""}`} className="nav-btn-prev">
              <span>이전 주</span>
              <img src="/images/0/cluster4/icon/icon%20-%20arrow%20left.png" alt="left" className="arrow-icon" />
            </Link>
          ) : (
            <button className="nav-btn-prev disabled" disabled>
              <span>이전 주</span>
              <img src="/images/0/cluster4/icon/icon%20-%20arrow%20left.png" alt="left" className="arrow-icon" />
            </button>
          )}
          {nextWeekId ? (
            <Link href={`/cluster-4-card/${nextWeekId}${urlUserId ? `?userId=${urlUserId}` : ""}`} className="nav-btn-next">
              <span>다음 주</span>
              <img src="/images/0/cluster4/icon/icon%20-%20arrow%20right.png" alt="right" className="arrow-icon" />
            </Link>
          ) : (
            <button className="nav-btn-next disabled" disabled>
              <span>다음 주</span>
              <img src="/images/0/cluster4/icon/icon%20-%20arrow%20right.png" alt="right" className="arrow-icon" />
            </button>
          )}
          <Link href={`/cluster-4${urlUserId ? `?userId=${urlUserId}` : ""}#weekly-filter-bar`} className="nav-btn-filled">
            <img src="/images/0/cluster4/icon/icon%20-%201.png" alt="list" className="list-icon" />
            <span>전체 목록으로 돌아가기</span>
          </Link>
        </div>
      </div>

      {/* ========== 섹션 1: 주차 이미지 + 헤더 + 평판 + 동료 ========== */}
      <div className="section1-layout">
        {/* 주차 평판 남기기 버튼 */}
        {
          <div className="floating-icons" style={{ display: "flex" }}>
            <div
              className="edit-icon"
              onClick={() => {
                if (!isDemoMode && isOwner) {
                  alert("주차 평판은 타 크루만이 작성할 수 있습니다.");
                  return;
                }
                handleEditClick(() => {
                  setHeaderModalType("타크루");
                  setHeaderModalOpen(true);
                  fetchCrewListIfNeeded();
                  fetchKeywordsIfNeeded();
                });
              }}
              style={{ cursor: "pointer" }}
              title="주차 평판 남기기"
            >
              <i className="ti ti-pencil" style={{ fontSize: "11px", color: "#FFFFFF" }}></i>
            </div>
          </div>
        }
        {/* 왼쪽: 큰 주차 이미지 */}
        <div className="section1-left">
          <div className="main-image-container">
            <img
              src={currentImage}
              alt="주차 이미지"
              className="main-week-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/0/cluster4/주차 이미지/휴식(개인,공식).png";
              }}
            />
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
                <img src="/images/0/cluster4/icon/icon - 6.png" alt="calendar" />
                <span>{weekData ? `${formatDate(weekData.startDate)} ~ ${formatDate(weekData.endDate)}` : "로딩 중..."}</span>
              </div>
              <div className="info-badge role" style={{ width: "fit-content", minWidth: "auto", maxWidth: "200px", fontFamily: "'Pretendard', sans-serif" }}>
                <img src="/images/0/cluster4/icon/Interface/Star-3.png" alt="role" />
                <span style={{ overflow: "hidden", whiteSpace: "nowrap" }}>{(roleLabel || "-").length > 9 ? (roleLabel || "-").slice(0, 9) + ".." : roleLabel || "-"}</span>
              </div>
              <div className="info-badge week" style={{ flexShrink: 0, marginLeft: "auto" }}>
                <img src="/images/0/cluster4/icon/icon - 7.png" alt="week" />
                <span>
                  <span className="highlight">{cumulativeApprovedWeeks}</span> / 30 주차
                </span>
              </div>
            </div>
            <div className="header-info-row2" style={{ gap: "11px" }}>
              <div className="info-group left" style={{ flexShrink: 0 }}>
                <span className="info-item team" style={{ display: "inline-flex", minWidth: "245px", maxWidth: "245px", fontSize: "16px", fontFamily: "'Pretendard', sans-serif" }}>
                  <strong>[팀]&nbsp;</strong>
                  <span className="text-gray">{isOnboardingWeek ? "클럽 온보딩" : teamName === "운영진" && generation ? `운영진(${generation}기)` : (teamName || "-").length > 10 ? (teamName || "-").slice(0, 10) + ".." : teamName || "-"}</span>
                </span>
                <span className="info-divider" style={{ marginLeft: "-63px" }}>
                  |
                </span>
                <span className="info-item part" style={{ display: "inline-flex", minWidth: "245px", maxWidth: "245px", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", marginLeft: "-4px" }}>
                  <strong>[파트]&nbsp;</strong>
                  <span className="text-gray">
                    {isOnboardingWeek
                      ? "신입OT"
                      : teamName === "운영진" && partName === "팀장" && managedTeamName
                        ? `팀장(${managedTeamName})`.length > 10
                          ? `팀장(${managedTeamName})`.slice(0, 10) + ".."
                          : `팀장(${managedTeamName})`
                        : (partName || "-").length > 10
                          ? (partName || "-").slice(0, 10) + ".."
                          : partName || "-"}
                  </span>
                </span>
              </div>
              <div className="info-group right" style={{ gap: "8px", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", marginLeft: "0px" }}>
                <span className="info-divider">·</span>
                <span className="info-item with-icon">
                  단감
                  <img src="/images/0/cluster4/icon/icon - 단감.png" alt="단감" className="item-icon" />
                  <strong className="number-value" style={{ display: "inline-block", minWidth: "3ch", textAlign: "right" }}>
                    {weekPoints.star}
                  </strong>
                  <span className="unit-text">개</span>
                </span>
                <span className="info-divider">·</span>
                <span className="info-item with-icon">
                  인절미
                  <img src="/images/0/cluster4/icon/icon - 인절미.png" alt="인절미" className="item-icon" />
                  <strong className="number-value" style={{ display: "inline-block", minWidth: "3ch", textAlign: "right" }}>
                    {Math.abs(weekPoints.shield - weekPoints.lightning)}
                  </strong>
                  <span className="unit-text">개</span>
                </span>
                <span className="info-divider">·</span>
                <span className="info-item with-icon">
                  어흥
                  <img src="/images/0/cluster4/icon/icon - 어흥.png" alt="어흥" className="item-icon" />
                  <strong className="number-value" style={{ display: "inline-block", minWidth: "3ch", textAlign: "right" }}>
                    {Math.abs(weekPoints.lightning)}
                  </strong>
                  <span className="unit-text">개</span>
                </span>
              </div>
            </div>
          </div>

          {/* 주차 평판 */}
          <div className="reputation-section">
            <div className="section-title-row">
              <img src="/images/0/cluster4/icon/icon - 주차 평판.png" alt="주차 평판" className="section-icon" />
              <span className="section-label" style={{ fontSize: "20px" }}>
                주차 평판
              </span>
              <span className="section-count" style={{ fontSize: "17px" }}>
                <span className="count-num">{weeklyReputations.length}</span>/3
              </span>
            </div>
            <div className="reputation-cards-grid">
              {reputationData.map((user, index) => {
                const isEmpty = user.isEmpty || isRestMode;
                return (
                  <div
                    key={user.id}
                    className={`reputation-card ${isEmpty ? "empty" : ""}`}
                    onClick={() => {
                      if (!isEmpty) {
                        setSelectedReputationCard(user);
                        setReputationViewModalOpen(true);
                      }
                    }}
                    style={{ cursor: isEmpty ? "default" : "pointer" }}
                  >
                    <div className="card-profile">
                      <div className="profile-image">{!isEmpty && user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}</div>
                      <div className="profile-info">
                        <div className="profile-name">
                          {isEmpty ? (
                            <>
                              <span className="text">-</span> | <span className="text">-</span> | <span className="text">-</span>
                            </>
                          ) : (
                            <>
                              <span className="text">{user.name}</span> | <span className="text">{user.gender}</span> | <span className="text">{mask.age(user.age)}세</span>
                            </>
                          )}
                        </div>
                        <div className="profile-details" style={{ fontSize: "16px" }}>
                          {isEmpty ? (
                            <>
                              <div className="detail-line">
                                <span className="text" style={{ flex: 1, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", paddingRight: "4px" }}>
                                  -
                                </span>
                                <span className="label" style={{ fontSize: "16px" }}>
                                  학교
                                </span>{" "}
                                |{" "}
                                <span className="text" style={{ flex: 1, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", paddingRight: "4px" }}>
                                  -
                                </span>
                                <span className="label" style={{ fontSize: "16px" }}>
                                  학과
                                </span>
                              </div>
                              <div className="detail-line">
                                <span className="text" style={{ flex: 1, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", paddingRight: "4px" }}>
                                  -
                                </span>
                                <span className="label" style={{ fontSize: "16px" }}>
                                  팀
                                </span>{" "}
                                |{" "}
                                <span className="text" style={{ flex: 1, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", paddingRight: "4px" }}>
                                  -
                                </span>
                                <span className="label" style={{ fontSize: "16px" }}>
                                  파트
                                </span>
                              </div>
                              <div className="detail-line">
                                <span className="text">&nbsp;</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="detail-line">
                                <span className="text" style={{ flex: 1, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right" }}>
                                  {truncate(formatSchool(mask.school(user.university)), 6)}
                                </span>
                                <span className="label" style={{ fontSize: "16px" }}>
                                  학교
                                </span>{" "}
                                |{" "}
                                <span className="text" style={{ flex: 1, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right" }}>
                                  {truncate(formatMajor(mask.major(user.major)), 6)}
                                </span>
                                <span className="label" style={{ fontSize: "16px" }}>
                                  학과
                                </span>
                              </div>
                              <div className="detail-line">
                                <span className="text" style={{ flex: 1, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right" }}>
                                  {truncate(user.team || "-", 6)}
                                </span>
                                <span className="label" style={{ fontSize: "16px" }}>
                                  팀
                                </span>{" "}
                                |{" "}
                                <span className="text" style={{ flex: 1, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right" }}>
                                  {truncate(user.part || "-", 6)}
                                </span>
                                <span className="label" style={{ fontSize: "16px" }}>
                                  파트
                                </span>
                              </div>
                              <div className="detail-line" style={{ display: "flex", alignItems: "center" }}>
                                <span style={{ flex: 1, display: "flex", justifyContent: "flex-end", overflow: "hidden", textOverflow: "clip", whiteSpace: "nowrap" }}>
                                  <span
                                    className="badge-status yellow"
                                    style={{
                                      padding: "4px 7.2px",
                                      background: "rgba(250, 171, 7, 0.1)",
                                      borderRadius: 4,
                                      fontSize: 15,
                                      fontFamily: "'Pretendard', sans-serif",
                                      fontWeight: 600,
                                      lineHeight: "15px",
                                      color: "#faab07",
                                      whiteSpace: "nowrap",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {(user.role || "일반").length > 7 ? (user.role || "일반").slice(0, 7) + ".." : user.role || "일반"}
                                  </span>
                                </span>
                                <span style={{ width: "3px", flexShrink: 0 }}></span>
                                <span className="nickname" style={{ flex: 1, fontSize: "16px", textAlign: "right", overflow: "hidden", whiteSpace: "nowrap", color: NICKNAME_COLORS[(index + NICKNAME_COLOR_OFFSET) % 4] }}>
                                  {(user.nickname || "-").length > 8 ? (user.nickname || "-").slice(0, 8) + ".." : user.nickname || "-"}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="profile-divider"></div>
                    <div className="card-rating">
                      <div className="stars">{renderStars(isEmpty ? 0 : user.rating)}</div>
                      <span className="rating-count" style={{ fontSize: "14px" }}>
                        {isEmpty ? "- / 10" : user.ratingCount}
                      </span>
                    </div>
                    <div className="card-description" style={{ fontSize: "15px" }}>
                      {isEmpty ? (
                        "-"
                      ) : (
                        <>
                          {user.description.length > 20 ? `${user.description.slice(0, 20)}..` : user.description} <img src="/images/0/cluster4/icon - 더보기.png" alt="더보기" className="more-icon" />
                        </>
                      )}
                    </div>
                    <div className="card-footer">
                      <span className="fm-badge" style={{ fontSize: "17px" }}>
                        <img src="/images/0/cluster4/icon - wifi.png" alt="wifi" className="wifi-icon" /> FM : <span style={{ display: "inline-block", minWidth: "4ch", textAlign: "right" }}>{isEmpty ? "-" : user.fm}</span>
                      </span>
                      <span className="footer-divider">|</span>
                      <span className={`tag ${isEmpty ? "tag--dark" : user.tagColor}`} style={{ fontSize: "11.6px" }}>
                        {isEmpty ? "-" : truncate(user.tagText, 10)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 연계 동료 */}
          <div className="colleague-section">
            {/* 플로팅 아이콘 - 연계 동료 편집 */}
            {
              <div className="floating-icons" style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  className="edit-icon"
                  onClick={() => {
                    if (!isDemoMode && !isOwner) {
                      alert("연계 크루는 본인만이 작성할 수 있습니다.");
                      return;
                    }
                    handleEditClick(() => {
                      setHeaderModalType("본인");
                      setHeaderModalOpen(true);
                      fetchCrewListIfNeeded();
                    });
                  }}
                  style={{ cursor: "pointer", marginTop: "8px" }}
                >
                  <i className="ti ti-pencil" style={{ fontSize: "11px", color: "#FFFFFF" }}></i>
                </div>
              </div>
            }
            <div className="section-title-row">
              <img src="/images/0/cluster4/icon/icon - 연계 동료.png" alt="연계 동료" className="section-icon" />
              <span className="section-label" style={{ fontSize: "20px" }}>
                연계 동료
              </span>
              <span className="section-count" style={{ fontSize: "17px" }}>
                <span className="count-num">{selectedColleagues.length}</span>/3
              </span>
            </div>
            <div className="colleague-cards">
              {colleagueData.map((user, index) => {
                const isEmpty = user.isEmpty;
                return (
                  <div
                    key={user.id}
                    className={`colleague-card ${isEmpty ? "empty" : ""}`}
                    onClick={() => {
                      if (!isEmpty) {
                        setSelectedColleagueCard(user);
                        setSelectedColleagueIndex(index);
                        setColleagueViewModalOpen(true);
                      }
                    }}
                    style={{ cursor: isEmpty ? "default" : "pointer" }}
                  >
                    <div className="card-profile">
                      <div className="profile-image">{!isEmpty && user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}</div>
                      <div className="profile-info">
                        <div className="profile-name-row">
                          <div className="profile-name">
                            {isEmpty ? (
                              <>
                                <span className="text">-</span> | <span className="text">-</span> | <span className="text">-</span>
                              </>
                            ) : (
                              <>
                                <span className="text">{user.name}</span> | <span className="text">{user.gender}</span> | <span className="text">{mask.age(user.age)}세</span>
                              </>
                            )}
                          </div>
                          <div className="date-view">
                            {!isEmpty && (
                              <span
                                className="badge-status yellow"
                                style={{
                                  padding: "4px 7.2px",
                                  background: "rgba(250, 171, 7, 0.1)",
                                  borderRadius: 4,
                                  fontSize: 15,
                                  fontFamily: "'Pretendard', sans-serif",
                                  fontWeight: 600,
                                  lineHeight: "15px",
                                  color: "#faab07",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                  marginRight: "8px",
                                }}
                              >
                                {(user.role || "일반").length > 10 ? (user.role || "일반").slice(0, 10) + ".." : user.role || "일반"}
                              </span>
                            )}
                            <span className="date">{isEmpty ? "0000 - 00 - 00 (일)" : user.date}</span>
                            <img src="/images/0/cluster4/icon/icon - 7 - eye.png" alt="view" className="view-icon" />
                          </div>
                        </div>
                        <div className="profile-details" style={{ fontSize: "16px" }}>
                          {isEmpty ? (
                            <>
                              <span className="text" style={{ width: "88px", flexShrink: 0, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", display: "inline-block" }}>
                                -
                              </span>
                              <span className="label" style={{ fontSize: "16px" }}>
                                학교
                              </span>
                              <span className="profile-divider" style={{ margin: "0 4px" }}>
                                |
                              </span>
                              <span className="text" style={{ width: "88px", flexShrink: 0, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", display: "inline-block" }}>
                                -
                              </span>
                              <span className="label" style={{ fontSize: "16px" }}>
                                학과
                              </span>
                              <span className="profile-divider" style={{ margin: "0 4px" }}>
                                |
                              </span>
                              <span className="text" style={{ width: "88px", flexShrink: 0, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", display: "inline-block" }}>
                                -
                              </span>
                              <span className="label" style={{ fontSize: "16px" }}>
                                팀
                              </span>
                              <span className="profile-divider" style={{ margin: "0 4px" }}>
                                |
                              </span>
                              <span className="text" style={{ width: "88px", flexShrink: 0, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", display: "inline-block" }}>
                                -
                              </span>
                              <span className="label" style={{ fontSize: "16px" }}>
                                파트
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text" style={{ width: "88px", flexShrink: 0, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", display: "inline-block" }}>
                                {truncate(formatSchool(mask.school(user.university)), 5)}
                              </span>
                              <span className="label" style={{ fontSize: "16px" }}>
                                학교
                              </span>
                              <span className="profile-divider" style={{ margin: "0 4px" }}>
                                |
                              </span>
                              <span className="text" style={{ width: "88px", flexShrink: 0, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", display: "inline-block" }}>
                                {truncate(formatMajor(mask.major(user.major)), 5)}
                              </span>
                              <span className="label" style={{ fontSize: "16px" }}>
                                학과
                              </span>
                              <span className="profile-divider" style={{ margin: "0 4px" }}>
                                |
                              </span>
                              <span className="text" style={{ width: "88px", flexShrink: 0, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", display: "inline-block" }}>
                                {truncate(user.team || "-", 5)}
                              </span>
                              <span className="label" style={{ fontSize: "16px" }}>
                                팀
                              </span>
                              <span className="profile-divider" style={{ margin: "0 4px" }}>
                                |
                              </span>
                              <span className="text" style={{ width: "88px", flexShrink: 0, overflow: "hidden", textOverflow: "clip", fontSize: "16px", fontFamily: "'Pretendard', sans-serif", whiteSpace: "nowrap", textAlign: "right", display: "inline-block" }}>
                                {truncate(user.part || "-", 5)}
                              </span>
                              <span className="label" style={{ fontSize: "16px" }}>
                                파트
                              </span>
                              <span className="profile-divider" style={{ margin: "0 4px" }}>
                                |
                              </span>
                              <span className="nickname" style={{ fontSize: "16px", display: "inline-block", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "120px", textAlign: "right", marginLeft: "auto", color: NICKNAME_COLORS[(index + NICKNAME_COLOR_OFFSET) % 4] }}>
                                {truncate(user.nickname, 5)}
                              </span>
                            </>
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
              <span className="growth-count">
                <img src="/images/0/cluster4/icon/icon - 0 - 3star.png" alt="star" className="star-icon" /> 총{" "}
                <span style={{ display: "inline-block", minWidth: "2ch", textAlign: "right", color: "white", fontSize: 19, fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: "uppercase" as const, lineHeight: "31px" }}>
                  {infoStats.total + competencyStats.total + experienceStats.total + careerStats.total}
                </span>{" "}
                개 중{" "}
                <span className="highlight" style={{ display: "inline-block", minWidth: "2ch", textAlign: "right" }}>
                  {infoStats.success + competencyStats.success + experienceStats.success + careerStats.success}
                </span>
                개
              </span>
            </div>
            <div className={`progress-bar-container ${isRestMode ? "rest-dimmed" : ""}`}>
              <div
                className="progress-bar"
                style={{
                  width: isRestMode
                    ? "100%"
                    : `${infoStats.total + competencyStats.total + experienceStats.total + careerStats.total > 0 ? Math.ceil(((infoStats.success + competencyStats.success + experienceStats.success + careerStats.success) / (infoStats.total + competencyStats.total + experienceStats.total + careerStats.total)) * 100) : isOnboardingWeek ? 100 : 0}%`,
                }}
              ></div>
              {isRestMode && <span className="rest-message">휴식주차로서 집계되지 않습니다</span>}
            </div>
          </div>
          <div className="growth-center">
            <span className="progress-percent">
              <span className="number">
                {isRestMode
                  ? "-"
                  : infoStats.total + competencyStats.total + experienceStats.total + careerStats.total > 0
                    ? Math.ceil(((infoStats.success + competencyStats.success + experienceStats.success + careerStats.success) / (infoStats.total + competencyStats.total + experienceStats.total + careerStats.total)) * 100)
                    : isOnboardingWeek
                      ? 100
                      : 0}
              </span>
              <span className="percent">%</span>
            </span>
          </div>
          <div className="growth-right">
            <span className="growth-label">라인별 강화 결과</span>
            <div className="legend-items">
              <span className="legend-item">
                <img src="/images/0/cluster4/icon/5 강화 성공.png" alt="강화 성공" className="legend-icon" />
                강화 성공
              </span>
              <span className="legend-item">
                <img src="/images/0/cluster4/icon/6 강화 대기.png" alt="강화 대기" className="legend-icon" />
                강화 대기
              </span>
              <span className="legend-item">
                <img src="/images/0/cluster4/icon/7 강화 실패.png" alt="강화 실패" className="legend-icon" />
                강화 실패
              </span>
              <span className="legend-item">
                <img src="/images/0/cluster4/icon/8 해당 없음.png" alt="해당 없음" className="legend-icon glow" />
                해당 없음
              </span>
            </div>
          </div>
        </div>

        {/* 실무 정보 */}
        <div className="work-info-section">
          {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
          {
            <div className="floating-icons" style={{ display: "flex" }}>
              {/* <div
                className="edit-icon"
                style={{ cursor: "default", opacity: 0.4 }}
              >
                <i className="ti ti-pencil" style={{ fontSize: "11px", color: "#FFFFFF" }}></i>
              </div> */}
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          }
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster4/icon/1 실무 정보.png" alt="실무 정보" className="section-icon" />
              <span className="section-name">
                실무 <span className="keyword-highlight">정보</span>
              </span>
            </div>
            <span className="section-count">
              총 <span style={{ display: "inline-block", minWidth: "2.5ch", textAlign: "right", color: "white", fontSize: 24, fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: "uppercase" as const, lineHeight: "31px" }}>{infoStats.total}</span> 개 중{" "}
              <span className="highlight" style={{ display: "inline-block", minWidth: "2.5ch", textAlign: "right" }}>
                {infoStats.success}
              </span>{" "}
              개
            </span>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value">
                <span className="highlight" style={{ display: "inline-block", minWidth: "3ch", textAlign: "right" }}>
                  {isRestMode ? "-" : infoStats.total > 0 ? Math.ceil((infoStats.success / infoStats.total) * 100) : 0}
                </span>
                %
              </span>
            </div>
          </div>
          <div className="work-info-cards">
            {effectiveWorkInfoCards.map((card) => {
              const isEmpty = card.isEmpty;
              return (
                <div
                  key={card.id}
                  className={`work-info-card ${isEmpty ? "empty" : ""}`}
                  onClick={() => {
                    if (!isEmpty) {
                      setSelectedWorkInfoCard(card);
                      setWorkInfoViewModalOpen(true);
                    }
                  }}
                  style={{ cursor: isEmpty ? "default" : "pointer" }}
                >
                  <div className="card-content-area">
                    <div className="card-title-row">
                      <img src="/images/0/cluster4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                      <span className="card-title">Main Title</span>
                      <img src="/images/0/cluster4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                      <span className="verified-text">Verified</span>
                      {!isEmpty && card.category && <span className={`tag ${card.tagColor}`}>{card.category}</span>}
                    </div>
                    <div className="card-body-row">
                      <div className={`card-icon-area ${!isEmpty && card.isFruit ? "fruit" : ""} ${!isEmpty && card.isFailed ? "failed" : ""}`}>
                        {!isEmpty && card.icon ? <img src={card.icon} alt={card.category} style={{ opacity: card.status === "failed" || card.status === "not_applicable" ? 0.3 : 1 }} /> : <div className="icon-placeholder"></div>}
                        {!isEmpty && card.isFailed && (
                          <div className="failed-overlay" style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span className="failed-text" style={{ whiteSpace: "nowrap", width: "auto", color: "#ff4444", fontWeight: "800" }}>
                              강화 실패
                            </span>
                            <span className="failed-emoji">😿</span>
                          </div>
                        )}
                      </div>
                      <span className="card-desc">{isEmpty ? "-" : card.title || "-"}</span>
                      {!isEmpty && <img src="/images/0/cluster4/icon - 더보기.png" alt="더보기" className="card-arrow" />}
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

        {/* 실무 경험 */}
        <div className="work-exp-section">
          {/* 플로팅 아이콘 - 본인 프로필일 때만 표시 */}
          {
            <div className="floating-icons" style={{ display: "flex" }}>
              {/* <div
                className="edit-icon"
                style={{ cursor: "default", opacity: 0.4 }}
              >
                <i className="ti ti-pencil" style={{ fontSize: "11px", color: "#FFFFFF" }}></i>
              </div> */}
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          }
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster4/icon/2 실무 경험.png" alt="실무 경험" className="section-icon" />
              <span className="section-name">
                실무 <span className="keyword-highlight">경험</span>
              </span>
            </div>
            <span className="section-count">
              총 <span style={{ display: "inline-block", minWidth: "2.5ch", textAlign: "right", color: "white", fontSize: 24, fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: "uppercase" as const, lineHeight: "31px" }}>{experienceStats.total}</span> 개 중{" "}
              <span className="highlight" style={{ display: "inline-block", minWidth: "2.5ch", textAlign: "right" }}>
                {experienceStats.success}
              </span>{" "}
              개
            </span>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value">
                <span className="highlight" style={{ display: "inline-block", minWidth: "3ch", textAlign: "right" }}>
                  {isRestMode ? "-" : experienceStats.total > 0 ? Math.ceil((experienceStats.success / experienceStats.total) * 100) : 0}
                </span>
                %
              </span>
            </div>
          </div>
          <div className="work-exp-cards">
            {effectiveWorkExpCards.map((card, cardIndex) => {
              const isEmpty = card.isEmpty;
              const expActivityType = workExpActivityTypes[cardIndex];
              return (
                <div
                  key={card.id}
                  className={`work-exp-card ${isEmpty ? "empty" : ""}`}
                  onClick={() => {
                    if (!isEmpty) {
                      setSelectedWorkExpCard(card);
                      setWorkExpViewModalOpen(true);
                    }
                  }}
                  style={{ cursor: isEmpty ? "default" : "pointer" }}
                >
                  <div className="card-top-row">
                    <div className={`card-icon-area ${!isEmpty && card.enhancementStatus === "failed" ? "failed" : ""}`}>
                      {!isEmpty && card.icon ? <img src={card.icon} alt={card.badge} style={{ opacity: card.enhancementStatus === "failed" ? 0.3 : 1 }} /> : <div className="icon-placeholder"></div>}
                      {!isRestMode && !isEmpty && (!card.hasActivity || card.enhancementStatus === "failed") && (
                        <div className="failed-overlay" style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <span className="failed-text" style={{ whiteSpace: "nowrap", width: "auto", color: "#ff4444", fontWeight: "800" }}>
                            강화 실패
                          </span>
                          <span className="failed-emoji">😿</span>
                        </div>
                      )}
                    </div>
                    <div className="card-header-area">
                      <div className="card-header-row">
                        <span className="code-tag">{isEmpty ? "-" : card.code}</span>
                        <span className="badge-tag">{isEmpty ? "-" : card.badge.length > 25 ? card.badge.slice(0, 25) + ".." : card.badge}</span>
                      </div>
                      <div className="card-rating-row">
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <img key={star} src={isEmpty || star > card.rating ? "/images/0/cluster4/icon/icon - empty star.png" : "/images/0/cluster4/icon/icon - star.png"} alt="star" className="star" />
                          ))}
                        </div>
                        <span className="rating-count">{isEmpty ? "- / 10" : card.ratingCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-bottom-area">
                    <div className="card-title-row">
                      <img src="/images/0/cluster4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                      <span className="card-title">Main Title</span>
                      {!isEmpty && card.verified && (
                        <>
                          <img src="/images/0/cluster4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                          <span className="verified-text">Verified</span>
                        </>
                      )}
                    </div>
                    <p className="main-desc">
                      {isEmpty
                        ? "-"
                        : (() => {
                            const text = card.title || "-";
                            return text.length > 80 ? text.slice(0, 80) + "..." : text;
                          })()}
                    </p>
                    <div className="sub-title-row">
                      <img src="/images/0/cluster4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                      <span className="sub-label">Sub Title</span>
                    </div>
                    <span className="sub-desc">
                      {isEmpty || isRestMode
                        ? "-"
                        : (() => {
                            const text = weekActivityDetails.find((d) => d.activity_type_id === card.activityTypeId)?.sub_title || "-";
                            return text.length > 79 ? text.slice(0, 79) + "..." : text;
                          })()}
                    </span>
                    {!isEmpty && <img src="/images/0/cluster4/icon - 더보기.png" alt="더보기" className="card-arrow" />}
                  </div>
                  {!isEmpty && (
                    <div className={`status-badge ${isRestMode ? "not_applicable" : !card.hasActivity ? "failed" : card.enhancementStatus}`}>
                      {(() => {
                        if (isRestMode) return <img src="/images/0/cluster4/icon/8 해당 없음.png" alt="해당 없음" />;
                        if (!card.hasActivity) return <img src="/images/0/cluster4/icon/7 강화 실패.png" alt="강화 실패" />;
                        const statusImages: Record<string, string> = {
                          success: "/images/0/cluster4/icon/5 강화 성공.png",
                          waiting: "/images/0/cluster4/icon/6 강화 대기.png",
                          failed: "/images/0/cluster4/icon/7 강화 실패.png",
                          not_applicable: "/images/0/cluster4/icon/8 해당 없음.png",
                        };
                        return <img src={statusImages[card.enhancementStatus] || statusImages["not_applicable"]} alt="강화 상태" />;
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== 섹션 3: 실무 경험 + 실무 경력 ========== */}
      <div className="section3-layout">
        {/* 실무 역량 */}
        <div className="work-ability-section">
          {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
          {
            <div className="floating-icons" style={{ display: "flex" }}>
              {/* <div
                className="edit-icon"
                style={{ cursor: "default", opacity: 0.4 }}
              >
                <i className="ti ti-pencil" style={{ fontSize: "11px", color: "#FFFFFF" }}></i>
              </div> */}
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          }
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster4/icon/3 실무 역량.png" alt="실무 역량" className="section-icon" />
              <span className="section-name">
                실무 <span className="keyword-highlight">역량</span>
              </span>
            </div>
            <span className="section-count">
              총 <span style={{ display: "inline-block", minWidth: "2.5ch", textAlign: "right", color: "white", fontSize: 24, fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: "uppercase" as const, lineHeight: "31px" }}>{competencyStats.total}</span> 개 중{" "}
              <span className="highlight" style={{ display: "inline-block", minWidth: "2.5ch", textAlign: "right" }}>
                {competencyStats.success}
              </span>{" "}
              개
            </span>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value">
                <span className="highlight" style={{ display: "inline-block", minWidth: "3ch", textAlign: "right" }}>
                  {isRestMode ? "-" : competencyStats.total > 0 ? Math.ceil((competencyStats.success / competencyStats.total) * 100) : 0}
                </span>
                %
              </span>
            </div>
          </div>
          {(() => {
            // 유저가 완료한 활동 또는 선택한(record가 있는) 활동 찾기
            const completedActivity = findFirstCompletedAbilityActivity();
            const selectedActivity = findFirstSelectedAbilityActivity(); // 유저가 선택한 활동 (record 있음)
            const displayActivity = isRestMode ? null : completedActivity || selectedActivity; // 휴식 모드일 때 활동 없음 처리
            const activityTypeInfo = displayActivity ? getActivityTypeInfo(displayActivity.activity_type_id) : null;
            const enhancementStatus = isRestMode ? ("not_applicable" as EnhancementStatus) : displayActivity ? getEnhancementStatus(displayActivity.activity_type_id) : "not_applicable";
            const hasActivity = !!displayActivity; // 유저가 선택한 활동이 있는지
            const hasCompletedActivity = !!completedActivity; // 완료된 활동이 있는지 여부

            return (
              <div
                className={`work-ability-card ${!hasActivity ? "empty" : ""}`}
                onClick={() => {
                  if (hasActivity) {
                    setWorkAbilityViewModalOpen(true);
                  }
                }}
                style={{ cursor: !hasActivity ? "default" : "pointer" }}
              >
                <div className={`card-icon-area ${enhancementStatus === "failed" ? "failed" : ""}`}>
                  {hasActivity && displayActivity && <img src={getCompetencyIconPath(displayActivity.activity_type_id)} alt="실무 역량" style={{ opacity: enhancementStatus === "failed" ? 0.3 : 1 }} />}
                  {!hasActivity && <div className="icon-placeholder"></div>}
                  {!isRestMode && (enhancementStatus === "failed" || !hasActivity) && (
                    <div className="failed-overlay" style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span className="failed-text" style={{ whiteSpace: "nowrap", width: "auto", color: "#ff4444", fontWeight: "800" }}>
                        강화 실패
                      </span>
                      <span className="failed-emoji">😿</span>
                    </div>
                  )}
                </div>
                <div className="card-content-area">
                  <div className="card-title-row">
                    <img src="/images/0/cluster4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">Main Title</span>
                    {hasActivity && enhancementStatus === "success" && (
                      <>
                        <img src="/images/0/cluster4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                        <span className="verified-text">Verified</span>
                      </>
                    )}
                    {hasActivity && activityTypeInfo && (
                      <>
                        <span className="code-tag">{activityTypeInfo.line_code}</span>
                        <span className="info-tag">{activityTypeInfo.name.length > 35 ? activityTypeInfo.name.slice(0, 35) + ".." : activityTypeInfo.name}</span>
                      </>
                    )}
                  </div>
                  <p className="main-desc">{!hasActivity ? "-" : displayActivity?.title || "-"}</p>
                  <div className="sub-title-row">
                    <img src="/images/0/cluster4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                    <span className="sub-label">Sub Title</span>
                  </div>
                  <span className="sub-desc">{!hasActivity ? "-" : weekActivityDetails.find((d) => d.activity_type_id === displayActivity?.activity_type_id)?.sub_title || "-"}</span>
                  {hasActivity && <img src="/images/0/cluster4/icon - 더보기.png" alt="더보기" className="card-arrow" />}
                </div>
                <div className="status-badge">
                  {hasActivity && enhancementStatus === "success" && <img src="/images/0/cluster4/icon/5 강화 성공.png" alt="강화 성공" />}
                  {hasActivity && enhancementStatus === "waiting" && <img src="/images/0/cluster4/icon/6 강화 대기.png" alt="강화 대기" />}
                  {!isRestMode && (enhancementStatus === "failed" || !hasActivity) && <img src="/images/0/cluster4/icon/7 강화 실패.png" alt="강화 실패" />}
                  {(isRestMode || (hasActivity && enhancementStatus === "not_applicable")) && <img src="/images/0/cluster4/icon/8 해당 없음.png" alt="해당 없음" />}
                </div>
              </div>
            );
          })()}
          <div className="character-image">
            <img src="/images/0/cluster4/bg img 2.png" alt="character" />
          </div>
        </div>

        {/* 실무 경력 */}
        <div className="work-career-section">
          {/* 플로팅 아이콘 - 본인 프로필일 때만 표시 */}
          {
            <div className="floating-icons" style={{ display: "flex" }}>
              {/* <div
                className="edit-icon"
                style={{ cursor: "default", opacity: 0.4 }}
              >
                <i className="ti ti-pencil" style={{ fontSize: "11px", color: "#FFFFFF" }}></i>
              </div> */}
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          }
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster4/icon/4 실무 경력.png" alt="실무 경력" className="section-icon" />
              <span className="section-name">
                실무 <span className="keyword-highlight">경력</span>
              </span>
            </div>
            <span className="section-count">
              총 <span style={{ display: "inline-block", minWidth: "2.5ch", textAlign: "right", color: "white", fontSize: 24, fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: "uppercase" as const, lineHeight: "31px" }}>{careerStats.total}</span> 개 중{" "}
              <span className="highlight" style={{ display: "inline-block", minWidth: "2.5ch", textAlign: "right" }}>
                {careerStats.success}
              </span>{" "}
              개
            </span>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value">
                <span className="highlight" style={{ display: "inline-block", minWidth: "3ch", textAlign: "right" }}>
                  {isRestMode ? "-" : careerStats.total > 0 ? Math.ceil((careerStats.success / careerStats.total) * 100) : 0}
                </span>
                %
              </span>
            </div>
          </div>
          <div className="work-career-cards">
            {currentCareerCards.map((card, cardIndex) => {
              const isEmpty = card.isEmpty;
              return (
                <div key={card.id} className="work-career-card-wrapper">
                  <div
                    className={`work-career-card ${isEmpty ? "empty" : ""} ${card.isFailed ? "failed" : ""} ${card.isNotApplicable ? "not-applicable" : ""}`}
                    onClick={() => {
                      if (!isEmpty) {
                        setSelectedWorkCareerCard(card);
                        setWorkCareerViewModalOpen(true);
                      }
                    }}
                    style={{ cursor: isEmpty ? "default" : "pointer" }}
                  >
                    {card.isFailed && <div className="card-overlay failed"></div>}
                    <div className="card-top-row">
                      <div className="card-icon-area" style={{ position: "relative" }}>
                        {!isEmpty && card.icon ? <img src={card.icon} alt={card.badge} style={{ opacity: card.isFailed ? 0.3 : 1 }} /> : <div className="icon-placeholder"></div>}
                        {!isEmpty && card.isFailed && (
                          <div className="failed-overlay" style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span className="failed-text" style={{ whiteSpace: "nowrap", width: "auto", color: "#ff4444", fontWeight: "800" }}>
                              강화 실패
                            </span>
                            <span className="failed-emoji">😿</span>
                          </div>
                        )}
                      </div>
                      <div className="card-header-area">
                        <div className="card-header-row">
                          <img src="/images/0/cluster4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                          <span className="verified-text">Verified</span>
                          <span className="code-tag">{isEmpty ? "-" : card.code}</span>
                        </div>
                        <div className="grade-row">
                          <span className={`grade ${!isEmpty && card.grade === "S" ? "active" : ""}`}>S</span>
                          <span className={`grade ${!isEmpty && card.grade === "A" ? "active" : ""}`}>A</span>
                          <span className={`grade ${!isEmpty && card.grade === "B" ? "active" : ""}`}>B</span>
                          <span className={`grade ${!isEmpty && card.grade === "C" ? "active" : ""}`}>C</span>
                          <span className={`grade ${!isEmpty && card.grade === "D" ? "active" : ""}`}>D</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-bottom-area">
                      <p className="category-text">
                        {isEmpty
                          ? "-"
                          : (() => {
                              const t = card.badge.replace("|", " - ");
                              return t.length > 25 ? t.slice(0, 25) + ".." : t;
                            })()}
                      </p>
                      <div className="card-title-row">
                        <img src="/images/0/cluster4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                        <span className="card-title">Main Title</span>
                      </div>
                      <p className="main-desc-white">
                        {isEmpty
                          ? "-"
                          : (() => {
                              const text = card.title || "-";
                              return text.length > 100 ? text.slice(0, 100) + "..." : text;
                            })()}
                      </p>
                      <div className="sub-title-row">
                        <img src="/images/0/cluster4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                        <span className="sub-label">Sub Title</span>
                      </div>
                      <span className="sub-desc">
                        {isEmpty
                          ? "-"
                          : (() => {
                              const text = card.projectDescription || "-";
                              return text.length > 70 ? text.slice(0, 70) + "..." : text;
                            })()}
                      </span>
                      {!isEmpty && <img src="/images/0/cluster4/icon - 더보기.png" alt="더보기" className="card-arrow" />}
                      <div className="supervisor-section">
                        <span className="supervisor-label">실무 기업 감독자</span>
                        <div className="supervisor-info">
                          <div className="supervisor-profile">
                            <div className={`profile-avatar ${isEmpty ? "empty" : ""}`}>{!isEmpty && card.supervisorImg && <img src={card.supervisorImg} alt="supervisor" />}</div>
                            <div className="profile-text">
                              <span className="supervised-text">Supervised by:</span>
                              <span className="profile-name" style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                                {isEmpty ? (
                                  "-"
                                ) : (
                                  <>
                                    <span style={{ display: "inline-block", minWidth: "56px", maxWidth: "56px", textAlign: "left", overflow: "hidden" }}>
                                      <strong>{(card.supervisorName || "").length > 3 ? (card.supervisorName || "").slice(0, 3) + ".." : card.supervisorName}</strong>
                                    </span>
                                    <span style={{ flexShrink: 0 }}> | </span>
                                    <span style={{ display: "inline-block", minWidth: "126px", maxWidth: "126px", textAlign: "left", overflow: "hidden", paddingLeft: "4px", boxSizing: "border-box" }}>
                                      {(card.supervisorDept || "-").length > 7 ? (card.supervisorDept || "-").slice(0, 7) + ".." : card.supervisorDept || "-"}
                                    </span>
                                    <span style={{ flexShrink: 0 }}> | </span>
                                    <span style={{ display: "inline-block", minWidth: "98px", maxWidth: "98px", textAlign: "left", overflow: "hidden", paddingLeft: "4px", boxSizing: "border-box" }}>
                                      {(card.supervisorCompany || "-").length > 6 ? (card.supervisorCompany || "-").slice(0, 6) + ".." : card.supervisorCompany || "-"}
                                    </span>
                                    <span style={{ flexShrink: 0 }}> | </span>
                                    <span style={{ display: "inline-block", minWidth: "39px", maxWidth: "39px", textAlign: "left", overflow: "hidden", paddingLeft: "4px", boxSizing: "border-box" }}>
                                      {(card.supervisorPosition || "-").length > 2 ? (card.supervisorPosition || "-").slice(0, 2) + ".." : card.supervisorPosition || "-"}
                                    </span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="profile-divider"></div>
                      </div>
                      <div className="card-footer-row">
                        <span className="current-bid">Current Bid</span>
                        <div className="date-view">
                          <span className="date">{isEmpty ? "0000-00-00 (일)" : card.date}</span>
                          <span className="check-badge">
                            <i className="ti ti-check"></i>
                          </span>
                        </div>
                        <span className="likes">
                          <img src="/images/0/cluster4/icon/icon%20-%209.png" alt="likes" className="likes-icon" />
                          {isEmpty ? "0,99" : card.likes}
                        </span>
                      </div>
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
          {totalCareerPages > 1 && (
            <div className="section3-pagination">
              {Array.from({ length: totalCareerPages }).map((_, i) => (
                <span key={i} className={`page-num ${careerPage === i ? "active" : ""} ${i === totalCareerPages - 1 ? "last" : ""}`} onClick={() => setCareerPage(i)} style={{ cursor: "pointer" }}>
                  {i + 1}
                </span>
              ))}
            </div>
          )}
          <div className="section-bottom-divider"></div>
        </div>
      </div>

      {/* ========== 실무 정보 모달 ========== */}
      {workInfoModalOpen && (
        <div className="section-modal-overlay">
          <div className="section-modal section-modal-work-edit">
            <div className="section-modal-header">
              <h3>실무 정보 편집</h3>
            </div>
            <div className="section-modal-body">
              {workInfoCards
                .filter((card) => !card.isEmpty)
                .map((card, index) => (
                  <div key={card.id} className="modal-card-item modal-card-workinfo">
                    {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                    <div className="modal-card-header-row">
                      <div className="modal-card-left">
                        <div className={`modal-fruit-icon ${card.isFruit ? "fruit" : ""} ${card.isFailed ? "failed" : ""}`}>{card.icon && <img src={card.icon} alt={card.category} />}</div>
                        <div className="modal-card-info">
                          <span className={`modal-card-tag ${card.tagColor}`}>{card.category}</span>
                        </div>
                      </div>
                      <div className="modal-header-right">
                        <div className="modal-status-badge">
                          {card.status === "success" && (
                            <>
                              <img src="/images/0/cluster4/icon/5 강화 성공.png" alt="강화성공" />
                              <span className="status-text success">강화성공</span>
                            </>
                          )}
                          {card.status === "waiting" && (
                            <>
                              <img src="/images/0/cluster4/icon/6 강화 대기.png" alt="강화대기" />
                              <span className="status-text waiting">강화대기</span>
                            </>
                          )}
                          {card.status === "failed" && (
                            <>
                              <img src="/images/0/cluster4/icon/7 강화 실패.png" alt="강화실패" />
                              <span className="status-text fail">강화실패</span>
                            </>
                          )}
                          {card.status === "not_applicable" && (
                            <>
                              <img src="/images/0/cluster4/icon/8 해당 없음.png" alt="해당없음" />
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
                        <div
                          style={{
                            padding: "16px",
                            backgroundColor: getEnhancementStatus(card.activityType) === "failed" || isActivityExpired(card.activityType) ? "#fee2e2" : "#fff3cd",
                            border: getEnhancementStatus(card.activityType) === "failed" || isActivityExpired(card.activityType) ? "1px solid #ef4444" : "1px solid #ffc107",
                            borderRadius: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          <p style={{ margin: 0, color: getEnhancementStatus(card.activityType) === "failed" || isActivityExpired(card.activityType) ? "#dc2626" : "#856404", fontSize: "14px" }}>
                            {getEnhancementStatus(card.activityType) === "failed"
                              ? "❌ 강화에 실패하여 2차 정보를 작성할 수 없습니다."
                              : isActivityExpired(card.activityType)
                                ? "⏰ 2차 정보 작성 기간이 마감되었습니다. (개설 후 48시간 경과)"
                                : "⚠️ 이 활동은 아직 개설되지 않았습니다. 운영진이 개설한 후 편집할 수 있습니다."}
                          </p>
                        </div>
                      )}

                      {/* Sub Title - 개설된 경우만 수정 가능 */}
                      <div className="modal-input-group">
                        <div className="section-label-row">
                          <div className="section-label">Sub Title</div>
                          <div className="char-counter">
                            <span className={(editingDetails[card.activityType]?.subTitle || "").length > 0 ? "active" : ""}>{(editingDetails[card.activityType]?.subTitle || "").length}</span> / 150
                          </div>
                        </div>
                        <textarea
                          value={editingDetails[card.activityType]?.subTitle || ""}
                          onChange={(e) => {
                            if (e.target.value.length > 150) {
                              alert("최대 150자까지 입력할 수 있습니다.");
                              return;
                            }
                            setEditingDetails((prev) => ({
                              ...prev,
                              [card.activityType]: {
                                ...prev[card.activityType],
                                subTitle: e.target.value,
                              },
                            }));
                          }}
                          placeholder={isActivityActive(card.activityType) ? "메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)" : ""}
                          rows={3}
                          maxLength={150}
                          disabled={!isActivityActive(card.activityType)}
                          style={!isActivityActive(card.activityType) ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                        ></textarea>
                      </div>

                      {/* Output Link - 운영진 입력은 읽기 전용, 미개설 시 전체 비활성화 */}
                      <div className="modal-input-group">
                        <div className="section-label">Output Link</div>
                        <div className="output-links-buttons">
                          {[0, 1, 2, 3, 4].map((idx) => {
                            const link = editingDetails[card.activityType]?.outputLinks?.[idx] || { desc: "", url: "" };
                            const hasContent = link.url.trim() !== "";
                            const adminCount = getAdminOutputLinksCount(card.activityType);
                            const isAdminLink = idx < adminCount;
                            const isDisabled = !isActivityActive(card.activityType) || isAdminLink;
                            return (
                              <div key={idx} className={`output-link-item ${hasContent ? "active" : ""} ${isAdminLink ? "admin-link" : ""}`}>
                                <div className="link-button">
                                  <span className="link-num">{idx + 1}</span>
                                  {isAdminLink && (
                                    <span className="admin-badge" title="운영진 입력">
                                      A
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  className="link-desc"
                                  placeholder={isDisabled ? "" : "링크 설명 (20자)"}
                                  maxLength={20}
                                  value={link.desc}
                                  disabled={isDisabled}
                                  style={isDisabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                                  onChange={(e) => {
                                    if (e.target.value.length > 20) {
                                      alert("최대 20자까지 입력할 수 있습니다.");
                                      return;
                                    }
                                    !isDisabled &&
                                      setEditingDetails((prev) => {
                                        const currentLinks = [...(prev[card.activityType]?.outputLinks || createEmptyOutputLinks())];
                                        currentLinks[idx] = { ...currentLinks[idx], desc: e.target.value };
                                        return {
                                          ...prev,
                                          [card.activityType]: {
                                            ...prev[card.activityType],
                                            outputLinks: currentLinks,
                                          },
                                        };
                                      });
                                  }}
                                />
                                <input
                                  type="url"
                                  className="link-url"
                                  placeholder={isDisabled ? "" : "URL"}
                                  value={link.url}
                                  disabled={isDisabled}
                                  style={isDisabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setEditingDetails((prev) => {
                                      const currentLinks = [...(prev[card.activityType]?.outputLinks || createEmptyOutputLinks())];
                                      currentLinks[idx] = { ...currentLinks[idx], url: e.target.value };
                                      return {
                                        ...prev,
                                        [card.activityType]: {
                                          ...prev[card.activityType],
                                          outputLinks: currentLinks,
                                        },
                                      };
                                    })
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                        {getAdminOutputLinksCount(card.activityType) > 0 && <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>* 'A' 표시된 링크는 운영진이 입력한 것으로 수정할 수 없습니다.</p>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkInfoModalOpen(false)}>
                취소
              </button>
              <button className="save-btn" onClick={saveAllActivityDetails} disabled={isSaving}>
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 역량 모달 ========== */}
      {workAbilityModalOpen && (
        <div className="section-modal-overlay">
          <div className="section-modal section-modal-work-edit">
            <div className="section-modal-header">
              <h3>실무 역량 편집</h3>
            </div>
            <div className="section-modal-body">
              {(() => {
                const abilityActivity = findFirstAbilityActivity();
                const abilityActivityTypeInfo = abilityActivity ? getActivityTypeInfo(abilityActivity.activity_type_id) : null;
                // 강화 실패 여부 체크: 활동이 개설되어 있어도 강화 실패면 2차 정보 작성 불가
                const abilityEnhancementStatus = abilityActivity ? getEnhancementStatus(abilityActivity.activity_type_id) : "not_applicable";
                const isAbilityFailed = abilityEnhancementStatus === "failed";
                // 편집 가능 여부: 활동이 개설되어 있고, 48시간 내이고, 강화 실패가 아닌 경우에만 가능
                const canEditAbility = isAnyAbilityActivityActive() && !isAbilityFailed;
                return (
                  <div className="modal-card-item modal-card-workinfo">
                    {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                    <div className="modal-card-header-row">
                      <div className="modal-card-left">
                        <div className="modal-fruit-icon fruit">
                          <img src={abilityActivity ? getCompetencyIconPath(abilityActivity.activity_type_id) : "/images/0/cluster4/icon/실무 역량/실무 역량 - default.png"} alt="실무 역량" />
                        </div>
                        <div className="modal-card-info">
                          <span className="modal-card-tag tag--cyan">{abilityActivityTypeInfo?.name || "-"}</span>
                        </div>
                        <div className="modal-code-badge">
                          <span>{abilityActivityTypeInfo?.line_code || "-"}</span>
                        </div>
                      </div>
                      <div className="modal-header-right">
                        {(() => {
                          const statusLabels: Record<string, string> = {
                            success: "강화성공",
                            waiting: "강화대기",
                            failed: "강화실패",
                            not_applicable: "해당없음",
                          };
                          const statusImages: Record<string, string> = {
                            success: "/images/0/cluster4/icon/5 강화 성공.png",
                            waiting: "/images/0/cluster4/icon/6 강화 대기.png",
                            failed: "/images/0/cluster4/icon/7 강화 실패.png",
                            not_applicable: "/images/0/cluster4/icon/8 해당 없음.png",
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
                        <div className="content-title">{abilityActivity?.title || "-"}</div>
                        <div className="modal-date-badge">
                          <span>{weekDateRange}</span>
                        </div>
                      </div>

                      {/* 미개설/강화실패/마감 안내 */}
                      {!canEditAbility && (
                        <div
                          style={{
                            padding: "16px",
                            backgroundColor: isAbilityFailed || isAnyAbilityActivityExpired() ? "#fee2e2" : "#fff3cd",
                            border: isAbilityFailed || isAnyAbilityActivityExpired() ? "1px solid #ef4444" : "1px solid #ffc107",
                            borderRadius: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          <p style={{ margin: 0, color: isAbilityFailed || isAnyAbilityActivityExpired() ? "#dc2626" : "#856404", fontSize: "14px" }}>
                            {isAbilityFailed ? "❌ 강화에 실패하여 2차 정보를 작성할 수 없습니다." : isAnyAbilityActivityExpired() ? "⏰ 2차 정보 작성 기간이 마감되었습니다. (개설 후 48시간 경과)" : "⚠️ 이 활동은 아직 개설되지 않았습니다. 운영진이 개설한 후 편집할 수 있습니다."}
                          </p>
                        </div>
                      )}

                      {/* Sub Title - 강화 성공/대기인 경우만 수정 가능 */}
                      <div className="modal-input-group">
                        <div className="section-label-row">
                          <div className="section-label">Sub Title</div>
                          <div className="char-counter">
                            <span>{editingDetails[getActiveAbilityActivityType()]?.subTitle?.length || 0}</span> / 150
                          </div>
                        </div>
                        <textarea
                          placeholder={canEditAbility ? "메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)" : ""}
                          rows={3}
                          maxLength={150}
                          value={editingDetails[getActiveAbilityActivityType()]?.subTitle || ""}
                          onChange={(e) => {
                            if (e.target.value.length > 150) {
                              alert("최대 150자까지 입력할 수 있습니다.");
                              return;
                            }
                            const actType = getActiveAbilityActivityType();
                            setEditingDetails((prev) => ({
                              ...prev,
                              [actType]: { ...prev[actType], subTitle: e.target.value },
                            }));
                          }}
                          disabled={!canEditAbility}
                          style={!canEditAbility ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
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
                              <div key={linkIndex} className={`output-link-item ${link.url.trim() ? "active" : ""} ${isAdminLink ? "admin-link" : ""}`}>
                                <div className="link-button">
                                  <span className="link-num">{linkIndex + 1}</span>
                                  {isAdminLink && (
                                    <span className="admin-badge" title="운영진 입력">
                                      A
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  className="link-desc"
                                  placeholder={isDisabled ? "" : "링크 설명을 입력하세요"}
                                  maxLength={20}
                                  value={link.desc}
                                  disabled={isDisabled}
                                  style={isDisabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                                  onChange={(e) => {
                                    if (e.target.value.length > 20) {
                                      alert("최대 20자까지 입력할 수 있습니다.");
                                      return;
                                    }
                                    !isDisabled &&
                                      setEditingDetails((prev) => {
                                        const newLinks = [...prev[actType].outputLinks];
                                        newLinks[linkIndex] = { ...newLinks[linkIndex], desc: e.target.value };
                                        return { ...prev, [actType]: { ...prev[actType], outputLinks: newLinks } };
                                      });
                                  }}
                                />
                                <input
                                  type="url"
                                  className="link-url"
                                  placeholder={isDisabled ? "" : "URL"}
                                  value={link.url}
                                  disabled={isDisabled}
                                  style={isDisabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setEditingDetails((prev) => {
                                      const newLinks = [...prev[actType].outputLinks];
                                      newLinks[linkIndex] = { ...newLinks[linkIndex], url: e.target.value };
                                      return { ...prev, [actType]: { ...prev[actType], outputLinks: newLinks } };
                                    })
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                        {getAdminOutputLinksCount(getActiveAbilityActivityType()) > 0 && <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>* 'A' 표시된 링크는 운영진이 입력한 것으로 수정할 수 없습니다.</p>}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkAbilityModalOpen(false)}>
                취소
              </button>
              {(() => {
                // 저장 버튼도 강화 실패 시 비활성화
                const abilityAct = findFirstAbilityActivity();
                const isAbilityFailed = abilityAct ? getEnhancementStatus(abilityAct.activity_type_id) === "failed" : false;
                const canSave = isAnyAbilityActivityActive() && !isAbilityFailed && !isSaving;
                return (
                  <button
                    className="save-btn"
                    onClick={async () => {
                      const actType = getActiveAbilityActivityType();
                      await saveActivityDetail(actType);
                      updateWeekActivityDetailsAfterSave([actType]);
                      alert("저장되었습니다.");
                      setWorkAbilityModalOpen(false);
                    }}
                    disabled={!canSave}
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경험 모달 ========== */}
      {workExpModalOpen && (
        <div className="section-modal-overlay">
          <div className="section-modal section-modal-work-edit">
            <div className="section-modal-header">
              <h3>실무 경험 편집</h3>
            </div>
            <div className="section-modal-body">
              {workExpCards
                .filter((card) => !card.isEmpty)
                .map((card, index) => (
                  <div key={card.id} className="modal-card-item modal-card-workinfo">
                    {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                    <div className="modal-card-header-row">
                      <div className="modal-card-left">
                        <div className="modal-fruit-icon fruit">{card.icon && <img src={card.icon} alt={card.badge} />}</div>
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
                            success: "강화성공",
                            waiting: "강화대기",
                            failed: "강화실패",
                            not_applicable: "해당없음",
                          };
                          const statusImages: Record<string, string> = {
                            success: "/images/0/cluster4/icon/5 강화 성공.png",
                            waiting: "/images/0/cluster4/icon/6 강화 대기.png",
                            failed: "/images/0/cluster4/icon/7 강화 실패.png",
                            not_applicable: "/images/0/cluster4/icon/8 해당 없음.png",
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
                              <img key={star} src={star <= card.rating ? "/images/0/cluster4/icon/icon - star.png" : "/images/0/cluster4/icon/icon - empty star.png"} alt="star" className="modal-star" />
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
                        const isFailed = getEnhancementStatus(activityType) === "failed";
                        return (
                          <>
                            {/* 미개설/강화실패/마감 안내 */}
                            {!isActive && (
                              <div
                                style={{
                                  padding: "16px",
                                  backgroundColor: isFailed || isExpired ? "#fee2e2" : "#fff3cd",
                                  border: isFailed || isExpired ? "1px solid #ef4444" : "1px solid #ffc107",
                                  borderRadius: "8px",
                                  marginBottom: "16px",
                                }}
                              >
                                <p style={{ margin: 0, color: isFailed || isExpired ? "#dc2626" : "#856404", fontSize: "14px" }}>
                                  {isFailed ? "❌ 강화에 실패하여 2차 정보를 작성할 수 없습니다." : isExpired ? "⏰ 2차 정보 작성 기간이 마감되었습니다. (개설 후 48시간 경과)" : "⚠️ 이 활동은 아직 개설되지 않았습니다. 운영진이 개설한 후 편집할 수 있습니다."}
                                </p>
                              </div>
                            )}

                            <div className="modal-input-group">
                              <div className="section-label-row">
                                <div className="section-label">Sub Title</div>
                                <div className="char-counter">
                                  <span>{editingDetails[activityType]?.subTitle?.length || 0}</span> / 150
                                </div>
                              </div>
                              <textarea
                                placeholder={isActive ? "메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)" : ""}
                                rows={3}
                                maxLength={150}
                                value={editingDetails[activityType]?.subTitle || ""}
                                onChange={(e) => {
                                  if (e.target.value.length > 150) {
                                    alert("최대 150자까지 입력할 수 있습니다.");
                                    return;
                                  }
                                  setEditingDetails((prev) => ({
                                    ...prev,
                                    [activityType]: { ...prev[activityType], subTitle: e.target.value },
                                  }));
                                }}
                                disabled={!isActive}
                                style={!isActive ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
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
                                    <div key={linkIndex} className={`output-link-item ${link.url.trim() ? "active" : ""} ${isAdminLink ? "admin-link" : ""}`}>
                                      <div className="link-button">
                                        <span className="link-num">{linkIndex + 1}</span>
                                        {isAdminLink && (
                                          <span className="admin-badge" title="운영진 입력">
                                            A
                                          </span>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        className="link-desc"
                                        placeholder={isDisabled ? "" : "링크 설명을 입력하세요"}
                                        maxLength={20}
                                        value={link.desc}
                                        disabled={isDisabled}
                                        style={isDisabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                                        onChange={(e) => {
                                          if (e.target.value.length > 20) {
                                            alert("최대 20자까지 입력할 수 있습니다.");
                                            return;
                                          }
                                          !isDisabled &&
                                            setEditingDetails((prev) => {
                                              const newLinks = [...prev[activityType].outputLinks];
                                              newLinks[linkIndex] = { ...newLinks[linkIndex], desc: e.target.value };
                                              return { ...prev, [activityType]: { ...prev[activityType], outputLinks: newLinks } };
                                            });
                                        }}
                                      />
                                      <input
                                        type="url"
                                        className="link-url"
                                        placeholder={isDisabled ? "" : "URL"}
                                        value={link.url}
                                        disabled={isDisabled}
                                        style={isDisabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                                        onChange={(e) =>
                                          !isDisabled &&
                                          setEditingDetails((prev) => {
                                            const newLinks = [...prev[activityType].outputLinks];
                                            newLinks[linkIndex] = { ...newLinks[linkIndex], url: e.target.value };
                                            return { ...prev, [activityType]: { ...prev[activityType], outputLinks: newLinks } };
                                          })
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                              {getAdminOutputLinksCount(activityType) > 0 && <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>* 'A' 표시된 링크는 운영진이 입력한 것으로 수정할 수 없습니다.</p>}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkExpModalOpen(false)}>
                취소
              </button>
              <button
                className="save-btn"
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    for (const activityType of workExpActivityTypes) {
                      await saveActivityDetail(activityType);
                    }
                    updateWeekActivityDetailsAfterSave(workExpActivityTypes);
                    alert("저장되었습니다.");
                    setWorkExpModalOpen(false);
                  } catch (error) {
                    console.error("Error saving work exp details:", error);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경력 모달 ========== */}
      {workCareerModalOpen && (
        <div className="section-modal-overlay">
          <div className="section-modal section-modal-work-edit">
            <div className="section-modal-header">
              <h3>실무 경력 편집</h3>
            </div>
            <div className="section-modal-body">
              {displayWorkCareerCards
                .filter((card) => !card.isEmpty)
                .map((card, index) => {
                  const statusText = card.verified ? "강화성공" : card.isFailed ? "강화실패" : "강화대기";
                  const statusClass = card.verified ? "success" : card.isFailed ? "failed" : "pending";
                  return (
                    <div key={card.id} className="modal-card-item modal-card-workinfo">
                      {/* 상단 헤더: 회사 로고 + 태그 + 강화 상태 뱃지 */}
                      <div className="modal-card-header-row">
                        <div className="modal-card-left">
                          <div className="modal-fruit-icon fruit">{card.icon && <img src={card.icon} alt={card.badge} />}</div>
                          <div className="modal-card-info">
                            <span className={`modal-card-tag ${card.grade === "S" ? "tag--yellow" : card.grade === "A" ? "tag--green" : card.grade === "B" ? "tag--cyan" : "tag--purple"}`}>{card.badge.replace("|", " - ")}</span>
                          </div>
                          <div className="modal-code-badge">
                            <span>{card.code}</span>
                          </div>
                        </div>
                        <div className="modal-header-right">
                          <div className="modal-status-badge">
                            {card.statusBadge && <img src={card.statusBadge} alt="상태" />}
                            <span className={`status-text ${statusClass}`}>{statusText}</span>
                          </div>
                        </div>
                      </div>

                      <div className="modal-card-content">
                        {/* 타이틀 + 내용 (읽기 전용) */}
                        <div className="modal-title-section">
                          <div className="main-title-row">
                            <div className="main-title">{card.title}</div>
                            {card.grade && (
                              <div className="modal-grade">
                                <span className={`grade ${card.grade === "S" ? "active" : ""}`}>S</span>
                                <span className={`grade ${card.grade === "A" ? "active" : ""}`}>A</span>
                                <span className={`grade ${card.grade === "B" ? "active" : ""}`}>B</span>
                                <span className={`grade ${card.grade === "C" ? "active" : ""}`}>C</span>
                                <span className={`grade ${card.grade === "D" ? "active" : ""}`}>D</span>
                              </div>
                            )}
                          </div>
                          {card.projectDescription && <div className="content-title">{card.projectDescription}</div>}
                          <div className="modal-date-badge">
                            <span>{weekDateRange}</span>
                          </div>
                        </div>

                        {/* 강화실패 / 마감 안내 */}
                        {(() => {
                          const isDeadlineActive = card.secondaryInfoDeadline && new Date(card.secondaryInfoDeadline) > new Date();
                          const isDeadlineExpired = card.secondaryInfoDeadline && new Date(card.secondaryInfoDeadline) <= new Date();
                          const activityType = workCareerActivityTypes[card.id - 1];
                          if (card.isFailed)
                            return (
                              <div style={{ padding: "16px", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "8px", marginBottom: "16px" }}>
                                <p style={{ margin: 0, color: "#dc2626", fontSize: "14px" }}>❌ 강화에 실패하여 2차 정보를 작성할 수 없습니다.</p>
                              </div>
                            );
                          if (isDeadlineExpired)
                            return (
                              <div style={{ padding: "16px", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "8px", marginBottom: "16px" }}>
                                <p style={{ margin: 0, color: "#dc2626", fontSize: "14px" }}>⏰ 2차 정보 작성 기간이 마감되었습니다. (마감: {new Date(card.secondaryInfoDeadline!).toLocaleString("ko-KR")})</p>
                              </div>
                            );
                          if (!card.secondaryInfoDeadline)
                            return (
                              <div style={{ padding: "16px", backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px", marginBottom: "16px" }}>
                                <p style={{ margin: 0, color: "#856404", fontSize: "14px" }}>⚠️ 2차 정보 작성 마감 기한이 설정되지 않았습니다.</p>
                              </div>
                            );
                          return null;
                        })()}

                        {/* Sub Title - 마감 기한 이내만 수정 가능 */}
                        {(() => {
                          const activityType = workCareerActivityTypes[card.id - 1];
                          const isEditable = !card.isFailed && card.secondaryInfoDeadline && new Date(card.secondaryInfoDeadline) > new Date();
                          return activityType ? (
                            <div className="modal-input-group">
                              <div className="section-label-row">
                                <div className="section-label">Sub Title</div>
                                <div className="char-counter">
                                  <span className={(editingDetails[activityType]?.subTitle || "").length > 0 ? "active" : ""}>{(editingDetails[activityType]?.subTitle || "").length}</span> / 150
                                </div>
                              </div>
                              <textarea
                                value={editingDetails[activityType]?.subTitle || ""}
                                onChange={(e) => {
                                  if (e.target.value.length > 150) {
                                    alert("최대 150자까지 입력할 수 있습니다.");
                                    return;
                                  }
                                  setEditingDetails((prev) => ({
                                    ...prev,
                                    [activityType]: {
                                      ...prev[activityType],
                                      subTitle: e.target.value,
                                    },
                                  }));
                                }}
                                placeholder={isEditable ? "메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)" : ""}
                                rows={3}
                                maxLength={150}
                                disabled={!isEditable}
                                style={!isEditable ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                              ></textarea>
                            </div>
                          ) : null;
                        })()}

                        {/* Output Link - 마감 기한 이내만 수정 가능 */}
                        {(() => {
                          const activityType = workCareerActivityTypes[card.id - 1];
                          const isEditable = !card.isFailed && card.secondaryInfoDeadline && new Date(card.secondaryInfoDeadline) > new Date();
                          const adminCount = activityType ? getAdminOutputLinksCount(activityType) : 0;
                          return activityType ? (
                            <div className="modal-input-group">
                              <div className="section-label">Output Link</div>
                              <div className="output-links-buttons">
                                {[0, 1, 2, 3, 4].map((idx) => {
                                  const link = editingDetails[activityType]?.outputLinks?.[idx] || { desc: "", url: "" };
                                  const hasContent = link.url.trim() !== "";
                                  const isAdminLink = idx < adminCount;
                                  const isDisabled = !isEditable || isAdminLink;
                                  return (
                                    <div key={idx} className={`output-link-item ${hasContent ? "active" : ""} ${isAdminLink ? "admin-link" : ""}`}>
                                      <div className="link-button">
                                        <span className="link-num">{idx + 1}</span>
                                        {isAdminLink && (
                                          <span className="admin-badge" title="운영진 입력">
                                            A
                                          </span>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        className="link-desc"
                                        placeholder={isDisabled ? "" : "링크 설명 (20자)"}
                                        maxLength={20}
                                        value={link.desc}
                                        disabled={isDisabled}
                                        style={isDisabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                                        onChange={(e) => {
                                          if (e.target.value.length > 20) {
                                            alert("최대 20자까지 입력할 수 있습니다.");
                                            return;
                                          }
                                          !isDisabled &&
                                            setEditingDetails((prev) => {
                                              const currentLinks = [...(prev[activityType]?.outputLinks || createEmptyOutputLinks())];
                                              currentLinks[idx] = { ...currentLinks[idx], desc: e.target.value };
                                              return {
                                                ...prev,
                                                [activityType]: {
                                                  ...prev[activityType],
                                                  outputLinks: currentLinks,
                                                },
                                              };
                                            });
                                        }}
                                      />
                                      <input
                                        type="url"
                                        className="link-url"
                                        placeholder={isDisabled ? "" : "URL"}
                                        value={link.url}
                                        disabled={isDisabled}
                                        style={isDisabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                                        onChange={(e) =>
                                          !isDisabled &&
                                          setEditingDetails((prev) => {
                                            const currentLinks = [...(prev[activityType]?.outputLinks || createEmptyOutputLinks())];
                                            currentLinks[idx] = { ...currentLinks[idx], url: e.target.value };
                                            return {
                                              ...prev,
                                              [activityType]: {
                                                ...prev[activityType],
                                                outputLinks: currentLinks,
                                              },
                                            };
                                          })
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkCareerModalOpen(false)}>
                취소
              </button>
              <button
                className="save-btn"
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    for (const activityType of workCareerActivityTypes) {
                      await saveActivityDetail(activityType);
                    }
                    updateWeekActivityDetailsAfterSave(workCareerActivityTypes);
                    alert("저장되었습니다.");
                    setWorkCareerModalOpen(false);
                  } catch (error) {
                    console.error("Error saving work career details:", error);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 상단 섹션 본인 편집 모달 (연계 동료 편집) ========== */}
      {headerModalOpen && headerModalType === "본인" && (
        <div className="section-modal-overlay">
          <div className="section-modal section-modal-colleague-edit">
            <div className="section-modal-header">
              <h3>연계 동료 편집</h3>
            </div>
            <div className="section-modal-body">
              <div className="modal-card-item modal-card-header-edit">
                {/* 안내 문구 */}
                <div className="header-edit-section colleague-guide">
                  <div className="guide-text">
                    <p>
                      이번 주차 동안 클럽에서 성장하며,
                      <br />
                      <span className="highlight">자신이 도움을 받았거나 기억에 남는 결과를 보여준 다른 크루를 선택해주세요.</span> <span className="guide-requirement">(최소 1명 필수)</span>
                    </p>
                  </div>
                </div>

                {/* 연계 동료 선택 */}
                <div className="header-edit-section">
                  <div className="header-edit-title">
                    연계 동료 선택 <span className="count-badge">{selectedColleagues.length} / 3</span>
                  </div>

                  {/* 선택된 동료 목록 */}
                  <div className="selected-colleagues">
                    {selectedColleagues.map((colleague, index) => (
                      <div key={colleague.id} className="selected-colleague-card">
                        <div className="colleague-header">
                          <div className="to-badge">
                            <span className="to-text">To.</span>
                            <span className="rank-number">
                              {colleague.rank}
                              {colleague.rank === 1 ? "st" : colleague.rank === 2 ? "nd" : "rd"}
                            </span>
                          </div>
                          <button className="remove-btn" title="삭제" onClick={() => removeColleague(colleague.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="colleague-profile-row">
                          <div className="colleague-avatar">{colleague.profileImg ? <img src={colleague.profileImg} alt={colleague.name} /> : <div className="profile-placeholder"></div>}</div>
                          <div className="colleague-info">
                            <div className="colleague-name">
                              {colleague.name} | {colleague.gender} | {mask.age(colleague.age)}세
                            </div>
                            <div className="colleague-details">
                              {truncate(colleague.team)} 팀 | {truncate(colleague.part)} 파트 | {truncate(colleague.nickname)}
                            </div>
                          </div>
                        </div>
                        <div className="colleague-message-section">
                          <label>
                            Thank you message <span className="char-limit">(최대 100자)</span>
                          </label>
                          <div className="message-input-wrapper">
                            <textarea
                              placeholder="이 크루에게 어떤 도움을 받았는지, 감사의 표현을 작성해주세요 :)"
                              maxLength={100}
                              rows={1}
                              value={colleague.message}
                              onChange={(e) => {
                                if (e.target.value.length > 100) {
                                  alert("최대 100자까지 입력할 수 있습니다.");
                                  return;
                                }
                                updateColleagueMessage(colleague.id, e.target.value);
                              }}
                            ></textarea>
                            <span className="char-counter">{colleague.message.length} / 100</span>
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
                        <input type="text" placeholder="크루 이름 또는 닉네임으로 검색..." value={crewSearchQuery} onChange={(e) => setCrewSearchQuery(e.target.value)} />
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
                      <div className="no-results">{selectedColleagues.length >= 3 ? "최대 3명까지만 선택 가능합니다." : "검색 결과가 없습니다."}</div>
                    ) : (
                      filteredCrewData.map((user) => (
                        <div key={user.id} className="crew-search-item">
                          <div className="crew-profile">
                            <div className="crew-avatar">{user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}</div>
                            <div className="crew-info">
                              <div className="crew-name">
                                {user.name} | {user.gender} | {mask.age(user.age)}세
                              </div>
                              <div className="crew-details">
                                {truncate(user.team)} 팀 | {truncate(user.part)} 파트 | {truncate(user.nickname)}
                              </div>
                            </div>
                          </div>
                          <div className="rank-select-buttons">
                            <button className={`rank-btn ${selectedColleagues.find((c) => c.rank === 1) ? "disabled" : ""}`} title="1순위로 선택" onClick={() => addColleague(user, 1)} disabled={!!selectedColleagues.find((c) => c.rank === 1) || selectedColleagues.length >= 3}>
                              1st
                            </button>
                            <button className={`rank-btn ${selectedColleagues.find((c) => c.rank === 2) ? "disabled" : ""}`} title="2순위로 선택" onClick={() => addColleague(user, 2)} disabled={!!selectedColleagues.find((c) => c.rank === 2) || selectedColleagues.length >= 3}>
                              2nd
                            </button>
                            <button className={`rank-btn ${selectedColleagues.find((c) => c.rank === 3) ? "disabled" : ""}`} title="3순위로 선택" onClick={() => addColleague(user, 3)} disabled={!!selectedColleagues.find((c) => c.rank === 3) || selectedColleagues.length >= 3}>
                              3rd
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setHeaderModalOpen(false);
                  setColleagueSaveError(null);
                  setColleagueSaveSuccess(false);
                }}
              >
                취소
              </button>
              <button className="save-btn" onClick={saveWeeklyColleagues} disabled={colleagueSaving || colleagueSaveSuccess}>
                {colleagueSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 상단 섹션 타크루 모달 (타크루가 나에 대해 평판을 남김) ========== */}
      {headerModalOpen && headerModalType === "타크루" && (
        <div className="section-modal-overlay">
          <div className="section-modal section-modal-reputation-form">
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
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FFA500" clipPath={`url(#halfClip${starIndex})`} />
                                </svg>
                              )}
                              {/* 전체 채움 */}
                              {isFull && (
                                <svg className="star-full-fill" viewBox="0 0 24 24" fill="#FFA500">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              )}
                              {/* 클릭 영역 */}
                              <button className="star-click-area star-click-left" type="button" onClick={() => setReputationEditData((prev) => ({ ...prev, rating: halfValue }))} />
                              <button className="star-click-area star-click-right" type="button" onClick={() => setReputationEditData((prev) => ({ ...prev, rating: fullValue }))} />
                            </div>
                          );
                        })}
                      </div>
                      <span className="rating-value">{reputationEditData.rating} / 10</span>
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="form-field">
                    <label>
                      내용 <span className="char-limit">(최대 100자)</span>
                    </label>
                    <div className="textarea-wrapper">
                      <textarea
                        placeholder="해당 크루에 대한 평가 내용을 작성해주세요..."
                        maxLength={100}
                        rows={3}
                        value={reputationEditData.content}
                        onChange={(e) => {
                          if (e.target.value.length > 100) {
                            alert("최대 100자까지 입력할 수 있습니다.");
                            return;
                          }
                          setReputationEditData((prev) => ({ ...prev, content: e.target.value }));
                        }}
                      ></textarea>
                      <span className="char-counter">{reputationEditData.content.length} / 100</span>
                    </div>
                  </div>

                  {/* 키워드 */}
                  <div className="form-field">
                    <label>
                      키워드 <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>(최대 7자)</span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "#FFA500", minWidth: "24px" }}>#</span>
                      <input
                        type="text"
                        placeholder="키워드를 입력하세요"
                        maxLength={7}
                        value={reputationEditData.keyword}
                        onChange={(e) => {
                          if (e.target.value.length > 7) {
                            alert("최대 7자까지 입력할 수 있습니다.");
                            return;
                          }
                          setReputationEditData((prev) => ({ ...prev, keyword: e.target.value }));
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "48px",
                          padding: "12px 14px",
                          background: "#1a1f2e",
                          border: "1px solid #FFA500",
                          borderRadius: "0",
                          color: "#fff",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setHeaderModalOpen(false);
                  setReputationSaveError(null);
                  setReputationSaveSuccess(false);
                }}
              >
                취소
              </button>
              <button className="save-btn" onClick={saveWeeklyReputation} disabled={reputationSaving || reputationSaveSuccess || reputationEditData.rating === 0 || reputationEditData.content.trim() === "" || reputationEditData.keyword === ""}>
                {reputationSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 주차 평판 카드 상세보기 모달 ========== */}
      {reputationViewModalOpen && selectedReputationCard && (
        <div className="section-modal-overlay">
          <div className="section-modal reputation-view-modal">
            <div className="section-modal-header">
              <h3>주차 평판</h3>
              <button className="modal-close-btn" onClick={() => setReputationViewModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="section-modal-body">
              {/* 프로필 */}
              <div className="reputation-view-profile">
                <div className="profile-image">{selectedReputationCard.profileImg ? <img src={selectedReputationCard.profileImg} alt={selectedReputationCard.name} /> : <div className="profile-placeholder"></div>}</div>
                <div className="profile-info">
                  <div className="profile-name">
                    <span className="text">{selectedReputationCard.name}</span> | <span className="text">{selectedReputationCard.gender}</span> | <span className="text">{mask.age(selectedReputationCard.age)}세</span>
                  </div>
                  <div className="profile-details">
                    <div className="detail-line">
                      <span className="text">{truncate(formatSchool(mask.school(selectedReputationCard.university)))}</span>
                      <span className="label">학교</span> | <span className="text">{truncate(formatMajor(mask.major(selectedReputationCard.major)))}</span>
                      <span className="label">학과</span>
                    </div>
                    <div className="detail-line">
                      <span className="text">{truncate(selectedReputationCard.team)}</span>
                      <span className="label">팀</span> | <span className="text">{truncate(selectedReputationCard.part)}</span>
                      <span className="label">파트</span>
                    </div>
                    <div className="detail-line">
                      <span className="nickname">{truncate(selectedReputationCard.nickname)}</span>
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
        <div className="section-modal-overlay">
          <div className="section-modal colleague-view-modal">
            <div className="section-modal-header">
              <h3>연계 동료</h3>
              <button className="modal-close-btn" onClick={() => setColleagueViewModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="section-modal-body">
              {/* To. 뱃지 + 날짜 */}
              <div className="colleague-header-row">
                <div className="colleague-to-badge">
                  <span className="to-text">To.</span>
                  <span className="rank-number">
                    {selectedColleagueIndex + 1}
                    {selectedColleagueIndex === 0 ? "st" : selectedColleagueIndex === 1 ? "nd" : "rd"}
                  </span>
                </div>
                <div className="colleague-view-date">
                  <span className="date-value">{selectedColleagueCard.date}</span>
                </div>
              </div>

              {/* 프로필 */}
              <div className="colleague-view-profile">
                <div className="profile-image">{selectedColleagueCard.profileImg ? <img src={selectedColleagueCard.profileImg} alt={selectedColleagueCard.name} /> : <div className="profile-placeholder"></div>}</div>
                <div className="profile-info">
                  <div className="profile-name">
                    <span className="text">{selectedColleagueCard.name}</span> | <span className="text">{selectedColleagueCard.gender}</span> | <span className="text">{mask.age(selectedColleagueCard.age)}세</span>
                  </div>
                  <div className="profile-details">
                    <div className="detail-line">
                      <span className="text">{formatSchool(mask.school(selectedColleagueCard.university))}</span>
                      <span className="label">학교</span> | <span className="text">{formatMajor(mask.major(selectedColleagueCard.major))}</span>
                      <span className="label">학과</span> | <span className="text">{selectedColleagueCard.team || "-"}</span>
                      <span className="label">팀</span> | <span className="text">{selectedColleagueCard.part || "-"}</span>
                      <span className="label">파트</span> | <span className="nickname">{selectedColleagueCard.nickname}</span>
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
        <div className="section-modal-overlay">
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 정보</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setWorkInfoViewModalOpen(false);
                  setWorkInfoViewIsEditing(false);
                }}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section-modal-body">
              <div className="work-view-fixed">
                <div className="date-badge">{weekDateRange}</div>
                {/* 헤더: 아이콘 + 카테고리 제목 + 강화 상태 */}
                <div className="work-view-header-row">
                  <div className="work-view-left">
                    <div className={`work-icon-box ${selectedWorkInfoCard.isFruit ? "fruit" : ""}`}>{selectedWorkInfoCard.icon && <img src={selectedWorkInfoCard.icon} alt={selectedWorkInfoCard.category} />}</div>
                    <span className="category-title">{selectedWorkInfoCard.category}</span>
                  </div>
                  <div className="work-view-right">
                    {selectedWorkInfoCard.status === "success" && (
                      <div className="status-badge success">
                        <img src="/images/0/cluster4/icon/5 강화 성공.png" alt="강화성공" />
                        <span>강화성공</span>
                      </div>
                    )}
                    {selectedWorkInfoCard.status === "waiting" && (
                      <div className="status-badge waiting">
                        <img src="/images/0/cluster4/icon/6 강화 대기.png" alt="강화대기" />
                        <span>강화대기</span>
                      </div>
                    )}
                    {selectedWorkInfoCard.status === "failed" && (
                      <div className="status-badge fail">
                        <img src="/images/0/cluster4/icon/7 강화 실패.png" alt="강화실패" />
                        <span>강화실패</span>
                      </div>
                    )}
                    {selectedWorkInfoCard.status === "not_applicable" && (
                      <div className="status-badge not-applicable">
                        <img src="/images/0/cluster4/icon/8 해당 없음.png" alt="해당없음" />
                        <span>해당없음</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Title + Content */}
                <div className="work-view-title-section">
                  <div className="main-title">Main Title</div>
                  <div className={`content-text ${workInfoViewIsEditing && isAdmin ? "editing" : ""}`} contentEditable={workInfoViewIsEditing && isAdmin} suppressContentEditableWarning>
                    {selectedWorkInfoCard.title}
                  </div>
                </div>

                {/* Sub Title */}
                <div className="work-view-section">
                  <div className="section-label">Sub Title</div>
                  <div className={`section-content ${workInfoViewIsEditing ? "editing" : ""}`} contentEditable={workInfoViewIsEditing} suppressContentEditableWarning>
                    {selectedWorkInfoCard.subTitle || "-"}
                  </div>
                </div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const link = selectedWorkInfoCard.outputLinks?.[idx];
                    const hasLink = link?.url && link.url.trim() !== "";
                    const prevLink = idx > 0 ? selectedWorkInfoCard.outputLinks?.[idx - 1] : null;
                    const prevHasLink = idx === 0 || (prevLink?.url && prevLink.url.trim() !== "");
                    const isDisabled = !prevHasLink;
                    return workInfoViewIsEditing ? (
                      <div key={idx} className={`output-link-item editing ${isDisabled ? "disabled-link" : ""}`} style={{ opacity: isDisabled ? 0.4 : 1 }}>
                        <span className="link-num">{idx + 1}</span>
                        <span className="link-desc editing" contentEditable={!isDisabled} suppressContentEditableWarning>
                          {hasLink ? link.desc || "링크" : "-"}
                        </span>
                        <input
                          className="link-url-edit"
                          defaultValue={hasLink ? link.url : ""}
                          placeholder={isDisabled ? "이전 링크를 먼저 입력하세요" : "URL 입력"}
                          disabled={isDisabled}
                          style={{
                            border: "1px solid rgba(255,165,0,0.5)",
                            background: isDisabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            color: "inherit",
                            fontSize: "inherit",
                            outline: "none",
                            width: "100%",
                            marginTop: "4px",
                            cursor: isDisabled ? "not-allowed" : "text",
                          }}
                        />
                      </div>
                    ) : (
                      <a key={idx} href={hasLink ? ensureProtocol(link.url) : undefined} target={hasLink ? "_blank" : undefined} rel={hasLink ? "noopener noreferrer" : undefined} className={`output-link-item ${!hasLink ? "disabled" : ""}`} onClick={(e) => !hasLink && e.preventDefault()}>
                        <span className="link-num">{idx + 1}</span>
                        <span className="link-desc">{hasLink ? link.desc || "링크" : "-"}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              {!workInfoViewIsEditing ? (
                <button className="save-btn" onClick={() => setWorkInfoViewIsEditing(true)}>
                  수정
                </button>
              ) : (
                <>
                  <button className="cancel-btn" onClick={() => setWorkInfoViewIsEditing(false)}>
                    취소
                  </button>
                  <button
                    className="save-btn"
                    onClick={() => {
                      const modal = document.querySelector(".section-modal-overlay:last-of-type");
                      if (modal && selectedWorkInfoCard?.activityType) {
                        const subTitleEl = modal.querySelector(".work-view-fixed .section-content[contenteditable]");
                        const newSubTitle = subTitleEl?.textContent?.trim() || null;
                        setWeekActivityDetails((prev) => prev.map((d) => (d.activity_type_id === selectedWorkInfoCard.activityType ? { ...d, sub_title: newSubTitle } : d)));
                        setSelectedWorkInfoCard((prev: any) => (prev ? { ...prev, subTitle: newSubTitle || "" } : prev));
                      }
                      setWorkInfoViewIsEditing(false);
                    }}
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경험 카드 상세보기 모달 ========== */}
      {workExpViewModalOpen && selectedWorkExpCard && (
        <div className="section-modal-overlay">
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 경험</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setWorkExpViewModalOpen(false);
                  setWorkExpViewIsEditing(false);
                }}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section-modal-body">
              <div className="work-view-fixed">
                <div className="date-badge">{weekDateRange}</div>
                {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
                <div className="work-view-header-row">
                  <div className="work-view-left">
                    <div className="work-icon-box fruit">{selectedWorkExpCard.icon && <img src={selectedWorkExpCard.icon} alt={selectedWorkExpCard.badge} />}</div>
                    <span className="category-title">{selectedWorkExpCard.badge}</span>
                    <span className="code-badge">{selectedWorkExpCard.code}</span>
                  </div>
                  <div className="work-view-right">
                    {(() => {
                      const enhStatus = selectedWorkExpCard.enhancementStatus;
                      const statusLabels: Record<string, string> = {
                        success: "강화성공",
                        waiting: "강화대기",
                        failed: "강화실패",
                        not_applicable: "해당없음",
                      };
                      const statusImages: Record<string, string> = {
                        success: "/images/0/cluster4/icon/5 강화 성공.png",
                        waiting: "/images/0/cluster4/icon/6 강화 대기.png",
                        failed: "/images/0/cluster4/icon/7 강화 실패.png",
                        not_applicable: "/images/0/cluster4/icon/8 해당 없음.png",
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
                  <div className={`content-text ${workExpViewIsEditing && isAdmin ? "editing" : ""}`} contentEditable={workExpViewIsEditing && isAdmin} suppressContentEditableWarning>
                    {selectedWorkExpCard.title}
                  </div>
                </div>

                {/* Sub Title */}
                <div className="work-view-section">
                  <div className="section-label">Sub Title</div>
                  <div className={`section-content ${workExpViewIsEditing ? "editing" : ""}`} contentEditable={workExpViewIsEditing} suppressContentEditableWarning>
                    {weekActivityDetails.find((d) => d.activity_type_id === selectedWorkExpCard.activityTypeId)?.sub_title || "-"}
                  </div>
                </div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {(() => {
                    const activityType = selectedWorkExpCard.activityTypeId;
                    const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);
                    const detail = weekActivityDetails.find((d) => d.activity_type_id === activityType);
                    const adminLinks = activity?.output_links || [];
                    const userLinks = detail?.output_links || [];
                    return [0, 1, 2, 3, 4].map((idx) => {
                      const link = adminLinks[idx]?.url ? adminLinks[idx] : userLinks[idx];
                      const hasLink = link?.url && link.url.trim() !== "";
                      const prevLink = idx > 0 ? (adminLinks[idx - 1]?.url ? adminLinks[idx - 1] : userLinks[idx - 1]) : null;
                      const prevHasLink = idx === 0 || (prevLink?.url && prevLink.url.trim() !== "");
                      const isDisabled = !prevHasLink;
                      return workExpViewIsEditing ? (
                        <div key={idx} className={`output-link-item editing ${isDisabled ? "disabled-link" : ""}`} style={{ opacity: isDisabled ? 0.4 : 1 }}>
                          <span className="link-num">{idx + 1}</span>
                          <span className="link-desc editing" contentEditable={!isDisabled} suppressContentEditableWarning>
                            {hasLink ? link.desc || "링크" : "-"}
                          </span>
                          <input
                            className="link-url-edit"
                            defaultValue={hasLink ? link.url : ""}
                            placeholder={isDisabled ? "이전 링크를 먼저 입력하세요" : "URL 입력"}
                            disabled={isDisabled}
                            style={{
                              border: "1px solid rgba(255,165,0,0.5)",
                              background: isDisabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              color: "inherit",
                              fontSize: "inherit",
                              outline: "none",
                              width: "100%",
                              marginTop: "4px",
                              cursor: isDisabled ? "not-allowed" : "text",
                            }}
                          />
                        </div>
                      ) : (
                        <a key={idx} href={hasLink ? ensureProtocol(link.url) : undefined} target={hasLink ? "_blank" : undefined} rel={hasLink ? "noopener noreferrer" : undefined} className={`output-link-item ${!hasLink ? "disabled" : ""}`} onClick={(e) => !hasLink && e.preventDefault()}>
                          <span className="link-num">{idx + 1}</span>
                          <span className="link-desc">{hasLink ? link.desc || "링크" : "-"}</span>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              {!workExpViewIsEditing ? (
                <button className="save-btn" onClick={() => setWorkExpViewIsEditing(true)}>
                  수정
                </button>
              ) : (
                <>
                  <button className="cancel-btn" onClick={() => setWorkExpViewIsEditing(false)}>
                    취소
                  </button>
                  <button
                    className="save-btn"
                    onClick={() => {
                      const modal = document.querySelector(".section-modal-overlay:last-of-type");
                      if (modal && selectedWorkExpCard?.activityTypeId) {
                        const subTitleEl = modal.querySelector(".work-view-fixed .section-content[contenteditable]");
                        const newSubTitle = subTitleEl?.textContent?.trim() || null;
                        setWeekActivityDetails((prev) => prev.map((d) => (d.activity_type_id === selectedWorkExpCard.activityTypeId ? { ...d, sub_title: newSubTitle } : d)));
                      }
                      setWorkExpViewIsEditing(false);
                    }}
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 역량 카드 상세보기 모달 ========== */}
      {workAbilityViewModalOpen &&
        (() => {
          const completedActivity = findFirstCompletedAbilityActivity();
          const openedActivity = findFirstAbilityActivity();
          const displayActivity = completedActivity || openedActivity;
          const activityTypeInfo = displayActivity ? getActivityTypeInfo(displayActivity.activity_type_id) : null;
          const enhancementStatus = displayActivity ? getEnhancementStatus(displayActivity.activity_type_id) : "not_applicable";

          const statusLabels: Record<string, string> = {
            success: "강화성공",
            waiting: "강화대기",
            failed: "강화실패",
            not_applicable: "해당없음",
          };
          const statusImages: Record<string, string> = {
            success: "/images/0/cluster4/icon/5 강화 성공.png",
            waiting: "/images/0/cluster4/icon/6 강화 대기.png",
            failed: "/images/0/cluster4/icon/7 강화 실패.png",
            not_applicable: "/images/0/cluster4/icon/8 해당 없음.png",
          };

          return (
            <div className="section-modal-overlay">
              <div className="section-modal work-view-modal">
                <div className="section-modal-header">
                  <h3>실무 역량</h3>
                  <button
                    className="modal-close-btn"
                    onClick={() => {
                      setWorkAbilityViewModalOpen(false);
                      setWorkAbilityViewIsEditing(false);
                    }}
                  >
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <div className="section-modal-body">
                  <div className="work-view-fixed">
                    <div className="date-badge">{weekDateRange}</div>
                    {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
                    <div className="work-view-header-row">
                      <div className="work-view-left">
                        <div className="work-icon-box fruit">
                          <img src={displayActivity ? getCompetencyIconPath(displayActivity.activity_type_id) : "/images/0/cluster4/icon/실무 역량/실무 역량 - default.png"} alt="실무 역량" />
                        </div>
                        <span className="category-title">{activityTypeInfo?.name || "-"}</span>
                        <span className="code-badge">{activityTypeInfo?.line_code || "-"}</span>
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
                      <div className={`content-text ${workAbilityViewIsEditing && isAdmin ? "editing" : ""}`} contentEditable={workAbilityViewIsEditing && isAdmin} suppressContentEditableWarning>
                        {displayActivity?.title || "-"}
                      </div>
                    </div>

                    {/* Sub Title */}
                    <div className="work-view-section">
                      <div className="section-label">Sub Title</div>
                      <div className={`section-content ${workAbilityViewIsEditing ? "editing" : ""}`} contentEditable={workAbilityViewIsEditing} suppressContentEditableWarning>
                        {weekActivityDetails.find((d) => d.activity_type_id === displayActivity?.activity_type_id)?.sub_title || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Output Link */}
                  <div className="work-view-section">
                    <div className="section-label">Output Link</div>
                    <div className="output-links-view">
                      {(() => {
                        const activityType = displayActivity?.activity_type_id || "";
                        const activity = weeklyActivities.find((a) => a.activity_type_id === activityType);
                        const detail = weekActivityDetails.find((d) => d.activity_type_id === activityType);
                        const adminLinks = activity?.output_links || [];
                        const userLinks = detail?.output_links || [];
                        return [0, 1, 2, 3, 4].map((idx) => {
                          const link = adminLinks[idx]?.url ? adminLinks[idx] : userLinks[idx];
                          const hasLink = link?.url && link.url.trim() !== "";
                          const prevLink = idx > 0 ? (adminLinks[idx - 1]?.url ? adminLinks[idx - 1] : userLinks[idx - 1]) : null;
                          const prevHasLink = idx === 0 || (prevLink?.url && prevLink.url.trim() !== "");
                          const isDisabled = !prevHasLink;
                          return workAbilityViewIsEditing ? (
                            <div key={idx} className={`output-link-item editing ${isDisabled ? "disabled-link" : ""}`} style={{ opacity: isDisabled ? 0.4 : 1 }}>
                              <span className="link-num">{idx + 1}</span>
                              <span className="link-desc editing" contentEditable={!isDisabled} suppressContentEditableWarning>
                                {hasLink ? link.desc || "링크" : "-"}
                              </span>
                              <input
                                className="link-url-edit"
                                defaultValue={hasLink ? link.url : ""}
                                placeholder={isDisabled ? "이전 링크를 먼저 입력하세요" : "URL 입력"}
                                disabled={isDisabled}
                                style={{
                                  border: "1px solid rgba(255,165,0,0.5)",
                                  background: isDisabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  color: "inherit",
                                  fontSize: "inherit",
                                  outline: "none",
                                  width: "100%",
                                  marginTop: "4px",
                                  cursor: isDisabled ? "not-allowed" : "text",
                                }}
                              />
                            </div>
                          ) : (
                            <a key={idx} href={hasLink ? ensureProtocol(link.url) : undefined} target={hasLink ? "_blank" : undefined} rel={hasLink ? "noopener noreferrer" : undefined} className={`output-link-item ${!hasLink ? "disabled" : ""}`} onClick={(e) => !hasLink && e.preventDefault()}>
                              <span className="link-num">{idx + 1}</span>
                              <span className="link-desc">{hasLink ? link.desc || "링크" : "-"}</span>
                            </a>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
                <div className="section-modal-footer">
                  {!workAbilityViewIsEditing ? (
                    <button className="save-btn" onClick={() => setWorkAbilityViewIsEditing(true)}>
                      수정
                    </button>
                  ) : (
                    <>
                      <button className="cancel-btn" onClick={() => setWorkAbilityViewIsEditing(false)}>
                        취소
                      </button>
                      <button
                        className="save-btn"
                        onClick={() => {
                          const modal = document.querySelector(".section-modal-overlay:last-of-type");
                          if (modal && displayActivity?.activity_type_id) {
                            const subTitleEl = modal.querySelector(".work-view-fixed .section-content[contenteditable]");
                            const newSubTitle = subTitleEl?.textContent?.trim() || null;
                            setWeekActivityDetails((prev) => prev.map((d) => (d.activity_type_id === displayActivity.activity_type_id ? { ...d, sub_title: newSubTitle } : d)));
                          }
                          setWorkAbilityViewIsEditing(false);
                        }}
                      >
                        저장
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* ========== 실무 경력 카드 상세보기 모달 ========== */}
      {workCareerViewModalOpen && selectedWorkCareerCard && (
        <div className="section-modal-overlay">
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 경력</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setWorkCareerViewModalOpen(false);
                  setWorkCareerViewIsEditing(false);
                }}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section-modal-body">
              <div className="work-view-fixed">
                <div className="date-badge">{weekDateRange}</div>
                {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
                <div className="work-view-header-row">
                  <div className="work-view-left">
                    <div className="work-icon-box fruit">{selectedWorkCareerCard.icon && <img src={selectedWorkCareerCard.icon} alt={selectedWorkCareerCard.badge} />}</div>
                    <span className="category-title">{selectedWorkCareerCard.badge}</span>
                    <span className="code-badge">{selectedWorkCareerCard.code}</span>
                  </div>
                  <div className="work-view-right">
                    {selectedWorkCareerCard.statusBadge &&
                      (() => {
                        const statusText = selectedWorkCareerCard.verified ? "강화성공" : selectedWorkCareerCard.isFailed ? "강화실패" : selectedWorkCareerCard.isNotApplicable ? "해당없음" : "강화대기";
                        const statusClass = selectedWorkCareerCard.verified ? "success" : selectedWorkCareerCard.isFailed ? "failed" : selectedWorkCareerCard.isNotApplicable ? "not-applicable" : "pending";
                        return (
                          <div className={`status-badge ${statusClass}`}>
                            <img src={selectedWorkCareerCard.statusBadge} alt="상태" />
                            <span>{statusText}</span>
                          </div>
                        );
                      })()}
                  </div>
                </div>

                {/* Main Title + 등급 + Content */}
                <div className="work-view-title-section">
                  <div className="main-title-row">
                    <div className="main-title">Main Title</div>
                    <div className="grade-row">
                      <span className={`grade ${selectedWorkCareerCard.grade === "S" ? "active" : ""}`}>S</span>
                      <span className={`grade ${selectedWorkCareerCard.grade === "A" ? "active" : ""}`}>A</span>
                      <span className={`grade ${selectedWorkCareerCard.grade === "B" ? "active" : ""}`}>B</span>
                      <span className={`grade ${selectedWorkCareerCard.grade === "C" ? "active" : ""}`}>C</span>
                      <span className={`grade ${selectedWorkCareerCard.grade === "D" ? "active" : ""}`}>D</span>
                    </div>
                  </div>
                  <div className={`content-text ${workCareerViewIsEditing && isAdmin ? "editing" : ""}`} contentEditable={workCareerViewIsEditing && isAdmin} suppressContentEditableWarning>
                    {selectedWorkCareerCard.title}
                  </div>
                </div>

                {/* Sub Title */}
                <div className="work-view-section">
                  <div className="section-label">Sub Title</div>
                  <div className={`section-content ${workCareerViewIsEditing ? "editing" : ""}`} contentEditable={workCareerViewIsEditing} suppressContentEditableWarning>
                    {(() => {
                      const activityType = workCareerActivityTypes[selectedWorkCareerCard.id - 1];
                      return weekActivityDetails.find((d) => d.activity_type_id === activityType)?.sub_title || "-";
                    })()}
                  </div>
                </div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {(() => {
                    const activityType = workCareerActivityTypes[selectedWorkCareerCard.id - 1];
                    const careerRecord = careerRecords[selectedWorkCareerCard.id - 1];
                    const detail = weekActivityDetails.find((d) => d.activity_type_id === activityType);
                    const adminLinks = (careerRecord?.output_links || []) as { desc: string; url: string }[];
                    const userLinks = detail?.output_links || [];
                    const adminCount = adminLinks.filter((l) => l.url?.trim()).length;
                    return [0, 1, 2, 3, 4].map((idx) => {
                      const link = idx < adminCount ? adminLinks[idx] : userLinks[idx - adminCount];
                      const hasLink = link?.url && link.url.trim() !== "";
                      const prevLink = idx > 0 ? (idx - 1 < adminCount ? adminLinks[idx - 1] : userLinks[idx - 1 - adminCount]) : null;
                      const prevHasLink = idx === 0 || (prevLink?.url && prevLink.url.trim() !== "");
                      const isDisabled = !prevHasLink;
                      return workCareerViewIsEditing ? (
                        <div key={idx} className={`output-link-item editing ${isDisabled ? "disabled-link" : ""}`} style={{ opacity: isDisabled ? 0.4 : 1 }}>
                          <span className="link-num">{idx + 1}</span>
                          <span className="link-desc editing" contentEditable={!isDisabled} suppressContentEditableWarning>
                            {hasLink ? link.desc || "링크" : "-"}
                          </span>
                          <input
                            className="link-url-edit"
                            defaultValue={hasLink ? link.url : ""}
                            placeholder={isDisabled ? "이전 링크를 먼저 입력하세요" : "URL 입력"}
                            disabled={isDisabled}
                            style={{
                              border: "1px solid rgba(255,165,0,0.5)",
                              background: isDisabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              color: "inherit",
                              fontSize: "inherit",
                              outline: "none",
                              width: "100%",
                              marginTop: "4px",
                              cursor: isDisabled ? "not-allowed" : "text",
                            }}
                          />
                        </div>
                      ) : (
                        <a key={idx} href={hasLink ? ensureProtocol(link.url) : undefined} target={hasLink ? "_blank" : undefined} rel={hasLink ? "noopener noreferrer" : undefined} className={`output-link-item ${!hasLink ? "disabled" : ""}`} onClick={(e) => !hasLink && e.preventDefault()}>
                          <span className="link-num">{idx + 1}</span>
                          <span className="link-desc">{hasLink ? link.desc || "링크" : "-"}</span>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              {!workCareerViewIsEditing ? (
                <button className="save-btn" onClick={() => setWorkCareerViewIsEditing(true)}>
                  수정
                </button>
              ) : (
                <>
                  <button className="cancel-btn" onClick={() => setWorkCareerViewIsEditing(false)}>
                    취소
                  </button>
                  <button
                    className="save-btn"
                    onClick={() => {
                      const modal = document.querySelector(".section-modal-overlay:last-of-type");
                      const activityType = workCareerActivityTypes[selectedWorkCareerCard.id - 1];
                      if (modal && activityType) {
                        const subTitleEl = modal.querySelector(".work-view-fixed .section-content[contenteditable]");
                        const newSubTitle = subTitleEl?.textContent?.trim() || null;
                        setWeekActivityDetails((prev) => prev.map((d) => (d.activity_type_id === activityType ? { ...d, sub_title: newSubTitle } : d)));
                      }
                      setWorkCareerViewIsEditing(false);
                    }}
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cluster4CardContent;
