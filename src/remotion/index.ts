import { registerRoot, Composition } from 'remotion';
import React from 'react';
import { MainVideoComposition } from './Composition';
import type { VideoCompositionProps } from '../types/schema';

export const RemotionRoot: React.FC = () => {
  return React.createElement(
    Composition as React.ComponentType<{
      id: string;
      component: React.ComponentType<VideoCompositionProps>;
      durationInFrames: number;
      fps: number;
      width: number;
      height: number;
      defaultProps: VideoCompositionProps;
      calculateMetadata?: (options: {
        props: VideoCompositionProps;
        defaultProps: VideoCompositionProps;
        abortSignal: AbortSignal;
        compositionId: string;
        isRendering: boolean;
      }) => Promise<{ durationInFrames: number; fps: number }> | { durationInFrames: number; fps: number };
    }>,
    {
      id: 'AIVideoComposition',
      component: MainVideoComposition,
      durationInFrames: 300,
      fps: 30,
      width: 1080,
      height: 1920,
      defaultProps: {
        title: 'Video Demo',
        fps: 30,
        scenes: [],
      },
      calculateMetadata: async ({ props }) => {
        const totalDuration =
          props.scenes?.reduce(
            (acc, scene) => acc + (scene.durationInFrames || 90),
            0
          ) || 300;

        return {
          durationInFrames: Math.max(30, totalDuration),
          fps: props.fps || 30,
        };
      },
    }
  );
};

registerRoot(RemotionRoot);
