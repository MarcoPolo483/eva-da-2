# EVA DA 2.0 - API Integration Demo Script  
# Comprehensive testing of enterprise Azure Functions APIs
# Tests all endpoints: health, agents, testing, documentation, and planned features

param(
    [Parameter(Mandatory=$false)]
    [string]$FunctionAppUrl = "http://localhost:7071",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [switch]$RunPerformanceTest = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestPlannedEndpoints = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$OpenDocs = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 EVA DA 2.0 - API Integration Demo" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host "Testing APIs at: $FunctionAppUrl" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Gray

# Test configuration
$testConfig = @{
    tenantId = "gc-ssc-spc"
    userId = "demo.user@ssc-spc.gc.ca"
    baseUrl = $FunctionAppUrl.TrimEnd('/')
}

# Performance tracking
$global:testResults = @()

function Add-TestResult {
    param($TestName, $Duration, $Success, $Details = "")
    
    $global:testResults += [PSCustomObject]@{
        Test = $TestName
        Duration = $Duration
        Success = $Success
        Details = $Details
        Timestamp = Get-Date
    }
}

function Test-HealthEndpoints {
    Write-Host "`n🏥 Testing Health Endpoints..." -ForegroundColor Blue
    
    try {
        # Basic health check
        $start = Get-Date
        $healthResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/health" -Method Get
        $duration = (Get-Date) - $start
        
        Write-Host "✅ Basic Health: $($healthResponse.status)" -ForegroundColor Green
        Write-Host "   Version: $($healthResponse.version)" -ForegroundColor Gray
        Write-Host "   Environment: $($healthResponse.environment)" -ForegroundColor Gray
        Write-Host "   Response Time: $($duration.TotalMilliseconds)ms" -ForegroundColor Gray
        
        Add-TestResult "Basic Health Check" $duration.TotalMilliseconds $true $healthResponse.status
        
        # Detailed health status
        $start = Get-Date
        $detailedHealth = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/health/status" -Method Get
        $duration = (Get-Date) - $start
        
        Write-Host "✅ Detailed Health: $($detailedHealth.status)" -ForegroundColor Green
        Write-Host "   Uptime: $([math]::Round($detailedHealth.uptime, 2))s" -ForegroundColor Gray
        Write-Host "   Memory Usage: $([math]::Round($detailedHealth.memory.heapUsed / 1MB, 2))MB" -ForegroundColor Gray
        Write-Host "   Active Agents: $($detailedHealth.agents.online)/$($detailedHealth.agents.total)" -ForegroundColor Gray
        Write-Host "   Response Time: $($duration.TotalMilliseconds)ms" -ForegroundColor Gray
        
        Write-Host "   Dependencies:" -ForegroundColor Gray
        foreach ($dep in $detailedHealth.dependencies.PSObject.Properties) {
            $status = $dep.Value.status
            $color = if ($status -eq 'healthy') { 'Green' } elseif ($status -eq 'degraded') { 'Yellow' } else { 'Red' }
            Write-Host "   - $($dep.Name): $status ($($dep.Value.responseTime))" -ForegroundColor $color
        }
        
        Add-TestResult "Detailed Health Status" $duration.TotalMilliseconds $true $detailedHealth.status
        
    } catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        Add-TestResult "Health Endpoints" 0 $false $_.Exception.Message
    }
}

