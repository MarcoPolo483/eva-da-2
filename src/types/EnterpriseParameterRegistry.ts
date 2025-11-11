// Enterprise Parameter Registry Type Definitions
// Based on Siebel-inspired data modeling principles

export interface EnterpriseParameterRegistry {
  systemConfig: SystemConfig;
  tenancyConfig: TenancyConfig;
  aiConfig: AIConfig;
  dataConfig: DataConfig;
  accessibilityConfig: AccessibilityConfig;
  integrationConfig: IntegrationConfig;
  monitoringConfig: MonitoringConfig;
  agentConfig: AgentConfig;
}

// System Configuration Types
export interface SystemConfig {
  platformCore: {
    version: string;
    environment: 'development' | 'staging' | 'production';
    maintenanceMode: boolean;
    debugLevel: 'error' | 'warn' | 'info' | 'debug';
    featureFlags: Record<string, boolean>;
  };
  performance: {
    maxConcurrentUsers: number;
    responseTimeThresholds: {
      warning: number; // milliseconds
      critical: number;
    };
    resourceLimits: {
      maxMemoryUsage: number; // MB
      maxCPUUsage: number; // percentage
      maxDiskUsage: number; // GB
    };
    cachingSettings: {
      ttl: number; // seconds
      maxCacheSize: number; // MB
      compressionEnabled: boolean;
    };
  };
  security: {
    authenticationSettings: {
      tokenExpiry: number; // minutes
      refreshTokenExpiry: number; // days
      maxLoginAttempts: number;
      lockoutDuration: number; // minutes
    };
    dataClassification: {
      defaultLevel: 'public' | 'internal' | 'protected_a' | 'protected_b';
      autoClassificationEnabled: boolean;
      piiDetectionEnabled: boolean;
    };
    encryptionSettings: {
      encryptionAtRest: boolean;
      encryptionInTransit: boolean;
      keyRotationInterval: number; // days
    };
  };
}

// Multi-Tenancy Configuration Types
export interface TenancyConfig {
  tenants: Record<string, {
    id: string;
    name: string;
    displayName: string;
    status: 'active' | 'suspended' | 'pending';
    resourceQuotas: {
      maxUsers: number;
      maxProjects: number;
      maxStorageGB: number;
      maxAPICallsPerHour: number;
    };
    customSettings: Record<string, string | number | boolean>;
    billingSettings: {
      billingModel: 'usage' | 'subscription' | 'enterprise';
      costCenter: string;
      budgetAlerts: number[];
    };
  }>;
}

// AI Configuration Types
export interface AIConfig {
  models: {
    openAI: {
      gpt4: {
        enabled: boolean;
        endpoint: string;
        apiKey: string;
        maxTokens: number;
        temperature: number;
        rateLimits: {
          requestsPerMinute: number;
          tokensPerMinute: number;
        };
      };
      gpt4Turbo: {
        enabled: boolean;
        endpoint: string;
        apiKey: string;
        maxTokens: number;
        temperature: number;
      };
      textEmbedding: {
        model: 'text-embedding-ada-002' | 'text-embedding-3-small' | 'text-embedding-3-large';
        dimensions: number;
        batchSize: number;
      };
    };
  };
  guardrails: {
    contentFiltering: {
      enabled: boolean;
      strictness: 'low' | 'medium' | 'high';
      customFilters: string[];
    };
    piiRedaction: {
      enabled: boolean;
      redactionTypes: ('email' | 'phone' | 'ssn' | 'address')[];
      redactionChar: string;
    };
    responseValidation: {
      maxResponseLength: number;
      profanityFilter: boolean;
      factualityCheck: boolean;
    };
  };
  promptTemplates: {
    systemPrompts: Record<string, {
      content: string;
      version: string;
      domain: string;
      language: 'en' | 'fr' | 'bilingual';
    }>;
    userPromptEnhancements: {
      contextInjection: boolean;
      domainSpecificPrefix: boolean;
      complianceFooter: boolean;
    };
  };
}

// Data Configuration Types
export interface DataConfig {
  cosmosDB: {
    connectionStrings: Record<string, string>;
    containers: Record<string, {
      partitionKey: string;
      hierarchicalPartitionKeys?: string[];
      throughput: number;
      autoScale: boolean;
      ttl: number;
      indexingPolicy: Record<string, unknown>;
    }>;
    consistency: 'eventual' | 'session' | 'bounded_staleness' | 'strong' | 'consistent_prefix';
    regions: string[];
    backupPolicy: {
      enabled: boolean;
      interval: number; // hours
      retention: number; // days
    };
  };
  azureSearch: {
    serviceUrl: string;
    apiKey: string;
    indexes: Record<string, {      fields: Record<string, unknown>[];
      scoringProfiles: Record<string, unknown>[];
      analyzers: Record<string, unknown>[];
      semanticConfiguration: Record<string, unknown>;
    }>;
    searchSettings: {
      maxResults: number;
      timeout: number; // seconds
      fuzzySearch: boolean;
      semanticSearch: boolean;
    };
  };
  ingestionPipelines: {
    documentProcessing: {
      supportedFormats: string[];
      ocrEnabled: boolean;
      chunkingStrategy: 'fixed' | 'semantic' | 'recursive';
      chunkSize: number;
      chunkOverlap: number;
    };
    vectorization: {
      embeddingModel: string;
      batchSize: number;
      dimensions: number;
      similarity: 'cosine' | 'dot_product' | 'euclidean';
    };
    qualityControl: {
      duplicateDetection: boolean;
      contentValidation: boolean;
      metadataEnrichment: boolean;
    };
  };
}

