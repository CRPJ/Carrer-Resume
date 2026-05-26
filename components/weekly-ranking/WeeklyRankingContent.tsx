"use client";

import { useEffect, useMemo, useState } from "react";
import WeeklyFilterBar from "./WeeklyFilterBar";
import WeeklyCardList from "./WeeklyCardList";
import { WEEKLY_CARD_DUMMY, type WeeklyCardData, type RestReason } from "@/constants/dummyData/weekly-card-dummy";
import { isDemoMode } from "@/utils/isDemoMode";

const SORT_OPTIONS = [
  { value: "latest", label: "최신 순" },
  { value: "growth-success", label: "성장 성공률" },
  { value: "growth-try", label: "성장 도전율" },
  { value: "crew-count", label: "리그 크루 수" },
];

const SEASON_ORDER: Record<string, number> = {
  겨울: 1,
  봄: 2,
  여름: 3,
  가을: 4,
};

const parseYearSeason = (text: string) => {
  const match = text.match(/(\d{4})년,?\s*(봄|여름|가을|겨울)\s*시즌/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    season: match[2],
    seasonOrder: SEASON_ORDER[match[2]] ?? 0,
  };
};

const parseWeekSortKey = (seasonName: string) => {
  const ys = parseYearSeason(seasonName);
  const weekMatch = seasonName.match(/(\d+)주차/);
  return {
    year: ys?.year ?? 0,
    seasonOrder: ys?.seasonOrder ?? 0,
    week: weekMatch ? Number(weekMatch[1]) : 0,
  };
};

// 카드 seasonName → 시즌 필터 value (= label).
// 카드와 필터가 동일 문자열을 공유 → 별도 mapping 불필요.
const getSeasonFilterValue = (seasonName: string) => {
  const ys = parseYearSeason(seasonName);
  if (!ys) return "";
  return `${ys.year}년, ${ys.season} 시즌`;
};

