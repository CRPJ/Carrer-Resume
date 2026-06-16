"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ACT_LOG_ENTRIES,
  ACT_LOG_SUMMARY,
  DETAIL_LOG_ENTRIES,
  DETAIL_LOG_POINT_ICON,
  DETAIL_LOG_SUMMARY,
  type ActCrew,
  type DetailLogEntry,
  type DetailLogPointType,
} from "@/constants/dummyData/cluster4-detail-log-dummy";

interface DetailLogModalProps {
  show: boolean;
  onHide: () => void;
}

type FilterKey = "all" | "gain" | "loss";
type VariantKey =
  | "scroll"
  | "ledger"
  | "champion"
  | "arcade"
  | "relic"
  | "dash"
  | "neon"
  | "terminal"
  | "finale"
  | "leaderboard"
  | "casino";

const VARIANT_OPTIONS: { id: VariantKey; key: string; label: string }[] = [
  { id: "scroll", key: "A", label: "SCROLL" },
  { id: "ledger", key: "B", label: "LEDGER" },
  { id: "champion", key: "C", label: "CHAMPION" },
  { id: "arcade", key: "D", label: "ARCADE" },
  { id: "relic", key: "E", label: "RELIC" },
  { id: "dash", key: "F", label: "DASH" },
  { id: "neon", key: "G", label: "NEON" },
  { id: "terminal", key: "H", label: "TERMINAL" },
  { id: "finale", key: "I", label: "FINALE" },
  { id: "leaderboard", key: "J", label: "BOARD" },
  { id: "casino", key: "K", label: "CASINO" },
];

const POINT_ORDER: DetailLogPointType[] = ["단감", "인절미", "어흥"];

// 목업 톤 — 종류별 이모지
const POINT_EMOJI: Record<DetailLogPointType, string> = {
  단감: "🍑",
  어흥: "🐯",
  인절미: "🍡",
};

const RARITY_LABEL: Record<DetailLogEntry["rarity"], string> = {
  legendary: "LEGENDARY",
  epic: "EPIC",
  rare: "RARE",
  common: "COMMON",
};

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "all", label: "전체", icon: "ti ti-layout-grid" },
  { key: "gain", label: "획득", icon: "ti ti-trending-up" },
  { key: "loss", label: "차감", icon: "ti ti-trending-down" },
];

const fmtAmount = (n: number) => `${n > 0 ? "+" : "−"}${Math.abs(n)}`;

// 포인트 셀 표기 — 0은 그대로, 양수는 +, 음수는 −
const fmtPoint = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0");

// 크루 라벨 → 클래스 키
const CREW_KEY: Record<ActCrew, string> = {
  필수: "req",
  선택: "opt",
  선발: "pick",
  없음: "none",
};

// 액트 결과 → 아이콘 (텍스트 대신 표기, 설명은 hover/상단 지표)
const ACT_RESULT_ICON: Record<string, string> = {
  "체크 성공": "ti ti-circle-check-filled",
  "체크 실패": "ti ti-circle-x-filled",
};

// 액트명 10글자 초과 시 말줄임
const truncName = (s: string) => (s.length > 10 ? `${s.slice(0, 10)}…` : s);

// 발생 시점 오름차순(월 → 토) 정렬용 키 — "260304(화)" + "11:00" → 비교 가능한 숫자
const actSortKey = (date: string, time: string) => {
  const d = Number(date.replace(/[^0-9]/g, "").slice(0, 6)) || 0;
  const t = Number(time.replace(/[^0-9]/g, "")) || 0;
  return d * 10000 + t;
};
const ACT_ROWS = [...ACT_LOG_ENTRIES].sort(
  (a, b) =>
    actSortKey(a.occurredAt.date, a.occurredAt.time) - actSortKey(b.occurredAt.date, b.occurredAt.time),
);

