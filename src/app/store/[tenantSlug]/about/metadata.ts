import type { Metadata } from 'next';
import { createPublicServerSupabaseClient } from '@/integrations/supabase/server';

// generateMetadata for the about page, leveraging data from the layout's generateMetadata
export async function generateMetadata({ params }: { params: { tenantSlug: string } }): Promise<Metadata> {
  const tenantSlug = params.tenantSlug;
  return {
    title: `About Us`, // This will be combined with the layout's title template
    description: `Learn more about this Yaarsite store and its mission.`,
    alternates: {
      canonical: `https://yaarsite.vercel.app/store/${tenantSlug}/about`,
    },
  };
}