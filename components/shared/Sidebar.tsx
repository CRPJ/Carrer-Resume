"use client";
import logo from "@/public/images/0/header-logo.png";
import one from "@/public/images/sidebar/one.png";
import two from "@/public/images/sidebar/two.png";
import three from "@/public/images/sidebar/three.png";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { dedupedJson } from "@/lib/fetch-dedupe";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { usePopup } from "@/components/ui/popup";
// Define the type for the game object
interface Game {
  id: number;
  image: StaticImageData;
  target: string;
}

interface ProfileResponse {
  success?: boolean;
  data?: {
    id?: string;
  };
}
// 좌측 네비 슬라이드 이미지 → 계열별 랜딩 분기.
//   one   = 엔터테인먼트 → /index-two-ec
//   two   = 마케팅       → /index-two-ok
//   three = 컨설팅       → /index-two-px
const games: Game[] = [
  { id: 1, image: one, target: "/index-two-ec" },
  { id: 2, image: two, target: "/index-two-ok" },
  { id: 3, image: three, target: "/index-two-px" },
  { id: 4, image: one, target: "/index-two-ec" },
  { id: 5, image: two, target: "/index-two-ok" },
  { id: 6, image: three, target: "/index-two-px" },
  { id: 7, image: one, target: "/index-two-ec" },
  { id: 8, image: two, target: "/index-two-ok" },
  { id: 9, image: three, target: "/index-two-px" },
];

// index-two 계열 라우트 → 조직(org) 컨텍스트. 좌측 네비 링크가 현재 조직을
// crews/weekly-ranking/cluster 경로에 ?org= 로 보존하기 위한 역매핑.
const INDEX_TWO_TO_ORG: Record<string, string> = {
  "/index-two-ec": "encre",
  "/index-two-px": "phalanx",
  "/index-two-ok": "oranke",
};

const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const popup = usePopup();
  const [myProfileId, setMyProfileId] = useState<string | null>(null);

  const getCurrentOrg = () => {
    const routeOrg = pathname ? INDEX_TWO_TO_ORG[pathname.replace(/\/$/, "")] : null;
    if (routeOrg) return routeOrg;
    return typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("org")
      : null;
  };

  const getCrewsHref = () => {
    const org = getCurrentOrg();
    return org ? `/crews?org=${org}` : "/crews";
  };

  // 참고 브랜치와 동일하게 주간 랭킹도 현재 org 컨텍스트를 보존한다.
  const getWeeklyRankingHref = () => {
    const org = getCurrentOrg();
    return org ? `/weekly-ranking?org=${org}` : "/weekly-ranking";
  };

  // 로그인 시 user_profiles ID를 미리 가져옴
  // 어드민(마더 계정)은 user_profiles에 없어 404 — skip
  useEffect(() => {
    if (!session?.user) return;
    if (session.user.isAdmin) return;
    dedupedJson<ProfileResponse>('/api/profile/')
      .then(result => {
        if (result?.success && result.data?.id) {
          setMyProfileId(result.data.id);
        }
      })
      .catch(() => {});
  }, [session]);

  const handleCareerResumeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (session?.user) {
      // 어드민(마더 계정)은 본인 프로필이 없어 /cluster-4 가 무의미 — 바로 크루 목록으로
      if (session.user.isAdmin) {
        router.push(getCrewsHref());
        return;
      }
      // 참고 브랜치는 현재 org 컨텍스트를 cluster 경로로 보존한다.
      // 현재 구조(단일 /cluster-4 + ?org=)에 맞춰 org 쿼리로 보존.
      const org = getCurrentOrg();
      if (myProfileId) {
        router.push(`/cluster-4/?userId=${myProfileId}${org ? `&org=${org}` : ""}`);
      } else {
        router.push(org ? `/cluster-4?org=${org}` : "/cluster-4");
      }
    } else {
      await popup.alert("현재 활동 중이거나 졸업한 크루여야 합니다");
    }
  };

  return (
    <aside className="nftg-sidebar">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="sidebar__wrapper">
              <div className="sidebar__widget">
                <Link href="/" className="sidebar__logo not-cursor" aria-label="home page" title="logo">
                  <Image src={logo} alt="Logo" 
                    className="w-16 h-16 left-0 top-[4px] absolute"
                    width={64} height={64} />
                </Link>
              </div>
              <div className="sidebar__widget sidebar--links">
                <ul>
                  <li>
                    <Link href={getWeeklyRankingHref()} aria-label="주간 랭킹" title="주간 랭킹">
                      <i className="ti ti-layout-grid-add"></i>
                      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link href={getCrewsHref()} aria-label="크루" title="크루">
                      <i className="ti ti-chart-bar"></i>
                      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => e.preventDefault()} aria-label="졸업 절차" title="졸업 절차" style={{ cursor: "default" }}>
                      <i className="ti ti-tag"></i>
                      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={handleCareerResumeClick} aria-label="커리어 레쥬메" title="커리어 레쥬메">
                      <i className="ti ti-coin"></i>
                      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="sidebar__widget sidebar--images">
                <div className="sidebar__widget-slider">
                  <Swiper
                    loop={true}
                    speed={1000}
                    slidesPerView={3}
                    spaceBetween={20}
                    centeredSlides={true}
                    direction="vertical"
                    modules={[Autoplay]}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    className="sidebar-game-slider swiper"
                  >
                    {games.map((game) => (
                      <SwiperSlide key={game.id} className="swiper-slide">
                        <div className="sidebar-slider__single">
                          <Link href={game.target} aria-label="open landing page" title="open landing page">
                            <Image src={game.image} alt="Image" />
                            <svg viewBox="-3 -3 106 106" xmlns="http://www.w3.org/2000/svg" fill="none" className="hexagon-border">
                              <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
                            </svg>
                          </Link>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
              <div className="sidebar__widget sidebar--links">
                <ul>
                  <li>
                    <Link href="/profile" aria-label="add wallet" title="add wallet">
                      <i className="ti ti-circle-plus"></i>
                      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" aria-label="view settings" title="view settings">
                      <i className="ti ti-settings"></i>
                      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link href="/" aria-label="log out" title="log out">
                      <i className="ti ti-logout"></i>
                      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
