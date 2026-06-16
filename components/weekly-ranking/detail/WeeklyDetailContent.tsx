"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WEEKLY_CARD_DUMMY, type WeeklyCardData } from "@/constants/dummyData/weekly-card-dummy";
import { getWeeklyDetailInfo } from "@/constants/dummyData/weekly-detail-dummy";
import { apiToCardData, type ApiCard } from "../apiToCardData";
import { isDemoMode } from "@/utils/isDemoMode";
import ChampionTheme from "./themes/ChampionTheme";

interface Props {
  weekId: string;
}

export default function WeeklyDetailContent({ weekId }: Props) {
  const [demo, setDemo] = useState(false);
  const [demoResolved, setDemoResolved] = useState(false);
  const [apiCards, setApiCards] = useState<WeeklyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDemo(isDemoMode());
    setDemoResolved(true);
  }, []);

  useEffect(() => {
    if (!demoResolved) return;
    if (demo) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/weekly-cards", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (!json?.success) {
          console.error("[weekly-detail] api error:", json?.error);
          setApiCards([]);
          return;
        }
        const cards: ApiCard[] = json?.data?.cards || [];
        setApiCards(cards.map(apiToCardData));
      } catch (e) {
        if (cancelled) return;
        console.error("[weekly-detail] fetch error:", e);
        setApiCards([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demo, demoResolved]);

  const card = useMemo<WeeklyCardData | undefined>(() => {
    const source = demo ? WEEKLY_CARD_DUMMY : apiCards;
    return source.find((c) => c.id === weekId);
  }, [demo, apiCards, weekId]);

  const detail = useMemo(
    () => (card ? getWeeklyDetailInfo(card.seasonName) : null),
    [card]
  );

  if (isLoading) {
    return (
      <div className="weekly-arena weekly-arena--loading">
        <div className="wa-skeleton wa-skeleton--hero" aria-hidden="true" />
        <div className="wa-skeleton wa-skeleton--block" aria-hidden="true" />
        <div className="wa-skeleton wa-skeleton--block" aria-hidden="true" />
      </div>
    );
  }

  if (!card || !detail) {
    return (
      <div className="weekly-arena">
        <div className="wa-notfound">
          <span className="wa-notfound__glyph" aria-hidden="true"><i className="ti ti-ghost-2" /></span>
          <p>해당 주차 정보를 찾을 수 없습니다.</p>
          <Link href="/weekly-ranking" className="wa-back">
            <i className="ti ti-arrow-left" /> 위클리 리그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 디자인 F(FINALE) 확정 — 다른 테마는 기존 커밋에서 복원 가능.
  return <ChampionTheme card={card} detail={detail} />;
}
