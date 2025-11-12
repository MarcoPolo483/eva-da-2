// src/data/seed/defaultSettings.ts
// Default accessibility and personalization settings for EVA DA 2.0

export interface DefaultAccessibilitySettings {
  fontSize: {
    size: number;
    min: number;
    max: number;
    step: number;
    unit: string;
  };
  colorScheme: {
    scheme: 'light' | 'dark' | 'auto';
    highContrast: boolean;
  };
  contrast: {
    level: number;
    min: number;
    max: number;
    step: number;
  };
  motion: {
    reduceMotion: boolean;
    animationSpeed: number;
    disableAnimations: boolean;
  };
  keyboard: {
    enableShortcuts: boolean;
    focusIndicatorSize: number;
    tabNavigation: boolean;
  };
  screenReader: {
    announceChanges: boolean;
    verboseMode: boolean;
    skipToContent: boolean;
  };
}

export interface DefaultThemeSettings {
  id: string;
  name: string;
  displayName: {
    en: string;
    fr: string;
  };
  colors: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  isDefault?: boolean;
  category: 'default' | 'custom' | 'preset';
}

export interface GlobalDefaultSettings {
  id: string;
  platform: {
    name: string;
    version: string;
    supportEmail: string;
    maintenanceMode: boolean;
    environment: 'development' | 'staging' | 'production';
  };
  security: {
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    requireMFA: boolean;
    passwordMinLength: number;
    passwordRequireSpecialChar: boolean;
    inactivityTimeout: number; // minutes
  };
  features: {
    enableNewUserRegistration: boolean;
    enableGuestAccess: boolean;
    enableAdvancedAnalytics: boolean;
    enableFileUpload: boolean;
    enableWebSearch: boolean;
    enableUserModelParams: boolean;
    maxFileSizeMB: number;
    maxFilesPerUpload: number;
  };
  defaults: {
    userLanguage: 'en' | 'fr';
    userTheme: 'light' | 'dark' | 'auto';
    modelTemperature: number;
    modelTopK: number;
    modelMaxTokens: number;
    responseLength: 'succinct' | 'standard' | 'thorough';
    conversationType: 'creative' | 'balanced' | 'precise';
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
    fileUploadsPerDay: number;
  };
  updatedAt: Date;
  updatedBy: string;
}

// Default accessibility preset
export const defaultAccessibilitySettings: DefaultAccessibilitySettings = {
  fontSize: {
    size: 16,
    min: 12,
    max: 24,
    step: 1,
    unit: 'px'
  },
  colorScheme: {
    scheme: 'auto',
    highContrast: false
  },
  contrast: {
    level: 1.0,
    min: 0.8,
    max: 1.5,
    step: 0.1
  },
  motion: {
    reduceMotion: false,
    animationSpeed: 1.0,
    disableAnimations: false
  },
  keyboard: {
    enableShortcuts: true,
    focusIndicatorSize: 2,
    tabNavigation: true
  },
  screenReader: {
    announceChanges: true,
    verboseMode: false,
    skipToContent: true
  }
};

