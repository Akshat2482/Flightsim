import { FlightPreset, Landmark } from '../types/flight';

export const FLIGHT_PRESETS: FlightPreset[] = [
  {
    id: 'swiss-alps',
    name: 'Swiss Alps & Bernese Oberland',
    subtitle: 'Reference Scene: Grindelwald, Männlichen, Eiger & Bern',
    latitude: 46.592,
    longitude: 7.915,
    altitude: 2850,
    heading: 320,
    pitch: -2,
    roll: 0,
    speed: 340,
    landmarks: [
      { id: 'sw-1', name: 'Bern', category: 'city', latitude: 46.948, longitude: 7.4474, elevation: 542, region: 'Canton of Bern', country: 'Switzerland' },
      { id: 'sw-2', name: 'Grindelwald', category: 'town', latitude: 46.6242, longitude: 8.0414, elevation: 1034, region: 'Bernese Highlands', country: 'Switzerland' },
      { id: 'sw-3', name: 'Männlichen', category: 'peak', latitude: 46.6133, longitude: 7.9422, elevation: 2343, region: 'Bernese Highlands', country: 'Switzerland' },
      { id: 'sw-4', name: 'Lütschental', category: 'town', latitude: 46.6347, longitude: 7.9483, elevation: 714, region: 'Bernese Highlands', country: 'Switzerland' },
      { id: 'sw-5', name: 'Burglauenen', category: 'town', latitude: 46.636, longitude: 7.986, elevation: 896, region: 'Bernese Highlands', country: 'Switzerland' },
      { id: 'sw-6', name: 'Faulhorn Reeti', category: 'peak', latitude: 46.6744, longitude: 7.9997, elevation: 2681, region: 'Bernese Highlands', country: 'Switzerland' },
      { id: 'sw-7', name: 'First Cliff Walk', category: 'landmark', latitude: 46.6603, longitude: 8.0531, elevation: 2168, region: 'Grindelwald-First', country: 'Switzerland' },
      { id: 'sw-8', name: 'Beatenberg', category: 'town', latitude: 46.6983, longitude: 7.7881, elevation: 1129, region: 'Lake Thun', country: 'Switzerland' },
      { id: 'sw-9', name: 'Hintisberg', category: 'peak', latitude: 46.6492, longitude: 8.0189, elevation: 2150, region: 'Bernese Highlands', country: 'Switzerland' },
      { id: 'sw-10', name: 'Fribourg', category: 'city', latitude: 46.8065, longitude: 7.162, elevation: 610, region: 'Canton of Fribourg', country: 'Switzerland' },
      { id: 'sw-11', name: 'Neuchâtel', category: 'city', latitude: 46.99, longitude: 6.9293, elevation: 444, region: 'Lake Neuchâtel', country: 'Switzerland' },
      { id: 'sw-12', name: 'Drunengalm', category: 'peak', latitude: 46.6111, longitude: 7.6322, elevation: 2408, region: 'Simmental', country: 'Switzerland' },
      { id: 'sw-13', name: 'Eiger (North Face)', category: 'peak', latitude: 46.5778, longitude: 8.0053, elevation: 3967, region: 'Jungfrau Region', country: 'Switzerland' },
      { id: 'sw-14', name: 'Jungfrau', category: 'peak', latitude: 46.5369, longitude: 7.9625, elevation: 4158, region: 'Jungfrau Region', country: 'Switzerland' },
      { id: 'sw-15', name: 'Mönch', category: 'peak', latitude: 46.5583, longitude: 7.9989, elevation: 4107, region: 'Jungfrau Region', country: 'Switzerland' },
      { id: 'sw-16', name: 'Interlaken', category: 'city', latitude: 46.6863, longitude: 7.8632, elevation: 566, region: 'Bernese Oberland', country: 'Switzerland' },
      { id: 'sw-17', name: 'Lake Thun', category: 'landmark', latitude: 46.689, longitude: 7.728, elevation: 558, region: 'Bernese Oberland', country: 'Switzerland' },
      { id: 'sw-18', name: 'Thun', category: 'city', latitude: 46.758, longitude: 7.628, elevation: 560, region: 'Canton of Bern', country: 'Switzerland' },
      { id: 'sw-19', name: 'Meiringen Air Base', category: 'airport', latitude: 46.7442, longitude: 8.1103, elevation: 577, region: 'Haslital', country: 'Switzerland' }
    ]
  },
  {
    id: 'san-francisco',
    name: 'San Francisco & Bay Area',
    subtitle: 'Golden Gate, Alcatraz & Silicon Valley Ridge',
    latitude: 37.8199,
    longitude: -122.4783,
    altitude: 1200,
    heading: 195,
    pitch: -3,
    roll: 0,
    speed: 360,
    landmarks: [
      { id: 'sf-1', name: 'Golden Gate Bridge', category: 'landmark', latitude: 37.8199, longitude: -122.4783, elevation: 67, region: 'California', country: 'USA' },
      { id: 'sf-2', name: 'San Francisco', category: 'city', latitude: 37.7749, longitude: -122.4194, elevation: 52, region: 'California', country: 'USA' },
      { id: 'sf-3', name: 'Alcatraz Island', category: 'landmark', latitude: 37.8267, longitude: -122.4233, elevation: 40, region: 'California', country: 'USA' },
      { id: 'sf-4', name: 'Oakland', category: 'city', latitude: 37.8044, longitude: -122.2712, elevation: 13, region: 'California', country: 'USA' },
      { id: 'sf-5', name: 'Mount Tamalpais', category: 'peak', latitude: 37.9235, longitude: -122.5965, elevation: 785, region: 'Marin County', country: 'USA' },
      { id: 'sf-6', name: 'Mount Diablo', category: 'peak', latitude: 37.8816, longitude: -121.9142, elevation: 1173, region: 'Contra Costa', country: 'USA' },
      { id: 'sf-7', name: 'San Francisco Intl Airport (SFO)', category: 'airport', latitude: 37.6213, longitude: -122.379, elevation: 4, region: 'California', country: 'USA' },
      { id: 'sf-8', name: 'Silicon Valley / San Jose', category: 'city', latitude: 37.3382, longitude: -121.8863, elevation: 25, region: 'California', country: 'USA' }
    ]
  },
  {
    id: 'grand-canyon',
    name: 'Grand Canyon & Colorado Plateau',
    subtitle: 'Dramatic Canyons, South Rim & Desert Horizons',
    latitude: 36.0544,
    longitude: -112.1401,
    altitude: 2500,
    heading: 75,
    pitch: -4,
    roll: 0,
    speed: 380,
    landmarks: [
      { id: 'gc-1', name: 'Grand Canyon South Rim', category: 'landmark', latitude: 36.0544, longitude: -112.1401, elevation: 2134, region: 'Arizona', country: 'USA' },
      { id: 'gc-2', name: 'North Rim Visitor Center', category: 'landmark', latitude: 36.1983, longitude: -112.0528, elevation: 2500, region: 'Arizona', country: 'USA' },
      { id: 'gc-3', name: 'Phantom Ranch', category: 'town', latitude: 36.105, longitude: -112.095, elevation: 750, region: 'Arizona', country: 'USA' },
      { id: 'gc-4', name: 'Desert View Watchtower', category: 'landmark', latitude: 36.0427, longitude: -111.8266, elevation: 2267, region: 'Arizona', country: 'USA' },
      { id: 'gc-5', name: 'Grand Canyon National Park Airport', category: 'airport', latitude: 35.9524, longitude: -112.147, elevation: 2024, region: 'Arizona', country: 'USA' },
      { id: 'gc-6', name: 'Humphreys Peak', category: 'peak', latitude: 35.3464, longitude: -111.678, elevation: 3852, region: 'Arizona', country: 'USA' }
    ]
  },
  {
    id: 'mount-fuji',
    name: 'Mount Fuji & Tokyo Metropolis',
    subtitle: 'Snow-capped Volcano, Fuji Five Lakes & Kanto Plain',
    latitude: 35.3606,
    longitude: 138.7274,
    altitude: 4600,
    heading: 90,
    pitch: -2,
    roll: 0,
    speed: 350,
    landmarks: [
      { id: 'fj-1', name: 'Mount Fuji Summit', category: 'peak', latitude: 35.3606, longitude: 138.7274, elevation: 3776, region: 'Shizuoka/Yamanashi', country: 'Japan' },
      { id: 'fj-2', name: 'Lake Kawaguchi', category: 'landmark', latitude: 35.5171, longitude: 138.7518, elevation: 830, region: 'Yamanashi', country: 'Japan' },
      { id: 'fj-3', name: 'Hakone', category: 'town', latitude: 35.2323, longitude: 139.1069, elevation: 110, region: 'Kanagawa', country: 'Japan' },
      { id: 'fj-4', name: 'Tokyo City Center', category: 'city', latitude: 35.6762, longitude: 139.6503, elevation: 40, region: 'Tokyo', country: 'Japan' },
      { id: 'fj-5', name: 'Yokohama', category: 'city', latitude: 35.4437, longitude: 139.638, elevation: 12, region: 'Kanagawa', country: 'Japan' },
      { id: 'fj-6', name: 'Tokyo Haneda Airport', category: 'airport', latitude: 35.5494, longitude: 139.7798, elevation: 11, region: 'Tokyo', country: 'Japan' }
    ]
  },
  {
    id: 'himalayas',
    name: 'Himalayas & Mount Everest',
    subtitle: 'Roof of the World: Everest, Lhotse & Khumbu Glacier',
    latitude: 27.9881,
    longitude: 86.925,
    altitude: 9600,
    heading: 135,
    pitch: -1,
    roll: 0,
    speed: 420,
    landmarks: [
      { id: 'hm-1', name: 'Mount Everest (Sagarmatha)', category: 'peak', latitude: 27.9881, longitude: 86.925, elevation: 8849, region: 'Solukhumbu', country: 'Nepal / Tibet' },
      { id: 'hm-2', name: 'Lhotse', category: 'peak', latitude: 27.9617, longitude: 86.9333, elevation: 8516, region: 'Mahalangur', country: 'Nepal' },
      { id: 'hm-3', name: 'Nuptse', category: 'peak', latitude: 27.9667, longitude: 86.8833, elevation: 7861, region: 'Mahalangur', country: 'Nepal' },
      { id: 'hm-4', name: 'Ama Dablam', category: 'peak', latitude: 27.9022, longitude: 86.8617, elevation: 6812, region: 'Khumbu', country: 'Nepal' },
      { id: 'hm-5', name: 'Namche Bazaar', category: 'town', latitude: 27.805, longitude: 86.711, elevation: 3440, region: 'Khumbu', country: 'Nepal' },
      { id: 'hm-6', name: 'Lukla Tenzing-Hillary Airport', category: 'airport', latitude: 27.6869, longitude: 86.7291, elevation: 2845, region: 'Solukhumbu', country: 'Nepal' }
    ]
  }
];

