"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/components/session-context-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, DollarSign, Store, Settings, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { StoreSetupDialog } from "@/components/store-setup-dialog"; // Import the new component

export default function DashboardPage() {
  const { user, profile, isLoading } = useSession();
  const router = useRouter();

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
      // Fallback if tenant_slug is not available (should be handled by dialog now)
      toast.info("Please set up your store first!");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Render the StoreSetupDialog if the store is not configured */}
      {profile?.tenant_name === null && <StoreSetupDialog />}

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">quick</h1>
          {profile?.tenant_slug && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              ID: {profile.tenant_slug}
            </Badge>
          )}
        </div>
        <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          Sign Out
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Summary Cards */}
        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> {/* Placeholder for actual data */}
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> {/* Placeholder for actual data */}
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit (Rs)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs0</div> {/* Placeholder for actual data */}
          </CardContent>
        </Card>

        {/* Action Cards */}
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