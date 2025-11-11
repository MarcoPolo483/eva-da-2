# EVA DA 2.0 + EVA Foundation 2.0 - Architecture & Implementation Strategy

**Date:** 2024-01-15  
**Status:** Planning Phase - Dual-Mode Architecture Design  
**Purpose:** Production-ready architecture with demo-to-Azure migration path

---

## 🎯 **The Vision: Two-Phase Delivery**

### **Phase 1: EVA DA 2.0** (Frontend + Configuration Management)
- React SPA with project-aware chat interface
- Admin interfaces: Project Registry + Global App Admin
- Translations, RBAC, Feature Flags management
- **Dual-Mode Architecture:** localStorage (demo) ↔ Azure Cosmos DB (production)
- "Production-ready in a snap" via configuration switch

### **Phase 2: EVA Foundation 2.0** (Azure Backend Infrastructure)
- Based on Information Assistant architecture (forked & customized)
- Minimal footprint, cost-optimized deployment
- Infrastructure as Code (Terraform - team standard)
- Full observability and monitoring
- Automated CI/CD deployment

---

## 🏗️ **Complete Architecture (End State)**

```
┌───────────────────────────────────────────────────────────────┐
│  FRONTEND: EVA DA 2.0 (Azure Static Web Apps)                 │
│  - Project-aware chat UI                                      │
│  - Admin interfaces (Project Registry, Global App Admin)      │
│  - Translations, RBAC, Feature Flags UI                       │
│  - Dual-mode: localStorage (demo) / Cosmos DB (production)    │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│  API GATEWAY: Azure API Management (Consumption Tier)         │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐│
│  │ IA Facade API       │  │ EVA Config API                   ││
│  │ /ia/chat            │  │ /eva/config/projects             ││
│  │ /ia/health          │  │ /eva/config/translations         ││
│  │ /ia/getfolders      │  │ /eva/rbac/users                  ││
│  │ /ia/getInfoData     │  │ /eva/featureflags                ││
│  └─────────────────────┘  └──────────────────────────────────┘│
└────────────┬─────────────────────────┬────────────────────────┘
             │                         │
             ▼                         ▼
┌────────────────────────┐  ┌─────────────────────────────────┐
│  IA Backend            │  │  EVA Config API                 │
│  (Azure Functions)     │  │  (Azure Functions)              │
│  - Python runtime      │  │  - TypeScript/Node.js runtime   │
│  - Chat handler        │  │  - Projects CRUD                │
│  - RAG pipeline        │  │  - Translations CRUD            │
│  - Vector search       │  │  - RBAC management              │
│  - Document ingest     │  │  - Feature Flags service        │
│  ┌──────────────────┐  │  └─────────────────────────────────┘
│  │ Azure OpenAI     │  │
│  │ - GPT-4          │  │
│  │ - Embeddings     │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │ Azure AI Search  │  │
│  │ - Vector indexes │  │
│  │ - Semantic rank  │  │
│  └──────────────────┘  │
└────────────┬───────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                   │
│  ┌────────────────────────┐  ┌───────────────────────────────┐│
│  │ Azure Cosmos DB        │  │ Azure Blob Storage            ││
│  │ (NoSQL API, Serverless)│  │ - Source documents (PDF)      ││
│  │                        │  │ - Exports (JSON backups)      ││
│  │ Container: documents   │  │ - Generated images (charts)   ││
│  │ PK: /userId            │  │ - Audit logs                  ││
│  │ - Chat history         │  └───────────────────────────────┘│
│  │ - Upload status        │                                   │
│  │ - Document metadata    │                                   │
│  │                        │                                   │
│  │ Container: appConfig   │                                   │
│  │ PK: /configType        │                                   │
│  │ - Projects (EVA DA)    │                                   │
│  │ - Translations (i18n)  │                                   │
│  │ - RBAC rules           │                                   │
│  │ - Feature flags        │                                   │
│  └────────────────────────┘                                   │
└───────────────────────────────────────────────────────────────┘
```

---

## 🌍 **EVA AS A PLATFORM (Updated Vision)**

### **The Three EVA Products**

