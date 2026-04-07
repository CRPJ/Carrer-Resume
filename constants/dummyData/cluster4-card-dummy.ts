// constants/dummyData/cluster4-card-dummy.ts
// TODO: 더미 데이터 — 기획자 확인용, 실서버 노출 안 됨
// Phase 1: dw-01 주차만 외부 파일로 이관. 나머지 주차는 Cluster4CardContent.tsx의
// 기존 useState 초기값 + getDemoCareerRecords/getDemoActivityRecords로 fallback.

// ─────────────────────────────────────────────────────────────
// 타입 정의 (Cluster4CardContent.tsx의 로컬 interface와 구조적 호환)
// ─────────────────────────────────────────────────────────────

export interface OutputLink {
  desc: string;
  url: string;
}

export interface WeeklyActivity {
  id: string;
  activity_type_id: string;
  title: string | null;
  is_active: boolean;
  opened_at: string | null;
  output_links: OutputLink[] | null;
}

export interface ActivityDetail {
  week_id: string;
  activity_type_id: string;
  sub_title: string | null;
  output_links: OutputLink[] | null;
}

export interface ActivityRecord {
  week_id: string;
  activity_type_id: string;
  is_completed: boolean;
}

export interface CareerRecord {
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

// 주차별 카드 더미 데이터 컨테이너
export interface WeekCardDummyData {
  weeklyActivities: WeeklyActivity[];
  weekActivityDetails: ActivityDetail[];
  weekActivityRecords: ActivityRecord[];
  careerRecords: CareerRecord[];
}

// ─────────────────────────────────────────────────────────────
// 주차별 더미 데이터 (Phase 1: dw-01만 이관)
// ─────────────────────────────────────────────────────────────

export const DUMMY_WEEK_CARD: Record<string, WeekCardDummyData> = {
  "dw-01": {
    // ── weeklyActivities: 실무 정보/역량/경험 활동별 title (main-desc 원본) ──
    weeklyActivities: [
      { id: "wa-1", activity_type_id: "wisdom", title: "동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화 삼천리 화려강산 대한사람 대한으로 길이 보전하세", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-2", activity_type_id: "essay", title: "우주는 무한하다고 하는데 사실 끝이 없는 공간이라는 개념이 잘 이해가 가지 않습니", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-3", activity_type_id: "infodesk", title: "MZ세대 타겟 SNS 마케팅 채널별 성과 지표 비교 분석 및 최적 채널 믹스 전략 도출 과제", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-4", activity_type_id: "calendar", title: "일이삼사오육칠팔구십 일이삼사오육칠팔구십 일이삼사오육칠팔구십", is_active: true, opened_at: "2099-01-01T00:00:00Z", output_links: [] },
      { id: "wa-5", activity_type_id: "forum", title: "짧은 글", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-6", activity_type_id: "session", title: "데이터 기반 의사결정을 위한 마케팅 분석 프레임워크 세션", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-7", activity_type_id: "practical_lecture", title: "우주는 얼마나 클까?", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      {
        id: "wa-8",
        activity_type_id: "comp-1",
        title: "시간이 지나면 더 멀리 있는 우주에서 출발한 빛도 우리에게 올 수 있겠죠. 그래서 관측 가능한 우주는 앞으로 100억 년이 더 흐르면 당연히 더 커지겠죠. 지금은 관측 가능한 우주가 460억 광년 정도의 반지름을 갖습니다. 다시 말하면 현재 460억 광년 거리에 있는 우주는 관측이 가능합니다.",
        is_active: true,
        opened_at: "2025-01-01T00:00:00Z",
        output_links: [],
      },
      { id: "wa-comp-2", activity_type_id: "comp-2", title: "역량 진단", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-comp-3", activity_type_id: "comp-3", title: "마케터 역량 진단 테스트 결과", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-comp-4", activity_type_id: "comp-4", title: "짧은 길이", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-9", activity_type_id: "exp-1", title: "안타깝게도 아직 우주의 끝을 확인할 수 있는 기술은 존재하지 않습니다. 하지만 현재까지의 연구결과를 보면 우주는 무한할 것 같습니다. 지구라는 한정된 공간에서 평생을 살아가는", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-10", activity_type_id: "exp-2", title: "동료 크루 3인의 마케팅 포트폴리오를 상호 피드백하며 각자의 강점과 개선점을 발견하는 실습", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-11", activity_type_id: "exp-3", title: "짧은 길이", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-12", activity_type_id: "exp-4", title: "퍼포먼스 마케팅 캠페인 ROAS 분석 및 예산 재배분 최적화 전략 수립", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    ],

    // ── weekActivityDetails: 실무 역량/경험 활동별 sub_title (sub-desc 원본) ──
    weekActivityDetails: [
      {
        week_id: "dw-01",
        activity_type_id: "comp-1",
        sub_title:
          "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아일이삼사오",
        output_links: [],
      },
      { week_id: "dw-01", activity_type_id: "comp-2", sub_title: "진단 결과", output_links: [] },
      { week_id: "dw-01", activity_type_id: "comp-3", sub_title: "지구상에서는 한 방향으로 계속해서 가다 보면 모든 공간의 끝이 나오는 게 당연하니까요. 우주 공간에는 인간의 단위로는 측량하기 힘들 정도로 많은 물질이 있고 우주 공간 자체는 빛보다 빠른 속도로 지금도 팽창", output_links: [] },
      { week_id: "dw-01", activity_type_id: "comp-4", sub_title: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하", output_links: [] },
      { week_id: "dw-01", activity_type_id: "exp-1", sub_title: "지구상에서는 한 방향으로 계속해서 가다 보면 모든 공간의 끝이 나오는 게 당연하니까요. 우주 공간에는 인간의 단위로는 측량하기 힘들 정도로 많은 물질이 있고 우주 공간 자체는 빛보다 빠른 속도로 지금도 팽창", output_links: [] },
      { week_id: "dw-01", activity_type_id: "exp-2", sub_title: "동료 피드백을 통해 발견한 강점 3가지와 보완이 필요한 영역 2가지를 정리한 액션 플랜", output_links: [] },
      {
        week_id: "dw-01",
        activity_type_id: "exp-3",
        sub_title:
          "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아일이삼사오",
        output_links: [],
      },
      { week_id: "dw-01", activity_type_id: "exp-4", sub_title: "구글 애즈와 메타 광고 플랫폼을 활용한 퍼포먼스 마케팅 캠페인 최적화 실습 결과 보고서: ROAS 분석 포함", output_links: [] },
    ],

    // ── weekActivityRecords: getDemoActivityRecords("dw-01") 결과 반영 ──
    // caseNum = 1 % 10 = 1 → comp 전부 true, exp 전부 true, info 전부 true (17개)
    weekActivityRecords: [
      { week_id: "dw-01", activity_type_id: "wisdom", is_completed: true },
      { week_id: "dw-01", activity_type_id: "essay", is_completed: true },
      { week_id: "dw-01", activity_type_id: "infodesk", is_completed: true },
      { week_id: "dw-01", activity_type_id: "calendar", is_completed: true },
      { week_id: "dw-01", activity_type_id: "forum", is_completed: true },
      { week_id: "dw-01", activity_type_id: "session", is_completed: true },
      { week_id: "dw-01", activity_type_id: "practical_lecture", is_completed: true },
      { week_id: "dw-01", activity_type_id: "community", is_completed: true },
      { week_id: "dw-01", activity_type_id: "etc_a", is_completed: true },
      { week_id: "dw-01", activity_type_id: "comp-1", is_completed: true },
      { week_id: "dw-01", activity_type_id: "comp-2", is_completed: true },
      { week_id: "dw-01", activity_type_id: "comp-3", is_completed: true },
      { week_id: "dw-01", activity_type_id: "comp-4", is_completed: true },
      { week_id: "dw-01", activity_type_id: "exp-1", is_completed: true },
      { week_id: "dw-01", activity_type_id: "exp-2", is_completed: true },
      { week_id: "dw-01", activity_type_id: "exp-3", is_completed: true },
      { week_id: "dw-01", activity_type_id: "exp-4", is_completed: true },
    ],

    // ── careerRecords: getDemoCareerRecords("dw-01") 결과 반영 ──
    // caseNum = 1 % 6 = 1 → 4개 카드 (네이버, 일이삼사..., 라인, 쿠팡)
    // grade_points는 Math.random() 제거하고 고정값 사용
    careerRecords: [
      {
        id: "cr-demo-1",
        project_id: "p-demo-1",
        week_id: "dw-01",
        company_name: "네이버",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자2.png",
        job_position: "네이버 마케팅",
        project_name: "네이버 마케팅 캠페인 기획 및 실행 프로젝트 그리고 일이삼사오육칠팔구십 네이버 마케팅 캠페인 기획 및 실행 프로젝트 일이삼사오육칠팔구십",
        project_description: "마케팅 캠페인 전략 가나다라마사 아자차카파타하 가나다라마바사 일이삼사오육칠팔구십 안녕하세요 감사해요 잘있어요 다시 만나요",
        line_code: "BC11-10001",
        line_name: "네이버 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-1",
        user_id: "u1",
        enhancement_status: "enhanced",
        grade: "S",
        grade_points: 85,
        career_code: "BC11-10001",
        supervisor_name: "박서연",
        supervisor_position: "과장",
        supervisor_department: "네이버 마케팅팀",
        supervisor_company: "네이버",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자2.png",
      },
      {
        id: "cr-demo-2",
        project_id: "p-demo-2",
        week_id: "dw-01",
        company_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
        job_position: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅",
        project_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅 캠페인 기획 및 실행 프로젝트",
        project_description: "소셜미디어 채널별 바이럴 콘텐츠 전략 수립 및 성과 분석",
        line_code: "CD12-10002",
        line_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-2",
        user_id: "u1",
        enhancement_status: "enhanced",
        grade: "A",
        grade_points: 72,
        career_code: "CD12-10002",
        supervisor_name: "조워싱턴",
        supervisor_position: "팀장",
        supervisor_department: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅팀",
        supervisor_company: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
      },
      {
        id: "cr-demo-3",
        project_id: "p-demo-3",
        week_id: "dw-01",
        company_name: "라인",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자2.png",
        job_position: "라인 마케팅",
        project_name: "라인 해당 프로젝트",
        project_description: "짧게 짧게 가보자",
        line_code: "DE13-10003",
        line_name: "라인 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-3",
        user_id: "u1",
        enhancement_status: "not_applicable",
        grade: null,
        grade_points: 0,
        career_code: "DE13-10003",
        supervisor_name: "이지은",
        supervisor_position: "차장",
        supervisor_department: "라인 마케팅팀",
        supervisor_company: "라인",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자2.png",
      },
      {
        id: "cr-demo-4",
        project_id: "p-demo-4",
        week_id: "dw-01",
        company_name: "쿠팡",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
        job_position: "쿠팡 마케팅",
        project_name: "쿠팡 해당 프로젝트",
        project_description: null,
        line_code: "EF14-10004",
        line_name: "쿠팡 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-4",
        user_id: "u1",
        enhancement_status: "not_applicable",
        grade: null,
        grade_points: 0,
        career_code: "EF14-10004",
        supervisor_name: "최수현",
        supervisor_position: "부장",
        supervisor_department: "쿠팡 마케팅팀",
        supervisor_company: "쿠팡",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
      },
    ],
  },
  "dw-02": {
    // ── weeklyActivities: 실무 정보/역량/경험 활동별 title (main-desc 원본) ──
    weeklyActivities: [
      { id: "wa-1", activity_type_id: "wisdom", title: "동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화 삼천리 화려강산 대한사람 대한으로 길이 보전하세", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-2", activity_type_id: "essay", title: "우주는 무한하다고 하는데 사실 끝이 없는 공간이라는 개념이 잘 이해가 가지 않습니", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-3", activity_type_id: "infodesk", title: "MZ세대 타겟 SNS 마케팅 채널별 성과 지표 비교 분석 및 최적 채널 믹스 전략 도출 과제", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-4", activity_type_id: "calendar", title: "일이삼사오육칠팔구십 일이삼사오육칠팔구십 일이삼사오육칠팔구십", is_active: true, opened_at: "2099-01-01T00:00:00Z", output_links: [] },
      { id: "wa-5", activity_type_id: "forum", title: "짧은 글", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-6", activity_type_id: "session", title: "데이터 기반 의사결정을 위한 마케팅 분석 프레임워크 세션", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-7", activity_type_id: "practical_lecture", title: "우주는 얼마나 클까?", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      {
        id: "wa-8",
        activity_type_id: "comp-1",
        title: "시간이 지나면 더 멀리 있는 우주에서 출발한 빛도 우리에게 올 수 있겠죠. 그래서 관측 가능한 우주는 앞으로 100억 년이 더 흐르면 당연히 더 커지겠죠. 지금은 관측 가능한 우주가 460억 광년 정도의 반지름을 갖습니다.",
        is_active: true,
        opened_at: "2025-01-01T00:00:00Z",
        output_links: [],
      },
      { id: "wa-comp-2", activity_type_id: "comp-2", title: "역량 진단", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-comp-3", activity_type_id: "comp-3", title: "마케터 역량 진단 테스트 결과", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-comp-4", activity_type_id: "comp-4", title: "짧은 길이", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-9", activity_type_id: "exp-1", title: "안타깝게도 아직 우주의 끝을 확인할 수 있는 기술은 존재하지 않습니다. 하지만 현재까지의 연구결과를 보면 우주는 무한할 것 같습니다. 지구라는 한정된 공간에서 평생을 살아가는", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-10", activity_type_id: "exp-2", title: "동료 크루 3인의 마케팅 포트폴리오를 상호 피드백하며 각자의 강점과 개선점을 발견하는 실습", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-11", activity_type_id: "exp-3", title: "짧은 길이", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-12", activity_type_id: "exp-4", title: "퍼포먼스 마케팅 캠페인 ROAS 분석 및 예산 재배분 최적화 전략 수립", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    ],

    // ── weekActivityDetails: 실무 역량/경험 활동별 sub_title (sub-desc 원본) ──
    weekActivityDetails: [
      {
        week_id: "dw-02",
        activity_type_id: "comp-1",
        sub_title: "가나다라마바사아자차카타파하 가나다라마바사아자차카타파하가나다라마바사아자차카타파하",
        output_links: [],
      },
      { week_id: "dw-01", activity_type_id: "comp-2", sub_title: "진단 결과", output_links: [] },
      { week_id: "dw-01", activity_type_id: "comp-3", sub_title: "지구상에서는 한 방향으로 계속해서 가다 보면 모든 공간의 끝이 나오는 게 당연하니까요. 우주 공간에는 인간의 단위로는 측량하기 힘들 정도로 많은 물질이 있고 우주 공간 자체는 빛보다 빠른 속도로 지금도 팽창", output_links: [] },
      { week_id: "dw-01", activity_type_id: "comp-4", sub_title: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하", output_links: [] },
      { week_id: "dw-01", activity_type_id: "exp-1", sub_title: "지구상에서는 한 방향으로 계속해서 가다 보면 모든 공간의 끝이 나오는 게 당연하니까요. 우주 공간에는 인간의 단위로는 측량하기 힘들 정도로 많은 물질이 있고 우주 공간 자체는 빛보다 빠른 속도로 지금도 팽창", output_links: [] },
      { week_id: "dw-01", activity_type_id: "exp-2", sub_title: "동료 피드백을 통해 발견한 강점 3가지와 보완이 필요한 영역 2가지를 정리한 액션 플랜", output_links: [] },
      {
        week_id: "dw-02",
        activity_type_id: "exp-3",
        sub_title:
          "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아일이삼사오",
        output_links: [],
      },
      { week_id: "dw-01", activity_type_id: "exp-4", sub_title: "구글 애즈와 메타 광고 플랫폼을 활용한 퍼포먼스 마케팅 캠페인 최적화 실습 결과 보고서: ROAS 분석 포함", output_links: [] },
    ],

    // ── weekActivityRecords: getDemoActivityRecords("dw-01") 결과 반영 ──
    // caseNum = 1 % 10 = 1 → comp 전부 true, exp 전부 true, info 전부 true (17개)
    weekActivityRecords: [
      { week_id: "dw-02", activity_type_id: "wisdom", is_completed: true },
      { week_id: "dw-02", activity_type_id: "essay", is_completed: true },
      { week_id: "dw-02", activity_type_id: "infodesk", is_completed: true },
      { week_id: "dw-02", activity_type_id: "calendar", is_completed: true },
      { week_id: "dw-02", activity_type_id: "forum", is_completed: true },
      { week_id: "dw-02", activity_type_id: "session", is_completed: true },
      { week_id: "dw-02", activity_type_id: "practical_lecture", is_completed: true },
      { week_id: "dw-02", activity_type_id: "community", is_completed: true },
      { week_id: "dw-02", activity_type_id: "etc_a", is_completed: true },
      { week_id: "dw-02", activity_type_id: "comp-1", is_completed: true },
      { week_id: "dw-02", activity_type_id: "comp-2", is_completed: true },
      { week_id: "dw-02", activity_type_id: "comp-3", is_completed: true },
      { week_id: "dw-02", activity_type_id: "comp-4", is_completed: true },
      { week_id: "dw-02", activity_type_id: "exp-1", is_completed: true },
      { week_id: "dw-02", activity_type_id: "exp-2", is_completed: true },
      { week_id: "dw-02", activity_type_id: "exp-3", is_completed: true },
      { week_id: "dw-02", activity_type_id: "exp-4", is_completed: true },
    ],

    // ── careerRecords: getDemoCareerRecords("dw-02") 결과 반영 ──
    // caseNum = 1 % 6 = 1 → 4개 카드 (네이버, 일이삼사..., 라인, 쿠팡)
    // grade_points는 Math.random() 제거하고 고정값 사용
    careerRecords: [
      {
        id: "cr-demo-1",
        project_id: "p-demo-1",
        week_id: "dw-02",
        company_name: "네이버",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자2.png",
        job_position: "네이버 마케팅",
        project_name: "네이버 마케팅 캠페인 기획 및 실행 프로젝트 그리고 일이삼사오육칠팔구십 네이버 마케팅 캠페인 기획 및 실행 프로젝트 일이삼사오육칠팔구십",
        project_description: "마케팅 캠페인 전략 가나다라마사 아자차카파타하 가나다라마바사 일이삼사오육칠팔구십 안녕하세요 감사해요 잘있어요 다시 만나요",
        line_code: "BC11-10001",
        line_name: "네이버 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-1",
        user_id: "u1",
        enhancement_status: "enhanced",
        grade: "S",
        grade_points: 85,
        career_code: "BC11-10001",
        supervisor_name: "박서연",
        supervisor_position: "과장",
        supervisor_department: "네이버 마케팅팀",
        supervisor_company: "네이버",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자2.png",
      },
      {
        id: "cr-demo-2",
        project_id: "p-demo-2",
        week_id: "dw-02",
        company_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
        job_position: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅",
        project_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅 캠페인 기획 및 실행 프로젝트",
        project_description: "소셜미디어 채널별 바이럴 콘텐츠 전략 수립 및 성과 분석",
        line_code: "CD12-10002",
        line_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-2",
        user_id: "u1",
        enhancement_status: "enhanced",
        grade: "A",
        grade_points: 72,
        career_code: "CD12-10002",
        supervisor_name: "조워싱턴",
        supervisor_position: "팀장",
        supervisor_department: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅팀",
        supervisor_company: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
      },
      {
        id: "cr-demo-3",
        project_id: "p-demo-3",
        week_id: "dw-02",
        company_name: "라인",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자2.png",
        job_position: "라인 마케팅",
        project_name: "라인 해당 프로젝트",
        project_description: "짧게 짧게 가보자",
        line_code: "DE13-10003",
        line_name: "라인 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-3",
        user_id: "u1",
        enhancement_status: "not_applicable",
        grade: null,
        grade_points: 0,
        career_code: "DE13-10003",
        supervisor_name: "이지은",
        supervisor_position: "차장",
        supervisor_department: "라인 마케팅팀",
        supervisor_company: "라인",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자2.png",
      },
      {
        id: "cr-demo-4",
        project_id: "p-demo-4",
        week_id: "dw-02",
        company_name: "쿠팡",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
        job_position: "쿠팡 마케팅",
        project_name: "쿠팡 해당 프로젝트",
        project_description: null,
        line_code: "EF14-10004",
        line_name: "쿠팡 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-4",
        user_id: "u1",
        enhancement_status: "not_applicable",
        grade: null,
        grade_points: 0,
        career_code: "EF14-10004",
        supervisor_name: "최수현",
        supervisor_position: "부장",
        supervisor_department: "쿠팡 마케팅팀",
        supervisor_company: "쿠팡",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
      },
    ],
  },
  "dw-03": {
    // ── weeklyActivities: 실무 정보/역량/경험 활동별 title (main-desc 원본) ──
    weeklyActivities: [
      { id: "wa-1", activity_type_id: "wisdom", title: "동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화 삼천리 화려강산 대한사람 대한으로 길이 보전하세", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-2", activity_type_id: "essay", title: "우주는 무한하다고 하는데 사실 끝이 없는 공간이라는 개념이 잘 이해가 가지 않습니", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-3", activity_type_id: "infodesk", title: "MZ세대 타겟 SNS 마케팅 채널별 성과 지표 비교 분석 및 최적 채널 믹스 전략 도출 과제", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-4", activity_type_id: "calendar", title: "일이삼사오육칠팔구십 일이삼사오육칠팔구십 일이삼사오육칠팔구십", is_active: true, opened_at: "2099-01-01T00:00:00Z", output_links: [] },
      { id: "wa-5", activity_type_id: "forum", title: "짧은 글", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-6", activity_type_id: "session", title: "데이터 기반 의사결정을 위한 마케팅 분석 프레임워크 세션", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-7", activity_type_id: "practical_lecture", title: "우주는 얼마나 클까?", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      {
        id: "wa-8",
        activity_type_id: "comp-1",
        title: "시간이 지나면 더 멀리 있는 우주에서 출발한 빛도 우리에게 올 수 있겠죠.",
        is_active: true,
        opened_at: "2025-01-01T00:00:00Z",
        output_links: [],
      },
      { id: "wa-comp-2", activity_type_id: "comp-2", title: "역량 진단", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-comp-3", activity_type_id: "comp-3", title: "마케터 역량 진단 테스트 결과", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-comp-4", activity_type_id: "comp-4", title: "짧은 길이", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-9", activity_type_id: "exp-1", title: "안타깝게도 아직 우주의 끝을 확인할 수 있는 기술은 존재하지 않습니다. 하지만 현재까지의 연구결과를 보면 우주는 무한할 것 같습니다. 지구라는 한정된 공간에서 평생을 살아가는", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-10", activity_type_id: "exp-2", title: "동료 크루 3인의 마케팅 포트폴리오를 상호 피드백하며 각자의 강점과 개선점을 발견하는 실습", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-11", activity_type_id: "exp-3", title: "짧은 길이", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
      { id: "wa-12", activity_type_id: "exp-4", title: "퍼포먼스 마케팅 캠페인 ROAS 분석 및 예산 재배분 최적화 전략 수립", is_active: true, opened_at: "2025-01-01T00:00:00Z", output_links: [] },
    ],

    // ── weekActivityDetails: 실무 역량/경험 활동별 sub_title (sub-desc 원본) ──
    weekActivityDetails: [
      {
        week_id: "dw-02",
        activity_type_id: "comp-1",
        sub_title: null,
        output_links: [],
      },
      { week_id: "dw-01", activity_type_id: "comp-2", sub_title: "진단 결과", output_links: [] },
      { week_id: "dw-01", activity_type_id: "comp-3", sub_title: "지구상에서는 한 방향으로 계속해서 가다 보면 모든 공간의 끝이 나오는 게 당연하니까요. 우주 공간에는 인간의 단위로는 측량하기 힘들 정도로 많은 물질이 있고 우주 공간 자체는 빛보다 빠른 속도로 지금도 팽창", output_links: [] },
      { week_id: "dw-01", activity_type_id: "comp-4", sub_title: "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하", output_links: [] },
      { week_id: "dw-01", activity_type_id: "exp-1", sub_title: "지구상에서는 한 방향으로 계속해서 가다 보면 모든 공간의 끝이 나오는 게 당연하니까요. 우주 공간에는 인간의 단위로는 측량하기 힘들 정도로 많은 물질이 있고 우주 공간 자체는 빛보다 빠른 속도로 지금도 팽창", output_links: [] },
      { week_id: "dw-01", activity_type_id: "exp-2", sub_title: "동료 피드백을 통해 발견한 강점 3가지와 보완이 필요한 영역 2가지를 정리한 액션 플랜", output_links: [] },
      {
        week_id: "dw-02",
        activity_type_id: "exp-3",
        sub_title:
          "가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아일이삼사오",
        output_links: [],
      },
      { week_id: "dw-01", activity_type_id: "exp-4", sub_title: "구글 애즈와 메타 광고 플랫폼을 활용한 퍼포먼스 마케팅 캠페인 최적화 실습 결과 보고서: ROAS 분석 포함", output_links: [] },
    ],

    // ── weekActivityRecords: getDemoActivityRecords("dw-01") 결과 반영 ──
    // caseNum = 1 % 10 = 1 → comp 전부 true, exp 전부 true, info 전부 true (17개)
    weekActivityRecords: [
      { week_id: "dw-02", activity_type_id: "wisdom", is_completed: true },
      { week_id: "dw-02", activity_type_id: "essay", is_completed: true },
      { week_id: "dw-02", activity_type_id: "infodesk", is_completed: true },
      { week_id: "dw-02", activity_type_id: "calendar", is_completed: true },
      { week_id: "dw-02", activity_type_id: "forum", is_completed: true },
      { week_id: "dw-02", activity_type_id: "session", is_completed: true },
      { week_id: "dw-02", activity_type_id: "practical_lecture", is_completed: true },
      { week_id: "dw-02", activity_type_id: "community", is_completed: true },
      { week_id: "dw-02", activity_type_id: "etc_a", is_completed: true },
      { week_id: "dw-02", activity_type_id: "comp-1", is_completed: true },
      { week_id: "dw-02", activity_type_id: "comp-2", is_completed: true },
      { week_id: "dw-02", activity_type_id: "comp-3", is_completed: true },
      { week_id: "dw-02", activity_type_id: "comp-4", is_completed: true },
      { week_id: "dw-02", activity_type_id: "exp-1", is_completed: true },
      { week_id: "dw-02", activity_type_id: "exp-2", is_completed: true },
      { week_id: "dw-02", activity_type_id: "exp-3", is_completed: true },
      { week_id: "dw-02", activity_type_id: "exp-4", is_completed: true },
    ],

    // ── careerRecords: getDemoCareerRecords("dw-02") 결과 반영 ──
    // caseNum = 1 % 6 = 1 → 4개 카드 (네이버, 일이삼사..., 라인, 쿠팡)
    // grade_points는 Math.random() 제거하고 고정값 사용
    careerRecords: [
      {
        id: "cr-demo-1",
        project_id: "p-demo-1",
        week_id: "dw-02",
        company_name: "네이버",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자2.png",
        job_position: "네이버 마케팅",
        project_name: "네이버 마케팅 캠페인 기획 및 실행 프로젝트 그리고 일이삼사오육칠팔구십 네이버 마케팅 캠페인 기획 및 실행 프로젝트 일이삼사오육칠팔구십",
        project_description: "마케팅 캠페인 전략 가나다라마사 아자차카파타하 가나다라마바사 일이삼사오육칠팔구십 안녕하세요 감사해요 잘있어요 다시 만나요",
        line_code: "BC11-10001",
        line_name: "네이버 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-1",
        user_id: "u1",
        enhancement_status: "enhanced",
        grade: "S",
        grade_points: 85,
        career_code: "BC11-10001",
        supervisor_name: "박서연",
        supervisor_position: "과장",
        supervisor_department: "네이버 마케팅팀",
        supervisor_company: "네이버",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자2.png",
      },
      {
        id: "cr-demo-2",
        project_id: "p-demo-2",
        week_id: "dw-02",
        company_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
        job_position: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅",
        project_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅 캠페인 기획 및 실행 프로젝트",
        project_description: "소셜미디어 채널별 바이럴 콘텐츠 전략 수립 및 성과 분석",
        line_code: "CD12-10002",
        line_name: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-2",
        user_id: "u1",
        enhancement_status: "enhanced",
        grade: "A",
        grade_points: 72,
        career_code: "CD12-10002",
        supervisor_name: "조워싱턴",
        supervisor_position: "팀장",
        supervisor_department: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십 마케팅팀",
        supervisor_company: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
      },
      {
        id: "cr-demo-3",
        project_id: "p-demo-3",
        week_id: "dw-02",
        company_name: "라인",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자2.png",
        job_position: "라인 마케팅",
        project_name: "라인 해당 프로젝트",
        project_description: "짧게 짧게 가보자",
        line_code: "DE13-10003",
        line_name: "라인 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-3",
        user_id: "u1",
        enhancement_status: "not_applicable",
        grade: null,
        grade_points: 0,
        career_code: "DE13-10003",
        supervisor_name: "이지은",
        supervisor_position: "차장",
        supervisor_department: "라인 마케팅팀",
        supervisor_company: "라인",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자2.png",
      },
      {
        id: "cr-demo-4",
        project_id: "p-demo-4",
        week_id: "dw-02",
        company_name: "쿠팡",
        company_logo_url: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
        job_position: "쿠팡 마케팅",
        project_name: "쿠팡 해당 프로젝트",
        project_description: null,
        line_code: "EF14-10004",
        line_name: "쿠팡 마케팅",
        output_links: [],
        secondary_info_deadline: null,
        created_at: "2025-12-22T00:00:00Z",
        record_id: "r-demo-4",
        user_id: "u1",
        enhancement_status: "not_applicable",
        grade: null,
        grade_points: 0,
        career_code: "EF14-10004",
        supervisor_name: "최수현",
        supervisor_position: "부장",
        supervisor_department: "쿠팡 마케팅팀",
        supervisor_company: "쿠팡",
        supervisor_profile_img: "/images/0/cluster4/icon/실무 경력/감독자.jpg",
      },
    ],
  },
};
