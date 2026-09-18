import { GeocodedLocation, LocationCategory } from '../types';

/**
 * Singapore Postal Sector Lat/Lng Centroid Mapping (first 2 digits of 6-digit postal code)
 */
const POSTAL_SECTOR_MAP: Record<string, { lat: number; lng: number; area: string }> = {
  '01': { lat: 1.283, lng: 103.851, area: 'Raffles Place / Marina' },
  '02': { lat: 1.281, lng: 103.852, area: 'Anson / Shenton Way' },
  '03': { lat: 1.291, lng: 103.858, area: 'Marina Centre / City Hall' },
  '04': { lat: 1.284, lng: 103.849, area: 'Cecil / Telok Ayer' },
  '05': { lat: 1.285, lng: 103.843, area: 'Chinatown / Havelock' },
  '06': { lat: 1.279, lng: 103.848, area: 'Shenton Way / Tanjong Pagar' },
  '07': { lat: 1.274, lng: 103.843, area: 'Tanjong Pagar / Anson' },
  '08': { lat: 1.277, lng: 103.841, area: 'Spottiswoode / Cantonment' },
  '09': { lat: 1.265, lng: 103.822, area: 'Telok Blangah / HarbourFront' },
  '10': { lat: 1.275, lng: 103.818, area: 'Bukit Merah / Keppel' },
  '11': { lat: 1.279, lng: 103.792, area: 'Pasir Panjang / Alexandra' },
  '12': { lat: 1.297, lng: 103.771, area: 'West Coast / Clementi South' },
  '13': { lat: 1.302, lng: 103.788, area: 'Buona Vista / One-North' },
  '14': { lat: 1.294, lng: 103.806, area: 'Queenstown / Commonwealth' },
  '15': { lat: 1.286, lng: 103.825, area: 'Tiong Bahru / Henderson' },
  '16': { lat: 1.289, lng: 103.834, area: 'Outram / Havelock' },
  '17': { lat: 1.293, lng: 103.851, area: 'High Street / Clarke Quay' },
  '18': { lat: 1.301, lng: 103.857, area: 'Bugis / Middle Road' },
  '19': { lat: 1.303, lng: 103.862, area: 'Beach Road / Jalan Sultan' },
  '20': { lat: 1.311, lng: 103.856, area: 'Little India / Jalan Besar' },
  '21': { lat: 1.314, lng: 103.851, area: 'Farrer Park / Serangoon Rd' },
  '22': { lat: 1.304, lng: 103.836, area: 'Orchard / Somerset' },
  '23': { lat: 1.299, lng: 103.838, area: 'River Valley / Killiney' },
  '24': { lat: 1.307, lng: 103.824, area: 'Tanglin / Napier' },
  '25': { lat: 1.316, lng: 103.818, area: 'Bukit Timah / Botanic Gardens' },
  '26': { lat: 1.319, lng: 103.805, area: 'Holland Village / Coronation' },
  '27': { lat: 1.312, lng: 103.788, area: 'Holland / Ulu Pandan' },
  '28': { lat: 1.332, lng: 103.814, area: 'Watten / Dunearn' },
  '29': { lat: 1.325, lng: 103.839, area: 'Thomson / Novena North' },
  '30': { lat: 1.321, lng: 103.844, area: 'Novena / Moulmein' },
  '31': { lat: 1.334, lng: 103.851, area: 'Toa Payoh Central' },
  '32': { lat: 1.328, lng: 103.856, area: 'Balestier / Whampoa' },
  '33': { lat: 1.326, lng: 103.864, area: 'Boon Keng / Bendemeer' },
  '34': { lat: 1.336, lng: 103.874, area: 'Macpherson / Potong Pasir' },
  '35': { lat: 1.348, lng: 103.872, area: 'Braddell / Bartley' },
  '36': { lat: 1.341, lng: 103.886, area: 'Aljunied / Tai Seng' },
  '37': { lat: 1.349, lng: 103.882, area: 'Paya Lebar Air Base area' },
  '38': { lat: 1.316, lng: 103.886, area: 'Geylang / Guillemard' },
  '39': { lat: 1.309, lng: 103.888, area: 'Mountbatten / Old Airport' },
  '40': { lat: 1.319, lng: 103.898, area: 'Eunos / Ubi' },
  '41': { lat: 1.324, lng: 103.909, area: 'Kaki Bukit / Bedok Reservoir' },
  '42': { lat: 1.306, lng: 103.904, area: 'Katong / Joo Chiat' },
  '43': { lat: 1.301, lng: 103.899, area: 'Marine Parade / Tanjong Rhu' },
  '44': { lat: 1.304, lng: 103.914, area: 'Marine Parade / Telok Kurau' },
  '45': { lat: 1.312, lng: 103.924, area: 'Siglap / Frankel' },
  '46': { lat: 1.324, lng: 103.931, area: 'Bedok Central / New Town' },
  '47': { lat: 1.331, lng: 103.922, area: 'Bedok Reservoir Road' },
  '48': { lat: 1.321, lng: 103.948, area: 'Upper East Coast / Bayshore' },
  '49': { lat: 1.365, lng: 103.972, area: 'Loyang / Changi Village' },
  '50': { lat: 1.352, lng: 103.978, area: 'Changi North / Aviation Park' },
  '51': { lat: 1.372, lng: 103.951, area: 'Pasir Ris Central' },
  '52': { lat: 1.353, lng: 103.945, area: 'Tampines Central' },
  '53': { lat: 1.368, lng: 103.889, area: 'Hougang / Kovan' },
  '54': { lat: 1.391, lng: 103.895, area: 'Sengkang Central' },
  '55': { lat: 1.362, lng: 103.869, area: 'Serangoon Garden / Chuan' },
  '56': { lat: 1.369, lng: 103.849, area: 'Ang Mo Kio Central' },
  '57': { lat: 1.354, lng: 103.847, area: 'Bishan / Marymount' },
  '58': { lat: 1.341, lng: 103.774, area: 'Upper Bukit Timah / Beauty World' },
  '59': { lat: 1.336, lng: 103.766, area: 'Bukit Batok East' },
  '60': { lat: 1.333, lng: 103.743, area: 'Jurong East / Jurong Gateway' },
  '61': { lat: 1.319, lng: 103.719, area: 'Jurong West / Boon Lay' },
  '62': { lat: 1.321, lng: 103.684, area: 'Pioneer / Pioneer Road' },
  '63': { lat: 1.349, lng: 103.636, area: 'Tuas / Tuas Checkpoint' },
  '64': { lat: 1.342, lng: 103.692, area: 'Jurong West / Nanyang / NTU' },
  '65': { lat: 1.358, lng: 103.754, area: 'Bukit Batok West / Bukit Gombak' },
  '66': { lat: 1.368, lng: 103.768, area: 'Hillview / Dairy Farm' },
  '67': { lat: 1.379, lng: 103.763, area: 'Bukit Panjang / Senja' },
  '68': { lat: 1.385, lng: 103.744, area: 'Choa Chu Kang Central' },
  '69': { lat: 1.412, lng: 103.708, area: 'Lim Chu Kang / Sungei Gedong' },
  '70': { lat: 1.378, lng: 103.715, area: 'Tengah New Town' },
  '71': { lat: 1.405, lng: 103.722, area: 'Kranji West' },
  '72': { lat: 1.428, lng: 103.752, area: 'Kranji / Sungei Kadut' },
  '73': { lat: 1.442, lng: 103.774, area: 'Woodlands / Woodlands Checkpoint' },
  '75': { lat: 1.446, lng: 103.821, area: 'Sembawang / Admiralty' },
  '76': { lat: 1.428, lng: 103.837, area: 'Yishun Central / Khatib' },
  '77': { lat: 1.388, lng: 103.824, area: 'Upper Thomson / Springleaf' },
  '78': { lat: 1.398, lng: 103.829, area: 'Mandai / Seletar Reservoir' },
  '79': { lat: 1.411, lng: 103.868, area: 'Seletar Aerospace Park' },
  '80': { lat: 1.406, lng: 103.874, area: 'Seletar Hills / Jalan Kayu' },
  '81': { lat: 1.364, lng: 103.991, area: 'Changi Airport / Aviation' },
  '82': { lat: 1.405, lng: 103.902, area: 'Punggol Waterway / Central' },
};

