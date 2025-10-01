import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Info } from 'lucide-react';
import { PageProps } from '@/types/next-page-props'; // Explicit import

interface Profile {
  id: string;
  tenant_name: string | null;
  store_description: string | null;
  about_page_content: string | null;
}

export default async function StoreAboutPage({ params }: PageProps) {
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
      .select('id, tenant_name, store_description, about_page_content')
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
      <Info className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-4">About {profile.tenant_name}</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-prose">
        {profile.about_page_content || profile.store_description || "We are dedicated to providing you with the best products and an exceptional shopping experience. Our mission is to bring quality and value directly to you."}
      </p>
      {!profile.about_page_content && (
        <p className="text-md text-muted-foreground max-w-prose">
          Founded with a passion for excellence, we strive to offer unique items and outstanding customer service. Thank you for being a part of our journey!
        </p>
      )}
    </div>
  );
}