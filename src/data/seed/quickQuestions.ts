// src/data/seed/quickQuestions.ts
// Quick questions for each project in EVA DA 2.0

export interface QuickQuestion {
  id: string;
  projectId: string;
  questionEn: string;
  questionFr: string;
  category: string;
  priority: number;
  tags: string[];
  expectedAnswerType?: 'informational' | 'procedural' | 'analytical' | 'comparison';
}

export const quickQuestions: QuickQuestion[] = [
  // ==================== CANADA LIFE QUESTIONS ====================
  {
    id: 'cl-q1',
    projectId: 'canadalife',
    questionEn: 'What are my pension contribution options?',
    questionFr: 'Quelles sont mes options de cotisation au régime de retraite?',
    category: 'Pension Plans',
    priority: 1,
    tags: ['pension', 'contributions', 'enrollment'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'cl-q2',
    projectId: 'canadalife',
    questionEn: 'How do I enroll in the extended health benefits?',
    questionFr: 'Comment puis-je m\'inscrire aux avantages sociaux de soins de santé prolongés?',
    category: 'Health Benefits',
    priority: 1,
    tags: ['benefits', 'health', 'enrollment'],
    expectedAnswerType: 'procedural'
  },
  {
    id: 'cl-q3',
    projectId: 'canadalife',
    questionEn: 'When can I retire with full pension benefits?',
    questionFr: 'Quand puis-je prendre ma retraite avec des prestations de retraite complètes?',
    category: 'Retirement Planning',
    priority: 2,
    tags: ['retirement', 'pension', 'eligibility'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'cl-q4',
    projectId: 'canadalife',
    questionEn: 'What dental services are covered under my plan?',
    questionFr: 'Quels services dentaires sont couverts par mon régime?',
    category: 'Dental Benefits',
    priority: 2,
    tags: ['dental', 'coverage', 'benefits'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'cl-q5',
    projectId: 'canadalife',
    questionEn: 'How do I update my beneficiary information?',
    questionFr: 'Comment puis-je mettre à jour les informations sur mon bénéficiaire?',
    category: 'Account Management',
    priority: 1,
    tags: ['beneficiary', 'account', 'update'],
    expectedAnswerType: 'procedural'
  },
  {
    id: 'cl-q6',
    projectId: 'canadalife',
    questionEn: 'What happens to my pension if I leave before retirement?',
    questionFr: 'Qu\'arrive-t-il à ma pension si je pars avant la retraite?',
    category: 'Pension Plans',
    priority: 2,
    tags: ['pension', 'termination', 'vesting'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'cl-q7',
    projectId: 'canadalife',
    questionEn: 'Are vision care expenses covered?',
    questionFr: 'Les frais de soins de la vue sont-ils couverts?',
    category: 'Vision Benefits',
    priority: 3,
    tags: ['vision', 'coverage', 'benefits'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'cl-q8',
    projectId: 'canadalife',
    questionEn: 'How do I calculate my retirement income?',
    questionFr: 'Comment puis-je calculer mon revenu de retraite?',
    category: 'Retirement Planning',
    priority: 1,
    tags: ['retirement', 'calculator', 'income'],
    expectedAnswerType: 'procedural'
  },

  // ==================== JURISPRUDENCE QUESTIONS ====================
  {
    id: 'jur-q1',
    projectId: 'jurisprudence',
    questionEn: 'Find recent Supreme Court decisions on privacy rights',
    questionFr: 'Trouvez les décisions récentes de la Cour suprême sur les droits à la vie privée',
    category: 'Constitutional Law',
    priority: 1,
    tags: ['supreme-court', 'privacy', 'charter'],
    expectedAnswerType: 'analytical'
  },
  {
    id: 'jur-q2',
    projectId: 'jurisprudence',
    questionEn: 'What is the legal test for administrative fairness?',
    questionFr: 'Quel est le critère juridique d\'équité administrative?',
    category: 'Administrative Law',
    priority: 1,
    tags: ['administrative-law', 'fairness', 'procedural'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'jur-q3',
    projectId: 'jurisprudence',
    questionEn: 'Summarize key employment law cases from 2024',
    questionFr: 'Résumez les principaux cas de droit du travail de 2024',
    category: 'Employment Law',
    priority: 2,
    tags: ['employment', 'labour', '2024'],
    expectedAnswerType: 'analytical'
  },
  {
    id: 'jur-q4',
    projectId: 'jurisprudence',
    questionEn: 'What are the elements of negligence in tort law?',
    questionFr: 'Quels sont les éléments de négligence en droit de la responsabilité délictuelle?',
    category: 'Tort Law',
    priority: 2,
    tags: ['tort', 'negligence', 'civil-liability'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'jur-q5',
    projectId: 'jurisprudence',
    questionEn: 'Find precedents on contractual interpretation',
    questionFr: 'Trouvez des précédents sur l\'interprétation des contrats',
    category: 'Contract Law',
    priority: 1,
    tags: ['contract', 'interpretation', 'precedent'],
    expectedAnswerType: 'analytical'
  },
  {
    id: 'jur-q6',
    projectId: 'jurisprudence',
    questionEn: 'Compare Crown liability in federal vs provincial cases',
    questionFr: 'Comparer la responsabilité de la Couronne dans les cas fédéraux et provinciaux',
    category: 'Public Law',
    priority: 3,
    tags: ['crown-liability', 'federal', 'provincial'],
    expectedAnswerType: 'comparison'
  },
  {
    id: 'jur-q7',
    projectId: 'jurisprudence',
    questionEn: 'What is the Oakes test for Charter violations?',
    questionFr: 'Qu\'est-ce que le test Oakes pour les violations de la Charte?',
    category: 'Constitutional Law',
    priority: 1,
    tags: ['charter', 'oakes-test', 'section-1'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'jur-q8',
    projectId: 'jurisprudence',
    questionEn: 'Recent changes to class action certification requirements',
    questionFr: 'Changements récents aux exigences de certification des recours collectifs',
    category: 'Civil Procedure',
    priority: 2,
    tags: ['class-action', 'certification', 'procedure'],
    expectedAnswerType: 'analytical'
  },

  // ==================== ASSISTME QUESTIONS ====================
  {
    id: 'am-q1',
    projectId: 'assistme',
    questionEn: 'How do I submit a travel request?',
    questionFr: 'Comment soumettre une demande de voyage?',
    category: 'HR & Administration',
    priority: 1,
    tags: ['travel', 'hr', 'forms'],
    expectedAnswerType: 'procedural'
  },
  {
    id: 'am-q2',
    projectId: 'assistme',
    questionEn: 'What are the IT security policies?',
    questionFr: 'Quelles sont les politiques de sécurité informatique?',
    category: 'IT & Security',
    priority: 1,
    tags: ['security', 'it', 'policies'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'am-q3',
    projectId: 'assistme',
    questionEn: 'How do I request time off?',
    questionFr: 'Comment demander un congé?',
    category: 'HR & Administration',
    priority: 1,
    tags: ['leave', 'vacation', 'hr'],
    expectedAnswerType: 'procedural'
  },
  {
    id: 'am-q4',
    projectId: 'assistme',
    questionEn: 'Where can I find the expense claim form?',
    questionFr: 'Où puis-je trouver le formulaire de demande de remboursement?',
    category: 'Finance',
    priority: 2,
    tags: ['expenses', 'forms', 'finance'],
    expectedAnswerType: 'procedural'
  },
  {
    id: 'am-q5',
    projectId: 'assistme',
    questionEn: 'What is the remote work policy?',
    questionFr: 'Quelle est la politique de télétravail?',
    category: 'HR & Administration',
    priority: 1,
    tags: ['remote-work', 'policy', 'hr'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'am-q6',
    projectId: 'assistme',
    questionEn: 'How do I reset my password?',
    questionFr: 'Comment réinitialiser mon mot de passe?',
    category: 'IT & Security',
    priority: 1,
    tags: ['password', 'it-support', 'security'],
    expectedAnswerType: 'procedural'
  },
  {
    id: 'am-q7',
    projectId: 'assistme',
    questionEn: 'What training programs are available?',
    questionFr: 'Quels programmes de formation sont disponibles?',
    category: 'Professional Development',
    priority: 2,
    tags: ['training', 'development', 'learning'],
    expectedAnswerType: 'informational'
  },
  {
    id: 'am-q8',
    projectId: 'assistme',
    questionEn: 'How do I book a meeting room?',
    questionFr: 'Comment réserver une salle de réunion?',
    category: 'Facilities',
    priority: 2,
    tags: ['booking', 'facilities', 'meeting-rooms'],
    expectedAnswerType: 'procedural'
  }
];

// Export questions by project ID
export function getQuestionsByProject(projectId: string): QuickQuestion[] {
  return quickQuestions.filter(q => q.projectId === projectId);
}

// Export questions by category
export function getQuestionsByCategory(category: string): QuickQuestion[] {
  return quickQuestions.filter(q => q.category === category);
}

// Export top priority questions for a project
export function getTopQuestions(projectId: string, limit: number = 5): QuickQuestion[] {
  return quickQuestions
    .filter(q => q.projectId === projectId)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
}
