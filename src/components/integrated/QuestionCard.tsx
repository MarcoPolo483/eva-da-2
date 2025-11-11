// src/components/integrated/QuestionCard.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Question {
  id: string;
  question: string;
  expectedPattern?: string;
  category?: string;
  priority?: number;
}

interface Theme {
  background: string;
  surface: string;
  text?: string;
  baseFontPx?: number;
}

interface QuestionCardProps {
  question: Question;
  projectTheme: Theme;
  onClick: () => void;
  index: number;
}

export function QuestionCard({ question, projectTheme, onClick, index }: QuestionCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${projectTheme.surface}15, ${projectTheme.background}10)`,
    borderLeft: `4px solid ${projectTheme.background}`,
    animationDelay: `${index * 0.1}s`
  };

  const iconStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${projectTheme.background}, ${projectTheme.surface})`,
  };

  return (
    <div 
      className={`question-card ${isHovered ? 'hovered' : ''}`}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="question-card-header">
        <div className="question-icon" style={iconStyle}>
          <span className="icon-text">Q</span>
        </div>
        <div className="question-priority">
          {question.priority && (
            <span className="priority-badge">
              {t('question.priority', 'Priority')} {question.priority}
            </span>
          )}
        </div>
      </div>

      <div className="question-content">
        <h3 className="question-text">{question.question}</h3>
        
        {question.category && (
          <div className="question-category">
            <span className="category-tag">{question.category}</span>
          </div>
        )}

        {question.expectedPattern && (
          <div className="question-pattern">
            <span className="pattern-label">{t('question.expectedTopic', 'Topic:')}</span>
            <span className="pattern-text">{question.expectedPattern}</span>
          </div>
        )}
      </div>

      <div className="question-actions">
        <div className="action-text">
          {t('question.askThis', 'Ask this question')}
        </div>
        <div className="action-arrow">→</div>
      </div>

      <style jsx>{`
        .question-card {
          display: flex;
          flex-direction: column;
          padding: 20px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .question-card:hover,
        .question-card.hovered {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .question-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 20px 20px 0;
          border-color: transparent ${projectTheme.background}40 transparent transparent;
          transition: all 0.3s ease;
        }

        .question-card:hover::before {
          border-width: 0 30px 30px 0;
        }

        .question-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .question-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .icon-text {
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }

        .question-priority {
          flex-shrink: 0;
        }

        .priority-badge {
          background: rgba(0, 0, 0, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .question-content {
          flex: 1;
          margin-bottom: 16px;
        }

        .question-text {
          margin: 0 0 12px;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.4;
          color: #333;
        }

        .question-category {
          margin-bottom: 8px;
        }

        .category-tag {
          background: ${projectTheme.background}20;
          color: ${projectTheme.background};
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .question-pattern {
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          border: 1px solid #e9ecef;
        }

        .pattern-label {
          font-weight: 600;
          color: #666;
          margin-right: 6px;
        }

        .pattern-text {
          color: #333;
          font-style: italic;
        }

        .question-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }

        .action-text {
          font-size: 13px;
          font-weight: 500;
          color: ${projectTheme.background};
          opacity: 0.8;
        }

        .action-arrow {
          font-size: 16px;
          color: ${projectTheme.background};
          transform: translateX(0);
          transition: transform 0.2s ease;
        }

        .question-card:hover .action-arrow,
        .question-card.hovered .action-arrow {
          transform: translateX(4px);
        }

        .question-card:hover .action-text,
        .question-card.hovered .action-text {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .question-card {
            padding: 16px;
          }

          .question-text {
            font-size: 14px;
          }

          .question-icon {
            width: 35px;
            height: 35px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
