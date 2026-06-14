"use client";

/* ============================================================
 * Weekly League 상세 — 테마 F "GRAND FINALE" (챔피언십)
 * 다크 + 골드(Cinzel) + 네온 블루/퍼플/오렌지(Orbitron), 토너먼트 전광판 무드.
 * 시상대 발표식 포디움 + 클랜 매치보드 + 판타지 크루 카드가 시그니처.
 * 데이터/인터랙션은 다른 테마와 동일 패리티 유지.
 * Scope: .weekly-champion 하위로만 한정.
 * ============================================================ */

import { useState } from "react";
import Link from "next/link";
import type { WeeklyCardData } from "@/constants/dummyData/weekly-card-dummy";
import type { WeeklyDetailInfo } from "@/constants/dummyData/weekly-detail-dummy";

interface Props {
  card: WeeklyCardData;
  detail: WeeklyDetailInfo;
}

/* ═══════════ 섹션 2 더미 — 크루 & 팀 ═══════════ */
// [2.4]/[2.6]/[2.7] 팀 — 우수 크루 멘트 + 상세 스탯 + 승패
type Team = {
  name: string;
  captain: string;
  captainAcad: string;
  growthAvg: number;
  parts: string;
  partLeads: number;
  agents: number;
  totalCrews: number;
  restCrews: number;
  successCrews: number;
  failCrews: number;
  normalCrews: number;
  projectGoal: string;
  overview: string;
  mvpName: string;
  mvpComment: string; // 팀장 멘트(~100자)
  emblem: string;
};
const TEAMS: Team[] = [
  {
    name: "ALPHA DIVISION",
    captain: "이순신", captainAcad: "한국대 컴퓨터공학 19학번",
    growthAvg: 88,
    parts: "백엔드 · 인프라 · 데이터",
    partLeads: 3, agents: 4, totalCrews: 14, restCrews: 2, successCrews: 9, failCrews: 3, normalCrews: 7,
    projectGoal: "결제 자동화 백엔드 아키텍처 MVP 출시 및 부하 테스트 통과",
    overview: "백엔드 자동화 전장에서 크루 전원이 완벽한 동기화에 성공, 핵심 마일스톤을 일정보다 앞당겨 클리어했습니다.",
    mvpName: "홍길동", mvpComment: "한 주 내내 새벽까지 인프라 장애를 붙잡고 끝내 무중단 배포 파이프라인을 완성했습니다. 알파의 자랑입니다.",
    emblem: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "BETA DIVISION",
    captain: "강감찬", captainAcad: "한양대 소프트웨어 20학번",
    growthAvg: 47,
    parts: "프론트엔드 · 디자인",
    partLeads: 2, agents: 3, totalCrews: 11, restCrews: 3, successCrews: 4, failCrews: 6, normalCrews: 6,
    projectGoal: "사용자 온보딩 플로우 리뉴얼 및 디자인 시스템 v2 적용",
    overview: "중간 단계 API 연동 결전에서 에러 오버플로우가 발생해 일부 퀘스트가 지연됐지만, 후반 리커버리로 절반 이상을 회복했습니다.",
    mvpName: "성춘향", mvpComment: "막힌 디자인 토큰 구조를 하루 만에 갈아엎고 팀 전체 작업 속도를 끌어올렸습니다. 위기의 순간 베타를 구했어요.",
    emblem: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "GAMMA DIVISION",
    captain: "유관순", captainAcad: "서울대 데이터사이언스 21학번",
    growthAvg: 75,
    parts: "AI · 데이터 · 리서치",
    partLeads: 2, agents: 5, totalCrews: 12, restCrews: 1, successCrews: 8, failCrews: 2, normalCrews: 6,
    projectGoal: "추천 모델 v3 학습 파이프라인 구축 및 오프라인 지표 10% 개선",
    overview: "데이터 라벨링 병목을 자동화로 돌파하며 모델 실험 사이클을 두 배로 단축, 안정적인 성장세를 이어간 한 주였습니다.",
    mvpName: "안중근", mvpComment: "라벨링 자동화 스크립트로 팀 전체 시간을 수십 시간 아껴줬습니다. 감마의 숨은 엔진이었습니다.",
    emblem: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=400&q=80",
  },
];

