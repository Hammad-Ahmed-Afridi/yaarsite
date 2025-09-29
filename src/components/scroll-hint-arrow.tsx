"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

export function ScrollHintArrow() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 animate-bounce-down z-50">
      <ChevronDown className="h-8 w-8 text-primary" />
    </div>
  );
}