"# CrisisLens AI - Emergency Response Intelligence Platform

![CrisisLens AI Banner](./public/banner.png)

CrisisLens AI is an intelligent crisis monitoring platform that transforms unstructured disaster data into real-time actionable insights for emergency responders. It combines live API data with reliable preloaded datasets to ensure consistent performance during demonstrations and real-world scenarios.

## 🚀 Features

### Smart Data Ingestion
- Multi-source data monitoring (social media, news feeds, uploaded content)
- Real-time processing of text, images, and audio
- Hybrid approach combining live APIs with preloaded datasets
- Automatic data validation and deduplication

### 🧠 AI-Powered Analysis
- Real-time sentiment and urgency analysis
- Automated damage assessment from images
- Pattern detection for emerging crisis hotspots
- Multi-language processing and translation

### 📊 Executive Dashboard
- Priority-ranked incident reports
- AI-generated situation summaries
- Visual damage assessment maps
- Resource allocation recommendations

### ⚡ Smart Alerting
- Proactive notifications for high-priority events
- Automated resource deployment suggestions
- Multi-language crisis communication templates
- Real-time stakeholder updates

## 🏗️ Technical Architecture

### System Overview
```
Data Sources → OpenAI APIs → Intelligence Layer → Dashboard
     ↓              ↓             ↓              ↓
Social Media → GPT-4 Text → Crisis Analysis → Executive Summary
Images/Video → GPT Vision → Damage Assessment → Priority Alerts
Audio Reports → Whisper → Transcription → Searchable Database
Requirements → DALL-E → Visual Reports → Situation Maps
```

### Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Data Visualization**: Chart.js & React-Leaflet
- **AI Integration**: OpenAI API (GPT-4, Vision, Whisper, DALL-E)
- **State Management**: React Hooks + Context
- **Real-time Updates**: WebSocket integration
- **Styling**: Tailwind CSS + HeadlessUI
- **Social Media Integration**: Twitter API v2, Reddit API
- **News Integration**: News API

## 📦 Project Structure

\`\`\`
crisislen-ai/
├── src/
│   ├── components/           # React components
│   │   ├── Dashboard.jsx    # Main dashboard interface
│   │   ├── CrisisMap.jsx    # Interactive crisis mapping
│   │   ├── CrisisDetails.jsx # Individual crisis view
│   │   ├── MetricsPanel.jsx # Analytics and insights
│   │   └── CrisisEventList.jsx # Event listing
│   ├── services/            # Core services
│   │   ├── dataAggregator.js    # Data collection/processing
│   │   ├── newsService.js       # News API integration
│   │   ├── redditService.js     # Reddit data handling
│   │   ├── openaiService.js     # AI analysis pipeline
│   │   └── insightsService.js   # Insights generation
│   ├── data/               # Sample/static data
│   │   └── sampleCrisisData.js  # Preloaded datasets
│   └── assets/            # Static assets
├── public/               # Public assets
└── .env                 # Environment configuration
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- NPM >= 9.0.0
- OpenAI API key
- News API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/Noah-Wallace/crisislen.git
cd crisislen-ai
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables:
\`\`\`env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# News API Configuration
VITE_NEWS_API_KEY=your_news_api_key

# Twitter API Configuration
VITE_TWITTER_API_KEY=your_twitter_api_key
VITE_TWITTER_API_SECRET=your_twitter_api_secret
VITE_TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Optional: Development Mode (uses mock data when true)
VITE_USE_MOCK_DATA=false
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## 🔧 Core Components

### Dashboard.jsx
The main interface orchestrating all components and data flow. Features:
- Real-time data updates
- Crisis event visualization
- Analytics and insights display

### CrisisMap.jsx
Interactive map showing crisis locations and severity:
- Real-time event markers
- Severity-based visualization
- Click-through to detailed information

### CrisisDetails.jsx
Detailed view of individual crisis events:
- Comprehensive event information
- AI analysis results
- Resource requirements
- Stakeholder information

### MetricsPanel.jsx
Analytics and insights visualization:
- Crisis type distribution
- Urgency trends
- Resource allocation metrics
- AI-generated recommendations

## 🛠️ Services

### baseService.js
Core service functionality and utilities:
- Retry mechanism for API calls
- Location extraction from text
- Crisis type detection
- Urgency score calculation
- Text sanitization
- Common utilities for all services

### dataAggregator.js
Central data management service:
- Multi-source data collection
- Data deduplication
- Priority scoring
- Real-time updates

### twitterService.js
Twitter API v2 integration:
- Real-time crisis tweet monitoring
- Verified source filtering
- Geo-location extraction
- Crisis relevance scoring
- Mock data fallback for demos

### newsService.js
News API integration:
- Real-time news monitoring
- Article relevance filtering
- Location extraction
- Crisis classification

### redditService.js
Reddit data processing:
- Subreddit monitoring
- Crisis-related post filtering
- Sentiment analysis
- Location extraction

### openaiService.js
AI analysis pipeline:
- Text analysis (GPT-4)
- Image analysis (Vision API)
- Audio processing (Whisper)
- Visual generation (DALL-E)

### insightsService.js
Insights and recommendations:
- Trend analysis
- Pattern detection
- Resource optimization
- Executive summaries

## 📊 Data Sources

### Live APIs
- News API (news articles)
- Reddit API (social media)
- OpenAI APIs (AI analysis)

### Preloaded Datasets
- Historical crisis events
- Emergency response patterns
- Resource allocation templates
- Crisis type classifications

## 🔒 Security & Privacy

- API key protection
- Data anonymization
- Rate limiting
- Error handling

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with automatic CI/CD

## 📈 Future Enhancements

1. Additional data sources:
   - Twitter API integration
   - Emergency services APIs
   - Satellite imagery

2. Advanced features:
   - Predictive analytics
   - Resource optimization
   - Multi-agency coordination
   - Mobile applications