/* ═══════════ 섹션 3 더미 — 크루 명부 (LEGENDARY LEADERBOARD) ═══════════ */
type CrewStat = { label: string; icon: string; pct: number; delta: number };
type CrewAura = "eoheung" | "dangam" | "injeol" | "normal";
type Crew = {
  key: string;
  rank: number;        // 1·2·3 = 메달, 그 외 = 순위권 밖(일반)
  name: string;
  grade: string;       // 예: "어흥 [TIGER MASTER]"
  aura: CrewAura;
  univ: string;
  dept: string;
  role: string;        // CRITICAL HITTER 등
  team: string;        // ALPHA / BETA / GAMMA
  status: "주차 활동" | "주차 휴식";
  wcount: number;      // 누적 주차 (W-12)
  success: boolean;
  photo: string;
  stats: CrewStat[];   // 5개 — 첫 번째(주차 성장률)가 핵심 하이라이트
};

const mkStats = (g: number, info: number, skill: number, exp: number, career: number): CrewStat[] => [
  { label: "주차 성장률", icon: "⚡", pct: g, delta: Math.round(g * 0.13) },
  { label: "실무 정보", icon: "🔮", pct: info, delta: Math.round(info * 0.09) },
  { label: "실무 역량", icon: "⚔️", pct: skill, delta: Math.round(skill * 0.15) },
  { label: "실무 경험", icon: "📜", pct: exp, delta: Math.round(exp * 0.07) },
  { label: "실무 경력", icon: "💎", pct: career, delta: Math.round(career * 0.1) },
];

const CREWS: Crew[] = [
  {
    key: "self", rank: 1, name: "이순신", grade: "어흥 [TIGER MASTER]", aura: "eoheung",
    univ: "해양 제국 대학교", dept: "항해전술 전공", role: "CRITICAL HITTER",
    team: "ALPHA", status: "주차 활동", wcount: 12, success: true,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    stats: mkStats(94, 85, 99, 76, 60),
  },
  {
    key: "hong", rank: 2, name: "홍길동", grade: "단감 [SWEET ELITE]", aura: "dangam",
    univ: "고대 정령 대학교", dept: "마법연산 전공", role: "SPEED RUNNER",
    team: "BETA", status: "주차 활동", wcount: 8, success: true,
    photo: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=150&q=80",
    stats: mkStats(79, 62, 80, 55, 40),
  },
  {
    key: "chun", rank: 3, name: "성춘향", grade: "인절미 [JADE GUARD]", aura: "injeol",
    univ: "달빛 예술 대학교", dept: "멀티미디어디자인 전공", role: "SUPPORTER",
    team: "GAMMA", status: "주차 활동", wcount: 6, success: true,
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    stats: mkStats(73, 70, 68, 58, 45),
  },
  {
    key: "sim", rank: 4, name: "심청이", grade: "단감 [MEMBER]", aura: "dangam",
    univ: "심해 해저 대학교", dept: "자원인양 전공", role: "MEMBER",
    team: "DELTA", status: "주차 활동", wcount: 4, success: true,
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    stats: mkStats(34, 20, 41, 12, 10),
  },
  {
    key: "bae", rank: 5, name: "배수아", grade: "어흥 [RESTING]", aura: "eoheung",
    univ: "북풍 설원 대학교", dept: "빙결마법 전공", role: "MEMBER",
    team: "BETA", status: "주차 휴식", wcount: 9, success: false,
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    stats: mkStats(0, 0, 0, 0, 0),
  },
];

const STATE_FILTERS = ["전체", "주차 활동", "주차 휴식"] as const;
const ALLIANCE_FILTERS = ["전체", "ALPHA", "BETA", "GAMMA", "DELTA"] as const;

/* ═══════════ 섹션 4 더미 — 행정 처리 ═══════════ */
type Inquiry = { tag: string; text: string; state: "접수" | "처리중" | "완료" };
const INQUIRIES: Inquiry[] = [
  { tag: "성장률", text: "주차 성장률 집계 수치 재확인 요청", state: "처리중" },
  { tag: "휴식", text: "기말고사 휴식 사유 반영 누락 정정", state: "완료" },
  { tag: "캡처", text: "증빙 캡처 재제출 (날짜 표기 누락분)", state: "접수" },
];

