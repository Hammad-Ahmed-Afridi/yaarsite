"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Download, Smartphone, Monitor, Apple, Chrome, Edge } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { useSession } from '@/components/session-context-provider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AppLoader } from '@/components/app-loader';

export default function DownloadAppPage() {
  const { profile, isLoading: isSessionLoading } = useSession();
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

  if (isSessionLoading) {
    return <AppLoader message="Loading app download instructions..." />;
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
          <h1 className="text-4xl font-bold tracking-tight">Download Yaarsite App</h1>
        </div>
        <Download className="h-24 w-24 text-primary mb-6" />
        <p className="text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
          Install Yaarsite as a shortcut on your mobile or desktop for quick and easy access, just like a native app!
        </p>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 w-full max-w-4xl">
          {/* Mobile Instructions */}
          <Card className="bg-card text-card-foreground shadow-lg rounded-3xl">
            <CardHeader className="text-center">
              <Smartphone className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold tracking-tight">On Mobile Devices</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Add Yaarsite to your home screen for instant access.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-6">
              {/* Android */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Chrome className="h-6 w-6 text-blue-600" /> Android (Chrome)
                </h3>
                <ol className="list-decimal list-inside text-muted-foreground space-y-2 leading-relaxed">
                  <li>Open **Chrome** browser on your Android device.</li>
                  <li>Navigate to the Yaarsite website: <a href="https://yaarsite.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">yaarsite.vercel.app</a></li>
                  <li>Tap the **three-dot menu** (⋮) in the top-right corner of the browser.</li>
                  <li>Select **"Add to Home screen"** from the menu.</li>
                  <li>Confirm by tapping **"Add"** or **"Install"** in the pop-up.</li>
                  <li>The Yaarsite icon will now appear on your home screen.</li>
                </ol>
              </div>

              {/* iOS */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Apple className="h-6 w-6 text-gray-700" /> iOS (Safari)
                </h3>
                <ol className="list-decimal list-inside text-muted-foreground space-y-2 leading-relaxed">
                  <li>Open **Safari** browser on your iPhone or iPad.</li>
                  <li>Navigate to the Yaarsite website: <a href="https://yaarsite.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">yaarsite.vercel.app</a></li>
                  <li>Tap the **Share button** (a square with an arrow pointing upwards) at the bottom of the screen.</li>
                  <li>Scroll down and select **"Add to Home Screen"**.</li>
                  <li>You can rename the shortcut if you wish, then tap **"Add"** in the top-right corner.</li>
                  <li>The Yaarsite icon will now appear on your home screen.</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Desktop Instructions */}
          <Card className="bg-card text-card-foreground shadow-lg rounded-3xl">
            <CardHeader className="text-center">
              <Monitor className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold tracking-tight">On Desktop Computers</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Install Yaarsite as a desktop application for quick launch.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-6">
              {/* Chrome Desktop */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Chrome className="h-6 w-6 text-blue-600" /> Google Chrome
                </h3>
                <ol className="list-decimal list-inside text-muted-foreground space-y-2 leading-relaxed">
                  <li>Open **Google Chrome** browser on your desktop.</li>
                  <li>Navigate to the Yaarsite website: <a href="https://yaarsite.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">yaarsite.vercel.app</a></li>
                  <li>Look for the **"Install" icon** (a computer screen with a down arrow) in the address bar, usually on the right side.</li>
                  <li>Click the **"Install" icon** and then click **"Install"** in the pop-up dialog.</li>
                  <li>Yaarsite will open in its own window and an icon will be added to your desktop/applications folder.</li>
                </ol>
              </div>

              {/* Edge Desktop */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Edge className="h-6 w-6 text-blue-500" /> Microsoft Edge
                </h3>
                <ol className="list-decimal list-inside text-muted-foreground space-y-2 leading-relaxed">
                  <li>Open **Microsoft Edge** browser on your desktop.</li>
                  <li>Navigate to the Yaarsite website: <a href="https://yaarsite.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">yaarsite.vercel.app</a></li>
                  <li>Look for the **"App available" icon** (a plus sign in a square) in the address bar, usually on the right side.</li>
                  <li>Click the **"App available" icon** and then click **"Install"** in the pop-up dialog.</li>
                  <li>Yaarsite will open in its own window and an icon will be added to your desktop/applications folder.</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button asChild className="mt-12 font-semibold">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </main>
    </div>
  );
}