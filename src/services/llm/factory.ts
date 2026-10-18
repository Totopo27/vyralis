import type { LLMConfig, LLMProvider } from './types';
import { OpenAICompatibleProvider } from './openai-compatible';
import { GeminiProvider } from './gemini-provider';
import { MockProvider } from './mock-provider';

export function createLLMProvider(config?: Partial<LLMConfig>): LLMProvider {
  const selectedProvider = config?.provider || process.env.LLM_PROVIDER;

  if (selectedProvider) {
    const normalized = selectedProvider.toLowerCase().trim();

    if (normalized === 'mock') {
      return new MockProvider();
    }

    if (normalized === 'gemini') {
      return new GeminiProvider({
        apiKey: config?.apiKey || process.env.GEMINI_API_KEY,
        model: config?.model || process.env.GEMINI_MODEL,
        baseUrl: config?.baseUrl || process.env.GEMINI_BASE_URL,
        temperature: config?.temperature,
      });
    }

    if (
      normalized === 'openai' ||
      normalized === 'openai-compatible' ||
      normalized === 'ollama' ||
      normalized === 'groq' ||
      normalized === 'deepseek' ||
      normalized === 'openrouter'
    ) {
      const name =
        normalized === 'openai'
          ? 'OpenAI'
          : normalized === 'ollama'
          ? 'OpenAI-Compatible (Ollama)'
          : `OpenAI-Compatible (${normalized.toUpperCase()})`;

      return new OpenAICompatibleProvider({
        name,
        apiKey: config?.apiKey || process.env.OPENAI_API_KEY,
        baseUrl:
          config?.baseUrl ||
          (normalized === 'ollama' ? process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1' : process.env.OPENAI_BASE_URL),
        model: config?.model || process.env.OPENAI_MODEL,
        temperature: config?.temperature,
      });
    }
  }

  // Automatic environment detection
  if (process.env.GEMINI_API_KEY) {
    return new GeminiProvider({
      apiKey: process.env.GEMINI_API_KEY,
      model: config?.model || process.env.GEMINI_MODEL,
      baseUrl: config?.baseUrl || process.env.GEMINI_BASE_URL,
      temperature: config?.temperature,
    });
  }

  if (process.env.OPENAI_API_KEY) {
    return new OpenAICompatibleProvider({
      name: 'OpenAI-Compatible',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: config?.baseUrl || process.env.OPENAI_BASE_URL,
      model: config?.model || process.env.OPENAI_MODEL,
      temperature: config?.temperature,
    });
  }

  if (process.env.OLLAMA_BASE_URL) {
    const baseUrl = process.env.OLLAMA_BASE_URL.replace(/\/+$/, '');
    const fullUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
    return new OpenAICompatibleProvider({
      name: 'OpenAI-Compatible (Ollama)',
      baseUrl: config?.baseUrl || fullUrl,
      model: config?.model || process.env.OLLAMA_MODEL || 'llama3',
      temperature: config?.temperature,
    });
  }

  // Fallback to deterministic Mock provider
  return new MockProvider();
}
