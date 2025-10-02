"use client";

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (isSessionLoading) {
      setIsReadyToRender(false);
      return;
    }

    if (user) {
      // User is authenticated
      // Special case: If on signup page, allow it to render (to show success message and then sign out)
      if (pathname === '/signup') {
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
      // User is NOT authenticated
      if (!isPublicPath) {
        // Unauthenticated user on a protected path, redirect to landing
        router.push('/landing'); // Redirect to landing page
        setIsReadyToRender(false); // Keep loader visible until redirect completes
      } else {
        // Unauthenticated user on a public path (including landing)
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