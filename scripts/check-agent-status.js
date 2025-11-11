// EVA DA 2.0 - Agent Status Monitor
// Real-time status checker for all 6 AI agents
// Run: node check-agent-status.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = 'C:\\Users\\marco.presta\\dev\\eva-da-2';
const AGENTS_ROOT = path.join(PROJECT_ROOT, 'agents');

// Agent configuration with expected deliverables
const AGENTS = [
  {
    id: 1,
    name: 'Data Architecture',
    icon: '🔵',
    workspace: 'agent-1-data-architecture',
    focus: 'HPK Cosmos DB & Enterprise Data Patterns',
    keyFiles: [
      'src/data/CosmosClient.js',
      'infra/terraform/main.tf',
      'src/data/models/CosmosDBModels.js'
    ],
    deliverables: [
      'HPK-optimized Cosmos DB containers',
      'JavaScript client with retry logic',
      'Enterprise data models',
      'Terraform infrastructure'
    ]
  },
  {
    id: 2,
    name: 'Design System',
    icon: '🟣',
    workspace: 'agent-2-design-system',
    focus: 'Government UI/UX & Accessibility',
    keyFiles: [
      'src/components/design-system/themes/EnterpriseTheme.ts',
      'src/components/design-system/components/BeautifulComponents.tsx',
      'src/components/design-system/styles/beautiful-ui.css'
    ],
    deliverables: [
      'Glass morphism theme system',
      'Accessible React components',
      'Government compliance validation',
      'Mobile-responsive layouts'
    ]
  },
  {
    id: 3,
    name: 'Monitoring',
    icon: '🟢',
    workspace: 'agent-3-monitoring',
    focus: 'Azure Monitor & Performance',
    keyFiles: [
      'src/monitoring/ApplicationInsights.js',
      'src/monitoring/CosmosDBMetrics.js',
      'dashboards/performance-dashboard.json'
    ],
    deliverables: [
      'Application Insights integration',
      'Cosmos DB performance monitoring',
      'Real-time dashboards',
      'Alerting configuration'
    ]
  },
  {
    id: 4,
    name: 'Security',
    icon: '🟡',
    workspace: 'agent-4-security',
    focus: 'Enterprise Security & Compliance',
    keyFiles: [
      'security/managed-identity-config.json',
      'security/rbac-permissions.tf',
      'security/compliance-validation.js'
    ],
    deliverables: [
      'Managed Identity validation',
      'RBAC configuration',
      'Security scanning',
      'Government compliance'
    ]
  },
  {
    id: 5,
    name: 'API Integration',
    icon: '🔴',
    workspace: 'agent-5-api-integration',
    focus: 'Azure Functions & OpenAI APIs',
    keyFiles: [
      'functions/ChatAPI.js',
      'functions/package.json',
      'api/openai-integration.js'
    ],
    deliverables: [
      'Streaming chat API',
      'OpenAI integration',
      'Multi-agent orchestration',
      'Performance optimization'
    ]
  },
  {
    id: 6,
    name: 'Configuration',
    icon: '⚙️',
    workspace: 'agent-6-configuration',
    focus: 'Terraform IaC & DevOps',
    keyFiles: [
      'infra/terraform/main.tf',
      'infra/terraform/variables.tf',
      'scripts/deployment-pipeline.yml'
    ],
    deliverables: [
      'Multi-environment Terraform',
      'CI/CD pipeline',
      'Configuration management',
      'Backup & recovery'
    ]
  }
];

console.log('🎯 EVA DA 2.0 - Agent Status Monitor');
console.log('===================================');
console.log(`📅 Scan Time: ${new Date().toLocaleString()}`);
console.log(`📂 Project Root: ${PROJECT_ROOT}`);

