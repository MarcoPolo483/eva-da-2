# EVA DA 2.0 - Application Snapshot
**Date:** 2024-01-15  
**Status:** Pre-RBAC Implementation  
**Purpose:** Baseline snapshot before implementing role-based access control

---

## 🎯 Current Application State

### Architecture Overview
```
┌─────────────────────────────────────────────────────────┐
│  React Frontend (Vite + TypeScript)                     │
│  - Project-aware chat interface                         │
│  - Bilingual support (EN/FR)                            │
│  - Project Registry (admin UI)                          │
│  - Global App Admin (system config)                     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Storage Layer                                          │
│  - localStorage (eva:projectRegistry)                   │
│  - JSON export/import capability                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Mock Backend (APIM Simulation)                         │
│  - Local mock responses by project                      │
│  - Configurable latency                                 │
│  - Template-based responses                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Core Files
```
eva-da-2/
├── src/
│   ├── components/
│   │   ├── App.tsx                    # Main app component, routing logic
│   │   ├── Header.tsx                 # Top navigation bar
│   │   ├── ProjectSwitcher.tsx        # Project dropdown selector
│   │   ├── ChatPanel.tsx              # Chat interface for end users
│   │   ├── ProjectRegistry.tsx        # Project CRUD admin UI
│   │   ├── GlobalAppAdmin.tsx         # System configuration UI (NEW)
│   │   ├── AdjustModal.tsx            # RAG template settings
│   │   └── InfoPanel.tsx              # Response metadata display
│   ├── lib/
│   │   ├── evaClient.ts               # Mock APIM client, ProjectId type
│   │   ├── apimClient.ts              # RAG answer API
│   │   ├── apimConfig.ts              # APIM configuration types
│   │   ├── projectRegistryStore.ts    # localStorage persistence layer
│   │   └── types.ts                   # Shared TypeScript types
│   ├── i18n/
│   │   ├── en.json                    # English translations
│   │   └── fr.json                    # French translations
│   └── main.tsx                       # Application entry point
├── BACKLOG.md                         # Development backlog
├── SNAPSHOT.md                        # This file
└── package.json
```

---

## 🗂️ Data Model

### ProjectId Type
```typescript
export type ProjectId = 
  | "canadaLife"      // Client-facing project
  | "jurisprudence"   // Client-facing project
  | "AssistMe"        // Client-facing project
  | "admin"           // Project Registry admin interface
  | "globalAdmin";    // Global App Admin interface
```

### RegistryEntry Structure
```typescript
interface RegistryEntry {
  id: ProjectId;
  label: string;
  domain: string;
  owner: string;
  costCentre: string;
  ragProfile: string;
  description: string;
  theme: ThemeConfig;
  ragIndex: RagIndexConfig;
  ragRetrieval: RagRetrievalConfig;
  guardrails: GuardrailConfig;
  suggestedQuestions: SuggestedQuestion[];
  apim: ApimConfig;
}
```

### Current Projects in REGISTRY
1. **canadaLife** - Benefits & Insurance assistant
2. **jurisprudence** - Legal research assistant
3. **AssistMe** - Old Age Security assistant
4. **admin** - Project Registry admin workspace
5. **globalAdmin** - Global App Admin workspace (system config)

---

## 🎨 Features Implemented

### ✅ Multilingual Support
- English/French toggle in header
- Suggested questions stored as `{ en, fr }` objects
- Translation keys in `en.json` and `fr.json`
- Backward compatibility with old string-based format

### ✅ Project Registry (Admin UI)
- **Location:** Select "Project Registry" from dropdown → `/admin`
- **Features:**
  - View/edit all project configurations
  - Create new projects
  - Delete projects (except admin)
  - Export registry to JSON
  - Import registry from JSON
  - Reset to defaults
  - **Protected:** Admin project hidden from dropdown inside registry
  - **Scope:** Only shows client-facing projects (canadaLife, jurisprudence, AssistMe)

### ✅ Global App Admin (System Config)
- **Location:** Select "Global App Admin" from dropdown → `/globalAdmin`
- **Features:**
  - Edit/Save/Cancel workflow for admin project
  - Configure system-level settings:
    - Project Registry metadata (label, domain, owner)
    - System theme (colors, font size)
    - APIM configuration (mode, endpoint, keys)
  - Protected from accidental modification
  - Placeholder sections for future features:
    - Authentication & Authorization
    - Feature Flags
    - Monitoring & Telemetry
    - Rate Limiting
    - Backup & Recovery

### ✅ Project Configuration
Each project includes:
- **Business Metadata:** Label, domain, owner, cost centre
- **RAG Engine:** Chunking strategy, chunk size, overlap, index name
- **RAG Retrieval:** Ranking strategy, top-K, citation style
- **Guardrails:** PII redaction, speculative answers, blocked topics
- **Suggested Questions:** Bilingual (EN/FR) with full CRUD
- **APIM:** Local mock or Azure APIM with features (metrics, tracing, cache)
- **Theme:** Primary, background, surface colors + font size

### ✅ System Protections
1. **Admin Project Cannot Be Deleted:**
   - UI prevents deletion via alert
   - `loadRegistry()` auto-restores if missing
   - `saveRegistry()` blocks operations without admin

2. **Data Persistence:**
   - localStorage key: `eva:projectRegistry`
   - Version: `0.68`
   - Structure: `{ version, items: RegistryEntry[] }`

3. **Fallback Mechanisms:**
   - Empty localStorage → load REGISTRY defaults
   - Missing admin → add from defaults
   - Invalid data → return defaults

---

## 🔌 APIM Integration

### Local Mock Mode (Current Default)
```typescript
{
  mode: 'local',
  localPort: 3001,
  features: {
    enableMetrics: boolean,
    enableTracing: boolean,
    enableCache: boolean
  }
}
```

### Mock Response Templates by Project
```typescript
canadaLife: [
  "Based on Canada Life's policy guidelines: {answer}",
  "According to our insurance expertise: {answer}",
  "Following Canada Life's best practices: {answer}"
]

