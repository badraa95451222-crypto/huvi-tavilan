import React, { useEffect, useRef } from 'react';
import { SpeakerId } from '../types/game';

interface PixelPortraitProps {
  speaker: SpeakerId;
  size?: number;
  className?: string;
  animate?: boolean;
  isSpeaking?: boolean;
}

export const PixelPortrait: React.FC<PixelPortraitProps> = ({
  speaker,
  size = 56,
  className = '',
  animate = true,
  isSpeaking = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;

    const drawFrame = (timeMs: number) => {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 16, 16);

      const fill = (x: number, y: number, w: number, h: number, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
      };

      const shouldAnimate = animate && !prefersReduced;

      // Background frame
      fill(0, 0, 16, 16, '#121521');

      if (speaker === 'narrator') {
        const flicker = shouldAnimate && Math.sin(timeMs / 140) > 0.35 ? 1 : 0;
        fill(3, 3, 10, 10, '#1e2233');
        fill(7, 5, 2, 6, '#e3d8c1');
        fill(7, 3 - flicker, 2, 2 + flicker, '#f5b84c');
        fill(5, 11, 6, 2, '#69533b');
        return;
      }

      if (speaker === 'shadow') {
        const hover = shouldAnimate ? Math.round(Math.sin(timeMs / 320)) : 0;
        fill(2, 1 + hover, 12, 15, '#07040a');
        fill(4, 2 + hover, 8, 12, '#13091a');
        fill(5, 6 + hover, 2, 2, '#f24b64');
        fill(9, 6 + hover, 2, 2, '#f24b64');
        fill(6, 10 + hover, 4, 1, '#5e1c29');
        return;
      }

      const styles = {
        destiny: {
          bg: '#1c2030',
          hair: '#1a1624',
          skin: '#e6c5a8',
          jawShadow: '#cca789',
          coat: '#2c3245',
          accent: '#d99b43',
          eyes: '#171924',
        },
        kryss: {
          bg: '#141a24',
          hair: '#151b26',
          skin: '#dfc0a5',
          jawShadow: '#c29f82',
          coat: '#212a38',
          accent: '#4a6585',
          eyes: '#121824',
        },
        mikey: {
          bg: '#261b12',
          hair: '#5c361e',
          skin: '#e7c19e',
          jawShadow: '#c99f7b',
          coat: '#994e1f',
          accent: '#f0b85b',
          eyes: '#261810',
        },
        vana: {
          bg: '#12191c',
          hair: '#1a1e26',
          skin: '#e3c7b4',
          jawShadow: '#bfa18d',
          coat: '#1c2329',
          accent: '#4c706a',
          eyes: '#12181c',
        },
      }[speaker];

      // Subtle breathing & horror atmosphere motion (1px chest/head cadence)
      let breathOffset = 0;
      let shoulderBreath = 0;
      let isBlinking = false;
      let eyeShiftX = 0;

      if (shouldAnimate) {
        if (speaker === 'mikey') {
          // Slightly quicker, anxious breathing + occasional nervous side glance
          const cycle = Math.sin(timeMs / 480);
          shoulderBreath = cycle > 0.35 ? -1 : 0;
          breathOffset = cycle > 0.65 ? -1 : 0;
          const glanceWindow = Math.floor(timeMs / 2400) % 4;
          if (glanceWindow === 2) eyeShiftX = 1;
          isBlinking = timeMs % 3400 > 3280;
        } else if (speaker === 'vana') {
          // Slow, uncanny, deep rhythmic breathing + cold eerie mist drift
          const cycle = Math.sin(timeMs / 820);
          shoulderBreath = cycle > 0.25 ? -1 : 0;
          breathOffset = cycle > 0.55 ? -1 : 0;
          isBlinking = timeMs % 4200 > 4060;
        } else {
          // Subtle calm breathing for Kryss & Destiny
          const cycle = Math.sin(timeMs / 950);
          shoulderBreath = cycle > 0.5 ? -1 : 0;
          isBlinking = timeMs % 4600 > 4480;
        }
      }

      fill(0, 0, 16, 16, styles.bg);

      // Eerie cold background drift for Vana & tense vignette pulse for Mikey
      if (shouldAnimate && speaker === 'vana') {
        const mistX = Math.floor(timeMs / 360) % 16;
        fill(mistX, 2, 3, 1, 'rgba(124, 196, 184, 0.16)');
        fill((mistX + 8) % 16, 10, 4, 1, 'rgba(124, 196, 184, 0.12)');
      } else if (shouldAnimate && speaker === 'mikey') {
        const pulse = Math.sin(timeMs / 550) > 0.6;
        if (pulse) {
          fill(0, 0, 16, 1, 'rgba(230, 168, 76, 0.12)');
          fill(0, 15, 16, 1, 'rgba(0, 0, 0, 0.35)');
        }
      }

      // Broad masculine shoulders & coat (rises slightly on inhale)
      fill(1, 12 + shoulderBreath, 14, 5 - shoulderBreath, styles.coat);
      if (speaker === 'mikey') {
        fill(6, 12 + shoulderBreath, 4, 4 - shoulderBreath, '#24201d');
        fill(4, 12 + shoulderBreath, 2, 2, styles.accent);
        fill(10, 12 + shoulderBreath, 2, 2, styles.accent);
      } else if (speaker === 'vana') {
        fill(4, 11 + shoulderBreath, 8, 2, styles.coat);
        fill(5, 12 + shoulderBreath, 6, 1, styles.accent);
      } else {
        fill(5, 12 + shoulderBreath, 6, 2, styles.accent);
      }

      // Thick neck
      fill(6, 10 + breathOffset, 4, 3, styles.jawShadow);

      // Structured masculine jawline & face
      fill(4, 4 + breathOffset, 8, 7, styles.skin);
      fill(4, 10 + breathOffset, 8, 1, styles.jawShadow);

      // Short male hairstyles — distinct, zero long female hair
      if (speaker === 'mikey') {
        fill(3, 2 + breathOffset, 10, 3, styles.hair);
        fill(4, 1 + breathOffset, 3, 2, styles.hair);
        fill(8, 1 + breathOffset, 3, 2, styles.hair);
        fill(11, 2 + breathOffset, 2, 3, styles.hair);
        fill(3, 4 + breathOffset, 1, 2, styles.hair);
      } else if (speaker === 'vana') {
        fill(3, 2 + breathOffset, 10, 3, styles.hair);
        fill(4, 1 + breathOffset, 7, 1, styles.hair);
        fill(3, 4 + breathOffset, 1, 3, styles.hair);
        fill(12, 4 + breathOffset, 1, 2, styles.hair);
        fill(9, 4 + breathOffset, 3, 1, styles.hair);
      } else {
        fill(3, 2 + breathOffset, 10, 3, styles.hair);
        fill(3, 4 + breathOffset, 1, 3, styles.hair);
        fill(12, 4 + breathOffset, 1, 3, styles.hair);
      }

      // Masculine eyebrows
      if (speaker === 'kryss' || speaker === 'vana') {
        fill(5, 6 + breathOffset, 2, 1, styles.hair);
        fill(9, 6 + breathOffset, 2, 1, styles.hair);
      } else if (speaker === 'mikey') {
        fill(5, 5 + breathOffset, 2, 1, styles.hair);
        fill(9, 5 + breathOffset, 2, 1, styles.hair);
      }

      // Eyes (with natural blink & Mikey's anxious side glance)
      if (isBlinking) {
        fill(5, 8 + breathOffset, 2, 1, styles.eyes);
        fill(9, 8 + breathOffset, 2, 1, styles.eyes);
      } else {
        fill(5 + eyeShiftX, 7 + breathOffset, 2, 2, styles.eyes);
        fill(9 + eyeShiftX, 7 + breathOffset, 2, 2, styles.eyes);
      }

      // Mouth (subtle speaking animation while typing dialogue)
      const mouthOpen = shouldAnimate && isSpeaking && Math.floor(timeMs / 130) % 2 === 0;
      if (mouthOpen) {
        fill(7, 9 + breathOffset, 2, 1, '#593326');
      } else if (speaker === 'mikey') {
        fill(6, 9 + breathOffset, 4, 1, '#9c664e');
      } else {
        fill(7, 9 + breathOffset, 2, 1, '#9c664e');
      }
    };

    if (!animate || prefersReduced) {
      drawFrame(0);
      return;
    }

    const loop = (timeMs: number) => {
      drawFrame(timeMs);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [speaker, animate, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      width={16}
      height={16}
      style={{ width: size, height: size }}
      className={`pixelated border-2 border-[#3e445c] bg-[#10131e] shrink-0 ${className}`}
      aria-label={speaker}
    />
  );
};
