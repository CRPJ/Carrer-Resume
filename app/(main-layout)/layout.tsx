import Footer from "@/components/home/Footer";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="nftg-app a-cursor">
      <Sidebar />
      <div className="nftg-layout">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
