"use client";

import { useSession } from "@/components/session-context-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, DollarSign, Store, Settings } from "lucide-react";
import { toast } from "sonner";
import { StoreSetupDialog } from "@/components/store-setup-dialog";
import { ScrollHintArrow } from "@/components/scroll-hint-arrow";
import { AppLoader } from "@/components/app-loader";
import { DashboardLayout } from "@/components/dashboard-layout"; // Import DashboardLayout

export default function DashboardPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(true);

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

    } catch (error: any) {
      console.error("Dashboard Page: Error fetching dashboard data:", error);
      toast.error(error.message || "An unexpected error occurred while loading dashboard data.");
    } finally {
      setIsLoadingDashboardData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchDashboardData();
    } else if (!isSessionLoading && !user) {
      setIsLoadingDashboardData(false);
    }
  }, [isSessionLoading, user, fetchDashboardData]);

  if (isSessionLoading || isLoadingDashboardData) {
    return (
      <AppLoader
        message={isSessionLoading ? 'Loading session data...' : 'Loading dashboard data...'}
        secondaryMessage="If it does not load, kindly refresh the browser and sign in."
      />
    );
  }

  const handleOpenStore = () => {
    if (profile?.tenant_slug) {
      window.open(`/store/${profile.tenant_slug}`, '_blank');
    } else {
      toast.info("Please set up your store first!");
    }
  };

  return (
    <DashboardLayout>
      {profile?.tenant_name === null && <StoreSetupDialog />}
      
      <div className="flex justify-center mb-4">
        <ScrollHintArrow />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <Button onClick={handleOpenStore} className="w-full" disabled={profile?.tenant_name === null}>Open Store</Button>
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
            <CardTitle className="text-lg font-semibold">Store Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Customize your store</p>
            <Button onClick={() => router.push('/settings')} className="w-full" disabled={profile?.tenant_name === null}>Customize</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}