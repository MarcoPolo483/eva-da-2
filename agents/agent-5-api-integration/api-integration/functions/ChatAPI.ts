// Azure Functions v4 Programming Model - Chat API
// Implements streaming chat responses with Azure OpenAI integration
// Uses Managed Identity authentication and enterprise-grade error handling

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { DefaultAzureCredential } from '@azure/identity';
// import { createEVACosmosClient, getCosmosConfig } from '../data/azure/CosmosClient';
// import { ConversationRepository } from '../data/repositories/ConversationRepository';
// import type { ChatConversationDocument, ChatMessageDocument } from '../data/models/CosmosDBModels';

// Mock types for standalone deployment
interface ChatConversationDocument {
  conversationId: string;
  title: string;
  dataClassification: string;
}

// Mock functions for standalone deployment
function createEVACosmosClient(config: any): any {
  return {};
}

function getCosmosConfig(env: string): any {
  return { endpoint: process.env.COSMOS_DB_ENDPOINT };
}

class ConversationRepository {
  constructor(client: any) {}
  
  async getConversation(tenantId: string, userId: string, conversationId: string) {
    // Mock implementation
    return {
      data: {
        conversationId,
        title: 'Mock Conversation',
        dataClassification: 'internal'
      } as ChatConversationDocument
    };
  }
  
  async createConversation(tenantId: string, userId: string, conversation: any) {
    // Mock implementation
    return {
      data: {
        conversationId: `conv_${Date.now()}`,
        title: conversation.title || 'New Conversation',
        dataClassification: 'internal'
      } as ChatConversationDocument
    };
  }
  
  async updateConversationActivity(
    tenantId: string, 
    userId: string, 
    conversationId: string, 
    message: string, 
    role: string, 
    timestamp: string, 
    tokenUsage: number
  ) {
    // Mock implementation
    return { success: true };
  }
}

// Performance metrics (simplified for standalone)
const metricsStore: any[] = [];
function recordMetric(
  endpoint: string,
  method: string, 
  statusCode: number,
  responseTime: number,
  tokenUsage?: number,
  requestCharge?: number,
  requestId?: string
): void {
  metricsStore.push({
    endpoint,
    method,
    statusCode,
    responseTime,
    tokenUsage: tokenUsage || 0,
    requestCharge: requestCharge || 0,
    requestId: requestId || '',
    timestamp: new Date().toISOString()
  });
}

/**
 * Chat request interface
 */
interface ChatRequest {
  tenantId: string;
  userId: string;
  conversationId?: string;
  message: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  agentId?: string;
  workflowId?: string;
}

/**
 * Chat response interface
 */
interface ChatResponse {
  conversationId: string;
  messageId: string;
  content: string;
  role: 'assistant';
  timestamp: string;
  metadata: {
    model: string;
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    finishReason: string;
    processingTime: number;
  };
  requestCharge: number;
  activityId: string;
}

/**
 * Environment configuration
 */
const config = {
  openaiEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  openaiApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
  cosmosEndpoint: process.env.COSMOS_DB_ENDPOINT || '',
  defaultModel: process.env.DEFAULT_OPENAI_MODEL || 'gpt-4',
  maxTokens: parseInt(process.env.MAX_TOKENS || '4000'),
  temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
  enableDiagnostics: process.env.ENABLE_DIAGNOSTICS === 'true'
};

/**
 * Initialize services with Managed Identity
 */
let openaiClient: OpenAIClient;
let conversationRepo: ConversationRepository;

