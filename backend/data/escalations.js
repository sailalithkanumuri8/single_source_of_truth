const escalations = [
  {
    id: "ESC-2024-001",
    title: "Azure VM Performance Degradation",
    description: "Customer experiencing significant performance issues with Azure VMs in West US 2 region. Multiple VMs showing high CPU utilization without corresponding workload increase.",
    status: "critical",
    priority: "P0",
    category: "Infrastructure",
    subcategory: "Compute",
    createdAt: "2024-10-28T09:15:00Z",
    updatedAt: "2024-10-31T14:30:00Z",
    assignedTo: "Infrastructure Team",
    customer: "Contoso Ltd",
    affectedServices: ["Azure Virtual Machines", "Azure Monitor"],
    routingReasoning: {
      primaryReason: "Infrastructure performance pattern detected",
      confidence: 0.94,
      factors: [
        "Historical escalations show Infrastructure Team resolves VM performance issues 40% faster",
        "Team has domain expertise in West US 2 region infrastructure",
        "Similar pattern resolved by this team in ESC-2024-789"
      ],
      suggestedActions: [
        "Check region-wide compute health metrics",
        "Review recent deployments in West US 2",
        "Correlate with Azure status page updates"
      ]
    },
    context: {
      impactLevel: "High - 200+ VMs affected",
      businessImpact: "Production workloads experiencing 50% performance degradation",
      customerTier: "Enterprise",
      slaStatus: "At risk",
      timeToSLA: "4 hours remaining",
      relatedIncidents: ["INC-2024-1123", "INC-2024-1089"],
      previousEscalations: 2,
      estimatedResolutionTime: "6-8 hours"
    },
    timeline: [
      { timestamp: "2024-10-28T09:15:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-28T09:20:00Z", event: "Routed to Infrastructure Team", user: "AI Router" },
      { timestamp: "2024-10-28T10:45:00Z", event: "Initial assessment completed", user: "Sarah Chen" },
      { timestamp: "2024-10-31T14:30:00Z", event: "Mitigation in progress", user: "Mike Johnson" }
    ],
    tags: ["performance", "azure-vm", "west-us-2", "p0", "production"]
  },
  {
    id: "ESC-2024-002",
    title: "Microsoft 365 Authentication Failures",
    description: "Multiple customers reporting authentication failures when accessing Microsoft 365 services. Error code: AADSTS50058.",
    status: "high",
    priority: "P1",
    category: "Identity & Access",
    subcategory: "Authentication",
    createdAt: "2024-10-30T14:22:00Z",
    updatedAt: "2024-10-31T11:15:00Z",
    assignedTo: "Identity Services Team",
    customer: "Multiple Customers",
    affectedServices: ["Azure Active Directory", "Microsoft 365", "Exchange Online"],
    routingReasoning: {
      primaryReason: "Authentication pattern with AAD error codes",
      confidence: 0.97,
      factors: [
        "Error code AADSTS50058 is Azure AD specific",
        "Identity Services Team owns authentication pipeline",
        "Cross-customer impact suggests infrastructure-level issue",
        "Team has 95% success rate on AAD auth issues"
      ],
      suggestedActions: [
        "Check Azure AD service health dashboard",
        "Review recent certificate updates",
        "Verify conditional access policy changes",
        "Check for token signing key rotation events"
      ]
    },
    context: {
      impactLevel: "Medium - 50+ customers affected",
      businessImpact: "Users unable to access email and collaboration tools",
      customerTier: "Mixed (Enterprise & SMB)",
      slaStatus: "On track",
      timeToSLA: "18 hours remaining",
      relatedIncidents: ["INC-2024-1156", "INC-2024-1157", "INC-2024-1159"],
      previousEscalations: 0,
      estimatedResolutionTime: "4-6 hours"
    },
    timeline: [
      { timestamp: "2024-10-30T14:22:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-30T14:25:00Z", event: "Routed to Identity Services Team", user: "AI Router" },
      { timestamp: "2024-10-30T15:10:00Z", event: "Root cause identified", user: "Alex Kumar" },
      { timestamp: "2024-10-31T11:15:00Z", event: "Fix deployed to staging", user: "Jennifer Liu" }
    ],
    tags: ["authentication", "aad", "microsoft-365", "multi-customer", "p1"]
  },
  {
    id: "ESC-2024-003",
    title: "SQL Database Connection Timeouts",
    description: "Customer experiencing intermittent connection timeouts to Azure SQL Database. Pattern shows timeouts occurring during peak hours (9 AM - 5 PM PST).",
    status: "medium",
    priority: "P2",
    category: "Data & Storage",
    subcategory: "SQL Database",
    createdAt: "2024-10-29T16:30:00Z",
    updatedAt: "2024-10-31T09:45:00Z",
    assignedTo: "Database Engineering Team",
    customer: "Fabrikam Inc",
    affectedServices: ["Azure SQL Database", "Application Gateway"],
    routingReasoning: {
      primaryReason: "Database performance pattern with time-based correlation",
      confidence: 0.89,
      factors: [
        "Connection timeout pattern suggests resource exhaustion",
        "Database Engineering Team has expertise in connection pooling issues",
        "Peak hour correlation indicates scaling or resource limits",
        "Similar pattern in ESC-2024-456 resolved by this team"
      ],
      suggestedActions: [
        "Review DTU/vCore utilization during peak hours",
        "Analyze connection pool configuration",
        "Check for blocking queries or locks",
        "Evaluate auto-scaling configuration"
      ]
    },
    context: {
      impactLevel: "Medium - Single customer, 3 databases",
      businessImpact: "Application performance degraded during business hours",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "36 hours remaining",
      relatedIncidents: ["INC-2024-1001"],
      previousEscalations: 1,
      estimatedResolutionTime: "8-12 hours"
    },
    timeline: [
      { timestamp: "2024-10-29T16:30:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-29T16:35:00Z", event: "Routed to Database Engineering Team", user: "AI Router" },
      { timestamp: "2024-10-30T10:20:00Z", event: "Performance metrics collected", user: "David Park" },
      { timestamp: "2024-10-31T09:45:00Z", event: "Scaling recommendation prepared", user: "Lisa Zhang" }
    ],
    tags: ["sql-database", "connection-timeout", "performance", "peak-hours", "p2"]
  },
  {
    id: "ESC-2024-004",
    title: "Azure DevOps Pipeline Failures",
    description: "CI/CD pipelines failing with 'Resource not available' error. Affects multiple projects across the organization.",
    status: "high",
    priority: "P1",
    category: "DevOps",
    subcategory: "Pipelines",
    createdAt: "2024-10-31T08:00:00Z",
    updatedAt: "2024-10-31T13:20:00Z",
    assignedTo: "DevOps Platform Team",
    customer: "Northwind Traders",
    affectedServices: ["Azure DevOps", "Azure Pipelines", "Container Registry"],
    routingReasoning: {
      primaryReason: "DevOps platform issue with resource availability",
      confidence: 0.92,
      factors: [
        "Error pattern matches agent pool exhaustion",
        "DevOps Platform Team owns pipeline infrastructure",
        "Multi-project impact suggests platform-level issue",
        "Team has fastest mean time to resolution for pipeline issues"
      ],
      suggestedActions: [
        "Check agent pool availability and capacity",
        "Review recent pipeline agent updates",
        "Verify service principal permissions",
        "Check Container Registry health"
      ]
    },
    context: {
      impactLevel: "High - Blocking deployments for 15+ teams",
      businessImpact: "Development velocity impacted, deployments blocked",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "20 hours remaining",
      relatedIncidents: ["INC-2024-1178", "INC-2024-1179"],
      previousEscalations: 0,
      estimatedResolutionTime: "3-5 hours"
    },
    timeline: [
      { timestamp: "2024-10-31T08:00:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-31T08:05:00Z", event: "Routed to DevOps Platform Team", user: "AI Router" },
      { timestamp: "2024-10-31T09:30:00Z", event: "Agent pool capacity increased", user: "Rachel Green" },
      { timestamp: "2024-10-31T13:20:00Z", event: "Monitoring for stability", user: "Tom Anderson" }
    ],
    tags: ["azure-devops", "pipelines", "resource-availability", "ci-cd", "p1"]
  },
  {
    id: "ESC-2024-005",
    title: "Network Latency Spike in Express Route",
    description: "Customer reporting 300-500ms latency increase on Express Route connection between on-premises datacenter and Azure.",
    status: "critical",
    priority: "P0",
    category: "Networking",
    subcategory: "Express Route",
    createdAt: "2024-10-31T06:45:00Z",
    updatedAt: "2024-10-31T15:10:00Z",
    assignedTo: "Network Engineering Team",
    customer: "Adventure Works",
    affectedServices: ["Azure Express Route", "Virtual Network"],
    routingReasoning: {
      primaryReason: "Network performance degradation on dedicated circuit",
      confidence: 0.96,
      factors: [
        "Express Route issues require specialized network expertise",
        "Network Engineering Team owns Express Route operations",
        "Latency pattern suggests BGP or routing issue",
        "Team has direct access to telco provider escalation paths"
      ],
      suggestedActions: [
        "Check Express Route circuit health metrics",
        "Review BGP route advertisements",
        "Verify peering session status",
        "Engage telco provider if needed"
      ]
    },
    context: {
      impactLevel: "Critical - Hybrid cloud connectivity degraded",
      businessImpact: "Real-time data sync affected, applications timing out",
      customerTier: "Enterprise",
      slaStatus: "At risk",
      timeToSLA: "2 hours remaining",
      relatedIncidents: ["INC-2024-1190"],
      previousEscalations: 1,
      estimatedResolutionTime: "4-6 hours"
    },
    timeline: [
      { timestamp: "2024-10-31T06:45:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-31T06:50:00Z", event: "Routed to Network Engineering Team", user: "AI Router" },
      { timestamp: "2024-10-31T08:15:00Z", event: "Circuit diagnostics initiated", user: "Kevin Brown" },
      { timestamp: "2024-10-31T15:10:00Z", event: "Telco provider engaged", user: "Maria Garcia" }
    ],
    tags: ["express-route", "network-latency", "hybrid-cloud", "connectivity", "p0"]
  },
  {
    id: "ESC-2024-006",
    title: "Storage Account Access Denied Errors",
    description: "Application receiving 403 Forbidden errors when accessing blob storage. Issue started after recent security policy update.",
    status: "medium",
    priority: "P2",
    category: "Data & Storage",
    subcategory: "Blob Storage",
    createdAt: "2024-10-30T11:00:00Z",
    updatedAt: "2024-10-31T10:30:00Z",
    assignedTo: "Storage Services Team",
    customer: "Tailspin Toys",
    affectedServices: ["Azure Blob Storage", "Azure Key Vault"],
    routingReasoning: {
      primaryReason: "Storage access control issue post-policy change",
      confidence: 0.88,
      factors: [
        "403 errors indicate permissions or access control issue",
        "Storage Services Team owns blob storage and access policies",
        "Timing correlation with policy update suggests configuration issue",
        "Team has expertise in SAS tokens and RBAC troubleshooting"
      ],
      suggestedActions: [
        "Review recent storage account policy changes",
        "Verify SAS token permissions and expiration",
        "Check RBAC role assignments",
        "Validate firewall and network rules"
      ]
    },
    context: {
      impactLevel: "Medium - Single application affected",
      businessImpact: "File upload/download functionality unavailable",
      customerTier: "Standard",
      slaStatus: "On track",
      timeToSLA: "40 hours remaining",
      relatedIncidents: ["INC-2024-1145"],
      previousEscalations: 0,
      estimatedResolutionTime: "2-4 hours"
    },
    timeline: [
      { timestamp: "2024-10-30T11:00:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-30T11:10:00Z", event: "Routed to Storage Services Team", user: "AI Router" },
      { timestamp: "2024-10-30T14:30:00Z", event: "Policy misconfiguration identified", user: "Amy Wilson" },
      { timestamp: "2024-10-31T10:30:00Z", event: "Fix prepared for validation", user: "James Taylor" }
    ],
    tags: ["blob-storage", "access-denied", "permissions", "security-policy", "p2"]
  },
  {
    id: "ESC-2024-007",
    title: "Kubernetes Cluster Node Failures",
    description: "AKS cluster experiencing node failures with nodes becoming NotReady. Multiple pods being evicted and rescheduled.",
    status: "critical",
    priority: "P0",
    category: "Containers",
    subcategory: "Kubernetes",
    createdAt: "2024-10-31T04:30:00Z",
    updatedAt: "2024-10-31T14:45:00Z",
    assignedTo: "Container Platform Team",
    customer: "Woodgrove Bank",
    affectedServices: ["Azure Kubernetes Service", "Container Instances"],
    routingReasoning: {
      primaryReason: "AKS infrastructure stability issue",
      confidence: 0.95,
      factors: [
        "Node NotReady status indicates infrastructure-level issue",
        "Container Platform Team owns AKS cluster operations",
        "Pattern matches known memory pressure scenarios",
        "Team has on-call expertise for cluster emergencies"
      ],
      suggestedActions: [
        "Check node resource utilization (CPU, memory, disk)",
        "Review kubelet logs on affected nodes",
        "Verify cluster auto-scaler configuration",
        "Check for kernel panics or OOM kills"
      ]
    },
    context: {
      impactLevel: "Critical - 8 of 12 nodes affected",
      businessImpact: "Production workloads experiencing intermittent failures",
      customerTier: "Enterprise",
      slaStatus: "At risk",
      timeToSLA: "3 hours remaining",
      relatedIncidents: ["INC-2024-1195", "INC-2024-1196"],
      previousEscalations: 2,
      estimatedResolutionTime: "4-8 hours"
    },
    timeline: [
      { timestamp: "2024-10-31T04:30:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-31T04:35:00Z", event: "Routed to Container Platform Team", user: "AI Router" },
      { timestamp: "2024-10-31T06:00:00Z", event: "Emergency node pool added", user: "Chris Martinez" },
      { timestamp: "2024-10-31T14:45:00Z", event: "Root cause analysis in progress", user: "Nina Patel" }
    ],
    tags: ["aks", "kubernetes", "node-failure", "cluster-health", "p0"]
  },
  {
    id: "ESC-2024-008",
    title: "Power BI Report Rendering Issues",
    description: "Enterprise customers unable to render complex Power BI reports. Reports timeout after 2 minutes.",
    status: "high",
    priority: "P1",
    category: "Analytics",
    subcategory: "Power BI",
    createdAt: "2024-10-30T13:15:00Z",
    updatedAt: "2024-10-31T12:00:00Z",
    assignedTo: "Analytics Platform Team",
    customer: "Multiple Enterprise Customers",
    affectedServices: ["Power BI", "Azure Analysis Services"],
    routingReasoning: {
      primaryReason: "Power BI rendering performance issue",
      confidence: 0.91,
      factors: [
        "Timeout pattern suggests query or rendering optimization needed",
        "Analytics Platform Team owns Power BI infrastructure",
        "Complex report correlation indicates data model issue",
        "Team has expertise in query optimization and caching"
      ],
      suggestedActions: [
        "Review report query execution plans",
        "Check Analysis Services capacity metrics",
        "Analyze data model complexity and relationships",
        "Verify premium capacity health"
      ]
    },
    context: {
      impactLevel: "High - Multiple enterprise customers affected",
      businessImpact: "Executive dashboards unavailable for business decisions",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "12 hours remaining",
      relatedIncidents: ["INC-2024-1167", "INC-2024-1168"],
      previousEscalations: 1,
      estimatedResolutionTime: "6-10 hours"
    },
    timeline: [
      { timestamp: "2024-10-30T13:15:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-30T13:20:00Z", event: "Routed to Analytics Platform Team", user: "AI Router" },
      { timestamp: "2024-10-30T16:45:00Z", event: "Query bottleneck identified", user: "Oliver Smith" },
      { timestamp: "2024-10-31T12:00:00Z", event: "Optimization script prepared", user: "Emma Davis" }
    ],
    tags: ["power-bi", "report-rendering", "performance", "analytics", "p1"]
  },
  {
    id: "ESC-2024-009",
    title: "Azure Functions Cold Start Latency",
    description: "Serverless functions experiencing 10-15 second cold start times, impacting API response times significantly.",
    status: "medium",
    priority: "P2",
    category: "Compute",
    subcategory: "Serverless",
    createdAt: "2024-10-29T09:20:00Z",
    updatedAt: "2024-10-31T08:15:00Z",
    assignedTo: "Serverless Platform Team",
    customer: "Litware Inc",
    affectedServices: ["Azure Functions", "Application Insights"],
    routingReasoning: {
      primaryReason: "Serverless cold start optimization needed",
      confidence: 0.87,
      factors: [
        "Cold start pattern is Azure Functions specific",
        "Serverless Platform Team owns function runtime optimization",
        "Latency values suggest initialization bottleneck",
        "Team has tools for warm-up and pre-warming strategies"
      ],
      suggestedActions: [
        "Review function package size and dependencies",
        "Analyze initialization code performance",
        "Consider Premium plan or pre-warmed instances",
        "Evaluate durable functions for stateful scenarios"
      ]
    },
    context: {
      impactLevel: "Medium - API endpoints affected",
      businessImpact: "User-facing API experiencing slow response times",
      customerTier: "Standard",
      slaStatus: "On track",
      timeToSLA: "48 hours remaining",
      relatedIncidents: ["INC-2024-1089"],
      previousEscalations: 0,
      estimatedResolutionTime: "4-6 hours"
    },
    timeline: [
      { timestamp: "2024-10-29T09:20:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-29T09:30:00Z", event: "Routed to Serverless Platform Team", user: "AI Router" },
      { timestamp: "2024-10-30T11:00:00Z", event: "Package analysis completed", user: "Sophia Lee" },
      { timestamp: "2024-10-31T08:15:00Z", event: "Optimization recommendations provided", user: "Daniel Kim" }
    ],
    tags: ["azure-functions", "cold-start", "latency", "serverless", "p2"]
  },
  {
    id: "ESC-2024-010",
    title: "Cosmos DB Throttling Issues",
    description: "Application experiencing 429 throttling errors on Cosmos DB. RU consumption spiking during normal operations.",
    status: "high",
    priority: "P1",
    category: "Data & Storage",
    subcategory: "Cosmos DB",
    createdAt: "2024-10-31T10:00:00Z",
    updatedAt: "2024-10-31T15:30:00Z",
    assignedTo: "Cosmos DB Team",
    customer: "Alpine Ski House",
    affectedServices: ["Azure Cosmos DB", "Application Insights"],
    routingReasoning: {
      primaryReason: "Cosmos DB capacity and optimization issue",
      confidence: 0.93,
      factors: [
        "429 errors are Cosmos DB specific throttling responses",
        "Cosmos DB Team has expertise in RU optimization",
        "Pattern suggests partition key design or over-provisioning issue",
        "Team has direct access to Cosmos DB telemetry and diagnostics"
      ],
      suggestedActions: [
        "Review RU consumption patterns by operation",
        "Analyze partition key distribution",
        "Check for hot partitions",
        "Evaluate auto-scale vs manual provisioning"
      ]
    },
    context: {
      impactLevel: "High - Core application functionality affected",
      businessImpact: "User transactions failing, data writes rejected",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "16 hours remaining",
      relatedIncidents: ["INC-2024-1200"],
      previousEscalations: 0,
      estimatedResolutionTime: "5-7 hours"
    },
    timeline: [
      { timestamp: "2024-10-31T10:00:00Z", event: "Escalation created", user: "System" },
      { timestamp: "2024-10-31T10:05:00Z", event: "Routed to Cosmos DB Team", user: "AI Router" },
      { timestamp: "2024-10-31T12:30:00Z", event: "Hot partition identified", user: "Robert Johnson" },
      { timestamp: "2024-10-31T15:30:00Z", event: "Partition key redesign proposed", user: "Isabella Torres" }
    ],
    tags: ["cosmos-db", "throttling", "ru-consumption", "performance", "p1"]
  }
];

module.exports = escalations;

