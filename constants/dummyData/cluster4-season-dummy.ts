// constants/dummyData/cluster4-season-dummy.ts
// TODO: 더미 데이터 — 기획자 확인용, 실서버 노출 안 됨

import { randomCrewProfile, randomSeasonImage } from "@/utils/randomImage";

// DUMMY_SEASON_DATA — cluster4-season 페이지의 기본 시즌 데이터 (현재 시즌용)
export const DUMMY_SEASON_DATA = {
  // === 시즌 기본 정보 ===
  id: "demo-season-1",
  year: "2025",
  season: "여름",
  dateRange: "2025 - 03 - 23 (월) ~ 2025 - 08 - 22 (일)",
  status: "시즌 진행 중",
  statusClass: "in-progress",
  image: "/images/0/cluster4/시즌 이미지/여름_후보_3.png",
  approvedWeeks: 8,
  totalWeeks: 30,
  isQualified: true,
  roleInSeason: "운영진(앰배서더)",

  // === area-4: 단감/인절미/어흥 (자릿수 혼합) ===
  stats: { dangam: 25, injeolmi: 999, eoheung: 3 },

  // === area-5: 별점 + 리뷰 ===
  rating: 10,
  review: "이번시즌 30자 평을 해보라는데, 어디까지 갈 수 있나",
  reviewLink: "",

  // === area-6: 원형 차트 (자릿수 혼합) ===
  circles: {
    weekUsage: 80,
    scheduleReliability: 90,
    seasonGrowth: 70,
    approvedWeeks: 8,
    totalOperatingWeeks: 30,
    reliableWeeks: 125,
    completedActivities: 5,
    totalActivities: 5,
  },

  // === area-7: 강화율 (자릿수 혼합) ===
  progress: {
    info: { total: 40, completed: 20, rate: 50 },
    competency: { total: 999, completed: 999, rate: 100 },
    experience: { total: 8, completed: 3, rate: 38 },
    career: { total: 15, completed: 1, rate: 7 },
  },

  // === area-8: 시즌 상태 (최소/중간/최대 글자수 혼합) ===
  seasonRoles: [
    {
      profileImage: randomCrewProfile(),
      teamName: "기획",
      partName: "전략파",
      roleLabel: "일반",
      isAdmin: false,
      adminGeneration: null,
    },
    {
      profileImage: randomCrewProfile(),
      teamName: "마케팅전략",
      partName: "브랜드콘텐",
      roleLabel: "심화(파트장)",
      isAdmin: false,
      adminGeneration: null,
    },
    {
      profileImage: randomCrewProfile(),
      teamName: "엔터테인먼트",
      partName: "글로벌마케팅",
      roleLabel: "운영진(앰배서더)",
      isAdmin: true,
      adminGeneration: 4,
    },
  ],

  // === area-9: 시즌 평판 (최소/중간/최대 글자수 혼합) ===
  seasonReputations: [
    {
      id: "dummy-rep-1",
      rating: 3,
      content: "짧은코멘트입니다",
      keyword_1: "#힘",
      keyword_2: null,
      fmScore: 1,
      reviewer: {
        display_name: "김아",
        gender: "여",
        birth_date: "2003-11-20",
        university: "한대",
        major_first: "경영",
        profile_photo_url: randomCrewProfile(),
        teamName: "기획",
        partName: "전략파트",
        vision: "별명짧",
      },
    },
    {
      id: "dummy-rep-2",
      rating: 7,
      content: "이번시즌에서가장인상깊었던점은팀워크였습니다정말로",
      keyword_1: "#추진력있는사람",
      keyword_2: "#성실한태도의",
      fmScore: 42,
      reviewer: {
        display_name: "박준혁",
        gender: "남",
        birth_date: "2001-05-15",
        university: "성균관",
        major_first: "컴퓨터공학",
        profile_photo_url: randomCrewProfile(),
        teamName: "마케팅전략",
        partName: "브랜드콘텐츠",
        vision: "디지털마케터",
      },
    },
    {
      id: "dummy-rep-3",
      rating: 10,
      content: "이번시즌을통해서정말많은것을배웠고특히마케팅전략수립과실행그리고팀원들과의협업과정에서크게성장했다고생각합니다앞으로도계속해서노력",
      keyword_1: "#추진력추진력추진력력",
      keyword_2: "#끈기와인내의결과물",
      fmScore: 999,
      reviewer: {
        display_name: "알렉산더최",
        gender: "남",
        birth_date: "1999-01-01",
        university: "한국예술종합",
        major_first: "미디어커뮤니케이션",
        profile_photo_url: randomCrewProfile(),
        teamName: "엔터테인먼트",
        partName: "글로벌마케팅",
        vision: "엔비디아구글테슬라쿵",
      },
    },
  ],
};

