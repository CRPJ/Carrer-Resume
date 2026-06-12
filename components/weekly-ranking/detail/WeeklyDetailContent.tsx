"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WEEKLY_CARD_DUMMY, type WeeklyCardData } from "@/constants/dummyData/weekly-card-dummy";
import { getWeeklyDetailInfo } from "@/constants/dummyData/weekly-detail-dummy";
import { apiToCardData, type ApiCard } from "../apiToCardData";
import { isDemoMode } from "@/utils/isDemoMode";
import RagnarokTheme from "./themes/RagnarokTheme";
import CyberTheme from "./themes/CyberTheme";
import SteampunkTheme from "./themes/SteampunkTheme";

interface Props {
  weekId: string;
}

const getChipTone = (status: string): string => {
  switch (status) {
    case "정상 진행":
    case "검수 완료":
      return "wa-chip--green";
    case "심화 진행":
    case "대전 집계":
      return "wa-chip--gold";
    case "공식 휴식":
    case "대전 휴식":
      return "wa-chip--muted";
    case "대전 중":
      return "wa-chip--cyan";
    case "공표 중":
      return "wa-chip--purple";
    default:
      return "wa-chip--muted";
  }
};

// 원형 게이지 SVG geometry.
const GAUGE_R = 54;
const GAUGE_C = 2 * Math.PI * GAUGE_R;

