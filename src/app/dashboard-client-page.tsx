"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/components/session-context-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, DollarSign, Store, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StoreSetupDialog } from "@/components/store-setup-dialog";
import { InactivityWarningBanner } from "@/components/inactivity-warning-banner";
import { DashboardHeader } from "@/components/dashboard-header";
import { Profile } from "@/components/session-context-provider";

interface DashboardClientPageProps {
  profile: Profile | null;
  totalProducts: number;
  totalOrders: number;
  totalProfit: number;
}

export function DashboardClientPage({ profile, totalProducts, totalOrders, totalProfit }: DashboardClientPageProps) {
  const { user, isLoading: isSessionLoading } = useSession(); // Use useSession for client-side user state
  const router = useRouter();
  const pathname = usePathname();

  // The initial data is passed as props, so we don't need to fetch it again here.
  // However, if the user's session changes client-side (e.g., sign out),
  // useSession will update, and we might need to react to that.

  const handleSignOut = async () => {
    console.log("Dashboard Page: Attempting to sign out.");
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Dashboard Page: Error during sign out:", error);
      toast.error("Failed to sign out. Please try again.");
    } else {
      console.log("Dashboard Page: Sign out successful. Explicitly redirecting to /login.");
      toast.success("Signed out successfully!");
      router.push('/login');
    }
  };

  const handleOpenStore = () => {
    if (profile?.tenant_slug) {
      window.open(`/store/${profile.tenant_slug}`, '_blank');
    } else {
      toast.info("Please set up your store first!");
    }
  };

  // If the session is still loading client-side (e.g., after a refresh and initialSession was null),
  // or if the user is not available from the session context, show a loading state.
  if (isSessionLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-foreground">
          Loading session data...
          <br />
          If it is taking time, kindly refresh the browser.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {profile?.tenant_name === null && <StoreSetupDialog />}
      <InactivityWarningBanner />

      <DashboardHeader profile={profile} onSignOut={handleSignOut} showBackButton={false} currentPath={pathname} />

      <main className="flex-1 p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit (Rs)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-md col-span-full md:col-span-1">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <Store className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg font-semibold">View Your Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">See how your store looks to customers</p>
            <Button onClick={handleOpenStore} className="w-full" disabled={profile?.tenant_name === null}>
              Open Store
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-md col-span-full md:col-span-1">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <Package className="h-6 w-6 text-green-500" />
            <CardTitle className="text-lg font-semibold">Manage Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Add, edit, and organize your products</p>
            <Button onClick={() => router.push('/products')} className="w-full" disabled={profile?.tenant_name === null}>Manage Products</Button>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-md col-span-full md:col-span-1">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <ShoppingCart className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-lg font-semibold">View Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
            <Button onClick={() => router.push('/orders')} className="w-full" disabled={profile?.tenant_name === null}>View Orders</Button>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-md col-span-full md:col-span-1">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <Settings className="h-6 w-6 text-yellow-500" />
            <CardTitle className="text-lg font-semibold">Store Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Update your store information</p>
            <Button onClick={() => router.push('/settings')} className="w-full" disabled={profile?.tenant_name === null}>Settings</Button>
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
    </div>
  );
}