```
┌──────────────────────────────────────────────────────────────┐
│ 1. EVA CHAT (ChatGPT-style productivity assistant)          │
│    Status: ⚠️ Migrating to EVA DA 2.0                       │
│    Users: 12,000 | Prompts: 1,000,000                       │
│    Purpose: General AI (draft, summarize, translate, ideate)│
│    Technology: Currently OpenWebUI (dying due to licensing)  │
│    → BECOMES: "World Mode" in EVA DA 2.0                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 2. EVA DOMAIN ASSISTANT 2.0 (Chat with your work data)      │
│    Status: 🟡 In Development                                 │
│    Purpose: RAG over curated departmental knowledge          │
│    Features: Project-aware, RBAC, citations, traceability    │
│    Technology: React SPA + EVA Foundation APIs               │
│    → EXPANDS TO: Unified "Work/World" toggle interface       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 3. EVA FOUNDATION 2.0 (The AI Utility Platform)             │
│    Status: 🔴 Planning Phase                                 │
│    Purpose: Shared AI services exposed via APIM              │
│    APIs: RAG, Doc Intelligence, Chat, Guardrails, Ingestion  │
│    Consumers: EVA DA, Jurisprudence, AssistMe, SIs, widgets  │
│    → BACKEND: Powers all EVA products + external consumers   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📖 **EVA Platform Manifesto**

**"EVA isn't just a chat bot — it's a shared AI platform."**

Through APIM, EVA exposes a growing catalogue of AI capabilities as reusable services:

- **RAG APIs** – `/rag/retrieve`, `/rag/answer` for grounded Q&A over trusted content
- **Document services** – `/doc/summarize`, `/doc/compare`, `/doc/extract`
- **Chat services** – `/chat/completion`, `/chat/stream` for general AI conversations
- **Ingestion & knowledge management** – `/ingest/preview`, synonyms, taxonomy helpers
- **Safety & policy guardrails** – PII redaction, base prompts, logging, policy checks
- **Agent routing and tool metadata** – APIs that let agents discover, call, and chain EVA tools safely

**EVA stays faceless:** 

Apps like **EVA Chat**, **EVA Domain Assistant**, **AssistMe**, **Jurisprudence**, and **AI KM** are simply different faces calling the same EVA services.

This separation allows:
- ✅ **Reusability** – One RAG engine powers many domain assistants
- ✅ **Cost attribution** – Track usage per project, app, feature via APIM headers
- ✅ **Agent-ready** – External agents can consume EVA as a utility layer
- ✅ **Governance** – Centralized guardrails, logging, and policy enforcement
- ✅ **Evolution** – Add new capabilities (vector search, agentic workflows) without breaking existing apps

---

## 🌐 **EVA API Catalogue (via APIM)**

### **1. RAG Services** 🔍
Semantic search and retrieval-augmented generation over trusted content.

```
POST /eva/rag/retrieve
  Purpose: Retrieve relevant chunks from project corpus
  Input: { projectId, query, filters, topK }
  Output: { chunks: [{ content, score, metadata, citation }] }
  
POST /eva/rag/answer
  Purpose: RAG answer with citations and reasoning trace
  Input: { projectId, query, history?, overrides? }
  Output: { answer, citations, thoughts, metadata }
```

---

### **2. Document Intelligence** 📄
Summarization, comparison, and structured extraction from documents.

```
POST /eva/doc/summarize
  Purpose: Summarize one or more documents
  Input: { documentIds, style: 'brief' | 'detailed', language }
  Output: { summary, wordCount, keyPoints }

POST /eva/doc/compare
  Purpose: Compare two document versions
  Input: { docA, docB, highlightChanges: true }
  Output: { differences, addedSections, removedSections }

POST /eva/doc/extract
  Purpose: Extract structured fields from documents
  Input: { documentId, fields: ['dates', 'amounts', 'entities'] }
  Output: { extracted: { dates: [...], amounts: [...] } }
```

---

### **3. Chat Services** 💬 **(NEW for EVA Chat migration)**
General-purpose GPT chat without RAG (replacement for OpenWebUI).

```
POST /eva/chat/completion
  Purpose: General GPT-4 chat (like ChatGPT)
  Input: { message, conversationId?, systemPrompt?, temperature? }
  Output: { answer, conversationId, tokens }
  Headers: x-project: eva-chat, x-user: <hashed>

