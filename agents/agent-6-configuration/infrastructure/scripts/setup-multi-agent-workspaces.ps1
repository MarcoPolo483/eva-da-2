# Multi-Agent Workspace Setup Script
# Sets up 6 specialized GitHub Copilot development environments

param(
    [string]$ProjectPath = "C:\Users\marco.presta\dev\eva-da-2"
)

Write-Host "🤖 Multi-Agent Development Orchestration Setup" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue

# Function to create directory structure
function New-AgentDirectories {
    param([string]$BasePath, [array]$Directories)
    
    foreach ($Dir in $Directories) {
        $FullPath = Join-Path $BasePath $Dir
        if (-not (Test-Path $FullPath)) {
            New-Item -ItemType Directory -Path $FullPath -Force | Out-Null
            Write-Host "  ✅ Created: $Dir" -ForegroundColor Green
        }
    }
}

# Agent 1: Data Architecture & Azure Integration
Write-Host "`n🔵 Setting up Agent 1: Data Architecture & Azure Integration" -ForegroundColor Cyan

$Agent1Dirs = @(
    "src\data\models",
    "src\data\repositories", 
    "src\data\azure\FunctionApp",
    "infrastructure\bicep",
    "infrastructure\terraform",
    "docs\data-architecture"
)

New-AgentDirectories -BasePath $ProjectPath -Directories $Agent1Dirs

# Create Agent 1 workspace instructions
$Agent1Instructions = @"
# 🔵 Data Architecture & Azure Integration Agent

## Mission: Azure Cosmos DB, Data Modeling & Backend Infrastructure

### 🎯 Tonight's Priority Tasks:

#### 1. Azure Cosmos DB Container Design (HPK Optimization)
``````typescript
// File: src/data/models/CosmosDBModels.ts
interface ChatConversationDocument {
  id: string;
  tenantId: string;        // HPK Level 1
  userId: string;          // HPK Level 2  
  conversationId: string;  // HPK Level 3
  type: 'conversation' | 'message' | 'context';
  // ... rest of schema
}
``````

#### 2. Azure Functions API Endpoints
- Chat API with streaming responses
- Parameter management with validation
- Real-time monitoring endpoints
- User context management

#### 3. Data Repository Pattern
- Singleton CosmosClient with retry logic
- Proper error handling (429 throttling)
- Diagnostic logging for performance
- Multi-tenant data isolation

### 🛠 Azure Best Practices Checklist:
- [ ] Use latest Cosmos DB SDK (@azure/cosmos)
- [ ] Implement connection retries and preferred regions
- [ ] Handle 429 errors with retry-after logic
- [ ] Log diagnostic strings for performance monitoring
- [ ] Use HPK to overcome 20GB partition limits
- [ ] Optimize partition keys for query patterns
- [ ] Implement proper connection pooling
- [ ] Use async APIs for better throughput

### 📋 File Priority Order:
1. CosmosDBModels.ts - Core data schemas
2. CosmosClient.ts - Singleton client setup
3. ConversationRepository.ts - Chat data operations
4. ChatAPI.ts - Azure Function for chat
5. cosmos-db.bicep - Infrastructure template

### 🔗 Integration Points:
- Share type definitions with all other agents
- Provide API schemas for Agent 5 (API Integration)
- Coordinate with Agent 4 for security patterns
"@

Set-Content -Path "$ProjectPath\AGENT-1-DATA-ARCHITECTURE.md" -Value $Agent1Instructions

# Agent 2: UI/UX & Design System
Write-Host "`n🎨 Setting up Agent 2: UI/UX & Design System" -ForegroundColor Cyan

$Agent2Dirs = @(
    "src\design-system\components\admin",
    "src\design-system\components\dashboard", 
    "src\design-system\components\accessibility",
    "src\design-system\tokens",
    "src\design-system\themes",
    "src\design-system\utils",
    ".storybook\addons",
    "stories\admin",
    "stories\dashboard",
    "stories\accessibility"
)

New-AgentDirectories -BasePath $ProjectPath -Directories $Agent2Dirs

$Agent2Instructions = @"
# 🎨 UI/UX & Design System Agent

## Mission: Component Library, Accessibility & User Interface

### 🎯 Tonight's Priority Tasks:

#### 1. Extract IA Design System
``````bash
# Run the setup script first
.\scripts\setup-design-system.ps1
``````

#### 2. Build Enterprise Admin Components
- Parameter registry forms with real-time validation
- Multi-section navigation with progress tracking  
- Feature flag management interface
- Resource allocation controls with visual feedback

#### 3. Ensure WCAG 2.1 AA Compliance
- Screen reader optimization (ARIA labels)
- Keyboard navigation (focus management)
- Color contrast validation (4.5:1 minimum)
- Reduced motion preferences

