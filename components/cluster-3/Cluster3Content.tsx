"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { isDemoMode as checkDemoMode } from "@/utils/isDemoMode";
import { useModalScroll } from "@/utils/useModalScroll";
import { CLUSTER3_DUMMY_PROFILE, CLUSTER3_DUMMY_ARCHIVES, CLUSTER3_DUMMY_ARCHIVE_CHANNELS, CLUSTER3_DUMMY_OUTPUTS, CLUSTER3_DUMMY_OUTPUT_CHANNELS, CLUSTER3_DUMMY_DETAILS, CLUSTER3_DUMMY_DETAIL_CHANNELS, CLUSTER3_DUMMY_BY_USER, DEFAULT_DEMO_USER } from "@/constants/dummyData";
import { CLUSTER3_CHANNEL_DEFAULTS, createInitialChannelCards } from "@/constants/dummyData/cluster3-section-default";

// 커스텀 드롭다운 (네이티브 <option>은 cursor 스타일 미지원)
const CustomSelect = ({ value, onChange, options, className, style }: { value: string; onChange: (val: string) => void; options: { value: string; label: string }[]; className?: string; style?: React.CSSProperties }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || "선택하세요";

  return (
    <div ref={ref} className={`${className || ""} custom-select-wrapper`} style={style}>
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        {selectedLabel}
      </div>
      {isOpen && (
        <div className="custom-select-options">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`custom-select-option${opt.value === value ? " selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Cluster3Content = () => {
  // 세션 및 본인 프로필 여부 확인
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId") || searchParams.get("userID");
  const demoNameParam = searchParams.get("demoName");
  const demoLookupName = demoNameParam || urlUserId;
  const isOwner = !urlUserId || session?.user?.id === urlUserId;
  const isDemoMode = checkDemoMode();

  // scrollTo query parameter 처리 (Sidebar hex3에서 이동 시)
  useEffect(() => {
    const scrollTarget = searchParams.get("scrollTo");
    if (scrollTarget) {
      const timer = setTimeout(() => {
        const section = document.querySelector("." + scrollTarget);
        if (section) {
          const offset = 120;
          window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
        }
        window.history.replaceState({}, "", window.location.pathname);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }

    const approved = await checkApprovalStatus();

    if (!approved) {
      alert("아직 회원 상태가 어드민 승인 대기 중입니다.");
      return;
    }

    openModalFn();
  };

  const section1Ref = useRef<HTMLElement>(null);

  // 현재 활성화된 슬라이드 인덱스
  const [activeSlide, setActiveSlide] = useState(0);

  // 일정 신뢰도 프로그레스 애니메이션 (섹션 1)
  const [progressOffset, setProgressOffset] = useState(393); // 시작: 0%
  const [progressPercent, setProgressPercent] = useState(0); // 퍼센트 숫자
  const [reliabilityRate, setReliabilityRate] = useState<number | null>(50);
  const [hasReliabilityData, setHasReliabilityData] = useState(true);

  // 성장 진행 상태 데이터
  interface GrowthInfo {
    status: string;
    growthStatus: string;
    startDate: string | null;
    endDate: string | null;
  }
  const [growthInfo, setGrowthInfo] = useState<GrowthInfo | null>({
    status: "active",
    growthStatus: "pending",
    startDate: "2025-02-22",
    endDate: null,
  });

  // 영어 이름
  const [engName, setEngName] = useState<string>("Eng Name");

  // 성장 점수 기록 데이터 (단감, 인절미, 어흥)
  interface PointsData {
    dangam: number; // 단감 (star)
    injeolmi: number; // 인절미 (shield - lightning)
    eoheung: number; // 어흥 (lightning)
  }
  const [pointsData, setPointsData] = useState<PointsData>({ dangam: 0, injeolmi: 0, eoheung: 0 });

  // 품계 데이터 (user_grade_stats)
  interface GradeStats {
    avgPercentile: number; // 상위 퍼센트
    grade: number; // 품계 숫자 (1=정승, 2=정1품, ... 10=정9품)
    gradeLabel: string; // 품계 라벨 (정 7품 등)
  }
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);

  // 성장 기간 집계 데이터 (user_growth_stats)
  interface GrowthPeriodStats {
    approvedWeeks: number; // 성장(성공) 주차
    unapprovedWeeks: number; // 성장(실패) 주차
    restWeeks: number; // 휴식(개인) 주차
    clubBreakWeeks: number; // 휴식(공식) 주차
    availableWeeks: number; // 성장 가능 주차
    restSeasons: number; // 성장 휴식 시즌
    approvedSeasons: number; // 성장(성공) 시즌
  }
  const [growthPeriodStats, setGrowthPeriodStats] = useState<GrowthPeriodStats | null>(null);

  // 성장 상태 표시 (DB에 저장된 값 그대로 또는 영문값 변환)
  const getGrowthStatusText = (status: string, growthStatus: string): string => {
    // 이미 한글로 저장된 경우 그대로 반환
    const koreanStatuses = ["클럽 온보딩 중", "활동 중", "휴식(개인) 중", "휴식(공식) 중", "시즌 휴식 중", "성장 유보", "성장 중단", "졸업 절차 중", "성장 완료(졸업)", "추가 성장 중"];

    if (koreanStatuses.includes(growthStatus)) {
      // '활동 중'은 '성장 중'으로 표시
      if (growthStatus === "활동 중") return "성장 중";
      return growthStatus;
    }

    // 영문 growthStatus 값 변환 (10개)
    if (growthStatus === "pending") return "클럽 온보딩 중";
    if (growthStatus === "active") return "성장 중";
    if (growthStatus === "resting") return "휴식(개인) 중";
    if (growthStatus === "official_rest") return "휴식(공식) 중";
    if (growthStatus === "season_rest") return "시즌 휴식 중";
    if (growthStatus === "deferred") return "성장 유보";
    if (growthStatus === "suspended") return "성장 중단";
    if (growthStatus === "graduating") return "졸업 절차 중";
    if (growthStatus === "graduated") return "성장 완료(졸업)";
    if (growthStatus === "reinforcing") return "추가 성장 중";

    return "클럽 온보딩 중";
  };

  // 날짜 포맷 변환 (2025-02-22 → 2025년 02월 22일 (토))
  const formatDateKorean = (dateStr: string | null): string => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  // 섹션 2 프로그레스 바 애니메이션
  const [section2Progress, setSection2Progress] = useState(0);
  const [section2Percent, setSection2Percent] = useState(0); // 퍼센트 숫자
  const section2Ref = useRef<HTMLElement>(null);

  // 섹션 2 품계 카드 애니메이션
  const [highlightedRank, setHighlightedRank] = useState(-1); // -1: 애니메이션 전
  const [animationComplete, setAnimationComplete] = useState(false);

  // 섹션 2 상위 퍼센트 애니메이션
  const [topPercent, setTopPercent] = useState(0);

  // 화살표 애니메이션 (섹션별)
  const [arrowAnimating, setArrowAnimating] = useState<string | null>(null);

  const handleArrowClick = (section: string) => {
    if (!arrowAnimating) {
      setArrowAnimating(section);
      setTimeout(() => setArrowAnimating(null), 600);
    }
  };

  // 섹션 4 버튼 바운스 애니메이션
  const [bouncingBtn, setBouncingBtn] = useState<string | null>(null);

  const handleBtnClick = (btn: string) => {
    if (!bouncingBtn) {
      setBouncingBtn(btn);
      setTimeout(() => setBouncingBtn(null), 500);
    }
  };

  // 섹션 3 페이지네이션
  const [section3Page, setSection3Page] = useState(0);

  // 모달 상태 관리
  const [section3ModalOpen, setSection3ModalOpen] = useState(false);
  const [section4ModalOpen, setSection4ModalOpen] = useState(false);
  const [section5ModalOpen, setSection5ModalOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [section3FooterNotice, setSection3FooterNotice] = useState<"default" | "error">("default");
  const MAX_CARDS = 16;

  // 모달 body refs (체크3: 필수 미입력 시 스크롤 이동)
  const section3ModalBodyRef = useRef<HTMLDivElement>(null);
  const section4ModalBodyRef = useRef<HTMLDivElement>(null);
  const section5ModalBodyRef = useRef<HTMLDivElement>(null);

  const [showHelpModal, setShowHelpModal] = useState(false);

  // 필수 미입력 시 스크롤 이동 + 하이라이트
  const validateAndScrollToEmpty = (bodyRef: React.RefObject<HTMLDivElement | null>, links: string[], channels: string[]): boolean => {
    if (!bodyRef.current) return true;
    const items = bodyRef.current.querySelectorAll(".link-edit-item:not(.disabled)");
    let firstInvalid: Element | null = null;

    items.forEach((item, idx) => {
      const input = item.querySelector("input");
      const linkVal = links[idx]?.trim() || "";
      const channelVal = channels[idx] || "";
      const isIncomplete = (linkVal && !channelVal) || (!linkVal && channelVal);

      if (isIncomplete) {
        (item as HTMLElement).style.border = "1px solid #ff4444";
        if (!firstInvalid) firstInvalid = item;
      } else {
        (item as HTMLElement).style.border = "";
      }
    });

    if (firstInvalid) {
      (firstInvalid as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  // 모달 열릴 때 배경 스크롤 잠금
  const anyModalOpen = section3ModalOpen || section4ModalOpen || section5ModalOpen;
  useModalScroll(anyModalOpen);

  // section3 모달 열 때 보기 모드로 초기화
  useEffect(() => {
    if (section3ModalOpen) {
      setIsEditMode(false);
      setSection3FooterNotice("default");
    }
  }, [section3ModalOpen]);

  const CARDS_PER_PAGE = 8;

  const handlePrevCard = () => {
    if (isEditMode || currentCardIndex <= 0) return;
    const newIndex = currentCardIndex - 1;
    setCurrentCardIndex(newIndex);
    const newPage = Math.floor(newIndex / CARDS_PER_PAGE);
    if (newPage !== section3Page) setSection3Page(newPage);
  };
  const handleNextCard = () => {
    if (isEditMode || currentCardIndex >= unlockedCardCount - 1 || currentCardIndex >= MAX_CARDS - 1) return;
    const newIndex = currentCardIndex + 1;
    setCurrentCardIndex(newIndex);
    const newPage = Math.floor(newIndex / CARDS_PER_PAGE);
    if (newPage !== section3Page) setSection3Page(newPage);
  };

  // 링크 데이터 관리 (카드 데이터에서 초기화)
  const [section3Links, setSection3Links] = useState<string[]>([]);
  const [section4Links, setSection4Links] = useState<string[]>([]);
  const [section5Links, setSection5Links] = useState<string[]>([]);

  // 편집 중인 링크 데이터
  const [editingSection3Links, setEditingSection3Links] = useState<string[]>([]);
  const [editingSection4Links, setEditingSection4Links] = useState<string[]>([]);
  const [editingSection5Links, setEditingSection5Links] = useState<string[]>([]);

  // 포트폴리오 아카이빙 데이터 (DB 저장용)
  const [portfolioArchives, setPortfolioArchives] = useState<string[]>(Array(10).fill(""));
  const [portfolioArchiveChannels, setPortfolioArchiveChannels] = useState<string[]>(["instagram", "youtube", "blog", "tistory", "twitter", "threads", "tiktok", "behance", "etc", "etc"]);
  const [editingArchiveChannels, setEditingArchiveChannels] = useState<string[]>([]);
  const [isSavingArchives, setIsSavingArchives] = useState(false);

  // 포트폴리오 Output 데이터 (DB 저장용)
  const [portfolioOutputs, setPortfolioOutputs] = useState<string[]>(Array(5).fill(""));
  const [portfolioOutputChannels, setPortfolioOutputChannels] = useState<string[]>([
    "threads", // index 0 → 왼쪽2
    "youtube", // index 1 → 왼쪽1
    "tiktok", // index 2 → 가운데
    "youtube", // index 3 → 오른쪽1
    "tistory", // index 4 → 오른쪽2
  ]);
  const [editingOutputChannels, setEditingOutputChannels] = useState<string[]>(Array(5).fill(""));
  const [isSavingOutputs, setIsSavingOutputs] = useState(false);

  // Detail 10 데이터 (DB 저장용 - portfolio_output_6~15)
  const [portfolioDetails, setPortfolioDetails] = useState<string[]>(Array(10).fill(""));
  const [portfolioDetailChannels, setPortfolioDetailChannels] = useState<string[]>(["youtube", "twitter", "youtube", "threads", "instagram", "instagram", "instagram", "instagram", "youtube", "threads"]);
  const [editingDetailChannels, setEditingDetailChannels] = useState<string[]>(Array(10).fill(""));
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // 채널 옵션 목록
  const channelOptions = [
    { value: "", label: "채널 선택", icon: "" },
    { value: "instagram", label: "인스타그램", icon: "/images/0/cluster 3/icon/Instagram.png" },
    { value: "youtube", label: "유튜브", icon: "/images/0/cluster 3/icon/Youtube.png" },
    { value: "blog", label: "블로그", icon: "/images/0/cluster 3/icon/naver blog.png" },
    { value: "tistory", label: "티스토리", icon: "/images/0/cluster 3/icon/Tstory.png" },
    { value: "twitter", label: "X(트위터)", icon: "/images/0/cluster 3/icon/X.png" },
    { value: "threads", label: "쓰레드", icon: "/images/0/cluster 3/icon/Threads.png" },
    { value: "tiktok", label: "틱톡", icon: "/images/0/cluster 3/icon/TikTok.png" },
    { value: "behance", label: "비핸스", icon: "/images/0/cluster 3/icon/Behance.png" },
    { value: "etc", label: "기타", icon: "/images/0/cluster 3/icon/etc 2.png" },
  ];

  // 포트폴리오 아카이빙 데이터 가져오기
  useEffect(() => {
    const fetchPortfolioArchives = async () => {
      if (isDemoMode) {
        const demoUser = demoLookupName || DEFAULT_DEMO_USER;
        const userData = CLUSTER3_DUMMY_BY_USER[demoUser] || CLUSTER3_DUMMY_BY_USER[DEFAULT_DEMO_USER];
        setPortfolioArchives(userData.archives);
        setPortfolioArchiveChannels(userData.archiveChannels);
        const updatedCards = channelCards.map((card, index) => {
          if (index < 10 && userData.archives[index]) {
            return { ...card, link: userData.archives[index] };
          }
          return card;
        });
        setChannelCards(updatedCards);
        return;
      }
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/portfolio-archives");
        const result = await response.json();

        if (response.ok && result.data) {
          setPortfolioArchives(result.data);
          if (result.channels) {
            setPortfolioArchiveChannels(result.channels);
          }
          // channelCards의 처음 10개 링크도 업데이트
          const updatedCards = channelCards.map((card, index) => {
            if (index < 10 && result.data[index]) {
              return { ...card, link: result.data[index] };
            }
            return card;
          });
          setChannelCards(updatedCards);
        }
      } catch (error) {
        console.error("포트폴리오 아카이빙 데이터 로드 오류:", error);
      }
    };

    fetchPortfolioArchives();
  }, [session?.user?.email]);

  // 포트폴리오 아카이빙 저장 함수
  const savePortfolioArchives = async (links: string[], channels: string[]) => {
    if (isDemoMode) {
      setPortfolioArchives(links);
      setPortfolioArchiveChannels(channels);
      // channelCards의 처음 10개 링크도 업데이트 (UI 즉시 반영)
      const updatedCards = channelCards.map((card, index) => {
        if (index < 10) {
          return { ...card, link: links[index] || "" };
        }
        return card;
      });
      setChannelCards(updatedCards);
      alert("저장되었습니다.");
      setSection3ModalOpen(false);
      return;
    }
    setIsSavingArchives(true);
    try {
      const response = await fetch("/api/portfolio-archives", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioArchives: links, portfolioArchiveChannels: channels }),
      });

      const result = await response.json();
      if (response.ok) {
        setPortfolioArchives(links);
        setPortfolioArchiveChannels(channels);
        // channelCards의 처음 10개 링크도 업데이트
        const updatedCards = channelCards.map((card, index) => {
          if (index < 10) {
            return { ...card, link: links[index] || "" };
          }
          return card;
        });
        setChannelCards(updatedCards);
        alert("저장되었습니다.");
        return true;
      } else {
        console.error("저장 실패:", result.error);
        alert(result.error || "저장에 실패했습니다.");
        return false;
      }
    } catch (error) {
      console.error("포트폴리오 아카이빙 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsSavingArchives(false);
    }
  };

  // 포트폴리오 Output 데이터 가져오기
  useEffect(() => {
    const fetchPortfolioOutputs = async () => {
      if (isDemoMode) {
        const demoUser = demoLookupName || DEFAULT_DEMO_USER;
        const userData = CLUSTER3_DUMMY_BY_USER[demoUser] || CLUSTER3_DUMMY_BY_USER[DEFAULT_DEMO_USER];
        setPortfolioOutputs(userData.outputs);
        setPortfolioOutputChannels(userData.outputChannels);
        const updatedSlides = topWorksSlides.map((slide, index) => {
          if (userData.outputs[index]) {
            return { ...slide, link: userData.outputs[index] };
          }
          return slide;
        });
        setTopWorksSlides(updatedSlides);
        return;
      }
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/portfolio-outputs");
        const result = await response.json();

        if (response.ok && result.data) {
          setPortfolioOutputs(result.data);
          // 채널 정보도 업데이트
          if (result.channels) {
            setPortfolioOutputChannels(result.channels);
          }
          // topWorksSlides 링크도 업데이트
          const updatedSlides = topWorksSlides.map((slide, index) => {
            if (result.data[index]) {
              return { ...slide, link: result.data[index] };
            }
            return slide;
          });
          setTopWorksSlides(updatedSlides);
        }
      } catch (error) {
        console.error("포트폴리오 Output 데이터 로드 오류:", error);
      }
    };

    fetchPortfolioOutputs();
  }, [session?.user?.email]);

  // 포트폴리오 Output 저장 함수
  const savePortfolioOutputs = async (links: string[], channels: string[]) => {
    if (isDemoMode) {
      setPortfolioOutputs(links);
      setPortfolioOutputChannels(channels);
      // topWorksSlides 링크도 업데이트 (UI 즉시 반영)
      const updatedSlides = topWorksSlides.map((slide, index) => ({
        ...slide,
        link: links[index] || "",
      }));
      setTopWorksSlides(updatedSlides);
      alert("저장되었습니다.");
      setSection4ModalOpen(false);
      return;
    }
    setIsSavingOutputs(true);
    try {
      const response = await fetch("/api/portfolio-outputs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioOutputs: links, portfolioOutputChannels: channels }),
      });

      const result = await response.json();
      if (response.ok) {
        setPortfolioOutputs(links);
        setPortfolioOutputChannels(channels);
        // topWorksSlides 링크도 업데이트
        const updatedSlides = topWorksSlides.map((slide, index) => ({
          ...slide,
          link: links[index] || "",
        }));
        setTopWorksSlides(updatedSlides);
        alert("저장되었습니다.");
        return true;
      } else {
        console.error("저장 실패:", result.error);
        alert(result.error || "저장에 실패했습니다.");
        return false;
      }
    } catch (error) {
      console.error("포트폴리오 Output 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsSavingOutputs(false);
    }
  };

  // Detail 10 데이터 가져오기
  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      if (isDemoMode) {
        const demoUser = demoLookupName || DEFAULT_DEMO_USER;
        const userData = CLUSTER3_DUMMY_BY_USER[demoUser] || CLUSTER3_DUMMY_BY_USER[DEFAULT_DEMO_USER];
        setPortfolioDetails(userData.details);
        setPortfolioDetailChannels(userData.detailChannels);
        const updatedThumbnails = detailThumbnails.map((thumb, index) => {
          if (userData.details[index]) {
            return { ...thumb, link: userData.details[index] };
          }
          return thumb;
        });
        setDetailThumbnails(updatedThumbnails);
        return;
      }
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/portfolio-details");
        const result = await response.json();

        if (response.ok && result.data) {
          setPortfolioDetails(result.data);
          // 채널 정보도 업데이트
          if (result.channels) {
            setPortfolioDetailChannels(result.channels);
          }
          // detailThumbnails 링크도 업데이트
          const updatedThumbnails = detailThumbnails.map((thumb, index) => {
            if (result.data[index]) {
              return { ...thumb, link: result.data[index] };
            }
            return thumb;
          });
          setDetailThumbnails(updatedThumbnails);
        }
      } catch (error) {
        console.error("Detail 10 데이터 로드 오류:", error);
      }
    };

    fetchPortfolioDetails();
  }, [session?.user?.email]);

  // Detail 10 저장 함수
  const savePortfolioDetails = async (links: string[], channels: string[]) => {
    if (isDemoMode) {
      setPortfolioDetails(links);
      setPortfolioDetailChannels(channels);
      // detailThumbnails 링크도 업데이트 (UI 즉시 반영)
      const updatedThumbnails = detailThumbnails.map((thumb, index) => ({
        ...thumb,
        link: links[index] || "",
      }));
      setDetailThumbnails(updatedThumbnails);
      alert("저장되었습니다.");
      setSection5ModalOpen(false);
      return;
    }
    setIsSavingDetails(true);
    try {
      const response = await fetch("/api/portfolio-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioDetails: links, portfolioDetailChannels: channels }),
      });

      const result = await response.json();
      if (response.ok) {
        setPortfolioDetails(links);
        setPortfolioDetailChannels(channels);
        // detailThumbnails 링크도 업데이트
        const updatedThumbnails = detailThumbnails.map((thumb, index) => ({
          ...thumb,
          link: links[index] || "",
        }));
        setDetailThumbnails(updatedThumbnails);
        alert("저장되었습니다.");
        return true;
      } else {
        console.error("저장 실패:", result.error);
        alert(result.error || "저장에 실패했습니다.");
        return false;
      }
    } catch (error) {
      console.error("Detail 10 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsSavingDetails(false);
    }
  };

  // API에서 일정 신뢰도 데이터 가져오기
  useEffect(() => {
    const fetchReliabilityRate = async () => {
      if (isDemoMode) {
        const demoUser = demoLookupName || DEFAULT_DEMO_USER;
        const userData = CLUSTER3_DUMMY_BY_USER[demoUser] || CLUSTER3_DUMMY_BY_USER[DEFAULT_DEMO_USER];
        setReliabilityRate(userData.profile.reliabilityRate);
        setHasReliabilityData(true);
        setEngName(userData.profile.engName);
        setPointsData(userData.profile.pointsData);
        setGradeStats(userData.profile.gradeStats);
        setTopPercent(userData.profile.gradeStats.avgPercentile);
        setGrowthPeriodStats(userData.profile.growthPeriodStats);
        return;
      }
      if (!session?.user?.email && !urlUserId) {
        setHasReliabilityData(false);
        return;
      }

      try {
        // URL에 userId가 있으면 해당 유저의 데이터를 가져옴
        const apiUrl = urlUserId ? `/api/profile?userId=${urlUserId}` : "/api/profile";
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (response.ok && result.reliabilityRate !== undefined) {
          setReliabilityRate(result.reliabilityRate);
          setHasReliabilityData(true);
        } else {
          setHasReliabilityData(false);
        }

        // 성장 진행 상태 데이터 설정
        if (result.growthInfo) {
          setGrowthInfo(result.growthInfo);
        }

        // 영어 이름 설정
        if (result.data?.eng_name) {
          setEngName(result.data.eng_name);
        }

        // 성장 점수 기록 데이터 설정 (badges에서 가져옴)
        if (result.badges) {
          setPointsData({
            dangam: result.badges.stars || 0, // 단감 = star (별)
            injeolmi: result.badges.shields || 0, // 인절미 = total_shields (이미 계산된 값: shields_net - lightnings)
            eoheung: result.badges.lightnings || 0, // 어흥 = lightning (번개)
          });
        }

        // 품계 데이터 설정
        if (result.gradeStats) {
          setGradeStats(result.gradeStats);
          // 상위 퍼센트 즉시 설정 (애니메이션은 섹션 스크롤 시 실행)
          setTopPercent(result.gradeStats.avgPercentile || 0);
        }

        // 성장 기간 집계 데이터 설정
        if (result.growthPeriodStats) {
          setGrowthPeriodStats(result.growthPeriodStats);
        }
      } catch (error) {
        console.error("신뢰도 데이터 로드 오류:", error);
        setHasReliabilityData(false);
      }
    };

    fetchReliabilityRate();
  }, [session?.user?.email, urlUserId]);

  // 일정 신뢰도 프로그레스 애니메이션
  useEffect(() => {
    // reliabilityRate가 로드되지 않았으면 대기
    if (reliabilityRate === null) return;

    const targetPercent = reliabilityRate;
    // 393 = 전체 반원 길이, 0% = 393, 100% = 0
    const targetOffset = 393 - (393 * targetPercent) / 100;

    const timer = setTimeout(() => {
      setProgressOffset(targetOffset);

      // 숫자 카운트업 애니메이션
      const duration = 1500;
      const startTime = Date.now();

      const countUp = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOut 효과
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPercent = Math.round(easeOut * targetPercent);

        setProgressPercent(currentPercent);

        if (progress < 1) {
          requestAnimationFrame(countUp);
        }
      };

      requestAnimationFrame(countUp);
    }, 300);

    return () => clearTimeout(timer);
  }, [reliabilityRate]);

  // 섹션 2 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animationComplete) {
            // 프로그레스 바 애니메이션
            setTimeout(() => {
              setSection2Progress(90);

              // 숫자 카운트업 애니메이션 (1.5초 동안 0 → 90)
              const duration = 1500;
              const targetPercent = 90;
              const startTime = Date.now();

              const countUp = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentPercent = Math.round(easeOut * targetPercent);

                setSection2Percent(currentPercent);

                if (progress < 1) {
                  requestAnimationFrame(countUp);
                }
              };

              requestAnimationFrame(countUp);

              // 상위 퍼센트 카운트업 애니메이션 (gradeStats.avgPercentile 값으로)
              const topDuration = 800;
              const topTarget = gradeStats?.avgPercentile || 0;
              const topStartTime = Date.now();

              const countUpTop = () => {
                const elapsed = Date.now() - topStartTime;
                const progress = Math.min(elapsed / topDuration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentPercent = Math.round(easeOut * topTarget);

                setTopPercent(currentPercent);

                if (progress < 1) {
                  requestAnimationFrame(countUpTop);
                }
              };

              requestAnimationFrame(countUpTop);
            }, 300);

            // 품계 카드 순차 애니메이션 (정 9품 → 정승)
            let currentRank = 10; // 정 9품(10번째 카드)부터 시작
            const interval = setInterval(() => {
              setHighlightedRank(currentRank);
              currentRank--;
              if (currentRank < 1) {
                clearInterval(interval);
                setTimeout(() => {
                  setAnimationComplete(true);
                }, 150);
              }
            }, 120); // 120ms 간격으로 다라라락!
          }
        });
      },
      { threshold: 0.3 },
    );

    if (section2Ref.current) {
      observer.observe(section2Ref.current);
    }

    return () => observer.disconnect();
  }, [animationComplete, gradeStats]);

  // 포트폴리오 채널 카드 데이터 (16개 표시, 10개만 DB 연동)
  // SNS 아이콘 순서: 인스타, 유튜브, 블로그, 티스토리, X, 쓰레드, 틱톡, 비핸스, 기타1, 기타2, (11-16번은 반복)
  const snsIconOrder = [
    "/images/0/cluster 3/icon/Instagram.png",
    "/images/0/cluster 3/icon/Youtube.png",
    "/images/0/cluster 3/icon/Naver Blog.png",
    "/images/0/cluster 3/icon/Tstory.png",
    "/images/0/cluster 3/icon/X.png",
    "/images/0/cluster 3/icon/Threads.png",
    "/images/0/cluster 3/icon/TikTok.png",
    "/images/0/cluster 3/icon/Behance.png",
    "/images/0/cluster 3/icon/etc 2.png",
    "/images/0/cluster 3/icon/etc 2.png",
    // 11-16번 카드용 (페이지 2)
    "/images/0/cluster 3/icon/etc 3.png",
    "/images/0/cluster 3/icon/etc 2.png",
    "/images/0/cluster 3/icon/etc 3.png",
    "/images/0/cluster 3/icon/etc 1.png",
    "/images/0/cluster 3/icon/etc 2.png",
    "/images/0/cluster 3/icon/etc 3.png",
  ];

  const PLATFORM_ICONS: Record<string, string> = {
    유튜브: "/images/0/cluster 3/icon/Youtube.png",
    인스타그램: "/images/0/cluster 3/icon/Instagram.png",
    "블로그(네이버)": "/images/0/cluster 3/icon/Naver Blog.png",
    티스토리: "/images/0/cluster 3/icon/Tstory.png",
    "X(트위터)": "/images/0/cluster 3/icon/X.png",
    "스레드(메타)": "/images/0/cluster 3/icon/Threads.png",
    카카오스토리: "/images/0/cluster 3/story.png",
    핀터레스트: "/images/0/cluster 3/pinterest.png",
    틱톡: "/images/0/cluster 3/icon/TikTok.png",
    비핸스: "/images/0/cluster 3/icon/Behance.png",
    노션: "/images/0/cluster 3/notion.png",
  };
  const PLATFORM_OPTIONS = Object.keys(PLATFORM_ICONS);
  const MANAGEMENT_OPTIONS = ["개인 소유 관리", "팀 소속 협업", "기타 진행"];
  const STATUS_OPTIONS = ["운영 중", "운영 중단", "운영 보류"];

  const [channelCards, setChannelCards] = useState(createInitialChannelCards());
  const [cardSnapshot, setCardSnapshot] = useState<any>(null);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPosition(null);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setOpenDropdownId(id);
      setDropdownPosition({ top: rect.bottom, left: rect.left, width: rect.width });
    }
  };

  useEffect(() => {
    if (!openDropdownId) return;
    const handler = (e: MouseEvent) => {
      const fixed = document.querySelector(".dropdown-options-fixed");
      if (fixed?.contains(e.target as Node)) return;
      const allSelected = document.querySelectorAll(".dropdown-selected, .platform-selected");
      for (const sel of allSelected) {
        if (sel.contains(e.target as Node)) return;
      }
      setOpenDropdownId(null);
      setDropdownPosition(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdownId]);

  const isCardComplete = (card: (typeof channelCards)[0]): boolean => {
    if (!card.channelName?.trim()) return false;
    if (!card.platform) return false;
    if (!card.management) return false;
    if (!card.startYear || !card.startMonth || !card.startDay) return false;
    if (!card.rating || Number(card.rating) < 1 || Number(card.rating) > 10) return false;
    if (!card.status) return false;
    if (!card.link?.trim()) return false;
    if ((card.images || []).filter((img) => img !== null).length < 3) return false;
    if (!card.insight?.trim()) return false;
    if (!card.experience?.trim()) return false;
    if (!card.metrics?.trim()) return false;
    return true;
  };

  // 편집 모드 진입 시 스냅샷 저장
  useEffect(() => {
    if (isEditMode && section3ModalOpen) {
      setCardSnapshot(JSON.parse(JSON.stringify(channelCards[currentCardIndex])));
    }
  }, [isEditMode, section3ModalOpen, currentCardIndex]);

  const isCardDirty = () => {
    if (!cardSnapshot) return false;
    return JSON.stringify(channelCards[currentCardIndex]) !== JSON.stringify(cardSnapshot);
  };

  const handleCloseModal = () => {
    if (isEditMode && isCardDirty()) {
      if (window.confirm("입력한 데이터가 저장되지 않았습니다. 종료하시겠습니까?")) {
        const restored = [...channelCards];
        restored[currentCardIndex] = JSON.parse(JSON.stringify(cardSnapshot));
        setChannelCards(restored);
        setSection3ModalOpen(false);
        setIsEditMode(false);
        setSection3FooterNotice("default");
      }
    } else {
      setSection3ModalOpen(false);
      setIsEditMode(false);
    }
  };

  // 안내문 자동 복원
  useEffect(() => {
    if (!isEditMode || section3FooterNotice !== "error") return;
    if (isCardComplete(channelCards[currentCardIndex])) setSection3FooterNotice("default");
  }, [channelCards, currentCardIndex, isEditMode, section3FooterNotice]);

  // 순차 입력: 연속으로 완성된 카드 수 + 1 = 입력 가능 카드 수
  const unlockedCardCount = (() => {
    let count = 1;
    for (let i = 0; i < channelCards.length; i++) {
      if (isCardComplete(channelCards[i])) {
        count = Math.max(count, i + 2);
      } else {
        break;
      }
    }
    return Math.min(count, MAX_CARDS);
  })();

  // 2페이지 동적 노출
  const showPage2 = channelCards.filter((c) => isCardComplete(c)).length >= CARDS_PER_PAGE;

  const handleCardChange = (field: string, value: any) => {
    setChannelCards((prev) => prev.map((card, i) => (i === currentCardIndex ? { ...card, [field]: value } : card)));
  };

  const imageInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isSlotEnabled = (slotIndex: number): boolean => {
    if (slotIndex === 0) return true;
    return !!channelCards[currentCardIndex]?.images[slotIndex - 1];
  };

  const handleImageUploadClick = (slotIndex: number) => imageInputRefs.current[slotIndex]?.click();

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newImages = [...channelCards[currentCardIndex].images];
      newImages[slotIndex] = url;
      handleCardChange("images", newImages);
    }
    e.target.value = "";
  };

  const handleImageDelete = (slotIndex: number) => {
    const img = channelCards[currentCardIndex].images[slotIndex];
    if (img) URL.revokeObjectURL(img);
    const newImages = [...channelCards[currentCardIndex].images];
    newImages[slotIndex] = null;
    handleCardChange("images", newImages);
  };

  const StarRating = ({ rating }: { rating: number }) => {
    const r = Number(rating) || 0;
    const fullStars = Math.floor(r / 2);
    const hasHalf = r % 2 === 1;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    return (
      <span className="star-rating">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <i key={`f${i}`} className="ti ti-star-filled" />
          ))}
        {hasHalf && <i className="ti ti-star-half-filled" />}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <i key={`e${i}`} className="ti ti-star" />
          ))}
        <span className="rating-text">{r}/10</span>
      </span>
    );
  };

  const formatDate = (y: string, m: string, d: string) => {
    if (!y) return "-";
    return `${y.slice(-2)}. ${m || "??"}. ${d || "??"}`;
  };

  // Top Works 슬라이드 데이터 (5개)
  const [topWorksSlides, setTopWorksSlides] = useState([
    { id: 1, active: false, link: "" },
    { id: 2, active: false, link: "" },
    { id: 3, active: true, link: "" },
    { id: 4, active: false, link: "" },
    { id: 5, active: false, link: "" },
  ]);

  // Detail 10 썸네일 데이터 (10개, 2줄 5개)
  const [detailThumbnails, setDetailThumbnails] = useState([
    { id: 1, link: "" },
    { id: 2, link: "" },
    { id: 3, link: "" },
    { id: 4, link: "" },
    { id: 5, link: "" },
    { id: 6, link: "" },
    { id: 7, link: "" },
    { id: 8, link: "" },
    { id: 9, link: "" },
    { id: 10, link: "" },
  ]);

  // 기타 아이콘 목록
  const etcIcons = ["/images/0/cluster 3/icon/etc 1.png", "/images/0/cluster 3/icon/etc 2.png", "/images/0/cluster 3/icon/etc 3.png"];

  // URL에 프로토콜 추가 함수
  const ensureProtocol = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  // URL에 따른 아이콘 매칭 함수
  const getIconByUrl = (url: string, id?: number) => {
    if (!url) return null; // 링크 없으면 null (그라데이션 표시)
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "/images/0/cluster 3/icon/Youtube.png";
    if (lowerUrl.includes("instagram.com")) return "/images/0/cluster 3/icon/Instagram.png";
    if (lowerUrl.includes("blog.naver.com") || lowerUrl.includes("m.blog.naver.com")) return "/images/0/cluster 3/icon/Naver Blog.png";
    if (lowerUrl.includes("tistory.com")) return "/images/0/cluster 3/icon/Tstory.png";
    if (lowerUrl.includes("tiktok.com")) return "/images/0/cluster 3/icon/TikTok.png";
    if (lowerUrl.includes("threads.net") || lowerUrl.includes("threads.com")) return "/images/0/cluster 3/icon/Threads.png";
    if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return "/images/0/cluster 3/icon/X.png";
    if (lowerUrl.includes("behance.net")) return "/images/0/cluster 3/icon/Behance.png";
    // 기타 링크는 etc 아이콘
    return etcIcons[id ? id % etcIcons.length : Math.floor(Math.random() * etcIcons.length)];
  };

  // 카드 데이터의 링크로 state 초기화
  useEffect(() => {
    if (section3Links.length === 0) {
      setSection3Links(channelCards.slice(0, 16).map((card) => card.link));
    }
    if (section4Links.length === 0) {
      setSection4Links(topWorksSlides.map((slide) => slide.link));
    }
    if (section5Links.length === 0) {
      setSection5Links(detailThumbnails.map((thumb) => thumb.link));
    }
  }, []);

  return (
    <div className="cluster3-content">
      {/* Section 1: CLUB FINAL INDEX - 새 디자인 */}
      <section className="cluster3-section1">
        {/* 플로팅 아이콘 */}
        <div className="floating-icons" style={{ display: "flex" }}>
          <div className="edit-icon search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <div className="tooltip">등록된 도움말이 없습니다</div>
          </div>
        </div>
        {/* 배경 이미지 영역 */}
        <div className="section1-bg">
          <img src="/images/0/cluster 3/bg1.png" alt="Background" />
          {/* 왼쪽 캐릭터 */}
          <div className="char-left">
            <img src="/images/0/cluster 3/icon/battle.png" alt="Battle" />
          </div>
          {/* 오른쪽 폭탄 */}
          <div className="char-right">
            <img src="/images/0/cluster 3/icon/Bomb.png" alt="Bomb" />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="section1-title-wrapper">
          <div className="title-inner">
            <h2 className="section1-title">CLUB FINAL INDEX</h2>
          </div>
        </div>

        {/* 설명 텍스트 */}
        <div className="section1-description">
          <p>이 페이지는 우리 시대의 성장하는 청춘! 크루들의 지금까지 누적된, 현재 성장 & 강화 결과를 리포트합니다.</p>
          <p>클럽의 마지막 성장 주차까지 종료한 크루의 경우, 그대로 클럽 마지막 최종 결과표가 되기도 할 거에요. 😊</p>
          <p className="small-text">내가 가고 있는 이 길이 어디쯤 와있는지, 내가 초심을 잃지 않고 목표를 향해, 성장을 향해 잘 나아가고 있는지를, 확인하세요!</p>
          <p className="small-text">당신의 시간과 성장은 얼마나 자랑스러우신가요?</p>
          <p className="quote-text">I believe that every right implies a responsibility; every opportunity, an obligation; every possession, a duty.</p>
          <p className="quote-highlight">"모든 권리에는 책임이 따르고, 모든 기회에는 의무가 따르며, 모든 소유물에는 의무가 따른다고 믿는다."</p>
          <p className="quote-author">-존 D. 록펠러 (John D. Rockefeller)-</p>
        </div>

        {/* 프로그레스 반원 */}
        <div className="progress-area">
          <div className="progress-semi-circle">
            <svg viewBox="0 0 300 170">
              {/* 배경 반원 */}
              <path className="progress-bg" d="M 25 150 A 125 125 0 0 1 275 150" fill="none" stroke="rgba(250, 171, 7, 0.5)" strokeWidth="20" strokeLinecap="butt" />
              {/* 진행 반원 (애니메이션) */}
              <path className="progress-bar" d="M 25 150 A 125 125 0 0 1 275 150" fill="none" stroke="url(#progressGradient)" strokeWidth="20" strokeDasharray="393" strokeDashoffset={progressOffset} strokeLinecap="butt" style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FAAB07" />
                  <stop offset="100%" stopColor="#FFC919" />
                </linearGradient>
              </defs>
            </svg>
            <div className="progress-text">
              <span className="progress-percent">{progressPercent}%</span>
              <span className="progress-label">일정 신뢰도</span>
            </div>
          </div>
        </div>

        {/* 3개의 스탯 카드 */}
        <div className="stats-cards">
          {/* 카드 1: 성장 진행 상태 */}
          <div className="stat-card">
            <div className="card-header">
              <div className="card-icon pink">
                <img src="/images/0/cluster 3/icon/0pink.png" alt="Pink" />
              </div>
              <h3 className="card-title">성장 진행 상태(Process)</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 성장 상태
                </span>
                <span className="info-value highlight">{growthInfo ? getGrowthStatusText(growthInfo.status, growthInfo.growthStatus) : "-"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 성장 시작일
                </span>
                <span className="info-value">{growthInfo?.startDate ? formatDateKorean(growthInfo.startDate) : "-"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 성장 종료일
                </span>
                <span className={`info-value ${growthInfo?.endDate ? "" : "be-cluving"}`}>{growthInfo?.endDate ? formatDateKorean(growthInfo.endDate) : "Be Cluving"}</span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">
                WATCH GROWTH <img src="/images/0/cluster 3/icon/_.png" alt="icon" />
              </span>
            </div>
          </div>

          {/* 카드 2: 성장 기간 집계(Period) */}
          <div className="stat-card wide">
            <div className="card-header">
              <div className="card-icon purple">
                <img src="/images/0/cluster 3/icon/0purple.png" alt="Purple" />
              </div>
              <h3 className="card-title">성장 기간 집계(Period)</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 성장(성공) 주차
                </span>
                <span className="info-value week">
                  {growthPeriodStats?.approvedWeeks ?? 0}
                  <span className="highlight-orange">({growthPeriodStats?.approvedSeasons ?? 0})</span>
                  <span className="unit">주</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 성장(실패) 주차
                </span>
                <span className="info-value week">
                  {growthPeriodStats?.unapprovedWeeks ?? 0}
                  <span className="unit">주</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 휴식(개인) 주차
                </span>
                <span className="info-value week">
                  {growthPeriodStats?.restWeeks ?? 0}
                  <span className="highlight-orange">({growthPeriodStats?.restSeasons ?? 0})</span>
                  <span className="unit">주</span>
                </span>
              </div>
              <div className="info-row club-break-row">
                <span className="info-label">
                  <span className="dot">·</span> 휴식(공식) 주차
                </span>
                <span className="info-value week">
                  {growthPeriodStats?.clubBreakWeeks ?? 0}
                  <span className="unit">주</span>
                </span>
                <div className="club-break-tooltip">공식 휴식 주차(구정 설 연휴, 추석, 중간/기말고사 등)에 사전 승인된 &apos;활동&apos;을 진행하여 적격요건을 달성한 경우, 해당 주차는 &apos;휴식(공식) 주차&apos;가 아닌, &apos;성장(성공) 주차&apos;에 반영됩니다.</div>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 성장 가능 주차
                </span>
                <span className="info-value week">
                  {growthPeriodStats?.availableWeeks ?? 0}
                  <span className="unit">주</span>
                </span>
              </div>
              <div className="info-row separator">
                <span className="info-label">
                  <span className="dot">·</span> 성장 휴식 시즌
                </span>
                <span className="info-value season">
                  {growthPeriodStats?.restSeasons ?? 0}
                  <span className="unit">시즌</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 성장(성공) 시즌
                </span>
                <span className="info-value season">
                  {growthPeriodStats?.approvedSeasons ?? 0}
                  <span className="unit">시즌</span>
                </span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">
                WATCH GROWTH <img src="/images/0/cluster 3/icon/_.png" alt="icon" />
              </span>
            </div>
          </div>

          {/* 카드 3: 성장 점수 기록(Point) */}
          <div className="stat-card">
            <div className="card-header">
              <div className="card-icon green">
                <img src="/images/0/cluster 3/icon/0green.png" alt="Green" />
              </div>
              <h3 className="card-title">성장 점수 기록(Point)</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 단감(총합) <img src="/images/0/cluster 3/icon/Ok01.png" alt="단감" className="label-icon orange" />
                </span>
                <span className="info-value number">
                  {pointsData.dangam.toLocaleString()}
                  <span className="unit">개</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 인절미(총합) <img src="/images/0/cluster 3/icon/OK02.png" alt="인절미" className="label-icon" />
                </span>
                <span className="info-value number">
                  {pointsData.injeolmi.toLocaleString()}
                  <span className="unit">개</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <span className="dot">·</span> 어흥(총합) <img src="/images/0/cluster 3/icon/Ok03.png" alt="어흥" className="label-icon" />
                </span>
                <span className="info-value number">
                  {Math.abs(pointsData.eoheung).toLocaleString()}
                  <span className="unit">개</span>
                </span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">
                WATCH GROWTH <img src="/images/0/cluster 3/icon/_.png" alt="icon" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 졸업 자격 조건 - 배경 이미지 영역 */}
      <section className="cluster3-section2" ref={section2Ref}>
        {/* 플로팅 아이콘 */}
        <div className="floating-icons" style={{ display: "flex" }}>
          <div className="edit-icon search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <div className="tooltip">등록된 도움말이 없습니다</div>
          </div>
        </div>
        <div className="section2-bg">
          <img src="/images/0/cluster 3/bg2.png" alt="Background" />
        </div>
        <div className="section2-right">
          <div className="section2-text">
            <span className="handwriting">클럽 강화 품계</span>
          </div>
        </div>

        {/* 상위 퍼센트 + 서브 멘트 - 같은 y좌표 배치 */}
        <div className="section2-sub-row">
          <div className="section2-progress">
            <div className="progress-info">
              <span className="progress-label">상위</span>
              <span className="progress-percent">{topPercent}</span>
              <span className="progress-unit">%</span>
            </div>
          </div>
          <p className="section-comment section2-comment">
            클럽 활동 중 함께 활동하는 수백명의 크루들 간의 경쟁을 기준으로,
            <br />매 주 단위 &apos;강화&apos; / &apos;성장&apos; 순위를 집계하여 누적된, 나의 최종 클럽 활동 성적입니다.
          </p>
        </div>

        {/* 10개의 품계 카드 (정승 + 정 1~9품) */}
        <div className="section2-cards">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => {
            // 라벨 표시: 1->정승, 2->정1품, 3->정2품 ... 10->정9품
            const displayRank = rank === 1 ? "정승" : rank - 1;
            return (
              <div
                key={rank}
                className={`rank-card ${rank === (gradeStats?.grade || 10) ? "active" : "inactive"}`}
                style={{
                  transform: !animationComplete && highlightedRank !== -1 && highlightedRank >= rank ? `scale(${1 + 0.08 * Math.max(0, 1 - Math.abs(highlightedRank - rank) * 0.3)}) translateY(${-5 * Math.max(0, 1 - Math.abs(highlightedRank - rank) * 0.3)}px)` : undefined,
                  boxShadow: !animationComplete && highlightedRank === rank ? "0 8px 25px rgba(250, 171, 7, 0.6)" : !animationComplete && highlightedRank !== -1 && Math.abs(highlightedRank - rank) === 1 ? "0 4px 15px rgba(250, 171, 7, 0.3)" : undefined,
                  transition: !animationComplete ? "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" : undefined,
                  zIndex: !animationComplete && highlightedRank === rank ? 10 : undefined,
                }}
              >
                <div className="rank-medal">
                  <img src={`/images/0/cluster 3/icon/medal ${rank}.png`} alt={`Medal ${rank}`} />
                </div>
                <div className="rank-card-image">
                  <img src={`/images/0/cluster 3/image/정 ${rank} 품.png`} alt={`Rank ${rank}`} />
                </div>
                <div className="rank-label">
                  {displayRank === "정승" ? (
                    <>
                      <span className="rank-prefix">정</span>
                      <span className="rank-number">승</span>
                    </>
                  ) : (
                    <>
                      <span className="rank-prefix">정</span>
                      <span className="rank-number">{displayRank}</span>
                      <span className="rank-suffix">품</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: 포트폴리오 마케팅 Channel */}
      <section className="cluster3-section3">
        {/* 플로팅 아이콘 — 주석 처리 (channel-card 클릭으로 대체)
        <div className="floating-icons" style={{ display: "flex" }}>
          <div className="edit-icon" style={{ cursor: "pointer" }} onClick={() => { setCurrentCardIndex(0); setSection3ModalOpen(true); }}>
            <i className="ti ti-pencil" style={{ fontSize: "16px", color: "#1a1a1a" }}></i>
          </div>
          <div className="edit-icon search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </div>
        */}
        {/* 배경 이미지 */}
        <div className="section3-bg">
          <img src="/images/0/cluster 3/bg3.png" alt="Background" />
        </div>

        <div className="section3-header">
          <div className="header-left">
            <h2 className="subtitle">
              <img src="/images/0/cluster 3/polygon.png" alt="triangle" style={{ width: "39px", height: "39px", objectFit: "contain", marginRight: "-24px", position: "relative", top: "-8px", zIndex: -1 }} />
              포트폴리오 아카이빙 Channel
            </h2>
            <div className="header-sub">
              <span className="view-all" onClick={() => handleArrowClick("section3")} style={{ cursor: "pointer" }}>
                View All Bids <img src="/images/0/cluster 3/arrow.png" alt="arrow" style={{ width: "14px", height: "14px", objectFit: "contain", marginLeft: "4px" }} />
              </span>
            </div>
            <p className="section-comment section3-comment">클럽 활동 중 쌓아 올린 커리어 결과물이 누적된 포트폴리오 아카이빙 채널 리스트 입니다.</p>
          </div>
        </div>

        <div className="channel-cards">
          {channelCards.slice(section3Page * 8, section3Page * 8 + 8).map((card, index) => {
            const actualIndex = section3Page * 8 + index;
            const isUnlocked = actualIndex < unlockedCardCount;
            // DB 연동 카드(1~10)는 드롭다운 선택 채널 아이콘 사용, 나머지는 기존 고정 아이콘
            const cardIndex = card.id - 1;
            let snsImage: string;
            if (cardIndex < 10) {
              const selectedChannel = portfolioArchiveChannels[cardIndex];
              const channelOption = channelOptions.find((opt) => opt.value === selectedChannel);
              snsImage = channelOption?.icon || snsIconOrder[cardIndex] || snsIconOrder[snsIconOrder.length - 1];
            } else {
              snsImage = snsIconOrder[cardIndex] || snsIconOrder[snsIconOrder.length - 1];
            }
            const isEtcIcon = snsImage.includes("etc");
            if (!isUnlocked) {
              return (
                <div key={card.id} className="channel-card locked">
                  <div className="card-locked-placeholder">
                    <i className="ti ti-lock"></i>
                    <span>이전 카드를 먼저 완성해주세요</span>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={card.id}
                className={`channel-card${card.link ? " has-link" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setCurrentCardIndex(actualIndex);
                  setSection3ModalOpen(true);
                }}
              >
                <div className="card-image">
                  <img src={`/images/0/cluster 3/image/1-${((card.id - 1) % 8) + 1}.png`} alt="Channel" />
                  <div className="card-tag">{card.tag}</div>
                  <div className="card-like">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                </div>
                <div className="card-content">
                  <p className="card-title">{card.title}</p>
                  <div className="card-info">
                    <div className="info-row">
                      <div className="info-author">
                        <img src={snsImage} alt="SNS" className={`sns-icon${isEtcIcon ? " sns-icon-etc" : ""}`} />
                        <div className="author-text">
                          <span className="info-label">Created by:</span>
                          <span className="author-name">{engName || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-divider"></div>
                    <div className="info-row growth-row">
                      <span className="info-label">Growth Bid</span>
                      <div className="info-price">
                        <img src="/images/0/cluster 3/icon/dia.png" alt="dia" className="dia-icon" />
                        <span className="price-value">0.99</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 섹션 3 페이지네이션 */}
        <div className="section3-pagination">
          <span className={`page-num ${section3Page === 0 ? "active" : ""}`} onClick={() => setSection3Page(0)}>
            1
          </span>
          {showPage2 && (
            <span className={`page-num ${section3Page === 1 ? "active" : ""} last`} onClick={() => setSection3Page(1)}>
              2
            </span>
          )}
        </div>
      </section>

      {/* Section 4: 포트폴리오 아카이빙 Output */}
      <section className="cluster3-section4">
        {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
        <div className="floating-icons" style={{ display: "flex" }}>
          <div
            className="edit-icon"
            style={{ cursor: isOwner || isDemoMode ? "pointer" : "not-allowed", opacity: isOwner || isDemoMode ? 1 : 0.4 }}
            onClick={
              isOwner || isDemoMode
                ? () => {
                    // 강제 정렬(compaction): 값이 있는 항목을 앞으로 밀착
                    const paired = portfolioOutputs.map((link, i) => ({ link, channel: portfolioOutputChannels[i] || "" }));
                    const filled = paired.filter((item) => item.link?.trim());
                    const total = portfolioOutputs.length;
                    setEditingSection4Links([...filled.map((item) => item.link), ...Array(total - filled.length).fill("")]);
                    setEditingOutputChannels([...filled.map((item) => item.channel), ...Array(total - filled.length).fill("")]);
                    setSection4ModalOpen(true);
                  }
                : undefined
            }
          >
            <i className="ti ti-pencil" style={{ fontSize: "16px", color: "#1a1a1a" }}></i>
          </div>
          <div className="edit-icon search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <div className="tooltip">등록된 도움말이 없습니다</div>
          </div>
        </div>
        {/* 배경 이미지 */}
        <div className="section4-bg">
          <img src="/images/0/cluster 3/bg4.png" alt="Background" />
        </div>

        <div className="section4-top-header">
          <div className="header-left">
            <h2 className="subtitle">
              <img src="/images/0/cluster 3/polygon.png" alt="triangle" style={{ width: "39px", height: "39px", objectFit: "contain", marginRight: "-24px", position: "relative", top: "-8px", zIndex: -1 }} />
              포트폴리오 아카이빙 output
            </h2>
            <div className="header-sub">
              <span className="view-all" onClick={() => handleArrowClick("section4")} style={{ cursor: "pointer" }}>
                View All Bids <img src="/images/0/cluster 3/arrow.png" alt="arrow" style={{ width: "14px", height: "14px", objectFit: "contain", marginLeft: "4px" }} />
              </span>
            </div>
          </div>
        </div>
        <div className="section4-header">
          <h2 className="section4-title">World Of Top Works</h2>
          <p className="section4-desc">
            *본 섹션에서는, 클럽에서 쌓은 모든 활동 경험 중 커리어에서 가장 어필하고자 하는 최고 결과물 Top 5개 만을 선별하여 기재하였습니다.
            <br />
            전체적인 실무 경험, 실무 경력, 실무 역량, 실무 정보 등은 다른 탭, 섹션에서 확인해주세요.
          </p>
        </div>

        <div className="section4-tabs">
          <button className={`tab-btn creative ${bouncingBtn === "creative" ? "btn-bounce" : ""}`} onClick={() => handleBtnClick("creative")}>
            #Creative More <img src="/images/0/cluster 3/icon/화살표.png" alt="arrow" className="btn-arrow" />
          </button>
          <button className={`tab-btn practical ${bouncingBtn === "practical" ? "btn-bounce" : ""}`} onClick={() => handleBtnClick("practical")}>
            #Practical More <img src="/images/0/cluster 3/icon/화살표.png" alt="arrow" className="btn-arrow" />
          </button>
        </div>

        <div className="top-works-slider">
          {topWorksSlides.map((slide, index) => {
            // 선택된 채널에 따른 아이콘 표시
            const selectedChannel = portfolioOutputChannels[index];
            const channelOption = channelOptions.find((opt) => opt.value === selectedChannel);
            const channelIcon = channelOption?.icon || "";

            // 현재 활성 슬라이드 기준으로 원형 회전 위치 계산
            const totalSlides = topWorksSlides.length;
            let position = index - activeSlide;

            // 원형 회전: -2 ~ 2 범위로 조정
            if (position > 2) position -= totalSlides;
            if (position < -2) position += totalSlides;

            return (
              <div key={slide.id} className={`slider-item position-${position}${slide.link ? " has-link" : ""}`} data-position={position} onClick={() => position === 0 && slide.link && window.open(ensureProtocol(slide.link), "_blank")} style={{ cursor: position === 0 ? "pointer" : "default" }}>
                <img src={`/images/0/cluster 3/image/2-${slide.id}.png`} alt={`Work ${slide.id}`} />
                <div className="card-overlay">
                  <div className="card-top">
                    <div className="info-author">
                      {!channelIcon ? <div className="sns-icon sns-gradient"></div> : <img src={channelIcon} alt="SNS" className="sns-icon" />}
                      <div className="author-text">
                        <span className="info-label">Posted by :</span>
                        <span className="author-name">{engName || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-badges">
                    <div className="card-tag">09h 99m 99s</div>
                    <div className="card-like">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section4-pagination">
          {[1, 2, 3, 4, 5].map((num) => (
            <span key={num} className={`page-num ${activeSlide === num - 1 ? "active" : ""} ${num === 5 ? "last" : ""}`} onClick={() => setActiveSlide(num - 1)}>
              {num}
            </span>
          ))}
        </div>

        {/* Section 5: The Detail 10 - 섹션4 배경 안에 포함 */}
        <div className="cluster3-section5">
          {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
          <div className="floating-icons" style={{ display: "flex" }}>
            <div
              className="edit-icon"
              style={{ cursor: isOwner || isDemoMode ? "pointer" : "not-allowed", opacity: isOwner || isDemoMode ? 1 : 0.4 }}
              onClick={
                isOwner || isDemoMode
                  ? () => {
                      // 강제 정렬(compaction): 값이 있는 항목을 앞으로 밀착
                      const paired = portfolioDetails.map((link, i) => ({ link, channel: portfolioDetailChannels[i] || "" }));
                      const filled = paired.filter((item) => item.link?.trim());
                      const total = portfolioDetails.length;
                      setEditingSection5Links([...filled.map((item) => item.link), ...Array(total - filled.length).fill("")]);
                      setEditingDetailChannels([...filled.map((item) => item.channel), ...Array(total - filled.length).fill("")]);
                      setSection5ModalOpen(true);
                    }
                  : undefined
              }
            >
              <i className="ti ti-pencil" style={{ fontSize: "16px", color: "#1a1a1a" }}></i>
            </div>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
          <div className="section5-header">
            <div className="header-left">
              <h2 className="subtitle">
                <img src="/images/0/cluster 3/polygon.png" alt="triangle" style={{ width: "39px", height: "39px", objectFit: "contain", marginRight: "-24px", position: "relative", top: "-8px", zIndex: -1 }} />
                The Detail 10
              </h2>
              <div className="header-sub">
                <span className="view-all" onClick={() => handleArrowClick("section5")} style={{ cursor: "pointer" }}>
                  View All Bids <img src="/images/0/cluster 3/arrow.png" alt="arrow" style={{ width: "14px", height: "14px", objectFit: "contain", marginLeft: "4px" }} />
                </span>
              </div>
            </div>
            <p className="section-comment section5-comment">
              클럽에서 쌓아올린 모든 활동 중 더 자세하게 핵심으로 어필하고픈 <br />
              second 10 개의 최고 결과물을 선별하여 기재하였습니다.
            </p>
          </div>

          <div className="detail-grid">
            {detailThumbnails.map((thumb, index) => {
              // 선택된 채널에 따른 아이콘 표시
              const selectedChannel = portfolioDetailChannels[index];
              const channelOption = channelOptions.find((opt) => opt.value === selectedChannel);
              const channelIcon = channelOption?.icon || "";

              return (
                <div key={thumb.id} className={`detail-item${thumb.link ? " has-link" : ""}`} onClick={() => thumb.link && window.open(ensureProtocol(thumb.link), "_blank")} style={{ cursor: thumb.link ? "pointer" : "default" }}>
                  <img src={`/images/0/cluster 3/image/3-${thumb.id}.png`} alt={`Detail ${thumb.id}`} />
                  <div className="item-overlay">
                    <div className="like-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span>99 Like</span>
                    </div>
                    <div className="item-bottom">
                      {!channelIcon ? <div className="sns-icon sns-gradient"></div> : <img src={channelIcon} alt="SNS" className="sns-icon" />}
                      <div className="item-info">
                        <span className="item-tags">#Detail, #Micro</span>
                        <span className="item-author">@{engName || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 섹션 3 모달 - 채널 링크 편집 */}
      {section3ModalOpen && (
        <div className="section-modal-overlay">
          <div className="section-modal">
            <div className="section-modal-header">
              <div className="modal-header-top">
                <span style={{ fontSize: "20px" }}>✍️</span>
                <h3>Portfolio Output Top 5 [{currentCardIndex + 1}]</h3>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
            </div>
            <div className="section-modal-body" ref={section3ModalBodyRef}>
              <div className="modal-top-row">
                <div className="channel-info-section">
                  <h4 className="channel-info-title">
                    <span className="user-name">윤재윤</span> 님의 Portfolio Channel
                  </h4>
                  {(() => {
                    const card = channelCards[currentCardIndex];
                    if (!card) return null;
                    const fields = [
                      { label: "채널명", key: "channelName", type: "text", placeholder: "@채널명을 입력하세요" },
                      { label: "채널 플랫폼", key: "platform", type: "platformDropdown" },
                      { label: "채널 관리", key: "management", type: "select", options: MANAGEMENT_OPTIONS },
                      { label: "채널 시작", key: "date", type: "date" },
                      { label: "채널 평가", key: "rating", type: "rating" },
                      { label: "운영 현황", key: "status", type: "select", options: STATUS_OPTIONS },
                      { label: "채널 살펴보기", key: "link", type: "link" },
                    ];
                    return fields.map((f) => (
                      <div key={f.key} className="channel-info-field" data-field={f.key === "date" ? "startDate" : f.key === "platformDropdown" ? "platform" : f.key}>
                        <label>
                          {f.label}
                          {isEditMode && <span style={{ color: "#FAAB07", marginLeft: "2px" }}>*</span>}
                        </label>
                        {f.type === "text" && (isEditMode ? <input type="text" value={(card as any)[f.key] || ""} onChange={(e) => handleCardChange(f.key, e.target.value)} placeholder={f.placeholder} /> : <span className="field-value">{(card as any)[f.key] || "-"}</span>)}
                        {f.type === "select" &&
                          (isEditMode ? (
                            <div className="custom-dropdown">
                              <div className="dropdown-selected" onClick={(e) => toggleDropdown(f.key, e)}>
                                <span>{(card as any)[f.key] || "선택하세요"}</span>
                                <i className="ti ti-chevron-down"></i>
                              </div>
                            </div>
                          ) : (
                            <span className="field-value">{(card as any)[f.key] || "-"}</span>
                          ))}
                        {f.type === "platformDropdown" &&
                          (isEditMode ? (
                            <div className="platform-dropdown">
                              <div className="platform-selected" onClick={(e) => toggleDropdown("platform", e)}>
                                {card.platform ? (
                                  <>
                                    {PLATFORM_ICONS[card.platform] && <img src={PLATFORM_ICONS[card.platform]} alt={card.platform} className="platform-icon" />}
                                    <span>{card.platform}</span>
                                  </>
                                ) : (
                                  <span className="placeholder">선택하세요</span>
                                )}
                                <i className="ti ti-chevron-down"></i>
                              </div>
                            </div>
                          ) : (
                            <div className="platform-display" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {PLATFORM_ICONS[card.platform] && <img src={PLATFORM_ICONS[card.platform]} alt={card.platform} className="platform-icon" style={{ width: "20px", height: "20px", objectFit: "contain" }} />}
                              <span className="field-value">{card.platform || "-"}</span>
                            </div>
                          ))}
                        {f.type === "date" &&
                          (isEditMode ? (
                            <input
                              type="date"
                              className="channel-date-input"
                              value={card.startYear && card.startMonth && card.startDay ? `${card.startYear}-${String(card.startMonth).padStart(2, "0")}-${String(card.startDay).padStart(2, "0")}` : ""}
                              onChange={(e) => {
                                const d = new Date(e.target.value);
                                if (!isNaN(d.getTime())) {
                                  handleCardChange("startYear", String(d.getFullYear()));
                                  handleCardChange("startMonth", String(d.getMonth() + 1).padStart(2, "0"));
                                  handleCardChange("startDay", String(d.getDate()).padStart(2, "0"));
                                }
                              }}
                            />
                          ) : (
                            <span className="field-value">{formatDate(card.startYear, card.startMonth, card.startDay)}</span>
                          ))}
                        {f.type === "rating" && (
                          <div className="rating-field" style={{ flex: 1 }}>
                            <StarRating rating={Number(card.rating) || 0} />
                            {isEditMode && (
                              <div className="custom-dropdown small">
                                <div className="dropdown-selected" onClick={(e) => toggleDropdown("rating", e)}>
                                  <span>{card.rating || "선택"}</span>
                                  <i className="ti ti-chevron-down"></i>
                                </div>
                              </div>
                            )}
                            <span className="rating-max" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>/ 10</span>
                          </div>
                        )}
                        {f.type === "link" &&
                          (isEditMode ? (
                            <div className="link-field">
                              <input type="text" value={card.link || ""} onChange={(e) => handleCardChange("link", e.target.value)} placeholder="https://..." style={{ whiteSpace: "nowrap" as const, overflow: "auto" }} />
                              <button
                                className="link-open-btn"
                                onClick={() => {
                                  if (card.link) window.open(card.link, "_blank");
                                }}
                                disabled={!card.link}
                              >
                                <i className="ti ti-arrow-up-right"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="link-field">
                              <span className="field-value" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                                {card.link || "-"}
                              </span>
                              {card.link && (
                                <button className="link-open-btn" onClick={() => window.open(card.link, "_blank")}>
                                  <i className="ti ti-arrow-up-right"></i>
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                    ));
                  })()}
                </div>
                <div className="channel-images-section" data-field="images">
                  {/* 대표 이미지 타이틀 — 주석 처리
                  <h4 className="channel-images-title">대표 이미지 (최소 3장 필수)</h4>
                  */}
                  <div className="images-grid">
                    {channelCards[currentCardIndex]?.images.map((img, si) => (
                      <div key={si} className={`image-slot${si === 0 ? " large" : " small"}${!isSlotEnabled(si) ? " disabled" : ""}`}>
                        <div className="image-preview" onClick={() => { if (img) setPreviewImage(img); }}>
                          {img ? <img src={img} alt={`대표 이미지 ${si + 1}`} /> : <div className="empty-slot"><i className="ti ti-photo-plus"></i></div>}
                          {si <= 2 && <span className="image-required">*</span>}
                          {isEditMode && (
                            <div className="image-actions-overlay">
                              <button className="image-action-btn" onClick={(e) => { e.stopPropagation(); handleImageUploadClick(si); }} disabled={!isSlotEnabled(si)}><i className="ti ti-upload"></i></button>
                              <button className="image-action-btn" onClick={(e) => { e.stopPropagation(); handleImageDelete(si); }} disabled={!isSlotEnabled(si) || !img}><i className="ti ti-trash"></i></button>
                            </div>
                          )}
                        </div>
                        <input type="file" accept="image/*" ref={(el) => { imageInputRefs.current[si] = el; }} style={{ display: "none" }} onChange={(e) => handleImageFileChange(e, si)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="channel-bottom-section">
                {(
                  [
                    { key: "insight", title: "기획 방향/인싸이트", placeholder: "기획 방향/인싸이트를 작성해주세요 (최대 400자)" },
                    { key: "experience", title: "관련 주요 경험/활동", placeholder: "관련 주요 경험/활동을 작성해주세요 (최대 400자)" },
                    { key: "metrics", title: "핵심 정량적 지표/수치", placeholder: "핵심 정량적 지표/수치를 작성해주세요 (최대 400자)" },
                  ] as const
                ).map((box) => {
                  const card = channelCards[currentCardIndex];
                  const val = (card as any)[box.key] || "";
                  return (
                    <div key={box.key} className="channel-textarea-box" data-field={box.key}>
                      <h5 className="textarea-title">
                        {box.title}
                        {isEditMode && <span style={{ color: "#FAAB07", marginLeft: "2px" }}>*</span>}
                      </h5>
                      <div className="textarea-wrapper">
                        {isEditMode ? (
                          <>
                            <textarea
                              value={val}
                              onChange={(e) => {
                                if (e.target.value.length <= 400) handleCardChange(box.key, e.target.value);
                              }}
                              maxLength={400}
                              placeholder={box.placeholder}
                              rows={6}
                            />
                            <span className="char-count">{val.length}/400</span>
                          </>
                        ) : (
                          <div className="textarea-readonly">{val || "-"}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="section-modal-footer">
              <div className="modal-footer-top">
                <span className="modal-help-icon" onClick={() => setShowHelpModal(true)} style={{ cursor: "pointer" }}>
                  🔎
                </span>
                <div className="modal-footer-nav">
                  <button className="nav-btn prev" onClick={handlePrevCard} disabled={isEditMode || currentCardIndex === 0} title={isEditMode ? "편집 중에는 이동할 수 없습니다" : ""}>
                    <i className="ti ti-chevron-left"></i>
                  </button>
                  <button className="nav-btn next" onClick={handleNextCard} disabled={isEditMode || currentCardIndex >= unlockedCardCount - 1 || currentCardIndex >= MAX_CARDS - 1} title={isEditMode ? "편집 중에는 이동할 수 없습니다" : ""}>
                    <i className="ti ti-chevron-right"></i>
                  </button>
                </div>
                <div className="modal-footer-right">
                  {!isEditMode ? (
                    <button className="modal-edit-btn" onClick={() => setIsEditMode(true)}>
                      수정
                    </button>
                  ) : (
                    <>
                      <button
                        className="modal-reset-btn"
                        onClick={() => {
                          if (window.confirm("내용을 모두 초기화하시겠어요?")) {
                            const resetCard = currentCardIndex === 0 ? { ...CLUSTER3_CHANNEL_DEFAULTS.firstCard } : { id: currentCardIndex + 1, ...CLUSTER3_CHANNEL_DEFAULTS.emptyCard };
                            const updated = [...channelCards];
                            updated[currentCardIndex] = resetCard;
                            setChannelCards(updated);
                            setSection3FooterNotice("default");
                          }
                        }}
                      >
                        초기화
                      </button>
                      <button
                        className="modal-save-btn"
                        onClick={() => {
                          const card = channelCards[currentCardIndex];
                          const missing: string[] = [];
                          if (!card.channelName?.trim()) missing.push("channelName");
                          if (!card.platform) missing.push("platform");
                          if (!card.management) missing.push("management");
                          if (!card.startYear || !card.startMonth || !card.startDay) missing.push("startDate");
                          if (!card.rating || Number(card.rating) < 1) missing.push("rating");
                          if (!card.status) missing.push("status");
                          if (!card.link?.trim()) missing.push("link");
                          if ((card.images || []).filter((img) => img !== null).length < 3) missing.push("images");
                          if (!card.insight?.trim()) missing.push("insight");
                          if (!card.experience?.trim()) missing.push("experience");
                          if (!card.metrics?.trim()) missing.push("metrics");

                          if (missing.length > 0) {
                            setSection3FooterNotice("error");
                            const modalBody = document.querySelector(".section-modal-body");
                            const targetEl = modalBody?.querySelector(`[data-field="${missing[0]}"]`);
                            if (targetEl) {
                              targetEl.classList.add("field-missing");
                              targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
                              setTimeout(() => targetEl.classList.remove("field-missing"), 900);
                            }
                            return;
                          }

                          if (!window.confirm("저장하시겠습니까?")) return;
                          const compactImages = (card.images || []).filter((img) => img !== null);
                          const reorderedImages = [...compactImages, ...Array(5 - compactImages.length).fill(null)];
                          const updated = [...channelCards];
                          updated[currentCardIndex] = { ...card, images: reorderedImages };
                          setChannelCards(updated);
                          alert("저장되었어요!");
                          setCardSnapshot(JSON.parse(JSON.stringify(updated[currentCardIndex])));
                          setIsEditMode(false);
                          setSection3FooterNotice("default");
                        }}
                      >
                        저장
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isEditMode && (
                <div className="modal-footer-bottom">
                  <p className={`modal-footer-notice ${section3FooterNotice === "error" ? "notice-error" : ""}`}>{section3FooterNotice === "error" ? "필수 사항이 누락되었어요! 확인 부탁드려요! 😊" : "내용을 모두 잘 확인하신 후 저장을 눌러주세요. 😊"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* fixed 드롭다운 옵션 (overflow 잘림 방지) */}
      {openDropdownId && dropdownPosition && (() => {
        const card = channelCards[currentCardIndex];
        if (!card) return null;
        let options: { key: string; label: string; icon?: string }[] = [];
        if (openDropdownId === "platform") {
          options = PLATFORM_OPTIONS.map((p) => ({ key: p, label: p, icon: PLATFORM_ICONS[p] || "" }));
        } else if (openDropdownId === "management") {
          options = MANAGEMENT_OPTIONS.map((o) => ({ key: o, label: o }));
        } else if (openDropdownId === "status") {
          options = STATUS_OPTIONS.map((o) => ({ key: o, label: o }));
        } else if (openDropdownId === "rating") {
          options = [1,2,3,4,5,6,7,8,9,10].map((n) => ({ key: String(n), label: String(n) }));
        }
        if (options.length === 0) return null;
        const currentVal = openDropdownId === "rating" ? String(card.rating) : (card as any)[openDropdownId] || "";
        return (
          <div className="dropdown-options-fixed" style={{ position: "fixed", top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width, zIndex: 100010 }} onWheel={(e) => e.stopPropagation()}>
            {options.map((opt) => (
              <div key={opt.key} className={`dropdown-option${currentVal === opt.key ? " selected" : ""}`} onClick={() => { handleCardChange(openDropdownId === "rating" ? "rating" : openDropdownId, opt.key); setOpenDropdownId(null); setDropdownPosition(null); }}>
                {opt.icon && <img src={opt.icon} alt={opt.label} className="platform-icon" />}
                {opt.icon === "" && openDropdownId === "platform" && <span className="platform-icon-placeholder" />}
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        );
      })()}
      {previewImage && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100002 }} onClick={() => setPreviewImage(null)}>
          <div
            className="image-preview-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "1020px", height: "794px", background: "#1a1a2e", border: "1px solid #FFA500", boxShadow: "0 0 60px rgba(255,165,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
          >
            <img src={previewImage} alt="확대 보기" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        </div>
      )}

      {/* 도움말 모달 */}
      {showHelpModal && (
        <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100001 }}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <div className="modal-header-top">
                <span style={{ fontSize: "20px" }}>🔎</span>
                <h3>도움말</h3>
                <button className="modal-close-btn" onClick={() => setShowHelpModal(false)}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
            </div>
            <div className="help-modal-body">{/* 빈 콘텐츠 */}</div>
          </div>
        </div>
      )}

      {/* 섹션 4 모달 - Top Works 링크 편집 */}
      {section4ModalOpen && (
        <div className="section-modal-overlay">
          <div className="section-modal">
            <div className="section-modal-header">
              <h3>포트폴리오 아카이빙 Output 링크 편집</h3>
              <p className="modal-subtitle">본인이 제작한 결과물 중 가장 대표적인 5개의 결과물을 등록해주세요.</p>
              <button className="modal-close-btn" onClick={() => setSection4ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section-modal-body" ref={section4ModalBodyRef}>
              {editingSection4Links.map((link, index) => {
                const prevFilled = index === 0 || editingSection4Links[index - 1]?.trim();
                const isDisabled = !prevFilled;
                return (
                  <div key={index} className={`link-edit-item${isDisabled ? " disabled" : ""}`}>
                    <div className="link-item-header">
                      <span className="link-label">Work {index + 1}</span>
                    </div>
                    <p style={{ color: "#FFC107", fontSize: "16px", margin: "0 0 8px 0" }}>채널 선택:</p>
                    <CustomSelect
                      className="channel-select"
                      style={{ display: "block", marginBottom: "8px", pointerEvents: isDisabled ? "none" : "auto", opacity: isDisabled ? 0.4 : 1 }}
                      value={link?.trim() ? editingOutputChannels[index] || "" : ""}
                      onChange={(val) => {
                        const newChannels = [...editingOutputChannels];
                        newChannels[index] = val;
                        setEditingOutputChannels(newChannels);
                      }}
                      options={channelOptions}
                    />
                    <input
                      type="url"
                      placeholder="링크를 입력하세요 (https://...)"
                      value={link}
                      disabled={isDisabled}
                      onChange={(e) => {
                        const newLinks = [...editingSection4Links];
                        newLinks[index] = e.target.value;
                        if (!e.target.value.trim()) {
                          for (let i = index + 1; i < newLinks.length; i++) {
                            newLinks[i] = "";
                          }
                          const newChannels = [...editingOutputChannels];
                          for (let i = index + 1; i < newChannels.length; i++) {
                            newChannels[i] = "";
                          }
                          setEditingOutputChannels(newChannels);
                        }
                        setEditingSection4Links(newLinks);
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setSection4ModalOpen(false)}>
                취소
              </button>
              <button
                className="save-btn"
                disabled={isSavingOutputs}
                onClick={async () => {
                  if (!validateAndScrollToEmpty(section4ModalBodyRef, editingSection4Links, editingOutputChannels)) return;
                  const success = await savePortfolioOutputs(editingSection4Links, editingOutputChannels);
                  if (success) {
                    setSection4Links([...editingSection4Links]);
                    // 슬라이드 데이터 업데이트
                    const updatedSlides = topWorksSlides.map((slide, index) => ({
                      ...slide,
                      link: editingSection4Links[index],
                    }));
                    setTopWorksSlides(updatedSlides);
                    setSection4ModalOpen(false);
                  }
                }}
              >
                {isSavingOutputs ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 5 모달 - Detail 10 링크 편집 */}
      {section5ModalOpen && (
        <div className="section-modal-overlay">
          <div className="section-modal">
            <div className="section-modal-header">
              <h3>The Detail 10 링크 편집</h3>
              <p className="modal-subtitle">위 대표 결과물 5개를 제외한 클럽 활동 결과물 중, 추가로 보여주고 싶은 결과물 링크를 등록해 주세요.</p>
              <button className="modal-close-btn" onClick={() => setSection5ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section-modal-body" ref={section5ModalBodyRef}>
              {editingSection5Links.map((link, index) => {
                const prevFilled = index === 0 || editingSection5Links[index - 1]?.trim();
                const isDisabled = !prevFilled;
                return (
                  <div key={index} className={`link-edit-item${isDisabled ? " disabled" : ""}`}>
                    <div className="link-item-header">
                      <span className="link-label">Detail {index + 1}</span>
                    </div>
                    <p style={{ color: "#FFC107", fontSize: "16px", margin: "0 0 8px 0" }}>채널 선택:</p>
                    <CustomSelect
                      className="channel-select"
                      style={{ display: "block", marginBottom: "8px", pointerEvents: isDisabled ? "none" : "auto", opacity: isDisabled ? 0.4 : 1 }}
                      value={link?.trim() ? editingDetailChannels[index] || "" : ""}
                      onChange={(val) => {
                        const newChannels = [...editingDetailChannels];
                        newChannels[index] = val;
                        setEditingDetailChannels(newChannels);
                      }}
                      options={channelOptions}
                    />
                    <input
                      type="url"
                      placeholder="링크를 입력하세요 (https://...)"
                      value={link}
                      disabled={isDisabled}
                      onChange={(e) => {
                        const newLinks = [...editingSection5Links];
                        newLinks[index] = e.target.value;
                        if (!e.target.value.trim()) {
                          for (let i = index + 1; i < newLinks.length; i++) {
                            newLinks[i] = "";
                          }
                          const newChannels = [...editingDetailChannels];
                          for (let i = index + 1; i < newChannels.length; i++) {
                            newChannels[i] = "";
                          }
                          setEditingDetailChannels(newChannels);
                        }
                        setEditingSection5Links(newLinks);
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setSection5ModalOpen(false)}>
                취소
              </button>
              <button
                className="save-btn"
                disabled={isSavingDetails}
                onClick={async () => {
                  if (!validateAndScrollToEmpty(section5ModalBodyRef, editingSection5Links, editingDetailChannels)) return;
                  const success = await savePortfolioDetails(editingSection5Links, editingDetailChannels);
                  if (success) {
                    setSection5Links([...editingSection5Links]);
                    setSection5ModalOpen(false);
                  }
                }}
              >
                {isSavingDetails ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cluster3Content;
