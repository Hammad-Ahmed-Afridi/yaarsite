"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Package, ShoppingCart, Settings, LayoutDashboard, Store, LogOut } from 'lucide-react';
import { Profile } from '@/components/session-context-provider';

interface DashboardSidebarProps {
  profile: Profile | null;
  onSignOut: () => void;
  onLinkClick?: () => void; // For closing mobile menu
}

export function DashboardSidebar({ profile, onSignOut, onLinkClick }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col justify-between border-r border-border bg-sidebar p-4">
      <div className="space-y-4">
        {/* Store Info */}
        <div className="flex items-center gap-3 px-2">
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
            <Store className="h-6 w-6 text-sidebar-primary" />
          )}
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            {profile?.tenant_name || "My Dashboard"}
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="grid items-start gap-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sidebar-foreground",
                pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
              )}
              asChild
              onClick={onLinkClick}
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
      </div>

      {/* Sign Out Button */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <Button onClick={onSignOut} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}