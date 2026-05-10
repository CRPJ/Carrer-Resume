"use client";

import NiceSelectComponent from "@/components/shared/NiceSelect";

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

// nice-select2의 Option은 { value, text } — 기존 { value, label }을 변환
const toNiceOptions = (opts: FilterOption[]) => opts.map(o => ({ value: o.value, text: o.label }));

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
    <div className="tournaments weekly-filter-wrap">
      <div className="tournaments__filter fade-top">
        <button
          type="button"
          className="weekly-filter-reset-btn"
          onClick={onReset}
        >
          RESET
        </button>

        <div className="weekly-filter-readonly">
          <span className="weekly-filter-dot" aria-hidden="true">●</span>
          <span className="weekly-filter-label">전체 수</span>
          <span className="weekly-filter-value">{totalCount}</span>
        </div>

        <NiceSelectComponent
          options={toNiceOptions(sortOptions)}
          defaultValue={sortValue}
          onChange={onSortChange}
          placeholder="정렬"
        />

        <NiceSelectComponent
          options={toNiceOptions(seasonOptions)}
          defaultValue={seasonValue}
          onChange={onSeasonChange}
          placeholder="시즌"
        />

        <NiceSelectComponent
          options={toNiceOptions(leagueOptions)}
          defaultValue={leagueValue}
          onChange={onLeagueChange}
          placeholder="리그"
        />

        <div className="weekly-filter-readonly">
          <span className="weekly-filter-dot" aria-hidden="true">●</span>
          <span className="weekly-filter-label">검색 결과</span>
          <span className="weekly-filter-value">{resultCount}</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyFilterBar;
