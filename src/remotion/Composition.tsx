import React from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import type { VideoCompositionProps } from '../types/schema';
import { SceneView } from './components/SceneView';

export const MainVideoComposition: React.FC<VideoCompositionProps> = ({ scenes }) => {
  const { fps } = useVideoConfig();

  let accumulatedFrames = 0;

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#000000',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {scenes.map((scene) => {
        const fromFrame = accumulatedFrames;
        const duration = scene.durationInFrames;
        accumulatedFrames += duration;

        return (
          <Sequence
            key={scene.id}
            from={fromFrame}
            durationInFrames={duration}
            name={`Scene-${scene.id}`}
          >
            <SceneView scene={scene} />
          </Sequence>
        );
      })}
    </div>
  );
};
