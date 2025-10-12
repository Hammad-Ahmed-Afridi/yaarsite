"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile } from '@/components/session-context-provider'; // Re-use the Profile type

interface StoreProfileContextType {
  storeProfile: Profile | null;
  setStoreProfile: (profile: Profile | null) => void;
}

const StoreProfileContext = createContext<StoreProfileContextType | undefined>(undefined);

export const StoreProfileProvider = ({ children, initialProfile }: { children: ReactNode; initialProfile: Profile | null }) => {
  const [storeProfile, setStoreProfile] = useState<Profile | null>(initialProfile);

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