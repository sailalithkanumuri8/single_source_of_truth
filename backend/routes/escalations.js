const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const natural = require('natural');

const DEFAULT_PIPELINE_PATH = path.join(
  __dirname,
  '../../data_preprocessing/incidents_enriched.json'
);
const LEGACY_DATA_PATH = path.join(__dirname, '../data/escalations.json');

const resolveDataPaths = () => {
  const paths = [];
  if (process.env.ESCALATIONS_DATA_PATH) {
    paths.push(path.resolve(process.env.ESCALATIONS_DATA_PATH));
  }
  paths.push(DEFAULT_PIPELINE_PATH, LEGACY_DATA_PATH);
  return paths;
};

const loadEscalations = () => {
  const candidates = resolveDataPaths();

  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate)) continue;
      const data = JSON.parse(fs.readFileSync(candidate, 'utf8'));
      console.log(
        `✓ Loaded ${data.length} escalations from ${path.relative(
          process.cwd(),
          candidate
        )}`
      );
      return data;
    } catch (error) {
      console.warn(
        `⚠️  Failed to load escalations from ${candidate}: ${error.message}`
      );
    }
  }

  throw new Error(
    'No escalation dataset found. Run the data_preprocessing pipeline first.'
  );
};

const escalations = loadEscalations();

const SIMILARITY_THRESHOLD = 0.15;
const MAX_SIMILAR_RESULTS = 2;

const buildDocument = (e) => 
  `${e.title || ''} ${e.description || ''} ${e.category || ''} ${e.subcategory || ''} ${(e.tags || []).join(' ')}`;

const calculateCosineSimilarity = (tfidf, idx1, idx2) => {
  const getTerms = (idx) => {
    const terms = {};
    tfidf.listTerms(idx).forEach(item => terms[item.term] = item.tfidf);
    return terms;
  };

  const terms1 = getTerms(idx1);
  const terms2 = getTerms(idx2);
  const allTerms = new Set([...Object.keys(terms1), ...Object.keys(terms2)]);

  let dotProduct = 0, magnitude1 = 0, magnitude2 = 0;

  allTerms.forEach(term => {
    const val1 = terms1[term] || 0;
    const val2 = terms2[term] || 0;
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  return (magnitude1 === 0 || magnitude2 === 0) ? 0 : dotProduct / (magnitude1 * magnitude2);
};

router.get('/:id/similar', (req, res) => {
  const target = escalations.find(e => e.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'Escalation not found' });
  }

  const tfidf = new natural.TfIdf();
  escalations.forEach(e => tfidf.addDocument(buildDocument(e)));
  const targetIndex = escalations.findIndex(e => e.id === req.params.id);

  const similarities = escalations
    .map((e, idx) => ({
      escalation: e,
      score: idx === targetIndex ? 0 : calculateCosineSimilarity(tfidf, targetIndex, idx)
    }))
    .filter(s => s.score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SIMILAR_RESULTS)
    .map(s => ({ ...s, score: Number(s.score.toFixed(3)) }));

  res.json(similarities);
});

const matchesCategory = (escalation, filter) => {
  const escCat = (escalation.category || '').toLowerCase();
  const filterCat = filter.toLowerCase();
  return escCat === filterCat || escCat.includes(filterCat) || filterCat.includes(escCat);
};

const matchesSearch = (escalation, search) => {
  const searchLower = search.toLowerCase();
  const searchableFields = [
    escalation.title,
    escalation.description,
    escalation.id,
    escalation.customer,
    ...(escalation.tags || [])
  ];
  return searchableFields.some(field => 
    field && field.toLowerCase().includes(searchLower)
  );
};

router.get('/', (req, res) => {
  const { status, priority, category, search } = req.query;
  
  let filtered = escalations.filter(e => {
    if (status && status !== 'all' && e.status !== status) return false;
    if (priority && priority !== 'all' && e.priority !== priority) return false;
    if (category && category !== 'all' && !matchesCategory(e, category)) return false;
    if (search && !matchesSearch(e, search)) return false;
    return true;
  });

  res.json(filtered);
});

router.get('/stats', (req, res) => {
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
    const status = e.status;
    if (status === 'critical') stats.critical++;
    else if (status === 'high') stats.high++;
    else if (status === 'medium') stats.medium++;
    else if (status === 'low') stats.low++;

    stats.bySeverity[status] = (stats.bySeverity[status] || 0) + 1;
    stats.byPriority[e.priority] = (stats.byPriority[e.priority] || 0) + 1;
    stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
    stats.byTeam[e.assignedTo] = (stats.byTeam[e.assignedTo] || 0) + 1;
    stats.avgConfidence += e.routingReasoning?.confidence || 0;
    if (e.context?.slaStatus === 'At risk') stats.atRisk++;
  });

  if (escalations.length > 0) {
    stats.avgConfidence /= escalations.length;
  }

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
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  const pythonScript = path.join(__dirname, '../../data_preprocessing/ml_prediction_service.py');
  const args = ['--text', text, '--json'];
  if (workload) args.push('--workload', workload);
  if (monitor) args.push('--monitor', monitor);
  
  const pythonProcess = spawn('python3', [pythonScript, ...args]);
  let dataString = '';
  let errorString = '';
  
  pythonProcess.stdout.on('data', (data) => dataString += data.toString());
  pythonProcess.stderr.on('data', (data) => errorString += data.toString());
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Prediction error:', errorString);
      return res.status(500).json({ error: 'Prediction failed', details: errorString });
    }
    
    try {
      const lines = dataString.trim().split('\n');
      const result = JSON.parse(lines[lines.length - 1]);
      res.json(result);
    } catch (error) {
      console.error('Parse error:', error.message);
      res.status(500).json({ error: 'Failed to parse prediction', details: error.message });
    }
  });
});

module.exports = router;

