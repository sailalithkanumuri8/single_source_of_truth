import React, { useMemo, useState } from 'react';

const TEAMS = ['Outlook', 'Exchange', 'Teams', 'Defender', 'DevOps Platform Team', 'Network Engineering Team', 'Cosmos DB Team'];

const FeedbackPanel = ({
  escalationId,
  summary,
  predictedTeam,
  confidence,
  reasoning,
  onSubmit
}) => {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [banner, setBanner] = useState(null);
  const [lastOverrideJson, setLastOverrideJson] = useState(null);

  const confidencePercent = useMemo(() => Math.round((confidence ?? 0) * 100), [confidence]);

  function handleApprove() {
    const payload = {
      escalationId,
      decision: 'approve',
      timestamp: new Date().toISOString()
    };
    console.log('HITL Feedback Submitted (approve):', payload);
    onSubmit?.(payload);
    setBanner(`Feedback saved: Approved routing for ${escalationId}`);
  }

  function handleOverrideSubmit() {
    if (!selectedTeam) {
      setBanner('Please select a team to override routing.');
      return;
    }
    const payload = {
      escalationId,
      decision: 'override',
      overriddenTeam: selectedTeam,
      reason: overrideReason?.trim() || undefined,
      timestamp: new Date().toISOString()
    };
    // Build JSON training payload for AI consumption
    const trainingPayload = {
      type: 'routing_feedback',
      version: 1,
      escalation: {
        id: escalationId,
        summary
      },
      ai_prediction: {
        team: predictedTeam,
        confidence,
        reasoning
      },
      human_feedback: {
        decision: 'override',
        overridden_team: selectedTeam,
        reason: overrideReason?.trim() || null,
        timestamp: payload.timestamp
      }
    };

    console.log('HITL Feedback Submitted (override):', payload);
    console.log('HITL Training JSON:', trainingPayload);
    setLastOverrideJson(JSON.stringify(trainingPayload, null, 2));
    onSubmit?.(payload);
    setBanner(`Feedback saved: Overrode routing to ${selectedTeam} for ${escalationId}`);
    setOverrideOpen(false);
    setOverrideReason('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {banner && (
        <div style={{
          background: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #10b981',
          padding: '10px 12px',
          borderRadius: 8
        }}>
          {banner}
        </div>
      )}

      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>AI Prediction Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Escalation ID</div>
            <div style={{ fontWeight: 600 }}>{escalationId}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Predicted Team</div>
            <div style={{ fontWeight: 600 }}>{predictedTeam}</div>
          </div>
          <div style={{ gridColumn: '1 / span 2' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Issue Summary</div>
            <div>{summary}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Confidence</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 120, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${confidencePercent}%`, height: '100%', background: '#10b981' }} />
              </div>
              <span>{confidencePercent}%</span>
            </div>
          </div>
          <div style={{ gridColumn: '1 / span 2' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>AI Reasoning</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{reasoning}</div>
          </div>
        </div>
      </section>

      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Feedback Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleApprove}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 14px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Approve Routing
          </button>
          <button
            onClick={() => setOverrideOpen((v) => !v)}
            style={{
              background: '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 14px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Override Routing
          </button>
        </div>
      </section>

      {overrideOpen && (
        <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Override Routing (Optional)</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Select Team</div>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
              >
                <option value="">Select a team</option>
                {TEAMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Reason for Override (optional)</div>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Add context for the override..."
                rows={4}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setOverrideOpen(false);
                  setSelectedTeam('');
                  setOverrideReason('');
                }}
                style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}
              >
                Submit Override
              </button>
            </div>
          </div>
        </section>
      )}

      {lastOverrideJson && (
        <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Training Payload</h3>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Copy this JSON to feed the AI retraining loop</div>
          <pre style={{ margin: 0, padding: 12, background: '#f9fafb', borderRadius: 8, overflowX: 'auto', border: '1px solid #e5e7eb' }}>{lastOverrideJson}</pre>
        </section>
      )}
    </div>
  );
};

export default FeedbackPanel;
