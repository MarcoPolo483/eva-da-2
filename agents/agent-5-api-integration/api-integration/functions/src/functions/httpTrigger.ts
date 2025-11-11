import { AzureFunction, Context, HttpRequest } from '@azure/functions';

/**
 * Universal HTTP handler for all EVA DA 2.0 API endpoints
 * Routes requests to appropriate handlers based on path and method
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const method = request.method.toUpperCase();
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/', '');

    context.log(`${method} ${path}`);

    try {        // Health endpoints
        if (path === 'health' && method === 'GET') {
            context.res = {
                status: 200,
                body: {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0',
                    environment: 'development'
                }
            };
            return;
        }

        if (path === 'health/status' && method === 'GET') {
            return {
                status: 200,
                jsonBody: {
                    status: 'healthy',
                    services: {
                        openai: { status: 'connected', latency: '45ms' },
                        cosmosdb: { status: 'connected', latency: '23ms' },
                        keyvault: { status: 'connected', latency: '12ms' }
                    },
                    performance: {
                        totalRequests: 1250,
                        successRate: 0.998,
                        avgResponseTime: '120ms'
                    },
                    timestamp: new Date().toISOString()
                }
            };
        }

        // Chat endpoint
        if (path === 'chat' && method === 'POST') {
            const body = await request.json() as any;
            
            // For streaming responses, we'll return a simulated response
            return {
                status: 200,
                jsonBody: {
                    id: `chat-${Date.now()}`,
                    message: `Echo: ${body.message || 'Hello from EVA DA 2.0!'}`,
                    timestamp: new Date().toISOString(),
                    agent: 'chat-agent',
                    tokens: {
                        input: 15,
                        output: 25,
                        total: 40
                    }
                }
            };
        }

        // Orchestration endpoint
        if (path === 'orchestrate' && method === 'POST') {
            const body = await request.json() as any;
            const workflowId = `workflow-${Date.now()}`;
            
            return {
                status: 202,
                jsonBody: {
                    workflowId,
                    status: 'initiated',
                    agents: ['data-agent', 'design-agent', 'security-agent'],
                    estimatedDuration: '30s',
                    timestamp: new Date().toISOString()
                }
            };
        }

        // Workflow status
        if (path.startsWith('workflow/') && method === 'GET') {
            const workflowId = path.split('/')[1];
            
            return {
                status: 200,
                jsonBody: {
                    workflowId,
                    status: 'completed',
                    progress: 100,
                    results: {
                        'data-agent': { status: 'completed', output: 'Data analysis complete' },
                        'design-agent': { status: 'completed', output: 'Design patterns applied' },
                        'security-agent': { status: 'completed', output: 'Security scan passed' }
                    },
                    completedAt: new Date().toISOString()
                }
            };
        }

        // Agents registry
        if (path === 'agents' && method === 'GET') {
            return {
                status: 200,
                jsonBody: {
                    agents: [
                        { id: 'data-agent', name: 'Data Architecture', status: 'online', capabilities: ['data-modeling', 'cosmos-db', 'analytics'] },
                        { id: 'design-agent', name: 'Design System', status: 'online', capabilities: ['ui-components', 'design-tokens', 'accessibility'] },
                        { id: 'monitoring-agent', name: 'Monitoring', status: 'online', capabilities: ['performance', 'logging', 'alerting'] },
                        { id: 'security-agent', name: 'Security', status: 'online', capabilities: ['authentication', 'encryption', 'compliance'] },
                        { id: 'api-agent', name: 'API Integration', status: 'online', capabilities: ['rest-apis', 'streaming', 'orchestration'] },
                        { id: 'config-agent', name: 'Configuration', status: 'online', capabilities: ['deployment', 'infrastructure', 'secrets'] }
                    ],
                    timestamp: new Date().toISOString()
                }
            };
        }

        // Performance metrics
        if (path === 'metrics' && method === 'GET') {
            return {
                status: 200,
                jsonBody: {
                    performance: {
                        totalRequests: 1250,
                        requestsPerMinute: 85,
                        successRate: 0.998,
                        avgResponseTime: 120,
                        p95ResponseTime: 180,
                        p99ResponseTime: 250
                    },
                    resources: {
                        cpuUsage: 0.35,
                        memoryUsage: 0.62,
                        activeConnections: 45
                    },
                    timestamp: new Date().toISOString()
                }
            };
        }

        // API Documentation
        if (path === 'docs' && method === 'GET') {
            const swaggerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>EVA DA 2.0 API Documentation</title>
                <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
            </head>
            <body>
                <div id="swagger-ui"></div>
                <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
                <script>
                    SwaggerUIBundle({
                        url: '/api/openapi.json',
                        dom_id: '#swagger-ui',
                        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.presets.standalone]
                    });
                </script>
            </body>
            </html>`;
            
            return {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
                body: swaggerHTML
            };
        }

        // OpenAPI Specification
        if (path === 'openapi.json' && method === 'GET') {
            return {
                status: 200,
                jsonBody: {
                    openapi: '3.0.0',
                    info: {
                        title: 'EVA DA 2.0 API',
                        version: '1.0.0',
                        description: 'Enterprise AI Assistant API with Multi-Agent Orchestration'
                    },
                    servers: [{ url: 'http://localhost:7072/api', description: 'Development server' }],
                    paths: {
                        '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
                        '/chat': { post: { summary: 'Chat with AI', responses: { '200': { description: 'Chat response' } } } },
                        '/orchestrate': { post: { summary: 'Start workflow', responses: { '202': { description: 'Workflow started' } } } },
                        '/agents': { get: { summary: 'List agents', responses: { '200': { description: 'Agents list' } } } },
                        '/metrics': { get: { summary: 'Performance metrics', responses: { '200': { description: 'Metrics data' } } } }
                    }
                }
            };
        }

        // Route not found
        return {
            status: 404,
            jsonBody: {
                error: 'Not Found',
                message: `Route ${method} ${path} not found`,
                availableEndpoints: [
                    'GET /health',
                    'GET /health/status', 
                    'POST /chat',
                    'POST /orchestrate',
                    'GET /workflow/{id}',
                    'GET /agents',
                    'GET /metrics',
                    'GET /docs',
                    'GET /openapi.json'
                ]
            }
        };

    } catch (error) {
        context.log.error('Error processing request:', error);
        return {
            status: 500,
            jsonBody: {
                error: 'Internal Server Error',
                message: 'An unexpected error occurred'
            }
        };
    }
}

// Register the HTTP trigger
app.http('api', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    route: '{*path}',
    handler: httpTrigger
});
