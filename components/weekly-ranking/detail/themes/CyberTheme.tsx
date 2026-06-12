"use client";

/* ============================================================
 * Weekly League 상세 — 테마 C "모락의 체스판" (CHESSBOARD)
 * 검은사막 스타일 다크-골드 판타지 MMORPG 대시보드.
 * 데이터/인터랙션(탭·필터·모달·행정 서명)은 기존 유지, 표현만 재구성.
 * Scope: .weekly-cyber 하위로만 한정.
 * ============================================================ */

import { useState } from "react";
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
  levelColor: string;
  badge: string;
  badgeBg?: string;
  univ: string;
  major: string;
  team: string;
  part: string;
  status: string;
  statusColor: string;
  league: string;
  result: string;
  rank: string;
  success: boolean;
  bars: { name: string; pct: number; count: string; color?: string }[];
};

const CREWS: Crew[] = [
  {
    key: "철수", name: "카이저 철수", level: "단감 레벨", levelColor: "var(--bd-teal)",
    badge: "정3품 정승", univ: "서울대학교", major: "컴퓨터공학", team: "단감 수호대", part: "백엔드 아키텍처",
    status: "주차 활동", statusColor: "var(--bd-jade)", league: "단감", result: "성장(성공)", rank: "정3품 정승 명단",
    success: true,
    bars: [
      { name: "주차 성장률 (85%)", pct: 85, count: "5개", color: "var(--bd-jade)" },
      { name: "실무 정보 강화율 (90%)", pct: 90, count: "9개" },
      { name: "실무 역량 강화율 (75%)", pct: 75, count: "3개" },
      { name: "실무 경험 강화율 (80%)", pct: 80, count: "4개" },
      { name: "실무 경력 강화율 (70%)", pct: 70, count: "2개" },
    ],
  },
  {
    key: "민수", name: "데스나이트 민수", level: "어흥 레벨", levelColor: "var(--bd-violet)",
    badge: "종2품 정승", badgeBg: "#4a3a52", univ: "고려대학교", major: "산업디자인", team: "인절미 어벤져스", part: "UX/UI 프론트",
    status: "성장(실패)", statusColor: "var(--bd-rose)", league: "어흥", result: "성장(실패)", rank: "종2품 판서 명단",
    success: false,
    bars: [
      { name: "주차 성장률 (35%)", pct: 35, count: "1개", color: "var(--bd-rose)" },
      { name: "실무 정보 강화율 (40%)", pct: 40, count: "2개" },
      { name: "실무 역량 강화율 (50%)", pct: 50, count: "2개" },
      { name: "실무 경험 강화율 (30%)", pct: 30, count: "1개" },
      { name: "실무 경력 강화율 (20%)", pct: 20, count: "0개" },
    ],
  },
];

const PROGRESS_FILTERS = ["전체 리스트 보기", "주차 활동", "주차 휴식", "시즌 휴식"];
const RESULT_FILTERS = ["전체 결과 보기", "성장(성공)", "성장(실패)"];
const SORT_DEFAULT = "디폴트 활성화: 품계 순 ➔ 성장률 순 ➔ 이름 순";
const SORT_TRIGGERED = "정렬 매칭 트리거 발동: [1)누적주차 ➔ 2)성장률 ➔ 3)가나다 순 정렬 연산 중]";

