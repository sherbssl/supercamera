import { EnrichedCamera } from '../types';

export interface CameraMetaEntry {
  name: string;
  road: string;
  area: string;
  direction?: string;
  isCheckpoint: boolean;
}

// Known Singapore LTA Camera ID Directory
export const CAMERA_DIRECTORY: Record<string, CameraMetaEntry> = {
  // Checkpoints - Woodlands
  '2701': {
    name: 'Woodlands Causeway (Towards Johor)',
    road: 'Woodlands Checkpoint',
    area: 'Woodlands',
    direction: 'Towards Johor Bahru (Malaysia)',
    isCheckpoint: true,
  },
  '2702': {
    name: 'Woodlands Checkpoint',
    road: 'Woodlands Checkpoint',
    area: 'Woodlands',
    direction: 'Towards Singapore / BKE',
    isCheckpoint: true,
  },
  '2704': {
    name: 'BKE Exit 9 / Woodlands Flyover',
    road: 'BKE',
    area: 'Woodlands',
    direction: 'Towards Woodlands Checkpoint',
    isCheckpoint: true,
  },

  // Checkpoints - Tuas Second Link
  '4703': {
    name: 'Tuas Checkpoint (Arrival / Complex)',
    road: 'Tuas Checkpoint',
    area: 'Tuas',
    direction: 'Tuas Checkpoint Complex',
    isCheckpoint: true,
  },
  '4712': {
    name: 'Tuas Checkpoint (Departure towards Malaysia)',
    road: 'Tuas Checkpoint',
    area: 'Tuas',
    direction: 'Towards Malaysia (Second Link)',
    isCheckpoint: true,
  },
  '4713': {
    name: 'Tuas Second Link at Sultan Abu Bakar',
    road: 'Tuas Second Link',
    area: 'Tuas',
    direction: 'Towards Johor / Malaysia',
    isCheckpoint: true,
  },
  '4798': {
    name: 'Sentosa Gateway / Telok Blangah',
    road: 'Sentosa Gateway',
    area: 'HarbourFront',
    direction: 'Towards Sentosa',
    isCheckpoint: false,
  },
  '4799': {
    name: 'Sentosa Gateway / HarbourFront',
    road: 'Sentosa Gateway',
    area: 'HarbourFront',
    direction: 'Towards City',
    isCheckpoint: false,
  },

  // Expressways - PIE (Pan Island Expressway)
  '6701': {
    name: 'PIE - Jalan Anak Bukit',
    road: 'PIE',
    area: 'Changi / Bukit Timah',
    direction: 'Towards Changi Airport',
    isCheckpoint: false,
  },
  '6703': {
    name: 'PIE - Adam Road',
    road: 'PIE',
    area: 'Bukit Timah',
    direction: 'Towards Tuas',
    isCheckpoint: false,
  },
  '6704': {
    name: 'PIE - Mount Pleasant',
    road: 'PIE',
    area: 'Toa Payoh',
    direction: 'Towards Tuas',
    isCheckpoint: false,
  },
  '6705': {
    name: 'PIE - Kallang Way',
    road: 'PIE',
    area: 'Changi / Kallang',
    direction: 'Towards Changi Airport',
    isCheckpoint: false,
  },
  '6708': {
    name: 'PIE - Kim Keat',
    road: 'PIE',
    area: 'Toa Payoh',
    direction: 'Towards Tuas',
    isCheckpoint: false,
  },
  '6711': {
    name: 'PIE - Eunos Flyover',
    road: 'PIE',
    area: 'Changi / Eunos',
    direction: 'Towards Changi Airport',
    isCheckpoint: false,
  },
  '6712': {
    name: 'PIE - Bedok North',
    road: 'PIE',
    area: 'Bedok',
    direction: 'Towards Tuas',
    isCheckpoint: false,
  },

  // Expressways - BKE (Bukit Timah Expressway)
  '2703': {
    name: 'BKE - Chantek Flyover',
    road: 'BKE',
    area: 'Bukit Timah',
    direction: 'Towards Woodlands',
    isCheckpoint: false,
  },
  '2705': {
    name: 'BKE - Dairy Farm',
    road: 'BKE',
    area: 'Bukit Panjang',
    direction: 'Towards Woodlands',
    isCheckpoint: false,
  },
  '2707': {
    name: 'BKE - Mandai Road',
    road: 'BKE',
    area: 'Mandai',
    direction: 'Towards PIE',
    isCheckpoint: false,
  },

  // Expressways - CTE (Central Expressway)
  '1701': {
    name: 'CTE - Ang Mo Kio Ave 1',
    road: 'CTE',
    area: 'Ang Mo Kio',
    direction: 'Towards AYE / City',
    isCheckpoint: false,
  },
  '1702': {
    name: 'CTE - Ang Mo Kio Ave 5',
    road: 'CTE',
    area: 'Ang Mo Kio',
    direction: 'Towards SLE',
    isCheckpoint: false,
  },
  '1703': {
    name: 'CTE - Braddell Road',
    road: 'CTE',
    area: 'Bishan',
    direction: 'Towards City',
    isCheckpoint: false,
  },
  '1704': {
    name: 'CTE - Moulmein Road',
    road: 'CTE',
    area: 'Novena',
    direction: 'Towards SLE',
    isCheckpoint: false,
  },

  // Expressways - AYE (Ayer Rajah Expressway)
  '3701': {
    name: 'AYE - Alexandra Road',
    road: 'AYE',
    area: 'Bukit Merah',
    direction: 'Towards MCE',
    isCheckpoint: false,
  },
  '3702': {
    name: 'AYE - Keppel Road',
    road: 'AYE',
    area: 'Tanjong Pagar',
    direction: 'Towards Tuas',
    isCheckpoint: false,
  },
  '3704': {
    name: 'AYE - Clementi Road',
    road: 'AYE',
    area: 'Clementi',
    direction: 'Towards Tuas',
    isCheckpoint: false,
  },
  '3795': {
    name: 'AYE - Tuas Road',
    road: 'AYE',
    area: 'Tuas',
    direction: 'Towards Tuas Checkpoint',
    isCheckpoint: true,
  },
};

