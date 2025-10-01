import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Store, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  store_url: string | null;
  store_description: string | null;
  avatar_url: string | null;
  home_page_heading: string | null;
  home_page_description: string | null;
}

export default async function StoreHomePage({ params }: { params: { tenantSlug: string } }) {
  const tenantSlug = params.tenantSlug;

  if (!tenantSlug) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">Store not found: Missing tenant slug.</p>
      </div>
    );
  }

  let profile: Profile | null = null;
  let error: string | null = null;

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, first_name, tenant_name, tenant_slug, store_url, store_description, avatar_url, home_page_heading, home_page_description')
      .eq('tenant_slug', tenantSlug)
      .single();

    if (profileError || !profileData) {
      error = "Store not found or an error occurred.";
    } else {
      profile = profileData;
    }
  } catch (err: any) {
    error = err.message || "An unexpected error occurred.";
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
        {profile.home_page_description || profile.store_description || "Discover a wide range of products hand-picked just for you. We're excited to share our offerings with you!"}
      </p>
      <Button asChild size="lg">
        <Link href={`/store/${tenantSlug}`}>
          <Package className="mr-2 h-5 w-5" /> View Our Products
        </Link>
      </Button>
    </div>
  );
}