export default function WeeklyDetailContent({ weekId }: Props) {
  const [demo, setDemo] = useState(false);
  const [demoResolved, setDemoResolved] = useState(false);
  const [apiCards, setApiCards] = useState<WeeklyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<"t1" | "t2" | "t3" | "t4">("t1");

  useEffect(() => {
    setDemo(isDemoMode());
    setDemoResolved(true);
    // 디자인 비교용 — 선택한 테마를 localStorage 에 보존(새로고침/이동에도 유지).
    try {
      const saved = localStorage.getItem("weeklyArenaTheme");
      if (saved === "t1" || saved === "t2" || saved === "t3" || saved === "t4") setTheme(saved);
    } catch {
      /* localStorage 접근 불가 환경 무시 */
    }
  }, []);

  const selectTheme = (t: "t1" | "t2" | "t3" | "t4") => {
    setTheme(t);
    try {
      localStorage.setItem("weeklyArenaTheme", t);
    } catch {
      /* noop */
    }
  };

  const THEME_OPTIONS = [
    { id: "t1" as const, key: "A", label: "ARENA" },
    { id: "t2" as const, key: "B", label: "RAGNAROK" },
    { id: "t3" as const, key: "C", label: "체스판" },
    { id: "t4" as const, key: "D", label: "STEAMPUNK" },
  ];

  // 모든 테마 위에 항상 떠 있는 디자인 전환 스위처(테마 독립 스타일).
  const switcher = (
    <div className="wd-theme-switch" role="group" aria-label="디자인 테마 선택">
      <span className="wd-theme-switch__caption">DESIGN</span>
      {THEME_OPTIONS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`wd-theme-switch__btn wd-theme-switch__btn--${t.id} ${theme === t.id ? "is-active" : ""}`}
          onClick={() => selectTheme(t.id)}
          aria-pressed={theme === t.id}
        >
          <span className="wd-theme-switch__dot" aria-hidden="true" />
          {t.key} · {t.label}
        </button>
      ))}
    </div>
  );

  useEffect(() => {
    if (!demoResolved) return;
    if (demo) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/weekly-cards", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (!json?.success) {
          console.error("[weekly-detail] api error:", json?.error);
          setApiCards([]);
          return;
        }
        const cards: ApiCard[] = json?.data?.cards || [];
        setApiCards(cards.map(apiToCardData));
      } catch (e) {
        if (cancelled) return;
        console.error("[weekly-detail] fetch error:", e);
        setApiCards([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demo, demoResolved]);

  const card = useMemo<WeeklyCardData | undefined>(() => {
    const source = demo ? WEEKLY_CARD_DUMMY : apiCards;
    return source.find((c) => c.id === weekId);
  }, [demo, apiCards, weekId]);

  const detail = useMemo(
    () => (card ? getWeeklyDetailInfo(card.seasonName) : null),
    [card]
  );

  if (isLoading) {
    return (
      <div className="weekly-arena weekly-arena--loading">
        <div className="wa-skeleton wa-skeleton--hero" aria-hidden="true" />
        <div className="wa-skeleton wa-skeleton--block" aria-hidden="true" />
        <div className="wa-skeleton wa-skeleton--block" aria-hidden="true" />
      </div>
    );
  }

  if (!card || !detail) {
    return (
      <div className="weekly-arena">
        <div className="wa-notfound">
          <span className="wa-notfound__glyph" aria-hidden="true"><i className="ti ti-ghost-2" /></span>
          <p>해당 주차 정보를 찾을 수 없습니다.</p>
          <Link href="/weekly-ranking" className="wa-back">
            <i className="ti ti-arrow-left" /> 위클리 리그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 테마 B/C 는 완전히 다른 마크업을 가진 별도 컴포넌트로 렌더 (스위처는 항상 위에).
  if (theme === "t2") {
    return (
      <>
        {switcher}
        <RagnarokTheme card={card} detail={detail} />
      </>
    );
  }
  if (theme === "t3") {
    return (
      <>
        {switcher}
        <CyberTheme card={card} detail={detail} />
      </>
    );
  }
  if (theme === "t4") {
    return (
      <>
        {switcher}
        <SteampunkTheme card={card} detail={detail} />
      </>
    );
  }

  const isOngoing =
    card.leagueRecordStatus === "대전 중" || card.leagueRecordStatus === "대전 집계";

  const numOrN = (value: number) => (isOngoing ? "N" : value.toLocaleString());

  const successPct = isOngoing ? 0 : card.growthSuccessRate;
  const gaugeOffset = GAUGE_C * (1 - successPct / 100);

  // 능력치 바 — 실제 지표(성장 성공율/도전율)를 RPG 스탯 바로 도식화.
  const abilities = [
    { key: "success", label: "성장 성공율", icon: "ti ti-trophy", tone: "purple", value: isOngoing ? 0 : card.growthSuccessRate },
    { key: "challenge", label: "성장 도전율", icon: "ti ti-flame", tone: "cyan", value: isOngoing ? 0 : card.growthChallengeRate },
  ];

  // 성장 분포 도식 — 성공/실패/휴식 비중을 누적 막대 + 범례로 시각화.
  const compTotal = card.growthSuccess + card.growthFail + card.personalRest;
  const share = (n: number) => (compTotal > 0 ? (n / compTotal) * 100 : 0);
  const pct = (n: number) => (compTotal > 0 ? Math.round((n / compTotal) * 100) : 0);
  const distribution = [
    { key: "success", label: "성공", count: card.growthSuccess, w: isOngoing ? 0 : share(card.growthSuccess), p: pct(card.growthSuccess) },
    { key: "fail", label: "실패", count: card.growthFail, w: isOngoing ? 0 : share(card.growthFail), p: pct(card.growthFail) },
    { key: "rest", label: "휴식", count: card.personalRest, w: isOngoing ? 0 : share(card.personalRest), p: pct(card.personalRest) },
  ];

  const stats = [
    { key: "challenge", label: "주차 활동", value: numOrN(card.growthChallenge), icon: "ti ti-flame", tone: "cyan" },
    { key: "success", label: "성장 성공", value: numOrN(card.growthSuccess), icon: "ti ti-trophy", tone: "gold" },
    { key: "fail", label: "성장 실패", value: numOrN(card.growthFail), icon: "ti ti-skull", tone: "red" },
    { key: "rest", label: "주차 휴식", value: numOrN(card.personalRest), icon: "ti ti-zzz", tone: "muted" },
    { key: "seasonRest", label: "시즌 휴식", value: numOrN(detail.seasonRestCrews), icon: "ti ti-moon-stars", tone: "purple" },
  ];

  const gemTiers = ["green", "gold", "cyan", "purple", "magenta"];

  return (
    <>
    {switcher}
    <div className="weekly-arena">
      {/* 배경 데코 — 오로라 글로우 + 그리드 */}
      <div className="weekly-arena__aurora" aria-hidden="true">
        <span className="weekly-arena__orb weekly-arena__orb--1" />
        <span className="weekly-arena__orb weekly-arena__orb--2" />
        <span className="weekly-arena__orb weekly-arena__orb--3" />
        <span className="weekly-arena__grid" />
      </div>

      {/* 상단 네비 */}
      <div className="wa-topnav">
        <Link href="/weekly-ranking" className="wa-back">
          <i className="ti ti-arrow-left" /> 위클리 리그
        </Link>
      </div>

      {/* ══════════ HERO 배너 ══════════ */}
      <header className="wa-hero">
        <div className="wa-hero__media" aria-hidden="true">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt=""
              fill
              sizes="100vw"
              className="wa-hero__media-img"
              priority
            />
          ) : (
            <div className="wa-hero__media-fallback" />
          )}
          <div className="wa-hero__scrim" />
          <span className="wa-hero__shine" />
          <span className="wa-hero__spark wa-hero__spark--1" />
          <span className="wa-hero__spark wa-hero__spark--2" />
          <span className="wa-hero__spark wa-hero__spark--3" />
        </div>

        <div className="wa-hero__inner">
          <div className="wa-hero__body">
            <span className="wa-hero__eyebrow">
              <i className="ti ti-trophy" /> WEEKLY&nbsp;LEAGUE
            </span>
            <h1 className="wa-hero__title">{card.seasonName}</h1>
            <p className="wa-hero__date">
              <i className="ti ti-calendar-event" /> {card.dateRangeText}
            </p>
            <div className="wa-hero__badges">
              <span className={`wa-chip ${getChipTone(card.leagueResultStatus)}`}>
                <i className="ti ti-shield-bolt" /> {card.leagueResultStatus}
              </span>
              <span className={`wa-chip ${getChipTone(card.leagueRecordStatus)}`}>
                <i className="ti ti-swords" /> {card.leagueRecordStatus}
              </span>
            </div>
          </div>

          {/* 전체 성장 성공율 — 원형 게이지 [1.11] */}
          <div className="wa-hero__gauge">
            <svg viewBox="0 0 128 128" className="wa-gauge">
              <defs>
                <linearGradient id="waGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffe9a8" />
                  <stop offset="55%" stopColor="#ffce4f" />
                  <stop offset="100%" stopColor="#ff9d3f" />
                </linearGradient>
              </defs>
              <circle className="wa-gauge__track" cx="64" cy="64" r={GAUGE_R} />
              <circle
                className="wa-gauge__fill"
                cx="64"
                cy="64"
                r={GAUGE_R}
                strokeDasharray={GAUGE_C}
                strokeDashoffset={gaugeOffset}
                transform="rotate(-90 64 64)"
              />
            </svg>
            <div className="wa-gauge__center">
              <span className="wa-gauge__value">
                {isOngoing ? "N" : card.growthSuccessRate}
                <em>%</em>
              </span>
              <span className="wa-gauge__label">성장 성공율</span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ 섹션 1. 주차 정보 ══════════ */}
      <section className="wa-section" aria-label="주차 정보">
        <div className="wa-shead">
          <span className="wa-shead__no">01</span>
          <div className="wa-shead__txt">
            <h2>주차 정보</h2>
            <span>WEEKLY OVERVIEW</span>
          </div>
          <span className="wa-shead__line" aria-hidden="true" />
        </div>

        {/* 주차 개요 [1.3] */}
        <div className="wa-panel wa-overview">
          <span className="wa-corner wa-corner--tl" aria-hidden="true" />
          <span className="wa-corner wa-corner--br" aria-hidden="true" />
          <span className="wa-overview__quote" aria-hidden="true"><i className="ti ti-quote" /></span>
          <p className="wa-overview__text">{detail.overview}</p>
        </div>

        {/* 전황 분석 — 능력치 바 + 성장 분포 도식 */}
        <div className="wa-analytics">
          {/* 능력치 바 */}
          <div className="wa-panel wa-abilities">
            <div className="wa-block-head">
              <i className="ti ti-chart-bar" />
              <span>능력치</span>
              <em>ABILITY</em>
            </div>
            {abilities.map((a) => (
              <div key={a.key} className={`wa-ability wa-ability--${a.tone}`}>
                <div className="wa-ability__top">
                  <span className="wa-ability__name">
                    <i className={a.icon} /> {a.label}
                  </span>
                  <span className="wa-ability__val">
                    {isOngoing ? "N" : a.value}<em>%</em>
                  </span>
                </div>
                <div className="wa-ability__track">
                  <div className="wa-ability__fill" style={{ width: `${a.value}%` }}>
                    <span className="wa-ability__stripe" aria-hidden="true" />
                    <span className="wa-ability__knob" aria-hidden="true" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 성장 분포 도식 */}
          <div className="wa-panel wa-distribution">
            <div className="wa-block-head">
              <i className="ti ti-chart-pie-2" />
              <span>성장 분포</span>
              <em>DISTRIBUTION</em>
            </div>
            <div className="wa-distbar" role="img" aria-label="성장 성공·실패·휴식 분포">
              {distribution.map((d) => (
                <span
                  key={d.key}
                  className={`wa-distbar__seg wa-distbar__seg--${d.key}`}
                  style={{ width: `${d.w}%` }}
                />
              ))}
            </div>
            <div className="wa-distlegend">
              {distribution.map((d) => (
                <div key={d.key} className={`wa-distlegend__row wa-distlegend__row--${d.key}`}>
                  <span className="wa-distlegend__dot" aria-hidden="true" />
                  <span className="wa-distlegend__label">{d.label}</span>
                  <span className="wa-distlegend__count">{isOngoing ? "N" : d.count.toLocaleString()}명</span>
                  <span className="wa-distlegend__pct">{isOngoing ? "N" : d.p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 크루 통계 [1.4~1.8] */}
        <div className="wa-stats">
          {stats.map((s) => (
            <div key={s.key} className={`wa-stat wa-stat--${s.tone}`}>
              <span className="wa-stat__glow" aria-hidden="true" />
              <span className="wa-stat__icon" aria-hidden="true">
                <i className={s.icon} />
              </span>
              <span className="wa-stat__value">
                {s.value}<em>명</em>
              </span>
              <span className="wa-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* 주차 사회 소식 3개 [1.10] */}
        <div className="wa-subhead">
          <i className="ti ti-broadcast" />
          <span>이 주의 사회 소식</span>
        </div>
        <div className="wa-news">
          {detail.socialNews.map((news, i) => (
            <article key={i} className="wa-news__card">
              <span className="wa-news__idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="wa-news__cat">{news.category}</span>
              <p className="wa-news__title">{news.title}</p>
              <span className="wa-news__src">
                <i className="ti ti-news" /> {news.source}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════ 다음 콘텐츠 미리보기 (섹션 2~4) ══════════ */}
      <div className="wa-shead">
        <span className="wa-shead__no">★</span>
        <div className="wa-shead__txt">
          <h2>곧 열릴 콘텐츠</h2>
          <span>COMING SOON</span>
        </div>
        <span className="wa-shead__line" aria-hidden="true" />
      </div>

      <div className="wa-preview">
        {/* Section 2 — League Rankings 포디움 */}
        <section className="wa-prev wa-prev--podium" aria-label="크루 & 팀">
          <header className="wa-prev__head">
            <span className="wa-prev__no" aria-hidden="true">02</span>
            <div>
              <h3>크루 &amp; 팀</h3>
              <em>LEAGUE RANKINGS</em>
            </div>
          </header>
          <div className="wa-podium" aria-hidden="true">
            <div className="wa-podium__col wa-podium__col--2">
              <span className="wa-podium__trophy"><i className="ti ti-trophy" /></span>
              <span className="wa-podium__step"><span className="wa-podium__rank">2</span></span>
            </div>
            <div className="wa-podium__col wa-podium__col--1">
              <span className="wa-podium__crown"><i className="ti ti-crown" /></span>
              <span className="wa-podium__trophy"><i className="ti ti-trophy" /></span>
              <span className="wa-podium__step"><span className="wa-podium__rank">1</span></span>
            </div>
            <div className="wa-podium__col wa-podium__col--3">
              <span className="wa-podium__trophy"><i className="ti ti-trophy" /></span>
              <span className="wa-podium__step"><span className="wa-podium__rank">3</span></span>
            </div>
          </div>
          <p className="wa-prev__desc">단감·인절미 우수 크루, 품계 정승 명단, 팀별 성장 통계 및 승패</p>
          <span className="wa-prev__tag">COMING SOON</span>
        </section>

        {/* Section 3 — Rank 메달 & 젬 티어 */}
        <section className="wa-prev wa-prev--rank" aria-label="크루 목록">
          <header className="wa-prev__head">
            <span className="wa-prev__no" aria-hidden="true">03</span>
            <div>
              <h3>크루 목록</h3>
              <em>CREW RANKING</em>
            </div>
          </header>
          <div className="wa-gems" aria-hidden="true">
            {gemTiers.map((t, i) => (
              <span key={i} className={`wa-gem wa-gem--${t}`} />
            ))}
          </div>
          <div className="wa-medals" aria-hidden="true">
            <span className="wa-medal wa-medal--gold"><i className="ti ti-award" /></span>
            <span className="wa-medal wa-medal--cyan"><i className="ti ti-shield-star" /></span>
            <span className="wa-medal wa-medal--red"><i className="ti ti-flame" /></span>
            <span className="wa-medal wa-medal--green"><i className="ti ti-rosette" /></span>
          </div>
          <p className="wa-prev__desc">필터·정렬 가능한 전체 크루 랭킹 — 클릭 시 개인 위클리 카드로 이동</p>
          <span className="wa-prev__tag">COMING SOON</span>
        </section>

        {/* Section 4 — Administrative Center 양피지 스크롤 */}
        <section className="wa-prev wa-prev--admin" aria-label="행정 처리">
          <header className="wa-prev__head">
            <span className="wa-prev__no" aria-hidden="true">04</span>
            <div>
              <h3>행정 처리</h3>
              <em>ADMINISTRATION</em>
            </div>
          </header>
          <div className="wa-scroll" aria-hidden="true">
            <span className="wa-scroll__title">Administrative Center</span>
            <span className="wa-scroll__sub">TIMER</span>
            <span className="wa-scroll__timer">00 : 12 : 07 : 02</span>
            <span className="wa-scroll__ok">OK</span>
            <div className="wa-scroll__judge">
              <span className="wa-scroll__good">GOOD</span>
              <span className="wa-scroll__bad">BAD</span>
            </div>
          </div>
          <p className="wa-prev__desc">주차 내용 확인 체크, 행정 확인, 조정 문의 게시판</p>
          <span className="wa-prev__tag">COMING SOON</span>
        </section>
      </div>
    </div>
    </>
  );
}
