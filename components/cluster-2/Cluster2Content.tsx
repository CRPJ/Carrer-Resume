"use client";

import { useState } from "react";

const Cluster2Content = () => {
  const [currentPage, setCurrentPage] = useState(0);

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
      <div className="cluster2-top-frame">
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
          <button className="with-us-btn">
            <img src="/images/0/cluster 2/button box.png" alt="" />
            <span>Wiht us</span>
          </button>
        </div>
      </div>

      {/* 인용문 섹션 */}
      <div className="cluster2-quotes">
        <div className="quotes-bg-image">
          <img src="/images/0/cluster 2/bg00.png" alt="" />
        </div>
        <div className="quotes-cards">
          <div className="quote-card">
            <img className="diamond-icon" src="/images/0/cluster 2/icon/diamond.png" alt="" />
            <span className="quote-mark">"</span>
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
            <span className="quote-mark">"</span>
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
      <div className="cluster2-education">
        <div className="edu-bg-image">
          <img src="/images/0/cluster 2/bg04.png" alt="" />
        </div>
        <div className="edu-center-line">
          <img src="/images/0/cluster 2/section 03.png" alt="" />
        </div>
        <div className="edu-cards-wrapper" style={{ transform: `translateX(-${currentPage * 350}px)`, transition: 'transform 0.4s ease' }}>
          <div className="edu-card first">
            <img className="edu-border-tl" src="/images/0/cluster 2/border.png" alt="" />
            <img className="edu-border-br" src="/images/0/cluster 2/border.png" alt="" />
            <img className="edu-bg-icon" src="/images/0/cluster 2/icon/Success Plan.png" alt="" />
            <div className="edu-header">
              <h3 className="edu-school"><span className="school-circle"></span><span className="school-name">고려 대학교</span></h3>
            </div>
            <ul className="edu-details">
              <li><span className="dot">·</span><span className="label">상태</span><span className="value">재학</span></li>
              <li><span className="dot">·</span><span className="label">계열</span><span className="value">사회</span></li>
              <li><span className="dot">·</span><span className="label">전공 1</span><span className="value">콘텐츠전략학</span></li>
              <li><span className="dot">·</span><span className="label">전공 2</span><span className="value">디지털마케팅학</span></li>
              <li><span className="dot">·</span><span className="label">전공 3</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">기간</span><span className="value highlight">2025. 03 ~ 재학중</span></li>
              <li><span className="dot">·</span><span className="label">학점</span><span className="value highlight">3.8 / 4.5</span></li>
            </ul>
            <div className="edu-footer">
              <div className="edu-description">
                <img className="edu-scroll-icon" src="/images/0/cluster 2/icon/Scroll.png" alt="" />
                <p className="desc-text">나는 우리학교를 다니면서 너무너무너무너무 많은 것들을 배웠어요. 함께 한 친구들이 너무 고맙고 교수님들과 선배들에게 항상 감사하고 존경한다는 말을 하고 싶어요!</p>
                <span className="arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </div>
            </div>
            <div className="final-badge">
              <img className="final-star" src="/images/0/cluster 2/icon/trophy.png" alt="" />
              <div className="final-label">
                <span>FINAL</span>
              </div>
            </div>
          </div>

          <div className="edu-card">
            <img className="edu-border-tl" src="/images/0/cluster 2/border.png" alt="" />
            <img className="edu-border-br" src="/images/0/cluster 2/border.png" alt="" />
            <img className="edu-bg-icon" src="/images/0/cluster 2/icon/Success Plan.png" alt="" />
            <div className="edu-header">
              <h3 className="edu-school"><span className="school-circle"></span><span className="school-name">연세 대학교</span></h3>
            </div>
            <ul className="edu-details">
              <li><span className="dot">·</span><span className="label">상태</span><span className="value">졸업</span></li>
              <li><span className="dot">·</span><span className="label">계열</span><span className="value">예체능</span></li>
              <li><span className="dot">·</span><span className="label">전공 1</span><span className="value">미디어커뮤니케이션학과</span></li>
              <li><span className="dot">·</span><span className="label">전공 2</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">전공 3</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">기간</span><span className="value highlight">2021. 03 ~ 2025. 02</span></li>
              <li><span className="dot">·</span><span className="label">학점</span><span className="value highlight">4.0 / 4.3</span></li>
            </ul>
            <div className="edu-footer">
              <div className="edu-description">
                <img className="edu-scroll-icon" src="/images/0/cluster 2/icon/Scroll.png" alt="" />
                <p className="desc-text">나는 우리학교를 다니면서 너무너무너무너무 많은 것들을 배웠어요. 함께 한 친구들이 너무 고맙고 교수님들과 선배들에게 항상 감사하고 존경한다는 말을 하고 싶어요!</p>
                <span className="arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </div>
            </div>
          </div>

          <div className="edu-card">
            <img className="edu-border-tl" src="/images/0/cluster 2/border.png" alt="" />
            <img className="edu-border-br" src="/images/0/cluster 2/border.png" alt="" />
            <img className="edu-bg-icon" src="/images/0/cluster 2/icon/Success Plan.png" alt="" />
            <div className="edu-header">
              <h3 className="edu-school"><span className="school-circle"></span><span className="school-name">서울과학 고등학교</span></h3>
            </div>
            <ul className="edu-details">
              <li><span className="dot">·</span><span className="label">상태</span><span className="value">졸업</span></li>
              <li><span className="dot">·</span><span className="label">계열</span><span className="value">기타</span></li>
              <li><span className="dot">·</span><span className="label">전공 1</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">전공 2</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">전공 3</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">기간</span><span className="value highlight">2018. 03 ~ 2021. 02</span></li>
              <li><span className="dot">·</span><span className="label">학점</span><span className="value highlight">2등급 / 9등급</span></li>
            </ul>
            <div className="edu-footer">
              <div className="edu-description">
                <img className="edu-scroll-icon" src="/images/0/cluster 2/icon/Scroll.png" alt="" />
                <p className="desc-text">나는 우리학교를 다니면서 너무너무너무너무 많은 것들을 배웠어요. 함께 한 친구들이 너무 고맙고 교수님들과 선배들에게 항상 감사하고 존경한다는 말을 하고 싶어요!</p>
                <span className="arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </div>
            </div>
          </div>

          <div className="edu-card">
            <img className="edu-border-tl" src="/images/0/cluster 2/border.png" alt="" />
            <img className="edu-border-br" src="/images/0/cluster 2/border.png" alt="" />
            <img className="edu-bg-icon" src="/images/0/cluster 2/icon/Success Plan.png" alt="" />
            <div className="edu-header">
              <h3 className="edu-school"><span className="school-circle"></span><span className="school-name">용산 중학교</span></h3>
            </div>
            <ul className="edu-details">
              <li><span className="dot">·</span><span className="label">상태</span><span className="value">졸업</span></li>
              <li><span className="dot">·</span><span className="label">계열</span><span className="value">상경</span></li>
              <li><span className="dot">·</span><span className="label">전공 1</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">전공 2</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">전공 3</span><span className="value">-</span></li>
              <li><span className="dot">·</span><span className="label">기간</span><span className="value highlight">2015. 03 ~</span></li>
              <li><span className="dot">·</span><span className="label">학점</span><span className="value highlight">15%</span></li>
            </ul>
            <div className="edu-footer">
              <div className="edu-description">
                <img className="edu-scroll-icon" src="/images/0/cluster 2/icon/Scroll.png" alt="" />
                <p className="desc-text">나는 우리학교를 다니면서 너무너무너무너무 많은 것들을 배웠어요. 함께 한 친구들이 너무 고맙고 교수님들과 선배들에게 항상 감사하고 존경한다는 말을 하고 싶어요!</p>
                <span className="arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </div>
            </div>
          </div>
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
      <div className="cluster2-section4">
        {/* 왼쪽 - 명언 카드 3개 */}
        <div className="section4-left">
          <div className="quote-card-item card-1">
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
          <div className="quote-card-item card-2">
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
          <div className="quote-card-item card-3">
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
      <div className="cluster2-intro">
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
                  <button className="card-arrow">
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
                  <button className="card-arrow">
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
                  <button className="card-arrow">
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
                  <button className="card-arrow">
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
                  <button className="card-arrow">
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
    </div>
  );
};

export default Cluster2Content;
