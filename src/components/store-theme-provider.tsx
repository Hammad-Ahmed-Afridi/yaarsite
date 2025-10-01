"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type StoreTheme = 'light' | 'dark';

interface StoreThemeContextType {
  storeTheme: StoreTheme;
  setStoreTheme: (theme: StoreTheme) => void;
}

const StoreThemeContext = createContext<StoreThemeContextType | undefined>(undefined);

export const StoreThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [storeTheme, setStoreThemeState] = useState<StoreTheme>('light');

  useEffect(() => {
    // Load theme from localStorage
    const storedTheme = localStorage.getItem('store-theme') as StoreTheme;
    if (storedTheme) {
      setStoreThemeState(storedTheme);
    } else {
      // Default to light if no theme is stored
      localStorage.setItem('store-theme', 'light');
    }
  }, []);

  const setStoreTheme = useCallback((theme: StoreTheme) => {
    setStoreThemeState(theme);
    localStorage.setItem('store-theme', theme);
  }, []);

  return (
    <StoreThemeContext.Provider value={{ storeTheme, setStoreTheme }}>
      {children}
    </StoreThemeContext.Provider>
  );
};

export const useStoreTheme = () => {
  const context = useContext(StoreThemeContext);
  if (context === undefined) {
    throw new Error('useStoreTheme must be used within a StoreThemeProvider');
  }
  return context;
};