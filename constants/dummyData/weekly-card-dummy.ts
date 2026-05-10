// Weekly Card 더미 — 12장 × 2페이지 = 24장 (페이지네이션 검증용)

export type WeeklyCardCrew = {
  rank: 1 | 2 | 3;
  name: string;
  team: string;
  part: string;
};

export type WeeklyCardData = {
  id: string;
  seasonName: string;
  weekNumber: number;
  dateRange: { start: string; end: string };
  status: '정상 진행' | '대전 집계' | '휴식';
  leagueResultStatus: '정상 진행' | '심화 진행' | '공식 휴식';
  leagueRecordStatus: '대전 중' | '대전 집계' | '공표 중' | '검수 완료';
  imageUrl: string | null;
  growthSuccessRate: number;
  growthChallengeRate: number;
  totalCrews: number;
  growthChallenge: number;
  growthSuccess: number;
  growthFail: number;
  personalRest: number;
  winningTeamImage: string | null;
  top3: WeeklyCardCrew[];
};

const baseTop3: WeeklyCardCrew[] = [
  { rank: 1, name: '홍길동', team: '커머커머스 팀', part: '커커커스도 파트' },
  { rank: 2, name: '김철수', team: '데이터 팀',     part: '백엔드 파트' },
  { rank: 3, name: '이영희', team: '디자인 팀',     part: '프론트 파트' },
];

const LEAGUE_RESULTS: WeeklyCardData['leagueResultStatus'][] = [
  '정상 진행',
  '심화 진행',
  '공식 휴식',
];

const LEAGUE_RECORDS: WeeklyCardData['leagueRecordStatus'][] = [
  '대전 중',
  '대전 집계',
  '공표 중',
  '검수 완료',
];

const seededRandom = (seed: number, max: number, min: number = 0): number => {
  const x = Math.sin(seed) * 10000;
  const fractional = x - Math.floor(x);
  return Math.floor(fractional * (max - min)) + min;
};

const seededRate = (seed: number): number => seededRandom(seed, 101);

export const WEEKLY_CARD_DUMMY: WeeklyCardData[] = Array.from({ length: 24 }, (_, i) => {
  const weekNum = 99 - i;
  const isRest = i % 7 === 6;
  const isAggregating = !isRest && i % 5 === 0;
  return {
    id: `week-${weekNum}`,
    seasonName: '2026년, 여름 시즌',
    weekNumber: weekNum,
    dateRange: { start: '26.03.03(월)', end: '26.03.03(토)' },
    status: isRest ? '휴식' : isAggregating ? '대전 집계' : '정상 진행',
    leagueResultStatus: LEAGUE_RESULTS[seededRandom(i + 61, LEAGUE_RESULTS.length)],
    leagueRecordStatus: LEAGUE_RECORDS[seededRandom(i + 71, LEAGUE_RECORDS.length)],
    imageUrl: null,
    growthSuccessRate: seededRate(i + 168),
    growthChallengeRate: seededRate(i + 915),
    totalCrews: 999,
    growthChallenge: seededRandom(i + 21, 1000, 200),
    growthSuccess: seededRandom(i + 31, 700, 100),
    growthFail: seededRandom(i + 41, 350, 50),
    personalRest: seededRandom(i + 51, 100),
    winningTeamImage: null,
    top3: baseTop3,
  };
});
