import React, { useState, useRef, useCallback } from 'react';
import { Clock, MapPin, ZoomIn, ZoomOut, RotateCcw, Bookmark, AlertCircle } from 'lucide-react';
import { CameraWithDistance } from '../../types';
import { formatSingaporeDateTime, formatRelativeTime } from '../../utils/dateFormatter';

interface V2CameraCardProps {
  camera: CameraWithDistance;
  isBookmarked: boolean;
  onToggleBookmark: (camera: CameraWithDistance) => void;
  onOpenFullView?: (camera: CameraWithDistance) => void;
}

export const V2CameraCard: React.FC<V2CameraCardProps> = ({
  camera,
  isBookmarked,
  onToggleBookmark,
  onOpenFullView,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan
  const resetZoom = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Wheel event for Ctrl + Scroll zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.3 : -0.3;
      setZoomLevel((prev) => {
        const next = Math.min(Math.max(prev + delta, 1), 4);
        if (next === 1) {
          setPanPosition({ x: 0, y: 0 });
        }
        return parseFloat(next.toFixed(2));
      });
    }
  }, []);

  // Mouse Drag handlers for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (zoomLevel <= 1) return;
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialPanX: panPosition.x,
        initialPanY: panPosition.y,
      };
    },
    [zoomLevel, panPosition],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || zoomLevel <= 1) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;

      // Bound panning based on zoom level
      const maxPan = (zoomLevel - 1) * 180;
      const newX = Math.max(Math.min(dragStartRef.current.initialPanX + dx, maxPan), -maxPan);
      const newY = Math.max(Math.min(dragStartRef.current.initialPanY + dy, maxPan), -maxPan);

      setPanPosition({ x: newX, y: newY });
    },
    [isDragging, zoomLevel],
  );

  const handleMouseUpOrLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Relative & absolute time formatting
  const relativeTime = formatRelativeTime(camera.timestamp);
  const formattedTime = formatSingaporeDateTime(camera.timestamp);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      {/* Interactive Media Container with Zoom & Pan */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onDoubleClick={resetZoom}
        className={`relative aspect-video w-full bg-slate-950 select-none overflow-hidden ${
          zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
            <span className="text-xs text-slate-400 font-medium">Loading traffic snapshot...</span>
          </div>
        )}

        {/* Error Fallback */}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-4 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500/80 mb-2" />
            <span className="text-sm font-medium text-slate-300">Feed temporarily unavailable</span>
            <span className="text-xs text-slate-500 mt-1">Snapshot awaiting next LTA update</span>
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={camera.image}
              alt={camera.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        )}

        {/* Floating Zoom & Pan Controls Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-xs border border-white/10 rounded-lg p-1 text-white shadow-md z-10">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In (or Ctrl + Scroll Up)"
            disabled={zoomLevel >= 4}
            className="p-1.5 hover:bg-white/20 rounded disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out (or Ctrl + Scroll Down)"
            disabled={zoomLevel <= 1}
            className="p-1.5 hover:bg-white/20 rounded disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          {zoomLevel > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              title="Reset Zoom & Pan"
              className="p-1.5 hover:bg-white/20 rounded text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-[10px] font-mono font-bold">{Math.round(zoomLevel * 100)}%</span>
            </button>
          )}
        </div>

        {/* Zoom & Pan Hint Badge */}
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          {zoomLevel > 1 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/80 backdrop-blur-xs text-blue-200 border border-blue-400/30 text-[10px] font-medium">
              Magnified {zoomLevel.toFixed(1)}x • Drag to pan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-xs text-slate-300 text-[10px] font-medium opacity-70 hover:opacity-100 transition-opacity">
              Hold Ctrl + Scroll to zoom
            </span>
          )}
        </div>

        {/* Bookmark Quick Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(camera);
          }}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this location'}
          className={`absolute top-3 left-3 p-1.5 rounded-lg backdrop-blur-xs border transition-all z-10 cursor-pointer ${
            isBookmarked
              ? 'bg-amber-500/90 border-amber-400 text-white shadow-sm'
              : 'bg-slate-900/70 border-white/20 text-slate-300 hover:text-white hover:bg-slate-900/90'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Minimalist Information Hierarchy */}
      {/* STRICT EXCLUSION: NO raw Camera IDs, NO database strings */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Location / Road Name Description */}
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
            {camera.name}
          </h3>

          {/* Distance Badge & Direction Details */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {camera.distanceText && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <MapPin className="h-3 w-3 text-blue-600" />
                {camera.distanceText}
              </span>
            )}
            {camera.direction && (
              <span className="text-xs text-slate-500 truncate max-w-[280px]">
                {camera.direction}
              </span>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span title={formattedTime}>{relativeTime || formattedTime}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://www.google.com/maps?q=${camera.latitude},${camera.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-0.5"
            >
              Directions
            </a>
            {onOpenFullView && (
              <button
                type="button"
                onClick={() => onOpenFullView(camera)}
                className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Expand
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
