# EVA Platform - Complete Picture Summary

**Date:** 2024-01-15  
**Status:** Comprehensive Vision Documented  
**Purpose:** Integration of EVA Chat (12K users) + EVA DA 2.0 + EVA Foundation 2.0

---

## 📋 **What We've Captured**

### **1. Documents Created/Updated:**

| Document | Purpose | Location |
|----------|---------|----------|
| `ARCHITECTURE.md` | Complete technical architecture, dual-mode pattern, EVA Platform manifesto | `/ARCHITECTURE.md` |
| `BACKLOG.md` | EVA Chat migration (critical priority), config management, RBAC, phases | `/BACKLOG.md` |
| `SNAPSHOT.md` | Pre-RBAC baseline state | `/SNAPSHOT.md` |
| `eva-config-api.yaml` | OpenAPI spec for EVA Config/Platform API | `/integration/eva/` |
| `THIS_SUMMARY.md` | You are here! | `/EVA-PLATFORM-SUMMARY.md` |

---

## 🎯 **The Three EVA Products (Revised)**

### **1. EVA Chat → EVA DA 2.0 "World Mode"**
- **Status:** 🚨 **CRITICAL MIGRATION** (OpenWebUI licensing issue)
- **Users:** 12,000 active users
- **Prompts:** 1,000,000 processed
- **Current Tech:** OpenWebUI (must replace)
- **Solution:** Integrate as "World Mode" toggle in EVA DA 2.0
- **Timeline:** 6-8 weeks
- **Features:** General GPT-4 chat, conversation history, Terms of Use enforcement

### **2. EVA Domain Assistant 2.0 (Frontend + Admin)**
- **Status:** 🟡 In Active Development
- **Purpose:** Unified interface for Work (RAG) + World (Chat)
- **Components:**
  - Chat interface with Work/World toggle
  - Project Registry (manage domain assistants)
  - Global App Admin (system config)
  - Translations Admin
  - RBAC Management
  - Feature Flags UI
- **Architecture:** Dual-mode (localStorage demo ↔ Azure Cosmos DB production)
- **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, i18next

### **3. EVA Foundation 2.0 (Backend Platform)**
- **Status:** 🔴 Planning Phase
- **Purpose:** "Faceless" AI utility platform
- **Exposes via APIM:**
  - RAG Services (`/rag/retrieve`, `/rag/answer`)
  - Document Intelligence (`/doc/summarize`, `/doc/compare`, `/doc/extract`)
  - Chat Services (`/chat/completion`, `/chat/stream`, `/chat/history`) **← NEW**
  - Ingestion & KM (`/ingest/preview`, `/ingest/commit`)
  - Guardrails (`/guardrails/redact`, `/guardrails/prompt`, `/guardrails/inspect`)
  - Config & Admin APIs (`/config/projects`, `/rbac/users`, `/featureflags`)
- **Cost Tagging:** All API calls include APIM headers (x-project, x-app, x-feature, x-environment, x-cost-center, x-user)
- **Consumers:** EVA DA, Jurisprudence, AssistMe, CURAM widgets, SharePoint web parts, Service Integrators, External Agents
- **Tech Stack:** Azure Functions (Python for IA, TypeScript for Config API), Azure OpenAI, Azure AI Search, Cosmos DB, Blob Storage

---

## 🏗️ **Architecture Highlights**

### **Dual-Mode Pattern (Repository + Strategy)**
```typescript
interface IConfigRepository {
  getProjects(), updateProject(), getTranslations(), ...
}

// Demo Mode
class LocalStorageRepository implements IConfigRepository { ... }

// Production Mode
class AzureCosmosRepository implements IConfigRepository { ... }

// Factory chooses based on .env
const repo = ConfigRepositoryFactory.create();
```

**Benefit:** Same code runs in demo and production. Switch via config flag.

---

### **Work/World Toggle UI**
```
┌──────────────────────────────────────────────────┐
│ Project: [Jurisprudence ▼]  Mode: 🔵 Work ⚪ World │
└──────────────────────────────────────────────────┘
```

- **Work Mode (🔵):** RAG over project corpus, citations, project-specific guardrails
- **World Mode (⚪):** General GPT-4 chat (EVA Chat replacement), conversation history, Terms of Use

---

### **APIM Cost Tagging (All API Calls)**
```http
x-project: jurisprudence
x-app: eva-da-web
x-feature: rag-answer
x-environment: prod
x-cost-center: JUR-9001
x-user: hashed-abc123
```

**Enables:** FinOps dashboards, usage analytics, chargeback/showback, rate limiting

---

