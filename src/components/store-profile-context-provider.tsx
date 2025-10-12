"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Profile } from '@/components/session-context-provider'; // Re-use the Profile type

interface StoreProfileContextType {
  storeProfile: Profile | null;
  setStoreProfile: (profile: Profile | null) => void;
}

const StoreProfileContext = createContext<StoreProfileContextType | undefined>(undefined);

export const StoreProfileProvider = ({ children, initialProfile }: { children: ReactNode; initialProfile: Profile | null }) => {
  const [storeProfile, setStoreProfile] = useState<Profile | null>(initialProfile);

  // Update internal state when initialProfile prop changes
  useEffect(() => {
    setStoreProfile(initialProfile);
  }, [initialProfile]);

  // NEW: Apply custom CSS variables for store theme
  useEffect(() => {
    const root = document.documentElement; // Target the <html> element
    if (storeProfile) {
      root.style.setProperty('--store-primary', storeProfile.store_primary_color_hsl || 'var(--primary)');
      root.style.setProperty('--store-background', storeProfile.store_background_color_hsl || 'var(--background)');
      root.style.setProperty('--store-foreground', storeProfile.store_foreground_color_hsl || 'var(--foreground)');
      root.style.setProperty('--store-card-background', storeProfile.store_card_background_color_hsl || 'var(--card)');
      root.style.setProperty('--store-card-foreground', storeProfile.store_card_foreground_color_hsl || 'var(--card-foreground)');
    } else {
      // Reset to default if no storeProfile is active
      root.style.removeProperty('--store-primary');
      root.style.removeProperty('--store-background');
      root.style.removeProperty('--store-foreground');
      root.style.removeProperty('--store-card-background');
      root.style.removeProperty('--store-card-foreground');
    }
  }, [storeProfile]); // Dependency on storeProfile

  return (
    <StoreProfileContext.Provider value={{ storeProfile, setStoreProfile }}>
      {children}
    </StoreProfileContext.Provider>
  );
};

export const useStoreProfile = () => {
  const context = useContext(StoreProfileContext);
  if (context === undefined) {
    throw new Error('useStoreProfile must be used within a StoreProfileProvider');
  }
  return context;
};