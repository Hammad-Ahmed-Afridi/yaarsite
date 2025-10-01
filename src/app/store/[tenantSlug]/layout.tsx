"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingCart, Menu } from 'lucide-react'; // Import Menu icon
import Image from 'next/image';
import { useCart } from '@/components/cart-context-provider';
import { AppLoader } from '@/components/app-loader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Profile } from '@/components/session-context-provider';
import { StoreNavbar } from '@/components/store-navbar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook

export default function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const router = useRouter();
  const tenantSlug = params.tenantSlug;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for mobile menu
  const { itemCount } = useCart();
  const isMobile = useIsMobile(); // Use the hook to detect mobile

  useEffect(() => {
    async function fetchStoreProfile() {
      setIsLoading(true);
      setError(null);
      if (!tenantSlug) {
        setError("Store not found: Missing tenant slug.");
        setIsLoading(false);
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('tenant_slug', tenantSlug)
          .single();

        if (profileError || !profileData) {
          setError("Store not found or an error occurred.");
          setIsLoading(false);
          return;
        }
        setProfile(profileData);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreProfile();
  }, [tenantSlug]);

  if (isLoading) {
    return <AppLoader message="Loading store..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/')} className="mt-6">Go to Dashboard</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Store Not Found</h1>
        <p className="text-lg text-muted-foreground">The store you are looking for does not exist.</p>
        <Button onClick={() => router.push('/')} className="mt-6">Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        {/* Left section: Mobile menu OR Logo + Store Name */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <h2 className="text-xl font-bold mb-6">Navigation</h2>
                <StoreNavbar tenantSlug={tenantSlug} direction="vertical" onLinkClick={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
          {profile?.avatar_url ? (
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              <Image
                src={profile.avatar_url}
                alt="Store Logo"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-full"
              />
            </div>
          ) : (
            <Store className="h-6 w-6 text-primary" />
          )}
          <h1 className="text-xl font-bold">{profile.tenant_name || "Public Store"}</h1>
        </div>

        {/* Center section: Desktop Navigation */}
        {!isMobile && (
          <div className="flex-1 flex justify-center"> {/* This div will take available space and center its content */}
            <StoreNavbar tenantSlug={tenantSlug} direction="horizontal" />
          </div>
        )}

        {/* Right section: Theme Toggle + Cart */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={() => router.push('/cart')} variant="outline" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                {itemCount}
              </Badge>
            )}
            <span className="ml-2">Cart</span>
          </Button>
        </div>
      </header>

      {/* Store Navigation (Desktop only) - Removed as it's now in the header */}
      {/* {!isMobile && <StoreNavbar tenantSlug={tenantSlug} direction="horizontal" />} */}

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>

      <footer className="w-full py-4 text-center text-muted-foreground text-sm border-t border-border bg-card">
        Made with Yaarsite
      </footer>
    </div>
  );
}