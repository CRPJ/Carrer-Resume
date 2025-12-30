"use client";

import React, { useState } from "react";
import Link from "next/link";

const Cluster4Content = () => {
  const [section3Page, setSection3Page] = useState(0);

  return (
    <div className="cluster4-content">
      {/* Section 1: CLUB CHALLENGE GROWTH */}
      <section className="cluster4-section1">
        {/* 좌측 상단 탭 (세로 정렬) */}
        <div className="top-tabs">
          <Link href="/cluster-4-1" className="tab">
            <img src="/images/0/cluster%204/icon/icon%20-%20%EC%A0%84%EA%B5%AC.png" alt="전구" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Weekly Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
          <div className="tab active">
            <img src="/images/0/cluster%204/icon/icon%20-%20book.png" alt="book" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Season Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </div>
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

      {/* Section 2: SEASON GROWTH 카드 */}
      <section className="cluster4-section2">
        <div className="season-growth-card visible">
          {/* 왼쪽 콘텐츠 */}
          <div className="card-left">
            {/* 타이틀과 배지를 한 줄로 */}
            <div className="season-header-row">
              <div className="season-title-wrapper">
                <h3 className="season-title-shadow">SEASON GROWTH</h3>
                <h3 className="season-title">SEASON GROWTH</h3>
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
                  현재 클럽은, <strong>2025년 여름 시즌</strong>을 준비 중인 전환 과정에 있습니다.
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
                  <span className="detail-label">성장 시작 시즌</span>
                  <span className="detail-value">2024년, 가을 시즌, 14주차</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 가능 시즌</span>
                  <span className="detail-value"><span className="number">5</span> <span className="white-text">개 시즌</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 성공 시즌</span>
                  <span className="detail-value"><span className="number">4</span> <span className="white-text">개 시즌</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 휴식 시즌</span>
                  <span className="detail-value"><span className="number">1</span> <span className="white-text">개 시즌</span></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성장 종료 시즌</span>
                  <span className="detail-value">2024년, 가을 시즌, 14주차 (성장 완료)</span>
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

        {/* 페이지네이션 */}
        <div className="section3-pagination">
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              className={`page-num ${section3Page === num - 1 ? 'active' : ''} ${num === 5 ? 'last' : ''}`}
              onClick={() => setSection3Page(num - 1)}
            >
              {num}
            </span>
          ))}
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
                  <span className="item">Part</span>
                  <img src="/images/0/cluster 4/icon/icon - part.png" alt="Part" className="qualified-icon" />
                </div>
                <div className="item-group">
                  <span className="item">Team</span>
                  <img src="/images/0/cluster 4/icon/icon - team.png" alt="Team" className="qualified-icon" />
                </div>
                <div className="item-group">
                  <span className="item">Club</span>
                  <img src="/images/0/cluster 4/icon/icon - cluv.png" alt="Club" className="qualified-icon" />
                </div>
                <div className="item-group">
                  <span className="item">Supervise</span>
                  <img src="/images/0/cluster 4/icon/icon - supervise.png" alt="Supervise" className="qualified-icon" />
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
                    <img src="/images/0/cluster 4/주차 이미지/봄 5주차 (4월 1주차).png" alt="봄 5주차" />
                  </div>
                </div>
                <div className="image-card card-middle">
                  <div className="card-frame">
                    <img src="/images/0/cluster 4/주차 이미지/봄 3주차 (3월 3주차).png" alt="봄 3주차" />
                  </div>
                </div>
                <div className="image-card card-front">
                  <div className="card-frame">
                    <img src="/images/0/cluster 4/주차 이미지/봄 1주차 (3월 1주차).png" alt="봄 1주차" />
                  </div>
                </div>
              </div>
            </div>

            {/* 중앙 열 (영역 4, 5, 6, 7) */}
            <div className="center-column">
              {/* 영역 4: 통계 바 */}
              <div className="area-4-stats">
                <span className="stat">단감 <img src="/images/0/cluster 4/icon/icon - 단감.png" alt="단감" className="stat-icon" /> <strong className="number">25</strong><span className="unit">개</span></span>
                <span className="stat">인절미 <img src="/images/0/cluster 4/icon/icon - 인절미.png" alt="인절미" className="stat-icon" /> <strong className="number">30</strong><span className="unit">명</span></span>
                <span className="stat">어흥 <img src="/images/0/cluster 4/icon/icon - 어흥.png" alt="어흥" className="stat-icon" /> <strong className="number">-2</strong><span className="unit">개</span></span>
              </div>

              {/* 영역 5: 평점 및 리뷰 */}
              <div className="area-5-rating">
                <div className="rating-avatar">
                  <img src="/images/0/crew profile/이안2.webp" alt="Profile" />
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
                    <img src="/images/0/cluster 4/icon/icon - 주차 활용도.png" alt="주차 활용도" className="circle-icon" />
                    <div className="percent">80%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">주차 활용도</div>
                    <div className="label-sub">총 10주 중 <span className="highlight">8</span>주</div>
                  </div>
                </div>
                <div className="circle-item">
                  <div className="circle yellow">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset="25.12" />
                    </svg>
                    <img src="/images/0/cluster 4/icon/icon - 일정 신뢰도.png" alt="일정 신뢰도" className="circle-icon" />
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
                    <img src="/images/0/cluster 4/icon/icon - 시즌 성장률.png" alt="시즌 성장률" className="circle-icon" />
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
                    <span className="name"><img src="/images/0/cluster 4/icon/1 실무 정보.png" alt="1" className="progress-icon" /> 실무 정보 강화율 (50%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">20</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster 4/icon/2 실무 역량.png" alt="2" className="progress-icon" /> 실무 역량 강화율 (60%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">30</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster 4/icon/3 실무 경험.png" alt="3" className="progress-icon" /> 실무 경험 강화율 (100%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">40</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster 4/icon/4 실무 경력.png" alt="4" className="progress-icon" /> 실무 경력 강화율 (10%)</span>
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
                <h4 className="section-title"><img className="section-icon" src="/images/0/cluster 4/icon - 시즌 상태.png" alt="시즌 상태" /> 시즌 상태</h4>
                <div className="status-badges">
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/crew profile/이안1.webp" alt="profile" />
                    </div>
                    <div className="badge-info">
                      <span className="badge-text">엔터테인먼트 팀 <span className="separator">|</span> <span className="sub-text">내돈내산 파트</span> <span className="separator">|</span></span>
                    </div>
                    <span className="badge-status yellow">운영진(앰버서더)</span>
                  </div>
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/crew profile/이안2.webp" alt="profile" />
                    </div>
                    <div className="badge-info">
                      <span className="badge-text">운영진(3기) <span className="separator">|</span> <span className="sub-text">클럽 단위</span> <span className="separator">|</span></span>
                    </div>
                    <span className="badge-status yellow">팀장(헬스케어 팀)</span>
                  </div>
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/crew profile/이안3.jpg" alt="profile" />
                    </div>
                    <div className="badge-info">
                      <span className="badge-text">운영진(4기) <span className="separator">|</span> <span className="sub-text">클럽 단위</span> <span className="separator">|</span></span>
                    </div>
                    <span className="badge-status yellow">앰배서더</span>
                  </div>
                </div>
              </div>

              {/* 영역 9: 시즌 평판 */}
              <div className="area-9-season-reputation">
                <h4 className="section-title"><img className="section-icon" src="/images/0/cluster 4/icon - 시즌 평판.png" alt="시즌 평판" /> 시즌 평판</h4>
                <div className="profile-cards">
                  <div className="profile-card">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                    <div className="card-top">
                      <div className="avatar">
                        <img src="/images/0/crew profile/이안1.webp" alt="profile" />
                      </div>
                      <div className="info">
                        <div className="row1">김미현 <span className="separator">|</span> 여 <span className="separator">|</span> 24 <span className="separator">|</span> 서울대학교 <span className="separator">|</span> 미디어커뮤니케이션학과</div>
                        <div className="row2">엔터테인먼트팀 <span className="separator">|</span> 내돈내산파트 <span className="separator">|</span> 엔비디아구글테슬라쿵</div>
                      </div>
                    </div>
                    <div className="tags">
                      <span className="tag-green">#추천력추진력면</span>
                      <span className="tag-green">#추진력추진력면</span>
                    </div>
                    <div className="comment"><img className="speech-icon" src="/images/0/cluster 4/icon - speech.png" alt="speech" /> 안녕하세요 이 시즌안녕하세요 이 시즌일아삼사오... <img className="more-icon" src="/images/0/cluster 4/icon - 더보기.png" alt="more" /></div>
                    <div className="stats">
                      <span className="pm"><img className="wifi-icon" src="/images/0/cluster 4/icon - wifi.png" alt="wifi" /> FM : 235</span>
                      <span className="rating">
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon empty" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon empty" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <span className="rating-score">6 / 10</span>
                      </span>
                    </div>
                  </div>
                  <div className="profile-card">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                    <div className="card-top">
                      <div className="avatar">
                        <img src="/images/0/crew profile/이안2.webp" alt="profile" />
                      </div>
                      <div className="info">
                        <div className="row1">문경조(3기) <span className="separator">|</span> 남 <span className="separator">|</span> 28 <span className="separator">|</span> 연세대학교 <span className="separator">|</span> 경영학...</div>
                        <div className="row2">▼ 리버티테인먼트(3기) <span className="separator">|</span> 내일까지 완료</div>
                      </div>
                    </div>
                    <div className="tags">
                      <span className="tag-green">#추천력추진력면</span>
                      <span className="tag-yellow">#리모콘스튜디오</span>
                    </div>
                    <div className="comment"><img className="speech-icon" src="/images/0/cluster 4/icon - speech.png" alt="speech" /> 안녕하세요 이 시즌안녕하세요 이 시즌일아삼사오... <img className="more-icon" src="/images/0/cluster 4/icon - 더보기.png" alt="more" /></div>
                    <div className="stats">
                      <span className="pm"><img className="wifi-icon" src="/images/0/cluster 4/icon - wifi.png" alt="wifi" /> FM : 235</span>
                      <span className="rating">
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <span className="star-half">
                          <img className="star-half-filled" src="/images/0/cluster 4/icon - star.png" alt="star" />
                          <img className="star-half-empty" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        </span>
                        <img className="star-icon empty" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <span className="rating-score">7 / 10</span>
                      </span>
                    </div>
                  </div>
                  <div className="profile-card">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                    <div className="card-top">
                      <div className="avatar">
                        <img src="/images/0/crew profile/이안3.jpg" alt="profile" />
                      </div>
                      <div className="info">
                        <div className="row1">엔터테인먼트팀 <span className="separator">|</span> 여 <span className="separator">|</span> 26 <span className="separator">|</span> 고려대학교 <span className="separator">|</span> 디자인...</div>
                        <div className="row2">▼ 리버티테인먼트(3기) <span className="separator">|</span> 내일까지 완료</div>
                      </div>
                    </div>
                    <div className="tags">
                      <span className="tag-green">#추천력추진력면</span>
                      <span className="tag-yellow">#리모콘스튜디오</span>
                    </div>
                    <div className="comment"><img className="speech-icon" src="/images/0/cluster 4/icon - speech.png" alt="speech" /> 안녕하세요 이 시즌안녕하세요 이 시즌일아삼사오... <img className="more-icon" src="/images/0/cluster 4/icon - 더보기.png" alt="more" /></div>
                    <div className="stats">
                      <span className="pm"><img className="wifi-icon" src="/images/0/cluster 4/icon - wifi.png" alt="wifi" /> FM : 235</span>
                      <span className="rating">
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <img className="star-icon empty" src="/images/0/cluster 4/icon - star.png" alt="star" />
                        <span className="rating-score">8 / 10</span>
                      </span>
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
