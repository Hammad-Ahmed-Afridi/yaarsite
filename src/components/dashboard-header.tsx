"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Store, LogOut, LayoutDashboard } from 'lucide-react';
import { Profile } from '@/components/session-context-provider'; // Import Profile type
import { ThemeToggle } from '@/components/theme-toggle'; // Import ThemeToggle

interface DashboardHeaderProps {
  profile: Profile | null;
  onSignOut: () => void;
  showBackButton?: boolean;
  currentPath?: string; // Optional: to determine if back button should go to dashboard
}

export function DashboardHeader({ profile, onSignOut, showBackButton = true, currentPath }: DashboardHeaderProps) {
  const isDashboardRoot = currentPath === '/';

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
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
        {/* Removed the Badge displaying profile?.tenant_slug */}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button onClick={onSignOut} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}