export function lookupCameraMeta(cameraId: string): CameraMetaEntry {
  if (CAMERA_DIRECTORY[cameraId]) {
    return CAMERA_DIRECTORY[cameraId];
  }

  // Heuristic based on ID patterns if unknown
  const isWoodlands = cameraId.startsWith('27');
  const isTuas = cameraId.startsWith('47');
  const isPIE = cameraId.startsWith('67');
  const isCTE = cameraId.startsWith('17');
  const isAYE = cameraId.startsWith('37');

  let road = 'Expressway';
  let area = 'Singapore';
  let isCheckpoint = false;

  if (isWoodlands) {
    road = 'Woodlands / BKE';
    area = 'Woodlands';
    isCheckpoint = true;
  } else if (isTuas) {
    road = 'Tuas / Second Link';
    area = 'Tuas';
    isCheckpoint = true;
  } else if (isPIE) {
    road = 'PIE';
    area = 'Pan Island Expressway';
  } else if (isCTE) {
    road = 'CTE';
    area = 'Central Expressway';
  } else if (isAYE) {
    road = 'AYE';
    area = 'Ayer Rajah Expressway';
  }

  return {
    name: `Camera ${cameraId} (${road})`,
    road,
    area,
    direction: 'Live Feed',
    isCheckpoint,
  };
}

