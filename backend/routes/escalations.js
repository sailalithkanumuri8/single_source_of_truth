var express = require('express');
var router = express.Router();
var escalations = require('../data/escalations');

router.get('/', function(req, res, next) {
  let filtered = [...escalations];

  if (req.query.status && req.query.status !== 'all') {
    filtered = filtered.filter(e => e.status === req.query.status);
  }

  if (req.query.priority && req.query.priority !== 'all') {
    filtered = filtered.filter(e => e.priority === req.query.priority);
  }

  if (req.query.category && req.query.category !== 'all') {
    filtered = filtered.filter(e => e.category === req.query.category);
  }

  if (req.query.search) {
    const searchLower = req.query.search.toLowerCase();
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower) ||
      e.id.toLowerCase().includes(searchLower) ||
      e.customer.toLowerCase().includes(searchLower) ||
      e.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  res.json(filtered);
});

router.get('/stats', function(req, res, next) {
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
    stats.avgConfidence += e.routingReasoning.confidence;
    if (e.context.slaStatus === 'At risk') stats.atRisk++;
  });

  if (escalations.length > 0) {
    stats.avgConfidence = stats.avgConfidence / escalations.length;
  }

  res.json(stats);
});

router.get('/:id', function(req, res, next) {
  const escalation = escalations.find(e => e.id === req.params.id);
  
  if (!escalation) {
    return res.status(404).json({ error: 'Escalation not found' });
  }
  
  res.json(escalation);
});

module.exports = router;

