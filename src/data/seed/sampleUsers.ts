// src/data/seed/sampleUsers.ts
// Sample users with roles and permissions for EVA DA 2.0

export interface SeedUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
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
    notifications: {
      email: boolean;
      inApp: boolean;
    };
  };
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  displayName: {
    en: string;
    fr: string;
  };
  description: {
    en: string;
    fr: string;
  };
  permissions: string[];
  level: 'platform' | 'project' | 'user';
}

// Role definitions
export const roles: Role[] = [
  {
    id: 'platform_admin',
    name: 'platform_admin',
    displayName: {
      en: 'Platform Administrator',
      fr: 'Administrateur de plateforme'
    },
    description: {
      en: 'Full platform administration access. Can manage all projects, users, settings, and system configuration.',
      fr: 'Accès complet à l\'administration de la plateforme. Peut gérer tous les projets, utilisateurs, paramètres et configuration système.'
    },
    permissions: [
      'platform.manage',
      'projects.create',
      'projects.delete',
      'projects.manage_all',
      'users.manage_all',
      'roles.manage',
      'settings.manage',
      'analytics.view_all'
    ],
    level: 'platform'
  },
  {
    id: 'aicoe_owner',
    name: 'aicoe_owner',
    displayName: {
      en: 'AI CoE Owner',
      fr: 'Propriétaire du CoE IA'
    },
    description: {
      en: 'AI Center of Excellence owner. Oversees AI strategy, governance, and project approvals.',
      fr: 'Propriétaire du Centre d\'excellence en IA. Supervise la stratégie, la gouvernance et les approbations de projets IA.'
    },
    permissions: [
      'projects.create',
      'projects.approve',
      'projects.view_all',
      'analytics.view_all',
      'users.view_all',
      'governance.manage'
    ],
    level: 'platform'
  },
  {
    id: 'aicoe_admin',
    name: 'aicoe_admin',
    displayName: {
      en: 'AI CoE Administrator',
      fr: 'Administrateur du CoE IA'
    },
    description: {
      en: 'AI CoE administrative support. Can manage projects and users within approved initiatives.',
      fr: 'Support administratif du CoE IA. Peut gérer les projets et les utilisateurs dans les initiatives approuvées.'
    },
    permissions: [
      'projects.view_all',
      'projects.manage_approved',
      'users.manage_project',
      'analytics.view_all'
    ],
    level: 'platform'
  },
  {
    id: 'project_admin',
    name: 'project_admin',
    displayName: {
      en: 'Project Administrator',
      fr: 'Administrateur de projet'
    },
    description: {
      en: 'Full administrative control over assigned projects. Can manage project settings, users, and content.',
      fr: 'Contrôle administratif complet sur les projets assignés. Peut gérer les paramètres, utilisateurs et contenu du projet.'
    },
    permissions: [
      'project.manage',
      'project.users.manage',
      'project.content.manage',
      'project.settings.edit',
      'project.analytics.view'
    ],
    level: 'project'
  },
  {
    id: 'project_contributor',
    name: 'project_contributor',
    displayName: {
      en: 'Project Contributor',
      fr: 'Contributeur de projet'
    },
    description: {
      en: 'Can upload and manage content within assigned projects.',
      fr: 'Peut télécharger et gérer du contenu dans les projets assignés.'
    },
    permissions: [
      'project.view',
      'project.content.create',
      'project.content.edit_own',
      'project.chat.use'
    ],
    level: 'project'
  },
  {
    id: 'project_reader',
    name: 'project_reader',
    displayName: {
      en: 'Project Reader',
      fr: 'Lecteur de projet'
    },
    description: {
      en: 'Read-only access to assigned projects. Can use chat and view content.',
      fr: 'Accès en lecture seule aux projets assignés. Peut utiliser le chat et consulter le contenu.'
    },
    permissions: [
      'project.view',
      'project.chat.use',
      'project.content.view'
    ],
    level: 'project'
  }
];

