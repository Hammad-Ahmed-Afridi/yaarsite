"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export function LandingPageFooter() {
  return (
    <footer className="w-full py-8 text-center text-muted-foreground text-sm border-t border-border bg-card flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 mb-6">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">Yaarsite</span>
        </Link>
        <Button asChild size="lg" variant="secondary" className="px-10 py-7 text-xl font-semibold">
          <Link href="/signup" target="_blank" rel="noopener noreferrer">
            Create Your Free Store Now
          </Link>
        </Button>
      </div>
      <p>&copy; {new Date().getFullYear()} Yaarsite. All rights reserved.</p>
    </footer>
  );
}