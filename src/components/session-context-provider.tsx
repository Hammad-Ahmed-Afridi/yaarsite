"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { useInactivityLogout } from '@/hooks/use-inactivity-logout';

// Define the Profile type based on your Supabase schema
interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  store_url: string | null; // Added store_url
  store_description: string | null; // Added store_description
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

const INACTIVITY_TIMEOUT_MS = 10 * 1000; // 10 seconds for inactivity logout

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // useRouter and usePathname are kept for potential future logging or context if needed by children.

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

    if (currentSession) {
      // User is authenticated
      const userProfile = await fetchUserProfile(currentSession.user.id);
      setProfile(userProfile);
      // Removed redirect logic for authenticated users on /login
    } else {
      // User is NOT authenticated
      setProfile(null);
      // Removed redirect logic for unauthenticated users on protected paths
    }
    setIsLoading(false);
    console.log("SessionContext: isLoading set to false after auth state change.");
  }, [fetchUserProfile]); // Removed pathname, router from dependencies

  // Function to manually refresh the profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchUserProfile(user.id);
      setProfile(updatedProfile);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    console.log("SessionContext: useEffect running.");

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

  // Inactivity logout hook
  useInactivityLogout({
    inactivityTimeoutMs: INACTIVITY_TIMEOUT_MS,
    onLogout: async () => {
      console.log("SessionContext: Inactivity detected, logging out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("SessionContext: Error during inactivity logout:", error);
        // toast.error("Failed to log out due to inactivity."); // Optionally show a toast
      } else {
        console.log("SessionContext: Successfully logged out due to inactivity.");
        // The page-level redirect will handle sending to /login
      }
    },
    enabled: !!user, // Only enable if a user is logged in
  });

  // The provider will always render children, and pages will handle their own auth checks.
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