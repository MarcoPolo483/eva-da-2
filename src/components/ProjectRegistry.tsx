// src/components/ProjectRegistry.tsx
import React from 'react';
import type { Project } from '../types/project';

interface Props {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export const ProjectRegistry: React.FC<Props> = ({ projects, onSelectProject }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--eva-bg)',
        color: '#111',
        fontSize: 'var(--eva-font-size-base)'
      }}
    >
      {/* Top nav bar (admin theme is applied via ProjectThemeProvider) */}
      <header
        style={{
          backgroundColor: 'var(--eva-nav)',
          color: 'var(--eva-nav-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 600 }}>EVA Domain Assistant</span>
          <span
            style={{
              fontSize: '0.8em',
              padding: '2px 8px',
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.12)'
            }}
          >
            Admin
          </span>
        </div>
        <div style={{ fontSize: '0.9em' }}>EN | FR</div>
      </header>

      {/* Banner / tagline */}
      <div
        style={{
          backgroundColor: 'var(--eva-banner)',
          color: 'var(--eva-banner-text)',
          padding: '18px 32px 24px'
        }}
      >
        <div
          style={{
            fontSize: '0.85em',
            opacity: 0.9,
            marginBottom: 4
          }}
        >
          EVA DA 2.0 demo – project-aware, bilingual, accessible
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 'calc(var(--eva-font-size-base) * 1.8)'
          }}
        >
          Project Register Administration
        </h1>
        <div
          style={{
            marginTop: 4,
            fontSize: `calc(var(--eva-font-size-base) * 0.95)`,
            opacity: 0.95
          }}
        >
          Configure project-aware assistants for EVA Domain Assistant.
        </div>
      </div>

      {/* Main content: simple admin form + table */}
      <main
        style={{
          padding: '24px 32px 32px'
        }}
      >
        {/* Simple "Project:" field + buttons row (like slide) */}
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label
              htmlFor="project-name"
              style={{ fontWeight: 600, fontSize: '0.95em' }}
            >
              Project:
            </label>
            <input
              id="project-name"
              type="text"
              placeholder="Select a project from the table…"
              style={{
                minWidth: 260,
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px solid #ccc',
                fontSize: '0.95em'
              }}
              readOnly
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={primaryButtonStyle}
            >
              Save
            </button>
            <button
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
            <button
              style={secondaryButtonStyle}
            >
              Exit Project Register
            </button>
          </div>
        </div>

        {/* Project list */}
        <div
          style={{
            borderRadius: 'var(--eva-radius)',
            overflow: 'hidden',
            border: '1px solid #ddd',
            backgroundColor: 'var(--eva-surface)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f0f0f0' }}>
              <tr>
                <th style={thStyle}>Project</th>
                <th style={thStyle}>Owner</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Security</th>
                <th style={thStyle}>Look &amp; feel</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  style={{
                    cursor: 'pointer',
                    borderTop: '1px solid #eee'
                  }}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '0.9em', color: '#555' }}>{p.description}</div>
                  </td>
                  <td style={tdStyle}>
                    <div>{p.ownerName}</div>
                    <div style={{ fontSize: '0.85em', color: '#555' }}>{p.ownerEmail}</div>
                  </td>
                  <td style={tdStyle}>{p.status}</td>
                  <td style={tdStyle}>{p.securityClassification}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: p.lookAndFeel.primaryColor,
                          border: '1px solid #ddd'
                        }}
                      />
                      <span style={{ fontSize: '0.9em' }}>
                        base font {p.lookAndFeel.baseFontSizePx}px
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p
          style={{
            marginTop: 10,
            fontSize: '0.85em',
            color: '#555'
          }}
        >
          Click a project row to open its assistant view with the configured look and feel.
        </p>
      </main>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  fontSize: '0.9em',
  borderBottom: '1px solid #ddd'
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'top',
  fontSize: '0.95em'
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: 'var(--eva-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '0.9em'
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  color: '#333',
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '0.9em'
};
