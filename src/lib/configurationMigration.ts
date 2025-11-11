// src/lib/configurationMigration.ts
// Migration utility to convert legacy project registry to new configuration system

import type { ProjectConfiguration } from './configurationManager';
import { configManager } from './configurationManager';
import { defaultProjectConfigurations } from './defaultProjectConfigurations';
import { loadRegistry } from './projectRegistryStore';

// Legacy registry entry interface (from existing ProjectRegistry.tsx)
interface LegacyRegistryEntry {
  id: string;
  label: string;
  domain: string;
  owner: string;
  costCentre: string;
  ragProfile: string;
  description: string;
  theme: {
    primary: string;
    background: string;
    surface: string;
    baseFontPx: number;
  };
  ragIndex: {
    chunkingStrategy: string;
    chunkSizeTokens: number;
    overlapTokens: number;
    indexName: string;
  };
  ragRetrieval: {
    rankingStrategy: string;
    topK: number;
    citationStyle: string;
  };
  guardrails: {
    piiRedaction: boolean;
    speculativeAnswers: boolean;
    blockedTopicsSummary: string;
  };
  suggestedQuestions: Array<{
    en: string;
    fr: string;
  }>;
  apim: any;
}

export class ConfigurationMigration {
  
  /**
   * Migrate legacy registry data to new configuration system
   */
  public static async migrateLegacyRegistry(): Promise<boolean> {
    try {
      console.log('[Migration] Starting legacy registry migration...');
      
      // Try to load legacy registry data
      const legacyData = loadRegistry<LegacyRegistryEntry>([]);
      
      if (legacyData.length === 0) {
        console.log('[Migration] No legacy data found, initializing with defaults');
        return this.initializeDefaultConfigurations();
      }

      console.log(`[Migration] Found ${legacyData.length} legacy projects to migrate`);

      // Migrate each legacy entry
      for (const legacyEntry of legacyData) {
        const migratedConfig = this.convertLegacyToNewConfig(legacyEntry);
        if (migratedConfig) {
          configManager.setProjectConfig(migratedConfig);
          console.log(`[Migration] Migrated project: ${migratedConfig.id}`);
        }
      }

      // Ensure all default projects exist
      await this.ensureDefaultProjectsExist();

      console.log('[Migration] Legacy registry migration completed successfully');
      return true;

    } catch (error) {
      console.error('[Migration] Failed to migrate legacy registry:', error);
      return false;
    }
  }

  /**
   * Convert legacy registry entry to new configuration format
   */
  private static convertLegacyToNewConfig(legacy: LegacyRegistryEntry): ProjectConfiguration | null {
    try {
      // Find matching default configuration as base
      const defaultConfig = defaultProjectConfigurations.find(config => config.id === legacy.id);
      
      if (!defaultConfig) {
        console.warn(`[Migration] No default config found for ${legacy.id}, creating basic config`);
        return this.createBasicConfigFromLegacy(legacy);
      }

      // Merge legacy data with default configuration
      const migratedConfig: ProjectConfiguration = {
        ...defaultConfig,
        displayName: legacy.label,
        
        businessInfo: {
          ...defaultConfig.businessInfo,
          domain: legacy.domain,
          owner: legacy.owner,
          costCentre: legacy.costCentre,
        },

        technical: {
          ...defaultConfig.technical,
          searchConfig: {
            ...defaultConfig.technical.searchConfig,
            indexName: legacy.ragIndex.indexName,
          },
          aiConfig: {
            ...defaultConfig.technical.aiConfig,
            systemPrompt: legacy.description || defaultConfig.technical.aiConfig.systemPrompt,
          }
        },

        uiConfig: {
          ...defaultConfig.uiConfig,
          theme: {
            ...defaultConfig.uiConfig.theme,
            primary: legacy.theme.primary,
            background: legacy.theme.background,
            surface: legacy.theme.surface,
            baseFontPx: legacy.theme.baseFontPx,
          },
          branding: {
            ...defaultConfig.uiConfig.branding,
            title: legacy.label,
          }
        }
      };

      return migratedConfig;

    } catch (error) {
      console.error(`[Migration] Failed to convert legacy entry ${legacy.id}:`, error);
      return null;
    }
  }

