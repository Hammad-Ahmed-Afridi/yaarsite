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
  delivery_charge: number | null; // Added delivery_charge
  home_page_heading: string | null; // Added for store customization
  home_page_description: string | null; // Added for store customization
  home_page_hero_image_url: string | null; // New: Home page hero image
  home_page_content_image_url: string | null; // New: Home page content image
  home_page_content_text: string | null; // New: Home page content text
  about_page_content: string | null; // Added for store customization
  about_page_hero_image_url: string | null; // New: About page hero image
  store_page_welcome_message: string | null; // Added for store customization
  contact_page_heading: string | null; // Added for contact page customization
  contact_page_description: string | null; // Added for contact page customization
  contact_page_hero_image_url: string | null; // New: Contact page hero image
  store_address_line: string | null; // New: Store physical address line
  store_city: string | null; // New: Store city
  store_province: string | null; // New: Store province
  jazzcash_phone_number: string | null; // New: JazzCash phone number
  easypaisa_phone_number: string | null; // New: EasyPaisa phone number
  // Simplified Store theme colors (HSL format)
  store_primary_color_hsl: string | null; // Used for accent (buttons, links, icons)
  store_background_color_hsl: string | null; // Main store background
  store_card_background_color_hsl: string | null; // Cards, Header, Footer background
}

// Define a type for the specific profile keys that store image URLs
export type ProfileImageKey =
  'avatar_url' |
  'home_page_hero_image_url' |
  'home_page_content_image_url' |
  'about_page_hero_image_url' |
  'contact_page_hero_image_url';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isSigningOut: boolean; // New: state to indicate if a sign-out is in progress
  refreshProfile: () => Promise<void>;
  initiateSignOut: () => Promise<void>; // New: function to initiate sign-out
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 60 * 1000; // Changed to 1 minute (60 seconds)

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false); // Initialize new state

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
      console.log("SessionContext: User is authenticated. Access Token (first 10 chars):", currentSession.access_token.substring(0, 10) + "...");
      const userProfile = await fetchUserProfile(currentSession.user.id);
      setProfile(userProfile);
    } else {
      console.log("SessionContext: User is NOT authenticated.");
      setProfile(null);
    }
    setIsLoading(false);
    // Reset isSigningOut when the SIGNED_OUT event is processed
    if (event === 'SIGNED_OUT') {
      setIsSigningOut(false);
      console.log("SessionContext: SIGNED_OUT event processed, isSigningOut set to false.");
    }
    console.log("SessionContext: isLoading set to false after auth state change.");
  }, [fetchUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchUserProfile(user.id);
      setProfile(updatedProfile);
    }
  }, [user, fetchUserProfile]);

  const initiateSignOut = useCallback(async () => {
    setIsSigningOut(true); // Set flag when sign-out is initiated
    console.log("SessionContext: initiateSignOut called, isSigningOut set to true.");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("SessionContext: Error during signOut:", error);
      setIsSigningOut(false); // Reset on error
      throw error; // Re-throw to be handled by caller
    }
    // Explicitly clear the flag on successful sign-out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wasAuthenticatedOnDashboard');
    }
  }, []);

  useEffect(() => {
    console.log("SessionContext: useEffect running.");

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log("SessionContext: Initial getSession result:", initialSession);
      await handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    return () => {
      console.log("SessionContext: useEffect cleanup.");
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  useInactivityLogout({
    inactivityTimeoutMs: INACTIVITY_TIMEOUT_MS,
    onLogout: async () => {
      console.log("SessionContext: Inactivity detected, logging out...");
      try {
        await initiateSignOut(); // Use the new initiateSignOut
        console.log("SessionContext: Successfully logged out due to inactivity.");
      } catch (error) {
        console.error("SessionContext: Error during inactivity logout:", error);
      }
    },
    enabled: !!user,
  });

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading, isSigningOut, refreshProfile, initiateSignOut }}>
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