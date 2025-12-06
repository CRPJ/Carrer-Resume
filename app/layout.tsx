import Bootstrap from "@/components/shared/Bootstrap";
import Progress from "@/components/shared/Progress";
import SessionProvider from "@/components/providers/SessionProvider";
import type { Metadata } from "next";
import { Khula, Black_Ops_One, Chakra_Petch } from "next/font/google";
import "./assets/scss/main.scss";

export const metadata: Metadata = {
  title: "NFTG - Esports and NFT Gaming Nextjs Template",
  description: "NFTG - Esports and NFT Gaming Nextjs Template",
};
const khula = Khula({ subsets: ["latin"], weight: ["300", "400", "600", "700", "800"], variable: "--khula" });
const blackOpsOne = Black_Ops_One({ subsets: ["latin"], weight: ["400"], variable: "--black-ops-one" });
const chakraPetch = Chakra_Petch({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--chakra-petch" });
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
      <body className={`${khula.variable} ${blackOpsOne.variable} ${chakraPetch.variable}`}>
        <SessionProvider>
          <Progress />
          <Bootstrap>{children}</Bootstrap>
        </SessionProvider>
      </body>
    </html>
  );
}
