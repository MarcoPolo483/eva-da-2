// src/App-Integrated.tsx
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
      </div>
    );
  }

  return <EVAIntegratedApp />;
}

export default App;
