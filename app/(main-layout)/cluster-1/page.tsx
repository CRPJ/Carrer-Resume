"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster1Content from "@/components/cluster-1/Cluster1Content";
import Animations from "@/components/shared/Animations";

const Cluster1Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  // 콘텐츠 영역 추가 너비 계산(데스크톱 zoom 상한에서 남는 여백 흡수)
  const [contentExtraWidth, setContentExtraWidth] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarShellRef = useRef<HTMLDivElement>(null);
  const sidebarInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 화면 크기 체크
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    // 초기 실행
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
        const visibleWidth = windowWidth / cssZoom;
        const extraWidth = visibleWidth - 1977;
        setContentExtraWidth(extraWidth > 0 ? extraWidth : 0);
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

      const zoom = parseFloat(document.documentElement.style.zoom) || 1;
      const shellRect = shell.getBoundingClientRect();
      const shouldFix = shellRect.top <= headerTopPx;

      if (!isFixed && shouldFix) {
        const width = shell.offsetWidth;
        const height = inner.offsetHeight;

        // zoom 보정: fixed 요소의 left/top은 zoom으로 나눠줘야 함
        const left = shellRect.left / zoom;
        const top = headerTopPx / zoom;

        shell.style.width = `${width}px`;
        shell.style.height = `${height}px`;

        inner.style.position = "fixed";
        inner.style.top = `${top}px`;
        inner.style.left = `${left}px`;
        inner.style.width = `${width}px`;
        inner.style.zIndex = "9999";

        isFixed = true;
        return;
      }

      if (isFixed && !shouldFix) {
        shell.style.width = "";
        shell.style.height = "";

        inner.style.position = "relative";
        inner.style.top = "0";
        inner.style.left = "0";
        inner.style.width = "";
        inner.style.zIndex = "100";

        isFixed = false;
      }
    };

    const handleScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(apply);
    };

    const handleResize = () => {
      isFixed = false;
      shell.style.width = "";
      shell.style.height = "";
      inner.style.position = "relative";
      inner.style.top = "0";
      inner.style.left = "0";
      inner.style.width = "";

      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    rafId = window.requestAnimationFrame(apply);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafId != null) window.cancelAnimationFrame(rafId);
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

  // 데스크탑 레이아웃 - JavaScript로 sticky 동작 구현
  return (
    <main ref={mainRef} className="nftg-content nftg-content-home">
      <Animations />
      
      <div className="desktop-layout" style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        position: 'relative',
        // zoom 상한(예: 4K)에서 남는 영역까지 컨테이너를 자연스럽게 확장
        width: contentExtraWidth > 0 ? `calc(100% + ${contentExtraWidth}px)` : '100%',
      }}>
        {/* 사이드바 - JS로 스크롤 따라오기 */}
        <div
          ref={sidebarShellRef}
          className="sidebar-sticky-wrapper"
          style={{ flexShrink: 0, zIndex: 100 }}
        >
          <div ref={sidebarInnerRef} style={{ position: 'relative', zIndex: 100 }}>
            <Sidebar />
          </div>
        </div>
        
        {/* 메인 콘텐츠 */}
        <div className="home-two-content-col" style={{ flex: 1, minWidth: 0 }}>
          <ClusterTabs />
          <div className="home-two-content">
            <Cluster1Content />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster1Page;
