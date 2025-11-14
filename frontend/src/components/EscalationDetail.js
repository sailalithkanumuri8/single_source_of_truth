import React from 'react';
import '../css/EscalationDetail.css';
import { getStatusColor, getPriorityColor, formatDateTime } from '../utils/helpers';
import { useEffect, useState } from 'react';
import { fetchSimilarEscalations } from '../services/api';


const EscalationDetail = ({ escalation, onClose }) => {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    if (!escalation) return; 

    const loadSimilar = async () => {
      try {
        const data = await fetchSimilarEscalations(escalation.id);
        setSimilar(data);
      } catch (e) {
        console.error(e);
      }
    };

    loadSimilar();
  }, [escalation]);

  if (!escalation) return null;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="detail-content">
          {/* Header Section */}
          <div className="detail-header">
            <div className="detail-badges">
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
              <span className="escalation-id">{escalation.id}</span>
            </div>
            <h1 className="detail-title">{escalation.title}</h1>
            <p className="detail-description">{escalation.description}</p>
          </div>

          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#dbeafe', color: '#0078d4' }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="metric-info">
                <span className="metric-label">Customer</span>
                <span className="metric-value">{escalation.customer}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="metric-info">
                <span className="metric-label">Time to SLA</span>
                <span className="metric-value">{escalation.context?.timeToSLA || 'N/A'}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#fce7f3', color: '#ec4899' }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="metric-info">
                <span className="metric-label">Customer Tier</span>
                <span className="metric-value">{escalation.context?.customerTier || 'N/A'}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#dcfce7', color: '#10b981' }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="metric-info">
                <span className="metric-label">Est. Resolution</span>
                <span className="metric-value">{escalation.context?.estimatedResolutionTime || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* AI Routing Reasoning */}
          <div className="section-card ai-reasoning">
            <div className="section-header">
              <div className="section-icon" style={{ background: '#dbeafe', color: '#0078d4' }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h2 className="section-title">AI Routing Intelligence</h2>
                <p className="section-subtitle">Why this escalation was routed to {escalation.assignedTo || 'the team'}</p>
              </div>
            </div>

            <div className="confidence-section">
              <div className="confidence-header">
                <span className="confidence-label">Routing Confidence</span>
                <span className="confidence-percentage">
                  {Math.round(escalation.routingReasoning.confidence * 100)}%
                </span>
              </div>
              <div className="confidence-bar-large">
                <div 
                  className="confidence-fill-large"
                  style={{ 
                    width: `${escalation.routingReasoning.confidence * 100}%`,
                    background: escalation.routingReasoning.confidence > 0.9 
                      ? 'linear-gradient(90deg, #10b981, #059669)' 
                      : escalation.routingReasoning.confidence > 0.8 
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                      : 'linear-gradient(90deg, #ef4444, #dc2626)'
                  }}
                />
              </div>
            </div>

            <div className="reasoning-content">
              <div className="primary-reason">
                <h3>Primary Reason</h3>
                <p>{escalation.routingReasoning.primaryReason}</p>
              </div>

              <div className="factors-list">
                <h3>Contributing Factors</h3>
                {escalation.routingReasoning.factors && escalation.routingReasoning.factors.length > 0 ? (
                  <ul>
                    {escalation.routingReasoning.factors.map((factor, index) => (
                      <li key={index}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {factor}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No contributing factors identified.</p>
                )}
              </div>

              <div className="suggested-actions">
                <h3>Suggested Actions</h3>
                {escalation.routingReasoning.suggestedActions && escalation.routingReasoning.suggestedActions.length > 0 ? (
                  <div className="actions-grid">
                    {escalation.routingReasoning.suggestedActions.map((action, index) => (
                      <div key={index} className="action-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2"/>
                          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {action}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No suggested actions available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Context Section */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2 className="section-title">Context at a Glance</h2>
                <p className="section-subtitle">Key information about this escalation</p>
              </div>
            </div>

            <div className="context-grid">
              <div className="context-item">
                <span className="context-label">Impact Level</span>
                <span className="context-value">{escalation.context?.impactLevel || 'N/A'}</span>
              </div>
              <div className="context-item">
                <span className="context-label">Business Impact</span>
                <span className="context-value">{escalation.context?.businessImpact || 'N/A'}</span>
              </div>
              <div className="context-item">
                <span className="context-label">SLA Status</span>
                <span className={`context-value ${escalation.context?.slaStatus === 'At risk' ? 'text-danger' : 'text-success'}`}>
                  {escalation.context?.slaStatus || 'N/A'}
                </span>
              </div>
              <div className="context-item">
                <span className="context-label">Previous Escalations</span>
                <span className="context-value">{escalation.context?.previousEscalations || '0'}</span>
              </div>
            </div>

            <div className="related-section">
              <h3>Related Incidents</h3>
              {escalation.context?.relatedIncidents && escalation.context.relatedIncidents.length > 0 ? (
                <div className="related-tags">
                  {escalation.context.relatedIncidents.map((incident, index) => (
                    <span key={index} className="related-tag">{incident}</span>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>No related incidents.</p>
              )}
            </div>

            <div className="services-section">
              <h3>Affected Services</h3>
              {escalation.affectedServices && escalation.affectedServices.length > 0 ? (
                <div className="services-tags">
                  {escalation.affectedServices.map((service, index) => (
                    <span key={index} className="service-tag">{service}</span>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>No affected services listed.</p>
              )}
            </div>
          </div>
      
          {/* Similar Escalations */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2 className="section-title">Similar Past Escalations</h2>
                <p className="section-subtitle">Issues with similar context or description</p>
              </div>
            </div>

            {similar.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No similar escalations found.</p>
            ) : (
              <div className="similar-list">
                {similar.map(({ escalation: e, score }) => (
                  <div 
                    key={e.id} 
                    className="similar-item"
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new CustomEvent('openEscalation', { detail: e }));
                    }}
                  >
                    <div className="similar-title">{e.title}</div>

                    <div className="similar-info">
                      <span>{e.customer}</span>
                      <span>•</span>
                      <span>{e.priority}</span>
                      <span>•</span>
                      <span>{Math.round(score * 100)}% match</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2 className="section-title">Timeline</h2>
                <p className="section-subtitle">Activity history for this escalation</p>
              </div>
            </div>

            {escalation.timeline && escalation.timeline.length > 0 ? (
              <div className="timeline">
                {escalation.timeline.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-event">{event.event}</span>
                        <span className="timeline-time">{formatDateTime(event.timestamp)}</span>
                      </div>
                      <span className="timeline-user">by {event.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No timeline events yet.</p>
            )}
          </div>

          {/* Tags */}
          <div className="tags-section">
            <h3>Tags</h3>
            {escalation.tags && escalation.tags.length > 0 ? (
              <div className="tags-list">
                {escalation.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 7H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No tags.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscalationDetail;