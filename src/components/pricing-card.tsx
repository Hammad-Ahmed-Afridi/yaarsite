"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FeatureItem {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  planName: string;
  priceMonthly: number;
  priceYearly?: number;
  originalPrice?: number; // New: Optional original price for discount display
  features: FeatureItem[];
  isMostPopular?: boolean;
  buttonText: string;
  buttonLink: string;
  description: string;
}

export function PricingCard({
  planName,
  priceMonthly,
  priceYearly,
  originalPrice,
  features,
  isMostPopular = false,
  buttonText,
  buttonLink,
  description,
}: PricingCardProps) {
  return (
    <Card className={cn(
      "relative flex flex-col p-6 text-left shadow-lg rounded-4xl border-2",
      isMostPopular ? "border-primary ring-2 ring-primary" : "border-border/50",
      "hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
    )}>
      {isMostPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold bg-primary text-primary-foreground rounded-full shadow-md flex items-center gap-1">
          <Star className="h-4 w-4 fill-current" /> Most Popular
        </Badge>
      )}
      <CardHeader className="p-0 pb-4 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight mb-2">{planName}</CardTitle>
        <CardDescription className="text-base text-muted-foreground leading-relaxed">{description}</CardDescription>
        <div className="mt-4">
          {originalPrice && originalPrice > priceMonthly && (
            <p className="text-sm text-muted-foreground line-through mb-1 font-black">Rs&nbsp;{originalPrice}</p>
          )}
          <span className="text-5xl font-extrabold text-foreground">Rs&nbsp;{priceMonthly}</span>
          {priceMonthly > 0 && (
            <p className="text-sm text-muted-foreground mt-1">One time fee</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 mt-6">
        <ul className="space-y-3 text-base text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="w-full mt-8 py-6 text-lg font-semibold hover:scale-[1.02] transition-transform duration-200">
          <Link href={buttonLink} target="_blank" rel="noopener noreferrer">
            {buttonText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}