import React from 'react';

export const SkeletonFeed: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className="glass-panel rounded-2xl p-5 border border-slate-800/80 animate-pulse flex flex-col justify-between h-80"
        >
          <div>
            <div className="h-40 bg-slate-800/80 rounded-xl mb-4 w-full"></div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-800"></div>
              <div className="h-3 bg-slate-800 rounded w-24"></div>
            </div>
            <div className="h-5 bg-slate-800 rounded w-4/5 mb-2"></div>
            <div className="h-3 bg-slate-800/60 rounded w-full mb-1"></div>
            <div className="h-3 bg-slate-800/60 rounded w-3/4"></div>
          </div>
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/50">
            <div className="h-6 w-14 bg-slate-800 rounded-full"></div>
            <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
