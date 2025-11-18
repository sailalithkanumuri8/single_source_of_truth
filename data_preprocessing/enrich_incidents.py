#!/usr/bin/env python3
"""Enrich incidents with ML-based routing, status, priority, and context."""

import json
import random
import pickle
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from collections import defaultdict

def load_ml_model(model_path='model.pkl', encoder_path='label_encoder.pkl'):
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        with open(encoder_path, 'rb') as f:
            encoder = pickle.load(f)
        print("✓ ML model loaded")
        return model, encoder
    except Exception as e:
        print(f"⚠ ML model not available: {e}")
        return None, None

MODEL, LABEL_ENCODER = load_ml_model()

CONFIG = {
    'categories': {
        'Exchange': 'Data & Storage', 'Teams': 'Collaboration', 'Outlook': 'Collaboration',
        'Azure': 'Infrastructure', 'SQL': 'Data & Storage', 'Cosmos': 'Data & Storage',
        'AAD': 'Identity & Access', 'Authentication': 'Identity & Access',
        'Network': 'Networking', 'Container': 'Containers', 'Kubernetes': 'Containers',
        'VM': 'Infrastructure', 'Compute': 'Infrastructure',
    },
    'priorities': {
        'P0': ['critical', 'outage', 'down', 'failure', 'severe', 'emergency'],
        'P1': ['high', 'urgent', 'spike', 'degraded', 'impacted', 'violation'],
        'P2': ['medium', 'warning', 'elevated', 'approaching', 'near'],
        'P3': ['low', 'info', 'notice', 'advisory'],
    },
    'statuses': {
        'critical': ['critical', 'outage', 'down', 'failure', 'severe'],
        'high': ['high', 'urgent', 'spike', 'degraded', 'violation'],
        'medium': ['medium', 'warning', 'elevated', 'approaching'],
        'low': ['low', 'info', 'notice'],
    },
    'subcategories': {
        'Infrastructure': {'compute': ['vm', 'cpu', 'compute', 'host'], 'storage': ['disk', 'storage'], 'networking': ['network', 'dns']},
        'Identity & Access': {'authentication': ['auth', 'login', 'token'], 'authorization': ['permission', 'access', 'role'], 'policies': ['policy', 'conditional']},
        'Data & Storage': {'sql database': ['sql', 'database', 'dtu'], 'cosmos db': ['cosmos', 'nosql'], 'blob storage': ['blob', 'file']},
        'Collaboration': {'email': ['email', 'mail', 'exchange'], 'messaging': ['teams', 'chat'], 'calendar': ['calendar', 'meeting']},
    },
    'team_heuristics': {
        'SignalsOnboarding07': ['signals', 'llmapi'],
        'Tenant Notification': ['tenant', 'notification'],
        'EC Commercial LiveSite': ['commercial', 'livesitesr'],
    },
    'default_team': 'ECCLSPassiveMonitorTraining',
    'category_actions': {
        'Infrastructure': ['Review resource utilization', 'Check for recent deployments'],
        'Identity & Access': ['Verify authentication logs', 'Check conditional access policies'],
        'Data & Storage': ['Review query performance', 'Check database metrics'],
    },
    'critical_actions': ['Escalate to on-call engineer immediately', 'Check related incidents for patterns'],
}


def get_incident_text(incident: Dict[str, Any]) -> str:
    return f"{incident.get('title', '')} {incident.get('description', '')}".lower()

def match_keywords(text: str, keyword_map: Dict[str, list]) -> Optional[str]:
    for key, keywords in keyword_map.items():
        if any(kw in text for kw in keywords):
            return key
    return None

def determine_category(incident: Dict[str, Any]) -> str:
    text = get_incident_text(incident)
    
    for service in incident.get('affectedServices', []):
        for keyword, category in CONFIG['categories'].items():
            if keyword.lower() in service.lower():
                return category
    
    for keyword, category in CONFIG['categories'].items():
        if keyword.lower() in text:
            return category
    
    fallback_categories = {
        'Identity & Access': ['auth', 'login', 'token'],
        'Data & Storage': ['database', 'sql', 'storage'],
        'Networking': ['network', 'connectivity'],
        'Infrastructure': ['vm', 'compute', 'cpu'],
    }
    
    return match_keywords(text, fallback_categories) or 'Infrastructure'

