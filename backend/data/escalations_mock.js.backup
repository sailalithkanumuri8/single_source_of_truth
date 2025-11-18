const escalations = [
  {
    id: "ESC-INFRA-1",
    title: "Azure VM CPU Saturation - West US 2",
    description: "High CPU saturation across compute hosts in West US 2 causing degraded API throughput and slow response times.",
    status: "critical",
    priority: "P0",
    category: "Infrastructure",
    subcategory: "Compute",
    createdAt: "2024-11-01T08:00:00Z",
    updatedAt: "2024-11-01T12:30:00Z",
    assignedTo: "Infrastructure Team",
    customer: "Contoso Ltd",
    affectedServices: ["Azure VM", "Azure Compute Host"],
    routingReasoning: {
      primaryReason: "Compute saturation",
      confidence: 0.94,
      factors: ["host pressure", "cpu spike", "westus2"],
      suggestedActions: ["scale out", "rebalance hosts", "validate workload spikes"]
    },
    context: {
      impactLevel: "High",
      businessImpact: "Prod slowdown",
      customerTier: "Enterprise",
      slaStatus: "At risk",
      timeToSLA: "3h",
      relatedIncidents: ["INC-INFRA-10"],
      previousEscalations: 3,
      estimatedResolutionTime: "6h"
    },
    timeline: [
      { timestamp: "2024-11-01T08:00:00Z", event: "CPU saturation detected", user: "System" },
      { timestamp: "2024-11-01T09:20:00Z", event: "Host-level contention confirmed", user: "Kevin Lin" }
    ],
    tags: ["cpu", "compute", "westus2", "vm", "infra"]
  },

  {
    id: "ESC-INFRA-2",
    title: "Compute Host Contention in West US 2",
    description: "Host contention events across multiple VM nodes causing latency and slower job processing.",
    status: "high",
    priority: "P1",
    category: "Infrastructure",
    subcategory: "Compute",
    createdAt: "2024-11-02T09:15:00Z",
    updatedAt: "2024-11-02T11:50:00Z",
    assignedTo: "Infrastructure Team",
    customer: "Contoso Ltd",
    affectedServices: ["Azure VM"],
    routingReasoning: {
      primaryReason: "Host pressure pattern",
      confidence: 0.91,
      factors: ["ready queue", "host contention", "westus2"],
      suggestedActions: ["migrate VMs", "shift load", "rebalance hypervisors"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Slow VM scheduling",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "9h",
      relatedIncidents: ["ESC-INFRA-1"],
      previousEscalations: 2,
      estimatedResolutionTime: "5h"
    },
    timeline: [
      { timestamp: "2024-11-02T09:15:00Z", event: "Performance alert", user: "System" }
    ],
    tags: ["infra", "host", "compute", "westus2"]
  },

  {
    id: "ESC-INFRA-3",
    title: "Burst Load Impacting VM Autoscaling",
    description: "Sudden burst CPU workloads causing slow VM autoscale reactions leading to intermittent API timeouts.",
    status: "medium",
    priority: "P2",
    category: "Infrastructure",
    subcategory: "Compute",
    createdAt: "2024-11-03T10:45:00Z",
    updatedAt: "2024-11-03T13:55:00Z",
    assignedTo: "Infrastructure Team",
    customer: "Contoso Ltd",
    affectedServices: ["VMSS"],
    routingReasoning: {
      primaryReason: "Burst load correlation",
      confidence: 0.89,
      factors: ["burst traffic", "autoscale delay", "westus2"],
      suggestedActions: ["add buffer", "increase baseline instances", "optimize autoscale rules"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Autoscale delays",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "22h",
      relatedIncidents: ["ESC-INFRA-1", "ESC-INFRA-2"],
      previousEscalations: 1,
      estimatedResolutionTime: "7h"
    },
    timeline: [
      { timestamp: "2024-11-03T10:45:00Z", event: "Autoscale alarms triggered", user: "System" }
    ],
    tags: ["vmss", "infra", "burst", "westus2"]
  },

  {
    id: "ESC-INFRA-4",
    title: "VM Ready-Time Spike Across Compute Cluster",
    description: "High CPU ready-time leading to slow task scheduling on VM workloads.",
    status: "high",
    priority: "P1",
    category: "Infrastructure",
    subcategory: "Compute",
    createdAt: "2024-11-04T07:20:00Z",
    updatedAt: "2024-11-04T10:10:00Z",
    assignedTo: "Infrastructure Team",
    customer: "Contoso Ltd",
    affectedServices: ["Azure VM"],
    routingReasoning: {
      primaryReason: "Ready queue spike",
      confidence: 0.91,
      factors: ["cpu ready", "host congestion", "westus2"],
      suggestedActions: ["increase VM size", "shift workload", "split node pools"]
    },
    context: {
      impactLevel: "High",
      businessImpact: "Processing delays",
      customerTier: "Enterprise",
      slaStatus: "At risk",
      timeToSLA: "4h",
      relatedIncidents: ["ESC-INFRA-1"],
      previousEscalations: 3,
      estimatedResolutionTime: "6h"
    },
    timeline: [
      { timestamp: "2024-11-04T07:20:00Z", event: "High ready-time detected", user: "System" }
    ],
    tags: ["ready", "compute", "infra", "westus2"]
  },

  {
    id: "ESC-INFRA-5",
    title: "Hypervisor Pressure on West US 2 VM Hosts",
    description: "Hypervisor contention impacting VM workloads with intermittent CPU starvation.",
    status: "medium",
    priority: "P2",
    category: "Infrastructure",
    subcategory: "Compute",
    createdAt: "2024-11-05T06:30:00Z",
    updatedAt: "2024-11-05T09:40:00Z",
    assignedTo: "Infrastructure Team",
    customer: "Contoso Ltd",
    affectedServices: ["Azure Hypervisor", "Azure VM"],
    routingReasoning: {
      primaryReason: "Hypervisor overload",
      confidence: 0.88,
      factors: ["host load", "hypervisor pressure", "westus2"],
      suggestedActions: ["rebalance host assignments", "decrease density", "shift workloads"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Latency spikes",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "15h",
      relatedIncidents: ["ESC-INFRA-1", "ESC-INFRA-2"],
      previousEscalations: 1,
      estimatedResolutionTime: "5h"
    },
    timeline: [
      { timestamp: "2024-11-05T06:30:00Z", event: "Hypervisor imbalance detected", user: "System" }
    ],
    tags: ["hypervisor", "infra", "compute", "westus2"]
  },

  {
    id: "ESC-ID-1",
    title: "AAD Authentication Loop - AADSTS50058",
    description: "Repeated AADSTS50058 sign-in failures across multiple customers due to session expiration mismatch.",
    status: "high",
    priority: "P1",
    category: "Identity & Access",
    subcategory: "Authentication",
    createdAt: "2024-11-01T07:25:00Z",
    updatedAt: "2024-11-01T10:40:00Z",
    assignedTo: "Identity Services Team",
    customer: "Multiple Customers",
    affectedServices: ["Azure AD"],
    routingReasoning: {
      primaryReason: "Session mismatch",
      confidence: 0.92,
      factors: ["stale token", "expired session", "token mismatch"],
      suggestedActions: ["force reauth", "clear session", "validate CA config"]
    },
    context: {
      impactLevel: "High",
      businessImpact: "Login disruption",
      customerTier: "Mixed",
      slaStatus: "On track",
      timeToSLA: "7h",
      relatedIncidents: ["INC-ID-10"],
      previousEscalations: 2,
      estimatedResolutionTime: "6h"
    },
    timeline: [
      { timestamp: "2024-11-01T07:25:00Z", event: "Auth loop detected", user: "System" }
    ],
    tags: ["aad", "auth", "50058", "identity"]
  },

  {
    id: "ESC-ID-2",
    title: "Token Issuer Validation Failure",
    description: "Token issuer mismatch causing authentication failures across multiple organizations.",
    status: "high",
    priority: "P1",
    category: "Identity & Access",
    subcategory: "Authentication",
    createdAt: "2024-11-02T08:40:00Z",
    updatedAt: "2024-11-02T10:00:00Z",
    assignedTo: "Identity Services Team",
    customer: "Multiple Organizations",
    affectedServices: ["Azure AD"],
    routingReasoning: {
      primaryReason: "Issuer mismatch",
      confidence: 0.93,
      factors: ["issuer mismatch", "token invalid", "metadata stale"],
      suggestedActions: ["refresh metadata", "revalidate issuer", "compare keys"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Intermittent login failures",
      customerTier: "Mixed",
      slaStatus: "On track",
      timeToSLA: "11h",
      relatedIncidents: ["ESC-ID-1"],
      previousEscalations: 3,
      estimatedResolutionTime: "6h"
    },
    timeline: [
      { timestamp: "2024-11-02T08:40:00Z", event: "Issuer mismatch spike", user: "System" }
    ],
    tags: ["aad", "issuer", "token", "identity"]
  },

  {
    id: "ESC-ID-3",
    title: "Conditional Access Blocking Token Issuance",
    description: "CA policy conflict preventing tokens from being issued to key applications.",
    status: "medium",
    priority: "P2",
    category: "Identity & Access",
    subcategory: "Policies",
    createdAt: "2024-11-03T09:10:00Z",
    updatedAt: "2024-11-03T12:00:00Z",
    assignedTo: "Identity Services Team",
    customer: "Enterprise Tenants",
    affectedServices: ["Azure AD"],
    routingReasoning: {
      primaryReason: "Policy conflict",
      confidence: 0.87,
      factors: ["policy mismatch", "invalid CA rule", "token blocked"],
      suggestedActions: ["review rule ordering", "disable conflicting rule", "validate exceptions"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Blocked sign-ins",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "20h",
      relatedIncidents: ["ESC-ID-1", "ESC-ID-2"],
      previousEscalations: 1,
      estimatedResolutionTime: "5h"
    },
    timeline: [
      { timestamp: "2024-11-03T09:10:00Z", event: "CA failure detected", user: "System" }
    ],
    tags: ["ca", "aad", "identity", "auth"]
  },

  {
    id: "ESC-ID-4",
    title: "AAD Redirect Loop Impacting Legacy Apps",
    description: "Redirect-to-login loop affecting legacy apps relying on outdated AAD login flows.",
    status: "high",
    priority: "P1",
    category: "Identity & Access",
    subcategory: "Authentication",
    createdAt: "2024-11-04T08:50:00Z",
    updatedAt: "2024-11-04T10:10:00Z",
    assignedTo: "Identity Services team",
    customer: "Enterprise Tenants",
    affectedServices: ["Azure AD"],
    routingReasoning: {
      primaryReason: "Redirect mismatch",
      confidence: 0.89,
      factors: ["stale redirect", "legacy app", "bad auth header"],
      suggestedActions: ["update redirect URL", "refresh session", "disable legacy flow"]
    },
    context: {
      impactLevel: "High",
      businessImpact: "Users unable to sign in",
      customerTier: "Enterprise",
      slaStatus: "At risk",
      timeToSLA: "4h",
      relatedIncidents: ["ESC-ID-1"],
      previousEscalations: 3,
      estimatedResolutionTime: "6h"
    },
    timeline: [
      { timestamp: "2024-11-04T08:50:00Z", event: "Redirect loop identified", user: "System" }
    ],
    tags: ["redirect", "auth", "identity", "aad"]
  },

  {
    id: "ESC-ID-5",
    title: "Key Roll Event Causing Token Validation Failures",
    description: "AAD key roll causing mismatched signing key errors for older application stacks.",
    status: "medium",
    priority: "P2",
    category: "Identity & Access",
    subcategory: "Authentication",
    createdAt: "2024-11-05T06:40:00Z",
    updatedAt: "2024-11-05T08:30:00Z",
    assignedTo: "Identity Services Team",
    customer: "Multiple Customers",
    affectedServices: ["Azure AD"],
    routingReasoning: {
      primaryReason: "Key mismatch",
      confidence: 0.86,
      factors: ["stale cert", "old signing key", "metadata not refreshed"],
      suggestedActions: ["update certificates", "refresh metadata", "restart auth service"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Legacy auth failures",
      customerTier: "Mixed",
      slaStatus: "On track",
      timeToSLA: "18h",
      relatedIncidents: ["ESC-ID-1", "ESC-ID-2", "ESC-ID-3"],
      previousEscalations: 1,
      estimatedResolutionTime: "5h"
    },
    timeline: [
      { timestamp: "2024-11-05T06:40:00Z", event: "Key roll mismatch detected", user: "System" }
    ],
    tags: ["key", "aad", "identity", "auth"]
  },

  {
    id: "ESC-DATA-1",
    title: "SQL DTU Surge Causing Severe Timeouts",
    description: "DTU saturation leading to query timeouts and slow application responses.",
    status: "medium",
    priority: "P2",
    category: "Data & Storage",
    subcategory: "SQL Database",
    createdAt: "2024-11-01T11:15:00Z",
    updatedAt: "2024-11-01T14:00:00Z",
    assignedTo: "Database Engineering Team",
    customer: "Fabrikam Inc",
    affectedServices: ["Azure SQL"],
    routingReasoning: {
      primaryReason: "DTU overload",
      confidence: 0.88,
      factors: ["dtu high", "blocking", "slow query"],
      suggestedActions: ["add compute", "fix slow plan", "kill blockers"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Slow reporting",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "22h",
      relatedIncidents: ["INC-DATA-10"],
      previousEscalations: 2,
      estimatedResolutionTime: "7h"
    },
    timeline: [
      { timestamp: "2024-11-01T11:15:00Z", event: "Timeouts detected", user: "System" }
    ],
    tags: ["sql", "timeout", "dtu", "db"]
  },

  {
    id: "ESC-DATA-2",
    title: "SQL Lock Contention on High-Traffic Table",
    description: "Blocking chain observed on critical transaction table resulting in elevated timeout rates.",
    status: "high",
    priority: "P1",
    category: "Data & Storage",
    subcategory: "SQL Database",
    createdAt: "2024-11-02T12:30:00Z",
    updatedAt: "2024-11-02T15:10:00Z",
    assignedTo: "Database Engineering Team",
    customer: "Fabrikam Inc",
    affectedServices: ["Azure SQL"],
    routingReasoning: {
      primaryReason: "Lock chain",
      confidence: 0.91,
      factors: ["blocking", "deadlock", "hot table"],
      suggestedActions: ["kill blocker", "optimize index", "reduce TX duration"]
    },
    context: {
      impactLevel: "High",
      businessImpact: "Transaction delay",
      customerTier: "Enterprise",
      slaStatus: "At risk",
      timeToSLA: "5h",
      relatedIncidents: ["ESC-DATA-1"],
      previousEscalations: 3,
      estimatedResolutionTime: "6h"
    },
    timeline: [
      { timestamp: "2024-11-02T12:30:00Z", event: "Blocking chain detected", user: "System" }
    ],
    tags: ["sql", "locking", "db", "contention"]
  },

  {
    id: "ESC-DATA-3",
    title: "Connection Pool Exhaustion Under Load",
    description: "Active connection pool maxed due to long-running queries and idle session buildup.",
    status: "medium",
    priority: "P2",
    category: "Data & Storage",
    subcategory: "SQL Database",
    createdAt: "2024-11-03T10:20:00Z",
    updatedAt: "2024-11-03T13:00:00Z",
    assignedTo: "Database Engineering Team",
    customer: "Fabrikam Inc",
    affectedServices: ["Azure SQL"],
    routingReasoning: {
      primaryReason: "Connection limit",
      confidence: 0.87,
      factors: ["max connections", "idle sessions", "slow query"],
      suggestedActions: ["increase pool", "clean idle", "optimize slow query"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Login failures",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "19h",
      relatedIncidents: ["ESC-DATA-1", "ESC-DATA-2"],
      previousEscalations: 2,
      estimatedResolutionTime: "6h"
    },
    timeline: [
      { timestamp: "2024-11-03T10:20:00Z", event: "Pool exhaustion detected", user: "System" }
    ],
    tags: ["sql", "pool", "db", "connections"]
  },

  {
    id: "ESC-DATA-4",
    title: "Azure SQL Index Fragmentation Spiking Query Latency",
    description: "Highly fragmented indexes leading to slow query performance and elevated IO waits.",
    status: "medium",
    priority: "P2",
    category: "Data & Storage",
    subcategory: "SQL Database",
    createdAt: "2024-11-04T09:40:00Z",
    updatedAt: "2024-11-04T11:30:00Z",
    assignedTo: "Database Engineering Team",
    customer: "Fabrikam Inc",
    affectedServices: ["Azure SQL"],
    routingReasoning: {
      primaryReason: "Fragmented indexing",
      confidence: 0.86,
      factors: ["fragmentation", "slow scan", "high IO"],
      suggestedActions: ["rebuild index", "update stats", "partition table"]
    },
    context: {
      impactLevel: "Medium",
      businessImpact: "Reporting delays",
      customerTier: "Enterprise",
      slaStatus: "On track",
      timeToSLA: "16h",
      relatedIncidents: ["ESC-DATA-1", "ESC-DATA-2", "ESC-DATA-3"],
      previousEscalations: 1,
      estimatedResolutionTime: "5h"
    },
    timeline: [
      { timestamp: "2024-11-04T09:40:00Z", event: "Fragmentation detected", user: "System" }
    ],
    tags: ["sql", "index", "db", "latency"]
  },

  {
    id: "ESC-DATA-5",
    title: "Hot Partition Causing Cosmos Throttling",
    description: "Cosmos DB hitting 429 throttling errors due to uneven partition distribution.",
    status: "high",
    priority: "P1",
    category: "Data & Storage",
    subcategory: "Cosmos DB",
    createdAt: "2024-11-05T07:50:00Z",
    updatedAt: "2024-11-05T10:20:00Z",
    assignedTo: "Database Engineering Team",
    customer: "Fabrikam Inc",
    affectedServices: ["Cosmos DB"],
    routingReasoning: {
      primaryReason: "Hot partition",
      confidence: 0.9,
      factors: ["hot partition", "ru spike", "imbalanced distribution"],
      suggestedActions: ["change partition key", "add throughput", "split hot partition"]
    },
    context: {
      impactLevel: "High",
      businessImpact: "Write throttling",
      customerTier: "Enterprise",
      slaStatus: "At risk",
      timeToSLA: "5h",
      relatedIncidents: ["ESC-DATA-1"],
      previousEscalations: 2,
      estimatedResolutionTime: "7h"
    },
    timeline: [
      { timestamp: "2024-11-05T07:50:00Z", event: "429 spike detected", user: "System" }
    ],
    tags: ["cosmos", "ru", "throttling", "db"]
  }
];

module.exports = escalations;
