import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client'; // Supabase client for server-side
import { StoreClientPage } from '@/components/store-client-page'; // New client component

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
}

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  store_url: string | null;
  avatar_url: string | null;
}

export default async function PublicStorePage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;

  if (!tenantSlug) {
    notFound(); // Or handle as an error
  }

  // Fetch profile data on the server
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_slug', tenantSlug)
    .single();

  if (profileError || !profileData) {
    console.error("Server Component: Error fetching profile:", profileError);
    notFound(); // Store not found
  }

  // Fetch products data on the server
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', profileData.id);

  if (productsError) {
    console.error("Server Component: Error fetching products:", productsError);
    // Even if products fail to load, we can still show the store profile
    // and an empty products message, so we don't call notFound here.
  }

  return (
    <StoreClientPage profile={profileData as Profile} products={productsData as Product[] || []} />
  );
}