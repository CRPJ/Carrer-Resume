"use client";

import { useRef } from "react";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster1Content from "@/components/cluster-1/Cluster1Content";
import Animations from "@/components/shared/Animations";

const Cluster1Page = () => {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <main ref={mainRef} className="nftg-content nftg-content-home">
      <Animations />
      <div className="container-fluid">
        <div className="row">
          {/* 사이드바 */}
          <div className="home-two-sidebar-col">
            <Sidebar />
          </div>
          {/* 메인 콘텐츠 */}
          <div className="home-two-content-col">
            <ClusterTabs />
            <div className="home-two-content">
              <Cluster1Content />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster1Page;
