export type ProjectId = "canadaLife" | "jurisprudence" | "admin";

export interface EvaAnswer {
  answer: string;
  metadata?: {
    confidence: number;
    sources?: string[];
    processingTime: number;
  };
}

// Mock configuration that would normally come from EVA Foundation
const projectConfig = {
  canadaLife: {
    templates: [
      "Based on Canada Life's policy guidelines: {answer}",
      "According to our insurance expertise: {answer}",
      "Following Canada Life's best practices: {answer}"
    ],
    latencyRange: { min: 300, max: 800 }
  },
  jurisprudence: {
    templates: [
      "Legal analysis indicates: {answer}",
      "Based on precedent cases: {answer}",
      "Legal framework suggests: {answer}"
    ],
    latencyRange: { min: 500, max: 1200 }
  },
  admin: {
    templates: [
      "System administration response: {answer}",
      "Platform configuration status: {answer}",
      "Administrative analysis: {answer}"
    ],
    latencyRange: { min: 100, max: 400 }
  }
};

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number in range
const randomRange = (range: { min: number; max: number }): number => 
  Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

export async function askEva(params: {
  projectId: ProjectId;
  message: string;
  // optional template overrides coming from the UI (Adjust modal)
  template?: { temperature?: number; top_k?: number; source_filter?: string };
}): Promise<EvaAnswer> {
  const config = projectConfig[params.projectId];
  
  // Simulate variable latency
  await new Promise((resolve) => 
    setTimeout(resolve, randomRange(config.latencyRange))
  );

  // Generate a unique identifier for this response
  const responseId = Math.random().toString(36).substring(7);
  
  // Create a mock answer with random variations
  const templateNote = params.template
    ? ` [template: t=${params.template.temperature ?? "-"}, k=${params.template.top_k ?? "-"}, f=${params.template.source_filter ?? "-"}]`
    : "";

  const mockAnswer = `Response ID ${responseId}: ${params.message}${templateNote}`;
  
  // Apply project-specific template
  const formattedAnswer = randomItem(config.templates).replace(
    "{answer}",
    mockAnswer
  );

  return {
    answer: formattedAnswer,
    metadata: {
      confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
      sources: [
        `mock-source-${responseId}-1`,
        `mock-source-${responseId}-2`
      ],
      processingTime: randomRange(config.latencyRange)
    }
  };
}
