// src/components/accessibility/ThemeCustomizer.tsx
import { useState, useEffect } from 'react';
import { accessibilityService } from '../../lib/accessibilityService';
import type { AccessibilityPreferences } from '../../lib/accessibilityService';
import './ThemeCustomizer.css';

interface ThemeCustomizerProps {
  userId?: string;
}

interface ThemePreset {
  name: string;
  description: string;
  icon: string;
  colors: {
    primary: string;
    accent: string;
  };
}

const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Ocean',
    description: 'Cool blues and deep waters',
    icon: '🌊',
    colors: { primary: '#0ea5e9', accent: '#06b6d4' }
  },
  {
    name: 'Sunset',
    description: 'Warm oranges and purples',
    icon: '🌅',
    colors: { primary: '#f97316', accent: '#a855f7' }
  },
  {
    name: 'Forest',
    description: 'Natural greens and earth tones',
    icon: '🌲',
    colors: { primary: '#10b981', accent: '#059669' }
  },
  {
    name: 'Corporate',
    description: 'Professional blue gradient',
    icon: '💼',
    colors: { primary: '#667eea', accent: '#764ba2' }
  },
  {
    name: 'Ruby',
    description: 'Bold reds and pinks',
    icon: '💎',
    colors: { primary: '#ef4444', accent: '#ec4899' }
  },
  {
    name: 'Lavender',
    description: 'Soft purples and lilacs',
    icon: '🌸',
    colors: { primary: '#a78bfa', accent: '#c084fc' }
  }
];

export function ThemeCustomizer({ userId }: ThemeCustomizerProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    accessibilityService.getPreferences()
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const unsubscribe = accessibilityService.subscribe((newPreferences) => {
      setPreferences(newPreferences);
    });

    return unsubscribe;
  }, []);

  const handleThemeChange = async (updates: Partial<AccessibilityPreferences['theme']>) => {
    const newTheme = { ...preferences.theme, ...updates };
    await accessibilityService.updatePreference('theme', newTheme, userId);
    setHasUnsavedChanges(false);
  };

  const applyPreset = async (preset: ThemePreset) => {
    await handleThemeChange({
      primaryColor: preset.colors.primary,
      accentColor: preset.colors.accent
    });
  };

  return (
    <div className="theme-customizer">
      <div className="theme-section">
        <h3 className="section-title">
          <span className="section-icon">🎨</span>
          Theme Presets
        </h3>
        <p className="section-description">
          Quick apply beautiful pre-designed themes
        </p>

        <div className="theme-presets-grid">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className="theme-preset-card"
              onClick={() => applyPreset(preset)}
              style={{
                background: `linear-gradient(135deg, ${preset.colors.primary} 0%, ${preset.colors.accent} 100%)`
              }}
            >
              <div className="preset-icon">{preset.icon}</div>
              <div className="preset-info">
                <h4>{preset.name}</h4>
                <p>{preset.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="theme-section">
        <h3 className="section-title">
          <span className="section-icon">🎯</span>
          Custom Colors
        </h3>
        <p className="section-description">
          Personalize your color scheme
        </p>

        <div className="color-pickers">
          <div className="color-picker-group">
            <label htmlFor="primary-color">Primary Color</label>
            <div className="color-input-wrapper">
              <input
                id="primary-color"
                type="color"
                value={preferences.theme.primaryColor}
                onChange={(e) => {
                  setHasUnsavedChanges(true);
                  handleThemeChange({ primaryColor: e.target.value });
                }}
                className="color-input"
              />
              <span className="color-value">{preferences.theme.primaryColor}</span>
            </div>
          </div>

          <div className="color-picker-group">
            <label htmlFor="accent-color">Accent Color</label>
            <div className="color-input-wrapper">
              <input
                id="accent-color"
                type="color"
                value={preferences.theme.accentColor}
                onChange={(e) => {
                  setHasUnsavedChanges(true);
                  handleThemeChange({ accentColor: e.target.value });
                }}
                className="color-input"
              />
              <span className="color-value">{preferences.theme.accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="theme-section">
        <h3 className="section-title">
          <span className="section-icon">📐</span>
          Layout Style
        </h3>
        <p className="section-description">
          Adjust the visual style of interface elements
        </p>

        <div className="style-options">
          <div className="style-option-group">
            <label>Border Radius</label>
            <div className="button-group">
              {(['sharp', 'rounded', 'curved'] as const).map((radius) => (
                <button
                  key={radius}
                  className={`style-btn ${preferences.theme.borderRadius === radius ? 'active' : ''}`}
                  onClick={() => handleThemeChange({ borderRadius: radius })}
                >
                  {radius === 'sharp' && '▢'}
                  {radius === 'rounded' && '▢'}
                  {radius === 'curved' && '●'}
                  <span>{radius}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="style-option-group">
            <label>Background Pattern</label>
            <div className="button-group">
              {(['none', 'subtle', 'geometric'] as const).map((pattern) => (
                <button
                  key={pattern}
                  className={`style-btn ${preferences.theme.backgroundPattern === pattern ? 'active' : ''}`}
                  onClick={() => handleThemeChange({ backgroundPattern: pattern })}
                >
                  {pattern === 'none' && '○'}
                  {pattern === 'subtle' && '◔'}
                  {pattern === 'geometric' && '◈'}
                  <span>{pattern}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="theme-section preview-section">
        <h3 className="section-title">
          <span className="section-icon">👁️</span>
          Live Preview
        </h3>
        <p className="section-description">
          See your theme in action
        </p>

        <div 
          className="theme-preview"
          style={{
            '--preview-primary': preferences.theme.primaryColor,
            '--preview-accent': preferences.theme.accentColor,
            '--preview-radius': preferences.theme.borderRadius === 'sharp' ? '0px' :
                                 preferences.theme.borderRadius === 'rounded' ? '8px' : '16px'
          } as React.CSSProperties}
        >
          <div className="preview-header">
            <h4>Sample Interface</h4>
            <button className="preview-btn">Button</button>
          </div>
          <div className="preview-content">
            <p>This is how your custom theme will look across the EVA DA 2.0 interface.</p>
            <div className="preview-cards">
              <div className="preview-card">Card 1</div>
              <div className="preview-card">Card 2</div>
              <div className="preview-card">Card 3</div>
            </div>
          </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="unsaved-indicator">
          <span className="indicator-icon">⚠️</span>
          <span>Changes are being saved automatically...</span>
        </div>
      )}
    </div>
  );
}
