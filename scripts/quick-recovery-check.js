#!/usr/bin/env node

/**
 * EVA DA 2.0 - Quick Recovery Validation
 * Rapid assessment script for post-power-surge validation
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 EVA DA 2.0 - Quick Recovery Validation');
console.log('🔍 Performing rapid assessment...\n');

const baseDir = process.cwd();

// Critical files check
const criticalFiles = [
    'MULTI-AGENT-DEVELOPMENT-ORCHESTRATION.md',
    'ARCHITECTURE.md', 
    'BACKLOG.md',
    'src/data/CosmosClient.js',
    'infra/terraform/main.tf',
    'infra/terraform/terraform.tfvars',
    'scripts/launch-6-agents.ps1'
];

console.log('📋 Critical Files Status:');
let filesIntact = 0;

criticalFiles.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
        filesIntact++;
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

console.log(`\n📊 Files Status: ${filesIntact}/${criticalFiles.length} intact (${Math.round((filesIntact/criticalFiles.length)*100)}%)`);

// Agent directories check
const agentDirs = [
    'agents/agent-1-data-architecture',
    'agents/agent-2-design-system',
    'agents/agent-3-monitoring', 
    'agents/agent-4-security',
    'agents/agent-5-api-integration',
    'agents/agent-6-configuration'
];

console.log('\n🤖 Agent Directories Status:');
let agentsIntact = 0;

agentDirs.forEach(dir => {
    const dirPath = path.join(baseDir, dir);
    if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}`);
        agentsIntact++;
    } else {
        console.log(`⚠️ ${dir} - NEEDS RECREATION`);
    }
});

console.log(`\n📊 Agents Status: ${agentsIntact}/${agentDirs.length} intact (${Math.round((agentsIntact/agentDirs.length)*100)}%)`);

// Overall assessment
const overallHealth = Math.round(((filesIntact/criticalFiles.length) + (agentsIntact/agentDirs.length)) / 2 * 100);

console.log('\n' + '='.repeat(60));
console.log('🎯 QUICK ASSESSMENT RESULTS');
console.log('='.repeat(60));
console.log(`📊 Overall Health: ${overallHealth}%`);

if (overallHealth >= 90) {
    console.log('🎉 STATUS: EXCELLENT - Ready to proceed');
    console.log('✅ All critical components intact');
    console.log('💡 Recommendation: Run full consistency check and deploy');
} else if (overallHealth >= 70) {
    console.log('✅ STATUS: GOOD - Minor issues detected');
    console.log('⚠️ Some agent workspaces may need recreation');
    console.log('💡 Recommendation: Run power surge recovery script');
} else if (overallHealth >= 50) {
    console.log('⚠️ STATUS: CONCERNING - Significant issues');
    console.log('🔧 Multiple components need attention');
    console.log('💡 Recommendation: Full recovery protocol required');
} else {
    console.log('🚨 STATUS: CRITICAL - Major damage detected');
    console.log('❌ Core project files compromised');
    console.log('💡 Recommendation: Manual intervention required');
}

console.log('\n🔧 NEXT STEPS:');
if (overallHealth >= 70) {
    console.log('1. Run: node scripts/agent-consistency-check.js');
    console.log('2. Run: .\\scripts\\power-surge-recovery.ps1 -FullRecovery');
    console.log('3. Launch agents: .\\scripts\\launch-6-agents.ps1');
} else {
    console.log('1. Check file integrity manually');
    console.log('2. Run: .\\scripts\\power-surge-recovery.ps1 -FullRecovery');
    console.log('3. Validate all agent work before proceeding');
}

console.log('='.repeat(60));
console.log(`⏰ Assessment completed at: ${new Date().toISOString()}`);

// Exit with appropriate code
process.exit(overallHealth >= 70 ? 0 : 1);
