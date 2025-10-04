"use client";

import React from 'react';
import Link from 'next/link'; // Added Link import
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Added Badge import

interface PricingCardProps {
  planName: string;
  priceMonthly: number;
  priceYearly?: number;
  features: string[];
  isMostPopular?: boolean;
  buttonText: string;
  buttonLink: string;
  description: string;
}

export function PricingCard({
  planName,
  priceMonthly,
  priceYearly,
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
          <span className="text-5xl font-extrabold text-foreground">Rs{priceMonthly}</span>
          <span className="text-lg text-muted-foreground">/month</span>
          {priceYearly && (
            <p className="text-sm text-muted-foreground mt-1">or Rs{priceYearly} / year</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 mt-6">
        <ul className="space-y-3 text-base text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="w-full mt-8 py-6 text-lg font-semibold hover:scale-[1.02] transition-transform duration-200">
          <Link href={buttonLink}>
            {buttonText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}