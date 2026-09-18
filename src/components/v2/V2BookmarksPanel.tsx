import React from 'react';
import { Bookmark, MapPin, Trash2, ArrowUpRight, Plus, Sparkles, Navigation } from 'lucide-react';
import { BookmarkItem } from '../../types';

interface V2BookmarksPanelProps {
  bookmarks: BookmarkItem[];
  onSelectBookmark: (bookmark: BookmarkItem) => void;
  onRemoveBookmark: (id: string) => void;
  onFocusSearch: () => void;
  onQuickAddDefault?: (title: string, query: string, lat: number, lng: number) => void;
}

export const V2BookmarksPanel: React.FC<V2BookmarksPanelProps> = ({
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark,
  onFocusSearch,
  onQuickAddDefault,
}) => {
  return (
    <section aria-labelledby="saved-locations-heading" className="w-full">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Bookmark className="h-4 w-4 fill-amber-500" />
          </div>
          <h2 id="saved-locations-heading" className="text-base font-bold text-slate-900">
            Saved Locations &amp; Commute Feeds
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {bookmarks.length}
          </span>
        </div>

        {bookmarks.length > 0 && (
          <button
            type="button"
            onClick={onFocusSearch}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Actionable Empty State */}
      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 sm:p-8 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-500 flex items-center justify-center mb-3">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Bookmarked Locations Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-5">
            Save your frequent expressway corridors or checkpoint crossings for instant one-click traffic inspection on startup.
          </p>

          {/* Prominent CTA Button: Programmatically shifts focus to search bar */}
          <button
            id="v2-add-first-location-cta"
            type="button"
            onClick={onFocusSearch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add / Save Your First Location</span>
          </button>

          {/* Quick preset add for Usability Study acceleration */}
          {onQuickAddDefault && (
            <div className="mt-5 pt-5 border-t border-slate-100 w-full max-w-lg">
              <span className="text-xs text-slate-400 font-medium block mb-2.5">
                Or quick-save a common commuter route:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onQuickAddDefault(
                      'Woodlands Checkpoint',
                      'Woodlands Checkpoint',
                      1.4470237,
                      103.771654,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  + Woodlands Checkpoint
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onQuickAddDefault(
                      'Tuas Second Link',
                      'Tuas Second Link',
                      1.3496,
                      103.6366,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  + Tuas Second Link
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onQuickAddDefault(
                      'PIE Exit 3 (Bedok / Eunos)',
                      'PIE Exit 3',
                      1.3315,
                      103.918,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  + PIE Exit 3
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Saved Locations Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBookmark(b)}
              className="group bg-white rounded-xl border border-slate-200 hover:border-blue-300 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <Navigation className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{b.query}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(b.id);
                  }}
                  title="Remove bookmark"
                  className="text-slate-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Click to view traffic</span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  View feed <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
