#!/usr/bin/env python3
"""Enrich incidents with status, priority, category, and context fields."""

import json
import random
import pickle
import numpy as np
from typing import Dict, Any

try:
    with open('model.pkl', 'rb') as f:
        MODEL = pickle.load(f)
    with open('label_encoder.pkl', 'rb') as f:
        LABEL_ENCODER = pickle.load(f)
    print("✓ ML model loaded")
    ML_AVAILABLE = True
except Exception as e:
    print(f"⚠ ML model not available: {e}")
    MODEL = None
    LABEL_ENCODER = None
    ML_AVAILABLE = False

CATEGORY_MAPPINGS = {
    'Exchange': 'Data & Storage', 'Teams': 'Collaboration', 'Outlook': 'Collaboration',
    'Azure': 'Infrastructure', 'SQL': 'Data & Storage', 'Cosmos': 'Data & Storage',
    'AAD': 'Identity & Access', 'Authentication': 'Identity & Access',
    'Network': 'Networking', 'Container': 'Containers', 'Kubernetes': 'Containers',
    'VM': 'Infrastructure', 'Compute': 'Infrastructure',
}

PRIORITY_KEYWORDS = {
    'P0': ['critical', 'outage', 'down', 'failure', 'severe', 'emergency'],
    'P1': ['high', 'urgent', 'spike', 'degraded', 'impacted', 'violation'],
    'P2': ['medium', 'warning', 'elevated', 'approaching', 'near'],
    'P3': ['low', 'info', 'notice', 'advisory'],
}

STATUS_KEYWORDS = {
    'critical': ['critical', 'outage', 'down', 'failure', 'severe'],
    'high': ['high', 'urgent', 'spike', 'degraded', 'violation'],
    'medium': ['medium', 'warning', 'elevated', 'approaching'],
    'low': ['low', 'info', 'notice'],
}

SUBCATEGORIES = {
    'Infrastructure': {'compute': ['vm', 'cpu', 'compute', 'host'], 'storage': ['disk', 'storage'], 'networking': ['network', 'dns']},
    'Identity & Access': {'authentication': ['auth', 'login', 'token'], 'authorization': ['permission', 'access', 'role'], 'policies': ['policy', 'conditional']},
    'Data & Storage': {'sql database': ['sql', 'database', 'dtu'], 'cosmos db': ['cosmos', 'nosql'], 'blob storage': ['blob', 'file']},
    'Collaboration': {'email': ['email', 'mail', 'exchange'], 'messaging': ['teams', 'chat'], 'calendar': ['calendar', 'meeting']},
}


def determine_category(incident: Dict[str, Any]) -> str:
    text = f"{incident.get('title', '')} {incident.get('description', '')}".lower()
    
    for service in incident.get('affectedServices', []):
        for keyword, category in CATEGORY_MAPPINGS.items():
            if keyword.lower() in service.lower():
                return category
    
    for keyword, category in CATEGORY_MAPPINGS.items():
        if keyword.lower() in text:
            return category
    
    if any(k in text for k in ['auth', 'login', 'token']):
        return 'Identity & Access'
    if any(k in text for k in ['database', 'sql', 'storage']):
        return 'Data & Storage'
    if any(k in text for k in ['network', 'connectivity']):
        return 'Networking'
    if any(k in text for k in ['vm', 'compute', 'cpu']):
        return 'Infrastructure'
    
    return 'Infrastructure'


def determine_subcategory(category: str, incident: Dict[str, Any]) -> str:
    text = f"{incident.get('title', '')} {incident.get('description', '')}".lower()
    
    if category in SUBCATEGORIES:
        for subcat, keywords in SUBCATEGORIES[category].items():
            if any(kw in text for kw in keywords):
                return subcat.title()
    
    return 'General'


def determine_priority(incident: Dict[str, Any]) -> str:
    text = f"{incident.get('title', '')} {incident.get('description', '')}".lower()
    
    for priority, keywords in PRIORITY_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return priority
    
    return 'P2' if incident.get('context', {}).get('businessImpact') else 'P2'


