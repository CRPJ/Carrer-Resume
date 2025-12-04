"use client";

import { useState, useEffect, useRef } from "react";
import Banner from "@/components/home-career/Banner";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Countdown from "@/components/home-career/Countdown";
import Feature from "@/components/home-career/Feature";
import LastStream from "@/components/home-career/LastStream";
import Platform from "@/components/home-career/Platform";
import Sidebar from "@/components/home-career/Sidebar";
import Streamer from "@/components/home-career/Streamer";
import TrendingNFT from "@/components/home-career/TrendingNFT";
import Cta from "@/components/home/Cta";
import Secure from "@/components/home/Secure";
import Animations from "@/components/shared/Animations";

const Cluster4Page = () => {
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
              {/* <!-- ==== banner section ==== --> */}
              <Banner />
              {/* <!-- ==== feature games section ==== --> */}
              <Feature />
              {/* <!-- ==== countdown section ==== --> */}
              <Countdown />
              {/* <!-- ==== trending nft section ==== --> */}
              <TrendingNFT />
              {/* <!-- ==== streamer section ==== --> */}
              <Streamer />
              {/* <!-- ==== platform section ==== --> */}
              <Platform />
              {/* <!-- ==== secure section ==== --> */}
              <Secure />
              {/* <!-- ==== last streams section ==== --> */}
              <LastStream />
            </div>
          </div>
        </div>
      </div>
      {/* <!-- ==== cta section ==== --> */}
      <Cta />
    </main>
  );
};

export default Cluster4Page;
