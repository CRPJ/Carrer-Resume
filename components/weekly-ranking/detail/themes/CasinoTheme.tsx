"use client";

/* ============================================================
 * Weekly League 상세 — 테마 G "CYBER CASINO" (사이버 카지노)
 * 사이버펑크 카지노 홈 대시보드 무드:
 *   상단 월렛바 + 슬롯 히어로(우승 트로피 3) + 카테고리 칩 +
 *   프로모 카드 3 + NEW GAMES 그리드 + BETS 테이블 +
 *   BUYPLAY 샵 카드(크루) + 게임 프로바이더 스트립 + CTA.
 * 좌측 사이드바와 "HOME PAGE" 타이틀은 의도적으로 제외.
 * 데이터/인터랙션은 다른 테마(E NEON)와 동일 패리티 유지.
 * Scope: .weekly-casino 하위로만 한정.
 * ============================================================ */

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import type { WeeklyCardData } from "@/constants/dummyData/weekly-card-dummy";
import type { WeeklyDetailInfo } from "@/constants/dummyData/weekly-detail-dummy";

interface Props {
  card: WeeklyCardData;
  detail: WeeklyDetailInfo;
}

type LeadKey = "dan" | "injeol" | "growth" | "jeong";
const LEAD_DATA: Record<LeadKey, { name: string; rank: string; val: string }[]> = {
  dan: [
    { name: "김철수 (정1품 단감킹)", rank: "정1품", val: "98.4% 승률" },
    { name: "박민수 (정3품 단감소드)", rank: "정3품", val: "92.0% 승률" },
    { name: "이진아 (종2품 단감가디언)", rank: "종2품", val: "84.1% 승률" },
  ],
  injeol: [
    { name: "발라카스 지원 (정1품 인절미대장)", rank: "정1품", val: "99.1% 승률" },
    { name: "최지원 (종1품 인절미가드)", rank: "종1품", val: "89.7% 승률" },
    { name: "윤도현 (정3품 인절미전사)", rank: "정3품", val: "81.2% 승률" },
  ],
  growth: [
    { name: "발라카스 지원 (인절미)", rank: "TOP 1", val: "스탯 +24.5%" },
    { name: "김철수 (단감)", rank: "TOP 2", val: "스탯 +18.2%" },
    { name: "이영희 (단감)", rank: "TOP 3", val: "스탯 +12.9%" },
  ],
  jeong: [
    { name: "김철수 / 발라카스 지원", rank: "정1품 영의정", val: "최상위 품계" },
    { name: "이영희", rank: "정2품 우의정", val: "하이퍼 코어" },
    { name: "박민수 / 윤도현", rank: "정3품 참의", val: "가디언 클래스" },
  ],
};
const LEAD_TABS: { key: LeadKey; label: string; icon: string }[] = [
  { key: "dan", label: "단감 우수", icon: "fa-solid fa-bolt" },
  { key: "injeol", label: "인절미 우수", icon: "fa-solid fa-fire" },
  { key: "growth", label: "성장률 TOP", icon: "fa-solid fa-arrow-trend-up" },
  { key: "jeong", label: "품계 정승", icon: "fa-solid fa-crown" },
];

// 카지노 BETS 테이블용 — 위클리 의미로 매핑한 행 (게임=리그, 유저=크루, 멀티=성장률, 페이아웃=결과).
const BETS = [
  { league: "단감", icon: "fa-solid fa-bolt", time: "07:23:31 AM", user: "카이저 철수", bet: "5주차", mult: "x 7.401", payout: "성공", win: true },
  { league: "인절미", icon: "fa-solid fa-fire", time: "07:23:31 AM", user: "발라카스 지원", bet: "5주차", mult: "x 9.110", payout: "성공", win: true },
  { league: "어흥", icon: "fa-solid fa-skull", time: "07:23:31 AM", user: "데스나이트 민수", bet: "5주차", mult: "x 1.720", payout: "실패", win: false },
  { league: "단감", icon: "fa-solid fa-bolt", time: "07:22:14 AM", user: "이진아", bet: "5주차", mult: "x 4.210", payout: "성공", win: true },
  { league: "인절미", icon: "fa-solid fa-fire", time: "07:21:02 AM", user: "최지원", bet: "5주차", mult: "x 5.030", payout: "성공", win: true },
  { league: "어흥", icon: "fa-solid fa-skull", time: "07:20:48 AM", user: "윤도현", bet: "4주차", mult: "x 0.940", payout: "휴식", win: false },
];

