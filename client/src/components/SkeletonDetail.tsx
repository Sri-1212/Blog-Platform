import React from 'react';

export const SkeletonDetail: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-8 bg-slate-800 rounded-lg w-3/4 mb-4"></div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-slate-800"></div>
        <div className="space-y-1">
          <div className="h-4 bg-slate-800 rounded w-32"></div>
          <div className="h-3 bg-slate-800/60 rounded w-24"></div>
        </div>
      </div>
      <div className="h-64 sm:h-96 bg-slate-800 rounded-2xl w-full"></div>
      <div className="space-y-3 pt-4">
        <div className="h-4 bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-800 rounded w-11/12"></div>
        <div className="h-4 bg-slate-800 rounded w-4/5"></div>
        <div className="h-4 bg-slate-800 rounded w-full"></div>
      </div>
    </div>
  );
};
