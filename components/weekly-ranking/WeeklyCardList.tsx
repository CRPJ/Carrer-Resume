"use client";

import { useEffect, useState } from "react";
import WeeklyCardItem from "./WeeklyCardItem";
import type { WeeklyCardData } from "@/constants/dummyData/weekly-card-dummy";

const PAGE_SIZE = 12;

interface WeeklyCardListProps {
  cards: WeeklyCardData[];
  isLoading?: boolean;
}

const SKELETON_COUNT = 6;

export default function WeeklyCardList({ cards, isLoading = false }: WeeklyCardListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 필터/정렬 변경으로 cards가 갱신되면 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [cards]);

  const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const visibleCards = cards.slice(startIdx, startIdx + PAGE_SIZE);

  // 로딩 중에는 스켈레톤 그리드 노출 (빈 "없습니다" 문구가 잠깐 잘못 노출되는 회귀 차단).
  if (isLoading) {
    return (
      <div className="weekly-card-list weekly-card-list--loading">
        <div className="row vertical-column-gap">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className="col-12 col-md-6 col-xl-4">
              <div className="weekly-card-skeleton" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
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
