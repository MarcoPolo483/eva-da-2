// src/lib/config/projectConfigStore.ts
// Wrapper around existing project registry store to provide migration and a stable API

import {
  loadRegistry as loadLegacyRegistry,
  importRegistry as importLegacyRegistry,
  STORE_KEY as LEGACY_KEY
} from "../projectRegistryStore";

export const PROJECT_STORE_KEY = "eva.projectConfig.v0.75";

export type ProjectStorePayload<T> = {
  version: string;
  items: T[];
};

export function loadProjectConfig<T>(defaults: T[]): T[] {
  try {
    // If a new key exists, prefer it
    const raw = localStorage.getItem(PROJECT_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProjectStorePayload<T>;
      if (parsed && Array.isArray(parsed.items)) return parsed.items;
    }

    // Otherwise, try to migrate from legacy store
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const migrated = importLegacyRegistry<T>(legacyRaw as string);
      if (migrated) {
        // Save to new key
        saveProjectConfig(migrated);
        return migrated;
      }
    }

    // Fall back to the legacy loader (which may read defaults)
    return (loadLegacyRegistry as unknown as typeof loadLegacyRegistry)(defaults);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to load project config, using defaults:", err);
    return defaults;
  }
}

export function saveProjectConfig<T>(items: T[]) {
  try {
    const payload: ProjectStorePayload<T> = { version: "0.75", items };
    localStorage.setItem(PROJECT_STORE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to save project config:", err);
    return false;
  }
}

export function exportProjectConfig<T>(items: T[]) {
  const payload: ProjectStorePayload<T> = { version: "0.75", items };
  return JSON.stringify(payload, null, 2);
}

export function importProjectConfig<T>(json: string): T[] | null {
  try {
    const parsed = JSON.parse(json) as ProjectStorePayload<T> | T[];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray((parsed as ProjectStorePayload<T>).items)) {
      return (parsed as ProjectStorePayload<T>).items;
    }
    return null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse imported project config:", err);
    return null;
  }
}
