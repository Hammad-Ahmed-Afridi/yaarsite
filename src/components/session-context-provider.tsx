"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

// Define the Profile type based on your Supabase schema
interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>; // Added refreshProfile function
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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
  }, []); // No dependencies, as it only uses supabase client

  const handleAuthStateChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log("SessionContext: onAuthStateChange event:", event, "session:", currentSession);
    setSession(currentSession);
    setUser(currentSession?.user || null);

    // Define pages that are publicly accessible or part of the auth flow
    const publicPaths = ['/login', '/signup', '/cart', '/checkout'];
    const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/store');

    if (currentSession) {
      // User is authenticated
      const userProfile = await fetchUserProfile(currentSession.user.id);
      setProfile(userProfile);

      // If authenticated user is on the login page, redirect to dashboard
      if (pathname === '/login') {
        console.log("SessionContext: Authenticated user on login path, redirecting to /");
        router.push('/');
      }
    } else {
      // User is NOT authenticated
      setProfile(null);

      // If unauthenticated user is on a protected path, redirect to login
      if (!isPublicPath) {
        console.log("SessionContext: Unauthenticated user on protected path, redirecting to /login");
        router.push('/login');
      }
    }
    setIsLoading(false);
    console.log("SessionContext: isLoading set to false after auth state change.");
  }, [pathname, router, fetchUserProfile]);

  // Function to manually refresh the profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchUserProfile(user.id);
      setProfile(updatedProfile);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    console.log("SessionContext: useEffect running. Current pathname:", pathname);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Fetch initial session and profile
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log("SessionContext: Initial getSession result:", initialSession);
      await handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    return () => {
      console.log("SessionContext: useEffect cleanup.");
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  const publicPaths = ['/login', '/signup', '/cart', '/checkout'];
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/store');

  // If loading and on a protected path, render null to prevent children from showing their loaders
  // before the redirect to login happens. The Toaster is still rendered to ensure it's available.
  if (isLoading && !isPublicPath) {
    return (
      <>
        {/* A minimal global loading indicator could go here if desired, but null is faster */}
        <Toaster richColors />
      </>
    );
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