// src/services/openaiService.js
import { mockAnalysisResults } from '../data/sampleCrisisData.js';

export class OpenAIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
    this.model = process.env.REACT_APP_OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxRetries = parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS) || 3;
    this.requestQueue = [];
    this.isProcessing = false;
    this.rateLimit = {
      remaining: parseInt(process.env.REACT_APP_API_RATE_LIMIT) || 3,
      resetTime: Date.now(),
      requestsPerMin: parseInt(process.env.REACT_APP_API_RATE_LIMIT) || 3,
      windowMs: 60000 // 1 minute window
    };
  }

  async analyzeCrisis(crisisText, location = '', type = '', crisisId = null) {
    return new Promise((resolve, reject) => {
      if (!this.apiKey && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.log('🎭 Using mock data (no API key)');
        resolve(this.getMockAnalysis(crisisText, type, crisisId));
        return;
      }

      this.requestQueue.push({
        type: 'analysis',
        crisisText,
        location,
        type,
        crisisId,
        resolve,
        reject
      });

      this.processQueue().catch(console.error);
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;

    try {
      while (this.requestQueue.length > 0) {
        const request = this.requestQueue[0];
        const now = Date.now();

        if (this.rateLimit.remaining === 0 && now < this.rateLimit.resetTime) {
          const waitTime = this.rateLimit.resetTime - now;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          this.rateLimit.remaining = this.rateLimit.requestsPerMin;
        }

        try {
          const result = await this.makeRequest(request);
          request.resolve(result);
        } catch (error) {
          if (error.status === 429) {
            this.rateLimit.remaining = 0;
            this.rateLimit.resetTime = Date.now() + this.rateLimit.windowMs;
            console.log('Rate limited, waiting for reset...');
            continue;
          }
          request.reject(error);
        }

        this.requestQueue.shift();
        this.rateLimit.remaining--;

        if (this.requestQueue.length > 0) {
          await new Promise(resolve =>
            setTimeout(resolve, this.rateLimit.windowMs / this.rateLimit.requestsPerMin)
          );
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async makeRequest(request) {
    const { crisisText, location, type, crisisId } = request;

    if (!this.apiKey && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      console.log('🎭 Using mock AI analysis - no API key');
      return this.getMockAnalysis(crisisText, type, crisisId);
    }

    let attempt = 0;
    const timeout = parseInt(process.env.REACT_APP_API_TIMEOUT) || 8000;

    while (attempt < this.maxRetries) {
      try {
        console.log('🤖 Analyzing crisis with OpenAI...');

        if (attempt > 0) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), timeout);
          console.log(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${backoffTime}ms backoff...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: this.model,
              messages: [
                {
                  role: 'system',
                  content: this.getSystemPrompt()
                },
                {
                  role: 'user',
                  content: this.formatAnalysisPrompt(crisisText, location, type)
                }
              ],
              max_tokens: parseInt(process.env.REACT_APP_MAX_TOKENS) || 500,
              temperature: parseFloat(process.env.REACT_APP_TEMPERATURE) || 0.3
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const error = new Error('OpenAI API error: ' + response.status);
            error.status = response.status;
            throw error;
          }

          const data = await response.json();
          let analysis = this.parseAnalysisResponse(data);

          if (!analysis) {
            throw new Error('Failed to parse analysis response');
          }

          return this.enrichAnalysis(analysis, type);

        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          throw error;
        }

      } catch (error) {
        attempt++;
        console.error('Error on attempt', attempt, error);

        if (error.status === 429 || attempt === this.maxRetries) {
          console.log('🎭 Falling back to mock analysis');
          return this.getMockAnalysis(crisisText, type, crisisId);
        }

        if (attempt < this.maxRetries) {
          continue;
        }
        throw error;
      }
    }

    return this.getMockAnalysis(crisisText, type, crisisId);
  }

  async generateExecutiveSummary(crisisDataArray) {
    return new Promise((resolve, reject) => {
      if (!this.apiKey && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.log('🎭 Using mock summary (no API key)');
        resolve(this.getMockExecutiveSummary(crisisDataArray));
        return;
      }

      this.requestQueue.push({
        type: 'summary',
        data: crisisDataArray,
        resolve,
        reject
      });

      this.processQueue().catch(error => {
        console.error('❌ Error processing summary queue:', error);
        reject(error);
      });
    });
  }

  async generateSummary(crisisDataArray) {
    if (!this.apiKey || process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      return this.getMockExecutiveSummary(crisisDataArray);
    }

    let attempt = 0;
    const timeout = parseInt(process.env.REACT_APP_API_TIMEOUT) || 8000;

    while (attempt < this.maxRetries) {
      try {
        console.log('📝 Generating executive summary...');

        if (attempt > 0) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), timeout);
          console.log(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${backoffTime}ms backoff...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }

        const crisisTexts = crisisDataArray.map(c =>
          `${c.location}: ${c.type.toUpperCase()} - ${c.text}`
        ).join('\n\n');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: this.model,
              messages: [
                {
                  role: 'system',
                  content: `You are a senior crisis intelligence analyst for emergency response leadership. 

Create a concise, actionable executive summary that includes:
1. Current situation overview
2. Priority events requiring immediate attention
3. Resource allocation recommendations  
4. Next actions for leadership
5. Estimated response timeline

Keep it professional, clear, and decision-focused. Maximum 300 words.`
                },
                {
                  role: 'user',
                  content: `Generate an executive summary from these ${crisisDataArray.length} crisis reports:\n\n${crisisTexts}`
                }
              ],
              max_tokens: parseInt(process.env.REACT_APP_MAX_TOKENS) || 400,
              temperature: parseFloat(process.env.REACT_APP_TEMPERATURE) || 0.2
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const error = new Error(`OpenAI API error: ${response.status}`);
            error.status = response.status;
            throw error;
          }

          const data = await response.json();
          const summary = data.choices[0]?.message?.content?.trim();

          if (!summary) {
            throw new Error('Empty summary from OpenAI');
          }

          console.log('✅ Executive summary generated successfully');
          return summary;

        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          throw error;
        }

      } catch (error) {
        attempt++;
        console.error('Error generating summary on attempt', attempt, error);

        if (error.status === 429 || attempt === this.maxRetries) {
          console.log('🎭 Falling back to mock summary');
          return this.getMockExecutiveSummary(crisisDataArray);
        }

        if (attempt < this.maxRetries) {
          continue;
        }
        throw error;
      }
    }

    return this.getMockExecutiveSummary(crisisDataArray);
  }

  // Helper methods
  shouldUseMockData() {
    // Use mock data 30% of the time for demo reliability
    return Math.random() < 0.3;
  }

  getSystemPrompt() {
    return `You are a crisis analysis AI expert. Analyze crisis reports and extract structured information.

RESPOND ONLY IN VALID JSON FORMAT with these exact fields:
{
  "urgency": number (1-10, where 10 is most critical),
  "estimatedCasualties": "string description",
  "resourcesNeeded": ["array", "of", "resources"],
  "immediateActions": ["array", "of", "actions"],
  "riskLevel": "Critical|High|Medium|Low",
  "stakeholders": ["array", "of", "organizations"],
  "confidence": number (0.0-1.0)
}`;
  }

  formatAnalysisPrompt(text, location, type) {
    return `Analyze this crisis:
Location: ${location || 'Unknown'}
Type: ${type || 'Unspecified'}
Report: ${text}

Provide a structured analysis in the specified JSON format.`;
  }

  parseAnalysisResponse(data) {
    try {
      const content = data.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Validate required fields
      const requiredFields = ['urgency', 'estimatedCasualties', 'resourcesNeeded', 'immediateActions', 'riskLevel', 'stakeholders', 'confidence'];
      const missingFields = requiredFields.filter(field => !(field in analysis));

      if (missingFields.length > 0) {
        console.warn('Missing fields in analysis:', missingFields);
        return null;
      }

      return analysis;
    } catch (error) {
      console.error('❌ Error parsing OpenAI response:', error);
      return null;
    }
  }

  async simulateDelay(minMs = 500, maxMs = 2000) {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  getMockAnalysis(text, type, crisisId = null) {
    // Get specific mock data if available
    if (crisisId && mockAnalysisResults[crisisId]) {
      return {
        ...mockAnalysisResults[crisisId],
        source: 'mock',
        timestamp: new Date().toISOString()
      };
    }

    // Get mock data based on crisis type
    const defaultAnalysis = mockAnalysisResults[0];
    return {
      ...defaultAnalysis,
      source: 'mock',
      timestamp: new Date().toISOString(),
      type
    };
  }

  getMockExecutiveSummary(crisisDataArray) {
    const crisisTypes = [...new Set(crisisDataArray.map(c => c.type))];
    const locations = [...new Set(crisisDataArray.map(c => c.location))].slice(0, 3);
    const highUrgencyCount = crisisDataArray.filter(c => {
      const analysis = mockAnalysisResults[c.id];
      return analysis && analysis.urgency >= 8;
    }).length;

    const currentTime = new Date().toLocaleString();

    return `CRISIS INTELLIGENCE EXECUTIVE SUMMARY
Generated: ${currentTime}

CURRENT SITUATION:
${crisisDataArray.length} active crisis events detected across ${locations.length} regions. ${highUrgencyCount} events classified as high priority requiring immediate response.

PRIORITY EVENTS:
${crisisTypes.map(type => this.getPriorityEventText(type)).filter(Boolean).join('')}

RESOURCE ALLOCATION PRIORITY:
1. Deploy emergency response teams to ${locations[0]} and ${locations[1] || 'affected areas'}
2. Activate international aid protocols for large-scale disasters
3. Coordinate with local authorities for evacuation and relief support
4. Establish emergency communication networks

IMMEDIATE ACTIONS REQUIRED:
1. Continuous real-time monitoring of all developing situations
2. Resource deployment coordination with federal/state agencies  
3. Public emergency communication and alert systems activation
4. Preparation of international humanitarian aid requests

ESTIMATED RESPONSE TIMELINE:
- Initial deployment: 2-4 hours
- Full operational capacity: 6-12 hours  
- Relief operations: 24-72 hours

RECOMMENDATION: Maintain heightened alert status and prepare for potential escalation of current events.`;
  }

  getPriorityEventText(type) {
    const eventMap = {
      earthquake: '• CRITICAL: Earthquake response operations - Mass casualty event requiring international aid coordination\n',
      cyclone: '• CRITICAL: Cyclone impact - Coastal evacuation and storm surge management\n',
      flood: '• HIGH: Flood response - Evacuation and relief operations in progress\n',
      wildfire: '• HIGH: Wildfire containment - Air support and evacuation coordination\n',
      structural_collapse: '• HIGH: Building collapse - Urban search and rescue operations\n'
    };
    return eventMap[type] || '';
  }

  enrichAnalysis(analysis, type) {
    if (!analysis) {
      console.warn('Missing analysis data, using mock');
      return this.getMockAnalysis('', type);
    }

    return {
      ...analysis,
      timestamp: new Date().toISOString(),
      source: 'openai',
      type
    };
  }

  getMockExecutiveSummary(crisisDataArray) {
    const crisisTypes = [...new Set(crisisDataArray.map(c => c.type))];
    const locations = [...new Set(crisisDataArray.map(c => c.location))].slice(0, 3);
    const highUrgencyCount = crisisDataArray.filter(c => {
      const analysis = mockAnalysisResults[c.id];
      return analysis && analysis.urgency >= 8;
    }).length;

    const currentTime = new Date().toLocaleString();

    return `CRISIS INTELLIGENCE EXECUTIVE SUMMARY
Generated: ${currentTime}

CURRENT SITUATION:
${crisisDataArray.length} active crisis events detected across ${locations.length} regions. ${highUrgencyCount} events classified as high priority requiring immediate response.

PRIORITY EVENTS:
${crisisTypes.includes('earthquake') ? '• CRITICAL: Earthquake response operations - Mass casualty event requiring international aid coordination\n' : ''}${crisisTypes.includes('cyclone') ? '• CRITICAL: Cyclone impact - Coastal evacuation and storm surge management\n' : ''}${crisisTypes.includes('flood') ? '• HIGH: Flood response - Evacuation and relief operations in progress\n' : ''}${crisisTypes.includes('wildfire') ? '• HIGH: Wildfire containment - Air support and evacuation coordination\n' : ''}${crisisTypes.includes('structural_collapse') ? '• HIGH: Building collapse - Urban search and rescue operations\n' : ''}

RESOURCE ALLOCATION PRIORITY:
1. Deploy emergency response teams to ${locations[0]} and ${locations[1] || 'affected areas'}
2. Activate international aid protocols for large-scale disasters
3. Coordinate with local authorities for evacuation and relief support
4. Establish emergency communication networks

IMMEDIATE ACTIONS REQUIRED:
1. Continuous real-time monitoring of all developing situations
2. Resource deployment coordination with federal/state agencies  
3. Public emergency communication and alert systems activation
4. Preparation of international humanitarian aid requests

ESTIMATED RESPONSE TIMELINE:
- Initial deployment: 2-4 hours
- Full operational capacity: 6-12 hours  
- Relief operations: 24-72 hours

RECOMMENDATION: Maintain heightened alert status and prepare for potential escalation of current events.`;
  }

  parseUnstructuredAnalysis(content, type) {
    // Extract structured information from unstructured AI response
    const urgencyMatch = content.match(/urgency[:\s]*(\d+)/i);
    const urgency = urgencyMatch ? parseInt(urgencyMatch[1]) : 8;

    return {
      urgency: Math.max(1, Math.min(10, urgency)),
      estimatedCasualties: "Analysis in progress - AI response being processed",
      resourcesNeeded: ["Emergency response teams", "Medical supplies", "Specialized equipment"],
      immediateActions: ["Assess situation", "Deploy resources", "Establish communication"],
      riskLevel: urgency >= 8 ? "Critical" : urgency >= 6 ? "High" : "Medium",
      stakeholders: ["Emergency Services", "Local Government", "Relief Organizations"],
      confidence: 0.75,
      rawAnalysis: content.substring(0, 200) + "..."
    };
  }

  enrichAnalysis(partialAnalysis, type) {
    const mockBase = this.getMockAnalysis("", type);
    return {
      ...mockBase,
      ...partialAnalysis,
      confidence: (partialAnalysis.confidence || mockBase.confidence) * 0.9 // Slightly lower confidence for incomplete data
    };
  }
}