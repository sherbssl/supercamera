import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Compass,
  Navigation,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import { FilterCategory, SortOption } from '../../types';

interface ExpresswaySuggestion {
  id: string;
  name: string;
  query: string;
  category: FilterCategory;
  type: 'checkpoint' | 'expressway' | 'location';
  subtitle: string;
}

const EXPRESSWAY_PRESETS: ExpresswaySuggestion[] = [
  {
    id: 'woodlands',
    name: 'Woodlands Checkpoint & Causeway',
    query: 'woodlands',
    category: 'woodlands',
    type: 'checkpoint',
    subtitle: 'Cross-border Causeway cameras towards Johor Bahru',
  },
  {
    id: 'tuas',
    name: 'Tuas Checkpoint & Second Link',
    query: 'tuas',
    category: 'tuas',
    type: 'checkpoint',
    subtitle: 'Tuas Complex, Departure, & Sultan Abu Bakar feeds',
  },
  {
    id: 'bke',
    name: 'BKE (Bukit Timah Expressway)',
    query: 'bke',
    category: 'bke',
    type: 'expressway',
    subtitle: 'Chantek Flyover, Dairy Farm, Mandai, Exit 9',
  },
  {
    id: 'changi',
    name: 'Changi Airport & Corridors',
    query: 'changi',
    category: 'changi',
    type: 'location',
    subtitle: 'PIE & ECP eastern approaches towards Changi',
  },
  {
    id: 'pie',
    name: 'PIE (Pan Island Expressway)',
    query: 'pie',
    category: 'pie',
    type: 'expressway',
    subtitle: 'Jalan Anak Bukit, Adam Road, Eunos, Bedok North',
  },
  {
    id: 'cte',
    name: 'CTE (Central Expressway)',
    query: 'cte',
    category: 'cte',
    type: 'expressway',
    subtitle: 'Ang Mo Kio Ave 1 & 5, Braddell Rd, Moulmein Rd',
  },
  {
    id: 'aye',
    name: 'AYE (Ayer Rajah Expressway)',
    query: 'aye',
    category: 'aye',
    type: 'expressway',
    subtitle: 'Alexandra Road, Keppel Road, Clementi Road, Tuas Road',
  },
  {
    id: 'kpe',
    name: 'KPE (Kallang-Paya Lebar Expressway)',
    query: 'kpe',
    category: 'all',
    type: 'expressway',
    subtitle: 'Tunnel & Viaduct traffic corridors',
  },
  {
    id: 'ecp',
    name: 'ECP (East Coast Parkway)',
    query: 'ecp',
    category: 'all',
    type: 'expressway',
    subtitle: 'Coastal expressway connecting Marina Bay & Changi',
  },
  {
    id: 'sle',
    name: 'SLE (Seletar Expressway)',
    query: 'sle',
    category: 'all',
    type: 'expressway',
    subtitle: 'Northern artery connecting BKE and CTE/TPE',
  },
  {
    id: 'tpe',
    name: 'TPE (Tampines Expressway)',
    query: 'tpe',
    category: 'all',
    type: 'expressway',
    subtitle: 'Northeast connector between SLE and Changi',
  },
];

interface V2SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  totalCount: number;
  filteredCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const V2SearchBar: React.FC<V2SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  totalCount,
  filteredCount,
  sortBy,
  onSortChange,
  inputRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const actualInputRef = inputRef || internalInputRef;

  // Keyboard shortcut '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        actualInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actualInputRef]);

  // Filter autocomplete suggestions based on what user has typed
  const suggestions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return EXPRESSWAY_PRESETS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.query.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        actualInputRef.current &&
        !actualInputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actualInputRef]);

  const handleSelectSuggestion = (item: ExpresswaySuggestion) => {
    onSearchChange(item.query);
    onCategoryChange(item.category);
    setIsOpen(false);
  };

  const handleSelectCategory = (cat: FilterCategory) => {
    onCategoryChange(cat);
    if (cat === 'all') {
      onSearchChange('');
    } else {
      onSearchChange(cat);
    }
  };

  const handleClear = () => {
    onSearchChange('');
    onCategoryChange('all');
    actualInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const categories: Array<{ id: FilterCategory; label: string }> = [
    { id: 'all', label: 'All Cameras' },
    { id: 'woodlands', label: 'Woodlands Checkpoint' },
    { id: 'tuas', label: 'Tuas Checkpoint' },
    { id: 'bke', label: 'BKE' },
    { id: 'pie', label: 'PIE' },
    { id: 'cte', label: 'CTE' },
    { id: 'aye', label: 'AYE' },
    { id: 'changi', label: 'Changi' },
  ];

  return (
    <div className="w-full relative">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>

          <input
            id="v2-camera-search-input"
            ref={actualInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              onSearchChange(val);
              setIsOpen(Boolean(val.trim()));
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search expressway or checkpoint (e.g. Woodlands, Tuas, PIE, BKE, Changi)..."
            className="w-full pl-11 sm:pl-12 pr-16 sm:pr-20 py-3 sm:py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition-all"
            autoComplete="off"
            spellCheck={false}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                id="v2-search-clear-button"
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Auto-suggest Dropdown Menu for Expressways & Checkpoints */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-40 divide-y divide-slate-100 max-h-80 overflow-y-auto"
        >
          <div className="px-3.5 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Expressway &amp; Checkpoint Matches</span>
            <span>Press Enter to select</span>
          </div>

          {suggestions.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleSelectSuggestion(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                selectedIndex === index
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  item.type === 'checkpoint'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : item.type === 'expressway'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-purple-50 text-purple-600 border border-purple-200'
                }`}
              >
                {item.type === 'checkpoint' ? (
                  <Compass className="h-4 w-4" />
                ) : item.type === 'expressway' ? (
                  <Navigation className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-bold text-slate-900">{item.name}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      item.type === 'checkpoint'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.type === 'expressway'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Category Filter Chips & Sort Controls */}
      <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected =
              activeCategory === cat.id ||
              (cat.id !== 'all' && searchQuery.toLowerCase() === cat.id);
            return (
              <button
                key={cat.id}
                id={`v2-category-${cat.id}`}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort & Counter Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 shrink-0">
          <span className="font-medium">
            Showing <strong className="text-slate-900">{filteredCount}</strong> of{' '}
            <span className="text-slate-700">{totalCount}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <label htmlFor="v2-sort-select" className="sr-only">
              Sort cameras
            </label>
            <select
              id="v2-sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="name">Location Name</option>
              <option value="id">Camera ID</option>
              <option value="timestamp">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
