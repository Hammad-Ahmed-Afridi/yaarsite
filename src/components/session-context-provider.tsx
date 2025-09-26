"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { useInactivityLogout } from '@/hooks/use-inactivity-logout';
import { LoadingScreen } from './loading-screen'; // Import the new LoadingScreen component

// Define the Profile type based on your Supabase schema
interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  store_url: string | null;
  store_description: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 30 * 1000; // 30 seconds as requested

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup', '/cart', '/checkout'];
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/store');

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log("SessionContext: Fetching profile for user:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("SessionContext: Error fetching profile:", error);
      return null;
    }
    console.log("SessionContext: Profile fetched:", data);
    return data as Profile;
  }, []);

  const handleAuthStateChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log("SessionContext: onAuthStateChange event:", event, "session:", currentSession ? "present" : "null");
    setSession(currentSession);
    setUser(currentSession?.user || null);

    if (currentSession) {
      // User is authenticated
      const userProfile = await fetchUserProfile(currentSession.user.id);
      setProfile(userProfile);

      // If authenticated user is on the login/signup page, redirect to dashboard
      if (pathname === '/login' || pathname === '/signup') {
        console.log("SessionContext: Authenticated user on auth path, redirecting to /");
        router.push('/');
      }
    } else {
      // User is NOT authenticated
      setProfile(null);

      // If unauthenticated user is on a protected path, redirect to login
      if (!isPublicPath) {
        console.log(`SessionContext: Unauthenticated user on protected path (${pathname}), redirecting to /login`);
        router.push('/login');
      }
    }
    setIsLoading(false); // Set loading to false after handling auth state
    console.log("SessionContext: isLoading set to false after auth state change.");
  }, [pathname, router, fetchUserProfile, isPublicPath]); // Added isPublicPath to dependencies

  // Function to manually refresh the profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchUserProfile(user.id);
      setProfile(updatedProfile);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    console.log("SessionContext: useEffect running. Current pathname:", pathname, "isPublicPath:", isPublicPath);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup subscription on unmount
    return () => {
      console.log("SessionContext: useEffect cleanup.");
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, pathname, isPublicPath]); // Added isPublicPath to dependencies

  // Inactivity logout hook
  useInactivityLogout({
    inactivityTimeoutMs: INACTIVITY_TIMEOUT_MS,
    onLogout: async () => {
      console.log("SessionContext: Inactivity detected, logging out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("SessionContext: Error during inactivity logout:", error);
      } else {
        console.log("SessionContext: Successfully logged out due to inactivity.");
        router.push('/login');
      }
    },
    enabled: !!user,
  });

  // Render loading screen if still loading and not on a public path
  if (isLoading && !isPublicPath) {
    console.log("SessionContext: Rendering LoadingScreen for protected path during initial load.");
    return <LoadingScreen />;
  }

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading, refreshProfile }}>
      {children}
      <Toaster richColors />
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};