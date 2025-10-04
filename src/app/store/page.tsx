"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export default function StoreLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center font-sans">
      <Store className="h-16 w-16 md:h-20 md:w-20 text-primary mb-6" />
      <h1 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Welcome to Yaarsite Stores!</h1>
      <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
        Discover amazing products from various entrepreneurs.
        If you know a specific store's address, you can visit it directly.
      </p>
      <Button asChild className="font-semibold">
        <Link href="/login">Login to manage your own store</Link>
      </Button>
    </div>
  );
}