"use client";

import { useEffect } from "react";

/**
 * 고정 너비 레이아웃 헬퍼
 * - CSS zoom 제거 (네이버 스타일 fixed-width)
 * - 헤더 실측 높이(--header-divider-y)만 계산하여 사이드바/콘텐츠 정렬에 사용
 */
const ResponsiveScale = () => {
  useEffect(() => {
    const updateHeaderDividerY = () => {
      const header = document.querySelector(".header") as HTMLElement | null;
      if (!header) {
        document.documentElement.style.removeProperty("--header-divider-y");
        return;
      }
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty("--header-divider-y", `${headerHeight}px`);
    };

    // 1920px 초과 해상도에서만 10% 확대
    const applyZoom = () => {
      if (screen.width > 1920) {
        document.documentElement.style.zoom = "1.08";
      } else {
        document.documentElement.style.zoom = "";
      }
    };
    applyZoom();

    // 초기 측정 + 로드 후 재측정
    updateHeaderDividerY();
    window.addEventListener("load", updateHeaderDividerY);
    window.addEventListener("resize", updateHeaderDividerY);
    window.addEventListener("resize", applyZoom);

    // 모니터 변경 감지: screen.width는 resize 이벤트로 잡히지 않으므로 주기적 체크
    // (2560 모니터에서 1920 모니터로 창 이동 시 레이아웃 깨짐 방지)
    let lastScreenWidth = screen.width;
    const checkMonitor = setInterval(() => {
      if (screen.width !== lastScreenWidth) {
        lastScreenWidth = screen.width;
        applyZoom();
      }
    }, 1000);

    // 레이아웃 계산 완료 후 페이지 표시 (헤더-사이드바 flash 방지)
    requestAnimationFrame(() => {
      document.querySelector(".nftg-app")?.classList.add("app-ready");
    });

    return () => {
      window.removeEventListener("load", updateHeaderDividerY);
      window.removeEventListener("resize", updateHeaderDividerY);
      window.removeEventListener("resize", applyZoom);
      clearInterval(checkMonitor);
      document.documentElement.style.removeProperty("--header-divider-y");
    };
  }, []);

  return null;
};

export default ResponsiveScale;
