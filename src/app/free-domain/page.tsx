"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import { DashboardHeader } from '@/components/dashboard-header';
import { useSession } from '@/components/session-context-provider';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLoader } from '@/components/app-loader';

export default function FreeDomainPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
      toast.success("Signed out successfully!");
      router.push('/login');
    }
  };

  if (isSessionLoading) {
    return <AppLoader message="Loading page..." />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} /> {/* Removed currentPath */}

      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">Free Domain</h1>
        </div>
        <Globe className="h-24 w-24 text-primary mb-6" />
        <p className="text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
          We're excited to offer you a free custom domain for your Yaarsite store.
          This feature is coming soon! Stay tuned for updates.
        </p>
        <Button asChild className="font-semibold">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </main>
    </div>
  );
}