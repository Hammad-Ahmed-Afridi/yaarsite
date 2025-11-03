"use client";

import React from 'react';
import { useSession } from '@/components/session-context-provider';

export function InactivityWarningBanner() {
  const { user, isLoading: isSessionLoading } = useSession();

  // Only show the banner if a user is logged in and session is not loading
  if (!user || isSessionLoading) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden bg-black text-white py-1 text-sm text-center">
      <div className="animate-marquee whitespace-nowrap">
        You will be signed out after 2 minutes of inactivity. Kindly sign back in.
      </div>
    </div>
  );
};