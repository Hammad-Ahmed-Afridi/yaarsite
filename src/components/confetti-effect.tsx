"use client";

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface ConfettiEffectProps {
  run: boolean;
  duration?: number; // Duration in milliseconds for how long confetti runs
}

export function ConfettiEffect({ run, duration = 4000 }: ConfettiEffectProps) { // Set default duration to 4 seconds
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
        numberOfPieces={1000} // High number of pieces for full effect
        gravity={0.02} // Very low gravity for slower fall
        initialVelocityY={-30} // Strong initial upward velocity for wide spread
        initialVelocityX={{ min: -20, max: 20 }} // Corrected: Changed to object { min, max }
        confettiSource={{
          x: 0, // Start from the left edge
          y: 0, // Start from the top edge
          w: width, // Span the entire width
          h: height, // Span the entire height
        }}
        colors={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']}
      />
    </div>
  );
}