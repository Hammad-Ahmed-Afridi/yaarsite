import type { Metadata } from 'next';
import { createPublicServerSupabaseClient } from '@/integrations/supabase/server';

// generateMetadata for the home page, leveraging data from the layout's generateMetadata
export async function generateMetadata({ params }: { params: { tenantSlug: string } }): Promise<Metadata> {
  const tenantSlug = params.tenantSlug;
  // The layout's generateMetadata will fetch the profile, so we can build upon that.
  // For specific page metadata, we can add more details here.
  return {
    title: `Home`, // This will be combined with the layout's title template
    description: `Welcome to the home page of this Yaarsite store.`,
    alternates: {
      canonical: `https://yaarsite.vercel.app/store/${tenantSlug}/home`,
    },
  };
}

export default function StoreHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}