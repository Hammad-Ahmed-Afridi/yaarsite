"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/app-loader';
import { Info, Image as ImageIcon, Store, Package } from 'lucide-react'; // Added Store and Package icons
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useStoreProfile } from '@/components/store-profile-context-provider'; // Import useStoreProfile

export default function StoreHomePage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const { storeProfile: profile } = useStoreProfile(); // Use context

  // If profile is null, it means the layout couldn't find the store or it's still loading.
  // The layout itself should handle the primary loading/error states.
  // If we reach here and profile is null, it implies the store doesn't exist.
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Found</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">The store you are looking for does not exist or is still loading.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 font-sans">
      {profile.home_page_hero_image_url ? (
        <div className="relative w-full max-w-4xl h-64 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-lg">
          <Image
            src={profile.home_page_hero_image_url}
            alt="Home Page Hero"
            fill
            style={{ objectFit: 'cover' }}
            className="object-center"
          />
        </div>
      ) : (
        profile.avatar_url ? (
          <div className="relative h-32 w-32 rounded-full overflow-hidden mb-6 border-2 border-store-primary">
            <Image
              src={profile.avatar_url}
              alt="Store Logo"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-full"
            />
          </div>
        ) : (
          <Store className="h-24 w-24 text-store-primary mb-6" />
        )
      )}
      <h1 className="text-4xl font-bold mb-4 tracking-tight">
        {profile.home_page_heading || `Welcome to ${profile.tenant_name}!`}
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
        {profile.home_page_description || "Discover a wide range of products hand-picked just for you. We're excited to share our offerings with you!"}
      </p>
      <Button asChild size="lg" className="font-semibold bg-store-primary text-store-foreground hover:bg-store-primary/90">
        <Link href={`/store/${tenantSlug}`}>
          <span className="flex items-center"> {/* Wrapped icon and text in a span */}
            <Package className="mr-2 h-5 w-5" /> View Our Products
          </span>
        </Link>
      </Button>

      {/* Home Page Content Section (Image Left, Text Right) */}
      {(profile.home_page_content_image_url || profile.home_page_content_text) && (
        <section className="mt-20 w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center text-left">
            {profile.home_page_content_image_url ? (
              <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg">
                <Image
                  src={profile.home_page_content_image_url}
                  alt="Home Page Content"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="object-center"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-64 md:h-80 rounded-3xl bg-muted shadow-lg">
                <ImageIcon className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">More About Our Store</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {profile.home_page_content_text || "Here you can tell your customers more about your unique selling propositions, your brand story, or any special offers you have. Make it engaging!"}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}