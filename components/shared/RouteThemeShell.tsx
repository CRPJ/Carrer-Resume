"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import type { ReactNode } from "react";

// =============================================================
// 프론트 전용 라우트/조직 테마 셸.
//
// 화면에 조직별 대표 색상을 "실제로" 입히기 위한 UI 레이어다. 라우팅/데이터
// 로직은 일절 다루지 않으며, 현재 pathname 과 ?org= 쿼리만 읽어 최상위
// .nftg-app 래퍼에 테마 클래스 + CSS 변수를 부착한다. SCSS 테마 파셜
// (.encre-theme / .cluster-px-theme / .phalanx-theme / .route-theme--*)
// 이 그 클래스/변수에 반응해 색을 바꾼다.
//
// 색상값은 화면 표시용 UI 상수일 뿐 계산 로직이 아니다.
// =============================================================

type OrgTheme = {
  classes: string[];
  primary: string;
  soft: string;
  hover: string;
};

// 조직 식별자 → 테마 클래스 + 대표 색상. 내부 slug 와 영문 라벨 모두 허용.
const ORG_THEME: Record<string, OrgTheme> = {
  // 엔터테인먼트 — 핑크
  encre: { classes: ["encre-theme"], primary: "#FF4B70", soft: "#FF98A6", hover: "#FF7C95" },
  entertainment: { classes: ["encre-theme"], primary: "#FF4B70", soft: "#FF98A6", hover: "#FF7C95" },
  // 기획 — 그린
  phalanx: { classes: ["cluster-px-theme", "phalanx-theme"], primary: "#1E9503", soft: "#B2FF8F", hover: "#8FE96A" },
  planning: { classes: ["cluster-px-theme", "phalanx-theme"], primary: "#1E9503", soft: "#B2FF8F", hover: "#8FE96A" },
  // 마케팅 — 골드(기본)
  oranke: { classes: [], primary: "#FAAB07", soft: "#FFC300", hover: "#FFD24A" },
  marketing: { classes: [], primary: "#FAAB07", soft: "#FFC300", hover: "#FFD24A" },
};

// pathname 기반 index-two 계열 강조 테마(route-theme--* + --quaternary-color).
const ROUTE_THEME: Record<string, { name: string; accent: string }> = {
  "/index-two": { name: "mint", accent: "#B2FF8F" },
  "/index-two-ec": { name: "pink", accent: "#FF98A6" },
  "/index-two-ok": { name: "yellow", accent: "#FFEC8F" },
  "/index-two-px": { name: "mint", accent: "#B2FF8F" },
};

// 매 적용마다 초기화할 테마 클래스/변수 목록. app-ready·a-cursor 등 외부에서
// 관리하는 클래스는 건드리지 않는다.
const THEME_CLASSES = [
  "encre-theme",
  "cluster-px-theme",
  "phalanx-theme",
  "route-theme",
  "route-theme--mint",
  "route-theme--pink",
  "route-theme--yellow",
];
const THEME_VARS = ["--primary-color", "--quaternary-color", "--quaternary-hover"];

const normalizePathname = (pathname: string | null) => {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
};

// searchParams/pathname 을 읽어 .nftg-app 에 테마를 부착하는 부수효과 전용 노드.
// 렌더 출력이 없으므로(null) 앱 트리를 Suspense 안에 넣지 않는다 → 더블 렌더 방지.
function ThemeApplier() {
  const pathname = normalizePathname(usePathname());
  const searchParams = useSearchParams();
  const org = searchParams.get("org");

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".nftg-app");
    if (!el) return;

    // 직전 테마 흔적 제거
    el.classList.remove(...THEME_CLASSES);
    THEME_VARS.forEach((v) => el.style.removeProperty(v));
    el.removeAttribute("data-route-path");
    el.removeAttribute("data-route-theme");

    // 1순위: ?org= 조직 테마 (crews / index-two 등 어떤 페이지에서도 동작)
    if (org) {
      const orgTheme = ORG_THEME[org];
      if (orgTheme) {
        orgTheme.classes.forEach((c) => el.classList.add(c));
        el.style.setProperty("--primary-color", orgTheme.primary);
        el.style.setProperty("--quaternary-color", orgTheme.soft);
        el.style.setProperty("--quaternary-hover", orgTheme.hover);
        el.setAttribute("data-route-theme", org);
        return;
      }
    }

    // 2순위: pathname 기반 index-two 계열 강조 테마
    const routeTheme = ROUTE_THEME[pathname];
    if (routeTheme) {
      el.classList.add("route-theme", `route-theme--${routeTheme.name}`);
      el.style.setProperty("--quaternary-color", routeTheme.accent);
      el.setAttribute("data-route-path", pathname);
      el.setAttribute("data-route-theme", routeTheme.name);
    }
  }, [pathname, org]);

  return null;
}

const RouteThemeShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="nftg-app a-cursor">
      <Suspense fallback={null}>
        <ThemeApplier />
      </Suspense>
      {children}
    </div>
  );
};

export default RouteThemeShell;
