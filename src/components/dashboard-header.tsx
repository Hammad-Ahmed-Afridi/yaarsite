"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Store, LogOut, LayoutDashboard, Globe } from 'lucide-react';
import { Profile, useSession } from '@/components/session-context-provider';


interface DashboardHeaderProps {
  profile: Profile | null;
  onSignOut: () => void;
  // Removed showBackButton and currentPath props
}

export function DashboardHeader({ profile, onSignOut }: DashboardHeaderProps) {
  // Removed isDashboardRoot and backButtonHref logic

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card font-sans">
      <div className="flex items-center space-x-4">
        {/* Removed back button from here */}
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
        <h1 className="text-lg md:text-xl font-bold">{profile?.tenant_name || "Dashboard"}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" className="flex items-center gap-2 font-semibold" disabled={profile?.tenant_name === null}>
          <Link href="/free-domain">
            <Globe className="h-4 w-4" />
            Free Domain
          </Link>
        </Button>
        <Button onClick={onSignOut} variant="outline" className="flex items-center gap-2 font-semibold">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}