async function initializeServices(context: InvocationContext): Promise<void> {
  if (!openaiClient) {
    // Use Managed Identity for Azure OpenAI authentication
    const credential = new DefaultAzureCredential();
    openaiClient = new OpenAIClient(
      config.openaiEndpoint,
      credential,
      {
        apiVersion: config.openaiApiVersion,
        userAgentOptions: {
          userAgentPrefix: 'EVA-DA-2.0-ChatAPI/1.0'
        }
      }
    );
    
    context.log('OpenAI client initialized with Managed Identity');
  }

  if (!conversationRepo) {
    // Initialize Cosmos DB client
    const cosmosConfig = getCosmosConfig(
      (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'production'
    );
    const cosmosClient = await createEVACosmosClient(cosmosConfig);
    conversationRepo = new ConversationRepository(cosmosClient);
    
    context.log('Cosmos DB client initialized');
  }
}

/**
 * Chat API endpoint - handles both streaming and non-streaming responses
 */
async function chatHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  
  try {
    // Initialize services
    await initializeServices(context);

    // Validate request method
    if (request.method !== 'POST') {
      return {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': 'POST'
        },
        body: JSON.stringify({
          error: 'Method not allowed',
          message: 'Only POST method is supported'
        })
      };
    }

    // Parse and validate request body
    let chatRequest: ChatRequest;
    try {
      const requestBody = await request.text();
      chatRequest = JSON.parse(requestBody) as ChatRequest;
    } catch (error) {
      context.log('Invalid JSON in request body:', error);
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Invalid JSON in request body'
        })
      };
    }

    // Validate required fields
    const validationError = validateChatRequest(chatRequest);
    if (validationError) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Bad Request',
          message: validationError
        })
      };
    }

    context.log(`Chat request for tenant: ${chatRequest.tenantId}, user: ${chatRequest.userId}`);

    // Get or create conversation
    let conversation: ChatConversationDocument;
    if (chatRequest.conversationId) {
      const existingConv = await conversationRepo.getConversation(
        chatRequest.tenantId,
        chatRequest.userId,
        chatRequest.conversationId
      );
      
      if (!existingConv) {
        return {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Conversation Not Found',
            message: `Conversation ${chatRequest.conversationId} not found`
          })
        };
      }
      
      conversation = existingConv.data;
    } else {
      // Create new conversation
      const newConvResult = await conversationRepo.createConversation(
        chatRequest.tenantId,
        chatRequest.userId,
        {
          title: generateConversationTitle(chatRequest.message),
          isArchived: false,
          isPinned: false,
          tags: [],
          dataClassification: 'internal',
          retentionPolicy: { autoDelete: false },
          summary: {
            messageCount: 0,
            lastMessage: { content: '', timestamp: new Date().toISOString(), role: 'system' },
            participants: [chatRequest.userId],
            totalTokens: 0
          },
          agentContext: {
            activeWorkflows: chatRequest.workflowId ? [chatRequest.workflowId] : [],
            lastAgentUsed: chatRequest.agentId || '',
            preferredAgents: [],
            orchestrationHistory: []
          }
        }
      );
      
      conversation = newConvResult.data;
      context.log(`Created new conversation: ${conversation.conversationId}`);
    }

    // Prepare chat completion request
    const messages = [
      {
        role: 'system' as const,
        content: buildSystemPrompt(conversation, chatRequest)
      },
      {
        role: 'user' as const,
        content: chatRequest.message
      }
    ];

    const completionOptions = {
      model: chatRequest.model || config.defaultModel,
      messages,
      temperature: chatRequest.temperature ?? config.temperature,
      maxTokens: chatRequest.maxTokens || config.maxTokens,
      stream: chatRequest.stream || false
    };

    context.log(`Calling Azure OpenAI with model: ${completionOptions.model}`);    // Call Azure OpenAI
    const response = await openaiClient.getChatCompletions(
      completionOptions.model,
      messages,
      {
        temperature: completionOptions.temperature,
        maxTokens: completionOptions.maxTokens
        // Note: streaming handled separately in handleStreamingResponse
      }
    );if (completionOptions.stream) {
      // Handle streaming response - implement Server-Sent Events (SSE)
      const streamResponse = await handleStreamingResponse(
        openaiClient,
        completionOptions,
        conversation,
        chatRequest,
        context,
        startTime
      );
      
      return streamResponse;
    } else {
      // Handle non-streaming response
      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new Error('No response from OpenAI');
      }

      const assistantMessage = choice.message.content || '';
      const processingTime = Date.now() - startTime;
      const timestamp = new Date().toISOString();

      // Update conversation activity
      await conversationRepo.updateConversationActivity(
        chatRequest.tenantId,
        chatRequest.userId,
        conversation.conversationId,
        assistantMessage,
        'assistant',
        timestamp,
        response.usage?.totalTokens || 0
      );

      // Prepare response
      const chatResponse: ChatResponse = {
        conversationId: conversation.conversationId,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: assistantMessage,
        role: 'assistant',
        timestamp,
        metadata: {
          model: completionOptions.model,
          tokenUsage: {
            promptTokens: response.usage?.promptTokens || 0,
            completionTokens: response.usage?.completionTokens || 0,
            totalTokens: response.usage?.totalTokens || 0
          },
          finishReason: choice.finishReason || 'stop',
          processingTime
        },
        requestCharge: 0, // Would be populated from Cosmos operations
        activityId: context.invocationId
      };      context.log(`Chat completion successful in ${processingTime}ms`);

      // Record performance metrics
      recordMetric(
        '/api/chat',
        'POST',
        200,
        processingTime,
        response.usage?.totalTokens || 0,
        0, // Request charge would come from Cosmos operations
        context.invocationId
      );

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Processing-Time-Ms': processingTime.toString(),
          'X-Token-Usage': response.usage?.totalTokens?.toString() || '0'
        },
        body: JSON.stringify(chatResponse)
      };
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    context.log('Chat API error:', error);

    // Handle specific error types
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number; message?: string };
      
      if (statusError.status === 429) {
        return {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          },
          body: JSON.stringify({
            error: 'Rate Limited',
            message: 'Too many requests. Please try again later.',
            retryAfter: 60
          })
        };
      }
      
      if (statusError.status === 401) {
        return {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Unauthorized',
            message: 'Invalid authentication credentials'
          })
        };
      }
    }

    // Generic error response
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time-Ms': processingTime.toString()
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing your request',
        requestId: context.invocationId
      })
    };
  }
}

