# EVA DA 2.0 - Screen Parameter Configuration Guide

## 🎯 **Overview**

This document maps all configurable parameters across EVA DA 2.0 screens, distinguishing between **Project-Specific**, **Global**, and **User** level settings. This addresses the current issue of hardcoded parameters that need to be properly configured.

## 🏛️ **Context**

- **EVA DA 2.0**: Modern UI for Microsoft Information Assistant (enterprise-grade)
- **EVA Foundation 2.0**: Enhanced backend based on Microsoft IA with future agent/MCP support
- **Legacy Systems**: EVA DA (IA-based) and EVA Chat (OpenWebUI) are deprecated
- **Development Agents**: Current 6 agents are for build/deployment, not runtime AI agents

---

## 📱 **Screen Parameter Mapping**

### **1. Project Registry Screen**

#### **Project-Specific Parameters**
```typescript
interface ProjectConfiguration {
  // Business Metadata
  businessInfo: {
    domain: string;                    // e.g., "Insurance & Benefits"
    owner: string;                     // e.g., "John Smith"
    costCentre: string;               // e.g., "CC-2024-INS-001"
    department: string;               // e.g., "Digital Services"
    contactInfo: {
      email: string;
      phone: string;
      manager: string;
    };
    businessCase: string;             // Justification for project
    expectedUsers: number;            // Projected user count
    launchDate: Date;                // Target go-live date
  };

  // Technical Configuration
  technical: {
    apiEndpoints: {
      primary: string;                // Main API endpoint
      backup: string;                 // Failover endpoint
      timeout: number;                // Request timeout (ms)
      retryCount: number;             // Max retry attempts
    };
    dataConfig: {
      cosmosEndpoint: string;         // Cosmos DB endpoint
      containerName: string;          // Data container
      partitionKey: string[];         // HPK configuration
      indexingPolicy: object;         // Custom indexing rules
    };
    aiConfig: {
      openaiEndpoint: string;         // Azure OpenAI endpoint
      deploymentName: string;         // Model deployment
      maxTokens: number;              // Token limit
      temperature: number;            // AI creativity setting
    };
  };

  // Resource Allocation
  resources: {
    compute: {
      cpuLimit: string;               // e.g., "2000m"
      memoryLimit: string;            // e.g., "4Gi"
      storageQuota: string;           // e.g., "100Gi"
    };
    scaling: {
      minReplicas: number;            // Minimum instances
      maxReplicas: number;            // Maximum instances
      targetCpuPercent: number;       // CPU threshold for scaling
    };
    costs: {
      budgetLimit: number;            // Monthly budget cap
      alertThreshold: number;         // Alert at % of budget
      billingCode: string;            // Chargeback code
    };
  };

  // Data Sources
  dataSources: {
    sharepoint: {
      siteUrl: string;
      libraryName: string;
      credentials: string;            // Managed identity or service principal
      syncFrequency: string;          // e.g., "hourly", "daily"
    };
    fileSystems: Array<{
      path: string;
      type: "network" | "local" | "cloud";
      accessCredentials: string;
    }>;
    databases: Array<{
      connectionString: string;
      type: "sql" | "nosql" | "graph";
      queryTemplates: object;
    }>;
  };

  // Access Control
  access: {
    userGroups: string[];             // AD security groups
    permissions: {
      read: string[];                 // Who can view
      write: string[];                // Who can modify
      admin: string[];                // Who can configure
    };
    approvalWorkflow: {
      required: boolean;
      approvers: string[];
      escalationPath: string[];
    };
  };

  // Compliance Settings
  compliance: {
    dataClassification: "Public" | "Internal" | "Confidential" | "Protected A" | "Protected B" | "Protected C";
    retentionPolicy: {
      duration: string;               // e.g., "7years"
      archiveAfter: string;          // e.g., "2years"
      deleteAfter: string;           // e.g., "10years"
    };
    auditRequirements: {
      logAllAccess: boolean;
      logDataChanges: boolean;
      complianceFramework: string[];  // e.g., ["PIPEDA", "ATIP"]
    };
    geographicRestrictions: {
      allowedRegions: string[];       // e.g., ["Canada-Central", "Canada-East"]
      dataResidency: boolean;         // Must stay in Canada
    };
  };
}
```

