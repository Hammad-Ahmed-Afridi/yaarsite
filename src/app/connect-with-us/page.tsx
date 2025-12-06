"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Share2 } from 'lucide-react';

export default function ConnectWithUsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="flex items-center p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/landing"> {/* Link back to the landing page */}
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold ml-4">Connect With Us</h1>
      </header>

      <main className="flex-1 p-4 sm:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg rounded-3xl text-center">
          <CardHeader className="space-y-2">
            <Share2 className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold tracking-tight">Connect with us</CardTitle>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              Find us on your favorite social media platforms!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-instagram hover:bg-instagram/90 text-white font-semibold py-6 text-lg">
              <Link href="https://www.instagram.com/yaarsite" target="_blank" rel="noopener noreferrer">
                Instagram
              </Link>
            </Button>
            <Button asChild className="w-full bg-facebook hover:bg-facebook/90 text-white font-semibold py-6 text-lg">
              <Link href="https://www.facebook.com/yaarsite" target="_blank" rel="noopener noreferrer">
                Facebook
              </Link>
            </Button>
            <Button asChild className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold py-6 text-lg">
              <Link href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"> {/* Replace with actual WhatsApp link */}
                WhatsApp
              </Link>
            </Button>
            <Button asChild className="w-full bg-youtube hover:bg-youtube/90 text-white font-semibold py-6 text-lg">
              <Link href="https://www.youtube.com/yaarsite" target="_blank" rel="noopener noreferrer">
                YouTube
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}