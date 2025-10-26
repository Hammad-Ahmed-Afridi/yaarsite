import { MetadataRoute } from 'next';
import { supabaseServer } from '@/integrations/supabase/server'; // Re-import supabaseServer

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaarsite.vercel.app'; // Use your deployed app's URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/landing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/store`, // Generic store landing page
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/products`, // Dashboard products page
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/orders`, // Dashboard orders page
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/settings`, // Dashboard settings page
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/pages`, // Dashboard pages customization page
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/free-domain`, // Dashboard free domain page
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/download-app`, // Download app page
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms-and-conditions`, // New: Terms and Conditions page
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Fetch all tenant slugs to generate dynamic store paths
  const { data: profiles, error } = await supabaseServer
    .from('profiles')
    .select('tenant_slug')
    .not('tenant_slug', 'is', null);

  if (error) {
    console.error("Error fetching profiles for sitemap:", error);
    // Return only static paths if dynamic fetching fails
    return staticPaths;
  }

  const dynamicStorePaths: MetadataRoute.Sitemap = profiles.flatMap((profile) => {
    const tenantSlug = profile.tenant_slug;
    if (!tenantSlug) return []; // Should not happen due to .not('tenant_slug', 'is', null)

    return [
      {
        url: `${BASE_URL}/store/${tenantSlug}`, // Products page
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/store/${tenantSlug}/home`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/store/${tenantSlug}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/store/${tenantSlug}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];
  });

  return [...staticPaths, ...dynamicStorePaths];
}