// src/lib/defaultProjectConfigurations.ts
// Default Project Configurations for EVA DA 2.0
// Based on SCREEN-PARAMETER-CONFIGURATION.md specifications

import type { ProjectConfiguration } from './configurationManager';

// Canada Life Insurance Project Configuration
const canadaLifeConfig: ProjectConfiguration = {
  id: 'canadaLife',
  name: 'canadaLife',
  displayName: 'Canada Life Insurance Assistant',
  
  businessInfo: {
    domain: 'Insurance & Benefits',
    owner: 'Digital Services Team',
    costCentre: 'CC-2024-INS-001',
    department: 'Digital Services',
    contactInfo: {
      email: 'digitalservices@canadalife.com',
      phone: '+1-204-946-1190',
      manager: 'Sarah Johnson'
    },
    businessCase: 'AI-powered customer service assistant for insurance products and benefits',
    expectedUsers: 500,
    launchDate: new Date('2024-12-01')
  },

  technical: {
    apiEndpoints: {
      primary: 'https://eva-foundation-api.azurewebsites.net/api/canadalife',
      backup: 'https://eva-foundation-backup.azurewebsites.net/api/canadalife',
      timeout: 30000,
      retryCount: 3
    },
    dataConfig: {
      containerName: 'canadalife-documents',
      partitionKey: ['domain', 'documentType'],
      throughput: 1000
    },
    searchConfig: {
      service: 'eva-search-canadalife',
      indexName: 'insurance-knowledge',
      apiVersion: '2023-11-01',
      vectorDimensions: 1536,
      semanticConfig: 'insurance-semantic'
    },
    aiConfig: {
      deployment: 'gpt-4-turbo',
      model: 'gpt-4-turbo-preview',
      maxTokens: 4000,
      temperature: 0.3,
      systemPrompt: 'You are Canada Life\'s AI assistant, specializing in insurance products, benefits, and customer service. Provide accurate, helpful information based on Canada Life policies and procedures.',
      templates: [
        'Based on Canada Life\'s policy guidelines: {answer}',
        'According to our insurance expertise: {answer}',
        'Following Canada Life\'s best practices: {answer}'
      ]
    }
  },

  uiConfig: {
    theme: {
      name: 'Canada Life Corporate',
      primary: '#0066CC',
      accent: '#FF6B35',  
      background: '#FFFFFF',
      surface: '#F8F9FA',
      baseFontPx: 16
    },
    branding: {
      title: 'Canada Life Assistant',
      subtitle: 'Your AI-powered insurance and benefits guide',
      footerText: '© 2024 The Canada Life Assurance Company'
    },
    layout: {
      showSidebar: true,
      sidebarWidth: 320,
      headerHeight: 64,
      maxContentWidth: 1200
    },
    features: {
      enableChat: true,
      enableFileUpload: true,
      enableExport: true,
      enableHistory: true,
      showProjectInfo: true
    }
  },

  compliance: {
    dataClassification: 'confidential',
    retentionPolicy: {
      chatHistory: 90,
      userActivity: 365,
      auditLogs: 2555 // 7 years
    },
    auditConfig: {
      enableFullAudit: true,
      logUserActions: true,
      logSystemEvents: true,
      exportFormat: 'json'
    },
    accessControl: {
      requireApproval: true,
      allowGuestAccess: false,
      timeRestrictions: {
        startTime: '06:00',
        endTime: '22:00',
        timezone: 'America/Winnipeg'
      }
    }
  }
};

