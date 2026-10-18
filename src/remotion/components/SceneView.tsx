import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Audio, staticFile } from 'remotion';
import type { RenderableScene } from '../../types/schema';
import { KineticCaptions } from './KineticCaptions';

interface SceneViewProps {
  scene: RenderableScene;
}

export const SceneView: React.FC<SceneViewProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
    },
  });

  const titleTranslateY = interpolate(enterSpring, [0, 1], [60, 0]);
  const titleOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  const accentColor = scene.accentColor || '#38bdf8';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#090d16',
        backgroundImage: `radial-gradient(circle at 50% 25%, ${accentColor}22 0%, #030712 75%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '120px 60px 140px 60px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Audio track for this scene */}
      {scene.audioFileName && (
        <Audio src={staticFile(scene.audioFileName)} />
      )}

      {/* Top Section: Tagline / Layout Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY * 0.5}px)`,
        }}
      >
        <div
          style={{
            padding: '10px 24px',
            borderRadius: '9999px',
            backgroundColor: `${accentColor}18`,
            border: `1.5px solid ${accentColor}44`,
            color: accentColor,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '22px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {scene.tagline || scene.layoutType.replace('-', ' ')}
        </div>
      </div>

      {/* Middle Section: Main Headline & Graphic Visual */}
      <div
        style={{
          textAlign: 'center',
          transform: `translateY(${titleTranslateY}px)`,
          opacity: titleOpacity,
          margin: '30px 0',
        }}
      >
        <h1
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '76px',
            fontWeight: 900,
            lineHeight: 1.1,
            color: '#f8fafc',
            margin: 0,
            letterSpacing: '-0.03em',
            textShadow: '0 8px 30px rgba(0,0,0,0.8)',
          }}
        >
          {scene.headline}
        </h1>
      </div>

      {/* Bottom Section: Kinetic Captions */}
      <div style={{ width: '100%', minHeight: '180px' }}>
        <KineticCaptions
          words={scene.wordTimestamps}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
};
