import type { Metadata } from 'next';
import { createPublicServerSupabaseClient } from '@/integrations/supabase/server';

// generateMetadata function for dynamic store pages
export async function generateMetadata({ params }: { params: { tenantSlug: string } }): Promise<Metadata> {
  const supabaseServer = createPublicServerSupabaseClient();
  const tenantSlug = params.tenantSlug;

  const { data: profileData, error: profileError } = await supabaseServer
    .from('profiles')
    .select('tenant_name, store_description, avatar_url')
    .eq('tenant_slug', tenantSlug)
    .single();

  const storeName = profileData?.tenant_name || "Yaarsite Store";
  const storeDescription = profileData?.store_description || "Discover amazing products from this Yaarsite powered online store.";
  const storeImageUrl = profileData?.avatar_url || "https://placehold.co/1200x630/1e293b/cbd5e1?text=Ys"; // Default OG image

  return {
    title: storeName,
    description: storeDescription,
    openGraph: {
      title: storeName,
      description: storeDescription,
      url: `https://yaarsite.vercel.app/store/${tenantSlug}`,
      images: [
        {
          url: storeImageUrl,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: storeDescription,
      images: [storeImageUrl],
    },
    alternates: {
      canonical: `https://yaarsite.vercel.app/store/${tenantSlug}`,
    },
  };
}