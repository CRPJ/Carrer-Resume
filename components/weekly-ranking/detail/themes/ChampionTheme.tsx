"use client";

/* ============================================================
 * Weekly League 상세 — 테마 F "GRAND FINALE" (챔피언십)
 * 다크 + 골드(Cinzel) + 네온 블루/퍼플/오렌지(Orbitron), 토너먼트 전광판 무드.
 * 시상대 발표식 포디움 + 클랜 매치보드 + 판타지 크루 카드가 시그니처.
 * 데이터/인터랙션은 다른 테마와 동일 패리티 유지.
 * Scope: .weekly-champion 하위로만 한정.
 * ============================================================ */

import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import type { WeeklyCardData } from "@/constants/dummyData/weekly-card-dummy";
import type { WeeklyDetailInfo } from "@/constants/dummyData/weekly-detail-dummy";

interface Props {
  card: WeeklyCardData;
  detail: WeeklyDetailInfo;
}

/* ═══════════ 섹션 2 더미 — 크루 & 팀 ═══════════ */
// [2.1][2.2][2.3]/품계 — 우수 크루 랭킹 데이터 (ELITE 쇼케이스 필터 소스)
type RankRow = { rank: number; name: string; meta: string; val: string; pct: number };

const DANGAM_TOP: RankRow[] = [
  { rank: 1, name: "김철수", meta: "정1품 단감킹", val: "98.4%", pct: 98 },
  { rank: 2, name: "박민수", meta: "정3품 단감소드", val: "92.0%", pct: 92 },
  { rank: 3, name: "이진아", meta: "종2품 단감가디언", val: "84.1%", pct: 84 },
  { rank: 4, name: "정해린", meta: "정4품 단감레인저", val: "80.6%", pct: 81 },
  { rank: 5, name: "오세훈", meta: "종3품 단감메이지", val: "77.2%", pct: 77 },
  { rank: 6, name: "한가람", meta: "정5품 단감로그", val: "73.8%", pct: 74 },
  { rank: 7, name: "서지우", meta: "종4품 단감워든", val: "70.1%", pct: 70 },
  { rank: 8, name: "문도윤", meta: "정6품 단감스카웃", val: "66.5%", pct: 67 },
  { rank: 9, name: "배수아", meta: "종5품 단감팔라딘", val: "62.9%", pct: 63 },
  { rank: 10, name: "임재현", meta: "정7품 단감랜서", val: "59.3%", pct: 59 },
];
const INJEOL_TOP: RankRow[] = [
  { rank: 1, name: "발라카스 지원", meta: "정1품 인절미대장", val: "99.1%", pct: 99 },
  { rank: 2, name: "최지원", meta: "종1품 인절미가드", val: "89.7%", pct: 90 },
  { rank: 3, name: "윤도현", meta: "정3품 인절미전사", val: "81.2%", pct: 81 },
  { rank: 4, name: "강하늘", meta: "종3품 인절미클레릭", val: "75.4%", pct: 75 },
  { rank: 5, name: "노유진", meta: "정5품 인절미아처", val: "68.0%", pct: 68 },
];
const GROWTH_TOP: RankRow[] = [
  { rank: 1, name: "발라카스 지원", meta: "인절미", val: "+24.5%", pct: 100 },
  { rank: 2, name: "김철수", meta: "단감", val: "+18.2%", pct: 74 },
  { rank: 3, name: "이영희", meta: "단감", val: "+12.9%", pct: 53 },
  { rank: 4, name: "최지원", meta: "인절미", val: "+11.4%", pct: 47 },
  { rank: 5, name: "정해린", meta: "단감", val: "+9.8%", pct: 40 },
  { rank: 6, name: "윤도현", meta: "인절미", val: "+8.1%", pct: 33 },
  { rank: 7, name: "오세훈", meta: "단감", val: "+6.7%", pct: 27 },
  { rank: 8, name: "강하늘", meta: "인절미", val: "+5.2%", pct: 21 },
  { rank: 9, name: "한가람", meta: "단감", val: "+3.9%", pct: 16 },
  { rank: 10, name: "노유진", meta: "인절미", val: "+2.4%", pct: 10 },
];
type JeongRow = { grade: string; names: string };
const JEONGSEUNG: JeongRow[] = [
  { grade: "정1품 영의정", names: "김철수 · 발라카스 지원" },
  { grade: "종1품 좌의정", names: "이영희" },
  { grade: "정2품 우의정", names: "박민수" },
  { grade: "종2품 좌찬성", names: "최지원 · 이진아" },
  { grade: "정3품 도승지", names: "윤도현 · 정해린" },
];
// [2.4]/[2.6]/[2.7] 팀 — 우수 크루 멘트 + 상세 스탯 + 승패
type Team = {
  name: string;
  captain: string;
  captainAcad: string;
  captainPhoto: string; // 팀장 프로필 — 게임/AI 캐릭터 아바타
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
    name: "알파팀",
    captain: "이순신", captainAcad: "한국대 컴퓨터공학 19학번",
    captainPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Yi-Sunsin&backgroundType=gradientLinear&backgroundColor=ffd76a,ff9d3f",
    growthAvg: 88,
    parts: "백엔드 · 인프라 · 데이터",
    partLeads: 3, agents: 4, totalCrews: 14, restCrews: 2, successCrews: 9, failCrews: 3, normalCrews: 7,
    projectGoal: "결제 자동화 백엔드 아키텍처 MVP 출시 및 부하 테스트 통과",
    overview: "백엔드 자동화 전장에서 크루 전원이 완벽한 동기화에 성공, 핵심 마일스톤을 일정보다 앞당겨 클리어했습니다.",
    mvpName: "홍길동", mvpComment: "한 주 내내 새벽까지 인프라 장애를 붙잡고 끝내 무중단 배포 파이프라인을 완성했습니다. 알파의 자랑입니다.",
    emblem: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "베타팀",
    captain: "강감찬", captainAcad: "한양대 소프트웨어 20학번",
    captainPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Gang-Gamchan&backgroundType=gradientLinear&backgroundColor=c98bff,6a3fa0",
    growthAvg: 47,
    parts: "프론트엔드 · 디자인",
    partLeads: 2, agents: 3, totalCrews: 11, restCrews: 3, successCrews: 4, failCrews: 6, normalCrews: 6,
    projectGoal: "사용자 온보딩 플로우 리뉴얼 및 디자인 시스템 v2 적용",
    overview: "중간 단계 API 연동 결전에서 에러 오버플로우가 발생해 일부 퀘스트가 지연됐지만, 후반 리커버리로 절반 이상을 회복했습니다.",
    mvpName: "성춘향", mvpComment: "막힌 디자인 토큰 구조를 하루 만에 갈아엎고 팀 전체 작업 속도를 끌어올렸습니다. 위기의 순간 베타를 구했어요.",
    emblem: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "감마팀",
    captain: "유관순", captainAcad: "서울대 데이터사이언스 21학번",
    captainPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Yu-Gwansun&backgroundType=gradientLinear&backgroundColor=00f0ff,6a5bff",
    growthAvg: 75,
    parts: "AI · 데이터 · 리서치",
    partLeads: 2, agents: 5, totalCrews: 12, restCrews: 1, successCrews: 8, failCrews: 2, normalCrews: 6,
    projectGoal: "추천 모델 v3 학습 파이프라인 구축 및 오프라인 지표 10% 개선",
    overview: "데이터 라벨링 병목을 자동화로 돌파하며 모델 실험 사이클을 두 배로 단축, 안정적인 성장세를 이어간 한 주였습니다.",
    mvpName: "안중근", mvpComment: "라벨링 자동화 스크립트로 팀 전체 시간을 수십 시간 아껴줬습니다. 감마의 숨은 엔진이었습니다.",
    emblem: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "델타팀",
    captain: "신사임당", captainAcad: "연세대 디자인공학 20학번",
    captainPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shin-Saimdang&backgroundType=gradientLinear&backgroundColor=ff3df5,bd00ff",
    growthAvg: 81,
    parts: "프로덕트 · UX · 리서치",
    partLeads: 2, agents: 3, totalCrews: 10, restCrews: 1, successCrews: 7, failCrews: 2, normalCrews: 5,
    projectGoal: "프로덕트 분석 대시보드 구축 및 핵심 지표 자동 리포팅",
    overview: "사용자 인터뷰 12건을 한 주에 소화하며 가설 검증 속도를 끌어올렸고, 데이터 기반 의사결정 루틴을 정착시켰습니다.",
    mvpName: "정약용", mvpComment: "흩어진 지표를 한 화면에 모은 대시보드로 모두의 회의 시간을 절반으로 줄였습니다. 델타의 등대였어요.",
    emblem: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "엡실론팀",
    captain: "장영실", captainAcad: "카이스트 기계공학 19학번",
    captainPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jang-Yeongsil&backgroundType=gradientLinear&backgroundColor=ff6b00,ffd76a",
    growthAvg: 69,
    parts: "임베디드 · 하드웨어",
    partLeads: 2, agents: 2, totalCrews: 9, restCrews: 2, successCrews: 5, failCrews: 2, normalCrews: 5,
    projectGoal: "IoT 센서 펌웨어 안정화 및 OTA 업데이트 체계 구축",
    overview: "하드웨어 수급 지연 속에서도 시뮬레이터로 개발을 병행해 일정을 사수, 핵심 펌웨어를 안정화했습니다.",
    mvpName: "최무선", mvpComment: "부품이 없는 상황에서 시뮬레이션 환경을 직접 구축해 팀을 멈추지 않게 했습니다. 진짜 해결사입니다.",
    emblem: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "제타팀",
    captain: "허준", captainAcad: "고려대 바이오의공학 21학번",
    captainPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Heo-Jun&backgroundType=gradientLinear&backgroundColor=2a7d46,3fcf6a",
    growthAvg: 58,
    parts: "데이터 · 바이오",
    partLeads: 1, agents: 2, totalCrews: 8, restCrews: 2, successCrews: 4, failCrews: 3, normalCrews: 5,
    projectGoal: "임상 데이터 파이프라인 정제 및 이상치 탐지 모델 PoC",
    overview: "데이터 품질 이슈로 초반 고전했으나, 정제 규칙을 표준화하며 후반 모델 정확도를 끌어올렸습니다.",
    mvpName: "이제마", mvpComment: "지저분한 임상 데이터를 끈질기게 정제해 모델이 돌아가게 만들었습니다. 제타의 뚝심.",
    emblem: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "에타팀",
    captain: "김홍도", captainAcad: "홍익대 시각디자인 20학번",
    captainPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kim-Hongdo&backgroundType=gradientLinear&backgroundColor=ffe6a0,c7902a",
    growthAvg: 92,
    parts: "브랜드 · 모션 · 콘텐츠",
    partLeads: 3, agents: 4, totalCrews: 13, restCrews: 1, successCrews: 10, failCrews: 1, normalCrews: 6,
    projectGoal: "리그 브랜드 리뉴얼 및 시즌 모션 그래픽 패키지 제작",
    overview: "브랜드 가이드 전면 개편과 모션 패키지를 동시에 완주, 한 주 만에 시즌 비주얼을 통일했습니다.",
    mvpName: "신윤복", mvpComment: "밤새 모션 12종을 뽑아내며 시즌 무드를 단숨에 끌어올렸습니다. 에타의 예술혼.",
    emblem: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "세타팀",
    captain: "세종", captainAcad: "성균관대 컴퓨터교육 19학번",
    captainPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sejong&backgroundType=gradientLinear&backgroundColor=4f7bd0,213f7d",
    growthAvg: 64,
    parts: "에듀테크 · 백엔드",
    partLeads: 2, agents: 3, totalCrews: 10, restCrews: 3, successCrews: 5, failCrews: 3, normalCrews: 5,
    projectGoal: "학습 진도 추적 API 고도화 및 알림 시스템 도입",
    overview: "휴식 인원이 많은 주였지만 핵심 인력이 알림 시스템을 안정적으로 출시하며 평균을 지켜냈습니다.",
    mvpName: "최항", mvpComment: "적은 인원으로 알림 시스템을 완성도 높게 출시했습니다. 세타의 기둥.",
    emblem: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
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
  // 페이지네이션 시연용 대량 더미 (curated 5명 + 생성 45명 = 50명)
  ...(() => {
    const seeded = (n: number) => { const x = Math.sin(n * 99.71) * 10000; return x - Math.floor(x); };
    const NAMES = ["강민준", "윤서윤", "임도현", "한지우", "오예준", "서수아", "신하준", "권유나", "황시우", "안채원", "송지호", "류나윤", "전우진", "고은서", "문하율", "배준우", "조아인", "백시현", "남도경", "심예린", "하준서", "주다은", "구민재", "태유진", "선우진", "방서현", "노하랑", "추민결", "표은우", "감하늘", "독고윤", "사공민", "제갈량", "탁재이", "위지호", "마동석", "범준영", "엄지원", "공유나", "반하준", "차은우", "라온유", "피세진", "용하린", "초아진"];
    const UNIVS = ["가온 대학교", "청운 대학교", "서리 대학교", "북천 대학교", "해솔 대학교", "미르 대학교", "노을 대학교"];
    const DEPTS = ["전산학", "소프트웨어공학", "데이터과학", "디자인공학", "산업공학", "바이오공학", "정보보안", "미디어학"];
    const ROLES = ["ATTACKER", "SUPPORTER", "BUILDER", "SCOUT", "HEALER", "STRATEGIST", "MEMBER"];
    const TITLES = ["WARRIOR", "KNIGHT", "RANGER", "MAGE", "GUARDIAN", "ROGUE", "ELITE", "MEMBER"];
    const TEAMS_K = ["ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON", "ZETA", "ETA", "THETA", "IOTA", "KAPPA"];
    const LGS: { aura: CrewAura; ko: string }[] = [{ aura: "dangam", ko: "단감" }, { aura: "injeol", ko: "인절미" }, { aura: "eoheung", ko: "어흥" }];
    const PHOTOS = [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&q=80",
    ];
    return Array.from({ length: 45 }, (_, k) => {
      const i = k + 6;
      const lg = LGS[k % LGS.length];
      const rest = k % 8 === 7;
      const g = rest ? 0 : Math.round(30 + seeded(i) * 68);
      const info = rest ? 0 : Math.round(20 + seeded(i + 1) * 78);
      const skill = rest ? 0 : Math.round(25 + seeded(i + 2) * 73);
      const exp = rest ? 0 : Math.round(15 + seeded(i + 3) * 70);
      const career = rest ? 0 : Math.round(10 + seeded(i + 4) * 60);
      return {
        key: `g${i}`, rank: i, name: NAMES[k % NAMES.length],
        grade: `${lg.ko} [${TITLES[k % TITLES.length]}]`, aura: lg.aura,
        univ: UNIVS[k % UNIVS.length], dept: `${DEPTS[k % DEPTS.length]} 전공`,
        role: ROLES[k % ROLES.length], team: TEAMS_K[k % TEAMS_K.length],
        status: (rest ? "주차 휴식" : "주차 활동") as Crew["status"],
        wcount: 1 + (i % 13), success: !rest && seeded(i + 5) > 0.28,
        photo: PHOTOS[k % PHOTOS.length], stats: mkStats(g, info, skill, exp, career),
      };
    });
  })(),
];

