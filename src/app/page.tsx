"use client";

import { useSession } from "@/components/session-context-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, DollarSign, Store, Settings, Globe, BellRing, LayoutDashboard } from "lucide-react"; // Import LayoutDashboard for Pages
import { toast } from "sonner";
import { StoreSetupDialog } from "@/components/store-setup-dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import { ScrollHintArrow } from "@/components/scroll-hint-arrow";
import { AppLoader } from "@/components/app-loader";
import { ConfettiEffect } from '@/components/confetti-effect';

export default function DashboardPage() {
  const { user, profile, isLoading: isSessionLoading, initiateSignOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingDashboardData(true);
    try {
      if (!user?.id) {
        setIsLoadingDashboardData(false);
        return;
      }

      const SUPABASE_PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "vpfrtytxeimezwxhhtuf";
      const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/get-dashboard-stats`;

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dashboard stats via Edge Function");
      }

      const data = await response.json();
      setTotalProducts(data.totalProducts);
      setTotalOrders(data.totalOrders);
      setTotalProfit(data.totalProfit);
      setNewOrders(data.newOrders);

    } catch (error: any) {
      console.error("Dashboard Page: Error fetching dashboard data:", error);
    } finally {
      setIsLoadingDashboardData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchDashboardData();
      // Set flag when authenticated on dashboard
      if (typeof window !== 'undefined') {
        localStorage.setItem('wasAuthenticatedOnDashboard', 'true');
      }
    } else if (!isSessionLoading && !user) {
      // If session is done loading and there's no user, clear the flag
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wasAuthenticatedOnDashboard');
      }
    }

    return () => {
      // Clear the flag when component unmounts or user navigates away
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wasAuthenticatedOnDashboard');
      }
    };
  }, [isSessionLoading, user, fetchDashboardData]);

  if (isSessionLoading || isLoadingDashboardData) {
    return (
      <AppLoader
        message={isSessionLoading ? 'Loading session data...' : 'Loading dashboard data...'}
        secondaryMessage="If it does not load, kindly refresh the browser and sign in."
      />
    );
  }

  const handleSignOut = async () => {
    console.log("Dashboard Page: Attempting to sign out.");
    try {
      await initiateSignOut();
      console.log("Dashboard Page: Sign out successful. AuthWrapper will handle redirection.");
      toast.success("Signed out successfully!");
    } catch (error) {
      console.error("Dashboard Page: Error during sign out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const handleOpenStore = () => {
    if (profile?.tenant_slug) {
      window.open(`/store/${profile.tenant_slug}`, '_blank');
    } else {
      toast.info("Please set up your store first!");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {profile?.tenant_name === null && <StoreSetupDialog onStoreCreated={() => setShowConfetti(true)} />}
      <ConfettiEffect run={showConfetti} />

      <DashboardHeader profile={profile} onSignOut={handleSignOut} />

      <main className="flex-1 px-4 pt-4 pb-8 md:px-8">
        <div className="flex justify-center mb-4">
          <ScrollHintArrow />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Orders</CardTitle>
              <BellRing className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{newOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">Rs{totalProfit.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <Store className="h-6 w-6 text-primary" />
              <CardTitle className="text-base md:text-xl font-semibold">View Your Store</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">See how your store looks to customers</p>
              <Button onClick={handleOpenStore} className="w-full font-semibold text-sm md:text-base" disabled={profile?.tenant_name === null}>Open Store</Button>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <Package className="h-6 w-6 text-green-500" />
              <CardTitle className="text-base md:text-xl font-semibold">Manage Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Add, edit, and organize your products</p>
              <Button onClick={() => router.push('/products')} className="w-full font-semibold text-sm md:text-base" disabled={profile?.tenant_name === null}>Manage Products</Button>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <ShoppingCart className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-base md:text-xl font-semibold">View Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Track and manage customer orders</p>
              <Button onClick={() => router.push('/orders')} className="w-full font-semibold text-sm md:text-base" disabled={profile?.tenant_name === null}>View Orders</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <LayoutDashboard className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-base md:text-xl font-semibold">Customize Store</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Customize your store's Home, About Us, and Contact Us pages.</p>
              <Button onClick={() => router.push('/pages')} className="w-full font-semibold text-sm md:text-base" disabled={profile?.tenant_name === null}>Customize Store</Button>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <Globe className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-base md:text-xl font-semibold">Free Domain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Claim a custom domain for your store</p>
              <Button onClick={() => router.push('/free-domain')} className="w-full font-semibold text-sm md:text-base" disabled={profile?.tenant_name === null}>Free Domain</Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-muted-foreground text-xs md:text-sm border-t border-border bg-card">
        Yaarsite for Entrepreneurs
      </footer>
    </div>
  );
}