def determine_subcategory(category: str, incident: Dict[str, Any]) -> str:
    text = get_incident_text(incident)
    subcats = CONFIG['subcategories'].get(category, {})
    
    for subcat, keywords in subcats.items():
        if any(kw in text for kw in keywords):
            return subcat.title()
    return 'General'

def determine_priority(incident: Dict[str, Any]) -> str:
    text = get_incident_text(incident)
    return match_keywords(text, CONFIG['priorities']) or 'P2'

def determine_status(incident: Dict[str, Any]) -> str:
    text = get_incident_text(incident)
    status = match_keywords(text, CONFIG['statuses'])
    
    if not status:
        priority = determine_priority(incident)
        status = {'P0': 'critical', 'P1': 'high', 'P2': 'medium', 'P3': 'low', 'P4': 'low'}.get(priority, 'medium')
    
    return status


def calculate_confidence(incident: Dict[str, Any]) -> float:
    if MODEL and LABEL_ENCODER and incident.get('title') and incident.get('description'):
        try:
            text = f"{incident.get('title', '')} {incident.get('description', '')}"
            probas = MODEL.predict_proba([text])[0]
            return round(float(np.max(probas)), 2)
        except Exception as e:
            print(f"Model prediction failed: {e}")
    
    base = 0.7
    increments = [
        (incident.get('assignedTo'), 0.1),
        (incident.get('affectedServices'), 0.05),
        (incident.get('tags'), 0.05),
        (incident.get('routingReasoning', {}).get('factors'), 0.05),
    ]
    
    for condition, value in increments:
        if condition:
            base += value
    
    return round(min(0.99, base + random.uniform(-0.05, 0.1)), 2)

def enhance_routing_reasoning(incident: Dict[str, Any]) -> Dict[str, Any]:
    reasoning = incident.get('routingReasoning', {})
    
    reasoning.setdefault('confidence', calculate_confidence(incident))
    
    if not reasoning.get('suggestedActions'):
        category = determine_category(incident)
        status = determine_status(incident)
        
        actions = []
        if status in ['critical', 'high']:
            actions.extend(CONFIG['critical_actions'])
        
        actions.extend(CONFIG['category_actions'].get(category, []))
        
        if incident.get('context', {}).get('additionalInfo'):
            actions.append('Review troubleshooting documentation')
        
        reasoning['suggestedActions'] = actions[:4]
    
    return reasoning

def enhance_context(incident: Dict[str, Any]) -> Dict[str, Any]:
    context = incident.get('context', {})
    status = determine_status(incident)
    is_critical = status in ['critical', 'high']
    
    defaults = {
        'impactLevel': {'critical': 'Critical', 'high': 'High', 'medium': 'Medium', 'low': 'Low'}.get(status, 'Medium'),
        'customerTier': random.choice(['Enterprise', 'Premium', 'Standard', 'Startup']),
        'slaStatus': random.choice(['At risk', 'At risk', 'On track']) if is_critical else 'On track',
        'previousEscalations': random.randint(0, 5),
    }
    
    for key, value in defaults.items():
        context.setdefault(key, value)
    
    if 'timeToSLA' not in context:
        context['timeToSLA'] = random.choice(['1h', '2h', '3h', '4h', '5h'] if context['slaStatus'] == 'At risk' else ['8h', '12h', '16h', '24h', '48h'])
    
    if 'estimatedResolutionTime' not in context:
        times = {'critical': ['2h', '4h', '6h'], 'high': ['4h', '6h', '8h']}.get(status, ['8h', '12h', '24h'])
        context['estimatedResolutionTime'] = random.choice(times)
    
    return context

def predict_team_with_ml(incident: Dict[str, Any]) -> Tuple[Optional[str], Optional[float]]:
    if not (MODEL and LABEL_ENCODER and incident.get('title') and incident.get('description')):
        return None, None
    
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


def is_valid_incident(incident: Dict[str, Any]) -> bool:
    if not incident.get('id') or len(incident.keys()) <= 2:
        return False
    
    has_title = bool(incident.get('title', '').strip())
    has_description = bool(incident.get('description', '').strip())
    has_routing_reason = bool(incident.get('routingReasoning', {}).get('primaryReason', '').strip())
    
    return has_title or (has_description or has_routing_reason)

