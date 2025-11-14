#!/usr/bin/env python3
"""
Script to convert cleaned_incidents.csv to JSON format.
Maps CSV columns to the incident JSON schema.
"""

import csv
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Optional


def parse_urls(text: str) -> List[str]:
    """Extract URLs from text."""
    if not text:
        return []
    url_pattern = r'https?://[^\s|]+'
    urls = re.findall(url_pattern, text)
    return list(set(urls))  # Remove duplicates


def extract_tags(row: Dict[str, str]) -> List[str]:
    """Extract tags from various fields."""
    tags = []
    
    # Extract from Monitor_DisplayName
    if row.get('Monitor_DisplayName'):
        monitor = row['Monitor_DisplayName'].lower()
        if 's360' in monitor:
            tags.append('s360')
            tags.append('sla-monitoring')
        if 'mrs' in monitor:
            tags.append('migration')
            tags.append('mailbox-migration')
        if 'llmapi' in monitor:
            tags.append('llm-api')
        if 'sydney' in monitor:
            tags.append('sydney')
            tags.append('compliance-api')
    
    # Extract from WorkloadName
    if row.get('WorkloadName'):
        workload = row['WorkloadName'].lower()
        tags.append(workload)
    
    # Extract from Resource_Type
    if row.get('Resource_Type'):
        resource_type = row['Resource_Type'].lower()
        if resource_type and resource_type != 'hybrid':
            tags.append(resource_type)
    
    # Extract from Forest (abbreviated)
    if row.get('Forest'):
        forest = row['Forest'].lower()
        if len(forest) < 20:  # Only add if not too long
            tags.append(f'forest-{forest}')
    
    # Extract from Current_State
    if row.get('Current_State'):
        state = row['Current_State'].lower()
        if 'unhealthy' in state:
            tags.append('unhealthy')
        if 'violated' in state:
            tags.append('violated')
    
    # Extract keywords from message/title
    message = (row.get('Message') or row.get('Title') or '').lower()
    if 'authentication' in message or 'auth' in message:
        tags.append('authentication')
    if 'search' in message or 'find' in message:
        tags.append('search')
    if 'teams' in message:
        tags.append('teams')
    if 'owa' in message or 'outlook' in message:
        tags.append('outlook')
    
    return list(set(tags))[:10]  # Remove duplicates and limit to 10 tags


def infer_customer(row: Dict[str, str]) -> str:
    """Infer customer from available data."""
    account = row.get('Account', '').strip()
    message = (row.get('Message') or row.get('Problem') or '').lower()
    
    # If Account looks like a monitor name, try to extract from message
    if account and ('monitor' in account.lower() or 'view monitor' in account.lower()):
        # Try to find customer name in message
        if 'tenant' in message:
            # Look for tenant patterns
            tenant_match = re.search(r'tenant[:\s]+([^\s,]+)', message, re.IGNORECASE)
            if tenant_match:
                return tenant_match.group(1)
        
        # Look for customer mentions
        if 'customer' in message:
            customer_match = re.search(r'customer[:\s]+([^\s,\.]+)', message, re.IGNORECASE)
            if customer_match:
                return customer_match.group(1)
        
        return 'Multiple Customers'
    
    # If Account looks like a valid customer name (not too long, not all caps)
    if account and len(account) < 100 and not account.isupper():
        return account
    
    return 'Multiple Customers'


def infer_priority(row: Dict[str, str]) -> str:
    """Infer priority from available data."""
    message = (row.get('Message') or '').lower()
    title = (row.get('Title') or '').lower()
    problem = (row.get('Problem') or '').lower()
    
    combined = f"{message} {title} {problem}"
    
    if any(term in combined for term in ['critsit', 'sev1', 'sev2', 'critical', 'p1']):
        return 'P1'
    elif any(term in combined for term in ['sev3', 'high', 'p2']):
        return 'P2'
    elif any(term in combined for term in ['sev4', 'medium', 'p3']):
        return 'P3'
    else:
        return 'P3'  # Default


def infer_status(row: Dict[str, str]) -> str:
    """Infer status from Current_State."""
    state = (row.get('Current_State') or '').lower()
    if 'unhealthy' in state or 'violated' in state:
        return 'high'
    elif 'healthy' in state:
        return 'low'
    else:
        return 'medium'


