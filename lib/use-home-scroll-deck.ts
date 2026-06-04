'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export function useScrollSlides(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const root = containerRef.current;
    if (!root) return;

    const slides = root.querySelectorAll<HTMLElement>('[data-slide]');
    if (!slides.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.slide);
          if (Number.isNaN(idx)) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = idx;
          }
        }
        if (bestIdx >= 0) setActive(bestIdx);
      },
      { root, threshold: [0.4, 0.55, 0.7] },
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [containerRef, enabled]);

  const scrollTo = useCallback(
    (index: number) => {
      const root = containerRef.current;
      if (!root) return;
      root.querySelector<HTMLElement>(`[data-slide="${index}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
    [containerRef],
  );

  return { active, scrollTo };
}

/** 마지막 슬라이드에서 아래로 넘기면 첫 슬라이드로 (홈 온보딩과 동일) */
export function useScrollDeckLoop(
  deckRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  active: number,
  slideCount: number,
  scrollTo: (index: number) => void,
) {
  const lastSlideIndex = slideCount - 1;
  const loopLockRef = useRef(false);

  useEffect(() => {
    const deck = deckRef.current;
    if (!enabled || !deck || slideCount < 2) return;

    const goToStart = () => {
      if (loopLockRef.current) return;
      loopLockRef.current = true;
      scrollTo(0);
      window.setTimeout(() => {
        loopLockRef.current = false;
      }, 700);
    };

    const onWheel = (e: WheelEvent) => {
      if (active !== lastSlideIndex) return;
      if (e.deltaY <= 8) return;
      e.preventDefault();
      goToStart();
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (active !== lastSlideIndex) return;
      const endY = e.changedTouches[0]?.clientY ?? 0;
      if (touchStartY - endY > 48) goToStart();
    };

    deck.addEventListener('wheel', onWheel, { passive: false });
    deck.addEventListener('touchstart', onTouchStart, { passive: true });
    deck.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      deck.removeEventListener('wheel', onWheel);
      deck.removeEventListener('touchstart', onTouchStart);
      deck.removeEventListener('touchend', onTouchEnd);
    };
  }, [active, deckRef, enabled, lastSlideIndex, scrollTo, slideCount]);
}