#### **Theme Configuration Parameters**
```typescript
interface ProjectTheme {
  // Color Palette
  colors: {
    primary: string;                  // Main brand color
    primaryHover: string;             // Hover state
    secondary: string;                // Secondary accent
    accent: string;                   // Call-to-action color
    background: string;               // Main background
    surface: string;                  // Card/panel background
    surfaceHover: string;             // Interactive surface hover
    text: {
      primary: string;                // Main text color
      secondary: string;              // Muted text
      inverse: string;                // Text on dark backgrounds
    };
    status: {
      success: string;                // Green for success states
      warning: string;                // Yellow/orange for warnings
      error: string;                  // Red for errors
      info: string;                   // Blue for information
    };
    government: {
      redBar: string;                 // Government red bar
      blueAccent: string;             // Government blue
      grayscale: string[];            // Official grayscale palette
    };
  };

  // Typography
  typography: {
    fontFamilies: {
      primary: string;                // e.g., "Noto Sans, sans-serif"
      heading: string;                // For headings
      monospace: string;              // For code/technical text
    };
    fontSizes: {
      xs: string;                     // 12px
      sm: string;                     // 14px
      base: string;                   // 16px (configurable)
      lg: string;                     // 18px
      xl: string;                     // 20px
      "2xl": string;                  // 24px
      "3xl": string;                  // 30px
    };
    fontWeights: {
      normal: number;                 // 400
      medium: number;                 // 500
      semibold: number;              // 600
      bold: number;                   // 700
    };
    lineHeights: {
      tight: number;                  // 1.25
      normal: number;                 // 1.5
      relaxed: number;                // 1.75
    };
  };

  // Layout & Spacing
  layout: {
    spacing: {
      xs: string;                     // 4px
      sm: string;                     // 8px
      md: string;                     // 16px
      lg: string;                     // 24px
      xl: string;                     // 32px
    };
    borderRadius: {
      sm: string;                     // 2px
      md: string;                     // 6px
      lg: string;                     // 8px
      full: string;                   // 9999px
    };
    shadows: {
      sm: string;                     // Subtle shadow
      md: string;                     // Default shadow
      lg: string;                     // Prominent shadow
    };
  };

  // Accessibility
  accessibility: {
    contrastRatios: {
      aa: number;                     // 4.5:1 minimum
      aaa: number;                    // 7:1 enhanced
    };
    focusIndicators: {
      color: string;                  // Focus ring color
      width: string;                  // Focus ring width
      style: "solid" | "dashed";      // Focus ring style
    };
    screenReaderSettings: {
      skipLinksEnabled: boolean;
      landmarkLabels: boolean;
      announceChanges: boolean;
    };
  };

  // Branding Elements
  branding: {
    logo: {
      primary: string;                // Main logo URL
      secondary: string;              // Alternative logo
      favicon: string;                // Browser icon
    };
    icons: {
      set: "heroicons" | "lucide" | "custom";
      customPath?: string;            // Path to custom icon set
    };
    watermarks: {
      enabled: boolean;
      text: string;                   // e.g., "PROTECTED B"
      position: "top-right" | "bottom-right" | "center";
      opacity: number;                // 0.1 - 1.0
    };
  };
}
```

### **2. Global App Admin Screen**

