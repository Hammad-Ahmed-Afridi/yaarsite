"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context-provider';
import { AppLoader } from '@/components/app-loader';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading, isSigningOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup', '/store', '/cart', '/checkout', '/landing', '/terms-and-conditions'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Use a ref to track if a redirect has already been initiated for the current state
  const redirectInitiatedRef = useRef(false);

  useEffect(() => {
    console.log("AuthWrapper: useEffect triggered.");
    console.log("AuthWrapper: Current user:", user?.id);
    console.log("AuthWrapper: isSessionLoading:", isSessionLoading);
    console.log("AuthWrapper: isSigningOut:", isSigningOut);
    console.log("AuthWrapper: pathname:", pathname);

    // If session is still loading, we can't make a decision yet.
    if (isSessionLoading) {
      console.log("AuthWrapper: Session loading, waiting...");
      redirectInitiatedRef.current = false; // Reset redirect flag while loading
      return;
    }

    // If a sign-out is in progress, always redirect to login if not already there.
    if (isSigningOut) {
      console.log("AuthWrapper: Sign-out in progress.");
      if (pathname !== '/login' && !redirectInitiatedRef.current) {
        console.log("AuthWrapper: Redirecting to /login due to sign-out.");
        router.push('/login');
        redirectInitiatedRef.current = true;
      }
      return; // Don't render children while signing out
    }

    // --- Logic for authenticated users ---
    if (user) {
      console.log("AuthWrapper: User is authenticated.");
      redirectInitiatedRef.current = false; // Reset redirect flag for authenticated state

      // If authenticated user is on login/landing, redirect to dashboard
      if (pathname === '/login' || pathname === '/landing') {
        console.log("AuthWrapper: Authenticated user on auth/landing, redirecting to /.");
        router.push('/');
        return;
      }
      // If authenticated user is on signup, allow render (e.g., just signed up)
      if (pathname === '/signup') {
        console.log("AuthWrapper: Authenticated user on signup, allowing render.");
        return;
      }
      // For any other path, if authenticated, allow render
      console.log("AuthWrapper: Authenticated user on protected/public path, allowing render.");
      return;
    }

    // --- Logic for unauthenticated users ---
    console.log("AuthWrapper: User is NOT authenticated.");

    // Check if the current path is explicitly public
    if (isPublicPath) {
      console.log("AuthWrapper: Unauthenticated user on public path, allowing render.");
      redirectInitiatedRef.current = false; // Reset redirect flag for public path
      return;
    }

    // Handle root path for unauthenticated users
    if (pathname === '/') {
      const wasAuthenticatedOnDashboard = typeof window !== 'undefined' && localStorage.getItem('wasAuthenticatedOnDashboard') === 'true';
      if (wasAuthenticatedOnDashboard) {
        console.log("AuthWrapper: Unauthenticated on root, but was previously on dashboard. Redirecting to /login.");
        if (pathname !== '/login' && !redirectInitiatedRef.current) {
          router.push('/login');
          redirectInitiatedRef.current = true;
        }
      } else {
        console.log("AuthWrapper: Unauthenticated on root, fresh visit. Redirecting to /landing.");
        if (pathname !== '/landing' && !redirectInitiatedRef.current) {
          router.push('/landing');
          redirectInitiatedRef.current = true;
        }
      }
      return;
    }

    // For any other protected path (not public, not '/', not login/signup), redirect to login
    console.log("AuthWrapper: Unauthenticated on protected path, redirecting to /login.");
    if (pathname !== '/login' && !redirectInitiatedRef.current) {
      router.push('/login');
      redirectInitiatedRef.current = true;
    }

  }, [user, isSessionLoading, isSigningOut, pathname, router, isPublicPath]);

  // Determine if we should show the loader or children
  // Show loader if session is loading, or if a redirect has been initiated and we're waiting for it to complete.
  // Also show loader if signing out.
  const shouldShowLoader = isSessionLoading || isSigningOut || redirectInitiatedRef.current;

  // If user is authenticated and not on login/landing/signup, or if unauthenticated and on a public path,
  // and no redirect is pending, then we are ready to render children.
  const isReadyToRenderChildren = !shouldShowLoader && (
    (user && pathname !== '/login' && pathname !== '/landing') || // Authenticated on non-auth pages
    (!user && isPublicPath) // Unauthenticated on public pages
  );

  if (shouldShowLoader) {
    return <AppLoader message="Loading..." isFullScreen={true} />;
  }

  if (isReadyToRenderChildren) {
    return <>{children}</>;
  }

  // Fallback: If we reach here, it means a redirect is pending or some state is not yet resolved
  // but not explicitly covered by shouldShowLoader. This should ideally not be hit if logic is perfect.
  // For safety, show loader.
  return <AppLoader message="Loading..." isFullScreen={true} />;
}