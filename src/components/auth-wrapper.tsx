"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context-provider';
import { AppLoader } from '@/components/app-loader'; // Import AppLoader

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Define paths that are publicly accessible (no login required)
  const publicPaths = ['/login', '/signup', '/store', '/cart', '/checkout', '/landing']; 
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    if (isSessionLoading) {
      // Still loading session, do nothing yet
      return;
    }

    if (user) {
      // User is authenticated
      if (pathname === '/login' || pathname === '/signup' || pathname === '/landing') {
        // If authenticated user tries to access login/signup/landing, redirect to dashboard
        router.push('/');
      }
    } else {
      // User is NOT authenticated
      if (!isPublicPath) {
        // If unauthenticated user tries to access a protected path, redirect to landing page
        router.push('/landing');
      }
    }
  }, [user, isSessionLoading, pathname, router, isPublicPath]);

  // Show a loading spinner while session is being determined
  if (isSessionLoading) {
    return (
      <AppLoader message="Initializing session..." />
    );
  }

  return <>{children}</>;
}