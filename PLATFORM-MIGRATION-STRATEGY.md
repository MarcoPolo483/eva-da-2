# EVA Platform Migration Strategy 🚀

## 🎯 **Executive Summary**

**Status:** AssistMe has gone live successfully, Jurisprudence POC completed with valuable learnings, EVA Chat needs migration (12,000 users at risk), and the organization is migrating to **Apigee API Gateway**.

**Goal:** Consolidate all AI assistant capabilities into a unified **EVA Platform** that serves multiple domains (OAS, CPP-D, EI, Immigration) through a single, scalable architecture.

---

## 📊 **Current State Analysis**

### **✅ AssistMe (Production - Needs New Home)**
- **Status:** Live in production serving OAS domain
- **Users:** Active government employees
- **Challenge:** Current hosting needs replacement
- **Value:** Proven production-ready AI assistant for government services

### **🔬 Jurisprudence POC (Completed - Rich Learnings)**
- **Status:** POC completed with extensive feature catalog
- **Domains:** Legal research (SCC, FCA, FC, SST court hierarchies)
- **Value:** 40+ features designed and documented (see feature list)
- **Challenge:** Needs production deployment architecture

### **⚠️ EVA Chat (Critical - 12K Users at Risk)**
- **Status:** 12,000 users, 1M+ prompts, OpenWebUI licensing crisis
- **Timeline:** 4-6 weeks to migrate before licensing costs escalate
- **Opportunity:** Existing "Work Only / Generative" toggle in EVA DA

### **🔄 Infrastructure Migration (Apigee)**
- **Current:** Various API management approaches
- **Target:** Centralized Apigee API Gateway
- **Benefit:** Enterprise-grade API management, rate limiting, analytics

---

## 🏗️ **Unified EVA Platform Architecture**

### **Core Platform Components**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  APIGEE API GATEWAY (Enterprise API Management)                         │
│  ┌─────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │ API Products & Plans    │  │ Developer Portal & Documentation       │ │
│  │ - EVA Chat API          │  │ - OpenAPI Specs                        │ │
│  │ - AssistMe OAS API      │  │ - SDK Generation                       │ │
│  │ - Jurisprudence API     │  │ - Interactive Testing                  │ │
│  │ - Document Ingestion    │  │ - Rate Limiting Policies              │ │
│  └─────────────────────────┘  └────────────────────────────────────────┘ │
│                                                                         │
│  Rate Limiting | Security | Analytics | Monetization | Caching         │
└─────────────────┬───────────────────────────────────┬─────────────────────┘
                  │                                   │
                  ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  EVA DOMAIN ASSISTANT 2.0 (Frontend - React SPA)                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Unified Chat Interface                                          │  │
│  │                                                                  │  │
│  │  🎛️ Domain Selector: [AssistMe OAS ▼] [Jurisprudence ▼]        │  │
│  │  🔄 Mode Toggle: 🔵 Work Only ⚪ Generative                    │  │
│  │                                                                  │  │
│  │  📋 Domain-Specific Features (Based on Selection):             │  │
│  │  ┌─────────────────┬──────────────────────────────────────────┐ │  │
│  │  │ AssistMe OAS    │ Jurisprudence Legal Research             │ │  │
│  │  │ - EI eligibility│ - Court hierarchy (SCC, FCA, FC, SST)    │ │  │
│  │  │ - OAS criteria  │ - Case law search & citations            │ │  │
│  │  │ - Passport info │ - Legal document analysis                │ │  │
│  │  │ - Bilingual     │ - Multi-language legal docs              │ │  │
│  │  └─────────────────┴──────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │  💬 EVA Chat Integration:                                       │  │
│  │  - Conversation history (migrated from OpenWebUI)               │  │
│  │  - Terms of Use modal (Protected B compliance)                  │  │
│  │  - 12,000 users + 1M+ conversation migration                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┬─────────────────────┘
                  │                                   │
                  ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND MICROSERVICES (Azure Functions + Container Apps)               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Domain-Specific APIs                                            │  │
