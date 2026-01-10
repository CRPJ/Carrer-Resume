"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const Cluster3Content = () => {
  // 세션 및 본인 프로필 여부 확인
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get('userId');
  const isOwner = !urlUserId || (session?.user?.id === urlUserId);
  // 현재 활성화된 슬라이드 인덱스
  const [activeSlide, setActiveSlide] = useState(0);

  // 일정 신뢰도 프로그레스 애니메이션 (섹션 1)
  const [progressOffset, setProgressOffset] = useState(393); // 시작: 0%
  const [progressPercent, setProgressPercent] = useState(0); // 퍼센트 숫자
  const [reliabilityRate, setReliabilityRate] = useState<number | null>(null);
  const [hasReliabilityData, setHasReliabilityData] = useState(false);

  // 섹션 2 프로그레스 바 애니메이션
  const [section2Progress, setSection2Progress] = useState(0);
  const [section2Percent, setSection2Percent] = useState(0); // 퍼센트 숫자
  const section2Ref = useRef<HTMLElement>(null);

  // 섹션 2 품계 카드 애니메이션
  const [highlightedRank, setHighlightedRank] = useState(-1); // -1: 애니메이션 전
  const [animationComplete, setAnimationComplete] = useState(false);

  // 섹션 2 상위 퍼센트 애니메이션
  const [topPercent, setTopPercent] = useState(0);

  // 화살표 애니메이션 (섹션별)
  const [arrowAnimating, setArrowAnimating] = useState<string | null>(null);

  const handleArrowClick = (section: string) => {
    if (!arrowAnimating) {
      setArrowAnimating(section);
      setTimeout(() => setArrowAnimating(null), 600);
    }
  };

  // 섹션 4 버튼 바운스 애니메이션
  const [bouncingBtn, setBouncingBtn] = useState<string | null>(null);

  const handleBtnClick = (btn: string) => {
    if (!bouncingBtn) {
      setBouncingBtn(btn);
      setTimeout(() => setBouncingBtn(null), 500);
    }
  };

  // 섹션 3 페이지네이션
  const [section3Page, setSection3Page] = useState(0);

  // 모달 상태 관리
  const [section3ModalOpen, setSection3ModalOpen] = useState(false);
  const [section4ModalOpen, setSection4ModalOpen] = useState(false);
  const [section5ModalOpen, setSection5ModalOpen] = useState(false);

  // 링크 데이터 관리 (카드 데이터에서 초기화)
  const [section3Links, setSection3Links] = useState<string[]>([]);
  const [section4Links, setSection4Links] = useState<string[]>([]);
  const [section5Links, setSection5Links] = useState<string[]>([]);

  // 편집 중인 링크 데이터
  const [editingSection3Links, setEditingSection3Links] = useState<string[]>([]);
  const [editingSection4Links, setEditingSection4Links] = useState<string[]>([]);
  const [editingSection5Links, setEditingSection5Links] = useState<string[]>([]);

  // API에서 일정 신뢰도 데이터 가져오기
  useEffect(() => {
    const fetchReliabilityRate = async () => {
      if (!session?.user?.email) {
        setHasReliabilityData(false);
        return;
      }

      try {
        const response = await fetch('/api/profile');
        const result = await response.json();

        if (response.ok && result.reliabilityRate !== undefined) {
          setReliabilityRate(result.reliabilityRate);
          setHasReliabilityData(true);
        } else {
          setHasReliabilityData(false);
        }
      } catch (error) {
        console.error("신뢰도 데이터 로드 오류:", error);
        setHasReliabilityData(false);
      }
    };

    fetchReliabilityRate();
  }, [session?.user?.email]);

  // 일정 신뢰도 프로그레스 애니메이션
  useEffect(() => {
    // reliabilityRate가 로드되지 않았으면 대기
    if (reliabilityRate === null) return;

    const targetPercent = reliabilityRate;
    // 393 = 전체 반원 길이, 0% = 393, 100% = 0
    const targetOffset = 393 - (393 * targetPercent / 100);

    const timer = setTimeout(() => {
      setProgressOffset(targetOffset);

      // 숫자 카운트업 애니메이션
      const duration = 1500;
      const startTime = Date.now();

      const countUp = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOut 효과
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPercent = Math.round(easeOut * targetPercent);

        setProgressPercent(currentPercent);

        if (progress < 1) {
          requestAnimationFrame(countUp);
        }
      };

      requestAnimationFrame(countUp);
    }, 300);

    return () => clearTimeout(timer);
  }, [reliabilityRate]);

  // 섹션 2 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animationComplete) {
            // 프로그레스 바 애니메이션
            setTimeout(() => {
              setSection2Progress(90);

              // 숫자 카운트업 애니메이션 (1.5초 동안 0 → 90)
              const duration = 1500;
              const targetPercent = 90;
              const startTime = Date.now();

              const countUp = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentPercent = Math.round(easeOut * targetPercent);

                setSection2Percent(currentPercent);

                if (progress < 1) {
                  requestAnimationFrame(countUp);
                }
              };

              requestAnimationFrame(countUp);

              // 상위 퍼센트 카운트업 애니메이션 (0.8초 동안 0 → 30)
              const topDuration = 800;
              const topTarget = 30;
              const topStartTime = Date.now();

              const countUpTop = () => {
                const elapsed = Date.now() - topStartTime;
                const progress = Math.min(elapsed / topDuration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentPercent = Math.round(easeOut * topTarget);

                setTopPercent(currentPercent);

                if (progress < 1) {
                  requestAnimationFrame(countUpTop);
                }
              };

              requestAnimationFrame(countUpTop);
            }, 300);

            // 품계 카드 순차 애니메이션 (정 9품 → 정승)
            let currentRank = 10; // 정 9품(10번째 카드)부터 시작
            const interval = setInterval(() => {
              setHighlightedRank(currentRank);
              currentRank--;
              if (currentRank < 1) {
                clearInterval(interval);
                setTimeout(() => {
                  setAnimationComplete(true);
                }, 150);
              }
            }, 120); // 120ms 간격으로 다라라락!
          }
        });
      },
      { threshold: 0.3 }
    );

    if (section2Ref.current) {
      observer.observe(section2Ref.current);
    }

    return () => observer.disconnect();
  }, [animationComplete]);

  // 포트폴리오 채널 카드 데이터 (16개 - 2페이지)
  const [channelCards, setChannelCards] = useState([
    { id: 1, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://www.instagram.com/encre.club/" },
    { id: 2, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://www.youtube.com/watch?v=kjI_5WYM7FE" },
    { id: 3, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://m.blog.naver.com/en_cre20/222485485232" },
    { id: 4, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://phalanx-club.tistory.com/" },
    { id: 5, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://x.com/?lang=ko" },
    { id: 6, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://www.threads.com/?hl=ko" },
    { id: 7, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://www.tiktok.com/ko-KR/" },
    { id: 8, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://www.behance.net/" },
    { id: 9, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://www.facebook.com/?locale=ko_KR" },
    { id: 10, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://www.linkedin.com/company/meta" },
    { id: 11, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "https://kr.pinterest.com/" },
    { id: 12, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "" },
    { id: 13, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "" },
    { id: 14, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "" },
    { id: 15, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "" },
    { id: 16, title: "Career Exp Channel", badge: "D", price: "4.89", tag: "09h 99m 99s", link: "" },
  ]);

  // Top Works 슬라이드 데이터 (5개)
  const [topWorksSlides, setTopWorksSlides] = useState([
    { id: 1, active: false, link: "https://www.youtube.com/watch?v=eD5A-tOjZaw" },
    { id: 2, active: false, link: "https://www.youtube.com/watch?v=eD5A-tOjZaw" },
    { id: 3, active: true, link: "https://www.youtube.com/watch?v=eD5A-tOjZaw" },
    { id: 4, active: false, link: "https://www.youtube.com/watch?v=eD5A-tOjZaw" },
    { id: 5, active: false, link: "https://www.youtube.com/watch?v=eD5A-tOjZaw" },
  ]);

  // Detail 10 썸네일 데이터 (10개, 2줄 5개)
  const [detailThumbnails, setDetailThumbnails] = useState([
    { id: 1, link: 'https://www.youtube.com/watch?v=eD5A-tOjZaw' },
    { id: 2, link: 'https://kr.pinterest.com/' },
    { id: 3, link: 'https://blog.naver.com/oranke_official/223247582032' },
    { id: 4, link: 'https://www.youtube.com/watch?v=kCxf76VkRmY' },
    { id: 5, link: 'https://blog.naver.com/kimdg1309/223115604346' },
    { id: 6, link: 'https://www.youtube.com/watch?v=eD5A-tOjZaw' },
    { id: 7, link: 'https://blog.naver.com/oranke_official/223514614072' },
    { id: 8, link: 'https://www.tiktok.com/ko-KR/' },
    { id: 9, link: 'https://www.youtube.com/watch?v=kCxf76VkRmY' },
    { id: 10, link: 'https://www.tistory.com/' },
  ]);

  // 기타 아이콘 목록
  const etcIcons = [
    '/images/0/cluster 3/icon/etc 1.png',
    '/images/0/cluster 3/icon/etc 2.png',
    '/images/0/cluster 3/icon/etc 3.png'
  ];

  // URL에 따른 아이콘 매칭 함수
  const getIconByUrl = (url: string, id?: number) => {
    if (!url) return null; // 링크 없으면 null (그라데이션 표시)
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return '/images/0/cluster 3/icon/Youtube.png';
    if (lowerUrl.includes('instagram.com')) return '/images/0/cluster 3/icon/Instagram.png';
    if (lowerUrl.includes('blog.naver.com') || lowerUrl.includes('m.blog.naver.com')) return '/images/0/cluster 3/icon/Naver Blog.png';
    if (lowerUrl.includes('tistory.com')) return '/images/0/cluster 3/icon/Tstory.png';
    if (lowerUrl.includes('tiktok.com')) return '/images/0/cluster 3/icon/TikTok.png';
    if (lowerUrl.includes('threads.net') || lowerUrl.includes('threads.com')) return '/images/0/cluster 3/icon/Threads.png';
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return '/images/0/cluster 3/icon/X.png';
    if (lowerUrl.includes('behance.net')) return '/images/0/cluster 3/icon/Behance.png';
    // 기타 링크는 etc 아이콘
    return etcIcons[id ? id % etcIcons.length : Math.floor(Math.random() * etcIcons.length)];
  };

  // 카드 데이터의 링크로 state 초기화
  useEffect(() => {
    if (section3Links.length === 0) {
      setSection3Links(channelCards.slice(0, 16).map(card => card.link));
    }
    if (section4Links.length === 0) {
      setSection4Links(topWorksSlides.map(slide => slide.link));
    }
    if (section5Links.length === 0) {
      setSection5Links(detailThumbnails.map(thumb => thumb.link));
    }
  }, []);

  return (
    <div className="cluster3-content">
      {/* Section 1: CLUB FINAL INDEX - 새 디자인 */}
      <section className="cluster3-section1">
        {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
        )}
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

        {/* 설명 텍스트 */}
        <div className="section1-description">
          <p>이 페이지는 우리 시대의 성장하는 청춘! 크루들의 지금까지 누적된, 현재 성장 & 강화 결과를 리포트합니다.</p>
          <p>클럽의 마지막 성장 주차까지 종료한 크루의 경우, 그대로 클럽 마지막 최종 결과표가 되기도 할 거에요. 😊</p>
          <p className="small-text">내가 가고 있는 이 길이 어디쯤 와있는지, 내가 초심을 잃지 않고 목표를 향해, 성장을 향해 잘 나아가고 있는지를, 확인하세요!</p>
          <p className="small-text">당신의 시간과 성장은 얼마나 자랑스러우신가요?</p>
          <p className="quote-text">
            I believe that every right implies a responsibility; every opportunity, an obligation; every possession, a duty.
          </p>
          <p className="quote-highlight">"모든 권리에는 책임이 따르고, 모든 기회에는 의무가 따르며, 모든 소유물에는 의무가 따른다고 믿는다."</p>
          <p className="quote-author">-존 D. 록펠러 (John D. Rockefeller)-</p>
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
                stroke="rgba(250, 171, 7, 0.5)"
                strokeWidth="20"
                strokeLinecap="butt"
              />
              {/* 진행 반원 (애니메이션) */}
              <path
                className="progress-bar"
                d="M 25 150 A 125 125 0 0 1 275 150"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="20"
                strokeDasharray="393"
                strokeDashoffset={progressOffset}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FAAB07" />
                  <stop offset="100%" stopColor="#FFC919" />
                </linearGradient>
              </defs>
            </svg>
            <div className="progress-text">
              <span className="progress-percent">{progressPercent}%</span>
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
              <h3 className="card-title">성장 진행 상태(Process)</h3>
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
                <span className="info-label"><span className="dot">·</span> 성장 종료일</span>
                <span className="info-value be-cluving">Be Cluving</span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">WATCH GROWTH <img src="/images/0/cluster 3/icon/_.png" alt="icon" /></span>
            </div>
          </div>

          {/* 카드 2: 성장 기간 집계(Period) */}
          <div className="stat-card wide">
            <div className="card-header">
              <div className="card-icon purple">
                <img src="/images/0/cluster 3/icon/0purple.png" alt="Purple" />
              </div>
              <h3 className="card-title">성장 기간 집계(Period)</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 성장(성공) 주차</span>
                <span className="info-value week">999<span className="highlight-orange">(1)</span><span className="unit">주</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 성장(실패) 주차</span>
                <span className="info-value week">999<span className="unit">주</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 휴식(개인) 주차</span>
                <span className="info-value week">999<span className="highlight-orange">(999)</span><span className="unit">주</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 휴식(공식) 주차</span>
                <span className="info-value week">999<span className="unit">주</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 성장 가능 주차</span>
                <span className="info-value week">999<span className="unit">주</span></span>
              </div>
              <div className="info-row separator">
                <span className="info-label"><span className="dot">·</span> 성장 휴식 시즌</span>
                <span className="info-value season">999<span className="unit">시즌</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 성장(성공) 시즌</span>
                <span className="info-value season">999<span className="unit">시즌</span></span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">WATCH GROWTH <img src="/images/0/cluster 3/icon/_.png" alt="icon" /></span>
            </div>
          </div>

          {/* 카드 3: 성장 점수 기록(Point) */}
          <div className="stat-card">
            <div className="card-header">
              <div className="card-icon green">
                <img src="/images/0/cluster 3/icon/0green.png" alt="Green" />
              </div>
              <h3 className="card-title">성장 점수 기록(Point)</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 단감(총합) <img src="/images/0/cluster 3/icon/Ok01.png" alt="단감" className="label-icon orange" /></span>
                <span className="info-value number">99,999<span className="unit">개</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 인절미(총합) <img src="/images/0/cluster 3/icon/OK02.png" alt="인절미" className="label-icon" /></span>
                <span className="info-value number">99,999<span className="unit">개</span></span>
              </div>
              <div className="info-row">
                <span className="info-label"><span className="dot">·</span> 어흥(총합) <img src="/images/0/cluster 3/icon/Ok03.png" alt="어흥" className="label-icon" /></span>
                <span className="info-value number negative">-99,999<span className="unit">개</span></span>
              </div>
            </div>
            <div className="card-footer">
              <span className="watch-pricing">WATCH GROWTH <img src="/images/0/cluster 3/icon/_.png" alt="icon" /></span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 졸업 자격 조건 - 배경 이미지 영역 */}
      <section className="cluster3-section2" ref={section2Ref}>
        {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
        )}
        <div className="section2-bg">
          <img src="/images/0/cluster 3/bg2.png" alt="Background" />
        </div>
        <div className="section2-text">
          <span className="handwriting">클럽 강화 품계</span>
        </div>

        {/* 오른쪽 상단: 상위 퍼센트 */}
        <div className="section2-progress">
          <div className="progress-info">
            <span className="progress-label">상위</span>
            <span className="progress-percent">{topPercent}</span>
            <span className="progress-unit">%</span>
          </div>
        </div>

        {/* 10개의 품계 카드 (정승 + 정 1~9품) */}
        <div className="section2-cards">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => {
            // 라벨 표시: 1->정승, 2->정1품, 3->정2품 ... 10->정9품
            const displayRank = rank === 1 ? '정승' : rank - 1;
            return (
              <div
                key={rank}
                className={`rank-card ${rank === 3 ? 'active' : 'inactive'}`}
                style={{
                  transform: !animationComplete && highlightedRank !== -1 && highlightedRank >= rank
                    ? `scale(${1 + 0.08 * Math.max(0, 1 - Math.abs(highlightedRank - rank) * 0.3)}) translateY(${-5 * Math.max(0, 1 - Math.abs(highlightedRank - rank) * 0.3)}px)`
                    : 'scale(1) translateY(0)',
                  boxShadow: !animationComplete && highlightedRank === rank
                    ? '0 8px 25px rgba(250, 171, 7, 0.6)'
                    : !animationComplete && highlightedRank !== -1 && Math.abs(highlightedRank - rank) === 1
                      ? '0 4px 15px rgba(250, 171, 7, 0.3)'
                      : 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: !animationComplete && highlightedRank === rank ? 10 : 1
                }}
              >
                <div className="rank-medal">
                  <img src={`/images/0/cluster 3/icon/medal ${rank}.png`} alt={`Medal ${rank}`} />
                </div>
                <div className="rank-card-image">
                  <img src={`/images/0/cluster 3/image/정 ${rank} 품.png`} alt={`Rank ${rank}`} />
                </div>
                <div className="rank-label">
                  {displayRank === '정승' ? (
                    <>
                      <span className="rank-prefix">정</span>
                      <span className="rank-number">승</span>
                    </>
                  ) : (
                    <>
                      <span className="rank-prefix">정</span>
                      <span className="rank-number">{displayRank}</span>
                      <span className="rank-suffix">품</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: 포트폴리오 마케팅 Channel */}
      <section className="cluster3-section3">
        {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => {
              setEditingSection3Links(channelCards.slice(0, 16).map(card => card.link || ""));
              setSection3ModalOpen(true);
            }} style={{ cursor: 'pointer' }}>
              <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
            </div>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
        )}
        {/* 배경 이미지 */}
        <div className="section3-bg">
          <img src="/images/0/cluster 3/bg3.png" alt="Background" />
        </div>

        <div className="section3-header">
          <div className="header-left">
            <h2 className="subtitle">
              <span className="title-text">
                <img src="/images/0/cluster 3/icon/triangle-orange.svg" alt="triangle" className="triangle-icon" />
                포트폴리오 아카이빙 Channel
              </span>
            </h2>
            <div className="header-sub">
              <span className="view-all" onClick={() => handleArrowClick('section3')} style={{ cursor: 'pointer' }}>
                View All Bids <span className={`arrow-icon ${arrowAnimating === 'section3' ? 'arrow-bounce' : ''}`}></span>
              </span>
            </div>
          </div>
        </div>

        <div className="channel-cards">
          {channelCards.slice(section3Page * 8, section3Page * 8 + 8).map((card, index) => {
            const actualIndex = section3Page * 8 + index;
            // URL에 따른 아이콘 매칭
            const snsImage = getIconByUrl(card.link, card.id);
            return (
              <div key={card.id} className="channel-card" onClick={() => card.link && window.open(card.link, '_blank')}>
                <div className="card-image">
                  <img src={`/images/0/cluster 3/image/1-${((card.id - 1) % 8) + 1}.png`} alt="Channel" />
                  <div className="card-tag">{card.tag}</div>
                  <div className="card-like">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                </div>
                <div className="card-content">
                  <p className="card-title">{card.title}</p>
                  <div className="card-info">
                    <div className="info-row">
                      <div className="info-author">
                        {snsImage ? (
                          <img src={snsImage} alt="SNS" className={`sns-icon${snsImage.includes('etc') ? ' sns-icon-etc' : ''}`} />
                        ) : (
                          <div className="sns-icon sns-gradient"></div>
                        )}
                        <div className="author-text">
                          <span className="info-label">Created by:</span>
                          <span className="author-name">Hwnag Yeongyeong</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-divider"></div>
                    <div className="info-row growth-row">
                      <span className="info-label">Growth Bid</span>
                      <div className="info-price">
                        <img src="/images/0/cluster 3/icon/dia.png" alt="dia" className="dia-icon" />
                        <span className="price-value">0.99</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 섹션 3 페이지네이션 */}
        <div className="section3-pagination">
          {[1, 2].map((num) => (
            <span
              key={num}
              className={`page-num ${section3Page === num - 1 ? 'active' : ''} ${num === 2 ? 'last' : ''}`}
              onClick={() => setSection3Page(num - 1)}
            >
              {num}
            </span>
          ))}
        </div>
      </section>

      {/* Section 4: 포트폴리오 아카이빙 Output */}
      <section className="cluster3-section4">
        {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => {
              setEditingSection4Links(topWorksSlides.map(slide => slide.link || ""));
              setSection4ModalOpen(true);
            }} style={{ cursor: 'pointer' }}>
              <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
            </div>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
        )}
        {/* 배경 이미지 */}
        <div className="section4-bg">
          <img src="/images/0/cluster 3/bg4.png" alt="Background" />
        </div>

        <div className="section4-top-header">
          <div className="header-left">
            <h2 className="subtitle">
              <span className="title-text">
                <img src="/images/0/cluster 3/icon/triangle-orange.svg" alt="triangle" className="triangle-icon" />
                포트폴리오 아카이빙 output
              </span>
            </h2>
            <div className="header-sub">
              <span className="view-all" onClick={() => handleArrowClick('section4')} style={{ cursor: 'pointer' }}>
                View All Bids <span className={`arrow-icon ${arrowAnimating === 'section4' ? 'arrow-bounce' : ''}`}></span>
              </span>
            </div>
          </div>
        </div>
        <div className="section4-header">
          <h2 className="section4-title">World Of Top Works</h2>
          <p className="section4-desc">
            *본 아카이빙 Output은 클럽에서 쌓은 '실무 경험' 중 최고 결과물에 해당하는 것들 중 &lt;일부분&gt;만을 다루고 있습니다.<br />
            전체적인 실무 경험, 실무 경력, 역량, 정보 등은 다른 탭에서 확인해주세요.
          </p>
        </div>

        <div className="section4-tabs">
          <button
            className={`tab-btn creative ${bouncingBtn === 'creative' ? 'btn-bounce' : ''}`}
            onClick={() => handleBtnClick('creative')}
          >
            #Creative More <img src="/images/0/cluster 3/icon/화살표.png" alt="arrow" className="btn-arrow" />
          </button>
          <button
            className={`tab-btn practical ${bouncingBtn === 'practical' ? 'btn-bounce' : ''}`}
            onClick={() => handleBtnClick('practical')}
          >
            #Practical More <img src="/images/0/cluster 3/icon/화살표.png" alt="arrow" className="btn-arrow" />
          </button>
        </div>

        <div className="top-works-slider">
          {topWorksSlides.map((slide, index) => {
            const snsIcons = [
              '/images/0/cluster 3/icon/Instagram.png',
              '/images/0/cluster 3/icon/Youtube.png',
              '/images/0/cluster 3/icon/Threads.png',
            ];
            const randomIcon = snsIcons[slide.id % snsIcons.length];

            // 현재 활성 슬라이드 기준으로 원형 회전 위치 계산
            const totalSlides = topWorksSlides.length;
            let position = index - activeSlide;

            // 원형 회전: -2 ~ 2 범위로 조정
            if (position > 2) position -= totalSlides;
            if (position < -2) position += totalSlides;

            return (
              <div
                key={slide.id}
                className={`slider-item position-${position}`}
                data-position={position}
                onClick={() => slide.link && window.open(slide.link, '_blank')}
                style={{ cursor: 'pointer' }}
              >
                <img src={`/images/0/cluster 3/image/2-${slide.id}.png`} alt={`Work ${slide.id}`} />
                <div className="card-overlay">
                  <div className="card-top">
                    <div className="info-author">
                      {!slide.link ? (
                        <div className="sns-icon sns-gradient"></div>
                      ) : (
                        <img src={randomIcon} alt="SNS" className="sns-icon" />
                      )}
                      <div className="author-text">
                        <span className="info-label">Posted by :</span>
                        <span className="author-name">Hwang Yeongyeong</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-badges">
                    <div className="card-tag">09h 99m 99s</div>
                    <div className="card-like">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section4-pagination">
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              className={`page-num ${activeSlide === num - 1 ? 'active' : ''} ${num === 5 ? 'last' : ''}`}
              onClick={() => setActiveSlide(num - 1)}
            >
              {num}
            </span>
          ))}
        </div>

        {/* Section 5: The Detail 10 - 섹션4 배경 안에 포함 */}
        <div className="cluster3-section5">
        {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => {
              setEditingSection5Links(detailThumbnails.map(thumb => thumb.link || ""));
              setSection5ModalOpen(true);
            }} style={{ cursor: 'pointer' }}>
              <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
            </div>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
        )}
        <div className="section5-header">
          <div className="header-left">
            <h2 className="subtitle">
              <span className="title-text">
                <img src="/images/0/cluster 3/icon/triangle-orange.svg" alt="triangle" className="triangle-icon" />
                The Detail 10
              </span>
            </h2>
            <div className="header-sub">
              <span className="view-all" onClick={() => handleArrowClick('section5')} style={{ cursor: 'pointer' }}>
                View All Bids <span className={`arrow-icon ${arrowAnimating === 'section5' ? 'arrow-bounce' : ''}`}></span>
              </span>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          {detailThumbnails.map((thumb) => {
            const iconUrl = getIconByUrl(thumb.link, thumb.id);
            return (
              <div key={thumb.id} className="detail-item" onClick={() => thumb.link && window.open(thumb.link, '_blank')} style={{ cursor: thumb.link ? 'pointer' : 'default' }}>
                <img src={`/images/0/cluster 3/image/3-${thumb.id}.png`} alt={`Detail ${thumb.id}`} />
                <div className="item-overlay">
                  <div className="like-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span>99 Like</span>
                  </div>
                  <div className="item-bottom">
                    {iconUrl ? (
                      <img src={iconUrl} alt="SNS" className="sns-icon" />
                    ) : (
                      <div className="sns-icon sns-gradient"></div>
                    )}
                    <div className="item-info">
                      <span className="item-tags">#Detail, #Micro</span>
                      <span className="item-author">@Hwang Yeongyeong</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* 섹션 3 모달 - 채널 링크 편집 */}
      {section3ModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSection3ModalOpen(false); }}>
          <div className="section-modal">
            <div className="section-modal-header">
              <h3>포트폴리오 아카이빙 channel 링크 편집</h3>
              <p className="modal-subtitle">클럽 활동 중 자신의 결과물을 업로드 한 SNS 채널 링크를 등록해주세요<br /><span className="subtitle-gray">(인스타, 유튜브, 블로그, 티스토리, 트위터, 쓰레드, 틱톡, 비핸스, 기타)</span></p>
              <button className="modal-close-btn" onClick={() => setSection3ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section-modal-body">
              {editingSection3Links.map((link, index) => (
                <div key={index} className="link-edit-item">
                  <div className="link-item-header">
                    <span className="link-label">Channel {index + 1}</span>
                  </div>
                  <input
                    type="url"
                    placeholder="링크를 입력하세요 (https://...)"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...editingSection3Links];
                      newLinks[index] = e.target.value;
                      setEditingSection3Links(newLinks);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setSection3ModalOpen(false)}>취소</button>
              <button
                className="save-btn"
                onClick={() => {
                  setSection3Links([...editingSection3Links]);
                  // 카드 데이터 업데이트
                  const updatedCards = channelCards.map((card, index) => {
                    if (index < 16) {
                      return { ...card, link: editingSection3Links[index] };
                    }
                    return card;
                  });
                  setChannelCards(updatedCards);
                  setSection3ModalOpen(false);
                }}
              >저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 4 모달 - Top Works 링크 편집 */}
      {section4ModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSection4ModalOpen(false); }}>
          <div className="section-modal">
            <div className="section-modal-header">
              <h3>포트폴리오 아카이빙 Output 링크 편집</h3>
              <p className="modal-subtitle">본인이 제작한 결과물 중 가장 대표적인 5개의 결과물을 등록해주세요.</p>
              <button className="modal-close-btn" onClick={() => setSection4ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section-modal-body">
              {editingSection4Links.map((link, index) => (
                <div key={index} className="link-edit-item">
                  <div className="link-item-header">
                    <span className="link-label">Work {index + 1}</span>
                  </div>
                  <input
                    type="url"
                    placeholder="링크를 입력하세요 (https://...)"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...editingSection4Links];
                      newLinks[index] = e.target.value;
                      setEditingSection4Links(newLinks);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setSection4ModalOpen(false)}>취소</button>
              <button
                className="save-btn"
                onClick={() => {
                  setSection4Links([...editingSection4Links]);
                  // 슬라이드 데이터 업데이트
                  const updatedSlides = topWorksSlides.map((slide, index) => ({
                    ...slide,
                    link: editingSection4Links[index]
                  }));
                  setTopWorksSlides(updatedSlides);
                  setSection4ModalOpen(false);
                }}
              >저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 5 모달 - Detail 10 링크 편집 */}
      {section5ModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSection5ModalOpen(false); }}>
          <div className="section-modal">
            <div className="section-modal-header">
              <h3>The Detail 10 링크 편집</h3>
              <p className="modal-subtitle">위 대표 결과물 5개를 제외한, 클럽 활동 결과물 중<br />추가로 보여주고 싶은 결과물 링크를 등록해 주세요.</p>
              <button className="modal-close-btn" onClick={() => setSection5ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section-modal-body">
              {editingSection5Links.map((link, index) => (
                <div key={index} className="link-edit-item">
                  <div className="link-item-header">
                    <span className="link-label">Detail {index + 1}</span>
                  </div>
                  <input
                    type="url"
                    placeholder="링크를 입력하세요 (https://...)"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...editingSection5Links];
                      newLinks[index] = e.target.value;
                      setEditingSection5Links(newLinks);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setSection5ModalOpen(false)}>취소</button>
              <button
                className="save-btn"
                onClick={() => {
                  setSection5Links([...editingSection5Links]);
                  // 썸네일 데이터 업데이트
                  const updatedThumbnails = detailThumbnails.map((thumb, index) => ({
                    ...thumb,
                    link: editingSection5Links[index]
                  }));
                  setDetailThumbnails(updatedThumbnails);
                  setSection5ModalOpen(false);
                }}
              >저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cluster3Content;
