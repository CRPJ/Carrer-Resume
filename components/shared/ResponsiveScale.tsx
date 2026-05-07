"use client";

import { useEffect, useLayoutEffect } from "react";
import { logEvent } from "@/utils/blackScreenDiagnostics";

/**
 * 고정 너비 레이아웃 헬퍼
 * - CSS zoom 제거 (네이버 스타일 fixed-width)
 * - 헤더 실측 높이(--header-divider-y)만 계산하여 사이드바/콘텐츠 정렬에 사용
 */
const updateHeaderDividerY = () => {
  const header = document.querySelector(".header") as HTMLElement | null;
  if (!header) {
    document.documentElement.style.removeProperty("--header-divider-y");
    return;
  }
  const headerHeight = header.offsetHeight;
  document.documentElement.style.setProperty("--header-divider-y", `${headerHeight}px`);
};

const isZoneAViewport = () =>
  window.innerWidth < 1920 ||
  (window.innerWidth >= 1920 && window.innerWidth < 2560 && window.innerHeight >= 1200);

const ResponsiveScale = () => {
  // 초기 헤더 높이 측정: useLayoutEffect로 PageReveal(opacity:1)보다 먼저 실행
  useLayoutEffect(() => {
    updateHeaderDividerY();
  }, []);

  useEffect(() => {
    // 1920px 초과 해상도에서만 10% 확대
    const applyZoom = () => {
      if (window.innerWidth > 1920 && !isZoneAViewport()) {
        document.documentElement.style.zoom = "1.08";
      } else {
        document.documentElement.style.zoom = "";
      }
      logEvent("zoom-applied", {
        zoom: document.documentElement.style.zoom || "1",
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      });
    };
    applyZoom();

    // 로드 후 재측정 (초기 측정은 위 useLayoutEffect에서 처리)
    window.addEventListener("load", updateHeaderDividerY);
    window.addEventListener("resize", updateHeaderDividerY);
    window.addEventListener("resize", applyZoom);

    // viewport 기준 CSS media query와 동일하게 resize에서만 갱신
    // 레이아웃 계산 완료 후 페이지 표시 (헤더-사이드바 flash 방지)
    requestAnimationFrame(() => {
      const appEl = document.querySelector(".nftg-app");
      if (appEl) {
        appEl.classList.add("app-ready");
        logEvent("app-ready-add", {
          at: "ResponsiveScale effect",
          zoom: document.documentElement.style.zoom || "1",
        });
      }
    });

    return () => {
      window.removeEventListener("load", updateHeaderDividerY);
      window.removeEventListener("resize", updateHeaderDividerY);
      window.removeEventListener("resize", applyZoom);
      document.documentElement.style.removeProperty("--header-divider-y");
      const appEl = document.querySelector(".nftg-app");
      if (appEl?.classList.contains("app-ready")) {
        appEl.classList.remove("app-ready");
        logEvent("app-ready-remove", { at: "ResponsiveScale cleanup" });
      }
    };
  }, []);

  return null;
};

export default ResponsiveScale;
