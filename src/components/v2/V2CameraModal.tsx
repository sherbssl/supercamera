import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  MapPin,
  Clock,
  Bookmark,
  RefreshCw,
  Maximize2,
  AlertCircle,
  Move,
  Check,
} from 'lucide-react';
import { CameraWithDistance } from '../../types';
import { formatSingaporeDateTime, formatRelativeTime } from '../../utils/dateFormatter';

interface V2CameraModalProps {
  camera: CameraWithDistance | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (camera: CameraWithDistance) => void;
}

export const V2CameraModal: React.FC<V2CameraModalProps> = ({
  camera,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  // Reset zoom & pan when camera changes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setImageError(false);
    setRefreshKey(Date.now());
  }, [camera?.id]);

  // Handle ESC key and keyboard zoom shortcuts
  useEffect(() => {
    if (!camera) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((z) => Math.min(parseFloat((z + 0.4).toFixed(2)), 6));
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        setZoomLevel((z) => {
          const next = Math.max(parseFloat((z - 0.4).toFixed(2)), 1);
          if (next === 1) setPanPosition({ x: 0, y: 0 });
          return next;
        });
        return;
      }
      if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
        return;
      }

      // Arrow keys for panning when zoomed
      if (zoomLevel > 1) {
        const step = 40;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setPanPosition((p) => ({ ...p, x: p.x + step }));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setPanPosition((p) => ({ ...p, x: p.x - step }));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setPanPosition((p) => ({ ...p, y: p.y + step }));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setPanPosition((p) => ({ ...p, y: p.y - step }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [camera, onClose, zoomLevel]);

  // CRITICAL: Global Wheel Interceptor while modal is active
  // Guarantees that Ctrl + Scroll will NEVER alter the browser window zoom!
  useEffect(() => {
    if (!camera) return;

    const handleGlobalWheel = (e: WheelEvent) => {
      // If user holds Ctrl or Meta anywhere while this modal is open, prevent browser UI zoom!
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
    };
  }, [camera]);

  // Wheel event attached with { passive: false } to container
  // Allows user to ctrl+scroll (or wheel scroll) to zoom in/out without affecting browser zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !camera) return;

    const handleWheel = (e: WheelEvent) => {
      // PREVENT BROWSER ZOOM: Essential { passive: false } interceptor
      e.preventDefault();
      e.stopPropagation();

      // Determine zoom direction
      const zoomFactor = e.deltaY < 0 ? 1.2 : 0.833;

      setZoomLevel((prev) => {
        const next = Math.min(Math.max(parseFloat((prev * zoomFactor).toFixed(2)), 1), 6);
        if (next === 1) {
          setPanPosition({ x: 0, y: 0 });
        }
        return next;
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [camera]);

  // Drag & Pan handlers (Mouse)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return; // only left click
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialPanX: panPosition.x,
        initialPanY: panPosition.y,
      };
    },
    [panPosition],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;

      // Allow generous pan range based on current zoom
      const maxPan = Math.max((zoomLevel - 1) * 350, 80);
      const newX = Math.max(Math.min(dragStartRef.current.initialPanX + dx, maxPan), -maxPan);
      const newY = Math.max(Math.min(dragStartRef.current.initialPanY + dy, maxPan), -maxPan);

      setPanPosition({ x: newX, y: newY });
    },
    [isDragging, zoomLevel],
  );

  const handleMouseUpOrLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile / touch devices
  const touchStartRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        initialPanX: panPosition.x,
        initialPanY: panPosition.y,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.startX;
      const dy = e.touches[0].clientY - dragStartRef.current.startY;
      const maxPan = Math.max((zoomLevel - 1) * 350, 80);
      setPanPosition({
        x: Math.max(Math.min(dragStartRef.current.initialPanX + dx, maxPan), -maxPan),
        y: Math.max(Math.min(dragStartRef.current.initialPanY + dy, maxPan), -maxPan),
      });
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const scaleDelta = currentDist / touchStartRef.current.dist;
      touchStartRef.current.dist = currentDist;
      setZoomLevel((prev) => Math.min(Math.max(parseFloat((prev * scaleDelta).toFixed(2)), 1), 6));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current.dist = 0;
  };

  // Zoom button controls
  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(parseFloat((z + 0.5).toFixed(2)), 6));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => {
      const next = Math.max(parseFloat((z - 0.5).toFixed(2)), 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      handleReset();
    } else {
      setZoomLevel(2.5);
    }
  };

  // Refresh single image
  const handleRefreshSnapshot = () => {
    setImageLoaded(false);
    setRefreshKey(Date.now());
  };

  // Pop out to a detached browser window (in case user wants multi-monitor inspection)
  const handlePopoutToNewBrowserWindow = () => {
    if (!camera) return;
    try {
      const win = window.open('', '_blank', 'width=1100,height=750,menubar=no,toolbar=no,location=no');
      if (win) {
        win.document.title = `${camera.name} - SG Traffic Feed`;
        win.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>${camera.name} - SG Live Traffic Feed</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
              header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: #0f172a; border-bottom: 1px solid #1e293b; }
              h1 { font-size: 15px; font-weight: 700; color: #fff; }
              p { font-size: 12px; color: #94a3b8; margin-top: 2px; }
              .tools { display: flex; align-items: center; gap: 8px; }
              button { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
              button:hover { background: #334155; color: #fff; }
              #stage { flex: 1; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000; cursor: grab; user-select: none; }
              #stage:active { cursor: grabbing; }
              #cam-img { max-width: 95%; max-height: 95%; object-fit: contain; pointer-events: none; transform-origin: center center; }
              #banner { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); background: rgba(15,23,42,0.85); border: 1px solid rgba(255,255,255,0.15); padding: 5px 14px; border-radius: 9999px; font-size: 11px; color: #94a3b8; pointer-events: none; }
            </style>
          </head>
          <body>
            <header>
              <div>
                <h1>${camera.name}</h1>
                <p>${camera.road || ''} ${camera.direction ? '• ' + camera.direction : ''}</p>
              </div>
              <div class="tools">
                <button id="btn-out">- Zoom Out</button>
                <span id="txt-zoom" style="font-family: monospace; font-size: 12px; font-weight: bold; min-width: 44px; text-align: center;">100%</span>
                <button id="btn-in">+ Zoom In</button>
                <button id="btn-reset">Reset</button>
              </div>
            </header>
            <div id="stage">
              <img id="cam-img" src="${camera.image}" alt="${camera.name}" referrerpolicy="no-referrer" />
              <div id="banner">Ctrl + Scroll to zoom in/out (Browser zoom unaffected) • Drag to pan</div>
            </div>
            <script>
              let z = 1, px = 0, py = 0, dragging = false, sx = 0, sy = 0, ix = 0, iy = 0;
              const img = document.getElementById('cam-img');
              const stage = document.getElementById('stage');
              const txt = document.getElementById('txt-zoom');

              function update() {
                img.style.transform = 'scale(' + z + ') translate(' + (px / z) + 'px, ' + (py / z) + 'px)';
                txt.innerText = Math.round(z * 100) + '%';
              }

              stage.addEventListener('wheel', function(e) {
                e.preventDefault();
                const d = e.deltaY < 0 ? 0.2 : -0.2;
                z = Math.min(Math.max(z + d, 1), 6);
                if (z === 1) { px = 0; py = 0; }
                update();
              }, { passive: false });

              window.addEventListener('wheel', function(e) {
                if (e.ctrlKey || e.metaKey) e.preventDefault();
              }, { passive: false });

              stage.addEventListener('mousedown', function(e) {
                if (e.button !== 0) return;
                dragging = true;
                sx = e.clientX; sy = e.clientY;
                ix = px; iy = py;
              });
              window.addEventListener('mousemove', function(e) {
                if (!dragging) return;
                px = ix + (e.clientX - sx);
                py = iy + (e.clientY - sy);
                update();
              });
              window.addEventListener('mouseup', function() { dragging = false; });

              document.getElementById('btn-in').onclick = function() { z = Math.min(z + 0.4, 6); update(); };
              document.getElementById('btn-out').onclick = function() { z = Math.max(z - 0.4, 1); if (z === 1) { px = 0; py = 0; } update(); };
              document.getElementById('btn-reset').onclick = function() { z = 1; px = 0; py = 0; update(); };
            </script>
          </body>
          </html>
        `);
        win.document.close();
      }
    } catch (e) {
      console.error('Failed to open standalone popout window', e);
    }
  };

  if (!camera) return null;

  const fullTime = formatSingaporeDateTime(camera.timestamp);
  const relTime = formatRelativeTime(camera.timestamp);
  const mapUrl = `https://www.google.com/maps?q=${camera.latitude},${camera.longitude}`;

  return (
    <div
      id="v2-camera-inspection-window-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Inspection Window Frame */}
      <div
        id="v2-camera-inspection-window"
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Titlebar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Live Traffic Camera" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {camera.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 truncate mt-0.5">
                <span className="truncate">{camera.road}</span>
                {camera.direction && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 truncate">{camera.direction}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Window Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-auto">
            {/* Zoom Controls Bar */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5 text-slate-300">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                title="Zoom Out (or Ctrl + Scroll Down / -)"
                className="p-1.5 hover:bg-slate-700 hover:text-white rounded disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <span className="text-xs font-mono font-bold px-2 text-slate-200 min-w-[50px] text-center select-none">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 6}
                title="Zoom In (or Ctrl + Scroll Up / +)"
                className="p-1.5 hover:bg-slate-700 hover:text-white rounded disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              {zoomLevel > 1 && (
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset Zoom (or 0 / R)"
                  className="px-2 py-1 hover:bg-slate-700 text-amber-400 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border-l border-slate-700 ml-0.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Standalone Browser Window Popout Option */}
            <button
              type="button"
              onClick={handlePopoutToNewBrowserWindow}
              title="Pop out to a separate browser window"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden md:inline">Pop Out</span>
            </button>

            {/* Bookmark Toggle */}
            <button
              type="button"
              onClick={() => onToggleBookmark(camera)}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark location'}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Close Window Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close window (Esc)"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-800 border border-slate-700 text-slate-400 transition-colors cursor-pointer ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Interactive Image Viewport with Drag/Pan and Ctrl+Scroll Zoom */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
          className={`relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[500px] max-h-[72vh] select-none ${
            zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
        >
          {/* Loading Placeholder */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 z-10">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-500 mb-2" />
              <span className="text-xs font-medium">Loading high-resolution traffic snapshot...</span>
            </div>
          )}

          {/* Error State */}
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center z-10">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
              <span className="text-base font-semibold text-slate-200">Unable to load feed snapshot</span>
              <span className="text-xs text-slate-500 mt-1 max-w-sm">
                The LTA DataMall camera feed may be undergoing maintenance or updating.
              </span>
              <button
                type="button"
                onClick={handleRefreshSnapshot}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold cursor-pointer"
              >
                Retry Feed
              </button>
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${
                  panPosition.y / zoomLevel
                }px)`,
                transformOrigin: 'center center',
              }}
            >
              <img
                key={refreshKey}
                src={`${camera.image}${camera.image.includes('?') ? '&' : '?'}v=${refreshKey}`}
                alt={camera.name}
                referrerPolicy="no-referrer"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`max-w-full max-h-full object-contain pointer-events-none transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          )}

          {/* Floating Usage Helper Badge */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-20">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-medium text-slate-300 flex items-center gap-2 shadow-lg whitespace-nowrap">
              <Move className="h-3 w-3 text-blue-400" />
              <span>
                {zoomLevel > 1
                  ? `Magnified ${zoomLevel.toFixed(1)}x • Drag to pan • Double-click to reset`
                  : 'Ctrl + Scroll to zoom without affecting browser • Drag to pan'}
              </span>
            </div>
          </div>
        </div>

        {/* Window Footer & Metadata Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/95 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5" title={fullTime}>
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Captured: {relTime || fullTime}</span>
            </div>

            <button
              type="button"
              onClick={handleRefreshSnapshot}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
              title="Fetch latest snapshot"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reload Snapshot</span>
            </button>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline flex items-center gap-1"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Google Maps Route</span>
            </a>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white font-medium cursor-pointer"
            >
              Done (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