#### **Global Configuration Parameters**
```typescript
interface GlobalConfiguration {
  // System Authentication
  authentication: {
    provider: "AzureAD" | "ADFS" | "Custom";
    settings: {
      tenantId: string;
      clientId: string;
      redirectUri: string;
      scopes: string[];
    };
    sessionManagement: {
      tokenExpiration: number;        // Minutes
      refreshThreshold: number;       // Minutes before expiry to refresh
      maxSessions: number;            // Per user
      inactivityTimeout: number;      // Minutes
    };
    multiFactorAuth: {
      required: boolean;
      methods: string[];              // "sms", "app", "hardware"
      exemptGroups: string[];         // Groups exempt from MFA
    };
  };

  // Infrastructure Settings
  infrastructure: {
    azure: {
      subscriptionId: string;
      resourceGroup: string;
      preferredRegions: string[];     // Ordered by preference
      availabilityZones: string[];
    };
    scaling: {
      autoScaleEnabled: boolean;
      policies: Array<{
        metric: string;               // CPU, memory, requests/sec
        threshold: number;
        action: "scale-up" | "scale-down";
        cooldown: number;             // Minutes
      }>;
    };
    backup: {
      frequency: string;              // "hourly", "daily", "weekly"
      retention: string;              // "30days", "1year", etc.
      crossRegionReplication: boolean;
    };
  };

  // Monitoring & Observability
  monitoring: {
    applicationInsights: {
      instrumentationKey: string;
      samplingPercentage: number;     // 0-100
      enableDependencyTracking: boolean;
    };
    logging: {
      level: "debug" | "info" | "warn" | "error";
      destinations: string[];         // "console", "file", "azure"
      structuredLogging: boolean;
    };
    alerting: {
      channels: Array<{
        type: "email" | "teams" | "webhook";
        endpoint: string;
        severity: string[];           // Which severities to send
      }>;
      thresholds: {
        errorRate: number;            // Percentage
        responseTime: number;         // Milliseconds
        availability: number;         // Percentage
      };
    };
  };

  // Security Settings
  security: {
    encryption: {
      atRest: {
        enabled: boolean;
        keyVaultUrl: string;
        keyName: string;
      };
      inTransit: {
        tlsVersion: "1.2" | "1.3";
        certificateSource: "managed" | "custom";
      };
    };
    compliance: {
      framework: string[];            // "SOC2", "ISO27001", etc.
      dataClassificationDefault: string;
      auditLogRetention: string;      // "7years" for government
    };
    networkSecurity: {
      allowedIpRanges: string[];      // CIDR blocks
      firewallRules: Array<{
        name: string;
        source: string;
        destination: string;
        ports: string[];
        protocol: "tcp" | "udp" | "icmp";
      }>;
    };
  };

  // Feature Flags
  features: {
    experimentalFeatures: {
      enabled: boolean;
      allowedGroups: string[];        // Who can access beta features
    };
    rolloutControls: Array<{
      feature: string;
      percentage: number;             // 0-100 rollout percentage
      targetGroups: string[];         // Specific groups to target
    }>;
    maintenanceMode: {
      enabled: boolean;
      message: string;                // Message to display
      allowedUsers: string[];         // Who can access during maintenance
    };
  };
}
```

### **3. Multi-Tenant Management**

