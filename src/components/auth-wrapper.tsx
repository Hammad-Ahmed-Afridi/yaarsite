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

      if (pathname === '/landing') {
        // Unauthenticated user on landing page, allow render
        setIsReadyToRender(true);
      } else if (isPublicPath) { // Other public paths like /login, /signup, /store/*, /cart, /checkout
        // Unauthenticated user on other explicitly public paths, allow render
        setIsReadyToRender(true);
      } else {
        // Any other path, including '/', /products, /orders, /settings, etc.
        // Redirect to login if unauthenticated and not on an explicitly public path.
        console.log("AuthWrapper: Unauthenticated user on protected path or root, redirecting to /login.");
        router.push('/login');
        setIsReadyToRender(false);
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