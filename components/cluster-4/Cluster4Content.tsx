"use client";

import React, { useState, useEffect, useRef } from "react";

const Cluster4Content = () => {
  // 스크롤 애니메이션을 위한 ref
  const seasonCardRef = useRef<HTMLDivElement>(null);
  const [seasonCardVisible, setSeasonCardVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSeasonCardVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (seasonCardRef.current) {
      observer.observe(seasonCardRef.current);
    }

    return () => {
      if (seasonCardRef.current) {
        observer.unobserve(seasonCardRef.current);
      }
    };
  }, []);

  return (
    <div className="cluster4-content">
      {/* Section 1: CLUB CHALLENGE GROWTH */}
      <section className="cluster4-section1">
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
            There is no magic to achievement. It's really about hard work, choices and persistence.<br />
            무언가를 성취하기 위해 부릴 수 있는 마법은 없다. 필요한 것은 오직 노력, 선택 그리고 꾸준함일 뿐이다.<br />
            -Michelle Obama-
          </p>
        </div>
      </section>

      {/* Section 2: SEASON GROWTH 카드 */}
      <section className="cluster4-section2" ref={seasonCardRef}>
        <div className={`season-growth-card ${seasonCardVisible ? 'visible' : ''}`}>
          {/* 왼쪽 콘텐츠 */}
          <div className="card-left">
            {/* 타이틀과 배지를 한 줄로 */}
            <div className="season-header-row">
              <div className="season-title-wrapper">
                <h3 className="season-title-shadow">SEASON GROWTH</h3>
                <h3 className="season-title">SEASON GROWTH</h3>
              </div>
              <div className="season-badge">
                <img src="/images/0/cluster 4/Vector.png" alt="Badge Border" className="badge-border" />
                <div className="badge-fill">
                  <span className="badge-text">성장 진행 중</span>
                </div>
              </div>
            </div>

            {/* Add new collection 카드 */}
            <div className="collection-card">
              <div className="collection-icon">
                <img src="/images/0/cluster 4/icon/profile.png" alt="Profile Icon" />
              </div>
              <div className="collection-content">
                <div className="collection-header">
                  <span className="add-icon">⊕</span>
                  <span className="collection-label">Add new collection</span>
                </div>
                <p className="collection-text">
                  현재 클럽은, <strong>2025년 여름 시즌</strong>을 준비 중인 전환 과정에 있습니다.
                </p>
              </div>
            </div>

            {/* Details 카드 */}
            <div className="details-card">
              <div className="details-header">
                <span className="toggle-icon">📋</span>
                <span className="toggle-text">Details</span>
              </div>

              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">성장 시작 시즌</span>
                  <span className="detail-value">2024년, 가을 시즌, 14주차</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 기준 시즌</span>
                  <span className="detail-value">5 개 시즌</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 성숙 시즌</span>
                  <span className="detail-value">4 개 시즌</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 휴식 시즌</span>
                  <span className="detail-value">1 개 시즌</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 종료 시즌</span>
                  <span className="detail-value">2024년, 가을 시즌, 14주차 (성장 전환)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 캐릭터 이미지 */}
          <div className="card-right">
            <img src="/images/0/cluster 4/bg cha.png" alt="Character" />
          </div>
        </div>
      </section>

      {/* Section 3: 2025년도_여름 시즌 */}
      <section className="cluster4-section3">
        {/* SEASON CHALLENGE 배너 */}
        <div className="section3-banner">
          <div className="section3-title-wrapper">
            <h2 className="section3-banner-text-shadow">SEASON CHALLENGE</h2>
            <h2 className="section3-banner-text">SEASON CHALLENGE</h2>
          </div>
          <div className="section3-banner-description">
            <p>성장한 모든 '시즌'의 종합 결과치가, 각개의 카드로 하나씩 보여집니다.</p>
            <p>당신의 특별한 시즌은 언제였나요?</p>
          </div>
          <div className="section3-banner-notice">
            <p>*모든 시즌들이 누적된 결과는 위 탭 [Club Final Index]에서 확인하실 수 있습니다. 😊</p>
          </div>
        </div>

        <div className="season-detail-container">
          {/* 상단 헤더 영역 (영역 1 + 영역 2) */}
          <div className="top-header-row">
            {/* 영역 1: 타이틀 + 날짜 + 상태 */}
            <div className="area-1-title">
              <div className="season-main-title">
                <span className="year-orange">2025</span>년도_여름 시즌
              </div>
              <div className="date-status">
                <span className="date-range">2025 - 03 - 23 (월) ~ 2025 - 08 - 22 (일)</span>
                <button className="status-badge">시즌 진행 중</button>
              </div>
            </div>

            {/* 영역 2: Qualified */}
            <div className="area-2-qualified">
              <span className="qualified-text">Qualified</span>
              <div className="qualified-items">
                <div className="item-group">
                  <span className="item">Port</span>
                  <span className="trophy">🏆</span>
                </div>
                <div className="item-group">
                  <span className="item">Team</span>
                  <span className="trophy">🏆</span>
                </div>
                <div className="item-group">
                  <span className="item">Divi</span>
                  <span className="trophy">🏆</span>
                </div>
                <div className="item-group">
                  <span className="item">Supervise</span>
                  <span className="trophy">🏆</span>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 영역 (3열) */}
          <div className="main-content-grid">
            {/* 영역 3: 왼쪽 이미지 스택 */}
            <div className="area-3-image">
              <div className="season-image-stack">
                <div className="image-card card-back">
                  <div className="card-frame">
                    <img src="/images/0/cluster 4/summer-2025.png" alt="2025 Summer Season" />
                  </div>
                </div>
                <div className="image-card card-middle">
                  <div className="card-frame">
                    <img src="/images/0/cluster 4/summer-2025.png" alt="2025 Summer Season" />
                  </div>
                </div>
                <div className="image-card card-front">
                  <div className="card-frame">
                    <img src="/images/0/cluster 4/summer-2025.png" alt="2025 Summer Season" />
                  </div>
                </div>
              </div>
            </div>

            {/* 중앙 열 (영역 4, 5, 6, 7) */}
            <div className="center-column">
              {/* 영역 4: 통계 바 */}
              <div className="area-4-stats">
                <span className="stat">단감 ⭐ <strong className="number">25</strong><span className="unit">개</span></span>
                <span className="stat">인절미 ⬇️ <strong className="number">30</strong><span className="unit">명</span></span>
                <span className="stat">어흥 👍 <strong className="number">-2</strong><span className="unit">개</span></span>
              </div>

              {/* 영역 5: 평점 및 리뷰 */}
              <div className="area-5-rating">
                <div className="rating-avatar">
                  <img src="/images/0/cluster 4/avatar1.png" alt="Profile" />
                </div>
                <div className="rating-content">
                  <div className="top-row">
                    <div className="stars-row">
                      <svg className="star filled" width="13" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1.5L11.8 7.2L17.6 8L13.2 12L14.3 17.7L10 14.8L5.7 17.7L6.8 12L2.4 8L8.2 7.2L10 1.5Z" fill="#F7BA48" stroke="#F7BA48" strokeWidth="0.5" strokeLinejoin="round"/>
                      </svg>
                      <svg className="star filled" width="13" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1.5L11.8 7.2L17.6 8L13.2 12L14.3 17.7L10 14.8L5.7 17.7L6.8 12L2.4 8L8.2 7.2L10 1.5Z" fill="#F7BA48" stroke="#F7BA48" strokeWidth="0.5" strokeLinejoin="round"/>
                      </svg>
                      <svg className="star filled" width="13" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1.5L11.8 7.2L17.6 8L13.2 12L14.3 17.7L10 14.8L5.7 17.7L6.8 12L2.4 8L8.2 7.2L10 1.5Z" fill="#F7BA48" stroke="#F7BA48" strokeWidth="0.5" strokeLinejoin="round"/>
                      </svg>
                      <svg className="star filled" width="13" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1.5L11.8 7.2L17.6 8L13.2 12L14.3 17.7L10 14.8L5.7 17.7L6.8 12L2.4 8L8.2 7.2L10 1.5Z" fill="#F7BA48" stroke="#F7BA48" strokeWidth="0.5" strokeLinejoin="round"/>
                      </svg>
                      <svg className="star empty" width="13" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1.5L11.8 7.2L17.6 8L13.2 12L14.3 17.7L10 14.8L5.7 17.7L6.8 12L2.4 8L8.2 7.2L10 1.5Z" stroke="#F7BA48" strokeWidth="1" strokeLinejoin="round" fill="none"/>
                      </svg>
                      <span className="rating-text">4 / 5</span>
                    </div>
                    <span className="review-label">Season Review</span>
                  </div>
                  <p className="review-comment">"이번시즌 30자 평을 해보라는데, 어디까지 갈 수 있나"</p>
                </div>
              </div>

              {/* 영역 6: 원형 차트 3개 */}
              <div className="area-6-circles">
                <div className="circle-item">
                  <div className="circle pink">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset="62.8" />
                    </svg>
                    <div className="icon">📅</div>
                    <div className="percent">80%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">주차 활동도</div>
                    <div className="label-sub">총 10주 중 <span className="highlight">8</span>주</div>
                  </div>
                </div>
                <div className="circle-item">
                  <div className="circle yellow">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset="25.12" />
                    </svg>
                    <div className="icon">⏰</div>
                    <div className="percent">90%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">일정 신뢰도</div>
                    <div className="label-sub">총 10주 중 <span className="highlight">9</span>주</div>
                  </div>
                </div>
                <div className="circle-item">
                  <div className="circle green">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset="75.36" />
                    </svg>
                    <div className="icon">📈</div>
                    <div className="percent">70%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">시즌 성장률</div>
                    <div className="label-sub">총 20개 중 <span className="highlight">7</span>주</div>
                  </div>
                </div>
              </div>

              {/* 영역 7: 실무 성장률 프로그레스 바 */}
              <div className="area-7-progress">
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name">💼 실무 전반 성장률 (50%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">20</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name">💼 실무 역량 성장률 (60%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">30</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name">💼 실무 경쟁 성장률 (100%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">40</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name">💼 실무 기술 성장률 (10%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">4</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측 열 (영역 8, 9) */}
            <div className="right-column">
              {/* 영역 8: 시즌 상태 */}
              <div className="area-8-season-status">
                <h4 className="section-title">🛡️ 시즌 상태</h4>
                <div className="status-badges">
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/cluster 4/icon/profile.png" alt="profile" />
                    </div>
                    <div className="badge-info">
                      <span className="badge-text">엔터테인먼트 팀 | 내돈내산 파트 |</span>
                    </div>
                    <span className="badge-status yellow">운영진(앰버서더)</span>
                  </div>
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/cluster 4/icon/profile.png" alt="profile" />
                    </div>
                    <div className="badge-info">
                      <span className="badge-text">운영진(3기) | 클럽 단위 |</span>
                    </div>
                    <span className="badge-status yellow">팀장(헬스케어 팀)</span>
                  </div>
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/cluster 4/icon/profile.png" alt="profile" />
                    </div>
                    <div className="badge-info">
                      <span className="badge-text">운영진(4기) | 클럽 단위 |</span>
                    </div>
                    <span className="badge-status yellow">앰배서더</span>
                  </div>
                </div>
              </div>

              {/* 영역 9: 시즌 평판 */}
              <div className="area-9-season-reputation">
                <h4 className="section-title">시즌 평판</h4>
                <div className="profile-cards">
                  <div className="profile-card">
                    <div className="avatar">👨</div>
                    <div className="info">
                      <div className="row1">
                        <span className="name">엔터테인먼트팀</span>
                        <span className="deadline">내일까지 완료 <span className="badge green">🔥출근인증(매일)</span></span>
                      </div>
                      <div className="row2">▼ 엔포피디(3기) | 내일까지 완료</div>
                      <div className="row3">
                        <span className="green-box">우리집스튜디오이슈(커뮤니티운영)</span>
                        <span className="yellow-box">🏘️리모콘스튜디오</span>
                      </div>
                      <div className="row4">☑ 임실대회 이 시즌입실대회 이 시즌입실대회 이 시즌입실대회 이... ≫</div>
                      <div className="row5">
                        <span>RM PM : 325</span>
                        <span className="rating">Ratings : ★★★★☆ 4 / 10</span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-card">
                    <div className="avatar">👨</div>
                    <div className="info">
                      <div className="row1">
                        <span className="name">문경조(3기)</span>
                        <span className="deadline">내일까지 완료 <span className="badge green">🔥출근인증(매일)</span></span>
                      </div>
                      <div className="row2">▼ 리버티테인먼트(3기) | 내일까지 완료</div>
                      <div className="row3">
                        <span className="green-box">우리집스튜디오이슈(커뮤니티운영)</span>
                        <span className="yellow-box">🏘️리모콘스튜디오</span>
                      </div>
                      <div className="row4">☑ 임실대회 이 시즌입실대회 이 시즌입실대회 이 시즌입실대회 이... ≫</div>
                      <div className="row5">
                        <span>RM PM : 325</span>
                        <span className="rating">Ratings : ★★★★☆ 4 / 10</span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-card">
                    <div className="avatar">👨</div>
                    <div className="info">
                      <div className="row1">
                        <span className="name">엔터테인먼트팀</span>
                        <span className="deadline">1.5월까지 완료 <span className="badge gray">조장대훈(매일)</span></span>
                      </div>
                      <div className="row2">▼ 리버티테인먼트(3기) | 내일까지 완료</div>
                      <div className="row3">
                        <span className="green-box">우리집스튜디오이슈(커뮤니티운영)</span>
                        <span className="yellow-box">🏘️리모콘스튜디오</span>
                      </div>
                      <div className="row4">☑ 임실대회 이 시즌입실대회 이 시즌입실대회 이 시즌입실대회 이... ≫</div>
                      <div className="row5">
                        <span>RM PM : 325</span>
                        <span className="rating">Ratings : ★★★★☆ 4 / 10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cluster4Content;
