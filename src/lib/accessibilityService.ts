// src/lib/accessibilityService.ts
import { databaseService } from './databaseService';

export interface AccessibilityPreferences {
  // Visual Accessibility
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrast: 'normal' | 'high' | 'extra-high';
  colorScheme: 'light' | 'dark' | 'auto' | 'high-contrast';
  reduceMotion: boolean;
  reduceTransparency: boolean;
  
  // Navigation & Interaction
  keyboardNavigation: boolean;
  focusIndicators: 'subtle' | 'prominent' | 'high-visibility';
  clickTargetSize: 'small' | 'medium' | 'large';
  tooltipDelay: number; // milliseconds
  
  // Audio & Notifications
  soundEffects: boolean;
  screenReaderAnnouncements: boolean;
  audioDescriptions: boolean;
  notificationVolume: number; // 0-100
  
  // Cognitive Support
  simplifiedInterface: boolean;
  breadcrumbNavigation: boolean;
  skipLinks: boolean;
  autoSave: boolean;
  confirmActions: boolean;
  
  // Language & Text
  language: 'en' | 'fr' | 'es'; // Expandable
  textToSpeech: boolean;
  speechRate: number; // 0.5-2.0
  voiceSelection: 'system' | 'azure-neural';
  
  // Personalization
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundPattern: 'none' | 'subtle' | 'geometric';
    borderRadius: 'sharp' | 'rounded' | 'curved';
  };
  dashboard: {
    layout: 'compact' | 'comfortable' | 'spacious';
    showQuickActions: boolean;
    pinnedFeatures: string[];
  };
}

export interface UserPersonalization {
  userId: string;
  displayName: string;
  avatar?: string;
  preferences: AccessibilityPreferences;
  quickActions: string[];
  favoriteProjects: string[];
  recentActivity: Array<{
    action: string;
    timestamp: Date;
    projectId?: string;
  }>;
  customShortcuts: Record<string, string>;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  fontSize: 'medium',
  contrast: 'normal',
  colorScheme: 'auto',
  reduceMotion: false,
  reduceTransparency: false,
  
  keyboardNavigation: true,
  focusIndicators: 'subtle',
  clickTargetSize: 'medium',
  tooltipDelay: 500,
  
  soundEffects: true,
  screenReaderAnnouncements: true,
  audioDescriptions: false,
  notificationVolume: 70,
  
  simplifiedInterface: false,
  breadcrumbNavigation: true,
  skipLinks: true,
  autoSave: true,
  confirmActions: false,
  
  language: 'en',
  textToSpeech: false,
  speechRate: 1.0,
  voiceSelection: 'system',
  
  theme: {
    primaryColor: '#667eea',
    accentColor: '#764ba2',
    backgroundPattern: 'subtle',
    borderRadius: 'rounded'
  },
  dashboard: {
    layout: 'comfortable',
    showQuickActions: true,
    pinnedFeatures: ['chat', 'recent-files', 'quick-questions']
  }
};

class AccessibilityService {
  private currentPreferences: AccessibilityPreferences = DEFAULT_ACCESSIBILITY_PREFERENCES;
  private changeListeners: Array<(preferences: AccessibilityPreferences) => void> = [];
  private announceQueue: string[] = [];
  private isAnnouncing = false;

  constructor() {
    this.loadUserPreferences();
    this.setupKeyboardShortcuts();
    this.setupSystemPreferencesListener();
  }

  // Load user preferences from storage/database
  async loadUserPreferences(userId?: string): Promise<void> {
    try {
      if (userId) {
        const userPersonalization = await databaseService.getUserPersonalization(userId);
        if (userPersonalization?.preferences) {
          this.currentPreferences = {
            ...DEFAULT_ACCESSIBILITY_PREFERENCES,
            ...userPersonalization.preferences
          };
        }
      } else {
        // Load from localStorage for guest users
        const saved = localStorage.getItem('eva-accessibility-preferences');
        if (saved) {
          this.currentPreferences = {
            ...DEFAULT_ACCESSIBILITY_PREFERENCES,
            ...JSON.parse(saved)
          };
        }
      }
      
      this.applyPreferences();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
    }
  }

