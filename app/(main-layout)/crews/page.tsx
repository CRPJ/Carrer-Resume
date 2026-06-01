"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Animations from "@/components/shared/Animations";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useDataMasking } from "@/hooks/useDataMasking";
import { isDemoMode as checkDemoMode } from "@/utils/isDemoMode";
import { DEMO_CREW_MEMBERS } from "@/constants/dummyData";
import { getOrgContent } from "@/components/orgContent";

interface Crew {
  id: string;
  name: string;
  gender: string;
  age: number | string;
  profileImg: string;
  university: string;
  major: string;
  team: string;
  part: string;
  nickname: string;
  club: string;
  universityMajor: string;
  status: string;
  growthStatus: string;
  totalStars: number;
  approvedWeeks: number;
}

const statusLabel = (status: string, growthStatus: string) => {
  if (status === "graduated") return "졸업";
  if (status === "suspended") return "활동 정지";
  if (growthStatus === "seasonal_rest") return "시즌 휴식";
  return "활동 중";
};

const sortByName = (a: Crew, b: Crew) => a.name.localeCompare(b.name, "ko");

const clubOptions = ["엥크레", "오랑캐", "팔랑크스"];
const statusOptions = ["활동 중", "활동 졸업", "활동 중단"];
const ITEMS_PER_PAGE = 50;

const VALID_ORGS = new Set(["encre", "phalanx", "oranke"]);

// 베타 테스터 화이트리스트는 서버측(/api/crews)에서 raw display_name 으로 필터링
// — 비로그인 마스킹 후 이름과 매칭 실패하던 버그 수정 (2026-04)

