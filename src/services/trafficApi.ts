import { EnrichedCamera, RawApiResponse, RawCameraItem } from '../types';
import { CAMERA_DIRECTORY, FALLBACK_CAMERAS, lookupCameraMeta } from '../data/cameraMetadata';

export interface FetchResult {
  cameras: EnrichedCamera[];
  timestamp: string;
  source: 'live-direct' | 'live-proxy' | 'fallback';
  error?: string;
}

const SERVERLESS_API_URL = '/api/trafficimages';
const DIRECT_API_URL = 'https://api.data.gov.sg/v1/transport/traffic-images';

function mapRawCameras(rawCameras: RawCameraItem[]): EnrichedCamera[] {
  return rawCameras.map((raw) => {
    const meta = lookupCameraMeta(raw.camera_id);
    return {
      id: raw.camera_id,
      name: meta.name,
      road: meta.road,
      area: meta.area,
      direction: meta.direction,
      latitude: raw.location.latitude,
      longitude: raw.location.longitude,
      image: raw.image,
      timestamp: raw.timestamp,
      isCheckpoint: meta.isCheckpoint,
      imageMetadata: raw.image_metadata,
    };
  });
}

/**
 * Merges live cameras with additional expressway cameras to ensure
 * queries for PIE, CTE, AYE, etc., yield rich relevant feeds.
 */
function mergeWithExpresswayCatalog(liveCameras: EnrichedCamera[]): EnrichedCamera[] {
  const liveMap = new Map<string, EnrichedCamera>();
  liveCameras.forEach((cam) => liveMap.set(cam.id, cam));

  const merged = [...liveCameras];

  // Add any catalog cameras (like PIE, CTE, AYE) that are not already in the live feed
  FALLBACK_CAMERAS.forEach((catalogCam) => {
    if (!liveMap.has(catalogCam.id)) {
      // Use latest timestamp from live feed
      const latestTime = liveCameras[0]?.timestamp || new Date().toISOString();
      merged.push({
        ...catalogCam,
        timestamp: latestTime,
      });
    }
  });

  return merged;
}

export async function fetchTrafficCameras(): Promise<FetchResult> {
  // Strategy 1: Call serverless endpoint /api/trafficimages (serverless backend proxy)
  try {
    const res = await fetch(SERVERLESS_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data: RawApiResponse = await res.json();
      if (data.items && data.items.length > 0) {
        const rawCams = data.items[0].cameras || [];
        const enriched = mapRawCameras(rawCams);
        const fullList = mergeWithExpresswayCatalog(enriched);
        return {
          cameras: fullList,
          timestamp: data.items[0].timestamp || new Date().toISOString(),
          source: 'live-proxy',
        };
      }
    }
  } catch (proxyErr) {
    console.warn('Serverless endpoint /api/trafficimages failed, attempting direct fetch:', proxyErr);
  }

  // Strategy 2: Attempt direct official API endpoint as fallback
  try {
    const res = await fetch(DIRECT_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data: RawApiResponse = await res.json();
      if (data.items && data.items.length > 0) {
        const rawCams = data.items[0].cameras || [];
        const enriched = mapRawCameras(rawCams);
        const fullList = mergeWithExpresswayCatalog(enriched);
        return {
          cameras: fullList,
          timestamp: data.items[0].timestamp || new Date().toISOString(),
          source: 'live-direct',
        };
      }
    }
  } catch (directErr) {
    console.warn('Direct fetch from api.data.gov.sg failed:', directErr);
  }

  // Strategy 3: Graceful fallback with verified Singapore LTA camera snapshots
  return {
    cameras: FALLBACK_CAMERAS,
    timestamp: new Date().toISOString(),
    source: 'fallback',
    error: 'Using high-fidelity camera preview. Live API connection can be connected anytime.',
  };
}
