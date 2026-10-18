export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  name: string;
  complete(prompt: string, systemPrompt?: string): Promise<string>;
}

export type LLMProviderType = 'openai-compatible' | 'gemini' | 'mock';

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
}
