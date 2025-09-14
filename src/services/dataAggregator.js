import { NewsService } from './newsService';
import { RedditService } from './redditService';
import { OpenAIService } from './openaiService';
import { sampleCrisisData, mockAnalysisResults, mockInsightsSummary } from '../data/sampleCrisisData';

class DataAggregator {
  constructor() {
    this.newsService = new NewsService();
    this.redditService = new RedditService();
    this.openaiService = new OpenAIService();
    this.isProcessing = false;
    this.lastUpdate = null;
  }

  async aggregateAllCrisisData(useMockData = false) {
    this.isProcessing = true;
    const startTime = Date.now();

    try {
      if (useMockData) {
        console.log('📚 Using mock crisis data');
        // Apply mock analysis results to the sample data
        const enrichedData = sampleCrisisData.map(event => ({
          ...event,
          analysis: mockAnalysisResults[event.id]
        }));
        return {
          data: enrichedData,
          metadata: {
            lastUpdate: new Date().toISOString(),
            processingTimeMs: 500,
            sources: ['mock-data']
          },
          insights: mockInsightsSummary // Include mock insights when using fallback data
        };
      }

      console.log('🔍 Fetching crisis data from all sources...');
      const [newsData, redditData] = await Promise.all([
        this.timeoutPromise(this.newsService.fetchCrisisNews(), 8000, 'News API'),
        this.timeoutPromise(this.redditService.fetchCrisisDiscussions(), 6000, 'Reddit API')
      ]);

      let allData = [];

      if (newsData && newsData.length > 0) {
        const uniqueNews = this.deduplicateData(newsData);
        allData.push(...uniqueNews);
        console.log(`📰 Added ${uniqueNews.length} unique news articles`);
      }

      if (redditData && redditData.length > 0) {
        const uniqueReddit = this.deduplicateData(redditData);
        allData.push(...uniqueReddit);
        console.log(`🔍 Added ${uniqueReddit.length} unique Reddit posts`);
      }

      allData = this.removeCrossSourceDuplicates(allData);
      allData = this.prioritizeAndSortData(allData);

      const limitedData = allData.slice(0, 20);

      const processingTime = Date.now() - startTime;
      this.lastUpdate = new Date();

      return {
        data: limitedData,
        metadata: {
          lastUpdate: this.lastUpdate.toISOString(),
          processingTimeMs: processingTime,
          sources: ['news-api', 'reddit-api'],
          totalResults: allData.length,
          limitedResults: limitedData.length
        }
      };
    } catch (error) {
      console.error('❌ Error aggregating crisis data:', error);
      return {
        data: sampleCrisisData,
        metadata: {
          lastUpdate: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          sources: ['mock-data'],
          error: error.message
        }
      };
    } finally {
      this.isProcessing = false;
    }
  }

