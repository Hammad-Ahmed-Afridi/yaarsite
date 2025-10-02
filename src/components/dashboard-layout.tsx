"use client";

import React, { useState } from 'react';
import { useSession } from '@/components/session-context-provider';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { AppLoader } from '@/components/app-loader';
import { InactivityWarningBanner } from '@/components/inactivity-warning-banner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    console.log("DashboardLayout: Attempting to sign out.");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("DashboardLayout: Error during sign out:", error);
      toast.error("Failed to sign out. Please try again.");
    } else {
      console.log("DashboardLayout: Sign out successful. Redirecting to /login.");
      toast.success("Signed out successfully!");
      router.push('/login');
    }
  };

  if (isSessionLoading) {
    return (
      <AppLoader
        message="Loading session data..."
        secondaryMessage="If it does not load, kindly refresh the browser and sign in."
      />
    );
  }

  // If user is not logged in, AuthWrapper will handle redirection.
  // If profile is null but user exists, it means store setup is pending.
  // The StoreSetupDialog will handle this, so we render children.
  // The DashboardHeader and Sidebar will adapt to a null profile.

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 flex-shrink-0">
          <DashboardSidebar profile={profile} onSignOut={handleSignOut} />
        </aside>
      )}

      <div className="flex flex-1 flex-col">
        <InactivityWarningBanner />
        {/* Header for both desktop and mobile */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-card">
          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <DashboardSidebar profile={profile} onSignOut={handleSignOut} onLinkClick={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
          <DashboardHeader profile={profile} onSignOut={handleSignOut} showBackButton={isMobile && pathname !== '/'} currentPath={pathname} />
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {children}
        </main>

        <footer className="w-full py-4 text-center text-muted-foreground text-sm border-t border-border bg-card">
          Yaarsite for Entrepreneurs
        </footer>
      </div>
    </div>
  );
}