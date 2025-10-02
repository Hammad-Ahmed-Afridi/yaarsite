"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image'; // Import Image component

export function LandingPageHeader() {
  return (
    <header className="w-full p-4 border-b border-border bg-card text-card-foreground flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <Image 
          src="/rocket-logo.png" 
          alt="Yaarsite Logo" 
          width={28} // Adjust size as needed
          height={28} // Adjust size as needed
          className="text-primary animate-hero-rocket-bounce" 
        />
        <span className="text-xl font-bold">Yaarsite</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/login" target="_blank" rel="noopener noreferrer">
            Log In
          </Link>
        </Button>
        <Button asChild>
          <Link href="/signup" target="_blank" rel="noopener noreferrer">
            Sign Up
          </Link>
        </Button>
      </nav>
    </header>
  );
}