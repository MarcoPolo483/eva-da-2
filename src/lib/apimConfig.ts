// APIM configuration types and defaults
export interface ApimConfig {
  mode: 'local' | 'azure';
  // Local mock settings
  localPort?: number;
  // Azure APIM settings
  apiEndpoint?: string;
  apiVersion?: string;
  subscriptionKey?: string;
  subscriptionRegion?: string;
  // Feature flags
  features?: {
    enableMetrics?: boolean;
    enableTracing?: boolean;
    enableCache?: boolean;
  };
}

// Default configuration for local development
export const defaultLocalConfig: ApimConfig = {
  mode: 'local',
  localPort: 5178,
  features: {
    enableMetrics: true,
    enableTracing: true,
    enableCache: false
  }
};

// Template for Azure configuration
export const defaultAzureConfig: ApimConfig = {
  mode: 'azure',
  apiEndpoint: 'https://{instance}.azure-api.net/eva/v1',
  apiVersion: '2023-11-09',
  subscriptionKey: '',
  subscriptionRegion: 'canadacentral',
  features: {
    enableMetrics: true,
    enableTracing: true,
    enableCache: true
  }
};