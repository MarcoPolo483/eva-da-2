/**
 * EVA DA 2.0 - Local Demo Server
 * Provides mock API responses for local development and demonstration
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock responses for EVA DA 2.0 demo
const mockResponses = {
  chat: {
    canadaLife: [
      "Hello! I'm EVA, your Enterprise Virtual Assistant for Canada Life projects. How can I help you today?",
      "I can assist with Canada Life policies, claims processing, and customer service inquiries. What specific information do you need?",
      "Based on your query, I recommend reviewing the latest Canada Life policy updates. Would you like me to provide more details?"
    ],
    jurisprudence: [
      "Bonjour! Je suis EVA, votre assistant virtuel pour les questions juridiques. Comment puis-je vous aider?",
      "I can help analyze legal precedents and jurisprudence. What specific legal topic are you researching?",
      "Based on the legal context, here are the relevant case laws and regulations that apply to your situation."
    ],
    admin: [
      "Welcome to EVA Administration Dashboard. I can help with system configuration, user management, and platform analytics.",
      "System status: All 6 agents operational. Platform health: Excellent. Would you like to view detailed metrics?",
      "I can assist with multi-agent coordination, security compliance, and performance optimization. What would you like to configure?"
    ]
  },
  agentStatus: {
    agent1: { status: 'active', health: 100, lastUpdate: new Date().toISOString() },
    agent2: { status: 'active', health: 95, lastUpdate: new Date().toISOString() },
    agent3: { status: 'active', health: 98, lastUpdate: new Date().toISOString() },
    agent4: { status: 'active', health: 100, lastUpdate: new Date().toISOString() },
    agent5: { status: 'active', health: 97, lastUpdate: new Date().toISOString() },
    agent6: { status: 'active', health: 99, lastUpdate: new Date().toISOString() }
  },
  sampleConversations: {
    canadaLife: [
      {
        id: 'demo-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'What are the benefits of the new Canada Life wellness program?',
        assistant: 'The new Canada Life wellness program offers comprehensive health benefits including...'
      }
    ],
    jurisprudence: [
      {
        id: 'demo-2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: 'Can you help me find precedents for employment law cases?',
        assistant: 'Certainly! Based on recent jurisprudence, here are the relevant employment law precedents...'
      }
    ]
  }
};

// API Routes

// Chat completion endpoint
app.post('/api/chat/completions', (req, res) => {
  const { messages, projectId = 'canadaLife' } = req.body;
  
  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const userQuery = lastMessage?.content || '';
  
  // Select appropriate response based on project
  const responses = mockResponses.chat[projectId] || mockResponses.chat.canadaLife;
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  // Simulate processing time
  setTimeout(() => {
    res.json({
      id: `demo-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'eva-da-2.0-demo',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: userQuery.length / 4,
        completion_tokens: response.length / 4,
        total_tokens: (userQuery.length + response.length) / 4
      }
    });
  }, 500 + Math.random() * 1000); // Random delay 500-1500ms
});

// Agent status endpoint
app.get('/api/agents/status', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    platform: 'EVA DA 2.0',
    version: '1.0.0',
    agents: mockResponses.agentStatus,
    overallHealth: 98,
    activeAgents: 6,
    totalAgents: 6
  });
});

// Sample conversations endpoint
app.get('/api/conversations/:projectId', (req, res) => {
  const { projectId } = req.params;
  const conversations = mockResponses.sampleConversations[projectId] || [];
  
  res.json({
    projectId,
    conversations,
    total: conversations.length
  });
});

// Security status endpoint
app.get('/api/security/status', (req, res) => {
  res.json({
    securityLevel: 'ProtectedB',
    status: 'SECURE',
    lastAudit: new Date().toISOString(),
    validations: {
      managedIdentity: { status: 'PASS', details: 'Demo mode - validation skipped' },
      rbac: { status: 'PASS', details: 'All roles configured' },
      encryption: { status: 'PASS', details: 'TLS 1.3 enabled' },
      audit: { status: 'PASS', details: 'Logging active' }
    }
  });
});

// Performance metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    platform: {
      uptime: '99.9%',
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      throughput: Math.floor(Math.random() * 1000) + 500,
      errorRate: '0.1%'
    },
    agents: {
      'agent-1': { cpu: Math.random() * 30 + 10, memory: Math.random() * 40 + 20 },
      'agent-2': { cpu: Math.random() * 25 + 15, memory: Math.random() * 35 + 25 },
      'agent-3': { cpu: Math.random() * 20 + 10, memory: Math.random() * 30 + 20 },
      'agent-4': { cpu: Math.random() * 15 + 5, memory: Math.random() * 25 + 15 },
      'agent-5': { cpu: Math.random() * 35 + 20, memory: Math.random() * 45 + 30 },
      'agent-6': { cpu: Math.random() * 20 + 10, memory: Math.random() * 30 + 20 }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'operational',
      database: 'operational',
      agents: 'operational',
      security: 'operational'
    }
  });
});

// Demo endpoints
app.get('/api/demo/info', (req, res) => {
  res.json({
    title: 'EVA DA 2.0 - Enterprise Virtual Assistant Demo',
    description: 'Multi-agent platform for Government of Canada use cases',
    features: [
      'Multi-agent architecture with 6 specialized agents',
      'Bilingual support (English/French)',
      'Government of Canada accessibility compliance',
      'Protected B security implementation',
      'PubSec Info Assistant Design System integration',
      'Real-time monitoring and analytics'
    ],
    agents: {
      'agent-1': 'Data Architecture - Cosmos DB with HPK',
      'agent-2': 'Design System - UI/UX with IA integration',
      'agent-3': 'Monitoring - Application Insights & metrics',
      'agent-4': 'Security - Protected B compliance',
      'agent-5': 'API Integration - OpenAI & multi-agent coordination',
      'agent-6': 'Configuration - Infrastructure automation'
    },
    demoMode: true,
    timestamp: new Date().toISOString()
  });
});

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EVA DA 2.0 Demo Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/demo/info`);
  console.log(`   - POST /api/chat/completions`);
  console.log(`   - GET  /api/agents/status`);
  console.log(`   - GET  /api/security/status`);
  console.log(`   - GET  /api/metrics`);
  console.log(`   - GET  /api/conversations/:projectId`);
  console.log(`🎯 Demo ready for local development!`);
});

module.exports = app;
