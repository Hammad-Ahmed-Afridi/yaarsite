import type { Metadata } from 'next';
import { createPublicServerSupabaseClient } from '@/integrations/supabase/server';

// generateMetadata for the contact page, leveraging data from the layout's generateMetadata
export async function generateMetadata({ params }: { params: { tenantSlug: string } }): Promise<Metadata> {
  const tenantSlug = params.tenantSlug;
  return {
    title: `Contact Us`, // This will be combined with the layout's title template
    description: `Get in touch with this Yaarsite store for inquiries and support.`,
    alternates: {
      canonical: `https://yaarsite.vercel.app/store/${tenantSlug}/contact`,
    },
  };
}