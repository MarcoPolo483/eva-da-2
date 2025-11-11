# EVA DA 2.0 - Development Backlog

## ✅ Critical Fixes Completed

### Global App Admin Separation
**Status:** ✅ Complete  
**Priority:** Critical  
**Date:** 2024-01-15

**Problem:** System-level configuration (Project Registry/admin) was editable alongside regular projects, creating security and governance risks.

**Solution Implemented:**
- ✅ Created dedicated **Global App Admin** view (`globalAdmin` project)
- ✅ Hidden admin project from Project Registry dropdown (clients can't edit it)
- ✅ Added Edit/Save/Cancel workflow for system configuration
- ✅ Separated concerns:
  - **Project Registry**: Manage client-facing projects (Canada Life, Jurisprudence, AssistMe)
  - **Global App Admin**: Manage system-level settings (admin project config, themes, APIM)
- ✅ Protected admin configuration from accidental deletion or modification

**Benefits:**
- Clear separation between project management and system administration
- Prevents users from breaking the admin interface
- Provides controlled edit workflow with explicit save/cancel
- Extensible for future global settings (auth, feature flags, monitoring)

**Future Sections for Global App Admin:**
- Authentication & Authorization settings
- Feature Flags
- Monitoring & Telemetry configuration
- Rate Limiting policies
- Backup & Recovery settings
- Multi-tenancy configuration

---

### System Project Protection
**Status:** ✅ Complete  
**Priority:** Critical  
**Date:** 2024-01-15

**Problem:** Admin/Project Registry could be deleted, breaking the app entirely.

**Solution Implemented:**
- ✅ `loadRegistry()` automatically restores admin project if missing
- ✅ `saveRegistry()` blocks operations that would remove admin project
- ✅ Delete button shows alert and prevents admin deletion
- ✅ Admin project is now a protected system resource

**Lessons Learned:**
- System/admin configuration should never be deletable
- All critical app parameters need similar protection
- Future admin features (settings, configs) must be protected

---

## 🎯 Priority Tasks

### Task 1: Application Configuration Management System ⭐ HIGH PRIORITY
**Status:** Not Started  
**Priority:** High  
**Description:** Expose and manage all application-level configuration through UI instead of hardcoded files.

#### **Problem Statement:**
- Translations (en.json, fr.json) are hardcoded files - not maintainable via UI
- Accessibility labels scattered across components
- Error messages hardcoded in code
- RBAC rules need to be configured dynamically
- No centralized configuration for non-project-specific settings

#### **Solution: Global App Admin - Multi-Section Interface**

##### **Section 1: Translations & Literals** 🌐
**Goal:** Manage all UI text without code changes

**Features:**
- ✅ JSON editor for en.json / fr.json
- ✅ Key-value table view (searchable, filterable)
- ✅ Add/Edit/Delete translation keys
- ✅ Validation: Ensure all keys exist in both languages
- ✅ Export/Import JSON files
- ✅ Missing translation warnings
- ✅ Bulk operations (copy EN → FR, find untranslated)

**Data Structure (Cosmos DB):**
```typescript
{
  id: "translations-en",
  configType: "translations",
  language: "en",
  data: {
    "appTitle": "EVA Domain Assistant",
    "skipToMain": "Skip to main content",
    "project.canadaLife": "Canada Life",
    // ... all translation keys
  },
  lastModified: "2024-01-15T10:30:00Z",
  modifiedBy: "admin@example.com"
}
```

**UI Mock:**
```
┌─────────────────────────────────────────────────────┐
│ Translations & Literals Management                  │
├─────────────────────────────────────────────────────┤
│ [Search: ______] [Language: EN ▼] [Add Key]        │
├────────┬──────────────────┬───────────────────┬─────┤
│ Key    │ English          │ Français          │ Actions│
├────────┼──────────────────┼───────────────────┼─────┤
│ appTitle│ EVA Domain...   │ Assistant EVA...  │ ✏️ 🗑️│
│ skipToMain│ Skip to main  │ Aller au contenu  │ ✏️ 🗑️│
│ ⚠️ project.new│ New Project │ [MISSING]      │ ✏️ 🗑️│
└────────┴──────────────────┴───────────────────┴─────┘
[Export JSON] [Import JSON] [Validate All] [Save]
```

**Implementation Tasks:**
- 🔲 Create `TranslationsAdmin.tsx` component
- 🔲 Add CRUD operations for translation keys
- 🔲 Add validation logic (missing keys, empty values)
- 🔲 Add export/import with versioning
- 🔲 Integrate with i18n at runtime (hot reload)
- 🔲 Add search/filter functionality
- 🔲 Add bulk operations UI

---

##### **Section 2: RBAC & User Management** 👥
**Goal:** Manage users, roles, and permissions dynamically

**Roles (EVA DA Current Standard):**
```typescript
// Project-Level Roles
type ProjectRole = 'admin' | 'contributor' | 'reader';

// Global Roles
type GlobalRole = 'user' | 'projectAdmin' | 'systemAdmin' | 'aicoeAdmin';

interface User {
  id: string;
  email: string;
  displayName: string;
  globalRole: GlobalRole;
  projectAccess: {
    projectId: ProjectId;
    role: ProjectRole;
  }[];
  azureAdGroups?: string[];  // For real Azure AD integration
}
```

**Permission Matrix:**
| Action | Reader | Contributor | Admin | Project Admin | System Admin |
|--------|--------|-------------|-------|---------------|--------------|
| View project | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat with assistant | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit project config | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delete project | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Project Registry | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create new projects | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Global App Admin | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage translations | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage RBAC | ❌ | ❌ | ❌ | ❌ | ✅ |

**Data Structure (Cosmos DB):**
```typescript
{
  id: "user@example.com",
  configType: "rbac",
  email: "user@example.com",
  displayName: "John Doe",
  globalRole: "projectAdmin",
  projectAccess: [
    { projectId: "canadaLife", role: "admin" },
    { projectId: "jurisprudence", role: "contributor" }
  ],
  createdAt: "2024-01-10T09:00:00Z",
  lastLogin: "2024-01-15T14:22:00Z"
}
```

**Mock Azure AD Integration:**
```typescript
// Mock service that simulates Azure AD
class MockAzureAD {
  // Simulates Azure AD Graph API call
  async getUsers(): Promise<User[]> {
    // Returns mock users from localStorage or Cosmos DB
    return [
      {
        id: 'user1@example.com',
        email: 'user1@example.com',
        displayName: 'Jane Smith',
        globalRole: 'user',
        projectAccess: [
          { projectId: 'canadaLife', role: 'reader' }
        ]
      },
      // ...more users
    ];
  }
  
  // Simulates Azure AD group membership check
  async getUserGroups(userId: string): Promise<string[]> {
    return ['EVA-Users', 'EVA-CanadaLife-Readers'];
  }
  
  // Simulates role assignment via Azure AD
  async assignRole(userId: string, role: GlobalRole): Promise<boolean> {
    // In real Azure: Add user to AD group
    // In mock: Update localStorage/Cosmos DB
    return true;
  }
}
```

**UI Mock:**
```
┌─────────────────────────────────────────────────────┐
│ RBAC & User Management                              │
├─────────────────────────────────────────────────────┤
│ [Search: ______] [Role Filter: All ▼] [Add User]   │
├──────────────┬───────────┬──────────────┬──────┬────┤
│ User         │ Global    │ Project      │ Last │ Act│
│              │ Role      │ Access       │ Login│ ion│
├──────────────┼───────────┼──────────────┼──────┼────┤
│ jane@ex.com  │ User      │ 🔹 CL:Reader │ Today│ ✏️ │
│ john@ex.com  │ Proj.Admin│ 🔸 All       │ 2h ago│✏️ │
│ admin@ex.com │ Sys.Admin │ 🔴 All+Admin │ 1h ago│✏️ │
└──────────────┴───────────┴──────────────┴──────┴────┘

┌─────────────────────────────────────────────────────┐
│ Edit User: jane@example.com                         │
├─────────────────────────────────────────────────────┤
│ Display Name: [Jane Smith________________]          │
│ Global Role:  [User ▼]                              │
│                                                      │
│ Project Access:                                     │
│ ┌─────────────────┬─────────┬────────┐            │
│ │ Project         │ Role    │ Remove │            │
│ ├─────────────────┼─────────┼────────┤            │
│ │ Canada Life     │ Reader▼ │   🗑️   │            │
│ │ Jurisprudence   │ Contrib▼│   🗑️   │            │
│ └─────────────────┴─────────┴────────┘            │
│ [+ Add Project Access]                              │
│                                                      │
│ [Save] [Cancel]                                     │
└─────────────────────────────────────────────────────┘
```

**Implementation Tasks:**
- 🔲 Create `MockAzureAD` service
- 🔲 Create `RBACAdmin.tsx` component
- 🔲 Add user management CRUD
- 🔲 Add role assignment UI
- 🔲 Add project access matrix editor
- 🔲 Create `UserRoleContext` for app-wide role checks
- 🔲 Add permission guards to routes/components
- 🔲 Add "Impersonate User" for testing (admin only)
- 🔲 Document Azure AD integration path

---

##### **Section 3: Feature Flags** 🚀
**Goal:** Enable/disable features without deployment

**Data Structure:**
```typescript
{
  id: "feature-multitenancy",
  configType: "featureFlag",
  key: "enableMultitenancy",
  enabled: false,
  description: "Enable multi-tenant isolation",
  targetAudience: "all", // or "beta", "internal", "specific-users"
  rolloutPercentage: 0,  // 0-100 for gradual rollout
  lastModified: "2024-01-15T10:30:00Z"
}
```

**UI Mock:**
```
┌─────────────────────────────────────────────────────┐
│ Feature Flags                                       │
├─────────────────────────────────────────────────────┤
│ [Search: ______] [Status: All ▼]                    │
├──────────────────────┬────────┬──────────┬──────────┤
│ Feature              │ Status │ Rollout  │ Actions  │
├──────────────────────┼────────┼──────────┼──────────┤
│ 🔴 enableMultitenancy│ OFF    │ 0%       │ ✏️ 🔄    │
│ 🟢 enableChat        │ ON     │ 100%     │ ✏️ 🔄    │
│ 🟡 enableVectorSearch│ BETA   │ 25%      │ ✏️ 🔄    │
└──────────────────────┴────────┴──────────┴──────────┘
```

**Implementation Tasks:**
- 🔲 Create `FeatureFlagsAdmin.tsx` component
- 🔲 Add feature flag service
- 🔲 Add `useFeatureFlag()` hook for components
- 🔲 Add gradual rollout logic
- 🔲 Add audience targeting

---

##### **Section 4: Advanced Settings** 🔧
**Goal:** Expose system-level configuration knobs

**Categories:**
- Logging levels (debug, info, warn, error)
- Performance tuning (cache TTL, request timeouts)
- Integration settings (external APIs, webhooks)
- Monitoring & alerting thresholds
- Data retention policies

---

#### **Azure Deployment Architecture**

```
┌─────────────────────────────────────────────────────┐
│  EVA DA Frontend (React SPA)                        │
│  - Hosted on Azure Static Web Apps                  │
│  - CDN for global distribution                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Azure API Management (APIM)                        │
│  - Rate limiting, caching, routing                  │
│  - Subscription key management                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Azure Functions / Container Apps                   │
│  - Configuration API (/api/config/*)                │
│  - RAG Answer API (/api/rag/answer)                 │
│  - RBAC Management API (/api/rbac/*)                │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴─────────────────┐
        │                           │
        ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│ Azure Cosmos DB  │      │ Azure AD B2C     │
│ - Projects       │      │ - Users          │
│ - Translations   │      │ - Groups         │
│ - RBAC           │      │ - Roles          │
│ - Feature Flags  │      │ - JWT Tokens     │
│ - Config         │      └──────────────────┘
└──────────────────┘
        │
        ▼
┌──────────────────┐
│ Azure Blob       │
│ - Exports        │
│ - Backups        │
│ - Audit Logs     │
└──────────────────┘
```

**Cosmos DB Containers:**
```typescript
// Container: appConfiguration
// Partition Key: /configType

// Project documents (existing)
{ configType: 'project', id: 'canadaLife', ... }

// Translation documents
{ 
  configType: 'translations', 
  id: 'en', 
  language: 'en',
  data: { ...all en.json keys... }
}

// RBAC documents
{
  configType: 'rbac',
  id: 'user@example.com',
  email: 'user@example.com',
  globalRole: 'projectAdmin',
  projectAccess: [...],
}

// Feature flag documents
{
  configType: 'featureFlag',
  id: 'feature-multitenancy',
  key: 'enableMultitenancy',
  enabled: false,
  ...
}

// System config documents
{
  configType: 'systemConfig',
  id: 'logging',
  level: 'info',
  ...
}
```

**Query Patterns:**
```sql
-- Get all translations for a language
SELECT * FROM c 
WHERE c.configType = 'translations' 
AND c.language = 'en'

-- Get user's RBAC
SELECT * FROM c 
WHERE c.configType = 'rbac' 
AND c.id = 'user@example.com'

-- Get all enabled feature flags
SELECT * FROM c 
WHERE c.configType = 'featureFlag' 
AND c.enabled = true

-- Get all projects
SELECT * FROM c 
WHERE c.configType = 'project'
```

---

#### **Implementation Phases**

##### **Phase 1: Translations Management** (1-2 weeks)
- ✅ Create UI for managing translations
- ✅ JSON export/import
- ✅ Validation logic
- ✅ Hot reload i18n without page refresh

##### **Phase 2: RBAC Foundation** (2-3 weeks)
- ✅ Create mock Azure AD service
- ✅ User management UI
- ✅ Role assignment
- ✅ `UserRoleContext` and permission guards
- ✅ Filter dropdown based on role
- ✅ Route protection

##### **Phase 3: Feature Flags** (1 week)
- ✅ Feature flag service
- ✅ Admin UI
- ✅ `useFeatureFlag()` hook
- ✅ Gradual rollout logic

##### **Phase 4: Azure Integration** (3-4 weeks)
- ✅ Migrate localStorage → Cosmos DB
- ✅ Create Azure Functions APIs
- ✅ Integrate Azure AD B2C
- ✅ Deploy to Azure Static Web Apps
- ✅ Configure APIM
- ✅ Set up CI/CD pipeline

##### **Phase 5: Advanced Features** (2-3 weeks)
- ✅ Audit logging
- ✅ Backup/restore
- ✅ Multi-tenancy support
- ✅ Monitoring & alerting

---

#### **Extensive Parameter List - Categories**

Please provide your list of parameters, and I'll organize them into:

1. **Project-Level** (already in Project Registry)
2. **Translation Keys** (i18n)
3. **Accessibility Labels** (ARIA, alt text)
4. **Error Messages** (user-facing)
5. **System Configuration** (logging, performance)
6. **RBAC Rules** (permissions, roles)
7. **Feature Flags** (enable/disable features)
8. **Integration Settings** (external APIs)

---

## 🚨 CRITICAL PRIORITY: EVA Chat Migration

### Task: Integrate EVA Chat Capabilities into EVA DA 2.0
**Status:** Not Started  
**Priority:** ⚠️ CRITICAL (12,000 users at risk, OpenWebUI licensing issue)  
**Timeline:** 4-6 weeks (REDUCED - toggle already exists!)

**Background:**
- **EVA Chat** (OpenWebUI-based): 12,000 users, 1,000,000 prompts processed
- **Problem:** OpenWebUI changed license, charging too much
- **Solution:** Migrate EVA Chat functionality into EVA DA 2.0 as "Generative" mode
- **Value:** Unified interface for both work-grounded RAG and general GPT chat
- ✅ **DISCOVERY:** Current EVA DA already has "Work Only / Generative" toggle!

**Screenshot Analysis:**
- Current EVA DA has toggle: "Work Only" vs "Generative (Ungrounded)"
- EVA Chat has mature UI: conversation history, suggested prompts, Terms of Use
- 219 active users visible in EVA Chat (real production usage)
- Professional government branding and compliance features already implemented

---

### Phase 1: Enhanced UI/UX - Conversation History & Features (Weeks 1-2)

**Goal:** Add EVA Chat features to existing EVA DA "Generative" mode

**Key Features from EVA Chat Screenshots:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ EVA DA 2.0 - Enhanced with EVA Chat Features                       │
│ ┌─────────────────────┐ ┌───────────────────────────────────────┐  │
│ │ Conversation History│ │ Main Chat Interface                   │  │
│ │                     │ │                                       │  │
│ │ Today               │ │ Project: [Jurisprudence ▼]            │  │
│ │ 🔥 Greetings        │ │ Mode: 🔵 Work Only ⚪ Generative    │  │
│ │                     │ │                                       │  │
│ │ Previous 30 days    │ │ ┌───── Chat Area ──────────────────┐ │  │
│ │ 📊 PIA Report       │ │ │ 🤖 EVA: How can I help?          │ │  │
│ │                     │ │ │                                   │ │  │
│ │ September           │ │ │ 💡 Suggested (Generative mode):  │ │  │
│ │ 🔍 AI Features      │ │ │ • Draft email reminder           │ │  │
│ │ 🎯 AI Strategy      │ │ │ • Summarize policy documents     │ │  │
│ │                     │ │ │ • Understand regulations         │ │  │
│ │ August              │ │ │                                   │ │  │
│ │ 📈 CoE APIM         │ │ │ [Type your message...          ] │ │  │
│ │ 📋 Data Management  │ │ └───────────────────────────────────┘ │  │
│ │                     │ │                                       │  │
│ │ [Settings] [Archive]│ │ [Attach] [Voice] [🔄] [Send ➤]     │  │
│ └─────────────────────┘ └───────────────────────────────────────┘  │
│                                                                     │
│ Active Users: 219 (from EVA Chat)     [FR] [Profile] [Sign Out]    │
└─────────────────────────────────────────────────────────────────────┘
```

**Implementation Tasks:**
- 🔲 Add conversation history sidebar (collapsible)
- 🔲 Organize conversations by date (Today, Previous 30 days, etc.)
- 🔲 Add conversation management (rename, delete, archive)
- 🔲 Add suggested prompts that change based on mode:
  - **Work Mode:** Project-specific suggestions (OAS eligibility, CPP-D rules)
  - **Generative Mode:** General productivity (draft email, summarize, translate)
- 🔲 Add active users counter (connect to real user tracking)
- 🔲 Add conversation search functionality
- 🔲 Add export conversation to PDF/markdown

---

### Phase 2: Terms of Use Integration (Week 2)

**Goal:** Implement EVA Chat Terms of Use for Generative mode

**From Screenshot - EVA Chat Terms of Use Requirements:**
```typescript
interface TermsOfUse {
  version: string;
  requiredCheckboxes: {
    protectedBCompliance: {
      text: "I have read and understand the Do's and Don'ts of using generative AI tools responsibly as well as the TBS policy and guide mentioned under Section 3 of the Terms of Use: Policies, Guidelines and Restrictions."
      required: true;
    };
    dataCollection: {
      text: "I understand that EVA Chat collects, uses and stores personal information for security monitoring and compliance. EVA Chat may also generate outputs based on personal information."
      required: true;
    };
    termsAcceptance: {
      text: "I agree to the EVA Chat Terms of Use, including all ethical guidelines and restrictions, and that I will respect the Protected B limitations of the information uploaded or provided to EVA."
      required: true;
    };
    courseRegistration: {
      text: "I understand the importance of registering for the ESDC Virtual Assistant (EVA) and Microsoft Copilot Chat course."
      required: true;
    };
  };
  links: {
    fullTerms: "https://esdc.gc.ca/eva/terms";
    dosAndDonts: "https://esdc.gc.ca/eva/guidelines";
    tbsPolicy: "https://tbs.gc.ca/ai-policy";
    course: "https://esdc.gc.ca/eva/training";
  };
}
```

**UI Implementation:**
- 🔲 Create `TermsOfUseModal` component matching screenshot design
- 🔲 Show modal on first access to Generative mode
- 🔲 Store acceptance in localStorage (demo) / Cosmos DB (production)
- 🔲 Add version tracking - re-prompt when terms updated
- 🔲 Add "View Full Terms of Use" link functionality
- 🔲 Prevent Generative mode usage until all checkboxes accepted

**Terms Storage (Cosmos DB):**
```typescript
{
  id: "terms-acceptance-user123",
  configType: "termsAcceptance",
  userId: "user@example.com",
  version: "2024.1",
  acceptedAt: "2024-01-15T10:30:00Z",
  checkboxes: {
    protectedBCompliance: true,
    dataCollection: true,
    termsAcceptance: true,
    courseRegistration: true
  }
}
```

---

### Phase 3: Backend - Chat API & History (Weeks 3-4)

**Goal:** Create Azure Functions for EVA Chat functionality

**New Chat API Endpoints (following existing EVA Config API pattern):**
```typescript
// Enhanced chat endpoints based on screenshot features
POST /eva/chat/completion
  - Body: { message, conversationId?, mode: 'work' | 'generative' }
  - Response: { answer, conversationId, tokens, mode }
  - Behavior: 
    - Work mode: Uses RAG + project context
    - Generative mode: Pure GPT-4 completion

POST /eva/chat/stream
  - Real-time streaming for both modes
  - Server-Sent Events (SSE)

GET /eva/chat/conversations
  - Returns organized conversation list (Today, Previous 30 days, etc.)
  - Response: { today: [...], previous30Days: [...], older: [...] }

POST /eva/chat/conversations
  - Create new conversation
  - Auto-generate title from first message

PUT /eva/chat/conversations/{id}
  - Update conversation (rename, archive)

DELETE /eva/chat/conversations/{id}
  - Delete conversation (GDPR compliance)

GET /eva/chat/conversations/{id}/messages
  - Get full conversation history
  - Pagination support for long conversations

POST /eva/chat/suggestions
  - Get suggested prompts based on mode and project
  - Input: { mode: 'work' | 'generative', projectId?: string }
  - Response: { suggestions: [{ text, category }] }
```

**Cosmos DB Schema Enhancement:**
```typescript
// Container: chatHistory (PK: /userId)
{
  id: "conv-uuid-12345",
  configType: "conversation",
  userId: "hashed-user-id",  // PK
  title: "Help with Python code",
  mode: "generative", // or "work"
  projectId?: "jurisprudence", // only for work mode
  messages: [
    { 
      role: "user", 
      content: "Help me draft an email about project deadlines", 
      timestamp: "2024-01-15T10:00:00Z" 
    },
    { 
      role: "assistant", 
      content: "I'd be happy to help you draft a professional email...", 
      timestamp: "2024-01-15T10:00:15Z",
      tokens: { prompt: 45, completion: 123 }
    }
  ],
  createdAt: "2024-01-15T10:00:00Z",
  lastMessageAt: "2024-01-15T10:05:00Z",
  archived: false,
  totalTokens: 1234,
  totalCost: 0.052 // USD
}
```

**Implementation Tasks:**
- 🔲 Create Azure Function App: `func-eva-chat` (TypeScript/Node.js)
- 🔲 Implement all chat endpoints
- 🔲 Add conversation organization logic (date-based grouping)
- 🔲 Add suggested prompts service (mode-aware)
- 🔲 Add token usage tracking and cost calculation
- 🔲 Deploy to Azure Functions
- 🔲 Configure APIM routes with cost tagging headers

---

### Phase 4: Data Migration - OpenWebUI to EVA DA 2.0 (Week 5)

**Goal:** Migrate 1M+ prompts from OpenWebUI to new system

**Migration Strategy:**
```typescript
// OpenWebUI Export → EVA DA Import
interface OpenWebUIConversation {
  id: string;
  user_id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  created_at: number;
  updated_at: number;
}

// Transform to EVA DA format
function transformConversation(openWebUIConv: OpenWebUIConversation): Conversation {
  return {
    id: `migrated-${openWebUIConv.id}`,
    configType: "conversation",
    userId: hashUserId(openWebUIConv.user_id), // GDPR compliance
    title: openWebUIConv.title,
    mode: "generative", // All OpenWebUI conversations were generative
    messages: openWebUIConv.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp * 1000).toISOString()
    })),
    createdAt: new Date(openWebUIConv.created_at * 1000).toISOString(),
    lastMessageAt: new Date(openWebUIConv.updated_at * 1000).toISOString(),
    archived: false,
    migrated: true, // Flag to identify migrated conversations
    totalTokens: estimateTokens(openWebUIConv.messages)
  };
}
```

**Migration Tasks:**
- 🔲 Export all conversations from OpenWebUI database
- 🔲 Create user ID anonymization/hashing strategy
- 🔲 Create `scripts/migrate-openwebui-conversations.ts`
- 🔲 Bulk insert to Cosmos DB (batch operations for performance)
- 🔲 Validate data integrity post-migration
- 🔲 Create migration report (users migrated, conversations, total tokens)
- 🔲 Test conversation access in new EVA DA interface

---

### Phase 5: User Communication & Rollout (Week 6)

**Goal:** Communicate migration plan to 12,000 EVA Chat users

**Communication Timeline:**
- **4 weeks before:** Email announcement with migration details
- **2 weeks before:** Banner in OpenWebUI pointing to EVA DA 2.0
- **1 week before:** Daily reminders, office hours
- **Migration day:** OpenWebUI → read-only, redirect to EVA DA 2.0
- **Post-migration:** User feedback collection, iteration

**User Training Materials:**
- 🔲 Video tutorial: "How to use EVA DA 2.0 Generative mode"
- 🔲 Migration guide: "Finding your conversations in EVA DA 2.0"
- 🔲 FAQ: "Differences between EVA Chat and EVA DA 2.0"
- 🔲 Quick reference card: "Work vs Generative mode"

---

### Success Metrics & Timeline

**Target Outcomes:**
- ✅ 12,000 users migrated to EVA DA 2.0
- ✅ 1M+ conversations preserved and accessible
- ✅ Zero downtime during migration
- ✅ Feature parity with OpenWebUI (conversation history, Terms of Use)
- ✅ User satisfaction score: 4+/5
- ✅ Cost savings: No OpenWebUI licensing fees

**REVISED Timeline (4-6 weeks total):**
- **Week 1:** Enhanced UI (conversation history, suggestions)
- **Week 2:** Terms of Use integration + testing
- **Week 3:** Backend chat APIs + deployment
- **Week 4:** Integration testing + bug fixes
- **Week 5:** Data migration + validation
- **Week 6:** User communication + rollout

**Key Advantage:** Existing "Work Only / Generative" toggle reduces development time by 2-3 weeks!

---

## 🤖 **Agent Integration Architecture**

### **Information Assistant + EVA Agent Patterns**

Based on Microsoft's Information Assistant architecture (reference diagrams at `https://raw.githubusercontent.com/microsoft/PubSec-Info-Assistant/main/docs/images/`), EVA extends the IA foundation with comprehensive agent integration.

