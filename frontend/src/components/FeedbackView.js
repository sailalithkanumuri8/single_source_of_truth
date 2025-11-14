import React, { useMemo, useState, useEffect } from 'react';
import FeedbackPanel from './FeedbackPanel';

const FeedbackView = ({ escalations, onUpdateEscalation }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [feedbackByEscalation, setFeedbackByEscalation] = useState({});

  // Update selectedId when escalations load or change
  useEffect(() => {
    if (escalations && escalations.length > 0 && !selectedId) {
      setSelectedId(escalations[0].id);
    }
  }, [escalations, selectedId]);

  const selected = useMemo(() => escalations.find(e => e.id === selectedId) || null, [selectedId, escalations]);

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
        border: '1px dashed #d1d5db',
        borderRadius: 12,
        padding: 24,
        color: '#6b7280',
        background: '#fafafa',
        textAlign: 'center'
      }}>
        <h3>No escalations available</h3>
        <p>Escalations will appear here once loaded from the backend.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
      <aside style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>Select Escalation</div>
        <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
          {escalations.map((e) => {
            const isActive = e.id === selectedId;
            const fb = feedbackByEscalation[e.id];
            return (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  background: isActive ? '#eff6ff' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontWeight: 600 }}>{e.id}</div>
                  {fb && (
                    <span style={{ fontSize: 12, color: fb.decision === 'approve' ? '#10b981' : '#2563eb' }}>
                      {fb.decision === 'approve' ? 'Approved' : `Overridden → ${fb.overriddenTeam}`}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Team: {e.assignedTo}</div>
              </button>
            );
          })}
        </div>
      </aside>

      <main style={{ minHeight: 320 }}>
        {selected ? (
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
        ) : (
          <div style={{
            border: '1px dashed #d1d5db',
            borderRadius: 12,
            padding: 24,
            color: '#6b7280',
            background: '#fafafa'
          }}>
            Select an escalation from the list to review and provide feedback.
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedbackView;