const DetailLogModal: React.FC<DetailLogModalProps> = ({ show, onHide }) => {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [variant, setVariant] = useState<VariantKey>("scroll");
  // J(LEADERBOARD) 카테고리 탭
  const [lbCat, setLbCat] = useState(0);
  // 진입 연출용 — show 직후 한 틱 뒤 is-entered 로 전환해 stagger 발동
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!show) {
      setEntered(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onHide();
    };
    window.addEventListener("keydown", handleKeyDown);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(raf);
    };
  }, [show, onHide]);

  const entries = useMemo(() => {
    if (filter === "gain") return DETAIL_LOG_ENTRIES.filter((e) => e.amount > 0);
    if (filter === "loss") return DETAIL_LOG_ENTRIES.filter((e) => e.amount < 0);
    return DETAIL_LOG_ENTRIES;
  }, [filter]);

  if (!show || typeof document === "undefined") return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onHide();
  };

  const summary = DETAIL_LOG_SUMMARY;
  const maxType = Math.max(...POINT_ORDER.map((t) => summary.byType[t]), 1);

  // ── 공통 조각들 ──────────────────────────────
  const renderFilter = (cls = "") => (
    <div className={`dlog-filter ${cls}`} role="tablist" aria-label="내역 필터">
      {FILTERS.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={filter === t.key}
          className={`dlog-filter__btn${filter === t.key ? " is-active" : ""}`}
          onClick={() => setFilter(t.key)}
        >
          <i className={t.icon}></i>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );

  const emptyState = (
    <div className="dlog-empty">
      <i className="ti ti-mood-empty"></i>
      <span>해당하는 내역이 없어요</span>
    </div>
  );

  // 단순 행 리스트 (A/D/E/F 공용 마크업, 스타일만 분기)
  const renderRowList = () => (
    <div className="dlog-rows">
      {entries.map((entry, i) => (
        <article
          key={entry.id}
          className={`dlog-row rarity-${entry.rarity}${entry.amount < 0 ? " is-loss" : ""}`}
          data-type={entry.pointType}
          style={{ "--i": i } as React.CSSProperties}
        >
          <div className="dlog-row__left">
            <span className="dlog-row__emoji" aria-hidden>
              {POINT_EMOJI[entry.pointType]}
            </span>
            <div className="dlog-row__text">
              <div className="dlog-row__name">
                {entry.title}
                <em className="dlog-row__type">({entry.pointType})</em>
              </div>
              <div className="dlog-row__meta">
                <span className="dlog-row__tags">
                  #{entry.pointType} #{entry.category}
                </span>
                <span className="dlog-row__sep">|</span>
                <span className="dlog-row__when">
                  {entry.date} {entry.time}
                </span>
              </div>
            </div>
          </div>
          <span className={`dlog-row__point${entry.amount < 0 ? " minus" : " plus"}`}>
            {fmtAmount(entry.amount)}
          </span>
        </article>
      ))}
    </div>
  );

  // 리치 타임라인 카드 (C CHAMPION)
  const renderCards = () => (
    <>
      {entries.map((entry, i) => (
        <article
          key={entry.id}
          className={`dlog-card rarity-${entry.rarity}${entry.amount < 0 ? " is-loss" : ""}`}
          style={{ "--i": i } as React.CSSProperties}
        >
          <span className="dlog-card__node" aria-hidden />
          <span className="dlog-card__icon">
            <i className={entry.icon}></i>
          </span>
          <div className="dlog-card__main">
            <div className="dlog-card__top">
              <span className="dlog-card__cat">{entry.category}</span>
              <span className="dlog-card__rarity">{RARITY_LABEL[entry.rarity]}</span>
              {entry.combo ? (
                <span className="dlog-card__combo">
                  <i className="ti ti-bolt"></i>x{entry.combo}
                </span>
              ) : null}
            </div>
            <h4 className="dlog-card__title">{entry.title}</h4>
            <p className="dlog-card__desc">{entry.reason}</p>
            <span className="dlog-card__related">
              <i className="ti ti-link"></i>
              {entry.relatedLine}
            </span>
            <span className="dlog-card__time">
              <i className="ti ti-clock-hour-4"></i>
              {entry.date} · {entry.time}
            </span>
          </div>
          <div className="dlog-card__delta">
            <span className="dlog-card__delta-num">{fmtAmount(entry.amount)}</span>
            <span className="dlog-card__delta-type">
              <img src={DETAIL_LOG_POINT_ICON[entry.pointType]} alt={entry.pointType} />
              <small>{entry.pointType}</small>
            </span>
          </div>
        </article>
      ))}
    </>
  );

  // ── 액트 로그 공용 (디자인 A/B/K) ────────────
  // 주차·전체합산을 표 위에 고정하고, 발생 시점 순(월→토)으로 얇은 행 테이블을 그린다.
  const renderActBar = () => (
    <div className="alog__bar">
      <span className="alog__week">
        {ACT_LOG_SUMMARY.seasonLabel} {ACT_LOG_SUMMARY.weekLabel}
      </span>
      <span className="alog__legend" aria-label="액트 결과 아이콘 설명">
        <span className="lg-label">액트 결과</span>
        <span className="lg-ok">
          <i className={ACT_RESULT_ICON["체크 성공"]} /> 체크 성공
        </span>
        <span className="lg-fail">
          <i className={ACT_RESULT_ICON["체크 실패"]} /> 체크 실패
        </span>
      </span>
      <span className="alog__totals">
        {POINT_ORDER.map((t, i) => (
          <span key={t} className={`alog__tot ${["a", "b", "c"][i]}`}>
            {t} <b>+{ACT_LOG_SUMMARY.totals[t]}</b>
          </span>
        ))}
      </span>
    </div>
  );

  // 주간 결과 요약 패널 (D DASH 무드 — H 상단용)
  const actMaxType = Math.max(...POINT_ORDER.map((t) => Math.abs(ACT_LOG_SUMMARY.totals[t])), 1);
  const actTotalCnt = ACT_ROWS.length;
  const actOk = ACT_ROWS.filter((e) => e.result === "체크 성공").length;
  const actFail = actTotalCnt - actOk;
  const actRate = actTotalCnt ? Math.round((actOk / actTotalCnt) * 100) : 0;
  const renderActSummary = () => (
    <div className="alog-sum">
      <div className="alog-sum__top">
        <div className="alog-sum__id">
          <h4>주간 액트 결과</h4>
          <p>한 주간 수행한 액트 · {ACT_ROWS.length}건</p>
        </div>
        <span className="alog-sum__week">
          {ACT_LOG_SUMMARY.seasonLabel} {ACT_LOG_SUMMARY.weekLabel}
        </span>
      </div>

      <div className="alog-sum__hero">
        <div className="alog-sum__badges">
          <span className="b-streak">
            <i className="ti ti-flame" />
            {ACT_LOG_SUMMARY.streak}일 연속
          </span>
          <span className={`b-rank ${ACT_LOG_SUMMARY.rankDelta >= 0 ? "up" : "down"}`}>
            <i className={ACT_LOG_SUMMARY.rankDelta >= 0 ? "ti ti-caret-up-filled" : "ti ti-caret-down-filled"} />
            {Math.abs(ACT_LOG_SUMMARY.rankDelta)} 순위
          </span>
        </div>
      </div>

      <div className="alog-sum__grid">
        {POINT_ORDER.map((t) => (
          <div className="alog-sum__stat" key={t}>
            <img src={DETAIL_LOG_POINT_ICON[t]} alt={t} />
            <em>
              {ACT_LOG_SUMMARY.totals[t] > 0 ? "+" : ""}
              {ACT_LOG_SUMMARY.totals[t]}
            </em>
            <small>{t}</small>
            <span className="bar">
              <i style={{ width: entered ? `${(Math.abs(ACT_LOG_SUMMARY.totals[t]) / actMaxType) * 100}%` : "0%" }} />
            </span>
          </div>
        ))}
      </div>

      <div className="alog-sum__result">
        <div className="rs-top">
          <span className="rs-title">
            <i className="ti ti-checklist" /> 액트 결과 요약
          </span>
          <span className="rs-rate">
            성공률 <b>{actRate}%</b>
          </span>
        </div>
        <div className="rs-bar" role="img" aria-label={`성공 ${actOk}건 중 ${actTotalCnt}건`}>
          <i style={{ width: entered ? `${actRate}%` : "0%" }} />
        </div>
        <div className="rs-legend">
          <span className="lg-ok">
            <i className={ACT_RESULT_ICON["체크 성공"]} /> 체크 성공 <b>{actOk}</b>
          </span>
          <span className="lg-fail">
            <i className={ACT_RESULT_ICON["체크 실패"]} /> 체크 실패 <b>{actFail}</b>
          </span>
          <span className="rs-total">총 {actTotalCnt}건</span>
        </div>
      </div>
    </div>
  );

  const renderActTable = () => (
    <div className="alog__scroll detail-log-modal-body">
      <div className="alog__table">
        <div className="alog__row alog__row--head">
          <span>액트명</span>
          <span>결과</span>
          <span>소속 허브</span>
          <span>소속 라인</span>
          <span className="ta-r">소요(m)</span>
          <span>관련 포인트 (단감·인절미·어흥)</span>
          <span>크루</span>
          <span>발생 시점</span>
          <span>체크 시점</span>
        </div>
        {ACT_ROWS.map((e, i) => (
          <div
            key={e.id}
            className={`alog__row${e.result === "체크 실패" ? " is-fail" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className="al-name" title={e.name}>
              {truncName(e.name)}
            </span>
            <span className={`al-res ${e.result === "체크 실패" ? "fail" : "ok"}`} title={e.result} aria-label={e.result}>
              <i className={ACT_RESULT_ICON[e.result]} />
            </span>
            <span className="al-hub">{e.hub}</span>
            <span className="al-line">{e.line}</span>
            <span className="al-dur ta-r">{e.duration}m</span>
            <span className="al-pts">
              {POINT_ORDER.map((t, idx) => (
                <em key={t} className={`p ${["p-a", "p-b", "p-c"][idx]}${e.points[t] < 0 ? " is-neg" : ""}`}>
                  {t} {fmtPoint(e.points[t])}
                </em>
              ))}
            </span>
            <span className={`al-crew crew-${CREW_KEY[e.crew]}`}>{e.crew}</span>
            <span className="al-when">
              <b>{e.occurredAt.date}</b>
              <small>{e.occurredAt.time}</small>
            </span>
            <span className="al-when">
              <b>{e.checkedAt.date}</b>
              <small>{e.checkedAt.time}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // 콘솔 로그 피드 (H/K 공용 — 팔레트는 각 variant SCSS에서 분기)
  const renderActTerminal = () => (
    <div className="dlog-aterm">
      <div className="dlog-aterm__intro">
        <span className="prompt">$</span> tail -f act_history.log{" "}
        <span className="muted">
          // {ACT_ROWS.length} acts · {ACT_LOG_SUMMARY.seasonLabel} {ACT_LOG_SUMMARY.weekLabel}
        </span>
      </div>
      <div className="dlog-aterm__cols">
        <span>발생 시점</span>
        <span>액트명</span>
        <span>액트 결과</span>
        <span>소속 허브</span>
        <span>소속 라인</span>
        <span>소요 시간(m)</span>
        <span>관련 포인트</span>
        <span>크루</span>
        <span>체크 시점</span>
      </div>
      {ACT_ROWS.map((e, i) => (
        <div
          key={e.id}
          className={`dlog-aterm__line${e.result === "체크 실패" ? " is-fail" : ""}`}
          style={{ "--i": i } as React.CSSProperties}
        >
          <span className="a-time">
            {e.occurredAt.date} {e.occurredAt.time}
          </span>
          <span className="a-name" title={e.name}>
            {truncName(e.name)}
          </span>
          <span className={`a-res ${e.result === "체크 실패" ? "fail" : "ok"}`} title={e.result} aria-label={e.result}>
            <i className={ACT_RESULT_ICON[e.result]} />
          </span>
          <span className="a-hub">{e.hub}</span>
          <span className="a-line">{e.line}</span>
          <span className="a-dur">{e.duration}m</span>
          <span className="a-pts">
            {POINT_ORDER.map((t, idx) => (
              <em key={t} className={`${["p-a", "p-b", "p-c"][idx]}${e.points[t] < 0 ? " is-neg" : ""}`}>
                <img src={DETAIL_LOG_POINT_ICON[t]} alt="" aria-hidden />
                {t} {fmtPoint(e.points[t])}
              </em>
            ))}
          </span>
          <span className={`a-crew crew-${CREW_KEY[e.crew]}`}>{e.crew}</span>
          <span className="a-chk">
            {e.checkedAt.date} {e.checkedAt.time}
          </span>
        </div>
      ))}
      <div className="dlog-aterm__end">
        <span className="prompt">$</span>
        <span className="cursor" aria-hidden />
      </div>
    </div>
  );

  // ── 후보별 전체 레이아웃 ─────────────────────
  // A — SCROLL : 골드 두루마리 (액트 로그 테이블)
  const viewScroll = () => (
    <div className="dv dv-scroll alog-host">
      <div className="dv-scroll__title">
        <span className="dv-scroll__deco">📜</span>
        주차 액트 내역
      </div>
      {renderActBar()}
      <div className="dv-scroll__list detail-log-modal-body">{renderActTerminal()}</div>
    </div>
  );

  // B — LEDGER : 거래내역서 (액트 로그 테이블)
  const viewLedger = () => (
    <div className="dv dv-ledger alog-host">
      <div className="dv-ledger__head">
        <span className="dv-ledger__title">
          <i className="ti ti-file-invoice"></i> 주차 액트 내역서
        </span>
      </div>
      {renderActBar()}
      {renderActTable()}
    </div>
  );

  // C — CHAMPION : 토너먼트 연대기
  const viewChampion = () => (
    <div className="dv dv-champ">
      <div className="dv-champ__banner">
        <span className="dv-champ__crest">
          <i className="ti ti-trophy"></i>
        </span>
        <div className="dv-champ__titles">
          <h3>GRAND FINALE LOG</h3>
          <p>{summary.weekLabel} · 포인트 연대기</p>
        </div>
        <span className="dv-champ__total">
          +{summary.totalGained}
          <small>pt</small>
        </span>
      </div>
      {renderFilter("dlog-filter--champ")}
      <div className="dv-champ__feed detail-log-modal-body">
        {entries.length ? renderCards() : emptyState}
      </div>
    </div>
  );

  // D — ARCADE : 블루 게임 UI
  const viewArcade = () => (
    <div className="dv dv-arcade">
      <div className="dv-arcade__head">POINT HISTORY</div>
      {renderFilter("dlog-filter--arcade")}
      <div className="dv-arcade__list detail-log-modal-body">
        {entries.length ? renderRowList() : emptyState}
      </div>
    </div>
  );

  // E — RELIC : 우드/판타지 장부
  const viewRelic = () => (
    <div className="dv dv-relic">
      <div className="dv-relic__head">History Ledger</div>
      {renderFilter("dlog-filter--relic")}
      <div className="dv-relic__frame detail-log-modal-body">
        {entries.length ? renderRowList() : emptyState}
      </div>
    </div>
  );

  // F — DASH : 요약 대시보드
  const viewDash = () => (
    <div className="dv dv-dash">
      <div className="dv-dash__top">
        <div className="dv-dash__id">
          <h3>DETAIL LOG</h3>
          <p>한 주간 받은 포인트 내역 · {summary.entryCount}건</p>
        </div>
        <span className="dv-dash__week">{summary.weekLabel}</span>
      </div>

      <div className="dv-dash__hero">
        <div className="dv-dash__total">
          <span className="lbl">TOTAL GAINED</span>
          <span className="val">
            <em>+{summary.totalGained}</em>
            <small>pt</small>
          </span>
        </div>
        <div className="dv-dash__badges">
          <span className="b-streak">
            <i className="ti ti-flame"></i>
            {summary.streak}일 연속
          </span>
          <span className={`b-rank ${summary.rankDelta >= 0 ? "up" : "down"}`}>
            <i className={summary.rankDelta >= 0 ? "ti ti-caret-up-filled" : "ti ti-caret-down-filled"}></i>
            {Math.abs(summary.rankDelta)} 순위
          </span>
        </div>
      </div>

      <div className="dv-dash__grid">
        {POINT_ORDER.map((type) => (
          <div className="dv-dash__stat" key={type} data-type={type}>
            <img src={DETAIL_LOG_POINT_ICON[type]} alt={type} />
            <em>+{summary.byType[type]}</em>
            <small>{type}</small>
            <span className="bar">
              <i style={{ width: entered ? `${(summary.byType[type] / maxType) * 100}%` : "0%" }} />
            </span>
          </div>
        ))}
      </div>

      <div className="dv-dash__gauge">
        <div className="head">
          <span>활동 수행률</span>
          <strong>{summary.completionRate}%</strong>
        </div>
        <div className="track">
          <div className="fill" style={{ width: entered ? `${summary.completionRate}%` : "0%" }} />
        </div>
      </div>

      <div className="dv-dash__recent">
        <div className="rhead">
          <span>최근 내역</span>
          {renderFilter("dlog-filter--dash")}
        </div>
        <div className="rlist detail-log-modal-body">
          {entries.length ? renderRowList() : emptyState}
        </div>
      </div>
    </div>
  );

  // G — NEON : 글래스모피즘 게임 패널
  const viewNeon = () => (
    <div className="dv dv-neon">
      <div className="dv-neon__head">POINT HISTORY</div>
      {renderFilter("dlog-filter--neon")}
      <div className="dv-neon__list detail-log-modal-body">
        {entries.length ? renderRowList() : emptyState}
      </div>
    </div>
  );

  // H — TERMINAL : 콘솔 로그 (액트 인덱스 반영)
  const viewTerminal = () => (
    <div className="dv dv-term alog-host">
      <div className="dv-term__bar">
        <span className="dv-term__dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="dv-term__path">
          act_history.log — {ACT_LOG_SUMMARY.seasonLabel} {ACT_LOG_SUMMARY.weekLabel}
        </span>
      </div>
      <div className="dv-term__body detail-log-modal-body">
        {renderActSummary()}
        {renderActTerminal()}
      </div>
    </div>
  );

  // I — FINALE : 시상식 방송 (히어로 + 포디움 TOP3 + 리스트)
  const podium = [...DETAIL_LOG_ENTRIES]
    .filter((e) => e.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  const viewFinale = () => (
    <div className="dv dv-finale">
      <div className="dv-finale__hero">
        <span className="dv-finale__tag">GRAND FINALE · {summary.weekLabel}</span>
        <h3 className="dv-finale__title">POINT CEREMONY</h3>
        <span className="dv-finale__total">
          +{summary.totalGained}
          <small>pt</small>
        </span>
      </div>
      <div className="dv-finale__podium">
        {[1, 0, 2].map((slot) => {
          const e = podium[slot];
          if (!e) return null;
          return (
            <div className={`dv-finale__pod place-${slot + 1}`} key={e.id}>
              <span className="medal">{slot === 0 ? "🥇" : slot === 1 ? "🥈" : "🥉"}</span>
              <span className="pod-emoji">{POINT_EMOJI[e.pointType]}</span>
              <span className="pod-title">{e.title}</span>
              <span className="pod-amt">+{e.amount}</span>
            </div>
          );
        })}
      </div>
      {renderFilter("dlog-filter--finale")}
      <div className="dv-finale__feed detail-log-modal-body">
        {entries.length ? (
          <div className="dlog-ftab">
            <div className="dlog-ftab__row dlog-ftab__row--head">
              <span>종류</span>
              <span>시각</span>
              <span>내역 · 이유</span>
              <span className="ta-r">개수</span>
            </div>
            {entries.map((e, i) => (
              <div
                className={`dlog-ftab__row rarity-${e.rarity}${e.amount < 0 ? " is-loss" : ""}`}
                data-type={e.pointType}
                key={e.id}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="ft-type">
                  <img src={DETAIL_LOG_POINT_ICON[e.pointType]} alt={e.pointType} />
                  {e.pointType}
                </span>
                <span className="ft-time">
                  <b>{e.time}</b>
                  <small>{e.date}</small>
                </span>
                <span className="ft-name">
                  <b>
                    {e.title}
                    <em className="ft-cat">{e.category}</em>
                    {e.combo ? <em className="ft-combo">⚡x{e.combo}</em> : null}
                  </b>
                  <small>{e.reason}</small>
                </span>
                <span className={`ft-amt${e.amount < 0 ? " is-loss" : ""}`}>{fmtAmount(e.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          emptyState
        )}
      </div>
    </div>
  );

  // J — LEADERBOARD : "내" 주차 포인트 내역을 랭킹형으로 (E 우드 톤)
  // 크루 순위표가 아니라, 한 크루(=본인)의 이번 주 획득 내역을 큰 순서로 줄세운다.
  const LB_TABS: { key: string; label: string; type?: DetailLogPointType }[] = [
    { key: "all", label: "전체" },
    { key: "단감", label: "단감", type: "단감" },
    { key: "인절미", label: "인절미", type: "인절미" },
    { key: "어흥", label: "어흥", type: "어흥" },
  ];
  const lbTab = LB_TABS[lbCat] ?? LB_TABS[0];
  const lbRows = DETAIL_LOG_ENTRIES.filter((e) => (lbTab.type ? e.pointType === lbTab.type : true)).sort(
    (a, b) => b.amount - a.amount,
  );
  const lbMax = Math.max(...lbRows.map((e) => Math.abs(e.amount)), 1);
  const lbTop = lbRows[0];
  const viewLeaderboard = () => (
    <div className="dv dv-lb">
      <div className="dv-lb__head">
        POINT_BOARD
        <span className="dv-lb__head-sub">{summary.weekLabel} · 내 포인트 내역</span>
      </div>
      <div className="dv-lb__tabs">
        {LB_TABS.map((c, i) => (
          <button
            key={c.key}
            type="button"
            className={`dv-lb__tab${i === lbCat ? " is-active" : ""}`}
            onClick={() => setLbCat(i)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="dv-lb__scroll detail-log-modal-body">
        <div className="dv-lb__table">
          <div className="dv-lb__row dv-lb__row--head">
            <span>순위</span>
            <span>활동 · 이유</span>
            <span className="ta-r">개수</span>
          </div>
          {lbRows.map((e, idx) => (
            <div className={`dv-lb__row rank-${idx + 1}${e.amount < 0 ? " is-loss" : ""}`} key={e.id}>
              <span className="lb-rank">{idx + 1}</span>
              <span className="lb-crew">
                <b>
                  {e.title}
                  <em className="lb-type">{e.pointType}</em>
                </b>
                <small>
                  {e.category} · {e.relatedLine}
                </small>
                <span className="lb-bar">
                  <i style={{ width: entered ? `${(Math.abs(e.amount) / lbMax) * 100}%` : "0%" }} />
                </span>
              </span>
              <span className={`lb-rec${e.amount < 0 ? " is-loss" : ""}`}>{fmtAmount(e.amount)}</span>
            </div>
          ))}
          {lbRows.length === 0 && emptyState}
        </div>

        <div className="dv-lb__team">
          <div className="dv-lb__team-top">
            <span className="t-name">이번 주 포인트 요약</span>
            <span className="t-win">TOTAL +{summary.totalGained}pt</span>
          </div>
          <div className="dv-lb__team-stats">
            {POINT_ORDER.map((type) => (
              <span key={type}>
                {type} <b>+{summary.byType[type]}</b>
              </span>
            ))}
            <span>
              활동 수행률 <b>{summary.completionRate}%</b>
            </span>
            <span>
              연속 <b>{summary.streak}일</b>
            </span>
          </div>
        </div>

        {lbTop && (
          <div className="dv-lb__comment">
            <span className="dv-lb__comment-label">이번 주 코멘트</span>
            <p>
              최고 획득은 ‘{lbTop.title}’ (+{lbTop.amount} {lbTop.pointType})였어요. {summary.streak}일 연속 활동으로 꾸준함을
              이어갔습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // K — CASINO : 네온 콘솔 로그 피드 (H 무드, 액트 데이터)
  const viewCasino = () => (
    <div className="dv dv-casino alog-host">
      <div className="dv-casino__head">
        <span className="dv-casino__sign">★ ACT LOG ★</span>
      </div>
      {renderActBar()}
      <div className="dv-casino__scroll detail-log-modal-body">{renderActTerminal()}</div>
    </div>
  );

  const VIEWS: Record<VariantKey, () => React.ReactNode> = {
    scroll: viewScroll,
    ledger: viewLedger,
    champion: viewChampion,
    arcade: viewArcade,
    relic: viewRelic,
    dash: viewDash,
    neon: viewNeon,
    terminal: viewTerminal,
    finale: viewFinale,
    leaderboard: viewLeaderboard,
    casino: viewCasino,
  };

  return createPortal(
    <div className="section-modal-overlay detail-log-modal-overlay" onClick={handleOverlayClick}>
      <div
        className={`section-modal section-modal-detail-log dlog dlog--${variant}${entered ? " is-entered" : ""}`}
        data-variant={variant}
        role="dialog"
        aria-modal="true"
        aria-label="Detail Log"
      >
        <button type="button" className="modal-close-btn" onClick={onHide} aria-label="닫기">
          <i className="ti ti-x"></i>
        </button>

        {/* ── 디자인 후보 전환 스위처 ── */}
        <div className="dlog-switch" role="group" aria-label="디자인 후보 선택">
          <span className="dlog-switch__caption">DESIGN</span>
          {VARIANT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`dlog-switch__btn${variant === opt.id ? " is-active" : ""}`}
              onClick={() => setVariant(opt.id)}
              aria-pressed={variant === opt.id}
            >
              <b>{opt.key}</b>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {VIEWS[variant]()}
      </div>
    </div>,
    document.body,
  );
};

export default DetailLogModal;

