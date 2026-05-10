"use client";

import { useEffect, useMemo, useState } from "react";
import WeeklyCardItem from "./WeeklyCardItem";
import { WEEKLY_CARD_DUMMY } from "@/constants/dummyData/weekly-card-dummy";
import { isDemoMode } from "@/utils/isDemoMode";

const PAGE_SIZE = 12;

export default function WeeklyCardList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [demo, setDemo] = useState(false);

  // localStorage는 SSR에서 접근 불가 — 마운트 후 한 번 체크
  useEffect(() => {
    setDemo(isDemoMode());
  }, []);

  const allCards = useMemo(() => (demo ? WEEKLY_CARD_DUMMY : []), [demo]);

  const totalPages = Math.max(1, Math.ceil(allCards.length / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const visibleCards = allCards.slice(startIdx, startIdx + PAGE_SIZE);

  if (allCards.length === 0) {
    return (
      <div className="weekly-list-empty">
        <p>표시할 주차 카드가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="weekly-card-list">
      <div className="row vertical-column-gap">
        {visibleCards.map((card) => (
          <WeeklyCardItem key={card.id} data={card} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="weekly-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <span
              key={num}
              className={`page-num ${currentPage === num ? "active" : ""} ${num === totalPages ? "last" : ""}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
