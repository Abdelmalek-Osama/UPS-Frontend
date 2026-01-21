/**
 * Directorate mapping utilities
 * Maps directorate names to their IDs for API requests
 */

const DIRECTORATE_ID_MAP: Record<string, number> = {
  'Assiut': 1,
  'Minia': 2,
  'Bani-suef': 3,
  'Giza': 4,
  'Fayoum': 5,
};

export function getDirectorateIdByName(name: string): number {
  return DIRECTORATE_ID_MAP[name] || 0;
}

export function getDirectorateNameById(id: number): string {
  const entry = Object.entries(DIRECTORATE_ID_MAP).find(([_, value]) => value === id);
  return entry ? entry[0] : '';
}
