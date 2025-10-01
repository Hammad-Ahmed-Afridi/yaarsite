"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoreNavbarProps {
  tenantSlug: string;
  direction?: 'horizontal' | 'vertical'; // New prop for layout direction
  onLinkClick?: () => void; // New prop to handle closing the menu on link click
}

export function StoreNavbar({ tenantSlug, direction = 'horizontal', onLinkClick }: StoreNavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: `/store/${tenantSlug}/home` },
    { name: 'Store', href: `/store/${tenantSlug}` }, // This will be the products page
    { name: 'About Us', href: `/store/${tenantSlug}/about` },
    { name: 'Contact Us', href: `/store/${tenantSlug}/contact` },
  ];

  const containerClasses = cn(
    "flex",
    direction === 'horizontal' ? "space-x-2" : "flex-col space-y-2 items-start w-full" // Removed pb-1 here
  );

  return (
    <nav className={cn(
      direction === 'vertical' ? "border-none p-0" : "bg-transparent border-none p-0", // Ensure no background/border for horizontal
    )}>
      <div className={containerClasses}>
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            asChild
            className={cn(
              "text-base font-medium",
              pathname === item.href ? "text-primary underline underline-offset-4" : "text-muted-foreground hover:text-foreground",
              direction === 'vertical' && "w-full justify-start" // Full width for vertical items
            )}
            onClick={onLinkClick} // Close sheet on click
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