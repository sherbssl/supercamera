import React, { useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { FilterCategory, SortOption } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  activeCategory: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  totalCount: number;
  filteredCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const QUICK_FILTERS: Array<{ id: FilterCategory; label: string; query: string }> = [
  { id: 'all', label: 'All Cameras', query: '' },
  { id: 'woodlands', label: 'Woodlands Checkpoint', query: 'woodlands' },
  { id: 'tuas', label: 'Tuas Checkpoint', query: 'tuas' },
  { id: 'pie', label: 'PIE', query: 'pie' },
  { id: 'bke', label: 'BKE', query: 'bke' },
  { id: 'cte', label: 'CTE', query: 'cte' },
  { id: 'aye', label: 'AYE', query: 'aye' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  totalCount,
  filteredCount,
  sortBy,
  onSortChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global '/' shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    onSearchChange('');
    onSelectCategory('all');
    inputRef.current?.focus();
  };

  const handleChipClick = (filter: (typeof QUICK_FILTERS)[0]) => {
    onSelectCategory(filter.id);
    if (filter.id === 'all') {
      onSearchChange('');
    } else {
      onSearchChange(filter.query);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>

          <input
            id="camera-search-input"
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              // reset category to custom if user types
              if (activeCategory !== 'all') {
                onSelectCategory('all');
              }
            }}
            placeholder="Search location or road (e.g., Woodlands, Tuas, PIE, BKE, 2701)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />

          {searchQuery && (
            <button
              id="clear-search-button"
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {!searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-3 hidden sm:flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <label htmlFor="sort-select" className="sr-only">
              Sort by
            </label>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden md:inline text-slate-400">Sort:</span>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent border-0 text-slate-800 text-xs font-medium focus:ring-0 cursor-pointer pr-1"
              >
                <option value="name">Location Name</option>
                <option value="id">Camera ID</option>
                <option value="timestamp">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filter Tags & Counts */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 font-medium shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Quick filters:
          </span>
          {QUICK_FILTERS.map((filter) => {
            const isSelected =
              activeCategory === filter.id ||
              (filter.id !== 'all' && searchQuery.toLowerCase().includes(filter.query));

            return (
              <button
                key={filter.id}
                id={`filter-chip-${filter.id}`}
                type="button"
                onClick={() => handleChipClick(filter)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-500 shrink-0 font-medium self-end md:self-center">
          Showing <span className="font-semibold text-slate-800">{filteredCount}</span> of{' '}
          <span className="text-slate-600">{totalCount}</span> cameras
        </div>
      </div>
    </div>
  );
};
