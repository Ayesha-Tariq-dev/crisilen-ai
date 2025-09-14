// src/data/sampleCrisisData.js
export const sampleCrisisData = [
  {
    id: 1,
    text: "Devastating 8.1 magnitude earthquake hits Pacific Ring of Fire. Multiple tsunamis reported. Coastal cities in Japan and Philippines on high alert. International aid mobilizing.",
    source: "Pacific Disaster Center",
    timestamp: "2025-09-14T08:30:00Z",
    location: "Western Pacific",
    type: "earthquake",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 20.7783, lng: 130.0017 }
  },
  {
    id: 2,
    text: "Hurricane Marcus strengthens to Category 5, approaching Florida coast. Storm surge expected to reach 20 feet. Mandatory evacuation ordered for coastal counties.",
    source: "National Hurricane Center",
    timestamp: "2025-09-14T09:45:00Z",
    location: "Florida, USA",
    type: "cyclone",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 25.7617, lng: -80.1918 }
  },
  {
    id: 3,
    text: "Arctic permafrost collapse triggers massive methane release in Siberia. Local communities evacuated. Global climate impact warnings issued by scientists.",
    source: "Russian Environmental Monitor",
    timestamp: "2025-09-14T10:15:00Z",
    location: "Northern Siberia",
    type: "other",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 71.2854, lng: 127.2547 }
  },
  {
    id: 4,
    text: "Unprecedented heat dome forms over Mediterranean Europe. Multiple cities report record-breaking temperatures. Health services overwhelmed with heat-related emergencies.",
    source: "European Weather Alert System",
    timestamp: "2025-09-14T11:20:00Z",
    location: "Mediterranean Region",
    type: "other",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 41.9028, lng: 12.4964 }
  },
  {
    id: 5,
    text: "Mega-wildfire complex in Amazon rainforest threatens indigenous territories. Smoke affecting multiple countries. International firefighting teams requested.",
    source: "Brazilian Forest Service",
    timestamp: "2025-09-14T12:30:00Z",
    location: "Amazon Basin",
    type: "wildfire",
    verified: true,
    imageUrl: null,
    coordinates: { lat: -3.4653, lng: -62.2159 }
  },
  {
    id: 6,
    text: "AI-powered dam control system failure causes flash flooding in smart city network. Multiple infrastructure systems affected. Emergency protocols activated.",
    source: "Global Infrastructure Alert",
    timestamp: "2025-09-14T13:10:00Z",
    location: "Singapore",
    type: "flood",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 1.3521, lng: 103.8198 }
  }
];

// Additional data for demonstration
export const crisisTypes = {
  earthquake: {
    icon: '🌍',
    color: '#dc2626',
    name: 'Earthquake',
    severity: 'Critical'
  },
  flood: {
    icon: '🌊',
    color: '#2563eb',
    name: 'Flood',
    severity: 'High'
  },
  wildfire: {
    icon: '🔥',
    color: '#ea580c',
    name: 'Wildfire',
    severity: 'High'
  },
  cyclone: {
    icon: '🌀',
    color: '#7c3aed',
    name: 'Cyclone',
    severity: 'Critical'
  },
  structural_collapse: {
    icon: '🏗️',
    color: '#dc2626',
    name: 'Building Collapse',
    severity: 'Critical'
  },
  other: {
    icon: '⚠️',
    color: '#d97706',
    name: 'Other Emergency',
    severity: 'Medium'
  }
};

