# 🔵 Data Architecture & Azure Integration Agent

## Mission: Azure Cosmos DB, Data Modeling & Backend Infrastructure

### 🎯 Tonight's Priority Tasks:

#### 1. Azure Cosmos DB Container Design (HPK Optimization)
```typescript
// File: src/data/models/CosmosDBModels.ts
interface ChatConversationDocument {
  id: string;
  tenantId: string;        // HPK Level 1
  userId: string;          // HPK Level 2  
  conversationId: string;  // HPK Level 3
  type: 'conversation' | 'message' | 'context';
  // ... rest of schema
}
```

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
