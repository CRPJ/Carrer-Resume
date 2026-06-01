"use client";

import { useState, useEffect, useRef } from "react";
import Banner from "@/components/home-two/Banner";
import Countdown from "@/components/home-two/Countdown";
import Feature from "@/components/home-two/Feature";
import LastStream from "@/components/home-two/LastStream";
import Platform from "@/components/home-two/Platform";
import Sidebar from "@/components/home-career/Sidebar";
import Streamer from "@/components/home-two/Streamer";
import TrendingNFT from "@/components/home-two/TrendingNFT";
import Cta from "@/components/home/Cta";
import Secure from "@/components/home/Secure";
import Animations from "@/components/shared/Animations";

const HomePageTwoOk = () => {
  // 사이드바 고정 너비
  const sidebarWidth = '474px';

  const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: '110px',
    top: '125px',
    overflowY: 'hidden',
    zIndex: 100,
    width: sidebarWidth,
    height: '810px',
    transform: 'scale(1)',
    transformOrigin: 'top left',
  });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // 1920 미만 뷰포트 + zoom 미적용 상태에서는 fixed 전환하지 않음
      const zoom = parseFloat(document.documentElement.style.zoom) || 1;
      if (zoom <= 1 && window.innerWidth < 1920) {
        setSidebarStyle({
          position: 'relative',
          left: '',
          top: '',
          overflow: 'visible',
          zIndex: 100,
        });
        return;
      }

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
          width: sidebarWidth,
          height: '810px',
          transform: 'scale(1)',
          transformOrigin: 'top left',
        });
      } else {
        setSidebarStyle({
          position: 'fixed',
          left: '110px',
          top: '125px',
          overflowY: 'hidden',
          zIndex: 100,
          width: sidebarWidth,
          height: '810px',
          transform: 'scale(1)',
          transformOrigin: 'top left',
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
          <div style={{ width: sidebarWidth, flexShrink: 0 }}></div>
          <div className="col-12 col-xxl-9">
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

export default HomePageTwoOk;
