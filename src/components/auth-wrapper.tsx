"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context-provider';
import { AppLoader } from '@/components/app-loader';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading, isSigningOut } = useSession(); // Get isSigningOut
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup', '/store', '/cart', '/checkout', '/landing'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  const [isReadyToRender, setIsReadyToRender] = useState(false);
  // No longer need prevUserRef for this specific logic, as isSigningOut is more direct.

  useEffect(() => {
    if (isSessionLoading) {
      setIsReadyToRender(false);
      return;
    }

    if (user) {
      // User is currently authenticated
      if (pathname === '/signup') {
        setIsReadyToRender(true);
      } else if (pathname === '/login' || pathname === '/landing') {
        router.push('/');
        setIsReadyToRender(false);
      } else {
        setIsReadyToRender(true);
      }
    } else {
      // User is NOT currently authenticated
      if (isSigningOut) {
        // If a sign-out was just initiated, we are expecting a redirect to /login.
        // Keep loader visible until that redirect completes.
        setIsReadyToRender(false);
        // The DashboardPage's handleSignOut already calls router.push('/login').
        // We don't need to call it again here, just prevent rendering anything else.
      } else if (pathname === '/') {
        // Initial unauthenticated access to root, redirect to landing page
        router.push('/landing');
        setIsReadyToRender(false);
      } else if (!isPublicPath) {
        // Unauthenticated user on any other protected path, redirect to login
        router.push('/login');
        setIsReadyToRender(false);
      } else {
        // Unauthenticated user on a public path (login, signup, store, cart, checkout, landing)
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