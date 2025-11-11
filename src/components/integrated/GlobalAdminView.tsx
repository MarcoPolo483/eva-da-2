// src/components/integrated/GlobalAdminView.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '../../lib/rbacManager';
import { ConfigurationDashboard } from '../ConfigurationDashboard';
import './ChatInterface.css';

interface GlobalAdminViewProps {
  user: User;
}

export function GlobalAdminView({ user }: GlobalAdminViewProps) {
  const { t } = useTranslation();

  return (
    <div className="global-admin-view">
      <div className="admin-header">
        <div className="header-content">
          <h1>Global Administration</h1>
          <p>System-wide configuration and management for AiCoE administrators</p>
          
          <div className="admin-stats">
            <div className="stat-item">
              <span className="stat-value">5</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">System Health</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">Admin</span>
              <span className="stat-label">Access Level</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <ConfigurationDashboard />
      </div>
    </div>
  );
}
