# Azure Cosmos DB Integration Guide

## EVA DA 2.0 - Azure Cosmos DB Setup & Seeding

This guide covers the complete setup, configuration, and data seeding process for integrating Azure Cosmos DB with EVA DA 2.0.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Data Seeding](#data-seeding)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

EVA DA 2.0 uses Azure Cosmos DB as its production database, with support for:

- **Managed Identity Authentication** (recommended for production)
- **Connection String Authentication** (development only)
- **Mock Data Fallback** (for local development without Azure)
- **Automatic Retry Logic** with exponential backoff
- **Connection Pooling** for optimal performance
- **Comprehensive Error Handling**

### Seed Data Package Includes:

- ✅ **80+ Translation Strings** (English & French)
- ✅ **8 Theme Presets** (Light, Dark, Ocean, Sunset, Forest, Corporate, Ruby, Lavender)
- ✅ **3 Sample Projects** (Canada Life, Jurisprudence, AssistMe)
- ✅ **8 Sample Users** with roles and permissions
- ✅ **6 Role Definitions** (Platform Admin, AI CoE Owner/Admin, Project Admin/Contributor/Reader)
- ✅ **24 Quick Questions** across all projects
- ✅ **Default Settings** (Accessibility, Global, Security)

---

## ✅ Prerequisites

### Required

- **Node.js 18+**
- **Azure Account** with Cosmos DB access
- **Azure CLI** installed and logged in (`az login`)

### Cosmos DB Requirements

- Cosmos DB account (SQL API)
- RBAC permissions: `Cosmos DB Data Contributor` or higher
- Network access to Cosmos DB endpoint

---

## 🏗️ Architecture

### Container Structure

```
Database: eva-da-2
├── users (partition key: /id)
│   └── User profiles, preferences, roles
├── projects (partition key: /id)
│   └── Project configurations
├── translations (partition key: /category)
│   └── UI translation strings
├── settings (partition key: /type)
│   └── Themes, accessibility, global settings
├── quickQuestions (partition key: /projectId)
│   └── Project-specific quick questions
├── roles (partition key: /level)
│   └── Role definitions and permissions
├── files (partition key: /projectId)
│   └── File metadata
└── conversations (partition key: /userId)
    └── Chat history
```

### Authentication Flow

```
Production (Azure-hosted):
App → Managed Identity → Cosmos DB

Development (Local):
App → Azure CLI Credentials → Cosmos DB

Development (Mock):
App → Mock Data Service
```

---

## ⚙️ Configuration

### 1. Copy Environment Template

```powershell
Copy-Item .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local`:

```env
# Cosmos DB Configuration
VITE_COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
VITE_COSMOS_DB_DATABASE_NAME=eva-da-2
VITE_COSMOS_DB_AUTH_METHOD=managedIdentity

# Feature Flags
VITE_ENABLE_MOCK_DATA=false  # Set to true for local dev without Azure
VITE_COSMOS_DB_ENABLE_DIAGNOSTICS=true

# Container Names (use defaults unless customizing)
VITE_COSMOS_DB_CONTAINER_USERS=users
VITE_COSMOS_DB_CONTAINER_PROJECTS=projects
VITE_COSMOS_DB_CONTAINER_TRANSLATIONS=translations
VITE_COSMOS_DB_CONTAINER_SETTINGS=settings
VITE_COSMOS_DB_CONTAINER_QUICK_QUESTIONS=quickQuestions
VITE_COSMOS_DB_CONTAINER_ROLES=roles
VITE_COSMOS_DB_CONTAINER_FILES=files
VITE_COSMOS_DB_CONTAINER_CONVERSATIONS=conversations
```

### 3. Azure Authentication

**For Local Development:**

```powershell
# Login to Azure
az login

# Set subscription (if multiple)
az account set --subscription "Your Subscription Name"

# Verify access to Cosmos DB
az cosmosdb show --name your-cosmos-account --resource-group your-rg
```

**For Production (Managed Identity):**

No additional configuration needed - the app uses `DefaultAzureCredential` which automatically uses the app's Managed Identity.

---

## 🗄️ Database Setup

### Option 1: Automated Setup (Recommended)

```powershell
# Initialize containers and seed data in one command
npm run cosmos:setup
```

### Option 2: Manual Steps

#### Step 1: Initialize Containers

```powershell
npm run cosmos:init
```

This creates:
- Database: `eva-da-2`
- 8 containers with proper partition keys
- Indexing policies for optimal query performance
- Unique key constraints where applicable

#### Step 2: Seed Data

```powershell
npm run cosmos:seed
```

This loads:
- 80+ translations
- 8 themes
- 3 projects
- 8 users
- 6 roles
- 24 quick questions
- Default settings

---

## 🌱 Data Seeding

### Seed Data Structure

```typescript
// Import all seed data
import { seedData, validateSeedData } from './src/data/seed';

// Validate before seeding
const validation = validateSeedData();
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Access specific data
const { translations, projects, users, roles, quickQuestions } = seedData;
```

### Seed Data Files

```
src/data/seed/
├── index.ts                 # Central export and validation
├── translations.ts          # 80+ UI strings (EN/FR)
├── defaultSettings.ts       # Themes & accessibility presets
├── sampleProjects.ts        # 3 fully configured projects
├── sampleUsers.ts           # 8 users with roles
└── quickQuestions.ts        # 24 sample questions
```

### Validation

The seed data includes comprehensive validation:

```powershell
# Seed script automatically validates before inserting
npm run cosmos:seed

# Manual validation in code
import { validateSeedData, getSeedDataSummary } from './src/data/seed';

const validation = validateSeedData();
console.log(validation.valid); // true/false
console.log(validation.errors); // Array of error messages
console.log(validation.warnings); // Array of warnings

console.log(getSeedDataSummary()); // Human-readable summary
```

---

## 💻 Development Workflow

### Local Development Without Azure

Set in `.env.local`:

```env
VITE_ENABLE_MOCK_DATA=true
```

The app will use mock data without connecting to Cosmos DB.

### Local Development With Azure

1. Ensure Azure CLI is authenticated: `az login`
2. Set in `.env.local`:

```env
VITE_ENABLE_MOCK_DATA=false
VITE_COSMOS_DB_AUTH_METHOD=managedIdentity
```

3. The app will use your Azure CLI credentials automatically

### Testing Cosmos DB Connection

```powershell
# Start dev server
npm run dev

# Check console for:
# ✓ [CosmosDB] Connected to database: eva-da-2
# ✓ [CosmosDB] Container initialized: users
# etc.
```

### Switching Between Mock and Real Data

```powershell
# Use mock data
$env:VITE_ENABLE_MOCK_DATA="true"
npm run dev

# Use Cosmos DB
$env:VITE_ENABLE_MOCK_DATA="false"
npm run dev
```

---

## 🔍 Troubleshooting

### Connection Issues

**Error:** `Failed to initialize Cosmos DB client`

**Solutions:**

1. Verify endpoint URL in `.env.local`
2. Check Azure CLI login: `az account show`
3. Verify network connectivity: `Test-NetConnection your-cosmos-account.documents.azure.com -Port 443`
4. Check firewall rules on Cosmos DB account

### Authentication Issues

**Error:** `Unauthorized` or `Authentication failed`

**Solutions:**

1. Re-authenticate Azure CLI: `az login --tenant your-tenant-id`
2. Verify RBAC permissions:

```powershell
az cosmosdb sql role assignment list \
  --account-name your-cosmos-account \
  --resource-group your-rg
```

3. Grant required permissions:

```powershell
az cosmosdb sql role assignment create \
  --account-name your-cosmos-account \
  --resource-group your-rg \
  --role-definition-name "Cosmos DB Built-in Data Contributor" \
  --principal-id YOUR_OBJECT_ID \
  --scope "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RG/providers/Microsoft.DocumentDB/databaseAccounts/YOUR_COSMOS_ACCOUNT"
```

### Seeding Issues

**Error:** `Container not found`

**Solution:** Run container initialization first:

```powershell
npm run cosmos:init
```

**Error:** `Duplicate key error`

**Solution:** Data already exists. To re-seed:

1. Delete existing containers in Azure Portal
2. Run setup again: `npm run cosmos:setup`

### Performance Issues

**Slow queries or timeouts**

**Solutions:**

1. Check RU/s allocation in Azure Portal
2. Verify indexing policies are properly configured
3. Review query patterns and add indexes if needed
4. Increase `VITE_COSMOS_DB_REQUEST_TIMEOUT` in `.env.local`

---

## 📊 Monitoring & Diagnostics

### Enable Diagnostic Logging

In `.env.local`:

```env
VITE_COSMOS_DB_ENABLE_DIAGNOSTICS=true
VITE_ENABLE_DEBUG_LOGGING=true
```

### Check Cosmos DB Metrics

1. Open Azure Portal
2. Navigate to your Cosmos DB account
3. Go to **Metrics** blade
4. Monitor:
   - Total Requests
   - Total Request Units
   - Data & Index Usage
   - Throttled Requests

### View Application Logs

```powershell
# Browser console shows:
# - [CosmosDB] operations
# - [DatabaseService] operations
# - Connection status
# - Query execution times
```

---

## 🚀 Production Deployment

### Deployment Checklist

- [ ] Cosmos DB account created with production settings
- [ ] Managed Identity enabled on App Service/Container App
- [ ] RBAC permissions granted to Managed Identity
- [ ] Environment variables configured
- [ ] Containers initialized (`npm run cosmos:init`)
- [ ] Data seeded (`npm run cosmos:seed`)
- [ ] Mock data disabled (`VITE_ENABLE_MOCK_DATA=false`)
- [ ] Connection tested
- [ ] Monitoring configured

### Best Practices

1. **Use Managed Identity** - Never use connection strings in production
2. **Enable Firewall** - Restrict network access to trusted sources
3. **Configure Backups** - Set up automatic backups and retention
4. **Monitor RU Usage** - Set up alerts for throttling
5. **Use Shared Throughput** - More cost-effective for multiple containers
6. **Enable Point-in-Time Restore** - For data recovery scenarios

---

## 📚 Additional Resources

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Cosmos DB Best Practices](https://docs.microsoft.com/azure/cosmos-db/best-practice-dotnet)
- [Managed Identity Guide](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [EVA DA 2.0 Architecture](./ARCHITECTURE.md)

---

## ✨ Summary

You now have:

✅ **Azure Cosmos DB client** with Managed Identity auth  
✅ **8 containers** with optimized partition keys  
✅ **Comprehensive seed data** with 150+ records  
✅ **Dual-mode support** (Cosmos DB + Mock data)  
✅ **Automated setup scripts** for easy deployment  
✅ **Production-ready configuration** following Azure best practices  

**Next Steps:**

1. Run `npm run cosmos:setup` to initialize your database
2. Start the dev server: `npm run dev`
3. Verify data in Azure Portal
4. Begin development! 🎉