// Jurisprudence Legal Research Project Configuration  
const jurisprudenceConfig: ProjectConfiguration = {
  id: 'jurisprudence',
  name: 'jurisprudence',
  displayName: 'EVA Jurisprudence - Legal Research Assistant',
  
  businessInfo: {
    domain: 'Legal Research & Analysis',
    owner: 'Legal Technology Team',
    costCentre: 'CC-2024-LEG-001',  
    department: 'Legal Services',
    contactInfo: {
      email: 'legaltech@justice.gc.ca',
      phone: '+1-613-992-4621',
      manager: 'Dr. Marie Dubois'
    },
    businessCase: 'AI-powered legal research platform for case law analysis and regulatory compliance',
    expectedUsers: 150,
    launchDate: new Date('2024-11-15')
  },

  technical: {
    apiEndpoints: {
      primary: 'https://eva-foundation-api.azurewebsites.net/api/jurisprudence',
      backup: 'https://eva-foundation-backup.azurewebsites.net/api/jurisprudence',
      timeout: 45000, // Legal queries may take longer
      retryCount: 2
    },
    dataConfig: {
      containerName: 'jurisprudence-cases',
      partitionKey: ['jurisdiction', 'caseType'],
      throughput: 2000 // Higher throughput for legal databases
    },
    searchConfig: {
      service: 'eva-search-jurisprudence',
      indexName: 'legal-precedents',
      apiVersion: '2023-11-01',
      vectorDimensions: 1536,
      semanticConfig: 'legal-semantic'
    },
    aiConfig: {
      deployment: 'gpt-4-turbo',
      model: 'gpt-4-turbo-preview',
      maxTokens: 8000, // Legal analysis requires more tokens
      temperature: 0.1, // Very conservative for legal accuracy
      systemPrompt: 'You are EVA Jurisprudence, an expert legal research AI assistant. Provide precise legal analysis based on case law, statutes, and regulations. Always cite sources and include jurisdiction information.',
      templates: [
        'Legal analysis indicates: {answer}',
        'Based on precedent cases: {answer}',
        'Legal framework suggests: {answer}',
        'Jurisprudential review shows: {answer}'
      ]
    }
  },

  uiConfig: {
    theme: {
      name: 'Legal Professional',
      primary: '#1B365D',
      accent: '#C8A882',
      background: '#FEFEFE',
      surface: '#F5F5F7',
      baseFontPx: 15 // Slightly smaller for dense legal text
    },
    branding: {
      title: 'EVA Jurisprudence',
      subtitle: 'AI-powered legal research and case law analysis',
      footerText: '© 2024 Government of Canada - Legal Technology Initiative'
    },
    layout: {
      showSidebar: true,
      sidebarWidth: 380, // Wider for legal references
      headerHeight: 68,
      maxContentWidth: 1400 // Wider for legal documents
    },
    features: {
      enableChat: true,
      enableFileUpload: true,
      enableExport: true,
      enableHistory: true,
      showProjectInfo: true
    }
  },

  compliance: {
    dataClassification: 'restricted',
    retentionPolicy: {
      chatHistory: 2555, // 7 years for legal records
      userActivity: 2555,
      auditLogs: 3650 // 10 years for legal compliance
    },
    auditConfig: {
      enableFullAudit: true,
      logUserActions: true,
      logSystemEvents: true,
      exportFormat: 'json'
    },
    accessControl: {
      requireApproval: true,
      allowGuestAccess: false,
      ipWhitelist: [], // Restricted IP access for legal system
      timeRestrictions: {
        startTime: '07:00',
        endTime: '19:00', 
        timezone: 'America/Ottawa'
      }
    }
  },

  jurisprudenceConfig: {
    enableCaseLawSearch: true,
    enableRegulatoryCompliance: true,
    enableBilingualProcessing: true,
    supportedJurisdictions: ['Federal', 'ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU'],
    legalDatabases: {
      primary: 'CanLII',
      secondary: ['Westlaw', 'Lexis', 'Quicklaw']
    },
    complianceFrameworks: ['PIPEDA', 'AODA', 'Charter', 'Criminal Code', 'Civil Code (QC)']
  }
};

