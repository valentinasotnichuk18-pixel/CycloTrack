import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefreshIndicator({ pullY, refreshing, threshold = 70 }) {
  const progress = Math.min(pullY / threshold, 1);
  const triggered = pullY >= threshold || refreshing;

  if (pullY <= 2 && !refreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ transform: `translateY(${pullY - 40}px)`, transition: refreshing ? 'transform 0.2s ease' : 'none' }}
    >
      <div className="w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center">
        <RefreshCw
          className="w-4 h-4 text-primary"
          style={{
            transform: `rotate(${progress * 360}deg)`,
            transition: refreshing ? 'none' : 'transform 0.05s linear',
            animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
          }}
        />
      </div>
    </div>
  );
}
