"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster2Content from "@/components/cluster-2/Cluster2Content";
import Animations from "@/components/shared/Animations";

const Cluster2Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  // 콘텐츠 영역 추가 너비 계산(데스크톱 전용이지만 Hook은 항상 선언되어야 함)
  const [contentExtraWidth, setContentExtraWidth] = useState(0);
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

  useEffect(() => {
    // 모바일에서는 데스크톱 보정값을 사용하지 않음
    if (isMobile) {
      setContentExtraWidth(0);
      return;
    }

    const calculateContentWidth = () => {
      const cssZoom = parseFloat(document.documentElement.style.zoom) || 1;
      const maxZoom = 1.5;
      const windowWidth = window.innerWidth;

      // zoom이 maxZoom으로 제한되었을 때, 남은 여백 계산
      if (cssZoom >= maxZoom) {
        // 현재 보이는 콘텐츠 너비 (zoom 적용 후)
        const visibleWidth = windowWidth / cssZoom;
        // 기본 콘텐츠 너비 (1977px 기준에서 프로필 제외)
        const baseContentWidth = 1977 - 520; // 약 1457px
        void baseContentWidth; // lint: 문서화 용도(추후 계산 확장 대비)
        // 추가로 필요한 너비
        const extraWidth = visibleWidth - 1977;

        if (extraWidth > 0) {
          setContentExtraWidth(extraWidth);
        } else {
          setContentExtraWidth(0);
        }
      } else {
        setContentExtraWidth(0);
      }
    };

    calculateContentWidth();
    window.addEventListener('resize', calculateContentWidth);

    const timer = setTimeout(calculateContentWidth, 100);

    return () => {
      window.removeEventListener('resize', calculateContentWidth);
      clearTimeout(timer);
    };
  }, [isMobile]);

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
        // 추가 너비만큼 컨테이너 확장
        width: contentExtraWidth > 0 ? `calc(100% + ${contentExtraWidth}px)` : '100%',
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