type Crew = {
  key: string;
  name: string;
  level: string;
  badge: string;
  univ: string;
  major: string;
  team: string;
  part: string;
  status: string;
  league: string;
  result: string;
  rank: string;
  success: boolean;
  price: string;
  bars: { name: string; pct: number; count: string }[];
};

const CREWS: Crew[] = [
  {
    key: "철수", name: "카이저 철수", level: "단감 레벨", badge: "정3품 정승",
    univ: "서울대학교", major: "컴퓨터공학", team: "단감 수호대", part: "백엔드 아키텍처",
    status: "주차 활동", league: "단감", result: "성장(성공)", rank: "정3품 정승 명단", success: true, price: "+24.5%",
    bars: [
      { name: "주차 성장률", pct: 85, count: "5개" },
      { name: "실무 정보 강화율", pct: 90, count: "9개" },
      { name: "실무 역량 강화율", pct: 75, count: "3개" },
      { name: "실무 경험 강화율", pct: 80, count: "4개" },
      { name: "실무 경력 강화율", pct: 70, count: "2개" },
    ],
  },
  {
    key: "민수", name: "데스나이트 민수", level: "어흥 레벨", badge: "종2품 정승",
    univ: "고려대학교", major: "산업디자인", team: "인절미 어벤져스", part: "UX/UI 프론트",
    status: "성장(실패)", league: "어흥", result: "성장(실패)", rank: "종2품 판서 명단", success: false, price: "-08.2%",
    bars: [
      { name: "주차 성장률", pct: 35, count: "1개" },
      { name: "실무 정보 강화율", pct: 40, count: "2개" },
      { name: "실무 역량 강화율", pct: 50, count: "2개" },
      { name: "실무 경험 강화율", pct: 30, count: "1개" },
      { name: "실무 경력 강화율", pct: 20, count: "0개" },
    ],
  },
];

const PROGRESS_FILTERS = ["전체 리스트 보기", "주차 활동", "주차 휴식", "시즌 휴식"];
const RESULT_FILTERS = ["전체 결과 보기", "성장(성공)", "성장(실패)"];
const SORT_DEFAULT = "디폴트: 품계 순 ➔ 성장률 순 ➔ 이름 순";
const SORT_TRIGGERED = "정렬 연산 중: [1)누적주차 ➔ 2)성장률 ➔ 3)가나다 순]";

const PROVIDERS = [
  { name: "DANGAM", sub: "424 크루", tag: "단감 연맹" },
  { name: "INJEOLMI", sub: "525 크루", tag: "인절미 연맹", hot: true },
  { name: "EOHEUNG", sub: "424 크루", tag: "어흥 연맹" },
  { name: "ACADEMY", sub: "424 크루", tag: "아카데미 학적" },
  { name: "COUNCIL", sub: "424 크루", tag: "품계 정승단" },
];

