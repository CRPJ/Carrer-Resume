"use client";

/* ============================================================
 * Weekly League 상세 — 테마 D "STEAMPUNK" (황동 계기판)
 * 다크 네이비 + 브라스 골드, 원형 시계태엽 다이얼 게이지가 시그니처.
 * 글로시 블랙 디바이스 베젤 프레임. 데이터/인터랙션은 공통 유지.
 * Scope: .weekly-steampunk 하위로만 한정.
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

export default function SteampunkTheme({ card, detail }: Props) {
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

  // ── 스탯 readout 행 ──
  const readouts = [
    { label: "주차 활동", value: numOrN(card.growthChallenge) },
    { label: "성장 성공", value: numOrN(card.growthSuccess) },
    { label: "성장 실패", value: numOrN(card.growthFail) },
    { label: "주차 휴식", value: numOrN(card.personalRest) },
    { label: "시즌 휴식", value: numOrN(detail.seasonRestCrews) },
  ];

  // ── 원형 다이얼 게이지 ──
  const compTotal = card.growthSuccess + card.growthFail + card.personalRest;
  const share = (n: number) => (compTotal > 0 ? Math.round((n / compTotal) * 100) : 0);
  const gauges = [
    { key: "rate", label: "성장 성공율", val: successRate, tone: "gold", big: true },
    { key: "challenge", label: "성장 도전율", val: isOngoing ? 0 : card.growthChallengeRate, tone: "copper", big: false },
    { key: "success", label: "성공 비율", val: isOngoing ? 0 : share(card.growthSuccess), tone: "brass", big: false },
    { key: "fail", label: "실패 비율", val: isOngoing ? 0 : share(card.growthFail), tone: "rust", big: false },
    { key: "rest", label: "휴식 비율", val: isOngoing ? 0 : share(card.personalRest), tone: "steel", big: false },
  ];

  return (
    <div className="weekly-steampunk">
      <div className="steam-bezel">
        {/* ===== 타이틀 바 ===== */}
        <header className="steam-titlebar">
          <span className="steam-gem steam-gem--l" aria-hidden="true"><i className="fa-solid fa-gem" /></span>
          <div className="steam-titlebar__txt">
            <span className="steam-eyebrow">WEEKLY LEAGUE · MECHANICAL DISPATCH</span>
            <h1 className="steam-title">{card.seasonName}</h1>
            <span className="steam-period"><i className="fa-regular fa-clock" /> {card.dateRangeText}</span>
          </div>
          <span className="steam-gem steam-gem--r" aria-hidden="true"><i className="fa-solid fa-gem" /></span>
        </header>

        {/* ===== SECTION 1 — 히어로 + readout + 다이얼 ===== */}
        <section className="steam-panel">
          <h2 className="steam-phead"><i className="fa-solid fa-gears" /> [I] 주차 정보 · 계기판<em>WEEKLY OVERVIEW</em></h2>

          <div className="steam-top">
            <div className="steam-hero">
              {card.imageUrl ? <img src={card.imageUrl} alt="" /> : <span className="steam-hero__ph">대표 스냅샷</span>}
              <span className="steam-hero__frame" aria-hidden="true" />
              <div className="steam-hero__chips">
                <span className="steam-chip">{card.leagueResultStatus}</span>
                <span className="steam-chip">{card.leagueRecordStatus}</span>
              </div>
            </div>

            <div className="steam-readout">
              <span className="steam-readout__cap">CREW READOUT</span>
              {readouts.map((r) => (
                <div key={r.label} className="steam-readout__row">
                  <span className="steam-readout__label">{r.label}</span>
                  <span className="steam-readout__dots" aria-hidden="true" />
                  <span className="steam-readout__val">{r.value}<em>명</em></span>
                </div>
              ))}
            </div>
          </div>

          {/* 원형 다이얼 게이지 클러스터 */}
          <div className="steam-gauges">
            {gauges.map((g) => (
              <div key={g.key} className={`steam-gauge steam-gauge--${g.tone} ${g.big ? "is-big" : ""}`}>
                <div className="steam-gauge__dial" style={{ "--val": g.val } as CSSProperties}>
                  <span className="steam-gauge__ticks" aria-hidden="true" />
                  <span className="steam-gauge__face" aria-hidden="true" />
                  <span className="steam-gauge__center">
                    {isOngoing ? "N" : g.val}<em>%</em>
                  </span>
                </div>
                <span className="steam-gauge__label">{g.label}</span>
              </div>
            ))}
          </div>

          {/* 개요 + 사회 소식 */}
          <div className="steam-overview">
            <div className="steam-scroll">
              <span className="steam-scroll__cap"><i className="fa-solid fa-scroll" /> 전술 주차 개요</span>
              <p>{detail.overview}</p>
            </div>
            <div className="steam-news">
              <span className="steam-scroll__cap"><i className="fa-solid fa-tower-broadcast" /> 주차 사회 소식</span>
              {detail.socialNews.map((n, i) => (
                <div key={i} className="steam-news__item">
                  <span className="steam-news__cat">{n.category}</span>
                  <span>{n.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 2 — 리더보드 ===== */}
        <section className="steam-panel">
          <h2 className="steam-phead"><i className="fa-solid fa-medal" /> [II] 리그 리더보드<em>LEADERBOARD</em></h2>
          <div className="steam-tabs">
            {LEAD_TABS.map((t) => (
              <button key={t.key} type="button" className={`steam-tab ${leadTab === t.key ? "is-active" : ""}`} onClick={() => setLeadTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="steam-rankrows">
            {LEAD_DATA[leadTab].map((item, i) => (
              <div key={i} className={`steam-rankrow ${i === 0 ? "is-top" : ""}`}>
                <span className="steam-rankrow__badge">{item.rank}</span>
                <span className="steam-rankrow__name">{item.name}</span>
                <span className="steam-rankrow__val">{item.val}</span>
              </div>
            ))}
          </div>

          <div className="steam-team">
            <div className="steam-team__top">
              <span className="steam-team__name">단감 수호대 팀</span>
              <span className="steam-team__win">WIN RATE 100%</span>
            </div>
            <div className="steam-team__meta">팀장: 홍길동 (서울대 컴퓨터공학) · 백엔드 아키텍처 (파트장 1 / 에이전트 4)</div>
            <div className="steam-team__stats">
              <div><span>전체 크루</span><strong>6명</strong></div>
              <div><span>휴식 / 일반</span><strong>0 / 5</strong></div>
              <div><span>성공 / 실패</span><strong className="is-win">6 / 0</strong></div>
            </div>
            <p className="steam-team__mentor"><i className="fa-solid fa-comment-dots" /> <strong>우수 크루 코멘트</strong> 카이저 철수 크루는 백업 아키텍처 설계에서 독보적 최적화를 완수했습니다.</p>
          </div>
        </section>

        {/* ===== SECTION 3 — 크루 매트릭스 ===== */}
        <section className="steam-panel">
          <h2 className="steam-phead"><i className="fa-solid fa-screwdriver-wrench" /> [III] 크루 매트릭스<em>CREW &amp; FILTERS</em></h2>

          <div className="steam-filters">
            <div className="steam-filters__row">
              <span className="steam-filters__label">주차 진행</span>
              {PROGRESS_FILTERS.map((f, i) => (
                <button key={f} className={`steam-fbtn ${progressIdx === i ? "is-active" : ""}`} onClick={() => onFilter("p", i)}>{f}</button>
              ))}
            </div>
            <div className="steam-filters__row">
              <span className="steam-filters__label">주차 결과</span>
              {RESULT_FILTERS.map((f, i) => (
                <button key={f} className={`steam-fbtn ${resultIdx === i ? "is-active" : ""}`} onClick={() => onFilter("r", i)}>{f}</button>
              ))}
            </div>
            <div className="steam-filters__row steam-filters__row--sort">
              <div className="steam-filters__sort">
                <span className="steam-filters__label">정렬</span>
                <span className={`steam-sorttag ${sortTriggered ? "is-trig" : ""}`}>{sortTriggered ? SORT_TRIGGERED : SORT_DEFAULT}</span>
              </div>
              <button className="steam-official" onClick={resetOfficial}><i className="fa-solid fa-gear" /> 공식 모드 전환</button>
            </div>
          </div>

          <div className="steam-crews">
            {CREWS.map((c) => (
              <div key={c.key} className="steam-crew" onClick={() => setModalCrew(c)}>
                <span className="steam-crew__frame" aria-hidden="true" />
                <span className="steam-crew__badge">{c.badge}</span>
                <div className="steam-crew__head">
                  <div className={`steam-crew__cog ${c.success ? "is-success" : "is-fail"}`}>
                    <i className="fa-solid fa-gear" />
                  </div>
                  <div className="steam-crew__id">
                    <span className="steam-crew__name">{c.name} <em>({c.level})</em></span>
                    <span className="steam-crew__sub">{c.univ} {c.major} · 누적 {card.weekNumber}주차</span>
                  </div>
                </div>
                <div className="steam-crew__line">팀: {c.team} · 파트: {c.part} · 상태: {c.status}</div>
                <div className="steam-crew__bars">
                  {c.bars.map((b, bi) => (
                    <div key={bi} className="steam-crew__bar">
                      <span className="steam-crew__bname">{b.name}</span>
                      <span className="steam-crew__btrack"><span className="steam-crew__bfill" style={{ width: `${b.pct}%` }} /></span>
                      <span className="steam-crew__bcount">{b.count}</span>
                    </div>
                  ))}
                </div>
                {(checked[c.key] || (adminDone && c.key === "철수")) && (
                  <div className="steam-crew__stamps">
                    {checked[c.key] && <span className="steam-stamp is-checked"><i className="fa-solid fa-circle-check" /> 위클리 검증 완료</span>}
                    {adminDone && c.key === "철수" && <span className="steam-stamp is-admin"><i className="fa-solid fa-fingerprint" /> 행정 확인 완료</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 4 — 행정 게이트 ===== */}
        <section className="steam-panel">
          <h2 className="steam-phead"><i className="fa-solid fa-stamp" /> [IV] 행정 코어 게이트웨이<em>ADMINISTRATION</em></h2>
          <div className="steam-admin">
            <div className="steam-admin__notice">
              <div className="steam-admin__title"><i className="fa-solid fa-circle-exclamation" /> 행정 데이터 최종 확약 안내문</div>
              <p>연동 성과 지표를 검토 후 <strong>매주 금요일 14:00까지</strong> 행정 확정 서명을 인가하십시오. 조정 문의는 <strong>당일 22:00까지</strong> 제출해야 반영됩니다.</p>
              <table className="steam-table">
                <thead><tr><th>구분</th><th>확인 불가 (Fail)</th><th>확인 가능 (Pass)</th></tr></thead>
                <tbody>
                  <tr><td><strong>캡처/날짜</strong></td><td>시각 정보 누락, 본문 일부만 전송</td><td>타임스탬프 + 식별 코드 동시 노출 전체 화면</td></tr>
                  <tr><td><strong>증빙 행동</strong></td><td>&quot;성실하게 완증함&quot; 기재</td><td>&quot;부하 분산 스크립트 설계 후 12회 디버깅 통과&quot;</td></tr>
                </tbody>
              </table>
            </div>
            <div className="steam-admin__sign">
              <div>
                <div className="steam-admin__title steam-admin__title--copper"><i className="fa-solid fa-fingerprint" /> 암호화 전산 행정 확인 승인</div>
                <p className="steam-admin__desc">현재 세션의 실무 스탯 검증 데이터를 최종 원본으로 동의하며 리더보드 점수 락다운을 승인합니다.</p>
              </div>
              <div className="steam-admin__btns">
                <button className="steam-btn steam-btn--gold" onClick={() => { setAdminDone(true); if (typeof window !== "undefined") window.alert("AUTHENTICATED: 카이저 철수 크루 행정 확인 서명 완료 — 목록에 [행정 확인] 상태가 반영되었습니다."); }}>
                  본인 위클리 카드 행정 확인 서명
                </button>
                <button className="steam-btn steam-btn--ghost" onClick={() => { if (typeof window !== "undefined") window.alert("조정 문의 전용 게시판으로 이동합니다."); }}>
                  조정 이의 신청 게시판 이동
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="steam-footer">
          <Link href="/weekly-ranking" className="steam-back"><i className="fa-solid fa-arrow-left-long" /> BACK TO LEAGUE</Link>
          <span className="steam-footer__thanks">Thank you for watching.</span>
        </div>
      </div>

      {/* 위클리 카드 모달 */}
      <div className={`steam-modal ${modalCrew ? "is-open" : ""}`} onClick={() => setModalCrew(null)}>
        {modalCrew && (
          <div className="steam-modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="steam-modal__head">
              <h3><i className="fa-solid fa-gear" /> CARD · {modalCrew.name}</h3>
              <button className="steam-modal__close" onClick={() => setModalCrew(null)} aria-label="닫기">×</button>
            </div>
            <table className="steam-table">
              <tbody>
                <tr><td><strong>품계 레이어</strong></td><td><span className="steam-modal__hl">{modalCrew.rank}</span></td></tr>
                <tr><td><strong>아카데미 학적</strong></td><td>{modalCrew.univ} {modalCrew.major}</td></tr>
                <tr><td><strong>소속 연맹 리그</strong></td><td>하이브리드: {modalCrew.league}</td></tr>
                <tr><td><strong>주차 스코어 결과</strong></td><td>{card.weekNumber}주차 ({modalCrew.result})</td></tr>
              </tbody>
            </table>
            <p className="steam-modal__note">※ [주차 내용 확인 체크] 승인 시 그리드 및 위클리 리스트 카드에 크로스 체크 마크가 전사됩니다.</p>
            <div className="steam-modal__btns">
              <button className="steam-btn steam-btn--gold" onClick={triggerCheck}><i className="fa-solid fa-square-check" /> 주차 내용 확인 체크 (OK)</button>
              <button className="steam-btn steam-btn--ghost" onClick={() => setModalCrew(null)}>취소</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
