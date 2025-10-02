"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/app-loader';
import { Info } from 'lucide-react';

interface Profile {
  id: string;
  tenant_name: string | null;
  store_description: string | null;
  about_page_content: string | null; // New field
}

export default function StoreAboutPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          .select('id, tenant_name, store_description, about_page_content') // Select new field
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
      {/* Removed the second static paragraph as it's now covered by the customizable content */}
    </div>
  );
}