// Fallback high-fidelity cameras when offline or to supplement expressway searches
export const FALLBACK_CAMERAS: EnrichedCamera[] = [
  {
    id: '2701',
    name: 'Woodlands Causeway (Towards Johor)',
    road: 'Woodlands Checkpoint',
    area: 'Woodlands',
    direction: 'Towards Johor Bahru (Malaysia)',
    latitude: 1.447023728,
    longitude: 103.7716543,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/ae944d23-007c-4036-943d-09d686a51efd.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: true,
  },
  {
    id: '2702',
    name: 'Woodlands Checkpoint',
    road: 'Woodlands Checkpoint',
    area: 'Woodlands',
    direction: 'Towards Singapore / BKE',
    latitude: 1.445554109,
    longitude: 103.7683397,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/5a499885-50c3-4794-9617-91137bf2ab05.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: true,
  },
  {
    id: '2704',
    name: 'BKE Exit 9 / Woodlands Flyover',
    road: 'BKE',
    area: 'Woodlands',
    direction: 'Towards Woodlands Checkpoint',
    latitude: 1.429588536,
    longitude: 103.769311,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/8a51560c-5e9b-411e-916d-0ed02ba492a2.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: true,
  },
  {
    id: '2703',
    name: 'BKE - Chantek Flyover',
    road: 'BKE',
    area: 'Bukit Timah',
    direction: 'Towards Woodlands',
    latitude: 1.3533,
    longitude: 103.7842,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/ae944d23-007c-4036-943d-09d686a51efd.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '2705',
    name: 'BKE - Dairy Farm',
    road: 'BKE',
    area: 'Bukit Panjang',
    direction: 'Towards Woodlands',
    latitude: 1.3688,
    longitude: 103.7741,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/5a499885-50c3-4794-9617-91137bf2ab05.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '2707',
    name: 'BKE - Mandai Road',
    road: 'BKE',
    area: 'Mandai',
    direction: 'Towards PIE',
    latitude: 1.4082,
    longitude: 103.7782,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/e22316c6-a610-4bc0-a2a9-a60b64ba0460.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '4703',
    name: 'Tuas Checkpoint (Arrival / Complex)',
    road: 'Tuas Checkpoint',
    area: 'Tuas',
    direction: 'Tuas Checkpoint Complex',
    latitude: 1.348697862,
    longitude: 103.6350413,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/b5da8d72-e032-4491-9108-801b3b5fae2e.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: true,
  },
  {
    id: '4712',
    name: 'Tuas Checkpoint (Departure towards Malaysia)',
    road: 'Tuas Checkpoint',
    area: 'Tuas',
    direction: 'Towards Malaysia (Second Link)',
    latitude: 1.341244001,
    longitude: 103.6439134,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/9e8d58b4-9906-4001-acd7-eb72b1cb0931.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: true,
  },
  {
    id: '4713',
    name: 'Tuas Second Link at Sultan Abu Bakar',
    road: 'Tuas Second Link',
    area: 'Tuas',
    direction: 'Towards Johor / Malaysia',
    latitude: 1.347645829,
    longitude: 103.6366955,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/e22316c6-a610-4bc0-a2a9-a60b64ba0460.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: true,
  },
  {
    id: '6701',
    name: 'PIE - Jalan Anak Bukit',
    road: 'PIE',
    area: 'Changi / Bukit Timah',
    direction: 'Towards Changi Airport',
    latitude: 1.34149,
    longitude: 103.7745,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/ae944d23-007c-4036-943d-09d686a51efd.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '6703',
    name: 'PIE - Adam Road',
    road: 'PIE',
    area: 'Bukit Timah',
    direction: 'Towards Tuas',
    latitude: 1.33235,
    longitude: 103.8184,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/5a499885-50c3-4794-9617-91137bf2ab05.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '6705',
    name: 'PIE - Kallang Way',
    road: 'PIE',
    area: 'Changi / Kallang',
    direction: 'Towards Changi Airport',
    latitude: 1.3283,
    longitude: 103.8752,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/b5da8d72-e032-4491-9108-801b3b5fae2e.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '6711',
    name: 'PIE - Eunos Flyover',
    road: 'PIE',
    area: 'Changi / Eunos',
    direction: 'Towards Changi Airport',
    latitude: 1.3262,
    longitude: 103.9038,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/8a51560c-5e9b-411e-916d-0ed02ba492a2.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '1701',
    name: 'CTE - Ang Mo Kio Ave 1',
    road: 'CTE',
    area: 'Ang Mo Kio',
    direction: 'Towards AYE / City',
    latitude: 1.3653,
    longitude: 103.8569,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/b5da8d72-e032-4491-9108-801b3b5fae2e.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '3702',
    name: 'AYE - Keppel Road',
    road: 'AYE',
    area: 'Tanjong Pagar',
    direction: 'Towards Tuas',
    latitude: 1.2721,
    longitude: 103.8344,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/9e8d58b4-9906-4001-acd7-eb72b1cb0931.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '4798',
    name: 'Sentosa Gateway / Telok Blangah',
    road: 'Sentosa Gateway',
    area: 'HarbourFront',
    direction: 'Towards Sentosa',
    latitude: 1.25999999687243,
    longitude: 103.823611110166,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/92120775-1d98-4724-8b4d-e8108470ec5c.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
  {
    id: '4799',
    name: 'Sentosa Gateway / HarbourFront',
    road: 'Sentosa Gateway',
    area: 'HarbourFront',
    direction: 'Towards City',
    latitude: 1.26027777363278,
    longitude: 103.823888890049,
    image: 'https://images.data.gov.sg/api/traffic-images/2026/09/9e798400-8238-4966-85b6-bffe00fdc32c.jpg',
    timestamp: new Date().toISOString(),
    isCheckpoint: false,
  },
];
