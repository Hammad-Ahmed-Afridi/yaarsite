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
    if (isSessionLoading) {
      setIsReadyToRender(false);
      return;
    }

    if (isSigningOut) {
      if (pathname !== '/login') {
        router.push('/login');
      }
      setIsReadyToRender(false);
      return;
    }

    if (user) {
      // User is authenticated
      if (pathname === '/login' || pathname === '/signup' || pathname === '/landing') {
        router.push('/'); // Redirect authenticated users from auth/landing pages to dashboard
        setIsReadyToRender(false);
      } else {
        setIsReadyToRender(true); // Allow rendering for authenticated users on other pages
      }
    } else {
      // User is NOT authenticated
      if (pathname === '/') {
        router.push('/landing'); // Unauthenticated users on root go to landing
        setIsReadyToRender(false);
      } else if (isPublicPath) {
        setIsReadyToRender(true); // Allow rendering for unauthenticated users on other public paths
      } else {
        router.push('/login'); // Unauthenticated users on protected paths go to login
        setIsReadyToRender(false);
      }
    }
  }, [user, isSessionLoading, isSigningOut, pathname, router, isPublicPath]);

  if (!isReadyToRender) {
    return <AppLoader message="Loading..." isFullScreen={true} />;
  }

  return <>{children}</>;
}