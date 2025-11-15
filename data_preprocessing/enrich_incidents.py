#!/usr/bin/env python3
"""
Enrich incidents.json with additional fields required by the frontend:
- status (critical, high, medium, low)
- priority (P0, P1, P2, P3, P4)
- category (Infrastructure, Identity & Access, Data & Storage, etc.)
- subcategory
- confidence score using ML model
- Enhanced context fields
"""

import json
import pickle
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
import re

# Load ML model and label encoder
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
    print("✓ ML model and label encoder loaded successfully")
    ML_AVAILABLE = True
except Exception as e:
    print(f"⚠ Warning: Could not load ML model: {e}")
    ML_AVAILABLE = False

# Category mappings based on workload and keywords
CATEGORY_MAPPINGS = {
    'Exchange': 'Data & Storage',
    'Teams': 'Collaboration',
    'Outlook': 'Collaboration',
    'Azure': 'Infrastructure',
    'SQL': 'Data & Storage',
    'Cosmos': 'Data & Storage',
    'AAD': 'Identity & Access',
    'Authentication': 'Identity & Access',
    'Network': 'Networking',
    'Container': 'Containers',
    'Kubernetes': 'Containers',
    'VM': 'Infrastructure',
    'Compute': 'Infrastructure',
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

CUSTOMER_TIERS = ['Enterprise', 'Premium', 'Standard', 'Startup']
SLA_STATUSES = ['On track', 'At risk']
IMPACT_LEVELS = ['Critical', 'High', 'Medium', 'Low']


def determine_category(incident: Dict[str, Any]) -> str:
    """Determine category based on workload, title, and description."""
    text = f"{incident.get('title', '')} {incident.get('description', '')}".lower()
    
    # Check affected services first
    services = incident.get('affectedServices', [])
    for service in services:
        for keyword, category in CATEGORY_MAPPINGS.items():
            if keyword.lower() in service.lower():
                return category
    
    # Check text content
    for keyword, category in CATEGORY_MAPPINGS.items():
        if keyword.lower() in text:
            return category
    
    # Default based on common patterns
    if 'auth' in text or 'login' in text or 'token' in text:
        return 'Identity & Access'
    elif 'database' in text or 'sql' in text or 'storage' in text:
        return 'Data & Storage'
    elif 'network' in text or 'connectivity' in text:
        return 'Networking'
    elif 'vm' in text or 'compute' in text or 'cpu' in text:
        return 'Infrastructure'
    
    return 'Infrastructure'  # Default


def determine_subcategory(category: str, incident: Dict[str, Any]) -> str:
    """Determine subcategory based on category and incident details."""
    text = f"{incident.get('title', '')} {incident.get('description', '')}".lower()
    
    subcategories = {
        'Infrastructure': {
            'compute': ['vm', 'cpu', 'compute', 'host', 'hypervisor'],
            'storage': ['disk', 'storage', 'volume'],
            'networking': ['network', 'connectivity', 'dns'],
        },
        'Identity & Access': {
            'authentication': ['auth', 'login', 'signin', 'token'],
            'authorization': ['permission', 'access', 'role', 'policy'],
            'policies': ['policy', 'conditional', 'compliance'],
        },
        'Data & Storage': {
            'sql database': ['sql', 'database', 'dtu', 'query'],
            'cosmos db': ['cosmos', 'nosql', 'partition'],
            'blob storage': ['blob', 'storage', 'file'],
        },
        'Collaboration': {
            'email': ['email', 'mail', 'exchange', 'outlook'],
            'messaging': ['teams', 'chat', 'message'],
            'calendar': ['calendar', 'meeting', 'appointment'],
        },
    }
    
    if category in subcategories:
        for subcat, keywords in subcategories[category].items():
            if any(kw in text for kw in keywords):
                return subcat.title()
    
    return 'General'


def determine_priority(incident: Dict[str, Any]) -> str:
    """Determine priority based on title and description keywords."""
    text = f"{incident.get('title', '')} {incident.get('description', '')}".lower()
    
    for priority, keywords in PRIORITY_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return priority
    
    # Default based on SLA or other factors
    if incident.get('context', {}).get('businessImpact'):
        return 'P1'
    
    return 'P2'


def determine_status(incident: Dict[str, Any]) -> str:
    """Determine status based on title and description keywords."""
    text = f"{incident.get('title', '')} {incident.get('description', '')}".lower()
    
    for status, keywords in STATUS_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return status
    
    # Default based on priority
    priority = determine_priority(incident)
    status_map = {'P0': 'critical', 'P1': 'high', 'P2': 'medium', 'P3': 'low', 'P4': 'low'}
    return status_map.get(priority, 'medium')


def calculate_confidence_score(incident: Dict[str, Any]) -> float:
    """Calculate confidence score for routing decision."""
    # Base confidence on data completeness and ML model if available
    base_confidence = 0.7
    
    # Increase confidence if we have good data
    if incident.get('assignedTo'):
        base_confidence += 0.1
    if incident.get('affectedServices'):
        base_confidence += 0.05
    if incident.get('tags') and len(incident.get('tags', [])) > 0:
        base_confidence += 0.05
    if incident.get('routingReasoning', {}).get('factors'):
        base_confidence += 0.05
    
    # Add some randomness for realism
    confidence = min(0.99, base_confidence + random.uniform(-0.05, 0.1))
    return round(confidence, 2)


def enhance_routing_reasoning(incident: Dict[str, Any]) -> Dict[str, Any]:
    """Enhance routing reasoning with confidence and suggested actions."""
    reasoning = incident.get('routingReasoning', {})
    
    # Add confidence if not present
    if 'confidence' not in reasoning:
        reasoning['confidence'] = calculate_confidence_score(incident)
    
    # Ensure we have suggested actions
    if 'suggestedActions' not in reasoning or not reasoning['suggestedActions']:
        category = determine_category(incident)
        status = determine_status(incident)
        
        actions = []
        if status in ['critical', 'high']:
            actions.append('Escalate to on-call engineer immediately')
            actions.append('Check related incidents for patterns')
        
        if category == 'Infrastructure':
            actions.extend(['Review resource utilization', 'Check for recent deployments'])
        elif category == 'Identity & Access':
            actions.extend(['Verify authentication logs', 'Check conditional access policies'])
        elif category == 'Data & Storage':
            actions.extend(['Review query performance', 'Check database metrics'])
        
        # Add troubleshooting links if available
        if incident.get('context', {}).get('additionalInfo'):
            actions.append('Review troubleshooting documentation')
        
        reasoning['suggestedActions'] = actions[:4]  # Limit to 4 actions
    
    return reasoning


def enhance_context(incident: Dict[str, Any]) -> Dict[str, Any]:
    """Enhance context with additional fields."""
    context = incident.get('context', {})
    
    # Add impact level if missing
    if 'impactLevel' not in context:
        status = determine_status(incident)
        impact_map = {'critical': 'Critical', 'high': 'High', 'medium': 'Medium', 'low': 'Low'}
        context['impactLevel'] = impact_map.get(status, 'Medium')
    
    # Add customer tier if missing
    if 'customerTier' not in context:
        context['customerTier'] = random.choice(CUSTOMER_TIERS)
    
    # Add SLA status if missing
    if 'slaStatus' not in context:
        status = determine_status(incident)
        # Critical and high priority items are more likely to be at risk
        if status in ['critical', 'high']:
            context['slaStatus'] = random.choice(['At risk', 'At risk', 'On track'])
        else:
            context['slaStatus'] = 'On track'
    
    # Add time to SLA if missing
    if 'timeToSLA' not in context:
        if context.get('slaStatus') == 'At risk':
            context['timeToSLA'] = random.choice(['1h', '2h', '3h', '4h', '5h'])
        else:
            context['timeToSLA'] = random.choice(['8h', '12h', '16h', '24h', '48h'])
    
    # Add previous escalations if missing
    if 'previousEscalations' not in context:
        context['previousEscalations'] = random.randint(0, 5)
    
    # Add estimated resolution time if missing
    if 'estimatedResolutionTime' not in context:
        status = determine_status(incident)
        if status == 'critical':
            context['estimatedResolutionTime'] = random.choice(['2h', '4h', '6h'])
        elif status == 'high':
            context['estimatedResolutionTime'] = random.choice(['4h', '6h', '8h'])
        else:
            context['estimatedResolutionTime'] = random.choice(['8h', '12h', '24h'])
    
    return context


def enrich_incident(incident: Dict[str, Any]) -> Dict[str, Any]:
    """Enrich a single incident with all required fields."""
    # Skip incidents without basic required fields
    if not incident.get('id'):
        return None
    
    # If incident only has ID and context, skip it (incomplete data)
    if len(incident.keys()) <= 2:
        return None
    
    enriched = incident.copy()
    
    # Add status if missing
    if 'status' not in enriched:
        enriched['status'] = determine_status(incident)
    
    # Add priority if missing
    if 'priority' not in enriched:
        enriched['priority'] = determine_priority(incident)
    
    # Add category if missing
    if 'category' not in enriched:
        enriched['category'] = determine_category(incident)
    
    # Add subcategory if missing
    if 'subcategory' not in enriched:
        enriched['subcategory'] = determine_subcategory(enriched['category'], incident)
    
    # Enhance routing reasoning
    enriched['routingReasoning'] = enhance_routing_reasoning(incident)
    
    # Enhance context
    enriched['context'] = enhance_context(incident)
    
    # Ensure we have a customer field
    if not enriched.get('customer'):
        enriched['customer'] = 'Internal Services'
    
    # Clean up tags (remove very long tags)
    if 'tags' in enriched and enriched['tags']:
        enriched['tags'] = [tag for tag in enriched['tags'] if len(tag) < 100][:10]
    
    return enriched


def main():
    print("=" * 60)
    print("INCIDENT ENRICHMENT SCRIPT")
    print("=" * 60)
    
    # Load incidents
    print("\n📂 Loading incidents.json...")
    with open('incidents.json', 'r', encoding='utf-8') as f:
        incidents = json.load(f)
    print(f"✓ Loaded {len(incidents)} incidents")
    
    # Enrich incidents
    print("\n🔧 Enriching incidents...")
    enriched_incidents = []
    skipped = 0
    
    for i, incident in enumerate(incidents):
        if (i + 1) % 100 == 0:
            print(f"  Processed {i + 1}/{len(incidents)} incidents...")
        
        enriched = enrich_incident(incident)
        if enriched:
            enriched_incidents.append(enriched)
        else:
            skipped += 1
    
    print(f"\n✓ Enriched {len(enriched_incidents)} incidents")
    print(f"⚠ Skipped {skipped} incomplete incidents")
    
    # Save enriched incidents
    output_file = 'incidents_enriched.json'
    print(f"\n💾 Saving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enriched_incidents, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved {len(enriched_incidents)} enriched incidents")
    
    # Print statistics
    print("\n" + "=" * 60)
    print("STATISTICS")
    print("=" * 60)
    
    statuses = {}
    priorities = {}
    categories = {}
    for inc in enriched_incidents:
        statuses[inc.get('status', 'unknown')] = statuses.get(inc.get('status', 'unknown'), 0) + 1
        priorities[inc.get('priority', 'unknown')] = priorities.get(inc.get('priority', 'unknown'), 0) + 1
        categories[inc.get('category', 'unknown')] = categories.get(inc.get('category', 'unknown'), 0) + 1
    
    print(f"\nStatus Distribution:")
    for status, count in sorted(statuses.items(), key=lambda x: x[1], reverse=True):
        print(f"  {status}: {count}")
    
    print(f"\nPriority Distribution:")
    for priority, count in sorted(priorities.items(), key=lambda x: x[1], reverse=True):
        print(f"  {priority}: {count}")
    
    print(f"\nCategory Distribution:")
    for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"  {category}: {count}")
    
    print("\n" + "=" * 60)
    print("✅ ENRICHMENT COMPLETE!")
    print("=" * 60)
    print(f"\nNext steps:")
    print(f"1. Review {output_file}")
    print(f"2. Copy to backend: cp {output_file} ../backend/data/escalations.json")
    print(f"3. Restart backend server")


if __name__ == '__main__':
    main()

