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

    const applyScale = () => {
      // outerWidth: 실제 창 크기만 반영, 브라우저 줌(Ctrl+/-)에 불변
      // → CSS zoom이 항상 안정적이고, 브라우저 줌 UX를 방해하지 않음
      const w = window.outerWidth;

      if (w < MOBILE_BREAKPOINT) {
        document.documentElement.style.zoom = '1';
        document.documentElement.style.setProperty('--app-zoom', '1');
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
        requestAnimationFrame(() => updateHeaderDividerY());
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        return;
      }

      const scale = Math.min(w / BASE_WIDTH, MAX_ZOOM);

      document.documentElement.style.zoom = String(scale);
      document.documentElement.style.setProperty('--app-zoom', String(scale));

      updateDesktopClasses(w);

      requestAnimationFrame(() => updateHeaderDividerY());
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflowX = 'hidden';

      // ★ 고줌 감지: 실제 데스크탑이지만 브라우저 줌으로 뷰포트가 좁아진 경우
      // CSS 클래스만 토글 → React 상태 변경 없이 CSS로 세로 배치
      const isHighZoom = w >= MOBILE_BREAKPOINT && window.innerWidth < MOBILE_BREAKPOINT;
      document.documentElement.classList.toggle('high-zoom', isHighZoom);
    };

    applyScale();
    window.addEventListener('load', applyScale);
    window.addEventListener('resize', applyScale);

    return () => {
      window.removeEventListener('load', applyScale);
      window.removeEventListener('resize', applyScale);
      document.documentElement.style.zoom = '';
      document.documentElement.style.removeProperty('--app-zoom');
      document.documentElement.style.removeProperty('--header-divider-y');
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
      document.documentElement.classList.remove('tight-desktop');
      document.documentElement.classList.remove('mid-desktop');
      document.documentElement.classList.remove('high-zoom');
    };
  }, []);

  return null;
};

export default ResponsiveScale;
