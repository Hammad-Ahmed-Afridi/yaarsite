"use client";

import { Loader2 } from 'lucide-react';
import React from 'react';

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading application...</p>
    </div>
  );
}