"use client";

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface ConfettiEffectProps {
  run: boolean;
  duration?: number; // Duration in milliseconds for how long confetti runs
}

export function ConfettiEffect({ run, duration = 5000 }: ConfettiEffectProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (run) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [run, duration]);

  if (!showConfetti) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false} // Only run once
      numberOfPieces={500} // Increased number of pieces for fuller coverage
      gravity={0.05} // Reduced gravity to make confetti fall slower
      initialVelocityY={-10} // Increased upward velocity for higher spread
      colors={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']} // Tailwind-inspired colors
    />
  );
}