POST /eva/chat/stream
  Purpose: Streaming chat responses (SSE)
  Input: Same as /chat/completion
  Output: Server-Sent Events stream

GET /eva/chat/history
  Purpose: Get user's conversation history
  Input: userId, limit?, offset?
  Output: { conversations: [{ id, title, lastMessage, timestamp }] }

DELETE /eva/chat/history/{conversationId}
  Purpose: Delete conversation (GDPR compliance)
```

---

### **4. Ingestion & Knowledge Management** 📥
Preview, validate, and commit content into project spaces.

```
POST /eva/ingest/preview
  Purpose: Preview how document will be chunked and enriched
  Input: { document, projectId, chunkingStrategy }
  Output: { chunks: [...], metadata, warnings }

POST /eva/ingest/commit
  Purpose: Push content into project with metadata and RBAC
  Input: { document, projectId, metadata, tags, accessControl }
  Output: { status, documentId, chunksCreated }

GET /eva/ingest/status
  Purpose: Track ingestion pipeline status
  Input: documentId
  Output: { status, progress, errors }
```

---

### **5. Guardrails as a Service** 🛡️
Centralized safety, redaction, and policy enforcement.

```
POST /eva/guardrails/redact
  Purpose: PII redaction for logs or downstream systems
  Input: { text, redactionLevel: 'standard' | 'strict' }
  Output: { redactedText, foundPatterns: ['email', 'sin'] }

POST /eva/guardrails/prompt
  Purpose: Apply standard base prompts and disclaimers
  Input: { projectId, userMessage }
  Output: { augmentedPrompt, disclaimerText }

POST /eva/guardrails/inspect
  Purpose: Check response for risky content
  Input: { response, projectId }
  Output: { safe: boolean, warnings: [...], blocked: boolean }
```

---

### **6. Configuration & Admin APIs** ⚙️
Manage projects, users, translations, feature flags.

```
GET /eva/config/projects
  Purpose: List all projects
  Output: { projects: [{ id, label, domain, owner }] }

POST /eva/config/projects
  Purpose: Create new project
  Input: { id, label, domain, owner, ragConfig, theme }
  Output: { created: true, projectId }

GET /eva/rbac/users
  Purpose: List users and roles
  Output: { users: [{ email, role, projectAccess }] }

GET /eva/featureflags
  Purpose: Get feature flag states
  Output: { flags: { enableMultitenancy: false } }
```

---

## 🏷️ **Cost Tagging & FinOps (APIM Headers)**

### **Required Headers on ALL EVA API Calls:**

```http
x-project: jurisprudence | assistme | eva-chat | ...
  → Which project/solution is calling

x-app: eva-da-web | curam-widget | sharepoint-webpart | ...
  → Which client application

x-feature: rag-answer | doc-summarize | chat-completion | ...
  → Which feature/endpoint family

x-environment: dev | test | prod
  → Environment for cost segregation

x-cost-center: ABC-123
  → Financial code for chargeback/showback

x-user: <hashed-id>
  → Pseudonymous user ID (not SIN, not email in clear)
  → For usage analytics without PII
