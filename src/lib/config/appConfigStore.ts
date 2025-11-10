// src/lib/config/appConfigStore.ts
// Simple localStorage-backed app/global configuration store used by the admin UI.

export const APP_STORE_KEY = "eva.appConfig.v0.75";

export type DesignSystem = {
  baseFontPx: number;
  spacingScale: number;
  brandFont?: string;
};

export type MockApimDefault = {
  mode: "local" | "azure";
  localPort?: number;
  apiEndpoint?: string;
  apiVersion?: string;
};

export type AppConfig = {
  version: string;
  defaultLanguage: string; // e.g. "en"
  allowProjectThemeOverride: boolean;
  designSystem: DesignSystem;
  featureFlags: Record<string, boolean>;
  mockApimDefault: MockApimDefault;
};

export const DEFAULT_APP_CONFIG: AppConfig = {
  version: "0.75",
  defaultLanguage: "en",
  allowProjectThemeOverride: true,
  designSystem: {
    baseFontPx: 16,
    spacingScale: 4,
    brandFont: "Inter, system-ui, sans-serif"
  },
  featureFlags: {
    enableMockApim: true,
    enableTracing: false,
    enableMetrics: false
  },
  mockApimDefault: {
    mode: "local",
    localPort: 7071
  }
};

export function loadAppConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(APP_STORE_KEY);
    if (!raw) return DEFAULT_APP_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return { ...DEFAULT_APP_CONFIG, ...parsed };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to load app config, using defaults:", err);
    return DEFAULT_APP_CONFIG;
  }
}

export function saveAppConfig(cfg: AppConfig) {
  try {
    localStorage.setItem(APP_STORE_KEY, JSON.stringify(cfg));
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to save app config:", err);
    return false;
  }
}

export function exportAppConfig(cfg: AppConfig) {
  return JSON.stringify(cfg, null, 2);
}

export function importAppConfig(json: string): AppConfig | null {
  try {
    const parsed = JSON.parse(json) as AppConfig;
    if (!parsed) return null;
    return { ...DEFAULT_APP_CONFIG, ...parsed };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse app config JSON:", err);
    return null;
  }
}
