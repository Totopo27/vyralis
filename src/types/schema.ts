export interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

export type LayoutType =
  | 'title-hook'
  | 'stat-highlight'
  | 'quote-callout'
  | 'split-compare'
  | 'punchy-conclusion';

export type HookArchetype =
  | 'contrarian'
  | 'investigator'
  | 'cost-confession'
  | 'speed-run';

export type VisualCueType =
  | 'metric-callout'
  | 'split-comparison'
  | 'warning-alert'
  | 'badge-highlight';

export interface VisualCue {
  type: VisualCueType;
  label?: string;
  value?: string;
  detail?: string;
  leftLabel?: string;
  leftValue?: string;
  rightLabel?: string;
  rightValue?: string;
  icon?: string;
  accentColor?: string;
}

export interface SceneScript {
  id: string;
  layoutType: LayoutType;
  narrativeText?: string;
  verbalVoiceover: string;
  onScreenText: string;
  visualCue: VisualCue;
  hookArchetype?: HookArchetype;
  headline: string;
  tagline?: string;
  accentColor?: string;
  keywords?: string[];
}

export interface RenderableScene extends SceneScript {
  audioFileName: string;
  audioDurationMs: number;
  durationInFrames: number;
  wordTimestamps: WordTimestamp[];
}

export interface VideoScript {
  title: string;
  fps: number;
  width: number;
  height: number;
  scenes: SceneScript[];
}

export interface VideoCompositionProps extends Record<string, unknown> {
  title: string;
  fps: number;
  scenes: RenderableScene[];
  [key: string]: unknown;
}
