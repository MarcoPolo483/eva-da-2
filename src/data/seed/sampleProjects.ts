// src/data/seed/sampleProjects.ts
// Sample project configurations for EVA DA 2.0

export interface SeedProject {
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
  
  businessInfo: {
    contactEmail: string;
    managerName?: string;
    businessCase?: string;
    expectedUsers?: number;
    launchDate?: Date;
  };
  
  technicalConfig: {
    apiEndpoint: string;
    cosmosContainer: string;
    searchIndex: string;
    aiModel: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
  };
  
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
}

export const sampleProjects: SeedProject[] = [
  {
    id: 'canadalife',
    name: 'canadalife',
    displayName: 'Canada Life',
    domain: 'Financial Services',
    owner: 'Finance Department',
    costCentre: 'CC-2024-003',
    department: 'Finance',
    description: 'Canada Life pension and benefits information assistant. Provides employees with instant access to pension plans, benefit details, enrollment processes, and retirement planning resources.',
    status: 'active',
    createdAt: new Date('2024-02-01T08:00:00Z'),
    updatedAt: new Date('2024-11-09T14:30:00Z'),
    businessInfo: {
      contactEmail: 'finance.support@example.gov.ca',
      managerName: 'Linda Thompson',
      businessCase: 'Improve employee access to pension and benefits information, reduce HR inquiries by 60%, and provide 24/7 self-service support for pension-related questions.',
      expectedUsers: 1200,
      launchDate: new Date('2024-04-01T00:00:00Z')
    },
    technicalConfig: {
      apiEndpoint: 'https://canadalife-api.example.gov.ca',
      cosmosContainer: 'canadalife-documents',
      searchIndex: 'canadalife-index',
      aiModel: 'gpt-4o',
      maxTokens: 2500,
      temperature: 0.2,
      systemPrompt: 'You are a knowledgeable assistant specializing in Canada Life pension and benefits. Provide accurate, clear information about pension plans, benefits enrollment, retirement planning, and related HR policies. Always cite specific policy sections when relevant and encourage users to verify important decisions with HR.'
    },
    uiConfig: {
      theme: {
        primary: '#003366',
        accent: '#d32f2f',
        background: '#f5f7fa',
        surface: '#ffffff'
      },
      branding: {
        title: 'Canada Life Assistant',
        subtitle: 'Your Pension & Benefits Guide'
      },
      features: {
        enableChat: true,
        enableFileUpload: true,
        enableWebSearch: false,
        enableUserModelParams: true
      }
    }
  },
  {
    id: 'jurisprudence',
    name: 'jurisprudence',
    displayName: 'Jurisprudence',
    domain: 'Legal Research',
    owner: 'Legal Department',
    costCentre: 'CC-2024-002',
    department: 'Justice',
    description: 'Advanced legal research and case law analysis system. Enables legal professionals to quickly search Canadian jurisprudence, analyze precedents, and find relevant case law with AI-powered insights.',
    status: 'active',
    createdAt: new Date('2024-01-20T09:00:00Z'),
    updatedAt: new Date('2024-11-08T16:45:00Z'),
    businessInfo: {
      contactEmail: 'legal.research@example.gov.ca',
      managerName: 'Robert Chen',
      businessCase: 'Streamline legal research processes, reduce research time by 70%, improve case analysis accuracy, and provide instant access to comprehensive Canadian legal precedents.',
      expectedUsers: 150,
      launchDate: new Date('2024-03-01T00:00:00Z')
    },
    technicalConfig: {
      apiEndpoint: 'https://jurisprudence-api.example.gov.ca',
      cosmosContainer: 'jurisprudence-cases',
      searchIndex: 'jurisprudence-index',
      aiModel: 'gpt-4o',
      maxTokens: 3000,
      temperature: 0.1,
      systemPrompt: 'You are an expert legal research assistant specializing in Canadian law and jurisprudence. Provide precise, well-cited analysis of case law, statutes, and legal precedents. Always include case citations, jurisdictions, and relevant legal principles. Maintain objectivity and clearly distinguish between facts, holdings, and dicta.'
    },
    uiConfig: {
      theme: {
        primary: '#8b0000',
        accent: '#a52a2a',
        background: '#fafafa',
        surface: '#ffffff'
      },
      branding: {
        title: 'Jurisprudence Research',
        subtitle: 'Canadian Legal Case Analysis'
      },
      features: {
        enableChat: true,
        enableFileUpload: true,
        enableWebSearch: false,
        enableUserModelParams: true
      }
    }
  },
  {
    id: 'assistme',
    name: 'assistme',
    displayName: 'AssistMe',
    domain: 'General Purpose',
    owner: 'Marco Presta',
    costCentre: 'CC-2024-001',
    department: 'IT Services',
    description: 'General-purpose AI assistant for government employees. Helps with daily tasks including policy lookups, procedure guidance, form assistance, travel requests, IT support, and general workplace questions.',
    status: 'active',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-11-10T11:20:00Z'),
    businessInfo: {
      contactEmail: 'marco.presta@example.gov.ca',
      managerName: 'Sarah Johnson',
      businessCase: 'Provide all government employees with an intelligent assistant to improve productivity, reduce time spent searching for information, and deliver instant answers to common workplace questions across all departments.',
      expectedUsers: 500,
      launchDate: new Date('2024-02-01T00:00:00Z')
    },
    technicalConfig: {
      apiEndpoint: 'https://assistme-api.example.gov.ca',
      cosmosContainer: 'assistme-documents',
      searchIndex: 'assistme-index',
      aiModel: 'gpt-4o',
      maxTokens: 2000,
      temperature: 0.3,
      systemPrompt: 'You are AssistMe, a helpful AI assistant for government employees. Provide clear, accurate information about policies, procedures, forms, and workplace processes. Be professional, concise, and empathetic. When uncertain, guide users to the appropriate department or resource.'
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
    }
  }
];

// Export project by ID helper
export function getProjectById(projectId: string): SeedProject | undefined {
  return sampleProjects.find(p => p.id === projectId);
}

// Export projects by status
export function getProjectsByStatus(status: 'active' | 'inactive' | 'development'): SeedProject[] {
  return sampleProjects.filter(p => p.status === status);
}