def determine_status(incident: Dict[str, Any]) -> str:
    text = f"{incident.get('title', '')} {incident.get('description', '')}".lower()
    
    for status, keywords in STATUS_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return status
    
    priority = determine_priority(incident)
    return {'P0': 'critical', 'P1': 'high', 'P2': 'medium', 'P3': 'low', 'P4': 'low'}.get(priority, 'medium')


def calculate_confidence(incident: Dict[str, Any]) -> float:
    """Calculate confidence using ML model's predict_proba or fallback to heuristic."""
    if ML_AVAILABLE and MODEL and incident.get('title') and incident.get('description'):
        try:
            text = f"{incident.get('title', '')} {incident.get('description', '')}"
            probas = MODEL.predict_proba([text])[0]
            max_confidence = float(np.max(probas))
            return round(max_confidence, 2)
        except Exception as e:
            print(f"Model prediction failed: {e}")
    
    # Fallback heuristic
    base = 0.7
    if incident.get('assignedTo'): base += 0.1
    if incident.get('affectedServices'): base += 0.05
    if incident.get('tags') and len(incident.get('tags', [])): base += 0.05
    if incident.get('routingReasoning', {}).get('factors'): base += 0.05
    return round(min(0.99, base + random.uniform(-0.05, 0.1)), 2)


def enhance_routing_reasoning(incident: Dict[str, Any]) -> Dict[str, Any]:
    reasoning = incident.get('routingReasoning', {})
    
    if 'confidence' not in reasoning:
        reasoning['confidence'] = calculate_confidence(incident)
    
    if 'suggestedActions' not in reasoning or not reasoning['suggestedActions']:
        category = determine_category(incident)
        status = determine_status(incident)
        
        actions = []
        if status in ['critical', 'high']:
            actions.extend(['Escalate to on-call engineer immediately', 'Check related incidents for patterns'])
        
        if category == 'Infrastructure':
            actions.extend(['Review resource utilization', 'Check for recent deployments'])
        elif category == 'Identity & Access':
            actions.extend(['Verify authentication logs', 'Check conditional access policies'])
        elif category == 'Data & Storage':
            actions.extend(['Review query performance', 'Check database metrics'])
        
        if incident.get('context', {}).get('additionalInfo'):
            actions.append('Review troubleshooting documentation')
        
        reasoning['suggestedActions'] = actions[:4]
    
    return reasoning


def enhance_context(incident: Dict[str, Any]) -> Dict[str, Any]:
    context = incident.get('context', {})
    status = determine_status(incident)
    
    if 'impactLevel' not in context:
        context['impactLevel'] = {'critical': 'Critical', 'high': 'High', 'medium': 'Medium', 'low': 'Low'}.get(status, 'Medium')
    
    if 'customerTier' not in context:
        context['customerTier'] = random.choice(['Enterprise', 'Premium', 'Standard', 'Startup'])
    
    if 'slaStatus' not in context:
        context['slaStatus'] = random.choice(['At risk', 'At risk', 'On track']) if status in ['critical', 'high'] else 'On track'
    
    if 'timeToSLA' not in context:
        context['timeToSLA'] = random.choice(['1h', '2h', '3h', '4h', '5h']) if context.get('slaStatus') == 'At risk' else random.choice(['8h', '12h', '16h', '24h', '48h'])
    
    if 'previousEscalations' not in context:
        context['previousEscalations'] = random.randint(0, 5)
    
    if 'estimatedResolutionTime' not in context:
        times = {'critical': ['2h', '4h', '6h'], 'high': ['4h', '6h', '8h']}.get(status, ['8h', '12h', '24h'])
        context['estimatedResolutionTime'] = random.choice(times)
    
    return context


