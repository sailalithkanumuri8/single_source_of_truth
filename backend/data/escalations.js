const escalations = [
  // ------------------------------------
  // CLUSTER A – Azure VM / Compute
  // ------------------------------------
  {
    id: "ESC-2024-A01",
    title: "Azure VM High CPU and Slow Throughput",
    description: "Azure VMs showing 95% CPU during low workload.",
    status: "critical",
    priority: "P0",
    category: "Infrastructure",
    subcategory: "Compute",
    customer: "Contoso Ltd",
    affectedServices: ["Azure Virtual Machines"],
    tags: ["azure-vm", "compute", "performance", "cpu"],
    routingReasoning: {
      confidence: 0.94,
      primaryReason: "Performance degradation",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "At risk" },
    timeline: []
  },
  {
    id: "ESC-2024-A02",
    title: "VM Disk IO Saturation in East US",
    description: "Multiple VMs reporting IO throttling.",
    status: "high",
    priority: "P1",
    category: "Infrastructure",
    subcategory: "Compute",
    customer: "Fabrikam",
    affectedServices: ["Azure Virtual Machines"],
    tags: ["azure-vm", "disk-io", "throughput", "performance"],
    routingReasoning: {
      confidence: 0.91,
      primaryReason: "IO saturation",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },
  {
    id: "ESC-2024-A03",
    title: "VM Network Latency During Scale Operations",
    description: "Scale-out events causing latency spikes.",
    status: "medium",
    priority: "P2",
    category: "Infrastructure",
    subcategory: "Compute",
    customer: "Northwind",
    affectedServices: ["Azure Virtual Machines"],
    tags: ["azure-vm", "latency", "scaling", "performance"],
    routingReasoning: {
      confidence: 0.87,
      primaryReason: "Scaling latency",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },

  // ------------------------------------
  // CLUSTER B – Identity & Authentication
  // ------------------------------------
  {
    id: "ESC-2024-B01",
    title: "Azure AD Login Failures with MFA",
    description: "Users failing MFA step with error AADSTS70043.",
    status: "high",
    priority: "P1",
    category: "Identity",
    subcategory: "Authentication",
    customer: "Contoso",
    affectedServices: ["Azure AD"],
    tags: ["aad", "authentication", "mfa", "login-issue"],
    routingReasoning: {
      confidence: 0.96,
      primaryReason: "MFA error",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "At risk" },
    timeline: []
  },
  {
    id: "ESC-2024-B02",
    title: "Microsoft 365 Login Token Validation Errors",
    description: "Token key mismatch causing login failures.",
    status: "high",
    priority: "P1",
    category: "Identity",
    subcategory: "Authentication",
    customer: "Global Customers",
    affectedServices: ["Azure AD", "Microsoft 365"],
    tags: ["aad", "token", "authentication", "login"],
    routingReasoning: {
      confidence: 0.93,
      primaryReason: "Token validation failure",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },
  {
    id: "ESC-2024-B03",
    title: "Conditional Access Policy Blocking Mobile Logins",
    description: "Faulty policy prevents compliant devices from logging in.",
    status: "medium",
    priority: "P2",
    category: "Identity",
    subcategory: "Authentication",
    customer: "Woodgrove Bank",
    affectedServices: ["Azure AD"],
    tags: ["conditional-access", "aad", "authentication"],
    routingReasoning: {
      confidence: 0.82,
      primaryReason: "Policy misconfiguration",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },

  // ------------------------------------
  // CLUSTER C – SQL / Database
  // ------------------------------------
  {
    id: "ESC-2024-C01",
    title: "SQL Database Connection Timeouts",
    description: "Azure SQL experiencing intermittent timeouts.",
    status: "medium",
    priority: "P2",
    category: "Data",
    subcategory: "SQL",
    customer: "Fabrikam",
    affectedServices: ["Azure SQL Database"],
    tags: ["sql", "timeout", "database", "performance"],
    routingReasoning: {
      confidence: 0.89,
      primaryReason: "Query timeout",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },
  {
    id: "ESC-2024-C02",
    title: "SQL DTU Saturation Across Multiple Databases",
    description: "Databases hitting DTU limits.",
    status: "medium",
    priority: "P2",
    category: "Data",
    subcategory: "SQL",
    customer: "Northwind",
    affectedServices: ["Azure SQL Database"],
    tags: ["sql", "dtu", "performance", "resource-exhaustion"],
    routingReasoning: {
      confidence: 0.88,
      primaryReason: "DTU saturation",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },
  {
    id: "ESC-2024-C03",
    title: "Cosmos DB Partition Hotspot Causing Throttling",
    description: "Hot partition causing 429 throttling.",
    status: "high",
    priority: "P1",
    category: "Data",
    subcategory: "Cosmos DB",
    customer: "Adventure Works",
    affectedServices: ["Azure Cosmos DB"],
    tags: ["cosmos-db", "throttling", "ru", "partition"],
    routingReasoning: {
      confidence: 0.91,
      primaryReason: "Hot partition",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "At risk" },
    timeline: []
  },

  // ------------------------------------
  // CLUSTER D – DevOps / Pipelines
  // ------------------------------------
  {
    id: "ESC-2024-D01",
    title: "Azure Pipeline Agent Pool Exhaustion",
    description: "No available pipeline agents.",
    status: "high",
    priority: "P1",
    category: "DevOps",
    subcategory: "Pipelines",
    customer: "Northwind",
    affectedServices: ["Azure Pipelines"],
    tags: ["pipelines", "agent-pool", "devops", "ci-cd"],
    routingReasoning: {
      confidence: 0.92,
      primaryReason: "No available agents",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },
  {
    id: "ESC-2024-D02",
    title: "Pipeline Artifact Publishing Timeout",
    description: "Artifact upload taking too long.",
    status: "medium",
    priority: "P2",
    category: "DevOps",
    subcategory: "Pipelines",
    customer: "Fabrikam",
    affectedServices: ["Azure Pipelines"],
    tags: ["pipelines", "timeout", "artifacts"],
    routingReasoning: {
      confidence: 0.84,
      primaryReason: "Upload timeout",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },

  // ------------------------------------
  // CLUSTER E – Networking / Routing
  // ------------------------------------
  {
    id: "ESC-2024-E01",
    title: "Application Gateway 502 Errors",
    description: "Backend pools returning 502 under load.",
    status: "high",
    priority: "P1",
    category: "Networking",
    subcategory: "Load Balancing",
    customer: "Fabrikam",
    affectedServices: ["Application Gateway"],
    tags: ["gateway", "502", "load-balancer"],
    routingReasoning: {
      confidence: 0.93,
      primaryReason: "Backend health issue",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "On track" },
    timeline: []
  },
  {
    id: "ESC-2024-E02",
    title: "ExpressRoute Latency Spike",
    description: "ExpressRoute circuit latency increased.",
    status: "critical",
    priority: "P0",
    category: "Networking",
    subcategory: "ExpressRoute",
    customer: "Adventure Works",
    affectedServices: ["ExpressRoute"],
    tags: ["expressroute", "latency"],
    routingReasoning: {
      confidence: 0.95,
      primaryReason: "Circuit degradation",
      factors: [],
      suggestedActions: []
    },
    context: { slaStatus: "At risk" },
    timeline: []
  }
];

module.exports = escalations;
