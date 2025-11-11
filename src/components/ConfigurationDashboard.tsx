// Comprehensive Configuration Management Dashboard

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { configManager, type GlobalConfiguration, type ProjectConfiguration } from "../lib/configurationManager";
import { ConfigurationValidator, type ValidationSummary } from '../lib/configurationValidator';
import { ConfigurationExporter, type BackupMetadata } from '../lib/configurationExporter';

export function ConfigurationDashboard() {
  const { t } = useTranslation();
  
  // Create singleton instances
  const configValidator = new ConfigurationValidator();
  const configExporter = new ConfigurationExporter();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'global' | 'projects' | 'validation' | 'backup'>('overview');
  const [globalConfig, setGlobalConfig] = useState<GlobalConfiguration | null>(null);
  const [projects, setProjects] = useState<ProjectConfiguration[]>([]);  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [backups, setBackups] = useState<BackupMetadata[]>([]);

  useEffect(() => {
    loadConfiguration();
  }, []);
  const loadConfiguration = () => {
    const global = configManager.getGlobalConfig();
    const projectConfigs = configManager.getAllProjectConfigs();
    
    setGlobalConfig(global);
    setProjects(projectConfigs);
    
    // Run comprehensive validation
    const validation = configValidator.validateAllConfigurations(global, projectConfigs);
    setValidationSummary(validation);
    
    // Load available backups
    setBackups(configExporter.getAvailableBackups());
  };
  const handleCreateBackup = async () => {
    try {
      const backupKey = await configExporter.createBackup('Manual backup from dashboard');
      loadConfiguration();
      alert(`Configuration backup created successfully: ${backupKey}`);
    } catch (error) {
      alert('Failed to create backup');
    }
  };

  const handleRestoreBackup = async (backupKey: string) => {
    if (confirm('Are you sure you want to restore this backup? Current configuration will be lost.')) {
      const result = await configExporter.restoreFromBackup(backupKey);
      if (result.success) {
        loadConfiguration();
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  };

  const handleExportConfiguration = async () => {
    try {
      await configExporter.exportToFile('Dashboard export');
    } catch (error) {
      alert('Failed to export configuration');
    }
  };

  const handleImportConfiguration = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await configExporter.importFromFile(file);
      if (result.success) {
        loadConfiguration();
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Import failed: Invalid configuration file');
    }
  };

  return (
    <div className="configuration-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          {t('configDashboard.title', 'EVA DA 2.0 Configuration Management')}
        </h1>
        <p className="dashboard-subtitle">
          {t('configDashboard.subtitle', 'Manage global settings, project configurations, and system parameters')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {t('configDashboard.overview', 'Overview')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          {t('configDashboard.globalConfig', 'Global Settings')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          {t('configDashboard.projectConfigs', 'Project Configurations')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          {t('configDashboard.validation', 'Validation & Issues')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          {t('configDashboard.backup', 'Backup & Restore')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">        {activeTab === 'overview' && (
          <ConfigurationOverview 
            globalConfig={globalConfig}
            projects={projects}
            validationSummary={validationSummary}
          />
        )}

        {activeTab === 'global' && globalConfig && (
          <GlobalConfigurationEditor 
            config={globalConfig}
            onChange={(updates) => {
              configManager.updateGlobalConfig(updates);
              loadConfiguration();
            }}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectConfigurationManager 
            projects={projects}
            onUpdate={loadConfiguration}
          />
        )}        {activeTab === 'validation' && validationSummary && (
          <ConfigurationValidation 
            validationSummary={validationSummary}
            onRevalidate={() => {
              loadConfiguration();
            }}
          />
        )}

        {activeTab === 'backup' && (
          <BackupManagement 
            backups={backups}
            onCreateBackup={handleCreateBackup}
            onRestoreBackup={handleRestoreBackup}
            onExport={handleExportConfiguration}
            onImport={handleImportConfiguration}
          />
        )}
      </div>
    </div>
  );
}

// Configuration Overview Component
interface ConfigurationOverviewProps {
  globalConfig: GlobalConfiguration | null;
  projects: ProjectConfiguration[];
  validationSummary: ValidationSummary | null;
}

function ConfigurationOverview({ globalConfig, projects, validationSummary }: ConfigurationOverviewProps) {
  const { t } = useTranslation();
  
  const totalProjects = projects.length;
  const projectsWithIssues = validationSummary ? validationSummary.projectResults.filter(r => !r.isValid).length : 0;
  const healthPercentage = validationSummary ? validationSummary.overallHealth : 0;

  return (
    <div className="configuration-overview">
      {/* System Health */}
      <div className="overview-section">
        <h2>{t('configDashboard.systemHealth', 'System Health')}</h2>
        <div className="health-grid">
          <div className="health-card">
            <div className="health-value">{totalProjects}</div>
            <div className="health-label">{t('configDashboard.totalProjects', 'Total Projects')}</div>
          </div>
          <div className="health-card">
            <div className={`health-value ${healthPercentage >= 80 ? 'success' : healthPercentage >= 60 ? 'warning' : 'error'}`}>
              {healthPercentage}%
            </div>
            <div className="health-label">{t('configDashboard.healthScore', 'Configuration Health')}</div>
          </div>
          <div className="health-card">
            <div className={`health-value ${projectsWithIssues === 0 ? 'success' : 'warning'}`}>
              {projectsWithIssues}
            </div>
            <div className="health-label">{t('configDashboard.projectsWithIssues', 'Projects with Issues')}</div>
          </div>
        </div>
      </div>

      {/* Platform Configuration */}
      {globalConfig && (
        <div className="overview-section">
          <h2>{t('configDashboard.platformConfig', 'Platform Configuration')}</h2>
          <div className="config-grid">
            <div className="config-item">
              <label>{t('configDashboard.platformName', 'Platform Name')}</label>
              <span>{globalConfig.platform.name}</span>
            </div>
            <div className="config-item">
              <label>{t('configDashboard.version', 'Version')}</label>
              <span>{globalConfig.platform.version}</span>
            </div>
            <div className="config-item">
              <label>{t('configDashboard.maxProjects', 'Max Projects per User')}</label>
              <span>{globalConfig.platform.maxProjectsPerUser}</span>
            </div>
            <div className="config-item">
              <label>{t('configDashboard.sessionTimeout', 'Session Timeout')}</label>
              <span>{globalConfig.platform.sessionTimeout} minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Status */}
      {globalConfig && (
        <div className="overview-section">
          <h2>{t('configDashboard.featureStatus', 'Feature Status')}</h2>
          <div className="feature-grid">
            <FeatureStatusCard 
              name={t('configDashboard.jurisprudence', 'Jurisprudence')}
              enabled={globalConfig.features.enableJurisprudence}
            />
            <FeatureStatusCard 
              name={t('configDashboard.multiTenant', 'Multi-Tenant')}
              enabled={globalConfig.features.enableMultiTenant}
            />
            <FeatureStatusCard 
              name={t('configDashboard.analytics', 'Advanced Analytics')}
              enabled={globalConfig.features.enableAdvancedAnalytics}
            />
            <FeatureStatusCard 
              name={t('configDashboard.realTimeChat', 'Real-Time Chat')}
              enabled={globalConfig.features.enableRealTimeChat}
            />
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="overview-section">
        <h2>{t('configDashboard.recentProjects', 'Recent Projects')}</h2>
        <div className="project-summary-grid">
          {projects.slice(0, 4).map(project => (
            <ProjectSummaryCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Feature Status Card Component
function FeatureStatusCard({ name, enabled }: { name: string; enabled: boolean }) {
  return (
    <div className={`feature-card ${enabled ? 'enabled' : 'disabled'}`}>
      <div className="feature-status">
        <div className={`status-dot ${enabled ? 'active' : 'inactive'}`}></div>
        <span className="feature-name">{name}</span>
      </div>
      <span className="feature-state">{enabled ? 'Enabled' : 'Disabled'}</span>
    </div>
  );
}

// Project Summary Card Component
function ProjectSummaryCard({ project }: { project: ProjectConfiguration }) {
  return (
    <div className="project-summary-card">
      <div className="project-header">
        <h4>{project.displayName}</h4>
        <div 
          className="project-color" 
          style={{ backgroundColor: project.uiConfig.theme.primary }}
        ></div>
      </div>
      <div className="project-details">
        <span className="project-domain">{project.businessInfo.domain}</span>
        <span className="project-owner">{project.businessInfo.owner}</span>
      </div>
    </div>
  );
}

// Global Configuration Editor Component
interface GlobalConfigurationEditorProps {
  config: GlobalConfiguration;
  onChange: (updates: Partial<GlobalConfiguration>) => void;
}

function GlobalConfigurationEditor({ config, onChange }: GlobalConfigurationEditorProps) {
  const { t } = useTranslation();
  const [editedConfig, setEditedConfig] = useState<GlobalConfiguration>({ ...config });

  const handleSave = () => {
    onChange(editedConfig);
    alert('Global configuration saved successfully');
  };

  return (
    <div className="global-config-editor">
      <div className="editor-header">
        <h2>{t('configDashboard.editGlobalConfig', 'Edit Global Configuration')}</h2>
        <button onClick={handleSave} className="save-button">
          {t('configDashboard.saveChanges', 'Save Changes')}
        </button>
      </div>

      <div className="config-sections">
        {/* Platform Settings */}
        <section className="config-section">
          <h3>{t('configDashboard.platformSettings', 'Platform Settings')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('configDashboard.platformName', 'Platform Name')}</label>
              <input 
                type="text"
                value={editedConfig.platform.name}
                onChange={(e) => setEditedConfig({
                  ...editedConfig,
                  platform: { ...editedConfig.platform, name: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>{t('configDashboard.supportEmail', 'Support Email')}</label>
              <input 
                type="email"
                value={editedConfig.platform.supportEmail}
                onChange={(e) => setEditedConfig({
                  ...editedConfig,
                  platform: { ...editedConfig.platform, supportEmail: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>{t('configDashboard.maxProjectsPerUser', 'Max Projects per User')}</label>
              <input 
                type="number"
                value={editedConfig.platform.maxProjectsPerUser}
                onChange={(e) => setEditedConfig({
                  ...editedConfig,
                  platform: { ...editedConfig.platform, maxProjectsPerUser: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="form-group">
              <label>{t('configDashboard.sessionTimeout', 'Session Timeout (minutes)')}</label>
              <input 
                type="number"
                value={editedConfig.platform.sessionTimeout}
                onChange={(e) => setEditedConfig({
                  ...editedConfig,
                  platform: { ...editedConfig.platform, sessionTimeout: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        </section>

        {/* Feature Toggles */}
        <section className="config-section">
          <h3>{t('configDashboard.featureToggles', 'Feature Toggles')}</h3>
          <div className="toggle-grid">
            <div className="toggle-group">
              <label>{t('configDashboard.enableJurisprudence', 'Enable Jurisprudence Features')}</label>
              <input 
                type="checkbox"
                checked={editedConfig.features.enableJurisprudence}
                onChange={(e) => setEditedConfig({
                  ...editedConfig,
                  features: { ...editedConfig.features, enableJurisprudence: e.target.checked }
                })}
              />
            </div>
            <div className="toggle-group">
              <label>{t('configDashboard.enableMultiTenant', 'Enable Multi-Tenant Support')}</label>
              <input 
                type="checkbox"
                checked={editedConfig.features.enableMultiTenant}
                onChange={(e) => setEditedConfig({
                  ...editedConfig,
                  features: { ...editedConfig.features, enableMultiTenant: e.target.checked }
                })}
              />
            </div>
            <div className="toggle-group">
              <label>{t('configDashboard.enableAnalytics', 'Enable Advanced Analytics')}</label>
              <input 
                type="checkbox"
                checked={editedConfig.features.enableAdvancedAnalytics}
                onChange={(e) => setEditedConfig({
                  ...editedConfig,
                  features: { ...editedConfig.features, enableAdvancedAnalytics: e.target.checked }
                })}
              />
            </div>
            <div className="toggle-group">
              <label>{t('configDashboard.enableRealTimeChat', 'Enable Real-Time Chat')}</label>
              <input 
                type="checkbox"
                checked={editedConfig.features.enableRealTimeChat}
                onChange={(e) => setEditedConfig({
                  ...editedConfig,
                  features: { ...editedConfig.features, enableRealTimeChat: e.target.checked }
                })}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Project Configuration Manager Component
interface ProjectConfigurationManagerProps {
  projects: ProjectConfiguration[];
  onUpdate: () => void;
}

function ProjectConfigurationManager({ projects, onUpdate }: ProjectConfigurationManagerProps) {
  const { t } = useTranslation();

  return (
    <div className="project-config-manager">
      <h2>{t('configDashboard.manageProjects', 'Manage Project Configurations')}</h2>
      <div className="project-list">
        {projects.map(project => (
          <div key={project.id} className="project-config-item">
            <div className="project-info">
              <h4>{project.displayName}</h4>
              <span className="project-domain">{project.businessInfo.domain}</span>
            </div>
            <div className="project-actions">
              <button className="edit-project-btn">
                {t('configDashboard.editProject', 'Edit')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Configuration Validation Component
interface ConfigurationValidationProps {
  validationSummary: ValidationSummary;
  onRevalidate: () => void;
}

function ConfigurationValidation({ validationSummary, onRevalidate }: ConfigurationValidationProps) {
  const { t } = useTranslation();

  const hasErrors = validationSummary.globalResult.errors.length > 0 || 
    validationSummary.projectResults.some(r => r.errors.length > 0);

  return (
    <div className="configuration-validation">
      <div className="validation-header">
        <h2>{t('configDashboard.configValidation', 'Configuration Validation')}</h2>
        <div className="validation-summary">
          <span className={`health-score ${validationSummary.overallHealth >= 80 ? 'good' : validationSummary.overallHealth >= 60 ? 'warning' : 'critical'}`}>
            Health: {validationSummary.overallHealth}%
          </span>
          <span className="total-issues">
            Total Issues: {validationSummary.totalIssues}
          </span>
        </div>
        <button onClick={onRevalidate} className="revalidate-button">
          {t('configDashboard.revalidate', 'Re-validate')}
        </button>
      </div>

      {!hasErrors ? (
        <div className="validation-success">
          <div className="success-icon">✓</div>
          <h3>{t('configDashboard.allConfigsValid', 'All configurations are valid!')}</h3>
          <p>{t('configDashboard.noIssuesFound', 'No critical configuration issues found.')}</p>
          {validationSummary.totalIssues > 0 && (
            <p className="warning-note">
              ⚠️ {validationSummary.totalIssues} warnings found - review recommended but not critical.
            </p>
          )}
        </div>
      ) : (
        <div className="validation-issues">
          {/* Global Configuration Issues */}
          {(validationSummary.globalResult.errors.length > 0 || validationSummary.globalResult.warnings.length > 0) && (
            <div className="issue-card global-issues">
              <h4>🌐 Global Configuration</h4>
              {validationSummary.globalResult.errors.length > 0 && (
                <div className="errors">
                  <h5>❌ Errors</h5>
                  <ul>
                    {validationSummary.globalResult.errors.map((error, index) => (
                      <li key={index} className="error">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationSummary.globalResult.warnings.length > 0 && (
                <div className="warnings">
                  <h5>⚠️ Warnings</h5>
                  <ul>
                    {validationSummary.globalResult.warnings.map((warning, index) => (
                      <li key={index} className="warning">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Project Configuration Issues */}
          {validationSummary.projectResults.filter(result => 
            result.errors.length > 0 || result.warnings.length > 0
          ).map(result => (
            <div key={result.project} className="issue-card project-issues">
              <h4>📁 {result.project}</h4>
              {result.errors.length > 0 && (
                <div className="errors">
                  <h5>❌ Errors</h5>
                  <ul>
                    {result.errors.map((error, index) => (
                      <li key={index} className="error">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.warnings.length > 0 && (
                <div className="warnings">
                  <h5>⚠️ Warnings</h5>
                  <ul>
                    {result.warnings.map((warning, index) => (
                      <li key={index} className="warning">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Backup Management Component
interface BackupManagementProps {
  backups: BackupMetadata[];
  onCreateBackup: () => void;
  onRestoreBackup: (backupKey: string) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function BackupManagement({ backups, onCreateBackup, onRestoreBackup, onExport, onImport }: BackupManagementProps) {
  const { t } = useTranslation();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="backup-management">
      <h2>{t('configDashboard.backupRestore', 'Backup & Restore')}</h2>
      
      <div className="backup-actions">
        <button onClick={onCreateBackup} className="backup-button">
          {t('configDashboard.createBackup', 'Create Backup')}
        </button>
        <button onClick={onExport} className="export-button">
          {t('configDashboard.exportConfig', 'Export Configuration')}
        </button>
        <label className="import-button">
          {t('configDashboard.importConfig', 'Import Configuration')}
          <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
        </label>
      </div>

      <div className="backup-list">
        <h3>{t('configDashboard.availableBackups', 'Available Backups')}</h3>
        {backups.length === 0 ? (
          <p>{t('configDashboard.noBackups', 'No backups available.')}</p>
        ) : (
          <div className="backup-grid">
            {backups.map(backup => (
              <div key={backup.key} className={`backup-item ${backup.isValid ? 'valid' : 'invalid'}`}>
                <div className="backup-header">
                  <div className="backup-status">
                    {backup.isValid ? '✅' : '❌'}
                  </div>
                  <div className="backup-timestamp">
                    {new Date(backup.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="backup-info">
                  {backup.description && (
                    <div className="backup-description">{backup.description}</div>
                  )}
                  <div className="backup-metadata">
                    <span>{backup.projectCount} projects</span>
                    <span>{formatFileSize(backup.size)}</span>
                  </div>
                </div>
                <div className="backup-actions">
                  <button 
                    onClick={() => onRestoreBackup(backup.key)}
                    className="restore-button"
                    disabled={!backup.isValid}
                  >
                    {t('configDashboard.restore', 'Restore')}
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this backup?')) {
                        configExporter.deleteBackup(backup.key);
                        // Refresh backup list
                        window.location.reload();
                      }
                    }}
                    className="delete-button"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
