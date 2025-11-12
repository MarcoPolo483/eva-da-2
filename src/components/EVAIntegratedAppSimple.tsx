// src/components/EVAIntegratedAppSimple.tsx
import { useState, useEffect, useCallback } from 'react';
import { rbacManager, type User } from '../lib/rbacManager';
import { databaseService, type DatabaseProject } from '../lib/databaseService';
import { EnhancedChatInterface } from './enhanced/EnhancedChatInterface';
import { ManageContentInterface } from './enhanced/ManageContentInterface';
import { SettingsModal } from './accessibility/SettingsModal';
import './integrated/EVAIntegratedApp.css';

interface QuickQuestion {
  id: string;
  title: string;
  description: string;
  category: string;
  usage: number;
  question: string;
}

export type ViewMode = 'business_project' | 'project_registry' | 'global_admin';
export type BusinessProjectTab = 'chat' | 'manage_content' | 'quick_questions' | 'project_settings';

export function EVAIntegratedApp() {
  // const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('canadaLife');
  const [viewMode, setViewMode] = useState<ViewMode>('business_project');
  const [businessProjectTab, setBusinessProjectTab] = useState<BusinessProjectTab>('chat');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');useEffect(() => {
    // Check for existing user session
    const existingUser = rbacManager.getCurrentUser();
    if (existingUser) {
      setCurrentUser(existingUser);
    } else {
      // Show role selection for demo purposes
      setShowRoleSelection(true);
    }

    console.log('[EVAIntegratedApp] Initialized for project:', selectedProject);
  }, [selectedProject]);
  const loadProjectData = useCallback(async () => {
    try {
      const projectData = await databaseService.getProject(selectedProject);
      setProject(projectData);
      
      // Load quick questions for the project
      const questions = await databaseService.getQuickQuestions(selectedProject);
      setQuickQuestions(questions || []);
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  }, [selectedProject]);
  useEffect(() => {
    if (currentUser && selectedProject) {
      loadProjectData();
    }
  }, [currentUser, selectedProject, loadProjectData]);

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

  if (showRoleSelection) {
    return (
      <div className="eva-role-selection">
        <div className="role-selection-modal">
          <h2>Select Your Role</h2>
          <p>Choose a role to explore the EVA DA 2.0 integrated interface:</p>
          
          <div className="role-buttons">
            <button 
              className="role-btn project-admin"
              onClick={() => handleRoleSelection('project_admin')}
            >
              <div className="role-icon">👤</div>
              <div className="role-info">
                <h3>Project Admin</h3>
                <p>Manage specific business projects</p>
              </div>
            </button>
            
            <button 
              className="role-btn aicoe-owner"
              onClick={() => handleRoleSelection('aicoe_project_owner')}
            >
              <div className="role-icon">🎯</div>
              <div className="role-info">
                <h3>AiCoE Project Owner</h3>
                <p>Oversee project registry and configurations</p>
              </div>
            </button>
            
            <button 
              className="role-btn aicoe-admin"
              onClick={() => handleRoleSelection('aicoe_admin')}
            >
              <div className="role-icon">⚡</div>
              <div className="role-info">
                <h3>AiCoE Admin</h3>
                <p>Global system administration</p>
              </div>
            </button>
          </div>
        </div>
      </div>
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
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userId={currentUser?.id}
      />

      {/* Simplified Navigation */}
      <header className="eva-main-header">
        <div className="header-content">
          <div className="eva-branding">
            <div className="eva-logo">EVA</div>
            <div className="eva-title">Digital Assistant 2.0</div>
          </div>
          
          <div className="user-info">
            <span>Welcome, {currentUser.name}</span>
            <span className="user-role">({currentUser.roles.join(', ')})</span>
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(true)}
              title="Open Settings"
              aria-label="Open accessibility and personalization settings"
            >
              <span className="settings-icon">⚙️</span>
              Settings
            </button>
            <button 
              className="sign-out-btn"
              onClick={() => {
                rbacManager.signOut();
                setCurrentUser(null);
                setShowRoleSelection(true);
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="eva-main-content">
        <div className="eva-content-header">
          <div className="project-selector">
            <label>Current Project:</label>            <select 
              value={selectedProject} 
              onChange={(e) => handleProjectChange(e.target.value)}
              title="Select Project"
            >
              <option value="canadaLife">Canada Life</option>
              <option value="jurisprudence">Jurisprudence</option>
              <option value="AssistMe">AssistMe</option>
            </select>
          </div>
          
          <div className="view-selector">
            <button 
              className={viewMode === 'business_project' ? 'active' : ''}
              onClick={() => handleViewModeChange('business_project')}
            >
              Business Project
            </button>
            {rbacManager.hasRole('aicoe_project_owner') && (
              <button 
                className={viewMode === 'project_registry' ? 'active' : ''}
                onClick={() => handleViewModeChange('project_registry')}
              >
                Project Registry
              </button>
            )}
            {rbacManager.hasRole('aicoe_admin') && (
              <button 
                className={viewMode === 'global_admin' ? 'active' : ''}
                onClick={() => handleViewModeChange('global_admin')}
              >
                Global Admin
              </button>
            )}
          </div>
        </div>

        <div className="eva-content-area">          {viewMode === 'business_project' && (
            <div className="business-project-view">
              {/* Project Header */}
              <div className="project-header">
                <div className="project-info">
                  <h2>{project?.displayName || selectedProject}</h2>
                  <p>{project?.description || `Digital Assistant for ${selectedProject}`}</p>
                </div>                <div className="project-stats">
                  <div className="stat">
                    <span className="stat-value">{project?.businessInfo?.expectedUsers || 0}</span>
                    <span className="stat-label">Users</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{project?.status || 'Active'}</span>
                    <span className="stat-label">Status</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{project?.domain}</span>
                    <span className="stat-label">Domain</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="business-project-tabs">                <button 
                  className={businessProjectTab === 'chat' ? 'active' : ''}
                  onClick={() => {
                    setBusinessProjectTab('chat');
                    if (businessProjectTab !== 'chat') {
                      setSelectedQuestion(''); // Clear when switching to chat from other tabs
                    }
                  }}
                >
                  <span className="tab-icon">💬</span>
                  EVA Chat
                </button>
                
                {rbacManager.hasRole('project_contributor') && (
                  <button 
                    className={businessProjectTab === 'manage_content' ? 'active' : ''}
                    onClick={() => setBusinessProjectTab('manage_content')}
                  >
                    <span className="tab-icon">📁</span>
                    Manage Content
                  </button>
                )}
                
                <button 
                  className={businessProjectTab === 'quick_questions' ? 'active' : ''}
                  onClick={() => setBusinessProjectTab('quick_questions')}
                >
                  <span className="tab-icon">❓</span>
                  Quick Questions
                </button>
                
                {rbacManager.hasRole('project_admin') && (
                  <button 
                    className={businessProjectTab === 'project_settings' ? 'active' : ''}
                    onClick={() => setBusinessProjectTab('project_settings')}
                  >
                    <span className="tab-icon">⚙️</span>
                    Project Settings
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="business-project-content">                {businessProjectTab === 'chat' && currentUser && (
                  <EnhancedChatInterface
                    projectId={selectedProject}
                    userId={currentUser.id}
                    userRoles={currentUser.roles}
                    initialQuestion={selectedQuestion}
                  />
                )}
                
                {businessProjectTab === 'manage_content' && currentUser && (
                  <ManageContentInterface
                    projectId={selectedProject}
                    userId={currentUser.id}
                    userRoles={currentUser.roles}
                  />
                )}
                
                {businessProjectTab === 'quick_questions' && (
                  <div className="quick-questions-tab">
                    <div className="quick-questions-header">
                      <h3>Frequently Asked Questions</h3>
                      <p>Click on any question to start a chat with that context</p>
                    </div>
                    <div className="questions-grid">
                      {quickQuestions.length > 0 ? (
                        quickQuestions.map((question, index) => (                          <div 
                            key={index} 
                            className="question-card"
                            onClick={() => {
                              setSelectedQuestion(question.question);
                              setBusinessProjectTab('chat');
                            }}
                          >
                            <h4>{question.title}</h4>
                            <p>{question.description}</p>
                            <div className="question-meta">
                              <span className="category">{question.category}</span>
                              <span className="usage">Used {question.usage || 0} times</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-questions">
                          <p>No quick questions configured for this project yet.</p>
                          {rbacManager.hasRole('project_admin') && (
                            <button className="add-question-btn">
                              Add Quick Questions
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {businessProjectTab === 'project_settings' && (
                  <div className="project-settings-tab">
                    <div className="settings-header">
                      <h3>Project Configuration</h3>
                      <p>Manage project parameters and access settings</p>
                    </div>
                    <div className="settings-sections">
                      <div className="settings-section">
                        <h4>AI Model Parameters</h4>                        <div className="setting-item">
                          <label>Default Temperature:</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            defaultValue="0.7"
                            title="Set the AI model temperature"
                            aria-label="AI model temperature"
                          />
                        </div>
                        <div className="setting-item">
                          <label>Max Response Length:</label>
                          <select 
                            defaultValue="medium"
                            title="Select maximum response length"
                            aria-label="Maximum response length"
                          >
                            <option value="short">Short (100 words)</option>
                            <option value="medium">Medium (300 words)</option>
                            <option value="long">Long (500+ words)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="settings-section">
                        <h4>Data Sources</h4>
                        <div className="data-source-toggle">
                          <label>
                            <input type="checkbox" defaultChecked />
                            Work Data (Internal Documents)
                          </label>
                          <label>
                            <input type="checkbox" defaultChecked />
                            Web Search (External Sources)
                          </label>
                        </div>
                      </div>
                      
                      <div className="settings-section">
                        <h4>Access Control</h4>                        <div className="access-info">
                          <p>Expected Users: {project?.businessInfo?.expectedUsers || 0}</p>
                          <button className="manage-users-btn">Manage User Access</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {viewMode === 'project_registry' && (
            <div className="project-registry-placeholder">
              <h2>Project Registry Management</h2>
              <p>Manage and configure project settings and parameters.</p>
              <div className="registry-info">
                <h3>Available Projects:</h3>
                <ul>
                  <li>Canada Life - Financial Services</li>
                  <li>Jurisprudence - Legal Research</li>
                  <li>AssistMe - General Purpose</li>
                </ul>
              </div>
            </div>
          )}
          
          {viewMode === 'global_admin' && (
            <div className="global-admin-placeholder">
              <h2>Global System Administration</h2>
              <p>System-wide configuration and monitoring.</p>
              <div className="admin-stats">
                <div className="stat">
                  <h3>3</h3>
                  <p>Active Projects</p>
                </div>
                <div className="stat">
                  <h3>12</h3>
                  <p>Total Users</p>
                </div>
                <div className="stat">
                  <h3>99.9%</h3>
                  <p>System Uptime</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
