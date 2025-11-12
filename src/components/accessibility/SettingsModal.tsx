// src/components/accessibility/SettingsModal.tsx
import { useState, useEffect } from 'react';
import { AccessibilitySettings } from './AccessibilitySettings';
import { ThemeCustomizer } from './ThemeCustomizer';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  initialTab?: 'accessibility' | 'theme' | 'preferences';
}

export function SettingsModal({ isOpen, onClose, userId, initialTab = 'accessibility' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'accessibility' | 'theme' | 'preferences'>(initialTab);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="settings-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="settings-modal-container">
        {/* Modal Header */}
        <div className="settings-modal-header">
          <div className="settings-modal-title-area">
            <h2 id="settings-modal-title">
              <span className="settings-icon">⚙️</span>
              EVA DA 2.0 Settings
            </h2>
            <p className="settings-subtitle">Customize your experience and accessibility preferences</p>
          </div>
          <button 
            className="settings-modal-close"
            onClick={onClose}
            aria-label="Close settings"
            title="Close settings (ESC)"
          >
            ✕
          </button>
        </div>        {/* Modal Navigation Tabs */}
        <div className="settings-modal-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'accessibility'}
            aria-controls="accessibility-panel"
            className={`settings-tab ${activeTab === 'accessibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessibility')}
          >
            <span className="tab-icon">♿</span>
            <span className="tab-label">Accessibility</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'theme'}
            aria-controls="theme-panel"
            className={`settings-tab ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            <span className="tab-icon">🎨</span>
            <span className="tab-label">Theme</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'preferences'}
            aria-controls="preferences-panel"
            className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">Preferences</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="settings-modal-content">
          {activeTab === 'accessibility' && (
            <div 
              id="accessibility-panel"
              role="tabpanel"
              aria-labelledby="accessibility-tab"
              className="settings-panel"
            >
              <AccessibilitySettings userId={userId} />
            </div>
          )}

          {activeTab === 'theme' && (
            <div 
              id="theme-panel"
              role="tabpanel"
              aria-labelledby="theme-tab"
              className="settings-panel"
            >
              <ThemeCustomizer userId={userId} />
            </div>
          )}

          {activeTab === 'preferences' && (
            <div 
              id="preferences-panel"
              role="tabpanel"
              aria-labelledby="preferences-tab"
              className="settings-panel"
            >
              <div className="preferences-placeholder">
                <div className="placeholder-icon">🚧</div>
                <h3>User Preferences</h3>
                <p>Additional user preference settings coming soon...</p>
                <ul className="feature-list">
                  <li>✓ Default project selection</li>
                  <li>✓ Notification preferences</li>
                  <li>✓ Quick action customization</li>
                  <li>✓ Dashboard layout preferences</li>
                  <li>✓ Export/Import settings</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="settings-modal-footer">
          <div className="footer-info">
            <span className="info-icon">ℹ️</span>
            <span>Changes are saved automatically</span>
          </div>
          <button 
            className="btn-primary"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