def infer_category(row: Dict[str, str]) -> tuple[str, str]:
    """Infer category and subcategory from available data."""
    # Check all fields for monitor patterns
    monitor_fields = [
        row.get('Monitor_DisplayName', ''),
        row.get('Title', ''),
        row.get('Account', ''),
        row.get('Message', '')
    ]
    monitor_text = ' '.join(monitor_fields).lower()
    
    workload = (row.get('WorkloadName') or '').lower()
    resource = (row.get('Resource') or '').lower()
    message = (row.get('Message') or row.get('Title') or '').lower()
    
    # Category mapping
    if 's360' in monitor_text or ('sla' in monitor_text and 'monitor' in monitor_text):
        category = 'Compliance & Security'
        subcategory = 'SLA Monitoring'
    elif 'mrs' in monitor_text or 'migration' in monitor_text:
        category = 'Migration & Data'
        subcategory = 'Mailbox Migration'
    elif 'llmapi' in monitor_text or 'llm' in monitor_text:
        category = 'API & Services'
        subcategory = 'LLM API'
    elif 'sydney' in monitor_text:
        category = 'API & Services'
        subcategory = 'Compliance API'
    elif 'authentication' in message or 'auth' in message:
        category = 'Identity & Access'
        subcategory = 'Authentication'
    elif 'search' in message or 'find' in message:
        category = 'Search & Discovery'
        subcategory = 'Search Functionality'
    elif 'owa' in message or 'outlook' in message:
        category = 'Email & Collaboration'
        subcategory = 'Outlook Web Access'
    elif 'teams' in message:
        category = 'Email & Collaboration'
        subcategory = 'Microsoft Teams'
    elif workload == 'exchange':
        category = 'Email & Collaboration'
        subcategory = 'Exchange Online'
    else:
        category = 'Infrastructure & Monitoring'
        subcategory = 'General Monitoring'
    
    return category, subcategory


def parse_affected_services(row: Dict[str, str]) -> List[str]:
    """Parse affected services from various fields."""
    services = []
    
    workload = row.get('WorkloadName', '').strip()
    if workload:
        if workload == 'Exchange':
            services.append('Exchange Online')
        else:
            services.append(workload)
    
    message = (row.get('Message') or '').lower()
    if 'microsoft 365' in message or 'm365' in message:
        services.append('Microsoft 365')
    if 'azure active directory' in message or 'aad' in message:
        services.append('Azure Active Directory')
    if 'teams' in message:
        services.append('Microsoft Teams')
    if 'outlook' in message or 'owa' in message:
        services.append('Outlook Web Access')
    
    if not services:
        services.append('Exchange Online')  # Default based on data
    
    return list(set(services))


def format_incident_id(incident_id: str) -> str:
    """Format incident ID as ESC-YYYY-XXX."""
    if not incident_id:
        return f"ESC-{datetime.now().year}-000"
    
    # Extract year from current date or try to parse from ID
    year = datetime.now().year
    # Use last 6 digits or full ID
    id_part = incident_id[-6:] if len(incident_id) > 6 else incident_id.zfill(6)
    return f"ESC-{year}-{id_part}"


