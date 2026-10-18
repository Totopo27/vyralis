import type { VideoScript, SceneScript, HookArchetype, LayoutType, VisualCueType } from '../types/schema';
import { createLLMProvider, type LLMProvider } from './llm';

export interface ScriptGeneratorOptions {
  hookArchetype?: HookArchetype;
  provider?: LLMProvider;
}

const VALID_LAYOUT_TYPES: LayoutType[] = [
  'title-hook',
  'stat-highlight',
  'quote-callout',
  'split-compare',
  'punchy-conclusion',
];

const VALID_VISUAL_CUE_TYPES: VisualCueType[] = [
  'metric-callout',
  'split-comparison',
  'warning-alert',
  'badge-highlight',
];

/**
 * ScriptGenerator generates video scripts following the 'escribe-humano' protocol and
 * the Vyral Content 3-layer architecture:
 * 1. verbalVoiceover: Crisp, conversational voiceover for TTS with no AI moralizing or clichés.
 * 2. onScreenText: High-impact complementary visual typography designed for retention.
 * 3. visualCue: Interactive animated graphics and spatial feedback (metrics, alerts, comparisons, badges).
 */
export class ScriptGenerator {
  private defaultProvider: LLMProvider;

  constructor(provider?: LLMProvider) {
    this.defaultProvider = provider ?? createLLMProvider();
  }

