import React, { useState } from 'react';
import '../css/EscalationList.css';
import { getStatusColor, getPriorityColor, formatRelativeDate, getConfidenceColor } from '../utils/helpers';

const EscalationList = ({ escalations, onSelectEscalation }) => {
  const [viewMode, setViewMode] = useState('cards');

  if (escalations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3>No escalations found</h3>
        <p>Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="escalation-list">
      <div className="list-header">
        <div className="list-info">
          <h2>Escalations</h2>
          <span className="result-count">{escalations.length} results</span>
        </div>
        
        <div className="view-controls">
          <button
            className={`view-button ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Card view"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
            </svg>
          </button>
          <button
            className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="cards-grid">
          {escalations.map(escalation => (
            <div 
              key={escalation.id} 
              className="escalation-card"
              onClick={() => onSelectEscalation(escalation)}
            >
              <div className="card-header">
                <div className="card-meta">
                  <span 
                    className="priority-badge"
                    style={{ 
                      backgroundColor: `${getPriorityColor(escalation.priority)}15`,
                      color: getPriorityColor(escalation.priority)
                    }}
                  >
                    {escalation.priority}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${getStatusColor(escalation.status)}15`,
                      color: getStatusColor(escalation.status)
                    }}
                  >
                    <span 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(escalation.status) }}
                    />
                    {escalation.status}
                  </span>
                </div>
                <span className="escalation-id">{escalation.id}</span>
              </div>

              <h3 className="card-title">{escalation.title}</h3>
              <p className="card-description">{escalation.description}</p>

              <div className="card-details">
                <div className="detail-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{escalation.customer}</span>
                </div>
                <div className="detail-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{formatRelativeDate(escalation.createdAt)}</span>
                </div>
              </div>

              <div className="card-footer">
                <div className="assigned-team">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{escalation.assignedTo}</span>
                </div>
                <div className="category-tag">
                  {escalation.category}
                </div>
              </div>

              <div className="confidence-bar">
                <div className="confidence-label">
                  <span>AI Confidence</span>
                  <span className="confidence-value">
                    {Math.round(escalation.routingReasoning.confidence * 100)}%
                  </span>
                </div>
                <div className="confidence-track">
                  <div 
                    className="confidence-fill"
                    style={{ 
                      width: `${escalation.routingReasoning.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(escalation.routingReasoning.confidence)
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="escalations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Team</th>
                <th>Created</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {escalations.map(escalation => (
                <tr 
                  key={escalation.id}
                  onClick={() => onSelectEscalation(escalation)}
                  className="table-row"
                >
                  <td className="id-cell">{escalation.id}</td>
                  <td className="title-cell">
                    <div className="table-title">{escalation.title}</div>
                  </td>
                  <td>
                    <span 
                      className="status-badge small"
                      style={{ 
                        backgroundColor: `${getStatusColor(escalation.status)}15`,
                        color: getStatusColor(escalation.status)
                      }}
                    >
                      <span 
                        className="status-dot"
                        style={{ backgroundColor: getStatusColor(escalation.status) }}
                      />
                      {escalation.status}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="priority-badge small"
                      style={{ 
                        backgroundColor: `${getPriorityColor(escalation.priority)}15`,
                        color: getPriorityColor(escalation.priority)
                      }}
                    >
                      {escalation.priority}
                    </span>
                  </td>
                  <td>{escalation.customer}</td>
                  <td>
                    <span className="category-tag small">{escalation.category}</span>
                  </td>
                  <td className="team-cell">{escalation.assignedTo}</td>
                  <td className="date-cell">{formatRelativeDate(escalation.createdAt)}</td>
                  <td>
                    <div className="table-confidence">
                      <span>{Math.round(escalation.routingReasoning.confidence * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EscalationList;

