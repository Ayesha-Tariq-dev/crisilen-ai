// src/services/openaiService.js
import { mockAnalysisResults } from '../data/sampleCrisisData.js';

export class OpenAIService {
    constructor() {
        this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
        this.baseUrl = 'https://api.openai.com/v1';
        this.model = 'gpt-3.5-turbo';
        this.maxRetries = 3;
        this.requestQueue = [];
        this.isProcessing = false;
        this.rateLimit = {
            remaining: 3,
            resetTime: Date.now(),
            requestsPerMin: 3
        };
    }

    async analyzeCrisis(crisisText, location = '', type = '', crisisId = null) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
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

                // Check if we need to wait for rate limit reset
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
                        // Rate limit hit, update limits and requeue
                        this.rateLimit.remaining = 0;
                        this.rateLimit.resetTime = Date.now() + 60000; // Reset in 1 minute
                        continue;
                    }
                    request.reject(error);
                }

                this.requestQueue.shift();
                this.rateLimit.remaining--;

                if (this.requestQueue.length > 0) {
                    // Add delay between requests
                    await new Promise(resolve => setTimeout(resolve, 60000 / this.rateLimit.requestsPerMin));
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    async makeRequest({ crisisText, location, type, crisisId }) {
        if (!this.apiKey) {
            console.log('🎭 Using mock AI analysis - no API key');
            return this.getMockAnalysis(crisisText, type, crisisId);
        }

        let attempt = 0;

        while (attempt < this.maxRetries) {
            try {
                console.log('🤖 Analyzing crisis with OpenAI...');

                if (attempt > 0) {
                    const backoffTime = Math.min(1000 * Math.pow(2, attempt), 8000);
                    console.log(`Retry attempt ${attempt + 1} after ${backoffTime}ms backoff...`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                }

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
                        ]
                    })
                });

                if (!response.ok) {
                    const error = new Error('OpenAI API error: ' + response.status);
                    error.status = response.status;
                    throw error;
                }

                const data = await response.json();
                let analysis = this.parseAnalysisResponse(data);

                return this.enrichAnalysis(analysis, type);

            } catch (error) {
                attempt++;

                if (error.status === 429 || attempt === this.maxRetries) {
                    console.log('🎭 Falling back to mock analysis');
                    return this.getMockAnalysis(crisisText, type, crisisId);
                }
            }
        }
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
            const content = data.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('❌ Error parsing OpenAI response:', error);
            return null;
        }
    }

    enrichAnalysis(analysis, type) {
        if (!analysis) {
            return this.getMockAnalysis('', type);
        }
        return {
            ...analysis,
            timestamp: new Date().toISOString(),
            source: 'openai'
        };
    }

    getMockAnalysis(text, type, crisisId = null) {
        // Simulate API delay
        return mockAnalysisResults[0];
    }
}