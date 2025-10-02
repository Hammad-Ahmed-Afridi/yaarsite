"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Package, ShoppingCart, Settings, Rocket } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center text-center p-4 md:p-8">
      {/* Hero Section */}
      <section className="w-full max-w-4xl py-16 md:py-24 flex flex-col items-center justify-center space-y-8">
        <Rocket className="h-24 w-24 text-primary animate-bounce-down" />
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-center">
          Launch Your Dream Store in Seconds with <span className="text-primary">Yaarsite</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-center">
          Yaarsite helps entrepreneurs and small businesses create professional, beautiful online stores effortlessly. Focus on your products, we handle the rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
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
      <section className="w-full max-w-5xl py-16 md:py-24 space-y-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Why Choose Yaarsite?</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center">
            <Store className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Instant Store Setup</CardTitle>
            <CardContent className="text-muted-foreground p-0">
              Create your online store with a few clicks. No coding required, just pure selling.
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center">
            <Package className="h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Easy Product Management</CardTitle>
            <CardContent className="text-muted-foreground p-0">
              Add, edit, and organize your products with intuitive tools and image uploads.
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center">
            <ShoppingCart className="h-12 w-12 text-purple-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Seamless Order Tracking</CardTitle>
            <CardContent className="text-muted-foreground p-0">
              Manage customer orders from pending to delivered, all in one place.
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center">
            <Settings className="h-12 w-12 text-yellow-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Customizable Storefront</CardTitle>
            <CardContent className="text-muted-foreground p-0">
              Personalize your store's look and feel to match your brand.
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center">
            <Image src="/globe.svg" alt="Global Reach" width={48} height={48} className="mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Reach More Customers</CardTitle>
            <CardContent className="text-muted-foreground p-0">
              Your store is accessible to anyone, anywhere, on any device.
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-lg p-6 flex flex-col items-center text-center">
            <Image src="/file.svg" alt="Simple Workflow" width={48} height={48} className="mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Simple UI/UX Workflow</CardTitle>
            <CardContent className="text-muted-foreground p-0">
              An intuitive interface designed for efficiency, making store management a breeze.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full max-w-4xl py-16 md:py-24 bg-primary text-primary-foreground rounded-lg shadow-xl flex flex-col items-center justify-center space-y-6">
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

      {/* Footer */}
      <footer className="w-full py-8 text-center text-muted-foreground text-sm mt-12 border-t border-border">
        &copy; {new Date().getFullYear()} Yaarsite. All rights reserved.
      </footer>
    </div>
  );
}