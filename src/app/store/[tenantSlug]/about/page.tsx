"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/app-loader';
import { Info, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useStoreProfile } from '@/components/store-profile-context-provider'; // Import useStoreProfile

export default function StoreAboutPage() {
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
      setError("Store profile not found. Please try refreshing the page.");
      setIsLoading(false);
    }
  }, [profile]);

  if (isLoading) {
    return <AppLoader message="Loading about page..." isFullScreen={false} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-2xl md:text-3xl font-bold text-destructive mb-4 tracking-tight">Error</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Store Not Found</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">The store you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 font-sans">
      {profile.about_page_hero_image_url ? (
        <div className="relative w-full max-w-4xl h-64 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-lg">
          <Image
            src={profile.about_page_hero_image_url}
            alt="About Us Hero"
            fill
            style={{ objectFit: 'cover' }}
            className="object-center"
          />
        </div>
      ) : (
        <Info className="h-24 w-24 text-primary mb-6" />
      )}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">About {profile.tenant_name}</h1>
      <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
        {profile.about_page_content || "We are dedicated to providing you with the best products and an exceptional shopping experience. Our mission is to bring quality and value directly to you."}
      </p>
    </div>
  );
}