import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Clock, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { EnrichedCamera } from '../types';
import { formatSingaporeDateTime, formatRelativeTime } from '../utils/dateFormatter';

interface ImageModalProps {
  camera: EnrichedCamera | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ camera, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setZoomLevel(1);
  }, [camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  if (!camera) return null;

  const fullTime = formatSingaporeDateTime(camera.timestamp);
  const relTime = formatRelativeTime(camera.timestamp);
  const mapUrl = `https://www.google.com/maps?q=${camera.latitude},${camera.longitude}`;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.3, 1));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div
      id="camera-inspection-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-mono font-medium rounded">
              CAM #{camera.id}
            </span>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                {camera.name}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {camera.road} {camera.direction ? `· ${camera.direction}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="close-modal-button"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Image Body with Zoom Capability */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-auto min-h-[280px] max-h-[65vh] p-2">
          <img
            src={camera.image}
            alt={camera.name}
            referrerPolicy="no-referrer"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
            }}
            className="max-w-full max-h-[60vh] object-contain select-none"
          />

          {/* Floating Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs border border-white/10 rounded-lg p-1 text-white shadow-lg">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
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
              disabled={zoomLevel >= 2.5}
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={handleZoomReset}
                className="p-1.5 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                title="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="font-mono text-slate-800 font-semibold">{fullTime}</span>
              {relTime && <span className="text-slate-400 ml-1.5">({relTime})</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              <span>Open on Google Maps</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>

            <a
              href={camera.image}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors"
            >
              <span>View Source Snapshot</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