jurisprudence: [
  "Legal analysis indicates: {answer}",
  "Based on precedent cases: {answer}",
  "Legal framework suggests: {answer}"
]

AssistMe: [
  "Based on Old Age Security policy: {answer}",
  "According to Service Canada guidelines: {answer}",
  "OAS benefits analysis indicates: {answer}"
]

admin: [
  "System administration response: {answer}",
  "Platform configuration status: {answer}",
  "Administrative analysis: {answer}"
]

globalAdmin: [
  "Global configuration updated: {answer}",
  "System settings applied: {answer}",
  "Platform management: {answer}"
]
```

### Azure APIM Mode (Configured, Not Active)
```typescript
{
  mode: 'azure',
  apiEndpoint: 'https://your-apim.azure-api.net/eva/v1',
  apiVersion: '2023-11-09',
  subscriptionKey: 'your-key',
  subscriptionRegion: 'canadacentral',
  features: { ... }
}
```

---

## 🚀 User Journey (Current)

### 1. Regular User (No Restrictions)
1. Open app → Sees dropdown with **all 5 projects**
2. Select "Canada Life" → Chat interface with suggested questions
3. Switch to "Jurisprudence" → Different theme, questions, mock responses
4. Switch to "AssistMe" → OAS-specific interface
5. Can access "Project Registry" → Full project configuration UI
6. Can access "Global App Admin" → System configuration UI

### 2. Project Admin (No Restrictions - Same as Regular User)
- Same as above
- No role-based filtering implemented yet

### 3. System Admin (No Restrictions - Same as Regular User)
- Same as above
- No role-based filtering implemented yet

---

## 🐛 Known Issues

### ❌ No Role-Based Access Control (RBAC)
- All users see all projects
- No permission checks
- Admin interfaces accessible to everyone
- No user authentication

### ❌ localStorage Can Be Manipulated
- Users can manually edit localStorage
- No server-side validation
- No audit trail

### ❌ No Real Backend
- Mock responses only
- No real RAG engine
- No persistent storage beyond browser

---

## 📋 Next Steps (Pre-RBAC)

### Planned RBAC Implementation

#### User Roles (To Be Implemented)
```typescript
type UserRole = 'user' | 'projectAdmin' | 'systemAdmin';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedProjects?: ProjectId[];  // For regular users
}
```

#### Access Control Matrix
| Feature | Regular User | Project Admin | System Admin |
|---------|-------------|---------------|--------------|
| Chat with assigned projects | ✅ | ✅ | ✅ |
| Switch between projects | ✅ (assigned only) | ✅ (all) | ✅ (all) |
| View Project Registry | ❌ | ✅ | ✅ |
| Create/Edit/Delete projects | ❌ | ✅ | ✅ |
| View Global App Admin | ❌ | ❌ | ✅ |
| Edit system configuration | ❌ | ❌ | ✅ |

#### Implementation Plan
1. Create `UserRoleContext` (mock, then Azure AD)
2. Filter ProjectSwitcher dropdown by role
3. Add route guards for admin interfaces
4. Update BACKLOG.md with detailed RBAC tasks
5. Prepare for Azure AD B2C integration

---

## 🔐 Azure AD Integration (Future)

### Planned Authentication Flow
```typescript
// Future: Read from Azure AD JWT token
const user = {
  id: 'user@example.com',
  role: 'projectAdmin',  // From Azure AD groups
  assignedProjects: ['canadaLife', 'AssistMe']  // From custom claims
};
```

### Azure AD Groups → App Roles
- `EVA-Users` → `user`
- `EVA-ProjectAdmins` → `projectAdmin`
- `EVA-SystemAdmins` → `systemAdmin`

---

## 📊 Storage State (localStorage)

### Current Keys
```javascript
{
  "eva:projectRegistry": {
    "version": "0.68",
    "items": [/* 5 projects */]
  },
  "eva:template": {
    "temperature": 0.2,
    "top_k": 5,
    "source_filter": ""
  },
  "i18nextLng": "en"  // or "fr"
}
```

---

## 🎨 Theme System

### CSS Variables (Applied Dynamically)
```css
--color-primary: <project.theme.primary>
--color-accent: <project.theme.primary>
--color-background: <project.theme.background>
--color-surface: <project.theme.surface>
--base-font-size: <project.theme.baseFontPx>px
```

### Project Themes
- **canadaLife:** Red (#e41d3d), light pink background
- **jurisprudence:** Blue (#0055a4), light blue background
- **AssistMe:** Navy (#26374a), light gray background
- **admin:** Black (#000000), light gray background
- **globalAdmin:** Gray (#4a5568), very light blue background

---

## 📦 Dependencies

### Key npm Packages
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-i18next": "^12.1.4",
  "i18next": "^22.4.9",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.0.2",
  "vite": "^5.0.0"
}
```

