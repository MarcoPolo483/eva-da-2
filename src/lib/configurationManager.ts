// src/lib/configurationManager.ts
// Configuration Management System for EVA DA 2.0
// Implements Global → Project → User parameter inheritance model

export interface GlobalConfiguration {
  platform: {
    name: string;
    version: string;
    baseUrl: string;
    supportEmail: string;
    maxProjectsPerUser: number;
    sessionTimeout: number; // minutes
  };
  security: {
    requireMFA: boolean;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
    };
    allowedDomains: string[];
    maxLoginAttempts: number;
  };
  performance: {
    defaultTimeout: number; // ms
    maxRetries: number;
    cacheTimeout: number; // minutes
    batchSize: number;
  };
  monitoring: {
    enableTelemetry: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    applicationInsightsKey?: string;
  };
  features: {
    enableJurisprudence: boolean;
    enableMultiTenant: boolean;
    enableAdvancedAnalytics: boolean;
    enableRealTimeChat: boolean;
  };
}

export interface ProjectConfiguration {
  id: string;
  name: string;
  displayName: string;
  
  // Business Metadata
  businessInfo: {
    domain: string;
    owner: string;
    costCentre: string;
    department: string;
    contactInfo: {
      email: string;
      phone?: string;
      manager?: string;
    };
    businessCase?: string;
    expectedUsers?: number;
    launchDate?: Date;
  };

  // Technical Configuration
  technical: {
    apiEndpoints: {
      primary: string;
      backup?: string;
      timeout: number;
      retryCount: number;
    };
    dataConfig: {
      cosmosEndpoint?: string;
      containerName: string;
      partitionKey: string[];
      indexingPolicy?: object;
      throughput: number; // RU/s
    };
    searchConfig: {
      service: string;
      indexName: string;
      apiVersion: string;
      vectorDimensions?: number;
      semanticConfig?: string;
    };
    aiConfig: {
      deployment: string;
      model: string;
      maxTokens: number;
      temperature: number;
      systemPrompt: string;
      templates: string[];
    };
  };

  // UI Customization
  uiConfig: {
    theme: {
      name: string;
      primary: string;
      accent: string;
      background: string;
      surface: string;
      baseFontPx: number;
    };
    branding: {
      logo?: string;
      favicon?: string;
      title: string;
      subtitle?: string;
      footerText?: string;
    };
    layout: {
      showSidebar: boolean;
      sidebarWidth: number;
      headerHeight: number;
      maxContentWidth: number;
    };
    features: {
      enableChat: boolean;
      enableFileUpload: boolean;
      enableExport: boolean;
      enableHistory: boolean;
      showProjectInfo: boolean;
    };
  };

  // Compliance & Governance
  compliance: {
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    retentionPolicy: {
      chatHistory: number; // days
      userActivity: number; // days
      auditLogs: number; // days
    };
    auditConfig: {
      enableFullAudit: boolean;
      logUserActions: boolean;
      logSystemEvents: boolean;
      exportFormat: 'json' | 'csv' | 'excel';
    };
    accessControl: {
      requireApproval: boolean;
      allowGuestAccess: boolean;
      ipWhitelist?: string[];
      timeRestrictions?: {
        startTime: string; // HH:MM
        endTime: string;   // HH:MM
        timezone: string;
      };
    };
  };

  // Jurisprudence-Specific (if applicable)
  jurisprudenceConfig?: {
    enableCaseLawSearch: boolean;
    enableRegulatoryCompliance: boolean;
    enableBilingualProcessing: boolean;
    supportedJurisdictions: string[];
    legalDatabases: {
      primary: string;
      secondary?: string[];
    };
    complianceFrameworks: string[];
  };
}

export interface UserConfiguration {
  userId: string;
  preferences: {
    language: 'en' | 'fr';
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
    notifications: {
      email: boolean;
      browser: boolean;
      frequency: 'immediate' | 'daily' | 'weekly';
    };
  };
  projectAccess: {
    [projectId: string]: {
      role: 'viewer' | 'user' | 'contributor' | 'admin';
      permissions: string[];
      lastAccessed?: Date;
    };
  };
  customizations: {
    dashboardLayout?: object;
    favoriteProjects: string[];
    recentQueries: string[];
    savedSearches: Array<{
      name: string;
      query: string;
      projectId: string;
    }>;
  };
}

// Configuration Storage Keys
const GLOBAL_CONFIG_KEY = 'eva.globalConfig.v1';
const PROJECT_CONFIG_KEY = 'eva.projectConfig.v1';
const USER_CONFIG_KEY = 'eva.userConfig.v1';

