// src/lib/databaseService.ts
// Database service layer for EVA DA 2.0 - Mock implementation with real API patterns

export interface DatabaseProject {
  id: string;
  name: string;
  displayName: string;
  domain: string;
  owner: string;
  costCentre: string;
  department: string;
  description: string;
  status: 'active' | 'inactive' | 'development';
  createdAt: Date;
  updatedAt: Date;
  
  // Business configuration
  businessInfo: {
    contactEmail: string;
    managerName?: string;
    businessCase?: string;
    expectedUsers?: number;
    launchDate?: Date;
  };
  
  // Technical settings
  technicalConfig: {
    apiEndpoint: string;
    cosmosContainer: string;
    searchIndex: string;
    aiModel: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
  };
  
  // UI customization
  uiConfig: {
    theme: {
      primary: string;
      accent: string;
      background: string;
      surface: string;
    };
    branding: {
      logo?: string;
      title: string;
      subtitle?: string;
    };
    features: {
      enableChat: boolean;
      enableFileUpload: boolean;
      enableWebSearch: boolean;
      enableUserModelParams: boolean;
    };
  };
  
  // Suggested questions
  suggestedQuestions: Array<{
    id: string;
    questionEn: string;
    questionFr: string;
    category: string;
    priority: number;
  }>;
}

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  department: string;
  roles: string[];
  projectAccess: Array<{
    projectId: string;
    role: 'reader' | 'contributor' | 'admin';
    grantedAt: Date;
    grantedBy: string;
  }>;
  preferences: {
    language: 'en' | 'fr';
    theme: 'light' | 'dark' | 'auto';
    defaultWorkMode: 'work' | 'web';
  };
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UploadedFile {
  id: string;
  projectId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  folder: string;
  tags: string[];
  status: 'uploading' | 'processing' | 'complete' | 'failed' | 'deleted';
  uploadedAt: Date;
  processedAt?: Date;
  errorMessage?: string;
  metadata: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
    extractedText?: string;
  };
}

export interface UserModelParameters {
  userId: string;
  projectId: string;
  temperature: number;
  topK: number;
  maxTokens: number;
  systemPrompt?: string;
  sourceFilter: string;
  responseLength: 'succinct' | 'standard' | 'thorough';
  conversationType: 'creative' | 'balanced' | 'precise';
  updatedAt: Date;
}

export interface GlobalSettings {
  id: string;
  platform: {
    name: string;
    version: string;
    supportEmail: string;
    maintenanceMode: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireMFA: boolean;
  };
  features: {
    enableNewUserRegistration: boolean;
    enableGuestAccess: boolean;
    enableAdvancedAnalytics: boolean;
  };
  defaults: {
    userLanguage: 'en' | 'fr';
    userTheme: 'light' | 'dark' | 'auto';
    modelTemperature: number;
    modelTopK: number;
    modelMaxTokens: number;
  };
  updatedAt: Date;
  updatedBy: string;
}

class DatabaseService {
  private apiBaseUrl = '/api/v1';
  
