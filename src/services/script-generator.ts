import type { VideoScript, SceneScript, HookArchetype } from '../types/schema';

export interface ScriptGeneratorOptions {
  hookArchetype?: HookArchetype;
}

/**
 * ScriptGenerator generates video scripts following the 'escribe-humano' protocol and
 * the Vyral Content 3-layer architecture:
 * 1. verbalVoiceover: Crisp, conversational voiceover for TTS with no AI moralizing or clichés.
 * 2. onScreenText: High-impact complementary visual typography designed for retention.
 * 3. visualCue: Interactive animated graphics and spatial feedback (metrics, alerts, comparisons, badges).
 */
export class ScriptGenerator {
  /**
   * Generates a video script structured across the 3 Vyral Content layers.
   */
  async generate(
    topic: string = 'Remotion y React',
    options?: ScriptGeneratorOptions
  ): Promise<VideoScript> {
    const hookArchetype: HookArchetype = options?.hookArchetype || 'contrarian';

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
