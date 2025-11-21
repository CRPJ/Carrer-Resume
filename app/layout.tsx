import Bootstrap from "@/components/shared/Bootstrap";
import Progress from "@/components/shared/Progress";
import SessionProvider from "@/components/providers/SessionProvider";
import type { Metadata } from "next";
import { Khula, Black_Ops_One } from "next/font/google";
import "./assets/scss/main.scss";

export const metadata: Metadata = {
  title: "NFTG - Esports and NFT Gaming Nextjs Template",
  description: "NFTG - Esports and NFT Gaming Nextjs Template",
};
const khula = Khula({ subsets: ["latin"], weight: ["300", "400", "600", "700", "800"], variable: "--khula" });
const blackOpsOne = Black_Ops_One({ subsets: ["latin"], weight: ["400"], variable: "--black-ops-one" });
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${khula.variable} ${blackOpsOne.variable}`}>
        <SessionProvider>
          <Progress />
          <Bootstrap>{children}</Bootstrap>
        </SessionProvider>
      </body>
    </html>
  );
}
