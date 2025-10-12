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

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Found</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">The store you are looking for does not exist or is still loading.</p>
      </div>
    );
  }

  const hasAddress = profile.store_address_line || profile.store_city || profile.store_province;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 font-sans">
      {profile.contact_page_hero_image_url ? (
        <div className="relative w-full max-w-4xl h-64 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-lg">
          <Image
            src={profile.contact_page_hero_image_url}
            alt="Contact Page Hero"
            fill
            style={{ objectFit: 'cover' }}
            className="object-center"
          />
        </div>
      ) : (
        <Mail className="h-24 w-24 text-store-primary mb-6" /> 
      )}
      <h1 className="text-4xl font-bold mb-4 tracking-tight">
        {profile.contact_page_heading || `Contact ${profile.tenant_name}`}
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
        {profile.contact_page_description || "Have questions or need assistance? Reach out to us!"}
      </p>

      <div className="space-y-4 text-left w-full max-w-md">
        {profile.email && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-store-card shadow-sm"> {/* Use store-card */}
            <Mail className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-semibold text-base">Email Us</p>
              <a href={`mailto:${profile.email}`} className="text-store-primary hover:underline text-base">{profile.email}</a> {/* Use store-primary */}
            </div>
          </div>
        )}
        {profile.phone_number && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-store-card shadow-sm"> {/* Use store-card */}
            <Phone className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-semibold text-base">Call Us</p>
              <a href={`tel:${profile.phone_number}`} className="text-store-primary hover:underline text-base">{profile.phone_number}</a> {/* Use store-primary */}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-store-card shadow-sm"> {/* Use store-card */}
          <MapPin className="h-6 w-6 text-muted-foreground" />
          <div>
            <p className="font-semibold text-base">Visit Us</p>
            {hasAddress ? (
              <p className="text-muted-foreground text-base">
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