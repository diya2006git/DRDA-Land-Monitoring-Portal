
import { LandRecord, LandStatus } from '../types';
import { MOCK_LANDS } from '../constants';

const LANDS_STORAGE_KEY = 'drda_lands_v1';

// Simulated DB Initialization for Lands
const getLandDb = (): LandRecord[] => {
  const data = localStorage.getItem(LANDS_STORAGE_KEY);
  if (!data) {
    // Transform mock lands to match the new schema structure if necessary
    const initial = MOCK_LANDS.map(l => ({
      ...l,
      geoBoundary: {
        type: 'Polygon' as const,
        coordinates: [l.boundaries]
      }
    }));
    localStorage.setItem(LANDS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

/**
 * GET /api/lands
 * Fetches all land records from the simulated database.
 */
export const fetchAllLandsApi = async (): Promise<LandRecord[]> => {
  console.log("[BACKEND] GET /api/lands");
  await new Promise(resolve => setTimeout(resolve, 300));
  const lands = getLandDb();
  console.log("Fetched lands:", lands.length);
  return lands;
};

/**
 * POST /api/lands
 * Saves a new land record to the simulated database.
 */
export const createLandApi = async (landData: Partial<LandRecord>): Promise<LandRecord> => {
  console.log("Saving land:", landData);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date().toISOString();
  const db = getLandDb();
  
  const newLand: LandRecord = {
    id: `LND-${Math.floor(Math.random() * 90000) + 10000}`,
    surveyNumber: landData.surveyNumber || 'UNKNOWN',
    district: landData.district || '',
    taluk: landData.taluk || '',
    village: landData.village || '',
    area: Number(landData.area) || 0,
    status: landData.status || 'GOVERNMENT',
    geoBoundary: landData.geoBoundary || {
      type: 'Polygon',
      coordinates: [[ [12.923, 80.103], [12.925, 80.103], [12.925, 80.106], [12.923, 80.106] ]]
    },
    boundaries: landData.boundaries || [[12.923, 80.103], [12.925, 80.103], [12.925, 80.106], [12.923, 80.106]],
    documents: [],
    registeredAt: now,
    createdAt: now,
    updatedAt: now
  };

  db.push(newLand);
  localStorage.setItem(LANDS_STORAGE_KEY, JSON.stringify(db));
  console.log("[API RESPONSE] 201 Created", newLand);
  return newLand;
};

/**
 * Simulates searching lands with filtering.
 */
export const searchLandsApi = async (query: string, filter: string): Promise<LandRecord[]> => {
  const timestamp = new Date().toLocaleTimeString();
  const trimmedQuery = query.trim();
  
  console.log(`[API REQUEST ${timestamp}] GET /api/lands/search?q="${trimmedQuery}"&filter="${filter}"`);
  await new Promise(resolve => setTimeout(resolve, 300));

  const q = trimmedQuery.toLowerCase();
  const lands = getLandDb();
  
  const results = lands.filter(land => {
    const matchesQuery = !q || 
      land.surveyNumber.toLowerCase().includes(q) ||
      land.village.toLowerCase().includes(q) ||
      land.district.toLowerCase().includes(q);
    
    const matchesFilter = filter === 'ALL' || land.status === filter;
    return matchesQuery && matchesFilter;
  });

  console.log(`[API RESPONSE] Found ${results.length} matches`);
  return results;
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const lands = getLandDb();
    const suggestions = lands
        .filter(l => 
          l.surveyNumber.toLowerCase().includes(q) || 
          l.village.toLowerCase().includes(q)
        )
        .map(l => l.surveyNumber)
        .slice(0, 5);
    return Array.from(new Set(suggestions));
};
