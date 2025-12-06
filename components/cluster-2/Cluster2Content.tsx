"use client";

import { useState, useRef, useCallback } from "react";

// 학력 데이터 타입
interface EduData {
  school: string;
  status: string;
  category: string;
  major1: string;
  major2: string;
  major3: string;
  period: string;
  grade: string;
  description: string;
  isFinal?: boolean;
}

// 학력 데이터
const educationData: EduData[] = [
  {
    school: "고려 대학교",
    status: "재학",
    category: "사회",
    major1: "콘텐츠전략학",
    major2: "디지털마케팅학",
    major3: "-",
    period: "2025.03 - ~ing",
    grade: "3.8 / 4.5",
    description: "석사 과정에서 더 깊이 있는 연구와 전문성을 쌓고 있습니다. 학부 때 배운 이론을 바탕으로 실제 현장에서 적용 가능한 연구를 진행하며, 지도교수님과 연구실 동료들과 함께 새로운 가치를 창출하고 있습니다. 학문적 성장뿐 아니라 후배들을 이끌며 리더십도 키워가고 있습니다.",
    isFinal: true
  },
  {
    school: "연세 대학교",
    status: "졸업",
    category: "예체능",
    major1: "미디어커뮤니케이션학과",
    major2: "-",
    major3: "-",
    period: "2021. 03 ~ 2025. 02",
    grade: "4.12 / 4.3",
    description: "대학 4년간 전공 수업과 다양한 프로젝트를 통해 미디어와 커뮤니케이션에 대한 깊은 이해를 쌓았습니다. 학회 활동, 공모전 참여, 인턴십 경험을 통해 이론과 실무를 연결하는 법을 배웠고, 평생의 동료가 될 소중한 친구들을 만났습니다."
  },
  {
    school: "서울과학 고등학교",
    status: "졸업",
    category: "기타",
    major1: "-",
    major2: "-",
    major3: "-",
    period: "2018. 03 ~ 2021. 02",
    grade: "2등급 / 9등급",
    description: "진로를 탐색하고 꿈을 구체화했던 시기입니다. 다양한 동아리 활동과 봉사활동을 통해 협동심과 리더십을 기르고, 열정적인 선생님들 덕분에 학업에 대한 흥미를 잃지 않을 수 있었습니다. 대학 진학의 기반을 다진 소중한 시간이었습니다."
  },
  {
    school: "용산 중학교",
    status: "졸업",
    category: "상경",
    major1: "-",
    major2: "-",
    major3: "-",
    period: "2015. 03 ~ 2018. 02",
    grade: "15%",
    description: "호기심 가득했던 시절, 다양한 과목을 접하며 세상에 대한 시야를 넓혔습니다. 처음으로 친한 친구들과 우정을 쌓고, 학교 행사와 체육대회에서 즐거운 추억을 만들었습니다. 꿈을 키우기 시작한 순수했던 시간입니다."
  }
];

// 물결 파동 타입
interface Ripple {
  id: number;
  x: number;
  y: number;
}

