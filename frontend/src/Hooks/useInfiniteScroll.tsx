import { useEffect, useRef } from "react";

type Options = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  root?: Element | null;
  rootMargin?: string; // e.g. "600px" to prefetch before reaching bottom
  threshold?: number;
};

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  root = null,
  rootMargin = "600px",
  threshold = 0,
}: Options) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    // don’t observe if you can’t/shouldn’t load
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) onLoadMore();
      },
      { root, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, root, rootMargin, threshold]);

  return sentinelRef;
}
