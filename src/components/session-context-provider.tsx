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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);

      const publicPaths = ['/login', '/signup'];

      if (currentSession && publicPaths.includes(pathname)) {
        router.push('/'); // Redirect authenticated users from auth pages to home
      } else if (!currentSession && !publicPaths.includes(pathname)) {
        router.push('/login'); // Redirect unauthenticated users from protected pages to login
      }
    });

    // Fetch initial session and profile
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);

      if (initialSession) {
        const userProfile = await fetchUserProfile(initialSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);

      const publicPaths = ['/login', '/signup'];
      if (initialSession && publicPaths.includes(pathname)) {
        router.push('/');
      } else if (!initialSession && !publicPaths.includes(pathname)) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

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