def parse_timestamp(timestamp_str: str) -> Optional[str]:
    """Parse timestamp string to ISO format."""
    if not timestamp_str or not timestamp_str.strip():
        return None
    
    timestamp_str = timestamp_str.strip()
    
    # Try different formats
    formats = [
        '%Y-%m-%d %H:%M:%SZ',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%dT%H:%M:%SZ',
        '%Y-%m-%dT%H:%M:%S',
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(timestamp_str, fmt)
            return dt.isoformat() + 'Z'
        except ValueError:
            continue
    
    return None


def create_routing_reasoning(row: Dict[str, str]) -> Dict[str, Any]:
    """Create routing reasoning based on available data."""
    monitor = row.get('Monitor_DisplayName', '')
    workload = row.get('WorkloadName', '')
    team = row.get('TeamName', '') or row.get('Icm_OwningTeamId', '')
    message = row.get('Message', '')
    
    factors = []
    primary_reason = "Pattern-based routing"
    
    if monitor:
        factors.append(f"Monitor: {monitor}")
        primary_reason = f"Monitor pattern: {monitor.split('(')[0].strip()}"
    
    if workload:
        factors.append(f"Workload: {workload}")
    
    if team:
        factors.append(f"Owning team: {team}")
        primary_reason = f"Team ownership: {team}"
    
    if not factors:
        factors.append("Default routing based on incident type")
    
    suggested_actions = []
    troubleshooting = row.get('Troubleshooting_Text', '')
    if troubleshooting:
        urls = parse_urls(troubleshooting)
        if urls:
            suggested_actions.append(f"Review troubleshooting documentation: {urls[0]}")
    
    if not suggested_actions:
        suggested_actions = [
            "Review monitor status and alerts",
            "Check service health dashboard",
            "Verify recent deployments or changes"
        ]
    
    return {
        "primaryReason": primary_reason,
        "confidence": 0.85,  # Default confidence
        "factors": factors[:5],  # Limit to 5 factors
        "suggestedActions": suggested_actions[:4]  # Limit to 4 actions
    }


def create_context(row: Dict[str, str]) -> Dict[str, Any]:
    """Create context information from available data."""
    account = row.get('Account', '')
    forest = row.get('Forest', '')
    resource = row.get('Resource', '')
    
    impact_level = "Unknown"
    if account and account != account.upper():  # If not all caps, might be customer name
        impact_level = "Single customer"
    elif forest:
        impact_level = f"Forest: {forest}"
    
    customer_tier = "Unknown"
    if 'enterprise' in (row.get('Message') or '').lower():
        customer_tier = "Enterprise"
    elif 'smb' in (row.get('Message') or '').lower():
        customer_tier = "SMB"
    
    return {
        "impactLevel": impact_level,
        "businessImpact": row.get('Problem', '') or row.get('Message', '')[:200] or "Service degradation detected",
        "customerTier": customer_tier,
        "slaStatus": "On track",
        "timeToSLA": "24 hours remaining",
        "relatedIncidents": [],
        "previousEscalations": 0,
        "estimatedResolutionTime": "4-6 hours"
    }


def create_timeline(row: Dict[str, str]) -> List[Dict[str, str]]:
    """Create initial timeline entry."""
    report_time = parse_timestamp(row.get('Report_Time', ''))
    if not report_time:
        report_time = datetime.now().isoformat() + 'Z'
    
    return [
        {
            "timestamp": report_time,
            "event": "Incident created",
            "user": "System"
        }
    ]


def convert_row_to_json(row: Dict[str, str]) -> Dict[str, Any]:
    """Convert a CSV row to JSON incident format."""
    incident_id = row.get('Incident_ID', '')
    report_time = row.get('Report_Time', '')
    
    # Parse timestamps
    created_at = parse_timestamp(report_time) or datetime.now().isoformat() + 'Z'
    updated_at = created_at  # Use same as created if no update time
    
    # Get category and subcategory
    category, subcategory = infer_category(row)
    
    # Build the JSON structure
    incident = {
        "id": format_incident_id(incident_id),
        "title": row.get('Title', '') or row.get('Monitor_DisplayName', '') or 'Untitled Incident',
        "description": row.get('Problem', '') or row.get('Message', '') or row.get('Title', '') or 'No description available',
        "status": infer_status(row),
        "priority": infer_priority(row),
        "category": category,
        "subcategory": subcategory,
        "createdAt": created_at,
        "updatedAt": updated_at,
        "assignedTo": row.get('TeamName', '') or row.get('Icm_OwningTeamId', '') or 'Unassigned',
        "customer": infer_customer(row),
        "affectedServices": parse_affected_services(row),
        "routingReasoning": create_routing_reasoning(row),
        "context": create_context(row),
        "timeline": create_timeline(row),
        "tags": extract_tags(row)
    }
    
    # Add additional metadata
    if row.get('Forest'):
        incident['context']['forest'] = row['Forest']
    
    if row.get('Resource'):
        incident['context']['resource'] = row['Resource']
    
    if row.get('Troubleshooting_Text'):
        urls = parse_urls(row['Troubleshooting_Text'])
        if urls:
            incident['context']['troubleshootingLinks'] = urls
    
    if row.get('Additional_Info'):
        incident['context']['additionalInfo'] = row['Additional_Info'][:500]  # Limit length
    
    return incident


def csv_to_json(csv_file: str, json_file: str):
    """Convert CSV file to JSON file."""
    incidents = []
    
    print(f"Reading CSV file: {csv_file}")
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for idx, row in enumerate(reader, start=1):
            # Skip rows with no incident ID
            if not row.get('Incident_ID', '').strip():
                continue
            
            try:
                incident = convert_row_to_json(row)
                incidents.append(incident)
                
                if idx % 100 == 0:
                    print(f"Processed {idx} rows...")
            except Exception as e:
                print(f"Error processing row {idx}: {e}")
                continue
    
    print(f"\nConverted {len(incidents)} incidents")
    print(f"Writing JSON file: {json_file}")
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(incidents, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully created {json_file} with {len(incidents)} incidents")


if __name__ == '__main__':
    import sys
    
    csv_file = 'cleaned_incidents.csv'
    json_file = 'incidents.json'
    
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
    if len(sys.argv) > 2:
        json_file = sys.argv[2]
    
    csv_to_json(csv_file, json_file)

