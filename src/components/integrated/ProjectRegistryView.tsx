// src/components/integrated/ProjectRegistryView.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { configManager } from '../../lib/configurationManager';
import { rbacManager, type User } from '../../lib/rbacManager';
import './ChatInterface.css';

interface ProjectRegistryViewProps {
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
  user: User;
}

export function ProjectRegistryView({ selectedProject, onProjectChange, user }: ProjectRegistryViewProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const projectConfig = configManager.getProjectConfig(selectedProject as 'canadaLife' | 'jurisprudence' | 'admin' | 'AssistMe' | 'globalAdmin');

  const canEdit = rbacManager.hasPermission('project', 'update', selectedProject);

  if (!projectConfig) {
    return <div className="project-registry-error">Project not found</div>;
  }

  return (
    <div className="project-registry-view">
      <div className="registry-header">
        <div className="header-content">
          <h1>Project Registry Management</h1>
          <p>Configure and manage project parameters and settings</p>
          
          {canEdit && (
            <div className="header-actions">
              <button 
                className={`edit-toggle ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '💾 Save Changes' : '✏️ Edit Project'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="registry-content">
        <div className="project-overview-card">
          <h2>Project Overview</h2>
          <div className="overview-grid">
            <div className="overview-item">
              <label>Project Name</label>
              <div className="value">{projectConfig.displayName}</div>
            </div>
            <div className="overview-item">
              <label>Domain</label>
              <div className="value">{projectConfig.businessInfo.domain}</div>
            </div>
            <div className="overview-item">
              <label>Owner</label>
              <div className="value">{projectConfig.businessInfo.owner}</div>
            </div>
            <div className="overview-item">
              <label>Description</label>
              <div className="value">{projectConfig.businessInfo.businessCase}</div>
            </div>
          </div>
        </div>

        <div className="parameters-section">
          <h2>Configuration Parameters</h2>
          <div className="parameters-tabs">
            <div className="tab active">Business Info</div>
            <div className="tab">Technical Config</div>
            <div className="tab">UI Customization</div>
            <div className="tab">Compliance</div>
          </div>
          
          <div className="parameters-content">
            <p className="coming-soon">
              🚧 Full parameter editing interface coming soon!<br/>
              This will include all project configuration options with role-based editing capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
