"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// 시즌 데이터 배열
const seasonData = [
  {
    id: 1,
    year: "2025",
    season: "여름",
    dateRange: "2025 - 06 - 01 (일) ~ 2025 - 08 - 31 (일)",
    status: "시즌 진행 중",
    statusClass: "in-progress",
    image: "/images/0/cluster 4/시즌 이미지/여름_후보_3.png",
    stats: { dangam: 25, injeolmi: 30, eoheung: -2 },
    rating: 4,
    review: "이번시즌 30자 평을 해보라는데, 어디까지 갈 수 있나",
    circles: { weekUsage: 80, scheduleReliability: 90, seasonGrowth: 70 },
    progress: { info: 50, ability: 60, experience: 100, career: 10 },
  },
  {
    id: 2,
    year: "2025",
    season: "봄",
    dateRange: "2025 - 03 - 01 (토) ~ 2025 - 05 - 31 (토)",
    status: "시즌 완료",
    statusClass: "completed",
    image: "/images/0/cluster 4/시즌 이미지/봄_후보_1.png",
    stats: { dangam: 42, injeolmi: 55, eoheung: 5 },
    rating: 5,
    review: "봄 시즌은 정말 알차게 보냈어요! 최고의 시즌!",
    circles: { weekUsage: 95, scheduleReliability: 88, seasonGrowth: 92 },
    progress: { info: 80, ability: 90, experience: 85, career: 70 },
  },
  {
    id: 3,
    year: "2024",
    season: "가을",
    dateRange: "2024 - 09 - 01 (일) ~ 2024 - 11 - 30 (토)",
    status: "시즌 완료",
    statusClass: "completed",
    image: "/images/0/cluster 4/시즌 이미지/가을_후보_1.png",
    stats: { dangam: 30, injeolmi: 35, eoheung: -1 },
    rating: 3,
    review: "가을 시즌은 조금 아쉬웠지만 많이 배웠어요",
    circles: { weekUsage: 60, scheduleReliability: 70, seasonGrowth: 55 },
    progress: { info: 45, ability: 50, experience: 60, career: 40 },
  },
  {
    id: 4,
    year: "2024",
    season: "겨울",
    dateRange: "2024 - 12 - 01 (일) ~ 2025 - 02 - 28 (금)",
    status: "시즌 완료",
    statusClass: "completed",
    image: "/images/0/cluster 4/시즌 이미지/겨울_후보_1.png",
    stats: { dangam: 38, injeolmi: 42, eoheung: 3 },
    rating: 4,
    review: "추운 겨울에도 열심히 성장했던 시즌이었습니다",
    circles: { weekUsage: 75, scheduleReliability: 82, seasonGrowth: 78 },
    progress: { info: 65, ability: 70, experience: 80, career: 55 },
  },
  {
    id: 5,
    year: "2024",
    season: "봄",
    dateRange: "2024 - 03 - 01 (금) ~ 2024 - 05 - 31 (금)",
    status: "시즌 완료",
    statusClass: "completed",
    image: "/images/0/cluster 4/시즌 이미지/봄_후보_1.png",
    stats: { dangam: 28, injeolmi: 40, eoheung: 2 },
    rating: 4,
    review: "첫 시즌! 설레는 마음으로 시작했던 기억이 나네요",
    circles: { weekUsage: 70, scheduleReliability: 75, seasonGrowth: 65 },
    progress: { info: 55, ability: 60, experience: 50, career: 30 },
  },
];

