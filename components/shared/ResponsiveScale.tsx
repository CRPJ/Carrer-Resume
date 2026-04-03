"use client";

import { useEffect } from 'react';

/**
 * 고정 너비 레이아웃 헬퍼
 * - CSS zoom 제거 (네이버 스타일 fixed-width)
 * - 헤더 실측 높이(--header-divider-y)만 계산하여 사이드바/콘텐츠 정렬에 사용
 */
const ResponsiveScale = () => {
  useEffect(() => {
    const updateHeaderDividerY = () => {
      const header = document.querySelector('.header') as HTMLElement | null;
      if (!header) {
        document.documentElement.style.removeProperty('--header-divider-y');
        return;
      }
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty('--header-divider-y', `${headerHeight}px`);
    };

    // 초기 측정 + 로드 후 재측정
    updateHeaderDividerY();
    window.addEventListener('load', updateHeaderDividerY);
    window.addEventListener('resize', updateHeaderDividerY);

    // 레이아웃 계산 완료 후 페이지 표시 (헤더-사이드바 flash 방지)
    requestAnimationFrame(() => {
      document.querySelector('.nftg-app')?.classList.add('app-ready');
    });

    return () => {
      window.removeEventListener('load', updateHeaderDividerY);
      window.removeEventListener('resize', updateHeaderDividerY);
      document.documentElement.style.removeProperty('--header-divider-y');
    };
  }, []);

  return null;
};

export default ResponsiveScale;
