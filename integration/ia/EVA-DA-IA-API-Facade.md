# EVA DA 2.0 – Information Assistant API Facade

This folder defines the API surface EVA DA 2.0 will call via APIM to integrate with the Information Assistant (IA) backend.

## Endpoint Inventory

| Group | Method | Path | Status | Description |
|-------|--------|------|--------|-------------|
| Health | GET | /health | CONFIRMED | Simple readiness/uptime probe. |
| Chat | POST | /chat | CONFIRMED | Core conversational endpoint supporting multiple approaches (RAG, Web+Work comparison, direct LLM). Streams NDJSON. |
| Corpus | POST | /getalluploadstatus | CONFIRMED | Retrieves status of uploaded documents (ingestion pipeline). |
| Corpus | POST | /getfolders | CONFIRMED | Returns logical folder list. |
| Corpus | POST | /gettags | INFERRED | Returns tag taxonomy for uploaded docs. |
| Logging | POST | /logstatus | INFERRED | Writes status log entries (path, status, classification, state). |
| Info/Admin | GET | /getInfoData | INFERRED | Returns system or environment metadata for UI. |
| Tutor (Math) | GET | /getHint | INFERRED | Returns a hint for a math question. |
| Tutor (Math) | GET (SSE) | /stream | INFERRED | Server-Sent Events stream of reasoning steps & final answer. |
| Tutor (Math) | GET | /process_agent_response | INFERRED | Final (non-stream) math answer. |
| Tabular Data Assistant | POST | /posttd | INFERRED | Uploads CSV file (multipart/form-data). |
| Tabular Data Assistant | GET (SSE) | /tdstream | INFERRED | Streams analysis of previously uploaded CSV. |
| Tabular Data Assistant | GET | /process_td_agent_response | INFERRED | Polls for final structured answer from CSV agent. |
| Tabular Data Assistant | POST | /refresh | INFERRED | Resets internal dataframe/agent state. |
| Tabular Data Assistant | GET | /getTempImages | INFERRED | Returns base64 images (charts) generated during CSV analysis. |
| Tabular Data Assistant | GET | /getMaxCSVFileSize | INFERRED | Returns configured max CSV size (MB). |
| Tabular Data Assistant | GET | /getMaxCSVFileSizeType | INFERRED | Returns size unit/type (e.g. MB). |
| (Optional) Blob/SAS | GET/POST | /getBlobClientUrl (name may differ) | INFERRED | Issues SAS URL or direct upload token for content ingestion. |

> NOTE: Validate inferred endpoints by inspecting the running IA backend at `/docs` or by grepping `@app.get` / `@app.post` in `app/backend/app.py`.

## Security & APIM Considerations

1. Authentication: All routes should enforce AAD JWT validation (same tenant) — add APIM inbound policy validating `aud` matches registered IA API App ID or `api://infoasst-<id>`.
2. SSE Streaming: Disable response buffering for `/stream`, `/tdstream`, `/chat` (since `/chat` returns NDJSON chunks). Use `cache-control: no-store` and `content-type: text/event-stream` (or `application/x-ndjson` for `/chat` streaming).
3. Rate Limiting: Apply soft throttles on `/chat`, `/stream`, `/tdstream` given model token usage.
4. CORS: If EVA DA 2.0 runs on a different origin, configure allowed origins (frontend host) and allowed headers (`Authorization`, `Content-Type`).
5. Logging & PII: Do not log raw user queries at APIM layer if they may contain sensitive content; prefer hashed correlation IDs.

## Chat Approaches (Enum)

```
RetrieveThenRead(0), ReadRetrieveRead(1), ReadDecomposeAsk(2), GPTDirect(3),
ChatWebRetrieveRead(4), CompareWorkWithWeb(5), CompareWebWithWork(6)
```

## Streaming Protocols

- `/chat`: Returns NDJSON stream `{"answer":"...partial...", "delta": "...", ...}` (implementation detail: FastAPI `StreamingResponse`).
- SSE endpoints: Each `data:` line represents incremental agent step; final emits `event: end`.

## Error Handling Patterns

- 4xx: Validation or unknown approach.
- 5xx: Unhandled exceptions (LLM failure, search issues).
- Stream endpoints: On internal error, connection closes; client should implement exponential backoff retry.

---

## Suggested Folder Layout in EVA DA 2.0

```
/integration/ia/
  apim/
    openapi/
      ia-facade.yaml
  client/
    IaApiClient.ts
    models.ts
    streaming.ts
  docs/
    EVA-DA-IA-API-Facade.md
    CHANGELOG.md
```

## Next Steps Checklist

- [ ] Verify inferred endpoints in running IA instance.
- [ ] Adjust OpenAPI `servers` URL to APIM gateway hostname.
- [ ] Add AAD OAuth2 security scheme with proper `authorizationUrl` / `tokenUrl`.
- [ ] Generate client via `npx @openapitools/openapi-generator-cli generate -g typescript-fetch`.
- [ ] Implement robust stream parser for NDJSON + SSE.
