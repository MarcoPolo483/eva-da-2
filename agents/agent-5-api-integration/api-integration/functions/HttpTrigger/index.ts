// EVA DA 2.0 - Enterprise Azure Functions API
// Agent 5: API Integration Expert

interface ApiResponse {
    status?: number;
    headers?: Record<string, string>;
    body: any;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
}

interface AgentInfo {
    id: string;
    name: string;
    description: string;
    status: 'online' | 'offline' | 'busy';
    capabilities: string[];
}

// Mock data for demonstration
const agents: AgentInfo[] = [
    {
        id: 'agent-1-data',
        name: 'Data Architecture Expert',
        description: 'Cosmos DB operations & data optimization',
        status: 'online',
        capabilities: ['cosmosdb', 'data-modeling', 'performance-optimization']
    },
    {
        id: 'agent-2-design',
        name: 'Design System Expert', 
        description: 'UI components & accessibility',
        status: 'online',
        capabilities: ['react-components', 'accessibility', 'design-tokens']
    },
    {
        id: 'agent-3-monitoring',
        name: 'Monitoring Expert',
        description: 'Performance metrics & alerting',
        status: 'online', 
        capabilities: ['performance-monitoring', 'alerting', 'diagnostics']
    },
    {
        id: 'agent-4-security',
        name: 'Security Expert',
        description: 'Security scans & compliance',
        status: 'online',
        capabilities: ['security-scanning', 'compliance', 'vulnerability-assessment']
    },
    {
        id: 'agent-5-api',
        name: 'API Integration Expert',
        description: 'Blazing-fast APIs with Azure Functions',
        status: 'online',
        capabilities: ['api-development', 'azure-functions', 'openai-integration']
    },
    {
        id: 'agent-6-config',
        name: 'Configuration Expert',
        description: 'Infrastructure & deployment automation',
        status: 'online',
        capabilities: ['infrastructure', 'deployment', 'configuration-management']
    }
];

const httpTrigger = async function (context: any, req: any): Promise<void> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    context.log(`[${requestId}] HTTP ${req.method} request started`);
    
    const method = req.method;
    const url = req.url || '';
    const path = url.split('/api/')[1] || '';
    const segments = path.split('/').filter(Boolean);

    context.log(`[${requestId}] ${method} /api/${path}`);

    try {
        let response: ApiResponse;

        // CORS Headers for all responses
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-functions-key',
            'Content-Type': 'application/json'
        };

        // Handle CORS preflight
        if (method === 'OPTIONS') {
            response = {
                status: 200,
                headers: corsHeaders,
                body: null
            };
        }
        // Health endpoints
        else if (path === 'health' && method === 'GET') {
            response = await handleHealthCheck(context, requestId);
        }
        else if (path === 'health/status' && method === 'GET') {
            response = await handleDetailedHealthStatus(context, requestId);
        }
        // Agent management
        else if (path === 'agents' && method === 'GET') {
            response = await handleGetAgents(context, requestId);
        }
        else if (segments[0] === 'agents' && segments[1] && method === 'GET') {
            response = await handleGetAgent(context, requestId, segments[1]);
        }
        // Testing endpoints
        else if (path === 'echo' && method === 'POST') {
            response = await handleEcho(context, requestId, req.body);
        }
        // OpenAPI documentation
        else if (path === 'openapi.json' && method === 'GET') {
            response = await handleOpenApiSpec(context, requestId);
        }
        else if (path === 'docs' && method === 'GET') {
            response = await handleSwaggerUI(context, requestId);
        }
        // Planned endpoints (not implemented yet)
        else if (path === 'chat' && method === 'POST') {
            response = handleNotImplemented('Chat API', 'Phase 2 - OpenAI Integration');
        }
        else if (path === 'orchestrate' && method === 'POST') {
            response = handleNotImplemented('Multi-Agent Orchestration', 'Phase 3 - Advanced Features');
        }
        else if (path === 'metrics' && method === 'GET') {
            response = handleNotImplemented('Performance Metrics', 'Phase 4 - Analytics');
        }
        // Default fallback
        else {
            response = await handleDefault(context, requestId, method, path);
        }

        // Add common headers
        response.headers = { ...corsHeaders, ...response.headers };
        
        // Add performance tracking
        const duration = Date.now() - startTime;
        response.headers['X-Response-Time'] = `${duration}ms`;
        response.headers['X-Request-ID'] = requestId;

        context.log(`[${requestId}] Completed in ${duration}ms`);
        context.res = response;

    } catch (error) {
        const duration = Date.now() - startTime;
        context.log.error(`[${requestId}] Error after ${duration}ms:`, error);
        
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'X-Response-Time': `${duration}ms`,
                'X-Request-ID': requestId
            },
            body: {
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                requestId: requestId,
                timestamp: new Date().toISOString()
            }
        };
    }
};

