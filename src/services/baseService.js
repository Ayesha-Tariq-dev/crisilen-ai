// src/services/baseService.js
export class BaseService {
  constructor() {
    this.ENABLE_REAL_APIs = process.env.REACT_APP_ENABLE_REAL_APIs === 'true';
  }

  // Shared utility methods
  extractLocation(text) {
    const locationPatterns = [
      // City, Country/State
      /(?:in|at|near|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)/gi,
      // General location
      /(?:in|at|near|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      // Location affected patterns
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:hit|struck|affected|damaged)/g
    ];

    for (const pattern of locationPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        return match[2] ? `${match[1]}, ${match[2]}` : match[1];
      }
    }

    return this.checkCommonLocations(text);
  }

  checkCommonLocations(text) {
    const commonLocations = [
      'California', 'Florida', 'Texas', 'New York',
      'Tokyo', 'London', 'Paris', 'Sydney',
      'Mumbai', 'Delhi', 'Beijing', 'Shanghai',
      'Istanbul', 'Cairo', 'Mexico City', 'São Paulo',
      'Manila', 'Jakarta', 'Bangkok', 'Seoul'
    ];

    const lowerText = text.toLowerCase();
    for (const location of commonLocations) {
      if (lowerText.includes(location.toLowerCase())) {
        return location;
      }
    }

    return 'Location Unknown';
  }

  detectCrisisType(text) {
    const typePatterns = {
      earthquake: {
        keywords: ['earthquake', 'quake', 'seismic', 'tremor', 'richter'],
        severity: 'critical'
      },
      flood: {
        keywords: ['flood', 'flooding', 'deluge', 'inundation', 'overflow'],
        severity: 'high'
      },
      wildfire: {
        keywords: ['wildfire', 'fire', 'blaze', 'burning', 'flames'],
        severity: 'high'
      },
      hurricane: {
        keywords: ['hurricane', 'typhoon', 'cyclone', 'storm'],
        severity: 'critical'
      },
      tsunami: {
        keywords: ['tsunami', 'tidal wave', 'sea surge'],
        severity: 'critical'
      },
      tornado: {
        keywords: ['tornado', 'twister', 'funnel cloud'],
        severity: 'high'
      },
      landslide: {
        keywords: ['landslide', 'mudslide', 'rockslide', 'avalanche'],
        severity: 'high'
      },
      volcanic: {
        keywords: ['volcano', 'volcanic', 'eruption', 'lava'],
        severity: 'critical'
      },
      structural: {
        keywords: ['building collapse', 'structure', 'infrastructure failure'],
        severity: 'high'
      },
      other: {
        keywords: ['emergency', 'disaster', 'crisis', 'catastrophe'],
        severity: 'medium'
      }
    };

    const lowerText = text.toLowerCase();

    for (const [type, pattern] of Object.entries(typePatterns)) {
      if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
        return {
          type,
          severity: pattern.severity
        };
      }
    }

    return {
      type: 'other',
      severity: 'medium'
    };
  }

  isCrisisRelated(text) {
    const crisisIndicators = [
      // Emergency terms
      ['emergency', 'crisis', 'disaster', 'catastrophe'],
      // Natural disasters
      ['earthquake', 'flood', 'hurricane', 'wildfire', 'tsunami'],
      // Impact terms
      ['casualties', 'injured', 'trapped', 'missing', 'dead'],
      // Response terms
      ['evacuation', 'rescue', 'emergency services', 'relief'],
      // Infrastructure
      ['collapsed', 'damaged', 'destroyed', 'blocked'],
      // Scale indicators
      ['massive', 'severe', 'devastating', 'critical']
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    crisisIndicators.forEach(category => {
      if (category.some(term => lowerText.includes(term))) {
        score += 1;
      }
    });

    return score >= 2; // Require at least two different categories of indicators
  }

  async retryWithBackoff(fn, retries = 3, baseDelay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  generateUniqueId(prefix, data = {}) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  cleanText(text) {
    return text
      .replace(/\[.*?\]/g, '') // Remove square brackets content
      .replace(/\{.*?\}/g, '') // Remove curly braces content
      .replace(/\(.*?\)/g, '') // Remove parentheses content
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .replace(/[^\w\s.,!?-]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  calculateUrgency(text, type, metrics = {}) {
    let score = 0;
    const lowerText = text.toLowerCase();

    // Base urgency by crisis type
    const typeUrgency = {
      earthquake: 8,
      tsunami: 9,
      hurricane: 8,
      wildfire: 7,
      flood: 7,
      tornado: 8,
      landslide: 7,
      volcanic: 8,
      structural: 7,
      other: 5
    };

    score += typeUrgency[type] || 5;

    // Urgency indicators in text
    const urgentTerms = {
      critical: 3,
      immediate: 2,
      urgent: 2,
      emergency: 2,
      severe: 1,
      major: 1,
      massive: 1
    };

    Object.entries(urgentTerms).forEach(([term, value]) => {
      if (lowerText.includes(term)) score += value;
    });

    // Impact indicators
    const impactTerms = {
      casualties: 3,
      dead: 3,
      deaths: 3,
      trapped: 2,
      injured: 2,
      missing: 2,
      evacuate: 2,
      destroyed: 1,
      damaged: 1
    };

    Object.entries(impactTerms).forEach(([term, value]) => {
      if (lowerText.includes(term)) score += value;
    });

    // Consider social metrics if available
    if (metrics.shares) score += Math.min(2, metrics.shares / 1000);
    if (metrics.likes) score += Math.min(1, metrics.likes / 2000);

    // Normalize to 1-10 scale
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  async timeoutPromise(promise, timeoutMs = 5000) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    return Promise.race([promise, timeout]);
  }
}