│  │                                                                  │  │
│  │  🏛️ AssistMe Service         🏛️ Jurisprudence Service          │  │
│  │  /api/assistme/*            /api/jurisprudence/*               │  │
│  │  - OAS eligibility logic    - Legal document RAG               │  │
│  │  - EI calculations          - Court hierarchy filtering        │  │
│  │  - Passport workflows       - Case law vectorization           │  │
│  │  - Bilingual responses      - Citation grounding               │  │
│  │                                                                  │  │
│  │  💬 EVA Chat Service         📄 Document Ingestion Service     │  │
│  │  /api/chat/*                /api/ingest/*                     │  │
│  │  - Conversation management   - PDF → Text extraction           │  │
│  │  - History persistence       - Metadata classification         │  │
│  │  - Terms of Use tracking     - Vector index management         │  │
│  │  - User session management   - Delta ingestion workflows       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┬─────────────────────┘
                  │                                   │
                  ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  DATA & AI LAYER (Azure Services)                                      │
│  ┌──────────────────────┬──────────────────────┬────────────────────┐  │
│  │ Azure Cosmos DB      │ Azure AI Search      │ Azure OpenAI       │  │
│  │                      │                      │                    │  │
│  │ Container: assistme  │ Index: assistme-oas  │ GPT-4 Turbo        │  │
│  │ - User profiles      │ - OAS policies       │ GPT-4o (latest)    │  │
│  │ - Chat history       │ - EI regulations     │ text-embedding-3   │  │
│  │ - Feedback data      │ - Passport rules     │ gpt-4-vision       │  │
│  │                      │                      │                    │  │
│  │ Container: juris     │ Index: juris-legal   │ Content Filtering  │  │
│  │ - Legal cases        │ - Court decisions    │ - PII detection    │  │
│  │ - Case metadata      │ - Legal precedents   │ - Harmful content  │  │
│  │ - Citation tracking  │ - Bilingual corpus   │ - Bias detection   │  │
│  │                      │                      │                    │  │
│  │ Container: evachat   │ Index: evachat-gen   │ Model Refresh      │  │
│  │ - Conversations      │ - General knowledge  │ - Automated updates│  │
│  │ - Terms acceptance   │ - FAQ responses      │ - A/B testing      │  │
│  │ - Usage analytics    │ - Support articles   │ - Performance mon. │  │
│  └──────────────────────┴──────────────────────┴────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 **Migration Phases & Timeline**

### **Phase 1: Foundation & EVA Chat Migration (Weeks 1-6) 🚨 CRITICAL**

#### **Week 1-2: Infrastructure Setup**
- ✅ Set up Apigee API Gateway environment
- ✅ Configure Azure Functions for EVA Chat APIs
- ✅ Set up Cosmos DB containers for conversation history
- ✅ Configure Azure AI Search indexes

#### **Week 3-4: EVA Chat Backend Migration**
- ✅ Implement conversation management APIs
- ✅ Create Terms of Use tracking system
- ✅ Set up user authentication integration
- ✅ Build conversation history endpoints

#### **Week 5-6: EVA Chat Frontend Integration & Data Migration**
- ✅ Integrate conversation history UI into EVA DA 2.0
- ✅ Migrate 1M+ conversations from OpenWebUI
- ✅ Deploy Terms of Use modal
- ✅ User acceptance testing with subset of 12K users

**Success Criteria:**
- ✅ 12,000 users successfully migrated
- ✅ Zero data loss during conversation migration
- ✅ Terms of Use compliance maintained
- ✅ Performance equal or better than OpenWebUI

---

### **Phase 2: AssistMe Production Migration (Weeks 7-10)**

#### **Week 7-8: AssistMe API Integration**
- ✅ Migrate AssistMe APIs to Apigee-managed endpoints
- ✅ Implement OAS-specific features from production system
- ✅ Set up data ingestion pipelines for OAS content
- ✅ Configure bilingual support (EN/FR)

#### **Week 9-10: AssistMe Frontend Integration & Testing**
- ✅ Integrate AssistMe functionality into EVA DA 2.0
- ✅ Domain selector for "AssistMe OAS" mode
- ✅ Production deployment with staged rollout
- ✅ Performance and load testing

**Success Criteria:**
- ✅ AssistMe users successfully transitioned to new platform
- ✅ All production functionality maintained
- ✅ Improved performance and scalability
- ✅ Seamless integration with EVA Chat features

---

### **Phase 3: Jurisprudence Production Deployment (Weeks 11-16)**

#### **Week 11-12: Legal Content Ingestion**
Using the **40+ features** identified in the POC:

```typescript
// Jurisprudence Feature Implementation Priority

// Core Legal Research (Week 11)
interface JurisprudenceFeatures {
  // Data Ingestion & Processing
  dataScrappping: {
    sources: ['SCC', 'FCA', 'FC', 'SST'];
    metadata: 'court level, decision type, EI flag';
    formats: 'PDF → Text with classification';
    languages: 'EN/FR detection and processing';
  };
  
  // Search & Filtering (Week 12)
  webFilters: {
    courtHierarchy: 'SCC, FCA, FC, SST dropdown';
    dateRanges: 'Custom date picker';
    caseCategories: 'EI vs CPP vs Immigration';
    language: 'EN/FR toggle';
    approvalStatus: 'Denial vs Approval checkbox';
  };
  
  // Advanced Features (Week 13-14)
  enhancement: {
    hierarchyBrowsing: 'Court tree navigation';
    caseNumbers: 'Display in search results';
    citationGrounding: 'Response + legal citations';
    bilingualPrompts: 'Context injection for EN/FR';
  };
  
  // AI & ML Features (Week 15-16)
  aiFeatures: {
    topicFiltering: 'EI vs CPP vs Immigration auto-classification';
    piiFilter: 'Block sensitive legal identifiers';
    languageDetection: 'Auto-surface correct EN/FR';
    promptEnhancements: 'Legal context injection + bilingual chaining';
  };
}
```

#### **Week 13-14: Advanced Legal Features**
- ✅ Court hierarchy browsing (tree/dropdown navigation)
- ✅ Case number display in search results
- ✅ Citation grounding for legal responses
- ✅ Bilingual prompt chaining for legal contexts

#### **Week 15-16: AI Enhancement & Production Launch**
- ✅ Topic relevance filtering (EI vs CPP vs Immigration)
- ✅ PII filtering for sensitive legal data
- ✅ Language detection for automatic EN/FR surfacing
- ✅ Production deployment with legal community beta testing

**Success Criteria:**
- ✅ All 40+ POC features implemented and tested
- ✅ Legal professional user acceptance
- ✅ Bilingual legal document processing working
- ✅ Court hierarchy navigation functional

---

### **Phase 4: Platform Optimization & Scaling (Weeks 17-20)**

#### **Advanced Features Implementation**
- ✅ **Model Refresh Automation:** OpenAI model updates without re-architecture
- ✅ **Delta Ingestion:** Smart document updates (new vs addendum detection)
- ✅ **Feedback Management:** Thumbs up/down + qualitative feedback
- ✅ **History Management:** Advanced per-user chat logs with search
- ✅ **Accessibility:** Screen reader support, keyboard navigation

#### **Enterprise Features**
- ✅ **Advanced Analytics:** User behavior, query patterns, cost attribution
- ✅ **Multi-Tenancy:** Department-level isolation and customization
- ✅ **API Monetization:** Usage-based billing through Apigee
- ✅ **Developer Portal:** Documentation, SDKs, interactive testing

---

## 🎯 **Key Implementation Decisions**

### **1. Apigee API Gateway Strategy**
```yaml
# Apigee API Products Configuration
apiProducts:
  - name: "EVA-Chat-API"
    description: "Conversational AI for all government employees"
    paths: ["/api/chat/*", "/api/conversations/*"]
    rateLimits:
      - quota: 1000 requests/hour/user
      - spike: 10 requests/second/user
    
  - name: "AssistMe-OAS-API" 
    description: "Old Age Security and Employment Insurance assistance"
    paths: ["/api/assistme/*", "/api/oas/*"]
    rateLimits:
      - quota: 500 requests/hour/user
      - spike: 5 requests/second/user
    
  - name: "Jurisprudence-API"
    description: "Legal research and case law analysis"
    paths: ["/api/jurisprudence/*", "/api/legal/*"]
    rateLimits:
      - quota: 200 requests/hour/user (legal research is resource-intensive)
      - spike: 2 requests/second/user
```

### **2. Azure Cosmos DB Data Modeling**
Following **Azure Cosmos DB best practices** for AI/Chat applications:

```typescript
// Optimized for AI/Chat use cases with hierarchical partition keys
interface CosmosDataModel {
  // Container: eva-platform (HPK: /tenantId/userId)
  conversations: {
    partitionKey: "/tenantId/userId";  // High cardinality, even distribution
    data: {
      id: "conv-uuid",
      tenantId: "esdc", // or "ircc", "cra" for multi-tenancy
      userId: "hashed-user-id",
      domain: "assistme" | "jurisprudence" | "evachat",
      messages: [...], // Embedded for atomic operations
      metadata: {...}
    };
  };
  
  // Container: legal-corpus (HPK: /courtLevel/language)
  legalDocuments: {
    partitionKey: "/courtLevel/language";
    data: {
      id: "case-scc-2024-001",
      courtLevel: "SCC" | "FCA" | "FC" | "SST",
      language: "EN" | "FR",
      caseType: "EI" | "CPP" | "Immigration",
      content: "...", // Full case text
      vectors: [...] // Embedded vector embeddings
    };
  };
}
```

### **3. Cost Attribution & Monitoring**
```typescript
// Comprehensive cost tracking for government accountability
interface CostAttribution {
  headers: {
    "x-tenant-id": "esdc",
    "x-department": "oas-benefits", 
    "x-user-id": "hashed-user",
    "x-domain": "assistme",
    "x-session-id": "session-uuid"
  };
  
  costs: {
    openAI: {
      model: "gpt-4-turbo",
      promptTokens: 1250,
      completionTokens: 340,
      cost: 0.045 // USD
    };
    azureAISearch: {
      queries: 3,
      cost: 0.012 // USD  
    };
    cosmosDB: {
      requestUnits: 125,
      cost: 0.008 // USD
    };
    total: 0.065 // USD per interaction
  };
}
```

---

## 📊 **Success Metrics & KPIs**

### **Migration Success Metrics**
- ✅ **EVA Chat:** 12,000 users migrated with <1% churn
- ✅ **AssistMe:** 100% production functionality maintained
- ✅ **Jurisprudence:** All 40+ POC features deployed
- ✅ **Performance:** <2s response time for 95% of queries

### **Business Value Metrics**
- 💰 **Cost Savings:** Eliminated OpenWebUI licensing costs
- 📈 **Efficiency:** Single platform vs 3 separate systems
- 🎯 **User Satisfaction:** >4.5/5.0 user rating
- 🔄 **API Usage:** Government-wide adoption through Apigee

### **Technical Excellence Metrics**
- 🚀 **Availability:** 99.9% uptime SLA
- 🔒 **Security:** Protected B compliance maintained
- 📊 **Scalability:** Support for 50K+ concurrent users
- 🔄 **Agility:** New domain addition in <2 weeks

---

## 🚀 **Next Steps & Immediate Actions**

### **Week 1 Immediate Actions:**
1. **🚨 EVA Chat Crisis Response:**
   - Finalize OpenWebUI contract negotiations
   - Accelerate backend API development
   - Parallel frontend integration work

2. **🏗️ Infrastructure Foundation:**
   - Provision Apigee API Gateway environment
   - Set up Azure Functions and Cosmos DB
   - Configure CI/CD pipelines

3. **👥 Team Mobilization:**
   - Assign dedicated developers to each migration stream
   - Set up daily standups for critical path tracking
   - Establish stakeholder communication plan

### **Risk Mitigation:**
- **🔄 Parallel Migration:** Run old and new systems simultaneously during transition
- **📊 Phased Rollout:** Start with 10% of users, gradually increase
- **🔙 Rollback Plan:** Maintain ability to revert within 24 hours
- **📞 24/7 Support:** Dedicated support team during migration periods

---

## 💬 **Questions for Immediate Clarification:**

1. **EVA Chat Timeline:** Do we have confirmed end date for OpenWebUI licensing grace period?
2. **AssistMe Hosting:** What is the timeline for current hosting replacement?
3. **Jurisprudence Scope:** Should we implement all 40+ features or prioritize subset?
4. **Apigee Timeline:** What is the organization's target timeline for Apigee migration?
5. **Resource Allocation:** How many developers can be dedicated to this migration effort?

---

**This unified platform approach will provide a single, scalable solution that serves all government AI assistant needs while leveraging enterprise-grade API management through Apigee and Azure's AI/ML capabilities.**