#### **Two-Fold Agent Integration Pattern**

```
┌────────────────────────────────────────────────────────────────────────┐
│  AGENT ECOSYSTEM LAYER                                                 │
│  ┌──────────────────────────┐  ┌────────────────────────────────────┐ │
│  │ External Agents          │  │ EVA Internal Agents                │ │
│  │ (Consuming EVA APIs)     │  │ (EVA as Agent Orchestrator)        │ │
│  │                          │  │                                    │ │
│  │ • Semantic Kernel Agents │  │ • Jurisprudence Research Agent     │ │
│  │ • Autogen Multi-Agents   │  │ • CPP-D File Review Agent          │ │
│  │ • Azure AI Agents        │  │ • KM Cleanup Agent                 │ │
│  │ • Custom Bot Framework   │  │ • AssistMe Policy Agent            │ │
│  │ • Power Platform Copilots│  │ • Document Ingestion Agent         │ │
│  └──────────────────────────┘  └────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────┬───────────────────┘
                 │                                   │
                 ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  EVA FOUNDATION API LAYER (APIM Gateway)                               │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  Agent-Ready API Surface                                         │ │
│  │                                                                  │ │
│  │  🔍 RAG Services (IA Core)                                      │ │
│  │     POST /eva/rag/retrieve    - Multi-corpus semantic search     │ │
│  │     POST /eva/rag/answer      - Grounded Q&A with citations      │ │
│  │     POST /eva/rag/explain     - Explainable retrieval reasoning  │ │
│  │                                                                  │ │
│  │  📄 Document Intelligence (IA Extension)                        │ │
│  │     POST /eva/doc/summarize   - Multi-doc summarization          │ │
│  │     POST /eva/doc/compare     - Version comparison analysis      │ │
│  │     POST /eva/doc/extract     - Structured field extraction      │ │
│  │     POST /eva/doc/classify    - Document type classification     │ │
│  │                                                                  │ │
│  │  🔗 Workflow & Orchestration (Agent Layer)                      │ │
│  │     POST /eva/agents/research - Multi-step research workflow     │ │
│  │     POST /eva/agents/review   - Document review pipeline         │ │
│  │     POST /eva/agents/synthesis- Cross-source synthesis           │ │
│  │     GET  /eva/agents/status   - Workflow execution status        │ │
│  │                                                                  │ │
│  │  🛡️ Guardrails & Compliance (Cross-Cutting)                    │ │
│  │     POST /eva/guardrails/redact  - PII/sensitive data redaction │ │
│  │     POST /eva/guardrails/check   - Policy compliance checking    │ │
│  │     POST /eva/guardrails/audit   - Audit trail generation        │ │
│  │                                                                  │ │
│  │  Required Headers (All Calls):                                  │ │
│  │     x-project, x-app, x-feature, x-environment, x-user          │ │
│  │     → Enables cost attribution, rate limiting, RBAC             │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────┬───────────────────┘
                 │                                   │
                 ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  INFORMATION ASSISTANT FOUNDATION (Enhanced)                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  Core IA Services (Python Azure Functions)                      │ │
│  │  • RAG Pipeline (chunking, embedding, retrieval)                │ │
│  │  • Vector Search (Azure AI Search + custom ranking)             │ │
│  │  • Document Processing (OCR, parsing, metadata extraction)      │ │
│  │  • Multi-modal support (text, images, tables)                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  EVA Agent Orchestration Layer (TypeScript Functions)           │ │
│  │  • Workflow Engine (multi-step task coordination)               │ │
│  │  • Tool Registry (discover and invoke IA tools)                 │ │
│  │  • State Management (conversation context, workflow state)      │ │
│  │  • Integration Bus (external agent communication)               │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────┬───────────────────┘
                 │                                   │
                 ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  DATA & MODEL LAYER                                                    │
│  ┌──────────────────────────┐  ┌────────────────────────────────────┐ │
│  │ Azure Cosmos DB          │  │ Azure OpenAI + AI Search           │ │
│  │                          │  │                                    │ │
│  │ Container: documents     │  │ • GPT-4 for reasoning              │ │
│  │ - IA document metadata   │  │ • GPT-4-turbo for speed            │ │
│  │ - Chunking results       │  │ • text-embedding-ada-002           │ │
│  │ - Processing status      │  │ • Vector indexes (semantic search) │ │
│  │                          │  │ • Semantic ranker                  │ │
│  │ Container: workflows     │  │ • Custom scoring profiles          │ │
│  │ - Agent execution logs   │  │                                    │ │
│  │ - Multi-step task state  │  └────────────────────────────────────┘ │
│  │ - Tool invocation traces │                                        │ │
│  └──────────────────────────┘                                        │ │
└────────────────────────────────────────────────────────────────────────┘
```

