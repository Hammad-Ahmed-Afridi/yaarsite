import React from 'react';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/integrations/supabase/server';
import { StoreClientPage } from '@/components/store-client-page';

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

// Define a local PageProps type that matches Next.js's expected structure
// This helps to explicitly define the type and avoid potential conflicts with global definitions.
type NextPageProps<P = {}, S = {}> = {
  params: P;
  searchParams?: S; // searchParams is optional and can be more complex, but for this error, focusing on params is key.
};

export default async function PublicStorePage({ params }: NextPageProps<{ tenantSlug: string }>) {
  const { tenantSlug } = params; // Directly destructure the specific parameter

  if (!tenantSlug) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  // Fetch profile data on the server
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_slug', tenantSlug)
    .single();

  if (profileError || !profileData) {
    console.error("Server Component: Error fetching profile:", profileError);
    notFound();
  }

  // Fetch products data on the server
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', profileData.id);

  if (productsError) {
    console.error("Server Component: Error fetching products:", productsError);
  }

  return (
    <StoreClientPage profile={profileData as Profile} products={productsData as Product[] || []} />
  );
}