// In-memory cache for dynamic Overpass API queries
const overpassCache = new Map<string, Landmark[]>();

/**
 * Fetches dynamic landmarks and peaks from OpenStreetMap's free Overpass API
 * for any bounding box around the current aircraft position.
 */
export async function fetchLiveOverpassLandmarks(
  lat: number,
  lon: number,
  radiusKm = 25
): Promise<Landmark[]> {
  // Simple bounding box calculation
  const deltaLat = radiusKm / 111;
  const deltaLon = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const south = (lat - deltaLat).toFixed(3);
  const north = (lat + deltaLat).toFixed(3);
  const west = (lon - deltaLon).toFixed(3);
  const east = (lon + deltaLon).toFixed(3);

  const cacheKey = `${south},${west},${north},${east}`;
  if (overpassCache.has(cacheKey)) {
    return overpassCache.get(cacheKey)!;
  }

  try {
    const query = `[out:json][timeout:6];(
      node["place"~"city|town|village"](${south},${west},${north},${east});
      node["natural"="peak"](${south},${west},${north},${east});
      node["aeroway"="aerodrome"](${south},${west},${north},${east});
    );out body 25;`;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results: Landmark[] = [];

    if (data.elements && Array.isArray(data.elements)) {
      for (const el of data.elements) {
        if (!el.tags || !el.tags.name) continue;
        const name = el.tags.name;
        let category: Landmark['category'] = 'landmark';
        if (el.tags.place === 'city') category = 'city';
        else if (el.tags.place === 'town' || el.tags.place === 'village') category = 'town';
        else if (el.tags.natural === 'peak') category = 'peak';
        else if (el.tags.aeroway === 'aerodrome') category = 'airport';

        const ele = el.tags.ele ? parseFloat(el.tags.ele) : 0;

        results.push({
          id: `osm-${el.id}`,
          name,
          category,
          latitude: el.lat,
          longitude: el.lon,
          elevation: isNaN(ele) ? 100 : ele,
          region: el.tags['is_in'] || el.tags['addr:state'] || 'OpenStreetMap',
          country: el.tags['addr:country'] || ''
        });
      }
    }

    overpassCache.set(cacheKey, results);
    return results;
  } catch {
    return [];
  }
}
