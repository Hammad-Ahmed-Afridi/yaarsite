"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/app-loader';
import { Button } from '@/components/ui/button';
import { Store, Image as ImageIcon } from 'lucide-react'; // Removed Package icon
import Image from 'next/image';
import Link from 'next/link';
import { useStoreProfile } from '@/components/store-profile-context-provider'; // Import useStoreProfile

export default function StoreHomePage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const { storeProfile: profile } = useStoreProfile(); // Use context
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("StoreHomePage: Profile from context:", profile); // DEBUG LOG
    if (profile) {
      setIsLoading(false);
    } else {
      // This case should ideally not happen if layout fetches correctly,
      // but as a fallback, we can re-fetch or show an error.
      setError("Store profile not found. Please try refreshing the page.");
      setIsLoading(false);
    }
  }, [profile]);

  if (isLoading) {
    return <AppLoader message="Loading store home..." isFullScreen={false} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-3xl font-bold text-destructive mb-4 tracking-tight">Error</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Found</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">The store you are looking for does not exist.</p>
      </div>
    );
  }

  // Determine which image to display for the hero section, prioritizing home_page_hero_image_url
  const displayHeroImage = profile.home_page_hero_image_url || profile.avatar_url;
  // Removed displayContentImage

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 font-sans">
      {/* Home Page Hero Section */}
      {displayHeroImage ? (
        <div className="relative w-full max-w-4xl h-64 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-lg">
          <Image
            src={displayHeroImage}
            alt="Home Page Hero"
            fill
            style={{ objectFit: 'cover' }}
            className="object-center"
          />
        </div>
      ) : (
        <Store className="h-24 w-24 text-store-primary mb-6" />
      )}
      <h1 className="text-4xl font-bold mb-4 tracking-tight">
        {profile?.home_page_heading || `Welcome to ${profile?.tenant_name || 'our store'}!`}
      </h1>
      {/* Removed Home Page Description */}
      <Button asChild size="lg" className="font-semibold bg-store-primary text-store-primary-foreground hover:bg-store-primary/90">
        <Link href={`/store/${tenantSlug}`}>
          <span>
            View Our Products
          </span>
        </Link>
      </Button>

      {/* Removed Home Page Content Section */}
    </div>
  );
}