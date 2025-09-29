"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

export function ScrollHintArrow() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce-down">
      <ChevronDown className="h-8 w-8 text-primary" />
    </div>
  );
}