// 시즌 히스토리 4개 — 각각 완전히 다른 데이터 (다양한 경우의 수 커버)
export const DUMMY_SEASON_HISTORIES = [
  {
    // === 페이지 1: 성장 진행 중 ===
    id: "dh-1",
    year: "2025",
    season: "여름",
    dateRange: "2025 - 03 - 23 (월) ~ 2025 - 08 - 22 (일)",
    status: "시즌 진행 중",
    statusClass: "in-progress",
    image: randomSeasonImage(),
    approvedWeeks: 8,
    totalWeeks: 30,
    isQualified: true,
    roleInSeason: "운영진(앰배서더)",
    stats: { dangam: 25, injeolmi: 999, eoheung: 3 }, // 2자리/3자리/1자리
    rating: 8,
    review: "많이 배웠다",
    reviewLink: "",
    circles: { weekUsage: 80, scheduleReliability: 5, seasonGrowth: 100, approvedWeeks: 8, totalOperatingWeeks: 30, reliableWeeks: 1, completedActivities: 999, totalActivities: 999 },
    progress: { info: { total: 40, completed: 20, rate: 50 }, competency: { total: 5, completed: 5, rate: 100 }, experience: { total: 8, completed: 3, rate: 38 }, career: { total: 999, completed: 1, rate: 0 } },
    // 시즌 상태: 3개
    seasonRoles: [
      { profileImage: randomCrewProfile(), teamName: "기획", partName: "전략파트", roleLabel: "운영진(앰배서더)", isAdmin: false, adminGeneration: 3 },
      { profileImage: randomCrewProfile(), teamName: null, partName: null, roleLabel: "팀장(헬스케어 팀)", isAdmin: true, adminGeneration: 3 },
      { profileImage: randomCrewProfile(), teamName: null, partName: null, roleLabel: "앰배서더", isAdmin: true, adminGeneration: 4 },
    ],
    // 시즌 평판: 1개 (최소)
    seasonReputations: [
      {
        id: "r1-1",
        rating: 3,
        content: "짧은코멘트",
        keyword_1: "#힘",
        keyword_2: null,
        fmScore: 1,
        reviewer: { display_name: "김아", gender: "여", birth_date: "2003-11-20", university: "한대", major_first: "경영", profile_photo_url: randomCrewProfile(), teamName: "기획", partName: "전략파트", vision: "별명짧" },
      },
    ],
  },
  {
    // === 페이지 2: 성장 완료 ===
    id: "dh-2",
    year: "2025",
    season: "봄",
    dateRange: "2025 - 01 - 06 (월) ~ 2025 - 03 - 22 (토)",
    status: "성장 완료",
    statusClass: "completed",
    image: randomSeasonImage(),
    approvedWeeks: 16,
    totalWeeks: 16,
    isQualified: true,
    roleInSeason: "심화(파트장)",
    stats: { dangam: 150, injeolmi: 88, eoheung: 45 }, // 3자리/2자리/2자리
    rating: 10,
    review: "이번시즌최고의경험이었고앞으로도계속성장하고",
    reviewLink: "",
    circles: { weekUsage: 100, scheduleReliability: 100, seasonGrowth: 95, approvedWeeks: 16, totalOperatingWeeks: 16, reliableWeeks: 16, completedActivities: 120, totalActivities: 120 },
    progress: { info: { total: 50, completed: 48, rate: 96 }, competency: { total: 10, completed: 9, rate: 90 }, experience: { total: 12, completed: 11, rate: 92 }, career: { total: 20, completed: 18, rate: 90 } },
    // 시즌 상태: 6개 (최대)
    seasonRoles: [
      { profileImage: randomCrewProfile(), teamName: "엔터테인먼트", partName: "글로벌마케팅", roleLabel: "팀장(미디어 팀)", isAdmin: false, adminGeneration: null },
      { profileImage: randomCrewProfile(), teamName: "마케팅전략", partName: "브랜드콘텐츠", roleLabel: "운영진(앰배서더)", isAdmin: true, adminGeneration: 4 },
      { profileImage: randomCrewProfile(), teamName: "개발", partName: "백엔드", roleLabel: "일반", isAdmin: false, adminGeneration: null },
      { profileImage: randomCrewProfile(), teamName: "디자인", partName: "UI", roleLabel: "파트장", isAdmin: false, adminGeneration: null },
      { profileImage: randomCrewProfile(), teamName: "기획", partName: "전략", roleLabel: "일반", isAdmin: false, adminGeneration: null },
      { profileImage: randomCrewProfile(), teamName: "미디어", partName: "웹툰드라마", roleLabel: "일반", isAdmin: false, adminGeneration: null },
    ],
    // 시즌 평판: 5개 (많음)
    seasonReputations: [
      {
        id: "r2-1",
        rating: 10,
        content: "리더십이돋보이는최고의팀장이었습니다팀을이끌어나가는모습이정말인상적이었고많이배웠습니다",
        keyword_1: "#리더십리더십",
        keyword_2: "#추진력추진력력",
        fmScore: 999,
        reviewer: { display_name: "알렉산더최", gender: "남", birth_date: "1999-01-01", university: "한국예술종합", major_first: "미디어커뮤니케이션", profile_photo_url: randomCrewProfile(), teamName: "엔터테인먼트", partName: "글로벌마케팅", vision: "엔비디아구글테슬라쿵" },
      },
      {
        id: "r2-2",
        rating: 9,
        content: "항상팀원을배려하고소통을잘하는분입니다",
        keyword_1: "#소통",
        keyword_2: "#배려",
        fmScore: 420,
        reviewer: { display_name: "박준혁", gender: "남", birth_date: "2001-05-15", university: "성균관", major_first: "컴퓨터공학", profile_photo_url: randomCrewProfile(), teamName: "개발", partName: "백엔드", vision: "코딩왕" },
      },
      {
        id: "r2-3",
        rating: 7,
        content: "새로운아이디어제시",
        keyword_1: "#창의성",
        keyword_2: null,
        fmScore: 42,
        reviewer: { display_name: "이수", gender: "여", birth_date: "2002-08-10", university: "이화", major_first: "디자인", profile_photo_url: randomCrewProfile(), teamName: "디자인", partName: "UI", vision: "요정" },
      },
      {
        id: "r2-4",
        rating: 5,
        content: "성실참여",
        keyword_1: "#성실",
        keyword_2: null,
        fmScore: 8,
        reviewer: { display_name: "최유진", gender: "여", birth_date: "2001-03-25", university: "고려", major_first: "사회", profile_photo_url: randomCrewProfile(), teamName: "기획", partName: "전략", vision: "전략가전략가" },
      },
      {
        id: "r2-5",
        rating: 4,
        content: "노력하는모습이보였습니다",
        keyword_1: "#노력",
        keyword_2: "#근성",
        fmScore: 100,
        reviewer: { display_name: "정민수", gender: "남", birth_date: "2000-07-12", university: "서울과학기술", major_first: "경영정보시스템공학", profile_photo_url: randomCrewProfile(), teamName: "사업개발전략", partName: "제휴협력사업", vision: "사업가" },
      },
    ],
  },
  {
    // === 페이지 3: 성장 휴식 ===
    id: "dh-3",
    year: "2024",
    season: "겨울",
    dateRange: "2024 - 10 - 14 (월) ~ 2025 - 01 - 05 (일)",
    status: "성장 휴식",
    statusClass: "rest",
    image: randomSeasonImage(),
    approvedWeeks: 0,
    totalWeeks: 5,
    isQualified: false,
    roleInSeason: "일반",
    stats: { dangam: 0, injeolmi: 0, eoheung: 0 },
    rating: 0,
    review: "",
    reviewLink: "",
    circles: { weekUsage: 0, scheduleReliability: 0, seasonGrowth: 0, approvedWeeks: 0, totalOperatingWeeks: 5, reliableWeeks: 0, completedActivities: 0, totalActivities: 0 },
    progress: { info: { total: 0, completed: 0, rate: 0 }, competency: { total: 0, completed: 0, rate: 0 }, experience: { total: 0, completed: 0, rate: 0 }, career: { total: 0, completed: 0, rate: 0 } },
    // 시즌 상태: 0개 (없음)
    seasonRoles: [],
    // 시즌 평판: 0개 (없음)
    seasonReputations: [],
  },
  {
    // === 페이지 4: 성장 중단 ===
    id: "dh-4",
    year: "2024",
    season: "가을",
    dateRange: "2024 - 07 - 08 (월) ~ 2024 - 10 - 13 (일)",
    status: "성장 중단",
    statusClass: "stopped",
    image: randomSeasonImage(),
    approvedWeeks: 2,
    totalWeeks: 16,
    isQualified: false,
    roleInSeason: "일반",
    stats: { dangam: 5, injeolmi: 12, eoheung: 0 }, // 1자리/2자리/1자리
    rating: 2,
    review: "아쉬운점도있었지만좋은경험이었다",
    reviewLink: "",
    circles: { weekUsage: 15, scheduleReliability: 20, seasonGrowth: 5, approvedWeeks: 2, totalOperatingWeeks: 16, reliableWeeks: 3, completedActivities: 10, totalActivities: 120 },
    progress: { info: { total: 20, completed: 2, rate: 10 }, competency: { total: 3, completed: 0, rate: 0 }, experience: { total: 5, completed: 1, rate: 20 }, career: { total: 10, completed: 0, rate: 0 } },
    // 시즌 상태: 2개
    seasonRoles: [
      { profileImage: randomCrewProfile(), teamName: "마케팅", partName: "콘텐츠", roleLabel: "일반", isAdmin: false, adminGeneration: null },
      { profileImage: randomCrewProfile(), teamName: "운영", partName: "총무", roleLabel: "일반", isAdmin: false, adminGeneration: null },
    ],
    // 시즌 평판: 2개
    seasonReputations: [
      {
        id: "r4-1",
        rating: 3,
        content: "초반에는잘했으나중간에포기한것이아쉽습니다",
        keyword_1: "#아쉬움",
        keyword_2: null,
        fmScore: 15,
        reviewer: { display_name: "한소희", gender: "여", birth_date: "2002-04-18", university: "이화", major_first: "디자인", profile_photo_url: randomCrewProfile(), teamName: "디자인", partName: "UI", vision: "디자인요정" },
      },
      {
        id: "r4-2",
        rating: 1,
        content: "참여부족",
        keyword_1: null,
        keyword_2: null,
        fmScore: 2,
        reviewer: { display_name: "오", gender: "남", birth_date: "2003-12-01", university: "서울", major_first: "경제", profile_photo_url: randomCrewProfile(), teamName: "기획", partName: "전략", vision: "짧" },
      },
    ],
  },
];
