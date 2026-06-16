// ============================================================
// Detail Log 더미데이터 — 한 주간 받은 포인트 내역 (게임형 UI 전용)
// ------------------------------------------------------------
// 실제 API/DB 연동 전, 모달 UI 레이아웃·연출을 잡기 위한 프론트 전용 mock.
// 포인트 체계는 cluster4 기본(단감/인절미/어흥)을 기준으로 한다.
// 각 내역: 종류 / 개수(±) / 이유 / 관련 라인 / 받은 시간 등.
// ============================================================

export type DetailLogPointType = "단감" | "인절미" | "어흥";

// 변동 크기/의미에 따른 등급 — 카드 글로우/테두리 연출에 사용
export type DetailLogRarity = "common" | "rare" | "epic" | "legendary";

export interface DetailLogEntry {
  id: string;
  /** 표시용 시각 (예: "14:32") */
  time: string;
  /** 표시용 날짜 (예: "06.15 (日)") */
  date: string;
  /** 활동/이벤트 이름 (짧은 라벨) */
  title: string;
  /** 받은 이유 (상세 설명) */
  reason: string;
  /** 포인트 종류 */
  pointType: DetailLogPointType;
  /** 받은 개수 (+획득 / -차감) */
  amount: number;
  /** 관련 라인 — 활동이 연결된 출처/항목 (예: "리뷰 #842 → 박민수") */
  relatedLine: string;
  /** 등급 */
  rarity: DetailLogRarity;
  /** 카테고리 라벨 (출석/과제/리뷰/보너스/페널티 등) */
  category: string;
  /** 카테고리 tabler 아이콘 클래스 (ti ti-...) */
  icon: string;
  /** 콤보/연속 보너스 표기 (선택) */
  combo?: number;
}

export interface DetailLogSummary {
  /** 이번 주차 순 획득 합계 */
  totalGained: number;
  /** 종류별 합계 */
  byType: Record<DetailLogPointType, number>;
  /** 연속 활동(콤보) 일수 */
  streak: number;
  /** 주간 랭킹 변동 (+상승 / -하락) */
  rankDelta: number;
  /** 이번 주차 라벨 */
  weekLabel: string;
  /** 활동 수행률(%) — 게이지 연출용 */
  completionRate: number;
  /** 이번 주차 총 내역 건수 */
  entryCount: number;
}

// 종류별 아이콘 (cluster4 기본 세트)
export const DETAIL_LOG_POINT_ICON: Record<DetailLogPointType, string> = {
  단감: "/images/0/cluster4/icon/icon - 단감.png",
  인절미: "/images/0/cluster4/icon/icon - 인절미.png",
  어흥: "/images/0/cluster4/icon/icon - 어흥.png",
};

