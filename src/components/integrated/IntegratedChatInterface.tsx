// src/components/integrated/IntegratedChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { configManager } from '../../lib/configurationManager';
import type { User } from '../../lib/rbacManager';
import './ChatInterface.css';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  projectId?: string;
}

interface IntegratedChatInterfaceProps {
  projectId: string;
  user: User;
  initialQuestion?: string | null;
  onClose: () => void;
}

export function IntegratedChatInterface({ 
  projectId, 
  user, 
  initialQuestion, 
  onClose 
}: IntegratedChatInterfaceProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const projectConfig = configManager.getProjectConfig(projectId as any);

  useEffect(() => {
    // Initialize chat with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Date.now(),
      content: `Hello ${user.name}! I'm your ${projectConfig?.businessInfo.name} assistant. How can I help you today?`,
      role: 'assistant',
      timestamp: new Date(),
      projectId
    };

    setMessages([welcomeMessage]);

    // If there's an initial question, add it and simulate response
    if (initialQuestion) {
      const userMessage: ChatMessage = {
        id: 'initial-' + Date.now(),
        content: initialQuestion,
        role: 'user',
        timestamp: new Date(),
        projectId
      };

      setMessages(prev => [...prev, userMessage]);
      simulateResponse(initialQuestion);
    }

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [initialQuestion, projectId, user.name, projectConfig?.businessInfo.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateResponse = async (question: string) => {
    setIsLoading(true);
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate contextual response based on project and question
    const response = generateContextualResponse(question, projectId);

    const assistantMessage: ChatMessage = {
      id: 'response-' + Date.now(),
      content: response,
      role: 'assistant',
      timestamp: new Date(),
      projectId
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      projectId
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue;
    setInputValue('');

    await simulateResponse(question);
  };

  const handleNewChat = () => {
    setMessages([{
      id: 'new-welcome-' + Date.now(),
      content: `Starting a new conversation. How can I assist you with ${projectConfig?.businessInfo.name}?`,
      role: 'assistant',
      timestamp: new Date(),
      projectId
    }]);
  };

  return (
    <div className="integrated-chat-interface">
      {/* Chat Header */}
      <div 
        className="chat-header"
        style={{
          background: `linear-gradient(135deg, ${projectConfig?.uiCustomization.theme.background}, ${projectConfig?.uiCustomization.theme.surface})`
        }}
      >
        <div className="chat-header-content">
          <div className="chat-project-info">
            <div className="project-avatar">
              {getProjectIcon(projectId)}
            </div>
            <div className="project-details">
              <h2 className="project-name">{projectConfig?.businessInfo.name}</h2>
              <p className="chat-subtitle">{t('chat.aiAssistant', 'AI Assistant')}</p>
            </div>
          </div>
          
          <div className="chat-actions">
            <button 
              className="action-btn secondary"
              onClick={handleNewChat}
              title={t('chat.newConversation', 'New Conversation')}
            >
              ✨ {t('chat.new', 'New')}
            </button>
            <button 
              className="action-btn primary"
              onClick={onClose}
              title={t('chat.close', 'Close Chat')}
            >
              ← {t('chat.back', 'Back')}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <div className="user-avatar">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                ) : (
                  <div className="assistant-avatar">
                    {getProjectIcon(projectId)}
                  </div>
                )}
              </div>
              
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {message.role === 'user' ? user.name : `${projectConfig?.businessInfo.name} Assistant`}
                  </span>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="message-text">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar">
                <div className="assistant-avatar">
                  {getProjectIcon(projectId)}
                </div>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">{t('chat.typing', 'Assistant is typing...')}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('chat.placeholder', `Ask ${projectConfig?.businessInfo.name} assistant anything...`)}
              className="message-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputValue.trim() || isLoading}
              style={{
                background: inputValue.trim() && !isLoading ? 
                  `linear-gradient(135deg, ${projectConfig?.uiCustomization.theme.background}, ${projectConfig?.uiCustomization.theme.surface})` : 
                  '#ccc'
              }}
            >
              {isLoading ? '⏳' : '→'}
            </button>
          </div>
        </form>
        
        <div className="input-footer">
          <span className="footer-text">
            {t('chat.footerText', 'Powered by EVA DA 2.0 - AI Assistant for')} {projectConfig?.businessInfo.domain}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getProjectIcon(projectId: string): string {
  const icons: Record<string, string> = {
    canadaLife: '🏛️',
    jurisprudence: '⚖️',
    admin: '🔧',
    AssistMe: '🤝',
    globalAdmin: '🌐'
  };
  return icons[projectId] || '🤖';
}

function generateContextualResponse(question: string, projectId: string): string {
  const responses: Record<string, string[]> = {
    canadaLife: [
      "Based on Canada Life's policies and procedures, I can help you with that. Let me provide you with the relevant information from our knowledge base.",
      "That's a great question about our insurance and benefits programs. Here's what I found in our documentation...",
      "I can assist you with Canada Life's benefits administration. Let me search through our policy documents for the most accurate information."
    ],
    jurisprudence: [
      "I'll search through our legal database and case law references to provide you with comprehensive information on this matter.",
      "That's an important legal question. Let me consult our jurisprudence database and provide you with relevant case citations and precedents.",
      "Based on the legal principles and case law in our system, here's the information that addresses your inquiry..."
    ],
    AssistMe: [
      "I'm here to help you understand your OAS benefits and government services. Let me explain this in simple terms.",
      "That's a common question about Old Age Security benefits. I'll provide you with clear, easy-to-understand information.",
      "I can help you navigate government benefits and services. Here's what you need to know about your situation..."
    ],
    admin: [
      "I'll check our administrative systems and provide you with the technical information you need.",
      "That's an administrative query. Let me access our system documentation and provide you with the appropriate guidance.",
      "I can assist with platform administration tasks. Here's the information from our admin documentation..."
    ]
  };

  const projectResponses = responses[projectId] || [
    "I understand your question. Let me provide you with the most relevant information from our knowledge base.",
    "That's an excellent question. Based on the available information, here's what I can tell you...",
    "I'm here to help! Let me search through our resources to give you the best possible answer."
  ];

  return projectResponses[Math.floor(Math.random() * projectResponses.length)] + 
    "\n\n(This is a simulated response for demonstration purposes. In a production environment, this would connect to the actual AI services and knowledge base.)";
}