### **Cosmos DB Containers**
```
Database: evaFoundation

Container: documents (PK: /userId)
  - Document metadata, upload status, chat history (work)

Container: chatHistory (PK: /userId) 🆕
  - EVA Chat conversations (world)
  - 1M+ prompts from OpenWebUI migration

Container: appConfiguration (PK: /configType)
  - Projects, translations, RBAC, feature flags

Container: usage (PK: /projectId) 🆕
  - APIM header logs for cost attribution
```

---

## 🚀 **Implementation Roadmap**

### **Q1 2024: EVA DA 2.0 - Frontend + EVA Chat Migration**

**Weeks 1-2:** Repository Abstraction + Work/World Toggle UI  
**Weeks 3-4:** Chat Completion API (Azure Functions)  
**Week 5:** OpenWebUI Data Migration (1M prompts → Cosmos DB)  
**Weeks 6-8:** Feature Parity + Terms of Use + User Communication  

**Deliverable:** Unified EVA DA 2.0 with Work/World modes, 12K users migrated

---

### **Q2 2024: EVA Foundation 2.0 - Azure Backend**

**Weeks 1-2:** Terraform IaC (Cosmos DB, Functions, OpenAI, AI Search, APIM, Key Vault, App Insights)  
**Weeks 3-4:** IA Backend Deployment (RAG engine)  
**Weeks 5-6:** EVA Config API Implementation (TypeScript Functions)  
**Weeks 7-8:** Integration & Testing (connect EVA DA 2.0 to real Azure backend)  

**Deliverable:** Working EVA Foundation 2.0 in Azure

---

### **Q3 2024: Production Readiness**

**Weeks 1-2:** Azure AD B2C Integration (real RBAC)  
**Weeks 3-4:** Load Testing + Security Audit  
**Weeks 5-6:** Documentation + Runbooks + Training  

**Deliverable:** Production deployment, handoff to operations

---

## 💰 **Estimated Azure Costs (Monthly)**

| Service | Tier | Cost Estimate |
|---------|------|---------------|
| Cosmos DB (Serverless) | Pay-per-use | $50-150 |
| Azure OpenAI (GPT-4, 20K TPM) | Consumption | $100-400 (usage-dependent) |
| Azure AI Search | Basic | $75 |
| Azure Functions | Consumption | $10-30 |
| Storage Account | Standard LRS | $5 |
| APIM | Consumption | $5-20 |
| Static Web Apps | Free | $0 |
| Key Vault | Standard | $1 |
| Application Insights | Pay-as-you-go | $10-30 |
| **Total** | | **$250-700/month** |

**Free Tier Opportunities (Dev):**
- Cosmos DB Serverless: 1000 RU/s free for 30 days
- Azure Functions: 1M free executions/month
- Static Web Apps: 100 GB bandwidth/month

---

## 🎯 **CRITICAL DISCOVERY: Work/Generative Toggle Already Exists!**

**From EVA Domain Assistant Screenshot Analysis:**

### **Current State (Screenshot Evidence):**
✅ **Toggle exists:** "Work Only" vs "Generative (Ungrounded)" in current EVA DA  
✅ **Project selector:** "AICoE Playground Project 1 Contributor" dropdown  
✅ **Professional branding:** ESDC logos, government styling  
✅ **OAS/EI suggestions:** Domain-specific prompts already implemented  
✅ **Classification warnings:** "Information Assistant uses AI. Check for mistakes. Transparency Note"  

### **EVA Chat Features to Migrate:**
✅ **Conversation history:** Organized by date (Today, Previous 30 days, September, August, July)  
✅ **Active users counter:** "219 active users" shown in EVA Chat  
✅ **Terms of Use modal:** Multi-checkbox acceptance with Protected B warnings  
✅ **Suggested prompts:** Mode-specific suggestions (Summarize, Draft email, Understand regulations)  
✅ **Settings menu:** Archived Chats, Sign Out functionality  

### **Key Architecture Insight:**
The **"Generative" mode already exists** in EVA DA - we just need to:
1. **Add conversation history** (left sidebar)
2. **Add Terms of Use** (first-time Generative mode access) 
3. **Add backend chat API** (Azure Functions for conversation persistence)
4. **Migrate OpenWebUI data** (1M+ conversations to Cosmos DB)

**TIMELINE REDUCTION:** From 6-8 weeks to **4-6 weeks** due to existing toggle infrastructure!

---

## 📸 **Screenshot-Based Requirements (Exact Specifications)**

