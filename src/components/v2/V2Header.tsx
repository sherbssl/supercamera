import React from 'react';
import { Camera, RefreshCw, Bookmark } from 'lucide-react';
import { formatSingaporeDateTime } from '../../utils/dateFormatter';

interface V2HeaderProps {
  lastUpdated: string;
  isRefreshing: boolean;
  onManualRefresh: () => void;
  bookmarksCount: number;
  onOpenBookmarks?: () => void;
}

export const V2Header: React.FC<V2HeaderProps> = ({
  lastUpdated,
  isRefreshing,
  onManualRefresh,
  bookmarksCount,
  onOpenBookmarks,
}) => {
  // Format exact timestamp from last successful retrieval: "15:42:05" or full Singapore time
  const formattedTime = React.useMemo(() => {
    if (!lastUpdated) return 'Syncing...';
    try {
      const date = new Date(lastUpdated);
      if (isNaN(date.getTime())) return lastUpdated;
      return new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      return formatSingaporeDateTime(lastUpdated);
    }
  }, [lastUpdated]);

  return (
    <header className="border-b border-slate-200/90 bg-white sticky top-0 z-30 shadow-xs">
      {/* Static Header Status Banner */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-wide">
              Last updated from LTA DataMall: <span className="font-mono text-emerald-300 font-semibold">{formattedTime}</span>
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            Manual Refresh Protocol Active • No Auto-Polling
          </span>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  SG Super Road Cam
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  v2 Proximity &amp; Minimalist
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Singapore Expressway &amp; Checkpoint Surveillance with Proximity Search
              </p>
            </div>
          </div>

          {/* Action Buttons: Bookmarks & Manual Refresh Feed */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenBookmarks && (
              <button
                id="header-saved-locations-btn"
                type="button"
                onClick={onOpenBookmarks}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                title="View saved locations"
              >
                <Bookmark className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                <span className="hidden sm:inline">Saved</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[11px] font-mono font-semibold">
                  {bookmarksCount}
                </span>
              </button>
            )}

            {/* Explicit Manual Refresh Control */}
            <button
              id="v2-manual-refresh-feed-button"
              type="button"
              onClick={onManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs sm:text-sm shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
