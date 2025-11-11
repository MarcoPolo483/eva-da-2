// src/lib/configurationExporter.ts
import { configManager, type GlobalConfiguration, type ProjectConfiguration } from './configurationManager';
import { configValidator, type ValidationSummary } from './configurationValidator';

export interface ConfigurationBackup {
  version: string;
  timestamp: string;
  metadata: {
    description?: string;
    creator?: string;
    platform: string;
  };
  globalConfig: GlobalConfiguration;
  projectConfigs: ProjectConfiguration[];
  validationSummary: ValidationSummary;
}

export interface BackupMetadata {
  key: string;
  timestamp: string;
  description?: string;
  size: number;
  isValid: boolean;
  projectCount: number;
}

export class ConfigurationExporter {
  private readonly BACKUP_PREFIX = 'eva-config-backup-';
  private readonly BACKUP_VERSION = '2.0.0';

  /**
   * Creates a complete configuration backup
   */
  async createBackup(description?: string): Promise<string> {
    const timestamp = new Date().toISOString();
    const backupKey = `${this.BACKUP_PREFIX}${timestamp.replace(/[:.]/g, '-')}`;

    // Get current configurations
    const globalConfig = configManager.getGlobalConfig();
    const projectConfigs = configManager.getAllProjectConfigs();

    // Validate configurations before backup
    const validationSummary = configValidator.validateAllConfigurations(globalConfig, projectConfigs);

    const backup: ConfigurationBackup = {
      version: this.BACKUP_VERSION,
      timestamp,
      metadata: {
        description,
        creator: 'EVA DA 2.0 Configuration Manager',
        platform: navigator.platform
      },
      globalConfig,
      projectConfigs,
      validationSummary
    };

    // Store backup in localStorage
    localStorage.setItem(backupKey, JSON.stringify(backup));

    return backupKey;
  }

  /**
   * Exports configuration to downloadable JSON file
   */
  async exportToFile(description?: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const globalConfig = configManager.getGlobalConfig();
    const projectConfigs = configManager.getAllProjectConfigs();
    const validationSummary = configValidator.validateAllConfigurations(globalConfig, projectConfigs);

    const exportData: ConfigurationBackup = {
      version: this.BACKUP_VERSION,
      timestamp,
      metadata: {
        description: description || 'EVA DA 2.0 Configuration Export',
        creator: 'EVA DA 2.0 Configuration Manager',
        platform: navigator.platform
      },
      globalConfig,
      projectConfigs,
      validationSummary
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const filename = `eva-config-export-${timestamp.replace(/[:.]/g, '-')}.json`;
    this.downloadBlob(blob, filename);
  }

  /**
   * Imports configuration from uploaded JSON file
   */
  async importFromFile(file: File): Promise<{ success: boolean; message: string; validationSummary?: ValidationSummary }> {
    try {
      const content = await this.readFileContent(file);
      const importData: ConfigurationBackup = JSON.parse(content);

      // Validate import data structure
      if (!this.isValidBackupFormat(importData)) {
        return {
          success: false,
          message: 'Invalid configuration file format. Please ensure this is a valid EVA DA 2.0 configuration export.'
        };
      }

      // Validate configuration data
      const validationSummary = configValidator.validateAllConfigurations(
        importData.globalConfig, 
        importData.projectConfigs
      );

      // Check if import has critical errors
      const hasCriticalErrors = validationSummary.globalResult.errors.length > 0 ||
        validationSummary.projectResults.some(result => result.errors.length > 0);

      if (hasCriticalErrors) {
        return {
          success: false,
          message: 'Configuration file contains critical errors and cannot be imported. Please fix validation issues first.',
          validationSummary
        };
      }

      // Apply configurations
      configManager.updateGlobalConfig(importData.globalConfig);
      
      for (const projectConfig of importData.projectConfigs) {
        configManager.updateProjectConfig(projectConfig.id as any, projectConfig);
      }

      return {
        success: true,
        message: `Successfully imported ${importData.projectConfigs.length} project configurations and global settings.`,
        validationSummary
      };

    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Restores configuration from a stored backup
   */
  async restoreFromBackup(backupKey: string): Promise<{ success: boolean; message: string }> {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        return {
          success: false,
          message: 'Backup not found. It may have been deleted or corrupted.'
        };
      }

      const backup: ConfigurationBackup = JSON.parse(backupData);

      // Apply configurations
      configManager.updateGlobalConfig(backup.globalConfig);
      
      for (const projectConfig of backup.projectConfigs) {
        configManager.updateProjectConfig(projectConfig.id as any, projectConfig);
      }

      return {
        success: true,
        message: `Successfully restored configuration from backup created on ${new Date(backup.timestamp).toLocaleString()}.`
      };

    } catch (error) {
      return {
        success: false,
        message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Lists all available backups
   */
  getAvailableBackups(): BackupMetadata[] {
    const backups: BackupMetadata[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.BACKUP_PREFIX)) {
        try {
          const backupData = localStorage.getItem(key);
          if (backupData) {
            const backup: ConfigurationBackup = JSON.parse(backupData);
            backups.push({
              key,
              timestamp: backup.timestamp,
              description: backup.metadata.description,
              size: backupData.length,
              isValid: backup.validationSummary.overallHealth > 80,
              projectCount: backup.projectConfigs.length
            });
          }
        } catch (error) {
          // Skip corrupted backup entries
          console.warn(`Corrupted backup entry: ${key}`, error);
        }
      }
    }

    // Sort by timestamp, newest first
    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Deletes a stored backup
   */
  deleteBackup(backupKey: string): boolean {
    try {
      localStorage.removeItem(backupKey);
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Cleans up old backups (keeps only the most recent N backups)
   */
  cleanupOldBackups(keepCount: number = 10): number {
    const backups = this.getAvailableBackups();
    let deletedCount = 0;

    if (backups.length > keepCount) {
      const backupsToDelete = backups.slice(keepCount);
      for (const backup of backupsToDelete) {
        if (this.deleteBackup(backup.key)) {
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Validates if the imported data has the correct backup format
   */
  private isValidBackupFormat(data: any): data is ConfigurationBackup {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      data.metadata &&
      data.globalConfig &&
      Array.isArray(data.projectConfigs) &&
      data.validationSummary
    );
  }

  /**
   * Reads content from uploaded file
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  /**
   * Downloads a blob as a file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const configExporter = new ConfigurationExporter();