### **EVA Chat Terms of Use (Implementation Ready)**
```typescript
interface TermsRequirements {
  checkboxes: {
    protectedBCompliance: "I have read and understand the Do's and Don'ts of using generative AI tools responsibly as well as the TBS policy and guide mentioned under Section 3 of the Terms of Use: Policies, Guidelines and Restrictions.";
    dataCollection: "I understand that EVA Chat collects, uses and stores personal information for security monitoring and compliance. EVA Chat may also generate outputs based on personal information.";
    termsAcceptance: "I agree to the EVA Chat Terms of Use, including all ethical guidelines and restrictions, and that I will respect the Protected B limitations of the information uploaded or provided to EVA.";
    courseRegistration: "I understand the importance of registering for the ESDC Virtual Assistant (EVA) and Microsoft Copilot Chat course.";
  };
  links: {
    fullTerms: "View Full Terms of Use";
    dosAndDonts: "Do's and Don'ts" → "https://esdc.gc.ca/eva/guidelines";
    tbsPolicy: "TBS policy and guide" → "https://tbs.gc.ca/ai-policy"; 
    course: "ESDC Virtual Assistant (EVA) and Microsoft Copilot Chat course" → "https://esdc.gc.ca/eva/training";
  };
}
```

### **Conversation History Organization (From EVA Chat)**
```typescript
interface ConversationOrganization {
  sections: {
    today: ConversationItem[];
    previous30Days: ConversationItem[];
    monthlyGroups: {
      [month: string]: ConversationItem[]; // "September", "August", "July"
    };
  };
  metadata: {
    activeUsers: number; // 219 shown in screenshot
    totalConversations: number;
  };
}
```

### **Mode-Specific Suggested Prompts**
```typescript
interface SuggestedPrompts {
  workMode: {
    jurisprudence: [
      "I have worked 275 hours, do I qualify for EI?",
      "I live in Quebec, I'm 67 years old and single. Do I qualify for OAS?", 
      "My daughter applied for a passport, can I pick up the passport for her?"
    ];
  };
  generativeMode: [
    "Summarize policy documents with AI",
    "Draft email reminding about project deadline", 
    "Understand regulations - give me tips"
  ];
}
```

---

## ✅ **Components Created (Implementation Ready)**

1. **`TermsOfUseModal.tsx`** - Exact replica of EVA Chat Terms of Use
2. **`useTermsOfUse.ts`** - Hook for terms acceptance state management
3. **`ChatModeIntegration.tsx`** - Enhanced Work/Generative toggle with terms checking

**Next Step:** Integrate these components into existing EVA DA chat interface.

---

## 🤖 **EVA & Agents - Two Patterns**

### **1. Agents Consuming EVA APIs**
External agents (Semantic Kernel, Autogen) call EVA as a utility:
```typescript
agent.addTool('searchCaseLaw', () => evaApi.rag.retrieve(...));
agent.addTool('summarizeCase', () => evaApi.doc.summarize(...));
```

### **2. EVA Implemented as Agents**
EVA itself orchestrates multi-step workflows internally:
```python
class CPPDReviewAgent:
    async def review_file(file_id):
        extracted = await self.extract_dates(file_id)
        policies = await self.search_policy(...)
        return { recommendation, reasoning, citations }
```

**Benefit:** EVA is both a platform for agents AND an agent platform.

---

## 🎓 **Key Concepts Explained**

### **EVA Platform Manifesto**
> "EVA isn't just a chat bot — it's a shared AI platform."

Through APIM, EVA exposes reusable AI services. Apps (EVA Chat, EVA DA, Jurisprudence, AssistMe) are different faces calling the same backend services.

### **Connectors vs Pipelines**
- **Connectors:** Where data comes from (SharePoint, file shares, databases)
- **Pipelines:** What we do with data (clean, chunk, embed, enrich, index)

### **Agent-Ready Definition**
An API is "agent-ready" when:
1. Stable OpenAPI contract
2. Machine-readable JSON I/O
3. RBAC via headers
4. Centralized guardrails & logging
5. Idempotent & composable
6. Cost tagging enforced
7. Documentation & examples

### **Search/RAG Roadmap**
- **Level 1:** Basic keyword + vector search (current)
- **Level 2:** Smart chunking + enrichment (in progress)
- **Level 3:** Multi-corpus + policy-aware (planned)
- **Level 4:** Agentic workflows + feedback loops (future)

---

## 📚 **Artifacts Created**

### **OpenAPI Specs**
- ✅ `/integration/ia/apim-facade-openapi.yaml` - Information Assistant facade (existing)
- ✅ `/integration/eva/eva-config-api.yaml` - EVA Config/Platform API (NEW)

**Next:** Generate TypeScript clients from OpenAPI specs

---

