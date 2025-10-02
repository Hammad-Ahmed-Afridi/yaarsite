"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/app-loader';
import { Info } from 'lucide-react';
import { useStoreProfile } from '@/components/store-profile-context-provider'; // Import useStoreProfile
import type { Metadata } from 'next';

// generateMetadata for the about page, leveraging data from the layout's generateMetadata
export async function generateMetadata({ params }: { params: { tenantSlug: string } }): Promise<Metadata> {
  const tenantSlug = params.tenantSlug;
  return {
    title: `About Us`, // This will be combined with the layout's title template
    description: `Learn more about this Yaarsite store and its mission.`,
    alternates: {
      canonical: `https://yaarsite.vercel.app/store/${tenantSlug}/about`,
    },
  };
}

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
      <Info className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-4">About {profile.tenant_name}</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-prose">
        {profile.about_page_content || "We are dedicated to providing you with the best products and an exceptional shopping experience. Our mission is to bring quality and value directly to you."}
      </p>
    </div>
  );
}