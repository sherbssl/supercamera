export interface CameraLocation {
  latitude: number;
  longitude: number;
}

export interface CameraImageMetadata {
  height: number;
  width: number;
  md5?: string;
}

export interface RawCameraItem {
  camera_id: string;
  image: string;
  timestamp: string;
  location: CameraLocation;
  image_metadata?: CameraImageMetadata;
}

export interface RawApiResponse {
  items: Array<{
    timestamp: string;
    cameras: RawCameraItem[];
  }>;
  api_info?: {
    status: string;
  };
}

export interface EnrichedCamera {
  id: string;
  name: string;
  road: string;
  area: string;
  direction?: string;
  latitude: number;
  longitude: number;
  image: string;
  timestamp: string;
  isCheckpoint: boolean;
  imageMetadata?: CameraImageMetadata;
}

export type FilterCategory = 'all' | 'woodlands' | 'tuas' | 'pie' | 'bke' | 'cte' | 'aye';

export type SortOption = 'name' | 'id' | 'timestamp';
