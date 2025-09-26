"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityLogoutOptions {
  inactivityTimeoutMs: number;
  onLogout: () => void;
  enabled: boolean;
}

export function useInactivityLogout({ inactivityTimeoutMs, onLogout, enabled }: UseInactivityLogoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        onLogout();
      }, inactivityTimeoutMs);
    }
  }, [inactivityTimeoutMs, onLogout, enabled]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (enabled) {
      // Set initial timer
      resetTimer();

      // Add event listeners for user activity
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('touchstart', handleActivity);
      window.addEventListener('scroll', handleActivity);

      // Clean up event listeners and timer on component unmount or when disabled
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
        window.removeEventListener('scroll', handleActivity);
      };
    } else {
      // If not enabled, ensure any existing timer is cleared
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [enabled, resetTimer, handleActivity]);
}