const Cluster4Content = () => {
  // 세션 및 본인 프로필 여부 확인
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get('userId');
  const isOwner = !urlUserId || (session?.user?.id === urlUserId);

  const [section3Page, setSection3Page] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isTextFading, setIsTextFading] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  // 시즌 평판 모달 상태
  const [seasonReputationModalOpen, setSeasonReputationModalOpen] = useState(false);
  const [seasonReputationEditData, setSeasonReputationEditData] = useState<{
    rating: number;
    content: string;
    keyword1: string;
    keyword2: string;
  }>({ rating: 0, content: "", keyword1: "", keyword2: "" });

  // 현재 선택된 시즌 데이터
  const currentSeason = seasonData[section3Page];

  // 현재 시즌 정보 상태 (DB에서 가져옴)
  const [currentSeasonInfo, setCurrentSeasonInfo] = useState<{
    year: number;
    name: string;
    currentWeek: number;
    isClubBreak: boolean;
    holidayName: string | null;
    isBreakSeason: boolean;
    fromSeason: string | null;
    toSeason: string | null;
  } | null>(null);

  // 사용자의 상태 (status, growth_status)
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [growthStatus, setGrowthStatus] = useState<string | null>(null);
  // user_profiles.role 기본값 (역할 이력이 없을 때 사용)
  const [userDefaultRole, setUserDefaultRole] = useState<string | null>(null);

  // 성장 종료 정보
  const [growthEndInfo, setGrowthEndInfo] = useState<{
    year: number | null;
    seasonName: string | null;
    weekNumber: number | null;
  } | null>(null);

  // 현재 시즌 정보 가져오기
  useEffect(() => {
    const fetchCurrentSeason = async () => {
      const today = new Date().toISOString().split('T')[0];

      // 현재 주차 정보 가져오기 (is_club_break, holiday_name 포함)
      const { data: currentWeekData } = await supabase
        .from('weeks')
        .select('id, week_number, is_club_break, holiday_name, seasons (id, name, year)')
        .lte('start_date', today)
        .gte('end_date', today)
        .maybeSingle();

      if (currentWeekData) {
        // 시즌 이름 변환 (spring -> 봄, summer -> 여름, fall -> 가을, winter -> 겨울)
        const seasonNameMap: { [key: string]: string } = {
          'spring': '봄',
          'summer': '여름',
          'fall': '가을',
          'winter': '겨울'
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const seasonData = currentWeekData.seasons as any;
        const rawSeasonName = seasonData?.name || '';

        // break 시즌인지 확인 (예: spring_summer_break, fall_winter_break)
        const isBreakSeason = rawSeasonName.toLowerCase().includes('break');
        let fromSeason: string | null = null;
        let toSeason: string | null = null;
        let displayName = seasonNameMap[rawSeasonName] || rawSeasonName;

        if (isBreakSeason) {
          // break 시즌 이름 파싱 (spring_summer_break -> 봄, 여름)
          const parts = rawSeasonName.replace('_break', '').split('_');
          if (parts.length >= 2) {
            fromSeason = seasonNameMap[parts[0]] || parts[0];
            toSeason = seasonNameMap[parts[1]] || parts[1];
          }
          displayName = '시즌 전환';
        }

        setCurrentSeasonInfo({
          year: seasonData?.year || 0,
          name: displayName,
          currentWeek: currentWeekData.week_number,
          isClubBreak: currentWeekData.is_club_break || false,
          holidayName: currentWeekData.holiday_name || null,
          isBreakSeason,
          fromSeason,
          toSeason
        });
      }
    };

    fetchCurrentSeason();
  }, []);

  // 사용자 프로필에서 status, growth_status, growthEndInfo, role 가져오기
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        // urlUserId가 있으면 해당 사용자, 없으면 본인 프로필 조회
        if (urlUserId) {
          const res = await fetch(`/api/users/${urlUserId}`);
          if (res.ok) {
            const json = await res.json();
            setUserStatus(json.data?.status || null);
            setGrowthStatus(json.data?.growth_status || null);
            // user_profiles.role 기본값 저장
            if (json.data?.role) {
              setUserDefaultRole(json.data.role);
            }
            // growthEndInfo는 /api/users/[id]에서 제공하지 않으므로 null
            setGrowthEndInfo(null);
          }
        } else if (session?.user?.id) {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const json = await res.json();
            setUserStatus(json.growthInfo?.status || null);
            setGrowthStatus(json.growthInfo?.growthStatus || null);
            // user_profiles.role 기본값 저장
            if (json.data?.role) {
              setUserDefaultRole(json.data.role);
            }
            // 성장 종료 정보 설정
            if (json.growthInfo?.endWeekInfo) {
              setGrowthEndInfo({
                year: json.growthInfo.endWeekInfo.year,
                seasonName: json.growthInfo.endWeekInfo.seasonName,
                weekNumber: json.growthInfo.endWeekInfo.weekNumber
              });
            } else {
              setGrowthEndInfo(null);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();
  }, [urlUserId, session?.user?.id]);

  // 성장 상태를 badge 텍스트로 변환 (status와 growth_status 두 개 사용)
  const getGrowthBadgeText = (status: string | null, growthStatus: string | null): string => {
    // 1. 성장 완료 체크 (최우선)
    if (
      status === 'graduated' ||
      growthStatus === '졸업 완료' ||
      growthStatus === '졸업 절차중'
    ) {
      return '성장 완료';
    }

    // 2. 성장 중단 체크
    if (
      status === 'suspended' ||
      growthStatus === '활동 중단' ||
      growthStatus === '활동 유보'
    ) {
      return '성장 중단';
    }

    // 3. 성장 휴식 체크
    if (
      status === 'weekly_rest' ||
      status === 'seasonal_rest' ||
      growthStatus === '주차 휴식 중' ||
      growthStatus === '시즌 휴식 중' ||
      growthStatus === '공식 휴식 중'
    ) {
      return '성장 휴식';
    }

    // 4. 기본값
    return '성장 진행 중';
  };

  // 페이지 전환 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage === section3Page || isFlipping) return;

    setFlipDirection(newPage > section3Page ? 'next' : 'prev');
    setIsFlipping(true);
    setIsTextFading(true);

    // 페이드아웃 완료 후 데이터 변경
    setTimeout(() => {
      setSection3Page(newPage);
      setIsFlipping(false);
    }, 600);

    // 데이터 변경 후 잠시 뒤에 페이드인 시작
    setTimeout(() => {
      setIsTextFading(false);
    }, 650);
  };

  return (
    <div className="cluster4-content">
      {/* Section 1: CLUB CHALLENGE GROWTH */}
      <section className="cluster4-section1">
        {/* 좌측 상단 탭 (세로 정렬) */}
        <div className="top-tabs">
          <Link href="/cluster-4" className="tab">
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
                <span className="badge-text">{getGrowthBadgeText(userStatus, growthStatus)}</span>
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
                  {currentSeasonInfo?.isBreakSeason ? (
                    <>현재 클럽은, <strong>{currentSeasonInfo.year}년 {currentSeasonInfo.fromSeason} 시즌</strong>에서 <strong>{currentSeasonInfo.year}년 {currentSeasonInfo.toSeason} 시즌</strong>으로 가는 휴식(시즌 전환) 중에 있습니다.</>
                  ) : (
                    <>현재 클럽은, <strong>{currentSeasonInfo ? `${currentSeasonInfo.year}년 ${currentSeasonInfo.name} 시즌, ${currentSeasonInfo.currentWeek}주차` : '로딩 중...'}</strong>를 {currentSeasonInfo?.isClubBreak ? `휴식(${currentSeasonInfo.holidayName || '공식'})` : '진행'} 중에 있습니다.</>
                  )}
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
                  <span className="detail-value">
                    {growthEndInfo ? (
                      <>
                        {growthEndInfo.year}년, {growthEndInfo.seasonName} 시즌
                        {growthEndInfo.weekNumber ? `, ${growthEndInfo.weekNumber}주차` : ''} ({getGrowthBadgeText(userStatus, growthStatus)})
                      </>
                    ) : (
                      <>- ({getGrowthBadgeText(userStatus, growthStatus)})</>
                    )}
                  </span>
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
          {/* Floating Icons - 로그인한 본인만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => setSeasonReputationModalOpen(true)}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
            </div>
          )}
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
              onClick={() => handlePageChange(num - 1)}
            >
              {num}
            </span>
          ))}
        </div>

        <div className="season-detail-container" style={{ backgroundImage: `url('${currentSeason.image}')` }}>
          {/* 상단 헤더 영역 (영역 1 + 영역 2) */}
          <div className="top-header-row">
            {/* 영역 1: 타이틀 + 날짜 + 상태 */}
            <div className={`area-1-title ${isTextFading ? 'fading' : ''}`}>
              <div className="season-main-title">
                <span className="year-orange">{currentSeason.year}</span>년도_{currentSeason.season} 시즌
              </div>
              <div className="date-status">
                <span className="date-range">{currentSeason.dateRange}</span>
                <button className={`status-badge ${currentSeason.statusClass}`}>{currentSeason.status}</button>
              </div>
            </div>

            {/* 영역 2: Qualified */}
            <div className={`area-2-qualified ${isTextFading ? 'fading' : ''}`}>
              <span className="qualified-text">Qualified</span>
              <div className="qualified-items">
                <div className="item-group">
                  <span className="item">Part</span>
                  <img src="/images/0/cluster 4/icon/icon - part.png" alt="Part" className="qualified-icon" />
                  <div className="tooltip">
                    <img src="/images/0/cluster 4/sign 1.png" alt="Part tooltip" />
                  </div>
                </div>
                <div className="item-group inactive">
                  <span className="item">Team</span>
                  <img src="/images/0/cluster 4/icon/icon - team.png" alt="Team" className="qualified-icon" />
                  <div className="tooltip unqualified">
                    <span className="unqualified-text">UnQualified</span>
                  </div>
                </div>
                <div className="item-group">
                  <span className="item">Cluv</span>
                  <img src="/images/0/cluster 4/icon/icon - cluv.png" alt="Cluv" className="qualified-icon" />
                  <div className="tooltip">
                    <img src="/images/0/cluster 4/sign 3.png" alt="Cluv tooltip" />
                  </div>
                </div>
                <div className="item-group">
                  <span className="item">Supervise</span>
                  <img src="/images/0/cluster 4/icon/icon - supervise.png" alt="Supervise" className="qualified-icon" />
                  <div className="tooltip">
                    <img src="/images/0/cluster 4/sign 4.png" alt="Supervise tooltip" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 영역 (3열) */}
          <div className="main-content-grid">
            {/* 영역 3: 왼쪽 이미지 스택 */}
            <div className="area-3-image">
              <div className={`season-image-stack ${isFlipping ? 'flipping' : ''}`}>
                <div className="image-card card-back">
                  <div className="card-frame">
                    <img src={seasonData[(section3Page + 2) % seasonData.length]?.image || currentSeason.image} alt="시즌" />
                  </div>
                </div>
                <div className="image-card card-middle">
                  <div className="card-frame">
                    <img src={seasonData[(section3Page + 1) % seasonData.length]?.image || currentSeason.image} alt="시즌" />
                  </div>
                </div>
                <div className="image-card card-front">
                  <div className="card-frame">
                    <img src={currentSeason.image} alt={`${currentSeason.season} 시즌`} />
                  </div>
                </div>
              </div>
            </div>

            {/* 중앙 열 (영역 4, 5, 6, 7) */}
            <div className={`center-column ${isTextFading ? 'fading' : ''}`}>
              {/* 영역 4: 통계 바 */}
              <div className="area-4-stats">
                <span className="stat">단감 <img src="/images/0/cluster 4/icon/icon - 단감.png" alt="단감" className="stat-icon" /> <strong className="number">{currentSeason.stats.dangam}</strong><span className="unit">개</span></span>
                <span className="stat">인절미 <img src="/images/0/cluster 4/icon/icon - 인절미.png" alt="인절미" className="stat-icon" /> <strong className="number">{currentSeason.stats.injeolmi}</strong><span className="unit">명</span></span>
                <span className="stat">어흥 <img src="/images/0/cluster 4/icon/icon - 어흥.png" alt="어흥" className="stat-icon" /> <strong className="number">{currentSeason.stats.eoheung}</strong><span className="unit">개</span></span>
              </div>

              {/* 영역 5: 평점 및 리뷰 */}
              <div className="area-5-rating">
                <div className="rating-avatar">
                  <img src="/images/0/crew profile/이안2.webp" alt="Profile" />
                </div>
                <div className="rating-content">
                  <div className="top-row">
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <img
                          key={star}
                          className={`star-icon ${star <= currentSeason.rating ? '' : 'empty'}`}
                          src="/images/0/cluster 4/icon - star.png"
                          alt="star"
                        />
                      ))}
                      <span className="rating-text">{currentSeason.rating} / 5</span>
                    </div>
                    <span className="review-label">Season Review</span>
                  </div>
                  <p className="review-comment">"{currentSeason.review}"</p>
                </div>
              </div>

              {/* 영역 6: 원형 차트 3개 */}
              <div className="area-6-circles">
                <div className="circle-item">
                  <div className="circle pink">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - currentSeason.circles.weekUsage / 100)} />
                    </svg>
                    <img src="/images/0/cluster 4/icon/icon - 주차 활용도.png" alt="주차 활용도" className="circle-icon" />
                    <div className="percent">{currentSeason.circles.weekUsage}%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">주차 활용도</div>
                    <div className="label-sub">총 10주 중 <span className="highlight">{Math.round(currentSeason.circles.weekUsage / 10)}</span>주</div>
                  </div>
                </div>
                <div className="circle-item">
                  <div className="circle yellow">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - currentSeason.circles.scheduleReliability / 100)} />
                    </svg>
                    <img src="/images/0/cluster 4/icon/icon - 일정 신뢰도.png" alt="일정 신뢰도" className="circle-icon" />
                    <div className="percent">{currentSeason.circles.scheduleReliability}%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">일정 신뢰도</div>
                    <div className="label-sub">총 10주 중 <span className="highlight">{Math.round(currentSeason.circles.scheduleReliability / 10)}</span>주</div>
                  </div>
                </div>
                <div className="circle-item">
                  <div className="circle green">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="40" />
                      <circle className="fill" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - currentSeason.circles.seasonGrowth / 100)} />
                    </svg>
                    <img src="/images/0/cluster 4/icon/icon - 시즌 성장률.png" alt="시즌 성장률" className="circle-icon" />
                    <div className="percent">{currentSeason.circles.seasonGrowth}%</div>
                  </div>
                  <div className="circle-label">
                    <div className="label-main">시즌 성장률</div>
                    <div className="label-sub">총 20개 중 <span className="highlight">{Math.round(currentSeason.circles.seasonGrowth / 5)}</span>주</div>
                  </div>
                </div>
              </div>

              {/* 영역 7: 실무 성장률 프로그레스 바 */}
              <div className="area-7-progress">
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster 4/icon/1 실무 정보.png" alt="1" className="progress-icon" /> 실무 정보 강화율 ({currentSeason.progress.info}%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">{Math.round(currentSeason.progress.info * 0.4)}</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: `${currentSeason.progress.info}%` }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster 4/icon/2 실무 역량.png" alt="2" className="progress-icon" /> 실무 역량 강화율 ({currentSeason.progress.ability}%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">{Math.round(currentSeason.progress.ability * 0.4)}</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: `${currentSeason.progress.ability}%` }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster 4/icon/3 실무 경험.png" alt="3" className="progress-icon" /> 실무 경험 강화율 ({currentSeason.progress.experience}%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">{Math.round(currentSeason.progress.experience * 0.4)}</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: `${currentSeason.progress.experience}%` }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="name"><img src="/images/0/cluster 4/icon/4 실무 경력.png" alt="4" className="progress-icon" /> 실무 경력 강화율 ({currentSeason.progress.career}%)</span>
                    <span className="value"><img src="/images/0/cluster 4/icon/stars.png" alt="stars" className="stars-icon" /> 총 40 개 중 <span className="highlight">{Math.round(currentSeason.progress.career * 0.4)}</span> 개</span>
                  </div>
                  <div className="bar">
                    <div className="fill yellow" style={{ width: `${currentSeason.progress.career}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측 열 (영역 8, 9) */}
            <div className={`right-column ${isTextFading ? 'fading' : ''}`}>
              {/* 영역 8: 시즌 상태 */}
              <div className="area-8-season-status">
                <h4 className="section-title"><img className="section-icon" src="/images/0/cluster 4/icon - 시즌 상태.png" alt="시즌 상태" /> 시즌 상태</h4>
                <div className="status-badges">
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/crew profile/여 1.jpg" alt="profile" />
                    </div>
                    <div className="badge-info">
                      <span className="badge-text">엔터테인먼트팀 <span className="separator">|</span> <span className="sub-text">내돈내산파트</span> <span className="separator">|</span></span>
                    </div>
                    <span className="badge-status yellow">운영진(앰버서더)</span>
                  </div>
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/crew profile/남 2.jpg" alt="profile" />
                    </div>
                    <div className="badge-info">
                      <span className="badge-text">운영진(3기) <span className="separator">|</span> <span className="sub-text">클럽 단위</span> <span className="separator">|</span></span>
                    </div>
                    <span className="badge-status yellow">팀장(헬스케어 팀)</span>
                  </div>
                  <div className="badge-item">
                    <div className="badge-icon">
                      <img src="/images/0/crew profile/여 3.jpg" alt="profile" />
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
                        <img src="/images/0/crew profile/여 1.jpg" alt="profile" />
                      </div>
                      <div className="info">
                        <div className="row1">김미현 <span className="separator">|</span> 여 <span className="separator">|</span> 24 <span className="separator">|</span> 서울대학교 <span className="separator">|</span> 미디어커뮤니케이션학과</div>
                        <div className="row2">엔터테인먼트팀 <span className="separator">|</span> 내돈내산파트 <span className="separator">|</span> 엔비디아구글테슬라쿵</div>
                      </div>
                    </div>
                    <div className="tags">
                      <span className="tag">#추천력추진력면</span>
                      <span className="tag">#추진력추진력면</span>
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
                        <img src="/images/0/crew profile/남 2.jpg" alt="profile" />
                      </div>
                      <div className="info">
                        <div className="row1">박준혁 <span className="separator">|</span> 남 <span className="separator">|</span> 27 <span className="separator">|</span> 연세대학교 <span className="separator">|</span> 컴퓨터공학과</div>
                        <div className="row2">엔터테인먼트팀 <span className="separator">|</span> 내돈내산파트 <span className="separator">|</span> 엔비디아구글테슬라쿵</div>
                      </div>
                    </div>
                    <div className="tags">
                      <span className="tag">#추천력추진력면</span>
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
                        <img src="/images/0/crew profile/여 3.jpg" alt="profile" />
                      </div>
                      <div className="info">
                        <div className="row1">이서연 <span className="separator">|</span> 여 <span className="separator">|</span> 23 <span className="separator">|</span> 고려대학교 <span className="separator">|</span> 경영학과</div>
                        <div className="row2">엔터테인먼트팀 <span className="separator">|</span> 내돈내산파트 <span className="separator">|</span> 엔비디아구글테슬라쿵</div>
                      </div>
                    </div>
                    <div className="tags">
                      <span className="tag">#추천력추진력면</span>
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

      {/* ========== 시즌 평판 모달 ========== */}
      {seasonReputationModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(5px)',
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setSeasonReputationModalOpen(false); }}
        >
          <div style={{
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)',
            border: '1px solid #FFA500',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 165, 0, 0.2)',
              background: 'rgba(255, 165, 0, 0.05)',
            }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#FFA500' }}>✦ 시즌 평판</h3>
              <span style={{ color: '#999', fontSize: '14px' }}>이번 시즌에 대한 해당 크루의 평판을 남겨주세요</span>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* 평점 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FFA500', marginBottom: '10px' }}>평점</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', position: 'relative', top: '-3px' }}>
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const fullValue = starIndex * 2;
                      const halfValue = starIndex * 2 - 1;
                      const currentRating = seasonReputationEditData.rating;
                      const isHalf = currentRating >= halfValue && currentRating < fullValue;
                      const isFull = currentRating >= fullValue;
                      return (
                        <div key={starIndex} style={{ width: '16px', height: '16px', position: 'relative', cursor: 'pointer' }}>
                          <svg viewBox="0 0 24 24" fill={isFull ? '#FFA500' : 'none'} stroke="#FFA500" strokeWidth="2" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {isHalf && (
                            <svg viewBox="0 0 24 24" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                              <defs><clipPath id={`sh${starIndex}`}><rect x="0" y="0" width="12" height="24" /></clipPath></defs>
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FFA500" clipPath={`url(#sh${starIndex})`} />
                            </svg>
                          )}
                          <button type="button" onClick={() => setSeasonReputationEditData(prev => ({ ...prev, rating: halfValue }))} style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }} />
                          <button type="button" onClick={() => setSeasonReputationEditData(prev => ({ ...prev, rating: fullValue }))} style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }} />
                        </div>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFA500' }}>{seasonReputationEditData.rating} / 10</span>
                </div>
              </div>

              {/* 내용 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FFA500', marginBottom: '10px' }}>
                  내용 <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>(최대 100자)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    placeholder="해당 시즌에 대한 평가 내용을 작성해주세요..."
                    maxLength={100}
                    rows={3}
                    value={seasonReputationEditData.content}
                    onChange={(e) => setSeasonReputationEditData(prev => ({ ...prev, content: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', paddingBottom: '30px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '14px', resize: 'none' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', bottom: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{seasonReputationEditData.content.length} / 100</span>
                </div>
              </div>

              {/* 키워드 */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FFA500', marginBottom: '10px' }}>
                  키워드 <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>(최대 2개, 각 7자)</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFA500' }}>#</span>
                    <input
                      type="text"
                      placeholder="키워드 1"
                      value={seasonReputationEditData.keyword1}
                      onChange={(e) => setSeasonReputationEditData(prev => ({ ...prev, keyword1: e.target.value }))}
                      maxLength={7}
                      style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFA500' }}>#</span>
                    <input
                      type="text"
                      placeholder="키워드 2"
                      value={seasonReputationEditData.keyword2}
                      onChange={(e) => setSeasonReputationEditData(prev => ({ ...prev, keyword2: e.target.value }))}
                      maxLength={7}
                      style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid rgba(255, 165, 0, 0.2)', background: 'rgba(0,0,0,0.2)' }}>
              <button onClick={() => setSeasonReputationModalOpen(false)} style={{ padding: '10px 24px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '14px', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
              <button
                onClick={() => setSeasonReputationModalOpen(false)}
                disabled={seasonReputationEditData.rating === 0 || seasonReputationEditData.content.trim() === '' || (seasonReputationEditData.keyword1.trim() === '' && seasonReputationEditData.keyword2.trim() === '')}
                style={{ padding: '10px 24px', border: 'none', background: '#FFA500', color: '#000', fontSize: '14px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', opacity: (seasonReputationEditData.rating === 0 || seasonReputationEditData.content.trim() === '' || (seasonReputationEditData.keyword1.trim() === '' && seasonReputationEditData.keyword2.trim() === '')) ? 0.5 : 1 }}
              >저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cluster4Content;
