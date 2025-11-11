// EVA DA 2.0 - React Component Integration
// Agent 2: Complete React integration without TypeScript complexity

import React from 'react';

// Simple, working React components for Agent 2
export const EVANavigation = ({ children, theme = 'government-light' }) => {
  return (
    <nav className={va-navigation eva-theme-}>
      <div className="eva-nav-container">
        <div className="eva-nav-brand">
          <img src="/logo-eva.svg" alt="EVA DA 2.0" className="eva-logo" />
          <span className="eva-brand-text">EVA DA 2.0</span>
        </div>
        <div className="eva-nav-menu">
          {children}
        </div>
      </div>
    </nav>
  );
};

export const EVAAgentCard = ({ agent, onClick }) => {
  const getAgentIcon = (type) => {
    const icons = {
      data: '🔵',
      design: '🟣',
      monitoring: '🟢', 
      security: '🟡',
      api: '🔴',
      config: '⚙️'
    };
    return icons[type] || '🤖';
  };

  return (
    <div className={va-agent-card eva-agent-} onClick={onClick}>
      <div className="eva-card-header">
        <span className="eva-agent-icon">{getAgentIcon(agent.type)}</span>
        <h3 className="eva-agent-name">{agent.name}</h3>
      </div>
      <div className="eva-card-body">
        <p className="eva-agent-status">Status: {agent.status}</p>
        <div className="eva-progress-bar">
          <div 
            className="eva-progress-fill"
            style={{ width: ${agent.progress}% }}
          />
        </div>
        <p className="eva-progress-text">{agent.progress}% Complete</p>
      </div>
    </div>
  );
};

export const EVADashboard = ({ agents = [] }) => {
  return (
    <div className="eva-dashboard">
      <header className="eva-dashboard-header">
        <h1>EVA DA 2.0 - Multi-Agent Platform</h1>
        <p>Enterprise Virtual Assistant - Data Architecture 2.0</p>
      </header>
      
      <div className="eva-agents-grid">
        {agents.map(agent => (
          <EVAAgentCard 
            key={agent.id} 
            agent={agent}
            onClick={() => console.log('Agent clicked:', agent.name)}
          />
        ))}
      </div>
    </div>
  );
};

// Sample data for testing
export const sampleAgents = [
  { id: 1, name: 'Data Architecture', type: 'data', status: 'Ready', progress: 85 },
  { id: 2, name: 'Design System', type: 'design', status: 'In Progress', progress: 80 },
  { id: 3, name: 'Monitoring', type: 'monitoring', status: 'Active', progress: 45 },
  { id: 4, name: 'Security', type: 'security', status: 'Validating', progress: 60 },
  { id: 5, name: 'API Integration', type: 'api', status: 'Building', progress: 70 },
  { id: 6, name: 'Configuration', type: 'config', status: 'Ready', progress: 90 }
];

console.log('🟣 React components ready for Agent 2!');
