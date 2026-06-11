"use client";

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
  { key: "dan", label: "[2.1] 단감 우수" },
  { key: "injeol", label: "[2.2] 인절미 우수" },
  { key: "growth", label: "[2.3] 성장률 TOP" },
  { key: "jeong", label: "[2.3] 품계 정승" },
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
    key: "철수", name: "카이저 철수", level: "단감 레벨", levelColor: "var(--cyber-yellow)",
    badge: "정3품 정승", univ: "서울대학교", major: "컴퓨터공학", team: "단감 수호대", part: "백엔드 아키텍처",
    status: "주차 활동", statusColor: "var(--cyber-green)", league: "단감", result: "성장(성공)", rank: "정3품 정승 명단",
    success: true,
    bars: [
      { name: "주차 성장률 (85%)", pct: 85, count: "5개", color: "var(--cyber-green)" },
      { name: "실무 정보 강화율 (90%)", pct: 90, count: "9개" },
      { name: "실무 역량 강화율 (75%)", pct: 75, count: "3개" },
      { name: "실무 경험 강화율 (80%)", pct: 80, count: "4개" },
      { name: "실무 경력 강화율 (70%)", pct: 70, count: "2개" },
    ],
  },
  {
    key: "민수", name: "데스나이트 민수", level: "어흥 레벨", levelColor: "var(--cyber-pink)",
    badge: "종2품 정승", badgeBg: "#555", univ: "고려대학교", major: "산업디자인", team: "인절미 어벤져스", part: "UX/UI 프론트",
    status: "성장(실패)", statusColor: "var(--cyber-pink)", league: "어흥", result: "성장(실패)", rank: "종2품 판서 명단",
    success: false,
    bars: [
      { name: "주차 성장률 (35%)", pct: 35, count: "1개", color: "var(--cyber-pink)" },
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
const SORT_TRIGGERED = "인게임 정렬 매칭 트리거 발동: [1)누적주차 ➔ 2)성장률 ➔ 3)가나다 순 정렬 연산 중]";

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

  return (
    <div className="weekly-cyber">
      <header className="league-master-header">
        <h1 className="league-title">CREW RANKING PRO INTERFACE</h1>
        <div className="league-sub">시즌 연동형 실무 스탯 검증 및 행정 통제 마스터 대시보드</div>
      </header>

      <div className="dashboard-layout">
        {/* ===== SECTION 1 — 주차 정보 (와이드) ===== */}
        <section className="game-panel top-wide-section">
          <h2 className="panel-header">
            <i className="fa-solid fa-tower-broadcast" /> [SECTION 1] 주차 정보 핵심 리포트 컨트롤 타워
          </h2>
          <div className="section1-horizontal-container">
            <div className="hud-status-card">
              <div className="hud-label">[1.1] 배정 주차명</div>
              <div className="hud-value" style={{ color: "var(--cyber-yellow)" }}>{card.seasonName}</div>
            </div>

            <div className="hud-status-card">
              <div className="hud-label">[1.2] 실시간 주차기간</div>
              <div className="hud-value" style={{ fontSize: "1.1rem", lineHeight: 1.3 }}>{card.dateRangeText}</div>
            </div>

            <div className="hud-status-card">
              <div className="hud-label">[1.3] 전술 주차 개요 및 종합 평가</div>
              <div style={{ fontSize: "0.85rem", lineHeight: 1.4, color: "#cbd5e1" }}>{detail.overview}</div>
              <div className="crew-tag-container" style={{ marginTop: 8 }}>
                <span className="crew-tag tag-active">[1.4] 활동 {numOrN(card.growthChallenge)}명</span>
                <span className="crew-tag tag-rest">[1.5] 주차 휴식 {numOrN(card.personalRest)}명</span>
                <span className="crew-tag tag-rest">[1.6] 시즌 휴식 {numOrN(detail.seasonRestCrews)}명</span>
              </div>
            </div>

            <div className="hud-status-card grand-rate-display">
              <div className="hud-label">[1.11] 전체 주차 성장 성공률</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2.3rem", fontWeight: 900, color: "var(--cyber-green)", textShadow: "0 0 10px rgba(57,255,20,0.5)" }}>
                {isOngoing ? "N" : `${successRate}%`}
              </div>
              <div className="crew-tag-container" style={{ justifyContent: "center", marginTop: 4 }}>
                <span className="crew-tag tag-success">[1.7] 성공 {numOrN(card.growthSuccess)}</span>
                <span className="crew-tag tag-fail">[1.8] 실패 {numOrN(card.growthFail)}</span>
              </div>
            </div>
          </div>

          <div className="week-media-box" style={{ marginTop: 15 }}>
            <div className="mock-img">
              {card.imageUrl ? <img src={card.imageUrl} alt="" /> : <span>[1.9]<br />대표 스냅샷</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0 }}>
              <div className="hud-label" style={{ marginBottom: 3, color: "var(--cyber-cyan)" }}>[1.10] 이번 주 주요 주차 사회 소식 MATRIX</div>
              <ul className="social-issue-list">
                {detail.socialNews.map((n, i) => (
                  <li key={i}>• <strong style={{ color: "var(--cyber-yellow)" }}>[{n.category}]</strong> {n.title}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2 — 리더보드 ===== */}
        <section className="game-panel">
          <h2 className="panel-header"><i className="fa-solid fa-skull-crossbones" /> [SECTION 2] LEAGUE LEADERBOARD</h2>
          <div className="leaderboard-tabs">
            {LEAD_TABS.map((t) => (
              <div
                key={t.key}
                className={`l-tab-btn ${leadTab === t.key ? "active" : ""}`}
                onClick={() => setLeadTab(t.key)}
              >
                {t.label}
              </div>
            ))}
          </div>
          <div className="leaderboard-list">
            {LEAD_DATA[leadTab].map((item, i) => (
              <div key={i} className={`leaderboard-item ${item.rank.includes("1") ? "rank-1" : ""}`}>
                <span className="rank-badge">{item.rank}</span>
                <span>{item.name}</span>
                <span style={{ color: "var(--cyber-cyan)" }}>{item.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 2.6 — 팀 매트릭스 ===== */}
        <section className="game-panel">
          <h2 className="panel-header"><i className="fa-solid fa-shield-halved" /> [2.6] TEAM PROFILE MATRIX</h2>
          <div className="team-grid-container" style={{ gridTemplateColumns: "1fr" }}>
            <div className="team-matrix-card" style={{ borderLeft: "4px solid var(--cyber-green)" }}>
              <div className="team-top-meta">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Do Hyeon'", fontSize: "1.3rem", color: "var(--cyber-green)" }}>[2.7 승리] 단감 수호대 팀</span>
                  <span style={{ fontFamily: "'Orbitron'", color: "var(--cyber-green)", fontWeight: 900 }}>WIN RATE 100%</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-dark)", marginTop: 3 }}>팀장: 홍길동 (서울대 컴퓨터공학) | 백엔드 아키텍처 (파트장 1 / 에이전트 4)</div>
              </div>
              <div className="team-stats-mini">
                <div>전체 크루<br /><strong>6명</strong></div>
                <div>휴식 / 일반<br /><strong>0 / 5</strong></div>
                <div>성공 / 실패<br /><strong style={{ color: "var(--cyber-green)" }}>6 / 0</strong></div>
              </div>
              <div style={{ fontSize: "0.8rem", lineHeight: 1.4 }}>
                <strong>• 실무 프로젝트 목표:</strong> 분산 DB 트래픽 부하 복구 테스트 및 시나리오 검증 스크립트 빌드.<br />
                <strong>• 주차 진행 개요:</strong> 전원 마감 타임라인 돌파, 디버깅 크리티컬 스코어 완벽 방어.
              </div>
              <div className="mentor-speech-bubble" style={{ marginTop: 8 }}>
                <strong>[2.4 우수 크루 코멘트]:</strong> 카이저 철수 크루는 백업 아키텍처 설계에서 독보적 최적화를 완수했습니다.
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 3 — 크루 카드 & 필터 ===== */}
        <section className="game-panel full-width-section">
          <h2 className="panel-header"><i className="fa-solid fa-gamepad" /> [SECTION 3] CREW LIVE MATRICES & TACTICAL FILTERS</h2>

          <div className="filter-control-tower">
            <div className="filter-row">
              <span className="filter-label">주차 진행</span>
              {PROGRESS_FILTERS.map((f, i) => (
                <button key={f} className={`filter-btn ${progressIdx === i ? "active" : ""}`} onClick={() => onFilter("p", i)}>{f}</button>
              ))}
            </div>
            <div className="filter-row">
              <span className="filter-label">주차 결과</span>
              {RESULT_FILTERS.map((f, i) => (
                <button key={f} className={`filter-btn ${resultIdx === i ? "active" : ""}`} onClick={() => onFilter("r", i)}>{f}</button>
              ))}
            </div>
            <div className="filter-row" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="filter-label">정렬</span>
                <button className="filter-btn active" style={{ borderColor: sortTriggered ? "var(--cyber-cyan)" : "var(--cyber-yellow)", color: sortTriggered ? "var(--cyber-cyan)" : "var(--cyber-yellow)" }}>
                  {sortTriggered ? SORT_TRIGGERED : SORT_DEFAULT}
                </button>
              </div>
              <button className="btn-official-mode" onClick={resetOfficial}>
                <i className="fa-solid fa-ghost" /> 공식 모드 전환
              </button>
            </div>
          </div>

          <div className="crew-board-matrix">
            {CREWS.map((c) => (
              <div key={c.key} className="crew-game-card" onClick={() => setModalCrew(c)}>
                <span className="card-class-badge" style={c.badgeBg ? { background: c.badgeBg } : undefined}>{c.badge}</span>
                <div className="card-profile-block">
                  <div className={`card-avatar ${c.success ? "success-border" : "fail-border"}`}>
                    <i className={c.success ? "fa-solid fa-skull" : "fa-solid fa-bolt"} style={{ color: c.success ? "var(--cyber-cyan)" : "var(--cyber-pink)" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.2rem", fontFamily: "'Do Hyeon', sans-serif" }}>
                      {c.name} <span style={{ fontSize: "0.8rem", color: c.levelColor, fontFamily: "'Chakra Petch'" }}>({c.level})</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-dark)" }}>{c.univ} {c.major} | 누적: {card.weekNumber}주차</div>
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", marginBottom: 8, color: "#e2e8f0" }}>
                  팀: {c.team} | 파트: {c.part} | <span style={{ color: c.statusColor }}>상태: {c.status}</span>
                </div>
                <div className="stat-grid-bars">
                  {c.bars.map((b, bi) => (
                    <div key={bi} className="stat-bar-row">
                      <span className="stat-name">{b.name}</span>
                      <div className="stat-bar-track">
                        <div className="stat-bar-fill" style={{ width: `${b.pct}%`, ...(b.color ? { background: b.color } : {}) }} />
                      </div>
                      <span>{b.count}</span>
                    </div>
                  ))}
                </div>
                {(checked[c.key] || (adminDone && c.key === "철수")) && (
                  <div>
                    {checked[c.key] && (
                      <span className="stamp-indicator stamp-checked"><i className="fa-solid fa-circle-check" /> 위클리 검증 체크 완료</span>
                    )}
                    {adminDone && c.key === "철수" && (
                      <span className="stamp-indicator stamp-admin"><i className="fa-solid fa-fingerprint" /> 행정 확인 완료</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 4 — 행정 게이트 ===== */}
        <section className="game-panel full-width-section">
          <h2 className="panel-header"><i className="fa-solid fa-terminal" /> [SECTION 4] ADMINISTRATIVE CORE GATEWAY</h2>
          <div className="admin-gate-grid">
            <div className="admin-notice-box">
              <div style={{ fontFamily: "'Do Hyeon', sans-serif", color: "var(--cyber-pink)", fontSize: "1.3rem", marginBottom: 8 }}>
                <i className="fa-solid fa-circle-exclamation" /> 행정 데이터 최종 확약 안내문
              </div>
              <span style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                연동 성과 지표를 검토 후 <strong>매주 금요일 14:00까지</strong> 행정 확정 서명을 인가하십시오. 조정 문의는 <strong>당일 22:00까지</strong> 제출해야 반영됩니다.
              </span>
              <table className="example-table">
                <thead>
                  <tr><th>구분</th><th>확인 불가 예시 (Fail)</th><th>확인 가능 예시 (Pass)</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>캡처/날짜</strong></td><td>시각 정보 누락, 본문 일부만 전송</td><td>타임스탬프 + 식별 코드 동시 노출 전체 화면</td></tr>
                  <tr><td><strong>증빙 행동</strong></td><td>&quot;성실하게 완증함&quot; 기재</td><td>&quot;부하 분산 스크립트 설계 후 12회 디버깅 통과&quot;</td></tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14, background: "rgba(0,0,0,0.5)", padding: 20, border: "1px solid #233356" }}>
              <div>
                <div style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: "1.2rem", color: "var(--cyber-cyan)", marginBottom: 5 }}>
                  <i className="fa-solid fa-fingerprint" /> 암호화 전산 행정 확인 승인
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-dark)", lineHeight: 1.4 }}>
                  현재 세션의 실무 스탯 검증 데이터를 최종 원본으로 동의하며 리더보드 점수 락다운을 승인합니다.
                </p>
              </div>
              <div>
                <button
                  className="btn-action-admin"
                  style={{ background: "linear-gradient(90deg, #39ff14, #00ffff)", color: "#000", fontWeight: 900, boxShadow: "var(--neon-glow)" }}
                  onClick={() => { setAdminDone(true); if (typeof window !== "undefined") window.alert("AUTHENTICATED: 카이저 철수 크루 행정 확인 서명 완료 — 목록에 [행정 확인] 상태가 반영되었습니다."); }}
                >
                  본인 위클리 카드 행정 확인 서명
                </button>
                <button
                  className="btn-action-admin"
                  style={{ background: "#111827", border: "1px solid var(--cyber-pink)", color: "var(--cyber-pink)", boxShadow: "var(--pink-glow)" }}
                  onClick={() => { if (typeof window !== "undefined") window.alert("조정 문의 전용 게시판으로 이동합니다."); }}
                >
                  조정 이의 신청 게시판 이동
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/weekly-ranking" className="cyber-back">← BACK TO LEAGUE</Link>
      </div>

      {/* 위클리 카드 모달 */}
      <div className={`modal-overlay ${modalCrew ? "active" : ""}`} onClick={() => setModalCrew(null)}>
        {modalCrew && (
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10, marginBottom: 15 }}>
              <h3 style={{ margin: 0, fontFamily: "'Do Hyeon', sans-serif", fontSize: "1.6rem", color: "var(--cyber-cyan)" }}>🃏 CARD: {modalCrew.name}</h3>
              <span style={{ cursor: "pointer", fontSize: "1.8rem", color: "var(--cyber-pink)" }} onClick={() => setModalCrew(null)}>×</span>
            </div>
            <div style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "#cbd5e1", marginBottom: 20 }}>
              <table className="example-table">
                <tbody>
                  <tr><td><strong>품계 레이어</strong></td><td><span style={{ color: "var(--cyber-yellow)" }}>{modalCrew.rank}</span></td></tr>
                  <tr><td><strong>아카데미 학적</strong></td><td>{modalCrew.univ} {modalCrew.major}</td></tr>
                  <tr><td><strong>소속 연맹 리그</strong></td><td>하이브리드: {modalCrew.league}</td></tr>
                  <tr><td><strong>주차 스코어 결과</strong></td><td>{card.weekNumber}주차 ({modalCrew.result})</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: "0.8rem", color: "var(--cyber-cyan)", marginTop: 12, background: "rgba(0,0,0,0.3)", padding: 8, borderLeft: "2px solid var(--cyber-cyan)" }}>
                ※ [주차 내용 확인 체크] 승인 시 그리드 및 위클리 리스트 카드에 크로스 체크 마크가 전사됩니다.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="filter-btn active" style={{ flex: 1, padding: 12, fontFamily: "'Do Hyeon'", fontSize: "1.2rem" }} onClick={triggerCheck}>
                <i className="fa-solid fa-square-check" /> 주차 내용 확인 체크 (OK)
              </button>
              <button className="filter-btn" style={{ padding: 12, background: "#111" }} onClick={() => setModalCrew(null)}>취소</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
