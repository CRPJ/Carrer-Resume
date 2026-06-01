"use client";

export type OrgKey = "oranke" | "encre" | "phalanx";
export type OrgPanelType = "OK" | "EC" | "PX";

export interface OrgPointContent {
  label: string;
  iconSrc: string;
  badgeClassName: string;
}

export interface OrgContent {
  key: OrgKey;
  panelType: OrgPanelType;
  displayName: string;
  clubName: string;
  fullClubName: string;
  divisionName: string;
  themeClassName: string;
  smallLogoSrc: string;
  medalSrc: string;
  points: {
    star: OrgPointContent;
    shield: OrgPointContent;
    lightning: OrgPointContent;
  };
}

export const ORG_CONTENT: Record<OrgKey, OrgContent> = {
  oranke: {
    key: "oranke",
    panelType: "OK",
    displayName: "오랑캐",
    clubName: "오랑캐",
    fullClubName: "전국청춘연합 마케팅/퍼포먼스 클럽, 오랑캐",
    divisionName: "마케팅/퍼포먼스",
    themeClassName: "",
    smallLogoSrc: "/images/0/cluster 1/00.png",
    medalSrc: "/images/0/cluster 1/금장_OK.png",
    points: {
      star: {
        label: "단감",
        iconSrc: "/images/0/cluster4/icon/icon - 단감.png",
        badgeClassName: "icon-graphic10",
      },
      shield: {
        label: "인절미",
        iconSrc: "/images/0/cluster4/icon/icon - 인절미.png",
        badgeClassName: "icon-shield",
      },
      lightning: {
        label: "어흥",
        iconSrc: "/images/0/cluster4/icon/icon - 어흥.png",
        badgeClassName: "icon-graphic13",
      },
    },
  },
  encre: {
    key: "encre",
    panelType: "EC",
    displayName: "엥크레",
    clubName: "엥크레",
    fullClubName: "전국청춘연합 엔터테인먼트/미디어 클럽, 엥크레",
    divisionName: "엔터테인먼트/미디어",
    themeClassName: "encre-theme",
    smallLogoSrc: "/images/0/cluster 1/small icon/ec.png",
    medalSrc: "/images/0/cluster 1/금장_EC.png",
    points: {
      star: {
        label: "별",
        iconSrc: "/images/0/cluster 1/Star Badge.png",
        badgeClassName: "icon-star",
      },
      shield: {
        label: "방패",
        iconSrc: "/images/0/cluster 1/Shield.png",
        badgeClassName: "icon-shield",
      },
      lightning: {
        label: "번개",
        iconSrc: "/images/0/Graphic13.png",
        badgeClassName: "icon-lightning",
      },
    },
  },
  phalanx: {
    key: "phalanx",
    panelType: "PX",
    displayName: "팔랑크스",
    clubName: "팔랑크스",
    fullClubName: "전국청춘연합 기획/컨설팅 클럽, 팔랑크스",
    divisionName: "기획/컨설팅",
    themeClassName: "cluster-px-theme phalanx-theme",
    smallLogoSrc: "/images/0/cluster 1/PX06.png",
    medalSrc: "/images/0/cluster 1/금장_PX.png",
    points: {
      star: {
        label: "투구",
        iconSrc: "/images/0/cluster 1/PX01.png",
        badgeClassName: "icon-graphic10",
      },
      shield: {
        label: "방패",
        iconSrc: "/images/0/cluster 1/pX02.png",
        badgeClassName: "icon-shield",
      },
      lightning: {
        label: "화살",
        iconSrc: "/images/0/cluster 1/PX03.png",
        badgeClassName: "icon-graphic13",
      },
    },
  },
};

export const normalizeOrg = (org?: string | null): OrgKey => {
  if (org === "encre" || org === "entertainment") return "encre";
  if (org === "phalanx" || org === "planning" || org === "consulting") return "phalanx";
  return "oranke";
};

export const orgFromPathname = (pathname?: string | null): OrgKey | null => {
  const normalizedPath = pathname?.replace(/\/$/, "") || "";
  if (normalizedPath.endsWith("-ec") || normalizedPath === "/index-two-ec") return "encre";
  if (normalizedPath.endsWith("-px") || normalizedPath === "/index-two-px") return "phalanx";
  if (normalizedPath.endsWith("-ok") || normalizedPath === "/index-two-ok") return "oranke";
  return null;
};

export const getOrgContent = (org?: string | null, pathname?: string | null): OrgContent => {
  const routeOrg = orgFromPathname(pathname);
  return ORG_CONTENT[routeOrg || normalizeOrg(org)];
};
