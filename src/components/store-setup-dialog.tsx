"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/session-context-provider';
import { generateRandomAlphanumeric } from '@/lib/utils'; // Import the new utility function

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Store } from 'lucide-react';
import { AppLoader } from '@/components/app-loader'; // Import AppLoader

const formSchema = z.object({
  storeName: z.string().min(3, { message: "Store name must be at least 3 characters." }),
  storeDescription: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
});

export function StoreSetupDialog() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useSession();
  const [isBuildingStore, setIsBuildingStore] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
    },
  });

  useEffect(() => {
    // Open the dialog if user is logged in and profile indicates store is not set up
    if (user && profile && profile.tenant_name === null) {
      setIsDialogOpen(true);
    } else {
      setIsDialogOpen(false);
    }
  }, [user, profile]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to create a store.");
      return;
    }

    setIsBuildingStore(true);
    toast.info("Yaarsite AI is building your store. Wait for the magic to happen...", { duration: 9000 }); // Increased duration

    try {
      // 1. Check if a store with the same name already exists
      const { data: existingStore, error: checkNameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_name', values.storeName)
        .single();

      if (checkNameError && checkNameError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        throw new Error(`Error checking for existing store name: ${checkNameError.message}`);
      }

      if (existingStore) {
        toast.error("A store with this name already exists. Please choose a different name.");
        setIsBuildingStore(false);
        return;
      }

      // 2. Generate a unique 6-character alphanumeric tenant_slug
      let uniqueTenantSlug = '';
      let isSlugUnique = false;
      while (!isSlugUnique) {
        const potentialSlug = generateRandomAlphanumeric(6);
        const { count, error: slugCheckError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_slug', potentialSlug);

        if (slugCheckError) {
          throw new Error(`Error checking slug uniqueness: ${slugCheckError.message}`);
        }

        if (count === 0) {
          uniqueTenantSlug = potentialSlug;
          isSlugUnique = true;
        }
      }

      const appBaseUrl = window.location.origin; // Dynamically get base URL
      const storeUrl = `${appBaseUrl}/store/${uniqueTenantSlug}`;

      // 3. Update the user's profile with store information
      const { error } = await supabase
        .from('profiles')
        .update({
          tenant_name: values.storeName,
          tenant_slug: uniqueTenantSlug, // Use the generated unique slug
          store_url: storeUrl,
          store_description: values.storeDescription || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating profile with store info:", error);
        toast.error("Failed to create store. Please try again.");
        setIsBuildingStore(false);
        return;
      }

      // Simulate build time
      await new Promise(resolve => setTimeout(resolve, 9000)); // Increased duration

      toast.success("Your store was created successfully!");
      
      // Refresh profile data in context
      if (refreshProfile) {
        await refreshProfile();
      }

      setIsBuildingStore(false);
      setIsDialogOpen(false); // Close the dialog
      router.push('/'); // Redirect to dashboard (already there, but ensures state consistency)

    } catch (err: any) {
      console.error("Unexpected error during store creation:", err);
      toast.error(err.message || "An unexpected error occurred during store creation.");
      setIsBuildingStore(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="w-full max-w-md p-6"> {/* Adjusted DialogContent styling */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Set Up Your Store
          </DialogTitle>
          <DialogDescription>
            Welcome! Let's get your store ready. You can change these details later.
          </DialogDescription>
        </DialogHeader>
        {isBuildingStore ? (
          <AppLoader 
            message="Yaarsite AI is building your store. Wait for the magic to happen..." 
            size="lg" // Increased size for prominence
            isFullScreen={false} // Not full screen when in dialog
            className="py-12" // Added vertical padding
          />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                placeholder="My Awesome Store"
                {...form.register("storeName")}
              />
              {form.formState.errors.storeName && (
                <p className="text-destructive text-sm">{form.formState.errors.storeName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeDescription">Store Description (Optional)</Label>
              <Textarea
                id="storeDescription"
                placeholder="A brief description of what your store offers."
                {...form.register("storeDescription")}
              />
              {form.formState.errors.storeDescription && (
                <p className="text-destructive text-sm">{form.formState.errors.storeDescription.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isBuildingStore}>
              Create Store
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}