### ♿ Accessibility Requirements Checklist:
- [ ] All components have proper ARIA labels
- [ ] Full keyboard navigation support
- [ ] Screen reader announcements for dynamic content
- [ ] High contrast mode compatibility
- [ ] Bilingual support (EN/FR switching)
- [ ] Government branding compliance
- [ ] Focus indicators clearly visible
- [ ] Skip links for complex interfaces

### 📋 Component Priority Order:
1. ParameterForm.tsx - Configuration forms with validation
2. MetricCard.tsx - Real-time metrics display
3. LiveRegion.tsx - Screen reader announcements
4. SectionNavigation.tsx - Multi-section interface
5. AgentStatusCard.tsx - Agent monitoring display

### 🎨 Design Token Priorities:
1. Government color palette (Canada.ca compliance)
2. Accessible typography scales
3. Consistent spacing system
4. Focus indicator styles
5. Animation preferences (reduced motion)

### 🔗 Integration Points:
- Use type definitions from Agent 1
- Provide components to Agent 3 (Monitoring)
- Coordinate with Agent 4 for security UI patterns
- Share design tokens with Agent 6 (Configuration)
"@

Set-Content -Path "$ProjectPath\AGENT-2-DESIGN-SYSTEM.md" -Value $Agent2Instructions

# Agent 3: Real-Time Monitoring & Dashboard
Write-Host "`n⚡ Setting up Agent 3: Real-Time Monitoring & Dashboard" -ForegroundColor Cyan

$Agent3Dirs = @(
    "src\monitoring\agents",
    "src\monitoring\metrics",
    "src\monitoring\alerts", 
    "src\monitoring\dashboards",
    "src\hooks\monitoring"
)

New-AgentDirectories -BasePath $ProjectPath -Directories $Agent3Dirs

$Agent3Instructions = @"
# ⚡ Real-Time Monitoring & Dashboard Agent

## Mission: Performance Monitoring, Real-Time Dashboards & Agent Orchestration

### 🎯 Tonight's Priority Tasks:

#### 1. Agent Orchestration System
``````typescript
// File: src/monitoring/agents/AgentOrchestrator.ts
interface AgentWorkflow {
  id: string;
  name: string;
  sequence: AgentTask[];
  coordination: 'sequential' | 'parallel' | 'pipeline';
  priority: 'low' | 'medium' | 'high' | 'critical';
}
``````

#### 2. Real-Time Metrics Pipeline
- Azure Monitor integration with custom metrics
- Performance analytics with trend analysis  
- Cost tracking and attribution by tenant/user
- Resource utilization monitoring

#### 3. Alert Management System
- Threshold-based alerting with smart escalation
- Multi-channel notifications (Teams, email, SMS)
- Alert correlation and noise reduction
- Historical alert analysis

### 📊 Monitoring Architecture Checklist:
- [ ] Real-time data collection (5-second intervals)
- [ ] Agent health monitoring and recovery
- [ ] Performance bottleneck detection
- [ ] Cost optimization recommendations
- [ ] Predictive analytics for scaling
- [ ] Multi-tenant resource isolation
- [ ] Historical data retention policies
- [ ] Dashboard responsiveness optimization

### 📋 Implementation Priority Order:
1. MetricsCollector.ts - Real-time data collection
2. AgentHealthMonitor.ts - Agent performance tracking
3. AlertManager.ts - Threshold management
4. RealTimeDashboard.tsx - Live monitoring interface
5. CostAnalyzer.ts - Cost attribution system

### 🎛 Dashboard Components Needed:
- Real-time metrics grid (API calls, response times, errors)
- Agent status cards (6 specialized agents)
- Alert management panel with severity levels
- Cost analysis with tenant breakdown
- Performance trends and predictions

### 🔗 Integration Points:
- Use data models from Agent 1
- Use UI components from Agent 2
- Coordinate with Agent 6 for configuration management
- Share metrics schema with Agent 5 for API integration
"@

Set-Content -Path "$ProjectPath\AGENT-3-MONITORING.md" -Value $Agent3Instructions

# Agent 4: Security & Compliance
Write-Host "`n🔒 Setting up Agent 4: Security & Compliance" -ForegroundColor Cyan

$Agent4Dirs = @(
    "src\security\authentication",
    "src\security\classification",
    "src\security\compliance",
    "src\security\legal",
    "src\hooks\security",
    "compliance\frameworks"
)

New-AgentDirectories -BasePath $ProjectPath -Directories $Agent4Dirs

$Agent4Instructions = @"
# 🔒 Security & Compliance Agent

## Mission: Government Security, Data Classification & Compliance Frameworks