---

### **Agent Integration Patterns Detailed**

#### **Pattern 1: External Agents → EVA APIs**
**Use Case:** Third-party agents consume EVA as a utility service

**Example: Semantic Kernel Agent for Jurisprudence Research**
```typescript
// External agent built with Semantic Kernel
import { Kernel, KernelFunction } from '@microsoft/semantic-kernel';

const kernel = new Kernel();

// Register EVA tools as Semantic Kernel functions
kernel.addFunction({
  name: 'searchCaseLaw',
  description: 'Search CPP-D case law database',
  parameters: [
    { name: 'query', description: 'Legal search query', type: 'string' },
    { name: 'jurisdiction', description: 'Legal jurisdiction', type: 'string' }
  ],
  implementation: async (query: string, jurisdiction: string) => {
    return await evaApiClient.rag.retrieve({
      projectId: 'jurisprudence',
      query,
      filters: { jurisdiction, documentType: 'case-law' }
    });
  }
});

kernel.addFunction({
  name: 'summarizeLegalCase',
  description: 'Generate legal case summary',
  implementation: async (caseId: string) => {
    return await evaApiClient.doc.summarize({
      documentId: caseId,
      style: 'legal-brief',
      maxLength: 500
    });
  }
});

// Agent orchestrates complex legal research
const result = await kernel.invoke(
  "Find recent CPP-D chronic pain decisions and summarize key precedents"
);
```

