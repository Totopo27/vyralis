import type { VideoScript, SceneScript } from '../types/schema';

/**
 * ScriptGenerator generates video scripts following the 'escribe-humano' protocol:
 * - Anti-moralizing: No forced moral takeaways or philosophical speeches.
 * - Dynamic scene layouts with zero AI clichés.
 * - Concrete anchors and punchy rhythm.
 */
export class ScriptGenerator {
  /**
   * Generates a sample script when no API key is passed, or can be hooked
   * to any LLM provider (OpenAI, Gemini, Anthropic, Ollama).
   */
  async generate(topic: string): Promise<VideoScript> {
    // Default scripted scenes adhering to escribe-humano standards
    const scenes: SceneScript[] = [
      {
        id: 'scene-1',
        layoutType: 'title-hook',
        narrativeText: `La mayoría construye videos en código como si fueran páginas web estáticas.`,
        headline: '¿Programar video?',
        tagline: 'INGENIERÍA VISUAL',
        accentColor: '#38bdf8',
        keywords: ['código', 'páginas', 'estáticas'],
      },
      {
        id: 'scene-2',
        layoutType: 'stat-highlight',
        narrativeText: `Remotion renderiza fotograma a fotograma en React con precisión matemática absoluta.`,
        headline: '60 FPS NATIVOS',
        tagline: 'DETERMINISMO TOTAL',
        accentColor: '#f43f5e',
        keywords: ['Remotion', 'React', 'fotograma'],
      },
      {
        id: 'scene-3',
        layoutType: 'punchy-conclusion',
        narrativeText: `Un JSON entra, el audio calcula los tiempos y el render final sale en MP4.`,
        headline: 'DE JSON A MP4',
        tagline: 'FLUJO CONTINUO',
        accentColor: '#10b981',
        keywords: ['JSON', 'audio', 'MP4'],
      },
    ];

    return {
      title: `Video sobre ${topic}`,
      fps: 30,
      width: 1080,
      height: 1920,
      scenes,
    };
  }
}
