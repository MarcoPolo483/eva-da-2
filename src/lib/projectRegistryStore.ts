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
    if (!raw) return defaults;
    const parsed: StorePayload<T> = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return defaults;
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