**Benefits:**
- ✅ Agent doesn't duplicate RAG/search logic
- ✅ EVA enforces consistent guardrails, RBAC, logging
- ✅ Cost attribution via APIM headers
- ✅ Agent focuses on orchestration, not infrastructure

---

#### **Pattern 2: EVA as Agent Orchestrator**
**Use Case:** EVA internally implements complex workflows as agents

**Example: CPP-D File Review Agent (Built into EVA)**
```typescript
// EVA Foundation backend: agents/cppd-review-agent.ts
export class CPPDReviewAgent {
  private tools: AgentTool[];

  constructor() {
    this.tools = [
      new DocumentExtractionTool(),
      new PolicySearchTool(), 
      new EligibilityCheckerTool(),
      new ComparisonTool(),
      new RecommendationTool()
    ];
  }

  async executeReview(fileId: string, context: ReviewContext): Promise<ReviewResult> {
    const workflow = new WorkflowOrchestrator();
    
    // Step 1: Extract structured data from file
    const extractedData = await workflow.execute('extract-data', {
      tool: 'DocumentExtractionTool',
      input: { fileId, fields: ['condition', 'symptoms', 'workHistory', 'medicalEvidence'] }
    });
    
    // Step 2: Search relevant policies based on condition
    const relevantPolicies = await workflow.execute('search-policies', {
      tool: 'PolicySearchTool',
      input: { 
        query: `CPP-D eligibility rules for ${extractedData.condition}`,
        projectId: 'jurisprudence',
        filters: { documentType: 'policy', status: 'active' }
      }
    });
    
    // Step 3: Check eligibility against criteria
    const eligibilityAssessment = await workflow.execute('check-eligibility', {
      tool: 'EligibilityCheckerTool',
      input: { 
        applicantData: extractedData,
        applicablePolicies: relevantPolicies
      }
    });
    
    // Step 4: Compare with previous decisions (if any)
    let comparisonResult = null;
    if (context.previousDecisionId) {
      comparisonResult = await workflow.execute('compare-decisions', {
        tool: 'ComparisonTool',
        input: {
          currentCase: extractedData,
          previousDecisionId: context.previousDecisionId
        }
      });
    }
    
    // Step 5: Generate recommendation with reasoning
    const recommendation = await workflow.execute('generate-recommendation', {
      tool: 'RecommendationTool',
      input: {
        eligibilityAssessment,
        relevantPolicies,
        comparisonResult,
        riskFactors: context.riskFactors
      }
    });
    
    return {
      recommendation: recommendation.decision, // 'approve' | 'deny' | 'review'
      confidence: recommendation.confidence, // 0.0 - 1.0
      reasoning: recommendation.reasoning,
      citations: relevantPolicies.map(p => p.citation),
      riskFlags: eligibilityAssessment.risks,
      workflowTrace: workflow.getExecutionTrace(),
      estimatedProcessingTime: workflow.getExecutionTime()
    };
  }
}

// Exposed via EVA API
app.post('/eva/agents/cppd-review', async (req, res) => {
  const agent = new CPPDReviewAgent();
  const result = await agent.executeReview(req.body.fileId, req.body.context);
  
  // Log for audit and cost attribution
  await auditLog.recordAgentExecution({
    agentType: 'cppd-review',
    input: req.body,
    output: result,
    headers: extractApimHeaders(req),
    executionTime: result.estimatedProcessingTime
  });
  
  res.json(result);
});
```

