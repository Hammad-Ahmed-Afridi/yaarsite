"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppLoader } from '@/components/app-loader';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useStoreProfile } from '@/components/store-profile-context-provider'; // Import useStoreProfile
import { Profile } from '@/components/session-context-provider'; // Import shared Profile type

export default function StoreContactPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const { storeProfile: profile } = useStoreProfile(); // Use context to get profile
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setIsLoading(false);
    } else {
      // This case should ideally not happen if layout fetches correctly,
      // but as a fallback, we can show an error.
      setError("Store profile not found. Please try refreshing the page.");
      setIsLoading(false);
    }
  }, [profile]); // Depend on profile from context

  if (isLoading) {
    return <AppLoader message="Loading contact page..." isFullScreen={false} />;
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
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <Mail className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
        {profile.contact_page_heading || `Contact ${profile.tenant_name}`}
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-prose leading-relaxed">
        {profile.contact_page_description || "Have questions or need assistance? Reach out to us!"}
      </p>

      <div className="space-y-6 text-left w-full max-w-md">
        {profile.email && (
          <div className="flex items-center gap-4 p-5 border rounded-xl bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary">
            <Mail className="h-7 w-7 text-muted-foreground" />
            <div>
              <p className="font-semibold text-lg">Email Us</p>
              <a href={`mailto:${profile.email}`} className="text-primary hover:underline text-base">{profile.email}</a>
            </div>
          </div>
        )}
        {profile.phone_number && (
          <div className="flex items-center gap-4 p-5 border rounded-xl bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary">
            <Phone className="h-7 w-7 text-muted-foreground" />
            <div>
              <p className="font-semibold text-lg">Call Us</p>
              <a href={`tel:${profile.phone_number}`} className="text-primary hover:underline text-base">{profile.phone_number}</a>
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 p-5 border rounded-xl bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary">
          <MapPin className="h-7 w-7 text-muted-foreground" />
          <div>
            <p className="font-semibold text-lg">Visit Us</p>
            <p className="text-muted-foreground text-base">Online Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}