  // Mock data for development
  private mockProjects: DatabaseProject[] = [
    {
      id: 'assistme',
      name: 'assistme',
      displayName: 'AssistMe',
      domain: 'General Purpose',
      owner: 'Marco Presta',
      costCentre: 'CC-2024-001',
      department: 'IT Services',
      description: 'General purpose AI assistant for government employees',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-10'),
      businessInfo: {
        contactEmail: 'marco.presta@example.gov.ca',
        managerName: 'Sarah Johnson',
        businessCase: 'Improve productivity and information access for all government departments',
        expectedUsers: 500,
        launchDate: new Date('2024-02-01')
      },
      technicalConfig: {
        apiEndpoint: 'https://assistme-api.example.gov.ca',
        cosmosContainer: 'assistme-documents',
        searchIndex: 'assistme-index',
        aiModel: 'gpt-4o',
        maxTokens: 2000,
        temperature: 0.3,
        systemPrompt: 'You are AssistMe, a helpful AI assistant for government employees.'
      },
      uiConfig: {
        theme: {
          primary: '#0078d4',
          accent: '#106ebe',
          background: '#f8f9fa',
          surface: '#ffffff'
        },
        branding: {
          title: 'AssistMe',
          subtitle: 'Your Government AI Assistant'
        },
        features: {
          enableChat: true,
          enableFileUpload: true,
          enableWebSearch: true,
          enableUserModelParams: true
        }
      },
      suggestedQuestions: [
        {
          id: 'q1',
          questionEn: 'How do I submit a travel request?',
          questionFr: 'Comment soumettre une demande de voyage?',
          category: 'HR',
          priority: 1
        },
        {
          id: 'q2',
          questionEn: 'What are the IT security policies?',
          questionFr: 'Quelles sont les politiques de sécurité informatique?',
          category: 'IT',
          priority: 2
        }
      ]
    },
    {
      id: 'jurisprudence',
      name: 'jurisprudence',
      displayName: 'Jurisprudence',
      domain: 'Legal Research',
      owner: 'Legal Department',
      costCentre: 'CC-2024-002',
      department: 'Justice',
      description: 'Legal research and case law analysis system',
      status: 'active',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-11-08'),
      businessInfo: {
        contactEmail: 'legal@example.gov.ca',
        managerName: 'Robert Chen',
        businessCase: 'Streamline legal research and improve case analysis efficiency',
        expectedUsers: 150,
        launchDate: new Date('2024-03-01')
      },
      technicalConfig: {
        apiEndpoint: 'https://jurisprudence-api.example.gov.ca',
        cosmosContainer: 'jurisprudence-cases',
        searchIndex: 'jurisprudence-index',
        aiModel: 'gpt-4o',
        maxTokens: 3000,
        temperature: 0.1,
        systemPrompt: 'You are a legal research assistant specializing in Canadian law and jurisprudence.'
      },
      uiConfig: {
        theme: {
          primary: '#8b0000',
          accent: '#a52a2a',
          background: '#fafafa',
          surface: '#ffffff'
        },
        branding: {
          title: 'Jurisprudence',
          subtitle: 'Legal Research Assistant'
        },
        features: {
          enableChat: true,
          enableFileUpload: true,
          enableWebSearch: false,
          enableUserModelParams: true
        }
      },
      suggestedQuestions: [
        {
          id: 'q1',
          questionEn: 'Find recent Supreme Court decisions on privacy rights',
          questionFr: 'Trouvez les décisions récentes de la Cour suprême sur les droits à la vie privée',
          category: 'Constitutional Law',
          priority: 1
        }
      ]
    },
    {
      id: 'canadalife',
      name: 'canadalife',
      displayName: 'Canada Life',
      domain: 'Financial Services',
      owner: 'Finance Department',
      costCentre: 'CC-2024-003',
      department: 'Finance',
      description: 'Canada Life pension and benefits information system',
      status: 'active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-11-09'),
      businessInfo: {
        contactEmail: 'finance@example.gov.ca',
        managerName: 'Linda Thompson',
        businessCase: 'Provide easy access to pension and benefits information',
        expectedUsers: 1200,
        launchDate: new Date('2024-04-01')
      },
      technicalConfig: {
        apiEndpoint: 'https://canadalife-api.example.gov.ca',
        cosmosContainer: 'canadalife-documents',
        searchIndex: 'canadalife-index',
        aiModel: 'gpt-4o',
        maxTokens: 2500,
        temperature: 0.2,
        systemPrompt: 'You are a helpful assistant for Canada Life pension and benefits inquiries.'
      },
      uiConfig: {
        theme: {
          primary: '#d32f2f',
          accent: '#f44336',
          background: '#f5f5f5',
          surface: '#ffffff'
        },
        branding: {
          title: 'Canada Life',
          subtitle: 'Pension & Benefits Assistant'
        },
        features: {
          enableChat: true,
          enableFileUpload: true,
          enableWebSearch: false,
          enableUserModelParams: false
        }
      },
      suggestedQuestions: [
        {
          id: 'q1',
          questionEn: 'How do I calculate my pension benefits?',
          questionFr: 'Comment calculer mes prestations de retraite?',
          category: 'Pension',
          priority: 1
        }
      ]
    }
  ];

  private mockUsers: DatabaseUser[] = [
    {
      id: 'user1',
      email: 'john.doe@example.gov.ca',
      name: 'John Doe',
      department: 'IT Services',
      roles: ['project_reader'],
      projectAccess: [
        { projectId: 'assistme', role: 'reader', grantedAt: new Date('2024-01-15'), grantedBy: 'admin' },
        { projectId: 'jurisprudence', role: 'reader', grantedAt: new Date('2024-01-20'), grantedBy: 'admin' }
      ],
      preferences: {
        language: 'en',
        theme: 'light',
        defaultWorkMode: 'work'
      },
      createdAt: new Date('2024-01-10'),
      lastLoginAt: new Date('2024-11-10')
    },
    {
      id: 'user2',
      email: 'marie.dubois@example.gov.ca',
      name: 'Marie Dubois',
      department: 'Legal',
      roles: ['project_contributor'],
      projectAccess: [
        { projectId: 'jurisprudence', role: 'contributor', grantedAt: new Date('2024-01-25'), grantedBy: 'admin' },
        { projectId: 'assistme', role: 'reader', grantedAt: new Date('2024-02-01'), grantedBy: 'admin' }
      ],
      preferences: {
        language: 'fr',
        theme: 'light',
        defaultWorkMode: 'work'
      },
      createdAt: new Date('2024-01-20'),
      lastLoginAt: new Date('2024-11-09')
    }
  ];

  private mockFiles: UploadedFile[] = [
    {
      id: 'file1',
      projectId: 'jurisprudence',
      userId: 'user2',
      fileName: 'supreme-court-decision-2024.pdf',
      fileSize: 2048576,
      fileType: 'application/pdf',
      folder: 'legal-cases',
      tags: ['supreme-court', 'privacy', '2024'],
      status: 'complete',
      uploadedAt: new Date('2024-11-08'),
      processedAt: new Date('2024-11-08'),
      metadata: {
        pageCount: 45,
        wordCount: 12500,
        language: 'en'
      }
    }
  ];

  // Projects API
  async getProjects(userRoles: string[]): Promise<DatabaseProject[]> {
    // Simulate API delay
    await this.delay(300);
    
    // Filter projects based on user roles
    return this.mockProjects.filter(project => {
      if (userRoles.includes('aicoe_admin')) return true;
      if (userRoles.includes('aicoe_project_owner')) return true;
      if (userRoles.includes('project_admin')) return project.status === 'active';
      if (userRoles.includes('project_contributor')) return project.status === 'active';
      if (userRoles.includes('project_reader')) return project.status === 'active';
      return false;
    });
  }
  async getProject(projectId: string): Promise<DatabaseProject | null> {
    await this.delay(200);
    return this.mockProjects.find(p => p.id === projectId) || null;
  }

  async getQuickQuestions(projectId: string): Promise<any[]> {
    await this.delay(150);
    const project = this.mockProjects.find(p => p.id === projectId);
    if (!project) return [];
    
    // Convert suggestedQuestions to quick questions format
    return project.suggestedQuestions?.map(q => ({
      id: q.id,
      title: q.questionEn,
      description: `${q.category} - Click to ask this question`,
      category: q.category,
      usage: Math.floor(Math.random() * 50) + 1, // Mock usage count
      question: q.questionEn
    })) || [];
  }

  async updateProject(projectId: string, updates: Partial<DatabaseProject>): Promise<DatabaseProject> {
    await this.delay(400);
    const projectIndex = this.mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    
    this.mockProjects[projectIndex] = {
      ...this.mockProjects[projectIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    return this.mockProjects[projectIndex];
  }

  // Files API
  async getProjectFiles(projectId: string, folder?: string): Promise<UploadedFile[]> {
    await this.delay(300);
    return this.mockFiles.filter(f => 
      f.projectId === projectId && 
      (folder ? f.folder === folder : true)
    );
  }

  async uploadFile(file: File, projectId: string, userId: string, folder: string, tags: string[]): Promise<UploadedFile> {
    await this.delay(1000);
    
    const uploadedFile: UploadedFile = {
      id: `file_${Date.now()}`,
      projectId,
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder,
      tags,
      status: 'processing',
      uploadedAt: new Date(),
      metadata: {}
    };
    
    this.mockFiles.push(uploadedFile);
    
    // Simulate processing
    setTimeout(() => {
      uploadedFile.status = 'complete';
      uploadedFile.processedAt = new Date();
      uploadedFile.metadata = {
        pageCount: Math.floor(Math.random() * 50) + 1,
        wordCount: Math.floor(Math.random() * 10000) + 1000,
        language: 'en'
      };
    }, 2000);
    
    return uploadedFile;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.delay(200);
    const fileIndex = this.mockFiles.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
      this.mockFiles[fileIndex].status = 'deleted';
    }
  }

  // User Model Parameters API
  async getUserModelParams(userId: string, projectId: string): Promise<UserModelParameters> {
    await this.delay(200);
    
    // Mock default parameters
    return {
      userId,
      projectId,
      temperature: 0.7,
      topK: 5,
      maxTokens: 2000,
      sourceFilter: '',
      responseLength: 'standard',
      conversationType: 'balanced',
      updatedAt: new Date()
    };
  }

  async updateUserModelParams(params: Partial<UserModelParameters>): Promise<UserModelParameters> {
    await this.delay(300);
    
    // Mock update - in real app, this would save to database
    return {
      ...params,
      updatedAt: new Date()
    } as UserModelParameters;
  }

  // User Personalization API (for accessibility and theme preferences)
  async getUserPersonalization(userId: string): Promise<any> {
    await this.delay(200);
    
    // Mock user personalization data
    // In real implementation, this would fetch from Cosmos DB
    return {
      userId,
      displayName: 'John Doe',
      preferences: null, // Will use defaults from accessibilityService
      quickActions: ['chat', 'recent-files', 'quick-questions'],
      favoriteProjects: ['canadaLife', 'jurisprudence'],
      recentActivity: [],
      customShortcuts: {}
    };
  }

  async updateUserPersonalization(userId: string, updates: any): Promise<void> {
    await this.delay(300);
    
    // Mock update - in real app, this would save to Cosmos DB
    console.log(`[DatabaseService] Updated personalization for user ${userId}:`, updates);
  }

  // Global Settings API
  async getGlobalSettings(): Promise<GlobalSettings> {
    await this.delay(200);
    
    return {
      id: 'global_settings_1',
      platform: {
        name: 'EVA DA 2.0',
        version: '2.1.0',
        supportEmail: 'support@example.gov.ca',
        maintenanceMode: false
      },
      security: {
        sessionTimeout: 480, // 8 hours
        maxLoginAttempts: 5,
        requireMFA: true
      },
      features: {
        enableNewUserRegistration: false,
        enableGuestAccess: false,
        enableAdvancedAnalytics: true
      },
      defaults: {
        userLanguage: 'en',
        userTheme: 'light',
        modelTemperature: 0.7,
        modelTopK: 5,
        modelMaxTokens: 2000
      },
      updatedAt: new Date('2024-11-10'),
      updatedBy: 'admin'
    };
  }

  async updateGlobalSettings(updates: Partial<GlobalSettings>): Promise<GlobalSettings> {
    await this.delay(400);
    
    // Mock update
    const currentSettings = await this.getGlobalSettings();
    return {
      ...currentSettings,
      ...updates,
      updatedAt: new Date(),
      updatedBy: 'current_user'
    };
  }

  // Utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const databaseService = new DatabaseService();