### 🎯 Tonight's Priority Tasks:

#### 1. Azure AD Integration with RBAC
``````typescript
// File: src/security/authentication/AzureADProvider.ts
interface UserRole {
  tenantId: string;
  userId: string;
  roles: ('admin' | 'user' | 'viewer' | 'auditor')[];
  permissions: string[];
  dataClassificationLevel: 'public' | 'internal' | 'protected_a' | 'protected_b';
}
``````

#### 2. Protected B Data Handling
- Data classification and labeling system
- PII detection and automatic redaction
- Secure data storage and transmission
- Access logging and audit trails

#### 3. Government Compliance Framework
- Terms of use acceptance and tracking
- Privacy policy enforcement
- Security audit logging
- Data retention and disposal policies

### 🛡 Security Framework Checklist:
- [ ] Azure AD B2C integration for external users
- [ ] Role-based access control (RBAC) implementation
- [ ] Protected B data classification and handling
- [ ] PII detection and redaction utilities
- [ ] Security audit trail with immutable logs
- [ ] Terms of use acceptance tracking
- [ ] Privacy consent management
- [ ] Data encryption at rest and in transit

### 📋 Implementation Priority Order:
1. AzureADProvider.ts - Authentication integration
2. DataClassifier.ts - Protected B classification  
3. PIIDetector.ts - Personal information detection
4. AuditLogger.ts - Security audit trails
5. TermsOfUseService.ts - Legal compliance tracking

### 🔐 Security Patterns:
- Zero-trust architecture principles
- Least privilege access control
- Defense in depth security layers
- Continuous security monitoring
- Automated threat detection

### 🔗 Integration Points:
- Use data models from Agent 1 for audit storage
- Provide auth components to Agent 2
- Share security metrics with Agent 3
- Coordinate with Agent 6 for secure configuration
"@

Set-Content -Path "$ProjectPath\AGENT-4-SECURITY-COMPLIANCE.md" -Value $Agent4Instructions

# Agent 5: API Integration & External Services
Write-Host "`n🌐 Setting up Agent 5: API Integration & External Services" -ForegroundColor Cyan

$Agent5Dirs = @(
    "src\services\openai",
    "src\services\azure",
    "src\services\integration",
    "src\services\validation",
    "integration\policies",
    "integration\tests",
    "src\hooks\integration"
)

New-AgentDirectories -BasePath $ProjectPath -Directories $Agent5Dirs

$Agent5Instructions = @"
# 🌐 API Integration & External Services Agent

## Mission: External APIs, APIM Policies & Service Integration

### 🎯 Tonight's Priority Tasks:

#### 1. APIM Policy Management
``````xml
<!-- File: integration/policies/rate-limiting.xml -->
<rate-limit calls="1000" renewal-period="3600" />
<quota calls="10000" renewal-period="86400" />
<retry condition="@(context.Response.StatusCode >= 500)" count="3" interval="1" />
``````

#### 2. OpenAI Integration
- Prompt template management and versioning
- Response validation and safety filtering
- Token usage tracking and optimization
- Streaming response handling

#### 3. Resilience Patterns
- Circuit breaker implementation
- Exponential backoff retry logic
- Request/response caching strategies
- Health check monitoring

### 🔌 Integration Architecture Checklist:
- [ ] APIM policies for rate limiting and security
- [ ] OpenAI API integration with streaming
- [ ] Azure Translator service integration
- [ ] Circuit breaker pattern implementation
- [ ] Request/response validation schemas
- [ ] API health monitoring and alerts
- [ ] Integration testing automation
- [ ] Performance optimization strategies

### 📋 Implementation Priority Order:
1. OpenAIClient.ts - Core API integration
2. APIGateway.ts - APIM integration layer
3. CircuitBreaker.ts - Resilience patterns
4. PromptManager.ts - Template management
5. IntegrationTester.ts - Automated testing

### 🔄 Resilience Patterns:
- Circuit breaker for external service failures
- Retry with exponential backoff
- Request deduplication
- Response caching with TTL
- Graceful degradation strategies

### 🔗 Integration Points:
- Use data models from Agent 1 for API schemas
- Coordinate with Agent 4 for API security
- Share service status with Agent 3 for monitoring
- Use configuration from Agent 6 for API settings
"@

Set-Content -Path "$ProjectPath\AGENT-5-API-INTEGRATION.md" -Value $Agent5Instructions

# Agent 6: Configuration & DevOps
Write-Host "`n📝 Setting up Agent 6: Configuration & DevOps" -ForegroundColor Cyan

$Agent6Dirs = @(
    "src\configuration\registry",
    "src\configuration\management",
    "src\configuration\deployment",
    ".github\workflows",
    "infrastructure\environments",
    "scripts\deployment"
)

