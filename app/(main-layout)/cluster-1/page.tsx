"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster1Content from "@/components/cluster-1/Cluster1Content";
import Animations from "@/components/shared/Animations";

const Cluster1Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarShellRef = useRef<HTMLDivElement>(null);
  const sidebarInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(false);
  }, []);

  // JavaScript 기반 sticky 구현 (CSS zoom과 호환)
  useEffect(() => {
    if (isMobile || !sidebarShellRef.current || !sidebarInnerRef.current) return;

    const shell = sidebarShellRef.current;
    const inner = sidebarInnerRef.current;
    const getHeaderBottom = () => {
      const header = document.querySelector('header');
      if (header) return header.getBoundingClientRect().bottom;
      return 57;
  };

    let rafId: number | null = null;
    let isFixed = false;

    // footer를 사이드바가 덮지 않도록 top을 동적으로 조정
    const computeTop = (zoom: number, height: number) => {
      const defaultTop = getHeaderBottom();
      let top = defaultTop;

      const footer = document.querySelector("footer");
      if (footer) {
          const footerTop = footer.getBoundingClientRect().top;
          const margin = 68;
          const maxTop = Math.floor(footerTop - height - margin);
          // footer에 밀려도 header 아래로는 유지
          top = Math.max(Math.min(defaultTop, maxTop), defaultTop);
      }

      return top;
  };

    const apply = () => {
      rafId = null;
      // 고줌 모드: sticky 비활성화 (CSS가 레이아웃 제어)
      if (document.documentElement.classList.contains('high-zoom')) {
        if (isFixed) {
          shell.style.width = '';
          shell.style.height = '';
          inner.style.position = 'relative';
          inner.style.top = '0';
          inner.style.left = '0';
          inner.style.width = '';
          inner.style.zIndex = '100';
          isFixed = false;
        }
        return;
      }


      const zoom = 1;
      const shellRect = shell.getBoundingClientRect();
      const headerBottom = getHeaderBottom();
      const shouldFix = shellRect.top <= headerBottom;

      if (!isFixed && shouldFix) {
        const width = shell.offsetWidth;
        const height = inner.getBoundingClientRect().height;

        const left = shellRect.left;
        const top = computeTop(zoom, height);

        shell.style.width = `${width}px`;
        shell.style.height = `${inner.offsetHeight}px`;

        inner.style.position = "fixed";
        inner.style.top = `${top}px`;
        inner.style.left = `${left}px`;
        inner.style.width = `${width}px`;
        inner.style.zIndex = "9999";

        isFixed = true;
        return;
      }

      // 고정 상태 유지 중에도 footer 등장/사라짐에 따라 top을 갱신
      if (isFixed && shouldFix) {
        const height = inner.getBoundingClientRect().height;
        const top = computeTop(zoom, height);
        inner.style.top = `${top}px`;
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
