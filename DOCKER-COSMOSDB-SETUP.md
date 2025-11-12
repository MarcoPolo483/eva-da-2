# 🐳 Docker Desktop & Cosmos DB Emulator Setup Guide

**System**: Windows with Docker Desktop  
**Goal**: Run Azure Cosmos DB Emulator locally for EVA DA 2.0

---

## ✅ **CURRENT STATUS CHECK**

### **Docker Desktop**
- **Installed**: ✅ Version 28.5.1
- **Running**: 🔴 Not Started
- **Action Required**: Start Docker Desktop application

### **WSL (Windows Subsystem for Linux)**
- **Status**: Checking...
- **Ubuntu**: Not yet configured
- **Action Required**: Install Ubuntu distribution

---

## 🚀 **STEP-BY-STEP SETUP**

### **Step 1: Start Docker Desktop**
```powershell
# Open Docker Desktop from Start Menu
# OR use command:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker to start (30-60 seconds)
# Verify it's running:
docker ps
```

**Expected Output**: Empty container list (no errors)

---

### **Step 2: Install Ubuntu in WSL2**
```powershell
# List available distributions
wsl --list --online

# Install Ubuntu (recommended: Ubuntu-22.04)
wsl --install -d Ubuntu-22.04

# This will:
# - Download Ubuntu
# - Install it in WSL2
# - Prompt you to create a username and password
# - Takes 5-10 minutes
```

