"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/app-loader';
import { Button } from '@/components/ui/button';
import { Store, Image as ImageIcon } from 'lucide-react';
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

  // Determine which image to display for the content section
  const displayContentImage = profile.home_page_content_image_url;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 font-sans">
      {/* Welcome Section - Now only heading */}
      <h1 className="text-4xl font-bold mb-8 tracking-tight"> {/* Adjusted mb-4 to mb-8 for spacing */}
        {profile?.home_page_heading || `Welcome to ${profile?.tenant_name || 'our store'}!`}
      </h1>

      {/* Home Page Content Section (Image Left, Text Right) */}
      {(displayContentImage || profile?.home_page_content_text) && (
        <section className="w-full max-w-4xl mb-20"> {/* Added mb-20 for spacing before the button */}
          <div className="grid md:grid-cols-2 gap-8 items-center text-left">
            {displayContentImage ? (
              <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg">
                <Image
                  src={displayContentImage}
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
                {profile?.home_page_content_text || "Here you can tell your customers more about your unique selling propositions, your brand story, or any special offers you have. Make it engaging!"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* View Our Products Button */}
      <Button asChild size="lg" className="font-semibold bg-store-primary text-store-primary-foreground hover:bg-store-primary/90">
        <Link href={`/store/${tenantSlug}`}>
          <span>
            View Our Products
          </span>
        </Link>
      </Button>
    </div>
  );
}