// 최신순(위 → 아래) 정렬을 가정한 로그 피드
export const DETAIL_LOG_ENTRIES: DetailLogEntry[] = [
  {
    id: "log-16",
    time: "21:48",
    date: "06.15 (日)",
    title: "주차 미션 올클리어",
    reason: "이번 주 핵심 활동 6종을 모두 완수해 완벽 보너스가 발동했어요.",
    pointType: "단감",
    amount: 80,
    relatedLine: "시즌 미션 · M-07 (WEEK12)",
    rarity: "legendary",
    category: "보너스",
    icon: "ti ti-trophy",
    combo: 6,
  },
  {
    id: "log-15",
    time: "20:12",
    date: "06.15 (日)",
    title: "동료 리뷰 5건 작성",
    reason: "팀원 산출물에 깊이 있는 피드백을 5건 남겼어요.",
    pointType: "어흥",
    amount: 25,
    relatedLine: "리뷰 라인 · #838~#842",
    rarity: "epic",
    category: "리뷰",
    icon: "ti ti-messages",
    combo: 3,
  },
  {
    id: "log-14",
    time: "18:30",
    date: "06.14 (土)",
    title: "과제 우수 제출",
    reason: "마감 12시간 전 제출 + 우수작으로 선정됐어요.",
    pointType: "단감",
    amount: 45,
    relatedLine: "과제 라인 · WEEK12 #3",
    rarity: "epic",
    category: "과제",
    icon: "ti ti-file-check",
  },
  {
    id: "log-13",
    time: "13:05",
    date: "06.14 (土)",
    title: "베스트 답변 채택",
    reason: "Q&A 채널에서 작성한 답변이 베스트로 채택됐어요.",
    pointType: "단감",
    amount: 35,
    relatedLine: "Q&A #1207 → 김하늘",
    rarity: "epic",
    category: "기여",
    icon: "ti ti-star",
  },
  {
    id: "log-12",
    time: "09:02",
    date: "06.14 (土)",
    title: "연속 출석 6일 달성",
    reason: "스트릭이 6일째 이어지며 콤보 가산점을 받았어요.",
    pointType: "인절미",
    amount: 30,
    relatedLine: "출석 라인 · 06.09~06.14",
    rarity: "rare",
    category: "출석",
    icon: "ti ti-flame",
    combo: 6,
  },
  {
    id: "log-11",
    time: "22:15",
    date: "06.13 (金)",
    title: "스터디 발표 진행",
    reason: "주제 발표를 맡아 세션을 직접 리드했어요.",
    pointType: "어흥",
    amount: 15,
    relatedLine: "세션 라인 · S-12",
    rarity: "rare",
    category: "활동",
    icon: "ti ti-presentation",
  },
  {
    id: "log-10",
    time: "16:40",
    date: "06.13 (金)",
    title: "멘토 피드백 반영",
    reason: "멘토가 남긴 코멘트를 모두 반영해 재제출했어요.",
    pointType: "단감",
    amount: 18,
    relatedLine: "멘토링 · MT-04 → 정현우",
    rarity: "rare",
    category: "성장",
    icon: "ti ti-bulb",
  },
  {
    id: "log-09",
    time: "14:40",
    date: "06.13 (金)",
    title: "지각 패널티",
    reason: "정규 세션에 10분 지각해 포인트가 차감됐어요.",
    pointType: "인절미",
    amount: -10,
    relatedLine: "출결 라인 · 06.13 정규세션",
    rarity: "common",
    category: "페널티",
    icon: "ti ti-alarm",
  },
  {
    id: "log-08",
    time: "11:20",
    date: "06.12 (木)",
    title: "데일리 체크인",
    reason: "오늘의 목표를 등록하고 데일리 체크인을 완료했어요.",
    pointType: "단감",
    amount: 10,
    relatedLine: "체크인 라인 · 06.12",
    rarity: "common",
    category: "출석",
    icon: "ti ti-circle-check",
  },
  {
    id: "log-07",
    time: "19:55",
    date: "06.12 (木)",
    title: "팀 회고 참여",
    reason: "주간 팀 회고에 참여해 인사이트를 공유했어요.",
    pointType: "어흥",
    amount: 12,
    relatedLine: "회고 라인 · RT-12 (B팀)",
    rarity: "common",
    category: "활동",
    icon: "ti ti-users",
  },
  {
    id: "log-06",
    time: "16:08",
    date: "06.11 (水)",
    title: "코드 리뷰 반영",
    reason: "받은 리뷰를 반영해 PR을 머지했어요.",
    pointType: "어흥",
    amount: 12,
    relatedLine: "PR 라인 · #214 → 머지",
    rarity: "common",
    category: "리뷰",
    icon: "ti ti-git-merge",
  },
  {
    id: "log-05",
    time: "10:30",
    date: "06.11 (水)",
    title: "자료 공유 보너스",
    reason: "학습 자료를 공유 채널에 올려 동료들의 호응을 받았어요.",
    pointType: "단감",
    amount: 14,
    relatedLine: "공유 라인 · DOC-77",
    rarity: "rare",
    category: "기여",
    icon: "ti ti-share",
  },
  {
    id: "log-04",
    time: "08:30",
    date: "06.11 (水)",
    title: "연속 출석 4일",
    reason: "꾸준한 출석으로 4일 스트릭을 달성했어요.",
    pointType: "인절미",
    amount: 20,
    relatedLine: "출석 라인 · 06.09~06.11",
    rarity: "rare",
    category: "출석",
    icon: "ti ti-flame",
    combo: 4,
  },
  {
    id: "log-03",
    time: "21:00",
    date: "06.10 (火)",
    title: "주차 첫 과제 제출",
    reason: "이번 주차 첫 산출물을 기한 내 등록했어요.",
    pointType: "단감",
    amount: 15,
    relatedLine: "과제 라인 · WEEK12 #1",
    rarity: "common",
    category: "과제",
    icon: "ti ti-file-upload",
  },
  {
    id: "log-02",
    time: "15:24",
    date: "06.10 (火)",
    title: "미완료 항목 차감",
    reason: "전 주차 미완료 항목이 정산되며 일부 차감됐어요.",
    pointType: "어흥",
    amount: -6,
    relatedLine: "정산 라인 · WEEK11 잔여",
    rarity: "common",
    category: "페널티",
    icon: "ti ti-clock-exclamation",
  },
  {
    id: "log-01",
    time: "10:11",
    date: "06.09 (月)",
    title: "주차 시작 보너스",
    reason: "WEEK 12에 합류하며 시작 보너스를 받았어요.",
    pointType: "인절미",
    amount: 25,
    relatedLine: "주차 라인 · WEEK12 OPEN",
    rarity: "rare",
    category: "보너스",
    icon: "ti ti-rocket",
  },
];

