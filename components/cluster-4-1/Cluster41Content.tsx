"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { weeklyData as sharedWeeklyData } from "@/data/weeklyData";

const Cluster41Content = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const [resultDropdownOpen, setResultDropdownOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("역대 시즌");
  const [selectedResult, setSelectedResult] = useState("주차 결과");
  const [seasonBtnPos, setSeasonBtnPos] = useState({ top: 0, left: 0 });
  const [resultBtnPos, setResultBtnPos] = useState({ top: 0, left: 0 });
  const seasonBtnRef = useRef<HTMLDivElement>(null);
  const resultBtnRef = useRef<HTMLDivElement>(null);

  // 버튼 위치 업데이트
  const updateSeasonPos = () => {
    if (seasonBtnRef.current) {
      const rect = seasonBtnRef.current.getBoundingClientRect();
      setSeasonBtnPos({ top: rect.bottom + 8, left: rect.left });
    }
  };

  const updateResultPos = () => {
    if (resultBtnRef.current) {
      const rect = resultBtnRef.current.getBoundingClientRect();
      setResultBtnPos({ top: rect.bottom + 8, left: rect.left });
    }
  };

  // 드롭다운 옵션 - 실제 데이터에 있는 시즌만 표시
  const seasonOptions = [
    "2025년, 여름 시즌",
    "2025년, 봄 시즌",
    "2024년, 겨울 시즌",
    "2024년, 가을 시즌",
  ];

  const resultOptions = [
    "전체 (all)",
    "성장 (성공)",
    "성장 (실패)",
    "휴식 (개인)",
    "휴식 (공식)",
  ];

  // 공유 데이터 사용
  const weeklyData = sharedWeeklyData;

  // 필터링된 데이터 계산
  const filteredData = weeklyData.filter((week) => {
    // 시즌 필터
    let seasonMatch = true;
    if (selectedSeason !== "역대 시즌") {
      // "2025년, 여름 시즌" → "2025 여름" 형식으로 변환하여 매칭
      const seasonParts = selectedSeason.replace("년,", "").split(" ");
      const year = seasonParts[0]; // "2025"
      const season = seasonParts[1]; // "여름", "봄", "가을", "겨울"
      seasonMatch = week.title.includes(year) && week.title.includes(season);
    }

    // 결과 필터
    let resultMatch = true;
    if (selectedResult !== "주차 결과" && selectedResult !== "전체 (all)") {
      // "성장 (성공)" → "성공", "휴식 (개인)" → "휴식(개인)" 매핑
      if (selectedResult === "성장 (성공)") {
        resultMatch = week.growthStatus === "성공";
      } else if (selectedResult === "성장 (실패)") {
        resultMatch = week.growthStatus === "실패";
      } else if (selectedResult === "휴식 (개인)") {
        resultMatch = week.growthStatus === "휴식(개인)";
      } else if (selectedResult === "휴식 (공식)") {
        resultMatch = week.growthStatus === "휴식(공식)";
      }
    }

    return seasonMatch && resultMatch;
  });

  // 페이지네이션 설정
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSeason, selectedResult]);

  // 타이틀에서 이미지 경로 생성 (월/주 정보로 실제 시즌 주차 계산)
  const getImagePath = (title: string) => {
    // "2025 여름 시즌, 8주차 (8월 4주차)" → 괄호 안의 월/주 정보 추출
    const match = title.match(/\((\d+)월\s*(\d+)주차\)/);
    if (match) {
      const month = parseInt(match[1]);
      const weekInMonth = parseInt(match[2]);

      // 월별 시즌 및 주차 매핑
      let season = "";
      let weekNum = 0;
      let suffix = ""; // 특수 파일명 접미사

      if (month === 1) {
        season = "겨울";
        weekNum = weekInMonth; // 1월 1주 = 겨울 1주
      } else if (month === 2) {
        season = "겨울";
        weekNum = 4 + weekInMonth; // 2월 1주 = 겨울 5주
        // 특수 케이스: 2월 2주차는 "설,구정" 접미사
        if (weekInMonth === 2) {
          suffix = " 설,구정";
        }
      } else if (month === 3) {
        season = "봄";
        weekNum = weekInMonth; // 3월 1주 = 봄 1주
      } else if (month === 4) {
        season = "봄";
        weekNum = 4 + weekInMonth; // 4월 1주 = 봄 5주
      } else if (month === 5) {
        season = "봄";
        weekNum = 8 + weekInMonth; // 5월 1주 = 봄 9주
      } else if (month === 6) {
        season = "봄";
        weekNum = 12 + weekInMonth; // 6월 1주 = 봄 13주
      } else if (month === 7) {
        season = "여름";
        weekNum = weekInMonth; // 7월 1주 = 여름 1주
      } else if (month === 8) {
        season = "여름";
        weekNum = 4 + weekInMonth; // 8월 1주 = 여름 5주
      } else if (month === 9) {
        season = "가을";
        weekNum = weekInMonth; // 9월 1주 = 가을 1주
      } else if (month === 10) {
        season = "가을";
        weekNum = 4 + weekInMonth; // 10월 1주 = 가을 5주
      } else if (month === 11) {
        season = "가을";
        weekNum = 8 + weekInMonth; // 11월 1주 = 가을 9주
      } else if (month === 12) {
        season = "가을";
        weekNum = 12 + weekInMonth; // 12월 1주 = 가을 13주
      }

      return `/images/0/cluster 4/주차 이미지/${season} ${weekNum}주차 (${month}월 ${weekInMonth}주차${suffix}).png`;
    }
    return "/images/0/cluster 4/주차 이미지/여름 1주차 (7월 1주차).png";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <img
        key={i}
        src="/images/0/cluster 4/icon/icon - star.png"
        alt="star"
        className={`star-icon ${i >= rating ? 'empty' : ''}`}
      />
    ));
  };

  return (
    <>
      {/* 드롭다운 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* 역대 시즌 드롭다운 메뉴 (최상단 렌더링) */}
      {seasonDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: seasonBtnPos.top,
            left: seasonBtnPos.left,
            width: '200px',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            zIndex: 999999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'dropdownSlide 0.2s ease-out'
          }}
        >
          {seasonOptions.map((option, index) => (
            <div
              key={index}
              style={{
                padding: '12px 16px',
                color: selectedSeason === option ? '#FFA500' : '#fff',
                background: selectedSeason === option ? 'rgba(255,165,0,0.2)' : 'transparent',
                cursor: 'pointer',
                borderBottom: index < seasonOptions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}
              onClick={() => {
                setSelectedSeason(option);
                setSeasonDropdownOpen(false);
              }}
              onMouseEnter={(e) => {
                if (selectedSeason !== option) {
                  e.currentTarget.style.background = 'rgba(255,165,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSeason !== option) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {/* 주차 결과 드롭다운 메뉴 (최상단 렌더링) */}
      {resultDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: resultBtnPos.top,
            left: resultBtnPos.left,
            width: '200px',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            zIndex: 999999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'dropdownSlide 0.2s ease-out'
          }}
        >
          {resultOptions.map((option, index) => (
            <div
              key={index}
              style={{
                padding: '12px 16px',
                color: selectedResult === option ? '#FFA500' : '#fff',
                background: selectedResult === option ? 'rgba(255,165,0,0.2)' : 'transparent',
                cursor: 'pointer',
                borderBottom: index < resultOptions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}
              onClick={() => {
                setSelectedResult(option);
                setResultDropdownOpen(false);
              }}
              onMouseEnter={(e) => {
                if (selectedResult !== option) {
                  e.currentTarget.style.background = 'rgba(255,165,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedResult !== option) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}

    <div className="cluster4-content cluster4-content--week">
      {/* Section 1: CLUB CHALLENGE GROWTH */}
      <section className="cluster4-section1">
        {/* 좌측 상단 탭 (세로 정렬) */}
        <div className="top-tabs">
          <div className="tab active">
            <img src="/images/0/cluster%204/icon/icon%20-%20%EC%A0%84%EA%B5%AC.png" alt="전구" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Weekly Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </div>
          <Link href="/cluster-4-1" className="tab">
            <img src="/images/0/cluster%204/icon/icon%20-%20book.png" alt="book" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Season Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
        </div>

        {/* 타이틀 */}
        <div className="section1-title-wrapper">
          <div className="title-inner">
            <h2 className="section1-title-shadow">CLUB CHALLENGE GROWTH</h2>
            <h2 className="section1-title">CLUB CHALLENGE GROWTH</h2>
          </div>
        </div>

        {/* 설명 텍스트 */}
        <div className="section1-description">
          <p>이 페이지에서는 주차별로(weekly), 시즌별로(season) 차곡차곡 성장한 클럽의 내역이 나옵니다.</p>
          <p>잠깐의 열정과 객기는 누구나 가질 수 있지만, 역경과 부침, 짜증나는 고난과 요동치는 감정을 이겨내며 꾸준하게 성장할 수 있는 사람은 생각보다 적습니다.😊</p>
          <p className="small-text">1주, 1개월, 1분기, 1반기, 1년.. 세상에서 평가하는 나의 신뢰성은 어떠한가요?</p>
          <p className="quote-text">
            There is no magic to achievement. It's really about hard work, choices and persistence.
          </p>
          <p className="quote-highlight">무언가를 성취하기 위해 부릴 수 있는 마법은 없다. 필요한 것은 오직 노력, 선택 그리고 꾸준함일 뿐이다.</p>
          <p className="quote-author">-Michelle Obama-</p>
        </div>
      </section>

      {/* Section 2: WEEKLY GROWTH 카드 */}
      <section className="cluster4-section2">
        <div className="season-growth-card visible">
          {/* 왼쪽 콘텐츠 */}
          <div className="card-left">
            {/* 타이틀과 배지를 한 줄로 */}
            <div className="season-header-row">
              <div className="season-title-wrapper">
                <h3 className="season-title-shadow">WEEKLY GROWTH</h3>
                <h3 className="season-title">WEEKLY GROWTH</h3>
              </div>
              <div className="season-badge" style={{ backgroundImage: "url('/images/0/cluster%204/button.png')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'calc(50% + 5px) center' }}>
                <span className="badge-text">성장 진행 중</span>
              </div>
            </div>

            {/* Add new collection 카드 */}
            <div className="collection-card">
              <div className="collection-icon">
                <img src="/images/0/cluster%204/아호%20캐릭터.png" alt="아호 캐릭터" />
              </div>
              <div className="collection-content">
                <div className="collection-header">
                  <img src="/images/0/cluster 4/icon/icon - plus.png" alt="plus" className="add-icon" />
                  <span className="collection-label">Add new passion, hardship and growth</span>
                </div>
                <p className="collection-text">
                  현재 클럽은, <strong>2025년 여름 시즌, 6주차</strong>를 진행 중인 과정에 있습니다.
                </p>
              </div>
            </div>

            {/* Details 카드 */}
            <div className="details-card">
              <div className="details-header">
                <img src="/images/0/cluster 4/icon/icon - ppt.png" alt="details" className="toggle-icon" />
                <span className="toggle-text">Details</span>
                <span className="arrow-icon"></span>
              </div>

              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">성장 시작 주차</span>
                  <span className="detail-value">2024년, 가을 시즌, 14주차</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 가능 주차</span>
                  <span className="detail-value"><span className="number">15</span><span className="orange-highlight">(1)</span> <span className="white-text">개 주차</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 성공 주차</span>
                  <span className="detail-value"><span className="number">12</span><span className="orange-highlight">(1)</span> <span className="white-text">개 주차</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 실패 주차</span>
                  <span className="detail-value"><span className="number">3</span><span className="orange-highlight">(0)</span> <span className="white-text">개 주차</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 휴식 주차</span>
                  <span className="detail-value"><span className="number">6</span> <span className="white-text">개 주차</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 종료 주차</span>
                  <span className="detail-value">2024년, 가을 시즌, 14주차 (성장 완료)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 캐릭터 이미지 */}
          <div className="card-right">
            <img src="/images/0/cluster 4/4-1/image.png" alt="Character" />
          </div>
        </div>
      </section>

      {/* Section 3: 주차별 리스트 */}
      <section className="cluster4-weekly-list">
        {/* 필터 바 */}
        <div className="weekly-filter-bar">
          {/* 254x40 Reset 카드 */}
          <div
            className="filter-card filter-card-large"
            onClick={() => {
              setSelectedSeason("역대 시즌");
              setSelectedResult("주차 결과");
              setSeasonDropdownOpen(false);
              setResultDropdownOpen(false);
            }}
          >
            <div className="card-left">
              <img src="/images/0/cluster 4/icon/icon - 1.png" alt="reset" className="filter-icon" />
              <span>Reset</span>
            </div>
          </div>
          {/* 역대 시즌 버튼 */}
          <div
            ref={seasonBtnRef}
            className="filter-card filter-dropdown"
            style={{
              borderColor: selectedSeason !== "역대 시즌" ? '#FFA500' : 'rgba(255, 255, 255, 0.12)',
              background: selectedSeason !== "역대 시즌" ? 'rgba(255, 165, 0, 0.1)' : 'transparent'
            }}
            onClick={() => {
              updateSeasonPos();
              setSeasonDropdownOpen(!seasonDropdownOpen);
              setResultDropdownOpen(false);
            }}
          >
            <div className="card-left">
              <img src="/images/0/cluster 4/icon/icon - 2.png" alt="calendar" className="card-icon" />
              <span className="card-label" style={{ color: selectedSeason !== "역대 시즌" ? '#FFA500' : '#fff' }}>{selectedSeason}</span>
            </div>
            <span className={`card-arrow ${seasonDropdownOpen ? 'open' : ''}`} style={{ color: selectedSeason !== "역대 시즌" ? '#FFA500' : '#fff' }}>▼</span>
          </div>
          {/* 주차 결과 버튼 */}
          <div
            ref={resultBtnRef}
            className="filter-card filter-dropdown"
            style={{
              borderColor: selectedResult !== "주차 결과" ? '#FFA500' : 'rgba(255, 255, 255, 0.12)',
              background: selectedResult !== "주차 결과" ? 'rgba(255, 165, 0, 0.1)' : 'transparent'
            }}
            onClick={() => {
              updateResultPos();
              setResultDropdownOpen(!resultDropdownOpen);
              setSeasonDropdownOpen(false);
            }}
          >
            <div className="card-left">
              <img src="/images/0/cluster 4/icon/icon - 3.png" alt="setting" className="card-icon" />
              <span className="card-label" style={{ color: selectedResult !== "주차 결과" ? '#FFA500' : '#fff' }}>{selectedResult}</span>
            </div>
            <span className={`card-arrow ${resultDropdownOpen ? 'open' : ''}`} style={{ color: selectedResult !== "주차 결과" ? '#FFA500' : '#fff' }}>▼</span>
          </div>
          <div className="filter-card">
            <div className="card-left">
              <img src="/images/0/cluster 4/icon/icon - 4.png" alt="search" className="card-icon" />
              <span className="card-label">검색 결과</span>
            </div>
            <span className="card-value">{filteredData.length}</span>
          </div>
          <div className="filter-card">
            <div className="card-left">
              <img src="/images/0/cluster 4/icon/icon - 5.png" alt="clock" className="card-icon" />
              <span className="card-label">전체 주차 수</span>
            </div>
            <span className="card-value">{weeklyData.length}</span>
          </div>
        </div>

        {/* 주차 카드 리스트 */}
        <div className="weekly-cards">
          {paginatedData.map((week) => (
            <Link href={`/cluster-4-card/${week.id}`} key={week.id} className="weekly-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              {/* 왼쪽 이미지 */}
              <div className={`weekly-card-image ${week.growthStatus === '휴식(개인)' ? 'rest-personal-overlay' : ''}`}>
                <img src={getImagePath(week.title)} alt={week.title} />
                {week.growthStatus === '휴식(개인)' && (
                  <div className="rest-message">
                    <span className="rest-text-line">충분히 <span className="rest-emoji">🥰</span></span>
                    <span className="rest-text-line">쉬었나요..?</span>
                  </div>
                )}
                <div className="image-badges">
                  <div className={`badge-tag ${week.growthStatus === '실패' ? 'fail' : ''} ${week.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${week.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>{week.growthStatus.includes('휴식') ? week.growthStatus : `성장(${week.growthStatus})`}</div>
                  <div className="badge-like">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* 중앙 콘텐츠 */}
              <div className="weekly-card-content">
                {/* 첫 번째 줄: 타이틀, 날짜, 주차 */}
                <div className="weekly-card-header">
                  <h4 className="weekly-card-title">{week.title}</h4>
                  <span className="weekly-card-date">
                    <img src="/images/0/cluster 4/icon/icon - 6.png" alt="calendar" className="date-icon" />
                    2025 - 03 - 23 (월) ~ 2025 - 03 - 30 (일)
                  </span>
                  <span className="weekly-card-week">
                    <img src="/images/0/cluster 4/icon/icon - 7.png" alt="clock" className="week-icon" />
                    <span className="week-number">25</span> / 30 주차
                  </span>
                </div>

                {/* 두 번째 줄: 팀, 파트, 역할, 아이템 */}
                <div className="weekly-card-info">
                  {/* 그룹 1: 팀, 파트 */}
                  <div className="info-group">
                    <span className="info-item team"><strong>[팀]</strong> <span className="text-gray">운영진(6기)</span></span>
                    <span className="info-divider">|</span>
                    <span className="info-item part"><strong>[파트]</strong> <span className="text-gray">팀장(웹툰드라마팀)</span></span>
                  </div>
                  {/* 그룹 2: 역할 */}
                  <div className="info-group">
                    <span className="info-badge role">
                      <img src="/images/0/cluster 4/icon/icon - 8.png" alt="role" className="role-icon" />
                      <span>운영진(앰버서더)</span>
                    </span>
                  </div>
                  {/* 그룹 3: 아이템들 */}
                  <div className="info-group items">
                    <span className="info-divider">·</span>
                    <span className="info-item with-icon">
                      단감
                      <img src="/images/0/cluster 4/icon/icon - 단감.png" alt="단감" className="item-icon" />
                      <strong className="number-value">25</strong>
                      개
                    </span>
                    <span className="info-divider">·</span>
                    <span className="info-item with-icon">
                      인절미
                      <img src="/images/0/cluster 4/icon/icon - 인절미.png" alt="인절미" className="item-icon" />
                      <strong className="number-value">30</strong>
                      개
                    </span>
                    <span className="info-divider">·</span>
                    <span className="info-item with-icon">
                      어흥
                      <img src="/images/0/cluster 4/icon/icon - 어흥.png" alt="어흥" className="item-icon" />
                      <strong className="number-value">-2</strong>
                      개
                    </span>
                  </div>
                </div>

                {/* 세 번째 줄: 주차 성장률 프로그레스 바 */}
                <div className="weekly-card-main-progress">
                  <span className="progress-label"><span className="dot">·</span> 주차 성장률 <strong>{week.growthStatus.includes('휴식') ? '-' : week.growthStatus === '실패' ? 0 : week.progress.growth}%</strong></span>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${week.growthStatus === '실패' ? 0 : week.progress.growth}%` }}></div>
                    </div>
                  </div>
                  <span className="total-count">
                    <img src="/images/0/cluster 4/icon/icon - 0.png" alt="leaf" className="leaf-icon" />
                    총 13 개 중 <strong>{week.growthStatus === '성공' ? 7 : week.growthStatus.includes('휴식') ? '-' : 0}</strong> 개
                  </span>
                </div>

                {/* 네 번째, 다섯 번째 줄: 스탯들 */}
                <div className={`weekly-card-stats-wrapper ${week.growthStatus === '실패' ? 'fail' : ''} ${week.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${week.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>
                  <div className="weekly-card-stats">
                    <span className="stat"><span className="dot">·</span> 실무 <span className={`highlight ${week.growthStatus === '실패' ? 'fail' : ''} ${week.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${week.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>정보</span> 강화율 <strong>{week.growthStatus === '성공' ? 100 : week.growthStatus.includes('휴식') ? '-' : 0}%</strong> <span className="gray">(<span className="num">{week.growthStatus === '성공' ? 4 : week.growthStatus.includes('휴식') ? '-' : 0}</span>/6)</span></span>
                    <span className="stat"><span className="dot">·</span> 실무 <span className={`highlight ${week.growthStatus === '실패' ? 'fail' : ''} ${week.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${week.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>역량</span> 강화율 <strong>{week.growthStatus === '성공' ? 100 : week.growthStatus.includes('휴식') ? '-' : 0}%</strong> <span className="gray">(<span className="num">{week.growthStatus === '성공' ? 1 : week.growthStatus.includes('휴식') ? '-' : 0}</span>/1)</span></span>
                    <span className="stat"><span className="dot">·</span> 실무 <span className={`highlight ${week.growthStatus === '실패' ? 'fail' : ''} ${week.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${week.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>경험</span> 강화율 <strong>{week.growthStatus === '성공' ? 100 : week.growthStatus.includes('휴식') ? '-' : 0}%</strong> <span className="gray">(<span className="num">{week.growthStatus === '성공' ? 3 : week.growthStatus.includes('휴식') ? '-' : 0}</span>/4)</span></span>
                    <span className="stat"><span className="dot">·</span> 실무 <span className={`highlight ${week.growthStatus === '실패' ? 'fail' : ''} ${week.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${week.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>경력</span> 강화율 <strong>{week.growthStatus === '성공' ? 100 : week.growthStatus.includes('휴식') ? '-' : 0}%</strong> <span className="gray">(<span className="num">{week.growthStatus === '성공' ? 3 : week.growthStatus.includes('휴식') ? '-' : 0}</span>/5)</span></span>
                  </div>
                  <div className="weekly-card-extra-stats">
                    <span className="stat"><span className="dot">·</span> <span className="label">주차 평판</span> <span className="num">{week.growthStatus === '성공' ? 3 : week.growthStatus.includes('휴식') ? '-' : 0}</span><span className="white">/3</span></span>
                    <span className="stat"><span className="dot">·</span> <span className="label">명성도(FM)</span> <span className="num">{week.growthStatus === '성공' ? 203 : week.growthStatus.includes('휴식') ? '-' : 0}</span></span>
                    <span className="stat"><span className="dot">·</span> <span className="label">연계 동료</span> <span className="num">{week.growthStatus === '성공' ? 2 : week.growthStatus.includes('휴식') ? '-' : 0}</span><span className="white">/3</span></span>
                    <span className="stat empty"></span>
                  </div>
                </div>
              </div>

              {/* 우측 성장 상태 */}
              <div className={`weekly-card-status-badge ${week.growthStatus === '실패' ? 'fail' : ''} ${week.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${week.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>
                <span className="status-text">{week.growthStatus.includes('휴식') ? week.growthStatus : `성장 (${week.growthStatus})`}</span>
                <img src={`/images/0/cluster%204/icon/icon%20-%20${week.growthStatus.includes('휴식') ? week.growthStatus.replace('(', '%28').replace(')', '%29') : `성장%28${week.growthStatus}%29`}.png`} alt={week.growthStatus} className="trophy-icon" />
              </div>

              {/* 더보기 버튼 */}
              <div className="weekly-card-more-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="2" fill="none" />
                  <path d="M7 5.5L10 8L7 10.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="weekly-pagination">
          {totalPages > 0 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <span
                key={num}
                className={`page-num ${currentPage === num ? 'active' : ''} ${num === totalPages ? 'last' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </span>
            ))
          ) : (
            <span className="no-results">검색 결과가 없습니다</span>
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default Cluster41Content;
