"use client";

import React from 'react';

interface StoreWelcomeBannerProps {
  message: string;
}

export function StoreWelcomeBanner({ message }: StoreWelcomeBannerProps) {
  return (
    <div className="relative w-full overflow-hidden bg-store-primary text-store-primary-foreground py-1 text-sm text-center">
      <div className="animate-marquee whitespace-nowrap">
        {message}
      </div>
    </div>
  );
};