const CREW_PAGE_SIZE = 20;
const STATE_FILTERS = ["전체", "주차 활동", "주차 휴식"] as const;
const ALLIANCE_FILTERS = ["전체", "ALPHA", "BETA", "GAMMA", "DELTA"] as const;

/* ═══════════ 우수 크루 TOP 10 쇼케이스 (엘리트 카드) ═══════════ */
type EliteLeague = "dangam" | "injeol" | "eoheung";
type Elite = { rank: number; name: string; grade: string; league: EliteLeague; emblem: string; rate: number; photo: string };
const ELITE_PHOTOS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
];
const ELITE_EMBLEM: Record<EliteLeague, string> = { dangam: "🍊", injeol: "🍡", eoheung: "🐯" };
const ELITES: Elite[] = [
  { rank: 1, name: "이순신", grade: "정1품 영의정", league: "eoheung", rate: 98, photo: ELITE_PHOTOS[0], emblem: ELITE_EMBLEM.eoheung },
  { rank: 2, name: "발라카스 지원", grade: "정1품 인절미대장", league: "injeol", rate: 95, photo: ELITE_PHOTOS[1], emblem: ELITE_EMBLEM.injeol },
  { rank: 3, name: "김철수", grade: "정1품 단감킹", league: "dangam", rate: 92, photo: ELITE_PHOTOS[2], emblem: ELITE_EMBLEM.dangam },
  { rank: 4, name: "이영희", grade: "정2품 우의정", league: "dangam", rate: 88, photo: ELITE_PHOTOS[3], emblem: ELITE_EMBLEM.dangam },
  { rank: 5, name: "최지원", grade: "종1품 인절미가드", league: "injeol", rate: 84, photo: ELITE_PHOTOS[4], emblem: ELITE_EMBLEM.injeol },
  { rank: 6, name: "박민수", grade: "정3품 단감소드", league: "dangam", rate: 80, photo: ELITE_PHOTOS[2], emblem: ELITE_EMBLEM.dangam },
  { rank: 7, name: "윤도현", grade: "정3품 인절미전사", league: "injeol", rate: 76, photo: ELITE_PHOTOS[1], emblem: ELITE_EMBLEM.injeol },
  { rank: 8, name: "정해린", grade: "정4품 단감레인저", league: "dangam", rate: 72, photo: ELITE_PHOTOS[3], emblem: ELITE_EMBLEM.dangam },
  { rank: 9, name: "강하늘", grade: "종3품 인절미클레릭", league: "injeol", rate: 67, photo: ELITE_PHOTOS[0], emblem: ELITE_EMBLEM.injeol },
  { rank: 10, name: "배수아", grade: "종5품 어흥워든", league: "eoheung", rate: 61, photo: ELITE_PHOTOS[4], emblem: ELITE_EMBLEM.eoheung },
];

