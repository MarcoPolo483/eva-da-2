// src/components/ConfigurationDiagnostics.tsx
import React, { useState, useEffect } from 'react';
import { configTester } from '../lib/configurationTest';

export function ConfigurationDiagnostics() {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const systemReport = configTester.generateReport();
      setReport(systemReport);
    } catch (error) {
      setReport(`Error generating report: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run diagnostics on component mount
    runDiagnostics();
  }, []);

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eva-config-diagnostics-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="configuration-diagnostics">
      <div className="diagnostics-header">
        <h2>Configuration System Diagnostics</h2>
        <p>Real-time system health and configuration validation</p>
        
        <div className="diagnostics-actions">
          <button 
            onClick={runDiagnostics}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Running Tests...' : 'Run Diagnostics'}
          </button>
          
          {report && (
            <button 
              onClick={downloadReport}
              className="btn-secondary"
            >
              Download Report
            </button>
          )}
        </div>
      </div>

      {report && (
        <div className="diagnostics-report">
          <pre className="report-content">
            {report}
          </pre>
        </div>
      )}

      <style jsx>{`
        .configuration-diagnostics {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .diagnostics-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .diagnostics-header h2 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 24px;
        }

        .diagnostics-header p {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 14px;
        }

        .diagnostics-actions {
          display: flex;
          gap: 10px;
        }

        .btn-primary, .btn-secondary {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background-color: #2196F3;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #1976D2;
        }

        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover {
          background-color: #e0e0e0;
        }

        .diagnostics-report {
          margin-top: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: #fafafa;
        }

        .report-content {
          padding: 20px;
          margin: 0;
          white-space: pre-wrap;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: transparent;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