/**
 * Handle streaming chat response with Server-Sent Events
 */
async function handleStreamingResponse(
  client: OpenAIClient,
  options: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature: number;
    maxTokens: number;
  },
  conversation: ChatConversationDocument,
  request: ChatRequest,
  context: InvocationContext,
  startTime: number
): Promise<HttpResponseInit> {
  try {    // Call streaming API - simplified for demo
    // In production, use: const stream = await client.getChatCompletions(..., { stream: true });
    interface MockChunk {
      choices: Array<{
        delta?: { content?: string };
        finishReason?: string;
      }>;
    }
    
    const mockStreamChunks: MockChunk[] = [
      { choices: [{ delta: { content: "Hello! " } }] },
      { choices: [{ delta: { content: "I'm EVA, " } }] },
      { choices: [{ delta: { content: "your enterprise assistant. " } }] },
      { choices: [{ delta: { content: "How can I help you today?" } }] },
      { choices: [{ finishReason: "stop" }] }
    ];

    let fullContent = '';
    let tokenCount = 0;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create SSE response stream
    const sseData: string[] = [];
    
    // Send initial event
    sseData.push(`data: ${JSON.stringify({
      type: 'start',
      conversationId: conversation.conversationId,
      messageId,
      timestamp: new Date().toISOString()
    })}\n\n`);    // Simulate streaming for demo (replace with real OpenAI streaming)
    for (const chunk of mockStreamChunks) {
      const choice = chunk.choices[0];
      if (choice?.delta?.content) {
        const content = choice.delta.content;
        fullContent += content;
        tokenCount++;

        // Send content chunk
        sseData.push(`data: ${JSON.stringify({
          type: 'content',
          messageId,
          content,
          timestamp: new Date().toISOString()
        })}\n\n`);
        
        // Simulate streaming delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (choice?.finishReason) {
        // Send completion event
        const processingTime = Date.now() - startTime;
        sseData.push(`data: ${JSON.stringify({
          type: 'complete',
          messageId,
          conversationId: conversation.conversationId,
          finishReason: choice.finishReason,
          processingTime,
          tokenCount,
          timestamp: new Date().toISOString()
        })}\n\n`);
        break;
      }
    }

    // Save message to conversation (async, don't wait)
    conversationRepo.updateConversationActivity(
      request.tenantId,
      request.userId,
      conversation.conversationId,
      fullContent,
      'assistant',
      new Date().toISOString(),
      tokenCount
    ).catch(error => context.log('Failed to save streaming message:', error));

    // Send end event
    sseData.push(`data: [DONE]\n\n`);

    return {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Processing-Time-Ms': (Date.now() - startTime).toString()
      },
      body: sseData.join('')
    };

  } catch (error) {
    context.log('Streaming error:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Streaming failed',
        message: 'Unable to stream response',
        requestId: context.invocationId
      })
    };
  }
}

