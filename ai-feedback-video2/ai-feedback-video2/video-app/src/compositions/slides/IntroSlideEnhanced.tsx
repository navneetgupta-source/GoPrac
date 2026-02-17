import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';
import { CSSProperties } from 'react';
import { SessionIntro } from '../../types/content';
import { FONT_FAMILY, PALETTE } from '../../lib/config';
import { BackgroundCanvas } from '../../components/layout/BackgroundCanvas';
import { NarrationAudio } from '../../components/audio/NarrationAudio';
import { useSlideChoreography } from '../../hooks/useChoreography';

type IntroSlideProps = {
  intro: SessionIntro;
  heroTitle?: string;
};

const buttonStyle: CSSProperties = {
  marginTop: 48,
  padding: '20px 48px',
  borderRadius: 18,
  backgroundColor: PALETTE.azure,
  color: '#FFFFFF',
  fontSize: 30,
  fontWeight: 700,
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
};

/**
 * IntroSlide with Apple-keynote-style cinematic animations
 * - Camera dolly (subtle zoom-out)
 * - Lens focus reveal on background
 * - Elegant element entrances
 * - Hero shine effect on CTA button
 */
export const IntroSlideEnhanced: React.FC<IntroSlideProps> = ({ intro, heroTitle }) => {
  const frame = useCurrentFrame();
  const choreography = useSlideChoreography('intro_welcome');
  const headlineText = heroTitle ?? intro.headline;

  // Narration timing: delay narration start so visuals lead, and sync CTA/shine
  const INTRO_ANIMATIONS_DURATION = 80; // frames before narration starts
  const narrationDurationFrames = (choreography?.narration?.endFrame ?? 0) - (choreography?.narration?.startFrame ?? 0);
  const narrationStartFrame = INTRO_ANIMATIONS_DURATION;
  const adjustedNarrationEndFrame = narrationStartFrame + narrationDurationFrames;

  const findWordStart = (target: string) =>
    choreography?.narration?.wordTimings?.find(
      (w) => w.word.toLowerCase() === target.toLowerCase(),
    )?.startFrame ?? null;

  const letsStart = findWordStart("let’s") ?? findWordStart("let's") ?? findWordStart('lets');
  const diveStart = findWordStart('dive');
  const inStart = findWordStart('in');
  const ctaWordStart = letsStart ?? diveStart ?? inStart;

  // Global camera zoom (subtle dolly)
  const cameraScale = interpolate(
    frame,
    [0, 90], // 0s - 3s at 30fps
    [1.02, 1.0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.exp),
    }
  );

  // Background - keep static (remove blur to avoid jitter)
  const backgroundBlur = 0;
  const backgroundOpacity = 1;
  const backgroundScale = 1;
  const gradientDriftX = interpolate(frame, [0, 240], [0, -70], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });
  const gradientDriftY = interpolate(frame, [0, 240], [0, -30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });
  const gradientRotation = interpolate(frame, [0, 240], [0, 5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });

  const heroGlowOpacity = interpolate(frame, [24, 72], [0, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Logo animation
  const logoOpacity = interpolate(
    frame,
    [12, 36], // 0.4s - 1.2s
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const logoTranslateY = interpolate(
    frame,
    [12, 36],
    [-20, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const logoScale = interpolate(
    frame,
    [12, 36],
    [1.03, 1.0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  // Headline animation
  const headlineOpacity = interpolate(
    frame,
    [27, 51], // 0.9s - 1.7s
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.exp),
    }
  );

  const headlineTranslateY = interpolate(
    frame,
    [27, 51],
    [12, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.exp),
    }
  );

  const headlineScale = interpolate(
    frame,
    [27, 39],
    [1.02, 1.0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.exp),
    }
  );

  // Problem statement label animation
  const labelOpacity = interpolate(
    frame,
    [12, 30],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const labelTranslateY = interpolate(
    frame,
    [12, 30],
    [-18, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const labelLetterSpacing = interpolate(
    frame,
    [12, 36],
    [16, 10],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const accentBarScale = interpolate(
    frame,
    [24, 48],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.2)),
    }
  );

  // CTA: align with "let's dive in"
  const baseCtaStart = ctaWordStart !== null ? narrationStartFrame + ctaWordStart : adjustedNarrationEndFrame - 24;
  const ctaOpacity = interpolate(frame, [baseCtaStart, baseCtaStart + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  const ctaTranslateY = interpolate(frame, [baseCtaStart, baseCtaStart + 18], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  const ctaScale = interpolate(frame, [baseCtaStart, baseCtaStart + 18], [0.96, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  const ctaBlur = interpolate(frame, [baseCtaStart, baseCtaStart + 18], [3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  // Shine: right after narration ends, slower sweep
  const shineStart = adjustedNarrationEndFrame;
  const shineProgress = interpolate(frame, [shineStart, shineStart + 24], [-100, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });

  const shineOpacity = frame >= shineStart && frame <= shineStart + 24 ? 0.25 : 0;

  return (
    <AbsoluteFill>
      <div style={{ height: '100%', width: '100%', transform: `scale(${cameraScale})`, transformOrigin: 'center center' }}>
        <BackgroundCanvas>
          {/* Narration delayed start */}
          {choreography?.narration && (
            <NarrationAudio
              audioFile={choreography.narration.audioFile}
              startFrame={narrationStartFrame}
              enabled={true}
            />
          )}

          {/* Background (static) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: backgroundOpacity,
              filter: `blur(${backgroundBlur}px)`,
              transform: `scale(${backgroundScale})`,
              transformOrigin: 'center center',
            }}
          />

          <AbsoluteFill style={{ backgroundColor: '#FFFFFF', zIndex: 0 }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              overflow: 'hidden',
            }}
          >
            <Img
              src={staticFile('backgrounds/gradient-full.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.25,
              }}
            />
            <Img
              src={staticFile('backgrounds/gradient-half.png')}
              style={{
                position: 'absolute',
                inset: '-10% -5% -5% -10%',
                width: '120%',
                height: '120%',
                objectFit: 'cover',
                opacity: 0.35,
                mixBlendMode: 'multiply',
                filter: 'contrast(1.05)',
                transform: `translate(${gradientDriftX}px, ${gradientDriftY}px) rotate(${gradientRotation}deg) scale(1.12)`,
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: '15% 20% 25% 20%',
              borderRadius: 260,
              background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.58), rgba(255,255,255,0))',
              filter: 'blur(40px)',
              opacity: heroGlowOpacity,
              transform: 'translateY(-10px)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: FONT_FAMILY,
              color: '#000000',
              textAlign: 'center',
              padding: '80px 120px',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 1,
            }}
          >
          {/* Logo with animation */}
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: 80,
              opacity: logoOpacity,
              transform: `translateY(${logoTranslateY}px) scale(${logoScale})`,
            }}
          >
            <Img
              src={staticFile('brand/goprac_logo.jpg')}
              width={150}
              height={150}
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: `${labelLetterSpacing}px`,
              marginBottom: 24,
              color: '#1f1f1f',
              opacity: labelOpacity,
              transform: `translateY(${labelTranslateY}px)`,
              textTransform: 'uppercase',
            }}
          >
            PROBLEM STATEMENT:
            <div
              style={{
                marginTop: 14,
                height: 6,
                borderRadius: 999,
                background: 'linear-gradient(90deg, rgba(42,126,255,0.85), rgba(134,65,244,0.85))',
                transformOrigin: 'left center',
                transform: `scaleX(${accentBarScale})`,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: 3,
              marginBottom: 30,
              opacity: headlineOpacity,
              transform: `translateY(${headlineTranslateY}px) scale(${headlineScale})`,
            }}
          >
            {headlineText}
          </div>

          {/* CTA Button with shine */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              marginTop: 48,
              opacity: ctaOpacity,
              transform: `translateY(${ctaTranslateY}px) scale(${ctaScale})`,
              filter: `blur(${ctaBlur}px)`,
            }}
          >
            <div style={buttonStyle}>{intro.cta_text}</div>

            {/* Shine overlay */}
            {shineOpacity > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${shineProgress}%`,
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  pointerEvents: 'none',
                  opacity: shineOpacity,
                }}
              />
            )}
          </div>
          </div>
        </BackgroundCanvas>
      </div>
    </AbsoluteFill>
  );
};