async function checkAgentStatus() {
  const results = {
    summary: {
      totalAgents: AGENTS.length,
      readyAgents: 0,
      inProgressAgents: 0,
      notStartedAgents: 0
    },
    agents: []
  };

  console.log('\n📊 AGENT STATUS OVERVIEW:');
  console.log('========================');

  for (const agent of AGENTS) {
    const agentPath = path.join(AGENTS_ROOT, agent.workspace);
    const agentStatus = await analyzeAgent(agent, agentPath);
    
    results.agents.push(agentStatus);
    
    // Update summary
    if (agentStatus.readinessScore >= 80) {
      results.summary.readyAgents++;
    } else if (agentStatus.readinessScore >= 30) {
      results.summary.inProgressAgents++;
    } else {
      results.summary.notStartedAgents++;
    }
    
    // Display status
    const statusIcon = getStatusIcon(agentStatus.readinessScore);
    const progressBar = createProgressBar(agentStatus.readinessScore);
    
    console.log(`\n${agent.icon} Agent ${agent.id}: ${agent.name} ${statusIcon}`);
    console.log(`   Focus: ${agent.focus}`);
    console.log(`   Progress: ${progressBar} ${agentStatus.readinessScore}%`);
    console.log(`   Status: ${agentStatus.status}`);
    
    if (agentStatus.completedTasks.length > 0) {
      console.log(`   ✅ Completed: ${agentStatus.completedTasks.join(', ')}`);
    }
    
    if (agentStatus.pendingTasks.length > 0) {
      console.log(`   ⏳ Pending: ${agentStatus.pendingTasks.join(', ')}`);
    }
    
    if (agentStatus.issues.length > 0) {
      console.log(`   ❌ Issues: ${agentStatus.issues.join(', ')}`);
    }
  }

  console.log('\n🎯 COORDINATION STATUS:');
  console.log('======================');
  
  // Check agent coordination files
  const coordinationStatus = checkCoordination();
  console.log(`Shared Config: ${coordinationStatus.sharedConfig ? '✅' : '❌'}`);
  console.log(`Workspace Files: ${coordinationStatus.workspaceFiles}/${AGENTS.length} created`);
  console.log(`Launch Scripts: ${coordinationStatus.launchScripts ? '✅' : '❌'}`);

  console.log('\n☁️ AZURE INFRASTRUCTURE STATUS:');
  console.log('===============================');
  
  const azureStatus = await checkAzureInfrastructure();
  console.log(`Subscription Access: ${azureStatus.subscriptionAccess ? '✅' : '❌'}`);
  console.log(`Resource Groups: ${azureStatus.resourceGroups}`);
  console.log(`Terraform State: ${azureStatus.terraformState ? '✅' : '⚠️'}`);

  console.log('\n📈 OVERALL PROJECT STATUS:');
  console.log('=========================');
  
  const overallReadiness = Math.round(
    results.agents.reduce((sum, agent) => sum + agent.readinessScore, 0) / results.agents.length
  );
  
  console.log(`Overall Readiness: ${createProgressBar(overallReadiness)} ${overallReadiness}%`);
  console.log(`Ready Agents: ${results.summary.readyAgents}/${results.summary.totalAgents}`);
  console.log(`In Progress: ${results.summary.inProgressAgents}/${results.summary.totalAgents}`);
  console.log(`Not Started: ${results.summary.notStartedAgents}/${results.summary.totalAgents}`);

  console.log('\n🚀 NEXT STEPS:');
  console.log('==============');
  
  if (overallReadiness < 50) {
    console.log('1. Run: .\\scripts\\launch-6-agents.ps1 -DeployAzure');
    console.log('2. Open VS Code workspaces for each agent');
    console.log('3. Send coordination messages to agents');
  } else if (overallReadiness < 80) {
    console.log('1. Focus on agents with lowest readiness scores');
    console.log('2. Complete pending infrastructure deployment');
    console.log('3. Validate inter-agent coordination');
  } else {
    console.log('1. Final integration testing');
    console.log('2. Performance optimization');
    console.log('3. Documentation and deployment');
  }

  return results;
}

async function analyzeAgent(agent, agentPath) {
  const status = {
    agentId: agent.id,
    name: agent.name,
    workspace: agent.workspace,
    exists: fs.existsSync(agentPath),
    readinessScore: 0,
    status: 'Not Started',
    completedTasks: [],
    pendingTasks: [],
    issues: [],
    keyFiles: []
  };

  if (!status.exists) {
    status.issues.push('Workspace not created');
    return status;
  }

  // Check key files
  let filesFound = 0;
  for (const file of agent.keyFiles) {
    const filePath = path.join(PROJECT_ROOT, file);
    const exists = fs.existsSync(filePath);
    
    status.keyFiles.push({
      file,
      exists,
      size: exists ? fs.statSync(filePath).size : 0
    });
    
    if (exists) {
      filesFound++;
      status.completedTasks.push(`${path.basename(file)} created`);
    } else {
      status.pendingTasks.push(`Create ${path.basename(file)}`);
    }
  }

  // Calculate readiness score
  const fileScore = (filesFound / agent.keyFiles.length) * 60; // 60% for files
  const workspaceScore = status.exists ? 20 : 0; // 20% for workspace
  
  // Check for README and specific progress indicators
  const readmePath = path.join(agentPath, 'README.md');
  const readmeScore = fs.existsSync(readmePath) ? 20 : 0; // 20% for documentation
  
  status.readinessScore = Math.round(fileScore + workspaceScore + readmeScore);

  // Determine status
  if (status.readinessScore >= 80) {
    status.status = 'Ready for Deployment';
  } else if (status.readinessScore >= 50) {
    status.status = 'In Progress';
  } else if (status.readinessScore >= 20) {
    status.status = 'Started';
  } else {
    status.status = 'Not Started';
  }

  // Agent-specific checks
  await performAgentSpecificChecks(agent, status);

  return status;
}

