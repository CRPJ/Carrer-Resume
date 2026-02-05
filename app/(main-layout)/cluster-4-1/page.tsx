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
      setIsMobile(window.innerWidth < 1200);
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
        const height = inner.getBoundingClientRect().height / zoom;
        const left = shellRect.left / zoom;
        const defaultTop = headerTopPx / zoom;

        // footer가 올라오면 사이드바가 footer를 덮지 않게 위로 밀어올림
        let top = defaultTop;
        const footer = document.querySelector("footer");
        if (footer) {
          const footerTop = footer.getBoundingClientRect().top / zoom;
          const margin = 44 / zoom;
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
        const defaultTop = headerTopPx / zoomNow;

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
