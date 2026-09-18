import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  onClear: () => void;
  onSelectSuggestion: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  onClear,
  onSelectSuggestion,
}) => {
  const suggestions = ['Woodlands', 'Tuas', 'PIE', 'BKE', 'CTE', '2701', '4703'];

  return (
    <div
      id="empty-search-state"
      className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs"
    >
      <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <SearchX className="h-7 w-7" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
        No traffic cameras found
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
        We couldn&apos;t find any camera feeds matching{' '}
        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
          &quot;{searchQuery}&quot;
        </span>
        . Try checking for typos or explore popular checkpoints and expressways.
      </p>

      {/* Suggested Search Terms */}
      <div className="mb-6">
        <span className="text-xs text-slate-400 block mb-2 font-medium">Suggested queries:</span>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSelectSuggestion(s)}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        id="clear-filter-btn"
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-xs"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Clear Search & View All</span>
      </button>
    </div>
  );
};
