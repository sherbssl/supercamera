/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CameraCard } from './components/CameraCard';
import { ImageModal } from './components/ImageModal';
import { EmptyState } from './components/EmptyState';
import { fetchTrafficCameras, FetchResult } from './services/trafficApi';
import { EnrichedCamera, FilterCategory, SortOption } from './types';
import {
  MapPin,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Car,
} from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 60;

export default function App() {
  const [cameras, setCameras] = useState<EnrichedCamera[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [fetchSource, setFetchSource] = useState<'live-direct' | 'live-proxy' | 'fallback'>('live-proxy');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('timestamp');

  // Auto-refresh timer state
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL_SECONDS);

  // Modal inspection
  const [selectedCamera, setSelectedCamera] = useState<EnrichedCamera | null>(null);

  // Load traffic cameras
  const loadCameras = useCallback(async (isManual = false) => {
    if (isManual) setIsLoading(true);

    try {
      const res: FetchResult = await fetchTrafficCameras();
      setCameras(res.cameras);
      setLastUpdated(res.timestamp);
      setFetchSource(res.source);
      if (res.error) {
        setErrorNotice(res.error);
      } else {
        setErrorNotice(null);
      }
    } catch (err) {
      console.error('Failed to load traffic cameras:', err);
    } finally {
      setIsLoading(false);
      setCountdown(REFRESH_INTERVAL_SECONDS);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  // Periodic auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadCameras();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, loadCameras]);

  // Filter and sort cameras
  const filteredCameras = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = cameras.filter((cam) => {
      // If category is specific (and not just matching search text)
      if (activeCategory === 'woodlands' && !cam.id.startsWith('27') && !cam.name.toLowerCase().includes('woodlands')) {
        return false;
      }
      if (activeCategory === 'tuas' && !cam.id.startsWith('47') && !cam.name.toLowerCase().includes('tuas')) {
        return false;
      }
      if (activeCategory === 'pie' && !cam.road.toLowerCase().includes('pie') && !cam.name.toLowerCase().includes('pie')) {
        return false;
      }
      if (activeCategory === 'bke' && !cam.road.toLowerCase().includes('bke') && !cam.name.toLowerCase().includes('bke')) {
        return false;
      }
      if (activeCategory === 'cte' && !cam.road.toLowerCase().includes('cte') && !cam.name.toLowerCase().includes('cte')) {
        return false;
      }
      if (activeCategory === 'aye' && !cam.road.toLowerCase().includes('aye') && !cam.name.toLowerCase().includes('aye')) {
        return false;
      }

      // If text query entered, search across name, road, area, id, and direction
      if (q) {
        const matchesName = cam.name.toLowerCase().includes(q);
        const matchesRoad = cam.road.toLowerCase().includes(q);
        const matchesArea = cam.area.toLowerCase().includes(q);
        const matchesId = cam.id.includes(q);
        const matchesDirection = cam.direction?.toLowerCase().includes(q) || false;
        return matchesName || matchesRoad || matchesArea || matchesId || matchesDirection;
      }

      return true;
    });

    // Sort list
    return list.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'id') {
        return parseInt(a.id, 10) - parseInt(b.id, 10);
      }
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return 0;
    });
  }, [cameras, searchQuery, activeCategory, sortBy]);

  // Checkpoint quick stats for woodlands and tuas
  const woodlandsCamerasCount = useMemo(() => {
    return cameras.filter(
      (c) => c.id.startsWith('27') || c.name.toLowerCase().includes('woodlands'),
    ).length;
  }, [cameras]);

  const tuasCamerasCount = useMemo(() => {
    return cameras.filter(
      (c) => c.id.startsWith('47') || c.name.toLowerCase().includes('tuas'),
    ).length;
  }, [cameras]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation Header */}
      <Header
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={() => loadCameras(true)}
        source={fetchSource}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        countdown={countdown}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Checkpoint Quick Focus Cards (Woodlands & Tuas) */}
        <section aria-label="Checkpoint Focus" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Woodlands Causeway Focus Card */}
            <div
              id="woodlands-focus-card"
              onClick={() => {
                setActiveCategory('woodlands');
                setSearchQuery('woodlands');
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                activeCategory === 'woodlands' || searchQuery.toLowerCase() === 'woodlands'
                  ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                      Woodlands Checkpoint
                    </h2>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-blue-100 text-blue-800">
                      Causeway
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live camera views towards Johor Bahru &amp; BKE ({woodlandsCamerasCount} feeds)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-blue-600 shrink-0">
                <span className="hidden sm:inline">View Feeds</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Tuas Second Link Focus Card */}
            <div
              id="tuas-focus-card"
              onClick={() => {
                setActiveCategory('tuas');
                setSearchQuery('tuas');
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                activeCategory === 'tuas' || searchQuery.toLowerCase() === 'tuas'
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                      Tuas Checkpoint
                    </h2>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-emerald-100 text-emerald-800">
                      Second Link
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live camera views at Sultan Abu Bakar &amp; AYE ({tuasCamerasCount} feeds)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0">
                <span className="hidden sm:inline">View Feeds</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Component */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          totalCount={cameras.length}
          filteredCount={filteredCameras.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Notice banner if source is fallback/pre-connection */}
        {errorNotice && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Demo / Preview Mode: </span>
              <span>{errorNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => loadCameras(true)}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
            >
              Retry Live
            </button>
          </div>
        )}

        {/* Camera Feeds Responsive Grid */}
        {filteredCameras.length > 0 ? (
          <div
            id="camera-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            {filteredCameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onOpenModal={(cam) => setSelectedCamera(cam)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <EmptyState
            searchQuery={searchQuery}
            onClear={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            onSelectSuggestion={(s) => {
              setSearchQuery(s);
              setActiveCategory('all');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Data provided by{' '}
            <a
              href="https://data.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-700 hover:underline"
            >
              data.gov.sg
            </a>{' '}
            &amp; Singapore Land Transport Authority (LTA).
          </div>
          <div className="flex items-center gap-3">
            <span>Serverless APIs:</span>
            <a
              href="/api/trafficimages"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono transition-colors"
            >
              /api/trafficimages
            </a>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono transition-colors"
            >
              /api/health
            </a>
          </div>
        </div>
      </footer>

      {/* High-Resolution Inspection Modal */}
      <ImageModal
        camera={selectedCamera}
        onClose={() => setSelectedCamera(null)}
      />
    </div>
  );
}