  // Save preferences to storage/database
  async saveUserPreferences(userId?: string): Promise<void> {
    try {
      if (userId) {
        await databaseService.updateUserPersonalization(userId, {
          preferences: this.currentPreferences
        });
      } else {
        localStorage.setItem('eva-accessibility-preferences', JSON.stringify(this.currentPreferences));
      }
      
      console.log('Accessibility preferences saved successfully');
    } catch (error) {
      console.error('Failed to save accessibility preferences:', error);
    }
  }

  // Get current preferences
  getPreferences(): AccessibilityPreferences {
    return { ...this.currentPreferences };
  }

  // Update specific preference
  async updatePreference<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
    userId?: string
  ): Promise<void> {
    this.currentPreferences[key] = value;
    this.applyPreferences();
    this.notifyListeners();
    await this.saveUserPreferences(userId);
    
    // Announce change for screen readers
    if (this.currentPreferences.screenReaderAnnouncements) {
      this.announceChange(key, value);
    }
  }

  // Bulk update preferences
  async updatePreferences(updates: Partial<AccessibilityPreferences>, userId?: string): Promise<void> {
    this.currentPreferences = {
      ...this.currentPreferences,
      ...updates
    };
    
    this.applyPreferences();
    this.notifyListeners();
    await this.saveUserPreferences(userId);
  }

  // Subscribe to preference changes
  subscribe(listener: (preferences: AccessibilityPreferences) => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  // Apply preferences to DOM and CSS
  private applyPreferences(): void {
    const root = document.documentElement;
    const prefs = this.currentPreferences;

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '22px'
    };
    root.style.setProperty('--eva-font-size-base', fontSizeMap[prefs.fontSize]);

    // Color scheme and contrast
    root.setAttribute('data-theme', prefs.colorScheme);
    root.setAttribute('data-contrast', prefs.contrast);
    
    // Motion preferences
    if (prefs.reduceMotion) {
      root.style.setProperty('--eva-animation-duration', '0ms');
      root.style.setProperty('--eva-transition-duration', '0ms');
    } else {
      root.style.setProperty('--eva-animation-duration', '300ms');
      root.style.setProperty('--eva-transition-duration', '200ms');
    }

    // Transparency
    if (prefs.reduceTransparency) {
      root.style.setProperty('--eva-backdrop-filter', 'none');
      root.style.setProperty('--eva-background-opacity', '1');
    } else {
      root.style.setProperty('--eva-backdrop-filter', 'blur(15px)');
      root.style.setProperty('--eva-background-opacity', '0.95');
    }

    // Focus indicators
    const focusStyles = {
      subtle: '2px solid rgba(102, 126, 234, 0.5)',
      prominent: '3px solid #667eea',
      'high-visibility': '4px solid #ff6b35'
    };
    root.style.setProperty('--eva-focus-outline', focusStyles[prefs.focusIndicators]);

    // Click target sizes
    const targetSizes = {
      small: '32px',
      medium: '44px',
      large: '56px'
    };
    root.style.setProperty('--eva-min-target-size', targetSizes[prefs.clickTargetSize]);

    // Theme colors
    root.style.setProperty('--eva-primary-color', prefs.theme.primaryColor);
    root.style.setProperty('--eva-accent-color', prefs.theme.accentColor);

    // Border radius
    const radiusMap = {
      sharp: '0px',
      rounded: '8px',
      curved: '16px'
    };
    root.style.setProperty('--eva-border-radius', radiusMap[prefs.theme.borderRadius]);

    // Add accessibility classes
    document.body.classList.toggle('reduce-motion', prefs.reduceMotion);
    document.body.classList.toggle('high-contrast', prefs.contrast !== 'normal');
    document.body.classList.toggle('simplified-interface', prefs.simplifiedInterface);
    document.body.classList.toggle('keyboard-navigation', prefs.keyboardNavigation);
  }

  // Setup keyboard shortcuts
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.currentPreferences.keyboardNavigation) return;

      // Alt + 1-9 for quick navigation
      if (event.altKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        this.handleQuickNavigation(parseInt(event.key));
      }

      // Ctrl + / for help
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        this.showKeyboardShortcuts();
      }

      // Escape to close modals/menus
      if (event.key === 'Escape') {
        this.closeAllOverlays();
      }
    });
  }

  // Listen for system preference changes
  private setupSystemPreferencesListener(): void {
    // Dark mode preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', () => {
      if (this.currentPreferences.colorScheme === 'auto') {
        this.applyPreferences();
      }
    });

    // Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (e.matches && !this.currentPreferences.reduceMotion) {
        this.updatePreference('reduceMotion', true);
      }
    });

    // High contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    contrastQuery.addEventListener('change', (e) => {
      if (e.matches && this.currentPreferences.contrast === 'normal') {
        this.updatePreference('contrast', 'high');
      }
    });
  }

  // Screen reader announcements
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.currentPreferences.screenReaderAnnouncements) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Text-to-speech functionality
  async speakText(text: string): Promise<void> {
    if (!this.currentPreferences.textToSpeech || !('speechSynthesis' in window)) return;

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.currentPreferences.speechRate;
      utterance.lang = this.currentPreferences.language === 'en' ? 'en-US' : 
                      this.currentPreferences.language === 'fr' ? 'fr-CA' : 'es-ES';
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      speechSynthesis.speak(utterance);
    });
  }

  // Utility methods
  private notifyListeners(): void {
    this.changeListeners.forEach(listener => listener(this.currentPreferences));
  }

  private announceChange(key: keyof AccessibilityPreferences, value: any): void {
    const messages: Record<string, string> = {
      fontSize: `Font size changed to ${value}`,
      colorScheme: `Color scheme changed to ${value}`,
      contrast: `Contrast changed to ${value}`,
      reduceMotion: `Motion ${value ? 'reduced' : 'enabled'}`,
      keyboardNavigation: `Keyboard navigation ${value ? 'enabled' : 'disabled'}`
    };

    const message = messages[key] || `${key} preference updated`;
    this.announceToScreenReader(message);
  }

  private handleQuickNavigation(number: number): void {
    const shortcuts = [
      () => this.focusElement('[data-shortcut="main-nav"]'),
      () => this.focusElement('[data-shortcut="search"]'),
      () => this.focusElement('[data-shortcut="chat"]'),
      () => this.focusElement('[data-shortcut="content"]'),
      () => this.focusElement('[data-shortcut="settings"]'),
      () => this.focusElement('[data-shortcut="help"]'),
      () => this.focusElement('[data-shortcut="profile"]'),
      () => this.focusElement('[data-shortcut="projects"]'),
      () => this.focusElement('[data-shortcut="notifications"]')
    ];

    const handler = shortcuts[number - 1];
    if (handler) {
      handler();
      this.announceToScreenReader(`Navigated to section ${number}`, 'assertive');
    }
  }

  private focusElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private showKeyboardShortcuts(): void {
    // This would trigger a modal with keyboard shortcuts
    const event = new CustomEvent('eva:show-keyboard-shortcuts');
    document.dispatchEvent(event);
  }

  private closeAllOverlays(): void {
    const event = new CustomEvent('eva:close-overlays');
    document.dispatchEvent(event);
  }

  // Reset to defaults
  async resetToDefaults(userId?: string): Promise<void> {
    this.currentPreferences = { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    this.applyPreferences();
    this.notifyListeners();
    await this.saveUserPreferences(userId);
    this.announceToScreenReader('Accessibility preferences reset to defaults');
  }

  // Get available voices for TTS
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  // Accessibility audit
  performAccessibilityAudit(): Array<{issue: string; severity: 'low' | 'medium' | 'high'; element?: string}> {
    const issues: Array<{issue: string; severity: 'low' | 'medium' | 'high'; element?: string}> = [];

    // Check for missing alt text
    document.querySelectorAll('img:not([alt])').forEach((img, index) => {
      issues.push({
        issue: `Image missing alt text`,
        severity: 'high',
        element: `img:nth-child(${index + 1})`
      });
    });

    // Check for insufficient color contrast (simplified check)
    if (this.currentPreferences.contrast === 'normal') {
      issues.push({
        issue: 'Consider enabling high contrast for better accessibility',
        severity: 'medium'
      });
    }

    // Check for keyboard accessibility
    if (!this.currentPreferences.keyboardNavigation) {
      issues.push({
        issue: 'Keyboard navigation is disabled',
        severity: 'high'
      });
    }

    return issues;
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();
export default accessibilityService;