// 합계는 더미 일관성을 위해 entries 기준으로 계산해 둔다.
const _gained = DETAIL_LOG_ENTRIES.reduce(
  (acc, e) => {
    acc.byType[e.pointType] += e.amount;
    acc.total += e.amount;
    return acc;
  },
  { total: 0, byType: { 단감: 0, 인절미: 0, 어흥: 0 } as Record<DetailLogPointType, number> },
);

export const DETAIL_LOG_SUMMARY: DetailLogSummary = {
  totalGained: _gained.total,
  byType: _gained.byType,
  streak: 6,
  rankDelta: 4,
  weekLabel: "WEEK 12",
  completionRate: 92,
  entryCount: DETAIL_LOG_ENTRIES.length,
};

// ============================================================
// 액트(ACT) 로그 — 주차별 활동 단위 내역 (테이블형 디자인 A/B/K 전용)
// ------------------------------------------------------------
// 한 주간 수행한 "액트"를 발생 시점 순(월 → 토)으로 나열한다.
// 한 행 = 1개의 액트. 짧은 높이의 표 형태로 다량을 빠르게 훑는 용도.
// 표시 컬럼: 액트명 / 결과 / 소속 허브급 / 소속 라인급 / 소요시간(m)
//           / 관련 포인트(A·B·C) / 크루 / 발생 시점 / 체크 시점
// ============================================================

/** 액트 결과 — 체크 통과 여부 */
export type ActResult = "체크 성공" | "체크 실패";

/** 크루 요건 */
export type ActCrew = "필수" | "선택" | "선발" | "없음";

/** 관련 포인트 — 단감 / 인절미 / 어흥 3종 모두 기재 */
export type ActPoints = Record<DetailLogPointType, number>;

/** 일시 — 날짜(요일 포함)와 시간 분리 표기 */
export interface ActStamp {
  /** 예: "260304(화)" */
  date: string;
  /** 예: "11:00" */
  time: string;
}

export interface ActLogEntry {
  id: string;
  /** 액트명 */
  name: string;
  /** 액트 결과 */
  result: ActResult;
  /** 소속 허브 급 — 예: "[실무 정보]", "[실무 역량]" */
  hub: string;
  /** 소속 라인 급 — 내부 라인급 명 */
  line: string;
  /** 소요 시간(분) — 5 ~ 120, 5분 단위 */
  duration: number;
  /** 관련 포인트 (A·B·C) */
  points: ActPoints;
  /** 크루 요건 */
  crew: ActCrew;
  /** 발생 시점 */
  occurredAt: ActStamp;
  /** 체크 시점 */
  checkedAt: ActStamp;
}

