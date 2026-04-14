"use client";

import { useEffect, useRef } from "react";

export const useInfiniteScroll = (
  onReachEnd: () => void,
  enabled: boolean,
  rootMargin = "200px",
) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentTarget = anchorRef.current;
    if (!currentTarget) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          onReachEnd();
        }
      },
      { rootMargin },
    );

    observer.observe(currentTarget);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onReachEnd, rootMargin]);

  return anchorRef;
};
