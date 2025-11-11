// src/components/GlobalAppAdmin.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ConfigurationDashboard } from "./ConfigurationDashboard";
import { ConfigurationDiagnostics } from "./ConfigurationDiagnostics";
import { configManager } from "../lib/configurationManager";
import "./ConfigurationDashboard.css";
import "./GlobalAppAdmin.css";

// Modern Global Admin component using Configuration Management System
export function GlobalAppAdmin() {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'dashboard' | 'monitoring' | 'users' | 'system' | 'diagnostics'>('dashboard');
  const [systemStats, setSystemStats] = useState({
    totalProjects: 0,
    activeUsers: 0,
    systemHealth: 100,
    uptime: '99.9%'
  });

  useEffect(() => {
    // Load system statistics
    const projects = configManager.getAllProjectConfigs();
    setSystemStats({
      totalProjects: projects.length,
      activeUsers: 0, // Would be loaded from actual user service
      systemHealth: 95, // Would be calculated from monitoring
      uptime: '99.9%' // Would be loaded from monitoring service
    });
  }, []);

  return (
    <div className="global-app-admin">
      <div className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">
            {t('globalAdmin.title', 'EVA DA 2.0 Global Administration')}
          </h1>
          <p className="admin-subtitle">
            {t('globalAdmin.subtitle', 'Multi-tenant platform management and global configuration')}
          </p>
        </div>
        
        <div className="system-status">
          <div className="status-item">
            <span className="status-label">{t('globalAdmin.projects', 'Projects')}</span>
            <span className="status-value">{systemStats.totalProjects}</span>
          </div>
          <div className="status-item">
            <span className="status-label">{t('globalAdmin.users', 'Active Users')}</span>
            <span className="status-value">{systemStats.activeUsers}</span>
          </div>
          <div className="status-item">
            <span className="status-label">{t('globalAdmin.health', 'Health')}</span>
            <span className={`status-value ${systemStats.systemHealth >= 95 ? 'healthy' : 'warning'}`}>
              {systemStats.systemHealth}%
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">{t('globalAdmin.uptime', 'Uptime')}</span>
            <span className="status-value">{systemStats.uptime}</span>
          </div>
        </div>
      </div>

      <div className="admin-navigation">
        <button 
          className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          {t('globalAdmin.configuration', 'Configuration Dashboard')}
        </button>
        <button 
          className={`nav-button ${activeView === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveView('monitoring')}
        >
          {t('globalAdmin.monitoring', 'System Monitoring')}
        </button>
        <button 
          className={`nav-button ${activeView === 'users' ? 'active' : ''}`}
          onClick={() => setActiveView('users')}
        >
          {t('globalAdmin.userManagement', 'User Management')}
        </button>        <button 
          className={`nav-button ${activeView === 'system' ? 'active' : ''}`}
          onClick={() => setActiveView('system')}
        >
          {t('globalAdmin.systemSettings', 'System Settings')}
        </button>
        <button 
          className={`nav-button ${activeView === 'diagnostics' ? 'active' : ''}`}
          onClick={() => setActiveView('diagnostics')}
        >
          {t('globalAdmin.diagnostics', 'Diagnostics')}
        </button>
      </div>

      <div className="admin-content">
        {activeView === 'dashboard' && (
          <ConfigurationDashboard />
        )}
        
        {activeView === 'monitoring' && (
          <SystemMonitoring />
        )}
        
        {activeView === 'users' && (
          <UserManagement />
        )}
          {activeView === 'system' && (
          <SystemSettings />
        )}
        
        {activeView === 'diagnostics' && (
          <ConfigurationDiagnostics />
        )}
      </div>
    </div>
  );
}

// System Monitoring Component (Placeholder)
function SystemMonitoring() {
  const { t } = useTranslation();
  
  return (
    <div className="system-monitoring">
      <div className="monitoring-header">
        <h2>{t('globalAdmin.systemMonitoring', 'System Monitoring')}</h2>
        <p>{t('globalAdmin.monitoringDesc', 'Real-time system performance and health metrics')}</p>
      </div>
      
      <div className="monitoring-placeholder">
        <div className="placeholder-content">
          <h3>{t('globalAdmin.comingSoon', 'Coming Soon')}</h3>
          <p>{t('globalAdmin.monitoringPlaceholder', 'System monitoring dashboard will be implemented here with Azure Application Insights integration.')}</p>
          <ul>
            <li>{t('globalAdmin.feature1', 'Real-time performance metrics')}</li>
            <li>{t('globalAdmin.feature2', 'Error tracking and alerting')}</li>
            <li>{t('globalAdmin.feature3', 'User activity analytics')}</li>
            <li>{t('globalAdmin.feature4', 'Resource utilization monitoring')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// User Management Component (Placeholder)
function UserManagement() {
  const { t } = useTranslation();
  
  return (
    <div className="user-management">
      <div className="management-header">
        <h2>{t('globalAdmin.userManagement', 'User Management')}</h2>
        <p>{t('globalAdmin.userDesc', 'Manage user accounts, roles, and permissions across all projects')}</p>
      </div>
      
      <div className="management-placeholder">
        <div className="placeholder-content">
          <h3>{t('globalAdmin.comingSoon', 'Coming Soon')}</h3>
          <p>{t('globalAdmin.userPlaceholder', 'User management interface will be implemented here with Azure AD integration.')}</p>
          <ul>
            <li>{t('globalAdmin.userFeature1', 'User account provisioning and deprovisioning')}</li>
            <li>{t('globalAdmin.userFeature2', 'Role-based access control (RBAC)')}</li>
            <li>{t('globalAdmin.userFeature3', 'Project access management')}</li>
            <li>{t('globalAdmin.userFeature4', 'Activity audit logs')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// System Settings Component (Placeholder)
function SystemSettings() {
  const { t } = useTranslation();
  
  return (
    <div className="system-settings">
      <div className="settings-header">
        <h2>{t('globalAdmin.systemSettings', 'System Settings')}</h2>
        <p>{t('globalAdmin.settingsDesc', 'Global platform configuration and administrative settings')}</p>
      </div>
      
      <div className="settings-placeholder">
        <div className="placeholder-content">
          <h3>{t('globalAdmin.comingSoon', 'Coming Soon')}</h3>
          <p>{t('globalAdmin.settingsPlaceholder', 'Advanced system settings will be implemented here.')}</p>
          <ul>
            <li>{t('globalAdmin.settingsFeature1', 'Global security policies')}</li>
            <li>{t('globalAdmin.settingsFeature2', 'System-wide feature toggles')}</li>
            <li>{t('globalAdmin.settingsFeature3', 'Performance tuning parameters')}</li>
            <li>{t('globalAdmin.settingsFeature4', 'Integration configurations')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
