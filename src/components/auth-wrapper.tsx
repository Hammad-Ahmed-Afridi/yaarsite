"use client";

import { useEffect, useState, useRef } from 'react';
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
  const prevUserRef = useRef(user); // Track previous user state

  useEffect(() => {
    // Update prevUserRef *before* any state changes are processed in the next render
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    console.log("AuthWrapper: useEffect triggered.");
    console.log("AuthWrapper: Current user:", user?.id);
    console.log("AuthWrapper: Previous user (prevUserRef.current):", prevUserRef.current?.id);
    console.log("AuthWrapper: isSessionLoading:", isSessionLoading);
    console.log("AuthWrapper: isSigningOut:", isSigningOut);
    console.log("AuthWrapper: pathname:", pathname);

    if (isSessionLoading) {
      console.log("AuthWrapper: Session loading, not ready to render.");
      setIsReadyToRender(false);
      return;
    }

    const wasUserPreviouslyAuthenticated = !!prevUserRef.current;
    console.log("AuthWrapper: wasUserPreviouslyAuthenticated:", wasUserPreviouslyAuthenticated);

    if (user) {
      // User is currently authenticated
      console.log("AuthWrapper: User is authenticated.");
      if (pathname === '/signup') {
        console.log("AuthWrapper: Authenticated user on signup, allowing render.");
        setIsReadyToRender(true);
      } else if (pathname === '/login' || pathname === '/landing') {
        console.log("AuthWrapper: Authenticated user on auth/landing page, redirecting to /.");
        router.push('/');
        setIsReadyToRender(false);
      } else {
        console.log("AuthWrapper: Authenticated user on protected page, allowing render.");
        setIsReadyToRender(true);
      }
    } else {
      // User is NOT currently authenticated
      console.log("AuthWrapper: User is NOT authenticated.");
      if (isSigningOut) {
        // If a sign-out is in progress, this is the definitive redirect to /login.
        console.log("AuthWrapper: Sign-out in progress, redirecting to /login.");
        router.push('/login');
        setIsReadyToRender(false);
      } else if (pathname === '/') {
        // User is unauthenticated, NOT signing out, and at the root.
        // This means it's either an initial unauthenticated visit OR
        // a completed sign-out where the `isSigningOut` flag has already reset.
        if (wasUserPreviouslyAuthenticated) {
          // If there *was* a user in the previous render cycle, it means they just signed out.
          console.log("AuthWrapper: User was previously authenticated (just signed out), redirecting to /login.");
          router.push('/login');
          setIsReadyToRender(false);
        } else {
          // No previous user, so it's an initial unauthenticated visit to the root.
          console.log("AuthWrapper: Initial unauthenticated visit to root, redirecting to /landing.");
          router.push('/landing');
          setIsReadyToRender(false);
        }
      } else if (!isPublicPath) {
        // Unauthenticated user on a protected path (not root, not public), redirect to login.
        console.log("AuthWrapper: Unauthenticated user on protected path, redirecting to /login.");
        router.push('/login');
        setIsReadyToRender(false);
      } else {
        // Unauthenticated user on a public path (login, signup, store, cart, checkout, landing).
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