#### **Tenant Configuration Parameters**
```typescript
interface TenantConfiguration {
  // Tenant Isolation
  isolation: {
    dataIsolation: "complete" | "logical" | "shared";
    computeIsolation: "dedicated" | "shared";
    networkIsolation: {
      enabled: boolean;
      vnetId?: string;
      subnetId?: string;
    };
  };

  // Resource Quotas
  quotas: {
    users: {
      max: number;
      current: number;
      warningThreshold: number;       // Alert at % of max
    };
    storage: {
      maxGb: number;
      currentGb: number;
      tierConfiguration: {
        hot: number;                  // GB in hot tier
        cool: number;                 // GB in cool tier
        archive: number;              // GB in archive tier
      };
    };
    compute: {
      maxCpuHours: number;           // Monthly CPU hour limit
      maxMemoryGb: number;           // Maximum memory allocation
      maxConcurrentSessions: number;
    };
    costs: {
      monthlyBudget: number;
      currentSpend: number;
      forecastedSpend: number;
      alertThresholds: number[];      // Alert at these percentages
    };
  };

  // Service Level Agreements
  sla: {
    availability: {
      target: number;                 // e.g., 99.9%
      measurement: "monthly" | "quarterly" | "yearly";
      penalties: Array<{
        threshold: number;            // Below this availability %
        penalty: number;              // Credit percentage
      }>;
    };
    performance: {
      responseTime: {
        target: number;               // Milliseconds
        percentile: number;           // e.g., 95th percentile
      };
      throughput: {
        target: number;               // Requests per second
        measurement: "peak" | "average";
      };
    };
    support: {
      responseTime: {
        critical: string;             // e.g., "1hour"
        high: string;                 // e.g., "4hours"
        medium: string;               // e.g., "24hours"
        low: string;                  // e.g., "72hours"
      };
    };
  };

  // Governance & Compliance
  governance: {
    approvalWorkflows: Array<{
      action: string;                 // "create_project", "modify_quota", etc.
      approvers: string[];
      escalationPath: string[];
      timeoutDays: number;
    }>;
    changeManagement: {
      approvalRequired: boolean;
      rollbackPlan: boolean;
      testingRequired: boolean;
      communicationPlan: boolean;
    };
    auditTrail: {
      enabled: boolean;
      retention: string;              // "7years"
      scope: string[];                // What to audit
    };
  };
}
```

---

## 🚧 **Missing Screen Components**

### **4. Chat Interface** (Not Yet Implemented)

#### **Chat Configuration Parameters**
```typescript
interface ChatConfiguration {
  // Message Handling
  messaging: {
    maxHistoryLength: number;         // Number of messages to keep
    contextWindow: number;            // Tokens for context
    messageFormatting: {
      markdown: boolean;
      codeHighlighting: boolean;
      mathRendering: boolean;
    };
    attachments: {
      enabled: boolean;
      allowedTypes: string[];         // File extensions
      maxSizeBytes: number;
    };
  };

  // AI Model Configuration
  aiModel: {
    deployment: string;               // Model deployment name
    parameters: {
      temperature: number;            // 0.0 - 2.0
      topP: number;                  // 0.0 - 1.0
      maxTokens: number;             // Response length limit
      stopSequences: string[];       // Stop generation at these
      frequencyPenalty: number;      // -2.0 to 2.0
      presencePenalty: number;       // -2.0 to 2.0
    };
    fallback: {
      enabled: boolean;
      fallbackModel: string;
      conditions: string[];          // When to fallback
    };
  };

  // User Experience
  ux: {
    typingIndicator: boolean;
    messageThreading: boolean;
    searchCapabilities: boolean;
    voiceInput: boolean;
    voiceOutput: boolean;
    suggestions: {
      enabled: boolean;
      maxSuggestions: number;
      contextAware: boolean;
    };
  };

  // Personalization
  personalization: {
    userPreferences: {
      theme: string;
      language: string;
      timezone: string;
      notifications: boolean;
    };
    conversationHistory: {
      enabled: boolean;
      retention: string;             // "30days", "1year", etc.
      searchable: boolean;
    };
    favorites: {
      enabled: boolean;
      maxFavorites: number;
      categories: string[];
    };
  };
}
```

### **5. Dashboard & Analytics Screen**

