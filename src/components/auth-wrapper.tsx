"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context-provider';
import { AppLoader } from '@/components/app-loader';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading, isSigningOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup', '/store', '/cart', '/checkout', '/landing', '/terms-and-conditions', '/download-app'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  const [isReadyToRender, setIsReadyToRender] = useState(false);

  useEffect(() => {
    console.log("AuthWrapper: useEffect triggered.");
    console.log("AuthWrapper: Current user:", user?.id);
    console.log("AuthWrapper: isSessionLoading:", isSessionLoading);
    console.log("AuthWrapper: isSigningOut:", isSigningOut);
    console.log("AuthWrapper: pathname:", pathname);

    // 1. If session is still loading, we don't know the auth state yet.
    //    Keep showing loader and don't make any routing decisions.
    if (isSessionLoading) {
      console.log("AuthWrapper: Session loading, not ready to render.");
      setIsReadyToRender(false);
      return;
    }

    // 2. If a sign-out is in progress, always redirect to login.
    if (isSigningOut) {
      console.log("AuthWrapper: Sign-out in progress, redirecting to /login.");
      if (pathname !== '/login') {
        router.push('/login');
      }
      setIsReadyToRender(false); // Don't render children while redirecting
      return;
    }

    // Now, session loading is complete and no sign-out is in progress.
    // We can make definitive routing decisions.

    if (user) {
      // User is authenticated
      console.log("AuthWrapper: User is authenticated.");
      if (pathname === '/login' || pathname === '/landing' || pathname === '/signup') {
        // Authenticated user on an auth/landing page, redirect to dashboard
        console.log("AuthWrapper: Authenticated user on auth/landing page, redirecting to /.");
        router.push('/');
        setIsReadyToRender(false); // Don't render children while redirecting
      } else {
        // Authenticated user on any other page (including protected ones or public store pages), allow rendering
        console.log("AuthWrapper: Authenticated user on protected page, allowing render.");
        setIsReadyToRender(true);
      }
    } else {
      // User is NOT authenticated
      console.log("AuthWrapper: User is NOT authenticated.");
      if (isPublicPath) {
        // Unauthenticated user on an explicitly public path, allow rendering
        console.log("AuthWrapper: Unauthenticated user on public path, allowing render.");
        setIsReadyToRender(true);
      } else if (pathname === '/') {
        // Unauthenticated user on the root path.
        // Check if they were previously authenticated on the dashboard (e.g., after inactivity logout).
        const wasAuthenticatedOnDashboard = typeof window !== 'undefined' && localStorage.getItem('wasAuthenticatedOnDashboard') === 'true';
        if (wasAuthenticatedOnDashboard) {
          console.log("AuthWrapper: Unauthenticated on root, but was previously on dashboard. Redirecting to /login.");
          router.push('/login'); // Redirect to login if they were on dashboard
        } else {
          console.log("AuthWrapper: Unauthenticated on root, fresh visit. Redirecting to /landing.");
          router.push('/landing'); // Redirect to landing for fresh unauthenticated visits
        }
        setIsReadyToRender(false); // Don't render children while redirecting
      } else {
        // Unauthenticated user on a protected path, redirect to login
        console.log("AuthWrapper: Unauthenticated on protected path, redirecting to /login.");
        router.push('/login');
        setIsReadyToRender(false); // Don't render children while redirecting
      }
    }
  }, [user, isSessionLoading, isSigningOut, pathname, router, isPublicPath]);

  // If not ready to render, show the full-screen loader
  if (!isReadyToRender) {
    return <AppLoader message="Loading..." isFullScreen={true} />;
  }

  // If ready to render, show the children
  return <>{children}</>;
}