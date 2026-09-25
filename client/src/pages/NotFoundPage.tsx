import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-3xl flex items-center justify-center mx-auto text-indigo-400">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
      <p className="text-slate-400 text-sm">
        The page you are looking for might have been removed or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
      >
        <Home className="w-4 h-4" /> Back to Home Feed
      </Link>
    </div>
  );
};
