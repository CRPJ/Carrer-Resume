"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster1Content from "@/components/cluster-1/Cluster1Content";
import Animations from "@/components/shared/Animations";

const Cluster1Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarTop, setSidebarTop] = useState(124);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 화면 크기 체크
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    // 스크롤 핸들러 (데스크탑에서만 작동)
    const handleScroll = () => {
      if (isMobile) return;
      
      const footer = document.querySelector('footer');
      if (!footer) {
        setSidebarTop(124);
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (footerRect.top < windowHeight) {
        const moveUp = windowHeight - footerRect.top;
        setSidebarTop(124 - moveUp);
      } else {
        setSidebarTop(124);
      }
    };

    // 초기 실행
    checkMobile();
    handleScroll();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <main ref={mainRef} className="nftg-content nftg-content-home mobile-layout">
        <Animations />
        
        {/* 모바일: 세로 배치 */}
        <div className="mobile-container">
          {/* 1. 프로필 카드 (상단) */}
          <div className="mobile-sidebar-section">
            <Sidebar />
          </div>
          
          {/* 2. 클러스터 탭 */}
          <div className="mobile-tabs-section">
            <ClusterTabs />
          </div>
          
          {/* 3. 메인 콘텐츠 */}
          <div className="mobile-content-section">
            <Cluster1Content />
          </div>
        </div>
      </main>
    );
  }

  // 데스크탑 레이아웃 (기존)
  return (
    <main ref={mainRef} className="nftg-content nftg-content-home">
      <Animations />
      {/* 고정 사이드바 */}
      <div 
        style={{
          position: 'fixed',
          left: '110px',
          top: `${sidebarTop}px`,
          overflow: 'visible',
          zIndex: 100,
        }}
      >
        <Sidebar />
      </div>
      {/* 메인 콘텐츠 */}
      <div className="container-fluid">
        <div className="row">
          {/* 사이드바 공간 확보용 빈 영역 */}
          <div style={{ width: 'var(--sidebar-width, 520px)', flexShrink: 0 }}></div>
          <div className="home-two-content-col">
            <ClusterTabs />
            <div className="home-two-content">
              <Cluster1Content />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster1Page;
