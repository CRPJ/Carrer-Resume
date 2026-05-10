"use client";

import { useState } from "react";
import WeeklyFilterBar from "./WeeklyFilterBar";
import WeeklyCardList from "./WeeklyCardList";

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

const DEFAULT_TOTAL_WEEKS = 0;

const WeeklyRankingContent = () => {
  const [sortValue,   setSortValue]   = useState<string>("latest");
  const [seasonValue, setSeasonValue] = useState<string>("");
  const [leagueValue, setLeagueValue] = useState<string>("");

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
              <h1 className="weekly-hero__title">Weekly League</h1>
            </div>
            <div className="weekly-hero__slogan">
              <p>전국의 내로라하는 청춘들이 펼치는, 주차별 성장 리그!</p>
              <p>위대한 성취는, 당장의 한 걸음부터.</p>
              <p className="weekly-hero__slogan-strong">이번 주 그대는 얼마나 성장하였는가?</p>
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
        totalCount={DEFAULT_TOTAL_WEEKS}
        sortValue={sortValue}
        seasonValue={seasonValue}
        leagueValue={leagueValue}
        sortOptions={SORT_OPTIONS}
        seasonOptions={SEASON_OPTIONS}
        leagueOptions={LEAGUE_OPTIONS}
        resultCount={DEFAULT_TOTAL_WEEKS}
        onSortChange={setSortValue}
        onSeasonChange={setSeasonValue}
        onLeagueChange={setLeagueValue}
        onReset={handleReset}
      />

      <div className="weekly-team-stats-placeholder">
        <p>팀 통계 영역 (다음 회차 재통합 예정)</p>
      </div>

      <WeeklyCardList />

    </section>
  );
};

export default WeeklyRankingContent;
