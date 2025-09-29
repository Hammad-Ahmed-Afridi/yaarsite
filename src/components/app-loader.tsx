"use client";

import React from 'react';
import { cn } from '@/lib/utils'; // Import cn for conditional classNames

interface AppLoaderProps {
  message?: string;
  secondaryMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string; // Add className prop for external styling
}

export function AppLoader({ message = "Loading...", secondaryMessage, size = 'md', className }: AppLoaderProps) {
  const iconSizeClasses = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-8xl",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-background text-foreground", // Removed min-h-screen and p-4
      className // Apply external className
    )}>
      <div className="relative flex items-center justify-center mb-4">
        <span className={`${iconSizeClasses[size]} font-bold text-primary animate-spin-slow`}>
          Ys
        </span>
      </div>
      <p className={`${textSizeClasses[size]} text-foreground font-medium text-center`}>
        {message}
      </p>
      {secondaryMessage && (
        <p className={`${textSizeClasses[size]} text-muted-foreground text-center mt-2`}>
          {secondaryMessage}
        </p>
      )}
    </div>
  );
}