  /**
   * Create basic configuration from legacy data when no default exists
   */
  private static createBasicConfigFromLegacy(legacy: LegacyRegistryEntry): ProjectConfiguration {
    return {
      id: legacy.id,
      name: legacy.id,
      displayName: legacy.label,
      
      businessInfo: {
        domain: legacy.domain,
        owner: legacy.owner,
        costCentre: legacy.costCentre,
        department: 'Unknown',
        contactInfo: {
          email: `${legacy.id}@platform.gc.ca`
        }
      },

      technical: {
        apiEndpoints: {
          primary: `https://eva-foundation-api.azurewebsites.net/api/${legacy.id}`,
          timeout: 30000,
          retryCount: 3
        },
        dataConfig: {
          containerName: `${legacy.id}-documents`,
          partitionKey: ['domain'],
          throughput: 1000
        },
        searchConfig: {
          service: `eva-search-${legacy.id}`,
          indexName: legacy.ragIndex.indexName,
          apiVersion: '2023-11-01'
        },
        aiConfig: {
          deployment: 'gpt-4-turbo',
          model: 'gpt-4-turbo-preview',
          maxTokens: 4000,
          temperature: 0.3,
          systemPrompt: legacy.description,
          templates: [
            'Based on the available information: {answer}',
            'According to the documentation: {answer}'
          ]
        }
      },

      uiConfig: {
        theme: {
          name: `${legacy.label} Theme`,
          primary: legacy.theme.primary,
          accent: legacy.theme.primary,
          background: legacy.theme.background,
          surface: legacy.theme.surface,
          baseFontPx: legacy.theme.baseFontPx
        },
        branding: {
          title: legacy.label,
          subtitle: legacy.description
        },
        layout: {
          showSidebar: true,
          sidebarWidth: 320,
          headerHeight: 64,
          maxContentWidth: 1200
        },
        features: {
          enableChat: true,
          enableFileUpload: false,
          enableExport: true,
          enableHistory: true,
          showProjectInfo: true
        }
      },

      compliance: {
        dataClassification: 'internal',
        retentionPolicy: {
          chatHistory: 90,
          userActivity: 365,
          auditLogs: 730
        },
        auditConfig: {
          enableFullAudit: false,
          logUserActions: false,
          logSystemEvents: true,
          exportFormat: 'json'
        },
        accessControl: {
          requireApproval: false,
          allowGuestAccess: false
        }
      }
    };
  }

  /**
   * Initialize with default configurations
   */
  private static initializeDefaultConfigurations(): boolean {
    try {
      for (const config of defaultProjectConfigurations) {
        configManager.setProjectConfig(config);
        console.log(`[Migration] Initialized default project: ${config.id}`);
      }
      return true;
    } catch (error) {
      console.error('[Migration] Failed to initialize default configurations:', error);
      return false;
    }
  }

  /**
   * Ensure all default projects exist in the configuration
   */
  private static async ensureDefaultProjectsExist(): Promise<void> {
    for (const defaultConfig of defaultProjectConfigurations) {
      const existing = configManager.getProjectConfig(defaultConfig.id);
      if (!existing) {
        configManager.setProjectConfig(defaultConfig);
        console.log(`[Migration] Added missing default project: ${defaultConfig.id}`);
      }
    }
  }

  /**
   * Backup current configuration to localStorage with timestamp
   */
  public static backupCurrentConfiguration(): boolean {
    try {
      const timestamp = new Date().toISOString();
      const backup = {
        timestamp,
        configuration: configManager.exportConfiguration()
      };
      
      localStorage.setItem(`eva.configBackup.${timestamp}`, JSON.stringify(backup));
      console.log(`[Migration] Configuration backed up with timestamp: ${timestamp}`);
      return true;
    } catch (error) {
      console.error('[Migration] Failed to backup configuration:', error);
      return false;
    }
  }

  /**
   * List available configuration backups
   */
  public static listConfigurationBackups(): Array<{ timestamp: string; key: string }> {
    const backups: Array<{ timestamp: string; key: string }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('eva.configBackup.')) {
        const timestamp = key.replace('eva.configBackup.', '');
        backups.push({ timestamp, key });
      }
    }

    return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * Restore configuration from backup
   */
  public static restoreConfigurationBackup(backupKey: string): boolean {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        console.error(`[Migration] Backup not found: ${backupKey}`);
        return false;
      }

      const backup = JSON.parse(backupData);
      const success = configManager.importConfiguration(backup.configuration);
      
      if (success) {
        console.log(`[Migration] Configuration restored from backup: ${backup.timestamp}`);
      }
      
      return success;
    } catch (error) {
      console.error(`[Migration] Failed to restore backup ${backupKey}:`, error);
      return false;
    }
  }

  /**
   * Validate configuration integrity
   */
  public static validateConfiguration(): Array<{ project: string; issues: string[] }> {
    const issues: Array<{ project: string; issues: string[] }> = [];
    
    const projects = configManager.getAllProjectConfigs();
    
    for (const project of projects) {
      const projectIssues: string[] = [];
      
      // Check required fields
      if (!project.businessInfo.owner) {
        projectIssues.push('Missing business owner');
      }
      
      if (!project.technical.apiEndpoints.primary) {
        projectIssues.push('Missing primary API endpoint');
      }
      
      if (!project.uiConfig.theme.primary) {
        projectIssues.push('Missing primary theme color');
      }
      
      // Check for default/placeholder values that should be customized
      if (project.businessInfo.costCentre.includes('CC-2024')) {
        projectIssues.push('Using default cost centre - needs customization');
      }
      
      if (projectIssues.length > 0) {
        issues.push({ project: project.id, issues: projectIssues });
      }
    }
    
    return issues;
  }
}

// Auto-migrate on module load
ConfigurationMigration.migrateLegacyRegistry().then(success => {
  if (success) {
    console.log('[EVA DA 2.0] Configuration system initialized successfully');
  } else {
    console.warn('[EVA DA 2.0] Configuration migration completed with warnings');
  }
});