---

## ✅ Testing Checklist

### Pre-RBAC Validation
- [x] All 5 projects load correctly
- [x] Project dropdown populated
- [x] Chat interface works for all projects
- [x] Bilingual toggle works (EN ↔ FR)
- [x] Suggested questions display correctly
- [x] Project Registry UI functional
- [x] Admin project hidden in Project Registry dropdown
- [x] Global App Admin UI functional
- [x] Edit/Save/Cancel workflow works
- [x] Admin project cannot be deleted
- [x] Export/Import works
- [x] Reset reloads defaults including globalAdmin
- [x] Theme switching works
- [x] localStorage persistence works

### Post-RBAC Validation (TODO)
- [ ] Regular users only see assigned projects
- [ ] Project admins see all projects + Project Registry
- [ ] System admins see everything + Global App Admin
- [ ] Unauthorized access blocked
- [ ] Role changes reflected immediately
- [ ] Azure AD integration (when implemented)

---

## 🔗 Related Documents

- **BACKLOG.md** - Development backlog and future tasks
- **README.md** - Project setup and running instructions
- **package.json** - Dependencies and scripts

---

## 📝 Notes

### Design Decisions
1. **Separation of Concerns:** Project Registry vs Global App Admin
   - Project Registry: Manage client-facing projects
   - Global App Admin: Manage system-level configuration
   
2. **Progressive Enhancement:**
   - Start with localStorage (demo)
   - Migrate to Azure Cosmos DB (production)
   - Add Azure AD authentication (production)

3. **Backward Compatibility:**
   - Suggested questions support old string format
   - Migration logic preserves existing data
   - Fallbacks prevent data loss

4. **Protection Layers:**
   - UI prevents admin deletion
   - Storage layer auto-restores admin
   - Save operations validate admin presence

---

**End of Snapshot**

This snapshot represents the application state before implementing role-based access control (RBAC). All features are functional but lack user authentication and permission checks.
