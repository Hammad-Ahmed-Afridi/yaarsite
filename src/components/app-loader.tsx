"use client";

import React from 'react';
import { Store } from 'lucide-react';

interface AppLoaderProps {
  message?: string;
  secondaryMessage?: string; // New prop for secondary message
  icon?: React.ElementType;
  size?: 'sm' | 'md' | 'lg';
}

export function AppLoader({ message = "Loading...", secondaryMessage, icon: Icon = Store, size = 'md' }: AppLoaderProps) {
  const iconSizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="relative flex items-center justify-center mb-4">
        <Icon className={`${iconSizeClasses[size]} text-primary animate-spin-slow`} />
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