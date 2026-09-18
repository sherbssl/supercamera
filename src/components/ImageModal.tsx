import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ExternalLink, Clock, MapPin, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { EnrichedCamera } from '../types';
import { formatSingaporeDateTime, formatRelativeTime } from '../utils/dateFormatter';

interface ImageModalProps {
  camera: EnrichedCamera | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ camera, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

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

  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [camera?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((z) => Math.min(parseFloat((z + 0.4).toFixed(2)), 6));
      }
      if (e.key === '-') {
        e.preventDefault();
        setZoomLevel((z) => {
          const next = Math.max(parseFloat((z - 0.4).toFixed(2)), 1);
          if (next === 1) setPanPosition({ x: 0, y: 0 });
          return next;
        });
      }
      if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      }
    };
    if (camera) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [camera, onClose]);

  // Intercept wheel on window while modal is open so Ctrl+scroll NEVER zooms browser
  useEffect(() => {
    if (!camera) return;
    const preventBrowserZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    window.addEventListener('wheel', preventBrowserZoom, { passive: false });
    return () => window.removeEventListener('wheel', preventBrowserZoom);
  }, [camera]);

  // Container wheel listener for zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !camera) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = e.deltaY < 0 ? 1.2 : 0.833;
      setZoomLevel((prev) => {
        const next = Math.min(Math.max(parseFloat((prev * zoomFactor).toFixed(2)), 1), 6);
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [camera]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
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
      const maxPan = Math.max((zoomLevel - 1) * 300, 80);
      setPanPosition({
        x: Math.max(Math.min(dragStartRef.current.initialPanX + dx, maxPan), -maxPan),
        y: Math.max(Math.min(dragStartRef.current.initialPanY + dy, maxPan), -maxPan),
      });
    },
    [isDragging, zoomLevel],
  );

  const handleMouseUpOrLeave = useCallback(() => setIsDragging(false), []);

  if (!camera) return null;

  const fullTime = formatSingaporeDateTime(camera.timestamp);
  const relTime = formatRelativeTime(camera.timestamp);
  const mapUrl = `https://www.google.com/maps?q=${camera.latitude},${camera.longitude}`;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(parseFloat((z + 0.4).toFixed(2)), 6));
  const handleZoomOut = () =>
    setZoomLevel((z) => {
      const next = Math.max(parseFloat((z - 0.4).toFixed(2)), 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  return (
    <div
      id="camera-inspection-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-mono font-medium rounded">
              CAM #{camera.id}
            </span>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                {camera.name}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {camera.road} {camera.direction ? `· ${camera.direction}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="close-modal-button"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Image Body with Zoom & Pan Capability */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[440px] max-h-[68vh] select-none ${
            zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
        >
          <img
            src={camera.image}
            alt={camera.name}
            referrerPolicy="no-referrer"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${
                panPosition.y / zoomLevel
              }px)`,
              transformOrigin: 'center center',
            }}
            className="max-w-full max-h-[64vh] object-contain pointer-events-none transition-transform duration-75 ease-out"
          />

          {/* Floating Usage Hint Badge */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <div className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1.5 shadow-md">
              <Move className="h-3 w-3 text-blue-400" />
              <span>Ctrl + Scroll to zoom • Drag to pan</span>
            </div>
          </div>

          {/* Floating Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-900/90 backdrop-blur-xs border border-white/10 rounded-lg p-1 text-white shadow-lg z-20">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 6}
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                type="button"
                onClick={handleZoomReset}
                className="p-1.5 rounded hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
                title="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" title={fullTime}>
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>{relTime || fullTime}</span>
            </div>
            <span>·</span>
            <div className="font-mono text-[11px] text-slate-400">
              GPS: {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-medium hover:underline inline-flex items-center gap-1"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Open in Google Maps</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
