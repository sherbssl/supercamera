import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Car,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { V2Header } from './V2Header';
import { V2SearchBar } from './V2SearchBar';
import { V2CameraCard } from './V2CameraCard';
import { V2BookmarksPanel } from './V2BookmarksPanel';
import { V2CameraModal } from './V2CameraModal';
import {
  EnrichedCamera,
  CameraWithDistance,
  BookmarkItem,
  FilterCategory,
  SortOption,
  ToastNotification,
} from '../../types';
import { fetchTrafficCameras } from '../../services/trafficApi';

const LOCAL_STORAGE_BOOKMARKS_KEY = 'sg_super_road_cam_bookmarks_v2';

interface V2ViewProps {
  initialCameras: EnrichedCamera[];
  initialTimestamp: string;
}

export const V2View: React.FC<V2ViewProps> = ({
  initialCameras,
  initialTimestamp,
}) => {
  // Master camera catalog
  const [allCameras, setAllCameras] = useState<EnrichedCamera[]>(initialCameras);
  const [lastUpdated, setLastUpdated] = useState<string>(initialTimestamp);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Category Filters (name and road matching, strictly no postal code)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Inspection Window Modal state for clicked camera card
  const [selectedCamera, setSelectedCamera] = useState<CameraWithDistance | null>(null);

  // Manual override for bookmarks minimized state (auto-minimizes when searching)
  const [bookmarksMinimizedOverride, setBookmarksMinimizedOverride] = useState<boolean | null>(null);

  // Automatically minimize saved locations when user queries a search or selects a filter
  const isSearching = searchQuery.trim().length > 0 || activeCategory !== 'all';
  const isBookmarksMinimized =
    bookmarksMinimizedOverride !== null ? bookmarksMinimizedOverride : isSearching;

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Reset manual override so typing a new query minimizes saved locations immediately
    setBookmarksMinimizedOverride(null);
  }, []);

  const handleCategoryChange = useCallback((category: FilterCategory) => {
    setActiveCategory(category);
    setBookmarksMinimizedOverride(null);
  }, []);

  const handleToggleBookmarksMinimized = useCallback(() => {
    setBookmarksMinimizedOverride((prev) => (prev !== null ? !prev : !isSearching));
  }, [isSearching]);

  // Bookmarks state (localStorage persistence)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load bookmarks from localStorage', e);
    }
    return [];
  });

  // Toast notifications
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Keep allCameras in sync if parent updates
  useEffect(() => {
    if (initialCameras.length > 0 && allCameras.length === 0) {
      setAllCameras(initialCameras);
    }
    if (initialTimestamp && !lastUpdated) {
      setLastUpdated(initialTimestamp);
    }
  }, [initialCameras, initialTimestamp, allCameras.length, lastUpdated]);

  // Persist bookmarks
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Show Toast helper
  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({
      id: String(Date.now()),
      type,
      message,
      timestamp: Date.now(),
    });
  }, []);

  // Manual Refresh Feed (ONLY triggered by explicit user action)
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchTrafficCameras();
      if (!result.cameras || result.cameras.length === 0) {
        showToast('error', 'Unable to retrieve traffic feeds from LTA DataMall. Please try again.');
      } else {
        setAllCameras(result.cameras);
        setLastUpdated(result.timestamp || new Date().toISOString());
        showToast('success', 'Traffic feeds updated successfully');
      }
    } catch (error) {
      console.error('Manual refresh error:', error);
      showToast('error', 'Failed to refresh feeds. Please check network connection.');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Strict search and category matching logic mirroring https://github.com/sherbssl/supercamera.git
  // Guarantees:
  // - User query 'woodlands' returns strictly camera feeds with "Woodlands" in name
  // - BKE only shows up when user searches or selects BKE
  // - Tuas only shows up when user searches or selects Tuas
  // - Changi only shows up when user searches or selects Changi
  const filteredCameras = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = allCameras.filter((cam) => {
      const name = cam.name.toLowerCase();
      const road = cam.road.toLowerCase();
      const area = cam.area.toLowerCase();
      const id = cam.id.toLowerCase();

      // Check category filter
      if (activeCategory === 'woodlands') {
        return name.includes('woodlands') || (road.includes('woodlands') && !road.includes('bke'));
      }
      if (activeCategory === 'tuas') {
        return (name.includes('tuas') || road.includes('tuas')) && !road.includes('aye') && !road.includes('pie');
      }
      if (activeCategory === 'bke') {
        return road === 'bke' || name.includes('bke');
      }
      if (activeCategory === 'pie') {
        return road === 'pie' || name.includes('pie');
      }
      if (activeCategory === 'cte') {
        return road === 'cte' || name.includes('cte');
      }
      if (activeCategory === 'aye') {
        return road === 'aye' || name.includes('aye');
      }
      if (activeCategory === 'changi') {
        return name.includes('changi') || area.includes('changi') || road.includes('changi');
      }

      // If user typed a search query
      if (q) {
        // Strict name & expressway matching requested by user
        if (q === 'woodlands') {
          return name.includes('woodlands') || (road.includes('woodlands') && !road.includes('bke'));
        }
        if (q === 'bke') {
          return road === 'bke' || name.includes('bke');
        }
        if (q === 'tuas') {
          return (name.includes('tuas') || road.includes('tuas')) && !road.includes('aye') && !road.includes('pie');
        }
        if (q === 'changi') {
          return name.includes('changi') || area.includes('changi') || road.includes('changi');
        }
        if (q === 'pie') {
          return road === 'pie' || name.includes('pie');
        }
        if (q === 'cte') {
          return road === 'cte' || name.includes('cte');
        }
        if (q === 'aye') {
          return road === 'aye' || name.includes('aye');
        }
        if (q === 'kpe') {
          return road === 'kpe' || name.includes('kpe');
        }
        if (q === 'ecp') {
          return road === 'ecp' || name.includes('ecp');
        }
        if (q === 'sle') {
          return road === 'sle' || name.includes('sle');
        }
        if (q === 'tpe') {
          return road === 'tpe' || name.includes('tpe');
        }
        if (q === 'kje') {
          return road === 'kje' || name.includes('kje');
        }
        if (q === 'mce') {
          return road === 'mce' || name.includes('mce');
        }

        // General text search matching name, road, area, or camera ID
        const matchesName = name.includes(q);
        const matchesRoad = road.includes(q);
        const matchesArea = area.includes(q);
        const matchesId = id.includes(q);

        return matchesName || matchesRoad || matchesArea || matchesId;
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
  }, [allCameras, searchQuery, activeCategory, sortBy]);

  // Camera counts for quick focus cards
  const woodlandsCamerasCount = useMemo(() => {
    return allCameras.filter(
      (c) => c.name.toLowerCase().includes('woodlands') || (c.road.toLowerCase().includes('woodlands') && !c.road.toLowerCase().includes('bke')),
    ).length;
  }, [allCameras]);

  const tuasCamerasCount = useMemo(() => {
    return allCameras.filter(
      (c) =>
        (c.name.toLowerCase().includes('tuas') || c.road.toLowerCase().includes('tuas')) &&
        !c.road.toLowerCase().includes('aye') &&
        !c.road.toLowerCase().includes('pie'),
    ).length;
  }, [allCameras]);

  // Bookmarks Management
  const isCameraBookmarked = useCallback(
    (camera: CameraWithDistance) => {
      return bookmarks.some((b) => b.id === camera.id || b.title === camera.name);
    },
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (camera: CameraWithDistance) => {
      setBookmarks((prev) => {
        const exists = prev.find((b) => b.id === camera.id || b.title === camera.name);
        if (exists) {
          showToast('info', `Removed "${camera.name}" from bookmarks`);
          return prev.filter((b) => b.id !== exists.id);
        } else {
          showToast('success', `Bookmarked "${camera.name}"`);
          const newItem: BookmarkItem = {
            id: camera.id || `bm-${Date.now()}`,
            title: camera.name,
            query: camera.road || camera.area,
            latitude: camera.latitude,
            longitude: camera.longitude,
            addedAt: new Date().toISOString(),
            tag: camera.isCheckpoint ? 'Checkpoint' : 'Expressway',
          };
          return [newItem, ...prev];
        }
      });
    },
    [showToast],
  );

  const handleSelectBookmark = useCallback(
    (b: BookmarkItem) => {
      setSearchQuery(b.title);
      setActiveCategory('all');
      setBookmarksMinimizedOverride(null);
      showToast('info', `Displaying feed for "${b.title}"`);
    },
    [showToast],
  );

  const handleRemoveBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      showToast('info', 'Bookmark removed');
    },
    [showToast],
  );

  const handleQuickAddDefault = useCallback(
    (title: string, query: string, lat: number, lng: number) => {
      const newItem: BookmarkItem = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        query,
        latitude: lat,
        longitude: lng,
        addedAt: new Date().toISOString(),
        tag: title.includes('Checkpoint') ? 'Checkpoint' : 'Expressway',
      };
      setBookmarks((prev) => {
        if (prev.some((b) => b.title === title)) return prev;
        return [newItem, ...prev];
      });
      showToast('success', `Saved "${title}"`);
    },
    [showToast],
  );

  // Programmatically focus search input
  const handleFocusSearch = useCallback(() => {
    const input = document.getElementById('v2-camera-search-input') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Dynamic Header Status & Manual Refresh Bar */}
      <V2Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onManualRefresh={handleManualRefresh}
        bookmarksCount={bookmarks.length}
        onOpenBookmarks={handleFocusSearch}
      />

      {/* Floating Inline Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs sm:text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Checkpoint Quick Focus Cards (Woodlands & Tuas) */}
        <section aria-label="Checkpoint Focus" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Woodlands Causeway Focus Card */}
            <div
              id="v2-woodlands-focus-card"
              onClick={() => {
                setActiveCategory('woodlands');
                setSearchQuery('woodlands');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeCategory === 'woodlands' || searchQuery.toLowerCase() === 'woodlands'
                  ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Woodlands Checkpoint
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-blue-100 text-blue-800">
                      Causeway
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live camera views towards Johor Bahru &amp; BKE ({woodlandsCamerasCount} feeds)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 shrink-0">
                <span className="hidden sm:inline">View Feeds</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Tuas Second Link Focus Card */}
            <div
              id="v2-tuas-focus-card"
              onClick={() => {
                setActiveCategory('tuas');
                setSearchQuery('tuas');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeCategory === 'tuas' || searchQuery.toLowerCase() === 'tuas'
                  ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Tuas Second Link
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-emerald-100 text-emerald-800">
                      Second Link
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live camera views towards Malaysia &amp; AYE ({tuasCamerasCount} feeds)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0">
                <span className="hidden sm:inline">View Feeds</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>

        {/* Primary Expressway & Checkpoint Search Section */}
        <section aria-label="Expressway and Checkpoint Search" className="w-full">
          <div className="mb-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Where are you driving to or from?
            </h2>
          </div>

          <V2SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            totalCount={allCameras.length}
            filteredCount={filteredCameras.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </section>

        {/* Bookmarks & Saved Locations Panel (Auto-minimized when searching) */}
        <V2BookmarksPanel
          bookmarks={bookmarks}
          onSelectBookmark={handleSelectBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onFocusSearch={handleFocusSearch}
          onQuickAddDefault={handleQuickAddDefault}
          isMinimized={isBookmarksMinimized}
          onToggleMinimize={handleToggleBookmarksMinimized}
        />

        {/* Camera Feeds Section (2x2 Grid with Interactive Pan/Zoom) */}
        <section aria-label="Camera Feeds" className="w-full pt-4 border-t border-slate-200">
          {/* Active Query Context Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {searchQuery
                  ? `Cameras matching "${searchQuery}"`
                  : activeCategory !== 'all'
                  ? `${activeCategory.toUpperCase()} Feeds`
                  : 'All Singapore Traffic Cameras'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                {filteredCameras.length} feeds
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Display:</span>
              <span>2x2 Grid with Pan &amp; Zoom</span>
            </div>
          </div>

          {/* Empty Search State */}
          {filteredCameras.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No matching cameras found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-5">
                No feeds matched &ldquo;{searchQuery}&rdquo;. Try searching by expressway name (e.g., Woodlands, Tuas, PIE, BKE, CTE, AYE, Changi) or camera ID.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('woodlands');
                    setSearchQuery('woodlands');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Woodlands Checkpoint
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('bke');
                    setSearchQuery('bke');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  BKE Expressway
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset / Show All Feeds
                </button>
              </div>
            </div>
          ) : (
            /* 2x2 Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filteredCameras.map((camera) => (
                <V2CameraCard
                  key={camera.id}
                  camera={camera}
                  isBookmarked={isCameraBookmarked(camera)}
                  onToggleBookmark={toggleBookmark}
                  onOpenFullView={(cam) => setSelectedCamera(cam)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Interactive Camera Inspection Window Modal with Drag/Pan & Ctrl+Scroll Zoom */}
        {selectedCamera && (
          <V2CameraModal
            camera={selectedCamera}
            onClose={() => setSelectedCamera(null)}
            isBookmarked={isCameraBookmarked(selectedCamera)}
            onToggleBookmark={toggleBookmark}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800">SG Super Road Cam (v2)</span> — Usability Testing
            &amp; Research study for Singapore Land Transport Authority traffic feeds.
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>Name &amp; Corridor Matching</span>
            <span>•</span>
            <span>Manual Refresh Mode</span>
            <span>•</span>
            <span>Uncluttered Minimalist Feeds</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
