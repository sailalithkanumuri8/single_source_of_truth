#!/usr/bin/env python3
"""
Script to convert cleaned_incidents.csv to JSON format.
Maps CSV columns directly to the incident JSON schema without defaults.
"""

import csv
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Optional


def parse_urls(text: str) -> List[str]:
    """Extract URLs from text."""
    if not text or not text.strip():
        return []
    url_pattern = r'https?://[^\s|]+'
    urls = re.findall(url_pattern, text)
    return list(set(urls))  # Remove duplicates


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


def format_incident_id(incident_id: str) -> Optional[str]:
    """Format incident ID as ESC-YYYY-XXX."""
    if not incident_id or not incident_id.strip():
        return None
    
    # Extract year from current date or try to parse from ID
    year = datetime.now().year
    # Use last 6 digits or full ID
    id_part = incident_id[-6:] if len(incident_id) > 6 else incident_id.zfill(6)
    return f"ESC-{year}-{id_part}"


def convert_row_to_json(row: Dict[str, str]) -> Dict[str, Any]:
    """Convert a CSV row to JSON incident format using only actual CSV data."""
    incident_id = row.get('Incident_ID', '').strip()
    if not incident_id:
        return None
    
    report_time = row.get('Report_Time', '').strip()
    created_at = parse_timestamp(report_time)
    
    # Build the JSON structure - only include fields that have values
    incident = {}
    
    # id - required field
    formatted_id = format_incident_id(incident_id)
    if formatted_id:
        incident["id"] = formatted_id
    
    # title
    title = row.get('Title', '').strip()
    if title:
        incident["title"] = title
    
    # description
    description = row.get('Problem', '').strip() or row.get('Message', '').strip()
    if description:
        incident["description"] = description
    
    # status - only if Current_State exists
    current_state = row.get('Current_State', '').strip()
    if current_state:
        incident["status"] = current_state
    
    # createdAt
    if created_at:
        incident["createdAt"] = created_at
    
    # updatedAt - same as createdAt if no separate update time
    if created_at:
        incident["updatedAt"] = created_at
    
    # assignedTo
    assigned_to = row.get('TeamName', '').strip() or row.get('Icm_OwningTeamId', '').strip()
    if assigned_to:
        incident["assignedTo"] = assigned_to
    
    # customer
    account = row.get('Account', '').strip()
    if account:
        incident["customer"] = account
    
    # affectedServices - derive from WorkloadName if available
    affected_services = []
    workload = row.get('WorkloadName', '').strip()
    if workload:
        affected_services.append(workload)
    if affected_services:
        incident["affectedServices"] = affected_services
    
    # routingReasoning - only include fields that exist
    routing_reasoning = {}
    
    monitor = row.get('Monitor_DisplayName', '').strip()
    if monitor:
        routing_reasoning["primaryReason"] = monitor
    
    factors = []
    if monitor:
        factors.append(f"Monitor: {monitor}")
    if workload:
        factors.append(f"Workload: {workload}")
    team = row.get('TeamName', '').strip() or row.get('Icm_OwningTeamId', '').strip()
    if team:
        factors.append(f"Team: {team}")
    if factors:
        routing_reasoning["factors"] = factors
    
    # Only add suggestedActions if Troubleshooting_Text has URLs
    troubleshooting = row.get('Troubleshooting_Text', '').strip()
    if troubleshooting:
        urls = parse_urls(troubleshooting)
        if urls:
            routing_reasoning["suggestedActions"] = [f"Review: {url}" for url in urls[:4]]
    
    if routing_reasoning:
        incident["routingReasoning"] = routing_reasoning
    
    # context - only include fields that have actual data
    context = {}
    
    # impactLevel - derive from Forest if available
    forest = row.get('Forest', '').strip()
    if forest:
        context["impactLevel"] = f"Forest: {forest}"
    
    # businessImpact - use Problem or Message if available
    business_impact = row.get('Problem', '').strip() or row.get('Message', '').strip()
    if business_impact:
        context["businessImpact"] = business_impact
    
    resource = row.get('Resource', '').strip()
    if resource:
        context["resource"] = resource
    
    if troubleshooting:
        urls = parse_urls(troubleshooting)
        if urls:
            context["troubleshootingLinks"] = urls
    
    additional_info = row.get('Additional_Info', '').strip()
    if additional_info:
        context["additionalInfo"] = additional_info
    
    if context:
        incident["context"] = context
    
    # timeline - only if we have a timestamp
    if created_at:
        timeline = [{
            "timestamp": created_at,
            "event": "Incident created",
            "user": "System"
        }]
        incident["timeline"] = timeline
    
    # tags - extract from available fields
    tags = []
    
    # From Monitor_DisplayName
    if monitor:
        monitor_lower = monitor.lower()
        if 's360' in monitor_lower:
            tags.append('s360')
        if 'mrs' in monitor_lower:
            tags.append('migration')
        if 'llmapi' in monitor_lower:
            tags.append('llm-api')
        if 'sydney' in monitor_lower:
            tags.append('sydney')
    
    # From WorkloadName
    if workload:
        tags.append(workload.lower())
    
    # From Resource_Type
    resource_type = row.get('Resource_Type', '').strip()
    if resource_type and resource_type.lower() != 'hybrid':
        tags.append(resource_type.lower())
    
    # From Forest (if short enough)
    if forest and len(forest) < 20:
        tags.append(f'forest-{forest.lower()}')
    
    # From Current_State
    if current_state:
        state_lower = current_state.lower()
        if 'unhealthy' in state_lower:
            tags.append('unhealthy')
        if 'violated' in state_lower:
            tags.append('violated')
    
    # From Message/Title keywords
    message_text = (row.get('Message', '') or row.get('Title', '') or '').lower()
    if 'authentication' in message_text or 'auth' in message_text:
        tags.append('authentication')
    if 'search' in message_text or 'find' in message_text:
        tags.append('search')
    if 'teams' in message_text:
        tags.append('teams')
    if 'owa' in message_text or 'outlook' in message_text:
        tags.append('outlook')
    
    if tags:
        incident["tags"] = list(set(tags))  # Remove duplicates
    
    return incident


def csv_to_json(csv_file: str, json_file: str):
    """Convert CSV file to JSON file."""
    incidents = []
    
    print(f"Reading CSV file: {csv_file}")
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for idx, row in enumerate(reader, start=1):
            try:
                incident = convert_row_to_json(row)
                if incident:  # Only add if incident was created
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