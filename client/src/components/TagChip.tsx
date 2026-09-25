import React from 'react';

interface TagChipProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}

export const TagChip: React.FC<TagChipProps> = ({ tag, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-full transition-all border ${
        active
          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/30'
          : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700 hover:text-white'
      }`}
    >
      #{tag}
    </button>
  );
};