// 우수 크루 쇼케이스 — 필터 카테고리 (ELITE 카드로 렌더)
type EliteItem = { key: string; rank: number; name: string; grade: string; league: EliteLeague | "growth" | "jeong"; emblem: string; val: string; tier: number; photo: string };
type EliteCat = { key: string; label: string; icon: string; items: EliteItem[] };
const toTier = (pct: number) => Math.max(1, Math.min(5, Math.round(pct / 20)));
const leagueOf = (meta: string): EliteLeague =>
  meta.includes("인절미") ? "injeol" : meta.includes("어흥") ? "eoheung" : "dangam";
const ELITE_CATS: EliteCat[] = [
  {
    key: "all", label: "우수 TOP 10", icon: "✦",
    items: ELITES.map((e) => ({ key: `all${e.rank}`, rank: e.rank, name: e.name, grade: e.grade, league: e.league, emblem: e.emblem, val: `${e.rate}%`, tier: toTier(e.rate), photo: e.photo })),
  },
  {
    key: "dan", label: "단감 우수", icon: "🍊",
    items: DANGAM_TOP.map((r, i) => ({ key: `dan${r.rank}`, rank: r.rank, name: r.name, grade: r.meta, league: "dangam", emblem: "🍊", val: r.val, tier: toTier(r.pct), photo: ELITE_PHOTOS[i % ELITE_PHOTOS.length] })),
  },
  {
    key: "injeol", label: "인절미 우수", icon: "🍡",
    items: INJEOL_TOP.map((r, i) => ({ key: `inj${r.rank}`, rank: r.rank, name: r.name, grade: r.meta, league: "injeol", emblem: "🍡", val: r.val, tier: toTier(r.pct), photo: ELITE_PHOTOS[i % ELITE_PHOTOS.length] })),
  },
  {
    key: "growth", label: "성장률 TOP", icon: "📈",
    items: GROWTH_TOP.map((r, i) => ({ key: `grw${r.rank}`, rank: r.rank, name: r.name, grade: `${r.meta} 리그`, league: "growth", emblem: "📈", val: r.val, tier: toTier(r.pct), photo: ELITE_PHOTOS[i % ELITE_PHOTOS.length] })),
  },
  {
    key: "jeong", label: "품계 정승", icon: "⚖️",
    items: JEONGSEUNG.flatMap((j, gi) =>
      j.names.split(" · ").map((nm, ni) => ({ key: `jng${gi}_${ni}`, rank: gi + 1, name: nm, grade: j.grade, league: "jeong" as const, emblem: "👑", val: "정승", tier: 5, photo: ELITE_PHOTOS[(gi + ni) % ELITE_PHOTOS.length] })),
    ),
  },
];

