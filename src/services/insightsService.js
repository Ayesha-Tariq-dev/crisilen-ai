// src/services/insightsService.js

export class InsightsService {
  analyzeTrends(analyzedData) {
    const hourGroups = {};
    const now = new Date();
    
    analyzedData.forEach(event => {
      const eventDate = new Date(event.timestamp);
      const hoursDiff = Math.floor((now - eventDate) / (1000 * 60 * 60));
      
      if (!hourGroups[hoursDiff]) {
        hourGroups[hoursDiff] = [];
      }
      hourGroups[hoursDiff].push(event);
    });

    const hourKeys = Object.keys(hourGroups).sort((a, b) => a - b);
    const urgencyTrend = hourKeys.map(hour => {
      const events = hourGroups[hour];
      const avgUrgency = events.reduce((acc, e) => acc + (e.analysis?.urgency || 0), 0) / events.length;
      return { hour, avgUrgency };
    });

    const overall = this.calculateTrendDirection(urgencyTrend);
    
    return {
      overall,
      hourlyData: urgencyTrend,
      byType: this.calculateTypeBasedTrends(analyzedData)
    };
  }

  calculateTrendDirection(trendData) {
    if (trendData.length < 2) return 'stable';
    
    const recentValues = trendData.slice(-3);
    const firstVal = recentValues[0]?.avgUrgency || 0;
    const lastVal = recentValues[recentValues.length - 1]?.avgUrgency || 0;
    const diff = lastVal - firstVal;
    
    if (diff > 0.5) return 'increasing';
    if (diff < -0.5) return 'decreasing';
    return 'stable';
  }

  calculateTypeBasedTrends(analyzedData) {
    const typeGroups = {};
    
    analyzedData.forEach(event => {
      if (!typeGroups[event.type]) {
        typeGroups[event.type] = [];
      }
      typeGroups[event.type].push(event);
    });

    const trends = {};
    for (const [type, events] of Object.entries(typeGroups)) {
      const sortedEvents = events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const urgencies = sortedEvents.map(e => e.analysis?.urgency || 0);
      
      trends[type] = {
        count: events.length,
        avgUrgency: urgencies.reduce((a, b) => a + b, 0) / urgencies.length,
        trend: this.calculateTrendDirection([
          { avgUrgency: urgencies[0] },
          { avgUrgency: urgencies[urgencies.length - 1] }
        ])
      };
    }
    
    return trends;
  }

  generateRecommendations(analyzedData) {
    const recommendations = [];
    const criticalEvents = analyzedData.filter(e => e.analysis?.urgency >= 8);
    const highRiskLocations = this.identifyHighRiskLocations(analyzedData);
    
    // Resource deployment recommendations
    if (criticalEvents.length > 0) {
      recommendations.push(
        `Immediate deployment of emergency resources to ${criticalEvents[0].location}`
      );
    }

    // Multi-location coordination
    if (highRiskLocations.length > 1) {
      recommendations.push(
        `Coordinate response efforts across ${highRiskLocations.length} high-risk areas`
      );
    }

    // Resource allocation
    const resourceNeeds = this.aggregateResourceNeeds(analyzedData);
    if (resourceNeeds.length > 0) {
      recommendations.push(
        `Prioritize distribution of ${resourceNeeds.slice(0, 3).join(', ')}`
      );
    }

    // Communication strategy
    const communicationRec = this.generateCommunicationRecommendation(analyzedData);
    if (communicationRec) {
      recommendations.push(communicationRec);
    }

    return recommendations;
  }

  identifyHighRiskLocations(analyzedData) {
    const locationRisks = {};
    
    analyzedData.forEach(event => {
      if (!locationRisks[event.location]) {
        locationRisks[event.location] = {
          riskScore: 0,
          eventCount: 0
        };
      }
      
      locationRisks[event.location].riskScore += event.analysis?.urgency || 0;
      locationRisks[event.location].eventCount += 1;
    });

    return Object.entries(locationRisks)
      .map(([location, data]) => ({
        location,
        averageRisk: data.riskScore / data.eventCount,
        eventCount: data.eventCount
      }))
      .filter(loc => loc.averageRisk >= 7)
      .sort((a, b) => b.averageRisk - a.averageRisk)
      .map(loc => loc.location);
  }

  aggregateResourceNeeds(analyzedData) {
    const resourceCounts = {};
    
    analyzedData.forEach(event => {
      if (event.analysis?.resourcesNeeded) {
        event.analysis.resourcesNeeded.forEach(resource => {
          resourceCounts[resource] = (resourceCounts[resource] || 0) + 1;
        });
      }
    });

    return Object.entries(resourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([resource]) => resource);
  }

  generateCommunicationRecommendation(analyzedData) {
    const criticalEventCount = analyzedData.filter(e => e.analysis?.urgency >= 8).length;
    const uniqueLocations = new Set(analyzedData.map(e => e.location)).size;
    
    if (criticalEventCount >= 3) {
      return 'Establish emergency communication command center for coordinated response';
    } else if (uniqueLocations >= 5) {
      return 'Implement multi-region communication strategy with local coordinators';
    } else if (criticalEventCount > 0) {
      return 'Maintain regular situation updates through all available channels';
    }
    return null;
  }

  calculateMetrics(analyzedData) {
    const urgencyValues = analyzedData
      .filter(d => d.analysis?.urgency && typeof d.analysis.urgency === 'number')
      .map(d => d.analysis.urgency);
      
    const averageUrgency = urgencyValues.length > 0 
      ? (urgencyValues.reduce((a, b) => a + b, 0) / urgencyValues.length).toFixed(1)
      : 0;

    // Count by crisis type
    const typeCounts = analyzedData.reduce((acc, crisis) => {
      const type = crisis.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Count by location
    const locationCounts = analyzedData.reduce((acc, crisis) => {
      const location = crisis.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    // Count by source
    const sourceCounts = analyzedData.reduce((acc, crisis) => {
      const source = crisis.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return {
      averageUrgency: parseFloat(averageUrgency),
      totalEvents: analyzedData.length,
      typeCounts,
      locationCounts,
      sourceCounts
    };
  }

  getDefaultInsights() {
    return {
      executiveSummary: "No crisis events currently detected. Monitoring systems active.",
      metrics: {
        totalEvents: 0,
        averageUrgency: 0,
        typeCounts: {},
        locationCounts: {},
        sourceCounts: {}
      },
      recommendations: [
        "Maintain standard monitoring protocols",
        "Review emergency response readiness",
        "Conduct routine system checks"
      ],
      trends: {
        overall: "stable",
        hourlyData: [],
        byType: {}
      }
    };
  }
}