// Administrative Project Configuration
const adminConfig: ProjectConfiguration = {
  id: 'admin',
  name: 'admin', 
  displayName: 'EVA DA 2.0 Administration',
  
  businessInfo: {
    domain: 'Platform Administration',
    owner: 'Platform Operations Team',
    costCentre: 'CC-2024-ADM-001',
    department: 'IT Operations',
    contactInfo: {
      email: 'eva-admin@platform.gc.ca',
      phone: '+1-613-555-0100',
      manager: 'Michael Chen'
    },
    businessCase: 'Administrative interface for EVA DA 2.0 platform management and configuration',
    expectedUsers: 25,
    launchDate: new Date('2024-10-01')
  },

  technical: {
    apiEndpoints: {
      primary: 'https://eva-foundation-api.azurewebsites.net/api/admin',
      timeout: 15000, // Faster for admin operations
      retryCount: 5
    },
    dataConfig: {
      containerName: 'platform-administration',
      partitionKey: ['operation', 'timestamp'],
      throughput: 500
    },
    searchConfig: {
      service: 'eva-search-admin',
      indexName: 'admin-operations',
      apiVersion: '2023-11-01'
    },
    aiConfig: {
      deployment: 'gpt-4-turbo',
      model: 'gpt-4-turbo-preview',
      maxTokens: 2000,
      temperature: 0.2,
      systemPrompt: 'You are the EVA DA 2.0 administrative assistant. Help with platform configuration, user management, and system operations.',
      templates: [
        'System administration response: {answer}',
        'Platform configuration status: {answer}',
        'Administrative analysis: {answer}'
      ]
    }
  },

  uiConfig: {
    theme: {
      name: 'Administrative',
      primary: '#6B46C1',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      baseFontPx: 14
    },
    branding: {
      title: 'EVA DA 2.0 Admin',
      subtitle: 'Platform administration and configuration',
      footerText: '© 2024 EVA DA 2.0 Platform'
    },
    layout: {
      showSidebar: true,
      sidebarWidth: 280,
      headerHeight: 60,
      maxContentWidth: 1600 // Wide for admin dashboards
    },
    features: {
      enableChat: false, // Admin focused, not chat
      enableFileUpload: false,
      enableExport: true,
      enableHistory: false,
      showProjectInfo: false
    }
  },

  compliance: {
    dataClassification: 'internal',
    retentionPolicy: {
      chatHistory: 30,
      userActivity: 730,
      auditLogs: 2555
    },
    auditConfig: {
      enableFullAudit: true,
      logUserActions: true,
      logSystemEvents: true,
      exportFormat: 'excel'
    },
    accessControl: {
      requireApproval: true,
      allowGuestAccess: false
    }
  }
};

// AssistMe (OAS Benefits) Project Configuration
const assistMeConfig: ProjectConfiguration = {
  id: 'AssistMe',
  name: 'AssistMe',
  displayName: 'AssistMe - OAS Benefits Assistant',
  
  businessInfo: {
    domain: 'Government Benefits & Services',
    owner: 'Service Canada Digital',
    costCentre: 'CC-2024-OAS-001',
    department: 'Employment and Social Development Canada',
    contactInfo: {
      email: 'assistme@servicecanada.gc.ca',
      phone: '1-800-277-9914',
      manager: 'Jennifer Martinez'
    },
    businessCase: 'AI assistant for Old Age Security benefits information and application guidance',
    expectedUsers: 2000,
    launchDate: new Date('2024-12-15')
  },

  technical: {
    apiEndpoints: {
      primary: 'https://eva-foundation-api.azurewebsites.net/api/assistme',
      timeout: 25000,
      retryCount: 3
    },
    dataConfig: {
      containerName: 'oas-benefits-info',
      partitionKey: ['benefitType', 'province'],
      throughput: 3000 // High throughput for public service
    },
    searchConfig: {
      service: 'eva-search-assistme',
      indexName: 'oas-knowledge',
      apiVersion: '2023-11-01',
      vectorDimensions: 1536,
      semanticConfig: 'benefits-semantic'
    },
    aiConfig: {
      deployment: 'gpt-4-turbo',
      model: 'gpt-4-turbo-preview',
      maxTokens: 3000,
      temperature: 0.2,
      systemPrompt: 'You are AssistMe, Service Canada\'s AI assistant for Old Age Security benefits. Provide accurate, helpful information about OAS, GIS, and Allowance programs. Always direct users to official sources for applications.',
      templates: [
        'Based on Old Age Security policy: {answer}',
        'According to Service Canada guidelines: {answer}',
        'OAS benefits analysis indicates: {answer}',
        'Service Canada information shows: {answer}'
      ]
    }
  },

  uiConfig: {
    theme: {
      name: 'Service Canada',
      primary: '#FF0000', // Canada red
      accent: '#1F69FF', // Canada blue
      background: '#FFFFFF',
      surface: '#F8F8F8',
      baseFontPx: 16
    },
    branding: {
      title: 'AssistMe',
      subtitle: 'Your guide to Old Age Security benefits',
      footerText: '© 2024 Government of Canada'
    },
    layout: {
      showSidebar: true,
      sidebarWidth: 300,
      headerHeight: 64,
      maxContentWidth: 1000 // Public-friendly width
    },
    features: {
      enableChat: true,
      enableFileUpload: false, // Security consideration for public service
      enableExport: true,
      enableHistory: true,
      showProjectInfo: false // Simplified for public
    }
  },

  compliance: {
    dataClassification: 'public',
    retentionPolicy: {
      chatHistory: 30, // Limited for privacy
      userActivity: 90,
      auditLogs: 730
    },
    auditConfig: {
      enableFullAudit: false, // Simplified for public service
      logUserActions: false,
      logSystemEvents: true,
      exportFormat: 'csv'
    },
    accessControl: {
      requireApproval: false,
      allowGuestAccess: true // Public service
    }
  }
};

