"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";

const ClusterTabs = () => {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const tabs = [
    { name: "Personal Profile", path: "/career", cluster: 1 },
    { name: "Club Final Index", path: "/cluster-2", cluster: 2 },
    { name: "Club Challenge Growth", path: "/cluster-3", cluster: 3 },
    { name: "Societal Reputation", path: "/cluster-4", cluster: 4 },
    { name: "Working Level - Experience", path: "/cluster-5", cluster: 5 },
    { name: "Working Level - Ability", path: "/cluster-6", cluster: 6 },
    { name: "Working Level - Career", path: "/cluster-7", cluster: 7 },
    { name: "Working Level - Information", path: "/cluster-8", cluster: 8 },
    { name: "Working Level - Skill & Tools", path: "/cluster-9", cluster: 9 },
  ];

  const isActive = (tabPath: string) => {
    if (tabPath === "/career") {
      return pathname === "/career" || pathname === "/" || pathname === "/career/";
    }
    return pathname === tabPath || pathname === tabPath + "/";
  };

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
      return () => scrollElement.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  const scrollToCenter = (index: number) => {
    const tab = tabRefs.current[index];
    const container = scrollRef.current;
    if (tab && container) {
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerWidth = container.clientWidth;
      const scrollPosition = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      container.scrollLeft = scrollPosition;
    }
  };

  // 페이지 로드 시 활성화된 탭을 가운데로 스크롤
  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => isActive(tab.path));
    if (activeIndex !== -1) {
      setTimeout(() => {
        scrollToCenter(activeIndex);
      }, 50);
    }
  }, [pathname]);

  const handleArrowClick = () => {
    if (scrollRef.current) {
      if (isAtEnd) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="cluster-tabs">
      <div className="cluster-tabs-inner" ref={scrollRef}>
        {tabs.map((tab, index) => (
          <Link
            key={index}
            href={tab.path}
            ref={(el) => { tabRefs.current[index] = el; }}
            className={`cluster-tab ${isActive(tab.path) ? "active" : ""}`}
          >
            {isActive(tab.path) && (
              <img src="/images/0/cluster 1/tabbb.png" alt="" className="tab-deco left" />
            )}
            <span className="tab-text">{tab.name}</span>
            {isActive(tab.path) && (
              <img src="/images/0/cluster 1/tabbb.png" alt="" className="tab-deco right" />
            )}
          </Link>
        ))}
      </div>
      <div className={`cluster-tabs-gradient ${isAtEnd ? "at-start" : ""}`}></div>
      <button className={`cluster-tabs-arrow ${isAtEnd ? "at-start" : ""}`} onClick={handleArrowClick}>
        <i className={`ti ${isAtEnd ? "ti-chevron-left" : "ti-chevron-right"}`}></i>
      </button>
    </div>
  );
};

export default ClusterTabs;
