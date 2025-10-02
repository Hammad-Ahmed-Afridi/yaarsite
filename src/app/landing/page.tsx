"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, ShoppingCart, Settings, ArrowRight, Package, Monitor, BarChart } from 'lucide-react';

export default function LandingPage() {
  const animatedYaarsite = (
    <span className="inline-block text-primary font-bold">Yaarsite</span>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header/Navbar for Landing Page */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">
            {animatedYaarsite}
          </span>
        </div>
        <nav className="space-x-4">
          <Button asChild variant="ghost">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 px-4 md:py-32 bg-gradient-to-b from-background to-muted overflow-hidden rounded-b-3xl shadow-lg mx-4 mt-4">
        {/* Animated background elements for visual engagement */}
        <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent animate-pulse-fast"></div>
            <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-1"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-2"></div>
        </div>

        <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Launch Your Store in <span className="text-primary">Seconds</span> with {animatedYaarsite}.
        </h1>
        <p className="relative z-10 text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl">
          {animatedYaarsite} helps entrepreneurs build beautiful, professional e-commerce stores effortlessly. Focus on your products, we handle the tech.
        </p>
        <div className="relative z-10 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link href="/signup">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
            <Link href="/login">
              Log In
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Sell Online</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            From product management to order tracking, {animatedYaarsite} provides a complete solution for your e-commerce business.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl border-2 border-border/50 hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Intuitive Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Manage your products, orders, and store settings with an easy-to-use interface.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl border-2 border-border/50 hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Package className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Effortless Product Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Add, edit, and organize your products with images and detailed descriptions.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl border-2 border-border/50 hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Seamless Order Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Track customer orders from pending to delivered, all in one place.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl border-2 border-border/50 hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Settings className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Customizable Storefront</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Personalize your store's look and feel to match your brand.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl border-2 border-border/50 hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Monitor className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Fully Responsive Design</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Your store looks stunning and works perfectly on any device, from desktops to mobile phones.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl border-2 border-border/50 hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <BarChart className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Track your sales, monitor customer engagement, and understand your store's performance with intuitive, real-time data.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-muted to-background rounded-3xl shadow-lg mx-4 mb-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Selling with {animatedYaarsite}?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join {animatedYaarsite} today and transform your business idea into a thriving online store.
          </p>
          <Button asChild size="lg" className="px-10 py-7 text-xl">
            <Link href="/signup">
              Sign Up Now <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-muted-foreground text-sm border-t border-border bg-card rounded-t-3xl shadow-lg mx-4 mb-4">
        &copy; {new Date().getFullYear()} {animatedYaarsite}. All rights reserved.
      </footer>
    </div>
  );
}