def predict_team_with_ml(incident: Dict[str, Any]) -> tuple:
    """Use ML model to predict team and confidence."""
    if ML_AVAILABLE and MODEL and LABEL_ENCODER and incident.get('title') and incident.get('description'):
        try:
            text = f"{incident.get('title', '')} {incident.get('description', '')}"
            probas = MODEL.predict_proba([text])[0]
            predicted_idx = np.argmax(probas)
            predicted_team = LABEL_ENCODER.classes_[predicted_idx]
            confidence = float(probas[predicted_idx])
            return predicted_team, round(confidence, 2)
        except Exception as e:
            print(f"ML prediction failed for {incident.get('id')}: {e}")
    return None, None


def enrich_incident(incident: Dict[str, Any]) -> Dict[str, Any]:
    if not incident.get('id') or len(incident.keys()) <= 2:
        return None
    
    enriched = incident.copy()
    
    # Use ML model to predict team if not assigned
    if not enriched.get('assignedTo') or enriched.get('assignedTo') == 'undefined':
        predicted_team, ml_confidence = predict_team_with_ml(incident)
        if predicted_team:
            enriched['assignedTo'] = predicted_team
            if 'routingReasoning' not in enriched:
                enriched['routingReasoning'] = {}
            enriched['routingReasoning']['confidence'] = ml_confidence
            enriched['routingReasoning']['method'] = 'ml_model'
    
    if 'status' not in enriched:
        enriched['status'] = determine_status(incident)
    if 'priority' not in enriched:
        enriched['priority'] = determine_priority(incident)
    if 'category' not in enriched:
        enriched['category'] = determine_category(incident)
    if 'subcategory' not in enriched:
        enriched['subcategory'] = determine_subcategory(enriched['category'], incident)
    
    enriched['routingReasoning'] = enhance_routing_reasoning(enriched)
    enriched['context'] = enhance_context(enriched)
    
    if not enriched.get('customer'):
        enriched['customer'] = 'Internal Services'
    
    if 'tags' in enriched and enriched['tags']:
        enriched['tags'] = [tag for tag in enriched['tags'] if len(tag) < 100][:10]
    
    return enriched


def main():
    print("=" * 60)
    print("INCIDENT ENRICHMENT")
    print("=" * 60)
    
    with open('incidents.json', 'r', encoding='utf-8') as f:
        incidents = json.load(f)
    print(f"\n✓ Loaded {len(incidents)} incidents")
    
    enriched_incidents = []
    for i, incident in enumerate(incidents):
        if (i + 1) % 100 == 0:
            print(f"  Processed {i + 1}/{len(incidents)}...")
        enriched = enrich_incident(incident)
        if enriched:
            enriched_incidents.append(enriched)
    
    print(f"\n✓ Enriched {len(enriched_incidents)} incidents")
    print(f"⚠ Skipped {len(incidents) - len(enriched_incidents)} incomplete")
    
    with open('incidents_enriched.json', 'w', encoding='utf-8') as f:
        json.dump(enriched_incidents, f, indent=2, ensure_ascii=False)
    
    statuses = {}
    priorities = {}
    categories = {}
    for inc in enriched_incidents:
        statuses[inc.get('status', 'unknown')] = statuses.get(inc.get('status', 'unknown'), 0) + 1
        priorities[inc.get('priority', 'unknown')] = priorities.get(inc.get('priority', 'unknown'), 0) + 1
        categories[inc.get('category', 'unknown')] = categories.get(inc.get('category', 'unknown'), 0) + 1
    
    print(f"\n{'=' * 60}")
    print("STATISTICS")
    print(f"{'=' * 60}")
    print(f"\nStatus: {dict(sorted(statuses.items(), key=lambda x: x[1], reverse=True))}")
    print(f"Priority: {dict(sorted(priorities.items(), key=lambda x: x[1], reverse=True))}")
    print(f"Category: {dict(sorted(categories.items(), key=lambda x: x[1], reverse=True))}")
    print(f"\n{'=' * 60}")
    print("✅ COMPLETE!")
    print(f"{'=' * 60}\n")


if __name__ == '__main__':
    main()
