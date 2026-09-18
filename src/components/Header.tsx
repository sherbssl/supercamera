import React from 'react';
import { RefreshCw, Video, Radio, Clock, ShieldCheck } from 'lucide-react';
import { formatSingaporeDateTime } from '../utils/dateFormatter';

interface HeaderProps {
  lastUpdated: string;
  isLoading: boolean;
  onRefresh: () => void;
  source: 'live-direct' | 'live-proxy' | 'fallback';
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  countdown: number;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  isLoading,
  onRefresh,
  source,
  autoRefresh,
  onToggleAutoRefresh,
  countdown,
}) => {
  const isLive = source === 'live-direct' || source === 'live-proxy';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Video className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  Singapore Traffic Cameras
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isLive ? 'Live Feed' : 'Preview Feed'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Land Transport Authority (LTA) Live Checkpoint & Expressway Surveillance
              </p>
            </div>
          </div>

          {/* Controls & Status */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
            {/* Last updated timestamp badge */}
            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="hidden md:inline text-slate-400">Updated:</span>
              <span className="font-medium text-slate-700 font-mono text-[11px] sm:text-xs">
                {lastUpdated ? formatSingaporeDateTime(lastUpdated) : 'Syncing...'}
              </span>
            </div>

            {/* Auto refresh button toggle */}
            <button
              id="auto-refresh-toggle"
              type="button"
              onClick={onToggleAutoRefresh}
              title={autoRefresh ? 'Click to pause auto-refresh' : 'Click to enable auto-refresh'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${autoRefresh ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Auto-update</span>
              <span className="font-mono text-[11px]">{autoRefresh ? `${countdown}s` : 'Off'}</span>
            </button>

            {/* Manual refresh button */}
            <button
              id="refresh-feed-button"
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
