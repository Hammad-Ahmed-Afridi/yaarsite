import { MetadataRoute } from 'next';
import { supabase } from '@/integrations/supabase/client';

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
  ];

  // Fetch dynamic store pages from Supabase
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('tenant_slug, updated_at')
    .not('tenant_slug', 'is', null); // Only select profiles with a tenant_slug

  if (error) {
    console.error("Error fetching tenant slugs for sitemap:", error);
    // If there's an error fetching dynamic data, return only static paths
    return staticPaths;
  }

  const dynamicPaths: MetadataRoute.Sitemap = profiles.flatMap(profile => {
    const lastModified = profile.updated_at ? new Date(profile.updated_at) : new Date();
    return [
      {
        url: `${BASE_URL}/store/${profile.tenant_slug}`, // Main store page (products)
        lastModified,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/store/${profile.tenant_slug}/home`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/store/${profile.tenant_slug}/about`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/store/${profile.tenant_slug}/contact`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];
  });

  return [...staticPaths, ...dynamicPaths];
}