"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";

// 반짝이 효과 CSS
const sparkleStyles = `
  @keyframes sparkle {
    0% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0); }
  }
  .sparkle {
    position: absolute;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, #fff 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: sparkle 0.6s ease-out forwards;
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .shimmer-text {
    background: linear-gradient(
      90deg,
      #f5f5f5 0%,
      #f5f5f5 40%,
      #ffe066 50%,
      #f5f5f5 60%,
      #f5f5f5 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
    text-shadow:
      1px 1px 0 rgba(0,0,0,0.3),
      -1px -1px 0 rgba(0,0,0,0.2),
      2px 0 0 rgba(0,0,0,0.1),
      0 -2px 0 rgba(0,0,0,0.15);
  }
`;

const Cluster8Page = () => {
  // 사이드바 고정 너비
  const sidebarWidth = '474px';
  const containerRef = useRef<HTMLDivElement>(null);

  // 마우스 움직일 때 반짝이 생성
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // 20% 확률로 반짝이 생성 (너무 많으면 지저분해짐)
    if (Math.random() > 0.2) return;

    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';

    const rect = containerRef.current.getBoundingClientRect();
    sparkle.style.left = `${e.clientX - rect.left - 10}px`;
    sparkle.style.top = `${e.clientY - rect.top - 10}px`;

    containerRef.current.appendChild(sparkle);

    // 애니메이션 끝나면 제거
    setTimeout(() => sparkle.remove(), 600);
  };

  const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: '110px',
    top: '125px',
    overflowY: 'hidden',
    zIndex: 100,
    width: sidebarWidth,
    height: '810px',
    transform: 'scale(1)',
    transformOrigin: 'top left',
  });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (footerRect.top < windowHeight) {
        const moveUp = windowHeight - footerRect.top;
        setSidebarStyle({
          position: 'fixed',
          left: '110px',
          top: `${125 - moveUp}px`,
          overflowY: 'hidden',
          zIndex: 100,
          width: sidebarWidth,
          height: '810px',
          transform: 'scale(1)',
          transformOrigin: 'top left',
        });
      } else {
        setSidebarStyle({
          position: 'fixed',
          left: '110px',
          top: '125px',
          overflowY: 'hidden',
          zIndex: 100,
          width: sidebarWidth,
          height: '810px',
          transform: 'scale(1)',
          transformOrigin: 'top left',
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main ref={mainRef} className="nftg-content nftg-content-home">
      {/* 고정 사이드바 */}
      <div style={sidebarStyle}>
        <Sidebar />
      </div>
      {/* 메인 콘텐츠 */}
      <div className="container-fluid">
        <div className="row">
          {/* 사이드바 공간 확보용 빈 영역 */}
          <div style={{ width: sidebarWidth, flexShrink: 0 }}></div>
          <div className="home-two-content-col">
            <ClusterTabs />
            {/* 공사중 콘텐츠 */}
            <style>{sparkleStyles}</style>
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 200px)',
                width: '100%',
                overflow: 'hidden',
              }}
            >
              {/* 배경 이미지 (50% 투명도) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'url(/images/0/공사중.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: 0.5,
                  zIndex: 0,
                }}
              />
              {/* 텍스트 (100% 선명) */}
              <p
                className="shimmer-text"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                  fontSize: '48px',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: 'Cafe24Ohsquare, sans-serif',
                  filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8)) drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.9))',
                  lineHeight: '1.5',
                  whiteSpace: 'nowrap',
                }}
              >
                페이지 공사중 !
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster8Page;