```

### **Why This Matters:**

APIM policies validate and log these headers, enabling:
- 💰 **FinOps Dashboards** – Break down costs by project, app, feature, environment
- 📊 **Usage Analytics** – Who's using what, how much, when
- 🔍 **Troubleshooting** – Trace requests across services
- 🚨 **Rate Limiting** – Enforce quotas per project/user
- 📈 **Capacity Planning** – Predict Azure costs based on usage trends

**Example Cosmos DB Log:**
```typescript
{
  id: "request-uuid-12345",
  configType: "apiUsage",
  timestamp: "2024-01-15T10:00:00Z",
  project: "jurisprudence",
  app: "eva-da-web",
  feature: "rag-answer",
  environment: "prod",
  costCenter: "JUR-9001",
  userId: "hashed-abc123",
  endpoint: "/eva/rag/answer",
  statusCode: 200,
  latencyMs: 1234,
  tokensUsed: { prompt: 500, completion: 800, total: 1300 },
  costUSD: 0.052  // Calculated from Azure OpenAI pricing
}
```

---

## 🔄 **Connectors vs Pipelines**

### **Connectors: Where does data come from?**

Connectors answer: **"What data sources can EVA access?"**

- SharePoint sites
- File shares (SMB, NFS)
- Azure Blob Storage
- Databases (SQL Server, Cosmos DB)
- Websites / APIs
- Email repositories

A connector knows how to:
- Authenticate to the source
- List items (files, pages, records)
- Fetch raw content + basic metadata
- Handle incremental updates (delta sync)

### **Pipelines: What do we do with the data?**

Pipelines answer: **"How do we process raw data into searchable knowledge?"**

Processing flow:
1. **Clean** – Remove boilerplate, headers, footers
2. **OCR** – Extract text from PDFs, images
3. **Chunk** – Split into semantic chunks (by heading, section, paragraph)
4. **Embed** – Generate vector embeddings (text-embedding-ada-002)
5. **Enrich** – Add metadata (document type, effective date, version, tags)
6. **Index** – Push to Azure AI Search
7. **Route** – Assign to one or more projects based on RBAC rules

### **In EVA Domain Assistant:**

- **Business owners** configure connectors (what sites, folders, filters)
- **EVA** runs ingestion pipelines automatically (scheduled or on-demand)
- **IT** controls governance (who can connect to what)

**Benefit:** Reuse same pipelines across multiple connectors and projects.

---

## 🎯 **EVA Search & RAG Roadmap**

Evolution of search capabilities across EVA DA, Jurisprudence, AssistMe, AI KM.

### **Level 1: Basic RAG** ✅ (Current State)
- Keyword + vector search over chunks
- Single project, simple filters, basic citations
- Implemented in Information Assistant

### **Level 2: Chunking & Enrichment** 🚧 (In Progress)
- Smarter chunking by headings, sections, document type
- Per-chunk metadata (doc type, effective date, version, source)
- Result grouping and de-duplication before answering
- **Drivers:** Jurisprudence (case law), AssistMe (policy docs)

### **Level 3: Multi-Corpus & Policy-Aware** 🔲 (Planned)
- Search across multiple project spaces with RBAC filters
- Boosting based on recency, official vs draft, authoritative sources
- Explainable retrieval: "why these sources were chosen"
- **Drivers:** AI KM (knowledge discovery), cross-project research

### **Level 4: Workflow & Agents on RAG** 🔲 (Future)
- Agents orchestrate multi-step research (e.g., case synthesis)
- Cross-tool flows (RAG + extraction + comparison)
- Continuous feedback loop (thumbs up/down → ranking tuning)
- **Drivers:** Complex workflows (CPP-D file review, compliance checks)

---

## 🤖 **EVA & Agents: Two-Fold Integration**

### **1. Agents Consuming EVA APIs** (EVA as utility layer)

External agents (built with Semantic Kernel, Autogen, Azure AI Agents) call EVA through APIM.

**Example: Jurisprudence Research Agent**
```typescript
// Agent doesn't manage RAG itself - it calls EVA
const agent = new SemanticKernelAgent();

agent.addTool({
  name: 'searchCaseLaw',
  description: 'Search CPP-D case law database',
  execute: async (query: string) => {
    return await evaApi.rag.retrieve({
      projectId: 'jurisprudence',
      query,
      filters: { documentType: 'case-law' }
    });
  }
});

agent.addTool({
  name: 'summarizeCase',
  description: 'Summarize a legal case',
  execute: async (caseId: string) => {
    return await evaApi.doc.summarize({
      documentId: caseId,
      style: 'legal-brief'
    });
  }
});