// Global Admin Project Configuration
const globalAdminConfig: ProjectConfiguration = {
  id: 'globalAdmin',
  name: 'globalAdmin',
  displayName: 'EVA DA 2.0 Global Administration',
  
  businessInfo: {
    domain: 'Global Platform Management',
    owner: 'EVA Platform Team',
    costCentre: 'CC-2024-GLB-001',
    department: 'Digital Platform Services',
    contactInfo: {
      email: 'eva-global-admin@platform.gc.ca',
      phone: '+1-613-555-0001',
      manager: 'Dr. Amanda Foster'
    },
    businessCase: 'Global administration interface for multi-tenant EVA DA 2.0 platform management',
    expectedUsers: 10,
    launchDate: new Date('2024-09-15')
  },

  technical: {
    apiEndpoints: {
      primary: 'https://eva-foundation-api.azurewebsites.net/api/global-admin',
      timeout: 60000, // Longer for global operations
      retryCount: 2
    },
    dataConfig: {
      containerName: 'global-administration',
      partitionKey: ['tenantId', 'operation'],
      throughput: 1000
    },
    searchConfig: {
      service: 'eva-search-global',
      indexName: 'global-operations',
      apiVersion: '2023-11-01'
    },
    aiConfig: {
      deployment: 'gpt-4-turbo',
      model: 'gpt-4-turbo-preview',
      maxTokens: 4000,
      temperature: 0.1,
      systemPrompt: 'You are the EVA DA 2.0 global administrator AI. Assist with multi-tenant platform management, global configuration, and enterprise operations.',
      templates: [
        'Global configuration updated: {answer}',
        'System settings applied: {answer}',
        'Platform management: {answer}',
        'Multi-tenant operation: {answer}'
      ]
    }
  },

  uiConfig: {
    theme: {
      name: 'Global Admin',
      primary: '#1E293B',
      accent: '#0EA5E9',
      background: '#FFFFFF',
      surface: '#F1F5F9',
      baseFontPx: 13
    },
    branding: {
      title: 'EVA DA 2.0 Global Admin',
      subtitle: 'Multi-tenant platform management',
      footerText: '© 2024 EVA DA 2.0 Global Platform'
    },
    layout: {
      showSidebar: true,
      sidebarWidth: 350,
      headerHeight: 56,
      maxContentWidth: 1800 // Very wide for global dashboards
    },
    features: {
      enableChat: false,
      enableFileUpload: false,
      enableExport: true,
      enableHistory: false,
      showProjectInfo: false
    }
  },

  compliance: {
    dataClassification: 'restricted',
    retentionPolicy: {
      chatHistory: 0,
      userActivity: 1095, // 3 years
      auditLogs: 3650 // 10 years for compliance
    },
    auditConfig: {
      enableFullAudit: true,
      logUserActions: true,
      logSystemEvents: true,
      exportFormat: 'json'
    },
    accessControl: {
      requireApproval: true,
      allowGuestAccess: false,
      ipWhitelist: [] // Highly restricted
    }
  }
};

// Export all default configurations
export const defaultProjectConfigurations: ProjectConfiguration[] = [
  canadaLifeConfig,
  jurisprudenceConfig,
  adminConfig,
  assistMeConfig,
  globalAdminConfig
];

// Export individual configurations
export { 
  canadaLifeConfig,
  jurisprudenceConfig, 
  adminConfig,
  assistMeConfig,
  globalAdminConfig
};
