"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Animations from "@/components/shared/Animations";
import { supabase } from "@/lib/supabase";

const Cluster4CardPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: '83px',
    top: '98px',
    overflow: 'visible',
    zIndex: 100,
  });
  const mainRef = useRef<HTMLElement>(null);

  // tight-desktop 감지를 위한 헬퍼
  const getSidebarLeft = () => {
    const isTight = document.documentElement.classList.contains('tight-desktop');
    return isTight ? '73px' : '83px';
  };

  // 현재 주차로 리다이렉트
  useEffect(() => {
    const fetchCurrentWeekAndRedirect = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // 현재 날짜가 포함된 주차 찾기
        const { data: currentWeek, error } = await supabase
          .from('weeks')
          .select('id, start_date, end_date, seasons(name)')
          .lte('start_date', today)
          .gte('end_date', today)
          .single();

        if (error || !currentWeek) {
          // 현재 주차가 없으면 가장 최근 주차로
          const { data: latestWeek } = await supabase
            .from('weeks')
            .select('id, seasons(name)')
            .order('start_date', { ascending: false })
            .limit(1)
            .single();

          if (latestWeek) {
            // break 시즌 제외
            const seasonName = (latestWeek.seasons as any)?.name || '';
            if (!seasonName.toLowerCase().includes('break')) {
              router.replace(`/cluster-4-card/${latestWeek.id}`);
              return;
            }
          }
        } else {
          // break 시즌 제외
          const seasonName = (currentWeek.seasons as any)?.name || '';
          if (!seasonName.toLowerCase().includes('break')) {
            router.replace(`/cluster-4-card/${currentWeek.id}`);
            return;
          }
        }

        // 적절한 주차를 찾지 못한 경우 로딩 상태 유지
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching current week:', err);
        setIsLoading(false);
      }
    };

    fetchCurrentWeekAndRedirect();
  }, [router]);

  useEffect(() => {
    const updateSidebar = () => {
      const left = getSidebarLeft();
      const footer = document.querySelector('footer');
      if (!footer) {
        setSidebarStyle({ position: 'fixed', left, top: '98px', overflow: 'visible', zIndex: 100 });
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (footerRect.top < windowHeight) {
        const moveUp = windowHeight - footerRect.top;
        setSidebarStyle({ position: 'fixed', left, top: `${98 - moveUp}px`, overflow: 'visible', zIndex: 100 });
      } else {
        setSidebarStyle({ position: 'fixed', left, top: '98px', overflow: 'visible', zIndex: 100 });
      }
    };

    window.addEventListener('scroll', updateSidebar);
    window.addEventListener('resize', updateSidebar);
    updateSidebar();

    return () => {
      window.removeEventListener('scroll', updateSidebar);
      window.removeEventListener('resize', updateSidebar);
    };
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
          <div style={{ width: 'var(--sidebar-width, 497px)', flexShrink: 0 }}></div>
          <div className="home-two-content-col">
            <ClusterTabs />
            <div className="home-two-content">
              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  현재 주차를 불러오는 중...
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  표시할 주차가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster4CardPage;
