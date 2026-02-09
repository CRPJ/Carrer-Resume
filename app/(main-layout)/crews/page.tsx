"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/grid";
import "swiper/css/pagination";
import Animations from "@/components/shared/Animations";
import Breadcrumb from "@/components/shared/Breadcrumb";

interface Crew {
  id: string;
  name: string;
  gender: string;
  age: number | string;
  profileImg: string;
  university: string;
  major: string;
  team: string;
  part: string;
  nickname: string;
  club: string;
  universityMajor: string;
  status: string;
  growthStatus: string;
  totalStars: number;
  approvedWeeks: number;
}

const statusLabel = (status: string, growthStatus: string) => {
  if (status === "graduated") return "졸업";
  if (status === "suspended") return "활동 정지";
  if (growthStatus === "seasonal_rest") return "시즌 휴식";
  return "활동 중";
};

const page = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const res = await fetch("/api/crews");
        const result = await res.json();
        if (result.success) {
          setCrews(result.data);
        }
      } catch (err) {
        console.error("크루 목록 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrews();
  }, []);

  return (
    <main className="nftg-content nftg-content-home" style={{ padding: 0 }}>
      <Animations />
      <Breadcrumb title="크루 명단" />
      <section className="pb-120 trending trending-nft" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 30 }}>
        <div className="container-fluid" style={{ paddingLeft: 15, paddingRight: 15, maxWidth: '100%' }}>
          <div className="row">
            <div className="col-12">
              <div className="trending-slider-wrapper">
                {loading ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                    크루 목록을 불러오는 중...
                  </div>
                ) : crews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                    크루 데이터가 없습니다.
                  </div>
                ) : (
                  <Swiper
                    slidesPerView={2}
                    grid={{
                      rows: 3,
                      fill: "row",
                    }}
                    spaceBetween={24}
                    pagination={{
                      clickable: true,
                    }}
                    modules={[Grid, Pagination]}
                    breakpoints={{
                      700: {
                        slidesPerView: 3,
                        grid: { rows: 3, fill: "row" },
                      },
                      1200: {
                        slidesPerView: 4,
                        grid: { rows: 3, fill: "row" },
                      },
                      1600: {
                        slidesPerView: 6,
                        grid: { rows: 3, fill: "row" },
                      },
                    }}
                    className="trending-nft-slider swiper"
                    style={{ paddingBottom: 50 }}
                  >
                    {crews.map((crew) => (
                      <SwiperSlide key={crew.id} className="swiper-slide">
                        <div className="trending__single">
                          <div className="thumb">
                            <Link href={`/cluster-4?userId=${crew.id}`}>
                              {crew.profileImg ? (
                                <img
                                  src={crew.profileImg}
                                  alt={crew.name}
                                  style={{ width: "100%", height: "auto", objectFit: "cover" }}
                                />
                              ) : (
                                <div style={{
                                  width: "100%",
                                  aspectRatio: "1",
                                  background: "#1c242f",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#555",
                                  fontSize: 14,
                                }}>
                                  No Image
                                </div>
                              )}
                            </Link>
                          </div>
                          <div className="content-wrapper">
                            <div className="info">
                              <p className="text-sm fw-6">
                                <Link href={`/cluster-4?userId=${crew.id}`}>오랑캐</Link>
                                <span>{crew.universityMajor}</span>
                              </p>
                            </div>
                            <div className="trending__single-footer">
                              <div className="author">
                                <div className="author-meta">
                                  <Link href={`/cluster-4?userId=${crew.id}`} aria-label="view profile" title="view profile">
                                    <span className="hexagon-wrapper">
                                      {crew.profileImg ? (
                                        <img
                                          src={crew.profileImg}
                                          alt={crew.name}
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                      ) : (
                                        <span style={{ display: "block", width: "100%", height: "100%", background: "#1c242f" }} />
                                      )}
                                      <svg viewBox="-3 -3 106 106" xmlns="http://www.w3.org/2000/svg" fill="none" className="hexagon-border">
                                        <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
                                      </svg>
                                    </span>
                                    <span className="text-sm fw-6">{crew.name}</span>
                                  </Link>
                                </div>
                                <div className="author-title">
                                  <p className="text-uppercase text-xs fw-6">{statusLabel(crew.status, crew.growthStatus)}</p>
                                </div>
                              </div>
                              <div className="price-footer">
                                <div className="price-inner">
                                  <p className="price text-sm fw-6">
                                    {crew.totalStars}{" "}
                                    <span className="currency">단감</span>
                                  </p>
                                  <Link href={`/cluster-4?userId=${crew.id}`} className="btn--primary text-sm">
                                    Car
                                    <i className="ti ti-arrow-narrow-right"></i>
                                  </Link>
                                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                                    <path d="M0 0  L100 0  L100 65 L88 100 L0 100 Z" vectorEffect="non-scaling-stroke"></path>
                                  </svg>
                                </div>
                                <div className="review">
                                  <span className="text-sm fw-6">
                                    <i className="ti ti-calendar-check"></i>{crew.approvedWeeks}주
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