export interface ActLogSummary {
  /** 시즌 라벨 — 예: "26 봄" */
  seasonLabel: string;
  /** 주차 라벨 — 표 상단 고정값 */
  weekLabel: string;
  /** 전체 합산 포인트 (단감·인절미·어흥) */
  totals: ActPoints;
  /** 연속 수행(콤보) 일수 */
  streak: number;
  /** 주간 랭킹 변동 (+상승 / -하락) */
  rankDelta: number;
}

// 발생 시점 오름차순(월 → 토)으로 미리 정렬해 둔 목업.
// 가장 늦은 액트라도 토요일(260308)을 넘지 않는다.
export const ACT_LOG_ENTRIES: ActLogEntry[] = [
  // ── 월 260303 ──
  {
    id: "act-01",
    name: "데일리 체크인",
    result: "체크 성공",
    hub: "실무 태도",
    line: "아레나",
    duration: 5,
    points: { 단감: 8, 인절미: 0, 어흥: 0 },
    crew: "없음",
    occurredAt: { date: "260303(월)", time: "09:00" },
    checkedAt: { date: "260303(월)", time: "10:00" },
  },
  {
    id: "act-02",
    name: "주차 미션 오픈",
    result: "체크 성공",
    hub: "성장 관리",
    line: "에세이",
    duration: 15,
    points: { 단감: 20, 인절미: 0, 어흥: 1 },
    crew: "필수",
    occurredAt: { date: "260303(월)", time: "10:30" },
    checkedAt: { date: "260304(화)", time: "09:00" },
  },
  {
    id: "act-03",
    name: "자료 탐색 정리",
    result: "체크 성공",
    hub: "실무 정보",
    line: "위즈덤",
    duration: 30,
    points: { 단감: 18, 인절미: 0, 어흥: 0 },
    crew: "선택",
    occurredAt: { date: "260303(월)", time: "14:00" },
    checkedAt: { date: "260304(화)", time: "11:00" },
  },
  // ── 화 260304 ──
  {
    id: "act-04",
    name: "과제 1차 제출",
    result: "체크 성공",
    hub: "실무 역량",
    line: "코드",
    duration: 60,
    points: { 단감: 25, 인절미: 0, 어흥: 0 },
    crew: "필수",
    occurredAt: { date: "260304(화)", time: "11:00" },
    checkedAt: { date: "260305(수)", time: "23:00" },
  },
  {
    id: "act-05",
    name: "동료 리뷰 작성",
    result: "체크 성공",
    hub: "협업 문화",
    line: "리뷰",
    duration: 25,
    points: { 단감: 15, 인절미: 1, 어흥: 0 },
    crew: "선택",
    occurredAt: { date: "260304(화)", time: "15:30" },
    checkedAt: { date: "260305(수)", time: "12:00" },
  },
  {
    id: "act-06",
    name: "정규 세션 지각",
    result: "체크 실패",
    hub: "실무 태도",
    line: "아레나",
    duration: 10,
    points: { 단감: -6, 인절미: 0, 어흥: 0 },
    crew: "필수",
    occurredAt: { date: "260304(화)", time: "19:00" },
    checkedAt: { date: "260305(수)", time: "09:00" },
  },
  // ── 수 260305 ──
  {
    id: "act-07",
    name: "멘토 피드백 반영",
    result: "체크 성공",
    hub: "성장 관리",
    line: "에세이",
    duration: 45,
    points: { 단감: 18, 인절미: 0, 어흥: 1 },
    crew: "선택",
    occurredAt: { date: "260305(수)", time: "10:00" },
    checkedAt: { date: "260306(목)", time: "10:00" },
  },
  {
    id: "act-08",
    name: "Q&A 베스트 답변",
    result: "체크 성공",
    hub: "실무 정보",
    line: "위즈덤",
    duration: 20,
    points: { 단감: 22, 인절미: 0, 어흥: 0 },
    crew: "선발",
    occurredAt: { date: "260305(수)", time: "13:00" },
    checkedAt: { date: "260306(목)", time: "09:00" },
  },
  {
    id: "act-09",
    name: "학습 자료 공유",
    result: "체크 성공",
    hub: "협업 문화",
    line: "리뷰",
    duration: 15,
    points: { 단감: 14, 인절미: 1, 어흥: 0 },
    crew: "선택",
    occurredAt: { date: "260305(수)", time: "16:30" },
    checkedAt: { date: "260306(목)", time: "11:00" },
  },
  // ── 목 260306 ──
  {
    id: "act-10",
    name: "데일리 체크인",
    result: "체크 성공",
    hub: "실무 태도",
    line: "아레나",
    duration: 5,
    points: { 단감: 8, 인절미: 0, 어흥: 0 },
    crew: "없음",
    occurredAt: { date: "260306(목)", time: "09:00" },
    checkedAt: { date: "260306(목)", time: "10:00" },
  },
  {
    id: "act-11",
    name: "팀 주간 회고",
    result: "체크 성공",
    hub: "협업 문화",
    line: "리뷰",
    duration: 40,
    points: { 단감: 12, 인절미: 0, 어흥: 0 },
    crew: "필수",
    occurredAt: { date: "260306(목)", time: "19:30" },
    checkedAt: { date: "260307(금)", time: "09:00" },
  },
  // ── 금 260307 ──
  {
    id: "act-12",
    name: "연속 출석 보너스",
    result: "체크 성공",
    hub: "실무 태도",
    line: "아레나",
    duration: 5,
    points: { 단감: 20, 인절미: 0, 어흥: 1 },
    crew: "없음",
    occurredAt: { date: "260307(금)", time: "08:30" },
    checkedAt: { date: "260307(금)", time: "09:00" },
  },
  {
    id: "act-13",
    name: "코드 리뷰 반영",
    result: "체크 성공",
    hub: "실무 역량",
    line: "코드",
    duration: 35,
    points: { 단감: 12, 인절미: 0, 어흥: 0 },
    crew: "선택",
    occurredAt: { date: "260307(금)", time: "16:00" },
    checkedAt: { date: "260308(토)", time: "10:00" },
  },
  {
    id: "act-14",
    name: "스터디 발표 진행",
    result: "체크 성공",
    hub: "성장 관리",
    line: "에세이",
    duration: 50,
    points: { 단감: 15, 인절미: 0, 어흥: 0 },
    crew: "선발",
    occurredAt: { date: "260307(금)", time: "22:00" },
    checkedAt: { date: "260308(토)", time: "12:00" },
  },
  // ── 토 260308 ──
  {
    id: "act-15",
    name: "과제 우수 제출",
    result: "체크 성공",
    hub: "실무 역량",
    line: "코드",
    duration: 90,
    points: { 단감: 45, 인절미: 0, 어흥: 0 },
    crew: "필수",
    occurredAt: { date: "260308(토)", time: "13:00" },
    checkedAt: { date: "260308(토)", time: "20:00" },
  },
  {
    id: "act-16",
    name: "미완료 항목 차감",
    result: "체크 실패",
    hub: "성장 관리",
    line: "에세이",
    duration: 15,
    points: { 단감: -6, 인절미: 0, 어흥: 0 },
    crew: "선택",
    occurredAt: { date: "260308(토)", time: "15:30" },
    checkedAt: { date: "260308(토)", time: "21:00" },
  },
  {
    id: "act-17",
    name: "주차 올클리어",
    result: "체크 성공",
    hub: "성장 관리",
    line: "에세이",
    duration: 120,
    points: { 단감: 80, 인절미: 0, 어흥: 0 },
    crew: "필수",
    occurredAt: { date: "260308(토)", time: "18:00" },
    checkedAt: { date: "260308(토)", time: "23:00" },
  },
];

// 전체 합산은 요구 사양에 맞춘 고정 표시값(목업).
export const ACT_LOG_SUMMARY: ActLogSummary = {
  seasonLabel: "26 봄",
  weekLabel: "12주차",
  totals: { 단감: 404, 인절미: 2, 어흥: 3 },
  streak: 6,
  rankDelta: 4,
};
