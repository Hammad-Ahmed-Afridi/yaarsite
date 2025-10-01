"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoreNavbarProps {
  tenantSlug: string;
}

export function StoreNavbar({ tenantSlug }: StoreNavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: `/store/${tenantSlug}/home` },
    { name: 'Store', href: `/store/${tenantSlug}` }, // This will be the products page
    { name: 'About Us', href: `/store/${tenantSlug}/about` },
    { name: 'Contact Us', href: `/store/${tenantSlug}/contact` },
  ];

  return (
    <nav className="bg-card border-b border-border p-2 flex justify-center">
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            asChild
            className={cn(
              "text-base font-medium",
              pathname === item.href ? "text-primary underline underline-offset-4" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href={item.href}>
              {item.name}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}