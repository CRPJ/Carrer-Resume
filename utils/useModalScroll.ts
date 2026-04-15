import { useEffect } from 'react';

export function useModalScroll(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    let lastTouchY = 0;

    const preventWheelScroll = (e: WheelEvent) => {
      // target부터 부모를 타고 올라가면서 실제 스크롤 가능한 요소 찾기
      let el: HTMLElement | null = e.target as HTMLElement;

      while (el) {
        // html, body는 스크롤 가능 판정에서 제외
        if (el === document.body || el === document.documentElement) {
          break;
        }

        const style = getComputedStyle(el);
        const isScrollable =
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight;

        if (isScrollable) {
          // 실제 스크롤 가능한 요소 발견
          // 스크롤 끝에 도달했으면 배경 전파 방지
          const atTop = el.scrollTop === 0 && e.deltaY < 0;
          const atBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight && e.deltaY > 0;

          if (atTop || atBottom) {
            e.preventDefault(); // 끝에 도달 → 차단
          }
          return; // 스크롤 가능 → 허용
        }

        el = el.parentElement;
      }

      // 스크롤 가능한 부모가 없음 → 배경 스크롤 차단
      e.preventDefault();
    };

    const preventTouchScroll = (e: TouchEvent) => {
      if (e.touches.length === 0) return;

      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      lastTouchY = touchY;

      let el: HTMLElement | null = e.target as HTMLElement;

      while (el) {
        // html, body는 스크롤 가능 판정에서 제외
        if (el === document.body || el === document.documentElement) {
          break;
        }

        const style = getComputedStyle(el);
        const isScrollable =
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight;

        if (isScrollable) {
          const atTop = el.scrollTop === 0 && deltaY < 0;
          const atBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight && deltaY > 0;

          if (atTop || atBottom) {
            e.preventDefault();
          }
          return;
        }

        el = el.parentElement;
      }

      e.preventDefault();
    };

    const saveTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastTouchY = e.touches[0].clientY;
      }
    };

    document.addEventListener('wheel', preventWheelScroll, { passive: false });
    document.addEventListener('touchstart', saveTouchStart, { passive: true });
    document.addEventListener('touchmove', preventTouchScroll, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventWheelScroll);
      document.removeEventListener('touchstart', saveTouchStart);
      document.removeEventListener('touchmove', preventTouchScroll);
    };
  }, [isOpen]);
}