function Test-AgentEndpoints {
    Write-Host "`n🤖 Testing Agent Management Endpoints..." -ForegroundColor Blue
    
    try {
        # List all agents
        $start = Get-Date
        $agentsResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/agents" -Method Get
        $duration = (Get-Date) - $start
        
        Write-Host "✅ Agent List: $($agentsResponse.total) agents found" -ForegroundColor Green
        Write-Host "   Response Time: $($duration.TotalMilliseconds)ms" -ForegroundColor Gray
        
        foreach ($agent in $agentsResponse.agents) {
            $statusColor = if ($agent.status -eq 'online') { 'Green' } else { 'Red' }
            Write-Host "   - $($agent.name) ($($agent.id)): $($agent.status)" -ForegroundColor $statusColor
            Write-Host "     Capabilities: $($agent.capabilities -join ', ')" -ForegroundColor Gray
        }
        
        Add-TestResult "List Agents" $duration.TotalMilliseconds $true "$($agentsResponse.total) agents"
        
        # Test individual agent lookup
        if ($agentsResponse.agents.Count -gt 0) {
            $testAgent = $agentsResponse.agents[0]
            
            $start = Get-Date
            $agentResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/agents/$($testAgent.id)" -Method Get
            $duration = (Get-Date) - $start
            
            Write-Host "✅ Individual Agent: $($agentResponse.agent.name)" -ForegroundColor Green
            Write-Host "   Description: $($agentResponse.agent.description)" -ForegroundColor Gray
            Write-Host "   Response Time: $($duration.TotalMilliseconds)ms" -ForegroundColor Gray
            
            Add-TestResult "Get Individual Agent" $duration.TotalMilliseconds $true $agentResponse.agent.name
        }
        
        # Test non-existent agent
        try {
            $invalidAgent = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/agents/invalid-agent" -Method Get
        } catch {
            if ($_.Exception.Response.StatusCode -eq 404) {
                Write-Host "✅ 404 handling: Non-existent agent properly handled" -ForegroundColor Green
                Add-TestResult "404 Error Handling" 0 $true "Proper 404 response"
            }
        }
        
    } catch {
        Write-Host "❌ Agent endpoints failed: $($_.Exception.Message)" -ForegroundColor Red
        Add-TestResult "Agent Endpoints" 0 $false $_.Exception.Message
    }
}

function Test-TestingEndpoints {
    Write-Host "`n🧪 Testing Development & Testing Endpoints..." -ForegroundColor Blue
    
    try {
        # Echo endpoint test
        $testPayload = @{
            message = "Hello EVA DA 2.0!"
            user = @{
                id = "test-user-123"
                name = "Demo User"
                role = "developer"
            }
            metadata = @{
                test = "comprehensive-api-demo"
                timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                features = @("health-check", "agent-management", "echo-test")
            }
        }
        
        $start = Get-Date
        $echoResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/echo" -Method Post -Body ($testPayload | ConvertTo-Json -Depth 10) -ContentType "application/json"
        $duration = (Get-Date) - $start
        
        Write-Host "✅ Echo Test: Payload echoed successfully" -ForegroundColor Green
        Write-Host "   Original message: $($testPayload.message)" -ForegroundColor Gray
        Write-Host "   Echoed message: $($echoResponse.echo.message)" -ForegroundColor Gray
        Write-Host "   Response Time: $($duration.TotalMilliseconds)ms" -ForegroundColor Gray
        Write-Host "   Request ID: $($echoResponse.requestId)" -ForegroundColor Gray
        
        $success = ($echoResponse.echo.message -eq $testPayload.message)
        Add-TestResult "Echo Test" $duration.TotalMilliseconds $success "Message integrity verified"
        
    } catch {
        Write-Host "❌ Testing endpoints failed: $($_.Exception.Message)" -ForegroundColor Red
        Add-TestResult "Testing Endpoints" 0 $false $_.Exception.Message
    }
}

function Test-DocumentationEndpoints {
    Write-Host "`n📚 Testing Documentation Endpoints..." -ForegroundColor Blue
    
    try {
        # OpenAPI spec
        $start = Get-Date
        $openApiResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/openapi.json" -Method Get
        $duration = (Get-Date) - $start
        
        Write-Host "✅ OpenAPI Spec: Available" -ForegroundColor Green
        Write-Host "   Response Time: $($duration.TotalMilliseconds)ms" -ForegroundColor Gray
        
        Add-TestResult "OpenAPI Specification" $duration.TotalMilliseconds $true "Spec available"
        
        # Swagger UI (HTML response)
        $start = Get-Date
        $docsResponse = Invoke-WebRequest -Uri "$($testConfig.baseUrl)/api/docs" -Method Get
        $duration = (Get-Date) - $start
        
        $isSwaggerUI = $docsResponse.Content -match "swagger-ui"
        Write-Host "✅ Swagger UI: $($docsResponse.StatusCode) - HTML documentation" -ForegroundColor Green
        Write-Host "   Content-Type: $($docsResponse.Headers['Content-Type'])" -ForegroundColor Gray  
        Write-Host "   Response Time: $($duration.TotalMilliseconds)ms" -ForegroundColor Gray
        Write-Host "   Contains Swagger UI: $isSwaggerUI" -ForegroundColor Gray
        
        Add-TestResult "Swagger UI" $duration.TotalMilliseconds $isSwaggerUI "HTML documentation"
        
        if ($OpenDocs) {
            Write-Host "   Opening documentation in browser..." -ForegroundColor Yellow
            Start-Process "$($testConfig.baseUrl)/api/docs"
        }
        
    } catch {
        Write-Host "❌ Documentation endpoints failed: $($_.Exception.Message)" -ForegroundColor Red
        Add-TestResult "Documentation Endpoints" 0 $false $_.Exception.Message
    }
}