### **IaC (Infrastructure as Code) - Pending**
- 🔲 Terraform modules for EVA Foundation 2.0
  - Cosmos DB (serverless, vector search)
  - Azure Functions (IA backend + Config API)
  - Azure OpenAI (GPT-4 + embeddings)
  - Azure AI Search (Basic tier)
  - Storage Account + Blob containers
  - APIM (Consumption tier)
  - Key Vault
  - Application Insights + Log Analytics
  - Static Web Apps

**Team Standard:** Terraform (not Bicep)

---

### **Data Models Documented**
- ✅ Cosmos DB schema (4 containers)
- ✅ APIM header requirements
- ✅ Project configuration structure
- ✅ RBAC user model
- ✅ Feature flag structure
- ✅ Chat conversation history

---

## 🎯 **Decision Points Captured**

1. ✅ **Dual-Mode Architecture** - localStorage (demo) ↔ Azure (production)
2. ✅ **Work/World Toggle** - Unified UI for RAG + Chat
3. ✅ **EVA Chat Migration** - Critical priority, 6-8 week timeline
4. ✅ **Terraform for IaC** - Team standard
5. ✅ **Cost Tagging via APIM** - All API calls include x-project, x-app, x-feature headers
6. ✅ **Agent-Ready APIs** - OpenAPI contracts, machine-readable, RBAC-enforced
7. ✅ **Cosmos DB Serverless** - Cost-optimized for variable workloads

---

## ❓ **Open Questions / Next Steps**

### **Immediate Actions Needed:**

1. **Validate OpenWebUI Data Export**
   - What format is the data in? (SQLite, PostgreSQL, JSON?)
   - Schema analysis for migration script

2. **EVA Chat Terms of Use Content**
   - Need final approved text
   - Who approves updates?

3. **Azure Subscription Details**
   - Subscription ID
   - Resource naming conventions
   - Region preference (Canada Central vs Canada East)

4. **User Communication Plan**
   - Who owns comms to 12K EVA Chat users?
   - Approval process for migration announcement?

5. **RBAC Roles Definition**
   - Finalize user role matrix (user, projectAdmin, systemAdmin)
   - Map to Azure AD groups

6. **Extensive Parameter List**
   - You mentioned you have a list of parameters to expose
   - Need to categorize and prioritize

---

## 🚀 **Proposed Next Actions (Your Choice)**

### **Option A: Start EVA Chat Migration (High Priority)**
1. Create Work/World toggle UI
2. Implement Chat Completion API (Azure Functions)
3. Test with small user group (beta)
4. Plan OpenWebUI data migration

**Timeline:** 2-3 weeks for MVP

---

### **Option B: Create Terraform IaC (Foundation First)**
1. Create Terraform modules for EVA Foundation
2. Deploy to your Azure subscription (dev environment)
3. Validate infrastructure works
4. Then build on top of it

**Timeline:** 2-3 weeks for infrastructure

---

### **Option C: Complete Demo Mode First (Show Peers)**
1. Finish repository abstraction layer
2. Add Translations Admin UI
3. Add RBAC mock + filtering
4. Demo to stakeholders
5. Then tackle Azure migration

**Timeline:** 1-2 weeks for polished demo

---

### **Option D: Document Everything First**
1. You share extensive parameter list
2. I categorize and organize
3. Design data models
4. Create implementation plan
5. Then execute

**Timeline:** 1 week for documentation

---

## 💬 **What You Told Me (Context Preserved)**

- **EVA Chat:** OpenWebUI licensing issue, need to migrate 12K users
- **EVA DA 2.0:** Current focus, project-aware RAG interface
- **EVA Foundation 2.0:** Next phase, platform backend
- **Information Assistant:** Already have OpenAPI spec, will fork and customize
- **Terraform:** Team standard (not Bicep)
- **Azure Account:** You have one ready
- **Team Preferences:** "Very picky" about Terraform, modern, agile, fast
- **Demo vs Production:** Want to show peers demo but have production-ready architecture underneath
- **Cost Consciousness:** Want to optimize Azure costs from day 1
- **Platform Vision:** EVA as reusable AI utility, not just a UI
- **Agents:** Two-fold pattern (agents using EVA + EVA as agent)
- **Cost Attribution:** APIM headers for FinOps dashboards
- **Connectors vs Pipelines:** Clear separation of concerns
- **Search Evolution:** 4-level roadmap (current at Level 1-2)

---

## ✅ **Status: Ready to Proceed**

**All major architecture decisions documented.**  
**OpenAPI specs created.**  
**Backlog prioritized.**  
**Next steps clearly defined.**

**Awaiting your decision on which path to start: A, B, C, or D?**

Or share the "additional info" you mentioned! 😊

---

**End of Summary**
