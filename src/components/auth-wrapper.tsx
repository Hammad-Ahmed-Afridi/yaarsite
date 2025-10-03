"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context-provider';
import { AppLoader } from '@/components/app-loader';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup', '/store', '/cart', '/checkout', '/landing'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const prevUserRef = useRef(user); // Track previous user state

  useEffect(() => {
    // Update prevUserRef *before* any state changes are processed in the next render
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (isSessionLoading) {
      setIsReadyToRender(false);
      return;
    }

    // Determine if the user was authenticated in the *previous* render cycle
    const wasUserPreviouslyAuthenticated = !!prevUserRef.current;

    if (user) {
      // User is currently authenticated
      if (pathname === '/signup') {
        // Allow signup page to render for authenticated users (e.g., after successful signup before redirect)
        setIsReadyToRender(true);
      } else if (pathname === '/login' || pathname === '/landing') {
        // Authenticated user on a public auth/landing page, redirect to dashboard
        router.push('/');
        setIsReadyToRender(false); // Keep loader visible until redirect completes
      } else {
        // Authenticated user on a protected page or already on dashboard
        setIsReadyToRender(true);
      }
    } else {
      // User is NOT currently authenticated
      if (pathname === '/') {
        if (wasUserPreviouslyAuthenticated) {
          // User just signed out from the dashboard (pathname was '/' and user was previously authenticated).
          // Explicitly redirect to login to ensure the correct behavior.
          router.push('/login');
          setIsReadyToRender(false);
        } else {
          // Initial unauthenticated access to root, redirect to landing page
          router.push('/landing');
          setIsReadyToRender(false);
        }
      } else if (!isPublicPath) {
        // Unauthenticated user on any other protected path, redirect to login
        router.push('/login');
        setIsReadyToRender(false);
      } else {
        // Unauthenticated user on a public path (login, signup, store, cart, checkout, landing)
        setIsReadyToRender(true);
      }
    }
  }, [user, isSessionLoading, pathname, router, isPublicPath]);

  // If not ready to render, show the full-screen loader
  if (!isReadyToRender) {
    return <AppLoader message="Loading..." isFullScreen={true} />;
  }

  // If ready to render, show the children
  return <>{children}</>;
}