export default function CyberTheme({ card, detail }: Props) {
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

  // ── 체스말 슬롯(섹션1 스탯 도식) ──
  const slots = [
    { label: "주차 활동", value: numOrN(card.growthChallenge), glyph: "fa-fire-flame-curved", tone: "teal" },
    { label: "성장 성공", value: numOrN(card.growthSuccess), glyph: "fa-trophy", tone: "gold" },
    { label: "성장 실패", value: numOrN(card.growthFail), glyph: "fa-skull", tone: "rose" },
    { label: "주차 휴식", value: numOrN(card.personalRest), glyph: "fa-moon", tone: "violet" },
    { label: "시즌 휴식", value: numOrN(detail.seasonRestCrews), glyph: "fa-snowflake", tone: "frost" },
  ];

  // ── 세로 게이지 튜브(성장 분포 + 능력치) ──
  const compTotal = card.growthSuccess + card.growthFail + card.personalRest;
  const share = (n: number) => (compTotal > 0 ? Math.round((n / compTotal) * 100) : 0);
  const tubes = [
    { key: "success", label: "성공", pct: isOngoing ? 0 : share(card.growthSuccess), tone: "gold", count: card.growthSuccess },
    { key: "fail", label: "실패", pct: isOngoing ? 0 : share(card.growthFail), tone: "rose", count: card.growthFail },
    { key: "rest", label: "휴식", pct: isOngoing ? 0 : share(card.personalRest), tone: "violet", count: card.personalRest },
    { key: "challenge", label: "도전율", pct: isOngoing ? 0 : card.growthChallengeRate, tone: "teal", count: -1 },
    { key: "rate", label: "성공율", pct: successRate, tone: "jade", count: -1 },
  ];

  return (
    <div className="weekly-cyber">
      {/* 앰비언트 배경 — 좌 청록 / 우 보라 글로우 + 비네팅 */}
      <div className="chess-ambient" aria-hidden="true">
        <span className="chess-ambient__glow chess-ambient__glow--teal" />
        <span className="chess-ambient__glow chess-ambient__glow--violet" />
        <span className="chess-ambient__vignette" />
      </div>

      {/* ===== 캐릭터 쇼케이스 — 좌 청록(단감) / 우 보라(인절미) ===== */}
      <div className="chess-showcase">
        <div className="chess-showcase__cluster chess-showcase__cluster--teal">
          {LEAD_DATA.dan.slice(0, 3).map((c, i) => {
            const [nm, sub] = c.name.split(" (");
            return (
              <div key={i} className="chess-portrait">
                <span className="chess-portrait__aura" aria-hidden="true" />
                <span className="chess-portrait__frame" aria-hidden="true" />
                <span className="chess-portrait__fig" aria-hidden="true"><i className="fa-solid fa-user-astronaut" /></span>
                <span className="chess-portrait__rank">{c.rank}</span>
                <span className="chess-portrait__name">{nm}</span>
                {sub && <span className="chess-portrait__sub">{sub.replace(")", "")}</span>}
              </div>
            );
          })}
        </div>
        <div className="chess-showcase__cluster chess-showcase__cluster--violet">
          {LEAD_DATA.injeol.slice(0, 2).map((c, i) => {
            const [nm, sub] = c.name.split(" (");
            return (
              <div key={i} className="chess-portrait">
                <span className="chess-portrait__aura" aria-hidden="true" />
                <span className="chess-portrait__frame" aria-hidden="true" />
                <span className="chess-portrait__fig" aria-hidden="true"><i className="fa-solid fa-dragon" /></span>
                <span className="chess-portrait__rank">{c.rank}</span>
                <span className="chess-portrait__name">{nm}</span>
                {sub && <span className="chess-portrait__sub">{sub.replace(")", "")}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 상단 리본 — 타이틀 + 리소스 바 ===== */}
      <header className="chess-topbar">
        <div className="chess-topbar__brand">
          <span className="chess-topbar__eyebrow"><i className="fa-solid fa-chess-knight" /> WEEKLY LEAGUE · 모락의 체스판</span>
          <h1 className="chess-topbar__title">{card.seasonName}</h1>
          <span className="chess-topbar__period"><i className="fa-regular fa-calendar" /> {card.dateRangeText}</span>
        </div>
        <div className="chess-resourcebar">
          <div className="chess-status-pills">
            <span className="chess-pill"><i className="fa-solid fa-shield-halved" /> {card.leagueResultStatus}</span>
            <span className="chess-pill"><i className="fa-solid fa-chess-board" /> {card.leagueRecordStatus}</span>
          </div>
          <div className="chess-coins">
            <span className="chess-coin chess-coin--teal"><i className="fa-solid fa-gem" /> 활동 {numOrN(card.growthChallenge)}</span>
            <span className="chess-coin chess-coin--gold"><i className="fa-solid fa-crown" /> 성공 {numOrN(card.growthSuccess)}</span>
            <span className="chess-coin chess-coin--rose"><i className="fa-solid fa-skull" /> 실패 {numOrN(card.growthFail)}</span>
          </div>
        </div>
      </header>

      <div className="chess-stack">
        {/* ===== SECTION 1 — 주차 정보 ===== */}
        <section className="chess-panel">
          <h2 className="chess-phead"><span className="chess-phead__no">I</span> 주차 정보 · 컨트롤 타워<em>WEEKLY OVERVIEW</em></h2>

          {/* 체스말 슬롯 — 스탯 도식 */}
          <div className="chess-slots">
            {slots.map((s) => (
              <div key={s.label} className={`chess-slot chess-slot--${s.tone}`}>
                <span className="chess-slot__frame" aria-hidden="true" />
                <span className="chess-slot__glyph"><i className={`fa-solid ${s.glyph}`} /></span>
                <span className="chess-slot__value">{s.value}<em>명</em></span>
                <span className="chess-slot__label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="chess-overview-grid">
            {/* VICTORY 엠블럼 — 전체 성장 성공율 */}
            <div className="chess-emblem">
              <span className="chess-emblem__crown" aria-hidden="true"><i className="fa-solid fa-crown" /></span>
              <span className="chess-emblem__word">VICTORY</span>
              <span className="chess-emblem__rate">{isOngoing ? "N" : successRate}<em>%</em></span>
              <span className="chess-emblem__cap">전체 성장 성공율</span>
              <div className="chess-expbar">
                <span className="chess-expbar__fill" style={{ width: `${successRate}%` }} />
              </div>
              <span className="chess-emblem__counts">
                <i className="fa-solid fa-crown" /> 성공 {numOrN(card.growthSuccess)}
                <i className="fa-solid fa-skull" /> 실패 {numOrN(card.growthFail)}
              </span>
            </div>

            {/* 세로 게이지 튜브 — 성장 분포 / 능력치 */}
            <div className="chess-tubes">
              <span className="chess-subcap">성장 분포 · ABILITY MATRIX</span>
              <div className="chess-tubes__row">
                {tubes.map((t) => (
                  <div key={t.key} className={`chess-tube chess-tube--${t.tone}`}>
                    <span className="chess-tube__pct">{isOngoing ? "N" : t.pct}%</span>
                    <div className="chess-tube__glass">
                      <span className="chess-tube__fill" style={{ height: `${t.pct}%` }} />
                    </div>
                    <span className="chess-tube__base" aria-hidden="true" />
                    <span className="chess-tube__label">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 대표 이미지 + 사회 소식 배너 */}
          <div className="chess-banner-row">
            <div className="chess-snap">
              {card.imageUrl ? <img src={card.imageUrl} alt="" /> : <span>대표 스냅샷</span>}
              <span className="chess-snap__frame" aria-hidden="true" />
            </div>
            <div className="chess-news">
              <span className="chess-subcap"><i className="fa-solid fa-tower-broadcast" /> 이번 주 주차 사회 소식</span>
              <div className="chess-news__list">
                {detail.socialNews.map((n, i) => (
                  <div key={i} className="chess-news__item">
                    <span className="chess-news__cat">{n.category}</span>
                    <span className="chess-news__title">{n.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 주차 개요 — 스테이지 목표 패널 */}
          <div className="chess-objective">
            <span className="chess-objective__cap"><i className="fa-solid fa-scroll" /> 전술 주차 개요 및 종합 평가</span>
            <p className="chess-objective__text">{detail.overview}</p>
          </div>
        </section>

        {/* ===== SECTION 2 — 리더보드 ===== */}
        <section className="chess-panel">
          <h2 className="chess-phead"><span className="chess-phead__no">II</span> 리그 리더보드<em>LEAGUE LEADERBOARD</em></h2>
          <div className="chess-tabs">
            {LEAD_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`chess-tab ${leadTab === t.key ? "is-active" : ""}`}
                onClick={() => setLeadTab(t.key)}
              >
                <span className="chess-tab__dia" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="chess-rankrows">
            {LEAD_DATA[leadTab].map((item, i) => (
              <div key={i} className={`chess-rankrow ${i === 0 ? "is-top" : ""}`}>
                <span className="chess-rankrow__badge">{item.rank}</span>
                <span className="chess-rankrow__name">{item.name}</span>
                <span className="chess-rankrow__val">{item.val}</span>
              </div>
            ))}
          </div>

          {/* 팀 매트릭스 */}
          <div className="chess-team">
            <div className="chess-team__top">
              <span className="chess-team__name">단감 수호대 팀</span>
              <span className="chess-team__win">WIN RATE 100%</span>
            </div>
            <div className="chess-team__meta">팀장: 홍길동 (서울대 컴퓨터공학) · 백엔드 아키텍처 (파트장 1 / 에이전트 4)</div>
            <div className="chess-team__stats">
              <div><span>전체 크루</span><strong>6명</strong></div>
              <div><span>휴식 / 일반</span><strong>0 / 5</strong></div>
              <div><span>성공 / 실패</span><strong className="is-win">6 / 0</strong></div>
            </div>
            <p className="chess-team__desc">
              <strong>실무 목표</strong> 분산 DB 트래픽 부하 복구 테스트 및 시나리오 검증 스크립트 빌드 ·{" "}
              <strong>진행 개요</strong> 전원 마감 타임라인 돌파, 디버깅 크리티컬 스코어 완벽 방어.
            </p>
            <div className="chess-team__mentor">
              <i className="fa-solid fa-comment-dots" /> <strong>우수 크루 코멘트</strong> 카이저 철수 크루는 백업 아키텍처 설계에서 독보적 최적화를 완수했습니다.
            </div>
          </div>
        </section>

        {/* ===== SECTION 3 — 크루 매트릭스 ===== */}
        <section className="chess-panel">
          <h2 className="chess-phead"><span className="chess-phead__no">III</span> 크루 라이브 매트릭스<em>CREW &amp; TACTICAL FILTERS</em></h2>

          <div className="chess-filters">
            <div className="chess-filters__row">
              <span className="chess-filters__label">주차 진행</span>
              {PROGRESS_FILTERS.map((f, i) => (
                <button key={f} className={`chess-fbtn ${progressIdx === i ? "is-active" : ""}`} onClick={() => onFilter("p", i)}>{f}</button>
              ))}
            </div>
            <div className="chess-filters__row">
              <span className="chess-filters__label">주차 결과</span>
              {RESULT_FILTERS.map((f, i) => (
                <button key={f} className={`chess-fbtn ${resultIdx === i ? "is-active" : ""}`} onClick={() => onFilter("r", i)}>{f}</button>
              ))}
            </div>
            <div className="chess-filters__row chess-filters__row--sort">
              <div className="chess-filters__sort">
                <span className="chess-filters__label">정렬</span>
                <span className={`chess-sorttag ${sortTriggered ? "is-trig" : ""}`}>
                  {sortTriggered ? SORT_TRIGGERED : SORT_DEFAULT}
                </span>
              </div>
              <button className="chess-official" onClick={resetOfficial}>
                <i className="fa-solid fa-chess-king" /> 공식 모드 전환
              </button>
            </div>
          </div>

          <div className="chess-crews">
            {CREWS.map((c) => (
              <div key={c.key} className="chess-crew" onClick={() => setModalCrew(c)}>
                <span className="chess-crew__frame" aria-hidden="true" />
                <span className="chess-crew__badge" style={c.badgeBg ? { background: c.badgeBg } : undefined}>{c.badge}</span>
                <div className="chess-crew__head">
                  <div className={`chess-crew__avatar ${c.success ? "is-success" : "is-fail"}`}>
                    <i className={c.success ? "fa-solid fa-chess-queen" : "fa-solid fa-chess-rook"} />
                  </div>
                  <div className="chess-crew__id">
                    <span className="chess-crew__name">{c.name} <em style={{ color: c.levelColor }}>({c.level})</em></span>
                    <span className="chess-crew__sub">{c.univ} {c.major} · 누적 {card.weekNumber}주차</span>
                  </div>
                </div>
                <div className="chess-crew__line">
                  팀: {c.team} · 파트: {c.part} · <span style={{ color: c.statusColor }}>상태: {c.status}</span>
                </div>
                <div className="chess-crew__bars">
                  {c.bars.map((b, bi) => (
                    <div key={bi} className="chess-crew__bar">
                      <span className="chess-crew__bname">{b.name}</span>
                      <span className="chess-crew__btrack">
                        <span className="chess-crew__bfill" style={{ width: `${b.pct}%`, ...(b.color ? { background: b.color } : {}) }} />
                      </span>
                      <span className="chess-crew__bcount">{b.count}</span>
                    </div>
                  ))}
                </div>
                {(checked[c.key] || (adminDone && c.key === "철수")) && (
                  <div className="chess-crew__stamps">
                    {checked[c.key] && (
                      <span className="chess-stamp is-checked"><i className="fa-solid fa-circle-check" /> 위클리 검증 완료</span>
                    )}
                    {adminDone && c.key === "철수" && (
                      <span className="chess-stamp is-admin"><i className="fa-solid fa-fingerprint" /> 행정 확인 완료</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 4 — 행정 게이트 ===== */}
        <section className="chess-panel">
          <h2 className="chess-phead"><span className="chess-phead__no">IV</span> 행정 코어 게이트웨이<em>ADMINISTRATION</em></h2>
          <div className="chess-admin">
            <div className="chess-admin__notice">
              <div className="chess-admin__title"><i className="fa-solid fa-circle-exclamation" /> 행정 데이터 최종 확약 안내문</div>
              <p>
                연동 성과 지표를 검토 후 <strong>매주 금요일 14:00까지</strong> 행정 확정 서명을 인가하십시오. 조정 문의는 <strong>당일 22:00까지</strong> 제출해야 반영됩니다.
              </p>
              <table className="chess-table">
                <thead>
                  <tr><th>구분</th><th>확인 불가 (Fail)</th><th>확인 가능 (Pass)</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>캡처/날짜</strong></td><td>시각 정보 누락, 본문 일부만 전송</td><td>타임스탬프 + 식별 코드 동시 노출 전체 화면</td></tr>
                  <tr><td><strong>증빙 행동</strong></td><td>&quot;성실하게 완증함&quot; 기재</td><td>&quot;부하 분산 스크립트 설계 후 12회 디버깅 통과&quot;</td></tr>
                </tbody>
              </table>
            </div>

            <div className="chess-admin__sign">
              <div>
                <div className="chess-admin__title chess-admin__title--teal"><i className="fa-solid fa-fingerprint" /> 암호화 전산 행정 확인 승인</div>
                <p className="chess-admin__desc">현재 세션의 실무 스탯 검증 데이터를 최종 원본으로 동의하며 리더보드 점수 락다운을 승인합니다.</p>
              </div>
              <div className="chess-admin__btns">
                <button
                  className="chess-btn chess-btn--gold"
                  onClick={() => { setAdminDone(true); if (typeof window !== "undefined") window.alert("AUTHENTICATED: 카이저 철수 크루 행정 확인 서명 완료 — 목록에 [행정 확인] 상태가 반영되었습니다."); }}
                >
                  본인 위클리 카드 행정 확인 서명
                </button>
                <button
                  className="chess-btn chess-btn--ghost"
                  onClick={() => { if (typeof window !== "undefined") window.alert("조정 문의 전용 게시판으로 이동합니다."); }}
                >
                  조정 이의 신청 게시판 이동
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="chess-footer">
        <Link href="/weekly-ranking" className="chess-back"><i className="fa-solid fa-arrow-left-long" /> BACK TO LEAGUE</Link>
        <span className="chess-footer__thanks">Thank you for watching.</span>
      </div>

      {/* 위클리 카드 모달 */}
      <div className={`chess-modal ${modalCrew ? "is-open" : ""}`} onClick={() => setModalCrew(null)}>
        {modalCrew && (
          <div className="chess-modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="chess-modal__head">
              <h3><i className="fa-solid fa-chess-queen" /> CARD · {modalCrew.name}</h3>
              <button className="chess-modal__close" onClick={() => setModalCrew(null)} aria-label="닫기">×</button>
            </div>
            <table className="chess-table">
              <tbody>
                <tr><td><strong>품계 레이어</strong></td><td><span className="chess-modal__hl">{modalCrew.rank}</span></td></tr>
                <tr><td><strong>아카데미 학적</strong></td><td>{modalCrew.univ} {modalCrew.major}</td></tr>
                <tr><td><strong>소속 연맹 리그</strong></td><td>하이브리드: {modalCrew.league}</td></tr>
                <tr><td><strong>주차 스코어 결과</strong></td><td>{card.weekNumber}주차 ({modalCrew.result})</td></tr>
              </tbody>
            </table>
            <p className="chess-modal__note">
              ※ [주차 내용 확인 체크] 승인 시 그리드 및 위클리 리스트 카드에 크로스 체크 마크가 전사됩니다.
            </p>
            <div className="chess-modal__btns">
              <button className="chess-btn chess-btn--gold" onClick={triggerCheck}>
                <i className="fa-solid fa-square-check" /> 주차 내용 확인 체크 (OK)
              </button>
              <button className="chess-btn chess-btn--ghost" onClick={() => setModalCrew(null)}>취소</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