// Health check handlers
async function handleHealthCheck(context: any, requestId: string): Promise<ApiResponse> {
    return {
        status: 200,
        body: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.ENVIRONMENT || 'development',
            message: 'EVA DA 2.0 API is running successfully!',
            requestId: requestId
        }
    };
}

async function handleDetailedHealthStatus(context: any, requestId: string): Promise<ApiResponse> {
    // Simulate checking various dependencies
    const checks = {
        api: { status: 'healthy', responseTime: '< 10ms' },
        cosmosDb: { status: 'healthy', responseTime: '< 50ms', connection: 'active' },
        openAi: { status: 'not-configured', responseTime: 'N/A', connection: 'pending' },
        azureAd: { status: 'healthy', responseTime: '< 25ms', connection: 'authenticated' }
    };

    const overallStatus = Object.values(checks).every(check => check.status === 'healthy') 
        ? 'healthy' : 'degraded';

    return {
        status: 200,
        body: {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.ENVIRONMENT || 'development',
            requestId: requestId,
            dependencies: checks,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            agents: {
                total: agents.length,
                online: agents.filter(a => a.status === 'online').length,
                offline: agents.filter(a => a.status === 'offline').length
            }
        }
    };
}

// Agent management handlers
async function handleGetAgents(context: any, requestId: string): Promise<ApiResponse> {
    return {
        status: 200,
        body: {
            agents: agents,
            total: agents.length,
            timestamp: new Date().toISOString(),
            requestId: requestId
        }
    };
}

async function handleGetAgent(context: any, requestId: string, agentId: string): Promise<ApiResponse> {
    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
        return {
            status: 404,
            body: {
                error: 'Agent Not Found',
                message: `Agent with ID '${agentId}' was not found`,
                availableAgents: agents.map(a => a.id),
                requestId: requestId,
                timestamp: new Date().toISOString()
            }
        };
    }

    return {
        status: 200,
        body: {
            agent: agent,
            timestamp: new Date().toISOString(),
            requestId: requestId
        }
    };
}

// Testing handlers
async function handleEcho(context: any, requestId: string, body: any): Promise<ApiResponse> {
    return {
        status: 200,
        body: {
            echo: body,
            timestamp: new Date().toISOString(),
            requestId: requestId,
            method: 'POST',
            path: 'echo'
        }
    };
}

// Documentation handlers
async function handleOpenApiSpec(context: any, requestId: string): Promise<ApiResponse> {
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
            message: 'OpenAPI specification endpoint',
            note: 'Full spec available in openapi.yaml file',
            requestId: requestId,
            swaggerUI: '/api/docs',
            timestamp: new Date().toISOString()
        }
    };
}

async function handleSwaggerUI(context: any, requestId: string): Promise<ApiResponse> {
    const swaggerHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>EVA DA 2.0 API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.presets.standalone
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;

    return {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
        body: swaggerHTML
    };
}

// Not implemented handler
function handleNotImplemented(feature: string, phase: string): ApiResponse {
    return {
        status: 501,
        body: {
            error: 'NotImplemented',
            message: `${feature} is planned but not yet implemented`,
            status: 'planned',
            estimatedAvailability: phase,
            alternativeEndpoints: [
                'GET /api/health - Basic health check',
                'GET /api/health/status - Detailed system status',
                'GET /api/agents - List all agents',
                'POST /api/echo - Echo test endpoint'
            ],
            timestamp: new Date().toISOString()
        }
    };
}

// Default handler
async function handleDefault(context: any, requestId: string, method: string, path: string): Promise<ApiResponse> {
    return {
        status: 200,
        body: {
            message: 'Welcome to EVA DA 2.0 API - Enterprise Multi-Agent Platform',
            method: method,
            path: path,
            timestamp: new Date().toISOString(),
            requestId: requestId,
            version: '1.0.0',
            status: 'Foundation Complete ✅',
            availableEndpoints: {
                health: {
                    'GET /api/health': 'Basic health check',
                    'GET /api/health/status': 'Detailed system health with dependencies'
                },
                agents: {
                    'GET /api/agents': 'List all available agents',
                    'GET /api/agents/{id}': 'Get specific agent information'
                },
                testing: {
                    'POST /api/echo': 'Echo test endpoint for debugging'
                },
                documentation: {
                    'GET /api/docs': 'Interactive Swagger UI documentation',
                    'GET /api/openapi.json': 'OpenAPI specification'
                },
                planned: {
                    'POST /api/chat': '🚧 Streaming chat with OpenAI (Phase 2)',
                    'POST /api/orchestrate': '🚧 Multi-agent coordination (Phase 3)',
                    'GET /api/metrics': '🚧 Performance analytics (Phase 4)'
                }
            },
            documentation: 'Visit /api/docs for interactive API documentation',
            github: 'https://github.com/your-org/eva-da-2'
        }
    };
}

module.exports = httpTrigger;