export default function CasinoTheme({ card, detail }: Props) {
  const isOngoing =
    card.leagueRecordStatus === "대전 중" || card.leagueRecordStatus === "대전 집계";
  const successRate = isOngoing ? 0 : card.growthSuccessRate;
  const challengeRate = isOngoing ? 0 : card.growthChallengeRate;
  const numOrN = (v: number) => (isOngoing ? "N" : v.toLocaleString());

  const [leadTab, setLeadTab] = useState<LeadKey>("dan");
  const [betTab, setBetTab] = useState<"my" | "all">("all");
  const [progressIdx, setProgressIdx] = useState(0);
  const [resultIdx, setResultIdx] = useState(0);
  const [sortTriggered, setSortTriggered] = useState(false);
  const [modalCrew, setModalCrew] = useState<Crew | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({ 철수: true });
  const [adminDone, setAdminDone] = useState(false);

  const onFilter = (kind: "p" | "r", idx: number) => {
    if (kind === "p") setProgressIdx(idx);
    else setResultIdx(idx);
    setSortTriggered(true);
  };
  const resetOfficial = () => {
    setProgressIdx(0);
    setResultIdx(0);
    setSortTriggered(false);
    if (typeof window !== "undefined") {
      window.alert("SYSTEM: 공식 모드 인가 — 모든 커스텀 필터 리셋, 초기 정렬(품계/성장률/이름)로 회귀합니다.");
    }
  };
  const triggerCheck = () => {
    if (modalCrew) setChecked((p) => ({ ...p, [modalCrew.key]: true }));
    setModalCrew(null);
  };

  // ── 성장 분포 ──
  const compTotal = card.growthSuccess + card.growthFail + card.personalRest;
  const share = (n: number) => (compTotal > 0 ? Math.round((n / compTotal) * 100) : 0);
  const DIST = [
    { key: "success", label: "성공", count: card.growthSuccess, p: share(card.growthSuccess), tone: "win" },
    { key: "fail", label: "실패", count: card.growthFail, p: share(card.growthFail), tone: "lose" },
    { key: "rest", label: "휴식", count: card.personalRest, p: share(card.personalRest), tone: "rest" },
  ];

  // ── 우승 트로피(상단 히어로 우측) — 선택된 리더보드 TOP 3 ──
  const WINNERS = LEAD_DATA[leadTab].map((w, i) => ({ ...w, place: i + 1 }));
  const PLINKO = ["3000", "2000", "1000"];

  // ── NEW GAMES 그리드 = 카테고리 스탯 카드 ──
  const STAT_CARDS = [
    { key: "challenge", label: "주차 활동", value: numOrN(card.growthChallenge), icon: "fa-solid fa-bolt", tone: "cyan" },
    { key: "success", label: "성장 성공", value: numOrN(card.growthSuccess), icon: "fa-solid fa-trophy", tone: "gold" },
    { key: "fail", label: "성장 실패", value: numOrN(card.growthFail), icon: "fa-solid fa-skull", tone: "rose" },
    { key: "rest", label: "주차 휴식", value: numOrN(card.personalRest), icon: "fa-solid fa-moon", tone: "violet" },
    { key: "seasonRest", label: "시즌 휴식", value: numOrN(detail.seasonRestCrews), icon: "fa-solid fa-star", tone: "magenta" },
  ];

  return (
    <div className="weekly-casino">
      {/* 배경 데코 — 바이올렛 글로우 + 그리드 */}
      <div className="cas-bg" aria-hidden="true">
        <span className="cas-bg__orb cas-bg__orb--1" />
        <span className="cas-bg__orb cas-bg__orb--2" />
        <span className="cas-bg__grid" />
      </div>

      <div className="cas-stage">
        {/* ===== 상단 월렛바 (LOGIN / SIGN IN 라인 무드) ===== */}
        <header className="cas-topbar">
          <Link href="/weekly-ranking" className="cas-brand">
            <span className="cas-brand__mark"><i className="fa-solid fa-dice-d20" /></span>
            <span className="cas-brand__txt">CYBER<em>CASINO</em></span>
          </Link>
          <div className="cas-topbar__center">
            <span className="cas-wallet">
              <i className="fa-solid fa-coins" /> {card.weekNumber}<em>주차</em>
            </span>
            <span className={`cas-mode ${isOngoing ? "is-live" : ""}`}>{isOngoing ? "LIVE" : "FOR FUN"}</span>
            <span className="cas-wallet cas-wallet--ghost"><i className="fa-solid fa-wallet" /> WALLET</span>
          </div>
          <div className="cas-topbar__auth">
            <span className={`cas-pill cas-pill--ghost`}>{card.leagueResultStatus}</span>
            <span className={`cas-pill cas-pill--solid`}>{card.leagueRecordStatus}</span>
          </div>
        </header>

        {/* ===== SECTION 01 — 슬롯 히어로 + 우승 트로피 ===== */}
        <section className="cas-section">
          <div className="cas-hero">
            {/* 슬롯게임 배너 */}
            <div className="cas-hero__banner">
              <div className="cas-hero__media" aria-hidden="true">
                {card.imageUrl ? <img src={card.imageUrl} alt="" /> : <span className="cas-hero__ph"><i className="fa-solid fa-dice-d20" /></span>}
                <span className="cas-hero__scrim" />
                <span className="cas-hero__beam" />
              </div>
              <div className="cas-hero__body">
                <span className="cas-hero__eyebrow"><i className="fa-solid fa-gamepad" /> WEEKLY · LEAGUE</span>
                <h1 className="cas-hero__title">{card.seasonName}</h1>
                <p className="cas-hero__desc">{detail.overview}</p>
                <p className="cas-hero__date"><i className="fa-regular fa-clock" /> {card.dateRangeText}</p>
                <Link href="/weekly-ranking" className="cas-cta-btn"><i className="fa-solid fa-play" /> 리그 입장</Link>
              </div>
            </div>

            {/* 우승 트로피 3 (DAVID JONES 3000 PLINKO 스타일) */}
            <div className="cas-winners">
              <span className="cas-winners__cap"><i className="fa-solid fa-trophy" /> WINNERS</span>
              {WINNERS.map((w, i) => (
                <div key={i} className={`cas-winner cas-winner--${w.place}`}>
                  <span className="cas-winner__medal"><i className="fa-solid fa-trophy" /><em>{w.place}</em></span>
                  <span className="cas-winner__info">
                    <span className="cas-winner__name">{w.name}</span>
                    <span className="cas-winner__rank">{w.rank}</span>
                  </span>
                  <span className="cas-winner__amt">{isOngoing ? "N" : PLINKO[i]}<em>PT</em></span>
                </div>
              ))}
            </div>
          </div>

          {/* 카테고리 칩 = 리더보드 탭 */}
          <div className="cas-cats" role="tablist" aria-label="리더보드 카테고리">
            {LEAD_TABS.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={leadTab === t.key}
                className={`cas-cat ${leadTab === t.key ? "is-active" : ""}`} onClick={() => setLeadTab(t.key)}>
                <i className={t.icon} /> {t.label}
              </button>
            ))}
          </div>

          {/* 프로모 카드 3 = 핵심 지표 */}
          <div className="cas-promos">
            <div className="cas-promo cas-promo--purple">
              <span className="cas-promo__badge">{isOngoing ? "N" : successRate}%</span>
              <span className="cas-promo__title">WEEKLY 성장 성공율</span>
              <span className="cas-promo__sub">SUCCESS RATE</span>
              <div className="cas-promo__bar"><span style={{ width: `${successRate}%` }} /></div>
            </div>
            <div className="cas-promo cas-promo--cyan">
              <span className="cas-promo__big">{isOngoing ? "N" : challengeRate}<em>%</em></span>
              <span className="cas-promo__title">성장 도전율</span>
              <span className="cas-promo__sub">CHALLENGE · REVENUE SHARE</span>
            </div>
            <div className="cas-promo cas-promo--magenta">
              <span className="cas-promo__title cas-promo__title--lg">성장 분포</span>
              <div className="cas-promo__dist">
                {DIST.map((d) => (
                  <div key={d.key} className={`cas-dist cas-dist--${d.tone}`}>
                    <span className="cas-dist__dot" aria-hidden="true" />
                    <span className="cas-dist__label">{d.label}</span>
                    <span className="cas-dist__bar"><span style={{ width: `${isOngoing ? 0 : d.p}%` }} /></span>
                    <span className="cas-dist__val">{isOngoing ? "N" : `${d.count}명·${d.p}%`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 02 — NEW GAMES 그리드 (카테고리 스탯) ===== */}
        <section className="cas-section">
          <h2 className="cas-shead">NEW <em>STATS</em></h2>
          <div className="cas-games">
            {STAT_CARDS.map((s) => (
              <div key={s.key} className={`cas-game cas-game--${s.tone}`}>
                <span className="cas-game__art" aria-hidden="true"><i className={s.icon} /></span>
                <span className="cas-game__name">{s.label}</span>
                <span className="cas-game__playing"><span className="cas-game__live" /> {s.value}명 집계</span>
              </div>
            ))}
          </div>

          {/* 개요 + 사회 소식 */}
          <div className="cas-info">
            <div className="cas-panel cas-overview">
              <span className="cas-panel__cap"><i className="fa-solid fa-quote-left" /> 전술 주차 개요</span>
              <p>{detail.overview}</p>
            </div>
            <div className="cas-panel cas-news">
              <span className="cas-panel__cap"><i className="fa-solid fa-satellite-dish" /> 주차 사회 소식</span>
              {detail.socialNews.map((n, i) => (
                <div key={i} className="cas-news__item">
                  <span className="cas-news__idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cas-news__cat">{n.category}</span>
                  <span className="cas-news__title">{n.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 03 — MY BETS / ALL BETS 테이블 (리더보드) ===== */}
        <section className="cas-section">
          <div className="cas-bets-tabs">
            <button className={`cas-bets-tab ${betTab === "my" ? "is-active" : ""}`} onClick={() => setBetTab("my")}>MY BETS</button>
            <button className={`cas-bets-tab ${betTab === "all" ? "is-active" : ""}`} onClick={() => setBetTab("all")}>ALL BETS</button>
          </div>
          <div className="cas-table" role="table" aria-label="크루 대전 기록">
            <div className="cas-table__head" role="row">
              <span>리그</span><span>시각</span><span>크루</span><span>주차</span><span className="is-c">성장률</span><span className="is-r">결과</span>
            </div>
            {(betTab === "my" ? BETS.slice(0, 2) : BETS).map((b, i) => (
              <div key={i} className={`cas-table__row ${b.win ? "is-win" : "is-lose"}`} role="row">
                <span className="cas-table__game"><i className={b.icon} /> {b.league}</span>
                <span className="cas-table__time">{b.time}</span>
                <span className="cas-table__user"><span className="cas-table__av" aria-hidden="true"><i className="fa-solid fa-user-astronaut" /></span>{b.user}</span>
                <span className="cas-table__bet">{b.bet}</span>
                <span className="cas-table__mult is-c">{b.mult}</span>
                <span className={`cas-table__payout is-r ${b.win ? "is-win" : "is-lose"}`}>{b.payout}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 04 — BUYPLAY SHOP (크루 매트릭스) ===== */}
        <section className="cas-section">
          <h2 className="cas-shead">CREW <em>MATRIX</em></h2>

          <div className="cas-filters">
            <div className="cas-filters__row">
              <span className="cas-filters__label">주차 진행</span>
              {PROGRESS_FILTERS.map((f, i) => (
                <button key={f} className={`cas-fbtn ${progressIdx === i ? "is-active" : ""}`} onClick={() => onFilter("p", i)}>{f}</button>
              ))}
            </div>
            <div className="cas-filters__row">
              <span className="cas-filters__label">주차 결과</span>
              {RESULT_FILTERS.map((f, i) => (
                <button key={f} className={`cas-fbtn ${resultIdx === i ? "is-active" : ""}`} onClick={() => onFilter("r", i)}>{f}</button>
              ))}
            </div>
            <div className="cas-filters__row cas-filters__row--sort">
              <span className={`cas-sorttag ${sortTriggered ? "is-trig" : ""}`}>{sortTriggered ? SORT_TRIGGERED : SORT_DEFAULT}</span>
              <button className="cas-official" onClick={resetOfficial}><i className="fa-solid fa-rotate" /> 공식 모드 전환</button>
            </div>
          </div>

          <div className="cas-shop">
            {CREWS.map((c) => (
              <div key={c.key} className={`cas-shopcard ${c.success ? "is-success" : "is-fail"}`} onClick={() => setModalCrew(c)}>
                <span className="cas-shopcard__top">
                  <span className="cas-shopcard__badge">{c.badge}</span>
                  <span className={`cas-shopcard__price ${c.success ? "is-win" : "is-lose"}`}>{c.price}</span>
                </span>
                <div className="cas-shopcard__head">
                  <span className={`cas-shopcard__av ${c.success ? "is-success" : "is-fail"}`}><i className="fa-solid fa-user-ninja" /></span>
                  <div className="cas-shopcard__id">
                    <span className="cas-shopcard__name">{c.name} <em>({c.level})</em></span>
                    <span className="cas-shopcard__sub">{c.univ} {c.major} · 누적 {card.weekNumber}주차</span>
                  </div>
                  <span className={`cas-shopcard__result ${c.success ? "is-win" : "is-lose"}`}>{c.result}</span>
                </div>
                <div className="cas-shopcard__line">팀: {c.team} · 파트: {c.part} · 상태: {c.status}</div>
                <div className="cas-shopcard__bars">
                  {c.bars.map((b, bi) => (
                    <div key={bi} className="cas-shopcard__bar">
                      <span className="cas-shopcard__bname">{b.name}</span>
                      <span className="cas-shopcard__btrack"><span className="cas-shopcard__bfill" style={{ width: `${b.pct}%` }} /></span>
                      <span className="cas-shopcard__bcount">{b.count}</span>
                    </div>
                  ))}
                </div>
                {(checked[c.key] || (adminDone && c.key === "철수")) && (
                  <div className="cas-shopcard__stamps">
                    {checked[c.key] && <span className="cas-stamp is-checked"><i className="fa-solid fa-circle-check" /> 위클리 검증 완료</span>}
                    {adminDone && c.key === "철수" && <span className="cas-stamp is-admin"><i className="fa-solid fa-fingerprint" /> 행정 확인 완료</span>}
                  </div>
                )}
                <span className="cas-shopcard__buy"><i className="fa-solid fa-magnifying-glass" /> 위클리 카드 열기</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 05 — 행정 게이트 ===== */}
        <section className="cas-section">
          <h2 className="cas-shead">행정 <em>ADMINISTRATION</em></h2>
          <div className="cas-admin">
            <div className="cas-panel cas-admin__notice">
              <div className="cas-admin__title"><i className="fa-solid fa-circle-exclamation" /> 행정 데이터 최종 확약 안내문</div>
              <p>연동 성과 지표를 검토 후 <strong>매주 금요일 14:00까지</strong> 행정 확정 서명을 인가하십시오. 조정 문의는 <strong>당일 22:00까지</strong> 제출해야 반영됩니다.</p>
              <table className="cas-deftable">
                <thead><tr><th>구분</th><th>확인 불가 (Fail)</th><th>확인 가능 (Pass)</th></tr></thead>
                <tbody>
                  <tr><td><strong>캡처/날짜</strong></td><td>시각 정보 누락, 본문 일부만 전송</td><td>타임스탬프 + 식별 코드 동시 노출 전체 화면</td></tr>
                  <tr><td><strong>증빙 행동</strong></td><td>&quot;성실하게 완증함&quot; 기재</td><td>&quot;부하 분산 스크립트 설계 후 12회 디버깅 통과&quot;</td></tr>
                </tbody>
              </table>
            </div>
            <div className="cas-panel cas-admin__sign">
              <div>
                <div className="cas-admin__title cas-admin__title--magenta"><i className="fa-solid fa-fingerprint" /> 암호화 전산 행정 확인 승인</div>
                <p className="cas-admin__desc">현재 세션의 실무 스탯 검증 데이터를 최종 원본으로 동의하며 리더보드 점수 락다운을 승인합니다.</p>
              </div>
              <div className="cas-admin__btns">
                <button className="cas-btn cas-btn--magenta" onClick={() => { setAdminDone(true); if (typeof window !== "undefined") window.alert("AUTHENTICATED: 카이저 철수 크루 행정 확인 서명 완료 — 목록에 [행정 확인] 상태가 반영되었습니다."); }}>
                  본인 위클리 카드 행정 확인 서명
                </button>
                <button className="cas-btn cas-btn--ghost" onClick={() => { if (typeof window !== "undefined") window.alert("조정 문의 전용 게시판으로 이동합니다."); }}>
                  조정 이의 신청 게시판 이동
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 게임 프로바이더 스트립 (리그 연맹) ===== */}
        <section className="cas-section">
          <h2 className="cas-shead">LEAGUE <em>PARTNERS</em></h2>
          <div className="cas-providers">
            {PROVIDERS.map((p) => (
              <div key={p.name} className={`cas-provider ${p.hot ? "is-hot" : ""}`}>
                {p.hot && <span className="cas-provider__hot">525 크루</span>}
                <span className="cas-provider__name">{p.name}</span>
                <span className="cas-provider__sub">{p.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== LETS GET STARTED CTA ===== */}
        <div className="cas-getstarted">
          <span className="cas-getstarted__glow" aria-hidden="true" />
          <div className="cas-getstarted__txt">
            <span className="cas-getstarted__eyebrow">READY FOR NEXT WEEK?</span>
            <strong className="cas-getstarted__title">LET&apos;S GET STARTED</strong>
            <span className="cas-getstarted__sub">IT ONLY TAKES A MINUTE</span>
          </div>
          <Link href="/weekly-ranking" className="cas-btn cas-btn--magenta cas-getstarted__btn">
            <i className="fa-solid fa-angle-left" /> BACK TO LEAGUE
          </Link>
        </div>
      </div>

      {/* 위클리 카드 모달 */}
      <div className={`cas-modal ${modalCrew ? "is-open" : ""}`} onClick={() => setModalCrew(null)}>
        {modalCrew && (
          <div className="cas-modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="cas-modal__head">
              <h3><i className="fa-solid fa-id-badge" /> CARD · {modalCrew.name}</h3>
              <button className="cas-modal__close" onClick={() => setModalCrew(null)} aria-label="닫기">×</button>
            </div>
            <table className="cas-deftable">
              <tbody>
                <tr><td><strong>품계 레이어</strong></td><td><span className="cas-modal__hl">{modalCrew.rank}</span></td></tr>
                <tr><td><strong>아카데미 학적</strong></td><td>{modalCrew.univ} {modalCrew.major}</td></tr>
                <tr><td><strong>소속 연맹 리그</strong></td><td>하이브리드: {modalCrew.league}</td></tr>
                <tr><td><strong>주차 스코어 결과</strong></td><td>{card.weekNumber}주차 ({modalCrew.result})</td></tr>
              </tbody>
            </table>
            <p className="cas-modal__note">※ [주차 내용 확인 체크] 승인 시 그리드 및 위클리 리스트 카드에 크로스 체크 마크가 전사됩니다.</p>
            <div className="cas-modal__btns">
              <button className="cas-btn cas-btn--magenta" onClick={triggerCheck}><i className="fa-solid fa-square-check" /> 주차 내용 확인 체크 (OK)</button>
              <button className="cas-btn cas-btn--ghost" onClick={() => setModalCrew(null)}>취소</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}