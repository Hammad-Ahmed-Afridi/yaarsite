"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, ShoppingCart, Settings, ArrowRight, Package } from 'lucide-react'; // Removed Rocket icon

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header/Navbar for Landing Page */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          {/* Removed Rocket icon */}
          <span className="text-xl font-bold animate-text-gradient">Yaarsite</span>
        </div>
        <nav className="space-x-4">
          <Button asChild variant="ghost">
            <Link href="/login" target="_blank" rel="noopener noreferrer">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup" target="_blank" rel="noopener noreferrer">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 px-4 md:py-32 bg-gradient-to-b from-background to-muted overflow-hidden">
        {/* Animated background elements for visual engagement */}
        <div className="absolute inset-0 z-0 opacity-20 animate-pulse-slow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent animate-pulse-fast"></div>
        </div>

        <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Launch Your Store in <span className="animate-text-gradient">Seconds</span> with <span className="animate-text-gradient">Yaarsite</span>.
        </h1>
        <p className="relative z-10 text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl">
          Yaarsite helps entrepreneurs build beautiful, professional e-commerce websites effortlessly. Focus on your products, we handle the tech.
        </p>
        <div className="relative z-10 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link href="/signup" target="_blank" rel="noopener noreferrer">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
            <Link href="/login" target="_blank" rel="noopener noreferrer">
              Log In
            </Link>
          </Button>
        </div>
        {/* Removed the previous placeholder div */}
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Sell Online</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            From product management to order tracking, <span className="animate-text-gradient">Yaarsite</span> provides a complete solution for your e-commerce business.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Intuitive Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                Manage your products, orders, and store settings with an easy-to-use interface.
              </CardContent>
            </Card>
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Package className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Effortless Product Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                Add, edit, and organize your products with images and detailed descriptions.
              </CardContent>
            </Card>
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Seamless Order Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                Track customer orders from pending to delivered, all in one place.
              </CardContent>
            </Card>
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Settings className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Customizable Storefront</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                Personalize your store's look and feel to match your brand.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Selling with <span className="animate-text-gradient">Yaarsite</span>?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join <span className="animate-text-gradient">Yaarsite</span> today and transform your business idea into a thriving online store.
          </p>
          <Button asChild size="lg" className="px-10 py-7 text-xl">
            <Link href="/signup" target="_blank" rel="noopener noreferrer">
              Sign Up Now <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-muted-foreground text-sm border-t border-border bg-card">
        &copy; {new Date().getFullYear()} <span className="animate-text-gradient">Yaarsite</span>. All rights reserved.
      </footer>
    </div>
  );
}