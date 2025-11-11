# EVA DA 2.0 - Development Backlog

## 🏛️ **Project Context & Legacy Evolution**

**EVA DA 2.0** is the next-generation user interface for Microsoft Information Assistant, developed to enterprise Government of Canada standards. This represents an evolution from legacy implementations to a modern, scalable platform.

### **Legacy Systems** (No longer developed)
- ❌ **EVA DA (Information Assistant based)**: Original IA implementation  
- ❌ **EVA Chat (OpenWebUI based)**: Chat-focused legacy system

### **Current Development Focus**
- ✅ **EVA DA 2.0**: Modern UI layer for enhanced Information Assistant
- ✅ **EVA Foundation 2.0**: Enterprise backend based on Microsoft IA with future agent/MCP capabilities
- 🚧 **Chat Interface**: Not yet implemented (planned future release)

*Note: Current "agents" are development/build agents, not runtime AI agents*

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

## 🎯 **CURRENT HIGH PRIORITY - SCREEN PARAMETERS & CONFIGURATION**

### **Screen Parameter Mapping & Enhancement** 
**Status:** 🚧 In Progress  
**Priority:** High  
**Target:** Q1 2025

**Problem:** Many parameters in screen components are hardcoded or incomplete. Need comprehensive mapping of project-specific vs global parameters across all screens.

**Required Work:**

#### **1. Project Registry Screen Enhancement**
- [ ] **Project Configuration Parameters**
  - [ ] Business Metadata: domain, owner, costCentre, department, contactInfo
  - [ ] Technical Settings: api endpoints, connection strings, timeout values
  - [ ] Resource Allocation: CPU limits, memory limits, storage quotas
  - [ ] Data Sources: SharePoint sites, file system paths, database connections
  - [ ] Access Control: user groups, permissions, approval workflows
  - [ ] Compliance Settings: data classification, retention policies, audit requirements

- [ ] **Theme Configuration Parameters**
  - [ ] Color Palette: primary, secondary, accent, background variants
  - [ ] Typography: font families, sizes, weights, line heights
  - [ ] Layout: spacing, margins, border radius, elevation
  - [ ] Accessibility: contrast ratios, focus indicators, screen reader settings
  - [ ] Branding: logos, icons, watermarks, corporate identity elements

#### **2. Global App Admin Screen Enhancement**
- [ ] **System-Wide Configuration**
  - [ ] Authentication: SSO settings, token expiration, session management
  - [ ] Infrastructure: Azure region preferences, scaling policies, backup schedules
  - [ ] Monitoring: logging levels, alert thresholds, dashboard configurations
  - [ ] Security: encryption settings, key rotation, compliance frameworks
  - [ ] Feature Flags: experimental features, rollout controls, A/B testing

- [ ] **Multi-Tenant Management**
  - [ ] Tenant Isolation: data boundaries, compute isolation, network policies
  - [ ] Resource Quotas: per-tenant limits, billing models, usage tracking
  - [ ] Service Level Agreements: uptime guarantees, performance metrics, penalties
  - [ ] Governance: approval workflows, change management, audit trails

#### **3. Missing Screen Components**
- [ ] **Chat Interface** (Not yet implemented)
  - [ ] Chat Configuration: message history, context window, response formatting
  - [ ] AI Model Settings: temperature, top_k, max_tokens, stop sequences
  - [ ] User Experience: typing indicators, message threading, search capabilities
  - [ ] Personalization: user preferences, conversation history, favorite responses

- [ ] **Dashboard & Analytics Screen**
  - [ ] Performance Metrics: response times, throughput, error rates, user satisfaction
  - [ ] Usage Analytics: active users, popular features, session duration, conversion rates
  - [ ] Cost Analytics: resource utilization, billing trends, optimization recommendations
  - [ ] Security Monitoring: authentication events, access patterns, threat detection

- [ ] **User Management Screen**
  - [ ] User Profiles: personal settings, preferences, role assignments, group memberships
  - [ ] Access Control: permission management, role definitions, approval workflows
  - [ ] Activity Monitoring: login history, feature usage, audit logs, compliance reporting

#### **4. Configuration Management System**
- [ ] **Parameter Inheritance Model**
  - [ ] Global defaults → Project overrides → User preferences
  - [ ] Validation rules and constraints
  - [ ] Change tracking and audit logs
  - [ ] Rollback capabilities

- [ ] **Configuration Import/Export**
  - [ ] JSON/YAML configuration files
  - [ ] Environment-specific configurations (dev/test/prod)
  - [ ] Migration tools for configuration updates
  - [ ] Backup and restore capabilities

### **Jurisprudence Feature Integration Ideas**
**Status:** 📋 Planning  
**Priority:** Medium  
**Reference:** Accenture EVA Domain Assistant feature concepts

**Potential Features to Evaluate:**
- [ ] **Legal Research Enhancement**
  - [ ] Case law search and citation formatting
  - [ ] Regulatory compliance checking
  - [ ] Legal document templates and automation
  - [ ] Precedent analysis and recommendations

- [ ] **Bilingual Legal Processing**
  - [ ] Legal terminology translation validation
  - [ ] Jurisdiction-specific language requirements
  - [ ] Cultural context preservation in translations
  - [ ] Legal document accessibility standards

- [ ] **Advanced Analytics for Legal Content**
  - [ ] Legal trend analysis and predictions
  - [ ] Case outcome probability modeling
  - [ ] Regulatory impact assessment
  - [ ] Compliance risk scoring

*Note: Need to review Accenture feature specifications to determine integration feasibility*

### **Architecture Enhancement for Future Agents/MCP**
**Status:** 📋 Planning  
**Priority:** Medium  
**Target:** Q2 2025

**Preparation for Runtime Agent Integration:**
- [ ] **Agent Orchestration Framework**
  - [ ] Agent discovery and registration
  - [ ] Message routing and protocol handling
  - [ ] Load balancing and failover mechanisms
  - [ ] Agent health monitoring and recovery

- [ ] **Model Context Protocol (MCP) Integration**
  - [ ] MCP server implementation
  - [ ] Context sharing between agents
  - [ ] Tool and resource management
  - [ ] Prompt and completion handling

- [ ] **Agent Management Interface**
  - [ ] Agent deployment and configuration
  - [ ] Performance monitoring and optimization
  - [ ] Agent versioning and updates
  - [ ] Resource allocation and scaling

---

## 🔧 **TECHNICAL DEBT & IMPROVEMENTS**

### **Parameter Hardcoding Cleanup**
**Status:** 🚧 In Progress  
**Priority:** High

**Identified Hardcoded Parameters to Fix:**
- [ ] API endpoints and timeouts in components
- [ ] Color values and theme settings
- [ ] Default project configurations
- [ ] Mock data and sample content
- [ ] Feature flags and environment settings

**Action Items:**
1. **Audit all components** for hardcoded values
2. **Create parameter mapping** (project vs global vs user)
3. **Implement configuration management** system
4. **Add validation and error handling** for parameters
5. **Create migration tools** for existing configurations

### **Screen Component Architecture**
**Status:** 📋 Planning  
**Priority:** Medium

**Required Refactoring:**
- [ ] **Consistent parameter props** across all components
- [ ] **Shared configuration context** for global settings
- [ ] **Validation and error boundaries** for all user inputs
- [ ] **Accessibility and internationalization** for all screens
- [ ] **Responsive design** for mobile and tablet support

...existing backlog content...
