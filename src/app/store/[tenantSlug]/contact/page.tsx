import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin } from 'lucide-react';

// Define component-specific props directly
interface StoreContactPageProps {
  params: {
    tenantSlug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

interface Profile {
  id: string;
  tenant_name: string | null;
  email: string | null;
  phone_number: string | null;
}

export default async function StoreContactPage({ params }: StoreContactPageProps) {
  const tenantSlug = params.tenantSlug;

  if (!tenantSlug) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">Store not found: Missing tenant slug.</p>
      </div>
    );
  }

  let profile: Profile | null = null;
  let error: string | null = null;

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, tenant_name, email, phone_number')
      .eq('tenant_slug', tenantSlug)
      .single();

    if (profileError || !profileData) {
      error = "Store not found or an error occurred.";
    } else {
      profile = profileData;
    }
  } catch (err: any) {
    error = err.message || "An unexpected error occurred.";
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Store Not Found</h1>
        <p className="text-lg text-muted-foreground">The store you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <Mail className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-4">Contact {profile.tenant_name}</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-prose">
        Have questions or need assistance? Reach out to us!
      </p>

      <div className="space-y-4 text-left w-full max-w-md">
        {profile.email && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-card shadow-sm">
            <Mail className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-semibold">Email Us</p>
              <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a>
            </div>
          </div>
        )}
        {profile.phone_number && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-card shadow-sm">
            <Phone className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-semibold">Call Us</p>
              <a href={`tel:${profile.phone_number}`} className="text-primary hover:underline">{profile.phone_number}</a>
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card shadow-sm">
          <MapPin className="h-6 w-6 text-muted-foreground" />
          <div>
            <p className="font-semibold">Visit Us</p>
            <p className="text-muted-foreground">Online Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}