/**
 * Key Singapore Landmarks, Checkpoints, and Expressway Exits
 */
export const LOCAL_SINGAPORE_LOCATIONS: GeocodedLocation[] = [
  // Checkpoints
  {
    id: 'loc-woodlands-checkpoint',
    name: 'Woodlands Checkpoint',
    address: 'Woodlands Crossing, Singapore 738203',
    latitude: 1.4470237,
    longitude: 103.771654,
    postalCode: '738203',
    type: 'checkpoint',
    subtitle: 'Woodlands Causeway towards Johor Bahru (Malaysia)',
  },
  {
    id: 'loc-woodlands-causeway',
    name: 'Woodlands Causeway (Towards Johor)',
    address: 'Woodlands Causeway, Singapore 730589',
    latitude: 1.4520,
    longitude: 103.7680,
    postalCode: '730589',
    type: 'checkpoint',
    subtitle: 'Primary northern land border crossing',
  },
  {
    id: 'loc-tuas-checkpoint',
    name: 'Tuas Checkpoint (Second Link)',
    address: 'Jalan Ahmad Ibrahim, Singapore 638384',
    latitude: 1.3496,
    longitude: 103.6366,
    postalCode: '638384',
    type: 'checkpoint',
    subtitle: 'Tuas Second Link towards Sultan Abu Bakar Complex',
  },
  {
    id: 'loc-tuas-complex',
    name: 'Tuas Checkpoint Complex (Arrival / Departure)',
    address: '501 Jalan Ahmad Ibrahim, Singapore 639937',
    latitude: 1.3468,
    longitude: 103.6385,
    postalCode: '639937',
    type: 'checkpoint',
    subtitle: 'Western link customs & immigration clearance',
  },

  // PIE (Pan Island Expressway) Exits & Nodes
  {
    id: 'loc-pie-exit-3',
    name: 'PIE Exit 3 (Bedok North / Eunos)',
    address: 'Pan Island Expressway near Eunos Flyover',
    latitude: 1.3315,
    longitude: 103.9180,
    type: 'expressway',
    subtitle: 'Pan Island Expressway (towards Changi Airport)',
  },
  {
    id: 'loc-pie-exit-9',
    name: 'PIE Exit 9 (Paya Lebar / MacPherson)',
    address: 'Pan Island Expressway near Paya Lebar Way',
    latitude: 1.3275,
    longitude: 103.8890,
    type: 'expressway',
    subtitle: 'Pan Island Expressway (towards Tuas / Airport)',
  },
  {
    id: 'loc-pie-exit-15',
    name: 'PIE Exit 15 (Kallang Way / Aljunied)',
    address: 'Pan Island Expressway near Woodsville Flyover',
    latitude: 1.3280,
    longitude: 103.8720,
    type: 'expressway',
    subtitle: 'Pan Island Expressway intersection with CTE',
  },
  {
    id: 'loc-pie-exit-20',
    name: 'PIE Exit 20 (Whitley Road / Adam Road)',
    address: 'Pan Island Expressway near Mount Pleasant Flyover',
    latitude: 1.3320,
    longitude: 103.8240,
    type: 'expressway',
    subtitle: 'Pan Island Expressway (Central Corridor)',
  },
  {
    id: 'loc-pie-exit-26',
    name: 'PIE Exit 26 (Clementi Road / Bukit Timah)',
    address: 'Pan Island Expressway near Jalan Anak Bukit',
    latitude: 1.3450,
    longitude: 103.7710,
    type: 'expressway',
    subtitle: 'Pan Island Expressway western bypass',
  },
  {
    id: 'loc-pie-exit-35',
    name: 'PIE Exit 35 (Bukit Batok / Jurong)',
    address: 'Pan Island Expressway near Bukit Batok Road',
    latitude: 1.3420,
    longitude: 103.7420,
    type: 'expressway',
    subtitle: 'Pan Island Expressway towards Tuas',
  },

  // BKE (Bukit Timah Expressway)
  {
    id: 'loc-bke-exit-9',
    name: 'BKE Exit 9 / Woodlands Flyover',
    address: 'Bukit Timah Expressway near Woodlands Centre',
    latitude: 1.4390,
    longitude: 103.7740,
    type: 'expressway',
    subtitle: 'Final expressway stretch towards Woodlands Checkpoint',
  },
  {
    id: 'loc-bke-mandai',
    name: 'BKE near Mandai Road',
    address: 'Bukit Timah Expressway near Mandai Flyover',
    latitude: 1.4082,
    longitude: 103.7782,
    type: 'expressway',
    subtitle: 'BKE corridor towards PIE / SLE',
  },
  {
    id: 'loc-bke-dairy-farm',
    name: 'BKE near Dairy Farm Road',
    address: 'Bukit Timah Expressway near Dairy Farm Flyover',
    latitude: 1.3650,
    longitude: 103.7720,
    type: 'expressway',
    subtitle: 'BKE southern connection to PIE',
  },

  // CTE (Central Expressway)
  {
    id: 'loc-cte-amk',
    name: 'CTE near Ang Mo Kio Ave 1',
    address: 'Central Expressway near Ang Mo Kio Ave 1 Flyover',
    latitude: 1.3653,
    longitude: 103.8569,
    type: 'expressway',
    subtitle: 'Central Expressway northern feeder',
  },
  {
    id: 'loc-cte-braddell',
    name: 'CTE near Braddell Road Flyover',
    address: 'Central Expressway near Braddell Road',
    latitude: 1.3480,
    longitude: 103.8590,
    type: 'expressway',
    subtitle: 'Central Expressway towards City / AYE',
  },
  {
    id: 'loc-cte-moulmein',
    name: 'CTE near Moulmein Road',
    address: 'Central Expressway near Moulmein / Balestier',
    latitude: 1.3210,
    longitude: 103.8490,
    type: 'expressway',
    subtitle: 'Central Expressway City tunnel entrance',
  },
  {
    id: 'loc-cte-chin-swee',
    name: 'CTE near Chin Swee Road / Outram',
    address: 'Central Expressway near Outram Tunnel',
    latitude: 1.2860,
    longitude: 103.8390,
    type: 'expressway',
    subtitle: 'Central Expressway southern exit to AYE',
  },

  // AYE (Ayer Rajah Expressway)
  {
    id: 'loc-aye-keppel',
    name: 'AYE near Keppel Road',
    address: 'Ayer Rajah Expressway near Keppel Viaduct',
    latitude: 1.2721,
    longitude: 103.8344,
    type: 'expressway',
    subtitle: 'Ayer Rajah Expressway southern terminal',
  },
  {
    id: 'loc-aye-clementi',
    name: 'AYE near Clementi Road / NUS',
    address: 'Ayer Rajah Expressway near Clementi Flyover',
    latitude: 1.3120,
    longitude: 103.7620,
    type: 'expressway',
    subtitle: 'AYE towards Tuas / Jurong',
  },
  {
    id: 'loc-aye-jurong',
    name: 'AYE near Jurong Town Hall Road',
    address: 'Ayer Rajah Expressway near Jurong Town Hall',
    latitude: 1.3260,
    longitude: 103.7380,
    type: 'expressway',
    subtitle: 'AYE industrial corridor',
  },

  // Other Major Roads & Landmarks
  {
    id: 'loc-sentosa-gateway',
    name: 'Sentosa Gateway / HarbourFront',
    address: 'Sentosa Gateway, Singapore 098585',
    latitude: 1.2600,
    longitude: 103.8236,
    postalCode: '098585',
    type: 'landmark',
    subtitle: 'Gateway to Sentosa Island & Telok Blangah',
  },
  {
    id: 'loc-changi-airport',
    name: 'Singapore Changi Airport (Terminals 1-4)',
    address: 'Airport Boulevard, Singapore 819642',
    latitude: 1.3644,
    longitude: 103.9915,
    postalCode: '819642',
    type: 'landmark',
    subtitle: 'ECP / PIE eastern terminus',
  },
  {
    id: 'loc-marina-bay',
    name: 'Marina Bay / MCE (Marina Coastal Expressway)',
    address: 'Marina Boulevard, Singapore 018980',
    latitude: 1.2789,
    longitude: 103.8536,
    postalCode: '018980',
    type: 'landmark',
    subtitle: 'Downtown financial district & subterranean expressway',
  },
  {
    id: 'loc-jurong-east',
    name: 'Jurong East Gateway / Westgate',
    address: '3 Gateway Drive, Singapore 608532',
    latitude: 1.3329,
    longitude: 103.7436,
    postalCode: '608532',
    type: 'landmark',
    subtitle: 'Jurong Lake District commercial core',
  },
  {
    id: 'loc-woodlands-square',
    name: 'Woodlands Square / Woodlands MRT',
    address: 'Woodlands Square, Singapore 737737',
    latitude: 1.4368,
    longitude: 103.7865,
    postalCode: '737737',
    type: 'landmark',
    subtitle: 'Woodlands Regional Centre',
  },
  {
    id: 'loc-tampines-hub',
    name: 'Our Tampines Hub',
    address: '1 Tampines Walk, Singapore 528523',
    latitude: 1.3530,
    longitude: 103.9405,
    postalCode: '528523',
    type: 'landmark',
    subtitle: 'Tampines Regional Centre',
  },
  {
    id: 'loc-orchard-road',
    name: 'Orchard Road / ION Orchard',
    address: '2 Orchard Turn, Singapore 238801',
    latitude: 1.3040,
    longitude: 103.8318,
    postalCode: '238801',
    type: 'landmark',
    subtitle: 'Central shopping belt',
  },
];