  async analyzeWithAI(data) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    try {
      console.log('🤖 Analyzing crisis data with AI...');
      const analyzedEvents = await Promise.all(
        data.map(async (event) => {
          try {
            const analysis = await this.openaiService.analyzeCrisis(
              event.text,
              event.location,
              event.type
            );
            return { ...event, analysis };
          } catch (error) {
            console.warn(`⚠️ Error analyzing event:`, error);
            return { ...event, analysis: this.generateBasicAnalysis(event) };
          }
        })
      );
      return analyzedEvents;
    } catch (error) {
      console.error('❌ Critical error in AI analysis:', error);
      return data.map(event => ({
        ...event,
        analysis: this.generateBasicAnalysis(event)
      }));
    }
  }

  generateBasicAnalysis(event) {
    const text = event.text.toLowerCase();
    const urgencyKeywords = ['emergency', 'critical', 'severe', 'casualties', 'death'];
    const urgencyScore = this.calculateUrgencyScore(text, urgencyKeywords);

    return {
      urgency: urgencyScore,
      estimatedCasualties: 'Unknown - Requires assessment',
      resourcesNeeded: [
        'Emergency Response Teams',
        'Medical Supplies',
        'Communication Equipment'
      ],
      immediateActions: [
        'Deploy assessment team',
        'Alert local authorities',
        'Set up crisis command center'
      ],
      riskLevel: urgencyScore >= 8 ? 'Critical' : urgencyScore >= 6 ? 'High' : 'Medium',
      stakeholders: ['Local Government', 'Emergency Services', 'Medical Teams'],
      confidence: 0.7
    };
  }

  calculateUrgencyScore(text, keywords) {
    const matches = keywords.filter(word => text.includes(word)).length;
    return Math.min(Math.round((matches / keywords.length) * 10) + 5, 10);
  }

  async timeoutPromise(promise, timeoutMs, sourceName) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${sourceName} timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    return Promise.race([promise, timeout]);
  }

  deduplicateData(dataArray) {
    const seen = new Set();
    return dataArray.filter(item => {
      const hash = this.simpleHash(item.text.toLowerCase().substring(0, 100));
      if (seen.has(hash)) return false;
      seen.add(hash);
      return true;
    });
  }

  removeCrossSourceDuplicates(allData) {
    const uniqueData = [];
    const textHashes = new Set();

    for (const item of allData) {
      const hash = this.simpleHash(item.text.toLowerCase().substring(0, 150));
      if (!textHashes.has(hash)) {
        textHashes.add(hash);
        uniqueData.push(item);
      }
    }

    return uniqueData;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  prioritizeAndSortData(dataArray) {
    return dataArray.sort((a, b) => {
      const aScore = this.calculatePriorityScore(a);
      const bScore = this.calculatePriorityScore(b);

      if (aScore !== bScore) {
        return bScore - aScore;
      }

      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });
  }

  calculatePriorityScore(item) {
    let score = 0;

    if (item.verified) score += 2;

    const criticalTypes = ['earthquake', 'tsunami', 'cyclone', 'nuclear'];
    if (criticalTypes.includes(item.type)) score += 3;

    const highImpactTypes = ['flood', 'wildfire', 'hurricane'];
    if (highImpactTypes.includes(item.type)) score += 2;

    const hoursOld = (Date.now() - new Date(item.timestamp || 0)) / (1000 * 60 * 60);
    if (hoursOld < 6) score += 2;
    else if (hoursOld < 24) score += 1;

    const reliableSources = ['Reuters', 'BBC News', 'Associated Press'];
    if (reliableSources.includes(item.source)) score += 1;

    return score;
  }

  async generateInsights(analyzedData) {
    try {
      console.log('🔍 Generating crisis insights...');

      // Group events by type
      const eventsByType = analyzedData.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || []).concat(event);
        return acc;
      }, {});

      // Calculate summary stats
      const totalEvents = analyzedData.length;
      const highUrgencyEvents = analyzedData.filter(e => e.analysis?.urgency >= 8).length;
      const avgUrgency = analyzedData.reduce((sum, e) => sum + (e.analysis?.urgency || 0), 0) / totalEvents;

      // Get list of affected locations
      const locations = [...new Set(analyzedData.map(e => e.location))];

      // Generate text summary
      const summary = `Crisis Situation Report
Total Events: ${totalEvents}
High Priority Events: ${highUrgencyEvents}
Average Urgency Level: ${avgUrgency.toFixed(1)}/10
Affected Locations: ${locations.join(', ')}

Event Distribution:
${Object.entries(eventsByType)
          .map(([type, events]) => `${type}: ${events.length} events`)
          .join('\n')}

Recommendations:
1. Prioritize response to high urgency events (${highUrgencyEvents} identified)
2. Focus resources on most affected areas
3. Monitor developing situations closely
4. Coordinate with local authorities in affected regions

Generated at: ${new Date().toISOString()}`;

      return summary;
    } catch (error) {
      console.error('❌ Error generating insights:', error);
      return 'Unable to generate insights at this time. Please check individual event details.';
    }
  }
}

const dataAggregator = new DataAggregator();
export { dataAggregator };