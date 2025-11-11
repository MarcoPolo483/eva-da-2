// src/lib/projectRegistryStore.ts
// Simple localStorage-backed project registry store used by the demo CRUD UI.
export const STORE_KEY = "eva.projectRegistry.v0.68";
export type StorePayload<T> = {
  version: string;
  items: T[];
};

export function loadRegistry<T>(defaults: T[]): T[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    
    // If nothing in localStorage, return defaults
    if (!raw) {
      console.log('[Registry] No data in localStorage, using defaults');
      return defaults;
    }
    
    const parsed: StorePayload<T> = JSON.parse(raw);
    
    // If parsed data is invalid or empty, return defaults
    if (!parsed || !Array.isArray(parsed.items)) {
      console.warn('[Registry] Invalid data structure, using defaults');
      return defaults;
    }
    
    // If items array is empty, return defaults
    if (parsed.items.length === 0) {
      console.warn('[Registry] Empty items array, using defaults');
      return defaults;
    }
    
    // CRITICAL: Ensure 'admin' project always exists
    const hasAdmin = parsed.items.some((entry: any) => entry.id === 'admin');
    if (!hasAdmin) {
      console.warn('[Registry] Admin project missing! Adding from defaults...');
      const adminProject = defaults.find((entry: any) => entry.id === 'admin');
      if (adminProject) {
        parsed.items.push(adminProject);
      }
    }
    
    return parsed.items;
  } catch (err) {
    // Corrupt storage or parse error — fall back to defaults
    // eslint-disable-next-line no-console
    console.warn("Failed to load registry from localStorage, using defaults:", err);
    return defaults;
  }
}

export function saveRegistry<T>(items: T[]) {
  try {
    // CRITICAL: Ensure 'admin' project is always included
    const hasAdmin = items.some((entry: any) => entry.id === 'admin');
    if (!hasAdmin) {
      console.error('[Registry] Attempted to save registry without admin project! Operation blocked.');
      return false;
    }
    
    const payload: StorePayload<T> = { version: "0.68", items };
    localStorage.setItem(STORE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to save registry to localStorage:", err);
    return false;
  }
}

export function exportRegistry<T>(items: T[]) {
  const payload: StorePayload<T> = { version: "0.68", items };
  return JSON.stringify(payload, null, 2);
}

export function importRegistry<T>(json: string): T[] | null {
  try {
    const parsed = JSON.parse(json) as StorePayload<T> | T[];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray((parsed as StorePayload<T>).items)) {
      return (parsed as StorePayload<T>).items;
    }
    return null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse imported registry JSON:", err);
    return null;
  }
}
