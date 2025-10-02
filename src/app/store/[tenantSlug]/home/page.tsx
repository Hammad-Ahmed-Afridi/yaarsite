"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/app-loader';
import { Button } from '@/components/ui/button';
import { Store, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useStoreProfile } from '@/components/store-profile-context-provider'; // Import useStoreProfile

export default function StoreHomePage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const { storeProfile: profile, setStoreProfile } = useStoreProfile(); // Use context
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No need to fetch profile here, it comes from layout via context
  useEffect(() => {
    if (profile) {
      setIsLoading(false);
    } else {
      // This case should ideally not happen if layout fetches correctly,
      // but as a fallback, we can re-fetch or show an error.
      // For now, we'll just show an error if profile is unexpectedly null.
      setError("Store profile not found. Please try refreshing the page.");
      setIsLoading(false);
    }
  }, [profile]);

  if (isLoading) {
    return <AppLoader message="Loading store home..." isFullScreen={false} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Store Not Found</h1>
        <p className="text-lg text-muted-foreground">The store you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {profile.avatar_url ? (
        <div className="relative h-32 w-32 rounded-full overflow-hidden mb-6 border-2 border-primary">
          <Image
            src={profile.avatar_url}
            alt="Store Logo"
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-full"
          />
        </div>
      ) : (
        <Store className="h-24 w-24 text-primary mb-6" />
      )}
      <h1 className="text-4xl font-bold mb-4">
        {profile.home_page_heading || `Welcome to ${profile.tenant_name}!`}
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-prose">
        {profile.home_page_description || "Discover a wide range of products hand-picked just for you. We're excited to share our offerings with you!"}
      </p>
      <Button asChild size="lg">
        <Link href={`/store/${tenantSlug}`}>
          <Package className="mr-2 h-5 w-5" /> View Our Products
        </Link>
      </Button>
    </div>
  );
}