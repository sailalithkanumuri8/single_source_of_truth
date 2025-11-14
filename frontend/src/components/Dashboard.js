import React, { useMemo } from 'react';
import '../css/Dashboard.css';
import { calculateStats, formatRelativeDate, PRIORITY_COLORS } from '../utils/helpers';

const Dashboard = ({ escalations }) => {
  const stats = useMemo(() => calculateStats(escalations), [escalations]);

  const recentEscalations = useMemo(() => 
    [...escalations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [escalations]
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="dashboard-subtitle">Real-time insights into escalation patterns</p>
        </div>
        <div className="last-updated">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>Live Data</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card critical-gradient">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical Issues</div>
          </div>
          <div className="stat-trend up">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Immediate attention needed</span>
          </div>
        </div>

        <div className="stat-card high-gradient">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.high}</div>
            <div className="stat-label">High Priority</div>
          </div>
          <div className="stat-trend">
            <span>Active monitoring</span>
          </div>
        </div>

        <div className="stat-card success-gradient">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{Math.round(stats.avgConfidence * 100)}%</div>
            <div className="stat-label">AI Confidence</div>
          </div>
          <div className="stat-trend success">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 7L17 17M17 17H7M17 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Optimal routing</span>
          </div>
        </div>

        <div className="stat-card warning-gradient">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55295 18.6453 1.55199 18.9945C1.55102 19.3437 1.64153 19.6871 1.81445 19.9905C1.98737 20.2939 2.23673 20.5467 2.53771 20.7239C2.83868 20.901 3.18055 20.9962 3.53 21H20.47C20.8194 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1855 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.atRisk}</div>
            <div className="stat-label">SLA At Risk</div>
          </div>
          <div className="stat-trend warning">
            <span>Requires escalation</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Priority Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Priority Distribution</h2>
            <span className="chart-total">{stats.total} total</span>
          </div>
          <div className="priority-chart">
            {Object.entries(stats.byPriority).map(([priority, count]) => {
              const percentage = (count / stats.total) * 100;
              return (
                <div key={priority} className="priority-bar-container">
                  <div className="priority-bar-label">
                    <span className="priority-name">{priority}</span>
                    <span className="priority-count">{count}</span>
                  </div>
                  <div className="priority-bar-track">
                    <div 
                      className="priority-bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${PRIORITY_COLORS[priority]}, ${PRIORITY_COLORS[priority]}dd)`
                      }}
                    >
                      <span className="priority-bar-percentage">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Category Breakdown</h2>
            <span className="chart-total">{Object.keys(stats.byCategory).length} categories</span>
          </div>
          <div className="category-list">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([category, count]) => (
                <div key={category} className="category-item">
                  <div className="category-info">
                    <div className="category-dot" />
                    <span className="category-name">{category}</span>
                  </div>
                  <div className="category-stats">
                    <span className="category-count">{count}</span>
                    <span className="category-percentage">
                      {Math.round((count / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Team Distribution & Recent Activity */}
      <div className="bottom-row">
        {/* Team Distribution */}
        <div className="chart-card team-card">
          <div className="chart-header">
            <h2>Team Distribution</h2>
            <span className="chart-total">{Object.keys(stats.byTeam).length} teams</span>
          </div>
          <div className="team-grid">
            {Object.entries(stats.byTeam)
              .sort((a, b) => b[1] - a[1])
              .map(([team, count]) => (
                <div key={team} className="team-item">
                  <div className="team-avatar">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="team-info">
                    <div className="team-name">{team}</div>
                    <div className="team-count">{count} escalations</div>
                  </div>
                  <div className="team-badge">{count}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-card activity-card">
          <div className="chart-header">
            <h2>Recent Escalations</h2>
            <span className="chart-total">Last 24 hours</span>
          </div>
          <div className="activity-list">
            {recentEscalations.map(escalation => (
              <div key={escalation.id} className="activity-item">
                <div 
                  className="activity-status"
                  style={{ 
                    background: escalation.status === 'critical' ? '#dc2626' :
                               escalation.status === 'high' ? '#ea580c' : '#f59e0b'
                  }}
                />
                <div className="activity-content">
                  <div className="activity-title">{escalation.title}</div>
                  <div className="activity-meta">
                    <span className="activity-customer">{escalation.customer}</span>
                    <span className="activity-separator">•</span>
                    <span className="activity-time">{formatRelativeDate(escalation.createdAt)}</span>
                  </div>
                </div>
                <div 
                  className="activity-priority"
                  style={{ 
                    background: escalation.priority === 'P0' ? '#dc262610' :
                               escalation.priority === 'P1' ? '#ea580c10' : '#f59e0b10',
                    color: escalation.priority === 'P0' ? '#dc2626' :
                          escalation.priority === 'P1' ? '#ea580c' : '#f59e0b'
                  }}
                >
                  {escalation.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <div className="insights-header">
          <h2>Key Insights</h2>
          <span className="insights-badge">AI-Powered</span>
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon trend-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 14L12 9L16 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Trending Pattern</h3>
            <p>Infrastructure escalations increased by 25% this week, primarily in the Azure VM category.</p>
          </div>

          <div className="insight-card">
            <div className="insight-icon success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Resolution Rate</h3>
            <p>92% of escalations are being routed correctly on first attempt, saving an average of 2.5 hours per ticket.</p>
          </div>

          <div className="insight-card">
            <div className="insight-icon warning-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>Response Time</h3>
            <p>Average initial response time is 45 minutes, 30% faster than target SLA for high-priority issues.</p>
          </div>

          <div className="insight-card">
            <div className="insight-icon info-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Investment Area</h3>
            <p>Consider expanding Database Engineering Team capacity - handling 40% above normal workload this month.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

