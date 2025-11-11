// src/components/integrated/MainNavigationHeader.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '../../lib/rbacManager';
import type { ViewMode } from '../EVAIntegratedApp';
import { rbacManager } from '../../lib/rbacManager';

interface MainNavigationHeaderProps {
  user: User;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSignOut: () => void;
}

export function MainNavigationHeader({ 
  user, 
  viewMode, 
  onViewModeChange, 
  onSignOut 
}: MainNavigationHeaderProps) {
  const { t } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const canAccessProjectRegistry = rbacManager.hasRole('aicoe_project_owner') || rbacManager.hasRole('aicoe_admin');
  const canAccessGlobalAdmin = rbacManager.hasRole('aicoe_admin');

  return (
    <header className="eva-main-header">
      <div className="header-content">
        {/* Logo and Brand */}
        <div className="eva-brand">
          <div className="eva-logo">
            <div className="logo-icon">EVA</div>
            <div className="logo-text">
              <span className="logo-main">Digital Assistant</span>
              <span className="logo-version">2.0</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="eva-nav-menu">
          <button
            className={`nav-item ${viewMode === 'business_project' ? 'active' : ''}`}
            onClick={() => onViewModeChange('business_project')}
          >
            <span className="nav-icon">🏢</span>
            <span className="nav-label">{t('nav.businessProjects', 'Business Projects')}</span>
          </button>

          {canAccessProjectRegistry && (
            <button
              className={`nav-item ${viewMode === 'project_registry' ? 'active' : ''}`}
              onClick={() => onViewModeChange('project_registry')}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-label">{t('nav.projectRegistry', 'Project Registry')}</span>
            </button>
          )}

          {canAccessGlobalAdmin && (
            <button
              className={`nav-item ${viewMode === 'global_admin' ? 'active' : ''}`}
              onClick={() => onViewModeChange('global_admin')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">{t('nav.globalAdmin', 'Global Admin')}</span>
            </button>
          )}
        </nav>

        {/* User Menu */}
        <div className="eva-user-menu">
          <button 
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">
                {user.roles.map(roleId => {
                  const role = Object.values(rbacManager.ROLES || {}).find(r => r.id === roleId);
                  return role?.name || roleId;
                }).join(', ')}
              </span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-details">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              
              <div className="dropdown-section">
                <div className="section-title">Roles & Permissions</div>
                {user.roles.map(roleId => {
                  const role = Object.values(rbacManager.ROLES || {}).find(r => r.id === roleId);
                  return role ? (
                    <div key={roleId} className="role-item">
                      <span className="role-name">{role.name}</span>
                      <span className="role-level">Level {role.level}</span>
                    </div>
                  ) : null;
                })}
              </div>

              {user.projectAssignments && user.projectAssignments.length > 0 && (
                <div className="dropdown-section">
                  <div className="section-title">Project Access</div>
                  {user.projectAssignments.map(projectId => (
                    <div key={projectId} className="project-access-item">
                      {projectId}
                    </div>
                  ))}
                </div>
              )}

              <div className="dropdown-actions">
                <button 
                  className="dropdown-action"
                  onClick={() => {
                    setShowUserMenu(false);
                    // Could open preferences modal
                  }}
                >
                  Preferences
                </button>
                <button 
                  className="dropdown-action sign-out"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="user-menu-overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
