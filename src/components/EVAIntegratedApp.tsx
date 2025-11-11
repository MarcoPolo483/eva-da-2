// src/components/EVAIntegratedApp.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { rbacManager, type User } from '../lib/rbacManager';
import { MainNavigationHeader } from './integrated/MainNavigationHeader';
import { ProjectDropdownSelector } from './integrated/ProjectDropdownSelector';
import { BusinessProjectView } from './integrated/BusinessProjectView';
import { ProjectRegistryView } from './integrated/ProjectRegistryView';
import { GlobalAdminView } from './integrated/GlobalAdminView';
import { RoleSelectionModal } from './integrated/RoleSelectionModal';
import './integrated/EVAIntegratedApp.css';

export type ViewMode = 'business_project' | 'project_registry' | 'global_admin';

export function EVAIntegratedApp() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('canadaLife');
  const [viewMode, setViewMode] = useState<ViewMode>('business_project');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  useEffect(() => {
    // Check for existing user session
    const existingUser = rbacManager.getCurrentUser();
    if (existingUser) {
      setCurrentUser(existingUser);
    } else {
      // Show role selection for demo purposes
      setShowRoleSelection(true);
    }

    // Apply theme for current project - theme application handled by project components
    console.log('[EVAIntegratedApp] Initialized for project:', selectedProject);
  }, [selectedProject]);

  const handleRoleSelection = (roleType: 'project_admin' | 'aicoe_project_owner' | 'aicoe_admin') => {
    const demoUser = rbacManager.createDemoUser(roleType);
    rbacManager.setCurrentUser(demoUser);
    setCurrentUser(demoUser);
    setShowRoleSelection(false);

    // Set appropriate default view based on role
    if (roleType === 'aicoe_admin') {
      setViewMode('global_admin');
    } else if (roleType === 'aicoe_project_owner') {
      setViewMode('project_registry');
    } else {
      setViewMode('business_project');
    }
  };
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    // Theme application handled by project components
    console.log('[EVAIntegratedApp] Project changed to:', projectId);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    // Check permissions before switching
    if (mode === 'global_admin' && !rbacManager.hasRole('aicoe_admin')) {
      return; // Not authorized
    }
    if (mode === 'project_registry' && !rbacManager.hasRole('aicoe_project_owner') && !rbacManager.hasRole('aicoe_admin')) {
      return; // Not authorized
    }

    setViewMode(mode);
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'business_project':
        return (
          <BusinessProjectView 
            projectId={selectedProject}
            user={currentUser}
          />
        );
      case 'project_registry':
        return (
          <ProjectRegistryView 
            selectedProject={selectedProject}
            onProjectChange={handleProjectChange}
            user={currentUser}
          />
        );
      case 'global_admin':
        return (
          <GlobalAdminView 
            user={currentUser}
          />
        );
      default:
        return <div>Invalid view mode</div>;
    }
  };

  if (showRoleSelection) {
    return (
      <RoleSelectionModal 
        onRoleSelect={handleRoleSelection}
        onClose={() => setShowRoleSelection(false)}
      />
    );
  }

  if (!currentUser) {
    return (
      <div className="eva-loading">
        <div className="loading-spinner"></div>
        <p>Loading EVA DA 2.0...</p>
      </div>
    );
  }

  return (
    <div className="eva-integrated-app">
      <MainNavigationHeader 
        user={currentUser}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onSignOut={() => {
          rbacManager.signOut();
          setCurrentUser(null);
          setShowRoleSelection(true);
        }}
      />

      <div className="eva-main-content">
        <div className="eva-content-header">
          <ProjectDropdownSelector 
            selectedProject={selectedProject}
            onProjectChange={handleProjectChange}
            viewMode={viewMode}
            user={currentUser}
          />
          
          <div className="eva-view-info">
            <div className="current-view-indicator">
              <span className="view-label">
                {viewMode === 'business_project' && t('eva.businessProject', 'Business Project')}
                {viewMode === 'project_registry' && t('eva.projectRegistry', 'Project Registry')}
                {viewMode === 'global_admin' && t('eva.globalAdmin', 'Global Administration')}
              </span>
            </div>
          </div>
        </div>

        <div className="eva-content-area">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
}
