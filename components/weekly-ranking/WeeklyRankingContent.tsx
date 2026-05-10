"use client";

import { useEffect, useMemo, useState } from "react";
import WeeklyFilterBar from "./WeeklyFilterBar";
import WeeklyCardList from "./WeeklyCardList";
import {
  WEEKLY_CARD_DUMMY,
  type WeeklyCardData,
} from "@/constants/dummyData/weekly-card-dummy";
import { isDemoMode } from "@/utils/isDemoMode";

const SORT_OPTIONS = [
  { value: "latest",         label: "최신 순" },
  { value: "growth-success", label: "성장 성공률" },
  { value: "growth-try",     label: "성장 도전율" },
  { value: "crew-count",     label: "리그 크루 수" },
];

const SEASON_OPTIONS = [
  { value: "",            label: "-" },
  { value: "2026-spring", label: "2026년, 봄 시즌" },
];

const LEAGUE_OPTIONS = [
  { value: "",         label: "-" },
  { value: "normal",   label: "정상 진행" },
  { value: "advanced", label: "심화 진행" },
  { value: "rest",     label: "휴식(공식)" },
];

// 필터 value → 카드 데이터 필드 매핑
// (옵션 라벨은 UI 표시용. 실제 비교는 카드 데이터 문자열 기준.)
const SEASON_VALUE_TO_DATA: Record<string, string> = {
  "2026-spring": "2026년, 봄 시즌",
};

const LEAGUE_VALUE_TO_DATA: Record<string, WeeklyCardData["leagueResultStatus"]> = {
  normal:   "정상 진행",
  advanced: "심화 진행",
  rest:     "공식 휴식", // UI 라벨은 "휴식(공식)" 이지만 카드 데이터는 "공식 휴식"
};

const WeeklyRankingContent = () => {
  const [sortValue,   setSortValue]   = useState<string>("latest");
  const [seasonValue, setSeasonValue] = useState<string>("");
  const [leagueValue, setLeagueValue] = useState<string>("");
  const [demo, setDemo] = useState(false);

  // localStorage는 SSR 접근 불가 — 마운트 후 한 번 체크
  useEffect(() => {
    setDemo(isDemoMode());
  }, []);

  const allCards = useMemo<WeeklyCardData[]>(
    () => (demo ? WEEKLY_CARD_DUMMY : []),
    [demo]
  );

  // 필터 + 정렬 결과. useMemo로 ref 안정화 — 자식 페이지네이션 reset effect 트리거 적정화.
  const filteredAndSortedCards = useMemo<WeeklyCardData[]>(() => {
    let result = allCards;

    if (seasonValue) {
      const targetSeason = SEASON_VALUE_TO_DATA[seasonValue];
      if (targetSeason) {
        result = result.filter((card) => card.seasonName === targetSeason);
      }
    }

    if (leagueValue) {
      const targetLeague = LEAGUE_VALUE_TO_DATA[leagueValue];
      if (targetLeague) {
        result = result.filter(
          (card) => card.leagueResultStatus === targetLeague
        );
      }
    }

    const sorted = [...result];
    switch (sortValue) {
      case "latest":
        sorted.sort((a, b) => b.weekNumber - a.weekNumber);
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
              <h1 className="weekly-hero__title-shadow" aria-hidden="true">Weekly League</h1>
              <h1 className="weekly-hero__title" aria-label="Weekly League">
                {'Weekly League'.split('').map((char, i) => (
                  <span
                    key={i}
                    className="weekly-hero__title-char"
                    style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                    aria-hidden="true"
                  >
                    {char === ' ' ? ' ' : char}
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
            <p className="weekly-hero__desc-strong">
              그리고, 나는 어느 정도의 성장을 이루었는지를 체크해보자구요! 😊
            </p>
          </div>

          <div className="weekly-hero__quote">
            <img
              className="weekly-hero__quote-image"
              src="/images/0/cluster 2/명언 2.png"
              alt=""
              aria-hidden="true"
            />
            <div className="weekly-hero__quote-body">
              <p className="weekly-hero__quote-ko">
                &quot;모든 위대한 걸음은, 작은 한 걸음에서 시작된다.&quot;
              </p>
              <p className="weekly-hero__quote-en">
                A Journey of a thousand miles begins with a single step
              </p>
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
        seasonOptions={SEASON_OPTIONS}
        leagueOptions={LEAGUE_OPTIONS}
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

      <WeeklyCardList cards={filteredAndSortedCards} />

    </section>
  );
};

export default WeeklyRankingContent;