**From External Perspective:**
```typescript
// Client just calls the agent endpoint
const reviewResult = await evaApiClient.post('/eva/agents/cppd-review', {
  fileId: 'case-12345',
  context: {
    previousDecisionId: 'decision-67890',
    riskFactors: ['chronic-pain', 'multiple-conditions']
  }
});

console.log(reviewResult.recommendation); // 'approve'
console.log(reviewResult.reasoning); // 'Based on policy XYZ...'
console.log(reviewResult.citations); // ['Policy 123', 'Case Law 456']
```

**Benefits:**
- ✅ Complex workflow hidden behind simple API
- ✅ Internal tools (RAG, doc processing, guardrails) orchestrated seamlessly
- ✅ Full audit trail and cost attribution
- ✅ Reusable across multiple applications (CURAM, portals, etc.)

---

### **Information Assistant Architecture Integration**

**Based on IA Reference Diagrams (to be incorporated):**

1. **Document Processing Pipeline (IA Core)**
   - File upload → OCR/parsing → Chunking → Embedding → Indexing
   - EVA agents can trigger and monitor this pipeline
   - Status tracking via `/eva/ingest/status` API

2. **RAG Retrieval Engine (IA Core)** 
   - Hybrid search (keyword + vector)
   - Semantic ranking and scoring
   - EVA agents consume via `/eva/rag/retrieve` and `/eva/rag/answer`