// Agent orchestrates multi-step workflow
const result = await agent.run(
  "Find and summarize recent CPP-D chronic pain decisions"
);
```

**Benefits:**
- ✅ Agent doesn't duplicate RAG logic
- ✅ EVA enforces guardrails, RBAC, logging
- ✅ Consistent cost attribution via APIM headers

---

### **2. EVA Implemented as Agents** (EVA orchestrates tools internally)

EVA itself exposes agent-style behaviors:
- "Jurisprudence Research Agent"
- "CPP-D File Review Agent"
- "KM Cleanup Agent"

**Example: CPP-D File Review Agent (Internal to EVA)**

```python
# EVA Foundation backend: agent_cppd_review.py
class CPPDReviewAgent:
    def __init__(self):
        self.tools = [
            self.search_policy,
            self.extract_dates,
            self.compare_versions,
            self.check_eligibility
        ]
    
    async def review_file(self, file_id: str) -> dict:
        # 1. Extract structured data
        extracted = await self.extract_dates(file_id)
        
        # 2. Search relevant policies
        policies = await self.search_policy(
            f"CPP-D eligibility rules for {extracted['condition']}"
        )
        
        # 3. Compare with previous decision
        if extracted['previousDecisionId']:
            comparison = await self.compare_versions(
                extracted['previousDecisionId'],
                file_id
            )
        
        # 4. Generate recommendation
        return {
            'recommendation': '...',
            'reasoning': '...',
            'citations': policies,
            'risks': comparison.get('discrepancies', [])
        }
```

**From the outside:** Client just calls `/eva/agents/cppd-review`

**Inside EVA:** Complex agentic workflow with logging, guardrails, and tool orchestration

---

## 🎓 **"Agent-Ready" Definition of Done**

An EVA capability is **"agent-ready"** when:

1. ✅ **API Contract** – Exposed via APIM with stable OpenAPI spec
2. ✅ **Machine-Readable** – JSON schemas documented, no UI-only features
3. ✅ **RBAC via Headers** – Project/user scoping driven by JWT claims
4. ✅ **Centralized Guardrails** – Agents can't bypass policy checks or audit logs
5. ✅ **Idempotent & Composable** – Safe to retry and chain API calls
6. ✅ **Cost Tagging** – APIM headers enforced (x-project, x-app, x-feature)
7. ✅ **Documentation** – Examples show how agents call APIs end-to-end

**Example Agent-Ready Checklist for `/eva/rag/answer`:**
- [x] OpenAPI spec published
- [x] Accepts `x-project`, `x-user` headers
- [x] Returns structured JSON (not HTML)
- [x] Logs all requests to Cosmos DB
- [x] Enforces project RBAC
- [x] Handles 429 rate limiting gracefully
- [x] Example code for agents available

---

## 🎨 **Dual-Mode Architecture Pattern**

### **Key Principle: Repository + Strategy Pattern**

Same application code runs in both demo and production modes via interface abstraction.

```typescript
// Contract: What operations do we need?
interface IConfigRepository {
  getProjects(): Promise<RegistryEntry[]>;
  updateProject(id: ProjectId, updates: Partial<RegistryEntry>): Promise<void>;
  getTranslations(language: string): Promise<Record<string, string>>;
  updateTranslations(language: string, updates: Record<string, string>): Promise<void>;
  getUser(email: string): Promise<User | null>;
  updateUser(email: string, updates: Partial<User>): Promise<void>;
  getFeatureFlags(): Promise<FeatureFlag[]>;
  updateFeatureFlag(key: string, enabled: boolean): Promise<void>;
}

// Demo Mode Implementation
class LocalStorageConfigRepository implements IConfigRepository {
  // Uses localStorage for persistence
  // Fast iteration, no Azure costs
}

// Production Mode Implementation
class AzureCosmosConfigRepository implements IConfigRepository {
  // Uses Azure Cosmos DB for persistence
  // Production-grade, multi-region, scalable
}

// Factory: Choose based on environment config
class ConfigRepositoryFactory {
  static create(): IConfigRepository {
    const mode = import.meta.env.VITE_CONFIG_MODE; // 'local' or 'azure'
    return mode === 'azure' 
      ? new AzureCosmosConfigRepository()
      : new LocalStorageConfigRepository();
  }
}
```

### **Configuration via .env Files**

```bash
# .env.development (Demo Mode)
VITE_CONFIG_MODE=local
VITE_IA_API_MODE=mock
VITE_AUTH_MODE=mock

