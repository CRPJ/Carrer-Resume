"use client";

import React, { useState } from "react";
import Link from "next/link";

const Cluster4CardContent = () => {
  // 주차 평판 데이터
  const reputationData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/cluster 4/4-1/profile-1.png",
      university: "서울대학교",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트팀",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 3,
      ratingCount: "6 / 10",
      description: "20자까지 쓴 내용을 확인할 수 있습니다...",
      fm: 325,
    },
    {
      id: 2,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/cluster 4/4-1/profile-2.png",
      university: "서울대학교",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트팀",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 4,
      ratingCount: "6 / 10",
      description: "20자까지 쓴 내용을 확인할 수 있습니다...",
      fm: 325,
    },
    {
      id: 3,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/cluster 4/4-1/profile-3.png",
      university: "서울대학교",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트팀",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 3,
      ratingCount: "6 / 10",
      description: "20자까지 쓴 내용을 확인할 수 있습니다...",
      fm: 325,
    },
    {
      id: 4,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/cluster 4/4-1/profile-1.png",
      university: "서울대학교",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트팀",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 5,
      ratingCount: "6 / 10",
      description: "20자까지 쓴 내용을 확인할 수 있습니다...",
      fm: 325,
    },
  ];

  // 연계 동료 데이터
  const colleagueData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/cluster 4/4-1/profile-1.png",
      university: "서울대학교",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트팀",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "2025 - 12 - 22 (월)",
    },
    {
      id: 2,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/cluster 4/4-1/profile-2.png",
      university: "서울대학교",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트팀",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "2025 - 12 - 22 (월)",
    },
    {
      id: 3,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "",
      university: "서울대학교",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트팀",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "0000 - 00 - 00 (월)",
      isEmpty: true,
    },
  ];

  // 실무 정보 카드 데이터
  const workInfoCards = [
    { id: 1, image: "/images/0/cluster 4/4-1/card-img-1.png", title: "Main Title", verified: true, category: "퀴즈왕", categoryColor: "#ff6b6b" },
    { id: 2, image: "/images/0/cluster 4/4-1/card-img-2.png", title: "Main Title", verified: true, category: "에세이", categoryColor: "#ffd93d" },
    { id: 3, image: "/images/0/cluster 4/4-1/card-img-3.png", title: "Main Title", verified: true, category: "인터뷰스", categoryColor: "#4ecdc4" },
    { id: 4, image: "/images/0/cluster 4/4-1/card-img-1.png", title: "Main Title", verified: true, category: "멘티터", categoryColor: "#ff6b6b" },
    { id: 5, image: "/images/0/cluster 4/4-1/card-img-2.png", title: "Main Title", verified: true, category: "포럼", categoryColor: "#ffd93d" },
    { id: 6, image: "/images/0/cluster 4/4-1/card-img-3.png", title: "Main Title", verified: true, category: "세션", categoryColor: "#a8e6cf" },
    { id: 7, image: "/images/0/cluster 4/4-1/card-img-1.png", title: "Main Title", verified: true, category: "기타스", categoryColor: "#dda0dd" },
    { id: 8, image: "", title: "Main Title", verified: true, category: "", categoryColor: "" },
    { id: 9, image: "", title: "Main Title", verified: true, category: "", categoryColor: "" },
  ];

  // 실무 경험 카드 데이터
  const workExpCards = [
    { id: 1, code: "AA22-11111", badge: "커버아미케터 Launch", title: "Main Title", verified: true, rating: 4, ratingCount: "6 / 10", hasWeb: true },
    { id: 2, code: "AA22-11111", badge: "삼성전자알토픽 마케팅", title: "Main Title", verified: true, rating: 4, ratingCount: "6 / 10", hasWeb: true },
    { id: 3, code: "AA22-11111", badge: "관계지|마케팅 실무", title: "Main Title", verified: true, rating: 3, ratingCount: "6 / 10", hasWeb: false },
    { id: 4, code: "AA22-11111", badge: "", title: "Main Title", verified: true, rating: 0, ratingCount: "- / 10", hasWeb: false, isEmpty: true },
  ];

  // 실무 경력 카드 데이터
  const workCareerCards = [
    { id: 1, code: "AA22-11111", badge: "마케팅|마이릿|축시 출시", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true },
    { id: 2, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true },
    { id: 3, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true },
    { id: 4, code: "", badge: "", title: "Main Title", verified: true, date: "0000 - 00 - 00 (월)", likes: "0.99", hasWeb: false, isEmpty: true },
    { id: 5, code: "", badge: "", title: "Main Title", verified: true, date: "0000 - 00 - 00 (월)", likes: "0.99", hasWeb: false, isEmpty: true },
  ];

  // 별점 렌더링 함수
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>★</span>
      );
    }
    return stars;
  };

  return (
    <div className="cluster4-card-content weekly-card-detail">
      {/* 탭 영역 */}
      <div className="top-tabs-wrapper">
        <div className="top-tabs">
          <Link href="/cluster-4-1" className="tab active">
            <img src="/images/0/cluster%204/icon/icon%20-%20%EC%A0%84%EA%B5%AC.png" alt="전구" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Weekly Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
          <Link href="/cluster-4" className="tab">
            <img src="/images/0/cluster%204/icon/icon%20-%20book.png" alt="book" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Season Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
        </div>
        <div className="nav-buttons">
          <button className="nav-btn-prev">
            <span>이전 주</span>
            <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20left.png" alt="left" className="arrow-icon" />
          </button>
          <button className="nav-btn-next">
            <span>다음 주</span>
            <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20right.png" alt="right" className="arrow-icon" />
          </button>
          <Link href="/cluster-4-1" className="nav-btn-filled">
            <img src="/images/0/cluster%204/icon/icon%20-%201.png" alt="list" className="list-icon" />
            <span>전체 목록으로 돌아가기</span>
          </Link>
        </div>
      </div>

      {/* ========== 섹션 1: 주차 이미지 + 헤더 + 평판 + 동료 ========== */}
      <div className="section1-layout">
        {/* 왼쪽: 큰 주차 이미지 */}
        <div className="section1-left">
          <div className="main-image-container">
            <img src="/images/0/cluster 4/주차 이미지/여름 3주차 (7월 3주차).png" alt="주차 이미지" className="main-week-image" />
            {/* 뱃지 두 개 */}
            <div className="image-badges">
              <div className="badge-item">
                <span className="badge-count">99</span>
                <span className="badge-icon">♥</span>
              </div>
              <div className="badge-item">
                <img src="/images/0/cluster 4/icon/icon - trophy.png" alt="trophy" className="badge-trophy" />
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 정보 영역 */}
        <div className="section1-right">
          {/* 헤더 */}
          <div className="section1-header">
            <div className="header-title-row">
              <h1 className="section1-title">2025 여름 시즌, 3주차</h1>
              <div className="status-badge success">
                <span>성장(성공)</span>
                <img src="/images/0/cluster 4/icon/icon - 성장(성공).png" alt="성공" />
              </div>
            </div>
            <div className="header-info-row">
              <div className="info-badge date">
                <img src="/images/0/cluster 4/icon/icon - 6.png" alt="calendar" />
                <span>2025 - 03 - 23 (월) ~ 2025 - 03 - 30 (일)</span>
              </div>
              <div className="info-badge role">
                <img src="/images/0/cluster 4/icon/Interface/Star-3.png" alt="role" />
                <span>운영진(앰배서더)</span>
              </div>
              <div className="info-badge week">
                <img src="/images/0/cluster 4/icon/icon - 7.png" alt="week" />
                <span><span className="highlight">25</span> / 30 주차</span>
              </div>
            </div>
            <div className="header-info-row2">
              <div className="info-group left">
                <span className="info-item team"><strong>[팀]</strong> <span className="text-gray">미디어</span></span>
                <span className="info-divider">|</span>
                <span className="info-item part"><strong>[파트]</strong> <span className="text-gray">웹툰드라마</span></span>
              </div>
              <div className="info-group right">
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
          </div>

          {/* 주차 평판 */}
          <div className="reputation-section">
            <div className="section-title-row">
              <img src="/images/0/cluster 4/icon/icon - 주차 평판.png" alt="주차 평판" className="section-icon" />
              <span className="section-label">주차 평판</span>
              <span className="section-count"><span className="count-num">3</span>/3</span>
            </div>
            <div className="reputation-cards-grid">
              {reputationData.map((user, index) => (
                <div key={user.id} className="reputation-card">
                  <div className="card-profile">
                    <div className="profile-image">
                      {user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}
                    </div>
                    <div className="profile-info">
                      <div className="profile-name">{user.name} | {user.gender} | {user.age}</div>
                      <div className="profile-details">
                        <span className="university">{user.university}</span> | <span className="major">{user.major}</span>학과 | <span className="team">{user.team}</span> | <span className="part">{user.part}</span>파트 | <span className="nickname">{user.nickname}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-rating">
                    <div className="stars">{renderStars(user.rating)}</div>
                    <span className="rating-count">{user.ratingCount}</span>
                  </div>
                  <div className="card-description">{user.description} <span className="emoji">😊</span></div>
                  <div className="card-footer">
                    <span className="fm-badge">FM : {user.fm}</span>
                    <button className="recommend-btn">추천해주점봐♥</button>
                  </div>
                </div>
              ))}
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
              {colleagueData.map((user) => (
                <div key={user.id} className={`colleague-card ${user.isEmpty ? 'empty' : ''}`}>
                  <div className="card-profile">
                    <div className="profile-image">
                      {user.profileImg && !user.isEmpty ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}
                    </div>
                    <div className="profile-info">
                      <div className="profile-name">{user.name} | {user.gender} | {user.age}</div>
                      <div className="profile-details">
                        <span className="university">{user.university}</span> | <span className="major">{user.major}</span>학과 | <span className="team">{user.team}</span> | <span className="part">{user.part}</span>파트 | <span className="nickname">{user.nickname}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-date-row">
                    <span className="date">{user.date}</span>
                    <span className="view-icon">👁</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========== 섹션 2: 주차 성장률 + 실무 정보 + 실무 역량 ========== */}
      <div className="section2-layout">
        {/* 주차 성장률 */}
        <div className="growth-rate-header">
          <div className="growth-left">
            <span className="growth-title">주차 성장률</span>
            <span className="growth-count">🔥 총 13개 중 7개</span>
          </div>
          <div className="growth-center">
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '65%' }}></div>
            </div>
            <span className="progress-percent">65%</span>
          </div>
          <div className="growth-right">
            <span className="growth-label">라인별 강화 결과</span>
            <div className="legend-items">
              <span className="legend-item success"><span className="dot"></span>강화 성공</span>
              <span className="legend-item pending"><span className="dot"></span>강화 대기</span>
              <span className="legend-item fail"><span className="dot"></span>강화 실패</span>
            </div>
          </div>
        </div>

        {/* 실무 정보 */}
        <div className="work-info-section">
          <div className="section-header-row">
            <div className="section-title-left">
              <span className="fire-icon">🔥</span>
              <span className="section-name">실무 정보</span>
              <span className="section-count">총 7개 중 4개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">강화율</span>
              <span className="rate-value">65%</span>
            </div>
          </div>
          <div className="work-info-cards">
            {workInfoCards.map((card) => (
              <div key={card.id} className={`work-info-card ${!card.image ? 'empty' : ''}`}>
                <div className="card-image-area">
                  {card.image ? <img src={card.image} alt={card.title} /> : <div className="image-placeholder"></div>}
                </div>
                <div className="card-content-area">
                  <div className="card-title-row">
                    <span className="card-title">{card.title}</span>
                    {card.verified && <span className="verified-icon">✓ Verified</span>}
                    {card.category && <span className="category-tag" style={{ background: card.categoryColor }}>{card.category}</span>}
                  </div>
                  <p className="card-desc">CU의 무덤이 몽골에 이어 하와이까지 업습하는 가운데, 한국 유통업계가 들파에나가야 하는 코스피를 어디가 방향 앞대 산택일지가 관건입니다. 80일이상사오육칠팔구십</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 실무 역량 */}
        <div className="work-ability-section">
          <div className="section-header-row">
            <div className="section-title-left">
              <span className="fire-icon">🔥</span>
              <span className="section-name">실무 역량</span>
              <span className="section-count">총 1개 중 1개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">강화율</span>
              <span className="rate-value">100%</span>
            </div>
          </div>
          <div className="work-ability-card">
            <div className="ability-card-header">
              <span className="card-title">Main Title</span>
              <span className="verified-icon">✓ Verified</span>
              <span className="code-tag">AA22-11111</span>
              <span className="info-tag">[실무 Info]인하우스 & 에이전시</span>
            </div>
            <p className="ability-desc">[마케팅 실무] 현업에서 마케팅 업계를 구성하고 있는 인하우스 와 에이전시의 개념, 그리고 내부 속성을 알아보자구~</p>
            <div className="sub-title-row">
              <span className="sub-icon">📖</span>
              <span className="sub-label">Sub Title</span>
            </div>
            <p className="sub-desc">실무 역량의 서브타이들이 50자분 어디까지 보일지 얼마의 관건이고 이 사용자가 활용한 소재가 매력 지 관건이고 이 사용자가 활용한 소재가 매력 페이79...</p>
          </div>
          <div className="character-image">
            <img src="/images/0/cluster 4/bg cha.png" alt="character" />
          </div>
        </div>
      </div>

      {/* ========== 섹션 3: 실무 경험 + 실무 경력 ========== */}
      <div className="section3-layout">
        {/* 실무 경험 */}
        <div className="work-exp-section">
          <div className="section-header-row">
            <div className="section-title-left">
              <span className="fire-icon">🔥</span>
              <span className="section-name">실무 경험</span>
              <span className="section-count">총 4개중 3개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">강화율</span>
              <span className="rate-value">75%</span>
            </div>
          </div>
          <div className="work-exp-cards">
            {workExpCards.map((card) => (
              <div key={card.id} className={`work-exp-card ${card.isEmpty ? 'empty' : ''}`}>
                <div className="card-header">
                  {card.hasWeb && <span className="web-badge">WEB</span>}
                  {card.code && <span className="code-tag">{card.code}</span>}
                  {card.badge && <span className="badge-tag">{card.badge}</span>}
                </div>
                <div className="card-rating-row">
                  <div className="stars">{renderStars(card.rating)}</div>
                  <span className="rating-count">{card.ratingCount}</span>
                </div>
                <div className="card-title-row">
                  <span className="card-title">{card.title}</span>
                  {card.verified && <span className="verified-icon">✓ Verified</span>}
                </div>
                <p className="card-desc">[면접 마케 & 감정 전사] "밀린 발걸음 뒤에는 마케팅 커리어 바라며, 직접 알게 하는 펠리아스 깊은 것을 뜰어라고는지 그 진실을 뿌리끝에 이르렀다가..."</p>
                <div className="sub-title-row">
                  <span className="sub-icon">📖</span>
                  <span className="sub-label">Sub Title</span>
                </div>
                <p className="sub-desc">실무 역량의 서브타이들이 50자분 어디까지 보일지 얼마의 관건이고 이 사용자가 활용한 소재가 매력 지 관건이고 이 사용자 66...</p>
                <div className="card-footer">
                  <div className="supervisor-row">
                    <span className="label">실무 기업 감독자</span>
                    <div className="supervisor-info">
                      <span className="supervisor-badge">Supervised by</span>
                      <span className="supervisor-avatar">👤</span>
                    </div>
                  </div>
                  <div className="meta-row">
                    <span className="current-bid">Current Bid</span>
                    <span className="date">{card.isEmpty ? "0000 - 00 - 00 (월)" : "2025 - 12 - 22 (월)"}</span>
                    <span className="likes">♥ 0.99</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 실무 경력 */}
        <div className="work-career-section">
          <div className="section-header-row">
            <div className="section-title-left">
              <span className="fire-icon">🔥</span>
              <span className="section-name">실무 경력</span>
              <span className="section-count">총 5개중 3개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">강화율</span>
              <span className="rate-value">75%</span>
            </div>
          </div>
          <div className="work-career-cards">
            {workCareerCards.map((card) => (
              <div key={card.id} className={`work-career-card ${card.isEmpty ? 'empty' : ''}`}>
                <div className="card-header">
                  {card.hasWeb && <span className="web-badge">WEB</span>}
                  {card.code && <span className="code-tag">{card.code}</span>}
                  {card.badge && <span className="badge-tag">{card.badge}</span>}
                </div>
                <div className="card-title-row">
                  <span className="card-title">{card.title}</span>
                  {card.verified && <span className="verified-icon">✓ Verified</span>}
                </div>
                <p className="card-desc">실무 역량의 서브타이들이 50자분 어디까지 보일지 얼마의 관건이고 이 사용자가 활용한 소재가...</p>
                <div className="sub-title-row">
                  <span className="sub-icon">📖</span>
                  <span className="sub-label">Sub Title</span>
                </div>
                <p className="sub-desc">실무 역량의 서브타이들이 50자분 어디까지 보일지 관건이고 66...</p>
                <div className="card-footer">
                  <div className="supervisor-row">
                    <span className="label">실무 기업 감독자</span>
                    <div className="supervisor-info">
                      <span className="supervisor-badge">Supervised by</span>
                      <span className="supervisor-avatar">👤</span>
                    </div>
                  </div>
                  <div className="meta-row">
                    <span className="current-bid">Current Bid</span>
                    <span className="date">{card.date}</span>
                    <span className="likes">♥ {card.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cluster4CardContent;
