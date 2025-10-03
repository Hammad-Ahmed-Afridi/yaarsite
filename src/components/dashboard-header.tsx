"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Store, LogOut, LayoutDashboard, Globe } from 'lucide-react';
import { Profile } from '@/components/session-context-provider';


interface DashboardHeaderProps {
  profile: Profile | null;
  onSignOut: () => void;
  showBackButton?: boolean;
  currentPath?: string; // Optional: to determine if back button should go to dashboard
}

export function DashboardHeader({ profile, onSignOut, showBackButton = true, currentPath }: DashboardHeaderProps) {
  const isDashboardRoot = currentPath === '/dashboard'; // Updated to check for /dashboard

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card font-sans">
      <div className="flex items-center space-x-4">
        {showBackButton && !isDashboardRoot && (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"> {/* Link back to /dashboard */}
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
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" className="flex items-center gap-2 font-semibold" disabled={profile?.tenant_name === null}>
          <Link href="/free-domain">
            <Globe className="h-4 w-4" />
            Get a Free Domain
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