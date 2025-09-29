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
    <div className="relative w-full overflow-hidden bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 py-1 text-sm text-center">
      <div className="animate-marquee whitespace-nowrap">
        You will be signed out after 1 minute of inactivity. For preventing signing out be active on the dashboard.
      </div>
    </div>
  );
};