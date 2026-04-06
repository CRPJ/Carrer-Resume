"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Animations from "@/components/shared/Animations";

export default function ClusterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    let cachedLeft = 0;
    let cachedWidth = 0;
    let cachedTop = 0;
    let lastUpdateTime = 0;

    // footer를 사이드바가 덮지 않도록 top을 동적으로 조정
    const computeTop = (zoom: number, height: number) => {
      const defaultTop = getHeaderBottom();
      let top = defaultTop;

      const footer = document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const margin = 4;
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

      // ── Case 1: relative → fixed (처음 전환) ──
      if (!isFixed && shouldFix) {
        const height = Math.round(inner.getBoundingClientRect().height / zoom);
        const top = Math.round(computeTop(zoom, height));
        const left = Math.round(shellRect.left / zoom);
        const width = Math.round(shellRect.width / zoom);

        shell.style.width = `${width}px`;
        shell.style.height = `${height}px`;

        inner.style.position = 'fixed';
        inner.style.top = `${top}px`;
        inner.style.left = `${left}px`;
        inner.style.width = `${width}px`;
        inner.style.zIndex = '9999';

        cachedLeft = left;
        cachedWidth = width;
        cachedTop = top;
        isFixed = true;
        return;
      }

      // ── Case 2: fixed 유지 중 (스크롤) — top만 업데이트 ──
      if (isFixed && shouldFix) {
        const height = Math.round(inner.getBoundingClientRect().height / zoom);
        const newTop = Math.round(computeTop(zoom, height));
        const diff = Math.abs(newTop - cachedTop);

        // footer 근처 소폭 진동(1~9px)은 200ms 쓰로틀
        if (diff > 0 && diff < 10) {
          const now = Date.now();
          if (now - lastUpdateTime < 200) return;
        }

        // 5px 이상 차이만 반영
        if (diff >= 5) {
          inner.style.top = `${newTop}px`;
          cachedTop = newTop;
          lastUpdateTime = Date.now();
        }
        return;
      }

      // ── Case 3: fixed → relative (해제) ──
      if (isFixed && !shouldFix) {
        shell.style.width = '';
        shell.style.height = '';

        inner.style.position = 'relative';
        inner.style.top = '0';
        inner.style.left = '0';
        inner.style.width = '';
        inner.style.zIndex = '100';

        cachedLeft = 0;
        cachedWidth = 0;
        cachedTop = 0;
        isFixed = false;
      }
    };

    const handleScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(apply);
    };

    const handleResize = () => {
      isFixed = false;
      cachedLeft = 0;
      cachedWidth = 0;
      cachedTop = 0;

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
            {children}
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

        {/* 메인 콘텐츠 */}
        <div
          className="home-two-content-col"
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <ClusterTabs />
          <div className="home-two-content">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
