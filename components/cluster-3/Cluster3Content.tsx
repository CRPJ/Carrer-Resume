"use client";

import React from "react";

const Cluster3Content = () => {
  // 포트폴리오 채널 카드 데이터
  const channelCards = [
    { id: 1, title: "Dream with perfection itself", badge: "D" },
    { id: 2, title: "Dream with perfection itself", badge: "D" },
    { id: 3, title: "Dream with perfection itself", badge: "D" },
    { id: 4, title: "Dream with perfection itself", badge: "D" },
    { id: 5, title: "Dream with perfection itself", badge: "D" },
    { id: 6, title: "Dream with perfection itself", badge: "D" },
  ];

  // Top Works 슬라이드 데이터
  const topWorksSlides = [
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: true },
    { id: 4, active: false },
    { id: 5, active: false },
  ];

  // Detail 10 썸네일 데이터
  const detailThumbnails = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

  return (
    <div className="cluster3-content">
      {/* Section 1: CLUB FINAL INDEX */}
      <section className="cluster3-section1">
        <div className="section1-header">
          <h2 className="section1-title">CLUB FINAL INDEX</h2>
        </div>

        <div className="section1-main">
          <div className="section1-image">
            <img src="/images/0/cluster 2/이안0.png" alt="Profile" />
          </div>

          <div className="section1-progress">
            <div className="progress-circle">
              <svg viewBox="0 0 200 200">
                <circle
                  className="progress-bg"
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="#333"
                  strokeWidth="12"
                />
                <circle
                  className="progress-bar"
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="#21E786"
                  strokeWidth="12"
                  strokeDasharray="534"
                  strokeDashoffset="53"
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="progress-text">
                <span className="progress-percent">90%</span>
                <span className="progress-label">달성 진행률</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section1-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <img src="/images/icon/trophy.svg" alt="trophy" />
            </div>
            <span className="stat-label">과정 진행 성과</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <img src="/images/icon/star.svg" alt="star" />
            </div>
            <span className="stat-label">활동 참수 가치</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <img src="/images/icon/calendar.svg" alt="calendar" />
            </div>
            <span className="stat-label">향후 기간 일정</span>
          </div>
        </div>
      </section>

      {/* Section 2: 졸업 자격 조건 */}
      <section className="cluster3-section2">
        <div className="section2-content">
          <h2 className="section2-title">졸업 자격 조건</h2>
        </div>
      </section>

      {/* Section 3: 포트폴리오 마케팅 Channel */}
      <section className="cluster3-section3">
        <div className="section3-header">
          <h3 className="section3-title">포트폴리오 마케팅 Channel</h3>
          <span className="section3-subtitle">click and link</span>
        </div>

        <div className="channel-cards">
          {channelCards.map((card) => (
            <div key={card.id} className="channel-card">
              <div className="card-image">
                <img src="/images/0/cluster 2/이안0.png" alt="Channel" />
                <div className="card-badge">{card.badge}</div>
              </div>
              <div className="card-content">
                <p className="card-title">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: 포트폴리오 마케팅 Output */}
      <section className="cluster3-section4">
        <div className="section4-header">
          <h3 className="section4-subtitle">포트폴리오 마케팅 Output</h3>
          <h2 className="section4-title">World Of Top Works</h2>
          <p className="section4-desc">
            Welcome to our world of top exclusive games and mods. Explore the vast catalog, and find
          </p>
        </div>

        <div className="section4-tabs">
          <button className="tab-btn active">COMING NEXT</button>
          <button className="tab-btn">MY PORTFOLIO</button>
        </div>

        <div className="top-works-slider">
          {topWorksSlides.map((slide, index) => (
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
        <h2 className="section5-title">The Detail 10</h2>

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
