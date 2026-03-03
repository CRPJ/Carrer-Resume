"use client";

import { useEffect } from 'react';

const ResponsiveScale = () => {
  useEffect(() => {
    const BASE_WIDTH = 1977;
    const MAX_ZOOM = 2.0;
    const MOBILE_BREAKPOINT = 1200;

    // ★ 브라우저 줌 감지용: DPR과 outerWidth를 추적
    let lastDPR = window.devicePixelRatio;
    let lastOuterWidth = window.outerWidth;

    const updateHeaderDividerY = () => {
      const header = document.querySelector('.header') as HTMLElement | null;
      if (!header) {
        document.documentElement.style.removeProperty('--header-divider-y');
        return;
      }
      // offsetHeight: CSS 픽셀 기준(정수) → CSS 속성(margin-top 등)과 동일 좌표계
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty('--header-divider-y', `${headerHeight}px`);
    };

    const applyScale = () => {
      const currentDPR = window.devicePixelRatio;
      const currentOuterWidth = window.outerWidth;

      // ★ 브라우저 줌 감지: DPR이 변했는데 outerWidth는 안 변한 경우
      //   → 사용자가 Ctrl+/- 로 줌한 것 → CSS zoom 재계산 스킵 (레이아웃 안정)
      //   DevTools/리사이즈: DPR 안 변하거나, outerWidth도 변함 → 정상 재계산
      const isBrowserZoom = Math.abs(currentDPR - lastDPR) > 0.001
        && Math.abs(currentOuterWidth - lastOuterWidth) < 5;

      lastDPR = currentDPR;

      if (isBrowserZoom) {
        // 브라우저 줌 변경 — CSS zoom은 유지하되 헤더 높이는 재계산
        requestAnimationFrame(() => updateHeaderDividerY());
        return;
      }

      lastOuterWidth = currentOuterWidth;

      const windowWidth = window.innerWidth;

      if (windowWidth < MOBILE_BREAKPOINT) {
        document.documentElement.style.zoom = '1';
        document.documentElement.style.setProperty('--app-zoom', '1');
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
        requestAnimationFrame(() => updateHeaderDividerY());
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        return;
      }

      let scale = windowWidth / BASE_WIDTH;

      if (scale > MAX_ZOOM) {
        scale = MAX_ZOOM;
      }

      document.documentElement.style.zoom = String(scale);
      document.documentElement.style.setProperty('--app-zoom', String(scale));

      if (windowWidth >= 1200 && windowWidth < 1400) {
        document.documentElement.classList.add('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
      } else if (windowWidth >= 1400 && windowWidth < 1700) {
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.add('mid-desktop');
      } else {
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
      }

      requestAnimationFrame(() => updateHeaderDividerY());
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflowX = 'hidden';
    };

    applyScale();
    // 폰트/이미지 로드 후 헤더 높이가 확정되면 divider 재계산
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
    };
  }, []);

  return null;
};

export default ResponsiveScale;
