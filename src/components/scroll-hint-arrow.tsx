"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

export function ScrollHintArrow() {
  return (
    <div className="animate-bounce-down"> {/* Removed fixed positioning and related styles */}
      <ChevronDown className="h-8 w-8 text-primary" />
    </div>
  );
}