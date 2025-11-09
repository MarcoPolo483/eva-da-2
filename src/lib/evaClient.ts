export type ProjectId = "canadaLife" | "jurisprudence" | "admin";

export interface EvaAnswer {
  answer: string;
}

export async function askEva(params: {
  projectId: ProjectId;
  message: string;
}): Promise<EvaAnswer> {
  // DEMO: fake latency + answer
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    answer: `[DEMO EVA] (${params.projectId}) ${params.message}`
  };
}