export const mockAnalysisResults = {
  1: {
    urgency: 9,
    estimatedCasualties: "Critical - Potentially 50,000+ affected across multiple countries",
    resourcesNeeded: ["International SAR teams", "Mobile hospitals", "Emergency communications", "Navy vessels"],
    immediateActions: ["Activate tsunami warning systems", "Deploy international aid", "Establish emergency command centers"],
    riskLevel: "Critical",
    stakeholders: ["UN Disaster Response", "Pacific Rim Emergency Services", "WHO", "International Red Cross"],
    confidence: 0.95
  },
  2: {
    urgency: 9,
    estimatedCasualties: "Severe - 2 million+ in evacuation zones",
    resourcesNeeded: ["Mass evacuation transport", "Emergency shelters", "Medical facilities", "Power generators"],
    immediateActions: ["Execute mass evacuation", "Activate FEMA response", "Deploy National Guard"],
    riskLevel: "Critical",
    stakeholders: ["FEMA", "National Guard", "Florida Emergency Management", "Coast Guard"],
    confidence: 0.92
  },
  3: {
    urgency: 8,
    estimatedCasualties: "Moderate - 10,000+ requiring relocation",
    resourcesNeeded: ["Environmental monitoring", "Evacuation support", "Scientific equipment", "Hazmat teams"],
    immediateActions: ["Monitor methane levels", "Establish exclusion zones", "Deploy research teams"],
    riskLevel: "High",
    stakeholders: ["Russian Emergency Ministry", "Climate Scientists", "UN Environment Programme", "Local Authorities"],
    confidence: 0.88
  },
  4: {
    urgency: 8,
    estimatedCasualties: "High - 20 million+ affected by extreme heat",
    resourcesNeeded: ["Cooling centers", "Medical supplies", "Water distribution", "Power grid support"],
    immediateActions: ["Open cooling shelters", "Distribute water", "Support vulnerable populations"],
    riskLevel: "High",
    stakeholders: ["EU Civil Protection", "National Health Services", "Red Cross", "Power Companies"],
    confidence: 0.91
  },
  5: {
    urgency: 9,
    estimatedCasualties: "Critical - 100,000+ at risk, multiple species threatened",
    resourcesNeeded: ["Firefighting aircraft", "Satellite monitoring", "Indigenous protection", "Medical support"],
    immediateActions: ["Coordinate international response", "Protect communities", "Create firebreaks"],
    riskLevel: "Critical",
    stakeholders: ["Amazon Protection Force", "Indigenous Groups", "UN Environmental Teams", "Multiple Nations"],
    confidence: 0.89
  },
  6: {
    urgency: 8,
    estimatedCasualties: "High - 500,000+ affected in urban areas",
    resourcesNeeded: ["AI systems experts", "Flood control equipment", "Emergency power systems", "Evacuation support"],
    immediateActions: ["Manual system override", "Flood mitigation", "Emergency communications"],
    riskLevel: "High",
    stakeholders: ["Smart City Authority", "Tech Emergency Teams", "Civil Defense", "AI Safety Board"],
    confidence: 0.87
  }
};

// Add mock insights summary for fallback
export const mockInsightsSummary = {
  executiveSummary: `CRISIS SITUATION REPORT - September 14, 2025

Multiple high-severity events are currently affecting various regions globally:

1. Pacific Ring Earthquake (Critical):
- 8.1 magnitude event with tsunami risks
- Multiple coastal populations threatened
- International response mobilizing

2. Hurricane Marcus (Critical):
- Category 5 hurricane approaching Florida
- 2 million+ in evacuation zones
- Storm surge up to 20 feet expected

3. Climate Emergencies:
- Arctic permafrost collapse releasing methane
- Mediterranean heat dome affecting 20M+
- Amazon mega-fire threatening ecosystems

4. Technology Crisis:
- AI system failure in Singapore affecting critical infrastructure
- Highlights emerging risks in smart city systems

RECOMMENDATIONS:
- Immediate international coordination required
- Climate crisis impacts intensifying globally
- Tech infrastructure vulnerabilities need addressing

Current global crisis index indicates an unprecedented level of simultaneous major events requiring coordinated international response.`,
  riskAssessment: {
    globalThreatLevel: "Severe",
    mostAffectedRegions: ["Pacific Rim", "North America", "Mediterranean", "Amazon Basin"],
    cascadingRisks: ["Food supply disruption", "Mass displacement", "Infrastructure collapse", "Environmental tipping points"],
    recommendedActions: [
      "Activate international emergency protocols",
      "Mobilize climate crisis response teams",
      "Review AI system dependencies",
      "Prepare for extended humanitarian operations"
    ]
  },
  trends: {
    increasingRisks: ["Climate-related disasters", "Technology system vulnerabilities", "Infrastructure failures"],
    emergingThreats: ["AI system cascading failures", "Methane release events", "Extreme weather intensification"],
    positiveIndicators: ["Improved international coordination", "Enhanced early warning systems", "Rapid response capabilities"]
  }
};