3. **Multi-Modal Support (IA Extension)**
   - Text, images, tables, charts
   - EVA agents can process mixed content types
   - Accessible via `/eva/doc/extract` with type-specific processing

4. **Security & Compliance Layer (EVA Addition)**
   - PII redaction before agent processing
   - RBAC enforcement per project/user
   - Audit logging for all agent actions
   - Policy compliance checking

---

### **Agent-Ready API Design Principles**

Following the **"Agent-Ready EVA" Definition of Done**:

#### **1. Stable OpenAPI Contracts**
```yaml
# agents-api.yaml
paths:
  /eva/agents/research:
    post:
      operationId: executeResearchWorkflow
      parameters:
        - $ref: '#/components/parameters/ProjectIdHeader'
        - $ref: '#/components/parameters/UserIdHeader'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  example: "Recent CPP-D chronic pain precedents"
                scope:
                  type: array
                  items:
                    type: string
                  example: ["case-law", "policies", "guidelines"]
                maxSources:
                  type: integer
                  default: 10
      responses:
        200:
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResearchResult'
```

#### **2. Machine-Readable I/O**
```typescript
// All agent APIs return structured JSON
interface AgentResponse {
  success: boolean;
  result?: any;
  error?: string;
  metadata: {
    executionId: string;
    duration: number;
    tokensUsed: number;
    toolsInvoked: string[];
    cost: number; // USD
  };
}
```

