"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft, Copy, ExternalLink, Loader2 } from 'lucide-react'; // Removed CheckCircle, XCircle, RefreshCcw
import { DashboardHeader } from '@/components/dashboard-header';
import { useSession } from '@/components/session-context-provider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLoader } from '@/components/app-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Removed useForm, zodResolver, z, format, Label, Badge imports as they are no longer needed for custom domain logic

export default function FreeDomainPage() {
  const { user, profile, isLoading: isSessionLoading, refreshProfile, session } = useSession();
  const router = useRouter();
  // Removed custom domain related states: isSubmittingDomain, isVerifyingDomain

  // Removed form and useEffect for form reset as custom domain form is gone

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
    const urlToOpen = profile?.store_url; // Simplified: only Yaarsite subdomain
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }
  };

  // Removed onSubmitDomain and handleVerifyDomain functions

  const displayStoreUrl = profile?.store_url || "Store URL not available";

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

      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center text-center">
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
              This feature is currently under development and will be available soon!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-lg font-semibold text-muted-foreground">
              We're working on providing free domain options for your store. Stay tuned for updates.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}