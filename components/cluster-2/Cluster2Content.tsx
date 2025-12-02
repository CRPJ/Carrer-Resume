"use client";

const Cluster2Content = () => {
  return (
    <div className="cluster2-content">
      {/* PROFILE 헤더 */}
      <h1 className="cluster2-title">PROFILE</h1>

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
            <img src="/images/0/cluster 1/Sheriff Badge1.png" alt="" />
          </div>
          <span className="progress-label">Oh, MY DREAM</span>
          <span className="progress-value">99.9%</span>
          <button className="with-us-btn">With us</button>
        </div>
      </div>

      {/* 인용문 섹션 */}
      <div className="cluster2-quotes">
        <div className="quote-card">
          <div className="quote-left">
            <span className="quote-mark">"</span>
            <div className="quote-body">
              <span className="quote-badge">My Resume Ad Active</span>
              <p className="quote-text">
                저같은 팀 잡음이 적상 보여도 '걷다' 라는 터치를 바꾸는 걸<br/>
                멈추 않아 왔다 드물더도 별초지 않으면 '걷다' 조적말<br/>
                다 그게 성장의 즐거나
              </p>
              <div className="quote-author">
                <img src="/images/0/cluster 1/001.png" alt="" />
                <span>Hwang Yeongwoong</span>
              </div>
            </div>
          </div>
          <div className="quote-image">
            <img src="/images/0/cluster 1/bg image/01.png" alt="" />
          </div>
        </div>

        <div className="quote-card">
          <div className="quote-left">
            <span className="quote-mark">"</span>
            <div className="quote-body">
              <span className="quote-badge">My Resume Ad Active</span>
              <p className="quote-text">
                먼저 종가지 먹자 '건장 전 큰 반'에는 반발감 흥분이라<br/>
                승건에는 말하지 않으면 바람나 스스로가 '팀' 향해야<br/>
                다 라는 방법이다.
              </p>
              <div className="quote-author">
                <img src="/images/0/cluster 1/001.png" alt="" />
                <span>Hwang Yeongwoong</span>
              </div>
            </div>
          </div>
          <div className="quote-image">
            <img src="/images/0/cluster 1/bg image/02.png" alt="" />
          </div>
        </div>
      </div>

      {/* 학력 섹션 */}
      <div className="cluster2-education">
        <div className="edu-card">
          <div className="edu-header">
            <i className="ti ti-building"></i>
            <span>ㅇㅇ 대학교</span>
          </div>
          <div className="edu-period">2026. 03 ~</div>
          <ul className="edu-details">
            <li><i className="ti ti-check"></i> ㅇㅇ 학과 입학예정</li>
          </ul>
          <div className="edu-bg">
            <img src="/images/0/cluster 1/bg image/03.png" alt="" />
          </div>
        </div>

        <div className="edu-card">
          <div className="edu-header">
            <i className="ti ti-building"></i>
            <span>ㅁㅁ대 대학교</span>
          </div>
          <div className="edu-period">2021.03 ~ 2025. 02</div>
          <ul className="edu-details">
            <li><i className="ti ti-check"></i> 4년제</li>
          </ul>
          <div className="edu-bg">
            <img src="/images/0/cluster 1/bg image/04.png" alt="" />
          </div>
        </div>

        <div className="edu-card">
          <div className="edu-header">
            <i className="ti ti-school"></i>
            <span>ㅇㅇ과학 고등학교</span>
          </div>
          <div className="edu-period">2018. 3 ~ 2021. 02</div>
          <ul className="edu-details">
            <li><i className="ti ti-check"></i> 일반고등학교</li>
          </ul>
          <div className="edu-bg">
            <img src="/images/0/cluster 1/bg image/01.png" alt="" />
          </div>
        </div>

        <div className="edu-card">
          <div className="edu-header">
            <i className="ti ti-school"></i>
            <span>ㅇㅇ 중학교</span>
          </div>
          <div className="edu-period">2015. 3 ~ 2018. 02</div>
          <ul className="edu-details">
            <li><i className="ti ti-check"></i> 일반중학교</li>
          </ul>
          <div className="edu-bg">
            <img src="/images/0/cluster 1/bg image/02.png" alt="" />
          </div>
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <div className="cluster2-review">
        <div className="review-left">
          <div className="review-main">
            <div className="review-avatar">
              <img src="/images/0/cluster 1/002.png" alt="" />
            </div>
            <span className="review-date">2025.05.01</span>
          </div>
          <div className="review-quotes-list">
            <div className="review-quote-item">
              <p>"누구나 말하버려도,' 시작' 할 수 있지만, 목표한 분 대로 '마무리' 하는 건 온 누구나 할 수 있는 것이 아니다."</p>
            </div>
            <div className="review-quote-item">
              <p>"실을 짜기를 처음과 같이 하면 실패가 없다."</p>
            </div>
            <div className="review-quote-item">
              <p>"강하게 시작하는 건 쉽지만, 강하게 마무리하는 건 정말 대단해요."</p>
            </div>
          </div>
        </div>

        <div className="review-right">
          <div className="total-complete">
            <img src="/images/0/cluster 1/Sheriff Badge1 2.png" alt="" className="complete-badge" />
            <div className="complete-info">
              <span className="complete-label">Closing Review</span>
              <h3>Total Complete</h3>
              <button>바로가기 &gt;</button>
            </div>
          </div>
          <div className="review-grid">
            <div className="review-item">
              <img src="/images/0/cluster 1/bg image/01.png" alt="" />
              <div className="review-tags">
                <span className="tag yellow">Closing Review</span>
                <span className="tag gray">Closing Review</span>
                <span className="tag green">2 weeks</span>
                <span className="tag pink">8 weeks</span>
              </div>
            </div>
            <div className="review-item">
              <img src="/images/0/cluster 1/bg image/02.png" alt="" />
              <div className="review-tags">
                <span className="tag yellow">Closing Review</span>
                <span className="tag gray">Closing Review</span>
                <span className="tag green">12 weeks</span>
                <span className="tag pink">16 weeks</span>
              </div>
            </div>
            <div className="review-item">
              <img src="/images/0/cluster 1/bg image/03.png" alt="" />
              <div className="review-tags">
                <span className="tag yellow">Closing Review</span>
                <span className="tag gray">Closing Review</span>
                <span className="tag green">21 weeks</span>
                <span className="tag pink">24 weeks</span>
              </div>
            </div>
            <div className="review-item">
              <img src="/images/0/cluster 1/bg image/04.png" alt="" />
              <div className="review-tags">
                <span className="tag yellow">Closing Review</span>
                <span className="tag gray">Closing Review</span>
                <span className="tag green">27 weeks</span>
                <span className="tag pink">27 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 자기소개서 섹션 */}
      <div className="cluster2-intro">
        <h2>자기소개서</h2>
        <p className="intro-sub">THIS IS MY LIFE.</p>
        <div className="intro-cards">
          <div className="intro-card orange">
            <h4>성장 과정</h4>
            <p>기업과의 연결고리를 발견하고, 과거경험이 자신의 역량으로 성장하게 된 계기를 어필</p>
          </div>
          <div className="intro-card yellow">
            <h4>지원동기 및 포부</h4>
            <p>산업에 대한 전문지식과 이해를 바탕으로, 해당 직무나 회사가 나의 목표와 부합한다는 것을 어필</p>
          </div>
          <div className="intro-card green">
            <h4>사회 경험</h4>
            <p>다양한 대외활동, 수상경력을 바탕으로 커리어에서 지키고싶은 원칙이나 신념을 어필</p>
          </div>
          <div className="intro-card blue">
            <h4>실무 스타일</h4>
            <p>산업에 맞게 정량적인 활동 분석 적성과 흥미를 기반으로 나만의 경쟁력을 어필</p>
          </div>
          <div className="intro-card purple">
            <h4>프로젝트 스토리</h4>
            <p>완료/진행한 프로젝트의 히스토리를 정리하여 실제업무 적용 가능성을 어필</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cluster2Content;