// Default Configurations
const DEFAULT_GLOBAL_CONFIG: GlobalConfiguration = {
  platform: {
    name: 'EVA DA 2.0',
    version: '2.0.0',
    baseUrl: window.location.origin,
    supportEmail: 'support@eva-da.ca',
    maxProjectsPerUser: 10,
    sessionTimeout: 480 // 8 hours
  },
  security: {
    requireMFA: false,
    passwordPolicy: {
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true
    },
    allowedDomains: [],
    maxLoginAttempts: 5
  },
  performance: {
    defaultTimeout: 30000,
    maxRetries: 3,
    cacheTimeout: 60,
    batchSize: 50
  },
  monitoring: {
    enableTelemetry: true,
    logLevel: 'info'
  },
  features: {
    enableJurisprudence: true,
    enableMultiTenant: true,
    enableAdvancedAnalytics: false,
    enableRealTimeChat: false
  }
};

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private globalConfig: GlobalConfiguration;
  private projectConfigs: Map<string, ProjectConfiguration> = new Map();
  private userConfig: UserConfiguration | null = null;

  private constructor() {
    this.globalConfig = this.loadGlobalConfig();
    this.loadProjectConfigs();
    this.loadUserConfig();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  // Global Configuration Methods
  public getGlobalConfig(): GlobalConfiguration {
    return { ...this.globalConfig };
  }

  public updateGlobalConfig(updates: Partial<GlobalConfiguration>): boolean {
    try {
      this.globalConfig = { ...this.globalConfig, ...updates };
      localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(this.globalConfig));
      return true;
    } catch (error) {
      console.error('[ConfigManager] Failed to update global config:', error);
      return false;
    }
  }

  // Project Configuration Methods
  public getProjectConfig(projectId: string): ProjectConfiguration | null {
    return this.projectConfigs.get(projectId) || null;
  }

  public setProjectConfig(config: ProjectConfiguration): boolean {
    try {
      this.projectConfigs.set(config.id, config);
      this.saveProjectConfigs();
      return true;
    } catch (error) {
      console.error('[ConfigManager] Failed to set project config:', error);
      return false;
    }
  }

  public getAllProjectConfigs(): ProjectConfiguration[] {
    return Array.from(this.projectConfigs.values());
  }

  // User Configuration Methods
  public getUserConfig(): UserConfiguration | null {
    return this.userConfig ? { ...this.userConfig } : null;
  }

  public updateUserConfig(updates: Partial<UserConfiguration>): boolean {
    try {
      if (!this.userConfig) {
        this.userConfig = {
          userId: 'default-user',
          preferences: {
            language: 'en',
            theme: 'auto',
            fontSize: 'medium',
            density: 'comfortable',
            notifications: {
              email: true,
              browser: true,
              frequency: 'daily'
            }
          },
          projectAccess: {},
          customizations: {
            favoriteProjects: [],
            recentQueries: [],
            savedSearches: []
          }
        };
      }

      this.userConfig = { ...this.userConfig, ...updates };
      localStorage.setItem(USER_CONFIG_KEY, JSON.stringify(this.userConfig));
      return true;
    } catch (error) {
      console.error('[ConfigManager] Failed to update user config:', error);
      return false;
    }
  }

  // Configuration Resolution (Global → Project → User)
  public resolveConfiguration<T extends keyof ProjectConfiguration>(
    projectId: string,
    configPath: T
  ): ProjectConfiguration[T] | null {
    const projectConfig = this.getProjectConfig(projectId);
    if (projectConfig && projectConfig[configPath]) {
      return projectConfig[configPath];
    }
    return null;
  }

  // Utility Methods
  public getEffectiveApiTimeout(projectId: string): number {
    const projectConfig = this.getProjectConfig(projectId);
    if (projectConfig?.technical.apiEndpoints.timeout) {
      return projectConfig.technical.apiEndpoints.timeout;
    }
    return this.globalConfig.performance.defaultTimeout;
  }

  public getEffectiveTheme(projectId: string): ProjectConfiguration['uiConfig']['theme'] | null {
    const projectConfig = this.getProjectConfig(projectId);
    return projectConfig?.uiConfig.theme || null;
  }

  public hasFeatureEnabled(feature: keyof GlobalConfiguration['features']): boolean {
    return this.globalConfig.features[feature];
  }

  // Private Methods
  private loadGlobalConfig(): GlobalConfiguration {
    try {
      const stored = localStorage.getItem(GLOBAL_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_GLOBAL_CONFIG, ...parsed };
      }
    } catch (error) {
      console.warn('[ConfigManager] Failed to load global config, using defaults:', error);
    }
    return DEFAULT_GLOBAL_CONFIG;
  }

  private loadProjectConfigs(): void {
    try {
      const stored = localStorage.getItem(PROJECT_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((config: ProjectConfiguration) => {
            this.projectConfigs.set(config.id, config);
          });
        }
      }
    } catch (error) {
      console.warn('[ConfigManager] Failed to load project configs:', error);
    }
  }

  private saveProjectConfigs(): void {
    try {
      const configs = Array.from(this.projectConfigs.values());
      localStorage.setItem(PROJECT_CONFIG_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('[ConfigManager] Failed to save project configs:', error);
    }
  }

  private loadUserConfig(): void {
    try {
      const stored = localStorage.getItem(USER_CONFIG_KEY);
      if (stored) {
        this.userConfig = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[ConfigManager] Failed to load user config:', error);
    }
  }

  // Export/Import Methods
  public exportConfiguration(): string {
    return JSON.stringify({
      global: this.globalConfig,
      projects: Array.from(this.projectConfigs.values()),
      user: this.userConfig
    }, null, 2);
  }

  public importConfiguration(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson);
      
      if (config.global) {
        this.globalConfig = { ...DEFAULT_GLOBAL_CONFIG, ...config.global };
        localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(this.globalConfig));
      }

      if (config.projects && Array.isArray(config.projects)) {
        this.projectConfigs.clear();
        config.projects.forEach((project: ProjectConfiguration) => {
          this.projectConfigs.set(project.id, project);
        });
        this.saveProjectConfigs();
      }

      if (config.user) {
        this.userConfig = config.user;
        localStorage.setItem(USER_CONFIG_KEY, JSON.stringify(this.userConfig));
      }

      return true;
    } catch (error) {
      console.error('[ConfigManager] Failed to import configuration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const configManager = ConfigurationManager.getInstance();
