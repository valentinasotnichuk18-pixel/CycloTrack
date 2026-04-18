import { useEffect, useRef, useState } from 'react';

/**
 * Native-style pull-to-refresh hook.
 * @param {Function} onRefresh - async function to call when pull is triggered
 * @param {number} threshold - pixels to pull before triggering (default 70)
 */
export default function usePullToRefresh(onRefresh, threshold = 70) {
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current || window;

    const onTouchStart = (e) => {
      const scrollTop = containerRef.current
        ? containerRef.current.scrollTop
        : window.scrollY;
      if (scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        setPulling(true);
        setPullY(Math.min(dy * 0.45, threshold + 20));
      }
    };

    const onTouchEnd = async () => {
      if (pullY >= threshold && !refreshing) {
        setRefreshing(true);
        setPullY(threshold * 0.6);
        await onRefresh();
        setRefreshing(false);
      }
      setPulling(false);
      setPullY(0);
      startY.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, pullY, refreshing, threshold]);

  return { pulling, pullY, refreshing, containerRef };
} 
