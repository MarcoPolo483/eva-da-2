// src/components/accessibility/AccessibilitySettings.tsx
import { useState, useEffect } from 'react';
import { accessibilityService, type AccessibilityPreferences } from '../../lib/accessibilityService';
import './AccessibilitySettings.css';

interface AccessibilitySettingsProps {
  userId?: string;
  onClose?: () => void;
}

export function AccessibilitySettings({ userId, onClose }: AccessibilitySettingsProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    accessibilityService.getPreferences()
  );
  const [activeTab, setActiveTab] = useState<'visual' | 'navigation' | 'audio' | 'cognitive' | 'language'>('visual');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Subscribe to accessibility service changes
    const unsubscribe = accessibilityService.subscribe((newPrefs) => {
      setPreferences(newPrefs);
    });

    return () => unsubscribe();
  }, []);

  const updatePreference = async <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setHasChanges(true);
    await accessibilityService.updatePreference(key, value, userId);
  };

  const handleReset = async () => {
    if (confirm('Reset all accessibility preferences to defaults?')) {
      await accessibilityService.resetToDefaults(userId);
      setHasChanges(false);
      accessibilityService.announceToScreenReader('Preferences reset to defaults');
    }
  };

  const handleSave = async () => {
    await accessibilityService.saveUserPreferences(userId);
    setHasChanges(false);
    accessibilityService.announceToScreenReader('Preferences saved successfully');
  };

  return (
    <div className="accessibility-settings" role="dialog" aria-labelledby="accessibility-title">
      <div className="accessibility-header">
        <h2 id="accessibility-title">
          <span className="icon">♿</span>
          Accessibility & Personalization
        </h2>
        {onClose && (
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close accessibility settings"
          >
            ✕
          </button>
        )}
      </div>

      <div className="accessibility-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'visual'}
          aria-controls="visual-panel"
          className={activeTab === 'visual' ? 'active' : ''}
          onClick={() => setActiveTab('visual')}
        >
          <span className="tab-icon">👁️</span>
          Visual
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'navigation'}
          aria-controls="navigation-panel"
          className={activeTab === 'navigation' ? 'active' : ''}
          onClick={() => setActiveTab('navigation')}
        >
          <span className="tab-icon">⌨️</span>
          Navigation
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'audio'}
          aria-controls="audio-panel"
          className={activeTab === 'audio' ? 'active' : ''}
          onClick={() => setActiveTab('audio')}
        >
          <span className="tab-icon">🔊</span>
          Audio
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'cognitive'}
          aria-controls="cognitive-panel"
          className={activeTab === 'cognitive' ? 'active' : ''}
          onClick={() => setActiveTab('cognitive')}
        >
          <span className="tab-icon">🧠</span>
          Cognitive
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'language'}
          aria-controls="language-panel"
          className={activeTab === 'language' ? 'active' : ''}
          onClick={() => setActiveTab('language')}
        >
          <span className="tab-icon">🌐</span>
          Language
        </button>
      </div>

      <div className="accessibility-content">
        {/* Visual Accessibility Panel */}
        {activeTab === 'visual' && (
          <div id="visual-panel" role="tabpanel" className="settings-panel">
            <div className="settings-section">
              <h3>Font Size</h3>
              <div className="radio-group" role="radiogroup" aria-label="Font size options">
                {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                  <label key={size} className="radio-option">
                    <input
                      type="radio"
                      name="fontSize"
                      value={size}
                      checked={preferences.fontSize === size}
                      onChange={() => updatePreference('fontSize', size)}
                    />
                    <span className="radio-label">
                      {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h3>Contrast</h3>
              <div className="radio-group" role="radiogroup" aria-label="Contrast options">
                {(['normal', 'high', 'extra-high'] as const).map((contrast) => (
                  <label key={contrast} className="radio-option">
                    <input
                      type="radio"
                      name="contrast"
                      value={contrast}
                      checked={preferences.contrast === contrast}
                      onChange={() => updatePreference('contrast', contrast)}
                    />
                    <span className="radio-label">
                      {contrast.charAt(0).toUpperCase() + contrast.slice(1).replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h3>Color Scheme</h3>
              <div className="radio-group" role="radiogroup" aria-label="Color scheme options">
                {(['light', 'dark', 'auto', 'high-contrast'] as const).map((scheme) => (
                  <label key={scheme} className="radio-option">
                    <input
                      type="radio"
                      name="colorScheme"
                      value={scheme}
                      checked={preferences.colorScheme === scheme}
                      onChange={() => updatePreference('colorScheme', scheme)}
                    />
                    <span className="radio-label">
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1).replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h3>Motion & Effects</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.reduceMotion}
                  onChange={(e) => updatePreference('reduceMotion', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Reduce Motion</span>
              </label>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.reduceTransparency}
                  onChange={(e) => updatePreference('reduceTransparency', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Reduce Transparency</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Panel */}
        {activeTab === 'navigation' && (
          <div id="navigation-panel" role="tabpanel" className="settings-panel">
            <div className="settings-section">
              <h3>Keyboard Navigation</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.keyboardNavigation}
                  onChange={(e) => updatePreference('keyboardNavigation', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Enable Keyboard Shortcuts</span>
              </label>
              <p className="setting-description">
                Use Alt+1-9 for quick navigation, Ctrl+/ for help
              </p>
            </div>

            <div className="settings-section">
              <h3>Focus Indicators</h3>
              <div className="radio-group" role="radiogroup" aria-label="Focus indicator visibility">
                {(['subtle', 'prominent', 'high-visibility'] as const).map((indicator) => (
                  <label key={indicator} className="radio-option">
                    <input
                      type="radio"
                      name="focusIndicators"
                      value={indicator}
                      checked={preferences.focusIndicators === indicator}
                      onChange={() => updatePreference('focusIndicators', indicator)}
                    />
                    <span className="radio-label">
                      {indicator.charAt(0).toUpperCase() + indicator.slice(1).replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h3>Click Target Size</h3>
              <div className="radio-group" role="radiogroup" aria-label="Click target size">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <label key={size} className="radio-option">
                    <input
                      type="radio"
                      name="clickTargetSize"
                      value={size}
                      checked={preferences.clickTargetSize === size}
                      onChange={() => updatePreference('clickTargetSize', size)}
                    />
                    <span className="radio-label">
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h3>Tooltip Delay</h3>
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={preferences.tooltipDelay}
                onChange={(e) => updatePreference('tooltipDelay', parseInt(e.target.value))}
                aria-label="Tooltip delay in milliseconds"
              />
              <div className="range-value">{preferences.tooltipDelay}ms</div>
            </div>
          </div>
        )}

        {/* Audio Panel */}
        {activeTab === 'audio' && (
          <div id="audio-panel" role="tabpanel" className="settings-panel">
            <div className="settings-section">
              <h3>Audio Feedback</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.soundEffects}
                  onChange={(e) => updatePreference('soundEffects', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Sound Effects</span>
              </label>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.screenReaderAnnouncements}
                  onChange={(e) => updatePreference('screenReaderAnnouncements', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Screen Reader Announcements</span>
              </label>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.audioDescriptions}
                  onChange={(e) => updatePreference('audioDescriptions', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Audio Descriptions</span>
              </label>
            </div>

            <div className="settings-section">
              <h3>Notification Volume</h3>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.notificationVolume}
                onChange={(e) => updatePreference('notificationVolume', parseInt(e.target.value))}
                aria-label="Notification volume percentage"
              />
              <div className="range-value">{preferences.notificationVolume}%</div>
            </div>
          </div>
        )}

        {/* Cognitive Support Panel */}
        {activeTab === 'cognitive' && (
          <div id="cognitive-panel" role="tabpanel" className="settings-panel">
            <div className="settings-section">
              <h3>Interface Simplification</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.simplifiedInterface}
                  onChange={(e) => updatePreference('simplifiedInterface', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Simplified Interface</span>
              </label>
              <p className="setting-description">
                Reduces visual complexity and focuses on essential features
              </p>
            </div>

            <div className="settings-section">
              <h3>Navigation Aids</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.breadcrumbNavigation}
                  onChange={(e) => updatePreference('breadcrumbNavigation', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Breadcrumb Navigation</span>
              </label>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.skipLinks}
                  onChange={(e) => updatePreference('skipLinks', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Skip Links</span>
              </label>
            </div>

            <div className="settings-section">
              <h3>User Assistance</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.autoSave}
                  onChange={(e) => updatePreference('autoSave', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Auto-Save</span>
              </label>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.confirmActions}
                  onChange={(e) => updatePreference('confirmActions', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Confirm Destructive Actions</span>
              </label>
            </div>
          </div>
        )}

        {/* Language Panel */}
        {activeTab === 'language' && (
          <div id="language-panel" role="tabpanel" className="settings-panel">
            <div className="settings-section">
              <h3>Display Language</h3>
              <select
                value={preferences.language}
                onChange={(e) => updatePreference('language', e.target.value as any)}
                aria-label="Select display language"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="settings-section">
              <h3>Text-to-Speech</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={preferences.textToSpeech}
                  onChange={(e) => updatePreference('textToSpeech', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Enable Text-to-Speech</span>
              </label>
            </div>

            {preferences.textToSpeech && (
              <>
                <div className="settings-section">
                  <h3>Speech Rate</h3>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={preferences.speechRate}
                    onChange={(e) => updatePreference('speechRate', parseFloat(e.target.value))}
                    aria-label="Speech rate multiplier"
                  />
                  <div className="range-value">{preferences.speechRate}x</div>
                </div>

                <div className="settings-section">
                  <h3>Voice Selection</h3>
                  <select
                    value={preferences.voiceSelection}
                    onChange={(e) => updatePreference('voiceSelection', e.target.value as any)}
                    aria-label="Select voice for text-to-speech"
                  >
                    <option value="system">System Default</option>
                    <option value="azure-neural">Azure Neural Voice</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="accessibility-footer">
        <button 
          className="btn-reset" 
          onClick={handleReset}
          aria-label="Reset all preferences to defaults"
        >
          Reset to Defaults
        </button>
        <div className="footer-actions">
          {hasChanges && (
            <span className="unsaved-indicator" aria-live="polite">
              Unsaved changes
            </span>
          )}
          <button 
            className="btn-save" 
            onClick={handleSave}
            disabled={!hasChanges}
            aria-label="Save preferences"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
