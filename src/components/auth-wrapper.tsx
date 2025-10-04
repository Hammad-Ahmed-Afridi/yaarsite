"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context-provider';
import { AppLoader } from '@/components/app-loader';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading, isSigningOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup', '/store', '/cart', '/checkout', '/landing'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  const [isReadyToRender, setIsReadyToRender] = useState(false);

  useEffect(() => {
    console.log("AuthWrapper: useEffect triggered.");
    console.log("AuthWrapper: Current user:", user?.id);
    console.log("AuthWrapper: isSessionLoading:", isSessionLoading);
    console.log("AuthWrapper: isSigningOut:", isSigningOut);
    console.log("AuthWrapper: pathname:", pathname);

    if (isSessionLoading) {
      console.log("AuthWrapper: Session loading, not ready to render.");
      setIsReadyToRender(false);
      return;
    }

    // Prioritize sign-out redirection above all other unauthenticated logic
    if (isSigningOut) {
      console.log("AuthWrapper: Sign-out in progress, redirecting to /login.");
      if (pathname !== '/login') {
        router.push('/login');
      }
      setIsReadyToRender(false);
      return;
    }

    if (user) {
      // User is currently authenticated
      console.log("AuthWrapper: User is authenticated.");
      if (pathname === '/signup') {
        // Authenticated user on signup page, allowing render (e.g., if they just signed up and are being redirected)
        console.log("AuthWrapper: Authenticated user on signup, allowing render.");
        setIsReadyToRender(true);
      } else if (pathname === '/login' || pathname === '/landing') {
        // Authenticated user on auth/landing page, redirecting to dashboard
        console.log("AuthWrapper: Authenticated user on auth/landing page, redirecting to /.");
        router.push('/');
        setIsReadyToRender(false);
      } else {
        // Authenticated user on a protected page, allowing render
        console.log("AuthWrapper: Authenticated user on protected page, allowing render.");
        setIsReadyToRender(true);
      }
    } else {
      // User is NOT currently authenticated (and not in the middle of a sign-out)
      console.log("AuthWrapper: User is NOT authenticated (and not signing out).");

      if (pathname === '/') {
        // Unauthenticated user on the root path, redirect to landing page
        console.log("AuthWrapper: Unauthenticated user on root path, redirecting to /landing.");
        router.push('/landing');
        setIsReadyToRender(false);
      } else if (!isPublicPath) {
        // Unauthenticated user on a protected path (not in publicPaths and not /)
        // This covers paths like /products, /orders, /settings, etc.
        console.log("AuthWrapper: Unauthenticated user on protected path, redirecting to /login.");
        router.push('/login');
        setIsReadyToRender(false);
      } else {
        // Unauthenticated user on an explicitly public path (login, signup, store, cart, checkout, landing).
        // This includes /landing itself, and ensures they stay on these pages if they refresh.
        console.log("AuthWrapper: Unauthenticated user on public path, allowing render.");
        setIsReadyToRender(true);
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