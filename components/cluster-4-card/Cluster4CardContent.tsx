"use client";

import React, { useState } from "react";
import Link from "next/link";

const Cluster4CardContent = () => {
  // 일정 데이터
  const scheduleData = [
    { id: 1, title: "일정명 | 약 2h", user: "Main Title", subUser: "Sub Title", hasImage: true },
    { id: 2, title: "일정명 | 약 2h", user: "Main Title", subUser: "Sub Title", hasImage: true },
    { id: 3, title: "일정명 | 약 2h", user: "Main Title", subUser: "Sub Title", hasImage: false },
    { id: 4, title: "일정명 | 약 2h", user: "Main Title", subUser: "Sub Title", hasImage: false },
  ];

  // 참석률 데이터
  const attendanceData = [
    { label: "참석 등록", value: "2/3" },
    { label: "실제참 | 약 2h", hasIcon: true },
    { label: "실제참 | 약 2h", hasIcon: true },
    { label: "실제참 | 약 2h", hasIcon: true },
  ];

  // 실무 정보 카드 데이터
  const infoCards = [
    {
      id: 1,
      image: "/images/0/cluster 4/4-1/card-img-1.png",
      badge: "카테고리",
      mainTitle: "Main Title",
      verified: true,
      content: "Club 정원 운영을 위해 캐릭터를 이용한 인베스트먼트 만들기, 마케팅, 주식매매 채널, 개발.",
      tags: ["태그", "태그"],
      date: "2025-01-30 (토)",
      likes: "0.99",
    },
    {
      id: 2,
      image: "/images/0/cluster 4/4-1/card-img-2.png",
      badge: "카테고리",
      mainTitle: "Main Title",
      verified: true,
      content: "Club 정원 운영을 위해 캐릭터를 이용한 인베스트먼트 만들기, 마케팅, 주식매매 채널, 개발.",
      tags: ["태그", "태그"],
      date: "2025-01-30 (토)",
      likes: "0.99",
    },
    {
      id: 3,
      image: "/images/0/cluster 4/4-1/card-img-3.png",
      badge: "카테고리",
      mainTitle: "Main Title",
      verified: true,
      content: "Club 정원 운영을 위해 캐릭터를 이용한 인베스트먼트 만들기, 마케팅, 주식매매 채널, 개발.",
      tags: ["태그", "태그"],
      date: "2025-01-30 (토)",
      likes: "0.99",
    },
  ];

  // 실무 역할 카드 데이터
  const roleCards = [
    { id: 1, badge: "클럽버츠|대전|강사(주)", content: "설명 텍스트가 들어갑니다.", mainTitle: "Main Title", verified: true },
    { id: 2, badge: "클럽버츠|대전|강사(주)", content: "설명 텍스트가 들어갑니다.", mainTitle: "Main Title", verified: true },
  ];

  // 실무 경험 카드
  const experienceCards = [
    {
      id: 1,
      image: "/images/0/cluster 4/4-1/exp-img-1.png",
      badge: "2025 여름 시즌, 3주차",
      trophyIcon: true,
      mainTitle: "Main Title",
      verified: true,
      content: "Club 정원 운영을 위해 캐릭터를 이용한 인베스트먼트 만들기.",
      tags: ["태그"],
      date: "2025-01-30 (토)",
      likes: "0.99",
    },
    {
      id: 2,
      image: "/images/0/cluster 4/4-1/exp-img-2.png",
      badge: "2025 여름 시즌, 3주차",
      trophyIcon: true,
      mainTitle: "Main Title",
      verified: true,
      content: "Club 정원 운영을 위해 캐릭터를 이용한 인베스트먼트 만들기.",
      tags: ["태그"],
      date: "2025-01-30 (토)",
      likes: "0.99",
    },
    {
      id: 3,
      image: "/images/0/cluster 4/4-1/exp-img-3.png",
      badge: "2025 여름 시즌, 3주차",
      trophyIcon: true,
      mainTitle: "Main Title",
      verified: true,
      content: "Club 정원 운영을 위해 캐릭터를 이용한 인베스트먼트 만들기.",
      tags: ["태그"],
      date: "2025-01-30 (토)",
      likes: "0.99",
    },
  ];

  return (
    <div className="cluster4-card-content">
      {/* 탭 영역 (1330x105) + 하단 주황 divider */}
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
        {/* 네비게이션 버튼들 */}
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

      {/* 상단 네비게이션 */}
      <div className="card-nav">
        <Link href="/cluster-4-1" className="nav-btn">
          <span>←</span>
        </Link>
        <span className="nav-text">전체 목록으로 돌아가기</span>
      </div>

      {/* 메인 헤더 */}
      <div className="card-header">
        <div className="header-title-row">
          <h1 className="card-main-title">2025 여름 시즌, 3주차</h1>
          <div className="status-badge success">
            <span>성장(성공)</span>
            <img src="/images/0/cluster 4/icon/icon - 성장(성공).png" alt="성공" />
          </div>
        </div>
        <div className="header-info-row">
          <span className="info-item">
            <img src="/images/0/cluster 4/icon/icon - 6.png" alt="calendar" />
            2025 - 07 - 23 (월) ~ 2025 - 07 - 30 (일)
          </span>
          <span className="info-item">
            <img src="/images/0/cluster 4/icon/icon - 8.png" alt="role" />
            운영진(앰버서더)
          </span>
          <span className="info-item">
            <img src="/images/0/cluster 4/icon/icon - 7.png" alt="week" />
            <span className="highlight">25</span> / 30 주차
          </span>
          <span className="info-item">
            월요일
          </span>
          <span className="info-item">
            <span className="highlight">30</span> / 30 시즌
          </span>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="card-main-content">
        {/* 왼쪽: 큰 이미지 */}
        <div className="main-image-section">
          <img src="/images/0/cluster 4/주차 이미지/여름 3주차 (7월 3주차).png" alt="주차 이미지" className="main-week-image" />
        </div>

        {/* 오른쪽: 일정 및 참석률 */}
        <div className="main-info-section">
          {/* 일정 리스트 */}
          <div className="schedule-list">
            {scheduleData.map((item) => (
              <div key={item.id} className="schedule-item">
                <div className="schedule-header">
                  <span className="schedule-title">{item.title}</span>
                  {item.hasImage && <div className="schedule-image-placeholder"></div>}
                </div>
                <div className="schedule-users">
                  <div className="user-avatar"></div>
                  <div className="user-info">
                    <span className="user-main">{item.user}</span>
                    <span className="user-sub">{item.subUser}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 참석률 */}
          <div className="attendance-section">
            <div className="attendance-header">
              <span>참석 등록</span>
              <span className="attendance-value">2/3</span>
            </div>
            {attendanceData.slice(1).map((item, idx) => (
              <div key={idx} className="attendance-item">
                <div className="user-avatar small"></div>
                <span>{item.label}</span>
                {item.hasIcon && <div className="attendance-icon"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 주차 성장률 섹션 */}
      <div className="growth-rate-section">
        <div className="growth-left">
          <h3>주차 성장률</h3>
          <div className="growth-stats">
            <span className="stat-label">● 통이 카룸 7개</span>
          </div>
        </div>
        <div className="growth-center">
          <div className="progress-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#FFA500"
                strokeWidth="8"
                strokeDasharray={`${65 * 2.83} ${100 * 2.83}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-value">65</span>
              <span className="progress-percent">%</span>
            </div>
          </div>
        </div>
        <div className="growth-right">
          <h4>라인별 강화 결과</h4>
          <div className="line-results">
            <span className="line-item">명대 강화</span>
            <span className="line-item">강화 (+)</span>
          </div>
        </div>
      </div>

      {/* 실무 정보 섹션 */}
      <div className="work-section">
        <div className="section-header">
          <div className="section-title">
            <span className="icon">🔥</span>
            <h3>실무 정보</h3>
          </div>
          <div className="section-stats">
            <span className="stat">● 7개중 4개</span>
            <span className="stat-progress">진행률 <strong>60%</strong></span>
          </div>
        </div>
        <div className="work-cards">
          {infoCards.map((card) => (
            <div key={card.id} className="work-card">
              <div className="card-image">
                <img src={card.image} alt={card.mainTitle} />
                <span className="card-badge">{card.badge}</span>
              </div>
              <div className="card-user-row">
                <div className="user-avatar"></div>
                <span className="user-name">{card.mainTitle}</span>
                {card.verified && <span className="verified-badge">✓</span>}
                <span className="sub-title">Sub Title</span>
              </div>
              <p className="card-content">{card.content}</p>
              <div className="card-tags">
                {card.tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
              <div className="card-footer">
                <span className="card-category">일주 기간 유형</span>
              </div>
              <div className="card-meta">
                <span className="date">{card.date}</span>
                <span className="likes">♥ {card.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 실무 역할 섹션 */}
      <div className="work-section">
        <div className="section-header">
          <div className="section-title">
            <span className="icon">🔥</span>
            <h3>실무 역할</h3>
          </div>
          <div className="section-stats">
            <span className="stat">● 1개중 7개</span>
            <span className="stat-progress">진행률 <strong>100%</strong></span>
          </div>
        </div>
        <div className="role-cards">
          {roleCards.map((card) => (
            <div key={card.id} className="role-card">
              <div className="role-badge-row">
                <span className="role-badge">{card.badge}</span>
                <span className="aad-tag">AAD-1999</span>
                <span className="club-tag">클럽버츠|대전|강사(주)</span>
              </div>
              <div className="role-user-row">
                <div className="user-avatar"></div>
                <span className="user-name">{card.mainTitle}</span>
                {card.verified && <span className="verified-badge">✓</span>}
              </div>
              <p className="role-content">{card.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 실무 경험 섹션 */}
      <div className="work-section">
        <div className="section-header">
          <div className="section-title">
            <span className="icon">🔥</span>
            <h3>실무 경험</h3>
          </div>
          <div className="section-stats">
            <span className="stat">● 4개중 3개</span>
            <span className="stat-progress">진행률 <strong>75%</strong></span>
          </div>
        </div>
        <div className="work-cards">
          {experienceCards.map((card) => (
            <div key={card.id} className="work-card">
              <div className="card-image">
                <img src={card.image} alt={card.mainTitle} />
                <div className="card-badge-row">
                  <span className="card-badge season">{card.badge}</span>
                  {card.trophyIcon && <img src="/images/0/cluster 4/icon/icon - 성장(성공).png" alt="trophy" className="trophy-small" />}
                </div>
              </div>
              <div className="card-user-row">
                <div className="user-avatar"></div>
                <span className="user-name">{card.mainTitle}</span>
                {card.verified && <span className="verified-badge">✓</span>}
                <span className="sub-title">Sub Title</span>
              </div>
              <p className="card-content">{card.content}</p>
              <div className="card-tags">
                {card.tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
              <div className="card-footer">
                <span className="card-category">일주 기간 유형</span>
              </div>
              <div className="card-meta">
                <span className="date">{card.date}</span>
                <span className="likes">♥ {card.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 실무 경력 섹션 */}
      <div className="work-section">
        <div className="section-header">
          <div className="section-title">
            <span className="icon">🔥</span>
            <h3>실무 경력</h3>
          </div>
          <div className="section-stats">
            <span className="stat">● 1개중 3개</span>
            <span className="stat-progress">진행률 <strong>75%</strong></span>
          </div>
        </div>
        <div className="work-cards">
          {experienceCards.map((card) => (
            <div key={card.id} className="work-card">
              <div className="card-image">
                <img src={card.image} alt={card.mainTitle} />
                <div className="card-badge-row">
                  <span className="card-badge">{card.badge}</span>
                </div>
              </div>
              <div className="card-user-row">
                <div className="user-avatar"></div>
                <span className="user-name">{card.mainTitle}</span>
                {card.verified && <span className="verified-badge">✓</span>}
                <span className="sub-title">Sub Title</span>
              </div>
              <p className="card-content">{card.content}</p>
              <div className="card-tags">
                {card.tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
              <div className="card-footer">
                <span className="card-category">일주 기간 유형</span>
              </div>
              <div className="card-meta">
                <span className="date">{card.date}</span>
                <span className="likes">♥ {card.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cluster4CardContent;