**During Install**:
1. Terminal window will open
2. Wait for "Installing..." to complete
3. Enter new UNIX username (e.g., `marco`)
4. Enter new password (won't show as you type)
5. Confirm password

---

### **Step 3: Configure Docker Desktop for WSL2**
```powershell
# Open Docker Desktop Settings
# 1. Click Docker icon in system tray
# 2. Select "Settings"
# 3. Go to "Resources" → "WSL Integration"
# 4. Enable integration with Ubuntu-22.04
# 5. Click "Apply & Restart"
```

**Settings to Enable**:
- ✅ Use WSL 2 based engine
- ✅ Enable integration with my default WSL distro
- ✅ Enable integration with additional distros: Ubuntu-22.04

---

### **Step 4: Pull Cosmos DB Emulator Image**

#### **Option A: Linux Emulator (Recommended for WSL/Docker)**
```powershell
# Pull the Linux emulator image
docker pull mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest

# This may take 5-10 minutes (large image ~2GB)
```

#### **Option B: Windows Emulator (Direct Installation)**
```powershell
# Download and install Windows emulator
# https://aka.ms/cosmosdb-emulator
# Use this if Docker approach has issues
```

---

### **Step 5: Run Cosmos DB Emulator Container**

```powershell
# Create and run Cosmos DB emulator
docker run -d `
  --name cosmosdb-emulator `
  -p 8081:8081 `
  -p 10250-10255:10250-10255 `
  -e AZURE_COSMOS_EMULATOR_PARTITION_COUNT=10 `
  -e AZURE_COSMOS_EMULATOR_ENABLE_DATA_PERSISTENCE=true `
  -e AZURE_COSMOS_EMULATOR_IP_ADDRESS_OVERRIDE=127.0.0.1 `
  mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest

# Wait for container to start (30-60 seconds)
# Check status:
docker ps

# View logs:
docker logs cosmosdb-emulator
```

**Expected Output**:
```
Started
```

---

### **Step 6: Verify Cosmos DB Emulator**

```powershell
# Check if emulator is accessible
curl https://localhost:8081/_explorer/index.html -k

# Should return HTML content (data explorer page)
```

**Browser Access**:
- Open: `https://localhost:8081/_explorer/index.html`
- Accept certificate warning (self-signed cert)
- You should see Cosmos DB Data Explorer

---

### **Step 7: Get Emulator Connection String**

The Cosmos DB Emulator always uses the same connection string:

```
AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
```

**Add to EVA DA 2.0 `.env` file**:
```env
COSMOS_DB_ENDPOINT=https://localhost:8081/
COSMOS_DB_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
COSMOS_DB_DATABASE=eva-da-2
```

---

## 🔧 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Docker Desktop Won't Start**
```powershell
# Solution: Check if Hyper-V is enabled
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V

# If not enabled:
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Restart computer
Restart-Computer
```

### **Issue 2: WSL Not Installing**
```powershell
# Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart and try again
Restart-Computer
```

### **Issue 3: Cosmos DB Container Won't Start**
```powershell
# Check container logs
docker logs cosmosdb-emulator

# Remove and recreate
docker rm -f cosmosdb-emulator

# Try with different settings
docker run -d `
  --name cosmosdb-emulator `
  -p 8081:8081 `
  mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest
```

### **Issue 4: Port 8081 Already in Use**
```powershell
# Find what's using port 8081
netstat -ano | findstr :8081

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port for emulator
docker run -d `
  --name cosmosdb-emulator `
  -p 9081:8081 `
  mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest
```

---

## 📋 **VERIFICATION CHECKLIST**

After setup, verify everything works:

- [ ] Docker Desktop is running (green icon in system tray)
- [ ] WSL2 is installed and working (`wsl --list --verbose`)
- [ ] Ubuntu is installed in WSL2
- [ ] Docker can run containers (`docker ps` works)
- [ ] Cosmos DB emulator container is running
- [ ] Emulator UI accessible at https://localhost:8081/_explorer/index.html
- [ ] No port conflicts (8081, 10250-10255 available)

---

## 🎯 **NEXT STEPS FOR EVA DA 2.0**

Once Cosmos DB emulator is running:

### **1. Install Cosmos DB VS Code Extension**
```powershell
# Install from VS Code marketplace
code --install-extension ms-azuretools.vscode-cosmosdb
```

### **2. Connect to Local Emulator**
1. Open VS Code
2. Click Azure icon in sidebar
3. In Cosmos DB section, click "+"
4. Select "Cosmos DB Emulator"
5. Should auto-detect localhost:8081

### **3. Create EVA DA 2.0 Database Structure**
```javascript
// In VS Code Cosmos DB extension:
// 1. Create database: eva-da-2
// 2. Create containers:
//    - projects (partitionKey: /id)
//    - users (partitionKey: /userId)
//    - files (partitionKey: /projectId)
//    - settings (partitionKey: /scope)
//    - chat-history (partitionKey: /userId)
```

### **4. Update EVA DA 2.0 Code**
Replace mock `databaseService.ts` with real Cosmos DB client:

```typescript
import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_DB_KEY!
});

const database = client.database('eva-da-2');
const projectsContainer = database.container('projects');
// ... etc
```

---

## 🚀 **QUICK START COMMANDS**

```powershell
# Start Docker Desktop (if not running)
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait 30 seconds, then start Cosmos DB
docker start cosmosdb-emulator

# Check status
docker ps

# View logs
docker logs cosmosdb-emulator

# Open Data Explorer
start https://localhost:8081/_explorer/index.html

# Stop when done
docker stop cosmosdb-emulator
```

---

## 💡 **ALTERNATIVE: Use Azure Cloud Instead**

If local emulator has issues, you can use Azure Cosmos DB Free Tier:

1. **Create Azure Account**: https://azure.microsoft.com/free/
2. **Create Cosmos DB Account**: Portal → Create Resource → Cosmos DB
3. **Select Free Tier**: 1000 RU/s and 25 GB free forever
4. **Get Connection String**: Keys section in Portal
5. **Use in EVA DA 2.0**: Same code, different connection string

**Benefits**:
- No local setup needed
- Always accessible
- Better for demos
- Free tier sufficient for development

---

## 📊 **ENVIRONMENT STATUS**

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Docker Desktop | ✅ Installed | Start application |
| WSL2 | 🔴 Not configured | Run `wsl --install` |
| Ubuntu | 🔴 Not installed | Install Ubuntu-22.04 |
| Cosmos DB Emulator | 🔴 Not running | Pull and run container |
| VS Code Extension | 🟡 Unknown | Install if needed |

**Next Command to Run**:
```powershell
# Start Docker Desktop first, then:
wsl --install -d Ubuntu-22.04
```

---

## 🎯 **FOR YOUR LAPTOP DEMO**

**Priority Decision**: 
- **Option A**: Use mock database service (current setup) → **FASTEST for demo**
- **Option B**: Setup Cosmos DB emulator → **Takes 30-60 minutes**
- **Option C**: Use Azure Cosmos DB free tier → **Best for real testing**

**Recommendation for Immediate Demo**: 
Stay with mock database service (already working) and focus on building the accessibility UI and theme customization. The database backend can be swapped later without affecting the demo experience!

The UI changes and accessibility features will be much more impressive for your demo than whether it's using a real database or not. 🎨
