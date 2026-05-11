import Footer from "@/components/home/Footer";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import DemoToggle from "@/components/common/DemoToggle";
import ProfileApprovalGate from "@/components/shared/ProfileApprovalGate";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="nftg-app a-cursor">
      <ProfileApprovalGate />
      <Sidebar />
      <div className="nftg-layout">
        <Header />
        {children}
        <Footer />
      </div>
      <DemoToggle />
    </div>
  );
}
