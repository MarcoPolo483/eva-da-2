// src/components/enhanced/EnhancedChatInterface.tsx
import { useState, useEffect } from 'react';
import { databaseService, type UserModelParameters } from '../../lib/databaseService';
import './EnhancedChatInterface.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workMode: 'work' | 'web';
  metadata?: {
    sources?: string[];
    confidence?: number;
    processingTime?: number;
  };
}

interface EnhancedChatInterfaceProps {
  projectId: string;
  userId: string;
  userRoles: string[];
  initialQuestion?: string;
  onClose?: () => void;
}

export function EnhancedChatInterface({ 
  projectId, 
  userId, 
  userRoles,
  initialQuestion,
  onClose 
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(initialQuestion || '');
  const [isLoading, setIsLoading] = useState(false);
  const [workMode, setWorkMode] = useState<'work' | 'web'>('work');
  const [showModelParams, setShowModelParams] = useState(false);
  const [modelParams, setModelParams] = useState<UserModelParameters | null>(null);
  const [project, setProject] = useState<any>(null);

  // Check if user can access model parameters
  const canAccessModelParams = userRoles.includes('project_reader') || 
                               userRoles.includes('project_contributor') || 
                               userRoles.includes('project_admin');

  useEffect(() => {
    loadProject();
    if (canAccessModelParams) {
      loadModelParameters();
    }
  }, [projectId, userId]);

  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage();
    }
  }, [initialQuestion]);

  const loadProject = async () => {
    try {
      const projectData = await databaseService.getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadModelParameters = async () => {
    try {
      const params = await databaseService.getUserModelParams(userId, projectId);
      setModelParams(params);
    } catch (error) {
      console.error('Failed to load model parameters:', error);
    }
  };

  const updateModelParameters = async (updates: Partial<UserModelParameters>) => {
    if (!modelParams) return;
    
    try {
      const updatedParams = await databaseService.updateUserModelParams({
        ...modelParams,
        ...updates
      });
      setModelParams(updatedParams);
    } catch (error) {
      console.error('Failed to update model parameters:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      workMode
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      // Simulate API call to chat service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: generateMockResponse(userMessage.content, workMode, project),
        timestamp: new Date(),
        workMode,
        metadata: {
          sources: workMode === 'work' ? ['Document 1.pdf', 'Policy Manual.docx'] : ['Web Search Results'],
          confidence: 0.85,
          processingTime: 1.2
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (question: string, mode: 'work' | 'web', projectData: any): string => {
    const projectName = projectData?.displayName || 'this system';
    
    if (mode === 'work') {
      return `Based on the ${projectName} knowledge base, here's what I found regarding "${question}":

This information is sourced from our internal documents and policies. The response is tailored specifically to your organization's context and approved materials.

Key points:
• Information drawn from verified internal sources
• Compliant with organizational policies
• Based on current documentation in the system

Would you like me to elaborate on any specific aspect or provide related information from our knowledge base?`;
    } else {
      return `Here's information from web sources about "${question}":

Please note that this information comes from public web sources and should be verified against your organization's specific policies and procedures.

Key considerations:
• Information sourced from public web content
• May require verification against internal policies
• General guidance that may need organizational context

For organization-specific guidance, please switch to "Work" mode to access internal knowledge base.`;
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInputValue('');
  };

  return (
    <div className="enhanced-chat-interface">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h2>{project?.displayName || 'Chat'}</h2>
          <span className="chat-subtitle">
            {workMode === 'work' ? 'Work - Internal Knowledge' : 'Web - Public Information'}
          </span>
        </div>
        
        <div className="chat-controls">
          {/* Work/Web Toggle */}
          <div className="work-web-toggle">
            <span className={`toggle-label ${workMode === 'work' ? 'active' : ''}`}>Work</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={workMode === 'web'}
                onChange={(e) => setWorkMode(e.target.checked ? 'web' : 'work')}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className={`toggle-label ${workMode === 'web' ? 'active' : ''}`}>Web</span>
          </div>

          {/* Model Parameters Button */}
          {canAccessModelParams && (
            <button
              className="model-params-btn"
              onClick={() => setShowModelParams(!showModelParams)}
              title="Adjust Model Parameters"
            >
              ⚙️ Adjust
            </button>
          )}

          {/* Clear Chat */}
          <button className="clear-chat-btn" onClick={clearChat} title="Clear Chat">
            🗑️ Clear
          </button>

          {/* Close Button */}
          {onClose && (
            <button className="close-chat-btn" onClick={onClose} title="Close Chat">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Model Parameters Panel */}
      {showModelParams && modelParams && (
        <div className="model-params-panel">
          <h3>Model Parameters</h3>
          
          <div className="param-group">
            <label>Temperature: {modelParams.temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={modelParams.temperature}
              onChange={(e) => updateModelParameters({ temperature: parseFloat(e.target.value) })}
            />
          </div>
          
          <div className="param-group">
            <label>Top K: {modelParams.topK}</label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={modelParams.topK}
              onChange={(e) => updateModelParameters({ topK: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="param-group">
            <label>Response Length:</label>
            <select
              value={modelParams.responseLength}
              onChange={(e) => updateModelParameters({ responseLength: e.target.value as any })}
            >
              <option value="succinct">Succinct</option>
              <option value="standard">Standard</option>
              <option value="thorough">Thorough</option>
            </select>
          </div>
          
          <div className="param-group">
            <label>Conversation Type:</label>
            <div className="conversation-type-buttons">
              {(['creative', 'balanced', 'precise'] as const).map(type => (
                <button
                  key={type}
                  className={`conv-type-btn ${modelParams.conversationType === type ? 'active' : ''}`}
                  onClick={() => updateModelParameters({ conversationType: type })}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="param-group">
            <label>Source Filter:</label>
            <input
              type="text"
              placeholder="Filter sources..."
              value={modelParams.sourceFilter}
              onChange={(e) => updateModelParameters({ sourceFilter: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">💬</div>
            <h3>Welcome to {project?.displayName || 'EVA DA 2.0'}</h3>
            <p>
              {workMode === 'work' 
                ? 'Ask questions about internal documents and policies'
                : 'Ask questions and get information from web sources'
              }
            </p>
            
            {/* Suggested Questions */}
            {project?.suggestedQuestions && project.suggestedQuestions.length > 0 && (
              <div className="suggested-questions">
                <h4>Suggested Questions:</h4>
                {project.suggestedQuestions.slice(0, 3).map((q: any) => (
                  <button
                    key={q.id}
                    className="suggested-question"
                    onClick={() => setInputValue(q.questionEn)}
                  >
                    {q.questionEn}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
                </span>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                <span className={`message-mode mode-${message.workMode}`}>
                  {message.workMode === 'work' ? '🏢 Work' : '🌐 Web'}
                </span>
              </div>
              
              <div className="message-content">
                {message.content}
              </div>
              
              {message.metadata && (
                <div className="message-metadata">
                  {message.metadata.sources && (
                    <div className="sources">
                      <strong>Sources:</strong> {message.metadata.sources.join(', ')}
                    </div>
                  )}
                  {message.metadata.processingTime && (
                    <div className="processing-time">
                      ⏱️ {message.metadata.processingTime}s
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-header">
              <span className="message-role">🤖 Assistant</span>
              <span className={`message-mode mode-${workMode}`}>
                {workMode === 'work' ? '🏢 Work' : '🌐 Web'}
              </span>
            </div>
            <div className="loading-indicator">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${project?.displayName || 'EVA'} anything... (${workMode} mode)`}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
        
        <div className="input-info">
          <span className="mode-indicator">
            {workMode === 'work' 
              ? '🏢 Searching internal knowledge base'
              : '🌐 Searching web sources'
            }
          </span>
        </div>
      </div>
    </div>
  );
}
