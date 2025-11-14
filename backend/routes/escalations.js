var express = require('express');
var router = express.Router();
var escalations = require('../data/escalations');


const natural = require("natural");

router.get('/:id/similar', (req, res) => {
  const id = req.params.id;
  const target = escalations.find(e => e.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Escalation not found' });
  }

  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  const buildDoc = (e) =>
    `${e.title} ${e.description} ${e.category} ${e.subcategory} ${e.tags.join(" ")}`;

  escalations.forEach(e => tfidf.addDocument(buildDoc(e)));

  const targetIndex = escalations.findIndex(e => e.id === id);

  const calculateCosineSimilarity = (idx1, idx2) => {
    const terms1 = {};
    const terms2 = {};

    tfidf.listTerms(idx1).forEach(item => {
      terms1[item.term] = item.tfidf;
    });

    tfidf.listTerms(idx2).forEach(item => {
      terms2[item.term] = item.tfidf;
    });

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    const allTerms = new Set([...Object.keys(terms1), ...Object.keys(terms2)]);

    allTerms.forEach(term => {
      const val1 = terms1[term] || 0;
      const val2 = terms2[term] || 0;
      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  };

  const SIMILARITY_THRESHOLD = 0.15; 

  let similarities = [];

  escalations.forEach((e, idx) => {
    if (idx === targetIndex) return;

    const similarity = calculateCosineSimilarity(targetIndex, idx);

    if (similarity >= SIMILARITY_THRESHOLD) {
      similarities.push({
        escalation: e,
        score: Number(similarity.toFixed(3))
      });
    }
  });
  similarities.sort((a, b) => b.score - a.score);

  res.json(similarities.slice(0, 2));
});

router.get('/', function(req, res, next) {
  let filtered = [...escalations];

  if (req.query.status && req.query.status !== 'all') {
    filtered = filtered.filter(e => e.status === req.query.status);
  }

  if (req.query.priority && req.query.priority !== 'all') {
    filtered = filtered.filter(e => e.priority === req.query.priority);
  }

  if (req.query.category && req.query.category !== 'all') {
    const categoryMap = {
      'data & storage': 'Data',          
      'identity & access': 'Identity',    
      'infrastructure': 'Infrastructure',
      'networking': 'Networking',
      'containers': 'Containers'
    };
    
    const filterValue = req.query.category.toLowerCase();  
    const actualCategory = categoryMap[filterValue] || req.query.category;
    
    filtered = filtered.filter(e => e.category === actualCategory);
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

