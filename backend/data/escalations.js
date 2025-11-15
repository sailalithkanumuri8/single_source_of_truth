/**
 * Load escalations from the enriched real data JSON file
 */
const fs = require('fs');
const path = require('path');

// Load the enriched incidents JSON
const escalationsPath = path.join(__dirname, 'escalations.json');
let escalations = [];

try {
  const rawData = fs.readFileSync(escalationsPath, 'utf8');
  escalations = JSON.parse(rawData);
  console.log(`✓ Loaded ${escalations.length} real escalations from JSON`);
} catch (error) {
  console.error('Error loading escalations.json:', error);
  escalations = [];
}

module.exports = escalations;

