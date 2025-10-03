"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Info, Mail, LayoutDashboard } from 'lucide-react';
import { useSession } from '@/components/session-context-provider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';
import { AppLoader } from '@/components/app-loader';

export default function PagesPage() {
  const { user, profile, isLoading: isSessionLoading, initiateSignOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await initiateSignOut();
      toast.success("Signed out successfully!");
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (isSessionLoading) {
    return <AppLoader message="Loading pages..." />;
  }

  if (!profile || profile.tenant_name === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Configured</h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">Please set up your store first from the dashboard.</p>
        <Button asChild className="font-semibold">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} currentPath={pathname} />

      <main className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Customize Your Store Pages</h2>
          <div className="grid gap-6 grid-cols-2">
            <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <Home className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-xl font-semibold">Home Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base text-muted-foreground leading-relaxed">Customize your store's main landing page.</p>
                <Button asChild className="w-full font-semibold">
                  <Link href="/settings/home-page">Edit Home Page</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <Info className="h-6 w-6 text-green-500" />
                <CardTitle className="text-xl font-semibold">About Us Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base text-muted-foreground leading-relaxed">Tell your customers about your brand and story.</p>
                <Button asChild className="w-full font-semibold">
                  <Link href="/settings/about-page">Edit About Us Page</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <Mail className="h-6 w-6 text-purple-500" />
                <CardTitle className="text-xl font-semibold">Contact Us Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base text-muted-foreground leading-relaxed">Provide contact information and a way for customers to reach you.</p>
                <Button asChild className="w-full font-semibold">
                  <Link href="/settings/contact-page">Edit Contact Us Page</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <LayoutDashboard className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-xl font-semibold">General Store Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base text-muted-foreground leading-relaxed">Manage your store's name, description, logo, and contact details.</p>
                <Button asChild className="w-full font-semibold">
                  <Link href="/settings">Edit General Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}