const Cluster2Content = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<EduData | null>(null);

  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const cardsRef = useRef<HTMLDivElement>(null);

  // 섹션 5 물결 파동 상태
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);
  const lastRippleTime = useRef(0);

  // 모달 열기
  const openModal = (edu: EduData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEdu(edu);
    setModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalOpen(false);
    setSelectedEdu(null);
  };

  const handleWithUsClick = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 1000);
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX;
    setDragOffset(diff);
  };

  // 드래그 종료
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // 드래그 거리에 따라 페이지 변경
    if (dragOffset < -100 && currentPage < 1) {
      setCurrentPage(currentPage + 1);
    } else if (dragOffset > 100 && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // 명언 카드 틸트 효과
  const handleCardTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  }, []);

  const handleCardTiltReset = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  // 섹션 5 물결 파동 핸들러
  const handleIntroMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!introRef.current) return;

    // 카드 영역 위에서는 물결 생성 안함
    const target = e.target as HTMLElement;
    if (target.closest('.intro-card')) return;

    // 쓰로틀링: 150ms 간격으로만 물결 생성
    const now = Date.now();
    if (now - lastRippleTime.current < 150) return;
    lastRippleTime.current = now;

    const rect = introRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y
    };

    setRipples(prev => [...prev.slice(-5), newRipple]); // 최대 6개만 유지

    // 2초 후 물결 제거
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 2000);
  }, []);

  return (
    <div className="cluster2-content">
      {/* PROFILE 헤더 */}
      <div className="cluster2-title-wrapper">
        <div className="title-inner">
          <h1 className="cluster2-title-shadow">PROFILE</h1>
          <h1 className="cluster2-title">PROFILE</h1>
        </div>
      </div>

      {/* 상단 섹션: 연결된 프레임 */}
      <div className="cluster2-top-frame" style={{ position: 'relative' }}>
        {/* Edit Button */}
        <button className="section-edit-btn">
          <i className="ti ti-pencil"></i>
        </button>
        {/* 왼쪽 카드 */}
        <div className="frame-left">
          <h2 className="adventure-title">Adventure With Us</h2>

          {/* 큰 육각형 이미지 4개 */}
          <div className="hexagon-large-row">
            <div className="hexagon-large-item">
              <div className="hex-large"><img src="/images/0/cluster 2/이안1.webp" alt="Joy" /></div>
              <span className="hex-label">Joy</span>
            </div>
            <div className="hexagon-large-item">
              <div className="hex-large"><img src="/images/0/cluster 2/이안2.webp" alt="Blue" /></div>
              <span className="hex-label">Blue</span>
            </div>
            <div className="hexagon-large-item">
              <div className="hex-large"><img src="/images/0/cluster 2/이안3.jpg" alt="Passion" /></div>
              <span className="hex-label">Passion</span>
            </div>
            <div className="hexagon-large-item">
              <div className="hex-large"><img src="/images/0/cluster 2/이안4.jpg" alt="Moments" /></div>
              <span className="hex-label">Moments</span>
            </div>
          </div>

          <div className="avatar-row">
            <div className="hexagon-stack">
              <div className="hex-avatar"><img src="/images/0/cluster 2/image 1.png" alt="" /></div>
              <div className="hex-avatar"><img src="/images/0/cluster 2/image 2.png" alt="" /></div>
              <div className="hex-avatar"><img src="/images/0/cluster 2/image 3.png" alt="" /></div>
              <div className="hex-avatar"><img src="/images/0/cluster 2/image 4.png" alt="" /></div>
              <div className="hex-more">25+</div>
            </div>
            <span className="avatar-count">999 <span className="joined-text">Cluving Joined</span></span>
          </div>
        </div>

        {/* 중앙 프로필 사진 */}
        <div className="frame-center">
          <img src="/images/0/cluster 2/이안0.png" alt="Profile" />
        </div>

        {/* 오른쪽 카드 */}
        <div className="frame-right">
          <div className="mascot-icon">
            <img src="/images/0/cluster 2/ok 01.png" alt="" />
          </div>
          <span className="progress-label">OH, MY DREAM</span>
          <span className="progress-value">99.9%</span>
          <button className={`with-us-btn ${isWiggling ? 'wiggle' : ''}`} onClick={handleWithUsClick}>
            <img src="/images/0/cluster 2/button box.png" alt="" />
            <span>Wiht us</span>
          </button>
        </div>
      </div>

      {/* 인용문 섹션 */}
      <div className="cluster2-quotes" style={{ position: 'relative' }}>
        {/* Edit Button */}
        <button className="section-edit-btn">
          <i className="ti ti-pencil"></i>
        </button>
        <div className="quotes-bg-image">
          <img src="/images/0/cluster 2/bg00.png" alt="" />
        </div>
        <div className="quotes-cards">
          <div className="quote-card">
            <img className="diamond-icon" src="/images/0/cluster 2/icon/diamond.png" alt="" />
            <span className="quote-mark">&quot;</span>
            <div className="quote-body">
              <span className="quote-badge">Per Aspera Ad Astra</span>
              <p className="quote-text">
                지금의 한 걸음이 작아 보여도 결국 미래를 바꾸는 결정적 힘이 된다 흔들려도 멈추지 않으면 결국 도착한다 그게 성장의 즐거다
              </p>
              <div className="quote-footer">
                <div className="quote-author">
                  <img src="/images/0/cluster 2/이안1.webp" alt="" />
                  <div className="author-info">
                    <span className="author-name">Hwang Yeongueong</span>
                    <span className="author-role">Dreamer</span>
                  </div>
                </div>
                <div className="quote-score">
                  <span className="score-label">CLOUD SCORE</span>
                  <span className="score-stars">✦✦✦✦✧</span>
                </div>
              </div>
            </div>
          </div>

          <div className="quote-card">
            <img className="diamond-icon" src="/images/0/cluster 2/icon/diamond.png" alt="" />
            <span className="quote-mark">&quot;</span>
            <div className="quote-body">
              <span className="quote-badge">Per Aspera Ad Astra</span>
              <p className="quote-text">
                작은 용기가 쌓여 결국 더 큰 변화를 만들고 흔들리는 순간에도 멈추지 않으면 마침내 스스로의 길을 찾아간다 라는 믿음이다.
              </p>
              <div className="quote-footer">
                <div className="quote-author">
                  <img src="/images/0/cluster 2/이안3.jpg" alt="" />
                  <div className="author-info">
                    <span className="author-name">Hwang Yeongueong</span>
                    <span className="author-role">Dreamer</span>
                  </div>
                </div>
                <div className="quote-score">
                  <span className="score-label">CLOUD SCORE</span>
                  <span className="score-stars">✦✦✦✦✧</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 학력 섹션 */}
      <div
        className="cluster2-education"
        style={{ position: 'relative' }}
      >
        {/* Edit Button */}
        <button className="section-edit-btn">
          <i className="ti ti-pencil"></i>
        </button>
        <div className="edu-bg-image">
          <img src="/images/0/cluster 2/bg04.png" alt="" />
        </div>
        <div className="edu-center-line">
          <img src="/images/0/cluster 2/section 03.png" alt="" />
        </div>
        <div
          className="edu-cards-wrapper"
          ref={cardsRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `translateX(calc(-${currentPage * 350}px + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 0.4s ease',
            userSelect: 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {educationData.map((edu, index) => (
            <div className={`edu-card ${edu.isFinal ? 'first' : ''}`} key={index}>
              <img className="edu-border-tl" src="/images/0/cluster 2/border.png" alt="" />
              <img className="edu-border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img className="edu-bg-icon" src="/images/0/cluster 2/icon/Success Plan.png" alt="" />
              <div className="edu-header">
                <h3 className="edu-school"><span className="school-circle"></span><span className="school-name">{edu.school}</span></h3>
              </div>
              <ul className="edu-details">
                <li><span className="dot">·</span><span className="label">상태</span><span className="value">{edu.status}</span></li>
                <li><span className="dot">·</span><span className="label">계열</span><span className="value">{edu.category}</span></li>
                <li><span className="dot">·</span><span className="label">전공 1</span><span className="value">{edu.major1}</span></li>
                <li><span className="dot">·</span><span className="label">전공 2</span><span className="value">{edu.major2}</span></li>
                <li><span className="dot">·</span><span className="label">전공 3</span><span className="value">{edu.major3}</span></li>
                <li><span className="dot">·</span><span className="label">기간</span><span className="value highlight">{edu.period}</span></li>
                <li><span className="dot">·</span><span className="label">학점</span><span className="value highlight">{edu.grade}</span></li>
              </ul>
              <div
                className="edu-footer"
                onClick={(e) => openModal(edu, e)}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer' }}
              >
                <div className="edu-description">
                  <img className="edu-scroll-icon" src="/images/0/cluster 2/icon/Scroll.png" alt="" />
                  <p className="desc-text">{edu.description.substring(0, 80)}...</p>
                  <span className="arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
              {edu.isFinal && (
                <div className="final-badge">
                  <img className="final-star" src="/images/0/cluster 2/icon/trophy.png" alt="" />
                  <div className="final-label">
                    <span>FINAL</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="edu-pagination">
          {[0, 1].map((index) => (
            <button
              key={index}
              className={`pagination-dot ${currentPage === index ? 'active' : ''}`}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>
      </div>

      {/* 섹션 4 - Cluving Review */}
      <div className="cluster2-section4" style={{ position: 'relative' }}>
        {/* Edit Button */}
        <button
          className="section-edit-btn"
        >
          <i className="ti ti-pencil"></i>
        </button>
        {/* 왼쪽 - 명언 카드 3개 */}
        <div className="section4-left">
          <div
            className="quote-card-item card-1"
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltReset}
          >
            <img className="quote-bg" src="/images/0/cluster 2/명언 1-1.png" alt="" />
            <div className="quote-overlay">
              <div className="quote-author-badge">
                <div className="hex-wrapper">
                  <div className="hex-border">
                    <svg viewBox="0 0 89 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="2,39.5 23.25,2 65.75,2 87,39.5 65.75,77 23.25,77" stroke="#FFF" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <img src="/images/0/cluster 2/명언 1.png" alt="" />
                </div>
                <span>- 인디언 속담 -</span>
              </div>
              <p className="quote-text">"누구나 덮어놓고 '시작' 할 수 있지만, 목표한 바 대로 '마무리' 하는 것은 누구나 할 수 있는 것이 아니다."</p>
            </div>
          </div>
          <div
            className="quote-card-item card-2"
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltReset}
          >
            <img className="quote-bg" src="/images/0/cluster 2/명언 2-1.png" alt="" />
            <div className="quote-overlay">
              <div className="quote-author-badge">
                <div className="hex-wrapper">
                  <div className="hex-border">
                    <svg viewBox="0 0 89 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="2,39.5 23.25,2 65.75,2 87,39.5 65.75,77 23.25,77" stroke="#FFF" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <img src="/images/0/cluster 2/명언 2.png" alt="" />
                </div>
                <span>- 노자 -</span>
              </div>
              <p className="quote-text">"끝을 맺기를 처음과 같이 하면 실패가 없다"</p>
            </div>
          </div>
          <div
            className="quote-card-item card-3"
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltReset}
          >
            <img className="quote-bg" src="/images/0/cluster 2/명언 3-1.png" alt="" />
            <div className="quote-overlay">
              <div className="quote-author-badge">
                <div className="hex-wrapper">
                  <div className="hex-border">
                    <svg viewBox="0 0 89 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="2,39.5 23.25,2 65.75,2 87,39.5 65.75,77 23.25,77" stroke="#FFF" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <img src="/images/0/cluster 2/명언 3.png" alt="" />
                </div>
                <span>- 로빈 샤르마 -</span>
              </div>
              <p className="quote-text">"강하게 시작하는 건 좋지만, 강하게 마무리하는 건 정말 대단해요"</p>
            </div>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="section4-right">
          {/* Total Complete 큰 박스 */}
          <div className="total-complete-box">
            <img className="border-tl" src="/images/0/cluster 2/border.png" alt="" />
            <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
            <img className="victory-badge" src="/images/0/cluster 2/icon/medal 30.png" alt="" />
            <div className="complete-text">
              <span className="complete-label">Cluving Review -</span>
              <h2><span className="highlight">T</span>otal <span className="highlight">C</span>omplete</h2>
              <button className="goto-btn">바로가기 &gt;</button>
            </div>
          </div>

          {/* 9개의 작은 박스 그리드 */}
          <div className="review-grid-9">
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 3.png" alt="" className="medal-icon flip-x" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">3 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 6.png" alt="" className="medal-icon flip-x" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">6 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 9.png" alt="" className="medal-icon flip-x" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">9 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 12.png" alt="" className="medal-icon" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">12 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 15.png" alt="" className="medal-icon" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">15 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 18.png" alt="" className="medal-icon" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">18 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 21.png" alt="" className="medal-icon flip-x" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">21 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 24.png" alt="" className="medal-icon" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">24 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
            <div className="review-week-item">
              <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img src="/images/0/cluster 2/icon/medal 27.png" alt="" className="medal-icon" />
              <span className="review-label">Cluving Review -</span>
              <span className="review-weeks">27 weeks</span>
              <button className="review-btn">바로가기 &gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* 자기소개서 섹션 */}
      <div
        className="cluster2-intro"
        style={{ position: 'relative' }}
        ref={introRef}
        onMouseMove={handleIntroMouseMove}
      >
        {/* 물결 파동 효과 */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="ripple-effect"
            style={{
              left: ripple.x,
              top: ripple.y
            }}
          />
        ))}
        {/* Edit Button */}
        <button className="section-edit-btn">
          <i className="ti ti-pencil"></i>
        </button>
        <div className="intro-bg">
          <img src="/images/0/cluster 2/bg05.png" alt="" />
        </div>
        <div className="intro-title-wrapper">
          <h2 className="intro-title-shadow">자기소개서</h2>
          <h2 className="intro-title">자기소개서</h2>
        </div>
        <p className="intro-sub">THIS IS MY LIFE</p>
        <div className="intro-cards">
          <div className="intro-row top-row">
            <div className="intro-card">
              <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
              <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
              <div className="card-header">
                <img src="/images/0/cluster 2/icon/01성장 과정.png" alt="" className="card-icon" />
                <div className="title-row">
                  <h4>성장 과정</h4>
                  <button className="card-arrow" data-tooltip="성장과정 자세히 보기">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
              <p>작은 선택과 경험들이 쌓여 지금의 나를 만든 과정이라는 믿음으로 걸어왔습...</p>
            </div>
            <div className="intro-card">
              <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
              <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
              <div className="card-header">
                <img src="/images/0/cluster 2/icon/02커리어 방향.png" alt="" className="card-icon" />
                <div className="title-row">
                  <h4>커리어 방향</h4>
                  <button className="card-arrow" data-tooltip="커리어 방향 자세히 보기">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
              <p>작은 선택과 경험들이 쌓여 지금의 나를 만든 과정이라는 믿음으로 걸어왔습...</p>
            </div>
            <div className="intro-card">
              <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
              <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
              <div className="card-header">
                <img src="/images/0/cluster 2/icon/03사회 경험.png" alt="" className="card-icon" />
                <div className="title-row">
                  <h4>사회 경험</h4>
                  <button className="card-arrow" data-tooltip="사회 경험 자세히 보기">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
              <p>작은 선택과 경험들이 쌓여 지금의 나를 만든 과정이라는 믿음으로 걸어왔습...</p>
            </div>
          </div>
          <div className="intro-row bottom-row">
            <div className="intro-card">
              <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
              <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
              <div className="card-header">
                <img src="/images/0/cluster 2/icon/04실무 스타일.png" alt="" className="card-icon" />
                <div className="title-row">
                  <h4>실무 스타일</h4>
                  <button className="card-arrow" data-tooltip="실무 스타일 자세히 보기">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
              <p>작은 선택과 경험들이 쌓여 지금의 나를 만든 과정이라는 믿음으로 걸어왔습...</p>
            </div>
            <div className="intro-card">
              <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
              <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
              <div className="card-header">
                <img src="/images/0/cluster 2/icon/05퍼스널 스토리.png" alt="" className="card-icon" />
                <div className="title-row">
                  <h4>퍼스널 스토리</h4>
                  <button className="card-arrow" data-tooltip="퍼스널 스토리 자세히 보기">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
              <p>작은 선택과 경험들이 쌓여 지금의 나를 만든 과정이라는 믿음으로 걸어왔습...</p>
            </div>
            <div className="intro-card">
              <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
              <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* 학력 상세 모달 */}
      {modalOpen && selectedEdu && (
        <div className="edu-modal-overlay" onClick={closeModal}>
          <div className="edu-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="modal-header">
              <img className="modal-border-tl" src="/images/0/cluster 2/border.png" alt="" />
              <img className="modal-border-br" src="/images/0/cluster 2/border.png" alt="" />
              <div className="modal-school-info">
                <span className="school-circle"></span>
                <h2>{selectedEdu.school}</h2>
                {selectedEdu.isFinal && <span className="final-tag">FINAL</span>}
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="info-item">
                  <span className="info-label">상태</span>
                  <span className="info-value">{selectedEdu.status}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">계열</span>
                  <span className="info-value">{selectedEdu.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">전공 1</span>
                  <span className="info-value">{selectedEdu.major1}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">전공 2</span>
                  <span className="info-value">{selectedEdu.major2}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">전공 3</span>
                  <span className="info-value">{selectedEdu.major3}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">기간</span>
                  <span className="info-value highlight">{selectedEdu.period}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">학점</span>
                  <span className="info-value highlight">{selectedEdu.grade}</span>
                </div>
              </div>
              <div className="modal-description">
                <img className="scroll-icon" src="/images/0/cluster 2/icon/Scroll.png" alt="" />
                <p>{selectedEdu.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cluster2Content;
