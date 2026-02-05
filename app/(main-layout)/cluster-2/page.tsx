"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster2Content from "@/components/cluster-2/Cluster2Content";
import Animations from "@/components/shared/Animations";

const Cluster2Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarShellRef = useRef<HTMLDivElement>(null);
  const sidebarInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // JavaScript 기반 sticky 구현 (CSS zoom과 호환)
  useEffect(() => {
    if (isMobile || !sidebarShellRef.current || !sidebarInnerRef.current) return;

    const shell = sidebarShellRef.current;
    const inner = sidebarInnerRef.current;
    const headerTopPx = 100;

    let rafId: number | null = null;
    let isFixed = false;

    const apply = () => {
      rafId = null;

      // ★ zoom 값 가져오기
      const zoom = parseFloat(document.documentElement.style.zoom) || 1;
      
      const shellRect = shell.getBoundingClientRect();
      const shouldFix = shellRect.top <= headerTopPx;

      // 고정 진입
      if (!isFixed && shouldFix) {
        const width = shell.offsetWidth;
        const height = inner.offsetHeight;
        
        // ★ zoom 보정: fixed 요소의 left는 zoom으로 나눠줘야 함
        const left = shellRect.left / zoom;
        const top = headerTopPx / zoom;

        shell.style.width = `${width}px`;
        shell.style.height = `${height}px`;

        inner.style.position = 'fixed';
        inner.style.top = `${top}px`;
        inner.style.left = `${left}px`;
        inner.style.width = `${width}px`;
        inner.style.zIndex = '9999';

        isFixed = true;
        return;
      }

      // 고정 해제
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
      // 리사이즈 시 초기화
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
    
    // 초기 실행
    rafId = window.requestAnimationFrame(apply);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <main ref={mainRef} className="nftg-content nftg-content-home mobile-layout">
        <Animations />
        
        <div className="mobile-container">
          <div className="mobile-sidebar-section">
            <Sidebar />
          </div>
          
          <div className="mobile-tabs-section">
            <ClusterTabs />
          </div>
          
          <div className="mobile-content-section">
            <Cluster2Content />
          </div>
        </div>
      </main>
    );
  }

  // 데스크탑 레이아웃
  return (
    <main ref={mainRef} className="nftg-content nftg-content-home">
      <Animations />
      
      <div className="desktop-layout" style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        position: 'relative',
      }}>
        {/* 사이드바 */}
        <div
          ref={sidebarShellRef}
          className="sidebar-sticky-wrapper"
          style={{ flexShrink: 0, zIndex: 100 }}
        >
          <div ref={sidebarInnerRef} style={{ position: 'relative', zIndex: 100 }}>
            <Sidebar />
          </div>
        </div>
        
        {/* 메인 콘텐츠 - flex: 1로 남은 공간 모두 차지 */}
        <div 
          className="home-two-content-col" 
          style={{ 
            flex: 1,
            minWidth: 0,
          }}
        >
          <ClusterTabs />
          <div className="home-two-content">
            <Cluster2Content />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster2Page;