export default function ChampionTheme({ card, detail }: Props) {
  const isOngoing =
    card.leagueRecordStatus === "대전 중" || card.leagueRecordStatus === "대전 집계";
  const numOrN = (v: number) => (isOngoing ? "N" : v.toLocaleString());

  const [stateIdx, setStateIdx] = useState(0);
  const [allianceIdx, setAllianceIdx] = useState(0);
  const [modalCrew, setModalCrew] = useState<Crew | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [adminDone, setAdminDone] = useState(false);
  const [adminConfirming, setAdminConfirming] = useState(false);

  const winRate = isOngoing ? "N" : `${card.growthSuccessRate}`;

  const visibleCrews = CREWS.filter(
    (c) =>
      (STATE_FILTERS[stateIdx] === "전체" || c.status === STATE_FILTERS[stateIdx]) &&
      (ALLIANCE_FILTERS[allianceIdx] === "전체" || c.team === ALLIANCE_FILTERS[allianceIdx])
  );

  // ── 섹션 1 파티 스탯 [1.4]~[1.8] (차트) ──
  const section1Stats = [
    { idx: "1.4", icon: "⚔️", label: "주차 활동 크루", short: "활동", raw: card.totalCrews, tone: "active" },
    { idx: "1.5", icon: "🛡️", label: "주차 휴식 크루", short: "휴식", raw: card.personalRest, tone: "rest" },
    { idx: "1.6", icon: "🌙", label: "시즌 휴식 크루", short: "시즌", raw: detail.seasonRestCrews, tone: "season" },
    { idx: "1.7", icon: "🏆", label: "성장 성공 크루", short: "성공", raw: card.growthSuccess, tone: "win" },
    { idx: "1.8", icon: "💀", label: "성장 실패 크루", short: "실패", raw: card.growthFail, tone: "lose" },
  ];
  const statMax = Math.max(...section1Stats.map((s) => s.raw), 1);
  // 성장 성공/실패 비율 (도넛 차트용)
  const winLossRate =
    card.growthSuccess + card.growthFail > 0
      ? Math.round((card.growthSuccess / (card.growthSuccess + card.growthFail)) * 100)
      : 0;

  const authorizeCard = () => {
    if (modalCrew) setChecked((p) => ({ ...p, [modalCrew.key]: true }));
    setModalCrew(null);
  };
  const resetOfficial = () => {
    setChecked({});
    setStateIdx(0);
    setAllianceIdx(0);
    if (typeof window !== "undefined") {
      window.alert("🔮 FORMAL MODE: 모든 검색 고정 필터 해제 및 동기화 상태가 초기 리셋되었습니다.");
    }
  };

  return (
    <div className="weekly-champion">
      <div className="champ-wrap">
        {/* ═════ 대형 전광판 헤더 ═════ */}
        <header className="champ-header">
          <h1 className="champ-title">CREW LEAGUE CHAMPIONSHIP</h1>
          <div className="champ-subtitle">WEEKLY ROUND {card.weekNumber} STATUS</div>
        </header>

        {/* ═════ 섹션 1 — 주차 정보 (RPG 퀘스트 로그) ═════ */}
        <section className="champ-panel champ-quest">
          {/* 퀘스트 로그 헤더 */}
          <div className="champ-quest__top">
            <span className="champ-quest__rune">❖</span>
            <div className="champ-quest__heading">
              <span className="champ-quest__title">QUEST&nbsp;LOG</span>
              <span className="champ-quest__sub">SECTION&nbsp;1 · 주차 정보</span>
            </div>
            <span className="champ-quest__rune">❖</span>
          </div>

          <div className="champ-quest__grid">
            {/* ── 좌측: 퀘스트 포스터 — 대표 이미지[1.9] + 주차명[1.1] + 기간[1.2] ── */}
            <div className="champ-quest__poster">
              <video
                className="champ-quest__poster-video"
                src="/videos/quest-banner.mp4"
                autoPlay
                loop
                muted
                playsInline
                poster={card.imageUrl ?? undefined}
              />
              <span className="champ-quest__poster-idx">1.9 · QUEST BANNER</span>
              <span className="champ-quest__poster-scan" aria-hidden="true" />
              <div className="champ-quest__poster-frame" aria-hidden="true" />
              <div className="champ-quest__poster-body">
                <span className="champ-quest__eyebrow">❗ ACTIVE QUEST</span>
                <h3 className="champ-quest__name">
                  <span className="champ-qtag">1.1</span>{card.seasonName}
                </h3>
                <span className="champ-quest__period">
                  <span className="champ-qtag">1.2</span>⏳ {card.dateRangeText}
                </span>
              </div>
            </div>

            {/* ── 우측: 퀘스트 일지 ── */}
            <div className="champ-quest__journal">
              {/* [1.3] 퀘스트 설명 (플레이버 텍스트) */}
              <div className="champ-quest__lore">
                <div className="champ-quest__lh">
                  <span className="champ-qtag">1.3</span>
                  <span className="champ-quest__lh-name">✦ QUEST LORE · 주차 개요</span>
                </div>
                <p className="champ-quest__lore-text">&ldquo;{detail.overview}&rdquo;</p>
              </div>

              {/* [1.4]~[1.8] 파티 스테이터스 — RPG 스탯 게이지 */}
              <div className="champ-party">
                <div className="champ-party__head">⚔ PARTY STATUS · 크루 현황</div>
                <div className="champ-pdash">
                  {/* 도넛 차트 — 성장 성공률 [1.7]/[1.8] */}
                  <div className="champ-donut">
                    <div
                      className="champ-donut__ring"
                      style={{
                        background: isOngoing
                          ? "conic-gradient(#2a2536 0 100%)"
                          : `conic-gradient(var(--cm-gold-bright) 0 ${winLossRate}%, #ff5a4d ${winLossRate}% 100%)`,
                      }}
                    >
                      <div className="champ-donut__hole">
                        <span className="champ-donut__pct">{isOngoing ? "N" : winLossRate}<i>%</i></span>
                        <span className="champ-donut__cap">성공률</span>
                      </div>
                    </div>
                    <div className="champ-donut__legend">
                      <span className="champ-donut__lg champ-donut__lg--win"><i />성공 <b>{numOrN(card.growthSuccess)}</b></span>
                      <span className="champ-donut__lg champ-donut__lg--lose"><i />실패 <b>{numOrN(card.growthFail)}</b></span>
                    </div>
                  </div>

                  {/* 막대 그래프 — 크루 5종 [1.4]~[1.8] */}
                  <div className="champ-bars">
                    {section1Stats.map((s) => (
                      <div key={s.idx} className={`champ-bar champ-bar--${s.tone}`}>
                        <span className="champ-bar__val">{numOrN(s.raw)}</span>
                        <span className="champ-bar__track">
                          <span
                            className="champ-bar__fill"
                            style={{ height: isOngoing ? "0%" : `${Math.max(5, Math.round((s.raw / statMax) * 100))}%` }}
                          />
                        </span>
                        <span className="champ-bar__lab">
                          <span className="champ-bar__ic" aria-hidden="true">{s.icon}</span>{s.short}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* [1.11] 퀘스트 달성률 — 전체 성장 성공율(승률) */}
              <div className="champ-quest__clear">
                <span className="champ-qtag champ-qtag--abs">1.11</span>
                <div className="champ-quest__clear-cap">QUEST CLEAR RATE · 평균 성장 성공율</div>
                <div className="champ-quest__clear-row">
                  <div className="champ-quest__clear-bar">
                    <span
                      className="champ-quest__clear-fill"
                      style={{ width: isOngoing ? "0%" : `${card.growthSuccessRate}%` }}
                    />
                  </div>
                  <div className="champ-quest__clear-pct">{winRate}<span>%</span></div>
                </div>
              </div>

              {/* [1.10] 월드 루머 게시판 — 주차 사회 소식 3개 */}
              <div className="champ-rumor">
                <div className="champ-rumor__head">
                  <span className="champ-qtag">1.10</span>
                  <span className="champ-rumor__head-name">📜 WORLD RUMORS · 주차 사회 소식</span>
                </div>
                <ul className="champ-rumor__list">
                  {detail.socialNews.map((n, i) => (
                    <li key={i} className="champ-rumor__item">
                      <span className="champ-rumor__mark" aria-hidden="true">◆</span>
                      <span className="champ-rumor__cat">{n.category}</span>
                      <span className="champ-rumor__title">{n.title}</span>
                      <span className="champ-rumor__src">— {n.source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═════ 섹션 2 — 크루 & 팀 (다크 럭셔리) ═════ */}
        <section className="champ-panel champ-arena">
          {/* 오너먼트 배너 헤더 */}
          <div className="champ-arena__banner">
            <span className="champ-arena__rune">⚜</span>
            <div className="champ-arena__heading">
              <h2 className="champ-arena__title">HALL OF CHAMPIONS</h2>
              <span className="champ-arena__sub">SECTION 2 · 크루 &amp; 팀</span>
            </div>
            <span className="champ-arena__rune">⚜</span>
          </div>

          {/* ── 레전더리 리더보드 (크루 명부) ── */}
          {/*<div className="champ-roster__banner">*/}
          {/*  <span className="champ-roster__rune">⚜</span>*/}
          {/*  <div className="champ-roster__heading">*/}
          {/*    <h2 className="champ-roster__title">LEGENDARY LEADERBOARD</h2>*/}
          {/*    <span className="champ-roster__sub">크루 명부</span>*/}
          {/*  </div>*/}
          {/*  <span className="champ-roster__rune">⚜</span>*/}
          {/*</div>*/}

          {/* 제어 대시보드 */}
          <div className="champ-ctrl">
            <div className="champ-ctrl__group">
              <span className="champ-ctrl__lbl">STATE</span>
              {STATE_FILTERS.map((f, i) => (
                <button key={f} className={`champ-gbtn ${stateIdx === i ? "is-active" : ""}`} onClick={() => setStateIdx(i)}>{f}</button>
              ))}
            </div>
            <div className="champ-ctrl__group">
              <span className="champ-ctrl__lbl">ALLIANCE</span>
              {ALLIANCE_FILTERS.map((f, i) => (
                <button key={f} className={`champ-gbtn ${allianceIdx === i ? "is-active" : ""}`} onClick={() => setAllianceIdx(i)}>{f}</button>
              ))}
            </div>
            <button className="champ-gbtn champ-gbtn--formal" onClick={resetOfficial}>FORMAL MODE</button>
          </div>

          {/* 크루 카드 리스트 */}
          <div className="champ-cl">
            {visibleCrews.map((c) => {
              const isChecked = checked[c.key] || (adminDone && c.key === "self");
              const rankClass = c.rank <= 3 ? `champ-cc--rank${c.rank}` : "";
              return (
                <div
                  key={c.key}
                  className={`champ-cc champ-cc--${c.aura} ${rankClass} ${isChecked ? "is-verified" : ""}`}
                  onClick={() => setModalCrew(c)}
                >
                  {/* 랭킹 배지 */}
                  <div className="champ-cc__rank">
                    {c.rank <= 3 ? (
                      <>
                        <span className="champ-cc__crown">{["👑", "✨", "🔥"][c.rank - 1]}</span>
                        <span className="champ-cc__rtext">{["1 ST", "2 ND", "3 RD"][c.rank - 1]}</span>
                      </>
                    ) : (
                      <span className="champ-cc__rnormal">N-{c.rank}</span>
                    )}
                  </div>

                  {/* 마름모 아바타 */}
                  <div className="champ-cc__avatar">
                    <img src={c.photo} alt="" />
                  </div>

                  {/* 프로필 */}
                  <div className="champ-cc__profile">
                    <div className="champ-cc__name">{c.name}</div>
                    <div className="champ-cc__grade">{c.grade}</div>
                  </div>

                  {/* 소속 메타 */}
                  <div className="champ-cc__meta">
                    <div className="champ-cc__univ">{c.univ}</div>
                    <div className="champ-cc__dept">{c.dept}</div>
                    <span className="champ-cc__role">{c.role}</span>
                  </div>

                  {/* 타임라인 */}
                  <div className="champ-cc__timeline">
                    <div className="champ-cc__wcount">W-{String(c.wcount).padStart(2, "0")}</div>
                    <div className={`champ-cc__pill ${c.success ? "" : "is-rest"}`}>{c.success ? "GROWTH" : "REST"}</div>
                  </div>

                  {/* 스탯 매트릭스 */}
                  <div className="champ-cc__stats">
                    {c.stats.map((s, si) => (
                      <div key={si} className={`champ-cc__stat ${si === 0 ? "is-epic" : ""}`}>
                        <span className="champ-cc__s-label"><span className="champ-cc__s-icon">{s.icon}</span>{s.label}</span>
                        <span className="champ-cc__s-value">{isOngoing ? "N" : `${s.pct}% (+${s.delta})`}</span>
                      </div>
                    ))}
                  </div>

                  {/* 검증 인장 */}
                  <div className="champ-cc__seal">
                    {isChecked && <span className="champ-cc__adminbadge">행정 확인</span>}
                    <div className="champ-cc__check">✔</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── [2.4] 팀별 우수 크루 (MVP + 팀장 멘트) ── */}
          <div className="champ-sub2">
            <span className="champ-sub2__rune">★</span>
            <h3 className="champ-sub2__title">팀별 우수 크루 · MVP</h3>
            <span className="champ-sub2__tag">2.4</span>
          </div>
          <div className="champ-mvp">
            {TEAMS.map((t) => (
              <div key={t.name} className="champ-mvp__card">
                <div className="champ-mvp__avatar"><img src={t.emblem} alt="" /></div>
                <div className="champ-mvp__body">
                  <div className="champ-mvp__top">
                    <span className="champ-mvp__name">{t.mvpName}</span>
                    <span className="champ-mvp__team">{t.name}</span>
                  </div>
                  <p className="champ-mvp__quote">&ldquo;{t.mvpComment}&rdquo;</p>
                  <span className="champ-mvp__by">— 팀장 {t.captain}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── [2.5][2.6][2.7] 팀 목록 ── */}
          <div className="champ-sub2">
            <span className="champ-sub2__rune">⚔</span>
            <h3 className="champ-sub2__title">팀 목록 · TEAM ROSTER</h3>
            <span className="champ-sub2__count">활동 팀 <b>{TEAMS.length}</b></span>
            <span className="champ-sub2__tag">2.5–2.7</span>
          </div>
          <div className="champ-teams">
            {TEAMS.map((t) => {
              const total = t.successCrews + t.failCrews;
              const rate = total ? Math.round((t.successCrews / total) * 100) : 0;
              const win = !isOngoing && rate >= 50;
              return (
                <div key={t.name} className={`champ-team ${win ? "is-win" : "is-lose"}`}>
                  <div className="champ-team__head">
                    <img className="champ-team__emblem" src={t.emblem} alt="" />
                    <div className="champ-team__id">
                      <h4 className="champ-team__name">{t.name}</h4>
                      <p className="champ-team__captain">팀장 {t.captain} · {t.captainAcad}</p>
                      <p className="champ-team__parts">{t.parts}</p>
                    </div>
                    <div className="champ-team__verdict">
                      <span className={`champ-team__wl ${win ? "win" : "lose"}`}>{isOngoing ? "—" : win ? "WIN" : "LOSE"}</span>
                      <span className="champ-team__rate">승률 {isOngoing ? "N" : `${rate}%`}</span>
                    </div>
                  </div>

                  <div className="champ-team__avg">
                    <span className="champ-team__avg-cap">주차 성장 성공율(평균)</span>
                    <span className="champ-team__avg-bar">
                      <span className="champ-team__avg-fill" style={{ width: isOngoing ? "0%" : `${t.growthAvg}%` }} />
                    </span>
                    <span className="champ-team__avg-pct">{isOngoing ? "N" : `${t.growthAvg}%`}</span>
                  </div>

                  <div className="champ-team__stats">
                    <span className="champ-team__stat"><b>{numOrN(t.totalCrews)}</b>전체 크루</span>
                    <span className="champ-team__stat"><b>{t.partLeads}</b>파트장</span>
                    <span className="champ-team__stat"><b>{t.agents}</b>에이전트</span>
                    <span className="champ-team__stat"><b>{numOrN(t.normalCrews)}</b>일반 크루</span>
                    <span className="champ-team__stat is-win"><b>{numOrN(t.successCrews)}</b>주차 성공(승)</span>
                    <span className="champ-team__stat is-lose"><b>{numOrN(t.failCrews)}</b>주차 실패(패)</span>
                    <span className="champ-team__stat"><b>{numOrN(t.restCrews)}</b>휴식 크루</span>
                  </div>

                  <div className="champ-team__field">
                    <span className="champ-team__field-k">🎯 실무 프로젝트 목표</span>
                    <p className="champ-team__field-v">{t.projectGoal}</p>
                  </div>
                  <div className="champ-team__field">
                    <span className="champ-team__field-k">📜 주차 진행 개요</span>
                    <p className="champ-team__field-v">{t.overview}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═════ 섹션 4 — 행정 처리 (ADMINISTRATIVE ORDER) ═════ */}
        <section className="champ-panel champ-admin2">
          <div className="champ-roster__banner">
            <span className="champ-roster__rune">📜</span>
            <div className="champ-roster__heading">
              <h2 className="champ-roster__title">ADMINISTRATIVE ORDER</h2>
              <span className="champ-roster__sub">SECTION 4 · 행정 처리</span>
            </div>
            <span className="champ-roster__rune">📜</span>
          </div>

          {/* [4.1] 안내문 */}
          <div className="champ-notice">
            <div className="champ-notice__head">⚠ DIRECTIVE NOTICE · 행정 처리 안내</div>
            <p className="champ-notice__body">
              아래 안내문을 정독한 뒤, 로그인하여 <strong>본인 위클리 카드</strong>에서 행정 처리를 <strong>확인</strong>하세요.
              확인·전송은 <strong>당일 20:00</strong>까지 마쳐야 하며, 모든 행정 처리는 <strong>금요일 14:00</strong>까지 완료해야 합니다.
              데이터 오차·이의가 있으면 조정 문의를 <strong>당일 22:00</strong>까지 등록하십시오.
            </p>
            <div className="champ-notice__deadlines">
              <span className="champ-dl"><b>20:00</b>당일 제출·확인</span>
              <span className="champ-dl champ-dl--final"><b>금 14:00</b>행정 마감</span>
              <span className="champ-dl champ-dl--ask"><b>22:00</b>조정 문의 마감</span>
            </div>
          </div>

          <div className="champ-admin2__grid">
            {/* [4.2] 행정 확인 서명 */}
            <div className="champ-acard">
              <div className="champ-acard__head">🪪 나의 위클리 카드 · 행정 확인</div>
              {adminDone ? (
                <div className="champ-acard__done">
                  <span className="champ-acard__done-ic">✔</span>
                  <p>행정 확인 완료 — 명부 목록 칸에 <strong>[행정 확인]</strong> 상태가 반영되었습니다.</p>
                </div>
              ) : adminConfirming ? (
                <div className="champ-acard__confirm">
                  <p>한 번 더 <strong>확인</strong>하면 명부 목록 칸에 <strong>[행정 확인]</strong>이 기록됩니다. 진행할까요?</p>
                  <div className="champ-acard__btns">
                    <button className="champ-gbtn" onClick={() => setAdminConfirming(false)}>취소</button>
                    <button
                      className="champ-gbtn champ-gbtn--ok"
                      onClick={() => {
                        setAdminDone(true);
                        setAdminConfirming(false);
                        if (typeof window !== "undefined") window.alert("이순신 크루 행정 확인 완료 — 명부에 [행정 확인]이 반영되었습니다.");
                      }}
                    >
                      확인
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="champ-acard__desc">
                    로그인 후 본인 위클리 카드의 집계 데이터를 점검하고, 이상이 없으면 <strong>확인</strong>을 눌러 서명하세요.
                    (확인 → 확인 2단계)
                  </p>
                  <button className="champ-gbtn champ-gbtn--ok champ-acard__cta" onClick={() => setAdminConfirming(true)}>
                    행정 처리 확인
                  </button>
                </>
              )}
            </div>

            {/* [4.3] 조정 문의 게시판 */}
            <div className="champ-acard">
              <div className="champ-acard__head">📨 조정 문의 게시판</div>
              <p className="champ-acard__desc">
                데이터 오차·이의가 있으면 문의 게시판에서 조정 문의를 작성하세요. <strong>당일 22:00</strong>까지 입력 완료해야 합니다.
              </p>
              <div className="champ-qboard">
                <div className="champ-qboard__row champ-qboard__row--h">
                  <span>구분</span><span>내용</span><span>상태</span>
                </div>
                {INQUIRIES.map((q, i) => (
                  <div key={i} className="champ-qboard__row">
                    <span className="champ-qboard__tag">{q.tag}</span>
                    <span className="champ-qboard__text">{q.text}</span>
                    <span className={`champ-qboard__state is-${q.state === "완료" ? "done" : q.state === "처리중" ? "ing" : "new"}`}>{q.state}</span>
                  </div>
                ))}
              </div>
              <button
                className="champ-gbtn champ-gbtn--formal champ-acard__cta"
                onClick={() => { if (typeof window !== "undefined") window.alert("조정 문의 게시판 페이지로 이동합니다."); }}
              >
                ✍ 문의 작성하기 →
              </button>
            </div>
          </div>

          {/* [4.4] 증빙 예시 & 양식 */}
          <div className="champ-sub2">
            <span className="champ-sub2__rune">📸</span>
            <h3 className="champ-sub2__title">증빙 예시 &amp; 양식 · EVIDENCE STANDARDS</h3>
          </div>
          <div className="champ-evid2">
            <div className="champ-ex2 champ-ex2--ok">
              <div className="champ-ex2__imgwrap">
                <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80" alt="" />
                <span className="champ-ex2__tag">확인 가능 (O)</span>
              </div>
              <ul className="champ-ex2__list">
                <li><b>캡처</b> 작업 화면 전체가 또렷하게 보임</li>
                <li><b>행동</b> 커밋·PR·산출물 등 구체 행동이 드러남</li>
                <li><b>날짜</b> 캡처에 날짜·시각이 함께 표시됨</li>
              </ul>
            </div>
            <div className="champ-ex2 champ-ex2--no">
              <div className="champ-ex2__imgwrap">
                <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=80" alt="" />
                <span className="champ-ex2__tag">확인 불가 (X)</span>
              </div>
              <ul className="champ-ex2__list">
                <li><b>캡처</b> 일부만 보이거나 흐려서 식별 불가</li>
                <li><b>행동</b> 무엇을 했는지 알 수 없음</li>
                <li><b>날짜</b> 날짜 미표시 또는 제출 주차와 불일치</li>
              </ul>
            </div>
            <div className="champ-form">
              <div className="champ-form__head">📋 제출 양식</div>
              <ol className="champ-form__list">
                <li><b>① 캡처</b> 화면 전체 + 식별 정보(URL/계정 등) 포함</li>
                <li><b>② 행동</b> 무엇을 했는지 한 줄로 설명</li>
                <li><b>③ 날짜</b> YYYY.MM.DD HH:MM 형식 명시</li>
              </ol>
              <p className="champ-form__note">※ 세 요소(캡처·행동·날짜)가 모두 충족되어야 ‘확인 가능’으로 처리됩니다.</p>
            </div>
          </div>

          <Link href="/weekly-ranking" className="champ-back">← BACK TO LEAGUE</Link>
        </section>
      </div>

      {/* 🔮 위클리 검증 팝업 모달 */}
      <div className={`champ-modal ${modalCrew ? "active" : ""}`} onClick={() => setModalCrew(null)}>
        {modalCrew && (
          <div
            className={`champ-modal__card ${checked[modalCrew.key] || (adminDone && modalCrew.key === "self") ? "is-verified" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="champ-modal__seal">VERIFIED APPROVED</span>
            <div className="champ-modal__rhombus"><img src={modalCrew.photo} alt="" /></div>
            <h3 className="champ-modal__name">{modalCrew.name}</h3>
            <p className="champ-modal__rank">{modalCrew.grade} // {modalCrew.team} 팀 · {card.weekNumber}주차</p>
            <p className="champ-modal__quote">
              검증 마법 서명 시 대시보드 크루 보드판에 영구적인 주차 완료 에메랄드 각인 인장이 부여됩니다.
            </p>
            <div className="champ-modal__btns">
              <button className="champ-btn" onClick={() => setModalCrew(null)}>닫기</button>
              <button className="champ-btn champ-btn--ok" onClick={authorizeCard}>검증 승인 (OK)</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}