// src/lib/rbacManager.ts
export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  description: string;
  level: number; // 1=lowest, 5=highest
}

export interface Permission {
  resource: string;
  actions: string[]; // 'read', 'create', 'update', 'delete'
  scope?: 'own' | 'project' | 'global';
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[]; // role IDs
  projectAssignments?: string[]; // project IDs user has access to
}

// Define the three main roles
export const ROLES: Record<string, UserRole> = {
  PROJECT_ADMIN: {
    id: 'project_admin',
    name: 'Project Admin',
    description: 'Can edit and update assigned project parameters',
    level: 2,
    permissions: [
      { resource: 'project', actions: ['read', 'update'], scope: 'project' },
      { resource: 'project_parameters', actions: ['read', 'update'], scope: 'project' },
      { resource: 'chat_sessions', actions: ['read', 'create', 'update'], scope: 'project' },
      { resource: 'questions', actions: ['read'], scope: 'project' }
    ]
  },
  AICOE_PROJECT_OWNER: {
    id: 'aicoe_project_owner',
    name: 'AiCoE Project Owner',
    description: 'CRUD access to project registry for AiCoE personnel',
    level: 3,
    permissions: [
      { resource: 'project_registry', actions: ['read', 'create', 'update', 'delete'], scope: 'global' },
      { resource: 'project', actions: ['read', 'create', 'update', 'delete'], scope: 'global' },
      { resource: 'project_parameters', actions: ['read', 'create', 'update', 'delete'], scope: 'global' },
      { resource: 'chat_sessions', actions: ['read', 'create', 'update', 'delete'], scope: 'global' },
      { resource: 'questions', actions: ['read', 'create', 'update', 'delete'], scope: 'global' }
    ]
  },
  AICOE_ADMIN: {
    id: 'aicoe_admin',
    name: 'AiCoE Admin',
    description: 'Full system access including global parameters',
    level: 4,
    permissions: [
      { resource: '*', actions: ['read', 'create', 'update', 'delete'], scope: 'global' },
      { resource: 'global_parameters', actions: ['read', 'create', 'update', 'delete'], scope: 'global' },
      { resource: 'system_settings', actions: ['read', 'create', 'update', 'delete'], scope: 'global' },
      { resource: 'user_management', actions: ['read', 'create', 'update', 'delete'], scope: 'global' }
    ]
  }
};

export class RBACManager {
  private currentUser: User | null = null;

  /**
   * Set the current authenticated user
   */
  setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem('eva-current-user', JSON.stringify(user));
  }

  /**
   * Get current user from memory or localStorage
   */
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const stored = localStorage.getItem('eva-current-user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }

    return null;
  }

  /**
   * Check if current user has permission for an action
   */
  hasPermission(resource: string, action: string, projectId?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Check each role the user has
    for (const roleId of user.roles) {
      const role = ROLES[roleId];
      if (!role) continue;

      // Check each permission in the role
      for (const permission of role.permissions) {
        if (this.matchesPermission(permission, resource, action, user, projectId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get user's highest role level
   */
  getUserLevel(): number {
    const user = this.getCurrentUser();
    if (!user) return 0;

    let highestLevel = 0;
    for (const roleId of user.roles) {
      const role = ROLES[roleId];
      if (role && role.level > highestLevel) {
        highestLevel = role.level;
      }
    }

    return highestLevel;
  }

  /**
   * Check if user has specific role
   */
  hasRole(roleId: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(roleId) : false;
  }

  /**
   * Get projects user has access to
   */
  getAccessibleProjects(): string[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    // AiCoE roles have access to all projects
    if (this.hasRole('aicoe_project_owner') || this.hasRole('aicoe_admin')) {
      return ['canadaLife', 'jurisprudence', 'admin', 'AssistMe']; // All business projects
    }

    // Project admins only have access to assigned projects
    return user.projectAssignments || [];
  }

  /**
   * Create a demo user for testing
   */
  createDemoUser(roleType: 'project_admin' | 'aicoe_project_owner' | 'aicoe_admin'): User {
    const demoUsers = {
      project_admin: {
        id: 'demo-project-admin',
        email: 'project.admin@demo.com',
        name: 'Demo Project Admin',
        roles: ['project_admin'],
        projectAssignments: ['canadaLife', 'jurisprudence']
      },
      aicoe_project_owner: {
        id: 'demo-aicoe-owner',
        email: 'aicoe.owner@demo.com',
        name: 'Demo AiCoE Owner',
        roles: ['aicoe_project_owner']
      },
      aicoe_admin: {
        id: 'demo-aicoe-admin',
        email: 'aicoe.admin@demo.com',
        name: 'Demo AiCoE Admin',
        roles: ['aicoe_admin']
      }
    };

    return demoUsers[roleType];
  }

  private matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    user: User,
    projectId?: string
  ): boolean {
    // Check if permission applies to this resource
    if (permission.resource !== '*' && permission.resource !== resource) {
      return false;
    }

    // Check if permission includes this action
    if (!permission.actions.includes(action)) {
      return false;
    }

    // Check scope constraints
    if (permission.scope === 'project' && projectId) {
      // For project scope, user must have access to this specific project
      return user.projectAssignments?.includes(projectId) || false;
    }

    if (permission.scope === 'own') {
      // For own scope, would need additional ownership checks
      return true; // Simplified for now
    }

    // Global scope or no scope restrictions
    return true;
  }

  /**
   * Sign out current user
   */
  signOut(): void {
    this.currentUser = null;
    localStorage.removeItem('eva-current-user');
  }
}

// Export singleton instance
export const rbacManager = new RBACManager();
