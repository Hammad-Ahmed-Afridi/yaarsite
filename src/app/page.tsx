"use client";

import { useSession } from "@/components/session-context-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, DollarSign, Store, Settings, Globe, BellRing, LayoutDashboard, Download, Copy, ExternalLink } from "lucide-react"; // Added Copy and ExternalLink icons
import { toast } from "sonner";
import { StoreSetupDialog } from "@/components/store-setup-dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import { ScrollHintArrow } from "@/components/scroll-hint-arrow";
import { AppLoader } from "@/components/app-loader";
import { ConfettiEffect } from '@/components/confetti-effect';
import Link from "next/link"; // Ensure Link is imported
import { Input } from "@/components/ui/input"; // Import Input component

export default function DashboardPage() {
  const { user, profile, isLoading: isSessionLoading, initiateSignOut, session } = useSession();
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
      if (!user?.id || !session?.access_token) {
        console.log("Dashboard Page: User ID or access token not available, cannot fetch dashboard data.");
        toast.error("Authentication required to refresh dashboard data.");
        setIsLoadingDashboardData(false);
        return;
      }

      console.log("Dashboard Page: Fetching dashboard data for user:", user.id);
      const accessToken = session.access_token;

      console.log("Dashboard Page: Using access token (first 10 chars):", accessToken.substring(0, 10) + "...");

      const SUPABASE_PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "vpfrtytxeimezwxhhtuf";
      const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/get-dashboard-stats`;

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Dashboard Page: Edge Function response not OK.", {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
        });
        throw new Error(errorData.message || `Failed to fetch dashboard stats (Status: ${response.status})`);
      }

      const data = await response.json();
      setTotalProducts(data.totalProducts);
      setTotalOrders(data.totalOrders);
      setTotalProfit(data.totalProfit);
      setNewOrders(data.newOrders);
      toast.success("Dashboard data refreshed!");

    } catch (error: any) {
      console.error("Dashboard Page: Error fetching dashboard data:", error);
      toast.error("Failed to refresh dashboard data.");
    } finally {
      setIsLoadingDashboardData(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (!isSessionLoading && user && session) {
      fetchDashboardData();
      if (typeof window !== 'undefined') {
        localStorage.setItem('wasAuthenticatedOnDashboard', 'true');
      }
    } else if (!isSessionLoading && !user) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wasAuthenticatedOnDashboard');
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wasAuthenticatedOnDashboard');
      }
    };
  }, [isSessionLoading, user, session, fetchDashboardData]);

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

  const handleCopyUrl = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.info(message);
  };

  const displayStoreUrl = profile?.store_url || "Store URL not available";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {profile?.tenant_name === null && <StoreSetupDialog onStoreCreated={() => setShowConfetti(true)} />}
      <ConfettiEffect run={showConfetti} duration={8000} />

      <DashboardHeader profile={profile} onSignOut={handleSignOut} />

      <main className="flex-1 p-4 sm:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Dashboard</h2>
        </div>
        <div className="flex justify-center mb-4">
          <ScrollHintArrow />
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">New Orders</CardTitle>
              <BellRing className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs{totalProfit.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* New Card for Store URL */}
        <Card className="bg-card text-card-foreground shadow-md rounded-3xl mt-6">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <Globe className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-xl font-semibold">Your Store URL</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                value={displayStoreUrl}
                readOnly
                className="flex-1 text-base"
              />
              <Button variant="outline" size="icon" onClick={() => handleCopyUrl(displayStoreUrl, "Store URL copied to clipboard!")} disabled={!profile?.store_url}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleOpenStore} disabled={!profile?.store_url}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">This is the direct link to your online store.</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6"> {/* Adjusted grid for mobile */}
          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <Store className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">View Your Store</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground leading-relaxed">See how your store looks to customers</p>
              <Button onClick={handleOpenStore} className="w-full font-semibold" disabled={profile?.tenant_name === null}>Open Store</Button>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <Package className="h-6 w-6 text-green-500" />
              <CardTitle className="text-xl font-semibold">Manage Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground leading-relaxed">Add, edit, and organize your products</p>
              <Button onClick={() => router.push('/products')} className="w-full font-semibold" disabled={profile?.tenant_name === null}>Manage Products</Button>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <ShoppingCart className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-xl font-semibold">View Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground leading-relaxed">Track and manage customer orders</p>
              <Button onClick={() => router.push('/orders')} className="w-full font-semibold" disabled={profile?.tenant_name === null}>View Orders</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <LayoutDashboard className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-xl font-semibold">Customize Store</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground leading-relaxed">Customize your store's Home, About, and Contact pages.</p>
              <Button onClick={() => router.push('/pages')} className="w-full font-semibold" disabled={profile?.tenant_name === null}>Customize Store</Button>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <Globe className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl font-semibold">Free Domain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground leading-relaxed">Claim a custom domain for your store</p>
              <Button onClick={() => router.push('/free-domain')} className="w-full font-semibold" disabled={profile?.tenant_name === null}>Free Domain</Button>
            </CardContent>
          </Card>

          {/* New Card for Download App */}
          <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <Download className="h-6 w-6 text-orange-500" /> {/* Using orange for download icon */}
              <CardTitle className="text-xl font-semibold">Download App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground leading-relaxed">Get the app on your device for quick access</p>
              <Button asChild className="w-full font-semibold">
                <Link href="/download-app">Download App</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-muted-foreground text-sm border-t border-border bg-card">
        Yaarsite for Entrepreneurs
      </footer>
    </div>
  );
}