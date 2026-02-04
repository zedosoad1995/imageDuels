import { useCallback, useEffect, useRef } from "react";

export function useReelsPaging({
  feedRef,
  itemRefs,
  count,
  onIndexChange,
}: {
  feedRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.RefObject<Array<HTMLDivElement | null>>;
  count: number;
  onIndexChange?: (i: number) => void;
}) {
  const indexRef = useRef(0);
  const lockRef = useRef(false);
  const accumRef = useRef(0);
  const lastWheelTsRef = useRef(0);

  function smoothScrollTo(el: HTMLElement, target: number, duration = 420) {
    const start = el.scrollTop;
    const delta = target - start;
    const startTime = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.scrollTop = start + delta * eased;
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const scrollToIndex = useCallback(
    (next: number) => {
      if (!lockRef.current) {
        window.setTimeout(() => (lockRef.current = false), 350);
      }

      lockRef.current = true;
      const i = Math.max(0, Math.min(next, count - 1));
      indexRef.current = i;
      onIndexChange?.(i);
      smoothScrollTo(feedRef.current!, i * window.innerHeight, 300);
    },
    [count, itemRefs, onIndexChange]
  );

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (lockRef.current) {
        e.preventDefault();
        return;
      }

      // Trackpads spam; accumulate + threshold to trigger exactly once.
      const now = Date.now();
      if (now - lastWheelTsRef.current > 250) accumRef.current = 0;
      lastWheelTsRef.current = now;

      accumRef.current += e.deltaY;

      const THRESH = 40; // tune: higher = harder to trigger
      if (Math.abs(accumRef.current) < THRESH) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const dir = accumRef.current > 0 ? 1 : 0;
      accumRef.current = 0;

      scrollToIndex(indexRef.current + dir);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (lockRef.current) {
        e.preventDefault();
        return;
      }

      // Space is page-down, Shift+Space is page-up
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        scrollToIndex(indexRef.current + 1);
      } else if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIndex(indexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIndex(indexRef.current);
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToIndex(indexRef.current);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToIndex(indexRef.current);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("wheel", onWheel as any);
      el.removeEventListener("keydown", onKeyDown as any);
    };
  }, [count, feedRef, scrollToIndex]);

  return {
    scrollToIndex,
    getIndex: () => indexRef.current,
    isLoading: () => lockRef.current,
  };
}
