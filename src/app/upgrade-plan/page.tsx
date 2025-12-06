"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Rocket } from 'lucide-react';

export default function UpgradePlanPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="flex items-center p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/landing">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold ml-4">Upgrade Your Plan</h1>
      </header>

      <main className="flex-1 p-4 sm:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg rounded-3xl text-center">
          <CardHeader className="space-y-2">
            <Rocket className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold tracking-tight">Ready to Go Pro?</CardTitle>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              Thank you for your interest in our premium plans! This feature is currently under development.
              Please check back soon for more details on how to upgrade and unlock advanced features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full font-semibold">
              <Link href="/landing">Back to Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}