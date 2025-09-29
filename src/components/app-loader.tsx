"use client";

import React from 'react';
import { Store } from 'lucide-react'; // Removed Loader2 import

interface AppLoaderProps {
  message?: string;
  icon?: React.ElementType; // Allow custom icon if needed
  size?: 'sm' | 'md' | 'lg';
}

export function AppLoader({ message = "Loading...", icon: Icon = Store, size = 'md' }: AppLoaderProps) {
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
        {/* Removed Loader2 for a cleaner look */}
      </div>
      <p className={`${textSizeClasses[size]} text-foreground font-medium text-center`}>
        {message}
      </p>
    </div>
  );
}