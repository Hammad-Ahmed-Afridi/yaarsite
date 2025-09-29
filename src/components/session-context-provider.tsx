"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useInactivityLogout } from '@/hooks/use-inactivity-logout';

// Define the Profile type based on your Supabase schema
export interface Profile { // Exported for use in DashboardHeader
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

const INACTIVITY_TIMEOUT_MS = 15 * 1000;

interface SessionContextProviderProps {
  children: React.ReactNode;
  initialSession: Session | null;
  initialUser: User | null;
  initialProfile: Profile | null;
}

export const SessionContextProvider = ({ children, initialSession, initialUser, initialProfile }: SessionContextProviderProps) => {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  // isLoading should be true if there's no initial session, as we need to check for one client-side.
  // If an initial session is provided, we are not "loading" for the initial state.
  const [isLoading, setIsLoading] = useState(!initialSession); 

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
    console.log("SessionContext: onAuthStateChange event:", event, "session:", currentSession);
    setSession(currentSession);
    setUser(currentSession?.user || null);

    if (currentSession) {
      const userProfile = await fetchUserProfile(currentSession.user.id);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
    setIsLoading(false); // Once auth state is determined, loading is complete
    console.log("SessionContext: isLoading set to false after auth state change.");
  }, [fetchUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchUserProfile(user.id);
      setProfile(updatedProfile);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    console.log("SessionContext: useEffect running.");
    // Always set up the listener client-side.
    // The initial state is handled by useState initialization.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => {
      console.log("SessionContext: useEffect cleanup.");
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  useInactivityLogout({
    inactivityTimeoutMs: INACTIVITY_TIMEOUT_MS,
    onLogout: async () => {
      console.log("SessionContext: Inactivity detected, logging out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("SessionContext: Error during inactivity logout:", error);
      } else {
        console.log("SessionContext: Successfully logged out due to inactivity.");
      }
    },
    enabled: !!user,
  });

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading, refreshProfile }}>
      {children}
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