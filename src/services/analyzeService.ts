import { Suggestion, TextHighlight } from '../types';

// Same-origin by default (the webapp backend serves this SPA). Can be
// overridden with VITE_API_URL for split deployments.
const API_BASE = import.meta.env.VITE_API_URL || '';

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* ignore */
    }
    throw new Error(`${path} failed (${res.status}) ${detail}`);
  }
  return res.json() as Promise<T>;
}

export interface AnalyzeResult {
  highlights: TextHighlight[];
  suggestions: Suggestion[];
}

export interface RewriteVersion {
  text: string;
  underlines: Array<{ start_index: number; end_index: number }>;
}

export interface RewriteResult {
  gentle: RewriteVersion;
  full: RewriteVersion;
}

export const analyzeService = {
  analyze(text: string, profile: Record<string, unknown>): Promise<AnalyzeResult> {
    return postJSON<AnalyzeResult>('/api/analyze', { text, profile });
  },
  rewrite(
    text: string,
    profile: Record<string, unknown>,
    flagged: string[]
  ): Promise<RewriteResult> {
    return postJSON<RewriteResult>('/api/rewrite', { text, profile, flagged });
  },
};