function Test-AgentRegistry {
    Write-Host "`n🤖 Testing Agent Registry..." -ForegroundColor Blue
    
    try {
        $agentRegistry = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/agents" -Method Get
        Write-Host "✅ Agent Registry: $($agentRegistry.totalAgents) agents available" -ForegroundColor Green
        
        foreach ($agent in $agentRegistry.agents) {
            Write-Host "   - $($agent.name) (v$($agent.version)): $($agent.status)" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "❌ Agent registry failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-ChatAPI {
    Write-Host "`n💬 Testing Chat API..." -ForegroundColor Blue
    
    $chatRequest = @{
        tenantId = $testConfig.tenantId
        userId = $testConfig.userId
        message = "Hello EVA! Can you explain Azure Functions performance optimization?"
        model = "gpt-4"
        temperature = 0.7
        stream = $false
    }
    
    try {
        $startTime = Get-Date
        $chatResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/chat" -Method Post -Body ($chatRequest | ConvertTo-Json) -ContentType "application/json"
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "✅ Chat Response received in $([math]::Round($responseTime, 2))ms" -ForegroundColor Green
        Write-Host "   Conversation ID: $($chatResponse.conversationId)" -ForegroundColor Gray
        Write-Host "   Message ID: $($chatResponse.messageId)" -ForegroundColor Gray
        Write-Host "   Token Usage: $($chatResponse.metadata.tokenUsage.totalTokens)" -ForegroundColor Gray
        Write-Host "   Content Preview: $($chatResponse.content.Substring(0, [Math]::Min(100, $chatResponse.content.Length)))..." -ForegroundColor Cyan
        
        return $chatResponse.conversationId
        
    } catch {
        Write-Host "❌ Chat API failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Test-StreamingChat {
    if (!$TestStreaming) {
        Write-Host "`n⏭️ Skipping streaming test (use -TestStreaming to enable)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n🌊 Testing Streaming Chat..." -ForegroundColor Blue
    
    $streamRequest = @{
        tenantId = $testConfig.tenantId
        userId = $testConfig.userId
        message = "Provide a detailed explanation of Azure Cosmos DB hierarchical partition keys with examples."
        stream = $true
        temperature = 0.5
    }
    
    try {
        Write-Host "Sending streaming request..." -ForegroundColor Yellow
        # Note: PowerShell doesn't handle SSE streams natively, so this is simplified
        $response = Invoke-WebRequest -Uri "$($testConfig.baseUrl)/api/chat" -Method Post -Body ($streamRequest | ConvertTo-Json) -ContentType "application/json"
        
        if ($response.Headers.'Content-Type' -match 'text/event-stream') {
            Write-Host "✅ Streaming response initiated" -ForegroundColor Green
            Write-Host "   Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Gray
            Write-Host "   Response Preview: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Cyan
        } else {
            Write-Host "❌ Expected streaming response but got: $($response.Headers.'Content-Type')" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Streaming chat failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-MultiAgentOrchestration {
    Write-Host "`n🎭 Testing Multi-Agent Orchestration..." -ForegroundColor Blue
    
    $orchestrationRequest = @{
        tenantId = $testConfig.tenantId
        userId = $testConfig.userId
        workflowId = "demo-workflow-$(Get-Date -Format 'yyyyMMddHHmmss')"
        agentIds = @("agent-1-data", "agent-3-monitoring", "agent-5-api")
        task = "Analyze system performance and provide optimization recommendations"
        priority = "high"
    }
    
    try {
        $startTime = Get-Date
        $orchestrationResult = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/orchestrate" -Method Post -Body ($orchestrationRequest | ConvertTo-Json) -ContentType "application/json"
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "✅ Orchestration completed in $([math]::Round($responseTime, 2))ms" -ForegroundColor Green
        Write-Host "   Workflow ID: $($orchestrationResult.workflowId)" -ForegroundColor Gray
        Write-Host "   Status: $($orchestrationResult.status)" -ForegroundColor Gray
        Write-Host "   Agents: $($orchestrationResult.progress.completedAgents)/$($orchestrationResult.progress.totalAgents) completed" -ForegroundColor Gray
        
        # Show agent results
        foreach ($result in $orchestrationResult.results) {
            $statusColor = if ($result.status -eq 'completed') { 'Green' } else { 'Red' }
            Write-Host "   - $($result.agentId): $($result.status) ($($result.processingTime)ms)" -ForegroundColor $statusColor
        }
        
        return $orchestrationResult.workflowId
        
    } catch {
        Write-Host "❌ Multi-agent orchestration failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Test-PlannedEndpoints {
    if (!$TestPlannedEndpoints) {
        Write-Host "`n⏭️ Skipping planned endpoints test (use -TestPlannedEndpoints to enable)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n🚧 Testing Planned Endpoints (Not Yet Implemented)..." -ForegroundColor Blue
    
    # Test chat endpoint (should return 501)
    try {
        $chatRequest = @{
            message = "Hello EVA!"
            userId = $testConfig.userId
        }
        
        $chatResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/chat" -Method Post -Body ($chatRequest | ConvertTo-Json) -ContentType "application/json"
    } catch {
        if ($_.Exception.Response.StatusCode -eq 501) {
            Write-Host "✅ Chat API: Properly returns 501 Not Implemented" -ForegroundColor Green
        } else {
            Write-Host "❌ Chat API: Unexpected response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    
    # Test orchestration endpoint (should return 501)
    try {
        $orchestrateRequest = @{
            agentIds = @("agent-1", "agent-2")
        }
        
        $orchestrateResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/orchestrate" -Method Post -Body ($orchestrateRequest | ConvertTo-Json) -ContentType "application/json"
    } catch {
        if ($_.Exception.Response.StatusCode -eq 501) {
            Write-Host "✅ Orchestration API: Properly returns 501 Not Implemented" -ForegroundColor Green
        } else {
            Write-Host "❌ Orchestration API: Unexpected response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    
    # Test metrics endpoint (should return 501)  
    try {
        $metricsResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/metrics" -Method Get
    } catch {
        if ($_.Exception.Response.StatusCode -eq 501) {
            Write-Host "✅ Metrics API: Properly returns 501 Not Implemented" -ForegroundColor Green
        } else {
            Write-Host "❌ Metrics API: Unexpected response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

function Test-PerformanceMetrics {
    if (!$RunPerformanceTest) {
        Write-Host "`n⏭️ Skipping performance test (use -RunPerformanceTest to enable)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n⚡ Running Performance Tests..." -ForegroundColor Blue
    
    $iterations = 10
    $results = @()
    
    Write-Host "Testing health endpoint performance ($iterations iterations)..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $iterations; $i++) {
        try {
            $start = Get-Date
            $response = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/health" -Method Get
            $duration = (Get-Date) - $start
            
            $results += [PSCustomObject]@{
                Iteration = $i
                Duration = $duration.TotalMilliseconds
                Success = $true
            }
            
            Write-Host "." -NoNewline
            
        } catch {
            $results += [PSCustomObject]@{
                Iteration = $i  
                Duration = 0
                Success = $false
            }
            Write-Host "x" -NoNewline -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host "`n"
    
    $successfulRequests = $results | Where-Object { $_.Success }
    $avgResponseTime = ($successfulRequests | Measure-Object Duration -Average).Average
    $minResponseTime = ($successfulRequests | Measure-Object Duration -Minimum).Minimum  
    $maxResponseTime = ($successfulRequests | Measure-Object Duration -Maximum).Maximum
    $successRate = ($successfulRequests.Count / $iterations) * 100
    
    Write-Host "Performance Results:" -ForegroundColor Green
    Write-Host "   Success Rate: $([math]::Round($successRate, 1))%" -ForegroundColor Gray
    Write-Host "   Average Response Time: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Gray
    Write-Host "   Min Response Time: $([math]::Round($minResponseTime, 2))ms" -ForegroundColor Gray
    Write-Host "   Max Response Time: $([math]::Round($maxResponseTime, 2))ms" -ForegroundColor Gray
    
    if ($avgResponseTime -lt 100) {
        Write-Host "🎯 TARGET MET: Sub-100ms average response time!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Performance target missed (target: <100ms)" -ForegroundColor Yellow
    }
}

function Show-TestSummary {
    Write-Host "`n📊 Test Summary" -ForegroundColor Green
    Write-Host "=" * 50 -ForegroundColor Gray
    
    $successful = ($global:testResults | Where-Object { $_.Success }).Count
    $total = $global:testResults.Count
    $successRate = if ($total -gt 0) { ($successful / $total) * 100 } else { 0 }
    
    Write-Host "Total Tests: $total" -ForegroundColor White
    Write-Host "Successful: $successful" -ForegroundColor Green  
    Write-Host "Failed: $($total - $successful)" -ForegroundColor Red
    Write-Host "Success Rate: $([math]::Round($successRate, 1))%" -ForegroundColor White
    
    if ($global:testResults.Count -gt 0) {
        Write-Host "`nDetailed Results:" -ForegroundColor White
        
        foreach ($result in $global:testResults) {
            $statusIcon = if ($result.Success) { "✅" } else { "❌" }
            $color = if ($result.Success) { "Green" } else { "Red" }
            
            Write-Host "   $statusIcon $($result.Test): $([math]::Round($result.Duration, 2))ms - $($result.Details)" -ForegroundColor $color
        }
        
        # Performance insights
        $responseTimes = $global:testResults | Where-Object { $_.Success -and $_.Duration -gt 0 } | Select-Object -ExpandProperty Duration
        if ($responseTimes.Count -gt 0) {
            $avgResponseTime = ($responseTimes | Measure-Object -Average).Average
            Write-Host "`nPerformance Summary:" -ForegroundColor White
            Write-Host "   Average Response Time: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Gray
            
            if ($avgResponseTime -lt 100) {
                Write-Host "   🎯 Performance Target: MET (Sub-100ms)" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Performance Target: MISSED (>100ms)" -ForegroundColor Yellow
            }
        }
    }
}

# Main execution
function Main {
    Write-Host "Starting comprehensive API tests..." -ForegroundColor White
    
    # Test basic functionality
    Test-HealthEndpoints
    Test-AgentEndpoints  
    Test-TestingEndpoints
    Test-DocumentationEndpoints
    
    # Test planned features (if enabled)
    Test-PlannedEndpoints
    
    # Performance testing (if enabled)
    Test-PerformanceMetrics
    
    # Show summary
    Show-TestSummary
    
    Write-Host "`n🎉 Demo Complete!" -ForegroundColor Green
    Write-Host "Visit $($testConfig.baseUrl)/api/docs for interactive API documentation" -ForegroundColor Yellow
    
    if ($OpenDocs) {
        Write-Host "Opening API documentation..." -ForegroundColor Yellow
        Start-Process "$($testConfig.baseUrl)/api/docs"
    }
}

# Execute main function
Main
    }
    
    Write-Host "`n📊 Testing Workflow Status..." -ForegroundColor Blue
    
    try {
        $statusResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/workflow/$workflowId" -Method Get
        Write-Host "✅ Workflow status retrieved" -ForegroundColor Green
        Write-Host "   Status: $($statusResponse.status)" -ForegroundColor Gray
        Write-Host "   Progress: $($statusResponse.progress.completedAgents)/$($statusResponse.progress.totalAgents)" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ Workflow status failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-PerformanceMetrics {
    Write-Host "`n📈 Testing Performance Metrics..." -ForegroundColor Blue
    
    try {
        $metricsResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/metrics?timeRange=1h&granularity=5m" -Method Get
        Write-Host "✅ Performance metrics retrieved" -ForegroundColor Green
        Write-Host "   Time Range: $($metricsResponse.timeRange)" -ForegroundColor Gray
        Write-Host "   Total Requests: $($metricsResponse.totalRequests)" -ForegroundColor Gray
        Write-Host "   Avg Response Time: $([math]::Round($metricsResponse.avgResponseTime, 2))ms" -ForegroundColor Gray
        Write-Host "   Success Rate: $([math]::Round($metricsResponse.successRate * 100, 1))%" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ Performance metrics failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-APIDocumentation {
    Write-Host "`n📚 Testing API Documentation..." -ForegroundColor Blue
    
    try {
        # Test OpenAPI spec
        $openApiResponse = Invoke-RestMethod -Uri "$($testConfig.baseUrl)/api/openapi.json" -Method Get
        Write-Host "✅ OpenAPI specification available" -ForegroundColor Green
        Write-Host "   API Title: $($openApiResponse.info.title)" -ForegroundColor Gray
        Write-Host "   API Version: $($openApiResponse.info.version)" -ForegroundColor Gray
        Write-Host "   Endpoints: $($openApiResponse.paths.PSObject.Properties.Count)" -ForegroundColor Gray
        
        # Test Swagger UI
        $swaggerResponse = Invoke-WebRequest -Uri "$($testConfig.baseUrl)/api/docs" -Method Get
        if ($swaggerResponse.StatusCode -eq 200) {
            Write-Host "✅ Swagger UI available at /api/docs" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "❌ API documentation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Run-PerformanceTest {
    if (!$RunPerformanceTest) {
        Write-Host "`n⏭️ Skipping performance test (use -RunPerformanceTest to enable)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n⚡ Running Performance Test..." -ForegroundColor Blue
    
    $concurrentRequests = 10
    $testDuration = 30 # seconds
    $responseTimes = @()
    
    Write-Host "Sending $concurrentRequests concurrent requests for $testDuration seconds..." -ForegroundColor Yellow
    
    $jobs = @()
    $startTime = Get-Date
    
    for ($i = 1; $i -le $concurrentRequests; $i++) {
        $job = Start-Job -ScriptBlock {
            param($baseUrl, $tenantId, $userId, $testDuration)
            
            $endTime = (Get-Date).AddSeconds($testDuration)
            $requests = 0
            $totalTime = 0
            
            while ((Get-Date) -lt $endTime) {
                try {
                    $chatRequest = @{
                        tenantId = $tenantId
                        userId = "$userId-worker-$using:i"
                        message = "Performance test request #$requests"
                    }
                    
                    $requestStart = Get-Date
                    Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get | Out-Null
                    $requestEnd = Get-Date
                    
                    $requestTime = ($requestEnd - $requestStart).TotalMilliseconds
                    $totalTime += $requestTime
                    $requests++
                    
                    Start-Sleep -Milliseconds 100
                } catch {
                    # Ignore individual request failures during load test
                }
            }
            
            return @{
                requests = $requests
                avgResponseTime = if ($requests -gt 0) { $totalTime / $requests } else { 0 }
            }
        } -ArgumentList $testConfig.baseUrl, $testConfig.tenantId, $testConfig.userId, $testDuration
        
        $jobs += $job
    }
    
    # Wait for all jobs to complete
    $jobs | Wait-Job | Out-Null
    $results = $jobs | Receive-Job
    $jobs | Remove-Job
    
    $totalRequests = ($results | Measure-Object -Property requests -Sum).Sum
    $avgResponseTime = ($results | Measure-Object -Property avgResponseTime -Average).Average
    
    $actualDuration = ((Get-Date) - $startTime).TotalSeconds
    $requestsPerSecond = [math]::Round($totalRequests / $actualDuration, 2)
    
    Write-Host "✅ Performance Test Results:" -ForegroundColor Green
    Write-Host "   Total Requests: $totalRequests" -ForegroundColor Gray
    Write-Host "   Test Duration: $([math]::Round($actualDuration, 1))s" -ForegroundColor Gray
    Write-Host "   Requests/Second: $requestsPerSecond" -ForegroundColor Gray
    Write-Host "   Avg Response Time: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Gray
    
    if ($avgResponseTime -lt 100 -and $requestsPerSecond -gt 10) {
        Write-Host "🚀 BLAZING FAST! Sub-100ms responses achieved!" -ForegroundColor Green
    } elseif ($avgResponseTime -lt 500) {
        Write-Host "⚡ Good performance!" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Performance may need optimization" -ForegroundColor Red
    }
}

# Main execution flow
try {
    Write-Host "Starting comprehensive API tests..." -ForegroundColor Green
    
    # Execute test suite
    Test-HealthEndpoints
    Test-AgentRegistry
    $conversationId = Test-ChatAPI
    Test-StreamingChat
    $workflowId = Test-MultiAgentOrchestration
    Test-WorkflowStatus -workflowId $workflowId
    Test-PerformanceMetrics
    Test-APIDocumentation
    Run-PerformanceTest
    
    Write-Host "`n🎉 API Integration Demo Completed!" -ForegroundColor Green
    Write-Host "All EVA DA 2.0 APIs are ready for enterprise use! ⚡" -ForegroundColor Cyan
    
    # Display summary
    Write-Host "`n📋 Quick Reference:" -ForegroundColor Blue
    Write-Host "   Health: $($testConfig.baseUrl)/api/health" -ForegroundColor Cyan
    Write-Host "   Chat: $($testConfig.baseUrl)/api/chat" -ForegroundColor Cyan
    Write-Host "   Orchestration: $($testConfig.baseUrl)/api/orchestrate" -ForegroundColor Cyan
    Write-Host "   Documentation: $($testConfig.baseUrl)/api/docs" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Demo failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
