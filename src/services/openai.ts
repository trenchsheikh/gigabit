import { ENV } from '../config/env';
import type { CustomAgent } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o';

export interface ChatCompletionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export const openAIService = {
  async chatCompletion(
    agent: CustomAgent,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const trimmedKey = ENV.OPENAI_API_KEY?.trim() || '';
    
    // If no API key or invalid format, use mock response for development
    if (!trimmedKey || !trimmedKey.startsWith('sk-')) {
      if (__DEV__) {
        console.warn('⚠️ Using mock OpenAI response (API key not configured)');
        return this.getMockResponse(agent, messages);
      }
      throw new OpenAIError('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.', 401, 'MISSING_API_KEY');
    }

    const systemPrompt = this.buildSystemPrompt(agent);
    const requestMessages: ChatCompletionRequest['messages'] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.OPENAI_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: requestMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API request failed: ${response.statusText}`;
        
        // If API key is invalid, throw error that can be caught and fallback to mock
        if (response.status === 401 || errorMessage.includes('API key') || errorMessage.includes('Incorrect API key')) {
          throw new OpenAIError(
            errorMessage,
            response.status,
            errorData.error?.code || 'INVALID_API_KEY'
          );
        }
        
        throw new OpenAIError(
          errorMessage,
          response.status,
          errorData.error?.code
        );
      }

      const data: ChatCompletionResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new OpenAIError('No content in API response');
      }

      return content;
    } catch (error) {
      if (error instanceof OpenAIError) {
        throw error;
      }
      throw new OpenAIError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        'NETWORK_ERROR'
      );
    }
  },

  buildSystemPrompt(agent: CustomAgent): string {
    // Use the agent's system instructions directly
    // Each agent has been configured with specific expertise in defaultAgents.ts
    return agent.systemInstructions || `You are a helpful AI assistant. Be clear, concise, and helpful.`;
  },

  getMockResponse(agent: CustomAgent, messages: Array<{ role: 'user' | 'assistant'; content: string }>): string {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    const userQuery = lastUserMessage?.content.toLowerCase() || '';

    // Agent-specific mock responses
    if (agent.id === 'familyguardian-ai') {
      if (userQuery.includes('parental') || userQuery.includes('control')) {
        return 'I can help you set up parental controls! Here are some steps:\n\n1. Go to your device settings\n2. Look for "Screen Time" or "Parental Controls"\n3. Set up content restrictions\n4. Configure app limits\n\nWould you like more specific guidance for your device?';
      }
      if (userQuery.includes('privacy') || userQuery.includes('setting')) {
        return 'Privacy settings are crucial for family safety. I recommend:\n\n• Enable two-factor authentication\n• Review app permissions regularly\n• Use strong, unique passwords\n• Enable location sharing only with trusted contacts\n\nWhat specific privacy concern can I help with?';
      }
      return 'Hello! I\'m FamilyGuardian, your online safety advisor. I can help you with:\n\n• Setting up parental controls\n• Privacy settings\n• Keeping your family safe online\n• Social media safety\n\nWhat would you like to know?';
    }

    if (agent.id === 'cyberguardian-ai') {
      if (userQuery.includes('phishing') || userQuery.includes('scam')) {
        return 'Phishing protection is essential! Here\'s how to stay safe:\n\n1. Never click suspicious links in emails\n2. Verify sender addresses carefully\n3. Look for spelling/grammar errors\n4. Check the URL before entering credentials\n5. Use two-factor authentication\n\nHave you received a suspicious message?';
      }
      if (userQuery.includes('password')) {
        return 'Strong passwords are your first line of defense:\n\n• Use at least 12 characters\n• Mix uppercase, lowercase, numbers, and symbols\n• Use unique passwords for each account\n• Consider a password manager\n• Enable two-factor authentication when available\n\nNeed help setting up a password manager?';
      }
      return 'Hello! I\'m CyberGuardian, your cybersecurity expert. I can help you with:\n\n• Threat detection and prevention\n• Password security\n• Phishing protection\n• Network security\n• Malware protection\n\nWhat security concern can I address?';
    }

    if (agent.id === 'wifi-expert-ai') {
      if (userQuery.includes('speed') || userQuery.includes('slow')) {
        return 'To improve your WiFi speed, try these steps:\n\n1. Move your router to a central location\n2. Keep it elevated and away from walls\n3. Reduce interference from other devices\n4. Update your router firmware\n5. Consider a mesh network for larger homes\n\nHave you run a speed test? I can help analyze the results!';
      }
      if (userQuery.includes('router') || userQuery.includes('placement')) {
        return 'Optimal router placement:\n\n• Central location in your home\n• Elevated position (shelf or wall mount)\n• Away from metal objects and thick walls\n• Not hidden in cabinets or closets\n• At least 3 feet from other electronics\n\nWhere is your router currently located?';
      }
      return 'Hello! I\'m WiFi Expert, your network optimization specialist. I can help you with:\n\n• Improving WiFi speed and coverage\n• Router placement optimization\n• Troubleshooting connection issues\n• Analyzing speed test results\n• Setting up mesh networks\n\nHow can I help optimize your network today?';
    }

    // Generic response
    return 'Hello! I\'m here to help. How can I assist you today?';
  },
};


