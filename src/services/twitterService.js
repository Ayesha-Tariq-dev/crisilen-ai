// src/services/twitterService.js
import { BaseService } from './baseService.js';

export class TwitterService extends BaseService {
  constructor() {
    super();
    this.apiKey = process.env.REACT_APP_TWITTER_API_KEY;
    this.apiSecret = process.env.REACT_APP_TWITTER_API_SECRET;
    this.bearerToken = process.env.REACT_APP_TWITTER_BEARER_TOKEN;
    this.baseUrl = 'https://api.twitter.com/2';
    this.searchEndpoint = '/tweets/search/recent';

    this.crisisKeywords = [
      'emergency', 'disaster', 'crisis', 'evacuation',
      'earthquake', 'flood', 'wildfire', 'hurricane',
      'tsunami', 'rescue', 'trapped', 'damage'
    ];
  }

  async fetchCrisisTweets() {
    if (!this.bearerToken) {
      console.warn('⚠️ Twitter bearer token not found, using mock data');
      return this.getMockTwitterData();
    }

    try {
      console.log('🐦 Fetching crisis-related tweets...');

      // Construct search query
      const query = this.crisisKeywords.slice(0, 5).join(' OR ');
      const url = `${this.baseUrl}${this.searchEndpoint}?query=${encodeURIComponent(query)}&tweet.fields=created_at,geo,lang&expansions=author_id&user.fields=verified&max_results=100`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      await this.validateResponse(response, 'Twitter API');

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        throw new Error('No tweets found');
      }

      console.log(`📥 Retrieved ${data.data.length} tweets`);

      // Process tweets
      const processedTweets = this.processTweets(data.data, data.includes?.users);
      const crisisRelevantTweets = this.filterCrisisRelevant(processedTweets);

      console.log(`✅ Processed ${crisisRelevantTweets.length} crisis-relevant tweets`);
      return crisisRelevantTweets;

    } catch (error) {
      console.error('❌ Error fetching Twitter data:', error);
      return this.getMockTwitterData();
    }
  }

  processTweets(tweets, users = []) {
    const userMap = new Map(users.map(user => [user.id, user]));

    return tweets.map(tweet => {
      const user = userMap.get(tweet.author_id);
      const text = this.sanitizeText(tweet.text);

      return {
        id: this.generateEventId('twitter', this.detectCrisisType(text), tweet.created_at),
        text: text,
        source: 'Twitter',
        timestamp: tweet.created_at,
        location: this.extractLocation(text),
        type: this.detectCrisisType(text),
        verified: user?.verified || false,
        url: `https://twitter.com/i/web/status/${tweet.id}`,
        coordinates: tweet.geo?.coordinates,
        language: tweet.lang,
        authorInfo: {
          id: tweet.author_id,
          verified: user?.verified || false
        }
      };
    });
  }

  filterCrisisRelevant(tweets) {
    return tweets.filter(tweet => {
      const urgencyScore = this.calculateUrgencyScore(tweet.text, tweet.type);
      if (urgencyScore < 4) return false;

      tweet.urgencyScore = urgencyScore;
      return true;
    });
  }

  getMockTwitterData() {
    const mockTweets = [
      {
        id: this.generateEventId('twitter', 'earthquake', new Date()),
        text: "BREAKING: Major 7.1 earthquake hits central Turkey. Buildings collapsed in Ankara. People trapped under rubble. Emergency services responding. #TurkeyEarthquake",
        source: "Twitter",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: "Ankara, Turkey",
        type: "earthquake",
        verified: true,
        url: "#",
        coordinates: { lat: 39.9334, lng: 32.8597 },
        urgencyScore: 9
      },
      {
        id: this.generateEventId('twitter', 'flood', new Date()),
        text: "Severe flooding in Mumbai after record rainfall. Multiple areas submerged. Need immediate evacuation support in Dharavi area. @MumbaiPolice @DisasterMgmtMum",
        source: "Twitter",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        location: "Mumbai, India",
        type: "flood",
        verified: true,
        url: "#",
        coordinates: { lat: 19.0760, lng: 72.8777 },
        urgencyScore: 8
      },
      {
        id: this.generateEventId('twitter', 'wildfire', new Date()),
        text: "Wildfire approaching residential areas in Northern California. Mandatory evacuation orders issued for Paradise and surrounding communities. High winds making containment difficult.",
        source: "Twitter",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        location: "Paradise, California",
        type: "wildfire",
        verified: true,
        url: "#",
        coordinates: { lat: 39.7596, lng: -121.6219 },
        urgencyScore: 8
      }
    ];

    console.log('🎭 Using mock Twitter data:', mockTweets.length, 'tweets');
    return mockTweets;
  }
}
