"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppLoader } from '@/components/app-loader';
import { Mail, Phone, MapPin, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
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
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-3xl font-bold text-destructive mb-4 tracking-tight">Error</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Found</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">The store you are looking for does not exist.</p>
      </div>
    );
  }

  const hasAddress = profile.store_address_line || profile.store_city || profile.store_province;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 font-sans">
      <div className="grid md:grid-cols-2 gap-8 items-center w-full max-w-4xl text-left mb-12">
        {profile.contact_page_hero_image_url ? (
          <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg">
            <Image
              src={profile.contact_page_hero_image_url}
              alt="Contact Page Hero"
              fill
              style={{ objectFit: 'cover' }}
              className="object-center"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-64 md:h-80 rounded-3xl bg-muted shadow-lg">
            <Mail className="h-24 w-24 text-muted-foreground" />
          </div>
        )}
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight">
            {profile.contact_page_heading || `Contact ${profile.tenant_name}`}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {"Have questions or need assistance? Reach out to us!"}
          </p>
        </div>
      </div>

      <div className="space-y-4 text-left w-full max-w-md">
        {profile.store_contact_email && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-store-card shadow-sm"> {/* Use store-card */}
            <Mail className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-semibold text-base">Email Us</p>
              <a href={`mailto:${profile.store_contact_email}`} className="text-store-primary hover:underline text-base">{profile.store_contact_email}</a> {/* Use store-primary */}
            </div>
          </div>
        )}
        {profile.store_contact_phone && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-store-card shadow-sm"> {/* Use store-card */}
            <Phone className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-semibold text-base">Call Us</p>
              <a href={`tel:${profile.store_contact_phone}`} className="text-store-primary hover:underline text-base">{profile.store_contact_phone}</a> {/* Use store-primary */}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-store-card shadow-sm"> {/* Use store-card */}
          <MapPin className="h-6 w-6 text-muted-foreground" />
          <div>
            <p className="font-semibold text-base">Visit Us</p>
            {hasAddress ? (
              <p className="text-muted-foreground text-base break-words"> {/* Added break-words */}
                {profile.store_address_line && <span>{profile.store_address_line}, </span>}
                {profile.store_city && <span>{profile.store_city}, </span>}
                {profile.store_province && <span>{profile.store_province}</span>}
              </p>
            ) : (
              <p className="text-muted-foreground text-base">Online Only</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}