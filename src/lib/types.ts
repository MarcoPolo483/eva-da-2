export interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

export interface RagTemplate {
  temperature?: number;
  top_k?: number;
  source_filter?: string;
}

// Minimal Project type used by legacy components (ProjectShell) — kept lightweight
export interface Project {
  slug: string;
  name: string;
  ownerName?: string;
  costCenter?: string;
  status?: string;
  securityClassification?: string;
  lookAndFeel?: {
    headingScale?: { h1?: number; h2?: number; h3?: number };
    logoUrl?: string;
    showLanguageToggle?: boolean;
    showHelpLink?: boolean;
    helpLinkUrl?: string;
  };
  ragIndexConfig?: { chunkingStrategy?: string; chunkSizeTokens?: number; chunkOverlapTokens?: number };
  ragRetrievalConfig?: { rankingStrategy?: string; topK?: number };
  ragGuardrailConfig?: { piiRedactionEnabled?: boolean; allowSpeculativeAnswers?: boolean };
  goldenQuestionSet?: string[];
}
