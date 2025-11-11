// src/lib/configurationValidator.ts
import type { ProjectConfiguration, GlobalConfiguration } from './configurationManager';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  project?: string;
}

export interface ValidationSummary {
  overallHealth: number; // Percentage 0-100
  totalIssues: number;
  projectResults: ValidationResult[];
  globalResult: ValidationResult;
}

export class ConfigurationValidator {
  /**
   * Validates a project configuration for completeness and consistency
   */
  validateProjectConfiguration(config: ProjectConfiguration): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!config.id || config.id.length === 0) {
      errors.push('Project ID is required and cannot be empty');
    }

    if (!config.displayName || config.displayName.length === 0) {
      errors.push('Display name is required and cannot be empty');
    }

    // Business information validation
    if (!config.businessInfo.domain || config.businessInfo.domain.length === 0) {
      errors.push('Business domain is required');
    }

    if (!config.businessInfo.owner || config.businessInfo.owner.length === 0) {
      errors.push('Business owner is required');
    }

    if (!config.businessInfo.costCentre || config.businessInfo.costCentre.length === 0) {
      warnings.push('Cost centre should be specified for budget tracking');
    }

    // Technical configuration validation  
    if (!config.technical.apiEndpoints.primary) {
      errors.push('Primary API endpoint must be configured');
    } else {
      // Validate URL format
      try {
        new URL(config.technical.apiEndpoints.primary);
      } catch {
        errors.push('Primary API endpoint must be a valid URL');
      }
    }

    if (!config.technical.searchConfig.indexName) {
      errors.push('Search index name is required');
    }

    if (!config.technical.aiConfig.model) {
      errors.push('AI model configuration is required');
    }

    // Data configuration validation
    if (config.technical.dataConfig.throughput < 400) {
      warnings.push('Throughput below 400 RU/s may impact performance');
    }

    if (config.technical.dataConfig.throughput > 10000) {
      warnings.push('High throughput configuration - verify cost implications');
    }

    // UI configuration validation
    if (!config.uiConfig.theme.primary || !this.isValidHexColor(config.uiConfig.theme.primary)) {
      errors.push('Valid primary theme color (hex format) is required');
    }

    if (!config.uiConfig.theme.name || config.uiConfig.theme.name.length === 0) {
      warnings.push('Theme name should be specified for better identification');
    }

    // Compliance validation
    if (!config.compliance.dataClassification) {
      errors.push('Data classification must be specified');
    }

    if (config.compliance.retentionPolicy.chatHistory < 1) {
      errors.push('Chat history retention must be at least 1 day');
    }

    if (config.compliance.retentionPolicy.chatHistory > 2555) {
      warnings.push('Chat history retention over 7 years - verify legal requirements');
    }

    // Jurisprudence-specific validation
    if (config.jurisprudenceConfig) {
      if (!config.jurisprudenceConfig.supportedJurisdictions || 
          config.jurisprudenceConfig.supportedJurisdictions.length === 0) {
        warnings.push('Jurisprudence projects should specify supported jurisdictions');
      }

      if (!config.jurisprudenceConfig.legalDatabases.primary) {
        warnings.push('Primary legal database should be configured for jurisprudence projects');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      project: config.id
    };
  }

  /**
   * Validates global configuration
   */
  validateGlobalConfiguration(config: GlobalConfiguration): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Platform validation
    if (!config.platform.name || config.platform.name.length === 0) {
      errors.push('Platform name is required');
    }

    if (!config.platform.version || config.platform.version.length === 0) {
      errors.push('Platform version is required');
    }

    if (config.platform.maxProjectsPerUser < 1) {
      errors.push('Maximum projects per user must be at least 1');
    }

    if (config.platform.maxProjectsPerUser > 50) {
      warnings.push('High maximum projects per user - may impact performance');
    }

    if (config.platform.sessionTimeout < 5) {
      warnings.push('Session timeout below 5 minutes may cause user frustration');
    }

    if (config.platform.sessionTimeout > 480) {
      warnings.push('Session timeout over 8 hours may be a security risk');
    }

    // Support validation
    if (!config.platform.supportEmail || !this.isValidEmail(config.platform.supportEmail)) {
      errors.push('Valid support email address is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates all project configurations and global configuration
   */
  validateAllConfigurations(
    globalConfig: GlobalConfiguration, 
    projectConfigs: ProjectConfiguration[]
  ): ValidationSummary {
    const projectResults: ValidationResult[] = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    // Validate global configuration
    const globalResult = this.validateGlobalConfiguration(globalConfig);
    totalErrors += globalResult.errors.length;
    totalWarnings += globalResult.warnings.length;

    // Validate each project configuration
    for (const projectConfig of projectConfigs) {
      const result = this.validateProjectConfiguration(projectConfig);
      projectResults.push(result);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    }

    // Cross-project validation
    this.validateCrossProjectConsistency(projectConfigs, projectResults);

    // Calculate overall health score
    const totalIssues = totalErrors + totalWarnings;
    const maxPossibleIssues = (projectConfigs.length + 1) * 10; // Rough estimate
    const overallHealth = Math.max(0, Math.round(100 - (totalIssues / maxPossibleIssues) * 100));

    return {
      overallHealth,
      totalIssues,
      projectResults,
      globalResult
    };
  }

  /**
   * Performs cross-project validation checks
   */
  private validateCrossProjectConsistency(
    projectConfigs: ProjectConfiguration[], 
    results: ValidationResult[]
  ): void {
    const projectIds = new Set<string>();
    const apiEndpoints = new Set<string>();

    for (let i = 0; i < projectConfigs.length; i++) {
      const config = projectConfigs[i];
      const result = results[i];

      // Check for duplicate project IDs
      if (projectIds.has(config.id)) {
        result.errors.push(`Duplicate project ID: ${config.id}`);
      }
      projectIds.add(config.id);

      // Check for duplicate API endpoints
      if (apiEndpoints.has(config.technical.apiEndpoints.primary)) {
        result.warnings.push('API endpoint shared with another project - verify if intentional');
      }
      apiEndpoints.add(config.technical.apiEndpoints.primary);
    }
  }

  /**
   * Validates hex color format
   */
  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Validates email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generates a human-readable validation report
   */
  generateValidationReport(summary: ValidationSummary): string {
    let report = '# Configuration Validation Report\n\n';
    
    report += `## Overall Health: ${summary.overallHealth}%\n`;
    report += `Total Issues Found: ${summary.totalIssues}\n\n`;

    // Global configuration report
    report += '## Global Configuration\n';
    if (summary.globalResult.isValid) {
      report += '✅ **VALID** - No critical issues found\n';
    } else {
      report += '❌ **INVALID** - Critical issues found\n';
    }

    if (summary.globalResult.errors.length > 0) {
      report += '\n### Errors:\n';
      summary.globalResult.errors.forEach(error => {
        report += `- ❌ ${error}\n`;
      });
    }

    if (summary.globalResult.warnings.length > 0) {
      report += '\n### Warnings:\n';
      summary.globalResult.warnings.forEach(warning => {
        report += `- ⚠️ ${warning}\n`;
      });
    }

    // Project configurations report
    report += '\n## Project Configurations\n';
    summary.projectResults.forEach(result => {
      report += `\n### ${result.project}\n`;
      if (result.isValid) {
        report += '✅ **VALID**\n';
      } else {
        report += '❌ **INVALID**\n';
      }

      if (result.errors.length > 0) {
        report += '\n#### Errors:\n';
        result.errors.forEach(error => {
          report += `- ❌ ${error}\n`;
        });
      }

      if (result.warnings.length > 0) {
        report += '\n#### Warnings:\n';
        result.warnings.forEach(warning => {
          report += `- ⚠️ ${warning}\n`;
        });
      }
    });

    return report;
  }
}

// Export singleton instance
export const configValidator = new ConfigurationValidator();
