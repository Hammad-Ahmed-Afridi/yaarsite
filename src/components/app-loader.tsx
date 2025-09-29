"use client";

import React from 'react';
// Removed Store import as it's no longer used

interface AppLoaderProps {
  message?: string;
  secondaryMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AppLoader({ message = "Loading...", secondaryMessage, size = 'md' }: AppLoaderProps) {
  const iconSizeClasses = {
    sm: "text-4xl", // Adjusted for text size
    md: "text-6xl",
    lg: "text-8xl",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
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