"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Rocket,
  Package,
  ShoppingCart,
  Settings,
  ArrowRight,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const features = [
    {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: "Launch in Minutes",
      description: "Get your online store up and running quickly with our intuitive setup process.",
    },
    {
      icon: <Package className="h-8 w-8 text-green-500" />,
      title: "Effortless Product Management",
      description: "Easily add, edit, and organize your products with rich descriptions and images.",
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-purple-500" />,
      title: "Seamless Order Tracking",
      description: "Manage customer orders from pending to delivered with real-time updates.",
    },
    {
      icon: <Settings className="h-8 w-8 text-yellow-500" />,
      title: "Customizable Storefronts",
      description: "Personalize your store's look and feel to match your brand identity.",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Customer-Friendly Experience",
      description: "Provide a smooth and enjoyable shopping experience for your customers.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
      title: "Secure & Reliable",
      description: "Built on a robust and secure platform to protect your data and transactions.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Yaarsite</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-blue-600 to-purple-700 text-center flex items-center justify-center overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
          </svg>
        </div>
        <div className="container max-w-4xl px-4 md:px-6 space-y-8 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
            Launch Your Online Store in <span className="text-yellow-300">Minutes</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Yaarsite makes it incredibly easy for entrepreneurs to build, manage, and grow their e-commerce business with a beautiful, customizable storefront.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button asChild size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-lg font-semibold text-lg px-8 py-6">
              <Link href="/signup">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20 font-semibold text-lg px-8 py-6">
              <Link href="/store">
                Explore Demo Store
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need to Sell Online</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From product listings to order fulfillment, Yaarsite provides a comprehensive suite of tools.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <CardHeader className="pb-4">
                  {feature.icon}
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground text-center">
        <div className="container max-w-3xl px-4 md:px-6 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Build Your Dream Store?</h2>
          <p className="text-lg md:text-xl opacity-90">
            Join hundreds of entrepreneurs who are growing their business with Yaarsite.
          </p>
          <Button asChild size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-lg font-semibold text-lg px-8 py-6">
            <Link href="/signup">
              Start Your Free Store Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-muted-foreground text-sm border-t border-border bg-card">
        <div className="container px-4 md:px-6">
          <p>&copy; {new Date().getFullYear()} Yaarsite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}