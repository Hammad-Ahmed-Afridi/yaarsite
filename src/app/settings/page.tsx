"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-3xl font-bold mb-4">Store Settings</h1>
      <p className="text-lg text-muted-foreground mb-8">This is where you will update your store information.</p>
      <Button asChild>
        <Link href="/">Go to Dashboard</Link>
      </Button>
    </div>
  );
}