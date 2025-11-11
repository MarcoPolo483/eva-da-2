// src/App.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EVAIntegratedApp } from "./components/EVAIntegratedApp";
import { configManager } from "./lib/configurationManager";
import { migrateToConfigurationSystem } from "./lib/configurationMigration";
import "./App.css";

// Import integrated app styles
import "./components/integrated/EVAIntegratedApp.css";

function App() {
  const { t } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize configuration system and migration
    const initializeApp = async () => {
      try {
        // Run migration to ensure configuration system is set up
        migrateToConfigurationSystem();
        
        // Apply initial global theme
        const globalConfig = configManager.getGlobalConfig();
        if (globalConfig.theme) {
          configManager.applyTheme(globalConfig.theme);
        }

        setIsInitialized(true);
        console.log('[App] EVA DA 2.0 Integrated App initialized successfully');
      } catch (error) {
        console.error('[App] Failed to initialize app:', error);
        setIsInitialized(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="eva-logo">
            <div className="logo-icon">EVA</div>
            <div className="logo-text">Digital Assistant 2.0</div>
          </div>
          <div className="loading-spinner"></div>
          <p>Initializing EVA DA 2.0...</p>
        </div>
        
        <style jsx>{`
          .app-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .eva-logo {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .logo-icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            font-weight: bold;
            font-size: 20px;
          }

          .logo-text {
            font-size: 28px;
            font-weight: 600;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <EVAIntegratedApp />;
}

export default App;
