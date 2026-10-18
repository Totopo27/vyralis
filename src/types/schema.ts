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

export interface SceneScript {
  id: string;
  layoutType: LayoutType;
  narrativeText: string;
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

export interface VideoCompositionProps {
  title: string;
  fps: number;
  scenes: RenderableScene[];
}