# .env.production (Azure Mode)
VITE_CONFIG_MODE=azure
VITE_COSMOS_ENDPOINT=https://cosmos-eva-prod.documents.azure.com:443/
VITE_COSMOS_KEY=<from-key-vault>
VITE_IA_API_ENDPOINT=https://func-ia-prod.azurewebsites.net
VITE_AUTH_MODE=azuread
VITE_AZURE_AD_TENANT_ID=<tenant>
VITE_AZURE_AD_CLIENT_ID=<client>
```

### **Mode Indicator (UI Component)**

```tsx
// Shows which mode the app is running in
<ModeIndicator />
// Displays: "🔵 Demo Mode (localStorage)" or "🟢 Production Mode (Azure)"
```

---

## 📦 **File Structure for Dual-Mode**

```
src/
├── lib/
│   ├── repositories/
│   │   ├── IConfigRepository.ts          # Interface (contract)
│   │   ├── LocalStorageRepository.ts     # Demo implementation
│   │   ├── AzureCosmosRepository.ts      # Production implementation
│   │   └── ConfigRepositoryFactory.ts    # Factory pattern
│   ├── services/
│   │   ├── projectService.ts             # Business logic (uses repo)
│   │   ├── translationService.ts
│   │   ├── rbacService.ts
│   │   └── featureFlagService.ts
│   └── types/
│       ├── Config.ts                     # Shared TypeScript types
│       ├── User.ts
│       └── FeatureFlag.ts
└── components/
    ├── ProjectRegistry.tsx               # Uses projectService
    ├── GlobalAppAdmin.tsx                # Uses multiple services
    ├── TranslationsAdmin.tsx             # Uses translationService
    └── ModeIndicator.tsx                 # Shows current mode