/**
 * Searches Singapore locations with support for:
 * 1. 6-digit postal codes (exact or postal sector centroid)
 * 2. Road names and expressway exits (e.g. "PIE Exit 3", "Woodlands Checkpoint", "BKE")
 * 3. Landmarks and checkpoints
 * 4. Asynchronous OneMap search enhancement with fallback
 */
export async function searchSingaporeLocations(query: string): Promise<GeocodedLocation[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const lowerQuery = cleanQuery.toLowerCase();
  const results: GeocodedLocation[] = [];
  const seenIds = new Set<string>();

  // Check 1: 6-digit Postal Code pattern (e.g., "730589" or "638384")
  const postalMatch = cleanQuery.match(/\b\d{6}\b/);
  if (postalMatch) {
    const postalCode = postalMatch[0];
    const sector = postalCode.substring(0, 2);

    // Direct match against known specific location first
    const exactLocalMatch = LOCAL_SINGAPORE_LOCATIONS.find(
      (loc) => loc.postalCode === postalCode,
    );
    if (exactLocalMatch) {
      results.push(exactLocalMatch);
      seenIds.add(exactLocalMatch.id);
    } else if (POSTAL_SECTOR_MAP[sector]) {
      const sectorInfo = POSTAL_SECTOR_MAP[sector];
      const postalLocation: GeocodedLocation = {
        id: `postal-${postalCode}`,
        name: `Postal Code ${postalCode} (${sectorInfo.area})`,
        address: `Singapore Postal Sector ${sector} (${sectorInfo.area})`,
        latitude: sectorInfo.lat,
        longitude: sectorInfo.lng,
        postalCode: postalCode,
        type: 'postal',
        subtitle: `Sector ${sector}: ${sectorInfo.area}`,
      };
      results.push(postalLocation);
      seenIds.add(postalLocation.id);
    }
  }

  // Check 2: Match local Singapore landmarks, expressways, and exits
  for (const loc of LOCAL_SINGAPORE_LOCATIONS) {
    if (seenIds.has(loc.id)) continue;

    const nameMatch = loc.name.toLowerCase().includes(lowerQuery);
    const addressMatch = loc.address.toLowerCase().includes(lowerQuery);
    const subtitleMatch = loc.subtitle?.toLowerCase().includes(lowerQuery) || false;
    const postalMatch = loc.postalCode?.includes(cleanQuery) || false;

    // Support acronym aliases like "PIE", "BKE", "CTE", "AYE", "SLE", "MCE"
    let aliasMatch = false;
    if (lowerQuery.startsWith('pie') && loc.name.toLowerCase().includes('pie')) aliasMatch = true;
    if (lowerQuery.startsWith('bke') && loc.name.toLowerCase().includes('bke')) aliasMatch = true;
    if (lowerQuery.startsWith('cte') && loc.name.toLowerCase().includes('cte')) aliasMatch = true;
    if (lowerQuery.startsWith('aye') && loc.name.toLowerCase().includes('aye')) aliasMatch = true;

    if (nameMatch || addressMatch || subtitleMatch || postalMatch || aliasMatch) {
      results.push(loc);
      seenIds.add(loc.id);
    }
  }

  // Check 3: If query looks like 2-digit postal sector or postal code prefix
  if (/^\d{2,5}$/.test(cleanQuery)) {
    const prefix = cleanQuery.substring(0, 2);
    if (POSTAL_SECTOR_MAP[prefix]) {
      const sectorInfo = POSTAL_SECTOR_MAP[prefix];
      const id = `postal-prefix-${prefix}`;
      if (!seenIds.has(id)) {
        results.push({
          id,
          name: `Postal Sector ${prefix} (${sectorInfo.area})`,
          address: `Singapore Postal Code prefix ${prefix}XXXX`,
          latitude: sectorInfo.lat,
          longitude: sectorInfo.lng,
          type: 'postal',
          subtitle: sectorInfo.area,
        });
        seenIds.add(id);
      }
    }
  }

  // Check 4: Query OneMap API for broader real-time address search with timeout
  if (cleanQuery.length >= 3 && results.length < 8) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const oneMapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
        cleanQuery,
      )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

      const res = await fetch(oneMapUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          for (const item of data.results.slice(0, 5)) {
            const lat = parseFloat(item.LATITUDE);
            const lng = parseFloat(item.LONGITUDE);

            if (!isNaN(lat) && !isNaN(lng)) {
              const id = `onemap-${item.POSTAL || item.BUILDING || item.SEARCHVAL}-${lat}-${lng}`;
              if (!seenIds.has(id)) {
                results.push({
                  id,
                  name: item.BUILDING && item.BUILDING !== 'NIL' ? item.BUILDING : item.SEARCHVAL,
                  address: item.ADDRESS || `${item.ROAD_NAME || ''}, Singapore ${item.POSTAL || ''}`.trim(),
                  latitude: lat,
                  longitude: lng,
                  postalCode: item.POSTAL !== 'NIL' ? item.POSTAL : undefined,
                  type: item.POSTAL ? 'postal' : 'road',
                  subtitle: item.ROAD_NAME || 'OneMap Singapore Geocode',
                });
                seenIds.add(id);
              }
            }
          }
        }
      }
    } catch {
      // Graceful fallback to local results if OneMap is unreachable or times out
    }
  }

  return results.slice(0, 8);
}