const Page = () => {
  const { mask } = useDataMasking();
  const [demoMode, setDemoMode] = useState(false);
  const [org, setOrg] = useState<string | null>(null);
  useEffect(() => {
    setDemoMode(checkDemoMode());
    setOrg(new URLSearchParams(window.location.search).get("org"));
  }, []);
  const orgContent = getOrgContent(org);
  // org 컨텍스트(?org=)가 있을 때만 분기 테마/명칭을 적용한다.
  // org 가 없으면 기존 Tuna 기본 /crews 화면을 그대로 유지해야 한다.
  const hasOrg = Boolean(org && VALID_ORGS.has(org));
  // 강조색: 분기 테마(.encre-theme/.phalanx-theme)가 부여하는 --crews-* 변수 사용.
  // 테마 클래스가 없는 기본(org 없음) 화면에서는 fallback 으로 기존 Tuna 값
  // (var(--primary-color) 등)을 그대로 사용 → 기본 화면이 원본과 동일하게 유지된다.
  const filterAccentColor = "var(--crews-filter-accent, var(--primary-color))";
  const filterAccentBackground = "var(--crews-filter-accent-bg, color-mix(in srgb, var(--primary-color) 10%, transparent))";
  const primaryAccentColor = "var(--crews-primary-accent, var(--primary-color))";
  const primaryAccentBackground = "var(--crews-primary-accent-bg, color-mix(in srgb, var(--primary-color) 15%, transparent))";
  const primaryAccentContrast = "var(--crews-primary-accent-contrast, #111)";
  const schoolDotBackground = "var(--crews-school-dot-bg, #FED402)";
  const totalStarsLabel = hasOrg ? orgContent.points.star.label : "단감";
  const resolveHref = (crew: Crew) => {
    const orgSuffix = org && VALID_ORGS.has(org) ? `&org=${org}` : "";
    const demoSuffix =
      demoMode && (DEMO_CREW_MEMBERS as readonly string[]).includes(crew.name)
        ? `&demoName=${encodeURIComponent(crew.name)}`
        : "";
    return `/cluster-4?userId=${crew.id}${orgSuffix}${demoSuffix}`;
  };
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 필터 상태
  const [nameQuery, setNameQuery] = useState("");
  const [clubFilter, setClubFilter] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("활동 중");
  const [filteredCrews, setFilteredCrews] = useState<Crew[]>([]);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);

  // 드롭다운 열림 상태
  const [clubDropdownOpen, setClubDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // 모바일 바텀시트
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftClub, setDraftClub] = useState("");
  const [draftSchool, setDraftSchool] = useState("");
  const [draftStatus, setDraftStatus] = useState("");

  const clubRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clubRef.current && !clubRef.current.contains(e.target as Node)) {
        setClubDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const res = await fetch("/api/crews");
        const result = await res.json();
        if (result.success) {
          const data = result.data as Crew[];
          setCrews(data);
          const active = data.filter((c) => c.growthStatus !== "graduated" && c.growthStatus !== "suspended");
          active.sort((a, b) => b.approvedWeeks - a.approvedWeeks);
          setFilteredCrews(active);
        }
      } catch (err) {
        console.error("크루 목록 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrews();
  }, []);

  const applyFilter = (name: string, club: string, school: string, status: string) => {
    let result = [...crews];

    if (name.trim()) {
      result = result.filter((c) => c.name === name.trim());
    }
    if (club) {
      result = result.filter((c) => c.club === club);
    }
    if (school.trim()) {
      result = result.filter((c) => c.universityMajor.includes(school.trim()));
    }
    if (status) {
      switch (status) {
        case "활동 중":
          result = result.filter((c) => c.growthStatus !== "graduated" && c.growthStatus !== "suspended");
          break;
        case "활동 졸업":
          result = result.filter((c) => c.growthStatus === "graduated");
          break;
        case "활동 중단":
          result = result.filter((c) => c.growthStatus === "suspended");
          break;
      }
    }

    result.sort((a, b) => b.approvedWeeks - a.approvedWeeks);
    setFilteredCrews(result);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    applyFilter(nameQuery, clubFilter, schoolQuery, statusFilter);
  };

  const handleReset = () => {
    setNameQuery("");
    setClubFilter("");
    setSchoolQuery("");
    setStatusFilter("");
    setClubDropdownOpen(false);
    setStatusDropdownOpen(false);
    const sorted = [...crews].sort(sortByName);
    setFilteredCrews(sorted);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredCrews.length / ITEMS_PER_PAGE);
  const paginatedCrews = filteredCrews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilter = nameQuery.trim() || clubFilter || schoolQuery.trim() || statusFilter;

  const mobileFilterSummary = [
    nameQuery.trim() && `"${nameQuery.trim()}"`,
    clubFilter,
    schoolQuery.trim() && `${schoolQuery.trim()}`,
    statusFilter,
  ].filter(Boolean).join(" · ") || "필터 선택";

  return (
    <main
      className={`nftg-content nftg-content-home${
        org === "phalanx" ? " phalanx-theme" : org === "encre" ? " encre-theme" : ""
      }`}
      style={{ padding: 0 }}
    >
      <Animations />
      <Breadcrumb title={hasOrg ? `크루 명단 · ${orgContent.displayName}` : "크루 명단"} />
      <section className="pb-120 trending trending-nft" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 30 }}>
        <div className="container-fluid" style={{ paddingLeft: 15, paddingRight: 15, maxWidth: '100%' }}>

          {/* 필터 바 — cluster4-weekly-list 래퍼로 기존 CSS 활용 */}
          <div className="cluster4-weekly-list crews-filter-only" style={{ padding: 0, margin: 0, maxWidth: '100%', background: 'transparent' }}>
          {isMobile ? (
            <div className="weekly-filter-bar weekly-filter-bar--mobile" onKeyDown={handleKeyDown}>
              <button
                className="filter-mobile-btn"
                onClick={() => {
                  setDraftName(nameQuery);
                  setDraftClub(clubFilter);
                  setDraftSchool(schoolQuery);
                  setDraftStatus(statusFilter);
                  setFilterSheetOpen(true);
                }}
              >
                <img src="/images/0/cluster4/icon/icon - 3.png" alt="filter" className="card-icon" />
                <span className="filter-mobile-text">{mobileFilterSummary}</span>
                <span className="filter-mobile-count">{filteredCrews.length}</span>
              </button>
            </div>
          ) : (
            /* 데스크톱 필터 바 */
            <div className="weekly-filter-bar" onKeyDown={handleKeyDown}>
              {/* Reset 카드 */}
              <div
                className="filter-card filter-card-large"
                onClick={handleReset}
              >
                <div className="card-left">
                  <img src="/images/0/cluster4/icon/icon - 1.png" alt="reset" className="filter-icon" />
                  <span>Reset</span>
                </div>
              </div>

              {/* 이름 검색 카드 */}
              <div
                className="filter-card"
                style={{
                  borderColor: nameQuery.trim() ? filterAccentColor : 'rgba(255, 255, 255, 0.12)',
                  background: nameQuery.trim() ? filterAccentBackground : 'transparent',
                }}
              >
                <div className="card-left" style={{ flex: 1 }}>
                  <img src="/images/0/cluster4/icon/icon - 4.png" alt="search" className="card-icon" />
                  <input
                    type="text"
                    placeholder="이름 검색"
                    maxLength={6}
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: nameQuery.trim() ? filterAccentColor : '#fff',
                      fontFamily: "'Pretendard', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      width: '100%',
                      padding: 0,
                    }}
                  />
                </div>
              </div>

              {/* 클럽 드롭다운 카드 */}
              <div
                ref={clubRef}
                className="filter-card filter-dropdown"
                style={{
                  borderColor: clubFilter ? filterAccentColor : 'rgba(255, 255, 255, 0.12)',
                  background: clubFilter ? filterAccentBackground : 'transparent',
                }}
                onClick={() => {
                  setClubDropdownOpen(!clubDropdownOpen);
                  setStatusDropdownOpen(false);
                }}
              >
                <div className="card-left">
                  <img src="/images/0/cluster4/icon/icon - cluv.png" alt="club" className="card-icon" />
                  <span className="card-label" style={{ color: clubFilter ? filterAccentColor : '#fff' }}>
                    {clubFilter || "클럽 전체"}
                  </span>
                </div>
                <span className={`card-arrow ${clubDropdownOpen ? 'open' : ''}`} style={{ color: clubFilter ? filterAccentColor : '#fff' }}>▼</span>

                {clubDropdownOpen && (
                  <div className="dropdown-menu" style={{ display: 'block' }} onClick={(e) => e.stopPropagation()}>
                    <div
                      className={`dropdown-item ${clubFilter === '' ? 'selected' : ''}`}
                      onClick={() => { setClubFilter(''); setClubDropdownOpen(false); }}
                    >
                      클럽 전체
                    </div>
                    {clubOptions.map((opt) => (
                      <div
                        key={opt}
                        className={`dropdown-item ${clubFilter === opt ? 'selected' : ''}`}
                        onClick={() => { setClubFilter(opt); setClubDropdownOpen(false); }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 학교명 검색 카드 */}
              <div
                className="filter-card"
                style={{
                  borderColor: schoolQuery.trim() ? filterAccentColor : 'rgba(255, 255, 255, 0.12)',
                  background: schoolQuery.trim() ? filterAccentBackground : 'transparent',
                }}
              >
                <div className="card-left" style={{ flex: 1 }}>
                  <img src="/images/0/cluster4/icon/icon - book.png" alt="school" className="card-icon" />
                  <input
                    type="text"
                    placeholder="학교명 검색"
                    maxLength={6}
                    value={schoolQuery}
                    onChange={(e) => setSchoolQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: schoolQuery.trim() ? filterAccentColor : '#fff',
                      fontFamily: "'Pretendard', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      width: '100%',
                      padding: 0,
                    }}
                  />
                </div>
              </div>

              {/* 상태 드롭다운 카드 */}
              <div
                ref={statusRef}
                className="filter-card filter-dropdown"
                style={{
                  borderColor: statusFilter ? filterAccentColor : 'rgba(255, 255, 255, 0.12)',
                  background: statusFilter ? filterAccentBackground : 'transparent',
                }}
                onClick={() => {
                  setStatusDropdownOpen(!statusDropdownOpen);
                  setClubDropdownOpen(false);
                }}
              >
                <div className="card-left">
                  <img src="/images/0/cluster4/icon/icon - 3.png" alt="status" className="card-icon" />
                  <span className="card-label" style={{ color: statusFilter ? filterAccentColor : '#fff' }}>
                    {statusFilter || "상태 전체"}
                  </span>
                </div>
                <span className={`card-arrow ${statusDropdownOpen ? 'open' : ''}`} style={{ color: statusFilter ? filterAccentColor : '#fff' }}>▼</span>

                {statusDropdownOpen && (
                  <div className="dropdown-menu" style={{ display: 'block' }} onClick={(e) => e.stopPropagation()}>
                    <div
                      className={`dropdown-item ${statusFilter === '' ? 'selected' : ''}`}
                      onClick={() => { setStatusFilter(''); setStatusDropdownOpen(false); }}
                    >
                      상태 전체
                    </div>
                    {statusOptions.map((opt) => (
                      <div
                        key={opt}
                        className={`dropdown-item ${statusFilter === opt ? 'selected' : ''}`}
                        onClick={() => { setStatusFilter(opt); setStatusDropdownOpen(false); }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 검색 결과 카드 */}
              <div className="filter-card">
                <div className="card-left">
                  <img src="/images/0/cluster4/icon/icon - 4.png" alt="result" className="card-icon" />
                  <span className="card-label">검색 결과</span>
                </div>
                <span className="card-value">{filteredCrews.length}</span>
              </div>

              {/* 조회 버튼 카드 */}
              <div
                className="filter-card"
                style={{
                  background: hasActiveFilter ? primaryAccentColor : 'rgba(255, 255, 255, 0.06)',
                  borderColor: hasActiveFilter ? primaryAccentColor : 'rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  width: 100,
                }}
                onClick={handleSearch}
              >
                <div className="card-left" style={{ width: '100%', justifyContent: 'center' }}>
                  <span style={{
                    color: hasActiveFilter ? primaryAccentContrast : '#fff',
                    fontFamily: "'Pretendard', sans-serif",
                    fontSize: 14,
                    fontWeight: 800,
                  }}>
                    조회
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 모바일: 필터 바텀시트 */}
          {isMobile && filterSheetOpen && (
            <div
              className="filter-sheet-overlay"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setFilterSheetOpen(false);
              }}
            >
              <div className="filter-sheet" onMouseDown={(e) => e.stopPropagation()}>
                <div className="filter-sheet-header">
                  <div className="filter-sheet-title">크루 필터</div>
                  <button type="button" className="filter-sheet-close" onClick={() => setFilterSheetOpen(false)}>
                    닫기
                  </button>
                </div>

                <div className="filter-sheet-body">
                  <label className="filter-sheet-label">이름</label>
                  <input
                    className="filter-sheet-select"
                    type="text"
                    placeholder="이름 검색 (완전일치)"
                    maxLength={6}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />

                  <label className="filter-sheet-label">클럽</label>
                  <select
                    className="filter-sheet-select"
                    value={draftClub}
                    onChange={(e) => setDraftClub(e.target.value)}
                  >
                    <option value="">클럽 전체</option>
                    {clubOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <label className="filter-sheet-label">학교명</label>
                  <input
                    className="filter-sheet-select"
                    type="text"
                    placeholder="학교명 검색 (부분일치)"
                    maxLength={6}
                    value={draftSchool}
                    onChange={(e) => setDraftSchool(e.target.value)}
                  />

                  <label className="filter-sheet-label">상태</label>
                  <select
                    className="filter-sheet-select"
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                  >
                    <option value="">상태 전체</option>
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-sheet-actions">
                  <button
                    type="button"
                    className="filter-sheet-btn secondary"
                    onClick={() => {
                      setDraftName("");
                      setDraftClub("");
                      setDraftSchool("");
                      setDraftStatus("");
                    }}
                  >
                    리셋
                  </button>
                  <button
                    type="button"
                    className="filter-sheet-btn primary"
                    onClick={() => {
                      setNameQuery(draftName);
                      setClubFilter(draftClub);
                      setSchoolQuery(draftSchool);
                      setStatusFilter(draftStatus);
                      applyFilter(draftName, draftClub, draftSchool, draftStatus);
                      setFilterSheetOpen(false);
                    }}
                  >
                    적용
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>

          <div className="row">
            <div className="col-12">
              <div className="trending-slider-wrapper">
                {loading ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 200px)',
                  }}>
                    <img
                      src={
                        org === "phalanx"
                          ? "/images/0/금장_PX.png"
                          : org === "encre"
                          ? "/images/0/금장_EC.png"
                          : "/images/0/금장_OK.png"
                      }
                      alt="로딩 중"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        animation: 'crewsLively 2s ease-in-out infinite',
                      }}
                    />
                    <p style={{
                      marginTop: '16px',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#fff',
                      fontFamily: "'Pretendard', sans-serif",
                      animation: 'crewsPulse 1.5s ease-in-out infinite',
                    }}>
                      데이터를 열심히 불러오고 있어요…
                    </p>
                    <style>{`
                      @keyframes crewsLively {
                        0%, 100% { transform: translateY(0) scale(1); }
                        50% { transform: translateY(-10px) scale(1.05); }
                      }
                      @keyframes crewsPulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.4; }
                      }
                    `}</style>
                  </div>
                ) : filteredCrews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                    조건에 맞는 크루가 없습니다.
                  </div>
                ) : (
                  <div
                    className="crews-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                      gap: 24,
                    }}
                  >
                    <style>{`
                      /* CSS-only price button: SVG 대각선 테두리를 제거하고 clip-path + ::before 로 픽셀 일관성 확보 */
                      .crews-grid .price-inner {
                        flex: 0 0 180px !important;
                        width: 180px !important;
                        max-width: 180px !important;
                        height: 48px !important;
                        padding: 0 14px !important;
                        gap: 12px !important;
                        position: relative !important;
                        isolation: isolate;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        background-color: var(--quaternary-color) !important;
                        clip-path: polygon(0% 0%, 100% 0%, 100% 64%, 88% 100%, 0% 100%) !important;
                        overflow: hidden;
                      }
                      .crews-grid .price-inner::before {
                        content: '';
                        position: absolute;
                        inset: 2px;
                        background-color: var(--secondary-color);
                        clip-path: polygon(0% 0%, 100% 0%, 100% 64%, 88% 100%, 0% 100%);
                        z-index: 0;
                        pointer-events: none;
                      }
                      .crews-grid .price-inner > * {
                        position: relative;
                        z-index: 1;
                      }
                      .crews-grid .price-inner .cmn-shape { display: none !important; }
                      /* 학교/학과: flex 부모의 wrap 해제 (SCSS .info p { flex-wrap: wrap } 오버라이드) */
                      .crews-grid .info p { flex-wrap: nowrap !important; }
                      ${hasOrg ? `
                      /* 카드 푸터 (분기 화면 전용): 좌측 .price-inner 와 우측 .review 를 한 행에 유지. */
                      .crews-grid .price-footer {
                        flex-wrap: nowrap !important;
                        gap: 8px !important;
                        width: 100% !important;
                      }
                      .crews-grid .price-footer .review {
                        flex-shrink: 0;
                        margin-left: auto;
                      }
                      .crews-grid .review .text-sm.fw-6 {
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        white-space: nowrap;
                        flex-wrap: nowrap;
                        min-width: max-content;
                      }
                      .crews-grid .review .text-sm.fw-6 i { flex-shrink: 0; }
                      ` : ""}
                    `}</style>
                    {paginatedCrews.map((crew) => (
                      <div key={crew.id} className="trending__single" style={{ height: "100%" }}>
                        <div className="thumb">
                          <Link href={resolveHref(crew)} style={{ aspectRatio: "1", overflow: "hidden", maxHeight: "none" }}>
                            {crew.profileImg ? (
                              <img
                                src={crew.profileImg}
                                alt={crew.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{
                                width: "100%",
                                height: "100%",
                                background: "#1c242f",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#555",
                                fontSize: 14,
                              }}>
                                No Image
                              </div>
                            )}
                          </Link>
                        </div>
                        <div className="content-wrapper">
                          <div className="info">
                            <p className="text-sm fw-6">
                              <Link href={resolveHref(crew)} className="crew-club-badge">{hasOrg ? ([crew.team, crew.club].find((v) => v && v !== "-") ?? "-") : crew.club}</Link>
                            </p>
                            <p className="text-sm" style={{ marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "3px", flexWrap: "nowrap", minWidth: 0, overflow: "hidden" }} title={`${mask.school(crew.university)} ${mask.major(crew.major)}`}>
                              <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: schoolDotBackground, flexShrink: 0, position: "relative", top: "-1px" }} />
                              <span style={{ minWidth: 0, flex: "1 1 auto", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mask.school(crew.university)} {mask.major(crew.major)}</span>
                            </p>
                          </div>
                          <div className="trending__single-footer">
                            <div className="author">
                              <div className="author-meta">
                                <Link href={resolveHref(crew)} aria-label="view profile" title="view profile">
                                  <span className="hexagon-wrapper">
                                    {crew.profileImg ? (
                                      <img
                                        src={crew.profileImg}
                                        alt={crew.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                      />
                                    ) : (
                                      <span style={{ display: "block", width: "100%", height: "100%", background: "#1c242f" }} />
                                    )}
                                    <svg viewBox="-3 -3 106 106" xmlns="http://www.w3.org/2000/svg" fill="none" className="hexagon-border">
                                      <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
                                    </svg>
                                  </span>
                                  <span className="text-sm fw-6">{crew.name}</span>
                                </Link>
                              </div>
                              <div className="author-title">
                                <p className="text-uppercase text-xs fw-6">{statusLabel(crew.status, crew.growthStatus)}</p>
                              </div>
                            </div>
                            <div className="price-footer">
                              <div className="price-inner">
                                <p className="price text-sm fw-6">
                                  {crew.totalStars.toLocaleString()}{" "}
                                  <span className="currency">{totalStarsLabel}</span>
                                </p>
                                <Link href={resolveHref(crew)} className="btn--primary text-sm" style={{ fontSize: 12 }}>
                                  보기
                                  <i className="ti ti-arrow-narrow-right"></i>
                                </Link>
                              </div>
                              <div className="review">
                                <span className="text-sm fw-6" style={{ whiteSpace: 'nowrap' }}>
                                  <i className="ti ti-calendar-check"></i>{crew.approvedWeeks}주
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 페이지네이션 */}
                {!loading && totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 36,
                    paddingBottom: 20,
                    flexWrap: 'wrap',
                  }}>
                    <button
                      onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0, lineHeight: 1,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'transparent', color: currentPage === 1 ? '#555' : '#fff',
                        cursor: currentPage === 1 ? 'default' : 'pointer',
                        fontSize: 16, fontWeight: 600,
                        fontFamily: "'Pretendard', sans-serif",
                      }}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{
                          width: 40, height: 40, borderRadius: 10,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, lineHeight: 1,
                          border: p === currentPage ? `1px solid ${primaryAccentColor}` : '1px solid rgba(255,255,255,0.12)',
                          background: p === currentPage ? primaryAccentBackground : 'transparent',
                          color: p === currentPage ? primaryAccentColor : '#fff',
                          cursor: 'pointer',
                          fontSize: 14, fontWeight: 700,
                          fontFamily: "'Pretendard', sans-serif",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === totalPages}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0, lineHeight: 1,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'transparent', color: currentPage === totalPages ? '#555' : '#fff',
                        cursor: currentPage === totalPages ? 'default' : 'pointer',
                        fontSize: 16, fontWeight: 600,
                        fontFamily: "'Pretendard', sans-serif",
                      }}
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
