import type { LLMConfig, LLMMessage, LLMProvider } from './types';

export interface OpenAICompatibleOptions extends Partial<LLMConfig> {
  name?: string;
}

export class OpenAICompatibleProvider implements LLMProvider {
  readonly name: string;
  private apiKey?: string;
  private baseUrl: string;
  private model: string;
  private temperature?: number;

  constructor(options?: OpenAICompatibleOptions) {
    this.name = options?.name || 'OpenAI-Compatible';
    this.apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = (options?.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.model = options?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.temperature = options?.temperature ?? 0.7;
  }

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: LLMMessage[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const endpoint = this.baseUrl.endsWith('/chat/completions')
      ? this.baseUrl
      : `${this.baseUrl}/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`OpenAI-Compatible API error [${response.status} ${response.statusText}]: ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('OpenAI-Compatible API returned an invalid response structure or empty content.');
    }

    return content;
  }
}
