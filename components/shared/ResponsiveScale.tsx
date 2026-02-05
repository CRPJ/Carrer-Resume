"use client";

import { useEffect } from 'react';

const ResponsiveScale = () => {
  useEffect(() => {
    const BASE_WIDTH = 1977;
    const MAX_ZOOM = 1.5; // ★ 최대 150% - 4K에서 적당히 확대
    const MOBILE_BREAKPOINT = 1200; // 모바일 레이아웃 전환 기준

    const updateHeaderDividerY = (scale: number) => {
      const header = document.querySelector('.header') as HTMLElement | null;
      if (!header) {
        document.documentElement.style.removeProperty('--header-divider-y');
        return;
      }
      const rect = header.getBoundingClientRect();
      const borderBottom = parseFloat(getComputedStyle(header).borderBottomWidth || '0') || 0;
      // rect 값은 zoom 적용된 결과(visual px)일 수 있으므로, CSS top에 넣을 값은 scale로 나눈 "언줌(px)"로 저장
      const dividerYUnzoomed = (rect.bottom - borderBottom) / (scale || 1);
      document.documentElement.style.setProperty('--header-divider-y', `${dividerYUnzoomed}px`);
    };

    const applyScale = () => {
      const windowWidth = window.innerWidth;

      // 모바일/태블릿 구간은 zoom 기반 스케일링을 끄고,
      // 반응형 CSS(_mobile-responsive.scss)가 레이아웃을 책임지도록 한다.
      if (windowWidth < MOBILE_BREAKPOINT) {
        document.documentElement.style.zoom = '1';
        document.documentElement.style.setProperty('--app-zoom', '1');
        // 모바일은 scale=1 이므로 그대로 저장
        requestAnimationFrame(() => updateHeaderDividerY(1));
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        return;
      }
      
      let scale = windowWidth / BASE_WIDTH;
      
      // 최대 zoom 제한
      if (scale > MAX_ZOOM) {
        scale = MAX_ZOOM;
      }
      
      document.documentElement.style.zoom = String(scale);
      document.documentElement.style.setProperty('--app-zoom', String(scale));
      // zoom 적용 후 다음 프레임에서 측정 → 언줌(px)로 저장
      requestAnimationFrame(() => updateHeaderDividerY(scale));
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflowX = 'hidden';
    };

    applyScale();
    window.addEventListener('resize', applyScale);

    return () => {
      window.removeEventListener('resize', applyScale);
      document.documentElement.style.zoom = '';
      document.documentElement.style.removeProperty('--app-zoom');
      document.documentElement.style.removeProperty('--header-divider-y');
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
    };
  }, []);

  return null;
};

export default ResponsiveScale;