/* ═══════════ 섹션 4 더미 — 행정 처리 ═══════════ */
type Inquiry = { tag: string; text: string; state: "접수" | "처리중" | "완료" };
const INQUIRIES: Inquiry[] = [
  { tag: "성장률", text: "주차 성장률 집계 수치 재확인 요청", state: "처리중" },
  { tag: "휴식", text: "기말고사 휴식 사유 반영 누락 정정", state: "완료" },
  { tag: "캡처", text: "증빙 캡처 재제출 (날짜 표기 누락분)", state: "접수" },
];

/* ═══════════ 모션 헬퍼 — 뷰포트 진입 시 등장 / 카운트업 ═══════════ */
// 스크롤 진입 시 [data-rise]/[data-stagger]/[data-grow] 요소에 .is-in 부여
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const all = Array.from(
      root.querySelectorAll<HTMLElement>("[data-rise],[data-stagger],[data-grow],[data-slidein]")
    );
    // 두루마리 언롤은 별도 옵저버 — 사용자가 실제로 해당 영역에 도달했을 때만 실행
    const scrolls = all.filter((el) => el.getAttribute("data-grow") === "scroll");
    const targets = all.filter((el) => el.getAttribute("data-grow") !== "scroll");
    if (typeof IntersectionObserver === "undefined") {
      [...targets, ...scrolls].forEach((t) => t.classList.add("is-in"));
      return;
    }
    const reveal = (obs: IntersectionObserver) => (entries: IntersectionObserverEntry[]) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        }
      });
    };
    const io = new IntersectionObserver(
      (entries) => reveal(io)(entries),
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    targets.forEach((t) => io.observe(t));
    // 화면 중상단까지 올라왔을 때만 발화 → 페이지 로드 시 선실행 방지
    const ioScroll = new IntersectionObserver(
      (entries) => reveal(ioScroll)(entries),
      { threshold: 0, rootMargin: "0px 0px -35% 0px" }
    );
    scrolls.forEach((t) => ioScroll.observe(t));
    return () => { io.disconnect(); ioScroll.disconnect(); };
  }, []);
  return ref;
}

