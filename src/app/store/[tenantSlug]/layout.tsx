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
import { Profile } from '@/components/session-context-provider';
import { StoreNavbar } from '@/components/store-navbar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook
import { toast } from 'sonner'; // Import toast
import { StoreProfileProvider } from '@/components/store-profile-context-provider'; // Import new provider
import type { Metadata } from 'next';
import { createPublicServerSupabaseClient } from '@/integrations/supabase/server'; // Import server-side client

interface StoreLayoutProps {
  children: React.ReactNode;
  params: { tenantSlug: string };
}

// generateMetadata function for dynamic store pages
export async function generateMetadata({ params }: { params: { tenantSlug: string } }): Promise<Metadata> {
  const supabaseServer = createPublicServerSupabaseClient();
  const tenantSlug = params.tenantSlug;

  const { data: profileData, error: profileError } = await supabaseServer
    .from('profiles')
    .select('tenant_name, store_description, avatar_url')
    .eq('tenant_slug', tenantSlug)
    .single();

  const storeName = profileData?.tenant_name || "Yaarsite Store";
  const storeDescription = profileData?.store_description || "Discover amazing products from this Yaarsite powered online store.";
  const storeImageUrl = profileData?.avatar_url || "https://placehold.co/1200x630/1e293b/cbd5e1?text=Ys"; // Default OG image

  return {
    title: storeName,
    description: storeDescription,
    openGraph: {
      title: storeName,
      description: storeDescription,
      url: `https://yaarsite.vercel.app/store/${tenantSlug}`,
      images: [
        {
          url: storeImageUrl,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: storeDescription,
      images: [storeImageUrl],
    },
    alternates: {
      canonical: `https://yaarsite.vercel.app/store/${tenantSlug}`,
    },
  };
}

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
  const { cartItems, itemCount, clearCart } = useCart(); // Get clearCart from context
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
          .select('*, store_page_welcome_message, home_page_heading, home_page_description, about_page_content, contact_page_heading, contact_page_description') // Select all relevant fields
          .eq('tenant_slug', tenantSlug)
          .single();

        if (profileError || !profileData) {
          setError("Store not found or an error occurred.");
          setIsLoading(false);
          return;
        }
        setProfile(profileData);

        // Check if cart needs to be cleared
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
  }, [tenantSlug, cartItems, clearCart]); // Added cartItems and clearCart to dependencies

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
    <StoreProfileProvider initialProfile={profile}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-card">
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
              <Store className="h-6 w-6 text-primary" />
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
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full">
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
                <SheetContent side="right" className="w-64 p-4">
                  <h2 className="text-xl font-bold mb-6">Navigation</h2>
                  <StoreNavbar tenantSlug={tenantSlug} direction="vertical" onLinkClick={() => setIsSheetOpen(false)} />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>

        <footer className="w-full py-4 text-center text-muted-foreground text-sm border-t border-border bg-card">
          Made with Yaarsite
        </footer>
      </div>
    </StoreProfileProvider>
  );
}