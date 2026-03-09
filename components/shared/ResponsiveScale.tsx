"use client";

import { useEffect } from 'react';

const ResponsiveScale = () => {
  useEffect(() => {
    const BASE_WIDTH = 1977;
    const MAX_ZOOM = 2.0;
    const MOBILE_BREAKPOINT = 1200;

    const updateHeaderDividerY = () => {
      const header = document.querySelector('.header') as HTMLElement | null;
      if (!header) {
        document.documentElement.style.removeProperty('--header-divider-y');
        return;
      }
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty('--header-divider-y', `${headerHeight}px`);
    };

    const updateDesktopClasses = (width: number) => {
      if (width >= 1200 && width < 1400) {
        document.documentElement.classList.add('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
      } else if (width >= 1400 && width < 1700) {
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.add('mid-desktop');
      } else {
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
      }
    };

    const mountScreenWidth = window.screen.availWidth;

    const getReliableWidth = () => {
      return Math.min(window.outerWidth, mountScreenWidth);
    };

    let naturalBodyWidth = 0;

    const applyScale = () => {
      const w = getReliableWidth();

      if (w < MOBILE_BREAKPOINT) {
        document.documentElement.style.zoom = '1';
        document.documentElement.style.setProperty('--app-zoom', '1');
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
        document.body.style.minWidth = '';
        requestAnimationFrame(() => updateHeaderDividerY());
        return;
      }

      const baseScale = Math.min(w / BASE_WIDTH, MAX_ZOOM);
      const browserZoom = w / window.innerWidth;

      // ★ 150% 초과 확대 차단: CSS zoom을 줄여서 브라우저 확대를 상쇄
      const MAX_BROWSER_ZOOM = 1.5;
      let scale = baseScale;
      if (browserZoom > MAX_BROWSER_ZOOM) {
        scale = (baseScale * MAX_BROWSER_ZOOM) / browserZoom;
      }

      document.documentElement.style.zoom = String(scale);
      document.documentElement.style.setProperty('--app-zoom', String(scale));

      if (browserZoom < 1.05) {
        // 100% 줌 → 정상 상태
        naturalBodyWidth = Math.round(window.innerWidth / baseScale);
        document.body.style.minWidth = '';
        document.documentElement.style.overflowX = 'hidden';
      } else {
        // 확대 중 (최대 150%까지) → 레이아웃 고정 + 스크롤바
        if (naturalBodyWidth > 0) {
          document.body.style.minWidth = `${naturalBodyWidth}px`;
        }
        document.documentElement.style.overflowX = 'auto';
      }

      updateDesktopClasses(w);
      requestAnimationFrame(() => updateHeaderDividerY());
    };

    applyScale();
    window.addEventListener('load', applyScale);
    window.addEventListener('resize', applyScale);

    const pollInterval = window.setInterval(applyScale, 500);

    const dprMedia = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    const onDPRChange = () => {
      setTimeout(applyScale, 150);
    };
    dprMedia.addEventListener('change', onDPRChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('load', applyScale);
      window.removeEventListener('resize', applyScale);
      dprMedia.removeEventListener('change', onDPRChange);
      document.documentElement.style.zoom = '';
      document.documentElement.style.removeProperty('--app-zoom');
      document.documentElement.style.removeProperty('--header-divider-y');
      document.documentElement.style.overflowX = '';
      document.body.style.minWidth = '';
      document.documentElement.classList.remove('tight-desktop');
      document.documentElement.classList.remove('mid-desktop');
    };
  }, []);

  return null;
};

export default ResponsiveScale;
