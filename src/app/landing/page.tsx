"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, ShoppingCart, Settings, ArrowRight, Package, Monitor, BarChart, Zap, Rocket } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header/Navbar for Landing Page */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary animate-pop-in-out">Yaarsite</span>
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
      <section className="relative flex flex-col items-center justify-center text-center pt-16 pb-24 px-4 md:pt-20 md:pb-32 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden"> {/* Adjusted padding and gradient */}
        {/* Subtle background animation */}
        <div className="absolute inset-0 z-0 opacity-10 animate-pulse-slow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent"></div>
        </div>

        <Card className="relative z-10 w-full max-w-5xl mx-auto p-8 md:p-12 bg-card rounded-3xl shadow-2xl border border-border/50"> {/* Rounded-3xl */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight text-foreground">
            Launch Your Dream Store in <span className="text-primary">Minutes</span> with <span className="text-primary animate-pop-in-out">Yaarsite</span>.
          </h1>
          <p className="relative z-10 text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Empowering entrepreneurs to build beautiful, professional e-commerce websites effortlessly. Focus on your passion, we handle the platform.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8 py-6 text-lg shadow-md hover:shadow-lg transition-all hover:scale-105"> {/* Added hover:scale-105 */}
              <Link href="/signup">
                Start Selling Free <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg shadow-md hover:shadow-lg transition-all hover:scale-105"> {/* Added hover:scale-105 */}
              <Link href="/store">
                Explore Stores
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Unlock Your E-commerce Potential</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            <span className="text-primary animate-pop-in-out">Yaarsite</span> provides a comprehensive suite of tools designed to help you succeed online.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl hover:-translate-y-2"> {/* Rounded-3xl */}
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Intuitive Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Effortlessly manage your products, orders, and store settings from a single, user-friendly interface.
              </CardContent>
            </Card>
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl hover:-translate-y-2"> {/* Rounded-3xl */}
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Package className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Streamlined Product Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Add, edit, and organize your product listings with high-quality images and compelling descriptions.
              </CardContent>
            </Card>
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl hover:-translate-y-2"> {/* Rounded-3xl */}
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Efficient Order Tracking</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Monitor customer orders from placement to delivery, ensuring a smooth fulfillment process.
              </CardContent>
            </Card>
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl hover:-translate-y-2"> {/* Rounded-3xl */}
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Settings className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Flexible Store Customization</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Personalize your storefront's appearance, content, and branding to reflect your unique vision.
              </CardContent>
            </Card>
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl hover:-translate-y-2"> {/* Rounded-3xl */}
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Monitor className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Mobile-First Responsiveness</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Your store will look and perform flawlessly on any device, providing an optimal shopping experience.
              </CardContent>
            </Card>
            <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl hover:-translate-y-2"> {/* Rounded-3xl */}
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <BarChart className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Actionable Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground">
                Gain valuable insights into sales trends, customer behavior, and store performance to drive growth.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto text-center">
          <Card className="w-full max-w-4xl mx-auto p-8 md:p-12 bg-card rounded-3xl shadow-2xl border border-border/50"> {/* Rounded-3xl */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Ready to Build Your Online Empire with <span className="animate-pop-in-out">Yaarsite</span>?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join the growing community of successful entrepreneurs. Sign up today and start your journey!
            </p>
            <Button asChild size="lg" className="px-10 py-7 text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"> {/* Added hover:scale-105 */}
              <Link href="/signup">
                Sign Up Now <Zap className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-muted-foreground text-sm border-t border-border bg-card">
        &copy; {new Date().getFullYear()} <span className="text-primary animate-pop-in-out">Yaarsite</span>. All rights reserved.
      </footer>
    </div>
  );
}