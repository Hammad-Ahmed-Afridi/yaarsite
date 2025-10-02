"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export default function StoreLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
      <Store className="h-20 w-20 text-primary mb-6" />
      <h1 className="text-3xl font-bold mb-4">Welcome to Yaarsite Stores!</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-prose">
        Discover amazing products from various entrepreneurs.
        If you know a specific store's address, you can visit it directly.
      </p>
      <Button asChild>
        <Link href="/login">Login to manage your own store</Link>
      </Button>
    </div>
  );
}