// 뷰포트 진입 시 0 → value 카운트업 (Cinzel 대형 수치 연출용)
function CountUp({
  value,
  duration = 1200,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let start = 0;
    const run = () => {
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min(1, (ts - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return (
    <span ref={ref} className={className}>
      {n}
    </span>
  );
}

export default function ChampionTheme({ card, detail }: Props) {
  const wrapRef = useReveal<HTMLDivElement>();
  const isOngoing =
    card.leagueRecordStatus === "대전 중" || card.leagueRecordStatus === "대전 집계";
  const numOrN = (v: number) => (isOngoing ? "N" : v.toLocaleString());

  const [eliteCatIdx, setEliteCatIdx] = useState(0);
  const [stateIdx, setStateIdx] = useState(0);
  const [allianceIdx, setAllianceIdx] = useState(0);
  const [crewPage, setCrewPage] = useState(0);
  const [modalCrew, setModalCrew] = useState<Crew | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [adminDone, setAdminDone] = useState(false);
  const [adminConfirming, setAdminConfirming] = useState(false);

  const eliteCat = ELITE_CATS[eliteCatIdx] ?? ELITE_CATS[0];

  const visibleCrews = CREWS.filter(
    (c) =>
      (STATE_FILTERS[stateIdx] === "전체" || c.status === STATE_FILTERS[stateIdx]) &&
      (ALLIANCE_FILTERS[allianceIdx] === "전체" || c.team === ALLIANCE_FILTERS[allianceIdx])
  );
  const crewPageCount = Math.max(1, Math.ceil(visibleCrews.length / CREW_PAGE_SIZE));
  const safeCrewPage = Math.min(crewPage, crewPageCount - 1);
  const pagedCrews = visibleCrews.slice(safeCrewPage * CREW_PAGE_SIZE, (safeCrewPage + 1) * CREW_PAGE_SIZE);

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
    setCrewPage(0);
    if (typeof window !== "undefined") {
      window.alert("🔮 FORMAL MODE: 모든 검색 고정 필터 해제 및 동기화 상태가 초기 리셋되었습니다.");
    }
  };

  return (
    <div className="weekly-champion">
      <div className="champ-wrap" ref={wrapRef}>
        {/* ═════ 시네마틱 히어로 ═════ */}
        <header className="champ-hero" data-rise>
          <video
            className="champ-hero__video"
            src="/videos/quest-banner.mp4"
            autoPlay
            loop
            muted
            playsInline
            poster={card.imageUrl ?? undefined}
          />
          <span className="champ-hero__veil" aria-hidden="true" />
          <span className="champ-hero__rays" aria-hidden="true" />
          <span className="champ-hero__embers" aria-hidden="true" />
          <div className="champ-hero__inner">
            <div className="champ-hero__crest" aria-hidden="true">
              <span>⚜</span>
              <span className="champ-hero__crown">♛</span>
              <span>⚜</span>
            </div>
            <h1 className="champ-hero__title">CREW LEAGUE CHAMPIONSHIP</h1>
            <div className="champ-hero__div" aria-hidden="true">
              <i />
              <span>◆</span>
              <i />
            </div>
            <div className="champ-hero__sub">
              WEEKLY ROUND {card.weekNumber} · {card.seasonName}
            </div>
          </div>
        </header>

        {/* ═════ 섹션 1 — 주차 정보 (RPG 퀘스트 로그) ═════ */}
        <section className="champ-panel champ-quest" data-rise>
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
                  {card.seasonName}
                </h3>
                <span className="champ-quest__period">
                  ⏳ {card.dateRangeText}
                </span>
              </div>
            </div>

            {/* ── 우측: 퀘스트 일지 ── */}
            <div className="champ-quest__journal">
              {/* [1.3] 퀘스트 설명 — 양피지 문서 (두루마리 언롤) */}
              <div className="champ-lore" data-grow="scroll">
                <span className="champ-lore__roll champ-lore__roll--top" aria-hidden="true" />
                <div className="champ-lore__paper">
                  <div className="champ-lore__head">
                    <span className="champ-qtag">1.3</span>
                    <span className="champ-lore__title">QUEST BRIEFING · 주차 개요</span>
                    <span className="champ-lore__wax" aria-hidden="true">✦</span>
                  </div>
                  <p className="champ-lore__text">
                    <span className="champ-lore__drop">{detail.overview.charAt(0)}</span>
                    {detail.overview.slice(1)}
                  </p>
                  <div className="champ-lore__sign">
                    <span className="champ-lore__sign-rule" />
                    <span className="champ-lore__sign-by">— 운영진 주차 일지</span>
                  </div>
                </div>
                <span className="champ-lore__roll champ-lore__roll--bot" aria-hidden="true" />
              </div>

              {/* [1.4]~[1.8] 파티 스테이터스 — RPG 스탯 게이지 */}
              <div className="champ-party">
                <div className="champ-party__head"><span className="champ-party__sword" aria-hidden="true">⚔</span>PARTY STATUS · 크루 현황</div>
                <div className="champ-pdash">
                  {/* 도넛 차트 — 성장 성공률 [1.7]/[1.8] */}
                  <div className="champ-donut">
                    <div
                      className="champ-donut__ring"
                      data-grow="arc"
                      style={{
                        ["--ring-grad" as string]: isOngoing
                          ? "conic-gradient(#2a2536 0 100%)"
                          : `conic-gradient(var(--cm-gold-bright) 0 ${winLossRate}%, #ff5a4d ${winLossRate}% 100%)`,
                      } as CSSProperties}
                    >
                      <div className="champ-donut__hole">
                        <span className="champ-donut__pct">{isOngoing ? "N" : <CountUp value={winLossRate} />}<i>%</i></span>
                        <span className="champ-donut__cap">성공률</span>
                      </div>
                    </div>
                    <div className="champ-donut__legend">
                      <span className="champ-donut__lg champ-donut__lg--win"><i />성공 <b>{numOrN(card.growthSuccess)}</b></span>
                      <span className="champ-donut__lg champ-donut__lg--lose"><i />실패 <b>{numOrN(card.growthFail)}</b></span>
                    </div>
                  </div>

                  {/* 막대 그래프 — 크루 5종 [1.4]~[1.8] */}
                  <div className="champ-bars" data-grow="y">
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
                  <div className="champ-quest__clear-bar" data-grow="x">
                    <span
                      className="champ-quest__clear-fill"
                      style={{ width: isOngoing ? "0%" : `${card.growthSuccessRate}%` }}
                    />
                  </div>
                  <div className="champ-quest__clear-pct">{isOngoing ? "N" : <CountUp value={card.growthSuccessRate} />}<span>%</span></div>
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

        {/* ═════ 우수 크루 쇼케이스 (필터) ═════ */}
        <section className="champ-panel champ-elite" data-rise>
          <div className="champ-elite__head">
            <div className="champ-elite__headrow">
              <span className="champ-elite__rune">✦</span>
              <h2 className="champ-elite__title">ELITE&nbsp;SHOWCASE</h2>
              <span className="champ-elite__rune">✦</span>
            </div>
            <span className="champ-elite__sub">우수 크루 명예의 전당</span>
          </div>

          {/* 카테고리 필터 */}
          <div className="champ-elite__tabs">
            {ELITE_CATS.map((c, i) => (
              <button
                key={c.key}
                type="button"
                className={`champ-elite__tab ${eliteCatIdx === i ? "is-active" : ""}`}
                onClick={() => setEliteCatIdx(i)}
              >
                <span className="champ-elite__tab-ic" aria-hidden="true">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          <div className="champ-elite__row" data-stagger>
            {eliteCat.items.map((e) => {
              const rankClass = e.rank <= 3 ? `champ-ecard--rank${e.rank}` : "";
              return (
                <div key={e.key} className={`champ-ecard champ-ecard--${e.league} ${rankClass}`}>
                  <div className="champ-ecard__body">
                    <span className="champ-ecard__rank">{e.rank}</span>
                    <div className="champ-ecard__portrait"><img src={e.photo} alt="" /></div>
                    <div className="champ-ecard__name">{e.name}</div>
                    <div className="champ-ecard__grade">{e.grade}</div>
                    <div className="champ-ecard__emblem" aria-hidden="true">
                      <span className="champ-ecard__glow" />
                      <span className="champ-ecard__sym">{e.emblem}</span>
                    </div>
                    <div className="champ-ecard__rate">{isOngoing ? "N" : e.val}</div>
                    <div className="champ-ecard__pips">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={i < e.tier && !isOngoing ? "on" : ""} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── [2.4] 팀별 우수 크루 (MVP + 팀장 멘트) ── */}
          <div className="champ-sub2 champ-sub2--first">
            <span className="champ-sub2__rune">★</span>
            <h3 className="champ-sub2__title">팀별 우수 크루 · MVP</h3>
            <span className="champ-sub2__tag">2.4</span>
          </div>
          <div className="champ-mvp" data-stagger>
            {TEAMS.map((t) => (
              <div key={t.name} className="champ-mvp__card">
                <div className="champ-mvp__head">
                  <div className="champ-mvp__avatar"><img src={t.emblem} alt="" /></div>
                  <div className="champ-mvp__top">
                    <span className="champ-mvp__name">{t.mvpName}</span>
                    <span className="champ-mvp__meta">
                      <span className="champ-mvp__team">{t.name}</span>
                      <span className="champ-mvp__parts">{t.parts}</span>
                    </span>
                  </div>
                </div>
                <p className="champ-mvp__quote">&ldquo;{t.mvpComment}&rdquo;</p>
                <span className="champ-mvp__by">— 팀장 {t.captain}</span>
              </div>
            ))}
          </div>

          {/* ── [2.5][2.6][2.7] 팀 목록 ── */}
          <div className="champ-sub2">
            <span className="champ-sub2__rune champ-sub2__rune--sword" aria-hidden="true">⚔</span>
            <h3 className="champ-sub2__title">팀 목록 · TEAM ROSTER</h3>
            <span className="champ-sub2__count">활동 팀 <b>{TEAMS.length}</b></span>
            <span className="champ-sub2__tag">2.5–2.7</span>
          </div>
          <div className="champ-troster" data-stagger>
            {[...TEAMS]
              .sort((a, b) => b.growthAvg - a.growthAvg)
              .map((t, idx) => {
                const rank = idx + 1;
                // 성공/실패/휴식 = 100% 분포 (도넛)
                const dist = t.successCrews + t.failCrews + t.restCrews || 1;
                const sp = Math.round((t.successCrews / dist) * 100);
                const fp = Math.round((t.failCrews / dist) * 100);
                const rp = 100 - sp - fp;
                const wr = t.successCrews + t.failCrews ? Math.round((t.successCrews / (t.successCrews + t.failCrews)) * 100) : 0;
                const win = wr >= 50;
                const rankClass = rank <= 3 ? `champ-tcard--rank${rank}` : "";
                const donut = `conic-gradient(#ffd76a 0 ${sp}%, #ff5a4d ${sp}% ${sp + fp}%, #8a93a8 ${sp + fp}% 100%)`;
                return (
                  <div key={t.name} className={`champ-tcard ${win ? "is-win" : "is-lose"} ${rankClass}`}>
                    {rank === 1 && (
                      <span className="champ-tcard__laurel" aria-hidden="true">
                        <span className="champ-tcard__laurel-crown">👑</span>
                        <span className="champ-tcard__laurel-txt">CHAMPION</span>
                      </span>
                    )}
                    {/* 승패 메달리온 — 코너 배지 */}
                    <span className={`champ-wl ${win ? "is-win" : "is-lose"}`} aria-label={win ? "승리" : "패배"}>
                      <span className="champ-wl__ico" aria-hidden="true">{win ? "👑" : "🥀"}</span>
                      <span className="champ-wl__txt">{win ? "WIN" : "LOSE"}</span>
                      <span className="champ-wl__ray" aria-hidden="true" />
                    </span>

                    <div className="champ-tcard__top">
                      <span className="champ-tcard__rank">{rank}</span>
                      <div className="champ-tcard__cap">
                        <span className="champ-tcard__cap-aura" aria-hidden="true" />
                        <img className="champ-tcard__cap-img" src={t.captainPhoto} alt={`팀장 ${t.captain}`} />
                        <span className="champ-tcard__cap-frame" aria-hidden="true" />
                      </div>
                      <div className="champ-tcard__id">
                        <h4 className="champ-tcard__name">{t.name}</h4>
                        <p className="champ-tcard__captain"><span className="champ-tcard__caplabel">팀장</span>{t.captain}</p>
                        <p className="champ-tcard__acad">{t.captainAcad}</p>
                      </div>
                    </div>

                    <div className="champ-tcard__parts">
                      {t.parts.split(" · ").map((p) => (
                        <span key={p} className="champ-tcard__chip">{p}</span>
                      ))}
                    </div>

                    {/* 성공/실패/휴식 도넛 차트 (100%) */}
                    <div className="champ-tcard__dist">
                      <div className="champ-tcard__donut" data-grow="arc" style={{ ["--donut-grad" as string]: donut } as CSSProperties}>
                        <span className="champ-tcard__donut-gloss" aria-hidden="true" />
                        <div className="champ-tcard__donut-hole">
                          <span className="champ-tcard__donut-pct">{sp}<i>%</i></span>
                          <span className="champ-tcard__donut-cap">성공</span>
                        </div>
                      </div>
                      <ul className="champ-tcard__legend">
                        <li className="is-s"><i />성공<b>{t.successCrews}</b><em>{sp}%</em></li>
                        <li className="is-f"><i />실패<b>{t.failCrews}</b><em>{fp}%</em></li>
                        <li className="is-r"><i />휴식<b>{t.restCrews}</b><em>{rp}%</em></li>
                      </ul>
                    </div>

                    {/* 성장 성공율(평균) + 승률 */}
                    <div className="champ-tcard__metrics">
                      <div className="champ-tcard__metric">
                        <div className="champ-tcard__mrow"><span>성장 성공율</span><b>{t.growthAvg}%</b></div>
                        <span className="champ-tcard__bar"><span className="champ-tcard__fill" style={{ width: `${t.growthAvg}%` }} /></span>
                      </div>
                      <div className="champ-tcard__metric">
                        <div className="champ-tcard__mrow"><span>승률</span><b>{wr}%</b></div>
                        <span className="champ-tcard__bar"><span className="champ-tcard__fill champ-tcard__fill--wr" style={{ width: `${wr}%` }} /></span>
                      </div>
                    </div>

                    {/* 인원 구성 */}
                    <div className="champ-tcard__counts">
                      <span><b>{t.totalCrews}</b>전체</span>
                      <span><b>{t.partLeads}</b>파트장</span>
                      <span><b>{t.agents}</b>에이전트</span>
                      <span><b>{t.normalCrews}</b>일반</span>
                    </div>

                    <div className="champ-tcard__fields">
                      <p className="champ-tcard__field"><span className="champ-tcard__fk">🎯</span>{t.projectGoal}</p>
                      <p className="champ-tcard__field"><span className="champ-tcard__fk">📜</span>{t.overview}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* ═════ 섹션 2 — 크루 & 팀 (다크 럭셔리) ═════ */}
        <section className="champ-panel champ-arena" data-rise>
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
                <button key={f} className={`champ-gbtn ${stateIdx === i ? "is-active" : ""}`} onClick={() => { setStateIdx(i); setCrewPage(0); }}>{f}</button>
              ))}
            </div>
            <div className="champ-ctrl__group">
              <span className="champ-ctrl__lbl">ALLIANCE</span>
              {ALLIANCE_FILTERS.map((f, i) => (
                <button key={f} className={`champ-gbtn ${allianceIdx === i ? "is-active" : ""}`} onClick={() => { setAllianceIdx(i); setCrewPage(0); }}>{f}</button>
              ))}
            </div>
            <button className="champ-gbtn champ-gbtn--formal" onClick={resetOfficial}>FORMAL MODE</button>
          </div>

          {/* 크루 카드 리스트 */}
          <div className="champ-cl" data-slidein>
            {pagedCrews.map((c) => {
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

          {/* 페이지네이션 (20명/페이지) */}
          {crewPageCount > 1 && (
            <div className="champ-pager">
              <button
                className="champ-pager__btn"
                disabled={safeCrewPage === 0}
                onClick={() => setCrewPage(Math.max(0, safeCrewPage - 1))}
              >
                ‹
              </button>
              {Array.from({ length: crewPageCount }).map((_, i) => (
                <button
                  key={i}
                  className={`champ-pager__num ${i === safeCrewPage ? "is-active" : ""}`}
                  onClick={() => setCrewPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="champ-pager__btn"
                disabled={safeCrewPage >= crewPageCount - 1}
                onClick={() => setCrewPage(Math.min(crewPageCount - 1, safeCrewPage + 1))}
              >
                ›
              </button>
              <span className="champ-pager__info">
                {visibleCrews.length}명 · {safeCrewPage + 1}/{crewPageCount}
              </span>
            </div>
          )}

        </section>

        {/* ═════ 섹션 4 — 행정 처리 (ROYAL DECREE · 어명) ═════ */}
        <section className="champ-panel champ-decree">
          {/* 교지 두루마리 배너 */}
          <div className="champ-decree__banner">
            <span className="champ-decree__rune">⚜</span>
            <div className="champ-decree__heading">
              <h2 className="champ-decree__title">ROYAL DECREE</h2>
              <span className="champ-decree__sub">SECTION 4 · 어명 · 행정 처리</span>
            </div>
            <span className="champ-decree__rune">⚜</span>
          </div>

          {/* [4.1] 칙령문 — 두루마리 양피지 + 봉인 마감 시각 */}
          <div className="champ-edict">
            <span className="champ-edict__roll champ-edict__roll--top" aria-hidden="true" />
            <div className="champ-edict__paper">
              <div className="champ-edict__head">
                <span className="champ-edict__crest" aria-hidden="true">㊞</span>
                <div className="champ-edict__headtxt">
                  <span className="champ-edict__kicker">EDICT · 4.1 행정 칙령</span>
                  <span className="champ-edict__lead">이번 주차의 기록을 갈무리하여 봉(封)합니다.</span>
                </div>
              </div>
              <p className="champ-edict__body">
                로그인 후 <strong>본인 위클리 카드</strong>에서 행정 처리를 <strong>확인·날인</strong>해 주세요.
                확인은 <strong>당일 20:00</strong>까지, 모든 행정 봉인은 <strong>금요일 14:00</strong>까지 마쳐 주시면 됩니다.
                집계에 오차·이의가 있으면 <strong>상소함</strong>에 조정 문의를 남겨 주세요 — <strong>당일 22:00</strong>까지 접수됩니다.
              </p>
              <div className="champ-edict__deadlines">
                <span className="champ-dl"><span className="champ-dl__wax" aria-hidden="true">封</span><b>20:00</b>당일 제출·확인</span>
                <span className="champ-dl champ-dl--final"><span className="champ-dl__wax" aria-hidden="true">封</span><b>금 14:00</b>행정 마감</span>
                <span className="champ-dl champ-dl--ask"><span className="champ-dl__wax" aria-hidden="true">疏</span><b>22:00</b>상소 마감</span>
              </div>
            </div>
            <span className="champ-edict__roll champ-edict__roll--bot" aria-hidden="true" />
          </div>

          <div className="champ-decree__grid">
            {/* [4.2] 옥새 날인 의식 — 본인 카드 행정 확인 */}
            <div className={`champ-rite ${adminDone ? "is-sealed" : ""} ${adminConfirming ? "is-arming" : ""}`}>
              <div className="champ-rite__head">
                <span className="champ-rite__tag">4.2</span>玉璽 · 옥새 날인 · 본인 카드 행정 확인
              </div>

              {/* 옥새 날인 무대 */}
              <div className="champ-rite__stage">
                <span className="champ-rite__paper-mark" aria-hidden="true">本人 週次 카드</span>
                <button
                  type="button"
                  className="champ-seal"
                  aria-label={adminDone ? "봉인 완료" : "옥새 날인"}
                  disabled={adminDone}
                  onClick={() => {
                    if (adminDone) return;
                    if (!adminConfirming) { setAdminConfirming(true); return; }
                    setAdminDone(true);
                    setAdminConfirming(false);
                    if (typeof window !== "undefined") window.alert("이순신 크루 옥새 날인 완료 — 명부에 [행정 확인]이 봉인되었습니다.");
                  }}
                >
                  <span className="champ-seal__cord" aria-hidden="true" />
                  <span className="champ-seal__disc">
                    <span className="champ-seal__glyph">{adminDone ? "封" : "印"}</span>
                    <span className="champ-seal__ring" aria-hidden="true" />
                  </span>
                  <span className="champ-seal__shadow" aria-hidden="true" />
                </button>
                {adminDone && <span className="champ-rite__stamped" aria-hidden="true">封</span>}
              </div>

              {/* 상태별 안내 + 버튼 */}
              {adminDone ? (
                <div className="champ-rite__done">
                  <span className="champ-rite__done-ic">✔</span>
                  <p>옥새 날인 완료 — 명부 목록 칸에 <strong>[행정 확인]</strong>이 봉인되었습니다.</p>
                </div>
              ) : adminConfirming ? (
                <div className="champ-rite__confirm">
                  <p>옥새가 준비되었습니다. 한 번 더 날인하면 명부에 <strong>[행정 확인]</strong>이 영구 기록됩니다.</p>
                  <div className="champ-rite__btns">
                    <button className="champ-gbtn" onClick={() => setAdminConfirming(false)}>물러나기</button>
                    <button
                      className="champ-gbtn champ-gbtn--ok"
                      onClick={() => {
                        setAdminDone(true);
                        setAdminConfirming(false);
                        if (typeof window !== "undefined") window.alert("이순신 크루 옥새 날인 완료 — 명부에 [행정 확인]이 봉인되었습니다.");
                      }}
                    >
                      옥새 날인 ㊞
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="champ-rite__desc">
                    로그인 후 본인 위클리 카드의 집계 데이터를 점검하고, 이상이 없으면 <strong>옥새</strong>를 들어 날인하라.
                    (옥새 준비 → 날인 2단계)
                  </p>
                  <button className="champ-gbtn champ-gbtn--ok champ-rite__cta" onClick={() => setAdminConfirming(true)}>
                    옥새 들기 · 행정 확인
                  </button>
                </>
              )}
            </div>

            {/* [4.3] 상소함 — 조정 문의 게시판 */}
            <div className="champ-petition">
              <div className="champ-petition__head">
                <span className="champ-rite__tag">4.3</span>上疏函 · 상소함 · 조정 문의
              </div>
              <p className="champ-petition__desc">
                집계에 오차·이의가 있으면 상소함에 조정 문의를 남겨 주세요. <strong>당일 22:00</strong>까지 접수됩니다.
              </p>
              <div className="champ-qboard">
                <div className="champ-qboard__row champ-qboard__row--h">
                  <span>구분</span><span>상소 내용</span><span>처결</span>
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
                className="champ-gbtn champ-gbtn--formal champ-petition__cta"
                onClick={() => { if (typeof window !== "undefined") window.alert("상소함(조정 문의) 게시판 페이지로 이동합니다."); }}
              >
                ✍ 상소 올리기 →
              </button>
            </div>
          </div>

          {/* [4.4] 증표 감정소 — 증빙 예시 & 양식 */}
          <div className="champ-sub2">
            <span className="champ-sub2__rune">🔍</span>
            <h3 className="champ-sub2__title">證票 鑑定所 · 증표 감정소 · 증빙 예시 &amp; 양식</h3>
            <span className="champ-sub2__tag">4.4</span>
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