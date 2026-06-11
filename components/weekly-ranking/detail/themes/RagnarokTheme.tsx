"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { WeeklyCardData } from "@/constants/dummyData/weekly-card-dummy";
import type { WeeklyDetailInfo } from "@/constants/dummyData/weekly-detail-dummy";

interface Props {
  card: WeeklyCardData;
  detail: WeeklyDetailInfo;
}

type Hero = {
  name: string;
  rank: string;
  team: string;
  part: string;
  success: boolean;
  checked: boolean;
  spec: string; // "88%"
};

const INITIAL_HEROES: Hero[] = [
  { name: "강민혁 크루", rank: "정3품", team: "단감파이터즈", part: "기획", success: true, checked: false, spec: "88%" },
  { name: "신지원 크루", rank: "정1품", team: "인절미특공대", part: "개발", success: true, checked: true, spec: "95%" },
  { name: "오테오 크루", rank: "종2품", team: "단감파이터즈", part: "디자인", success: false, checked: false, spec: "42%" },
  { name: "윤도윤 크루", rank: "정3품", team: "길드이름없음", part: "PM", success: true, checked: false, spec: "79%" },
];

type CrewFilter = "all" | "success" | "fail";

export default function RagnarokTheme({ card, detail }: Props) {
  const isOngoing =
    card.leagueRecordStatus === "대전 중" || card.leagueRecordStatus === "대전 집계";
  const successRate = isOngoing ? 0 : card.growthSuccessRate;

  const [heroes, setHeroes] = useState<Hero[]>(INITIAL_HEROES);
  const [filter, setFilter] = useState<CrewFilter>("all");
  const [selected, setSelected] = useState<number | null>(null);

  const visibleHeroes = useMemo(() => {
    return heroes
      .map((h, i) => ({ h, i }))
      .filter(({ h }) =>
        filter === "all" ? true : filter === "success" ? h.success : !h.success
      );
  }, [heroes, filter]);

  // 포디움 — 카드 top3 를 등수별로 배치(없으면 placeholder).
  const byRank = (r: 1 | 2 | 3) => card.top3?.find((c) => c.rank === r);

  const confirmSelected = () => {
    if (selected === null) return;
    setHeroes((prev) => prev.map((h, i) => (i === selected ? { ...h, checked: true } : h)));
  };

  const selectedHero = selected !== null ? heroes[selected] : null;

  return (
    <div className="weekly-rag">
      <header>
        <h1 className="game-title">CREW WEEKLY RANKING</h1>
      </header>

      <main className="dashboard-container">
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
          {/* 섹션 1 — Weekly Briefing */}
          <section className="game-panel">
            <div className="panel-title">
              <span>🗝️ WEEKLY BRIEFING ({card.seasonName})</span>
              <span style={{ fontFamily: "'Orbitron'", fontSize: "0.9rem", color: "var(--cyan-glow)" }}>
                {card.dateRangeText}
              </span>
            </div>
            <div className="weekly-hud">
              <div
                className="avatar-frame"
                style={{ width: 70, height: 70, borderColor: "var(--cyan-glow)", boxShadow: "0 0 10px var(--cyan-glow)" }}
              >
                🌌
              </div>
              <div className="nebula-banner">
                <strong>[주차 개요]</strong> {detail.overview}
              </div>
            </div>
            <div>
              <div className="skill-label">
                <span style={{ color: "var(--green-glow)", fontWeight: 900 }}>전체 주차 성장 성공률 (승률)</span>
                <span style={{ fontFamily: "'Orbitron'", color: "var(--green-glow)" }}>
                  {isOngoing ? "N" : `${successRate}%`} [{successRate >= 80 ? "S" : successRate >= 60 ? "A" : "B"}-RANK]
                </span>
              </div>
              <div className="glow-bar-container">
                <div className="glow-bar-fill" style={{ width: `${successRate}%` }} />
              </div>
            </div>
          </section>

          {/* 섹션 2 — League Rankings & Guild Stats */}
          <section className="game-panel">
            <div className="panel-title">🏆 LEAGUE RANKINGS &amp; GUILD STATS</div>
            <div className="podium-wrapper">
              <div className="podium-slot rank-2">
                <div className="trophy-icon">🥈</div>
                <div style={{ marginTop: 25, fontWeight: 900 }}>단감 우수</div>
                <div style={{ fontSize: "0.85rem", color: "var(--cyan-glow)" }}>
                  {byRank(2)?.name ?? "-"} (2위)
                </div>
              </div>
              <div className="podium-slot rank-1">
                <div className="trophy-icon">👑</div>
                <div style={{ marginTop: 25, fontWeight: 900, color: "var(--gold-glow)" }}>인절미 우수</div>
                <div style={{ fontSize: "0.9rem", color: "var(--gold-glow)" }}>
                  {byRank(1)?.name ?? "-"} (1위)
                </div>
              </div>
              <div className="podium-slot rank-3">
                <div className="trophy-icon">🥉</div>
                <div style={{ marginTop: 25, fontWeight: 900 }}>성장 탑 10</div>
                <div style={{ fontSize: "0.85rem", color: "var(--purple-glow)" }}>
                  {byRank(3)?.name ?? "-"} (%순)
                </div>
              </div>
            </div>

            <h3 style={{ color: "var(--text-gold)", fontSize: "1.1rem", marginTop: 25, marginBottom: 10 }}>
              [2.3] 품계 정승 명단
            </h3>
            <div className="rank-badges-container">
              <div className="badge-item" title="정1품">⚔️</div>
              <div className="badge-item" title="정2품">🛡️</div>
              <div className="badge-item" title="정3품" style={{ borderColor: "var(--gold-glow)", boxShadow: "0 0 10px var(--gold-glow)" }}>👑</div>
              <div className="badge-item" title="종1품">🔮</div>
              <div className="badge-item" title="종2품">🏹</div>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
          {/* 섹션 3 — Crew Directory */}
          <section className="game-panel" style={{ flex: 1 }}>
            <div className="panel-title">
              <span>👥 CREW DIRECTORY</span>
              <div className="filter-crystal-group">
                <button className={`crystal-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>ALL MODE</button>
                <button className={`crystal-btn ${filter === "success" ? "active" : ""}`} onClick={() => setFilter("success")}>성공</button>
                <button className={`crystal-btn ${filter === "fail" ? "active" : ""}`} onClick={() => setFilter("fail")}>실패</button>
              </div>
            </div>

            <div className="crew-mesh-grid">
              {visibleHeroes.map(({ h, i }) => (
                <div
                  key={i}
                  className={`game-character-card ${h.success ? "status-success" : ""}`}
                  style={h.checked ? { borderColor: "var(--gold-glow)" } : undefined}
                  onClick={() => setSelected(i)}
                >
                  <div className="card-upper">
                    <div className="avatar-frame">{h.success ? "👑" : "💀"}</div>
                    <div className="char-specs">
                      <h3>
                        {h.name} <span style={{ color: "var(--text-gold)", fontSize: "0.8rem" }}>[{h.rank}]</span>
                      </h3>
                      <span>{h.team} • {h.part}</span>
                    </div>
                  </div>
                  <div className="skill-stat-row">
                    <div className="skill-label">
                      <span>주차 성장률</span>
                      <span style={{ fontFamily: "'Orbitron'" }}>{h.spec}</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div
                        className="skill-bar-fill"
                        style={{
                          width: h.spec,
                          ...(h.success ? {} : { background: "var(--ruby-red)", boxShadow: "0 0 8px var(--ruby-red)" }),
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: 8, color: "#718096", textAlign: "right" }}>
                    {h.checked ? "🔮 확인 완료" : "⏳ 미확인"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 섹션 4 — Time-limited Quest (행정 처리) */}
          <section className="game-panel">
            <div className="panel-title" style={{ borderLeftColor: "var(--ruby-red)" }}>
              ⚠️ TIME-LIMITED QUEST (행정 처리)
            </div>
            <div className="admin-flex-zone">
              <div className="scroll-quest-box">
                <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>금요일 14:00 레이드 마감 카운트다운</div>
                <div className="timer-countdown">02:14:55</div>
                <p style={{ fontSize: "0.8rem", color: "#a0aec0", margin: 0 }}>
                  로그인 후 나의 위클리 카드를 오픈하여 스탯 검증 &apos;확인&apos;을 수행하십시오.
                </p>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: 15, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontWeight: 900, color: "var(--gold-glow)", fontSize: "0.9rem" }}>⚠️ 증빙 가이드라인</span>
                <div style={{ fontSize: "0.8rem", marginTop: 10, color: "var(--green-glow)" }}>⭕ 통과: 타임스탬프가 보이는 스크린샷</div>
                <div style={{ fontSize: "0.8rem", marginTop: 5, color: "var(--ruby-red)" }}>❌ 실패: 하단 날짜 바가 잘려 나간 캡처본</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 위클리 카드 팝업 */}
      <div className={`popup-overlay ${selected !== null ? "active" : ""}`} onClick={() => setSelected(null)}>
        <div
          className={`legendary-card-popup ${selectedHero?.checked ? "is-checked" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="popup-checked-seal">CHECKED</div>
          <h2 style={{ fontFamily: "'Cinzel'", color: "var(--gold-glow)", marginTop: 0 }}>
            {selectedHero ? `${selectedHero.name} [${selectedHero.rank}]` : "HERO DETAIL"}
          </h2>
          <p style={{ color: "#cbd5e0", fontSize: "0.95rem", lineHeight: 1.6 }}>
            본인의 이번 주차 실무 정보 강화율 및 역량 점수를 최종 승인하시겠습니까? 승인 시 리포트 보드에 즉시 갱신됩니다.
          </p>
          <div style={{ margin: "25px 0" }}>
            <button className="quest-accept-btn" onClick={confirmSelected}>주차 내용 확인 완료</button>
          </div>
          <button
            style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setSelected(null)}
          >
            창 닫기
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link href="/weekly-ranking" className="crystal-btn">← 위클리 리그로</Link>
      </div>
    </div>
  );
}
