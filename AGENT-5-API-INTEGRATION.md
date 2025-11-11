# 🌐 API Integration & External Services Agent

## Mission: External APIs, APIM Policies & Service Integration

### 🎯 Tonight's Priority Tasks:

#### 1. APIM Policy Management
```xml
<!-- File: integration/policies/rate-limiting.xml -->
<rate-limit calls="1000" renewal-period="3600" />
<quota calls="10000" renewal-period="86400" />
<retry condition="@(context.Response.StatusCode >= 500)" count="3" interval="1" />
```

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
