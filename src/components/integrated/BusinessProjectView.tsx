// src/components/integrated/BusinessProjectView.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { configManager } from '../../lib/configurationManager';
import { type User } from '../../lib/rbacManager';
// import { IntegratedChatInterface } from './IntegratedChatInterface';
import './ChatInterface.css';

interface BusinessProjectViewProps {
  projectId: string;
  user: User;
}

export function BusinessProjectView({ projectId, user }: BusinessProjectViewProps) {
  const { t } = useTranslation();  const [projectConfig, setProjectConfig] = useState(configManager.getProjectConfig(projectId as 'canadaLife' | 'jurisprudence' | 'admin' | 'AssistMe' | 'globalAdmin'));
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  useEffect(() => {
    setProjectConfig(configManager.getProjectConfig(projectId as 'canadaLife' | 'jurisprudence' | 'admin' | 'AssistMe' | 'globalAdmin'));
  }, [projectId]);

  if (!projectConfig) {
    return (
      <div className="project-not-found">
        <h2>Project Not Found</h2>
        <p>The selected project could not be loaded.</p>
      </div>
    );
  }
  const handleQuestionClick = (_questionId: string, questionText: string) => {
    setSelectedQuestion(questionText);
    setShowChat(true);
  };

  const handleStartChat = () => {
    setSelectedQuestion(null);
    setShowChat(true);
  };
  if (showChat) {
    return (
      <div className="chat-placeholder">
        <h2>Chat Interface</h2>
        <p>Chat interface will be integrated here.</p>
        {selectedQuestion && <p>Initial question: {selectedQuestion}</p>}
        <button onClick={() => {
          setShowChat(false);
          setSelectedQuestion(null);
        }}>
          Close Chat
        </button>
      </div>
    );
  }

  return (
    <div className="business-project-view">
      {/* Project Header */}
      <div className="project-header">
        <div className="project-hero" style={{
          background: `linear-gradient(135deg, ${projectConfig.uiConfig.theme.background}, ${projectConfig.uiConfig.theme.surface})`
        }}>
          <div className="project-hero-content">
            <div className="project-icon">
              {getProjectIcon(projectId)}
            </div>
            <div className="project-info">              <h1 className="project-title">{projectConfig.displayName || projectConfig.name}</h1>
              <p className="project-description">{projectConfig.businessInfo.businessCase}</p>
              <div className="project-meta">
                <span className="project-domain">{projectConfig.businessInfo.domain}</span>
                <span className="project-owner">Managed by {projectConfig.businessInfo.owner}</span>
              </div>
            </div>
            <div className="project-actions">
              <button 
                className="start-chat-btn"
                onClick={handleStartChat}
              >
                <span className="btn-icon">💬</span>
                {t('project.startChat', 'Start New Chat')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Questions Section */}
      <div className="questions-section">
        <div className="section-header">
          <h2>{t('project.quickQuestions', 'Quick Questions')}</h2>
          <p>{t('project.quickQuestionsDesc', 'Get started with these commonly asked questions')}</p>
        </div>        <div className="questions-grid">
          {/* Placeholder questions - will be loaded from project registry */}
          <div className="question-card">
            <h3>How can I get started with {projectConfig.displayName}?</h3>
            <p>Learn the basics and begin your journey with this project.</p>
            <button onClick={() => handleQuestionClick('starter', 'How can I get started?')}>
              Ask Question
            </button>
          </div>
          
          <div className="question-card">
            <h3>What features are available?</h3>
            <p>Discover the capabilities and tools in this project.</p>
            <button onClick={() => handleQuestionClick('features', 'What features are available?')}>
              Ask Question
            </button>
          </div>
        </div>
      </div>

      {/* Project Features */}
      <div className="features-section">
        <div className="section-header">
          <h2>{t('project.availableFeatures', 'Available Features')}</h2>
        </div>        <div className="features-grid">
          {Object.entries(projectConfig.uiConfig.features).map(([featureKey, enabled]) => (
            enabled && (
              <div key={featureKey} className="feature-card">
                <div className="feature-icon">
                  {getFeatureIcon(featureKey)}
                </div>
                <div className="feature-info">
                  <h3 className="feature-name">
                    {getFeatureName(featureKey)}
                  </h3>
                  <p className="feature-description">
                    {getFeatureDescription(featureKey)}
                  </p>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Project Stats */}
      <div className="stats-section">
        <div className="stats-grid">          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">2</div>
              <div className="stat-label">Quick Questions</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <div className="stat-value">
                {Object.values(projectConfig.uiConfig.features).filter(Boolean).length}
              </div>
              <div className="stat-label">Active Features</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎨</div>
            <div className="stat-info">
              <div className="stat-value">Custom</div>
              <div className="stat-label">Theme Applied</div>
            </div>
          </div>
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
  return icons[projectId] || '📁';
}

function getFeatureIcon(featureKey: string): string {
  const icons: Record<string, string> = {
    chat: '💬',
    rag: '🔍',
    translation: '🌐',
    export: '📄',
    analytics: '📊',
    compliance: '✅',
    bilingual: '🗣️',
    caselaw: '⚖️',
    citations: '📚'
  };
  return icons[featureKey] || '⚙️';
}

function getFeatureName(featureKey: string): string {
  const names: Record<string, string> = {
    chat: 'Interactive Chat',
    rag: 'Document Search',
    translation: 'Translation',
    export: 'Export Options',
    analytics: 'Analytics',
    compliance: 'Compliance Tools',
    bilingual: 'Bilingual Support',
    caselaw: 'Case Law Research',
    citations: 'Legal Citations'
  };
  return names[featureKey] || featureKey.charAt(0).toUpperCase() + featureKey.slice(1);
}

function getFeatureDescription(featureKey: string): string {
  const descriptions: Record<string, string> = {
    chat: 'Real-time conversation with AI assistant',
    rag: 'Intelligent document retrieval and search',
    translation: 'Multi-language support and translation',
    export: 'Export conversations and data',
    analytics: 'Usage analytics and insights',
    compliance: 'Regulatory compliance features',
    bilingual: 'English and French language support',
    caselaw: 'Access to legal case databases',
    citations: 'Automatic legal citation formatting'
  };
  return descriptions[featureKey] || `${featureKey} functionality`;
}
