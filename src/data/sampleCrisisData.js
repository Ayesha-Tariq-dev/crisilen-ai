// src/data/sampleCrisisData.js
export const sampleCrisisData = [
  {
    id: 1,
    text: "Major 7.2 magnitude earthquake strikes Turkey-Syria border. Buildings collapsed in Ankara and Gaziantep. Rescue teams deployed immediately. Death toll rising rapidly.",
    source: "Emergency Alert System",
    timestamp: "2024-12-14T10:30:00Z",
    location: "Turkey-Syria Border",
    type: "earthquake",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 36.7783, lng: 37.0017 }
  },
  {
    id: 2,
    text: "Severe flooding in Kerala after unprecedented monsoon rains. Water levels rising in Kochi and Thiruvananthapuram. Roads completely blocked, rescue operations underway in coastal areas.",
    source: "Indian Meteorological Department",
    timestamp: "2024-12-14T11:45:00Z",
    location: "Kerala, India", 
    type: "flood",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 10.8505, lng: 76.2711 }
  },
  {
    id: 3,
    text: "Wildfire spreading rapidly across 15,000 hectares in California mountains. Evacuation orders issued for 3 communities. Strong winds hampering firefighting efforts.",
    source: "CAL FIRE",
    timestamp: "2024-12-14T12:15:00Z",
    location: "California, USA",
    type: "wildfire",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: 4,
    text: "Cyclone Remal intensifies to Category 4. Storm surge warning issued for Bangladesh and West Bengal coast. Fishing boats advised to return immediately.",
    source: "Bangladesh Weather Service",
    timestamp: "2024-12-14T13:20:00Z",
    location: "Bay of Bengal",
    type: "cyclone",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 21.0, lng: 89.0 }
  },
  {
    id: 5,
    text: "Building collapse in Mumbai construction site. Multiple workers trapped under debris. Emergency services and NDRF teams on scene. Traffic diverted from area.",
    source: "Mumbai Fire Brigade",
    timestamp: "2024-12-14T14:30:00Z",
    location: "Mumbai, India",
    type: "structural_collapse",
    verified: false,
    imageUrl: null,
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 6,
    text: "Flash floods reported in Uttarakhand after cloud burst near Kedarnath. Pilgrimage route blocked. Helicopter rescue operations initiated for stranded tourists.",
    source: "Uttarakhand Disaster Management",
    timestamp: "2024-12-14T15:10:00Z",
    location: "Uttarakhand, India",
    type: "flood",
    verified: true,
    imageUrl: null,
    coordinates: { lat: 30.7333, lng: 79.0667 }
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
    estimatedCasualties: "High - Potentially 1000+ affected",
    resourcesNeeded: ["Search and rescue teams", "Medical supplies", "Temporary shelter", "Heavy machinery"],
    immediateActions: ["Deploy emergency response teams", "Establish field hospitals", "Coordinate international aid"],
    riskLevel: "Critical",
    stakeholders: ["Turkish Emergency Management", "Syrian Civil Defence", "UN OCHA", "International Red Cross"],
    confidence: 0.92
  },
  2: {
    urgency: 8,
    estimatedCasualties: "Moderate - 500+ evacuations needed",
    resourcesNeeded: ["Boats and rescue equipment", "Emergency shelters", "Clean water supplies", "Medical teams"],
    immediateActions: ["Continue evacuation operations", "Set up relief camps", "Monitor water levels"],
    riskLevel: "High", 
    stakeholders: ["Kerala State Disaster Management", "Indian Coast Guard", "NDRF", "Local Administration"],
    confidence: 0.87
  },
  3: {
    urgency: 8,
    estimatedCasualties: "Low to moderate - 2000+ evacuated",
    resourcesNeeded: ["Firefighting aircraft", "Ground crews", "Evacuation support", "Air quality monitoring"],
    immediateActions: ["Contain fire spread", "Complete evacuations", "Establish firebreaks"],
    riskLevel: "High",
    stakeholders: ["CAL FIRE", "National Guard", "Local Sheriffs", "Forest Service"],
    confidence: 0.89
  },
  4: {
    urgency: 9,
    estimatedCasualties: "Potentially very high - coastal populations at risk",
    resourcesNeeded: ["Storm shelters", "Rescue boats", "Emergency supplies", "Communication equipment"],
    immediateActions: ["Mass evacuation of coastal areas", "Secure critical infrastructure", "Prepare relief operations"],
    riskLevel: "Critical",
    stakeholders: ["Bangladesh Disaster Management", "Indian Meteorological Dept", "Bay of Bengal Initiative"],
    confidence: 0.94
  },
  5: {
    urgency: 7,
    estimatedCasualties: "Moderate - 15-20 workers potentially trapped",
    resourcesNeeded: ["Heavy rescue equipment", "Medical teams", "Structural engineers", "Cranes"],
    immediateActions: ["Search and rescue operations", "Structural assessment", "Traffic management"],
    riskLevel: "High",
    stakeholders: ["Mumbai Fire Brigade", "NDRF", "Municipal Corporation", "Construction Company"],
    confidence: 0.78
  },
  6: {
    urgency: 8,
    estimatedCasualties: "Moderate - 200+ pilgrims stranded",
    resourcesNeeded: ["Helicopters", "Mountain rescue teams", "Medical supplies", "Communication equipment"],
    immediateActions: ["Helicopter rescue missions", "Establish communication links", "Medical assistance"],
    riskLevel: "High",
    stakeholders: ["Uttarakhand Disaster Management", "Indian Air Force", "ITBP", "Local Administration"],
    confidence: 0.85
  }
};