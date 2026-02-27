"use client";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/contexts/ProfileContext";
import koreaRegionsData from "@/data/korea-regions.json";

const koreaRegions: { [key: string]: string[] } = koreaRegionsData;

const Sidebar = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const targetUserId = searchParams.get("userId") || searchParams.get("userID");
  const { fetchProfile: fetchCachedProfile, profileData: cachedProfile, clearCache: clearProfileCache } = useProfile();
  const [isOwner, setIsOwner] = useState(true);
  const [reliabilityRate, setReliabilityRate] = useState<number | null>(100);
  const [hasReliabilityData, setHasReliabilityData] = useState<boolean>(false);
  const [completionRate, setCompletionRate] = useState<number | null>(80);
  const [hasCompletionData, setHasCompletionData] = useState<boolean>(false);
  const [practicalCompetency, setPracticalCompetency] = useState<number>(21); // 실무 역량 성장
  const [practicalExperience, setPracticalExperience] = useState<number>(21); // 실무 경험 축적
  const [practicalInfo, setPracticalInfo] = useState<number>(21); // 실무 정보 습득
  const [practicalCareer, setPracticalCareer] = useState<number>(21); // 실무 경력 누적
  const [hasActivityData, setHasActivityData] = useState<boolean>(false);
  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [badge1, setBadge1] = useState(0);
  const [badge2, setBadge2] = useState(0);
  const [badge3, setBadge3] = useState(0);
  // 배지 데이터 상태 (user_cumulative_points 테이블)
  const [badgeData, setBadgeData] = useState({
    stars: 99999, // 별
    lightnings: 9999, // 번개
    shields: 99999, // 방패
  });
  const [hasBadgeData, setHasBadgeData] = useState<boolean>(false);

  // 시즌 히스토리 데이터 상태 (user_season_histories + seasons)
  interface SeasonHistory {
    id: string;
    role_in_season: string;
    approved_weeks: number;
    total_weeks: number;
    progress_status: string;
    review_status: string;
    seasons: {
      id: string;
      year: number;
      name: string;
      start_date: string;
    };
  }
  const [seasonHistories, setSeasonHistories] = useState<SeasonHistory[]>([
    {
      id: "dummy-1",
      role_in_season: "admin",
      approved_weeks: 3,
      total_weeks: 16,
      progress_status: "in_progress",
      review_status: "reviewing",
      seasons: { id: "s1", year: 2025, name: "winter", start_date: "2025-01-01" },
    },
    {
      id: "dummy-2",
      role_in_season: "crew_advanced",
      approved_weeks: 8,
      total_weeks: 8,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s2", year: 2025, name: "fall", start_date: "2024-09-01" },
    },
    {
      id: "dummy-3",
      role_in_season: "crew_regular",
      approved_weeks: 12,
      total_weeks: 16,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s3", year: 2025, name: "summer", start_date: "2024-06-01" },
    },
    {
      id: "dummy-4",
      role_in_season: "crew_basic",
      approved_weeks: 10,
      total_weeks: 16,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s4", year: 2024, name: "spring", start_date: "2024-03-01" },
    },
    {
      id: "dummy-5",
      role_in_season: "admin",
      approved_weeks: 6,
      total_weeks: 16,
      progress_status: "in_progress",
      review_status: "reviewing",
      seasons: { id: "s5", year: 2024, name: "winter", start_date: "2024-01-01" },
    },
    {
      id: "dummy-6",
      role_in_season: "crew_advanced",
      approved_weeks: 12,
      total_weeks: 16,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s6", year: 2023, name: "fall", start_date: "2023-09-01" },
    },
    {
      id: "dummy-7",
      role_in_season: "crew_basic",
      approved_weeks: 4,
      total_weeks: 16,
      progress_status: "in_progress",
      review_status: "reviewing",
      seasons: { id: "s7", year: 2023, name: "summer", start_date: "2023-06-01" },
    },
    {
      id: "dummy-8",
      role_in_season: "admin",
      approved_weeks: 16,
      total_weeks: 16,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s8", year: 2023, name: "spring", start_date: "2023-03-01" },
    },
    {
      id: "dummy-9",
      role_in_season: "crew_regular",
      approved_weeks: 16,
      total_weeks: 16,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s9", year: 2023, name: "spring", start_date: "2023-03-01" },
    },
    {
      id: "dummy-10",
      role_in_season: "crew_regular",
      approved_weeks: 16,
      total_weeks: 16,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s10", year: 2023, name: "spring", start_date: "2023-03-01" },
    },
    {
      id: "dummy-11",
      role_in_season: "crew_regular",
      approved_weeks: 16,
      total_weeks: 16,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s11", year: 2023, name: "spring", start_date: "2023-03-01" },
    },
    {
      id: "dummy-12",
      role_in_season: "crew_regular",
      approved_weeks: 16,
      total_weeks: 16,
      progress_status: "completed",
      review_status: "approved",
      seasons: { id: "s12", year: 2023, name: "spring", start_date: "2023-03-01" },
    },
  ]);
  const [hasSeasonData, setHasSeasonData] = useState<boolean>(false);

  // 시즌 이름 한글 변환
  const seasonNameKorean: { [key: string]: string } = {
    spring: "봄",
    summer: "여름",
    fall: "가을",
    winter: "겨울",
  };

  // 역할 한글 변환
  const roleKorean: { [key: string]: string } = {
    crew_regular: "일반(정규)",
    crew_normal: "일반(정규)",
    crew_advanced: "심화(파트장)",
    crew_partleader: "심화(파트장)",
    crew_advanced_part_leader: "심화(파트장)",
    part_leader: "심화(파트장)",
    crew_agent: "심화(에이전트)",
    crew_advanced_agent: "심화(에이전트)",
    admin: "운영진(앰베서더)",
    admin_team_leader: "운영진(팀장)",
    crew_team_leader: "운영진(팀장)",
    admin_ambassador: "운영진(앰배서더)",
    crew_ambassador: "운영진(앰배서더)",
    operations_ambassador: "운영진(앰배서더)",
  };

  // 진행 상태 변환
  const getProgressStatus = (status: string) => {
    switch (status) {
      case "completed":
        return { text: "정상 완료", className: "complete" };
      case "in_progress":
        return { text: "진행중", className: "active" };
      case "full_rest":
        return { text: "통합 휴식", className: "rest" };
      case "suspended":
      case "discontinued":
        return { text: "활동 중단", className: "suspended" };
      default:
        return { text: status, className: "" };
    }
  };

  // 검수 상태 변환
  const getReviewStatus = (status: string) => {
    switch (status) {
      case "approved":
        return { text: "승인 완료", className: "approved" };
      case "reviewing":
        return { text: "검수중", className: "pending" };
      default:
        return { text: status, className: "" };
    }
  };

  // 아바타 이미지 순환 (01.png, 02.png, 03.png)
  const getAvatarImage = (index: number) => {
    const num = (index % 3) + 1;
    return `/images/0/cluster 1/bg image/0${num}.png`;
  };

  const [skill1, setSkill1] = useState(0);
  const [skill2, setSkill2] = useState(0);
  const [skill3, setSkill3] = useState(0);
  const [skill4, setSkill4] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 실제 유저 프로필 데이터
  const [userProfile, setUserProfile] = useState<{
    name: string;
    nameEng: string;
    gender: string;
    birthDate: string;
    city: string;
    district: string;
    phone: string;
    email: string;
    school: string;
    major: string;
    major2: string;
    major3: string;
    enrollPeriod: string;
    graduationStatus: string;
    gpa: string;
    gpaMax: string;
    quote: string;
    photo: string;
  } | null>(null);

  // Hydration 에러 방지를 위한 마운트 상태
  const [isMounted, setIsMounted] = useState(false);
  const [hasData, setHasData] = useState(false); // 데이터 있음/없음 상태
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 아이콘 링크 state
  const [iconLink1, setIconLink1] = useState("https://www.google.com/");
  const [iconLink2, setIconLink2] = useState("https://youtu.be/xf6q5dgn1hU?si=tNK3I1-QIsJ9JmvF");
  const [iconLink3, setIconLink3] = useState("https://www.naver.com/");
  const [iconLinkErrors, setIconLinkErrors] = useState({ link1: "", link2: "", link3: "" });

  // URL 유효성 검사 함수
  const isValidUrl = (url: string) => {
    if (!url || url.trim() === "") return true; // 빈 값은 허용
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleIconLinkChange = (value: string, linkNum: 1 | 2 | 3) => {
    const setters = { 1: setIconLink1, 2: setIconLink2, 3: setIconLink3 };
    const errorKeys = { 1: "link1", 2: "link2", 3: "link3" } as const;

    setters[linkNum](value);

    if (value && !isValidUrl(value)) {
      setIconLinkErrors((prev) => ({ ...prev, [errorKeys[linkNum]]: "정확한 링크를 입력해주세요." }));
    } else {
      setIconLinkErrors((prev) => ({ ...prev, [errorKeys[linkNum]]: "" }));
    }
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCustomAddress, setIsCustomAddress] = useState(false);

  // 화면 높이 기반 카드 스케일 조절 (비율 유지)
  // NOTE: 가로(좌/우) 비율 안정화를 위해 "사이드바 폭"은 고정(482px)으로 유지하고
  // 카드만 필요 시 축소(<= 1)한다. (4K에서 카드가 커지며 4:6처럼 보이는 문제 방지)
  const [cardScale, setCardScale] = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 모바일 프로필 슬라이드

  useEffect(() => {
    const calculateScale = () => {
      const cssZoom = parseFloat(document.documentElement.style.zoom) || 1;
      const mobile = window.innerWidth < 1200;
      setIsMobileView(mobile);

      // 브라우저 줌 레벨 감지 (visualViewport 사용)
      const browserZoom = window.visualViewport?.scale || 1;
      const viewportWidth = window.visualViewport?.width || window.innerWidth;
      const viewportHeight = window.visualViewport?.height || window.innerHeight;

      // 헤더 높이 제외한 사용 가능한 높이 (줌 고려) - 130px로 여유 확보
      const availableHeight = viewportHeight - 130 / browserZoom;

      // 기준 카드 크기: 474 x 870
      const baseCardHeight = 870;

      // 모바일에서는 CSS 반응형(1199px 이하: width 100% / height auto)을 그대로 사용
      if (mobile) {
        setCardScale(1);

        // 과거 로직에서 주입된 CSS 변수 제거(레이아웃 폭 변동 방지)
        document.documentElement.style.removeProperty("--card-width");
        document.documentElement.style.removeProperty("--card-height");
        document.documentElement.style.removeProperty("--card-scale");
        document.documentElement.style.removeProperty("--sidebar-width");
        document.documentElement.style.removeProperty("--container-height");
        return;
      }

      // 높이 기준으로 스케일 계산 (화면 높이에 딱 맞도록)
      let scale = availableHeight / baseCardHeight;

      // ★ CSS zoom 역보정: zoom이 1보다 크면 카드를 작게 만들어서 상쇄
      if (cssZoom > 1) {
        scale = scale / cssZoom;
      }

      // 기본 정책: 큰 화면에서 임의 확대 금지(비율 깨짐 방지)
      scale = Math.min(1, scale);

      // 중간폭 데스크톱 및 노트북 카드 확대 보정
      const isClusterPages = (pathname || "").includes("/cluster-") || (pathname || "").includes("/career");

      // ★ 1200~1400px 물리 뷰포트: window.innerWidth는 CSS zoom의 영향을 받지 않으므로
      //   물리적 뷰포트 폭을 직접 사용하여 안정적으로 감지
      const physicalWidth = window.innerWidth;
      const isTightDesktop = !mobile && physicalWidth >= 1200 && physicalWidth < 1400;

      // 1366x768급 노트북(세로가 낮은 환경)
      const isLaptop1366 = !mobile && viewportWidth >= 1280 && viewportWidth <= 1440 && viewportHeight >= 700 && viewportHeight <= 820;

      if (isClusterPages && isTightDesktop) {
        // 뷰포트가 좁을수록 카드를 더 확대 (1200px → 1.15, 1400px → 1.0)
        // CSS zoom으로 인한 카드 시각적 축소를 보정
        const boost = 1 + ((1400 - physicalWidth) / (1400 - 1200)) * 0.15;
        const tightScale = Math.min(1.15, Math.max(1.0, boost));
        scale = Math.max(scale, tightScale);
      } else if (isClusterPages && isLaptop1366) {
        const GAP_PX = 20;
        const NAV_WIDTH = 97;
        const PADDING_PX = 24;
        const BASE_SIDEBAR_WIDTH = 482;
        const MIN_RIGHT_CONTENT = 760;

        const availableForSidebar = viewportWidth - NAV_WIDTH - PADDING_PX - GAP_PX - MIN_RIGHT_CONTENT;
        const maxSidebarWidth = Math.max(BASE_SIDEBAR_WIDTH, availableForSidebar);
        const maxScaleByWidth = maxSidebarWidth / BASE_SIDEBAR_WIDTH;

        const desiredScale = Math.min(1.5, maxScaleByWidth);
        scale = Math.max(scale, desiredScale);
      }

      setCardScale(scale);

      // ★ Mac 보정: 오버레이 스크롤바로 뷰포트가 넓어 여백이 커 보이므로
      // 카드를 살짝 확대하여 사이드바를 꽉 채움 (Windows는 영향 없음)
      const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      if (isMac) {
        const macScale = Math.max(scale, 482 / 474); // ≈ 1.017배
        setCardScale(macScale);
        scale = macScale;
      }

      // ★ 레이아웃 가드레일: 실제 사이드바 점유 폭을 CSS 변수로 동기화
      // - fixed+spacer 방식(예: cluster-4-card)에서도 콘텐츠 침범이 발생하지 않게 함
      // - scale < 1인 경우에도 "컬럼 폭"은 기본 482px을 유지
      const BASE_SIDEBAR_WIDTH = 482;
      const effectiveSidebarWidth = Math.round(BASE_SIDEBAR_WIDTH * Math.max(1, scale));
      document.documentElement.style.setProperty("--sidebar-width", `${effectiveSidebarWidth}px`);

      // 과거 로직에서 주입된 CSS 변수 제거(레이아웃 폭 변동 방지)
      document.documentElement.style.removeProperty("--card-width");
      document.documentElement.style.removeProperty("--card-height");
      document.documentElement.style.removeProperty("--card-scale");
      document.documentElement.style.removeProperty("--container-height");

      // 부모 컨테이너 높이 제한 제거 - 스크롤 시 프로필 잘림 방지
      // (기존 코드 삭제됨)
    };

    calculateScale();

    // 리사이즈 및 줌 이벤트 감지
    window.addEventListener("resize", calculateScale);
    window.visualViewport?.addEventListener("resize", calculateScale);

    return () => {
      window.removeEventListener("resize", calculateScale);
      window.visualViewport?.removeEventListener("resize", calculateScale);
    };
  }, [pathname]);

  // Form state
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    lastNameEng: "",
    firstNameEng: "",
    gender: "",
    birthDate: "",
    addressCity: "",
    addressDistrict: "",
    customAddress: "",
    phone: "",
    phoneComment: "",
    emailId: "",
    emailDomain: "",
    customEmailDomain: "",
    // 학력 정보
    educationLevel: "",
    schoolType: "",
    school: "",
    major: "",
    major2: "",
    major3: "",
    graduationStatus: "",
    entranceYear: "",
    entranceMonth: "",
    graduationYear: "",
    graduationMonth: "",
    gpa: "",
    gpaMax: "",
    customGpaMax: "",
    additionalMajor: "",
    additionalMajorType: "",
    vision: "",
  });
  const [isCustomEmailDomain, setIsCustomEmailDomain] = useState(false);
  const [isPhoneCommentModalOpen, setIsPhoneCommentModalOpen] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const [debugProfileType, setDebugProfileType] = useState<"본인" | "타크루">("본인");
  const [debugPanelType, setDebugPanelType] = useState<"OK" | "EC" | "PX">("OK");
  const [crewStatus, setCrewStatus] = useState<"Running" | "Complete" | "On Rest" | "Recharging" | "Next Challenge">("Running");
  const [isArrowShaking, setIsArrowShaking] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState<"email" | "school" | "major" | "hexagon1" | "hexagon2" | "hexagon3" | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 전공 툴팁 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      if (tooltipVisible === "major") {
        setTooltipVisible(null);
      }
    };

    if (tooltipVisible === "major") {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [tooltipVisible]);

  // 커스텀 스크롤바
  const activitiesRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const [scrollThumbTop, setScrollThumbTop] = useState(0);
  const [scrollThumbHeight, setScrollThumbHeight] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  // OK/EC/PX별 프로필 데이터
  const profileData = {
    OK: {
      name: "정이안",
      nameEng: "Jung Ian",
      gender: "여",
      birthDate: "2002.02.02",
      city: "서울특별시",
      district: "강남구",
      phone: "010-1***-****",
      email: "gildong@naver.com",
      school: "성균관대학교",
      major: "사학과",
      major2: "",
      major3: "",
      enrollPeriod: "2025.03",
      graduationStatus: "재학중",
      gpa: "3.0",
      gpaMax: "4.5",
      photo: "/images/0/cluster 1/shape.png",
      quote: "가장 어두운 순간에도 앞으로 한 걸음 내딛는 자에게 길이 열린다가장 어두운 순간에도 앞으로 한 걸음 내딛는 자에게 길이 열린다",
      lightColor: "#FFEC8F",
      accentColor: "#FFC300",
    },
    EC: {
      name: "박민주",
      nameEng: "Park Minju",
      gender: "남",
      birthDate: "2000.05.15",
      city: "경기도",
      district: "성남시 분당구",
      phone: "010-2***-****",
      email: "pmj_design@gmail.com",
      school: "한양대학교",
      major: "산업디자인학과",
      major2: "UX디자인학과",
      major3: "",
      enrollPeriod: "2019.03 ~ 2023.02",
      graduationStatus: "졸업",
      gpa: "3.8",
      gpaMax: "4.5",
      photo: "/images/0/cluster 1/EC00.png",
      quote: "디자인은 단순한 외형이 아니라 사용자의 경험을 설계하는 것이다. 좋은 디자인은 보이지 않는 곳에서 빛난다",
      lightColor: "#FF98A6",
      accentColor: "#FF4B70",
    },
    PX: {
      name: "이동민",
      nameEng: "Lee Dongmin",
      gender: "남",
      birthDate: "1999.11.22",
      city: "서울특별시",
      district: "마포구",
      phone: "010-3***-****",
      email: "dongmin.dev@kakao.com",
      school: "연세대학교",
      major: "컴퓨터과학과",
      major2: "인공지능학과",
      major3: "",
      enrollPeriod: "2018.03 ~ 2022.02",
      graduationStatus: "졸업",
      gpa: "4.1",
      gpaMax: "4.5",
      photo: "/images/0/cluster 1/PX00.png",
      quote: "코드 한 줄 한 줄에 사용자를 향한 진심을 담는다. 기술은 사람을 위해 존재해야 한다",
      lightColor: "#B2FF8F",
      accentColor: "#36DA60",
    },
  };

  // 현재 선택된 프로필 가져오기 (기본값)
  const defaultProfile = profileData[debugPanelType];

  // 실제 표시할 프로필 (마운트 후 유저 프로필이 있으면 사용, 없으면 기본값)
  const currentProfile =
    isMounted && userProfile
      ? {
          ...defaultProfile,
          name: userProfile.name,
          nameEng: userProfile.nameEng,
          gender: userProfile.gender,
          birthDate: userProfile.birthDate,
          city: userProfile.city,
          district: userProfile.district,
          phone: userProfile.phone,
          email: userProfile.email,
          school: userProfile.school,
          major: userProfile.major,
          major2: userProfile.major2,
          major3: userProfile.major3,
          enrollPeriod: userProfile.enrollPeriod,
          graduationStatus: userProfile.graduationStatus,
          gpa: userProfile.gpa,
          gpaMax: userProfile.gpaMax,
          quote: userProfile.quote || defaultProfile.quote,
          photo: userProfile.photo || defaultProfile.photo,
        }
      : defaultProfile;

  // 페이지 로드 시 프로필 데이터 가져오기 (캐시 활용)
  const fetchUserProfile = async (forceRefresh?: boolean) => {
    // targetUserId가 있으면 해당 사용자, 없으면 로그인 사용자
    if (!targetUserId && !session) return;

    try {
      // ProfileContext의 캐시된 데이터 사용 (페이지 이동 시 재호출 방지)
      let cachedResult = await fetchCachedProfile(targetUserId || undefined, forceRefresh);

      // targetUserId로 조회 실패 시, 로그인 사용자 본인 프로필로 폴백 시도
      if ((!cachedResult || !cachedResult.data) && targetUserId && session?.user?.id) {
        const fallbackResult = await fetchCachedProfile(undefined, true);
        if (fallbackResult?.data?.id === session.user.id) {
          // 본인 프로필인지 확인: 세션 ID가 URL의 userId를 포함하는지 체크 (UUID 잘림 대응)
          if (session.user.id === targetUserId || session.user.id.startsWith(targetUserId)) {
            cachedResult = fallbackResult;
            setIsOwner(true);
          }
        }
      }

      if (!cachedResult || !cachedResult.data) {
        console.error("Failed to fetch profile from cache");
        console.log("[hasData] cachedResult 실패로 false 설정", cachedResult);
        setHasData(false);
        setHasSeasonData(false);
        return;
      }

      const result = {
        success: true,
        data: cachedResult.data,
        completionRate: cachedResult.completionRate,
        reliabilityRate: cachedResult.reliabilityRate,
        practicalCounts: cachedResult.practicalCounts,
        badges: cachedResult.badges,
        seasonHistories: cachedResult.seasonHistories,
      };

      if (result.success && result.data) {
        console.log("[hasData] true로 설정됨");
        setHasData(true);
        const profile = result.data;

        // 본인 여부 확인
        const currentUserId = session?.user?.id;
        const fetchedProfileId = profile.id;
        console.log("[isOwner] session.user.id:", currentUserId, "| targetUserId:", targetUserId, "| profile.id:", fetchedProfileId);
        if (currentUserId) {
          const ownerCheck = !targetUserId || targetUserId === currentUserId || fetchedProfileId === currentUserId;
          console.log("[isOwner] 결과:", ownerCheck, "| !targetUserId:", !targetUserId, "| url일치:", targetUserId === currentUserId, "| profile일치:", fetchedProfileId === currentUserId);
          setIsOwner(ownerCheck);
        }
        const addressParts = (profile.address || "").split(" ");

        setUserProfile({
          name: profile.display_name || "",
          nameEng: profile.eng_name || "",
          gender: profile.gender || "",
          birthDate: profile.birth_date ? profile.birth_date.replace(/-/g, ".") : "",
          city: addressParts[0] || "",
          district: addressParts.slice(1).join(" ") || "",
          phone: profile.phone ? profile.phone.replace(/-/g, "").replace(/(\d{3})(\d{1})\d{3}(\d{4})/, "$1-$2***-****") : "",
          email: profile.email || "",
          school: "",
          major: "",
          major2: "",
          major3: "",
          enrollPeriod: "",
          graduationStatus: "",
          gpa: "",
          gpaMax: "",
          quote: profile.bio || "",
          photo: profile.profile_photo_url || "",
        });

        // 학력 + 슬로건 데이터 병렬 로드 (성능 최적화)
        Promise.all([fetchEducations(), fetchSlogan()]);

        // DB status → crewStatus 매핑
        const statusMap: Record<string, "Running" | "Complete" | "On Rest" | "Recharging" | "Next Challenge"> = {
          active: "Running",
          weekly_rest: "On Rest",
          seasonal_rest: "Recharging",
          graduated: "Complete",
          suspended: "Next Challenge",
        };
        if (profile.status && statusMap[profile.status]) {
          setCrewStatus(statusMap[profile.status]);
        }

        // completionRate (활동 완료율) - API 응답에서 가져오기
        if (result.completionRate !== undefined && result.completionRate !== null) {
          setHasCompletionData(true);
          setCompletionRate(result.completionRate);
        } else {
          setHasCompletionData(false);
          setCompletionRate(null);
        }

        // reliabilityRate (일정 신뢰도) - API 응답에서 가져오기 (별도 supabase 쿼리 불필요)
        if (result.reliabilityRate !== undefined && result.reliabilityRate !== null) {
          setHasReliabilityData(true);
          setReliabilityRate(result.reliabilityRate);
        } else {
          setHasReliabilityData(false);
          setReliabilityRate(null);
        }

        // 스킬 카드 데이터 - API 응답에서 가져오기 (중복 호출 제거)
        if (result.practicalCounts) {
          const { competency, experience, info, career } = result.practicalCounts;
          setPracticalCompetency(competency);
          setPracticalExperience(experience);
          setPracticalInfo(info);
          setPracticalCareer(career);
          setHasActivityData(competency > 0 || experience > 0 || info > 0 || career > 0);
        } else {
          setHasActivityData(false);
        }

        // 배지 데이터 설정 (별, 번개, 방패)
        if (result.badges) {
          setBadgeData(result.badges);
          setHasBadgeData(true);
        } else {
          setHasBadgeData(false);
        }

        // 시즌 히스토리 데이터 설정
        if (result.seasonHistories && result.seasonHistories.length > 0) {
          setSeasonHistories(result.seasonHistories);
          setHasSeasonData(true);
        } else {
          setHasSeasonData(false);
        }
      }
    } catch (error) {
      console.error("프로필 로드 오류:", error);
      console.log("[hasData] catch에서 false로 설정됨", error);
      setHasData(false);
      setHasSeasonData(false);
    }
  };

  // 학력 데이터 가져오기 (최종학력)
  const fetchEducations = async () => {
    try {
      const apiUrl = targetUserId ? `/api/educations?userId=${targetUserId}` : "/api/educations";
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        // 최종학력 (isFinal: true) 찾기
        const finalEducation = result.data.find((edu: { isFinal: boolean }) => edu.isFinal);
        if (finalEducation) {
          setUserProfile((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              school: finalEducation.school || "",
              major: finalEducation.major1 || "",
              major2: finalEducation.major2 || "",
              major3: finalEducation.major3 || "",
              enrollPeriod: finalEducation.period || "",
              graduationStatus: finalEducation.status || "",
              gpa: finalEducation.gradeValue || "",
              gpaMax: finalEducation.gradeMax || "",
            };
          });
        }
      }
    } catch (error) {
      console.error("학력 로드 오류:", error);
    }
  };

  // 슬로건 데이터 가져오기 (user_introductions에서)
  const fetchSlogan = async () => {
    try {
      const apiUrl = targetUserId ? `/api/slogans?userId=${targetUserId}` : "/api/slogans";
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success && result.data?.slogan1?.content) {
        setUserProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            quote: result.data.slogan1.content,
          };
        });
      }
    } catch (error) {
      console.error("슬로건 로드 오류:", error);
    }
  };

  // 세션 또는 targetUserId 변경 시 프로필 로드
  useEffect(() => {
    if (session || targetUserId) {
      fetchUserProfile();
    }
  }, [session, targetUserId]);

  // Error state for validation
  const [errors, setErrors] = useState({
    lastName: "",
    firstName: "",
    lastNameEng: "",
    firstNameEng: "",
    email: "",
  });

  // 한글만 허용하는 검증 함수
  const isKoreanOnly = (text: string) => {
    const koreanRegex = /^[가-힣]*$/;
    return koreanRegex.test(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, field: "lastName" | "firstName", maxLength: number) => {
    const { value } = e.target;

    if (value.length <= maxLength) {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (value && !isKoreanOnly(value)) {
        setErrors((prev) => ({ ...prev, [field]: "한글만 입력해주세요" }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  // 영문 이름 입력 핸들러
  const isEnglishOnly = (text: string) => /^[a-zA-Z\s]*$/.test(text);

  const handleEngNameChange = (e: React.ChangeEvent<HTMLInputElement>, field: "lastNameEng" | "firstNameEng", maxLength: number) => {
    const { value } = e.target;

    if (value.length <= maxLength) {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (value && !isEnglishOnly(value)) {
        setErrors((prev) => ({ ...prev, [field]: "영문만 입력해주세요" }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  // 필수 필드 유효성 검사 (학력 관련 필드 제외 - 별도 섹션에서 입력)
  const validateForm = () => {
    const requiredFields = [
      { key: "lastName", label: "성" },
      { key: "firstName", label: "이름" },
      { key: "gender", label: "성별" },
      { key: "birthDate", label: "생년월일" },
      { key: "addressCity", label: "시/도" },
      { key: "addressDistrict", label: "구/군" },
      { key: "phone", label: "핸드폰번호" },
      { key: "emailId", label: "이메일" },
      { key: "emailDomain", label: "이메일 도메인" },
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      const value = formData[field.key as keyof typeof formData];
      if (!value || value.trim() === "") {
        missingFields.push(field.label);
      }
    }

    // 직접입력 이메일 도메인 체크
    if (formData.emailDomain === "직접입력" && (!formData.customEmailDomain || formData.customEmailDomain.trim() === "")) {
      missingFields.push("이메일 도메인 (직접입력)");
    }

    return missingFields;
  };

  // 승인 상태 확인 함수
  const checkApprovalStatus = async () => {
    if (!session) return false;

    try {
      setIsCheckingStatus(true);
      const response = await fetch("/api/auth/check-status");
      const result = await response.json();

      if (result.success && result.status === "approved") {
        setIsApproved(true);
        return true;
      } else {
        setIsApproved(false);
        return false;
      }
    } catch (error) {
      console.error("승인 상태 확인 오류:", error);
      setIsApproved(false);
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 프로필 데이터 로드 함수
  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile/");
      const result = await response.json();

      if (result.success && result.data) {
        const profile = result.data;

        // user_profiles → formData 변환
        // 한글 이름 분리: 공백이 있으면 공백 기준, 없으면 첫 글자(또는 2글자 성)를 성으로 분리
        const displayName = profile.display_name || "";
        let lastName = "";
        let firstName = "";
        if (displayName.includes(" ")) {
          const displayNameParts = displayName.split(" ");
          lastName = displayNameParts[0] || "";
          firstName = displayNameParts.slice(1).join(" ") || "";
        } else if (displayName.length > 0) {
          // 2글자 성 목록 (복성)
          const twoCharLastNames = ["남궁", "제갈", "황보", "선우", "독고", "동방", "사공", "서문", "소봉", "장곡"];
          const firstTwo = displayName.substring(0, 2);
          if (displayName.length > 2 && twoCharLastNames.includes(firstTwo)) {
            lastName = firstTwo;
            firstName = displayName.substring(2);
          } else {
            lastName = displayName.substring(0, 1);
            firstName = displayName.substring(1);
          }
        }

        const engNameParts = (profile.eng_name || "").split(" ");
        const lastNameEng = engNameParts[0] || "";
        const firstNameEng = engNameParts.slice(1).join(" ") || "";

        const addressParts = (profile.address || "").split(" ");
        const addressCity = addressParts[0] || "";
        const addressDistrict = addressParts.slice(1).join(" ") || "";

        const emailParts = (profile.email || "").split("@");
        const emailId = emailParts[0] || "";
        const emailDomain = emailParts[1] || "";

        const phoneParts = (profile.phone || "").replace(/^010-?/, "").split("-");

        setFormData((prev) => ({
          ...prev,
          lastName,
          firstName,
          lastNameEng,
          firstNameEng,
          gender: profile.gender === "남" ? "male" : profile.gender === "여" ? "female" : "",
          birthDate: profile.birth_date || "",
          addressCity,
          addressDistrict,
          phone: phoneParts.length >= 2 ? `${phoneParts[0]}-${phoneParts[1]}` : profile.phone?.replace(/^010-?/, "") || "",
          emailId,
          emailDomain,
          vision: profile.vision || "",
          phoneComment: profile.contact_available || "",
        }));
      }
    } catch (error) {
      console.error("프로필 로드 오류:", error);
    }
  };

  // 프로필 수정 버튼 클릭 핸들러
  const handleEditButtonClick = async () => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }

    const approved = await checkApprovalStatus();

    if (!approved) {
      alert("아직 회원 상태가 어드민 승인 대기 중입니다.");
      return;
    }

    // 승인된 경우 프로필 로드 후 모달 열기
    await loadProfile();
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = validateForm();

    if (missingFields.length > 0) {
      alert(`다음 필드를 입력해주세요:\n${missingFields.join(", ")}`);
      return;
    }

    try {
      setIsSaving(true);

      // formData → user_profiles 필드 변환
      const profileData = {
        display_name: `${formData.lastName}${formData.firstName}`.trim(),
        eng_name: `${formData.lastNameEng}${formData.firstNameEng}`.trim(),
        gender: formData.gender === "male" ? "남" : formData.gender === "female" ? "여" : null,
        birth_date: formData.birthDate || null,
        address: `${formData.addressCity} ${formData.addressDistrict}`.trim(),
        phone: formData.phone ? `010-${formData.phone}` : null,
        email: formData.emailId && formData.emailDomain ? `${formData.emailId}@${formData.emailDomain === "직접입력" ? formData.customEmailDomain : formData.emailDomain}` : null,
        vision: formData.vision || null,
        portfolio_files: iconLink3 || null,
        contact_available: formData.phoneComment || null,
      };

      const response = await fetch("/api/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        alert("프로필이 성공적으로 저장되었습니다.");
        setIsEditModalOpen(false);
        // 캐시 무효화 후 프로필 데이터 새로고침
        clearProfileCache();
        fetchUserProfile(true);
      } else {
        alert(result.error || "프로필 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      alert("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 일정 신뢰도(reliability_rate) - fetchUserProfile에서 /api/profile 응답으로 처리하므로 별도 쿼리 불필요
  // (성능 최적화: 중복 supabase 쿼리 제거)

  // 활동 완료율: fetchUserProfile에서 /api/profile 응답으로 처리하므로 별도 쿼리 불필요
  // (RLS 정책으로 인해 클라이언트 직접 쿼리 시 실패)
  /*
  useEffect(() => {
    const fetchCompletionRate = async () => {
      const userId = targetUserId || session?.user?.id;
      console.log('[Sidebar] fetchCompletionRate 시작, userId:', userId);
      if (!userId) {
        console.log('[Sidebar] userId 없음, return');
        setHasCompletionData(false);
        setCompletionRate(null);
        return;
      }

      try {
        // 1. 유저의 가입 주차 정보 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("joined_week_id")
          .eq("id", userId)
          .maybeSingle();

        console.log('[Sidebar] profileData:', profileData, 'profileError:', profileError);

        if (profileError || !profileData?.joined_week_id) {
          console.log('[Sidebar] joined_week_id 없음, return');
          setHasCompletionData(false);
          setCompletionRate(null);
          return;
        }

        // 2. 가입 주차의 시작일 가져오기
        const { data: joinedWeekData, error: weekError } = await supabase
          .from("weeks")
          .select("start_date")
          .eq("id", profileData.joined_week_id)
          .maybeSingle();

        if (weekError || !joinedWeekData?.start_date) {
          setHasCompletionData(false);
          setCompletionRate(null);
          return;
        }

        const joinedWeekStartDate = joinedWeekData.start_date;

        // 3. 가입 주차 이후의 모든 주차 ID 가져오기 (break 시즌 제외)
        const { data: weeksData, error: weeksError } = await supabase
          .from("weeks")
          .select("id, season_id, seasons(name)")
          .gte("start_date", joinedWeekStartDate);

        console.log('[Sidebar] weeksData:', weeksData?.length, 'weeksError:', weeksError);

        if (weeksError || !weeksData) {
          setHasCompletionData(false);
          setCompletionRate(null);
          return;
        }

        // break 시즌 주차 제외
        const validWeekIds = weeksData
          .filter((w: { seasons: { name: string } | null }) => {
            // seasons가 null이면 포함 (break 시즌이 아님)
            if (!w.seasons) return true;
            return !w.seasons.name?.toLowerCase().includes('break');
          })
          .map((w: { id: string }) => w.id);

        console.log('[Sidebar] validWeekIds:', validWeekIds.length);

        if (validWeekIds.length === 0) {
          setHasCompletionData(false);
          setCompletionRate(null);
          return;
        }

        // 4. P: 가입 주차 이후 열린 모든 활동 수 (weekly_activities에서 is_active=true)
        const { data: weeklyActivitiesData, error: waError } = await supabase
          .from("weekly_activities")
          .select("week_id, activity_type_id")
          .in("week_id", validWeekIds)
          .eq("is_active", true);

        if (waError) {
          setHasCompletionData(false);
          setCompletionRate(null);
          return;
        }

        const totalP = weeklyActivitiesData?.length || 0;
        console.log('[Sidebar] totalP (열린 활동 수):', totalP);

        // 5. R: 완료한 활동 수 (activity_records에서 is_completed=true)
        const { data: activityRecordsData, error: arError } = await supabase
          .from("activity_records")
          .select("week_id, activity_type_id")
          .eq("user_id", userId)
          .eq("is_completed", true);

        if (arError) {
          console.error('[Sidebar] activity_records 오류:', arError);
          setHasCompletionData(false);
          setCompletionRate(null);
          return;
        }

        const totalR = activityRecordsData?.length || 0;
        console.log('[Sidebar] totalR (완료한 활동 수):', totalR);

        // 6. 활동 이행율 계산: (R / P) × 100
        if (totalP === 0) {
          console.log('[Sidebar] totalP가 0이라 completionRate를 null로 설정');
          setHasCompletionData(false);
          setCompletionRate(null);
        } else {
          const rate = Math.round((totalR / totalP) * 100);
          console.log('[Sidebar] completionRate 계산 결과:', rate, '%');
          setHasCompletionData(true);
          setCompletionRate(rate);
        }
      } catch (err) {
        console.error("활동 완료율 조회 오류:", err);
        setHasCompletionData(false);
        setCompletionRate(null);
      }
    };

    fetchCompletionRate();
  }, [session?.user?.id, targetUserId]);
  */

  // 스킬 카드 데이터 - fetchUserProfile에서 /api/profile 응답으로 처리하므로 별도 호출 불필요
  // (성능 최적화: 중복 API 호출 제거)

  useEffect(() => {
    // 0에서 올라가는 애니메이션
    const animateNumber = (setter: (val: number) => void, target: number, duration: number = 1000) => {
      const steps = 30;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;

        if (step >= steps) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, duration / steps);

      return timer;
    };

    // 프로필별 데이터 설정
    const profileStats = {
      OK: {
        stat1: 100,
        stat2: 80,
        badge1: 99999,
        badge2: 99999,
        badge3: -9999,
        skill1: 21,
        skill2: 21,
        skill3: 21,
        skill4: 21,
      },
      EC: {
        stat1: Math.floor(Math.random() * 100) + 1,
        stat2: Math.floor(Math.random() * 100) + 1,
        badge1: Math.floor(Math.random() * 99999) + 1,
        badge2: Math.floor(Math.random() * 99999) + 1,
        badge3: -(Math.floor(Math.random() * 9999) + 1),
        skill1: Math.floor(Math.random() * 99) + 1,
        skill2: Math.floor(Math.random() * 99) + 1,
        skill3: Math.floor(Math.random() * 99) + 1,
        skill4: Math.floor(Math.random() * 99) + 1,
      },
      PX: {
        stat1: Math.floor(Math.random() * 100) + 1,
        stat2: Math.floor(Math.random() * 100) + 1,
        badge1: Math.floor(Math.random() * 90) + 10,
        badge2: Math.floor(Math.random() * 900) + 100,
        badge3: -(Math.floor(Math.random() * 90) + 10),
        skill1: Math.floor(Math.random() * 99) + 1,
        skill2: Math.floor(Math.random() * 99) + 1,
        skill3: Math.floor(Math.random() * 99) + 1,
        skill4: Math.floor(Math.random() * 99) + 1,
      },
    };

    const currentStats = profileStats[debugPanelType];

    const timers = [
      animateNumber(setStat1, currentStats.stat1, 1000),
      animateNumber(setStat2, currentStats.stat2, 1000),
      // 배지 데이터는 실제 API 데이터 사용 (hasBadgeData가 true인 경우)
      animateNumber(setBadge1, hasBadgeData ? badgeData.stars : currentStats.badge1, 1000), // 별 (단감)
      animateNumber(setBadge2, hasBadgeData ? badgeData.shields : currentStats.badge2, 1000), // 방패 (인절미) - DB에서 이미 계산된 값
      animateNumber(setBadge3, hasBadgeData ? (badgeData.lightnings > 0 ? -badgeData.lightnings : 0) : currentStats.badge3, 1000), // 번개 (어흥) - 0보다 클 때만 음수로 표시
      animateNumber(setSkill1, currentStats.skill1, 1000),
      animateNumber(setSkill2, currentStats.skill2, 1000),
      animateNumber(setSkill3, currentStats.skill3, 1000),
      animateNumber(setSkill4, currentStats.skill4, 1000),
    ];

    return () => {
      timers.forEach((timer) => clearInterval(timer));
    };
  }, [debugPanelType, hasBadgeData, badgeData]);

  // 커스텀 스크롤바 업데이트
  const updateScrollbar = useCallback(() => {
    const container = activitiesRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const trackHeight = clientHeight;
    const thumbHeight = 44;
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setScrollThumbTop(thumbTop);
  }, []);

  // 테마 변경 시 스크롤 위치 리셋 + 스크롤바 업데이트
  useEffect(() => {
    const container = activitiesRef.current;
    if (!container) return;

    container.scrollTop = 0;
    setScrollThumbTop(0);
  }, [debugPanelType]);

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = activitiesRef.current?.scrollTop || 0;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !activitiesRef.current) return;

      const container = activitiesRef.current;
      const { scrollHeight, clientHeight } = container;
      const trackHeight = clientHeight;
      const thumbHeight = 44;
      const maxThumbTop = trackHeight - thumbHeight;
      const maxScrollTop = scrollHeight - clientHeight;

      const deltaY = e.clientY - dragStartY.current;
      const scrollRatio = maxScrollTop / maxThumbTop;
      const newScrollTop = dragStartScrollTop.current + deltaY * scrollRatio;

      container.scrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Hydration 에러 방지: 마운트 전에는 빈 placeholder 반환
  if (!isMounted) {
    return (
      <div className="home-two-sidebar-col">
        <div
          style={{
            width: "474px",
            height: "870px",
            backgroundColor: "#1a1a2e",
            borderRadius: "12px",
          }}
        />
      </div>
    );
  }

  // ★ 모바일: 슬라이드 패널 전체를 body에 Portal 렌더링
  const sidebarContent = (
    <div className="home-two-sidebar-col">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        .arrow-shake {
          animation: shake 0.4s ease-in-out;
        }
        .custom-tooltip {
          position: fixed;
          background: rgba(30, 32, 40, 0.95);
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 14px;
          color: #fff;
          white-space: nowrap;
          z-index: 9999;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          font-family: 'Pretendard', sans-serif;
          pointer-events: none;
        }
        .resume-activities::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
        }
        .resume-activities {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .modal-input::placeholder {
          color: #6b6e7a !important;
        }
        .modal-input::-webkit-input-placeholder {
          color: #6b6e7a !important;
        }
        .modal-input::-moz-placeholder {
          color: #6b6e7a !important;
        }
        .modal-input:-ms-input-placeholder {
          color: #6b6e7a !important;
        }
        .chamfer-box {
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
        }
      `,
        }}
      />
      {/* 스케일된 카드 - 비율 유지하며 화면에 맞춤 */}
      <div
        style={{
          // transform scale은 레이아웃 크기를 바꾸지 않기 때문에,
          // 확대(>1) 시에는 wrapper의 레이아웃 폭도 함께 늘려 "잘림"을 방지한다.
          width: isMobileView ? "100%" : cardScale > 1 ? `${482 * cardScale}px` : "var(--sidebar-width, 482px)",
          height: isMobileView ? "auto" : `${870 * cardScale}px`,
          overflow: isMobileView || cardScale > 1 ? "visible" : "hidden",
          display: isMobileView ? "block" : "flex",
          justifyContent: isMobileView ? undefined : "center",
        }}
      >
        <div
          className={`resume-card ${debugPanelType === "EC" ? "ec-theme" : debugPanelType === "PX" ? "px-theme" : ""}`}
          style={{
            position: "relative",
            ...(isMobileView ? {} : { transform: `scale(${cardScale})`, transformOrigin: "top center" }),
          }}
        >
          {/* 프로필 수정 버튼: resume-card(고정 크기, position:relative) 기준 absolute 배치 — 콘텐츠 로딩/스크롤 무관 */}
          {isOwner && (
            <button
              onClick={handleEditButtonClick}
              style={{
                position: "absolute",
                top: "220px",
                right: "20px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: debugPanelType === "EC" ? "#FF4B70" : debugPanelType === "PX" ? "#36DA60" : "#FFA500",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 20,
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                padding: 0,
              }}
            >
              <i className="ti ti-pencil" style={{ fontSize: "14px", color: "#fff" }}></i>
            </button>
          )}
          {/* Header Section */}
          <div className="resume-header" style={{ position: "relative" }}>
            <div className="resume-photo" style={{ position: "relative" }}>
              {hasData ? (
                <Image src={currentProfile.photo} alt="Profile" width={240} height={273} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#999",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: "14px", fontFamily: "Pretendard, sans-serif" }}>사진을 등록하세요.</span>
                </div>
              )}
            </div>

            {/* Hexagon Buttons */}
            <div
              style={{
                position: "absolute",
                left: "213px",
                top: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                zIndex: 10,
              }}
            >
              <button
                onClick={() => iconLink1 && window.open(iconLink1, "_blank")}
                style={{
                  width: "24px",
                  height: "24px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  overflow: "visible",
                  position: "relative",
                }}
                aria-label="hexagon button 1"
                onMouseEnter={() => setTooltipVisible("hexagon1")}
                onMouseLeave={() => setTooltipVisible(null)}
                onMouseMove={(e) => setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 })}
              >
                <Image src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/ec.png" : debugPanelType === "PX" ? "/images/0/cluster 1/PX06.png" : "/images/0/cluster 1/00.png"} alt="" width={24} height={24} className="hexagon-border" style={{ display: "block" }} />
                <Image src="/images/0/cluster 1/001.png" alt="" width={12} height={12} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
              </button>

              <button
                onClick={() => iconLink2 && window.open(iconLink2, "_blank")}
                style={{
                  width: "24px",
                  height: "24px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  overflow: "visible",
                  position: "relative",
                }}
                aria-label="hexagon button 2"
                onMouseEnter={() => setTooltipVisible("hexagon2")}
                onMouseLeave={() => setTooltipVisible(null)}
                onMouseMove={(e) => setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 })}
              >
                <Image src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/ec.png" : debugPanelType === "PX" ? "/images/0/cluster 1/PX06.png" : "/images/0/cluster 1/00.png"} alt="" width={24} height={24} className="hexagon-border" style={{ display: "block" }} />
                <Image src="/images/0/cluster 1/002.png" alt="" width={12} height={12} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
              </button>

              <button
                onClick={() => iconLink3 && window.open(iconLink3, "_blank")}
                style={{
                  width: "24px",
                  height: "24px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  overflow: "visible",
                  position: "relative",
                }}
                aria-label="hexagon button 3"
                onMouseEnter={() => setTooltipVisible("hexagon3")}
                onMouseLeave={() => setTooltipVisible(null)}
                onMouseMove={(e) => setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 })}
              >
                <Image src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/ec.png" : debugPanelType === "PX" ? "/images/0/cluster 1/PX06.png" : "/images/0/cluster 1/00.png"} alt="" width={24} height={24} className="hexagon-border" style={{ display: "block" }} />
                <Image src="/images/0/cluster 1/003.png" alt="" width={12} height={12} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
              </button>
            </div>

            <div className="resume-info">
              {hasData ? (
                <>
                  <h1 className="resume-name">
                    <span
                      className={`back-arrow ${isArrowShaking ? "arrow-shake" : ""}`}
                      style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}
                      onClick={() => {
                        setIsArrowShaking(true);
                        setTimeout(() => setIsArrowShaking(false), 400);
                      }}
                    >
                      <Image src="/images/0/cluster 1/small icon/Chevron_Right_MD.png" alt="" width={18} height={18} />
                    </span>
                    {currentProfile.name} <span className="name-eng">{currentProfile.nameEng}</span>
                  </h1>

                  <div className="resume-details">
                    <div className="detail-row">
                      <Image src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/User_01-ec.png" : debugPanelType === "PX" ? "/images/0/cluster 1/small icon/User_01-px.png" : "/images/0/cluster 1/small icon/User_01.png"} alt="" width={16} height={16} className="detail-icon" />
                      <span>
                        <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.gender}{" "}
                        <Image
                          src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/Gift-ec.png" : debugPanelType === "PX" ? "/images/0/cluster 1/small icon/Gift-px.png" : "/images/0/cluster 1/small icon/Gift.png"}
                          alt=""
                          width={13}
                          height={13}
                          className="detail-icon"
                          style={{ display: "inline-block", verticalAlign: "text-bottom", margin: "0 2px" }}
                        />{" "}
                        <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.birthDate}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Image src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/Building_03-ec (2).png" : debugPanelType === "PX" ? "/images/0/cluster 1/small icon/House_01-px.png" : "/images/0/cluster 1/small icon/House_01.png"} alt="" width={16} height={16} className="detail-icon" />
                      <span>
                        <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.city} {currentProfile.district}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Image
                        src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/Mobile_Button-ec.png" : debugPanelType === "PX" ? "/images/0/cluster 1/small icon/Mobile_Button-px.png" : "/images/0/cluster 1/small icon/Mobile_Button.png"}
                        alt=""
                        width={16}
                        height={16}
                        className="detail-icon"
                      />
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.phone}
                        {isOwner && (
                          <span
                            onClick={async () => {
                              // 모달 열기 전에 기존 값 로드
                              try {
                                const response = await fetch("/api/profile/");
                                const result = await response.json();
                                if (result.success && result.data) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    phoneComment: result.data.contact_available || "",
                                  }));
                                }
                              } catch (error) {
                                console.error("연락처 코멘트 로드 오류:", error);
                              }
                              setIsPhoneCommentModalOpen(true);
                            }}
                            style={{
                              color: currentProfile.accentColor,
                              fontSize: "14px",
                              fontWeight: "400",
                              lineHeight: "1",
                              cursor: "pointer",
                            }}
                          >
                            +
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Image src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/Mail -ec.png" : debugPanelType === "PX" ? "/images/0/cluster 1/small icon/Mail-px.png" : "/images/0/cluster 1/small icon/Mail.png"} alt="" width={16} height={16} className="detail-icon" />
                      <span
                        onMouseEnter={() => setTooltipVisible("email")}
                        onMouseMove={(e) => setTooltipPosition({ x: e.clientX + 12, y: e.clientY - 8 })}
                        onMouseLeave={() => setTooltipVisible(null)}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                          cursor: "default",
                        }}
                      >
                        <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.email}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Image
                        src={debugPanelType === "EC" ? "/images/0/cluster 1/small icon/Building_03-ec (1).png" : debugPanelType === "PX" ? "/images/0/cluster 1/small icon/Building_03-px.png" : "/images/0/cluster 1/small icon/Building_03.png"}
                        alt=""
                        width={16}
                        height={16}
                        className="detail-icon"
                      />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                          cursor: "default",
                        }}
                      >
                        <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.school} <span style={{ color: currentProfile.lightColor }}>{currentProfile.major}</span>
                      </span>
                    </div>

                    <div className="detail-row">
                      <span style={{ width: "16px" }}></span>
                      <span className="sub-text" style={{ color: currentProfile.lightColor }}>
                        <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.enrollPeriod}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                    padding: "20px 0",
                    paddingLeft: "40px",
                    marginTop: "-5px",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      fontFamily: "Pretendard, sans-serif",
                      textAlign: "left",
                    }}
                  >
                    정보를 입력하세요.
                  </span>
                </div>
              )}
              {hasData && (
                <div className="resume-details">
                  <div className="detail-row">
                    <span style={{ width: "16px" }}></span>
                    <span className="sub-text">
                      <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.gpa} <span style={{ color: "#999999" }}>/{currentProfile.gpaMax}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Introduction Box */}
          <div className="resume-intro">
            <Image src="/images/0/cluster 1/Image.png" alt="" width={24} height={24} className="intro-icon" />
            {hasData ? currentProfile.quote : <span style={{ color: "#888", fontSize: "20px" }}>내용을 작성해주세요.</span>}
          </div>

          {/* Three Column Section - 영역 4, 5, 6 side by side */}
          <div className="resume-three-column">
            {/* Stats Section - 영역 4 */}
            <div className="resume-stats">
              <div className="stat-item">
                <div className="stat-row">
                  <span className="stat-label">
                    <span className="stat-dot">·</span> 일정 신뢰도
                  </span>
                  <span className="stat-value">
                    {hasReliabilityData ? reliabilityRate : "-"}
                    <span className="stat-unit">%</span>
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: hasReliabilityData ? `${reliabilityRate}%` : "0%" }}></div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-row">
                  <span className="stat-label">
                    <span className="stat-dot">·</span> 활동 완료율
                  </span>
                  <span className="stat-value">
                    {hasCompletionData ? completionRate : "-"}
                    <span className="stat-unit">%</span>
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: hasCompletionData ? `${completionRate}%` : "0%" }}></div>
                </div>
              </div>
            </div>

            {/* Badges Section - 영역 5 */}
            <div className="resume-badges">
              <div className="badge-group">
                <span className="badge-icon icon-graphic10"></span>
                <span className="badge-num">{hasData ? badge1.toLocaleString() : "-"}</span>
              </div>
              <div className="badge-group">
                <span className="badge-icon icon-shield"></span>
                <span className="badge-num">{hasData ? badge2.toLocaleString() : "-"}</span>
              </div>
              <div className="badge-group">
                <span className="badge-icon icon-graphic13"></span>
                <span className="badge-num red">{hasData ? badge3.toLocaleString() : "-"}</span>
              </div>
            </div>

            {/* Medal Badge - 영역 6 */}
            <div className={`resume-medal ${crewStatus === "Complete" ? "no-overlay" : ""}`}>
              <div className="medal-image-wrapper">
                <Image src={debugPanelType === "EC" ? "/images/0/cluster 1/금장_EC.png" : debugPanelType === "PX" ? "/images/0/cluster 1/금장_PX.png" : "/images/0/cluster 1/금장_OK.png"} alt="Medal" width={98} height={98} />
              </div>
              <div className={`medal-text ${crewStatus === "Next Challenge" ? "long" : crewStatus === "Recharging" ? "medium" : crewStatus === "Complete" ? "short-medium" : ""}`}>{crewStatus}</div>
            </div>
          </div>

          {/* Activities */}
          <div style={{ position: "relative", width: "474px", height: "95px" }}>
            {hasData ? (
              <>
                <div
                  ref={activitiesRef}
                  className="resume-activities"
                  onScroll={updateScrollbar}
                  style={
                    {
                      width: "100%",
                      height: "100%",
                      overflowY: "scroll",
                      overflowX: "hidden",
                      padding: 0,
                      margin: 0,
                      display: "block",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    } as React.CSSProperties
                  }
                >
                  {/* 시즌 히스토리 동적 렌더링 */}
                  {hasSeasonData && seasonHistories.length > 0 ? (
                    seasonHistories.map((history, index) => {
                      const progressStatus = getProgressStatus(history.progress_status);
                      const reviewStatus = getReviewStatus(history.review_status);
                      const yearShort = String(history.seasons.year).slice(-2);
                      const seasonKorean = seasonNameKorean[history.seasons.name] || history.seasons.name;
                      const roleText = roleKorean[history.role_in_season] || history.role_in_season;
                      const avatarImage = getAvatarImage(index);

                      return (
                        <div className="activity-row" key={history.id}>
                          <div className="activity-avatar">
                            <Image src={avatarImage} alt="" width={36} height={36} />
                          </div>
                          <div className="activity-content">
                            <div className="activity-line">
                              <span className="activity-season">
                                {yearShort}, {seasonKorean}
                                <span style={{ color: "#999" }}>시즌</span>
                              </span>
                              <span className="activity-period">
                                {history.approved_weeks}주 <span style={{ color: "#999" }}>/ {history.total_weeks}주</span>
                              </span>
                              <span className="activity-role">{roleText}</span>
                              <span className={`activity-badge ${progressStatus.className}`}>{progressStatus.text}</span>
                              <span className={`activity-check ${reviewStatus.className}`}>{reviewStatus.text}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="activity-row">
                      <div className="activity-content" style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                        시즌 활동 기록이 없습니다.
                      </div>
                    </div>
                  )}
                </div>

                {/* 커스텀 스크롤바 */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: "2px",
                    height: "100%",
                    background: "#2a2a2a",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    ref={scrollThumbRef}
                    onMouseDown={handleMouseDown}
                    style={{
                      position: "absolute",
                      top: `${scrollThumbTop}px`,
                      width: "100%",
                      height: 44,
                      background: debugPanelType === "PX" ? "#36DA60" : debugPanelType === "EC" ? "#FF4B70" : "#FFA500",
                      borderRadius: "2px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div
                  className="resume-activities"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1C242F",
                    borderTop: "1px solid #666",
                  }}
                >
                  <span
                    style={{
                      color: "#888",
                      fontSize: "14px",
                      fontFamily: "Pretendard, sans-serif",
                    }}
                  >
                    활동 시작 전입니다.
                  </span>
                </div>
                {/* 스크롤바 트랙 영역 */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: "2px",
                    height: "100%",
                    background: "#2a2a2a",
                    borderRadius: "2px",
                  }}
                />
              </>
            )}
          </div>

          {/* Skill Cards and Footer Notices - with background */}
          <div className="resume-bottom-section">
            {/* Skill Cards */}
            <div className="resume-skills">
              <div className="skill-card">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%" }}>
                  <div className="skill-num-wrapper">
                    <Image src="/images/0/cluster 1/Sheriff Badge1 2.png" alt="" width={27} height={27} className="skill-icon" style={{ opacity: 0.8 }} />
                    <span className="skill-num" style={{ color: "#FFEB99" }}>
                      {hasActivityData ? practicalCompetency : "-"}
                    </span>
                    <span style={{ fontSize: "12px", fontFamily: "Pretendard, sans-serif", color: "#FFF", alignSelf: "flex-end", marginBottom: "4px", marginLeft: "2px" }}>unit</span>
                  </div>
                  <div className="skill-label">실무 역량 성장</div>
                </div>
              </div>
              <div className="skill-card">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%" }}>
                  <div className="skill-num-wrapper">
                    <Image src="/images/0/cluster 1/Sheriff Badge1.png" alt="" width={27} height={27} className="skill-icon" style={{ opacity: 0.8 }} />
                    <span className="skill-num" style={{ color: "#FFEB99" }}>
                      {hasActivityData ? practicalExperience : "-"}
                    </span>
                    <span style={{ fontSize: "12px", fontFamily: "Pretendard, sans-serif", color: "#FFF", alignSelf: "flex-end", marginBottom: "4px", marginLeft: "2px" }}>건</span>
                  </div>
                  <div className="skill-label">실무 경험 축적</div>
                </div>
              </div>
              <div className="skill-card">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%" }}>
                  <div className="skill-num-wrapper">
                    <Image src="/images/0/cluster 1/Sheriff Badge1 3.png" alt="" width={27} height={27} className="skill-icon" style={{ opacity: 0.8 }} />
                    <span className="skill-num" style={{ color: "#FFEB99" }}>
                      {hasActivityData ? practicalInfo : "-"}
                    </span>
                    <span style={{ fontSize: "12px", fontFamily: "Pretendard, sans-serif", color: "#FFF", alignSelf: "flex-end", marginBottom: "4px", marginLeft: "2px" }}>회</span>
                  </div>
                  <div className="skill-label">실무 정보 습득</div>
                </div>
              </div>
              <div className="skill-card">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%" }}>
                  <div className="skill-num-wrapper">
                    <Image src="/images/0/cluster 1/Sheriff Badge1 4.png" alt="" width={27} height={27} className="skill-icon" style={{ opacity: 0.8 }} />
                    <span className="skill-num" style={{ color: "#FFEB99" }}>
                      {hasActivityData ? practicalCareer : "-"}
                    </span>
                    <span style={{ fontSize: "12px", fontFamily: "Pretendard, sans-serif", color: "#FFF", alignSelf: "flex-end", marginBottom: "4px", marginLeft: "2px" }}>proj</span>
                  </div>
                  <div className="skill-label">실무 경력 누적</div>
                </div>
              </div>
            </div>

            {/* Footer Notices — 졸업(Complete) 크루에게만 도장 표시 */}
            <div className="resume-notices">
              <div className="notice-box yellow">
                <Image src="/images/0/cluster 1/Star Badge.png" alt="" width={25} height={25} className="notice-icon-img" />
                <span className="notice-text notice-text-top">{debugPanelType === "EC" ? "전국청춘연합 엔터테인먼트/미디어 클럽, 엥크레" : debugPanelType === "PX" ? "전국청춘연합 기획/컨설팅 클럽, 팔랑크스" : "전국청춘연합 마케팅/퍼포먼스 클럽, 오랑캐"}</span>
                <div className={`notice-stamp-wrapper${crewStatus === "Complete" ? " stamped" : ""}`}>
                  {crewStatus === "Complete" && <Image src="/images/0/cluster 1/오랑캐 도장.png" alt="" width={46} height={46} />}
                </div>
              </div>
              <div className="notice-box green">
                <Image src="/images/0/cluster 1/Star Badge2.png" alt="" width={25} height={25} className="notice-icon-img" />
                <span className="notice-text">전국청춘성장 클럽- 기업/실무자 후원 관리 위원회</span>
                <div className={`notice-stamp-wrapper${crewStatus === "Complete" ? " stamped" : ""}`}>
                  {crewStatus === "Complete" && <Image src="/images/0/cluster 1/실무기업 도장.png" alt="" width={46} height={46} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* 스케일 wrapper 닫기 */}
      {/* Contact Info Modal - For 타크루 프로필 */}
      {isEditModalOpen && debugProfileType === "타크루" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 99999,
            paddingTop: "20px",
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <Image src="/images/0/cluster 1/card01.png" alt="Contact Info" width={540} height={150} style={{ display: "block" }} />
            {/* X 닫기 버튼 */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Edit Profile Modal - For 본인 프로필 */}
      {isEditModalOpen &&
        debugProfileType === "본인" &&
        typeof document !== "undefined" &&
        createPortal(
          // overlay (부모 div) - 여기에 스크롤과 padding 추가
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              overflowY: "auto", // ← 여기 추가
              padding: "40px 0", // ← 여기 추가
            }}
            onClick={() => setIsEditModalOpen(false)}
          >
            {/* modal (자식 div) - maxHeight 제거 */}
            <div
              className="edit-modal-content"
              style={{
                backgroundColor: "#1a1d29",
                borderRadius: "8px",
                border: "1px solid #FFA500",
                boxShadow: "0 0 10px rgba(255, 165, 0, 0.15)",
                padding: "40px 32px 40px 40px", // ← 원래대로 40px
                width: "580px",
                maxHeight: "700px", // ← 제한 제거
                overflowY: "auto", // ← visible로 변경
                fontFamily: "'Pretendard', sans-serif",
                marginTop: "0px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h6 style={{ color: "#fff", fontSize: "20px", fontWeight: 600, margin: "0 0 30px 0" }}>프로필 수정</h6>

              <form onSubmit={handleSubmit}>
                {/* 성 & 이름 - 일렬 배치 */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                  {/* 성 */}
                  <div style={{ flex: 1 }}>
                    <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>성</label>
                    <input
                      className="modal-input chamfer-box"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleNameChange(e, "lastName", 2)}
                      maxLength={2}
                      placeholder="홍"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        backgroundColor: "#252836",
                        border: errors.lastName ? "1px solid #ff6b6b" : "1px solid transparent",
                        borderRadius: "0",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {errors.lastName && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "6px", display: "block" }}>{errors.lastName}</span>}
                  </div>

                  {/* 이름 */}
                  <div style={{ flex: 2 }}>
                    <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>이름</label>
                    <input
                      className="modal-input chamfer-box"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleNameChange(e, "firstName", 5)}
                      maxLength={5}
                      placeholder="길동"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        backgroundColor: "#252836",
                        border: errors.firstName ? "1px solid #ff6b6b" : "1px solid transparent",
                        borderRadius: "0",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {errors.firstName && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "6px", display: "block" }}>{errors.firstName}</span>}
                  </div>
                </div>

                {/* 영문 성 & 이름 - 일렬 배치 */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                  {/* 영문 성 */}
                  <div style={{ flex: 1 }}>
                    <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>영문 성</label>
                    <input
                      className="modal-input chamfer-box"
                      type="text"
                      name="lastNameEng"
                      value={formData.lastNameEng}
                      onChange={(e) => handleEngNameChange(e, "lastNameEng", 20)}
                      maxLength={20}
                      placeholder="Hong"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        backgroundColor: "#252836",
                        border: errors.lastNameEng ? "1px solid #ff6b6b" : "1px solid transparent",
                        borderRadius: "0",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {errors.lastNameEng && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "6px", display: "block" }}>{errors.lastNameEng}</span>}
                  </div>

                  {/* 영문 이름 */}
                  <div style={{ flex: 2 }}>
                    <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>영문 이름</label>
                    <input
                      className="modal-input chamfer-box"
                      type="text"
                      name="firstNameEng"
                      value={formData.firstNameEng}
                      onChange={(e) => handleEngNameChange(e, "firstNameEng", 30)}
                      maxLength={30}
                      placeholder="Gildong"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        backgroundColor: "#252836",
                        border: errors.firstNameEng ? "1px solid #ff6b6b" : "1px solid transparent",
                        borderRadius: "0",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {errors.firstNameEng && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "6px", display: "block" }}>{errors.firstNameEng}</span>}
                  </div>
                </div>

                {/* 성별 */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>성별</label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      className="chamfer-box"
                      onClick={() => setFormData((prev) => ({ ...prev, gender: "male" }))}
                      style={{
                        flex: 1,
                        padding: "14px 16px",
                        backgroundColor: formData.gender === "male" ? "#FFA500" : "#252836",
                        border: "1px solid transparent",
                        borderRadius: "0",
                        color: formData.gender === "male" ? "#1a1d29" : "#8a8d98",
                        fontSize: "16px",
                        fontWeight: formData.gender === "male" ? 600 : 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      남
                    </button>
                    <button
                      type="button"
                      className="chamfer-box"
                      onClick={() => setFormData((prev) => ({ ...prev, gender: "female" }))}
                      style={{
                        flex: 1,
                        padding: "14px 16px",
                        backgroundColor: formData.gender === "female" ? "#FFA500" : "#252836",
                        border: "1px solid transparent",
                        borderRadius: "0",
                        color: formData.gender === "female" ? "#1a1d29" : "#8a8d98",
                        fontSize: "16px",
                        fontWeight: formData.gender === "female" ? 600 : 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      여
                    </button>
                  </div>
                </div>

                {/* 생년월일 */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>생년월일</label>
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                  .edit-modal-content {
                    font-family: 'Pretendard', sans-serif !important;
                  }
                  .edit-modal-content * {
                    font-family: 'Pretendard', sans-serif !important;
                  }
                  .edit-modal-content::-webkit-scrollbar {
                    width: 8px;
                  }
                  .edit-modal-content::-webkit-scrollbar-track {
                    background: #252836;
                    border-radius: 4px;
                  }
                  .edit-modal-content::-webkit-scrollbar-thumb {
                    background: #FFA500;
                    border-radius: 4px;
                  }
                  .edit-modal-content::-webkit-scrollbar-thumb:hover {
                    background: #22c55e;
                  }
                  .custom-dropdown-list::-webkit-scrollbar {
                    width: 6px;
                  }
                  .custom-dropdown-list::-webkit-scrollbar-track {
                    background: #1a1d29;
                    border-radius: 3px;
                  }
                  .custom-dropdown-list::-webkit-scrollbar-thumb {
                    background: #FFA500;
                    border-radius: 3px;
                  }
                `,
                    }}
                  />
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {/* 년도 커스텀 드롭다운 */}
                    <div style={{ flex: 1.2, position: "relative" }}>
                      <div
                        className="chamfer-box"
                        onClick={() => setOpenDropdown(openDropdown === "year" ? null : "year")}
                        style={{
                          padding: "14px 12px",
                          backgroundColor: "#252836",
                          borderRadius: "0",
                          color: formData.birthDate.split("-")[0] ? "#fff" : "#6b6e7a",
                          fontSize: "14px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: openDropdown === "year" ? "1px solid #FFA500" : "1px solid transparent",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>{formData.birthDate.split("-")[0] ? `${formData.birthDate.split("-")[0]}년` : "년"}</span>
                        <span
                          style={{
                            transform: openDropdown === "year" ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                            fontSize: "10px",
                            color: "#8a8d98",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                      {openDropdown === "year" && (
                        <div
                          className="custom-dropdown-list"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            marginTop: "4px",
                            backgroundColor: "#1a1d29",
                            borderRadius: "8px",
                            border: "1px solid #333",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 100,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                          }}
                        >
                          {Array.from({ length: 56 }, (_, i) => 2025 - i).map((year) => (
                            <div
                              key={year}
                              onClick={() => {
                                const month = formData.birthDate.split("-")[1] || "";
                                const day = formData.birthDate.split("-")[2] || "";
                                setFormData((prev) => ({ ...prev, birthDate: `${year}-${month}-${day}` }));
                                setOpenDropdown(null);
                              }}
                              style={{
                                padding: "12px 14px",
                                color: formData.birthDate.split("-")[0] === String(year) ? "#FFA500" : "#fff",
                                backgroundColor: formData.birthDate.split("-")[0] === String(year) ? "rgba(255, 165, 0, 0.1)" : "transparent",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                borderBottom: "1px solid #252836",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.15)";
                                e.currentTarget.style.color = "#FFA500";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = formData.birthDate.split("-")[0] === String(year) ? "rgba(255, 165, 0, 0.1)" : "transparent";
                                e.currentTarget.style.color = formData.birthDate.split("-")[0] === String(year) ? "#FFA500" : "#fff";
                              }}
                            >
                              {year}년
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 월 커스텀 드롭다운 */}
                    <div style={{ flex: 1, position: "relative" }}>
                      <div
                        className="chamfer-box"
                        onClick={() => setOpenDropdown(openDropdown === "month" ? null : "month")}
                        style={{
                          padding: "14px 12px",
                          backgroundColor: "#252836",
                          borderRadius: "0",
                          color: formData.birthDate.split("-")[1] ? "#fff" : "#6b6e7a",
                          fontSize: "14px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: openDropdown === "month" ? "1px solid #FFA500" : "1px solid transparent",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>{formData.birthDate.split("-")[1] ? `${parseInt(formData.birthDate.split("-")[1])}월` : "월"}</span>
                        <span
                          style={{
                            transform: openDropdown === "month" ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                            fontSize: "10px",
                            color: "#8a8d98",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                      {openDropdown === "month" && (
                        <div
                          className="custom-dropdown-list"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            marginTop: "4px",
                            backgroundColor: "#1a1d29",
                            borderRadius: "8px",
                            border: "1px solid #333",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 100,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <div
                              key={month}
                              onClick={() => {
                                const year = formData.birthDate.split("-")[0] || "";
                                const day = formData.birthDate.split("-")[2] || "";
                                setFormData((prev) => ({ ...prev, birthDate: `${year}-${String(month).padStart(2, "0")}-${day}` }));
                                setOpenDropdown(null);
                              }}
                              style={{
                                padding: "12px 14px",
                                color: formData.birthDate.split("-")[1] === String(month).padStart(2, "0") ? "#FFA500" : "#fff",
                                backgroundColor: formData.birthDate.split("-")[1] === String(month).padStart(2, "0") ? "rgba(255, 165, 0, 0.1)" : "transparent",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                borderBottom: "1px solid #252836",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.15)";
                                e.currentTarget.style.color = "#FFA500";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = formData.birthDate.split("-")[1] === String(month).padStart(2, "0") ? "rgba(255, 165, 0, 0.1)" : "transparent";
                                e.currentTarget.style.color = formData.birthDate.split("-")[1] === String(month).padStart(2, "0") ? "#FFA500" : "#fff";
                              }}
                            >
                              {month}월
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 일 커스텀 드롭다운 */}
                    <div style={{ flex: 1, position: "relative" }}>
                      <div
                        className="chamfer-box"
                        onClick={() => setOpenDropdown(openDropdown === "day" ? null : "day")}
                        style={{
                          padding: "14px 12px",
                          backgroundColor: "#252836",
                          borderRadius: "0",
                          color: formData.birthDate.split("-")[2] ? "#fff" : "#6b6e7a",
                          fontSize: "14px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: openDropdown === "day" ? "1px solid #FFA500" : "1px solid transparent",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>{formData.birthDate.split("-")[2] ? `${parseInt(formData.birthDate.split("-")[2])}일` : "일"}</span>
                        <span
                          style={{
                            transform: openDropdown === "day" ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                            fontSize: "10px",
                            color: "#8a8d98",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                      {openDropdown === "day" && (
                        <div
                          className="custom-dropdown-list"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            marginTop: "4px",
                            backgroundColor: "#1a1d29",
                            borderRadius: "8px",
                            border: "1px solid #333",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 100,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                          }}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <div
                              key={day}
                              onClick={() => {
                                const year = formData.birthDate.split("-")[0] || "";
                                const month = formData.birthDate.split("-")[1] || "";
                                setFormData((prev) => ({ ...prev, birthDate: `${year}-${month}-${String(day).padStart(2, "0")}` }));
                                setOpenDropdown(null);
                              }}
                              style={{
                                padding: "12px 14px",
                                color: formData.birthDate.split("-")[2] === String(day).padStart(2, "0") ? "#FFA500" : "#fff",
                                backgroundColor: formData.birthDate.split("-")[2] === String(day).padStart(2, "0") ? "rgba(255, 165, 0, 0.1)" : "transparent",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                borderBottom: "1px solid #252836",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.15)";
                                e.currentTarget.style.color = "#FFA500";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = formData.birthDate.split("-")[2] === String(day).padStart(2, "0") ? "rgba(255, 165, 0, 0.1)" : "transparent";
                                e.currentTarget.style.color = formData.birthDate.split("-")[2] === String(day).padStart(2, "0") ? "#FFA500" : "#fff";
                              }}
                            >
                              {day}일
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 주소 */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>주소</label>
                  {!isCustomAddress ? (
                    <div style={{ display: "flex", gap: "12px" }}>
                      {/* 시/도 커스텀 드롭다운 */}
                      <div style={{ flex: 1, position: "relative" }}>
                        <div
                          className="chamfer-box"
                          onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")}
                          style={{
                            padding: "14px 12px",
                            backgroundColor: "#252836",
                            borderRadius: "0",
                            color: formData.addressCity ? "#fff" : "#6b6e7a",
                            fontSize: "14px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: openDropdown === "city" ? "1px solid #FFA500" : "1px solid transparent",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span>{formData.addressCity || "시/도 선택"}</span>
                          <span
                            style={{
                              transform: openDropdown === "city" ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                              fontSize: "10px",
                              color: "#8a8d98",
                            }}
                          >
                            ▼
                          </span>
                        </div>
                        {openDropdown === "city" && (
                          <div
                            className="custom-dropdown-list"
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              marginTop: "4px",
                              backgroundColor: "#1a1d29",
                              borderRadius: "8px",
                              border: "1px solid #333",
                              maxHeight: "200px",
                              overflowY: "auto",
                              zIndex: 100,
                              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                            }}
                          >
                            {Object.keys(koreaRegions).map((city) => (
                              <div
                                key={city}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, addressCity: city, addressDistrict: "" }));
                                  setOpenDropdown(null);
                                }}
                                style={{
                                  padding: "12px 14px",
                                  color: formData.addressCity === city ? "#FFA500" : "#fff",
                                  backgroundColor: formData.addressCity === city ? "rgba(255, 165, 0, 0.1)" : "transparent",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  borderBottom: "1px solid #252836",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.15)";
                                  e.currentTarget.style.color = "#FFA500";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = formData.addressCity === city ? "rgba(255, 165, 0, 0.1)" : "transparent";
                                  e.currentTarget.style.color = formData.addressCity === city ? "#FFA500" : "#fff";
                                }}
                              >
                                {city}
                              </div>
                            ))}
                            {/* 직접 입력 옵션 */}
                            <div
                              onClick={() => {
                                setIsCustomAddress(true);
                                setFormData((prev) => ({ ...prev, addressCity: "", addressDistrict: "" }));
                                setOpenDropdown(null);
                              }}
                              style={{
                                padding: "12px 14px",
                                color: "#FFA500",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                borderTop: "2px solid #333",
                                fontWeight: 500,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.15)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              직접 입력
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 구/군 커스텀 드롭다운 */}
                      <div style={{ flex: 1, position: "relative" }}>
                        <div
                          className="chamfer-box"
                          onClick={() => {
                            if (formData.addressCity) {
                              setOpenDropdown(openDropdown === "district" ? null : "district");
                            }
                          }}
                          style={{
                            padding: "14px 12px",
                            backgroundColor: "#252836",
                            borderRadius: "0",
                            color: formData.addressDistrict ? "#fff" : "#6b6e7a",
                            fontSize: "14px",
                            cursor: formData.addressCity ? "pointer" : "not-allowed",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: openDropdown === "district" ? "1px solid #FFA500" : "1px solid transparent",
                            transition: "all 0.2s ease",
                            opacity: formData.addressCity ? 1 : 0.6,
                          }}
                        >
                          <span>{formData.addressDistrict || "구/군 선택"}</span>
                          <span
                            style={{
                              transform: openDropdown === "district" ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                              fontSize: "10px",
                              color: "#8a8d98",
                            }}
                          >
                            ▼
                          </span>
                        </div>
                        {openDropdown === "district" && formData.addressCity && (
                          <div
                            className="custom-dropdown-list"
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              marginTop: "4px",
                              backgroundColor: "#1a1d29",
                              borderRadius: "8px",
                              border: "1px solid #333",
                              maxHeight: "200px",
                              overflowY: "auto",
                              zIndex: 100,
                              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                            }}
                          >
                            {koreaRegions[formData.addressCity]?.map((district) => (
                              <div
                                key={district}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, addressDistrict: district }));
                                  setOpenDropdown(null);
                                }}
                                style={{
                                  padding: "12px 14px",
                                  color: formData.addressDistrict === district ? "#FFA500" : "#fff",
                                  backgroundColor: formData.addressDistrict === district ? "rgba(255, 165, 0, 0.1)" : "transparent",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  borderBottom: "1px solid #252836",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.15)";
                                  e.currentTarget.style.color = "#FFA500";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = formData.addressDistrict === district ? "rgba(255, 165, 0, 0.1)" : "transparent";
                                  e.currentTarget.style.color = formData.addressDistrict === district ? "#FFA500" : "#fff";
                                }}
                              >
                                {district}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* 직접 입력 모드 */
                    <div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <input
                          className="modal-input chamfer-box"
                          type="text"
                          name="customAddress"
                          value={formData.customAddress}
                          onChange={handleInputChange}
                          placeholder="해외 또는 기타 주소를 입력해주세요 (예: 미국 캘리포니아, 독도)"
                          style={{
                            flex: 1,
                            padding: "14px 16px",
                            backgroundColor: "#252836",
                            border: "1px solid #FFB84D",
                            borderRadius: "0",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          type="button"
                          className="chamfer-box"
                          onClick={() => {
                            setIsCustomAddress(false);
                            setFormData((prev) => ({ ...prev, customAddress: "" }));
                          }}
                          style={{
                            padding: "14px 16px",
                            backgroundColor: "#252836",
                            border: "1px solid #555",
                            borderRadius: "0",
                            color: "#8a8d98",
                            fontSize: "14px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#FFA500";
                            e.currentTarget.style.color = "#FFA500";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#555";
                            e.currentTarget.style.color = "#8a8d98";
                          }}
                        >
                          목록에서 선택
                        </button>
                      </div>
                      <span style={{ color: "#8a8d98", fontSize: "12px", marginTop: "8px", display: "block" }}>해외 거주자 또는 특수 지역 거주자는 주소를 직접 입력해주세요.</span>
                    </div>
                  )}
                </div>

                {/* 핸드폰 번호 */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>핸드폰 번호</label>
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                  .phone-input::placeholder {
                    color: #6b6e7a;
                  }
                `,
                    }}
                  />
                  {(() => {
                    const phoneMid = formData.phone.split("-")[0] || "";
                    const phoneLast = formData.phone.split("-")[1] || "";
                    return (
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        {/* 010 고정 */}
                        <div
                          className="chamfer-box"
                          style={{
                            width: "70px",
                            flexShrink: 0,
                            padding: "14px 16px",
                            backgroundColor: "#1a1d29",
                            border: "1px solid #333",
                            borderRadius: "0",
                            color: "#fff",
                            fontSize: "14px",
                            fontWeight: 500,
                            textAlign: "center",
                          }}
                        >
                          010
                        </div>
                        <span style={{ color: "#555", fontSize: "16px", padding: "0 8px" }}>-</span>
                        {/* 중간 4자리 */}
                        <input
                          type="text"
                          name="phoneMid"
                          className="phone-input modal-input chamfer-box"
                          value={phoneMid}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                            setFormData((prev) => ({ ...prev, phone: `${value}-${phoneLast}` }));
                          }}
                          maxLength={4}
                          placeholder="0000"
                          style={{
                            width: "100px",
                            flexShrink: 0,
                            padding: "14px 16px",
                            backgroundColor: "#252836",
                            border: "1px solid transparent",
                            borderRadius: "0",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <span style={{ color: "#555", fontSize: "16px", padding: "0 8px" }}>-</span>
                        {/* 마지막 4자리 */}
                        <input
                          type="text"
                          name="phoneLast"
                          className="phone-input modal-input chamfer-box"
                          value={phoneLast}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                            setFormData((prev) => ({ ...prev, phone: `${phoneMid}-${value}` }));
                          }}
                          maxLength={4}
                          placeholder="0000"
                          style={{
                            width: "100px",
                            flexShrink: 0,
                            padding: "14px 16px",
                            backgroundColor: "#252836",
                            border: "1px solid transparent",
                            borderRadius: "0",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* 이메일 */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>이메일</label>
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    {/* 이메일 아이디 입력 */}
                    <input
                      className="modal-input chamfer-box"
                      type="text"
                      name="emailId"
                      value={formData.emailId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({ ...prev, emailId: value }));

                        // 이메일 아이디 형식 검증 (영문, 숫자, ., _, - 만 허용)
                        const emailIdRegex = /^[a-zA-Z0-9._-]*$/;
                        if (value && !emailIdRegex.test(value)) {
                          setErrors((prev) => ({ ...prev, email: "이메일 아이디는 영문, 숫자, ., _, - 만 사용 가능합니다" }));
                        } else if (value && value.length < 2) {
                          setErrors((prev) => ({ ...prev, email: "이메일 아이디는 2자 이상 입력해주세요" }));
                        } else {
                          setErrors((prev) => ({ ...prev, email: "" }));
                        }
                      }}
                      placeholder="example"
                      style={{
                        flex: 1,
                        padding: "14px 16px",
                        backgroundColor: "#252836",
                        border: errors.email ? "1px solid #ff6b6b" : "1px solid transparent",
                        borderRadius: "0",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    />
                    <span style={{ color: "#555", fontSize: "16px", padding: "0 8px" }}>@</span>
                    {/* 이메일 도메인 드롭다운 또는 직접 입력 */}
                    {!isCustomEmailDomain ? (
                      <div style={{ flex: 1, position: "relative" }}>
                        <div
                          className="chamfer-box"
                          onClick={() => setOpenDropdown(openDropdown === "emailDomain" ? null : "emailDomain")}
                          style={{
                            padding: "14px 12px",
                            backgroundColor: "#252836",
                            borderRadius: "0",
                            color: formData.emailDomain ? "#fff" : "#6b6e7a",
                            fontSize: "14px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: openDropdown === "emailDomain" ? "1px solid #FFA500" : "1px solid transparent",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span>{formData.emailDomain || "선택"}</span>
                          <span
                            style={{
                              transform: openDropdown === "emailDomain" ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                              fontSize: "10px",
                              color: "#8a8d98",
                            }}
                          >
                            ▼
                          </span>
                        </div>
                        {openDropdown === "emailDomain" && (
                          <div
                            className="custom-dropdown-list"
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              marginTop: "4px",
                              backgroundColor: "#1a1d29",
                              borderRadius: "8px",
                              border: "1px solid #333",
                              maxHeight: "200px",
                              overflowY: "auto",
                              zIndex: 100,
                              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                            }}
                          >
                            {["naver.com", "gmail.com", "daum.net", "hanmail.net", "kakao.com", "nate.com", "outlook.com", "icloud.com"].map((domain) => (
                              <div
                                key={domain}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, emailDomain: domain }));
                                  setOpenDropdown(null);
                                }}
                                style={{
                                  padding: "12px 14px",
                                  color: formData.emailDomain === domain ? "#FFA500" : "#fff",
                                  backgroundColor: formData.emailDomain === domain ? "rgba(255, 165, 0, 0.1)" : "transparent",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  borderBottom: "1px solid #252836",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.15)";
                                  e.currentTarget.style.color = "#FFA500";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = formData.emailDomain === domain ? "rgba(255, 165, 0, 0.1)" : "transparent";
                                  e.currentTarget.style.color = formData.emailDomain === domain ? "#FFA500" : "#fff";
                                }}
                              >
                                {domain}
                              </div>
                            ))}
                            {/* 직접 입력 옵션 */}
                            <div
                              onClick={() => {
                                setIsCustomEmailDomain(true);
                                setFormData((prev) => ({ ...prev, emailDomain: "" }));
                                setOpenDropdown(null);
                              }}
                              style={{
                                padding: "12px 14px",
                                color: "#FFA500",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                borderTop: "2px solid #333",
                                fontWeight: 500,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.15)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              직접 입력
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          className="modal-input chamfer-box"
                          type="text"
                          name="customEmailDomain"
                          value={formData.customEmailDomain}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-Z0-9.-]/g, "");
                            setFormData((prev) => ({ ...prev, customEmailDomain: value }));
                          }}
                          placeholder="domain.com"
                          style={{
                            flex: 1,
                            padding: "14px 16px",
                            backgroundColor: "#252836",
                            border: "1px solid #FFB84D",
                            borderRadius: "0",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          type="button"
                          className="chamfer-box"
                          onClick={() => {
                            setIsCustomEmailDomain(false);
                            setFormData((prev) => ({ ...prev, customEmailDomain: "" }));
                          }}
                          style={{
                            padding: "14px 12px",
                            backgroundColor: "#252836",
                            border: "1px solid #555",
                            borderRadius: "0",
                            color: "#8a8d98",
                            fontSize: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#FFA500";
                            e.currentTarget.style.color = "#FFA500";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#555";
                            e.currentTarget.style.color = "#8a8d98";
                          }}
                        >
                          목록
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.email && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "8px", display: "block" }}>{errors.email}</span>}
                </div>

                {/* 비전 섹션 */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>비전</label>
                  <input
                    className="modal-input chamfer-box"
                    type="text"
                    name="vision"
                    value={formData.vision}
                    onChange={(e) => {
                      if (e.target.value.length <= 10) {
                        setFormData((prev) => ({ ...prev, vision: e.target.value }));
                      }
                    }}
                    placeholder="가고 싶은 기업/브랜드를 기재합니다. (ex.구글)"
                    maxLength={10}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      backgroundColor: "#252836",
                      border: "1px solid transparent",
                      borderRadius: "0",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <span style={{ color: "#8a8d98", fontSize: "11px", marginTop: "4px", display: "block" }}>{formData.vision.length}/10자 (공백 포함)</span>
                </div>

                {/* 연계 링크 */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "#8a8d98", fontSize: "14px", display: "block", marginBottom: "10px" }}>연계 링크</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ color: "#8a8d98", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Image src="/images/0/cluster 1/003.png" alt="" width={16} height={16} />
                        Portfolio Files
                      </label>
                      <input
                        className="modal-input chamfer-box"
                        type="url"
                        value={iconLink3}
                        onChange={(e) => handleIconLinkChange(e.target.value, 3)}
                        placeholder="https://example.com"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          backgroundColor: "#252836",
                          border: iconLinkErrors.link3 ? "1px solid #ff6b6b" : "1px solid transparent",
                          borderRadius: "0",
                          color: "#fff",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      {iconLinkErrors.link3 && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "6px", display: "block" }}>{iconLinkErrors.link3}</span>}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: "100%",
                    height: "1px",
                    backgroundColor: "#3a3d4a",
                    margin: "16px 0 32px 0",
                  }}
                />

                {/* Submit Button */}
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                @font-face {
                  font-family: 'Cafe24Ohsquare';
                  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Cafe24Ohsquare.woff') format('woff');
                  font-weight: normal;
                  font-style: normal;
                }
                .submit-btn-cafe {
                  font-family: 'Cafe24Ohsquare', sans-serif !important;
                }
              `,
                  }}
                />
                <button
                  type="submit"
                  className="chamfer-box submit-btn-cafe"
                  style={{
                    width: "100%",
                    padding: "16px",
                    backgroundColor: "#FFA500",
                    border: "none",
                    borderRadius: "0",
                    color: "#1a1d29",
                    fontSize: "20px",
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "0.5px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  작성완료
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
      {/* 핸드폰 코멘트 모달 - 타크루 프로필용 (안내 팝업) */}
      {isPhoneCommentModalOpen && debugProfileType === "타크루" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => setIsPhoneCommentModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#1a1d29",
              borderRadius: "16px",
              padding: "24px",
              width: "90%",
              maxWidth: "480px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
              {/* 전화 아이콘 */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Image src="/images/0/cluster 1/phone-only-dynamic-color.png" alt="phone" width={28} height={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.4,
                    fontFamily: "Pretendard, sans-serif",
                  }}
                >
                  연락이 필요하시면, 하단 내용을 참고해주세요 :)
                </h3>
              </div>
              <button
                onClick={() => setIsPhoneCommentModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#8a8d98",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
            {/* 내용 */}
            <div
              style={{
                backgroundColor: "#252836",
                borderRadius: "12px",
                padding: "16px 20px",
                marginTop: "16px",
              }}
            >
              <p style={{ color: "#ffffff", fontSize: "16px", margin: 0, lineHeight: 1.6, fontFamily: "Pretendard, sans-serif", wordBreak: "keep-all" }}>
                저는 평일 9~23시까지 언제든 연락이 가능합니다 :)
                <br />
                주말에는 10~24시까지 연락이 가능합니다. 수요일 5시는 어려워요!
              </p>
            </div>
          </div>
        </div>
      )}
      {/* 핸드폰 코멘트 모달 - 본인 프로필용 (입력 폼) */}
      {isPhoneCommentModalOpen && debugProfileType === "본인" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => setIsPhoneCommentModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#1a1d29",
              borderRadius: "16px",
              padding: "24px",
              width: "90%",
              maxWidth: "480px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
              {/* 전화 아이콘 */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Image src="/images/0/cluster 1/phone-only-dynamic-color.png" alt="phone" width={28} height={28} />
              </div>
              <div>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  연락이 가능한 시간대와 코멘트를 작성해 주세요 :)
                </h3>
                <p
                  style={{
                    color: "#8a8d98",
                    fontSize: "14px",
                    margin: "2px 0 0 0",
                  }}
                >
                  최대 70자까지 작성 가능합니다
                </p>
              </div>
            </div>

            {/* 입력 필드 */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
              .phone-comment-input::placeholder {
                color: #999;
              }
            `,
              }}
            />
            <div style={{ marginTop: "20px" }}>
              <input
                className="phone-comment-input"
                type="text"
                value={formData.phoneComment}
                onChange={(e) => {
                  if (e.target.value.length <= 70) {
                    setFormData((prev) => ({ ...prev, phoneComment: e.target.value }));
                  }
                }}
                placeholder="내용을 작성해 주세요."
                maxLength={70}
                style={{
                  width: "100%",
                  padding: "16px",
                  backgroundColor: "#252836",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* 작성 완료 버튼 */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @font-face {
                font-family: 'Cafe24Ohsquare';
                src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Cafe24Ohsquare.woff') format('woff');
                font-weight: normal;
                font-style: normal;
              }
              .phone-modal-btn {
                font-family: 'Cafe24Ohsquare', sans-serif !important;
              }
            `,
              }}
            />
            <button
              className="chamfer-box phone-modal-btn"
              onClick={async () => {
                try {
                  const response = await fetch("/api/profile/", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contact_available: formData.phoneComment || null }),
                  });
                  const result = await response.json();
                  if (result.success) {
                    setIsPhoneCommentModalOpen(false);
                  } else {
                    alert("저장 실패: " + (result.error || "알 수 없는 오류"));
                  }
                } catch (error) {
                  console.error("연락처 코멘트 저장 오류:", error);
                  alert("저장 중 오류가 발생했습니다.");
                }
              }}
              style={{
                width: "70%",
                marginTop: "20px",
                marginLeft: "auto",
                marginRight: "auto",
                display: "block",
                padding: "12px 24px",
                backgroundColor: "#FFA500",
                border: "none",
                color: "#000",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
              }}
            >
              작성 완료
            </button>
          </div>
        </div>
      )}
      {/* 커스텀 툴팁 */}
      {tooltipVisible && (
        <div
          className="custom-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            ...(tooltipVisible === "major" && {
              background: "transparent",
              padding: 0,
              boxShadow: "none",
              borderRadius: 0,
            }),
          }}
        >
          {tooltipVisible === "email" && currentProfile.email}
          {tooltipVisible === "school" && currentProfile.school}
          {tooltipVisible === "major" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                background: "rgba(20, 20, 20, 0.95)",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "12px 16px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                minWidth: "180px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: currentProfile.accentColor, fontSize: "10px" }}>●</span>
                <span style={{ color: "#666", fontSize: "11px" }}>전공 1</span>
                <span style={{ color: "#fff", fontSize: "13px" }}>{currentProfile.major}</span>
              </div>
              {currentProfile.major2 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: currentProfile.lightColor, fontSize: "10px" }}>●</span>
                  <span style={{ color: "#666", fontSize: "11px" }}>전공 2</span>
                  <span style={{ color: "#fff", fontSize: "13px" }}>{currentProfile.major2}</span>
                </div>
              )}
              {currentProfile.major3 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: "#888", fontSize: "10px" }}>●</span>
                  <span style={{ color: "#666", fontSize: "11px" }}>전공 3</span>
                  <span style={{ color: "#fff", fontSize: "13px" }}>{currentProfile.major3}</span>
                </div>
              )}
            </div>
          )}
          {tooltipVisible === "hexagon1" && "Club Community"}
          {tooltipVisible === "hexagon2" && "Life Resume"}
          {tooltipVisible === "hexagon3" && "Portfolio Files"}
        </div>
      )}
    </div>
  );

  // ★ 모바일: Portal로 슬라이드 패널 렌더링
  if (isMobileView && isMounted) {
    return (
      <>
        {/* 세로 탭 버튼 — 항상 왼쪽에 고정 */}
        {createPortal(
          <button
            onClick={() => setIsProfileOpen(true)}
            style={{
              position: "fixed",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 9989,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              background: isProfileOpen ? "transparent" : "linear-gradient(180deg, #FAAB07 0%, #e09600 100%)",
              color: "#000",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "3px",
              padding: isProfileOpen ? "0" : "16px 7px",
              borderRadius: "0 8px 8px 0",
              cursor: "pointer",
              userSelect: "none" as const,
              boxShadow: isProfileOpen ? "none" : "2px 2px 12px rgba(250, 171, 7, 0.3)",
              border: "none",
              fontFamily: "Pretendard, sans-serif",
              opacity: isProfileOpen ? 0 : 1,
              pointerEvents: isProfileOpen ? ("none" as const) : ("auto" as const),
              transition: "opacity 0.2s ease",
            }}
          >
            PROFILE
          </button>,
          document.body,
        )}

        {/* 오버레이 + 슬라이드 패널 */}
        {createPortal(
          <>
            {/* 배경 오버레이 */}
            <div
              onClick={() => setIsProfileOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.6)",
                zIndex: 9990,
                opacity: isProfileOpen ? 1 : 0,
                pointerEvents: isProfileOpen ? "auto" : "none",
                transition: "opacity 0.3s ease",
              }}
            />

            {/* 슬라이드 패널 */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "380px",
                maxWidth: "85vw",
                background: "#0a0a0a",
                zIndex: 9991,
                transform: isProfileOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                overflowY: "auto",
                overflowX: "hidden",
                borderRight: isProfileOpen ? "1px solid #FAAB07" : "1px solid #333",
                boxShadow: isProfileOpen ? "4px 0 20px rgba(0, 0, 0, 0.5)" : "none",
              }}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => setIsProfileOpen(false)}
                style={{
                  position: "sticky",
                  top: "12px",
                  float: "right",
                  marginRight: "12px",
                  width: "32px",
                  height: "32px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid #444",
                  borderRadius: "50%",
                  color: "#ccc",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                ✕
              </button>

              {/* 실제 사이드바 콘텐츠 */}
              {sidebarContent}
            </div>
          </>,
          document.body,
        )}
      </>
    );
  }

  // ★ 데스크톱: 기존 그대로
  return sidebarContent;
};

export default Sidebar;
