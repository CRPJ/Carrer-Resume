"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";

const ClusterTabs = () => {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // 클러스터 1은 사이드바(독립), 탭은 클러스터 2부터 시작 (2x5 구조)
  const tabs = [
    { name: "Personal Profile", path: "/cluster-2", cluster: 2 },
    { name: "Club Final Index", path: "/cluster-3", cluster: 3 },
    { name: "Club Challenge Growth", path: "/cluster-4", cluster: 4 },
    { name: "Societal Reputation", path: "/cluster-5", cluster: 5 },
    { name: "Working Level - Experience", path: "/cluster-6", cluster: 6 },
    { name: "Working Level - Ability", path: "/cluster-7", cluster: 7 },
    { name: "Working Level - Career", path: "/cluster-8", cluster: 8 },
    { name: "Working Level - Information", path: "/cluster-9", cluster: 9 },
    { name: "Working Level - Skill & Tools", path: "/cluster-10", cluster: 10 },
    { name: "-", path: "", cluster: 0, isPlaceholder: true },
  ];

  const isActive = (tabPath: string) => {
    if (tabPath === "/cluster-2") {
      return pathname === "/cluster-2" || pathname === "/" || pathname === "/cluster-2/" || pathname === "/career" || pathname === "/career/";
    }
    if (tabPath === "/cluster-4") {
      return pathname === "/cluster-4" || pathname === "/cluster-4/" ||
             pathname === "/cluster-4-1" || pathname === "/cluster-4-1/" ||
             pathname === "/cluster-4-card" || pathname === "/cluster-4-card/";
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
        {tabs.map((tab, index) => {
          // 긴 탭 이름에는 wide-deco 클래스 추가
          const isWideDeco = tab.cluster === 9 || tab.cluster === 10;
          return tab.path ? (
            <Link
              key={index}
              href={tab.path}
              ref={(el) => { tabRefs.current[index] = el; }}
              className={`cluster-tab ${isActive(tab.path) ? "active" : ""} ${isWideDeco ? "wide-deco" : ""}`}
            >
              {isActive(tab.path) && (
                <img src="/images/0/cluster 1/tabbb.png" alt="" className="tab-deco left" />
              )}
              <span className="tab-text">{tab.name}</span>
              {isActive(tab.path) && (
                <img src="/images/0/cluster 1/tabbb.png" alt="" className="tab-deco right" />
              )}
            </Link>
          ) : (
            <div key={index} className="cluster-tab placeholder">
              <span className="tab-text">{tab.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClusterTabs;
