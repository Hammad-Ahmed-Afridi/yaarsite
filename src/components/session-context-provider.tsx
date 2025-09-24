"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster, toast } from 'sonner';

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
  profile: Profile | null; // Added profile to context
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // State for user profile
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
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
  };

  useEffect(() => {
    console.log("SessionContext: useEffect running. Current pathname:", pathname);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log("SessionContext: onAuthStateChange event:", _event, "session:", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
      console.log("SessionContext: isLoading set to false after auth state change.");

      const publicPaths = ['/login', '/signup'];

      // ONLY redirect unauthenticated users from protected paths to /login
      // Do NOT redirect authenticated users from public paths (like /login or /signup) to /
      if (!currentSession && !publicPaths.includes(pathname)) {
        console.log("SessionContext: Redirecting unauthenticated user from protected path to /login");
        router.push('/login'); // Redirect unauthenticated users from protected pages to login
      }
    });

    // Fetch initial session and profile
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log("SessionContext: Initial getSession result:", initialSession);
      setSession(initialSession);
      setUser(initialSession?.user || null);

      if (initialSession) {
        const userProfile = await fetchUserProfile(initialSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
      console.log("SessionContext: isLoading set to false after initial session fetch.");

      const publicPaths = ['/login', '/signup'];
      // ONLY redirect unauthenticated users from protected paths to /login on initial load
      if (!initialSession && !publicPaths.includes(pathname)) {
        console.log("SessionContext: Initial load: Redirecting unauthenticated user from protected path to /login");
        router.push('/login');
      }
    });

    return () => {
      console.log("SessionContext: useEffect cleanup.");
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading }}>
      {children}
      <Toaster richColors duration={2000} />
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