#### **Analytics Configuration Parameters**
```typescript
interface AnalyticsConfiguration {
  // Performance Metrics
  performance: {
    responseTime: {
      buckets: number[];             // Histogram buckets in ms
      alertThresholds: number[];     // Alert levels
      aggregationPeriod: string;     // "1m", "5m", "1h"
    };
    throughput: {
      measurement: "requests_per_second" | "requests_per_minute";
      capacity: number;              // Max expected throughput
    };
    errorRates: {
      categories: string[];          // Error types to track
      alertThreshold: number;        // Error rate % to alert on
    };
    userSatisfaction: {
      enabled: boolean;
      surveyFrequency: string;       // "weekly", "monthly"
      targetScore: number;           // Out of 10
    };
  };

  // Usage Analytics
  usage: {
    userMetrics: {
      activeUsers: {
        timeframes: string[];        // "daily", "weekly", "monthly"
        segments: string[];          // User segments to track
      };
      sessionDuration: {
        buckets: number[];           // Duration buckets in minutes
        targetDuration: number;      // Ideal session length
      };
      featureUsage: {
        features: string[];          // Features to track
        heatmaps: boolean;          // UI heatmap tracking
      };
    };
    contentMetrics: {
      popularQueries: {
        topN: number;               // Number of top queries to show
        timeframe: string;          // Period to analyze
      };
      documentAccess: {
        tracking: boolean;
        topDocuments: number;
      };
    };
  };

  // Cost Analytics
  cost: {
    tracking: {
      granularity: "daily" | "weekly" | "monthly";
      categories: string[];          // Cost categories to track
      budgetComparison: boolean;
    };
    optimization: {
      recommendations: boolean;
      automatedOptimization: boolean;
      savingsTargets: number;       // Percentage
    };
    forecasting: {
      enabled: boolean;
      horizon: string;              // "30days", "90days", "1year"
      accuracy: number;             // Target accuracy %
    };
  };

  // Security Monitoring
  security: {
    authentication: {
      loginAttempts: boolean;
      failedLogins: number;         // Alert threshold
      suspiciousPatterns: boolean;
    };
    accessPatterns: {
      monitoring: boolean;
      anomalyDetection: boolean;
      baselineWindow: string;       // "30days" to establish baseline
    };
    threatDetection: {
      enabled: boolean;
      severity: string[];           // Severities to monitor
      responseActions: string[];    // Automated responses
    };
  };
}
```

---

## 🔄 **Parameter Inheritance Model**

### **Hierarchy: Global → Project → User**

1. **Global Defaults**: Set in Global App Admin
2. **Project Overrides**: Project-specific customizations
3. **User Preferences**: Individual user settings

### **Configuration Validation Rules**

```typescript
interface ValidationRules {
  required: string[];               // Required parameters
  constraints: {
    [key: string]: {
      type: "string" | "number" | "boolean" | "array" | "object";
      min?: number;
      max?: number;
      pattern?: string;             // RegEx pattern
      allowedValues?: any[];        // Enum values
    };
  };
  dependencies: {
    [key: string]: {
      requires: string[];           // Other parameters that must be set
      conflicts: string[];          // Parameters that cannot be set together
    };
  };
}
```

### **Change Tracking & Audit**

```typescript
interface ConfigurationAudit {
  changes: Array<{
    timestamp: Date;
    user: string;
    action: "create" | "update" | "delete";
    parameter: string;
    oldValue: any;
    newValue: any;
    reason: string;
    approver?: string;
  }>;
  rollback: {
    enabled: boolean;
    maxVersions: number;
    retentionPeriod: string;
  };
}
```

---

## 📋 **Implementation Roadmap**

### **Phase 1: Parameter Extraction** (Current)
- [ ] Audit all components for hardcoded values
- [ ] Create parameter inventory and categorization
- [ ] Design configuration schema and validation

### **Phase 2: Configuration System** (Next)
- [ ] Implement global configuration store
- [ ] Create project configuration management
- [ ] Add user preference handling

### **Phase 3: UI Implementation** (Following)
- [ ] Build configuration management screens
- [ ] Add validation and error handling
- [ ] Implement import/export capabilities

### **Phase 4: Advanced Features** (Future)
- [ ] Configuration versioning and rollback
- [ ] Automated configuration optimization
- [ ] Template-based project setup

This comprehensive parameter mapping provides the foundation for transforming EVA DA 2.0 from a demonstration to a production-ready, configurable enterprise platform.
