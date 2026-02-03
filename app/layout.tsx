import Bootstrap from "@/components/shared/Bootstrap";
import Progress from "@/components/shared/Progress";
import SessionProvider from "@/components/providers/SessionProvider";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ZoomPrevention from "@/components/shared/ZoomPrevention";
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap" rel="stylesheet" />
      </head>
      <body className={`${khula.variable} ${blackOpsOne.variable} ${chakraPetch.variable} ${lobster.variable} ${rajdhani.variable}`}>
        <SessionProvider>
          <ProfileProvider>
            <ZoomPrevention />
            <Progress />
            <Bootstrap>{children}</Bootstrap>
          </ProfileProvider>
        </SessionProvider>
      </body>
    </html>
  );
}