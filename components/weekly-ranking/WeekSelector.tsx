"use client";

import { WeekOption } from "./types";

interface WeekSelectorProps {
  weeks: WeekOption[];
  selectedWeekId: string | null;
  onWeekChange: (weekId: string) => void;
}

const WeekSelector = ({ weeks, selectedWeekId, onWeekChange }: WeekSelectorProps) => {
  return (
    <div className="leaderboard__filter">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '14px', color: '#888' }}>주차 선택:</span>
        <select
          value={selectedWeekId || ''}
          onChange={(e) => onWeekChange(e.target.value)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px',
            border: '1px solid #333',
            backgroundColor: '#1a1a2e',
            color: '#fff',
            cursor: 'pointer',
            minWidth: '200px',
          }}
        >
          {weeks.map((week) => (
            <option key={week.id} value={week.id}>
              {week.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default WeekSelector;
