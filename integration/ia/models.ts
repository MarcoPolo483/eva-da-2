// Shared models aligned with IA ChatRequest/ChatResponse
export interface ChatTurn {
  user: string;
  bot?: string;
}

export interface Citation {
  citation: string;
  source_path: string;
  page_number: string;
}

export interface ChatOverrides {
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  top?: number;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
  exclude_category?: string;
  suggest_followup_questions?: boolean;
  byPassRAG?: boolean;
  user_persona?: string;
  system_persona?: string;
}

export interface ChatRequest {
  history: ChatTurn[];
  approach: number; // Enum Approaches
  overrides?: ChatOverrides;
  citation_lookup?: Record<string, Citation>;
  thought_chain?: Record<string, string>;
}

export interface ChatResponse {
  answer: string;
  thoughts?: string | null;
  data_points: string[];
  approach: number;
  thought_chain: Record<string, string>;
  work_citation_lookup: Record<string, Citation>;
  web_citation_lookup: Record<string, Citation>;
  error?: string;
}