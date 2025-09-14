// src/services/newsService.js
export class NewsService {
  constructor() {
    this.NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
    this.BASE_URL = process.env.REACT_APP_NEWS_API_BASE_URL || 'https://newsapi.org/v2';
    this.crisisKeywords = [
      'earthquake', 'flood', 'hurricane', 'wildfire', 'tsunami',
      'cyclone', 'disaster', 'emergency', 'evacuation', 'rescue',
      'landslide', 'tornado', 'storm', 'crisis', 'calamity'
    ];
    this.sources = [
      'bbc-news', 'reuters', 'associated-press', 'cnn', 'al-jazeera-english',
      'the-times-of-india', 'abc-news', 'nbc-news'
    ];
  }

  async fetchCrisisNews() {
    const timeout = parseInt(process.env.REACT_APP_API_TIMEOUT) || 8000;
    const retryAttempts = parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS) || 3;

    if (!this.NEWS_API_KEY) {
      console.warn('⚠️ News API key not found, using sample data');
      return this.getMockNewsData();
    }

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`📰 Fetching crisis news from News API (attempt ${attempt})...`);

        // Primary search with crisis keywords
        const keywords = this.crisisKeywords.slice(0, 5).join(' OR ');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const url = new URL(`${this.BASE_URL}/everything`);
        url.searchParams.append('q', keywords);
        url.searchParams.append('sortBy', 'publishedAt');
        url.searchParams.append('pageSize', '15');
        url.searchParams.append('language', 'en');
        url.searchParams.append('apiKey', this.NEWS_API_KEY);

        const response = await fetch(url, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.articles) {
          throw new Error('Invalid API response format');
        }

        const articles = this.processNewsArticles(data.articles);
        const crisisArticles = this.filterCrisisArticles(articles);

        console.log(`📊 Found ${crisisArticles.length} relevant crisis articles`);
        return crisisArticles;

      } catch (error) {
        const isLastAttempt = attempt === retryAttempts;
        const retryableError =
          error.name === 'AbortError' ||
          (error.message && (
            error.message.includes('429') ||
            error.message.includes('500')
          ));

        if (isLastAttempt || !retryableError) {
          console.error('❌ Failed to fetch news data:', error);
          return this.getMockNewsData();
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  processNewsArticles(articles) {
    return articles
      .filter(article => article && article.title && article.description)
      .map((article, index) => ({
        id: `news_${Date.now()}_${index}`,
        text: this.combineArticleText(article),
        source: article.source?.name || 'Unknown Source',
        timestamp: article.publishedAt || new Date().toISOString(),
        location: this.extractLocation(article.title + ' ' + (article.description || '')),
        type: this.detectCrisisType(article.title + ' ' + (article.description || '')),
        verified: true,
        url: article.url,
        imageUrl: article.urlToImage,
        author: article.author,
        originalTitle: article.title,
        originalDescription: article.description
      }))
      .filter(article => article.type !== 'unknown');
  }

  combineArticleText(article) {
    let text = article.title || '';
    if (article.description) {
      text += '. ' + article.description;
    }
    text = text.replace(/\[.*?\]/g, ''); // Remove source citations
    text = text.replace(/\s+/g, ' ').trim(); // Normalize whitespace
    return text;
  }

  filterCrisisArticles(articles) {
    return articles
      .filter(article => {
        const text = (article.text || '').toLowerCase();
        const crisisScore = this.calculateCrisisScore(text);
        return crisisScore > 0.3; // Only include articles with decent crisis relevance
      })
      .sort((a, b) => b.crisisScore - a.crisisScore);
  }

  calculateCrisisScore(text) {
    const textLower = text.toLowerCase();
    let score = 0;

    // High impact keywords
    const highImpactKeywords = ['death', 'deaths', 'killed', 'destroyed', 'devastating', 'emergency', 'catastrophic'];
    highImpactKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) score += 0.3;
    });

    // Medium impact keywords
    const mediumImpactKeywords = ['injured', 'damage', 'evacuation', 'warning', 'threat'];
    mediumImpactKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) score += 0.2;
    });

    // Crisis type keywords
    this.crisisKeywords.forEach(keyword => {
      if (textLower.includes(keyword.toLowerCase())) score += 0.15;
    });

    return Math.min(score, 1);
  }

  extractLocation(text) {
    const locationPatterns = [
      /(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)/gi,
      /(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:state|province)/gi,
      /(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:hit|struck|affected|damaged)/g
    ];

    for (const pattern of locationPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        return match[2] ? `${match[1]}, ${match[2]}` : match[1];
      }
    }

    const commonLocations = [
      'India', 'China', 'United States', 'Japan', 'Indonesia', 'Philippines',
      'Turkey', 'Iran', 'Pakistan', 'Bangladesh', 'Myanmar', 'Thailand',
      'California', 'Florida', 'Texas', 'New York', 'Kerala', 'Mumbai',
      'Delhi', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad'
    ];

    for (const location of commonLocations) {
      if (text.toLowerCase().includes(location.toLowerCase())) {
        return location;
      }
    }

    return 'Location Unknown';
  }

  detectCrisisType(text) {
    const typeMap = {
      earthquake: ['earthquake', 'seismic', 'tremor', 'quake', 'tectonic'],
      flood: ['flood', 'flooding', 'deluge', 'inundation', 'waterlog', 'overflow'],
      wildfire: ['wildfire', 'forest fire', 'bushfire', 'fire', 'blaze', 'burning'],
      hurricane: ['hurricane', 'typhoon', 'tropical storm', 'cyclonic storm'],
      cyclone: ['cyclone', 'tropical cyclone', 'super cyclone'],
      tornado: ['tornado', 'twister', 'whirlwind'],
      tsunami: ['tsunami', 'tidal wave', 'seismic sea wave'],
      landslide: ['landslide', 'mudslide', 'rockslide', 'slope failure'],
      volcano: ['volcano', 'volcanic', 'eruption', 'lava', 'ash cloud'],
      storm: ['storm', 'thunderstorm', 'hailstorm', 'severe weather'],
      drought: ['drought', 'water crisis', 'dry spell', 'water shortage'],
      structural_collapse: ['building collapse', 'structure collapse', 'collapsed', 'building fall']
    };

    const lowerText = text.toLowerCase();

    for (const [type, keywords] of Object.entries(typeMap)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return type;
      }
    }

    const emergencyTerms = ['emergency', 'disaster', 'crisis', 'calamity', 'catastrophe'];
    if (emergencyTerms.some(term => lowerText.includes(term))) {
      return 'general_emergency';
    }

    return 'unknown';
  }

  getMockNewsData() {
    return [];
  }
}