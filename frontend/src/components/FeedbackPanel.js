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

      <section style={{ 
        border: '1px solid var(--border-color)', 
        borderRadius: 12, 
        padding: 16, 
        background: 'var(--bg-secondary)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
          AI Prediction Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}>
              Escalation ID
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
              {escalationId}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}>
              Predicted Team
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
              {predictedTeam}
            </div>
          </div>
          <div style={{ gridColumn: '1 / span 2' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}>
              Issue Summary
            </div>
            <div style={{ color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>{summary}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}>
              Confidence
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 120, 
                height: 8, 
                background: 'var(--bg-tertiary)', 
                borderRadius: 4, 
                overflow: 'hidden' 
              }}>
                <div style={{ width: `${confidencePercent}%`, height: '100%', background: '#10b981' }} />
              </div>
              <span style={{ color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
                {confidencePercent}%
              </span>
            </div>
          </div>
          <div style={{ gridColumn: '1 / span 2' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}>
              AI Reasoning
            </div>
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              color: 'var(--text-primary)',
              transition: 'color 0.3s ease'
            }}>
              {reasoning}
            </div>
          </div>
        </div>
      </section>

      <section style={{ 
        border: '1px solid var(--border-color)', 
        borderRadius: 12, 
        padding: 16, 
        background: 'var(--bg-secondary)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
          Feedback Actions
        </h3>
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
              fontWeight: 600,
              transition: 'opacity 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
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
              fontWeight: 600,
              transition: 'opacity 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Override Routing
          </button>
        </div>
      </section>

      {overrideOpen && (
        <section style={{ 
          border: '1px solid var(--border-color)', 
          borderRadius: 12, 
          padding: 16, 
          background: 'var(--bg-secondary)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
            Override Routing (Optional)
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ 
                fontSize: 12, 
                color: 'var(--text-secondary)', 
                marginBottom: 6,
                transition: 'color 0.3s ease'
              }}>
                Select Team
              </div>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
                }}
              >
                <option value="">Select a team</option>
                {TEAMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ 
                fontSize: 12, 
                color: 'var(--text-secondary)', 
                marginBottom: 6,
                transition: 'color 0.3s ease'
              }}>
                Reason for Override (optional)
              </div>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Add context for the override..."
                rows={4}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  border: '1px solid var(--border-color)', 
                  resize: 'vertical',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setOverrideOpen(false);
                  setSelectedTeam('');
                  setOverrideReason('');
                }}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 8, 
                  padding: '8px 12px', 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                onMouseOut={(e) => e.target.style.background = 'var(--bg-secondary)'}
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                style={{ 
                  background: '#2563eb', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '8px 12px', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                Submit Override
              </button>
            </div>
          </div>
        </section>
      )}

      {lastOverrideJson && (
        <section style={{ 
          border: '1px solid var(--border-color)', 
          borderRadius: 12, 
          padding: 16, 
          background: 'var(--bg-secondary)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
            Training Payload
          </h3>
          <div style={{ 
            fontSize: 12, 
            color: 'var(--text-secondary)', 
            marginBottom: 6,
            transition: 'color 0.3s ease'
          }}>
            Copy this JSON to feed the AI retraining loop
          </div>
          <pre style={{ 
            margin: 0, 
            padding: 12, 
            background: 'var(--bg-tertiary)', 
            borderRadius: 8, 
            overflowX: 'auto', 
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
          }}>
            {lastOverrideJson}
          </pre>
        </section>
      )}
    </div>
  );
};

export default FeedbackPanel;
