"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context-provider';
import { Loader2 } from 'lucide-react';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Define paths that are publicly accessible (no login required)
  const publicPaths = ['/login', '/signup', '/store', '/cart', '/checkout']; 
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    if (isSessionLoading) {
      // Still loading session, do nothing yet
      return;
    }

    if (user) {
      // User is authenticated
      if (pathname === '/login' || pathname === '/signup') {
        // If authenticated user tries to access login/signup, redirect to dashboard
        router.push('/');
      }
    } else {
      // User is NOT authenticated
      if (!isPublicPath) {
        // If unauthenticated user tries to access a protected path, redirect to login
        router.push('/login');
      }
    }
  }, [user, isSessionLoading, pathname, router, isPublicPath]);

  // Show a loading spinner while session is being determined
  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}