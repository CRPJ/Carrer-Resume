"use client";

import React from "react";

const Cluster3Content = () => {
  // 포트폴리오 채널 카드 데이터 (9개)
  const channelCards = [
    { id: 1, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
    { id: 2, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
    { id: 3, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
    { id: 4, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
    { id: 5, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
    { id: 6, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
    { id: 7, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
    { id: 8, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
    { id: 9, title: "Dream with perfection itself", badge: "D", price: "4.89", tag: "Hot Bids" },
  ];

  // Top Works 슬라이드 데이터 (5개)
  const topWorksSlides = [
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: true },
    { id: 4, active: false },
    { id: 5, active: false },
  ];

  // Detail 10 썸네일 데이터 (10개, 2줄 5개)
  const detailThumbnails = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

  return (
    <div className="cluster3-content">
      {/* Section 1: CLUB FINAL INDEX - 새 디자인 */}
      <section className="cluster3-section1">
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
            <h2 className="section1-title-shadow">CLUB FINAL INDEX</h2>
            <h2 className="section1-title">CLUB FINAL INDEX</h2>
          </div>
        </div>

        {/* 프로그레스 반원 */}
        <div className="progress-area">
          <div className="progress-semi-circle">
            <svg viewBox="0 0 300 170">
              {/* 배경 반원 */}
              <path
                className="progress-bg"
                d="M 25 150 A 125 125 0 0 1 275 150"
                fill="none"
                stroke="#333"
                strokeWidth="25"
                strokeLinecap="round"
              />
              {/* 진행 반원 (90%) */}
              <path
                className="progress-bar"
                d="M 25 150 A 125 125 0 0 1 275 150"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="25"
                strokeDasharray="393"
                strokeDashoffset="39"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FAAB07" />
                  <stop offset="100%" stopColor="#FFC919" />
                </linearGradient>
              </defs>
            </svg>
            <div className="progress-text">
              <span className="progress-percent">90%</span>
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
              <h3 className="card-title">성장 진행 상태</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 성장 상태</span>
                <span className="info-value highlight">클럽 온보딩 중</span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 성장 시작일</span>
                <span className="info-value">2025년 02월 22일 (월)</span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 활동 종료일</span>
                <span className="info-value">2025년 02월 22일 (월)</span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">WATCH PRICING <img src="/images/0/cluster 3/icon/_.png" alt="icon" /></span>
            </div>
          </div>

          {/* 카드 2: 성장 점수 기록 */}
          <div className="stat-card">
            <div className="card-header">
              <div className="card-icon green">
                <img src="/images/0/cluster 3/icon/0green.png" alt="Green" />
              </div>
              <h3 className="card-title">성장 점수 기록</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 단감 🍅</span>
                <span className="info-value number">99,999</span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 인절미 🍡</span>
                <span className="info-value number">99,999</span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 어흥 🐯</span>
                <span className="info-value number negative">-99,999</span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">WATCH PRICING <img src="/images/0/cluster 3/icon/_.png" alt="icon" /></span>
            </div>
          </div>

          {/* 카드 3: 성장 기간 집계 */}
          <div className="stat-card wide">
            <div className="card-header">
              <div className="card-icon purple">
                <img src="/images/0/cluster 3/icon/0purple.png" alt="Purple" />
              </div>
              <h3 className="card-title">성장 기간 집계</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 활동 인정 주차</span>
                <span className="info-value week">1<span className="unit">주</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 활동 미인정 주차</span>
                <span className="info-value week">1<span className="unit">주</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 활동 휴식 주차</span>
                <span className="info-value week">1<span className="unit">주</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 공식 휴식 주차</span>
                <span className="info-value week">1<span className="unit">주</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 활동 가능 주차</span>
                <span className="info-value week">1<span className="unit">주</span></span>
              </div>
              <div className="info-row separator">
                <span className="info-label"><span className="dot">·</span> 활동 휴식 시즌</span>
                <span className="info-value season">1<span className="unit">시즌</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 활동 인정 시즌</span>
                <span className="info-value season">1<span className="unit">시즌</span></span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">WATCH PRICING <img src="/images/0/cluster 3/icon/_.png" alt="icon" /></span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 졸업 자격 조건 - 배경 이미지 영역 */}
      <section className="cluster3-section2">
        <div className="section2-bg">
          <img src="/images/0/cluster 2/bg02.png" alt="Background" />
        </div>
        <div className="section2-text">
          <span className="handwriting">졸업 자격 조건</span>
        </div>
      </section>

      {/* Section 3: 포트폴리오 마케팅 Channel */}
      <section className="cluster3-section3">
        <div className="section3-header">
          <div className="header-left">
            <span className="subtitle">포트폴리오 마케팅 Channel</span>
            <span className="click-link">click and link</span>
          </div>
        </div>

        <div className="channel-cards">
          {channelCards.map((card) => (
            <div key={card.id} className="channel-card">
              <div className="card-image">
                <img src="/images/0/cluster 2/이안0.png" alt="Channel" />
                <div className="card-tag">{card.tag}</div>
              </div>
              <div className="card-content">
                <p className="card-title">{card.title}</p>
                <div className="card-footer">
                  <div className="card-author">
                    <div className="author-avatar">
                      <img src="/images/0/cluster 2/이안0.png" alt="Author" />
                    </div>
                    <span className="author-name">Author</span>
                  </div>
                  <div className="card-price">
                    <span className="price-value">{card.price}</span>
                    <span className="price-unit">ETH</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: 포트폴리오 마케팅 Output */}
      <section className="cluster3-section4">
        <div className="section4-header">
          <span className="section4-subtitle">포트폴리오 마케팅 Output</span>
          <h2 className="section4-title">World Of Top Works</h2>
          <p className="section4-desc">
            Welcome to our world of top exclusive games and mods. Explore the vast catalog, and find your next favorite story.
          </p>
        </div>

        <div className="section4-tabs">
          <button className="tab-btn active">BROWSE ALL ▼</button>
          <button className="tab-btn">CHANNELING ▶</button>
        </div>

        <div className="top-works-slider">
          {topWorksSlides.map((slide) => (
            <div
              key={slide.id}
              className={`slider-item ${slide.active ? 'active' : ''}`}
            >
              <img src="/images/0/cluster 2/이안0.png" alt={`Work ${slide.id}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: The Detail 10 */}
      <section className="cluster3-section5">
        <h2 className="section5-title">⚡The Detail 10</h2>

        <div className="detail-grid">
          {detailThumbnails.map((thumb) => (
            <div key={thumb.id} className="detail-item">
              <img src="/images/0/cluster 2/이안0.png" alt={`Detail ${thumb.id}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Cluster3Content;