/**
 * Multi-Agent Orchestration Interfaces
 */
interface AgentRequest {
  tenantId: string;
  userId: string;
  workflowId: string;
  agentIds: string[];
  task: string;
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
}

interface AgentResponse {
  workflowId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: AgentExecutionResult;
  error?: string;
  processingTime: number;
  timestamp: string;
}

interface WorkflowStatus {
  workflowId: string;
  status: 'initializing' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    totalAgents: number;
    completedAgents: number;
    failedAgents: number;
  };
  results: AgentResponse[];
  startTime: string;
  endTime?: string;
  totalProcessingTime?: number;
}

/**
 * Multi-Agent Orchestration endpoint
 */
async function agentOrchestrationHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();

  try {
    if (request.method !== 'POST') {
      return {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const agentRequest: AgentRequest = JSON.parse(await request.text());

    // Validate agent request
    if (!agentRequest.tenantId || !agentRequest.userId || !agentRequest.workflowId || !agentRequest.agentIds?.length) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const workflowId = agentRequest.workflowId;
    context.log(`Starting workflow ${workflowId} with ${agentRequest.agentIds.length} agents`);

    // Initialize workflow status
    const workflowStatus: WorkflowStatus = {
      workflowId,
      status: 'initializing',
      progress: {
        totalAgents: agentRequest.agentIds.length,
        completedAgents: 0,
        failedAgents: 0
      },
      results: [],
      startTime: new Date().toISOString()
    };

    // Process agents (simplified simulation - would integrate with actual agent services)
    const agentPromises = agentRequest.agentIds.map(async (agentId) => {
      const agentStartTime = Date.now();
      
      try {
        // Simulate agent processing
        const processingTime = Math.random() * 2000 + 500; // 500-2500ms
        await new Promise(resolve => setTimeout(resolve, processingTime));

        const result = await simulateAgentExecution(agentId, agentRequest.task, context);
        
        const agentResponse: AgentResponse = {
          workflowId,
          agentId,
          status: 'completed',
          result,
          processingTime: Date.now() - agentStartTime,
          timestamp: new Date().toISOString()
        };

        workflowStatus.results.push(agentResponse);
        workflowStatus.progress.completedAgents++;
        
        return agentResponse;
      } catch (error) {
        const agentResponse: AgentResponse = {
          workflowId,
          agentId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - agentStartTime,
          timestamp: new Date().toISOString()
        };

        workflowStatus.results.push(agentResponse);
        workflowStatus.progress.failedAgents++;
        
        return agentResponse;
      }
    });

    // Wait for all agents to complete
    await Promise.allSettled(agentPromises);

    // Finalize workflow
    workflowStatus.status = workflowStatus.progress.failedAgents > 0 ? 'completed' : 'completed';
    workflowStatus.endTime = new Date().toISOString();
    workflowStatus.totalProcessingTime = Date.now() - startTime;

    context.log(`Workflow ${workflowId} completed in ${workflowStatus.totalProcessingTime}ms`);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time-Ms': workflowStatus.totalProcessingTime.toString()
      },
      body: JSON.stringify(workflowStatus)
    };

  } catch (error) {
    context.log('Agent orchestration error:', error);
    
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Orchestration failed',
        message: 'Unable to process agent workflow',
        requestId: context.invocationId
      })
    };
  }
}

