"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster4Content from "@/components/cluster-4/Cluster4Content";
import Animations from "@/components/shared/Animations";

const Cluster41Page = () => {
  const mainRef = useRef<HTMLElement>(null);
  const sidebarShellRef = useRef<HTMLDivElement>(null);
  const sidebarInnerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.outerWidth < 1200);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // JavaScript 기반 sticky 구현 (cluster-4와 동일 정책 + footer 충돌 방지)
  useEffect(() => {
    if (isMobile || !sidebarShellRef.current || !sidebarInnerRef.current) return;

    const shell = sidebarShellRef.current;
    const inner = sidebarInnerRef.current;
    const getHeaderBottom = () => {
    const header = document.querySelector('header');
    if (header) return header.getBoundingClientRect().bottom;
    return 71;
};
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
    const viewportHeight = window.innerHeight / zoom;
    const minTop = viewportHeight - height - (2 / zoom);
    top = Math.max(top, minTop);
    return top;
};

    let rafId: number | null = null;
    let isFixed = false;

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
        const defaultTop = getHeaderBottom() / zoom;

        // footer가 올라오면 사이드바가 footer를 덮지 않게 위로 밀어올림
        let top = defaultTop;
        const footer = document.querySelector("footer");
        if (footer) {
          const footerTop = footer.getBoundingClientRect().top / zoom;
          const margin = 2 / zoom;
          const maxTop = footerTop - height - margin;
          top = Math.min(defaultTop, maxTop);
        }

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

      if (isFixed && shouldFix) {
        const zoomNow = parseFloat(document.documentElement.style.zoom) || 1;
        const height = inner.getBoundingClientRect().height / zoomNow;
        const defaultTop = getHeaderBottom() / zoomNow;

        let top = defaultTop;
        const footer = document.querySelector("footer");
        if (footer) {
          const footerTop = footer.getBoundingClientRect().top / zoomNow;
          const margin = 44 / zoomNow;
          const maxTop = footerTop - height - margin;
          top = Math.min(defaultTop, maxTop);
        }

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
            <Cluster4Content />
          </div>
        </div>
      </main>
    );
  }

  // 데스크톱 레이아웃
  return (
    <main ref={mainRef} className="nftg-content nftg-content-home">
      <Animations />

      <div
        className="desktop-layout"
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        {/* 사이드바 - cluster-4와 동일하게 "레이아웃 폭"을 점유해서 콘텐츠 침범 방지 */}
        <div ref={sidebarShellRef} className="sidebar-sticky-wrapper" style={{ flexShrink: 0, zIndex: 100 }}>
          <div ref={sidebarInnerRef} style={{ position: "relative", zIndex: 100 }}>
            <Sidebar />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="home-two-content-col" style={{ flex: 1, minWidth: 0 }}>
          <ClusterTabs />
          <div className="home-two-content">
            <Cluster4Content />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster41Page;