import {
  WEEKLY_CARD_DUMMY,
  type WeeklyCardData,
  type RestReason,
} from "@/constants/dummyData/weekly-card-dummy";

// /api/weekly-cards 응답의 단일 카드 형태. 리스트(WeeklyRankingContent)와 상세(WeeklyDetailContent)가 공유.
export type ApiCard = {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  isClubBreak: boolean;
  seasonYear: number;
  seasonNameEn: string;
  seasonNameKo: string;
  status: WeeklyCardData['status'];
  leagueResultStatus: WeeklyCardData['leagueResultStatus'];
  leagueRecordStatus: WeeklyCardData['leagueRecordStatus'];
  holidayName: string | null;
  totalCrews: number;
  growthChallenge: number;
  growthSuccess: number;
  growthFail: number;
  personalRest: number;
  growthSuccessRate: number;
  growthChallengeRate: number;
  top3: WeeklyCardData['top3'];
};

// 더미 매핑 lookup — seasonName(예: "2026년, 봄 시즌, 3주차") → 주차 헤더 이미지.
// 운영진이 새 주차 이미지를 더미에 등록만 해주면 그대로 카드에 반영. 기간 텍스트는 더미를 쓰지 않고 항상 API 기준으로 재계산.
const DUMMY_IMAGE_BY_KEY = new Map<string, string | null>(
  WEEKLY_CARD_DUMMY.map((d) => [d.seasonName, d.imageUrl])
);

const KOREAN_WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

// "YYYY-MM-DD" → "YY.MM.DD(요일)". 요일 계산은 UTC 기준 — 브라우저 timezone 영향 차단.
const formatIsoToCompact = (iso: string): string => {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const [, year, month, day] = m;
  const dow = KOREAN_WEEKDAY[new Date(`${iso}T00:00:00Z`).getUTCDay()] ?? '';
  return `${year.slice(2)}.${month}.${day}(${dow})`;
};

// "YYYY-MM-DD" 에 days 만큼 더한 ISO 날짜 문자열. UTC 기준으로 계산 — DST/timezone 영향 없음.
const shiftDateIso = (iso: string, days: number): string => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

const HOLIDAY_TO_REST_REASON: Record<string, RestReason> = {
  '중간고사': '중간고사',
  '기말고사': '기말고사',
  '구정(설) 공휴일': '설 연휴',
  '설 연휴': '설 연휴',
  '추석': '한가위',
  '한가위': '한가위',
  '시즌 전환': '시즌 전환',
};

const MID_TERM_WEEKS = [6, 7, 8];
const FINAL_WEEKS = [14, 15, 16];

const resolveRestReason = (holidayName: string | null, weekNumber: number): RestReason | undefined => {
  if (!holidayName) return undefined;
  if (HOLIDAY_TO_REST_REASON[holidayName]) return HOLIDAY_TO_REST_REASON[holidayName];
  if (holidayName === '시험 기간' || holidayName === '시험기간') {
    if (MID_TERM_WEEKS.includes(weekNumber)) return '중간고사';
    if (FINAL_WEEKS.includes(weekNumber)) return '기말고사';
    return '중간고사';
  }
  return undefined;
};

export const apiToCardData = (c: ApiCard): WeeklyCardData => {
  const seasonName = `${c.seasonYear}년, ${c.seasonNameKo} 시즌, ${c.weekNumber}주차`;
  // DB는 월~일로 저장되어 있지만 크루 대상 표기는 월~토. endDate 에서 하루 빼서 토요일로 표시.
  const displayEndIso = shiftDateIso(c.endDate, -1);
  const dateRangeText = `${formatIsoToCompact(c.startDate)} - ${formatIsoToCompact(displayEndIso)}`;
  return {
    id: c.id,
    seasonName,
    weekNumber: c.weekNumber,
    dateRangeText,
    status: c.status,
    leagueResultStatus: c.leagueResultStatus,
    leagueRecordStatus: c.leagueRecordStatus,
    imageUrl: DUMMY_IMAGE_BY_KEY.get(seasonName) ?? null,
    growthSuccessRate: c.growthSuccessRate,
    growthChallengeRate: c.growthChallengeRate,
    totalCrews: c.totalCrews,
    growthChallenge: c.growthChallenge,
    growthSuccess: c.growthSuccess,
    growthFail: c.growthFail,
    personalRest: c.personalRest,
    winningTeamImage: null,
    top3: c.top3,
    restReason: resolveRestReason(c.holidayName, c.weekNumber),
  };
};
