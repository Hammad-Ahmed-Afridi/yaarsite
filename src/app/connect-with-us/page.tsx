"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Share2, Instagram, Facebook, Youtube, Linkedin, Phone } from 'lucide-react'; // Added Linkedin and Phone (for WhatsApp)
import { FaTiktok } from 'react-icons/fa'; // For TikTok icon

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
            <Button asChild className="w-full bg-instagram hover:bg-instagram/90 text-white font-semibold py-6 text-lg flex items-center justify-center gap-3">
              <Link href="https://www.instagram.com/yaarsite" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6" /> Instagram
              </Link>
            </Button>
            <Button asChild className="w-full bg-facebook hover:bg-facebook/90 text-white font-semibold py-6 text-lg flex items-center justify-center gap-3">
              <Link href="https://www.facebook.com/yaarsite" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6" /> Facebook
              </Link>
            </Button>
            <Button asChild className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold py-6 text-lg flex items-center justify-center gap-3">
              <Link href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"> {/* Replace with actual WhatsApp link */}
                <Phone className="h-6 w-6" /> WhatsApp
              </Link>
            </Button>
            <Button asChild className="w-full bg-youtube hover:bg-youtube/90 text-white font-semibold py-6 text-lg flex items-center justify-center gap-3">
              <Link href="https://www.youtube.com/yaarsite" target="_blank" rel="noopener noreferrer">
                <Youtube className="h-6 w-6" /> YouTube
              </Link>
            </Button>
            <Button asChild className="w-full bg-tiktok hover:bg-tiktok/90 text-white font-semibold py-6 text-lg flex items-center justify-center gap-3">
              <Link href="https://www.tiktok.com/@yaarsite" target="_blank" rel="noopener noreferrer"> {/* Replace with actual TikTok link */}
                {/* Using a generic icon for TikTok as FaTiktok requires react-icons package */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok"><path d="M9 12v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V12a1 1 0 0 0-1-1H10a1 1 0 0 0-1 1Z"/><path d="M12 11V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1Z"/><path d="M15 12v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V12a1 1 0 0 0-1-1H16a1 1 0 0 0-1 1Z"/><path d="M18 11V2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1Z"/></svg> TikTok
              </Link>
            </Button>
            <Button asChild className="w-full bg-linkedin hover:bg-linkedin/90 text-white font-semibold py-6 text-lg flex items-center justify-center gap-3">
              <Link href="https://www.linkedin.com/company/yaarsite" target="_blank" rel="noopener noreferrer"> {/* Replace with actual LinkedIn link */}
                <Linkedin className="h-6 w-6" /> LinkedIn
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}