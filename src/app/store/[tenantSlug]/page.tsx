import { supabaseServer } from '@/integrations/supabase/server'; // Corrected import
import StoreProductsPage from './products-client-page';

// Revalidate every 60 seconds (or on demand via revalidatePath)
export const revalidate = 60; 

// This function will generate static paths for all existing tenant slugs
export async function generateStaticParams() {
  const { data: profiles, error } = await supabaseServer // Use server-side client
    .from('profiles')
    .select('tenant_slug')
    .not('tenant_slug', 'is', null); // Only select profiles with a tenant_slug

  if (error) {
    console.error("Error generating static params for store products:", error);
    return [];
  }

  return profiles.map((profile) => ({
    tenantSlug: profile.tenant_slug,
  }));
}

export default function ProductsServerPage() {
  // This is a server component that renders the client component
  return <StoreProductsPage />;
}