// Default theme presets
export const defaultThemes: DefaultThemeSettings[] = [
  {
    id: 'light-default',
    name: 'light-default',
    displayName: {
      en: 'Light (Default)',
      fr: 'Clair (Défaut)'
    },
    colors: {
      primary: '#0078d4',
      primaryHover: '#106ebe',
      primaryActive: '#005a9e',
      secondary: '#6c757d',
      accent: '#5c2d91',
      background: '#f8f9fa',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
      error: '#dc3545',
      success: '#28a745',
      warning: '#ffc107',
      info: '#17a2b8'
    },
    isDefault: true,
    category: 'default'
  },
  {
    id: 'dark-default',
    name: 'dark-default',
    displayName: {
      en: 'Dark (Default)',
      fr: 'Sombre (Défaut)'
    },
    colors: {
      primary: '#4d9fff',
      primaryHover: '#6db3ff',
      primaryActive: '#3585e6',
      secondary: '#adb5bd',
      accent: '#9b6fc9',
      background: '#1a1d23',
      surface: '#25282e',
      text: '#e4e6eb',
      textSecondary: '#adb5bd',
      border: '#3a3f47',
      error: '#f44336',
      success: '#4caf50',
      warning: '#ff9800',
      info: '#2196f3'
    },
    isDefault: true,
    category: 'default'
  },
  {
    id: 'ocean',
    name: 'ocean',
    displayName: {
      en: 'Ocean',
      fr: 'Océan'
    },
    colors: {
      primary: '#006d77',
      primaryHover: '#00505a',
      primaryActive: '#003d44',
      secondary: '#83c5be',
      accent: '#e29578',
      background: '#edf6f9',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#495057',
      border: '#c8e1e7',
      error: '#d62828',
      success: '#2a9d8f',
      warning: '#e9c46a',
      info: '#457b9d'
    },
    category: 'preset'
  },
  {
    id: 'sunset',
    name: 'sunset',
    displayName: {
      en: 'Sunset',
      fr: 'Coucher de soleil'
    },
    colors: {
      primary: '#f4442e',
      primaryHover: '#d63827',
      primaryActive: '#b32d1f',
      secondary: '#f77f00',
      accent: '#fcbf49',
      background: '#fff5eb',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#ffe5cc',
      error: '#c1121f',
      success: '#40916c',
      warning: '#f77f00',
      info: '#4895ef'
    },
    category: 'preset'
  },
  {
    id: 'forest',
    name: 'forest',
    displayName: {
      en: 'Forest',
      fr: 'Forêt'
    },
    colors: {
      primary: '#2d6a4f',
      primaryHover: '#1b4332',
      primaryActive: '#133127',
      secondary: '#52b788',
      accent: '#95d5b2',
      background: '#f1f8f5',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#495057',
      border: '#d8f3dc',
      error: '#bc4749',
      success: '#40916c',
      warning: '#f4a261',
      info: '#4a90a4'
    },
    category: 'preset'
  },
  {
    id: 'corporate',
    name: 'corporate',
    displayName: {
      en: 'Corporate',
      fr: 'Entreprise'
    },
    colors: {
      primary: '#003366',
      primaryHover: '#002244',
      primaryActive: '#001a33',
      secondary: '#5b7c99',
      accent: '#b8860b',
      background: '#f5f7fa',
      surface: '#ffffff',
      text: '#1a202c',
      textSecondary: '#4a5568',
      border: '#e2e8f0',
      error: '#c53030',
      success: '#38a169',
      warning: '#d69e2e',
      info: '#3182ce'
    },
    category: 'preset'
  },
  {
    id: 'ruby',
    name: 'ruby',
    displayName: {
      en: 'Ruby',
      fr: 'Rubis'
    },
    colors: {
      primary: '#9d174d',
      primaryHover: '#831843',
      primaryActive: '#6b1434',
      secondary: '#db2777',
      accent: '#f472b6',
      background: '#fff5f7',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#fce7f3',
      error: '#c4183c',
      success: '#16a34a',
      warning: '#ea580c',
      info: '#0ea5e9'
    },
    category: 'preset'
  },
  {
    id: 'lavender',
    name: 'lavender',
    displayName: {
      en: 'Lavender',
      fr: 'Lavande'
    },
    colors: {
      primary: '#6b46c1',
      primaryHover: '#553c9a',
      primaryActive: '#44337a',
      secondary: '#9f7aea',
      accent: '#d6bcfa',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#e9d8fd',
      error: '#c53030',
      success: '#38a169',
      warning: '#d69e2e',
      info: '#4299e1'
    },
    category: 'preset'
  }
];

// Global system defaults
export const globalSettings: GlobalDefaultSettings = {
  id: 'global_settings_default',
  platform: {
    name: 'EVA DA 2.0',
    version: '2.1.0',
    supportEmail: 'eva-support@example.gov.ca',
    maintenanceMode: false,
    environment: 'production'
  },
  security: {
    sessionTimeout: 480, // 8 hours
    maxLoginAttempts: 5,
    requireMFA: true,
    passwordMinLength: 12,
    passwordRequireSpecialChar: true,
    inactivityTimeout: 30 // 30 minutes
  },
  features: {
    enableNewUserRegistration: false, // Controlled registration
    enableGuestAccess: false,
    enableAdvancedAnalytics: true,
    enableFileUpload: true,
    enableWebSearch: true,
    enableUserModelParams: true,
    maxFileSizeMB: 50,
    maxFilesPerUpload: 10
  },
  defaults: {
    userLanguage: 'en',
    userTheme: 'auto',
    modelTemperature: 0.7,
    modelTopK: 5,
    modelMaxTokens: 2000,
    responseLength: 'standard',
    conversationType: 'balanced'
  },
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerDay: 5000,
    fileUploadsPerDay: 100
  },
  updatedAt: new Date('2024-11-10T00:00:00Z'),
  updatedBy: 'system'
};

// Export all defaults
export const allDefaultSettings = {
  accessibility: defaultAccessibilitySettings,
  themes: defaultThemes,
  global: globalSettings
};
