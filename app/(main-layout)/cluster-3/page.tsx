"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster3Content from "@/components/cluster-3/Cluster3Content";
import Animations from "@/components/shared/Animations";

const Cluster3Page = () => {
  const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: '110px',
    top: '125px',
    overflowY: 'hidden',
    zIndex: 100,
    width: '520px',
  });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (footerRect.top < windowHeight) {
        const moveUp = windowHeight - footerRect.top;
        setSidebarStyle({
          position: 'fixed',
          left: '110px',
          top: `${125 - moveUp}px`,
          overflowY: 'hidden',
          zIndex: 100,
          width: '520px',
        });
      } else {
        setSidebarStyle({
          position: 'fixed',
          left: '110px',
          top: '125px',
          overflowY: 'hidden',
          zIndex: 100,
          width: '520px',
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
          <div style={{ width: '520px', flexShrink: 0 }}></div>
          <div className="home-two-content-col">
            <ClusterTabs />
            <div className="home-two-content">
              <Cluster3Content />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster3Page;
