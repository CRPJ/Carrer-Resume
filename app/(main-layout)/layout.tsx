import Footer from "@/components/home/Footer";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import DemoToggle from "@/components/common/DemoToggle";
import ProfileApprovalGate from "@/components/shared/ProfileApprovalGate";
import RouteThemeShell from "@/components/shared/RouteThemeShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteThemeShell>
      <ProfileApprovalGate />
      <Sidebar />
      <div className="nftg-layout">
        <Header />
        {children}
        <Footer />
      </div>
      <DemoToggle />
    </RouteThemeShell>
  );
}
