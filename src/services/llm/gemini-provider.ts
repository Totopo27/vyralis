import type { LLMConfig, LLMProvider } from './types';

export interface GeminiOptions extends Partial<LLMConfig> {
  name?: string;
}

export class GeminiProvider implements LLMProvider {
  readonly name: string;
  private apiKey?: string;
  private baseUrl: string;
  private model: string;
  private temperature?: number;

  constructor(options?: GeminiOptions) {
    this.name = options?.name || 'Gemini';
    this.apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    this.baseUrl = (options?.baseUrl || process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '');
    this.model = options?.model || process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    this.temperature = options?.temperature ?? 0.7;
  }

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is required. Set GEMINI_API_KEY in the environment or pass apiKey in configuration.');
    }

    const url = new URL(`${this.baseUrl}/models/${this.model}:generateContent`);
    url.searchParams.set('key', this.apiKey);

    const bodyPayload: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: this.temperature,
      },
    };

    if (systemPrompt) {
      bodyPayload.system_instruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Gemini API error [${response.status} ${response.statusText}]: ${errorText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string') {
      throw new Error('Gemini API returned an invalid response structure or empty content.');
    }

    return text;
  }
}