#### **3. RBAC via Headers**
```typescript
// Every agent API call checks permissions
async function checkAgentPermissions(headers: ApimHeaders, agentType: string) {
  const user = await rbacService.getUser(headers['x-user']);
  const project = headers['x-project'];
  
  // Check if user can invoke this agent type in this project
  if (!user.canInvokeAgent(agentType, project)) {
    throw new ForbiddenError(`User ${user.email} cannot invoke ${agentType} in project ${project}`);
  }
}
```

#### **4. Centralized Guardrails**
```typescript
// Agents cannot bypass guardrails
async function executeAgentWorkflow(input: any, context: AgentContext) {
  // Pre-processing: redact PII, check content policy
  const sanitizedInput = await guardrailsService.preProcess(input, context.projectId);
  
  // Execute agent logic
  const rawResult = await agent.execute(sanitizedInput);
  
  // Post-processing: redact response, add disclaimers
  const finalResult = await guardrailsService.postProcess(rawResult, context.projectId);
  
  return finalResult;
}
```

#### **5. Idempotent & Composable**
```typescript
// Agents can be safely retried and chained
interface AgentCall {
  agentId: string;
  input: any;
  idempotencyKey?: string; // For safe retries
}

// Chain multiple agent calls
const workflow = [
  { agentId: 'extract-data', input: { fileId: '123' } },
  { agentId: 'search-policies', input: { condition: '${extract-data.result.condition}' } },
  { agentId: 'generate-recommendation', input: { 
      data: '${extract-data.result}', 
      policies: '${search-policies.result}' 
    } 
  }
];

const result = await agentOrchestrator.executeWorkflow(workflow);
```

