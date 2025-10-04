"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft, Copy, ExternalLink } from 'lucide-react'; // Import Copy and ExternalLink
import { DashboardHeader } from '@/components/dashboard-header';
import { useSession } from '@/components/session-context-provider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLoader } from '@/components/app-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Import Card components
import { Input } from '@/components/ui/input'; // Import Input

export default function FreeDomainPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
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

  const handleCopyStoreUrl = () => {
    if (profile?.store_url) {
      navigator.clipboard.writeText(profile.store_url);
      toast.info("Your Yaarsite Store URL copied to clipboard!");
    }
  };

  const handleOpenStoreUrl = () => {
    if (profile?.store_url) {
      window.open(profile.store_url, '_blank');
    }
  };

  if (isSessionLoading) {
    return <AppLoader message="Loading page..." />;
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

      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center text-center"> {/* Adjusted padding */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">Your Store Link</h1>
        </div>
        <Globe className="h-24 w-24 text-primary mb-6" />
        <p className="text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
          Here's your unique Yaarsite store link. Use it to share your store with customers!
        </p>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Your Yaarsite Store URL</CardTitle>
            <CardDescription className="text-base leading-relaxed">This is the direct link to your online store.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                value={profile.store_url || "Store URL not available"}
                readOnly
                className="flex-1 text-base"
              />
              <Button variant="outline" size="icon" onClick={handleCopyStoreUrl} disabled={!profile.store_url}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleOpenStoreUrl} disabled={!profile.store_url}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild className="font-semibold w-full max-w-xs" disabled={!profile.store_url}>
              <Link href={profile.store_url || "#"} target="_blank" rel="noopener noreferrer">
                Visit Your Store
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Get a Professional Short Link</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              For social media bios and marketing, you can create a shorter, more memorable link that redirects to your Yaarsite store.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-left space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Option 1: Bitly</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bitly allows you to create custom short links (e.g., `bit.ly/YourStoreName`).
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 leading-relaxed">
                <li>Go to <a href="https://bitly.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bitly.com</a> and sign up for a free account.</li>
                <li>Click "Create new" and select "Link".</li>
                <li>Paste your Yaarsite Store URL (copied above) into the "Destination" field.</li>
                <li>Customize the "Back-half" (the part after `bit.ly/`) to something memorable for your store.</li>
                <li>Save your new short link and use it in your social media bios!</li>
              </ol>
              <Button asChild variant="outline" className="mt-2 font-semibold">
                <a href="https://bitly.com/" target="_blank" rel="noopener noreferrer">Go to Bitly</a>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Option 2: Linktree</h3>
              <p className="text-muted-foreground leading-relaxed">
                Linktree is perfect for creating a single, mobile-friendly landing page with multiple links, ideal for Instagram bios.
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 leading-relaxed">
                <li>Go to <a href="https://linktr.ee/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Linktr.ee</a> and sign up for a free account.</li>
                <li>Add a new link and paste your Yaarsite Store URL (copied above).</li>
                <li>Customize the title of the link (e.g., "Shop Our Store").</li>
                <li>Share your Linktree URL (`linktr.ee/YourStoreName`) in your social media bios.</li>
              </ol>
              <Button asChild variant="outline" className="mt-2 font-semibold">
                <a href="https://linktr.ee/" target="_blank" rel="noopener noreferrer">Go to Linktree</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Connect a Custom .com Domain (Coming Soon!)</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              We're working hard to bring you the ability to connect your own custom domain (e.g., `yourstorename.com`) directly to your Yaarsite store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This feature will allow for full branding and a highly professional online presence. Stay tuned for updates!
            </p>
            <Button asChild className="font-semibold">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}