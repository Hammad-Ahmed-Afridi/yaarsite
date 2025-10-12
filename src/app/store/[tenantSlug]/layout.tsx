"use client";

import React, { useEffect, useState } from 'react'; // Removed 'use' import
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingCart, Menu } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/cart-context-provider';
import { AppLoader } => '@/components/app-loader';
import { Profile } from '@/components/session-context-provider';
import { StoreNavbar } from '@/components/store-navbar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { StoreProfileProvider } from '@/components/store-profile-context-provider';
import { StoreWelcomeBanner } from '@/components/store-welcome-banner';

export default function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const router = useRouter();
  // Directly access tenantSlug from params, as it's a plain object in client components.
  const tenantSlug = params.tenantSlug;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { cartItems, itemCount, clearCart } = useCart();
  const isMobile = useIsMobile();

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

        if (cartItems.length > 0 && cartItems[0].storeOwnerId !== profileData.id) {
          clearCart();
          toast.info(`Your cart was cleared because you are now shopping at ${profileData.tenant_name || 'a new store'}.`);
        }

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreProfile();
  }, [tenantSlug, cartItems, clearCart]);

  useEffect(() => {
    if (profile) {
      const root = document.documentElement;
      root.style.setProperty('--store-primary', profile.store_primary_color_hsl || 'var(--primary)');
      root.style.setProperty('--store-background', profile.store_background_color_hsl || 'var(--background)');
      root.style.setProperty('--store-card-background', profile.store_card_background_color_hsl || 'var(--card)');
      root.style.setProperty('--store-foreground', 'var(--foreground)');
      root.style.setProperty('--store-card-foreground', 'var(--card-foreground)');
    }
  }, [profile]);


  if (isLoading) {
    return <AppLoader message="Loading store..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center font-sans">
        <h1 className="text-3xl font-bold text-destructive mb-4 tracking-tight">Error</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{error}</p>
        <Button onClick={() => router.push('/')} className="mt-6 font-semibold">Go to Dashboard</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Found</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">The store you are looking for does not exist.</p>
        <Button onClick={() => router.push('/')} className="mt-6 font-semibold">Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <StoreProfileProvider initialProfile={profile}>
      <div className="min-h-screen bg-store-background text-store-foreground flex flex-col font-sans">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-store-card text-store-card-foreground">
          {/* Left section: Logo + Store Name */}
          <div className="flex items-center space-x-4">
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
              // Use store-specific primary
              <Store className="h-6 w-6 text-store-primary" />
            )}
            <h1 className="text-xl font-bold">{profile.tenant_name || "Public Store"}</h1>
          </div>

          {/* Center section: Desktop Navigation */}
          {!isMobile && (
            <div className="flex-1 flex justify-center">
              <StoreNavbar tenantSlug={tenantSlug} direction="horizontal" />
            </div>
          )}

          {/* Right section: Cart + Mobile Menu (if mobile) */}
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/cart')} variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full font-medium">
                  {itemCount}
                </Badge>
              )}
            </Button>
            {isMobile && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-4 bg-store-background text-store-foreground">
                  <h2 className="text-xl font-bold mb-6 tracking-tight">Navigation</h2>
                  <StoreNavbar tenantSlug={tenantSlug} direction="vertical" onLinkClick={() => setIsSheetOpen(false)} />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>

        {/* Store Welcome Banner */}
        <StoreWelcomeBanner message={profile?.store_page_welcome_message || `Welcome to ${profile?.tenant_name || 'our store'}!`} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>

        <footer className="w-full py-4 text-center text-store-foreground text-sm border-t border-border bg-store-card">
          Made with Yaarsite
        </footer>
      </div>
    </StoreProfileProvider>
  );
}