#### **6. Cost Tagging Enforced**
```typescript
// All agent executions logged with cost attribution
interface AgentExecutionLog {
  executionId: string;
  timestamp: string;
  agentType: string;
  project: string;
  app: string;
  user: string;
  input: any;
  output: any;
  duration: number;
  costs: {
    openaiTokens: { prompt: number; completion: number; cost: number };
    searchRequests: { count: number; cost: number };
    computeTime: { seconds: number; cost: number };
    total: number;
  };
}
```

#### **7. Documentation & Examples**
```typescript
// Every agent has usage examples
const examples = {
  'jurisprudence-research': {
    description: 'Multi-step legal research workflow',
    input: {
      query: 'CPP-D eligibility for fibromyalgia',
      jurisdiction: 'federal',
      timeRange: '2020-2024'
    },
    output: {
      cases: [/* legal cases */],
      policies: [/* relevant policies */],
      summary: '/* executive summary */',
      citations: [/* properly formatted citations */]
    },
    estimatedCost: '$0.25',
    estimatedTime: '15-30 seconds'
  }
};
```

---

### **Next Steps for Agent Integration**

1. **📋 Review IA Architecture Diagrams**
   - Fetch specific diagrams from the IA repo you mentioned
   - Map IA components to EVA agent integration points
   - Identify gaps where EVA adds value beyond base IA

2. **🔨 Implement Agent Orchestration Layer**
   - Create `WorkflowOrchestrator` class
   - Build `AgentTool` abstraction
   - Add state management for multi-step workflows

3. **🔌 Create First Agent (CPP-D Review)**
   - Implement as proof-of-concept
   - Test against real CPP-D files
   - Measure performance and cost

4. **🚀 Expose Agent APIs**
   - Add agent endpoints to EVA Config API spec
   - Implement APIM policies
   - Create client SDKs for external agent consumption

**Which IA architecture diagrams should I examine first?** 🤔

---

## 🎯 Priority Tasks

### Task 1: Application Configuration Management System
// ...existing content...
