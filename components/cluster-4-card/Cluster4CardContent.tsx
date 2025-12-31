"use client";

import React, { useState } from "react";
import Link from "next/link";

const Cluster4CardContent = () => {
  // 태그 색상 배열
  const tagColors = ['tag--pink', 'tag--red', 'tag--yellow', 'tag--purple', 'tag--green', 'tag--cyan', 'tag--mint', 'tag--dark'];

  // 주차 평판 데이터
  const reputationData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 3.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 3.5,
      ratingCount: "7 / 10",
      description: "20자까지 쓴 내용을 확인할 수 있습니다...",
      fm: 325,
      tagColor: 'tag--mint',
      tagText: '#추진력추진력추',
    },
    {
      id: 2,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/남 5.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 4.5,
      ratingCount: "9 / 10",
      description: "20자까지 쓴 내용을 확인할 수 있습니다...",
      fm: 325,
      tagColor: 'tag--purple',
      tagText: '#리더십리더십리',
    },
    {
      id: 3,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 7.webp",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 2.5,
      ratingCount: "5 / 10",
      description: "20자까지 쓴 내용을 확인할 수 있습니다...",
      fm: 325,
      tagColor: 'tag--yellow',
      tagText: '#창의력창의력창',
    },
    {
      id: 4,
      name: "-",
      gender: "",
      age: "",
      profileImg: "",
      university: "",
      major: "",
      team: "",
      part: "",
      nickname: "",
      rating: 0,
      ratingCount: "- / 10",
      description: "-",
      fm: "-",
      tagColor: 'tag--dark',
      tagText: '-',
      isEmpty: true,
    },
  ];

  // 연계 동료 데이터
  const colleagueData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 5.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "2025 - 12 - 22 (월)",
    },
    {
      id: 2,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/남 8.webp",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "2025 - 12 - 22 (월)",
    },
    {
      id: 3,
      name: "-",
      gender: "-",
      age: "-",
      profileImg: "",
      university: "-",
      major: "-",
      team: "-",
      part: "-",
      nickname: "-",
      date: "0000 - 00 - 00 (일)",
      isEmpty: true,
    },
  ];

  // 실무 정보 카드 데이터
  const workInfoCards = [
    { id: 1, title: "Main Title", verified: true, category: "위즈덤", tagColor: "tag--red", status: "success", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 위즈덤.png", isFruit: true },
    { id: 2, title: "Main Title", verified: true, category: "에세이", tagColor: "tag--yellow", status: "waiting", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 에세이.png", isFruit: true },
    { id: 3, title: "Main Title", verified: true, category: "인포데스크", tagColor: "tag--purple", status: "success", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 인포데스크.png", isFruit: true },
    { id: 4, title: "Main Title", verified: true, category: "캘린더", tagColor: "tag--dark", status: "fail", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 캘린더.png", isFruit: true },
    { id: 5, title: "Main Title", verified: true, category: "포럼", tagColor: "tag--green", status: "waiting", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 포럼.png", isFruit: true },
    { id: 6, title: "Main Title", verified: true, category: "세션", tagColor: "tag--cyan", status: "success", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 세션.png", isFruit: true },
    { id: 7, title: "Main Title", verified: true, category: "기타a", tagColor: "tag--mint", status: "fail", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 기타a.png", isFruit: false },
    { id: 8, title: "Main Title", verified: true, category: "", tagColor: "", status: "", icon: "", isEmpty: true },
    { id: 9, title: "Main Title", verified: true, category: "", tagColor: "", status: "", icon: "", isEmpty: true },
  ];

  // 실무 경험 카드 데이터
  const workExpCards = [
    { id: 1, code: "AA22-11111", badge: "[커리어]마케터 Launch", title: "Main Title", verified: true, rating: 4, ratingCount: "6 / 10", hasWeb: true, icon: "/images/0/cluster%204/icon/실무%20경험/실무%20경험%20-%20[커리어]마케터%20Launch.png" },
    { id: 2, code: "AA22-11111", badge: "[생산성]상호 피드백", title: "Main Title", verified: true, rating: 4, ratingCount: "6 / 10", hasWeb: true, icon: "/images/0/cluster%204/icon/실무%20경험/실무%20경험%20-%20[생산성]상호%20피드백.png" },
    { id: 3, code: "AA22-11111", badge: "[콘텐츠]마케팅 실무", title: "Main Title", verified: true, rating: 3, ratingCount: "6 / 10", hasWeb: false, icon: "/images/0/cluster%204/icon/실무%20경험/실무%20경험%20-%20[콘텐츠]마케팅%20실무.png" },
    { id: 4, code: "AA22-11111", badge: "", title: "Main Title", verified: true, rating: 0, ratingCount: "- / 10", hasWeb: false, isEmpty: true, icon: "" },
  ];

  // 실무 경력 카드 데이터
  const workCareerCards = [
    { id: 1, code: "AA22-11111", badge: "마케팅|마이릿|축시 출시", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/배민.png" },
    { id: 2, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/sm.webp" },
    { id: 3, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/Logo_tvN.svg.png" },
    { id: 4, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/naver%20webtoon.png" },
    { id: 5, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/CJ_logo.svg.png" },
    { id: 6, code: "", badge: "", title: "Main Title", verified: true, date: "0000 - 00 - 00 (월)", likes: "0.99", hasWeb: false, isEmpty: true, icon: "" },
  ];

  // 별점 렌더링 함수 (반개 지원)
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // 채워진 별
        stars.push(
          <img
            key={i}
            src="/images/0/cluster 4/icon/icon - star.png"
            alt="star"
            className="star filled"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        // 반개 별
        stars.push(
          <span key={i} className="star half">
            <img src="/images/0/cluster 4/icon/icon - star.png" alt="star" className="star-half-filled" />
            <img src="/images/0/cluster 4/icon/icon - empty star.png" alt="star" className="star-half-empty" />
          </span>
        );
      } else {
        // 빈 별
        stars.push(
          <img
            key={i}
            src="/images/0/cluster 4/icon/icon - empty star.png"
            alt="star"
            className="star empty"
          />
        );
      }
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
                <div key={user.id} className={`reputation-card ${user.isEmpty ? 'empty' : ''}`}>
                  <div className="card-profile">
                    <div className="profile-image">
                      {user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}
                    </div>
                    <div className="profile-info">
                      <div className="profile-name"><span className="text">{user.isEmpty ? '-' : user.name}</span>{!user.isEmpty && <> | <span className="text">{user.gender}</span> | <span className="text">{user.age}</span></>}</div>
                      <div className="profile-details">
                        {user.isEmpty ? (
                          <>
                            <div className="detail-line"><span className="text">-</span></div>
                            <div className="detail-line"><span className="text">&nbsp;</span></div>
                            <div className="detail-line"><span className="text">&nbsp;</span></div>
                          </>
                        ) : (
                          <>
                            <div className="detail-line"><span className="text">{user.university}</span><span className="label">학교</span> | <span className="text">{user.major}</span><span className="label">학과</span></div>
                            <div className="detail-line"><span className="text">{user.team}</span><span className="label">팀</span> | <span className="text">{user.part}</span><span className="label">파트</span></div>
                            <div className="detail-line"><span className="nickname">{user.nickname}</span></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <div className="card-rating">
                    <div className="stars">{renderStars(user.rating)}</div>
                    <span className="rating-count">{user.ratingCount}</span>
                  </div>
                  <div className="card-description">{user.description} <img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="more-icon" /></div>
                  <div className="card-footer">
                    <span className="fm-badge"><img src="/images/0/cluster 4/icon - wifi.png" alt="wifi" className="wifi-icon" /> FM : {user.fm}</span>
                    <span className="footer-divider">|</span>
                    <span className={`tag ${user.tagColor}`}>{user.tagText}</span>
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
                      <div className="profile-name-row">
                        <div className="profile-name"><span className="text">{user.isEmpty ? '-' : user.name}</span>{!user.isEmpty && <> | <span className="text">{user.gender}</span> | <span className="text">{user.age}</span></>}</div>
                        <div className="date-view">
                          <span className="date">{user.date}</span>
                          <img src="/images/0/cluster 4/icon/icon - 7 - eye.png" alt="view" className="view-icon" />
                        </div>
                      </div>
                      <div className="profile-details">
                        {user.isEmpty ? (
                          <span className="text">-</span>
                        ) : (
                          <><span className="text">{user.university}</span><span className="label">학교</span> | <span className="text">{user.major}</span><span className="label">학과</span> | <span className="text">{user.team}</span><span className="label">팀</span> | <span className="text">{user.part}</span><span className="label">파트</span> | <span className="nickname">{user.nickname}</span></>
                        )}
                      </div>
                    </div>
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
            <div className="progress-header">
              <span className="growth-title">주차 성장률</span>
              <span className="growth-count"><img src="/images/0/cluster 4/icon/icon - 0 - 3star.png" alt="star" className="star-icon" /> 총 13 개 중 <span className="highlight">7</span>개</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="growth-center">
            <span className="progress-percent"><span className="number">65</span><span className="percent">%</span></span>
          </div>
          <div className="growth-right">
            <span className="growth-label">라인별 강화 결과</span>
            <div className="legend-items">
              <span className="legend-item"><img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" className="legend-icon" />강화 성공</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화 대기" className="legend-icon" />강화 대기</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화 실패" className="legend-icon" />강화 실패</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/8 해당 없음.png" alt="해당 없음" className="legend-icon glow" />해당 없음</span>
            </div>
          </div>
        </div>

        {/* 실무 정보 */}
        <div className="work-info-section">
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/1 실무 정보.png" alt="실무 정보" className="section-icon" />
              <span className="section-name">실무 정보</span>
              <span className="section-count">총 7개 중 <span className="highlight">4</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">강화율</span>
              <span className="rate-value"><span className="highlight">65</span>%</span>
            </div>
          </div>
          <div className="work-info-cards">
            {workInfoCards.map((card) => (
              <div key={card.id} className={`work-info-card ${card.isEmpty ? 'empty' : ''}`}>
                <div className="card-content-area">
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">{card.title}</span>
                    <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                    <span className="verified-text">Verified</span>
                    {card.category && <span className={`tag ${card.tagColor}`}>{card.category}</span>}
                  </div>
                  <div className="card-body-row">
                    <div className={`card-icon-area ${card.isFruit ? 'fruit' : ''}`}>
                      {card.icon ? <img src={card.icon} alt={card.category} /> : <div className="icon-placeholder"></div>}
                    </div>
                    <span className="card-desc">CU의 무덤이 몽골에 이어 하와이까지 업습하는 가운데, 한국 유통업계가 돌파해나가야 하는 코스피를 어디가 쌍봉 양대 산맥일지가 관건입니다. 80일이삼사오육칠팔구십<img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" /></span>
                  </div>
                </div>
                {card.status && (
                  <div className="status-badge">
                    {card.status === "success" && <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" />}
                    {card.status === "waiting" && <img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화 대기" />}
                    {card.status === "fail" && <img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화 실패" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 실무 역량 */}
        <div className="work-ability-section">
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/2 실무 역량.png" alt="실무 역량" className="section-icon" />
              <span className="section-name">실무 역량</span>
              <span className="section-count">총 1개 중 <span className="highlight">1</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">강화율</span>
              <span className="rate-value"><span className="highlight">100</span>%</span>
            </div>
          </div>
          <div className="work-ability-card">
            <div className="card-icon-area">
              <img src="/images/0/cluster%204/icon/실무%20역량/실무%20역량%20-%20[실무%20Info]인하우스%20%26%20에이전시.png" alt="인하우스 & 에이전시" />
            </div>
            <div className="card-content-area">
              <div className="card-title-row">
                <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                <span className="card-title">Main Title</span>
                <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                <span className="verified-text">Verified</span>
                <span className="code-tag">AA22-11111</span>
                <span className="info-tag">[실무 Info]인하우스 & 에이전시</span>
              </div>
              <p className="main-desc">[마케팅 실무] 현업에서 마케팅 업계를 구성하고 있는 인하우스 와 에이전시의 개념, 그리고 내부 속성을 알아보자구~</p>
              <div className="sub-title-row">
                <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                <span className="sub-label">Sub Title</span>
              </div>
              <span className="sub-desc">실무 역량의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재가 매력 지 관건이고 이 사용자가 활용한 소재가 매력 매79..<img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" /></span>
            </div>
            <div className="status-badge">
              <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" />
            </div>
          </div>
          <div className="character-image">
            <img src="/images/0/cluster 4/bg img 2.png" alt="character" />
          </div>
        </div>
      </div>

      {/* ========== 섹션 3: 실무 경험 + 실무 경력 ========== */}
      <div className="section3-layout">
        {/* 실무 경험 */}
        <div className="work-exp-section">
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/3 실무 경험.png" alt="실무 경험" className="section-icon" />
              <span className="section-name">실무 경험</span>
              <span className="section-count">총 4개 중 <span className="highlight">3</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">강화율</span>
              <span className="rate-value"><span className="highlight">75</span>%</span>
            </div>
          </div>
          <div className="work-exp-cards">
            {workExpCards.map((card) => (
              <div key={card.id} className={`work-exp-card ${card.isEmpty ? 'empty' : ''}`}>
                <div className="card-icon-area">
                  {card.icon ? <img src={card.icon} alt={card.badge} /> : <div className="icon-placeholder"></div>}
                </div>
                <div className="card-content-area">
                  <div className="card-header-row">
                    <span className="code-tag">{card.code || 'AA22-11111'}</span>
                    <span className="badge-tag">{card.badge || '[커리어]마케터 Launch'}</span>
                  </div>
                  <div className="card-rating-row">
                    <div className="stars">
                      {[1,2,3,4,5].map((star) => (
                        <img
                          key={star}
                          src={star <= card.rating ? "/images/0/cluster 4/icon/icon - star.png" : "/images/0/cluster 4/icon/icon - empty star.png"}
                          alt="star"
                          className="star"
                        />
                      ))}
                    </div>
                    <span className="rating-count">{card.ratingCount}</span>
                  </div>
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">{card.title}</span>
                    <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                    <span className="verified-text">Verified</span>
                  </div>
                  <p className="main-desc">[역량 파악 & 성장점 분석] "빼날 말로만 떠드는 마케팅 커리어가 아니라, 지금 당장 어느 정도로 준비되었는지 그 현실을 빼저리게 느껴보자구!"</p>
                  <div className="sub-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                    <span className="sub-label">Sub Title</span>
                  </div>
                  <span className="sub-desc">실무 역량의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재가 매력적으로 보이나 보이지 않나 보일까 보이지 않을까 보이는가 안 보이는가 보여 93..<img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" /></span>
                </div>
                <div className="status-badge">
                  <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 실무 경력 */}
        <div className="work-career-section">
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/4 실무 경력.png" alt="실무 경력" className="section-icon" />
              <span className="section-name">실무 경력</span>
              <span className="section-count">총 5개 중 <span className="highlight">3</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">강화율</span>
              <span className="rate-value"><span className="highlight">75</span>%</span>
            </div>
          </div>
          <div className="work-career-cards">
            {workCareerCards.map((card) => (
              <div key={card.id} className={`work-career-card ${card.isEmpty ? 'empty' : ''}`}>
                <div className="card-icon-area">
                  {card.icon ? <img src={card.icon} alt={card.badge} /> : <div className="icon-placeholder"></div>}
                </div>
                <div className="card-content-area">
                  <div className="card-header-row">
                    <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                    <span className="verified-text">Verified</span>
                    <span className="code-tag">{card.code || 'AA22-11111'}</span>
                  </div>
                  <div className="grade-row">
                    <span className="grade active">S</span>
                    <span className="grade">A</span>
                    <span className="grade">B</span>
                    <span className="grade">C</span>
                    <span className="grade">D</span>
                  </div>
                  <p className="category-text">마케팅(바이럴) 혹시 몰라</p>
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">{card.title}</span>
                  </div>
                  <p className="main-desc-white">실무 역량의 메인타이틀이 브랜딩 입장에서 어디까지 소화되고 보여져야 UI상 문제가 없을지 한번 테스트해보자는거야 이정도면 뭘까 이것도 역시 80일이삼사오육칠팔구십일이삼사오육칠팔구100</p>
                  <div className="sub-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                    <span className="sub-label">Sub Title</span>
                  </div>
                  <span className="sub-desc">실무 역량의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재가 매력이 있습니다 아주 멋지군요 아주 69..<img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" /></span>
                  <div className="supervisor-section">
                    <span className="supervisor-label">실무 기업 감독자</span>
                    <div className="supervisor-info">
                      <span className="supervised-text">Supervised by:</span>
                      <div className="supervisor-profile">
                        <div className="profile-avatar"></div>
                        <span className="profile-name">김민지 | 서비스기획팀 | 우아한형제들 | 대리</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer-row">
                    <span className="current-bid">Current Bid</span>
                    <span className="date-text">{card.date}</span>
                    <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="check" className="check-icon" />
                    <span className="likes">♦ {card.likes}</span>
                  </div>
                </div>
                <div className="status-badge">
                  <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" />
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
