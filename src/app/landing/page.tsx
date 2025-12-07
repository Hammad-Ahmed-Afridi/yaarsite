"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, ShoppingCart, Settings, Package, Monitor, BarChart } from 'lucide-react';
import { PricingCard } from '@/components/pricing-card';

export default function LandingPage() {
  const animatedYaarsite = (
    <span className="inline-block text-primary font-bold animate-continuous-pulse">Yaarsite</span>
  );

  const freePlanFeatures = [
    { text: "Dashboard Access", included: true },
    { text: "Product Management (Up to 2 products)", included: true },
    { text: "Order Management", included: true },
    { text: "Free Yaarsite Subdomain", included: true },
    { text: "Real Time Analytics", included: true },
    { text: "Cash on Delivery Payment", included: true },
    { text: "Store Customization (Home, About, Contact Pages)", included: true },
    { text: "Custom Store Logo & Description", included: true },
    { text: "Custom Delivery Charges", included: true },
    { text: "JazzCash & EasyPaisa Payments", included: true },
    { text: "Product Discount Feature", included: true },
    { text: "Product Size Charts & Colors", included: true },
    { text: "Free Link shorteners", included: true },
    { text: "Rank Top on Google", included: false }, // Added for Free plan
    { text: "Unlimited Products", included: false },
    { text: "Priority Support", included: false },
    { text: "SEO", included: false },
    { text: "Free Domain", included: false }, // Updated
    { text: "Custom platform", included: false }, // Updated text and moved position
    { text: "Custom domain integration", included: false }, // Moved to last
  ];

  const pricingPlans = [
    {
      planName: "Free",
      description: "Perfect for getting started with your online store.",
      priceMonthly: 0,
      features: freePlanFeatures,
      buttonText: "Start for Free",
      buttonLink: "/signup",
      isMostPopular: false,
    },
    {
      planName: "Pro",
      description: "Unlock full potential with unlimited products and priority support.",
      priceMonthly: 4999, 
      originalPrice: 9999, // Added original price for discount
      priceYearly: 4999, 
      features: [
        { text: "Dashboard Access", included: true },
        { text: "Product Management", included: true },
        { text: "Order Management", included: true },
        { text: "Free Yaarsite Subdomain", included: true },
        { text: "Real Time Analytics", included: true },
        { text: "Cash on Delivery Payment", included: true },
        { text: "Store Customization (Home, About, Contact Pages)", included: true },
        { text: "Custom Store Logo & Description", included: true },
        { text: "Custom Delivery Charges", included: true },
        { text: "JazzCash & EasyPaisa Payments", included: true },
        { text: "Product Discount Feature", included: true },
        { text: "Product Size Charts & Colors", included: true },
        { text: "Free Link shorteners", included: true },
        { text: "Rank Top on Google", included: true }, // Added for Pro plan
        { text: "Unlimited Products", included: true },
        { text: "Priority Support for One Week", included: true },
        { text: "SEO", included: true },
        { text: "Free Domain", included: true }, // Updated
        { text: "Limited Customization", included: true }, // Added for Pro plan
        { text: "Custom platform", included: false }, // Updated text and moved position
        { text: "Custom domain integration", included: false }, // Moved to last
      ],
      buttonText: "Go Pro",
      buttonLink: "/signup",
      isMostPopular: true,
    },
    {
      planName: "Business",
      description: "Advanced features for growing businesses and maximum control.",
      priceMonthly: 49999, 
      originalPrice: 59999, // Added original price for discount
      priceYearly: 70000,
      features: [
        { text: "Dashboard Access", included: true },
        { text: "Product Management", included: true },
        { text: "Order Management", included: true },
        { text: "Free Yaarsite Subdomain", included: true },
        { text: "Real Time Analytics", included: true },
        { text: "Cash on Delivery Payment", included: true },
        { text: "Store Customization (Home, About, Contact Pages)", included: true },
        { text: "Custom Store Logo & Description", included: true },
        { text: "Custom Delivery Charges", included: true },
        { text: "JazzCash & EasyPaisa Payments", included: true },
        { text: "Product Discount Feature", included: true },
        { text: "Product Size Charts & Colors", included: true },
        { text: "Free Link shorteners", included: true },
        { text: "Rank Top on Google", included: true }, // Added for Business plan
        { text: "Unlimited Products", included: true },
        { text: "Priority Support for One Year", included: true },
        { text: "SEO", included: true },
        { text: "Free Domain", included: true }, // Updated
        { text: "Custom platform", included: true }, // Updated text and moved position
        { text: "Custom domain integration", included: true }, // Moved to last
      ],
      buttonText: "Get Business",
      buttonLink: "/signup",
      isMostPopular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header/Navbar for Landing Page */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">
            {animatedYaarsite}
          </span>
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
      <section className="relative bg-gradient-to-b from-background to-muted overflow-hidden rounded-b-4xl shadow-lg py-20 md:py-32">
        {/* Animated background elements for visual engagement */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse-slow backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent animate-pulse-fast backdrop-blur-sm"></div>
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-1"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-2"></div>
        </div>
        <div className="container mx-auto flex flex-col items-center justify-center text-center px-4">
          <h1 className="relative z-10 text-3xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
            Launch Your Ecommerce<br />
            Store in <span className="text-primary">Seconds</span> with<br />
            {animatedYaarsite}
          </h1>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="px-8 py-6 text-lg font-semibold hover:scale-[1.02] transition-transform duration-200">
              <Link href="/signup" target="_blank" rel="noopener noreferrer">
                <span>
                  Get Started Free
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold hover:scale-[1.02] transition-transform duration-200">
              <Link href="/login" target="_blank" rel="noopener noreferrer">
                Log In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything You Need to Sell Online</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            From product management to order tracking, {animatedYaarsite} provides a complete solution for your e-commerce business.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group p-6 text-left shadow-lg hover:shadow-2xl transition-all duration-300 rounded-4xl border-2 border-border/50 hover:scale-[1.05] hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Intuitive Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground text-base leading-relaxed">
                Manage your products, orders, and store settings with an easy-to-use interface.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-2xl transition-all duration-300 rounded-4xl border-2 border-border/50 hover:scale-[1.05] hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Package className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Effortless Product Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground text-base leading-relaxed">
                Add, edit, and organize your products with images and detailed descriptions.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-2xl transition-all duration-300 rounded-4xl border-2 border-border/50 hover:scale-[1.05] hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Seamless Order Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground text-base leading-relaxed">
                Track customer orders from pending to delivered, all in one place.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-2xl transition-all duration-300 rounded-4xl border-2 border-border/50 hover:scale-[1.05] hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Settings className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Customizable Storefront</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground text-base leading-relaxed">
                Personalize your store's look and feel to match your brand.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-2xl transition-all duration-300 rounded-4xl border-2 border-border/50 hover:scale-[1.05] hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Monitor className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Fully Responsive Design</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground text-base leading-relaxed">
                Your store looks stunning and works perfectly on any device, from desktops to mobile phones.
              </CardContent>
            </Card>
            <Card className="group p-6 text-left shadow-lg hover:shadow-2xl transition-all duration-300 rounded-4xl border-2 border-border/50 hover:scale-[1.05] hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <BarChart className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground text-base leading-relaxed">
                Track your sales with intuitive, real-time data.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Choose Your Plan</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Select the perfect plan to power your online store. Upgrade anytime!
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.planName} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-muted to-background rounded-4xl shadow-lg py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ready to Start Selling with {animatedYaarsite}</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join {animatedYaarsite} today and transform your business idea into a thriving online store.
          </p>
          <div className="flex flex-col items-center gap-4"> {/* Added a flex container for buttons */}
            <Button asChild size="lg" className="px-10 py-7 text-xl font-semibold hover:scale-[1.02] transition-transform duration-200">
              <Link href="/signup" target="_blank" rel="noopener noreferrer">
                <span>
                  Sign Up Now
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-10 py-7 text-xl font-semibold hover:scale-[1.02] transition-transform duration-200">
              <Link href="/connect-with-us" target="_blank" rel="noopener noreferrer">
                <span>
                  Connect With Us
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-muted-foreground text-sm border-t border-border bg-card rounded-t-4xl shadow-lg">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} {animatedYaarsite}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}