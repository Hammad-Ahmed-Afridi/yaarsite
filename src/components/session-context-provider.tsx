"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster, toast } from 'sonner';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setIsLoading(false);

      const publicPaths = ['/login', '/signup'];

      if (currentSession && publicPaths.includes(pathname)) {
        router.push('/'); // Redirect authenticated users from auth pages to home
      } else if (!currentSession && !publicPaths.includes(pathname)) {
        router.push('/login'); // Redirect unauthenticated users from protected pages to login
      }
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
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
    <SessionContext.Provider value={{ session, user, isLoading }}>
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