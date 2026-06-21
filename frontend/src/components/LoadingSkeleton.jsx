import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  const skeletonItem = (key) => {
    if (type === 'card') {
      return (
        <div key={key} className="nexus-glass rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 rounded-full bg-surface-light animate-shimmer" />
            <div className="w-9 h-9 rounded-xl bg-surface-light animate-shimmer" />
          </div>
          <div className="h-8 w-32 rounded-lg bg-surface-light animate-shimmer" />
          <div className="h-3 w-40 rounded-full bg-surface-light animate-shimmer" />
          <div className="h-1.5 w-full rounded-full bg-surface-light animate-shimmer" />
        </div>
      );
    }

    if (type === 'row') {
      return (
        <div key={key} className="flex items-center gap-4 py-4 px-5 border-b border-border-light/50">
          <div className="w-10 h-10 rounded-xl bg-surface-light animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-48 rounded-full bg-surface-light animate-shimmer" />
            <div className="h-2.5 w-32 rounded-full bg-surface-light animate-shimmer" />
          </div>
          <div className="h-3 w-16 rounded-full bg-surface-light animate-shimmer" />
        </div>
      );
    }

    if (type === 'detail') {
      return (
        <div key={key} className="space-y-6">
          <div className="h-48 rounded-2xl bg-surface-light animate-shimmer" />
          <div className="space-y-3">
            <div className="h-6 w-64 rounded-lg bg-surface-light animate-shimmer" />
            <div className="h-3 w-96 rounded-full bg-surface-light animate-shimmer" />
            <div className="h-3 w-80 rounded-full bg-surface-light animate-shimmer" />
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="h-20 rounded-2xl bg-surface-light animate-shimmer" />
    );
  };

  return (
    <div className={`${type === 'card' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'space-y-1'}`}>
      {Array.from({ length: count }).map((_, i) => skeletonItem(i))}
    </div>
  );
};

export default LoadingSkeleton;