type ApiCard = {
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

const apiToCardData = (c: ApiCard): WeeklyCardData => {
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

const WeeklyRankingContent = () => {
  const [sortValue, setSortValue] = useState<string>("latest");
  const [seasonValue, setSeasonValue] = useState<string>("");
  const [leagueValue, setLeagueValue] = useState<string>("");
  const [demo, setDemo] = useState(false);
  const [apiCards, setApiCards] = useState<WeeklyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // localStorage는 SSR 접근 불가 — 마운트 후 한 번 체크
  useEffect(() => {
    setDemo(isDemoMode());
  }, []);

  // demo 모드가 아니면 supabase 연동 API 호출. 응답을 더미 매핑(이미지/기간)과 합쳐 WeeklyCardData 로 변환.
  useEffect(() => {
    if (demo) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/weekly-cards', { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        if (!json?.success) {
          console.error('[weekly-ranking] api error:', json?.error);
          setApiCards([]);
          return;
        }
        const cards: ApiCard[] = json?.data?.cards || [];
        setApiCards(cards.map(apiToCardData));
      } catch (e) {
        if (cancelled) return;
        console.error('[weekly-ranking] fetch error:', e);
        setApiCards([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  const allCards = useMemo<WeeklyCardData[]>(
    () => (demo ? WEEKLY_CARD_DUMMY : apiCards),
    [demo, apiCards]
  );

  // 카드 데이터에 실제 존재하는 시즌만 옵션으로. 최신(year + seasonOrder DESC) 정렬.
  const seasonOptions = useMemo(() => {
    const set = new Set<string>();
    allCards.forEach((card) => {
      const v = getSeasonFilterValue(card.seasonName);
      if (v) set.add(v);
    });
    const sorted = Array.from(set).sort((a, b) => {
      const ay = parseYearSeason(a);
      const by = parseYearSeason(b);
      if (!ay || !by) return 0;
      return by.year - ay.year || by.seasonOrder - ay.seasonOrder;
    });
    return [{ value: "", label: "전체 시즌" }, ...sorted.map((s) => ({ value: s, label: s }))];
  }, [allCards]);

  // 리그 결과 옵션은 운영 정책상 고정 노출 — '심화 진행' 은 아직 케이스 없어도 드롭다운에는 노출(필터 결과 0).
  const leagueOptions = useMemo(() => {
    const FIXED: WeeklyCardData['leagueResultStatus'][] = ['정상 진행', '심화 진행', '공식 휴식'];
    return [
      { value: "", label: "종합" },
      ...FIXED.map((s) => ({ value: s, label: s })),
    ];
  }, []);

  // 필터 + 정렬 결과. useMemo로 ref 안정화 — 자식 페이지네이션 reset effect 트리거 적정화.
  const filteredAndSortedCards = useMemo<WeeklyCardData[]>(() => {
    let result = allCards;

    if (seasonValue) {
      result = result.filter((card) => getSeasonFilterValue(card.seasonName) === seasonValue);
    }

    if (leagueValue) {
      result = result.filter((card) => card.leagueResultStatus === leagueValue);
    }

    const sorted = [...result];
    switch (sortValue) {
      case "latest":
        // seasonName 에서 연도/시즌/주차 파싱 후 DESC 정렬.
        // 시즌 우선순위: 가을 > 여름 > 봄 > 겨울 (같은 해 안에서).
        sorted.sort((a, b) => {
          const ak = parseWeekSortKey(a.seasonName);
          const bk = parseWeekSortKey(b.seasonName);
          return bk.year - ak.year || bk.seasonOrder - ak.seasonOrder || bk.week - ak.week;
        });
        break;
      case "growth-success":
        sorted.sort((a, b) => b.growthSuccessRate - a.growthSuccessRate);
        break;
      case "growth-try":
        sorted.sort((a, b) => b.growthChallengeRate - a.growthChallengeRate);
        break;
      case "crew-count":
        sorted.sort((a, b) => b.totalCrews - a.totalCrews);
        break;
    }

    return sorted;
  }, [allCards, sortValue, seasonValue, leagueValue]);

  const handleReset = () => {
    setSortValue("latest");
    setSeasonValue("");
    setLeagueValue("");
  };

  return (
    <section className="weekly-ranking-page">
      <div className="weekly-hero">
        <div className="weekly-hero__bg" aria-hidden="true" />
        <div className="weekly-hero__overlay" aria-hidden="true" />
        <div className="weekly-hero__inner">
          <div className="weekly-hero__top">
            <div className="weekly-hero__title-wrap">
              <h1 className="weekly-hero__title-shadow" aria-hidden="true">
                Weekly League
              </h1>
              <h1 className="weekly-hero__title" aria-label="Weekly League">
                {"Weekly League".split("").map((char, i) => (
                  <span key={i} className="weekly-hero__title-char" style={{ animationDelay: `${0.3 + i * 0.05}s` }} aria-hidden="true">
                    {char === " " ? " " : char}
                  </span>
                ))}
              </h1>
            </div>
            <div className="weekly-hero__slogan">
              <p>전국의 내로라하는 청춘들이 펼치는, 주차별 성장 리그!</p>
              <p>위대한 성취는, 당장의 한 걸음부터.</p>
              <p className="weekly-hero__slogan-strong">이번 주 그대는 얼마나 성장하였는가?</p>
              <span className="weekly-hero__sparkle weekly-hero__sparkle--tr" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="weekly-hero__sparkle weekly-hero__sparkle--bl" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="weekly-hero__sparkle weekly-hero__sparkle--tl" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="weekly-hero__sparkle weekly-hero__sparkle--br" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
                </svg>
              </span>
            </div>
          </div>

          <div className="weekly-hero__desc">
            <p>위클리 리그는 전국청춘성장 클럽의 매 주 활동을 토대로 진행되는, 성장 경쟁 리그입니다.</p>
            <p>월요일부터 토요일까지 한 주 동안, 우리 클럽 크루들의 성장 활동이 어떻게 진행되었을지!</p>
            <p className="weekly-hero__desc-strong">그리고, 나는 어느 정도의 성장을 이루었는지를 체크해보자구요! 😊</p>
          </div>

          <div className="weekly-hero__quote">
            <img className="weekly-hero__quote-image" src="/images/0/cluster 2/명언 2.png" alt="" aria-hidden="true" />
            <div className="weekly-hero__quote-body">
              <p className="weekly-hero__quote-ko">&quot;모든 위대한 걸음은, 작은 한 걸음에서 시작된다.&quot;</p>
              <p className="weekly-hero__quote-en">A journey of a thousand miles begins with a single step</p>
              <p className="weekly-hero__quote-author">- 노자</p>
            </div>
          </div>
        </div>
      </div>

      <WeeklyFilterBar
        totalCount={allCards.length}
        sortValue={sortValue}
        seasonValue={seasonValue}
        leagueValue={leagueValue}
        sortOptions={SORT_OPTIONS}
        seasonOptions={seasonOptions}
        leagueOptions={leagueOptions}
        resultCount={filteredAndSortedCards.length}
        onSortChange={setSortValue}
        onSeasonChange={setSeasonValue}
        onLeagueChange={setLeagueValue}
        onReset={handleReset}
      />

      {/*
        팀 통계 영역 (다음 회차 재통합 예정) — 임시 비활성화
        <div className="weekly-team-stats-placeholder">
          <p>팀 통계 영역 (다음 회차 재통합 예정)</p>
        </div>
      */}

      <WeeklyCardList cards={filteredAndSortedCards} isLoading={isLoading} />
    </section>
  );
};

export default WeeklyRankingContent;