// Accessibility Configuration Types (High Priority)
export interface AccessibilityConfig {
  wcagCompliance: {
    level: 'A' | 'AA' | 'AAA';
    guidelines: string[];
    automaticTesting: boolean;
    manualTestingSchedule: string; // cron expression
  };
  screenReaderSupport: {
    ariaLabelsRequired: boolean;
    descriptiveTextRequired: boolean;
    landmarkNavigation: boolean;
    skipLinks: boolean;
  };
  keyboardNavigation: {
    tabOrder: 'logical' | 'source';
    focusIndicators: boolean;
    keyboardShortcuts: Record<string, string>;
    escapeKeyBehavior: 'close' | 'cancel' | 'previous';
  };
  visualDesign: {
    colorContrast: {
      minimumRatio: number; // WCAG standard
      largeTextRatio: number;
      autoCheck: boolean;
    };
    textScaling: {
      maxScale: number; // percentage
      reflow: boolean;
      minFontSize: number; // pixels
    };
    motionAndAnimation: {
      respectReducedMotion: boolean;
      autoplayVideos: boolean;
      parallaxEffects: boolean;
    };
  };
  languageSupport: {
    defaultLanguage: 'en' | 'fr';
    supportedLanguages: string[];
    rightToLeft: boolean;
    languageDetection: boolean;
    translationFallback: boolean;
  };
}

// Integration Configuration Types
export interface IntegrationConfig {
  apim: {
    gatewayUrl: string;
    subscriptionKey: string;
    policies: Record<string, unknown>;
    rateLimiting: {
      global: {
        requestsPerMinute: number;
        requestsPerHour: number;
      };
      perUser: {
        requestsPerMinute: number;
        requestsPerHour: number;
      };
      perTenant: {
        requestsPerMinute: number;
        requestsPerHour: number;
      };
    };
  };  externalAPIs: Record<string, {
    baseUrl: string;
    authentication: Record<string, unknown>;
    timeout: number;
    retryPolicy: {
      maxRetries: number;
      backoffStrategy: 'linear' | 'exponential';
      baseDelay: number;
    };
    healthCheck: {
      endpoint: string;
      interval: number; // seconds
      timeout: number; // seconds
    };
  }>;
  webhooks: {    inbound: Record<string, {
      endpoint: string;
      authentication: Record<string, unknown>;
      eventTypes: string[];
    }>;
    outbound: Record<string, {
      url: string;
      events: string[];
      retryPolicy: Record<string, unknown>;
    }>;
  };
}

// Monitoring Configuration Types
export interface MonitoringConfig {
  applicationInsights: {
    connectionString: string;
    samplingRate: number; // percentage
    enableDependencyTracking: boolean;
    enablePerformanceCounters: boolean;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    destinations: ('console' | 'file' | 'azure' | 'elk')[];
    retention: number; // days
    structuredLogging: boolean;
  };
  alerting: {
    channels: Record<string, {
      type: 'email' | 'teams' | 'slack' | 'webhook';
      configuration: Record<string, unknown>;
    }>;
    rules: Record<string, {
      condition: string;
      threshold: number;
      duration: number; // minutes
      severity: 'low' | 'medium' | 'high' | 'critical';
      channels: string[];
    }>;
  };
  analytics: {
    userBehavior: {
      trackingEnabled: boolean;
      eventTracking: string[];
      sessionRecording: boolean;
      heatmaps: boolean;
    };
    businessIntelligence: {
      reportingSchedule: string; // cron expression
      dashboards: string[];
      dataRetention: number; // months
    };
  };
}

// Agent Configuration Types
export interface AgentConfig {
  orchestration: {
    maxConcurrentAgents: number;
    taskQueueSize: number;
    taskTimeout: number; // minutes
    retryPolicy: {
      maxRetries: number;
      backoffStrategy: 'linear' | 'exponential';
    };
  };
  agentSettings: Record<string, {
    enabled: boolean;
    priority: number;
    resourceAllocation: {
      cpu: number; // percentage
      memory: number; // MB
    };
    scalingPolicy: {
      minInstances: number;
      maxInstances: number;
      targetUtilization: number; // percentage
    };
  }>;
}

// Validation Types
export interface ValidationResult {
  isValid?: boolean;
  [sectionId: string]: ValidationSectionResult | boolean | undefined;
}

export interface ValidationSectionResult {
  errors?: Array<{ field: string; message: string; }>;
  warnings?: Array<{ field: string; message: string; }>;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// Component Props Types
export interface ParameterSectionProps<T> {
  config: T;
  onChange: (config: T) => void;
  validationResults: ValidationResult;
  readOnly: boolean;
}

// Real-time Monitoring Types
export interface RealTimeMetrics {
  apiCalls: {
    current: number;
    peak: number;
    distribution: Record<string, number>;
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
  };
  costs: {
    realTimeBurn: number;
    dailyProjection: number;
    topCostCenters: Array<{ name: string; cost: number; }>;
  };
  agentWorkloads: {
    activeAgents: number;
    queuedTasks: number;
    completedTasks: number;
  };
}

export interface AlertThreshold {
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
  duration: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Multi-Agent Orchestration Types
export interface AgentTask {
  id: string;
  agentType: string;
  taskType: string;  input: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout: number; // minutes
  retryCount: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface AgentOrchestrationWorkflow {
  id: string;
  name: string;
  description: string;
  sequence: Array<{
    agent: string;
    tasks: string[];
    duration?: string;
    dependsOn?: string;
    parallel?: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  coordination: 'sequential' | 'parallel' | 'pipeline' | 'real-time';
  totalDuration?: string;
  output?: string;
}

// All types are already exported as interfaces above