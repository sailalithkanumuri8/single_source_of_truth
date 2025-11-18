export const STATUS_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#f59e0b',
  low: '#10b981',
  resolved: '#6b7280'
};

export const PRIORITY_COLORS = {
  P0: '#dc2626',
  P1: '#ea580c',
  P2: '#f59e0b',
  P3: '#10b981',
  P4: '#6b7280'
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.medium;
};

export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.P2;
};

export const formatRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'   });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getConfidenceColor = (confidence) => {
  if (confidence > 0.9) return '#10b981';
  if (confidence > 0.8) return '#f59e0b';
  return '#ef4444';
};

export const calculateStats = (escalations) => {
  const stats = {
    total: escalations.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    avgConfidence: 0,
    atRisk: 0,
    bySeverity: {},
    byPriority: {},
    byCategory: {},
    byTeam: {}
  };

  escalations.forEach(e => {
    if (e.status === 'critical') stats.critical++;
    else if (e.status === 'high') stats.high++;
    else if (e.status === 'medium') stats.medium++;
    else if (e.status === 'low') stats.low++;

    stats.bySeverity[e.status] = (stats.bySeverity[e.status] || 0) + 1;
    stats.byPriority[e.priority] = (stats.byPriority[e.priority] || 0) + 1;
    stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
    stats.byTeam[e.assignedTo] = (stats.byTeam[e.assignedTo] || 0) + 1;
    stats.avgConfidence += e.routingReasoning?.confidence || 0;

    if (e.context?.slaStatus === 'At risk') stats.atRisk++;
  });

  if (escalations.length > 0) {
    stats.avgConfidence = stats.avgConfidence / escalations.length;
  }

  return stats;
};

