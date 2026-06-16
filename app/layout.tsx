import Bootstrap from "@/components/shared/Bootstrap";
import Progress from "@/components/shared/Progress";
import SessionProvider from "@/components/providers/SessionProvider";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { PopupProvider } from "@/components/ui/popup";
import ZoomPrevention from "@/components/shared/ZoomPrevention";
import ResponsiveScale from "@/components/shared/ResponsiveScale";
import MobileBlockScreen from "@/components/shared/MobileBlockScreen";
import PageReveal from "@/components/shared/PageReveal";
import DiagnosticsInit from "@/components/shared/DiagnosticsInit";
import BlackScreenDiagButton from "@/components/shared/BlackScreenDiagButton";
import type { Metadata, Viewport } from "next";
import { Khula, Black_Ops_One, Chakra_Petch, Lobster, Rajdhani } from "next/font/google";
import "./assets/scss/main.scss";
import "./assets/css/tailwind.css";

export const metadata: Metadata = {
  title: "NFTG - Esports and NFT Gaming Nextjs Template",
  description: "NFTG - Esports and NFT Gaming Nextjs Template",
};

// 브라우저 줌 고정 (100% 배율 유지)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

const khula = Khula({ subsets: ["latin"], weight: ["300", "400", "600", "700", "800"], variable: "--khula" });
const blackOpsOne = Black_Ops_One({ subsets: ["latin"], weight: ["400"], variable: "--black-ops-one" });
const chakraPetch = Chakra_Petch({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--chakra-petch" });
const lobster = Lobster({ subsets: ["latin"], weight: ["400"], variable: "--lobster" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--rajdhani" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Detail Log H(TERMINAL) 디자인 본문 폰트 — IBM Plex Mono/Sans KR(요약 상단) +
            Space Mono(액트 테이블·범례 숫자, 콘솔 톤).
            (SCSS @import url(...) 는 Next 빌드에서 무시되므로 head link 로 직접 로드) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className={`${khula.variable} ${blackOpsOne.variable} ${chakraPetch.variable} ${lobster.variable} ${rajdhani.variable}`}>
        <MobileBlockScreen />
        <SessionProvider>
          <ProfileProvider>
            <PopupProvider>
              {/* <ZoomPrevention /> */}
              <DiagnosticsInit />
              <BlackScreenDiagButton />
              <ResponsiveScale />
              <Progress />
              <Bootstrap>
                <PageReveal>{children}</PageReveal>
              </Bootstrap>
            </PopupProvider>
          </ProfileProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
