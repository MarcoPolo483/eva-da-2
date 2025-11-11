// src/components/integrated/RoleSelectionModal.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ROLES } from '../../lib/rbacManager';

interface RoleSelectionModalProps {
  onRoleSelect: (roleType: 'project_admin' | 'aicoe_project_owner' | 'aicoe_admin') => void;
  onClose: () => void;
}

export function RoleSelectionModal({ onRoleSelect, onClose }: RoleSelectionModalProps) {
  const { t } = useTranslation();

  const roleOptions = [
    {
      id: 'project_admin' as const,
      title: 'Project Admin',
      description: 'Edit and update assigned project parameters',
      icon: '👤',
      color: '#4CAF50',
      permissions: [
        'Edit project parameters',
        'Update project configurations', 
        'Manage project chat sessions',
        'Access assigned projects only'
      ]
    },
    {
      id: 'aicoe_project_owner' as const,
      title: 'AiCoE Project Owner',
      description: 'CRUD access to project registry for AiCoE personnel',
      icon: '👥',
      color: '#2196F3',
      permissions: [
        'Full project registry CRUD',
        'Create and delete projects',
        'Manage all project parameters',
        'Access all business projects'
      ]
    },
    {
      id: 'aicoe_admin' as const,
      title: 'AiCoE Admin',
      description: 'Full system access including global parameters',
      icon: '⚙️',
      color: '#FF9800',
      permissions: [
        'Full system administration',
        'Global parameter management',
        'User and role management',
        'System configuration access'
      ]
    }
  ];

  return (
    <div className="role-selection-modal">
      <div className="modal-overlay" onClick={onClose} />
      
      <div className="modal-content">
        <div className="modal-header">
          <h2>Welcome to EVA DA 2.0</h2>
          <p>Select your role to access the system with appropriate permissions</p>
        </div>

        <div className="role-options">
          {roleOptions.map(role => (
            <button
              key={role.id}
              className="role-option"
              onClick={() => onRoleSelect(role.id)}
              style={{ '--role-color': role.color } as React.CSSProperties}
            >
              <div className="role-header">
                <div className="role-icon">{role.icon}</div>
                <div className="role-info">
                  <h3 className="role-title">{role.title}</h3>
                  <p className="role-description">{role.description}</p>
                </div>
              </div>

              <div className="role-permissions">
                <h4>Permissions Include:</h4>
                <ul>
                  {role.permissions.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
              </div>

              <div className="role-action">
                <span className="action-text">Select Role</span>
                <span className="action-arrow">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <p className="demo-note">
            <strong>Demo Mode:</strong> This is a demonstration of the role-based access control system. 
            In production, user roles would be managed through authentication and authorization systems.
          </p>
        </div>
      </div>

      <style jsx>{`
        .role-selection-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 30px 30px 20px;
          text-align: center;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0 0 10px;
          font-size: 28px;
          font-weight: 600;
          color: #333;
        }

        .modal-header p {
          margin: 0;
          color: #666;
          font-size: 16px;
        }

        .role-options {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .role-option {
          display: block;
          width: 100%;
          padding: 24px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .role-option:hover {
          border-color: var(--role-color);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .role-option::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--role-color);
        }

        .role-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .role-icon {
          font-size: 32px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(var(--role-color), 0.1);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .role-info {
          flex: 1;
        }

        .role-title {
          margin: 0 0 8px;
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }

        .role-description {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }

        .role-permissions {
          margin-bottom: 20px;
        }

        .role-permissions h4 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .role-permissions ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .role-permissions li {
          padding: 4px 0;
          font-size: 13px;
          color: #666;
          position: relative;
          padding-left: 16px;
        }

        .role-permissions li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--role-color);
          font-weight: bold;
        }

        .role-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .action-text {
          font-weight: 600;
          color: var(--role-color);
        }

        .action-arrow {
          font-size: 18px;
          color: var(--role-color);
          transform: translateX(0);
          transition: transform 0.2s ease;
        }

        .role-option:hover .action-arrow {
          transform: translateX(4px);
        }

        .modal-footer {
          padding: 20px 30px 30px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .demo-note {
          margin: 0;
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 10px;
            max-width: none;
          }

          .role-header {
            flex-direction: column;
            text-align: center;
          }

          .role-icon {
            align-self: center;
          }
        }
      `}</style>
    </div>
  );
}