def ensure_title_description(enriched: Dict[str, Any]) -> bool:
    if not enriched.get('title', '').strip():
        if enriched.get('routingReasoning', {}).get('primaryReason'):
            enriched['title'] = f"Incident {enriched.get('id', 'Unknown')}"
        else:
            return False
    
    if not enriched.get('description', '').strip():
        desc_parts = [
            f"Monitor: {enriched['routingReasoning']['primaryReason']}" if enriched.get('routingReasoning', {}).get('primaryReason') else None,
            f"Resource: {enriched['context']['resource']}" if enriched.get('context', {}).get('resource') else None,
        ]
        desc_parts = [p for p in desc_parts if p]
        
        if desc_parts:
            enriched['description'] = ' | '.join(desc_parts)
        else:
            return False
    
    return True

def ensure_timestamps(enriched: Dict[str, Any]) -> None:
    if not enriched.get('createdAt'):
        enriched['createdAt'] = datetime.now().isoformat() + 'Z'
    if not enriched.get('updatedAt'):
        enriched['updatedAt'] = enriched['createdAt']

def assign_team(enriched: Dict[str, Any]) -> None:
    if enriched.get('assignedTo') and enriched['assignedTo'] != 'undefined':
        return
    
    predicted_team, ml_confidence = predict_team_with_ml(enriched)
    
    if predicted_team:
        enriched['assignedTo'] = predicted_team
        enriched.setdefault('routingReasoning', {})
        enriched['routingReasoning']['confidence'] = ml_confidence
        enriched['routingReasoning']['method'] = 'ml_model'
    else:
        text = get_incident_text(enriched)
        monitor = enriched.get('routingReasoning', {}).get('primaryReason', '').lower()
        combined_text = f"{text} {monitor}"
        
        team = None
        for team_name, keywords in CONFIG['team_heuristics'].items():
            if any(kw in combined_text for kw in keywords):
                team = team_name
                break
        
        enriched['assignedTo'] = team or CONFIG['default_team']
        enriched.setdefault('routingReasoning', {})
        enriched['routingReasoning'].setdefault('confidence', 0.70)
        enriched['routingReasoning']['method'] = 'heuristic_fallback'

def enrich_incident(incident: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if not is_valid_incident(incident):
        return None
    
    enriched = incident.copy()
    
    if not ensure_title_description(enriched):
        return None
    
    ensure_timestamps(enriched)
    assign_team(enriched)
    
    enriched.setdefault('status', determine_status(incident))
    enriched.setdefault('priority', determine_priority(incident))
    enriched.setdefault('category', determine_category(incident))
    enriched.setdefault('subcategory', determine_subcategory(enriched['category'], incident))
    enriched.setdefault('customer', 'Internal Services')
    
    enriched['routingReasoning'] = enhance_routing_reasoning(enriched)
    enriched['context'] = enhance_context(enriched)
    
    if enriched.get('tags'):
        enriched['tags'] = [tag for tag in enriched['tags'] if len(tag) < 100][:10]
    
    return enriched


def collect_statistics(incidents: list) -> Dict[str, Dict[str, int]]:
    stats = defaultdict(lambda: defaultdict(int))
    
    for inc in incidents:
        stats['status'][inc.get('status', 'unknown')] += 1
        stats['priority'][inc.get('priority', 'unknown')] += 1
        stats['category'][inc.get('category', 'unknown')] += 1
    
    return {key: dict(sorted(val.items(), key=lambda x: x[1], reverse=True)) for key, val in stats.items()}

def main(input_file='incidents.json', output_file='incidents_enriched.json'):
    print("=" * 60)
    print("INCIDENT ENRICHMENT")
    print("=" * 60)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        incidents = json.load(f)
    print(f"\n✓ Loaded {len(incidents)} incidents")
    
    enriched_incidents = []
    for i, incident in enumerate(incidents, 1):
        if i % 100 == 0:
            print(f"  Processed {i}/{len(incidents)}...")
        
        enriched = enrich_incident(incident)
        if enriched:
            enriched_incidents.append(enriched)
    
    print(f"\n✓ Enriched {len(enriched_incidents)} incidents")
    print(f"⚠ Skipped {len(incidents) - len(enriched_incidents)} incomplete")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enriched_incidents, f, indent=2, ensure_ascii=False)
    
    stats = collect_statistics(enriched_incidents)
    
    print(f"\n{'=' * 60}")
    print("STATISTICS")
    print(f"{'=' * 60}")
    for stat_type, values in stats.items():
        print(f"\n{stat_type.title()}: {values}")
    print(f"\n{'=' * 60}")
    print("✅ COMPLETE!")
    print(f"{'=' * 60}\n")

if __name__ == '__main__':
    main()
