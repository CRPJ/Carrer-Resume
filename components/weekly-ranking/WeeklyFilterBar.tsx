"use client";

import { ChangeEvent } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface WeeklyFilterBarProps {
  totalCount: number;
  sortValue: string;
  seasonValue: string;
  leagueValue: string;
  sortOptions: FilterOption[];
  seasonOptions: FilterOption[];
  leagueOptions: FilterOption[];
  resultCount: number;
  onSortChange: (v: string) => void;
  onSeasonChange: (v: string) => void;
  onLeagueChange: (v: string) => void;
  onReset: () => void;
}

const WeeklyFilterBar = ({
  totalCount,
  sortValue,
  seasonValue,
  leagueValue,
  sortOptions,
  seasonOptions,
  leagueOptions,
  resultCount,
  onSortChange,
  onSeasonChange,
  onLeagueChange,
  onReset,
}: WeeklyFilterBarProps) => {
  return (
    <div className="weekly-filter">
      <button type="button" className="weekly-filter__reset" onClick={onReset}>
        RESET
      </button>

      <div className="weekly-filter__item weekly-filter__item--readonly">
        <span className="weekly-filter__dot" aria-hidden="true">●</span>
        <span className="weekly-filter__label">전체 수</span>
        <span className="weekly-filter__value">{totalCount}</span>
      </div>

      <div className="weekly-filter__item">
        <span className="weekly-filter__dot" aria-hidden="true">●</span>
        <label className="weekly-filter__label" htmlFor="weekly-sort">정렬</label>
        <select
          id="weekly-sort"
          className="weekly-filter__select form-select"
          value={sortValue}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onSortChange(e.target.value)}
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="weekly-filter__item">
        <span className="weekly-filter__dot" aria-hidden="true">●</span>
        <label className="weekly-filter__label" htmlFor="weekly-season">시즌</label>
        <select
          id="weekly-season"
          className="weekly-filter__select form-select"
          value={seasonValue}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onSeasonChange(e.target.value)}
        >
          {seasonOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="weekly-filter__item">
        <span className="weekly-filter__dot" aria-hidden="true">●</span>
        <label className="weekly-filter__label" htmlFor="weekly-league">리그</label>
        <select
          id="weekly-league"
          className="weekly-filter__select form-select"
          value={leagueValue}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onLeagueChange(e.target.value)}
        >
          {leagueOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="weekly-filter__item weekly-filter__item--readonly weekly-filter__item--right">
        <span className="weekly-filter__dot" aria-hidden="true">●</span>
        <span className="weekly-filter__label">검색 결과</span>
        <span className="weekly-filter__value">{resultCount}</span>
      </div>
    </div>
  );
};

export default WeeklyFilterBar;
