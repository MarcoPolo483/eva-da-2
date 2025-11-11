// Configuration Management UI for EVA DA 2.0
// Provides environment-aware configuration interface

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface EnvironmentConfig {
  displayName: string;
  description: string;
  azure: {
    subscriptionId: string;
    resourceGroup: string;
    location: string;
    tags: Record<string, string>;
  };
  cosmos: {
    consistencyLevel: string;
    multiRegion: boolean;
    throughput: {
      database: number;
      maxAutoScale: number;
    };
  };
  openai: {
    location: string;
    models: Record<string, {
      name: string;
      version: string;
      capacity: number;
    }>;
  };
  functions: {
    sku: string;
    tier: string;
    workerCount: number;
  };
  monitoring: {
    logAnalytics: {
      sku: string;
      retentionDays: number;
    };
  };
  security: {
    allowPublicAccess: boolean;
    requireManagedIdentity: boolean;
    enableDiagnostics: boolean;
  };
  features: Record<string, boolean>;
}

interface ConfigurationState {
  environments: Record<string, EnvironmentConfig>;
  currentEnvironment: string;
  deploymentStatus: Record<string, 'idle' | 'deploying' | 'deployed' | 'failed'>;
}

export function ConfigurationManagement() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ConfigurationState | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'environments' | 'secrets' | 'deployment'>('overview');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('dev');
  const [isLoading, setIsLoading] = useState(true);
  const [deploymentLogs, setDeploymentLogs] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would fetch from your configuration API
      const response = await fetch('/api/configuration/environments');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deployEnvironment = async (environment: string) => {
    try {
      setConfig(prev => prev ? {
        ...prev,
        deploymentStatus: { ...prev.deploymentStatus, [environment]: 'deploying' }
      } : null);

      // Start deployment
      const response = await fetch(`/api/deployment/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment, iacTool: 'terraform' })
      });

      if (response.ok) {
        setConfig(prev => prev ? {
          ...prev,
          deploymentStatus: { ...prev.deploymentStatus, [environment]: 'deployed' }
        } : null);
      } else {
        throw new Error('Deployment failed');
      }
    } catch (error) {
      setConfig(prev => prev ? {
        ...prev,
        deploymentStatus: { ...prev.deploymentStatus, [environment]: 'failed' }
      } : null);
      console.error('Deployment failed:', error);
    }
  };

  const validateEnvironment = async (environment: string) => {
    try {
      const response = await fetch(`/api/configuration/validate/${environment}`);
      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading configuration...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold">Configuration Load Failed</h3>
        <p className="text-red-600 mt-2">Unable to load environment configuration.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuration Management</h1>
        <p className="text-gray-600 mt-2">
          Manage infrastructure automation and environment configurations for EVA DA 2.0
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '📊 Overview', icon: '📊' },
            { key: 'environments', label: '🌍 Environments', icon: '🌍' },
            { key: 'secrets', label: '🔐 Secrets', icon: '🔐' },
            { key: 'deployment', label: '🚀 Deployment', icon: '🚀' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(config.environments).map(([env, envConfig]) => (
            <div key={env} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">{env}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  config.deploymentStatus[env] === 'deployed' 
                    ? 'bg-green-100 text-green-800'
                    : config.deploymentStatus[env] === 'deploying'
                    ? 'bg-yellow-100 text-yellow-800'
                    : config.deploymentStatus[env] === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {config.deploymentStatus[env] || 'Not Deployed'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{envConfig.azure.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cosmos RUs:</span>
                  <span className="font-medium">{envConfig.cosmos.throughput.database}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Function SKU:</span>
                  <span className="font-medium">{envConfig.functions.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Multi-region:</span>
                  <span className={`font-medium ${envConfig.cosmos.multiRegion ? 'text-green-600' : 'text-gray-600'}`}>
                    {envConfig.cosmos.multiRegion ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => deployEnvironment(env)}
                  disabled={config.deploymentStatus[env] === 'deploying'}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {config.deploymentStatus[env] === 'deploying' ? 'Deploying...' : 'Deploy'}
                </button>
                <button
                  onClick={() => validateEnvironment(env)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                >
                  Validate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'environments' && (
        <div className="space-y-6">
          {/* Environment Selector */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Environment:</label>
            <select 
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {Object.keys(config.environments).map(env => (
                <option key={env} value={env}>{env.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Environment Configuration */}
          {config.environments[selectedEnvironment] && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Azure Configuration */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">☁️ Azure Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Group</label>
                    <input 
                      type="text" 
                      value={config.environments[selectedEnvironment].azure.resourceGroup}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input 
                      type="text" 
                      value={config.environments[selectedEnvironment].azure.location}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subscription ID</label>
                    <input 
                      type="text" 
                      value={config.environments[selectedEnvironment].azure.subscriptionId}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Cosmos DB Configuration */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">🗄️ Cosmos DB</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Consistency Level</label>
                    <input 
                      type="text" 
                      value={config.environments[selectedEnvironment].cosmos.consistencyLevel}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Throughput (RU/s)</label>
                    <input 
                      type="number" 
                      value={config.environments[selectedEnvironment].cosmos.throughput.database}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Auto-Scale (RU/s)</label>
                    <input 
                      type="number" 
                      value={config.environments[selectedEnvironment].cosmos.throughput.maxAutoScale}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      readOnly
                    />
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={config.environments[selectedEnvironment].cosmos.multiRegion}
                      className="h-4 w-4 text-blue-600 rounded"
                      readOnly
                    />
                    <label className="ml-2 block text-sm text-gray-700">Multi-region deployment</label>
                  </div>
                </div>
              </div>

              {/* Functions Configuration */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">⚡ Azure Functions</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input 
                      type="text" 
                      value={config.environments[selectedEnvironment].functions.sku}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tier</label>
                    <input 
                      type="text" 
                      value={config.environments[selectedEnvironment].functions.tier}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Worker Count</label>
                    <input 
                      type="number" 
                      value={config.environments[selectedEnvironment].functions.workerCount}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Security Configuration */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">🛡️ Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={config.environments[selectedEnvironment].security.allowPublicAccess}
                      className="h-4 w-4 text-blue-600 rounded"
                      readOnly
                    />
                    <label className="ml-2 block text-sm text-gray-700">Allow public access</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={config.environments[selectedEnvironment].security.requireManagedIdentity}
                      className="h-4 w-4 text-blue-600 rounded"
                      readOnly
                    />
                    <label className="ml-2 block text-sm text-gray-700">Require managed identity</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={config.environments[selectedEnvironment].security.enableDiagnostics}
                      className="h-4 w-4 text-blue-600 rounded"
                      readOnly
                    />
                    <label className="ml-2 block text-sm text-gray-700">Enable diagnostics</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'secrets' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">🔐 Key Vault Secrets Management</h3>
          <p className="text-gray-600 mb-6">
            Manage application secrets across environments. Use the PowerShell scripts for secret operations.
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">PowerShell Commands</h4>
              <div className="mt-2 space-y-2 text-sm font-mono text-blue-800">
                <div>./manage-secrets.ps1 -Environment dev -Action list</div>
                <div>./manage-secrets.ps1 -Environment dev -Action create -SecretName "my-secret" -SecretValue "value"</div>
                <div>./manage-secrets.ps1 -Environment dev -Action rotate -SecretName "jwt-signing-key"</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(config.environments).map(env => (
                <div key={env} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium capitalize mb-2">{env} Environment</h5>
                  <div className="text-sm text-gray-600">
                    <div>Key Vault: kv-eva-da-2-{env}</div>
                    <div>Standard Secrets: 6</div>
                  </div>
                  <button className="mt-3 w-full bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm">
                    View Secrets
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deployment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Deployment Status</h3>
            
            <div className="space-y-4">
              {Object.entries(config.environments).map(([env, envConfig]) => (
                <div key={env} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium capitalize">{env} Environment</h4>
                      <p className="text-sm text-gray-600">{envConfig.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      config.deploymentStatus[env] === 'deployed' 
                        ? 'bg-green-100 text-green-800'
                        : config.deploymentStatus[env] === 'deploying'
                        ? 'bg-yellow-100 text-yellow-800'
                        : config.deploymentStatus[env] === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {config.deploymentStatus[env] || 'Not Deployed'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => deployEnvironment(env)}
                      disabled={config.deploymentStatus[env] === 'deploying'}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {config.deploymentStatus[env] === 'deploying' ? 'Deploying...' : 'Deploy Infrastructure'}
                    </button>
                    <button className="border border-gray-300 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50">
                      What-If Analysis
                    </button>
                    <button className="border border-gray-300 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50">
                      View Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Deployment Commands</h3>
            <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
              <div># Deploy using PowerShell script</div>
              <div>./deploy-infrastructure.ps1 -Environment dev -IacTool terraform</div>
              <div></div>
              <div># Deploy using Azure CLI</div>
              <div>az deployment group create --resource-group rg-eva-da-2-dev --template-file main.bicep</div>
              <div></div>
              <div># Deploy using Terraform</div>
              <div>terraform workspace select dev && terraform apply</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfigurationManagement;
