import React, { useMemo, useState, useEffect } from 'react';
import '../css/EscalationList.css';
import FeedbackPanel from './FeedbackPanel';
import { getStatusColor, getPriorityColor, formatRelativeDate } from '../utils/helpers';

const FeedbackView = ({ escalations, onUpdateEscalation }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [feedbackByEscalation, setFeedbackByEscalation] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  // Update selectedId when escalations load or change
  useEffect(() => {
    if (escalations && escalations.length > 0 && !selectedId) {
      setSelectedId(null); // Start with no selection to show all cards
    }
  }, [escalations, selectedId]);

  // Filter escalations
  const filteredEscalations = useMemo(() => {
    if (!escalations) return [];
    return escalations.filter(escalation => {
      if (filters.status !== 'all' && escalation.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'all' && escalation.priority !== filters.priority) {
        return false;
      }
      if (filters.category !== 'all' && escalation.category !== filters.category) {
        return false;
      }
      return true;
    });
  }, [escalations, filters]);

  const selected = useMemo(() => 
    selectedId ? escalations.find(e => e.id === selectedId) || null : null, 
    [selectedId, escalations]
  );

  // Calculate stats for filters
  const feedbackStats = useMemo(() => {
    const stats = {
      total: escalations?.length || 0,
      bySeverity: {},
      byPriority: {},
      byCategory: {}
    };

    escalations?.forEach(e => {
      stats.bySeverity[e.status] = (stats.bySeverity[e.status] || 0) + 1;
      stats.byPriority[e.priority] = (stats.byPriority[e.priority] || 0) + 1;
      stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
    });

    return stats;
  }, [escalations]);

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

  // Show card view when no escalation is selected
  if (!selectedId) {
    return (
      <div style={{ padding: '2rem' }}>
        {/* Filters Section */}
        <div style={{ 
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Status:</strong>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
              <option value="all">All Statuses ({feedbackStats.total})</option>
              <option value="critical">Critical ({feedbackStats.bySeverity.critical || 0})</option>
              <option value="high">High ({feedbackStats.bySeverity.high || 0})</option>
              <option value="medium">Medium ({feedbackStats.bySeverity.medium || 0})</option>
              <option value="low">Low ({feedbackStats.bySeverity.low || 0})</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Priority:</strong>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
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
              <option value="all">All Priorities ({feedbackStats.total})</option>
              <option value="P0">P0 - Critical ({feedbackStats.byPriority.P0 || 0})</option>
              <option value="P1">P1 - High ({feedbackStats.byPriority.P1 || 0})</option>
              <option value="P2">P2 - Medium ({feedbackStats.byPriority.P2 || 0})</option>
              <option value="P3">P3 - Low ({feedbackStats.byPriority.P3 || 0})</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Category:</strong>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
              <option value="all">All Categories ({feedbackStats.total})</option>
              {Object.keys(feedbackStats.byCategory).sort().map(category => (
                <option key={category} value={category}>
                  {category} ({feedbackStats.byCategory[category] || 0})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {filteredEscalations.length} result{filteredEscalations.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Escalation Cards */}
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
          fontSize: '14px'
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
