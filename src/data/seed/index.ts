// src/data/seed/index.ts
// Central export for all EVA DA 2.0 seed data

export * from './translations';
export * from './defaultSettings';
export * from './sampleProjects';
export * from './sampleUsers';
export * from './quickQuestions';

// Import all seed data for easy access
import { translations } from './translations';
import { 
  defaultAccessibilitySettings, 
  defaultThemes, 
  globalSettings 
} from './defaultSettings';
import { sampleProjects } from './sampleProjects';
import { sampleUsers, roles } from './sampleUsers';
import { quickQuestions } from './quickQuestions';

/**
 * Complete seed data package for EVA DA 2.0
 * Use this to initialize Cosmos DB with production-ready data
 */
export const seedData = {
  translations,
  defaultSettings: {
    accessibility: defaultAccessibilitySettings,
    themes: defaultThemes,
    global: globalSettings
  },
  projects: sampleProjects,
  users: sampleUsers,
  roles,
  quickQuestions
};

/**
 * Statistics about the seed data
 */
export const seedDataStats = {
  translationCount: translations.length,
  themeCount: defaultThemes.length,
  projectCount: sampleProjects.length,
  userCount: sampleUsers.length,
  roleCount: roles.length,
  quickQuestionCount: quickQuestions.length,
  totalRecords: 
    translations.length + 
    defaultThemes.length + 
    sampleProjects.length + 
    sampleUsers.length + 
    roles.length + 
    quickQuestions.length + 
    2 // accessibility + global settings
};

/**
 * Validation function to check seed data integrity
 */
export function validateSeedData(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate translations
  const translationIds = new Set<string>();
  translations.forEach(t => {
    if (!t.id || !t.en || !t.fr) {
      errors.push(`Invalid translation: ${t.id || 'unknown'}`);
    }
    if (translationIds.has(t.id)) {
      errors.push(`Duplicate translation ID: ${t.id}`);
    }
    translationIds.add(t.id);
  });

  // Validate projects
  const projectIds = new Set<string>();
  sampleProjects.forEach(p => {
    if (!p.id || !p.name || !p.displayName) {
      errors.push(`Invalid project: ${p.id || 'unknown'}`);
    }
    if (projectIds.has(p.id)) {
      errors.push(`Duplicate project ID: ${p.id}`);
    }
    projectIds.add(p.id);
  });

  // Validate users
  const userIds = new Set<string>();
  const userEmails = new Set<string>();
  sampleUsers.forEach(u => {
    if (!u.id || !u.email || !u.name) {
      errors.push(`Invalid user: ${u.id || 'unknown'}`);
    }
    if (userIds.has(u.id)) {
      errors.push(`Duplicate user ID: ${u.id}`);
    }
    if (userEmails.has(u.email)) {
      errors.push(`Duplicate user email: ${u.email}`);
    }
    userIds.add(u.id);
    userEmails.add(u.email);

    // Validate project access references
    u.projectAccess.forEach(pa => {
      if (!projectIds.has(pa.projectId)) {
        errors.push(`User ${u.id} references non-existent project: ${pa.projectId}`);
      }
    });
  });

  // Validate quick questions
  quickQuestions.forEach(q => {
    if (!q.id || !q.projectId || !q.questionEn || !q.questionFr) {
      errors.push(`Invalid quick question: ${q.id || 'unknown'}`);
    }
    if (!projectIds.has(q.projectId)) {
      errors.push(`Quick question ${q.id} references non-existent project: ${q.projectId}`);
    }
  });

  // Validate themes
  if (defaultThemes.length === 0) {
    errors.push('No themes defined');
  }
  const hasDefaultLight = defaultThemes.some(t => t.id === 'light-default' && t.isDefault);
  const hasDefaultDark = defaultThemes.some(t => t.id === 'dark-default' && t.isDefault);
  if (!hasDefaultLight || !hasDefaultDark) {
    warnings.push('Missing default light or dark theme');
  }

  // Validate global settings
  if (!globalSettings.platform.name || !globalSettings.platform.version) {
    errors.push('Invalid global settings');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get seed data summary for logging
 */
export function getSeedDataSummary(): string {
  const validation = validateSeedData();
  return `
EVA DA 2.0 Seed Data Package
============================
Translations: ${seedDataStats.translationCount}
Themes: ${seedDataStats.themeCount}
Projects: ${seedDataStats.projectCount}
Users: ${seedDataStats.userCount}
Roles: ${seedDataStats.roleCount}
Quick Questions: ${seedDataStats.quickQuestionCount}
-----------------------------
Total Records: ${seedDataStats.totalRecords}

Validation Status: ${validation.valid ? '✓ VALID' : '✗ INVALID'}
Errors: ${validation.errors.length}
Warnings: ${validation.warnings.length}
${validation.errors.length > 0 ? '\nErrors:\n' + validation.errors.map(e => `  - ${e}`).join('\n') : ''}
${validation.warnings.length > 0 ? '\nWarnings:\n' + validation.warnings.map(w => `  - ${w}`).join('\n') : ''}
  `.trim();
}
