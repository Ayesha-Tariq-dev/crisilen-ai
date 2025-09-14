// src/services/redditService.js
export class RedditService {
  constructor() {
    this.BASE_URL = 'https://oauth.reddit.com';
    this.subreddits = [
      'worldnews', 'news', 'disasters', 'EmergencyManagement',
      'india', 'TropicalWeather', 'earthquake', 'floods'
    ];
    this.searchTerms = [
      'earthquake', 'flood', 'wildfire', 'hurricane', 'tsunami',
      'emergency', 'disaster', 'evacuation', 'rescue'
    ];
    this.clientId = process.env.REACT_APP_REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REACT_APP_REDDIT_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async fetchCrisisDiscussions() {
    try {
      console.log('🔍 Fetching crisis discussions from Reddit...');
      const allPosts = [];

      for (const subreddit of this.subreddits.slice(0, 4)) { // Limit to prevent rate limits
        try {
          const subredditPosts = await this.fetchFromSubreddit(subreddit);
          allPosts.push(...subredditPosts);
        } catch (error) {
          console.warn(`⚠️ Error fetching from r/${subreddit}:`, error.message);
          // Continue with other subreddits
        }
      }

      if (allPosts.length === 0) {
        console.log('🎭 No Reddit data fetched, using mock data');
        return this.getMockRedditData();
      }

      console.log(`✅ Fetched ${allPosts.length} Reddit posts`);
      return allPosts;

    } catch (error) {
      console.error('❌ Error fetching Reddit data:', error);
      console.log('🎭 Falling back to mock Reddit data');
      return this.getMockRedditData();
    }
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ Reddit API credentials not found, using mock data');
      throw new Error('Reddit API credentials not configured');
    }

    try {
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CrisisLens-AI/1.0'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting Reddit access token:', error);
      throw error;
    }
  }

  async fetchFromSubreddit(subreddit) {
    try {
      const token = await this.getAccessToken();
      const searchQuery = this.searchTerms.slice(0, 3).join('+OR+');
      const url = `${this.BASE_URL}/r/${subreddit}/search.json?q=${searchQuery}&sort=new&limit=8&t=week&restrict_sr=1`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'CrisisLens-AI/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.data.children) {
        console.warn(`No data found in r/${subreddit}`);
        return [];
      }

      return data.data.children
        .map((post, index) => this.processRedditPost(post.data, subreddit, index))
        .filter(post => post && this.isCrisisRelated(post.text));

    } catch (error) {
      console.warn(`Failed to fetch from r/${subreddit}:`, error.message);
      return [];
    }
  }

  processRedditPost(postData, subreddit, index) {
    try {
      if (!postData || !postData.title) {
        return null;
      }

      const text = this.combinePostText(postData);
      const timestamp = new Date(postData.created_utc * 1000).toISOString();

      return {
        id: `reddit_${subreddit}_${postData.id || index}`,
        text: text,
        source: `r/${subreddit}`,
        timestamp: timestamp,
        location: this.extractLocation(text),
        type: this.detectCrisisType(text),
        verified: false, // Reddit posts are generally unverified
        url: postData.permalink ? `https://reddit.com${postData.permalink}` : '#',
        score: postData.score || 0,
        comments: postData.num_comments || 0,
        author: postData.author || 'unknown',
        subreddit: subreddit,
        originalTitle: postData.title
      };
    } catch (error) {
      console.warn('Error processing Reddit post:', error);
      return null;
    }
  }

  combinePostText(postData) {
    let text = postData.title || '';

    if (postData.selftext && postData.selftext.length > 0 && postData.selftext !== '[removed]') {
      // Limit selftext to prevent overly long posts
      const selftext = postData.selftext.substring(0, 300);
      text += '. ' + selftext;
    }

    // Clean up the text
    text = text.replace(/\[.*?\]/g, ''); // Remove markdown links
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold formatting
    text = text.replace(/\s+/g, ' ').trim(); // Normalize whitespace
    text = text.replace(/\.{2,}/g, '.'); // Fix multiple dots

    return text;
  }

  isCrisisRelated(text) {
    const crisisKeywords = [
      'earthquake', 'flood', 'hurricane', 'wildfire', 'tsunami', 'cyclone',
      'disaster', 'emergency', 'evacuation', 'rescue', 'casualties',
      'landslide', 'tornado', 'volcanic', 'collapsed', 'damage',
      'alert', 'warning', 'crisis', 'affected', 'storm'
    ];

    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
  }

  extractLocation(text) {
    // Location extraction patterns similar to NewsService
    const locationPatterns = [
      // Country, State/Province
      /(?:in|at|near|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)/gi,
      // Just locations
      /(?:in|at|near|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      // Locations that are hit/affected
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:hit|struck|affected|earthquake|flood)/g
    ];

    for (const pattern of locationPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        return match[2] ? `${match[1]}, ${match[2]}` : match[1];
      }
    }

    // Fallback to common locations mentioned in crisis contexts
    const commonCrisisLocations = [
      'California', 'Florida', 'Texas', 'Japan', 'Philippines', 'Indonesia',
      'Turkey', 'India', 'China', 'Bangladesh', 'Pakistan', 'Iran',
      'Italy', 'Greece', 'Australia', 'Chile', 'Mexico', 'Nepal'
    ];

    const lowerText = text.toLowerCase();
    for (const location of commonCrisisLocations) {
      if (lowerText.includes(location.toLowerCase())) {
        return location;
      }
    }

    return 'Location Unknown';
  }

  detectCrisisType(text) {
    const typeMap = {
      earthquake: ['earthquake', 'quake', 'seismic', 'tremor', 'richter'],
      flood: ['flood', 'flooding', 'deluge', 'overflow', 'waterlog', 'inundation'],
      wildfire: ['wildfire', 'fire', 'blaze', 'burning', 'forest fire', 'bushfire'],
      hurricane: ['hurricane', 'typhoon', 'tropical storm'],
      cyclone: ['cyclone', 'super cyclone', 'tropical cyclone'],
      tornado: ['tornado', 'twister', 'funnel cloud'],
      tsunami: ['tsunami', 'tidal wave'],
      landslide: ['landslide', 'mudslide', 'rockslide'],
      volcano: ['volcano', 'volcanic', 'eruption', 'lava'],
      structural_collapse: ['collapse', 'collapsed', 'building fall', 'structure fail'],
      storm: ['storm', 'thunderstorm', 'hail', 'severe weather']
    };

    const lowerText = text.toLowerCase();

    for (const [type, keywords] of Object.entries(typeMap)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return type;
      }
    }

    // Check for general emergency terms
    const emergencyTerms = ['emergency', 'disaster', 'crisis', 'rescue', 'evacuation'];
    if (emergencyTerms.some(term => lowerText.includes(term))) {
      return 'other';
    }

    return 'other';
  }

  getMockRedditData() {
    return [
      {
        id: `reddit_mock_1`,
        text: "Major earthquake just hit Turkey-Syria border region. Feeling strong tremors here in Gaziantep. Buildings shaking, people running outside. Anyone else feeling this?",
        source: "r/Turkey",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        location: "Turkey-Syria Border",
        type: "earthquake",
        verified: false,
        url: "#",
        score: 1247,
        comments: 89,
        subreddit: "Turkey",
        originalTitle: "Earthquake in Gaziantep region - anyone else feel it?"
      },
      {
        id: `reddit_mock_2`,
        text: "Live thread: Massive flooding in Kerala, India. Rivers overflowing, many villages cut off. Rescue operations ongoing. Please share any information about affected areas.",
        source: "r/india",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        location: "Kerala, India",
        type: "flood",
        verified: false,
        url: "#",
        score: 892,
        comments: 156,
        subreddit: "india",
        originalTitle: "[LIVE] Kerala floods 2024 - Rescue operations thread"
      },
      {
        id: `reddit_mock_3`,
        text: "California wildfire update: Fire has spread to 12,000 acres overnight. My neighborhood got evacuation notice. Air quality extremely poor. Stay safe everyone.",
        source: "r/California",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        location: "California, USA",
        type: "wildfire",
        verified: false,
        url: "#",
        score: 634,
        comments: 73,
        subreddit: "California",
        originalTitle: "Wildfire evacuation notice - Northern California"
      },
      {
        id: `reddit_mock_4`,
        text: "Breaking: Super Typhoon approaching Philippines with 280 km/h winds. Category 5 storm. Government issuing mass evacuation orders for coastal provinces.",
        source: "r/Philippines",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
        location: "Philippines",
        type: "cyclone",
        verified: false,
        url: "#",
        score: 1834,
        comments: 203,
        subreddit: "Philippines",
        originalTitle: "Super Typhoon heading towards Luzon - Evacuation updates"
      },
      {
        id: `reddit_mock_5`,
        text: "Building collapsed in Mumbai construction site. Workers trapped inside. Emergency services on scene. This is the third incident this month in the city.",
        source: "r/mumbai",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        location: "Mumbai, India",
        type: "structural_collapse",
        verified: false,
        url: "#",
        score: 445,
        comments: 67,
        subreddit: "mumbai",
        originalTitle: "Another building collapse in Mumbai - Safety concerns"
      }
    ];
  }

  // Utility method to get trending crisis topics
  getTrendingTopics() {
    return [
      { topic: 'Turkey Earthquake', count: 1247, trend: 'rising' },
      { topic: 'Kerala Floods', count: 892, trend: 'stable' },
      { topic: 'California Wildfire', count: 634, trend: 'rising' },
      { topic: 'Philippines Typhoon', count: 1834, trend: 'rising' },
      { topic: 'Mumbai Building Safety', count: 445, trend: 'stable' }
    ];
  }
}