/**
 * Simulate agent execution (replace with actual agent service calls)
 */
interface AgentExecutionResult {
  operation: string;
  result: string;
  metrics?: {
    recordsProcessed?: number;
    processingTime?: number;
    cpu?: number;
    memory?: number;
    latency?: number;
  };
  components?: string[];
  findings?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  environments?: string[];
  status?: string;
}

async function simulateAgentExecution(agentId: string, task: string, context: InvocationContext): Promise<AgentExecutionResult> {
  context.log(`Executing agent ${agentId} with task: ${task}`);

  // Agent-specific logic simulation
  switch (agentId) {
    case 'agent-1-data':
      return {
        operation: 'data-analysis',
        result: 'Data processed successfully',
        metrics: { recordsProcessed: 1500, processingTime: 850 }
      };
      
    case 'agent-2-design':
      return {
        operation: 'ui-generation',
        result: 'UI components generated',
        components: ['header', 'navigation', 'content-panel']
      };
      
    case 'agent-3-monitoring':
      return {
        operation: 'performance-check',
        result: 'System metrics collected',
        metrics: { cpu: 45, memory: 67, latency: 120 }
      };
      
    case 'agent-4-security':
      return {
        operation: 'security-scan',
        result: 'Security validation passed',
        findings: { critical: 0, high: 1, medium: 3, low: 5 }
      };
      
    case 'agent-6-config':
      return {
        operation: 'configuration-update',
        result: 'Configuration deployed successfully',
        environments: ['dev', 'staging', 'prod']
      };
      
    default:
      return {
        operation: 'generic-task',
        result: `Task completed by ${agentId}`,
        status: 'success'
      };
  }
}

/**
 * Workflow Status endpoint
 */
async function workflowStatusHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const workflowId = request.params.workflowId;
    
    if (!workflowId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Workflow ID required' })
      };
    }

    // In a real implementation, retrieve status from storage
    // For now, return mock status
    const mockStatus: WorkflowStatus = {
      workflowId,
      status: 'running',
      progress: { totalAgents: 5, completedAgents: 3, failedAgents: 0 },
      results: [],
      startTime: new Date(Date.now() - 30000).toISOString() // Started 30 seconds ago
    };

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockStatus)
    };

  } catch (error) {
    context.log('Workflow status error:', error);
    
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unable to retrieve workflow status' })
    };
  }
}

/**
 * Agent Registry endpoint - lists available agents and their capabilities
 */
async function agentRegistryHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const agentRegistry = {
      agents: [
        {
          id: 'agent-1-data',
          name: 'Data Architecture Expert',
          capabilities: ['data-modeling', 'cosmos-db', 'performance-optimization'],
          status: 'available',
          version: '2.0.0',
          endpoints: ['/api/data/query', '/api/data/optimize']
        },
        {
          id: 'agent-2-design',
          name: 'Design System Expert',
          capabilities: ['ui-generation', 'component-library', 'accessibility'],
          status: 'available',
          version: '2.0.0',
          endpoints: ['/api/design/generate', '/api/design/validate']
        },
        {
          id: 'agent-3-monitoring',
          name: 'Monitoring Expert',
          capabilities: ['performance-monitoring', 'alerting', 'diagnostics'],
          status: 'available',
          version: '2.0.0',
          endpoints: ['/api/monitor/metrics', '/api/monitor/alerts']
        },
        {
          id: 'agent-4-security',
          name: 'Security Expert',
          capabilities: ['security-scanning', 'compliance-check', 'vulnerability-assessment'],
          status: 'available',
          version: '2.0.0',
          endpoints: ['/api/security/scan', '/api/security/validate']
        },
        {
          id: 'agent-5-api',
          name: 'API Integration Expert',
          capabilities: ['api-development', 'performance-optimization', 'streaming'],
          status: 'available',
          version: '2.0.0',
          endpoints: ['/api/chat', '/api/orchestrate', '/api/status']
        },
        {
          id: 'agent-6-config',
          name: 'Configuration Expert',
          capabilities: ['infrastructure-deployment', 'configuration-management', 'automation'],
          status: 'available',
          version: '2.0.0',
          endpoints: ['/api/config/deploy', '/api/config/validate']
        }
      ],
      totalAgents: 6,
      availableAgents: 6,
      lastUpdated: new Date().toISOString()
    };

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentRegistry)
    };

  } catch (error) {
    context.log('Agent registry error:', error);
    
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unable to retrieve agent registry' })
    };
  }
}