async function performAgentSpecificChecks(agent, status) {
  switch (agent.id) {
    case 1: // Data Architecture
      // Check for Cosmos DB models
      const modelsPath = path.join(PROJECT_ROOT, 'src', 'data', 'models');
      if (fs.existsSync(modelsPath)) {
        status.completedTasks.push('Data models structure');
      }
      
      // Check Terraform files
      const terraformPath = path.join(PROJECT_ROOT, 'infra', 'terraform', 'main.tf');
      if (fs.existsSync(terraformPath)) {
        const terraformContent = fs.readFileSync(terraformPath, 'utf8');
        if (terraformContent.includes('azurerm_cosmosdb_account')) {
          status.completedTasks.push('Cosmos DB infrastructure');
        }
        if (terraformContent.includes('partition_key_paths')) {
          status.completedTasks.push('HPK configuration');
        }
      }
      break;

    case 2: // Design System
      // Check for theme files
      const themePath = path.join(PROJECT_ROOT, 'src', 'components', 'design-system');
      if (fs.existsSync(themePath)) {
        status.completedTasks.push('Theme structure');
      }
      
      // Check for CSS files
      const cssPath = path.join(themePath, 'styles', 'beautiful-ui.css');
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        if (cssContent.includes('glass-card')) {
          status.completedTasks.push('Glass morphism styles');
        }
        if (cssContent.includes('prefers-reduced-motion')) {
          status.completedTasks.push('Accessibility support');
        }
      }
      break;

    case 5: // API Integration
      // Check for Function App files
      const functionsPath = path.join(PROJECT_ROOT, 'src', 'data', 'azure', 'FunctionApp');
      if (fs.existsSync(functionsPath)) {
        status.completedTasks.push('Functions structure');
      }
      
      // Check package.json for Azure Functions dependencies
      const packagePath = path.join(functionsPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        if (packageJson.dependencies && packageJson.dependencies['@azure/functions']) {
          status.completedTasks.push('Azure Functions dependencies');
        }
      }
      break;

    case 6: // Configuration
      // Check Terraform variables
      const tfvarsPath = path.join(PROJECT_ROOT, 'infra', 'terraform', 'terraform.tfvars');
      if (fs.existsSync(tfvarsPath)) {
        const tfvarsContent = fs.readFileSync(tfvarsPath, 'utf8');
        if (tfvarsContent.includes('c59ee575-eb2a-4b51-a865-4b618f9add0a')) {
          status.completedTasks.push('Azure subscription configured');
        }
      }
      break;
  }
}

function checkCoordination() {
  const sharedConfigPath = path.join(AGENTS_ROOT, 'shared-config.json');
  const launchScriptPath = path.join(PROJECT_ROOT, 'scripts', 'launch-6-agents.ps1');
  
  let workspaceFiles = 0;
  for (const agent of AGENTS) {
    const workspacePath = path.join(AGENTS_ROOT, `${agent.workspace}.code-workspace`);
    if (fs.existsSync(workspacePath)) {
      workspaceFiles++;
    }
  }

  return {
    sharedConfig: fs.existsSync(sharedConfigPath),
    launchScripts: fs.existsSync(launchScriptPath),
    workspaceFiles
  };
}

async function checkAzureInfrastructure() {
  let subscriptionAccess = false;
  let resourceGroups = 'Unknown';
  let terraformState = false;

  try {
    // Check Azure CLI access
    const accountInfo = execSync('az account show --output json 2>nul', { encoding: 'utf8' });
    const account = JSON.parse(accountInfo);
    subscriptionAccess = account.id === 'c59ee575-eb2a-4b51-a865-4b618f9add0a';

    // Check resource groups
    if (subscriptionAccess) {
      const rgList = execSync('az group list --query "length([?contains(name, \'eva-da-2\')])" --output tsv 2>nul', { encoding: 'utf8' });
      resourceGroups = rgList.trim();
    }
  } catch (error) {
    // Azure CLI not available or not logged in
  }

  // Check Terraform state
  const terraformDir = path.join(PROJECT_ROOT, 'infra', 'terraform');
  const tfStatePath = path.join(terraformDir, 'terraform.tfstate');
  terraformState = fs.existsSync(tfStatePath);

  return {
    subscriptionAccess,
    resourceGroups: resourceGroups || '0',
    terraformState
  };
}

function getStatusIcon(score) {
  if (score >= 80) return '🟢';
  if (score >= 50) return '🟡';
  if (score >= 20) return '🟠';
  return '🔴';
}

function createProgressBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Run the status check
checkAgentStatus()
  .then(results => {
    console.log(`\n📊 Status check completed successfully!`);
    
    // Save results to file
    const resultsPath = path.join(PROJECT_ROOT, 'agent-status-report.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`📄 Detailed report saved to: ${resultsPath}`);
  })
  .catch(error => {
    console.error('❌ Status check failed:', error.message);
    process.exit(1);
  });