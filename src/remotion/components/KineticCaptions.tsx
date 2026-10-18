import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { WordTimestamp } from '../../types/schema';

interface KineticCaptionsProps {
  words: WordTimestamp[];
  accentColor?: string;
}

export const KineticCaptions: React.FC<KineticCaptionsProps> = ({
  words,
  accentColor = '#38bdf8',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px 18px',
        padding: '0 40px',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      {words.map((item, index) => {
        const isCurrent = currentTimeMs >= item.startMs && currentTimeMs <= item.endMs;
        const isPast = currentTimeMs > item.endMs;

        const wordStartFrame = (item.startMs / 1000) * fps;
        const wordSpring = spring({
          frame: frame - wordStartFrame,
          fps,
          config: {
            damping: 12,
            stiffness: 220,
            mass: 0.7,
          },
        });

        const scale = isCurrent
          ? interpolate(wordSpring, [0, 1], [0.85, 1.18])
          : isPast
          ? 1.0
          : 0.95;

        const opacity = isPast ? 0.65 : isCurrent ? 1 : 0.25;

        return (
          <span
            key={`${index}-${item.word}`}
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '44px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: isCurrent ? accentColor : '#ffffff',
              opacity,
              transform: `scale(${scale})`,
              display: 'inline-block',
              textShadow: isCurrent ? `0 0 30px ${accentColor}88, 0 4px 12px rgba(0,0,0,0.8)` : '0 2px 8px rgba(0,0,0,0.6)',
              transition: 'color 0.08s ease',
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};
