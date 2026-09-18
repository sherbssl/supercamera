import React, { useState } from 'react';
import { Clock, MapPin, Maximize2, ExternalLink, AlertCircle } from 'lucide-react';
import { EnrichedCamera } from '../types';
import { formatSingaporeDateTime, formatRelativeTime } from '../utils/dateFormatter';

interface CameraCardProps {
  camera: EnrichedCamera;
  onOpenModal: (camera: EnrichedCamera) => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, onOpenModal }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isWoodlands = camera.id.startsWith('27') || camera.name.toLowerCase().includes('woodlands');
  const isTuas = camera.id.startsWith('47') || camera.name.toLowerCase().includes('tuas');

  const relativeTime = formatRelativeTime(camera.timestamp);
  const fullTime = formatSingaporeDateTime(camera.timestamp);

  // Maps URL for Singapore coordinates
  const mapUrl = `https://www.google.com/maps?q=${camera.latitude},${camera.longitude}`;

  return (
    <div
      id={`camera-card-${camera.id}`}
      className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {/* Image Container */}
      <div
        className="relative aspect-video w-full bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onOpenModal(camera)}
      >
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200/70 animate-pulse flex items-center justify-center">
            <span className="text-xs text-slate-400 font-medium">Loading camera feed...</span>
          </div>
        )}

        {/* Error Fallback */}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <AlertCircle className="h-7 w-7 text-slate-300 mb-1" />
            <span className="text-xs font-medium text-slate-500">Camera Feed Temporarily Offline</span>
            <span className="text-[10px] text-slate-400 mt-0.5">ID: #{camera.id}</span>
          </div>
        ) : (
          <img
            src={camera.image}
            alt={camera.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {/* Camera ID Badge */}
            <span className="px-2 py-0.5 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-mono font-medium rounded-md shadow-xs">
              CAM #{camera.id}
            </span>

            {/* Checkpoint Tag */}
            {camera.isCheckpoint && (
              <span
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md backdrop-blur-xs shadow-xs ${
                  isWoodlands
                    ? 'bg-blue-600/90 text-white'
                    : isTuas
                      ? 'bg-emerald-600/90 text-white'
                      : 'bg-indigo-600/90 text-white'
                }`}
              >
                {isWoodlands ? 'Woodlands' : isTuas ? 'Tuas' : 'Checkpoint'}
              </span>
            )}
          </div>

          {/* Expand icon on hover */}
          <button
            type="button"
            className="pointer-events-auto h-7 w-7 rounded-md bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer shadow-xs"
            title="Inspect camera feed"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(camera);
            }}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Live indicator dot on bottom right of image */}
        <div className="absolute bottom-2 right-2.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Location Title */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2"
              title={camera.name}
            >
              {camera.name}
            </h3>
          </div>

          {/* Road / Area & Direction */}
          <div className="mt-1 flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              {camera.road}
            </span>
            {camera.direction && (
              <span className="text-slate-500 text-[11px]">· {camera.direction}</span>
            )}
          </div>
        </div>

        {/* Card Footer: Timestamp & Coordinates */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          {/* Exact Timestamp */}
          <div className="flex items-center gap-1.5 text-slate-500 min-w-0" title={`Updated: ${fullTime}`}>
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="font-mono text-[11px] text-slate-700 font-medium block leading-tight">
                {fullTime}
              </span>
              {relativeTime && (
                <span className="text-[10px] text-slate-400">{relativeTime}</span>
              )}
            </div>
          </div>

          {/* Map Link */}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`View coordinates on Map (${camera.latitude.toFixed(4)}, ${camera.longitude.toFixed(4)})`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-colors shrink-0"
          >
            <MapPin className="h-3 w-3 text-slate-400" />
            <span>Map</span>
            <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
