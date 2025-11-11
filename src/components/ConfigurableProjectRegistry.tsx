// src/components/ConfigurableProjectRegistry.tsx
// Modern Project Registry using the new Configuration Management System

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { configManager, type ProjectConfiguration } from "../lib/configurationManager";
import type { ProjectId } from "../lib/evaClient";

interface ConfigurableProjectRegistryProps {
  onProjectSelect?: (projectId: ProjectId) => void;
  selectedProjectId?: ProjectId;
  showAdmin?: boolean;
}

export function ConfigurableProjectRegistry({
  onProjectSelect,
  selectedProjectId,
  showAdmin = true
}: ConfigurableProjectRegistryProps) {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectConfiguration[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectConfiguration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState<string>("");

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = configManager.getAllProjectConfigs();
    const filteredProjects = showAdmin ? allProjects : allProjects.filter(p => p.id !== 'admin' && p.id !== 'globalAdmin');
    setProjects(filteredProjects);
  };

  const handleProjectSelect = (project: ProjectConfiguration) => {
    setSelectedProject(project);
    onProjectSelect?.(project.id as ProjectId);
  };

  const handleEditProject = () => {
    setIsEditing(true);
  };

  const handleSaveProject = (updatedProject: ProjectConfiguration) => {
    const success = configManager.setProjectConfig(updatedProject);
    if (success) {
      loadProjects();
      setSelectedProject(updatedProject);
      setIsEditing(false);
    } else {
      alert('Failed to save project configuration');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Filter projects based on search and domain
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.businessInfo.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.businessInfo.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDomain = !filterDomain || project.businessInfo.domain === filterDomain;
    
    return matchesSearch && matchesDomain;
  });

  const uniqueDomains = [...new Set(projects.map(p => p.businessInfo.domain))];

  if (isEditing && selectedProject) {
    return (
      <ProjectConfigurationEditor
        project={selectedProject}
        onSave={handleSaveProject}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="configurable-project-registry">
      <div className="registry-header">
        <h2 className="registry-title">
          {t('projectRegistry.title', 'Project Registry')}
        </h2>
        <p className="registry-subtitle">
          {t('projectRegistry.subtitle', 'Manage EVA DA 2.0 project configurations')}
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="registry-controls">
        <div className="search-control">
          <input
            type="text"
            placeholder={t('projectRegistry.search', 'Search projects...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-control">
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="domain-filter"
          >
            <option value="">{t('projectRegistry.allDomains', 'All Domains')}</option>
            {uniqueDomains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Grid */}
      <div className="projects-grid">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={selectedProjectId === project.id}
            onClick={() => handleProjectSelect(project)}
          />
        ))}
      </div>

      {/* Project Details Panel */}
      {selectedProject && (
        <div className="project-details-panel">
          <ProjectDetailsView
            project={selectedProject}
            onEdit={handleEditProject}
          />
        </div>
      )}

      {/* Configuration Status */}
      <div className="configuration-status">
        <ConfigurationStatus />
      </div>
    </div>
  );
}

// Project Card Component
interface ProjectCardProps {
  project: ProjectConfiguration;
  isSelected: boolean;
  onClick: () => void;
}

