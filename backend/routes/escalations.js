const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const natural = require('natural');

const CONFIG = {
  dataPaths: [
    process.env.ESCALATIONS_DATA_PATH,
    path.join(__dirname, '../../data_preprocessing/incidents_enriched.json'),
    path.join(__dirname, '../data/escalations.json')
  ].filter(Boolean).map(p => path.resolve(p)),
  similarity: { threshold: 0.15, maxResults: 2 }
};

const loadEscalations = () => {
  for (const dataPath of CONFIG.dataPaths) {
    try {
      if (!fs.existsSync(dataPath)) continue;
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      console.log(`✓ Loaded ${data.length} escalations from ${path.relative(process.cwd(), dataPath)}`);
      return data;
    } catch (error) {
      console.warn(`⚠️  Failed to load from ${dataPath}: ${error.message}`);
    }
  }
  throw new Error('No escalation dataset found. Run the data_preprocessing pipeline first.');
};

const escalations = loadEscalations();

const buildDocument = (e) => 
  `${e.title || ''} ${e.description || ''} ${e.category || ''} ${e.subcategory || ''} ${(e.tags || []).join(' ')}`;

const getTermVector = (tfidf, idx) => {
  const terms = {};
  tfidf.listTerms(idx).forEach(item => terms[item.term] = item.tfidf);
  return terms;
};

const calculateCosineSimilarity = (tfidf, idx1, idx2) => {
  const terms1 = getTermVector(tfidf, idx1);
  const terms2 = getTermVector(tfidf, idx2);
  const allTerms = new Set([...Object.keys(terms1), ...Object.keys(terms2)]);

  let dotProduct = 0, mag1 = 0, mag2 = 0;

  allTerms.forEach(term => {
    const v1 = terms1[term] || 0;
    const v2 = terms2[term] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  });

  return (mag1 === 0 || mag2 === 0) ? 0 : dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
};

router.get('/:id/similar', (req, res) => {
  const targetIndex = escalations.findIndex(e => e.id === req.params.id);
  if (targetIndex === -1) {
    return res.status(404).json({ error: 'Escalation not found' });
  }

  const tfidf = new natural.TfIdf();
  escalations.forEach(e => tfidf.addDocument(buildDocument(e)));

  const similarities = escalations
    .map((e, idx) => ({
      escalation: e,
      score: idx === targetIndex ? 0 : calculateCosineSimilarity(tfidf, targetIndex, idx)
    }))
    .filter(s => s.score >= CONFIG.similarity.threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, CONFIG.similarity.maxResults)
    .map(s => ({ ...s, score: Number(s.score.toFixed(3)) }));

  res.json(similarities);
});

const matchesFilter = (escalation, filters) => {
  const { status, priority, category, search } = filters;
  
  if (status && status !== 'all' && escalation.status !== status) return false;
  if (priority && priority !== 'all' && escalation.priority !== priority) return false;
  
  if (category && category !== 'all') {
    const escCat = (escalation.category || '').toLowerCase();
    const filterCat = category.toLowerCase();
    if (!(escCat === filterCat || escCat.includes(filterCat) || filterCat.includes(escCat))) {
      return false;
    }
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    const searchableFields = [
      escalation.title, escalation.description, escalation.id,
      escalation.customer, ...(escalation.tags || [])
    ];
    if (!searchableFields.some(field => field && field.toLowerCase().includes(searchLower))) {
      return false;
    }
  }
  
  return true;
};

router.get('/', (req, res) => {
  const filtered = escalations.filter(e => matchesFilter(e, req.query));
  res.json(filtered);
});

router.get('/stats', (req, res) => {
  const stats = {
    total: escalations.length,
    critical: 0, high: 0, medium: 0, low: 0,
    avgConfidence: 0, atRisk: 0,
    bySeverity: {}, byPriority: {}, byCategory: {}, byTeam: {}
  };

  escalations.forEach(e => {
    const status = e.status;
    stats[status] = (stats[status] || 0) + 1;
    stats.bySeverity[status] = (stats.bySeverity[status] || 0) + 1;
    stats.byPriority[e.priority] = (stats.byPriority[e.priority] || 0) + 1;
    stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
    stats.byTeam[e.assignedTo] = (stats.byTeam[e.assignedTo] || 0) + 1;
    stats.avgConfidence += e.routingReasoning?.confidence || 0;
    if (e.context?.slaStatus === 'At risk') stats.atRisk++;
  });

  stats.avgConfidence = escalations.length > 0 ? stats.avgConfidence / escalations.length : 0;
  res.json(stats);
});




router.get('/:id', (req, res) => {
  const escalation = escalations.find(e => e.id === req.params.id);
  if (!escalation) {
    return res.status(404).json({ error: 'Escalation not found' });
  }
  res.json(escalation);
});

router.post('/predict', (req, res) => {
  const { text, workload, monitor } = req.body;
  
  if (!text) return res.status(400).json({ error: 'Text is required' });
  
  const pythonScript = path.join(__dirname, '../../data_preprocessing/ml_prediction_service.py');
  const args = ['--text', text, '--json'];
  if (workload) args.push('--workload', workload);
  if (monitor) args.push('--monitor', monitor);
  
  const pythonProcess = spawn('python3', [pythonScript, ...args]);
  let dataString = '', errorString = '';
  
  pythonProcess.stdout.on('data', (data) => dataString += data.toString());
  pythonProcess.stderr.on('data', (data) => errorString += data.toString());
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Prediction error:', errorString);
      return res.status(500).json({ error: 'Prediction failed', details: errorString });
    }
    
    try {
      const lines = dataString.trim().split('\n');
      res.json(JSON.parse(lines[lines.length - 1]));
    } catch (error) {
      console.error('Parse error:', error.message);
      res.status(500).json({ error: 'Failed to parse prediction', details: error.message });
    }
  });
});

module.exports = router;

