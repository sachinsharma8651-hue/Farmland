// Chatbox Configuration File
// Configure your AI API settings here

const CHATBOX_CONFIG = {
    // API Configuration
    // Uncomment and configure one of the following APIs:
    
    // Option 1: OpenAI API
    // apiProvider: 'openai',
    // apiKey: 'your-openai-api-key-here',
    // apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    // model: 'gpt-3.5-turbo',
    
    // Option 2: Google Gemini API (TESTING) - Google AI Studio
    // apiProvider: 'gemini',
    // apiKey: 'AIzaSyDCcQOwLEGu7RNGlrmgOk7gwG4fK5HFwhU',
    // apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    
    // Option 3: Anthropic Claude API
    // apiProvider: 'claude',
    // apiKey: 'your-claude-api-key-here',
    // apiEndpoint: 'https://api.anthropic.com/v1/messages',
    // model: 'claude-3-sonnet-20240229',
    
    // Option 4: Local API (if you have a local AI server)
    // apiProvider: 'local',
    // apiEndpoint: 'http://localhost:11434/api/generate', // Example: Ollama
    // model: 'llama2',
    
    // Fallback mode (uses pre-written responses only) - ACTIVE FOR TESTING
    apiProvider: 'fallback', // Set to 'fallback' to use only pre-written responses
    
    // Chat Settings
    maxTokens: 150,
    temperature: 0.7,
    systemPrompt: `You are a helpful assistant for "Farmer 2 Consumer", a platform connecting farmers with consumers and wholesalers. 
    
    Key platform features:
    - Same-day fresh produce delivery
    - Two product grades: Grade A (large, shiny) and Grade B (smaller, less shiny)
    - Farmers can sell wholesale or retail (250g, 500g, 1kg, 2kg)
    - Location-based matching for quick delivery
    - Real-time product photos
    - Automated pricing based on mandi rates
    - Two delivery shifts: Morning (6AM-12PM) and Evening (2PM-8PM)
    - Payment options: COD, UPI, Cards, Credit terms for wholesalers
    
    Keep responses helpful, concise, and focused on the platform. Use emojis appropriately.`,
    
    // UI Settings
    welcomeMessage: "👋 Hello! I'm your Farm Assistant. I can help you with questions about our platform, delivery, products, and more. How can I assist you today?",
    typingDelay: 1000, // Delay before showing response (milliseconds)
    showQuickQuestions: true,
    showTypingIndicator: true,
    
    // Quick Questions (customize these based on your needs)
    quickQuestions: [
        { text: "🚚 Delivery Process", question: "How does the delivery work?" },
        { text: "⭐ Product Grades", question: "What are the product grades?" },
        { text: "🌾 Join as Farmer", question: "How to become a farmer partner?" },
        { text: "💳 Payment Options", question: "What payment methods do you accept?" }
    ]
};

// API Integration Functions
class APIIntegration {
    constructor(config) {
        this.config = config;
    }

    async callAPI(message) {
        switch (this.config.apiProvider) {
            case 'openai':
                return await this.callOpenAI(message);
            case 'gemini':
                return await this.callGemini(message);
            case 'claude':
                return await this.callClaude(message);
            case 'local':
                return await this.callLocalAPI(message);
            default:
                throw new Error('API not configured or fallback mode enabled');
        }
    }

    async callOpenAI(message) {
        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    { role: 'system', content: this.config.systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            })
        });

        if (!response.ok) throw new Error(`OpenAI API Error: ${response.status}`);
        
        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callGemini(message) {
        const response = await fetch(`${this.config.apiEndpoint}?key=${this.config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${this.config.systemPrompt}\n\nUser: ${message}\n\nAssistant:`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                    topK: 40,
                    topP: 0.95
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API Error:', response.status, errorData);
            
            // Handle specific error cases
            if (response.status === 404) {
                throw new Error('Gemini model not found. Using fallback responses.');
            } else if (response.status === 403) {
                throw new Error('API key invalid or quota exceeded. Using fallback responses.');
            } else {
                throw new Error(`Gemini API Error: ${response.status}. Using fallback responses.`);
            }
        }
        
        const data = await response.json();
        console.log('Gemini API Response:', data);
        
        // Handle different response formats
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            // Check if content was blocked
            if (candidate.finishReason === 'SAFETY') {
                throw new Error('Response blocked by safety filters. Using fallback response.');
            }
            
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                return candidate.content.parts[0].text;
            }
        }
        
        // If we get here, the response format is unexpected
        console.error('Unexpected Gemini API response format:', data);
        throw new Error('Invalid response format from Gemini API. Using fallback response.');
    }

    async callClaude(message) {
        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.config.model,
                max_tokens: this.config.maxTokens,
                messages: [
                    { role: 'user', content: `${this.config.systemPrompt}\n\nUser: ${message}` }
                ]
            })
        });

        if (!response.ok) throw new Error(`Claude API Error: ${response.status}`);
        
        const data = await response.json();
        return data.content[0].text;
    }

    async callLocalAPI(message) {
        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.config.model,
                prompt: `${this.config.systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
                stream: false
            })
        });

        if (!response.ok) throw new Error(`Local API Error: ${response.status}`);
        
        const data = await response.json();
        return data.response;
    }
}

// Export configuration
window.CHATBOX_CONFIG = CHATBOX_CONFIG;
window.APIIntegration = APIIntegration;
