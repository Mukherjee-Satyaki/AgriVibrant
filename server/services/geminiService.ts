import fetch, { Response as FetchResponse } from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const FETCH_TIMEOUT = 20000; // 20 seconds timeout
const MAX_HISTORY_MESSAGES = 5; // Limit history to avoid token limits
const MAX_RETRIES = 2; // Number of retries for transient errors

// Verify API key is available
if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set in environment variables. Chatbot may not function properly.');
}

// System prompt for agricultural assistant
const SYSTEM_PROMPT = `
You are AgriBot, an agricultural assistant specialized in helping farmers with advice on farming techniques, 
crop management, pest control, soil health, weather patterns, sustainable farming practices, 
agricultural technology, market trends, and other agriculture-related topics.

Indian people would talk to you. So the answers you give should be based on india.

When responding to questions:
- Provide practical, actionable advice that farmers can implement
- Consider regional factors when relevant (climate, soil types, etc.)
- Include both traditional farming wisdom and modern agricultural science
- When appropriate, suggest sustainable and eco-friendly approaches
- Keep answers concise but informative
- Use simple, clear language avoiding unnecessary technical jargon
- If you don't know the answer, admit it and don't make up information
`;

/**
 * Helper function to make API requests with timeout
 */
async function fetchWithTimeout(url: string, options: any, timeout: number): Promise<FetchResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Process a message through the Gemini API for agricultural assistance
 * @param message - User's message/question about agriculture
 * @param conversationHistory - Previous messages in the conversation
 * @returns The response from the agricultural assistant
 */
export async function processAgriculturalQuery(
  message: string,
  conversationHistory: Array<{ role: string, content: string }> = []
): Promise<string> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
      }

      // Create conversation structure for Gemini
      // First, we add the system prompt as the "model" role
      const contents: Array<any> = [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'll be AgriBot, your specialized agricultural assistant. I'll provide helpful, accurate information about farming, crops, and agricultural practices." }]
        }
      ];
      
      // Limit history to most recent messages to reduce token count
      const limitedHistory = conversationHistory.length > MAX_HISTORY_MESSAGES 
        ? conversationHistory.slice(-MAX_HISTORY_MESSAGES) 
        : conversationHistory;
      
      // Map our roles to Gemini roles ('user' stays as 'user', 'assistant' becomes 'model')
      if (limitedHistory.length > 0) {
        limitedHistory.forEach(msg => {
          // Gemini only accepts 'user' and 'model' roles
          const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
          contents.push({
            role: geminiRole,
            parts: [{ text: msg.content }]
          });
        });
      }
      
      // Add the current user message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      console.log('Sending to Gemini API with contents:', JSON.stringify(contents).slice(0, 200) + '...');

      const response = await fetchWithTimeout(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
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
          }),
        },
        FETCH_TIMEOUT
      );

      const data = await response.json() as any;
      
      if (data.error) {
        console.error('Gemini API error:', data.error);
        
        // Check if this is a retryable error (like rate limiting)
        if (data.error.code === 429 || data.error.code === 500 || data.error.code === 503) {
          retries++;
          if (retries <= MAX_RETRIES) {
            console.log(`Retrying Gemini API request (${retries}/${MAX_RETRIES})`);
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, retries * 1000));
            continue;
          }
        }
        
        return 'I apologize, but I\'m currently having trouble processing your request. Could you try asking about common agricultural topics like crop diseases, farming techniques, weather patterns, or organic farming?';
      }

      // Extract the response text from the Gemini API response
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text as string;
      } else {
        console.error('Unexpected Gemini API response format:', data);
        return 'I apologize, but I\'m currently having trouble processing your request. Could you try asking about common agricultural topics like crop diseases, farming techniques, weather patterns, or organic farming?';
      }
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      
      // Check if it's an abort error (timeout)
      if (error.name === 'AbortError') {
        console.error('Gemini API request timed out');
        retries++;
        if (retries <= MAX_RETRIES) {
          console.log(`Retrying Gemini API request after timeout (${retries}/${MAX_RETRIES})`);
          continue;
        }
      }
      
      return 'I apologize, but I\'m currently having trouble processing your request. Could you try asking about common agricultural topics like crop diseases, farming techniques, weather patterns, or organic farming?';
    }
  }
  
  // We should only reach here if we've retried the maximum number of times
  return 'I apologize, but I\'m currently having trouble processing your request. Our system might be experiencing high traffic. Please try again in a few moments.';
}