function ProjectCard({ project, isSelected, onClick }: ProjectCardProps) {
  const { t } = useTranslation();

  return (
    <div 
      className={`project-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        '--project-primary': project.uiConfig.theme.primary,
        '--project-accent': project.uiConfig.theme.accent || project.uiConfig.theme.primary
      } as React.CSSProperties}
    >
      <div className="project-card-header">
        <h3 className="project-title">{project.displayName}</h3>
        <div className="project-status">
          <StatusIndicator project={project} />
        </div>
      </div>

      <div className="project-card-body">
        <div className="project-domain">{project.businessInfo.domain}</div>
        <div className="project-owner">{project.businessInfo.owner}</div>
        <div className="project-cost-centre">{project.businessInfo.costCentre}</div>
      </div>

      <div className="project-card-footer">
        <div className="project-users">
          {project.businessInfo.expectedUsers ? 
            t('projectRegistry.expectedUsers', '{{count}} users', { count: project.businessInfo.expectedUsers }) :
            t('projectRegistry.noUserEstimate', 'No user estimate')
          }
        </div>
        <div className="project-classification">
          {project.compliance.dataClassification}
        </div>
      </div>
    </div>
  );
}

// Project Details View Component
interface ProjectDetailsViewProps {
  project: ProjectConfiguration;
  onEdit: () => void;
}

function ProjectDetailsView({ project, onEdit }: ProjectDetailsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="project-details">
      <div className="details-header">
        <h3>{project.displayName}</h3>
        <button onClick={onEdit} className="edit-button">
          {t('projectRegistry.edit', 'Edit Configuration')}
        </button>
      </div>

      <div className="details-sections">
        {/* Business Information */}
        <section className="details-section">
          <h4>{t('projectRegistry.businessInfo', 'Business Information')}</h4>
          <div className="details-grid">
            <div className="detail-item">
              <label>{t('projectRegistry.domain', 'Domain')}</label>
              <span>{project.businessInfo.domain}</span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.owner', 'Owner')}</label>
              <span>{project.businessInfo.owner}</span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.costCentre', 'Cost Centre')}</label>
              <span>{project.businessInfo.costCentre}</span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.department', 'Department')}</label>
              <span>{project.businessInfo.department}</span>
            </div>
            {project.businessInfo.businessCase && (
              <div className="detail-item full-width">
                <label>{t('projectRegistry.businessCase', 'Business Case')}</label>
                <span>{project.businessInfo.businessCase}</span>
              </div>
            )}
          </div>
        </section>

        {/* Technical Configuration */}
        <section className="details-section">
          <h4>{t('projectRegistry.technicalConfig', 'Technical Configuration')}</h4>
          <div className="details-grid">
            <div className="detail-item">
              <label>{t('projectRegistry.primaryEndpoint', 'Primary API Endpoint')}</label>
              <span className="code">{project.technical.apiEndpoints.primary}</span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.searchIndex', 'Search Index')}</label>
              <span className="code">{project.technical.searchConfig.indexName}</span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.aiModel', 'AI Model')}</label>
              <span>{project.technical.aiConfig.model}</span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.throughput', 'Throughput (RU/s)')}</label>
              <span>{project.technical.dataConfig.throughput}</span>
            </div>
          </div>
        </section>

        {/* UI Configuration */}
        <section className="details-section">
          <h4>{t('projectRegistry.uiConfig', 'UI Configuration')}</h4>
          <div className="details-grid">
            <div className="detail-item">
              <label>{t('projectRegistry.theme', 'Theme')}</label>
              <div className="theme-preview">
                <span className="theme-name">{project.uiConfig.theme.name}</span>
                <div className="color-swatch" style={{ backgroundColor: project.uiConfig.theme.primary }}></div>
              </div>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.features', 'Enabled Features')}</label>
              <div className="feature-list">
                {project.uiConfig.features.enableChat && <span className="feature-tag">Chat</span>}
                {project.uiConfig.features.enableFileUpload && <span className="feature-tag">Upload</span>}
                {project.uiConfig.features.enableExport && <span className="feature-tag">Export</span>}
                {project.uiConfig.features.enableHistory && <span className="feature-tag">History</span>}
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="details-section">
          <h4>{t('projectRegistry.compliance', 'Compliance & Governance')}</h4>
          <div className="details-grid">
            <div className="detail-item">
              <label>{t('projectRegistry.classification', 'Data Classification')}</label>
              <span className={`classification-badge ${project.compliance.dataClassification}`}>
                {project.compliance.dataClassification}
              </span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.chatRetention', 'Chat History Retention')}</label>
              <span>{project.compliance.retentionPolicy.chatHistory} days</span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.auditEnabled', 'Full Audit Enabled')}</label>
              <span>{project.compliance.auditConfig.enableFullAudit ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-item">
              <label>{t('projectRegistry.guestAccess', 'Guest Access')}</label>
              <span>{project.compliance.accessControl.allowGuestAccess ? 'Allowed' : 'Restricted'}</span>
            </div>
          </div>
        </section>

        {/* Jurisprudence-Specific (if applicable) */}
        {project.jurisprudenceConfig && (
          <section className="details-section">
            <h4>{t('projectRegistry.jurisprudenceConfig', 'Jurisprudence Configuration')}</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>{t('projectRegistry.jurisdictions', 'Supported Jurisdictions')}</label>
                <div className="jurisdiction-list">
                  {project.jurisprudenceConfig.supportedJurisdictions.map(jurisdiction => (
                    <span key={jurisdiction} className="jurisdiction-tag">{jurisdiction}</span>
                  ))}
                </div>
              </div>
              <div className="detail-item">
                <label>{t('projectRegistry.legalDatabases', 'Legal Databases')}</label>
                <span>{project.jurisprudenceConfig.legalDatabases.primary}</span>
              </div>
              <div className="detail-item">
                <label>{t('projectRegistry.bilingualProcessing', 'Bilingual Processing')}</label>
                <span>{project.jurisprudenceConfig.enableBilingualProcessing ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Status Indicator Component
function StatusIndicator({ project }: { project: ProjectConfiguration }) {
  // Simple status logic - can be enhanced with actual health checks
  const hasRequiredConfig = project.technical.apiEndpoints.primary && 
                           project.businessInfo.owner && 
                           project.uiConfig.theme.primary;

  return (
    <div className={`status-indicator ${hasRequiredConfig ? 'healthy' : 'warning'}`}>
      <div className="status-dot"></div>
      <span className="status-text">
        {hasRequiredConfig ? 'Ready' : 'Config Needed'}
      </span>
    </div>
  );
}

// Configuration Status Component
function ConfigurationStatus() {
  const { t } = useTranslation();
  const [issues, setIssues] = useState<Array<{ project: string; issues: string[] }>>([]);

  useEffect(() => {
    // In a real implementation, this would use ConfigurationMigration.validateConfiguration()
    // For now, just show summary stats
    const projects = configManager.getAllProjectConfigs();
    const projectCount = projects.length;
    
    // Basic validation
    const projectIssues = projects.map(project => {
      const projectIssues: string[] = [];
      if (!project.businessInfo.contactInfo.email.includes('@')) {
        projectIssues.push('Invalid contact email');
      }
      if (project.businessInfo.costCentre.includes('CC-2024')) {
        projectIssues.push('Using default cost centre');
      }
      return { project: project.id, issues: projectIssues };
    }).filter(p => p.issues.length > 0);

    setIssues(projectIssues);
  }, []);

  return (
    <div className="configuration-status">
      <h4>{t('projectRegistry.configStatus', 'Configuration Status')}</h4>
      <div className="status-summary">
        <div className="status-item">
          <span className="status-label">{t('projectRegistry.totalProjects', 'Total Projects')}</span>
          <span className="status-value">{configManager.getAllProjectConfigs().length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">{t('projectRegistry.configIssues', 'Configuration Issues')}</span>
          <span className={`status-value ${issues.length > 0 ? 'warning' : 'success'}`}>
            {issues.length}
          </span>
        </div>
      </div>
      
      {issues.length > 0 && (
        <div className="issues-list">
          <h5>{t('projectRegistry.issuesFound', 'Issues Found')}</h5>
          {issues.map(issue => (
            <div key={issue.project} className="issue-item">
              <strong>{issue.project}:</strong> {issue.issues.join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple Project Configuration Editor (placeholder for full editor)
interface ProjectConfigurationEditorProps {
  project: ProjectConfiguration;
  onSave: (project: ProjectConfiguration) => void;
  onCancel: () => void;
}

function ProjectConfigurationEditor({ project, onSave, onCancel }: ProjectConfigurationEditorProps) {
  const [editedProject, setEditedProject] = useState<ProjectConfiguration>({ ...project });

  const handleSave = () => {
    onSave(editedProject);
  };

  return (
    <div className="project-editor">
      <div className="editor-header">
        <h3>Edit Project Configuration: {project.displayName}</h3>
        <div className="editor-actions">
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={onCancel} className="cancel-button">Cancel</button>
        </div>
      </div>
      
      <div className="editor-content">
        <p>Full configuration editor would be implemented here.</p>
        <p>This would include form fields for all configurable parameters.</p>
      </div>
    </div>
  );
}
