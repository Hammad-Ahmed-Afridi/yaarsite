"use client";

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface ConfettiEffectProps {
  run: boolean;
  duration?: number; // Total duration confetti is visible (including fade)
  fadeDuration?: number; // How long the fade-out takes
}

export function ConfettiEffect({ run, duration = 15000, fadeDuration = 3000 }: ConfettiEffectProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (run) {
      setShowConfetti(true);
      setOpacity(1); // Ensure full opacity when starting

      // Start fading out before the total duration ends
      const fadeOutTimer = setTimeout(() => {
        setOpacity(0);
      }, duration - fadeDuration);

      // Completely unmount after total duration
      const hideTimer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    } else {
      // If run becomes false, immediately hide and reset
      setShowConfetti(false);
      setOpacity(1);
    }
  }, [run, duration, fadeDuration]);

  if (!showConfetti) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow clicks to pass through
        zIndex: 9999, // Ensure it's on top
        opacity: opacity,
        transition: `opacity ${fadeDuration / 1000}s ease-out`, // CSS transition for smooth fade
      }}
    >
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.05}
        initialVelocityY={-10}
        colors={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']}
      />
    </div>
  );
}