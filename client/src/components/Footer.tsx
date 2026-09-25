import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">DevPulse Blog Platform</span>
          <span className="text-slate-600">|</span>
          <span>Full-Stack Monorepo Submission</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> React 19, TypeScript, Express & MongoDB
        </div>
      </div>
    </footer>
  );
};
