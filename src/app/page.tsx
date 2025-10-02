"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Package, ShoppingCart, Settings } from 'lucide-react';
import Image from 'next/image';
import { LandingPageHeader } from '@/components/landing-page-header';
import { LandingPageFooter } from '@/components/landing-page-footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center text-center">
      <LandingPageHeader />
      <main className="flex-1 w-full flex flex-col items-center text-center">
        {/* Hero Section */}
        <section className="w-full max-w-4xl py-20 md:py-32 flex flex-col items-center justify-center space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-b-[4rem] shadow-xl p-4 md:p-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-center animate-fade-in [animation-delay:0.2s]">
            Launch Your Dream Store in Seconds with <span className="text-primary animate-hero-rocket-bounce inline-block">Yaarsite</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-center animate-fade-in [animation-delay:0.4s]">
            Yaarsite helps entrepreneurs and small businesses create professional, beautiful online stores effortlessly. Focus on your products, we handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:0.6s]">
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link href="/signup" target="_blank" rel="noopener noreferrer">
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
              <Link href="/login" target="_blank" rel="noopener noreferrer">
                Log In
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-5xl py-16 md:py-24 space-y-12 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center animate-fade-in [animation-delay:0.8s]">Why Choose Yaarsite?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary rounded-xl animate-fade-in [animation-delay:1.0s]">
              <Store className="h-12 w-12 text-primary mb-4 transition-colors duration-300 group-hover:text-primary-foreground" />
              <CardTitle className="text-xl font-semibold mb-2">Instant Store Setup</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Create your online store with a few clicks. No coding required, just pure selling.
              </CardContent>
            </Card>

            <Card className="group bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary rounded-xl animate-fade-in [animation-delay:1.1s]">
              <Package className="h-12 w-12 text-green-500 mb-4 transition-colors duration-300 group-hover:text-green-600" />
              <CardTitle className="text-xl font-semibold mb-2">Easy Product Management</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Add, edit, and organize your products with intuitive tools and image uploads.
              </CardContent>
            </Card>

            <Card className="group bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary rounded-xl animate-fade-in [animation-delay:1.2s]">
              <ShoppingCart className="h-12 w-12 text-purple-500 mb-4 transition-colors duration-300 group-hover:text-purple-600" />
              <CardTitle className="text-xl font-semibold mb-2">Seamless Order Tracking</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Manage customer orders from pending to delivered, all in one place.
              </CardContent>
            </Card>

            <Card className="group bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary rounded-xl animate-fade-in [animation-delay:1.3s]">
              <Settings className="h-12 w-12 text-yellow-500 mb-4 transition-colors duration-300 group-hover:text-yellow-600" />
              <CardTitle className="text-xl font-semibold mb-2">Customizable Storefront</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Personalize your store's look and feel to match your brand.
              </CardContent>
            </Card>

            <Card className="group bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary rounded-xl animate-fade-in [animation-delay:1.4s]">
              <Image src="/globe.svg" alt="Global Reach" width={48} height={48} className="mb-4" />
              <CardTitle className="text-xl font-semibold mb-2">Reach More Customers</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Your store is accessible to anyone, anywhere, on any device.
              </CardContent>
            </Card>

            <Card className="group bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary rounded-xl animate-fade-in [animation-delay:1.5s]">
              <Image src="/file.svg" alt="Simple Workflow" width={48} height={48} className="mb-4" />
              <CardTitle className="text-xl font-semibold mb-2">Simple UI/UX Workflow</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                An intuitive interface designed for efficiency, making store management a breeze.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full max-w-4xl py-16 md:py-24 bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-800 text-primary-foreground rounded-lg shadow-xl flex flex-col items-center justify-center space-y-6 px-4 animate-fade-in [animation-delay:1.7s]">
          <h2 className="text-3xl md:text-5xl font-bold text-center">Ready to Start Selling?</h2>
          <p className="text-lg md:text-xl text-center max-w-2xl">
            Join thousands of successful entrepreneurs building their online presence with Yaarsite.
          </p>
          <Button asChild size="lg" variant="secondary" className="px-10 py-7 text-xl font-semibold">
            <Link href="/signup" target="_blank" rel="noopener noreferrer">
              Create Your Free Store Now
            </Link>
          </Button>
        </section>
      </main>
      <LandingPageFooter />
    </div>
  );
}