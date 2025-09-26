"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/session-context-provider';
import { generateSlug } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Store, Settings, LogOut, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const formSchema = z.object({
  storeName: z.string().min(3, { message: "Store name must be at least 3 characters." }),
  storeDescription: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
});

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        storeName: profile.tenant_name || "",
        storeDescription: profile.store_description || "",
      });
    }
  }, [profile, form]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
      toast.success("Signed out successfully!");
      router.push('/login');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update store settings.");
      return;
    }

    setIsUpdatingStore(true);
    try {
      const newTenantSlug = generateSlug(values.storeName);
      const appBaseUrl = window.location.origin;
      const newStoreUrl = `${appBaseUrl}/store/${newTenantSlug}`;

      const { error } = await supabase
        .from('profiles')
        .update({
          tenant_name: values.storeName,
          tenant_slug: newTenantSlug,
          store_url: newStoreUrl,
          store_description: values.storeDescription || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating store settings:", error);
        toast.error("Failed to update store settings. Please try again.");
      } else {
        toast.success("Store settings updated successfully!");
        await refreshProfile();
      }
    } catch (err) {
      console.error("Unexpected error during store settings update:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const handleCopyStoreUrl = () => {
    if (profile?.store_url) {
      navigator.clipboard.writeText(profile.store_url);
      toast.info("Store URL copied to clipboard!");
    }
  };

  const handleOpenStoreUrl = () => {
    if (profile?.store_url) {
      window.open(profile.store_url, '_blank');
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Store Not Configured</h1>
        <p className="text-lg text-muted-foreground mb-8">Please set up your store first from the dashboard.</p>
        <Button asChild>
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">quick</h1>
            {profile?.tenant_slug && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                ID: {profile.tenant_slug}
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 flex justify-center">
        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Store Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  placeholder="Enter your store name"
                  {...form.register("storeName")}
                />
                {form.formState.errors.storeName && (
                  <p className="text-destructive text-sm">{form.formState.errors.storeName.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  placeholder="A brief description of what your store offers."
                  {...form.register("storeDescription")}
                />
                {form.formState.errors.storeDescription && (
                  <p className="text-destructive text-sm">{form.formState.errors.storeDescription.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isUpdatingStore}>
                {isUpdatingStore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Store...
                  </>
                ) : (
                  "Update Store"
                )}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Store Status</h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">Active</Badge>
                <span className="text-muted-foreground">Store ID: {profile.tenant_slug}</span>
              </div>

              <h3 className="text-lg font-semibold mt-6">Store URL</h3>
              <div className="flex items-center gap-2">
                <Input
                  value={profile.store_url || "Not available"}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={handleCopyStoreUrl} disabled={!profile.store_url}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleOpenStoreUrl} disabled={!profile.store_url}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">This URL works in any browser and doesn't require login</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
    </div>
  );
}