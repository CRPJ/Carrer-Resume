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

    // 마운트 시점의 물리적 화면 폭을 캐시 (DevTools 에뮬레이션이 덮어쓰기 전)
    // DevTools는 screen.availWidth까지 에뮬레이션 값으로 바꿀 수 있으므로
    // 마운트 시점에 고정해두고 상한선으로 사용
    const mountScreenWidth = window.screen.availWidth;

    const getReliableWidth = () => {
      // outerWidth와 마운트 시점 화면 폭 중 작은 값 사용
      // → DevTools가 outerWidth를 부풀려도 물리적 화면을 초과하지 않음
      // → 사용자가 창을 줄이면 outerWidth가 작아지므로 정상 반영
      return Math.min(window.outerWidth, mountScreenWidth);
    };

    // 100% 줌 시점의 레이아웃 폭 (브라우저 확대 감지용)
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

      const scale = Math.min(w / BASE_WIDTH, MAX_ZOOM);

      document.documentElement.style.zoom = String(scale);
      document.documentElement.style.setProperty('--app-zoom', String(scale));

      // ★ 브라우저 확대(Ctrl+) 감지:
      // outerWidth는 브라우저 확대와 무관하게 고정, innerWidth는 확대 시 줄어듦
      // → 비율이 1.0 이상이면 확대 중
      // ★ 브라우저 확대(Ctrl+) 감지:
      // outerWidth는 확대와 무관, innerWidth는 확대 시 줄어듦
      const zoomRatio = w / window.innerWidth;

      if (zoomRatio < 1.05) {
        // 100% 줌 → 폭 캡처, overflow 숨김 (기존 동작 유지)
        naturalBodyWidth = Math.round(window.innerWidth / scale);
        document.body.style.minWidth = '';
        document.documentElement.style.overflowX = 'hidden';
      } else {
        // 확대 중 → 폭 고정 + overflow auto → 스크롤바 표시
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

    // DevTools 닫기 시 resize 이벤트 누락 대응: 주기적 zoom 보정
    const pollInterval = window.setInterval(applyScale, 500);

    // DPR(devicePixelRatio) 변경 감지 — DevTools 에뮬레이션 시작/종료 시 발생
    const dprMedia = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    const onDPRChange = () => {
      // DPR 변경 후 브라우저가 안정화될 시간을 주고 재계산
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
      document.body.style.minWidth = '';
      document.documentElement.classList.remove('tight-desktop');
      document.documentElement.classList.remove('mid-desktop');
    };
  }, []);

  return null;
};

export default ResponsiveScale;
