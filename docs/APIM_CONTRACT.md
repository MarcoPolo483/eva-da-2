APIM contract (EVA Foundation) — concise reference

Purpose
-------
This file documents the minimal APIM contract that the EVA DA UI calls. The UI should never call model providers directly; instead it talks to APIM endpoints which in turn call the EVA Foundation backend.

Endpoints (stable contract)
---------------------------
1) POST /rag/answer
   - Description: RAG-style retrieval + answer for a message
   - Request headers (recommended/enforced):
     - x-project: project id (e.g., "jurisprudence")
     - x-app: client app id (e.g., "eva-da-2-ui")
     - x-user: caller id (e.g., service account or user id)
     - x-feature (optional): feature flag/context
   - Body (JSON): { projectId, message, template? }
   - Response (200): { answer: string, metadata?: { confidence, sources: string[], processingTime } }

2) POST /doc/summarize
   - Description: Summarize a document or set of documents
   - Body (JSON) and headers are similar; response is { summary, metadata }

3) POST /doc/compare, /doc/extract
   - Similar shape and header expectations.

Guardrails
---------
- APIM should enforce headers and apply policies (rate limiting, auth, logging).
- APIM should add tracing headers (x-request-id) and forward governance headers to backend.

Notes for devs
--------------
- For local development we provide a mock APIM server (scripts/mock-apim.js) that enforces the headers and returns a normalized response. Set VITE_APIM_BASE_URL to point to the mock server to test real network behavior.