```

---

## 💰 **Cost Optimization Strategy**

### **Azure Free Tier During Development:**
- **Cosmos DB Serverless:** 1000 RU/s free for 30 days, then pay-per-use
- **Azure Functions Consumption:** 1M free executions/month
- **Static Web Apps Free Tier:** 100 GB bandwidth/month
- **Application Insights:** 5 GB ingestion/month free

### **Estimated Monthly Costs (Production):**
| Service | Tier | Est. Cost |
|---------|------|-----------|
| Cosmos DB (Serverless) | Pay-per-use | $25-100 |
| Azure OpenAI (GPT-4, 10K TPM) | Consumption | $30-200 |
| Azure AI Search | Basic | $75 |
| Azure Functions | Consumption | $5-20 |
| Storage Account | Standard LRS | $5 |
| APIM | Consumption | ~$3.50 per 100K calls |
| Static Web Apps | Free | $0 |
| Key Vault | Standard | $1 |
| Application Insights | Pay-as-you-go | $5-20 |
| **Total** | | **$150-450/month** |

### **Cost Control Tactics:**
- ✅ Use **Serverless** tiers (Cosmos DB, Functions, APIM)
- ✅ Start with **Basic** tier for AI Search (upgrade to Standard only if needed)
- ✅ Azure OpenAI: Consider **Provisioned Throughput Units (PTUs)** if usage becomes predictable
- ✅ Set up **Azure Cost Management alerts** (budget $500/month)
- ✅ Use **Azure Advisor** recommendations for optimization

---

## 🚀 **Implementation Roadmap**

### **Week 1 (Current): Repository Abstraction Layer**
**Goal:** Make existing demo "Azure-ready" without changing functionality

**Tasks:**
- ✅ Create `IConfigRepository` interface
- ✅ Refactor existing localStorage code into `LocalStorageRepository`
- ✅ Create service layer (projectService, translationService, rbacService)
- ✅ Update components to use services instead of direct localStorage
- ✅ Add `ModeIndicator` component
- ✅ Add "Export All Data" button for migration
- ✅ Test that demo still works (no regressions)

**Deliverable:** Demo works exactly as before, but with clean abstraction layer

---

### **Week 2: Azure Stubs + Build Pipeline**
**Goal:** Create production build infrastructure

**Tasks:**
- ✅ Create `AzureCosmosRepository` with stubbed methods (throw "Not implemented")
- ✅ Add `.env.production` configuration
- ✅ Add build scripts: `npm run build:demo`, `npm run build:prod`
- ✅ Create `scripts/seed-cosmos.ts` (migration tool)
- ✅ Test that app compiles in both modes
- ✅ Add mode detection and switching logic

**Deliverable:** Production build exists, shows mode indicator, but Azure calls fail gracefully

---

### **Week 3-4: Terraform Infrastructure (EVA Foundation 2.0)**
**Goal:** Deploy minimal Azure infrastructure with Terraform

**Tasks:**
- ✅ Create Terraform modules:
  - Cosmos DB (Serverless, 2 containers)
  - Azure Functions (2 apps: IA backend + Config API)
  - Azure OpenAI (GPT-4 + embeddings deployments)
  - Azure AI Search (Basic tier)
  - Storage Account + Blob containers
  - APIM (Consumption tier)
  - Key Vault
  - Application Insights + Log Analytics
  - Static Web Apps
- ✅ Create environment-specific `.tfvars` (dev, staging, prod)
- ✅ Document deployment steps
- ✅ Deploy to your Azure subscription
- ✅ Verify resources are created

**Deliverable:** Working Azure infrastructure (empty, but functional)

---

### **Week 5-6: Implement Azure Repositories**
**Goal:** Real Azure Cosmos DB integration

**Tasks:**
- ✅ Install `@azure/cosmos` npm package
- ✅ Implement `AzureCosmosRepository` methods:
  - Projects CRUD
  - Translations CRUD
  - RBAC CRUD
  - Feature Flags CRUD
- ✅ Add connection string management (Key Vault integration)
- ✅ Add retry logic and error handling
- ✅ Test with Cosmos DB Emulator locally
- ✅ Test against real Azure Cosmos DB
- ✅ Run seed script to populate initial data

**Deliverable:** EVA DA 2.0 frontend works in production mode with real Azure backend

---

### **Week 7-8: EVA Config API (Azure Functions)**
**Goal:** RESTful API for configuration management

**Tasks:**
- ✅ Create Azure Functions project (TypeScript)
- ✅ Implement HTTP triggers:
  - `GET /api/config/projects`
  - `POST /api/config/projects`
  - `PUT /api/config/projects/{id}`
  - `DELETE /api/config/projects/{id}`
  - `GET /api/config/translations/{lang}`
  - `PUT /api/config/translations/{lang}`
  - `GET /api/rbac/users`
  - `POST /api/rbac/users`
  - `GET /api/featureflags`
  - `PUT /api/featureflags/{key}`
- ✅ Deploy to Azure
- ✅ Configure APIM policies
- ✅ Test end-to-end

**Deliverable:** Config API is live and accessible via APIM

---

### **Week 9-10: IA Backend Integration**
**Goal:** Fork Information Assistant and customize for EVA

**Tasks:**
- ✅ Fork IA repo (private fork)
- ✅ Strip down to minimal features (chat, RAG, vector search)
- ✅ Remove unnecessary assistants (math tutor, tabular if not needed)
- ✅ Configure Azure OpenAI endpoints
- ✅ Configure Azure AI Search indexes
- ✅ Deploy Python functions to Azure
- ✅ Test `/chat` endpoint
- ✅ Update EVA DA 2.0 frontend to call real IA backend

**Deliverable:** Working RAG chat powered by Azure OpenAI

---

### **Week 11-12: Integration & Testing**
**Goal:** Connect all pieces, production hardening

**Tasks:**
- ✅ Replace mock authentication with Azure AD B2C
- ✅ Configure RBAC roles and permissions
- ✅ Load testing (Azure Load Testing)
- ✅ Security audit (Microsoft Defender for Cloud)
- ✅ Performance optimization
- ✅ Cost optimization review
- ✅ Disaster recovery testing
- ✅ Documentation (runbooks, architecture diagrams)

**Deliverable:** Production-ready EVA DA 2.0 + EVA Foundation 2.0

---

## 🎯 **Migration Strategy: Demo → Production**

### **Step 1: Export Data from Demo**
```typescript
// In GlobalAppAdmin component
function handleExportAllData() {
  const data = {
    projects: loadRegistry(REGISTRY),
    translations: { en: enTranslations, fr: frTranslations },
    users: getMockUsers(),
    featureFlags: getMockFeatureFlags(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };
  downloadJSON(data, `eva-full-export-${Date.now()}.json`);
}
```

### **Step 2: Seed Azure Cosmos DB**
```bash
# Run seed script
npm run seed:cosmos -- --file eva-full-export.json

# Script uses AzureCosmosRepository to populate Cosmos DB
```

### **Step 3: Switch to Production Mode**
```bash
# Update environment
cp .env.production .env

# Build for production
npm run build:prod

# Deploy to Azure Static Web Apps
npm run deploy:prod
```

---

## 📋 **Technology Stack**

### **Frontend (EVA DA 2.0)**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **i18n:** react-i18next
- **State Management:** React hooks + Context API
- **Hosting:** Azure Static Web Apps

### **Backend (EVA Foundation 2.0)**
- **IA Backend:** Azure Functions (Python 3.11)
- **Config API:** Azure Functions (Node.js 18, TypeScript)
- **AI:** Azure OpenAI (GPT-4, text-embedding-ada-002)
- **Search:** Azure AI Search (Basic tier)
- **Database:** Azure Cosmos DB (NoSQL API, Serverless)
- **Storage:** Azure Blob Storage
- **Gateway:** Azure API Management (Consumption)
- **Secrets:** Azure Key Vault
- **Observability:** Application Insights + Log Analytics

### **Infrastructure (IaC)**
- **Tool:** Terraform (team standard)
- **State:** Azure Storage Account (remote backend)
- **CI/CD:** GitHub Actions

---

## 🔐 **Security & Compliance**

### **Authentication & Authorization**
- **Users:** Azure AD B2C
- **API Access:** OAuth 2.0 / JWT tokens
- **Roles:** Managed via Azure AD groups
- **RBAC:** Custom permission matrix stored in Cosmos DB

### **Data Protection**
- **Encryption at Rest:** Cosmos DB (default), Blob Storage (default)
- **Encryption in Transit:** TLS 1.2+ (enforced)
- **Secrets Management:** Azure Key Vault (no secrets in code/config)
- **Network Security:** Private endpoints (production only)

### **Monitoring & Auditing**
- **Application Insights:** Request tracing, performance metrics
- **Log Analytics:** Centralized logging
- **Azure Monitor:** Alerts and dashboards
- **Audit Logs:** All config changes logged to Cosmos DB

---

## 🎬 **Demo Scenarios for Stakeholders**

### **Scenario 1: Local Demo (No Azure Costs)**
```bash
npm run dev
# Open localhost:5173
# Show: Project Registry, Translations Admin, RBAC mock, Chat interface
# Point out: "Demo Mode" badge in UI
# Explain: "All data in browser localStorage, no cloud required"
```

### **Scenario 2: Azure Production Deploy**
```bash
npm run deploy:prod
# Open: https://eva-da-prod.azurestaticapps.net
# Show: Same UI, "Production Mode" badge
# Explain: "Same code, different backend. Data in Azure Cosmos DB"
```

### **Scenario 3: The Magic Switch**
```bash
# Show .env files side-by-side
code .env.development .env.production
# Explain: "One config change, zero code changes. Production-ready in a snap."
```

---

## 📚 **Next Documents to Create**

1. **Terraform Modules** (Week 3-4)
   - `infra/main.tf`
   - `infra/variables.tf`
   - `infra/outputs.tf`
   - Module structure

2. **EVA Config API OpenAPI Spec** (Week 2)
   - Similar to `apim-facade-openapi.yaml` but for config endpoints
   - Generate TypeScript client from spec

3. **Azure Cosmos DB Data Model** (Week 2)
   - Container schema
   - Partition key strategy
   - Indexing policy
   - Sample documents

4. **Deployment Runbook** (Week 11)
   - Step-by-step deployment instructions
   - Troubleshooting guide
   - Rollback procedures

---

## ❓ **Open Questions / Pending Information**

**Awaiting additional context from user:**
- [ ] Additional architecture details not yet shared
- [ ] Extensive parameter list mentioned earlier
- [ ] Specific team requirements/constraints
- [ ] Existing IA deployment details
- [ ] Azure subscription/tenant details

**Will update this document as more information is provided.**

---

**Status:** Draft - Awaiting Additional Information  
**Last Updated:** 2024-01-15  
**Next Review:** After user shares remaining context
