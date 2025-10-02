"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Store } from 'lucide-react';
import { Profile } from '@/components/session-context-provider';


interface DashboardHeaderProps {
  profile: Profile | null;
  onSignOut: () => void; // onSignOut is now passed from DashboardLayout
  showBackButton?: boolean; // Optional: to control back button visibility
  currentPath?: string; // Optional: to determine if back button should go to dashboard
}

export function DashboardHeader({ profile, showBackButton = true, currentPath }: DashboardHeaderProps) {
  const isDashboardRoot = currentPath === '/';

  return (
    <div className="flex items-center justify-between w-full"> {/* Changed from header to div, removed padding */}
      <div className="flex items-center space-x-4">
        {showBackButton && !isDashboardRoot && (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        {profile?.avatar_url ? (
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src={profile.avatar_url}
              alt="Store Logo"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-full"
            />
          </div>
        ) : (
          <Store className="h-6 w-6 text-primary" />
        )}
        <h1 className="text-xl font-bold">{profile?.tenant_name || "Dashboard"}</h1>
      </div>
      {/* Sign out button removed from here, now handled by sidebar/layout */}
    </div>
  );
}