"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { useSession } from '@/components/session-context-provider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLoader } from '@/components/app-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function FreeDomainPage() {
  const { user, profile, isLoading: isSessionLoading, refreshProfile, session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
      toast.success("Signed out successfully!");
      router.push('/login');
    }
  };

  const handleCopyUrl = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.info(message);
  };

  const handleOpenStoreUrl = () => {
    const urlToOpen = profile?.store_url;
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }
  };

  const displayStoreUrl = profile?.store_url || "Store URL not available";

  if (isSessionLoading) {
    return (
      <AppLoader
        message="Loading page..."
        secondaryMessage="If it does not load, kindly refresh the browser and sign in."
      />
    );
  }

  if (!profile || profile.tenant_name === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Configured</h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">Please set up your store first from the dashboard to access domain features.</p>
        <Button asChild className="font-semibold">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} />

      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">Your Store Link & Custom Domain</h1>
        </div>
        <Globe className="h-24 w-24 text-primary mb-6" />
        <p className="text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
          Manage your store's public URL. You can use your free Yaarsite subdomain.
        </p>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Current Store URL</CardTitle>
            <CardDescription className="text-base leading-relaxed">This is the direct link to your online store.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                value={displayStoreUrl}
                readOnly
                className="flex-1 text-base"
              />
              <Button variant="outline" size="icon" onClick={() => handleCopyUrl(displayStoreUrl, "Store URL copied to clipboard!")} disabled={!profile.store_url}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleOpenStoreUrl} disabled={!profile.store_url}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild className="font-semibold w-full max-w-xs" disabled={!profile.store_url}>
              <Link href={displayStoreUrl} target="_blank" rel="noopener noreferrer">
                Visit Your Store
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Custom .com Domain</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Connect your own professional domain (e.g., `yourstorename.com`).
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-lg font-semibold text-muted-foreground">
              This feature is currently under development and will be available soon!
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We're working hard to bring you seamless custom domain integration. Stay tuned for updates.
            </p>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Free Domains</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              For social media bios and marketing, you can create a shorter, more memorable link that redirects to your Yaarsite store.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-left space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Option 1: Bitly (Custom Short Links)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bitly allows you to create custom short links (e.g., `bit.ly/YourStoreName`) that are easy to remember and share.
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 leading-relaxed">
                <li>**Go to Bitly:** Open your web browser and navigate to <a href="https://bitly.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Bitly.com</a>.</li>
                <li>**Sign Up/Log In:** Create a free account or log in if you already have one.</li>
                <li>**Create New Link:** On your Bitly dashboard, look for a button like "Create new" or "Create Link" and click it.</li>
                <li>**Paste Your Store URL:** In the field provided (often labeled "Destination" or "Long URL"), paste your full Yaarsite Store URL (which you can copy from above).</li>
                <li>**Customize Back-half:** Bitly will generate a random short link. You can customize the "Back-half" (the part after `bit.ly/`) to something relevant and memorable for your store, like `bit.ly/MyAwesomeStore`.</li>
                <li>**Save Your Link:** Click "Create" or "Save" to finalize your custom short link.</li>
                <li>**Use Your Link:** Copy this new short link and use it in your social media bios, marketing materials, or anywhere you want a concise link to your store!</li>
              </ol>
              <Button asChild variant="outline" className="mt-2 font-semibold">
                <a href="https://bitly.com/" target="_blank" rel="noopener noreferrer">Go to Bitly</a>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Option 2: Linktree (Multiple Links in One)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Linktree is ideal for social media bios where you want to share multiple links from a single, mobile-friendly landing page.
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 leading-relaxed">
                <li>**Go to Linktree:** Open your web browser and go to <a href="https://linktr.ee/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Linktr.ee</a>.</li>
                <li>**Sign Up/Log In:** Create a free account or log in.</li>
                <li>**Add New Link:** On your Linktree dashboard, click "Add New Link".</li>
                <li>**Enter Title & URL:**
                  <ul className="list-disc list-inside ml-4">
                    <li>For the "Title" field, enter something like "Shop Our Store" or "Visit My Yaarsite Store".</li>
                    <li>For the "URL" field, paste your Yaarsite Store URL (copied from above).</li>
                  </ul>
                </li>
                <li>**Customize Your Linktree:** You can add more links (e.g., to your social media profiles), customize the appearance of your Linktree page, and reorder your links.</li>
                <li>**Share Your Linktree URL:** Your unique Linktree URL will be something like `linktr.ee/YourStoreName`. Copy this URL and use it in your social media bios (e.g., Instagram, TikTok) to direct customers to your Yaarsite store and other important links.</li>
              </ol>
              <Button asChild variant="outline" className="mt-2 font-semibold">
                <a href="https://linktr.ee/" target="_blank" rel="noopener noreferrer">Go to Linktree</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}