// Sample users
export const sampleUsers: SeedUser[] = [
  {
    id: 'user_admin_001',
    email: 'admin@example.gov.ca',
    name: 'System Administrator',
    firstName: 'System',
    lastName: 'Administrator',
    department: 'IT Services',
    jobTitle: 'Platform Administrator',
    roles: ['platform_admin'],
    projectAccess: [
      {
        projectId: 'canadalife',
        role: 'admin',
        grantedAt: new Date('2024-02-01T00:00:00Z'),
        grantedBy: 'system'
      },
      {
        projectId: 'jurisprudence',
        role: 'admin',
        grantedAt: new Date('2024-02-01T00:00:00Z'),
        grantedBy: 'system'
      },
      {
        projectId: 'assistme',
        role: 'admin',
        grantedAt: new Date('2024-02-01T00:00:00Z'),
        grantedBy: 'system'
      }
    ],
    preferences: {
      language: 'en',
      theme: 'dark',
      defaultWorkMode: 'work',
      notifications: {
        email: true,
        inApp: true
      }
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastLoginAt: new Date('2024-11-10T08:00:00Z'),
    isActive: true
  },
  {
    id: 'user_marco_001',
    email: 'marco.presta@example.gov.ca',
    name: 'Marco Presta',
    firstName: 'Marco',
    lastName: 'Presta',
    department: 'IT Services',
    jobTitle: 'Senior Developer',
    roles: ['aicoe_owner', 'project_admin'],
    projectAccess: [
      {
        projectId: 'assistme',
        role: 'admin',
        grantedAt: new Date('2024-01-15T00:00:00Z'),
        grantedBy: 'user_admin_001'
      },
      {
        projectId: 'canadalife',
        role: 'contributor',
        grantedAt: new Date('2024-02-01T00:00:00Z'),
        grantedBy: 'user_admin_001'
      }
    ],
    preferences: {
      language: 'en',
      theme: 'auto',
      defaultWorkMode: 'work',
      notifications: {
        email: true,
        inApp: true
      }
    },
    createdAt: new Date('2024-01-10T00:00:00Z'),
    lastLoginAt: new Date('2024-11-10T09:30:00Z'),
    isActive: true
  },
  {
    id: 'user_sarah_001',
    email: 'sarah.johnson@example.gov.ca',
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    department: 'IT Services',
    jobTitle: 'IT Manager',
    roles: ['aicoe_admin'],
    projectAccess: [
      {
        projectId: 'assistme',
        role: 'admin',
        grantedAt: new Date('2024-01-15T00:00:00Z'),
        grantedBy: 'user_admin_001'
      }
    ],
    preferences: {
      language: 'en',
      theme: 'light',
      defaultWorkMode: 'work',
      notifications: {
        email: true,
        inApp: true
      }
    },
    createdAt: new Date('2024-01-12T00:00:00Z'),
    lastLoginAt: new Date('2024-11-09T14:20:00Z'),
    isActive: true
  },
  {
    id: 'user_linda_001',
    email: 'linda.thompson@example.gov.ca',
    name: 'Linda Thompson',
    firstName: 'Linda',
    lastName: 'Thompson',
    department: 'Finance',
    jobTitle: 'Finance Manager',
    roles: ['project_admin'],
    projectAccess: [
      {
        projectId: 'canadalife',
        role: 'admin',
        grantedAt: new Date('2024-02-01T00:00:00Z'),
        grantedBy: 'user_admin_001'
      }
    ],
    preferences: {
      language: 'en',
      theme: 'light',
      defaultWorkMode: 'work',
      notifications: {
        email: true,
        inApp: false
      }
    },
    createdAt: new Date('2024-01-20T00:00:00Z'),
    lastLoginAt: new Date('2024-11-10T10:15:00Z'),
    isActive: true
  },
  {
    id: 'user_robert_001',
    email: 'robert.chen@example.gov.ca',
    name: 'Robert Chen',
    firstName: 'Robert',
    lastName: 'Chen',
    department: 'Justice',
    jobTitle: 'Legal Counsel',
    roles: ['project_admin'],
    projectAccess: [
      {
        projectId: 'jurisprudence',
        role: 'admin',
        grantedAt: new Date('2024-01-20T00:00:00Z'),
        grantedBy: 'user_admin_001'
      }
    ],
    preferences: {
      language: 'en',
      theme: 'light',
      defaultWorkMode: 'work',
      notifications: {
        email: true,
        inApp: true
      }
    },
    createdAt: new Date('2024-01-18T00:00:00Z'),
    lastLoginAt: new Date('2024-11-08T16:45:00Z'),
    isActive: true
  },
  {
    id: 'user_marie_001',
    email: 'marie.leblanc@example.gov.ca',
    name: 'Marie Leblanc',
    firstName: 'Marie',
    lastName: 'Leblanc',
    department: 'Finance',
    jobTitle: 'HR Specialist',
    roles: ['project_contributor'],
    projectAccess: [
      {
        projectId: 'canadalife',
        role: 'contributor',
        grantedAt: new Date('2024-03-01T00:00:00Z'),
        grantedBy: 'user_linda_001'
      },
      {
        projectId: 'assistme',
        role: 'reader',
        grantedAt: new Date('2024-03-15T00:00:00Z'),
        grantedBy: 'user_sarah_001'
      }
    ],
    preferences: {
      language: 'fr',
      theme: 'auto',
      defaultWorkMode: 'work',
      notifications: {
        email: true,
        inApp: true
      }
    },
    createdAt: new Date('2024-02-15T00:00:00Z'),
    lastLoginAt: new Date('2024-11-10T11:00:00Z'),
    isActive: true
  },
  {
    id: 'user_james_001',
    email: 'james.wilson@example.gov.ca',
    name: 'James Wilson',
    firstName: 'James',
    lastName: 'Wilson',
    department: 'Justice',
    jobTitle: 'Legal Researcher',
    roles: ['project_contributor'],
    projectAccess: [
      {
        projectId: 'jurisprudence',
        role: 'contributor',
        grantedAt: new Date('2024-03-10T00:00:00Z'),
        grantedBy: 'user_robert_001'
      }
    ],
    preferences: {
      language: 'en',
      theme: 'dark',
      defaultWorkMode: 'work',
      notifications: {
        email: false,
        inApp: true
      }
    },
    createdAt: new Date('2024-03-05T00:00:00Z'),
    lastLoginAt: new Date('2024-11-09T15:30:00Z'),
    isActive: true
  },
  {
    id: 'user_sophie_001',
    email: 'sophie.martin@example.gov.ca',
    name: 'Sophie Martin',
    firstName: 'Sophie',
    lastName: 'Martin',
    department: 'Human Resources',
    jobTitle: 'HR Coordinator',
    roles: ['project_reader'],
    projectAccess: [
      {
        projectId: 'assistme',
        role: 'reader',
        grantedAt: new Date('2024-04-01T00:00:00Z'),
        grantedBy: 'user_sarah_001'
      },
      {
        projectId: 'canadalife',
        role: 'reader',
        grantedAt: new Date('2024-04-01T00:00:00Z'),
        grantedBy: 'user_linda_001'
      }
    ],
    preferences: {
      language: 'fr',
      theme: 'light',
      defaultWorkMode: 'work',
      notifications: {
        email: true,
        inApp: false
      }
    },
    createdAt: new Date('2024-03-25T00:00:00Z'),
    lastLoginAt: new Date('2024-11-10T09:00:00Z'),
    isActive: true
  }
];

// Helper functions
export function getUserById(userId: string): SeedUser | undefined {
  return sampleUsers.find(u => u.id === userId);
}

export function getUsersByRole(roleName: string): SeedUser[] {
  return sampleUsers.filter(u => u.roles.includes(roleName));
}

export function getUsersByProject(projectId: string): SeedUser[] {
  return sampleUsers.filter(u => 
    u.projectAccess.some(pa => pa.projectId === projectId)
  );
}

export function getRoleById(roleId: string): Role | undefined {
  return roles.find(r => r.id === roleId);
}
