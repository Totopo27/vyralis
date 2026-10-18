import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Audio, staticFile } from 'remotion';
import type { RenderableScene } from '../../types/schema';
import { KineticCaptions } from './KineticCaptions';
import { VisualCueView } from './VisualCueView';

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
        padding: '100px 60px 120px 60px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Audio track for this scene */}
      {scene.audioFileName && (
        <Audio src={staticFile(scene.audioFileName)} />
      )}

      {/* Top Section: Tagline / Layout Badge / Hook Archetype */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
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

        {scene.hookArchetype && (
          <div
            style={{
              padding: '10px 22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(255, 255, 255, 0.18)',
              color: '#f8fafc',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '20px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            HOOK: {scene.hookArchetype}
          </div>
        )}
      </div>

      {/* Middle-Upper Section: Main Headline & OnScreenText Layer */}
      <div
        style={{
          textAlign: 'center',
          transform: `translateY(${titleTranslateY}px)`,
          opacity: titleOpacity,
          margin: '20px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '76px',
            fontWeight: 900,
            lineHeight: 1.1,
            color: '#f8fafc',
            margin: '0 0 20px 0',
            letterSpacing: '-0.03em',
            textShadow: '0 8px 30px rgba(0,0,0,0.8)',
          }}
        >
          {scene.headline}
        </h1>

        {scene.onScreenText && (
          <div
            style={{
              padding: '18px 36px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              maxWidth: '860px',
            }}
          >
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '32px',
                fontWeight: 800,
                color: '#f1f5f9',
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
                whiteSpace: 'pre-line',
                textTransform: 'uppercase',
              }}
            >
              {scene.onScreenText}
            </div>
          </div>
        )}
      </div>

      {/* Center Section: Animated VisualCue Layer */}
      {scene.visualCue && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            margin: '20px 0',
          }}
        >
          <VisualCueView cue={scene.visualCue} accentColor={accentColor} />
        </div>
      )}

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
