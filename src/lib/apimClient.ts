import { askEva, type ProjectId } from "./evaClient";
import type { RagTemplate } from "./types";

export interface ApimHeaders {
  "x-project"?: string;
  "x-app"?: string;
  "x-feature"?: string;
  "x-environment"?: string;
  "x-user"?: string;
  "x-cost-center"?: string;
  [key: string]: any;
}

export interface ApimResponse {
  answer: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    processingTime?: number;
  };
}

function ensureHeaders(headers?: ApimHeaders): ApimHeaders {
  const required = ["x-project", "x-app", "x-user"];
  const h = headers ?? {};
  const missing = required.filter((k) => !h[k]);
  if (missing.length > 0) {
    console.warn("APIM missing required headers:", missing.join(", "));
  }
  return { ...h, "x-request-id": Math.random().toString(36).substring(2, 9) };
}

const configuredBase = (import.meta as any).env?.VITE_APIM_BASE_URL || undefined;

export async function ragAnswer(params: {
  projectId: ProjectId;
  message: string;
  headers?: ApimHeaders;
  template?: RagTemplate;
}): Promise<ApimResponse> {
  const headers = ensureHeaders(params.headers);

  console.info("APIM request rag/answer", {
    projectId: params.projectId,
    headers,
    messagePreview: params.message?.slice(0, 120),
    template: params.template
  });

  // If a base URL is configured (e.g., VITE_APIM_BASE_URL=http://localhost:5178), call the network mock.
  if (configuredBase) {
    const url = `${configuredBase.replace(/\/$/, '')}/rag/answer`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      } as any,
      body: JSON.stringify({ projectId: params.projectId, message: params.message, template: params.template })
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`APIM error ${resp.status}: ${text}`);
    }

    const json = await resp.json();
    return { answer: json.answer, metadata: json.metadata };
  }

  // Fallback: call local mock in-process
  const res = await askEva({ projectId: params.projectId, message: params.message, template: params.template });
  return { answer: res.answer, metadata: res.metadata };
}
