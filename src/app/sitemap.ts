import { MetadataRoute } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yaarsite.vercel.app';

  // Static pages
  const staticPaths: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/orders`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/store-customization`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dynamic store pages
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('tenant_slug, updated_at')
    .not('tenant_slug', 'is', null); // Only include profiles with a tenant_slug

  if (error) {
    console.error("Error fetching profiles for sitemap:", error);
    // Return static paths only if there's an error fetching dynamic ones
    return staticPaths;
  }

  const storePaths: MetadataRoute.Sitemap = (profiles || []).map((profile) => ({
    url: `${baseUrl}/store/${profile.tenant_slug}`,
    lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Include sub-pages for each store
  const storeSubPaths: MetadataRoute.Sitemap = (profiles || []).flatMap((profile) => [
    {
      url: `${baseUrl}/store/${profile.tenant_slug}/home`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/store/${profile.tenant_slug}/about`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/store/${profile.tenant_slug}/contact`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]);

  return [...staticPaths, ...storePaths, ...storeSubPaths];
}