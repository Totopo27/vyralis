import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { VisualCue } from '../../types/schema';

interface VisualCueViewProps {
  cue: VisualCue;
  accentColor?: string;
}

export const VisualCueView: React.FC<VisualCueViewProps> = ({ cue, accentColor = '#38bdf8' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 110,
      mass: 0.8,
    },
  });

  const scale = interpolate(enterSpring, [0, 1], [0.85, 1]);
  const opacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const translateY = interpolate(enterSpring, [0, 1], [40, 0]);

  // Subtle floating breathing effect after enter
  const breathe = Math.sin(frame / 15) * 4;

  const resolvedAccent = cue.accentColor || accentColor;

  const baseCardStyle: React.CSSProperties = {
    opacity,
    transform: `translateY(${translateY + breathe}px) scale(${scale})`,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    border: `1.5px solid ${resolvedAccent}44`,
    borderRadius: '24px',
    padding: '36px 44px',
    boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px ${resolvedAccent}22`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '860px',
    margin: '0 auto',
    boxSizing: 'border-box',
    backdropFilter: 'blur(20px)',
  };

  if (cue.type === 'metric-callout') {
    return (
      <div style={baseCardStyle}>
        {cue.label && (
          <div
            style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: resolvedAccent,
              marginBottom: '12px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {cue.label}
          </div>
        )}
        <div
          style={{
            fontSize: '110px',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: '#f8fafc',
            textShadow: `0 0 30px ${resolvedAccent}66`,
            margin: '8px 0 16px 0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {cue.value || '0'}
        </div>
        {cue.detail && (
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              backgroundColor: `${resolvedAccent}18`,
              border: `1px solid ${resolvedAccent}40`,
              color: '#e2e8f0',
              fontSize: '22px',
              fontWeight: 600,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {cue.detail}
          </div>
        )}
      </div>
    );
  }

  if (cue.type === 'split-comparison') {
    const leftLabel = cue.leftLabel || 'ANTES';
    const leftValue = cue.leftValue || 'Manual';
    const rightLabel = cue.rightLabel || 'AHORA';
    const rightValue = cue.rightValue || cue.value || 'Remotion';

    return (
      <div style={baseCardStyle}>
        {cue.label && (
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: resolvedAccent,
              marginBottom: '24px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {cue.label}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: '20px',
          }}
        >
          {/* Left Block */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '24px 16px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#f87171',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px',
              }}
            >
              {leftLabel}
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#fca5a5',
              }}
            >
              {leftValue}
            </div>
          </div>

          {/* VS Badge */}
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              border: `2px solid ${resolvedAccent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: resolvedAccent,
              fontWeight: 900,
              fontSize: '20px',
              boxShadow: `0 0 20px ${resolvedAccent}44`,
            }}
          >
            VS
          </div>

          {/* Right Block */}
          <div
            style={{
              flex: 1,
              backgroundColor: `${resolvedAccent}15`,
              border: `1.5px solid ${resolvedAccent}50`,
              borderRadius: '16px',
              padding: '24px 16px',
              textAlign: 'center',
              boxShadow: `0 0 25px ${resolvedAccent}22`,
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: resolvedAccent,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px',
              }}
            >
              {rightLabel}
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#f8fafc',
              }}
            >
              {rightValue}
            </div>
          </div>
        </div>

        {cue.detail && (
          <div
            style={{
              marginTop: '20px',
              color: '#94a3b8',
              fontSize: '20px',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {cue.detail}
          </div>
        )}
      </div>
    );
  }

  if (cue.type === 'warning-alert') {
    return (
      <div
        style={{
          ...baseCardStyle,
          border: `1.5px solid ${resolvedAccent}66`,
          backgroundColor: 'rgba(24, 18, 12, 0.85)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: resolvedAccent,
              boxShadow: `0 0 12px ${resolvedAccent}`,
            }}
          />
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: resolvedAccent,
            }}
          >
            {cue.label || 'ALERTA TÉCNICA'}
          </span>
        </div>
        <div
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#f8fafc',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            marginBottom: '14px',
            lineHeight: 1.2,
          }}
        >
          {cue.value}
        </div>
        {cue.detail && (
          <div
            style={{
              fontSize: '22px',
              color: '#cbd5e1',
              textAlign: 'center',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {cue.detail}
          </div>
        )}
      </div>
    );
  }

  // Fallback / badge-highlight
  return (
    <div style={baseCardStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 16px',
          borderRadius: '9999px',
          backgroundColor: `${resolvedAccent}22`,
          border: `1px solid ${resolvedAccent}55`,
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: resolvedAccent,
            boxShadow: `0 0 10px ${resolvedAccent}`,
          }}
        />
        <span
          style={{
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: resolvedAccent,
          }}
        >
          {cue.label || 'STATUS'}
        </span>
      </div>
      <div
        style={{
          fontSize: '48px',
          fontWeight: 900,
          color: '#f8fafc',
          textAlign: 'center',
          letterSpacing: '-0.02em',
          marginBottom: '12px',
        }}
      >
        {cue.value}
      </div>
      {cue.detail && (
        <div
          style={{
            fontSize: '22px',
            color: '#94a3b8',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {cue.detail}
        </div>
      )}
    </div>
  );
};
