"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster4CardContent from "@/components/cluster-4-card/Cluster4CardContent";
import Animations from "@/components/shared/Animations";


const Cluster4CardDynamicPage = () => {
  const params = useParams();
  const weekId = params.weekId as string;

  const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: '110px',
    top: '124px',
    overflow: 'visible',
    zIndex: 100,
  });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const sidebarHeight = 810;
      const sidebarTop = 124;
      const sidebarBottom = sidebarTop + sidebarHeight;

      if (footerRect.top < sidebarBottom) {
        // footer와 겹칠 때: 사이드바를 딱 footer 위까지만
        setSidebarStyle({
          position: 'fixed',
          left: '110px',
          top: `${footerRect.top - sidebarHeight}px`,
          overflow: 'visible',
          zIndex: 100,
        });
      } else {
        setSidebarStyle({
          position: 'fixed',
          left: '110px',
          top: '124px',
          overflow: 'visible',
          zIndex: 100,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main ref={mainRef} className="nftg-content nftg-content-home">
      <Animations />

      {/* 고정 사이드바 */}
      <div style={sidebarStyle}>
        <Sidebar />
      </div>
      {/* 메인 콘텐츠 */}
      <div className="container-fluid">
        <div className="row">
          {/* 사이드바 공간 확보용 빈 영역 */}
          <div style={{ width: 'var(--sidebar-width, 482px)', flexShrink: 0 }}></div>
          <div className="home-two-content-col" style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
            <ClusterTabs />
            <div className="home-two-content">
              <Cluster4CardContent weekId={weekId} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster4CardDynamicPage;
