"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
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

    // Paths that are explicitly for authentication (login/signup)
    const authOnlyPaths = ['/login', '/signup'];
    // Paths that are publicly accessible (like the store pages)
    const publicStorePathPrefix = '/store';

    const handleAuthStateChange = async (_event: string, currentSession: Session | null) => {
      console.log("SessionContext: onAuthStateChange event:", _event, "session:", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession) {
        // User is authenticated
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);

        // If authenticated user tries to access login/signup, redirect to dashboard
        if (authOnlyPaths.includes(pathname)) {
          console.log("SessionContext: Authenticated user on auth-only path, redirecting to /");
          router.push('/');
        }
      } else {
        // User is NOT authenticated
        setProfile(null);

        // If unauthenticated user is on a protected path, redirect to login
        // A path is protected if it's not an auth-only page AND not a public store page
        const isAuthPage = authOnlyPaths.includes(pathname);
        const isPublicStorePage = pathname.startsWith(publicStorePathPrefix);

        if (!isAuthPage && !isPublicStorePage) {
          console.log("SessionContext: Unauthenticated user on protected path, redirecting to /login");
          router.push('/login');
        }
      }
      setIsLoading(false);
      console.log("SessionContext: isLoading set to false after auth state change.");
    };

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
  }, [router, pathname]); // Added router and pathname to dependency array for client-side redirects

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading }}>
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