"use client";

/* ============================================================
 * Weekly League 상세 — 테마 E "NEON ARCADE" (네온 아케이드)
 * 딥 바이올렛 배경 + 네온 마젠타/시안 글로우, 글래스 게임 카드.
 * 슬롯게임 대시보드 무드(아웃라인 마스트헤드 + 잭팟 미터 + CTA 배너).
 * 데이터/인터랙션은 다른 테마와 동일 패리티 유지.
 * Scope: .weekly-neon 하위로만 한정.
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
const LEAD_DATA: Record<LeadKey, { rank: string; name: string; val: string }[]> = {
  dan: [
    { rank: "RANK 1", name: "김철수 (정1품 단감킹)", val: "98.4% 승률" },
    { rank: "RANK 2", name: "박민수 (정3품 단감소드)", val: "92.0% 승률" },
    { rank: "RANK 3", name: "이진아 (종2품 단감가디언)", val: "84.1% 승률" },
  ],
  injeol: [
    { rank: "RANK 1", name: "발라카스 지원 (정1품 인절미대장)", val: "99.1% 승률" },
    { rank: "RANK 2", name: "최지원 (종1품 인절미가드)", val: "89.7% 승률" },
    { rank: "RANK 3", name: "윤도현 (정3품 인절미전사)", val: "81.2% 승률" },
  ],
  growth: [
    { rank: "TOP 1", name: "발라카스 지원 (인절미)", val: "스탯 폭발 +24.5%" },
    { rank: "TOP 2", name: "김철수 (단감)", val: "스탯 성장 +18.2%" },
    { rank: "TOP 3", name: "이영희 (단감)", val: "스탯 준수 +12.9%" },
  ],
  jeong: [
    { rank: "정1품 영의정", name: "김철수 / 발라카스 지원", val: "최상위 품계 클래스" },
    { rank: "정2품 우의정", name: "이영희", val: "하이퍼 코어 클래스" },
    { rank: "정3품 참의", name: "박민수 / 윤도현", val: "가디언 클래스" },
  ],
};
const LEAD_TABS: { key: LeadKey; label: string }[] = [
  { key: "dan", label: "단감 우수" },
  { key: "injeol", label: "인절미 우수" },
  { key: "growth", label: "성장률 TOP" },
  { key: "jeong", label: "품계 정승" },
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
  bars: { name: string; pct: number; count: string }[];
};

const CREWS: Crew[] = [
  {
    key: "철수", name: "카이저 철수", level: "단감 레벨", badge: "정3품 정승",
    univ: "서울대학교", major: "컴퓨터공학", team: "단감 수호대", part: "백엔드 아키텍처",
    status: "주차 활동", league: "단감", result: "성장(성공)", rank: "정3품 정승 명단", success: true,
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
    status: "성장(실패)", league: "어흥", result: "성장(실패)", rank: "종2품 판서 명단", success: false,
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

export default function NeonTheme({ card, detail }: Props) {
  const isOngoing =
    card.leagueRecordStatus === "대전 중" || card.leagueRecordStatus === "대전 집계";
  const successRate = isOngoing ? 0 : card.growthSuccessRate;
  const numOrN = (v: number) => (isOngoing ? "N" : v.toLocaleString());

  const [leadTab, setLeadTab] = useState<LeadKey>("dan");
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

  // ── 잭팟 미터(상단 큰 게이지) ──
  const METER = [
    { key: "rate", label: "성장 성공율", val: successRate, tone: "magenta" },
    { key: "challenge", label: "성장 도전율", val: isOngoing ? 0 : card.growthChallengeRate, tone: "cyan" },
  ];

  // ── 네온 카테고리 스탯 카드 ──
  const STAT_CARDS = [
    { key: "challenge", label: "주차 활동", value: numOrN(card.growthChallenge), icon: "fa-solid fa-bolt", tone: "cyan" },
    { key: "success", label: "성장 성공", value: numOrN(card.growthSuccess), icon: "fa-solid fa-trophy", tone: "gold" },
    { key: "fail", label: "성장 실패", value: numOrN(card.growthFail), icon: "fa-solid fa-skull", tone: "rose" },
    { key: "rest", label: "주차 휴식", value: numOrN(card.personalRest), icon: "fa-solid fa-moon", tone: "violet" },
    { key: "seasonRest", label: "시즌 휴식", value: numOrN(detail.seasonRestCrews), icon: "fa-solid fa-star", tone: "magenta" },
  ];

  // ── 성장 분포 칩 ──
  const DIST = [
    { key: "success", label: "성공", count: card.growthSuccess, p: share(card.growthSuccess), tone: "cyan" },
    { key: "fail", label: "실패", count: card.growthFail, p: share(card.growthFail), tone: "rose" },
    { key: "rest", label: "휴식", count: card.personalRest, p: share(card.personalRest), tone: "violet" },
  ];

  return (
    <div className="weekly-neon">
      {/* 배경 데코 — 바이올렛 글로우 + 그리드 */}
      <div className="neon-bg" aria-hidden="true">
        <span className="neon-bg__orb neon-bg__orb--1" />
        <span className="neon-bg__orb neon-bg__orb--2" />
        <span className="neon-bg__orb neon-bg__orb--3" />
        <span className="neon-bg__grid" />
        <span className="neon-bg__scan" />
      </div>

      <div className="neon-stage">
        {/* ===== 마스트헤드(아웃라인 네온 타이틀) ===== */}
        <header className="neon-masthead">
          <Link href="/weekly-ranking" className="neon-back">
            <i className="fa-solid fa-angle-left" /> LEAGUE
          </Link>
          <p className="neon-masthead__eyebrow">WEEKLY · LEAGUE · ARCADE</p>
          <h1 className="neon-masthead__title" data-text="WEEKLY ARENA">WEEKLY ARENA</h1>
          <p className="neon-masthead__season">
            <i className="fa-solid fa-gamepad" /> {card.seasonName}
            <span className="neon-masthead__dot" />
            <i className="fa-regular fa-clock" /> {card.dateRangeText}
          </p>
        </header>

        {/* ===== SECTION 1 — 슬롯게임 히어로 + 잭팟 미터 ===== */}
        <section className="neon-section">
          <h2 className="neon-shead"><span className="neon-shead__no">01</span> 주차 정보 <em>WEEKLY OVERVIEW</em></h2>

          <div className="neon-hero">
            <div className="neon-hero__media">
              {card.imageUrl ? (
                <img src={card.imageUrl} alt="" />
              ) : (
                <span className="neon-hero__ph"><i className="fa-solid fa-dice-d20" /> 대표 스냅샷</span>
              )}
              <span className="neon-hero__scrim" aria-hidden="true" />
              <span className="neon-hero__edge" aria-hidden="true" />
              <div className="neon-hero__overlay">
                <div className="neon-hero__chips">
                  <span className="neon-chip neon-chip--magenta">{card.leagueResultStatus}</span>
                  <span className="neon-chip neon-chip--cyan">{card.leagueRecordStatus}</span>
                </div>
                <span className="neon-hero__tagline">JACKPOT · SEASON RUN</span>
              </div>
            </div>

            {/* 잭팟 미터 */}
            <div className="neon-meters">
              {METER.map((m) => (
                <div key={m.key} className={`neon-meter neon-meter--${m.tone}`}>
                  <div
                    className="neon-meter__ring"
                    style={{ "--val": m.val } as CSSProperties}
                  >
                    <span className="neon-meter__num">
                      {isOngoing ? "N" : m.val}<em>%</em>
                    </span>
                  </div>
                  <span className="neon-meter__label">{m.label}</span>
                </div>
              ))}
              <div className="neon-dist">
                {DIST.map((d) => (
                  <div key={d.key} className={`neon-dist__row neon-dist__row--${d.tone}`}>
                    <span className="neon-dist__dot" aria-hidden="true" />
                    <span className="neon-dist__label">{d.label}</span>
                    <span className="neon-dist__bar"><span style={{ width: `${isOngoing ? 0 : d.p}%` }} /></span>
                    <span className="neon-dist__val">{isOngoing ? "N" : `${d.count.toLocaleString()}명 · ${d.p}%`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 네온 카테고리 스탯 카드 */}
          <div className="neon-cards">
            {STAT_CARDS.map((s) => (
              <div key={s.key} className={`neon-card neon-card--${s.tone}`}>
                <span className="neon-card__glow" aria-hidden="true" />
                <span className="neon-card__tile"><i className={s.icon} /></span>
                <span className="neon-card__label">{s.label}</span>
                <span className="neon-card__pill">{s.value}<em>명</em></span>
              </div>
            ))}
          </div>

          {/* 개요 + 사회 소식 */}
          <div className="neon-info">
            <div className="neon-panel neon-overview">
              <span className="neon-panel__cap"><i className="fa-solid fa-quote-left" /> 전술 주차 개요</span>
              <p>{detail.overview}</p>
            </div>
            <div className="neon-panel neon-news">
              <span className="neon-panel__cap"><i className="fa-solid fa-satellite-dish" /> 주차 사회 소식</span>
              {detail.socialNews.map((n, i) => (
                <div key={i} className="neon-news__item">
                  <span className="neon-news__idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="neon-news__cat">{n.category}</span>
                  <span className="neon-news__title">{n.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 2 — 리더보드 ===== */}
        <section className="neon-section">
          <h2 className="neon-shead"><span className="neon-shead__no">02</span> 리그 리더보드 <em>LEADERBOARD</em></h2>

          <div className="neon-tabs">
            {LEAD_TABS.map((t) => (
              <button key={t.key} type="button" className={`neon-tab ${leadTab === t.key ? "is-active" : ""}`} onClick={() => setLeadTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="neon-bettable">
            <div className="neon-bettable__head">
              <span>순위</span>
              <span>크루</span>
              <span>품계</span>
              <span className="is-r">기록</span>
            </div>
            {LEAD_DATA[leadTab].map((item, i) => (
              <div key={i} className={`neon-bettable__row ${i === 0 ? "is-top" : ""}`}>
                <span className="neon-bettable__pos">{i + 1}</span>
                <span className="neon-bettable__user">
                  <span className="neon-bettable__av" aria-hidden="true"><i className="fa-solid fa-user-astronaut" /></span>
                  <span className="neon-bettable__name">{item.name}</span>
                </span>
                <span className="neon-bettable__rank">{item.rank}</span>
                <span className="neon-bettable__val">{item.val}</span>
              </div>
            ))}
          </div>

          <div className="neon-team">
            <div className="neon-team__top">
              <span className="neon-team__name"><i className="fa-solid fa-shield-halved" /> 단감 수호대 팀</span>
              <span className="neon-team__win">WIN RATE 100%</span>
            </div>
            <div className="neon-team__meta">팀장: 홍길동 (서울대 컴퓨터공학) · 백엔드 아키텍처 (파트장 1 / 에이전트 4)</div>
            <div className="neon-team__stats">
              <div><span>전체 크루</span><strong>6명</strong></div>
              <div><span>휴식 / 일반</span><strong>0 / 5</strong></div>
              <div><span>성공 / 실패</span><strong className="is-win">6 / 0</strong></div>
            </div>
            <p className="neon-team__mentor"><i className="fa-solid fa-comment-dots" /> <strong>우수 크루 코멘트</strong> 카이저 철수 크루는 백업 아키텍처 설계에서 독보적 최적화를 완수했습니다.</p>
          </div>
        </section>

        {/* ===== SECTION 3 — 크루 매트릭스 ===== */}
        <section className="neon-section">
          <h2 className="neon-shead"><span className="neon-shead__no">03</span> 크루 매트릭스 <em>CREW &amp; FILTERS</em></h2>

          <div className="neon-filters">
            <div className="neon-filters__row">
              <span className="neon-filters__label">주차 진행</span>
              {PROGRESS_FILTERS.map((f, i) => (
                <button key={f} className={`neon-fbtn ${progressIdx === i ? "is-active" : ""}`} onClick={() => onFilter("p", i)}>{f}</button>
              ))}
            </div>
            <div className="neon-filters__row">
              <span className="neon-filters__label">주차 결과</span>
              {RESULT_FILTERS.map((f, i) => (
                <button key={f} className={`neon-fbtn ${resultIdx === i ? "is-active" : ""}`} onClick={() => onFilter("r", i)}>{f}</button>
              ))}
            </div>
            <div className="neon-filters__row neon-filters__row--sort">
              <div className="neon-filters__sort">
                <span className="neon-filters__label">정렬</span>
                <span className={`neon-sorttag ${sortTriggered ? "is-trig" : ""}`}>{sortTriggered ? SORT_TRIGGERED : SORT_DEFAULT}</span>
              </div>
              <button className="neon-official" onClick={resetOfficial}><i className="fa-solid fa-rotate" /> 공식 모드 전환</button>
            </div>
          </div>

          <div className="neon-crews">
            {CREWS.map((c) => (
              <div key={c.key} className={`neon-crew ${c.success ? "is-success" : "is-fail"}`} onClick={() => setModalCrew(c)}>
                <span className="neon-crew__edge" aria-hidden="true" />
                <span className="neon-crew__badge">{c.badge}</span>
                <div className="neon-crew__head">
                  <span className={`neon-crew__av ${c.success ? "is-success" : "is-fail"}`}>
                    <i className="fa-solid fa-user-ninja" />
                  </span>
                  <div className="neon-crew__id">
                    <span className="neon-crew__name">{c.name} <em>({c.level})</em></span>
                    <span className="neon-crew__sub">{c.univ} {c.major} · 누적 {card.weekNumber}주차</span>
                  </div>
                  <span className={`neon-crew__result ${c.success ? "is-win" : "is-lose"}`}>{c.result}</span>
                </div>
                <div className="neon-crew__line">팀: {c.team} · 파트: {c.part} · 상태: {c.status}</div>
                <div className="neon-crew__bars">
                  {c.bars.map((b, bi) => (
                    <div key={bi} className="neon-crew__bar">
                      <span className="neon-crew__bname">{b.name}</span>
                      <span className="neon-crew__btrack"><span className="neon-crew__bfill" style={{ width: `${b.pct}%` }} /></span>
                      <span className="neon-crew__bcount">{b.count}</span>
                    </div>
                  ))}
                </div>
                {(checked[c.key] || (adminDone && c.key === "철수")) && (
                  <div className="neon-crew__stamps">
                    {checked[c.key] && <span className="neon-stamp is-checked"><i className="fa-solid fa-circle-check" /> 위클리 검증 완료</span>}
                    {adminDone && c.key === "철수" && <span className="neon-stamp is-admin"><i className="fa-solid fa-fingerprint" /> 행정 확인 완료</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 4 — 행정 게이트 ===== */}
        <section className="neon-section">
          <h2 className="neon-shead"><span className="neon-shead__no">04</span> 행정 코어 게이트웨이 <em>ADMINISTRATION</em></h2>
          <div className="neon-admin">
            <div className="neon-panel neon-admin__notice">
              <div className="neon-admin__title"><i className="fa-solid fa-circle-exclamation" /> 행정 데이터 최종 확약 안내문</div>
              <p>연동 성과 지표를 검토 후 <strong>매주 금요일 14:00까지</strong> 행정 확정 서명을 인가하십시오. 조정 문의는 <strong>당일 22:00까지</strong> 제출해야 반영됩니다.</p>
              <table className="neon-table">
                <thead><tr><th>구분</th><th>확인 불가 (Fail)</th><th>확인 가능 (Pass)</th></tr></thead>
                <tbody>
                  <tr><td><strong>캡처/날짜</strong></td><td>시각 정보 누락, 본문 일부만 전송</td><td>타임스탬프 + 식별 코드 동시 노출 전체 화면</td></tr>
                  <tr><td><strong>증빙 행동</strong></td><td>&quot;성실하게 완증함&quot; 기재</td><td>&quot;부하 분산 스크립트 설계 후 12회 디버깅 통과&quot;</td></tr>
                </tbody>
              </table>
            </div>
            <div className="neon-panel neon-admin__sign">
              <div>
                <div className="neon-admin__title neon-admin__title--magenta"><i className="fa-solid fa-fingerprint" /> 암호화 전산 행정 확인 승인</div>
                <p className="neon-admin__desc">현재 세션의 실무 스탯 검증 데이터를 최종 원본으로 동의하며 리더보드 점수 락다운을 승인합니다.</p>
              </div>
              <div className="neon-admin__btns">
                <button className="neon-btn neon-btn--magenta" onClick={() => { setAdminDone(true); if (typeof window !== "undefined") window.alert("AUTHENTICATED: 카이저 철수 크루 행정 확인 서명 완료 — 목록에 [행정 확인] 상태가 반영되었습니다."); }}>
                  본인 위클리 카드 행정 확인 서명
                </button>
                <button className="neon-btn neon-btn--ghost" onClick={() => { if (typeof window !== "undefined") window.alert("조정 문의 전용 게시판으로 이동합니다."); }}>
                  조정 이의 신청 게시판 이동
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA 배너 ===== */}
        <div className="neon-cta">
          <span className="neon-cta__glow" aria-hidden="true" />
          <div className="neon-cta__txt">
            <span className="neon-cta__eyebrow">READY FOR NEXT WEEK?</span>
            <strong className="neon-cta__title">LET&apos;S GET STARTED</strong>
          </div>
          <Link href="/weekly-ranking" className="neon-btn neon-btn--magenta neon-cta__btn">
            <i className="fa-solid fa-angle-left" /> BACK TO LEAGUE
          </Link>
        </div>
      </div>

      {/* 위클리 카드 모달 */}
      <div className={`neon-modal ${modalCrew ? "is-open" : ""}`} onClick={() => setModalCrew(null)}>
        {modalCrew && (
          <div className="neon-modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="neon-modal__head">
              <h3><i className="fa-solid fa-id-badge" /> CARD · {modalCrew.name}</h3>
              <button className="neon-modal__close" onClick={() => setModalCrew(null)} aria-label="닫기">×</button>
            </div>
            <table className="neon-table">
              <tbody>
                <tr><td><strong>품계 레이어</strong></td><td><span className="neon-modal__hl">{modalCrew.rank}</span></td></tr>
                <tr><td><strong>아카데미 학적</strong></td><td>{modalCrew.univ} {modalCrew.major}</td></tr>
                <tr><td><strong>소속 연맹 리그</strong></td><td>하이브리드: {modalCrew.league}</td></tr>
                <tr><td><strong>주차 스코어 결과</strong></td><td>{card.weekNumber}주차 ({modalCrew.result})</td></tr>
              </tbody>
            </table>
            <p className="neon-modal__note">※ [주차 내용 확인 체크] 승인 시 그리드 및 위클리 리스트 카드에 크로스 체크 마크가 전사됩니다.</p>
            <div className="neon-modal__btns">
              <button className="neon-btn neon-btn--magenta" onClick={triggerCheck}><i className="fa-solid fa-square-check" /> 주차 내용 확인 체크 (OK)</button>
              <button className="neon-btn neon-btn--ghost" onClick={() => setModalCrew(null)}>취소</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}