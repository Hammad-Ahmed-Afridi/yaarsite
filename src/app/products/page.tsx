import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/integrations/supabase/server';
import { ProductsClientPage } from './products-client-page'; // New client component
import { Profile } from "@/components/session-context-provider";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
  created_at: string;
}

export default async function ProductsPage() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;
  let profile: Profile | null = null;
  let products: Product[] = [];

  try {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Products Page (Server): Error fetching profile:", profileError);
    } else {
      profile = profileData as Profile;
    }

    // Fetch products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error("Products Page (Server): Error fetching products:", productsError);
    } else {
      products = productsData || [];
    }

  } catch (error) {
    console.error("Products Page (Server): Unexpected error fetching data:", error);
  }

  return (
    <ProductsClientPage profile={profile} initialProducts={products} />
  );
}