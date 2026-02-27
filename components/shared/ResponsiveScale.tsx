"use client";

import { useEffect } from 'react';

const ResponsiveScale = () => {
  useEffect(() => {
    const BASE_WIDTH = 1977;
    const MAX_ZOOM = 2.0; // ★ 최대 150% - 4K에서 적당히 확대
    const MOBILE_BREAKPOINT = 1200; // 모바일 레이아웃 전환 기준 (CSS 1200px과 일치)

    // ★ 브라우저 줌 보정: 초기 devicePixelRatio를 기록하여
    //   사용자가 Ctrl+/- 로 줌 변경 시 CSS zoom이 흔들리지 않게 함
    const initialDPR = window.devicePixelRatio;

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

      // ★ 브라우저 줌 보정
      // 브라우저 확대 시: innerWidth 줄어듦 + devicePixelRatio 증가
      // 곱하면 "실제 창 폭"이 복원되어 CSS zoom이 안정적으로 유지됨
      const browserZoomFactor = window.devicePixelRatio / initialDPR;
      const effectiveWidth = windowWidth * browserZoomFactor;

      // 모바일/태블릿 구간은 zoom 기반 스케일링을 끄고,
      // 반응형 CSS(_mobile-responsive.scss)가 레이아웃을 책임지도록 한다.
      if (effectiveWidth < MOBILE_BREAKPOINT) {
        document.documentElement.style.zoom = '1';
        document.documentElement.style.setProperty('--app-zoom', '1');
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
        // 모바일은 scale=1 이므로 그대로 저장
        requestAnimationFrame(() => updateHeaderDividerY(1));
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        return;
      }

      let scale = effectiveWidth / BASE_WIDTH;

      // 최대 zoom 제한
      if (scale > MAX_ZOOM) {
        scale = MAX_ZOOM;
      }

      document.documentElement.style.zoom = String(scale);
      document.documentElement.style.setProperty('--app-zoom', String(scale));

      // ★ 1200~1700px 중간폭: CSS zoom이 media query를 무력화하므로
      // JS에서 직접 클래스를 토글하여 타이트한 레이아웃 적용
      if (effectiveWidth >= 1200 && effectiveWidth < 1400) {
        document.documentElement.classList.add('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
      } else if (effectiveWidth >= 1400 && effectiveWidth < 1700) {
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.add('mid-desktop');
      } else {
        document.documentElement.classList.remove('tight-desktop');
        document.documentElement.classList.remove('mid-desktop');
      }

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
      document.documentElement.classList.remove('tight-desktop');
      document.documentElement.classList.remove('mid-desktop');
    };
  }, []);

  return null;
};

export default ResponsiveScale;
