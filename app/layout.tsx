import Bootstrap from "@/components/shared/Bootstrap";
import Progress from "@/components/shared/Progress";
import type { Metadata } from "next";
import { Khula } from "next/font/google";
import "./assets/scss/main.scss";

export const metadata: Metadata = {
  title: "NFTG - Esports and NFT Gaming Nextjs Template",
  description: "NFTG - Esports and NFT Gaming Nextjs Template",
};
const khula = Khula({ subsets: ["latin"], weight: ["300", "400", "600", "700", "800"], variable: "--khula" });
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={khula.variable}>
        <Progress />
        <Bootstrap>{children}</Bootstrap>
      </body>
    </html>
  );
}
