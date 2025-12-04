"use client";

import { useState, useEffect, useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster2Content from "@/components/cluster-2/Cluster2Content";
import Animations from "@/components/shared/Animations";

const Cluster2Page = () => {
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

      // 푸터가 화면에 보이기 시작하면 - 사이드바를 위로 이동
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
    handleScroll(); // 초기 실행

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
              <Cluster2Content />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster2Page;
