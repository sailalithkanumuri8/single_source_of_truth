import React, { useMemo, useState, useEffect } from 'react';
import '../css/EscalationList.css';
import FeedbackPanel from './FeedbackPanel';
import { getStatusColor, getPriorityColor, formatRelativeDate } from '../utils/helpers';

const FeedbackView = ({ escalations, onUpdateEscalation, searchTerm, filters }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [feedbackByEscalation, setFeedbackByEscalation] = useState({});
  const [viewMode, setViewMode] = useState('cards');
  const [approvedFilter, setApprovedFilter] = useState('all'); // 'all', 'approved', 'unapproved', 'overridden'

  // Update selectedId when escalations load or change
  useEffect(() => {
    if (escalations && escalations.length > 0 && !selectedId) {
      setSelectedId(null); // Start with no selection to show all cards
    }
  }, [escalations, selectedId]);

  // Filter escalations based on sidebar filters, search, and approved status
  const filteredEscalations = useMemo(() => {
    if (!escalations) return [];
    return escalations.filter(escalation => {
      // Apply sidebar filters (status, priority, category)
      if (filters.status !== 'all' && escalation.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'all' && escalation.priority !== filters.priority) {
        return false;
      }
      if (filters.category !== 'all' && escalation.category !== filters.category) {
        return false;
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !escalation.title.toLowerCase().includes(searchLower) &&
          !escalation.description.toLowerCase().includes(searchLower) &&
          !escalation.id.toLowerCase().includes(searchLower) &&
          !escalation.customer.toLowerCase().includes(searchLower) &&
          !(escalation.tags && escalation.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        ) {
          return false;
        }
      }

      // Apply approved/unapproved filter
      const fb = feedbackByEscalation[escalation.id];
      if (approvedFilter === 'approved' && (!fb || fb.decision !== 'approve')) {
        return false;
      }
      if (approvedFilter === 'unapproved' && fb) {
        return false;
      }
      if (approvedFilter === 'overridden' && (!fb || fb.decision !== 'override')) {
        return false;
      }

      return true;
    });
  }, [escalations, filters, searchTerm, approvedFilter, feedbackByEscalation]);

  const selected = useMemo(() => 
    selectedId ? escalations.find(e => e.id === selectedId) || null : null, 
    [selectedId, escalations]
  );

  // Calculate stats for approved filter
  const approvedStats = useMemo(() => {
    const stats = {
      all: escalations?.length || 0,
      approved: 0,
      unapproved: 0,
      overridden: 0
    };

    escalations?.forEach(e => {
      const fb = feedbackByEscalation[e.id];
      if (fb) {
        if (fb.decision === 'approve') stats.approved++;
        if (fb.decision === 'override') stats.overridden++;
      } else {
        stats.unapproved++;
      }
    });

    return stats;
  }, [escalations, feedbackByEscalation]);

  function toPanelProps(escalation) {
    return {
      escalationId: escalation.id,
      summary: `${escalation.title} — ${escalation.description}`,
      predictedTeam: (escalation.assignedTo || 'Unknown'),
      confidence: (escalation.routingReasoning?.confidence ?? 0),
      reasoning: (
        `${escalation.routingReasoning?.primaryReason ?? ''}\n` +
        `${(escalation.routingReasoning?.factors || []).map((f) => `• ${f}`).join('\n')}`
      ).trim()
    };
  }

  // Handle empty escalations
  if (!escalations || escalations.length === 0) {
    return (
      <div style={{
        border: '1px dashed var(--border-color)',
        borderRadius: 12,
        padding: 24,
        color: 'var(--text-secondary)',
        background: 'var(--bg-tertiary)',
        textAlign: 'center',
        margin: '2rem'
      }}>
        <h3>No escalations available</h3>
        <p>Escalations will appear here once loaded from the backend.</p>
      </div>
    );
  }

  // Show card/list view when no escalation is selected
  if (!selectedId) {
    return (
      <div style={{ padding: '2rem' }}>
        {/* Header with view controls and approved filter */}
        <div className="list-header">
          <div className="list-info">
            <h2>Feedback</h2>
            <span className="result-count">{filteredEscalations.length} result{filteredEscalations.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Approved Status Filter */}
            <select
              value={approvedFilter}
              onChange={(e) => setApprovedFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All ({approvedStats.all})</option>
              <option value="approved">Approved ({approvedStats.approved})</option>
              <option value="unapproved">Unapproved ({approvedStats.unapproved})</option>
              <option value="overridden">Overridden ({approvedStats.overridden})</option>
            </select>

            {/* View Mode Toggle */}
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
        </div>

        {/* Card View */}
        {viewMode === 'cards' ? (
          <div className="cards-grid">
            {filteredEscalations.map((e) => {
              const fb = feedbackByEscalation[e.id];
              return (
                <div
                  key={e.id}
                  className="escalation-card"
                  onClick={() => setSelectedId(e.id)}
                >
                  <div className="card-header">
                    <div className="card-meta">
                      <span
                        className="priority-badge"
                        style={{
                          backgroundColor: `${getPriorityColor(e.priority)}15`,
                          color: getPriorityColor(e.priority)
                        }}
                      >
                        {e.priority}
                      </span>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: `${getStatusColor(e.status)}15`,
                          color: getStatusColor(e.status)
                        }}
                      >
                        <span
                          className="status-dot"
                          style={{ backgroundColor: getStatusColor(e.status) }}
                        />
                        {e.status}
                      </span>
                      {fb && (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: fb.decision === 'approve' ? '#10b98115' : '#2563eb15',
                            color: fb.decision === 'approve' ? '#10b981' : '#2563eb'
                          }}
                        >
                          {fb.decision === 'approve' ? '✓ Approved' : '↷ Overridden'}
                        </span>
                      )}
                    </div>
                    <span className="escalation-id">{e.id}</span>
                  </div>

                  <h3 className="card-title">{e.title}</h3>
                  <p className="card-description">{e.description}</p>

                  <div className="card-footer">
                    <div className="assigned-team">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>{e.assignedTo}</span>
                    </div>
                    <div className="category-tag">
                      {e.category}
                    </div>
                  </div>

                  {fb && fb.decision === 'override' && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      paddingTop: '0.75rem', 
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      Overridden to: <strong style={{ color: '#2563eb' }}>{fb.overriddenTeam}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="table-container">
            <table className="escalations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Team</th>
                  <th>Category</th>
                  <th>Approved Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEscalations.map((e) => {
                  const fb = feedbackByEscalation[e.id];
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedId(e.id)}
                      className="table-row"
                    >
                      <td className="id-cell">{e.id}</td>
                      <td className="title-cell">
                        <div className="table-title">{e.title}</div>
                      </td>
                      <td>
                        <span
                          className="status-badge small"
                          style={{
                            backgroundColor: `${getStatusColor(e.status)}15`,
                            color: getStatusColor(e.status)
                          }}
                        >
                          <span
                            className="status-dot"
                            style={{ backgroundColor: getStatusColor(e.status) }}
                          />
                          {e.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className="priority-badge small"
                          style={{
                            backgroundColor: `${getPriorityColor(e.priority)}15`,
                            color: getPriorityColor(e.priority)
                          }}
                        >
                          {e.priority}
                        </span>
                      </td>
                      <td className="team-cell">{e.assignedTo}</td>
                      <td>
                        <span className="category-tag small">{e.category}</span>
                      </td>
                      <td>
                        {fb ? (
                          <span
                            className="status-badge small"
                            style={{
                              backgroundColor: fb.decision === 'approve' ? '#10b98115' : '#2563eb15',
                              color: fb.decision === 'approve' ? '#10b981' : '#2563eb'
                            }}
                          >
                            {fb.decision === 'approve' ? '✓ Approved' : `↷ ${fb.overriddenTeam}`}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            Unapproved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredEscalations.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>No escalations found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    );
  }

  // Show detail view when escalation is selected
  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => setSelectedId(null)}
        style={{
          marginBottom: '1rem',
          padding: '8px 16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'var(--bg-tertiary)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'var(--bg-secondary)';
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to List
      </button>

      <div style={{ 
        border: '1px solid var(--border-color)', 
        borderRadius: 12, 
        padding: '1.5rem', 
        background: 'var(--bg-secondary)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <FeedbackPanel
          {...toPanelProps(selected)}
          onSubmit={(payload) => {
            // Save feedback record
            setFeedbackByEscalation((prev) => ({ ...prev, [payload.escalationId]: payload }));
            
            // If override, update the escalation's assignedTo team
            if (payload.decision === 'override' && payload.overriddenTeam) {
              // Get the current escalation to preserve its timeline
              const escalation = selected || escalations.find(e => e.id === payload.escalationId);
              
              if (escalation) {
                const newTimelineEntry = {
                  timestamp: payload.timestamp,
                  event: `Routed to ${payload.overriddenTeam} (Override)`,
                  user: 'Human Reviewer'
                };
                
                // Update both assignedTo and timeline in a single call
                onUpdateEscalation(payload.escalationId, {
                  assignedTo: payload.overriddenTeam,
                  updatedAt: new Date().toISOString(),
                  timeline: [...(escalation.timeline || []), newTimelineEntry]
                });
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default FeedbackView;
