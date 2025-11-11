// Lightweight client scaffold for EVA DA 2.0 consuming IA via APIM.
// Replace baseUrl with your APIM gateway URL (e.g., https://api.contoso.com/ia)
import { ChatRequest, ChatResponse } from './models';

export interface IaApiClientOptions {
  baseUrl: string;
  getAccessToken: () => Promise<string>; // AAD delegated token
}

export class IaApiClient {
  constructor(private opts: IaApiClientOptions) {}

  private async authHeaders(): Promise<HeadersInit> {
    const token = await this.opts.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async health() {
    const res = await fetch(`${this.opts.baseUrl}/health`, { headers: await this.authHeaders() });
    if (!res.ok) throw new Error(`Health failed: ${res.status}`);
    return res.json();
  }

  async chat(req: ChatRequest, onChunk?: (chunk: any) => void): Promise<ChatResponse> {
    const res = await fetch(`${this.opts.baseUrl}/chat`, {
      method: 'POST',
      headers: await this.authHeaders(),
      body: JSON.stringify(req)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Chat failed: ${res.status} ${text}`);
    }

    // Stream NDJSON
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No readable stream');
    const decoder = new TextDecoder();
    let full: ChatResponse | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n').filter(l => l.trim().length);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          onChunk?.(parsed);
          full = parsed; // last full object assumed final
        } catch {
          // ignore partial parse errors
        }
      }
    }
    if (!full) throw new Error('No final chat response received');
    return full;
  }

  async getFolders(): Promise<string[]> {
    const res = await fetch(`${this.opts.baseUrl}/getfolders`, {
      method: 'POST',
      headers: await this.authHeaders(),
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error('getFolders failed');
    return res.json();
  }

  async getTags(): Promise<string[]> {
    const res = await fetch(`${this.opts.baseUrl}/gettags`, {
      method: 'POST',
      headers: await this.authHeaders(),
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error('getTags failed');
    return res.json();
  }

  async getHint(question: string): Promise<string> {
    const res = await fetch(`${this.opts.baseUrl}/getHint?question=${encodeURIComponent(question)}`, {
      headers: await this.authHeaders()
    });
    if (!res.ok) throw new Error('getHint failed');
    return res.json();
  }

  // SSE helper for math or tabular streams
  stream(path: string, question: string, onEvent: (evt: MessageEvent) => void): EventSource {
    const url = `${this.opts.baseUrl}/${path}?question=${encodeURIComponent(question)}`;
    const es = new EventSource(url); // APIM must pass through Authorization if required (or use token query approach)
    es.onmessage = (e) => onEvent(e);
    es.onerror = () => {
      es.close();
    };
    return es;
  }
}