/**
 * Validate chat request
 */
function validateChatRequest(request: ChatRequest): string | null {
  if (!request.tenantId || typeof request.tenantId !== 'string') {
    return 'tenantId is required and must be a string';
  }
  
  if (!request.userId || typeof request.userId !== 'string') {
    return 'userId is required and must be a string';
  }
  
  if (!request.message || typeof request.message !== 'string') {
    return 'message is required and must be a string';
  }
  
  if (request.message.length > 32000) {
    return 'message is too long (maximum 32,000 characters)';
  }
  
  if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
    return 'temperature must be between 0 and 2';
  }
  
  if (request.maxTokens !== undefined && (request.maxTokens < 1 || request.maxTokens > 8000)) {
    return 'maxTokens must be between 1 and 8000';
  }
  
  return null;
}

/**
 * Build system prompt based on conversation context
 */
function buildSystemPrompt(conversation: ChatConversationDocument, request: ChatRequest): string {
  const basePrompt = `You are EVA (Enterprise Virtual Assistant), an AI assistant designed for government and enterprise environments. 

Current conversation context:
- Data Classification: ${conversation.dataClassification}
- Language Support: English and French (bilingual responses when appropriate)
- Compliance: Follow Government of Canada standards and accessibility guidelines

Guidelines:
- Provide accurate, helpful, and professional responses
- Maintain appropriate tone for government/enterprise context
- Respect data classification and privacy requirements
- If uncertain, acknowledge limitations and suggest appropriate resources`;

  // Add agent-specific context if available
  if (request.agentId) {
    return `${basePrompt}

Agent Context:
- Active Agent: ${request.agentId}
- Workflow: ${request.workflowId || 'None'}
- Specialized Role: Provide responses tailored to your specific agent capabilities`;
  }

  return basePrompt;
}

/**
 * Generate conversation title from first message
 */
function generateConversationTitle(message: string): string {
  // Simple title generation - could be enhanced with AI
  const truncated = message.length > 50 ? message.substring(0, 47) + '...' : message;
  return truncated.replace(/\n/g, ' ').trim() || 'New Conversation';
}

// Register HTTP trigger function
app.http('chat', {
  methods: ['POST'],
  authLevel: 'function', // Use function-level auth - can be changed based on requirements
  route: 'chat',
  handler: chatHandler
});

// Health check endpoint
app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      // Basic health check
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
          openai: !!config.openaiEndpoint,
          cosmos: !!config.cosmosEndpoint
        }
      };

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(health)
      };
    } catch (error) {
      context.log('Health check failed:', error);
      
      return {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Service health check failed'
        })
      };
    }
  }
});

// Multi-Agent Orchestration endpoint
app.http('orchestrate', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'orchestrate',
  handler: agentOrchestrationHandler
});

// Workflow Status endpoint
app.http('workflowStatus', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'workflow/{workflowId}',
  handler: workflowStatusHandler
});

// Agent Registry endpoint
app.http('agentRegistry', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'agents',
  handler: agentRegistryHandler
});