New-AgentDirectories -BasePath $ProjectPath -Directories $Agent6Dirs

$Agent6Instructions = @"
# 📝 Configuration & DevOps Agent

## Mission: Parameter Management, Deployment Automation & Infrastructure

### 🎯 Tonight's Priority Tasks:

#### 1. Parameter Registry Implementation
``````typescript
// File: src/configuration/registry/ParameterRegistry.ts
interface ParameterDefinition {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  validation: ValidationRule[];
  environment: 'all' | 'dev' | 'staging' | 'production';
  classification: 'public' | 'internal' | 'protected_a' | 'protected_b';
}
``````

#### 2. CI/CD Pipeline Configuration
- GitHub Actions for automated building and testing
- Multi-environment deployment automation
- Security scanning and compliance validation
- Rollback procedures and health checks

#### 3. Infrastructure as Code
- Complete Bicep templates for Azure resources
- Environment-specific parameter files
- Automated provisioning and configuration
- Monitoring and alerting setup

### ⚙️ DevOps Pipeline Checklist:
- [ ] GitHub Actions CI/CD workflows
- [ ] Multi-environment deployment strategy
- [ ] Infrastructure as Code (Bicep/Terraform)
- [ ] Automated security scanning
- [ ] Configuration validation and testing
- [ ] Blue-green deployment support
- [ ] Automated rollback procedures
- [ ] Environment health monitoring

### 📋 Implementation Priority Order:
1. ParameterRegistry.ts - Central configuration system
2. ci-build.yml - Continuous integration workflow
3. main.bicep - Infrastructure template
4. ConfigurationService.ts - CRUD operations
5. DeploymentOrchestrator.ts - Automated deployment

### 🚀 Deployment Strategy:
- Environment progression: dev → staging → production
- Feature flag-based rollouts
- Automated testing gates
- Health check validation
- Rollback automation

### 🔗 Integration Points:
- Store configuration used by all other agents
- Coordinate with Agent 1 for infrastructure templates
- Use security patterns from Agent 4
- Integrate with monitoring from Agent 3
"@

Set-Content -Path "$ProjectPath\AGENT-6-CONFIGURATION-DEVOPS.md" -Value $Agent6Instructions

# Create coordination status directory
Write-Host "`n📊 Setting up coordination infrastructure" -ForegroundColor Cyan

$StatusDirs = @(
    "status",
    "coordination\integration-points",
    "coordination\shared-types"
)

New-AgentDirectories -BasePath $ProjectPath -Directories $StatusDirs

# Create shared status template
$StatusTemplate = @"
# Agent Status Report

## Current Time: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

### ✅ Completed Tasks:
- [ ] Task 1
- [ ] Task 2

### 🔄 In Progress:
- [ ] Task 3
- [ ] Task 4

### ⚠️ Blocked/Issues:
- [ ] Issue 1 (waiting for Agent X)
- [ ] Issue 2 (external dependency)

### 🔗 Integration Points:
- **Provides to other agents:** 
- **Depends on from other agents:**

### 📝 Notes:
- Additional context or important discoveries

### 🕐 Next Hour Plan:
- Specific tasks for the next hour
"@

Set-Content -Path "$ProjectPath\status\template.md" -Value $StatusTemplate

# Create VS Code workspace launcher script
$WorkspaceLauncher = @"
# VS Code Multi-Agent Workspace Launcher

Write-Host "🚀 Launching 6 specialized development environments..." -ForegroundColor Blue

# Launch 6 VS Code windows with specific contexts
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/data"
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/design-system" 
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/monitoring"
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/security"
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/services"
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/configuration"

Write-Host "✅ All 6 agent workspaces launched!" -ForegroundColor Green
Write-Host "📋 Check the AGENT-*-*.md files in each window for specific instructions" -ForegroundColor Yellow
"@

Set-Content -Path "$ProjectPath\scripts\launch-multi-agent-workspaces.ps1" -Value $WorkspaceLauncher

Write-Host "`n🎉 Multi-Agent Development Environment Setup Complete!" -ForegroundColor Green

Write-Host "`n📋 Quick Start Instructions:" -ForegroundColor Blue
Write-Host "1. Run: .\scripts\launch-multi-agent-workspaces.ps1" -ForegroundColor White
Write-Host "2. In each VS Code window, open the AGENT-*-*.md file for specific instructions" -ForegroundColor White
Write-Host "3. Each agent has prioritized tasks and integration points defined" -ForegroundColor White
Write-Host "4. Use the status/ directory for hourly coordination updates" -ForegroundColor White

Write-Host "`n🚀 Ready for 6x parallel enterprise development velocity!" -ForegroundColor Green