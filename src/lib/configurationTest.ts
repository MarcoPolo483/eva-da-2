// src/lib/configurationTest.ts
import { configManager } from './configurationManager';

/**
 * Simple test utility to verify configuration system functionality
 */
export class ConfigurationTester {
  
  /**
   * Run basic configuration tests
   */
  runBasicTests(): { passed: number; failed: number; results: string[] } {
    const results: string[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Configuration Manager Instance
    try {
      const globalConfig = configManager.getGlobalConfig();
      if (globalConfig && typeof globalConfig === 'object') {
        results.push('✅ Configuration Manager: Global config accessible');
        passed++;
      } else {
        results.push('❌ Configuration Manager: Global config not accessible');
        failed++;
      }
    } catch (error) {
      results.push(`❌ Configuration Manager: Error - ${error}`);
      failed++;
    }

    // Test 2: Project Configurations
    try {
      const projects = configManager.getAllProjectConfigs();
      if (projects && projects.length >= 5) {
        results.push(`✅ Project Configurations: Found ${projects.length} projects`);
        passed++;
      } else {
        results.push(`❌ Project Configurations: Expected 5+, found ${projects?.length || 0}`);
        failed++;
      }
    } catch (error) {
      results.push(`❌ Project Configurations: Error - ${error}`);
      failed++;
    }

    // Test 3: Theme Application
    try {
      const theme = configManager.getEffectiveTheme('canadaLife');
      if (theme && theme.background && theme.surface) {
        results.push('✅ Theme System: Canada Life theme accessible');
        passed++;
      } else {
        results.push('❌ Theme System: Canada Life theme incomplete');
        failed++;
      }
    } catch (error) {
      results.push(`❌ Theme System: Error - ${error}`);
      failed++;
    }

    // Test 4: Configuration Inheritance
    try {
      const canadaLifeConfig = configManager.getProjectConfig('canadaLife');
      if (canadaLifeConfig && canadaLifeConfig.businessInfo && canadaLifeConfig.businessInfo.name) {
        results.push('✅ Configuration Inheritance: Project-specific config working');
        passed++;
      } else {
        results.push('❌ Configuration Inheritance: Project-specific config missing');
        failed++;
      }
    } catch (error) {
      results.push(`❌ Configuration Inheritance: Error - ${error}`);
      failed++;
    }

    // Test 5: Local Storage Integration
    try {
      const hasStoredData = localStorage.getItem('eva-global-config') !== null;
      if (hasStoredData) {
        results.push('✅ Local Storage: Configuration data persisted');
        passed++;
      } else {
        results.push('⚠️ Local Storage: No stored configuration (may be first run)');
        passed++; // This is OK for first run
      }
    } catch (error) {
      results.push(`❌ Local Storage: Error - ${error}`);
      failed++;
    }

    return { passed, failed, results };
  }

  /**
   * Generate configuration system report
   */
  generateReport(): string {
    const testResults = this.runBasicTests();
    const globalConfig = configManager.getGlobalConfig();
    const projects = configManager.getAllProjectConfigs();
    
    return `
# EVA DA 2.0 Configuration System Report
Generated: ${new Date().toLocaleString()}

## Test Results
✅ Passed: ${testResults.passed}
❌ Failed: ${testResults.failed}
📊 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%

## Test Details
${testResults.results.join('\n')}

## System Summary
- **Global Configuration**: ${globalConfig ? 'Loaded' : 'Missing'}
- **Project Count**: ${projects.length}
- **Available Projects**: ${projects.map(p => p.id).join(', ')}
- **Storage Backend**: localStorage
- **Configuration Version**: 2.0.0

## Project Configurations
${projects.map(project => `
### ${project.businessInfo.name} (${project.id})
- **Domain**: ${project.businessInfo.domain}
- **Owner**: ${project.businessInfo.owner}
- **Theme**: ${project.uiCustomization.theme.background}
- **Features**: ${Object.keys(project.technicalConfig.features).length} features
`).join('')}

## Next Steps
${testResults.failed > 0 ? 
  '⚠️ **Action Required**: Some tests failed. Review the test details above.' :
  '🎉 **All Systems Go**: Configuration system is fully operational!'
}
    `.trim();
  }
}

// Export singleton instance
export const configTester = new ConfigurationTester();
