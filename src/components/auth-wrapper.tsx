"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context-provider';
import { AppLoader } from '@/components/app-loader'; // Import AppLoader

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isSessionLoading) {
      // Still loading session, do nothing yet
      return;
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isLandingPage = pathname === '/landing';
    const isStorePublicPage = pathname.startsWith('/store') || pathname === '/cart' || pathname === '/checkout';
    const isDashboardRoot = pathname === '/';
    // A route is considered a protected dashboard route if it's not the dashboard root,
    // and not an auth page, landing page, or public store page.
    const isProtectedDashboardRoute = !isDashboardRoot && !isAuthPage && !isLandingPage && !isStorePublicPage;

    if (user) {
      // User is authenticated
      if (isAuthPage || isLandingPage) {
        router.push('/'); // Redirect to dashboard
      }
    } else {
      // User is NOT authenticated
      if (isDashboardRoot) {
        router.push('/landing'); // Root path for unauthenticated goes to landing
      } else if (isProtectedDashboardRoute) {
        router.push('/login'); // Protected dashboard routes for unauthenticated go to login
      }
      // Otherwise, if on login, signup, landing, or store public pages, stay there.
    }
  }, [user, isSessionLoading, pathname, router]);

  // Show a loading spinner while session is being determined
  if (isSessionLoading) {
    return (
      <AppLoader message="Initializing session..." />
    );
  }

  return <>{children}</>;
}