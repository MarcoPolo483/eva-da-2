// src/data/seed/translations.ts
// Complete translation strings for EVA DA 2.0 - English and French

export interface TranslationString {
  id: string;
  category: string;
  key: string;
  en: string;
  fr: string;
  context?: string;
}

export const translations: TranslationString[] = [
  // ==================== COMMON UI LABELS ====================
  {
    id: 'common.welcome',
    category: 'common',
    key: 'welcome',
    en: 'Welcome',
    fr: 'Bienvenue',
    context: 'General greeting'
  },
  {
    id: 'common.settings',
    category: 'common',
    key: 'settings',
    en: 'Settings',
    fr: 'Paramètres'
  },
  {
    id: 'common.save',
    category: 'common',
    key: 'save',
    en: 'Save',
    fr: 'Enregistrer'
  },
  {
    id: 'common.cancel',
    category: 'common',
    key: 'cancel',
    en: 'Cancel',
    fr: 'Annuler'
  },
  {
    id: 'common.close',
    category: 'common',
    key: 'close',
    en: 'Close',
    fr: 'Fermer'
  },
  {
    id: 'common.done',
    category: 'common',
    key: 'done',
    en: 'Done',
    fr: 'Terminé'
  },
  {
    id: 'common.loading',
    category: 'common',
    key: 'loading',
    en: 'Loading...',
    fr: 'Chargement...'
  },
  {
    id: 'common.signOut',
    category: 'common',
    key: 'signOut',
    en: 'Sign Out',
    fr: 'Déconnexion'
  },

  // ==================== ACCESSIBILITY ====================
  {
    id: 'accessibility.settings',
    category: 'accessibility',
    key: 'settings',
    en: 'Accessibility Settings',
    fr: 'Paramètres d\'accessibilité'
  },
  {
    id: 'accessibility.fontSize',
    category: 'accessibility',
    key: 'fontSize',
    en: 'Font Size',
    fr: 'Taille de police'
  },
  {
    id: 'accessibility.fontSize.small',
    category: 'accessibility',
    key: 'fontSize.small',
    en: 'Small',
    fr: 'Petit'
  },
  {
    id: 'accessibility.fontSize.medium',
    category: 'accessibility',
    key: 'fontSize.medium',
    en: 'Medium',
    fr: 'Moyen'
  },
  {
    id: 'accessibility.fontSize.large',
    category: 'accessibility',
    key: 'fontSize.large',
    en: 'Large',
    fr: 'Grand'
  },
  {
    id: 'accessibility.fontSize.extraLarge',
    category: 'accessibility',
    key: 'fontSize.extraLarge',
    en: 'Extra Large',
    fr: 'Très grand'
  },
  {
    id: 'accessibility.colorScheme',
    category: 'accessibility',
    key: 'colorScheme',
    en: 'Color Scheme',
    fr: 'Schéma de couleurs'
  },
  {
    id: 'accessibility.colorScheme.light',
    category: 'accessibility',
    key: 'colorScheme.light',
    en: 'Light',
    fr: 'Clair'
  },
  {
    id: 'accessibility.colorScheme.dark',
    category: 'accessibility',
    key: 'colorScheme.dark',
    en: 'Dark',
    fr: 'Sombre'
  },
  {
    id: 'accessibility.colorScheme.auto',
    category: 'accessibility',
    key: 'colorScheme.auto',
    en: 'Auto',
    fr: 'Automatique'
  },
  {
    id: 'accessibility.colorScheme.highContrast',
    category: 'accessibility',
    key: 'colorScheme.highContrast',
    en: 'High Contrast',
    fr: 'Contraste élevé'
  },
  {
    id: 'accessibility.contrast',
    category: 'accessibility',
    key: 'contrast',
    en: 'Contrast',
    fr: 'Contraste'
  },
  {
    id: 'accessibility.contrast.normal',
    category: 'accessibility',
    key: 'contrast.normal',
    en: 'Normal',
    fr: 'Normal'
  },
  {
    id: 'accessibility.contrast.high',
    category: 'accessibility',
    key: 'contrast.high',
    en: 'High',
    fr: 'Élevé'
  },
  {
    id: 'accessibility.contrast.extraHigh',
    category: 'accessibility',
    key: 'contrast.extraHigh',
    en: 'Extra High',
    fr: 'Très élevé'
  },
  {
    id: 'accessibility.reduceMotion',
    category: 'accessibility',
    key: 'reduceMotion',
    en: 'Reduce Motion',
    fr: 'Réduire le mouvement'
  },
  {
    id: 'accessibility.reduceTransparency',
    category: 'accessibility',
    key: 'reduceTransparency',
    en: 'Reduce Transparency',
    fr: 'Réduire la transparence'
  },
  {
    id: 'accessibility.keyboardNavigation',
    category: 'accessibility',
    key: 'keyboardNavigation',
    en: 'Keyboard Navigation',
    fr: 'Navigation au clavier'
  },
  {
    id: 'accessibility.screenReader',
    category: 'accessibility',
    key: 'screenReader',
    en: 'Screen Reader Announcements',
    fr: 'Annonces du lecteur d\'écran'
  },

  // ==================== THEME ====================
  {
    id: 'theme.customizer',
    category: 'theme',
    key: 'customizer',
    en: 'Theme Customizer',
    fr: 'Personnalisation du thème'
  },
  {
    id: 'theme.presets',
    category: 'theme',
    key: 'presets',
    en: 'Theme Presets',
    fr: 'Thèmes prédéfinis'
  },
  {
    id: 'theme.preset.ocean',
    category: 'theme',
    key: 'preset.ocean',
    en: 'Ocean',
    fr: 'Océan'
  },
  {
    id: 'theme.preset.sunset',
    category: 'theme',
    key: 'preset.sunset',
    en: 'Sunset',
    fr: 'Coucher de soleil'
  },
  {
    id: 'theme.preset.forest',
    category: 'theme',
    key: 'preset.forest',
    en: 'Forest',
    fr: 'Forêt'
  },
  {
    id: 'theme.preset.corporate',
    category: 'theme',
    key: 'preset.corporate',
    en: 'Corporate',
    fr: 'Entreprise'
  },
  {
    id: 'theme.preset.ruby',
    category: 'theme',
    key: 'preset.ruby',
    en: 'Ruby',
    fr: 'Rubis'
  },
  {
    id: 'theme.preset.lavender',
    category: 'theme',
    key: 'preset.lavender',
    en: 'Lavender',
    fr: 'Lavande'
  },
  {
    id: 'theme.customColors',
    category: 'theme',
    key: 'customColors',
    en: 'Custom Colors',
    fr: 'Couleurs personnalisées'
  },
  {
    id: 'theme.primaryColor',
    category: 'theme',
    key: 'primaryColor',
    en: 'Primary Color',
    fr: 'Couleur principale'
  },
  {
    id: 'theme.accentColor',
    category: 'theme',
    key: 'accentColor',
    en: 'Accent Color',
    fr: 'Couleur d\'accentuation'
  },

  // ==================== CHAT ====================
  {
    id: 'chat.title',
    category: 'chat',
    key: 'title',
    en: 'EVA Chat',
    fr: 'Discussion EVA'
  },
  {
    id: 'chat.placeholder',
    category: 'chat',
    key: 'placeholder',
    en: 'Ask me anything...',
    fr: 'Posez-moi vos questions...'
  },
  {
    id: 'chat.send',
    category: 'chat',
    key: 'send',
    en: 'Send',
    fr: 'Envoyer'
  },
  {
    id: 'chat.workMode',
    category: 'chat',
    key: 'workMode',
    en: 'Work Mode',
    fr: 'Mode travail'
  },
  {
    id: 'chat.webMode',
    category: 'chat',
    key: 'webMode',
    en: 'Web Mode',
    fr: 'Mode web'
  },
  {
    id: 'chat.newConversation',
    category: 'chat',
    key: 'newConversation',
    en: 'New Conversation',
    fr: 'Nouvelle conversation'
  },

  // ==================== PROJECTS ====================
  {
    id: 'projects.selector',
    category: 'projects',
    key: 'selector',
    en: 'Current Project',
    fr: 'Projet actuel'
  },
  {
    id: 'projects.canadaLife.name',
    category: 'projects',
    key: 'canadaLife.name',
    en: 'Canada Life',
    fr: 'Canada Vie'
  },
  {
    id: 'projects.canadaLife.description',
    category: 'projects',
    key: 'canadaLife.description',
    en: 'Financial services and retirement planning assistant',
    fr: 'Services financiers et assistant de planification de retraite'
  },
  {
    id: 'projects.jurisprudence.name',
    category: 'projects',
    key: 'jurisprudence.name',
    en: 'Jurisprudence',
    fr: 'Jurisprudence'
  },
  {
    id: 'projects.jurisprudence.description',
    category: 'projects',
    key: 'jurisprudence.description',
    en: 'Legal research and case law analysis',
    fr: 'Recherche juridique et analyse de jurisprudence'
  },
  {
    id: 'projects.assistme.name',
    category: 'projects',
    key: 'assistme.name',
    en: 'AssistMe',
    fr: 'AssistMe'
  },
  {
    id: 'projects.assistme.description',
    category: 'projects',
    key: 'assistme.description',
    en: 'General purpose AI assistant for government employees',
    fr: 'Assistant IA polyvalent pour les employés gouvernementaux'
  },

  // ==================== ROLES ====================
  {
    id: 'roles.projectAdmin',
    category: 'roles',
    key: 'projectAdmin',
    en: 'Project Admin',
    fr: 'Administrateur de projet'
  },
  {
    id: 'roles.projectAdmin.description',
    category: 'roles',
    key: 'projectAdmin.description',
    en: 'Manage specific business projects',
    fr: 'Gérer des projets d\'entreprise spécifiques'
  },
  {
    id: 'roles.aicoeOwner',
    category: 'roles',
    key: 'aicoeOwner',
    en: 'AiCoE Project Owner',
    fr: 'Propriétaire de projet AiCoE'
  },
  {
    id: 'roles.aicoeOwner.description',
    category: 'roles',
    key: 'aicoeOwner.description',
    en: 'Oversee project registry and configurations',
    fr: 'Superviser le registre de projets et les configurations'
  },
  {
    id: 'roles.aicoeAdmin',
    category: 'roles',
    key: 'aicoeAdmin',
    en: 'AiCoE Admin',
    fr: 'Administrateur AiCoE'
  },
  {
    id: 'roles.aicoeAdmin.description',
    category: 'roles',
    key: 'aicoeAdmin.description',
    en: 'Global system administration',
    fr: 'Administration système globale'
  },

  // ==================== FILE MANAGEMENT ====================
  {
    id: 'files.upload',
    category: 'files',
    key: 'upload',
    en: 'Upload Files',
    fr: 'Téléverser des fichiers'
  },
  {
    id: 'files.dragDrop',
    category: 'files',
    key: 'dragDrop',
    en: 'Drag and drop files here',
    fr: 'Glissez et déposez les fichiers ici'
  },
  {
    id: 'files.processing',
    category: 'files',
    key: 'processing',
    en: 'Processing',
    fr: 'Traitement en cours'
  },
  {
    id: 'files.complete',
    category: 'files',
    key: 'complete',
    en: 'Complete',
    fr: 'Terminé'
  },
  {
    id: 'files.failed',
    category: 'files',
    key: 'failed',
    en: 'Failed',
    fr: 'Échec'
  },

  // ==================== QUICK QUESTIONS ====================
  {
    id: 'quickQuestions.title',
    category: 'quickQuestions',
    key: 'title',
    en: 'Frequently Asked Questions',
    fr: 'Questions fréquemment posées'
  },
  {
    id: 'quickQuestions.clickToStart',
    category: 'quickQuestions',
    key: 'clickToStart',
    en: 'Click on any question to start a chat with that context',
    fr: 'Cliquez sur une question pour démarrer une discussion avec ce contexte'
  },

  // ==================== ERROR MESSAGES ====================
  {
    id: 'error.generic',
    category: 'error',
    key: 'generic',
    en: 'An error occurred. Please try again.',
    fr: 'Une erreur s\'est produite. Veuillez réessayer.'
  },
  {
    id: 'error.networkError',
    category: 'error',
    key: 'networkError',
    en: 'Network error. Please check your connection.',
    fr: 'Erreur réseau. Veuillez vérifier votre connexion.'
  },
  {
    id: 'error.unauthorized',
    category: 'error',
    key: 'unauthorized',
    en: 'You are not authorized to perform this action.',
    fr: 'Vous n\'êtes pas autorisé à effectuer cette action.'
  },

  // ==================== SUCCESS MESSAGES ====================
  {
    id: 'success.saved',
    category: 'success',
    key: 'saved',
    en: 'Changes saved successfully',
    fr: 'Modifications enregistrées avec succès'
  },
  {
    id: 'success.uploaded',
    category: 'success',
    key: 'uploaded',
    en: 'File uploaded successfully',
    fr: 'Fichier téléversé avec succès'
  }
];

export default translations;
