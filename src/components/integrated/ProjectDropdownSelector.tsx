// src/components/integrated/ProjectDropdownSelector.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { configManager } from '../../lib/configurationManager';
import { rbacManager, type User } from '../../lib/rbacManager';
import type { ViewMode } from '../EVAIntegratedApp';

interface ProjectDropdownSelectorProps {
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
  viewMode: ViewMode;
  user: User;
}

export function ProjectDropdownSelector({ 
  selectedProject, 
  onProjectChange, 
  viewMode 
}: ProjectDropdownSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Get available projects based on view mode and user permissions
  const getAvailableProjects = () => {
    if (viewMode === 'business_project') {
      // Business project view: only show business projects user has access to
      const accessibleProjects = rbacManager.getAccessibleProjects();
      return configManager.getAllProjectConfigs()
        .filter(project => accessibleProjects.includes(project.id))
        .filter(project => project.id !== 'admin' && project.id !== 'globalAdmin'); // Exclude admin projects
    } else if (viewMode === 'project_registry') {
      // Project registry view: only show business projects (not registry itself)
      return configManager.getAllProjectConfigs()
        .filter(project => project.id !== 'admin' && project.id !== 'globalAdmin');
    } else {
      // Global admin view: show all projects
      return configManager.getAllProjectConfigs();
    }
  };

  const availableProjects = getAvailableProjects();
  const currentProject = configManager.getProjectConfig(selectedProject);

  const handleProjectSelect = (projectId: string) => {
    onProjectChange(projectId);
    setIsOpen(false);
  };

  return (
    <div className="eva-project-selector">
      <div className="selector-label">
        {viewMode === 'business_project' && t('selector.currentProject', 'Current Project')}
        {viewMode === 'project_registry' && t('selector.editingProject', 'Editing Project')}
        {viewMode === 'global_admin' && t('selector.managingProject', 'Managing Project')}
      </div>

      <div className="dropdown-container">
        <button 
          className="project-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: `linear-gradient(135deg, ${currentProject?.uiConfig?.theme?.background || '#2196F3'}, ${currentProject?.uiConfig?.theme?.surface || '#1976D2'})`
          }}
        >
          <div className="selected-project-info">
            <div className="project-icon">
              {getProjectIcon(selectedProject)}
            </div>
            <div className="project-details">
              <span className="project-name">
                {currentProject?.displayName || currentProject?.name || selectedProject}
              </span>
              <span className="project-domain">
                {currentProject?.businessInfo?.domain || 'Domain'}
              </span>
            </div>
          </div>
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <>
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <h3>
                  {viewMode === 'business_project' && t('selector.selectProject', 'Select Business Project')}
                  {viewMode === 'project_registry' && t('selector.selectToEdit', 'Select Project to Edit')}
                  {viewMode === 'global_admin' && t('selector.selectToManage', 'Select Project to Manage')}
                </h3>
              </div>

              <div className="projects-list">
                {availableProjects.map(project => (
                  <button
                    key={project.id}
                    className={`project-option ${selectedProject === project.id ? 'selected' : ''}`}
                    onClick={() => handleProjectSelect(project.id)}
                    style={{
                      borderLeft: `4px solid ${project.uiConfig?.theme?.primary || '#2196F3'}`
                    }}
                  >
                    <div className="project-option-icon">
                      {getProjectIcon(project.id)}
                    </div>
                    <div className="project-option-details">
                      <span className="project-option-name">
                        {project.displayName || project.name}
                      </span>
                      <span className="project-option-domain">
                        {project.businessInfo?.domain}
                      </span>
                      <span className="project-option-description">
                        {project.businessInfo?.businessCase}
                      </span>
                    </div>
                    {viewMode === 'project_registry' && rbacManager.hasPermission('project', 'update', project.id) && (
                      <div className="project-permissions">
                        <span className="permission-badge">Edit</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {availableProjects.length === 0 && (
                <div className="no-projects">
                  <p>{t('selector.noAccess', 'No projects available with your current permissions.')}</p>
                </div>
              )}
            </div>

            <div 
              className="dropdown-overlay"
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}

// Helper function to get project-specific icons
function getProjectIcon(projectId: string): string {
  const icons: Record<string, string> = {
    canadaLife: '🏛️',
    jurisprudence: '⚖️', 
    admin: '🔧',
    AssistMe: '🤝',
    globalAdmin: '🌐'
  };
  return icons[projectId] || '📁';
}