  /**
   * Generates a video script structured across the 3 Vyral Content layers.
   */
  async generate(
    topic: string = 'Remotion y React',
    options?: ScriptGeneratorOptions
  ): Promise<VideoScript> {
    const hookArchetype: HookArchetype = options?.hookArchetype || 'contrarian';
    const provider = options?.provider ?? this.defaultProvider;

    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(topic, hookArchetype);

      const rawResponse = await provider.complete(userPrompt, systemPrompt);
      const parsedScript = this.parseAndValidateResponse(rawResponse, topic, hookArchetype);

      if (parsedScript) {
        return parsedScript;
      }

      console.warn(`⚠️ [ScriptGenerator] No se pudo validar el JSON del LLM (${provider.name}). Usando guion de fallback.`);
      return this.getDefaultScript(topic, hookArchetype);
    } catch (error) {
      console.warn(
        `⚠️ [ScriptGenerator] Error al invocar LLM (${provider.name}): ${error instanceof Error ? error.message : String(error)}. Usando guion de fallback defensivo.`
      );
      return this.getDefaultScript(topic, hookArchetype);
    }
  }

  private buildSystemPrompt(): string {
    return `Eres un director creativo y guionista técnico especializado en video vertical de alta retención para desarrolladores y creadores técnicos.
Tu objetivo es generar el guion técnico completo para un video en Remotion estructurado en el framework de 3 capas sincronizadas de Vyral Content y aplicando rigurosamente el protocolo 'escribe-humano'.

REGLAS DURAS 'ESCRIBE-HUMANO' (OBLIGATORIAS):
1. Cero moralismo ni síntesis temática: Prohibido explicar moralejas, reflexiones reflexivas o lecciones aprendidas ("el futuro es hoy", "en nuestras manos", "aprender es el camino").
2. Ritmo vertiginoso y dinámico: Entrar in media res, directo al conflicto técnico, fricción o problema real sin introducciones lentas ni saludos.
3. Anclajes concretos e intertextuales: Usa nombres propios de tecnologías, herramientas, librerías, estándares y métricas exactas (FPS, ms, GB, APIs). Prohibidas generalizaciones vagas ("una herramienta increíble").
4. Erradicación de clichés de IA: Prohibido usar frases de relleno como "en este fascinante mundo", "sumérgete", "en resumen", "un viaje hacia", o transiciones acartonadas.
5. Cero somatización cliché: Cero referencias a suspiros, gargantas secas o metáforas físicas forzadas.

FRAMEWORK DE 3 CAPAS DE VYRAL CONTENT (POR ESCENA):
1. verbalVoiceover: Guion de locución para TTS neuronal en español rioplatense/neutro ágil y conversacional. Directo y natural. Debe replicarse en narrativeText.
2. onScreenText: Texto tipográfico en MAYÚSCULAS para retención visual en pantalla. Máximo 2 líneas breves (1 a 5 palabras clave por línea).
3. visualCue: Objeto estructurado con datos para gráficos animados en pantalla:
   - type: 'metric-callout' | 'split-comparison' | 'warning-alert' | 'badge-highlight'
   - label: Encabezado corto en mayúsculas (ej: 'WORKFLOW TRADICIONAL', 'PRECISIÓN TEMPORAL')
   - value: Cifra o frase de impacto (ej: 'LENTO Y MANUAL', '1 MS', 'PRODUCCIÓN LISTA')
   - detail: Detalle técnico conciso explicativo
   - accentColor: Color hexadecimal (#38bdf8, #f43f5e, #10b981, #f59e0b, #a855f7)
   - (Opcional para split-comparison): leftLabel, leftValue, rightLabel, rightValue

ARQUETIPOS DE HOOK PARA ESCENA 1:
- 'contrarian': Desafía una creencia establecida en la industria.
- 'investigator': Plantea un enigma técnico con evidencia forense.
- 'cost-confession': Revela el costo oculto o tiempo desperdiciado por un mal enfoque.
- 'speed-run': Demuestra una solución ultra rápida contra el método lento.

ESTRUCTURA DE ESCENAS:
- Genera exactamente 3 escenas directas y cohesionadas (ritmo vertiginoso, 1 a 2 oraciones concisas por escena, total ~20-25 segundos).
- Escena 1: layoutType 'title-hook', con el hookArchetype indicado.
- Escena 2: layoutType 'stat-highlight', 'quote-callout' o 'split-compare'.
- Escena 3: layoutType 'punchy-conclusion'.
- Cada escena debe incluir: id ('scene-1', 'scene-2', 'scene-3'), headline, tagline, accentColor, keywords (array de 2 a 4 palabras).

CONTRATO DE SALIDA:
Devuelve ÚNICAMENTE un objeto JSON válido según la estructura de VideoScript, sin explicaciones ni bloques de texto adicionales fuera del JSON.`;
  }

  private buildUserPrompt(topic: string, hookArchetype: HookArchetype): string {
    return `Tema del video: "${topic}".
Arquetipo de hook obligatorio para la primera escena: "${hookArchetype}".

Genera exactamente 3 escenas directas y concisas cumpliendo estrictamente con el JSON schema:
{
  "title": "string",
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "scenes": [
    {
      "id": "scene-1",
      "hookArchetype": "${hookArchetype}",
      "layoutType": "title-hook",
      "verbalVoiceover": "string",
      "narrativeText": "string",
      "onScreenText": "string",
      "visualCue": {
        "type": "warning-alert",
        "label": "string",
        "value": "string",
        "detail": "string",
        "accentColor": "#f59e0b"
      },
      "headline": "string",
      "tagline": "string",
      "accentColor": "#38bdf8",
      "keywords": ["tag1", "tag2"]
    }
  ]
}`;
  }

  private parseAndValidateResponse(
    rawResponse: string,
    topic: string,
    hookArchetype: HookArchetype
  ): VideoScript | null {
    try {
      let cleaned = rawResponse.trim();

      // Extract JSON if wrapped in markdown code blocks
      const markdownMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (markdownMatch) {
        cleaned = markdownMatch[1].trim();
      } else {
        // Fallback: locate first '{' and last '}'
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.slice(firstBrace, lastBrace + 1);
        }
      }

      const parsed = JSON.parse(cleaned) as Partial<VideoScript>;

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
        return null;
      }

      const validatedScenes: SceneScript[] = [];

      for (let index = 0; index < parsed.scenes.length; index++) {
        const rawScene = parsed.scenes[index] as Partial<SceneScript>;
        const id = rawScene.id || `scene-${index + 1}`;
        const verbalVoiceover = rawScene.verbalVoiceover || rawScene.narrativeText || '';
        const narrativeText = rawScene.narrativeText || verbalVoiceover;
        const onScreenText = rawScene.onScreenText || rawScene.headline || '';

        if (!verbalVoiceover) {
          return null; // Scene without voiceover is invalid
        }

        const layoutType: LayoutType =
          rawScene.layoutType && VALID_LAYOUT_TYPES.includes(rawScene.layoutType)
            ? rawScene.layoutType
            : index === 0
            ? 'title-hook'
            : index === parsed.scenes.length - 1
            ? 'punchy-conclusion'
            : 'stat-highlight';

        const rawVisualCue = rawScene.visualCue;
        const cueType: VisualCueType =
          rawVisualCue?.type && VALID_VISUAL_CUE_TYPES.includes(rawVisualCue.type)
            ? rawVisualCue.type
            : 'metric-callout';

        const visualCue = {
          type: cueType,
          label: rawVisualCue?.label || 'METRICA CLAVE',
          value: rawVisualCue?.value || '100%',
          detail: rawVisualCue?.detail || '',
          accentColor: rawVisualCue?.accentColor || rawScene.accentColor || '#38bdf8',
          leftLabel: rawVisualCue?.leftLabel,
          leftValue: rawVisualCue?.leftValue,
          rightLabel: rawVisualCue?.rightLabel,
          rightValue: rawVisualCue?.rightValue,
        };

        validatedScenes.push({
          id,
          layoutType,
          verbalVoiceover,
          narrativeText,
          onScreenText,
          visualCue,
          hookArchetype: index === 0 ? rawScene.hookArchetype || hookArchetype : undefined,
          headline: rawScene.headline || `PUNTO ${index + 1}`,
          tagline: rawScene.tagline,
          accentColor: rawScene.accentColor || visualCue.accentColor || '#38bdf8',
          keywords: Array.isArray(rawScene.keywords) ? rawScene.keywords : [topic],
        });
      }

      return {
        title: parsed.title || `Video sobre ${topic}`,
        fps: typeof parsed.fps === 'number' && parsed.fps > 0 ? parsed.fps : 30,
        width: typeof parsed.width === 'number' && parsed.width > 0 ? parsed.width : 1080,
        height: typeof parsed.height === 'number' && parsed.height > 0 ? parsed.height : 1920,
        scenes: validatedScenes,
      };
    } catch {
      return null;
    }
  }

  private getDefaultScript(topic: string, hookArchetype: HookArchetype): VideoScript {
    const scenes: SceneScript[] = [
      {
        id: 'scene-1',
        hookArchetype,
        layoutType: 'title-hook',
        verbalVoiceover:
          'La mayoría sigue editando video arrastrando clips en una línea de tiempo manual. El video programático en código elimina ese cuello de botella.',
        narrativeText:
          'La mayoría sigue editando video arrastrando clips en una línea de tiempo manual. El video programático en código elimina ese cuello de botella.',
        onScreenText: 'TIMELINES MANUALES = CUELLO DE BOTELLA\nPROGRAMAR VIDEO = ESCALA INFINITA',
        visualCue: {
          type: 'warning-alert',
          label: 'WORKFLOW TRADICIONAL',
          value: 'LENTO Y MANUAL',
          detail: 'Remotion renderiza a 60 FPS con código determinista',
          accentColor: '#f59e0b',
        },
        headline: '¿EDITAR VIDEO A MANO?',
        tagline: 'INGENIERÍA VISUAL',
        accentColor: '#38bdf8',
        keywords: ['video', 'código', 'cuello de botella'],
      },
      {
        id: 'scene-2',
        layoutType: 'stat-highlight',
        verbalVoiceover:
          'Remotion compila cada fotograma usando React y CSS estándar. Cada frame se sincroniza con audio neuronal a nivel de milisegundo exacto.',
        narrativeText:
          'Remotion compila cada fotograma usando React y CSS estándar. Cada frame se sincroniza con audio neuronal a nivel de milisegundo exacto.',
        onScreenText: 'SINCRONÍA MILIMÉTRICA\nAUDIO NEURONAL + REACT CANVAS',
        visualCue: {
          type: 'metric-callout',
          label: 'PRECISIÓN TEMPORAL',
          value: '1 MS',
          detail: 'Sincronización palabra por palabra',
          accentColor: '#f43f5e',
        },
        headline: '60 FPS NATIVOS',
        tagline: 'PRECISIÓN ABSOLUTA',
        accentColor: '#f43f5e',
        keywords: ['Remotion', 'React', 'milisegundo'],
      },
      {
        id: 'scene-3',
        layoutType: 'punchy-conclusion',
        verbalVoiceover:
          'Inyectás un payload JSON, el motor calcula la duración exacta y el render exporta el MP4 final listo para distribuir en producción.',
        narrativeText:
          'Inyectás un payload JSON, el motor calcula la duración exacta y el render exporta el MP4 final listo para distribuir en producción.',
        onScreenText: 'PAYLOAD JSON -> TTS NEURONAL -> MP4\nAUTOMATIZACIÓN TOTAL',
        visualCue: {
          type: 'badge-highlight',
          label: 'ESTADO DE PIPELINE',
          value: 'LISTO PARA PRODUCCIÓN',
          detail: 'Zero render lag • Determinismo puro',
          accentColor: '#10b981',
        },
        headline: 'DE JSON A MP4',
        tagline: 'FLUJO CONTINUO',
        accentColor: '#10b981',
        keywords: ['JSON', 'pipeline', 'MP4'],
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
