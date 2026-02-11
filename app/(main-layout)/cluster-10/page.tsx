"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Animations from "@/components/shared/Animations";
import ResponsiveScale from "@/components/shared/ResponsiveScale";

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

const Cluster10Page = () => {
  // 사이드바 고정 너비
  const sidebarWidth = '474px';
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarShellRef = useRef<HTMLDivElement>(null);
  const sidebarInnerRef = useRef<HTMLDivElement>(null);

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
    if (!sidebarShellRef.current || !sidebarInnerRef.current) return;

    const shell = sidebarShellRef.current;
    const inner = sidebarInnerRef.current;

    const getHeaderBottom = () => {
      const header = document.querySelector('header');
      if (header) return header.getBoundingClientRect().bottom;
      return 71;
    };

    let rafId: number | null = null;
    let isFixed = false;

    const computeTop = (zoom: number, height: number) => {
      const defaultTop = getHeaderBottom() / zoom;
      let top = defaultTop;
  
      const footer = document.querySelector("footer");
      if (footer) {
          const footerTop = footer.getBoundingClientRect().top / zoom;
          const margin = 2 / zoom;
          const maxTop = footerTop - height - margin;
          top = Math.min(defaultTop, maxTop);
      }
  
      return top;
  };

    const apply = () => {
      rafId = null;
      const zoom = parseFloat(document.documentElement.style.zoom) || 1;
      const shellRect = shell.getBoundingClientRect();
      const headerBottom = getHeaderBottom();
      const shouldFix = shellRect.top <= headerBottom;

      if (!isFixed && shouldFix) {
        const width = shell.offsetWidth;
        const height = inner.getBoundingClientRect().height / zoom;
        const left = shellRect.left / zoom;
        const top = computeTop(zoom, height);

        shell.style.width = `${width}px`;
        shell.style.height = `${inner.offsetHeight}px`;
        inner.style.position = 'fixed';
        inner.style.top = `${top}px`;
        inner.style.left = `${left}px`;
        inner.style.width = `${width}px`;
        inner.style.zIndex = '9999';
        isFixed = true;
        return;
      }

      if (isFixed && shouldFix) {
        const height = inner.getBoundingClientRect().height / zoom;
        const top = computeTop(zoom, height);
        inner.style.top = `${top}px`;
        return;
      }

      if (isFixed && !shouldFix) {
        shell.style.width = '';
        shell.style.height = '';
        inner.style.position = 'relative';
        inner.style.top = '0';
        inner.style.left = '0';
        inner.style.width = '';
        inner.style.zIndex = '100';
        isFixed = false;
      }
    };

    const handleScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(apply);
    };

    const handleResize = () => {
      isFixed = false;
      shell.style.width = '';
      shell.style.height = '';
      inner.style.position = 'relative';
      inner.style.top = '0';
      inner.style.left = '0';
      inner.style.width = '';
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(apply);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    rafId = window.requestAnimationFrame(apply);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <main ref={mainRef} className="nftg-content nftg-content-home">
      <Animations />
      <ResponsiveScale />
      {/* 고정 사이드바 */}
      <div className="desktop-layout" style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
          position: 'relative',
      }}>
          <div ref={sidebarShellRef} className="sidebar-sticky-wrapper" style={{ flexShrink: 0, zIndex: 100 }}>
            <div ref={sidebarInnerRef} style={{ position: 'relative', zIndex: 100 }}>
              <Sidebar />
            </div>
          </div>
          <div className="home-two-content-col" style={{ flex: 1, minWidth: 0 }}>
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
                minHeight: '810px',
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
    </main>
  );
};

export default Cluster10Page;
