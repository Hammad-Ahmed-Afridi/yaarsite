"use client";

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface ConfettiEffectProps {
  run: boolean;
  duration?: number; // Duration in milliseconds for how long confetti runs
}

export function ConfettiEffect({ run, duration = 10000 }: ConfettiEffectProps) { // Increased default duration to 10 seconds
  const { width, height } = useWindowSize();
  const [shouldRenderConfetti, setShouldRenderConfetti] = useState(false);

  useEffect(() => {
    if (run) {
      setShouldRenderConfetti(true);
      const timer = setTimeout(() => {
        setShouldRenderConfetti(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      // If 'run' becomes false externally, stop confetti immediately
      setShouldRenderConfetti(false);
    }
  }, [run, duration]);

  if (!shouldRenderConfetti) return null;

  return (
    <div className="fixed inset-0 z-[9999]"> {/* Wrapper div with high z-index */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={1000} // Already high for maximum visibility
        gravity={0.03} // Further reduced gravity to make pieces fall even slower
        initialVelocityY={-20} // Increased initial upward velocity for a higher spread
        confettiSource={{
          x: width / 2,
          y: height / 2,
          w: width,
          h: height,
        }}
        colors={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']}
      />
    </div>
  );
}