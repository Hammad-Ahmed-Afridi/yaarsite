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
import { generateSlug, compressImage } from '@/lib/utils'; // Import compressImage
import { v4 as uuidv4 } from 'uuid'; // For unique file names

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Store, Settings, LogOut, Copy, ExternalLink, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import Image from 'next/image';

const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_LOGO_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  storeName: z.string().min(3, { message: "Store name must be at least 3 characters." }),
  storeDescription: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  logo: z.instanceof(File).optional(), // New field for logo file
});

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      logo: undefined,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        storeName: profile.tenant_name || "",
        storeDescription: profile.store_description || "",
        logo: undefined, // Reset logo file input
      });
      setLogoPreview(profile.avatar_url || null); // Set initial logo preview from profile
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

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      if (!ACCEPTED_LOGO_IMAGE_TYPES.includes(file.type)) {
        toast.error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
        return;
      }
      if (file.size > MAX_LOGO_FILE_SIZE) {
        toast.error(`File is too large (max ${MAX_LOGO_FILE_SIZE / (1024 * 1024)}MB).`);
        return;
      }

      let fileToUpload = file;
      // Only compress if the file size is significantly larger than a threshold
      if (file.size > 500 * 1024) { // e.g., compress if larger than 500KB
        toast.info("Compressing logo for faster loading...");
        fileToUpload = await compressImage(file);
        if (fileToUpload.size < file.size) {
          toast.success("Logo compressed successfully!");
        } else {
          toast.info("Logo size is already optimized.");
        }
      }

      setSelectedLogoFile(fileToUpload);
      setLogoPreview(URL.createObjectURL(fileToUpload));
      form.setValue("logo", fileToUpload);
      form.clearErrors("logo");
    }
  };

  const handleRemoveLogo = async () => {
    if (!user) return;

    setIsUpdatingStore(true);
    try {
      // Delete image from storage if it exists
      if (profile?.avatar_url) {
        const path = profile.avatar_url.split('store-logos/')[1];
        if (path) {
          const { error: deleteStorageError } = await supabase.storage
            .from('store-logos')
            .remove([path]);

          if (deleteStorageError) {
            console.warn("Failed to delete old logo from storage:", deleteStorageError.message);
          }
        }
      }

      // Update profile to remove avatar_url
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error("Error removing logo:", error);
        toast.error("Failed to remove logo. Please try again.");
      } else {
        toast.success("Logo removed successfully!");
        setSelectedLogoFile(null);
        setLogoPreview(null);
        await refreshProfile();
      }
    } catch (err) {
      console.error("Unexpected error during logo removal:", err);
      toast.error("An unexpected error occurred during logo removal.");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update store settings.");
      return;
    }

    setIsUpdatingStore(true);
    let newAvatarUrl = profile?.avatar_url || null;

    try {
      // 1. Upload new logo if selected
      if (selectedLogoFile) {
        // Delete old logo from storage if it exists and is different from the new one
        if (profile?.avatar_url && profile.avatar_url !== logoPreview) { // Check if old logo exists and is not the same as the new preview
          const oldPath = profile.avatar_url.split('store-logos/')[1];
          if (oldPath) {
            const { error: deleteOldLogoError } = await supabase.storage
              .from('store-logos')
              .remove([oldPath]);
            if (deleteOldLogoError) {
              console.warn("Failed to delete old logo from storage:", deleteOldLogoError.message);
            }
          }
        }

        const fileExtension = selectedLogoFile.name.split('.').pop();
        const fileName = `${user.id}/${uuidv4()}.${fileExtension}`; // Store under user ID folder
        const { data, error: uploadError } = await supabase.storage
          .from('store-logos')
          .upload(fileName, selectedLogoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Logo upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('store-logos')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          newAvatarUrl = publicUrlData.publicUrl;
        } else {
          throw new Error("Failed to get public URL for uploaded logo.");
        }
      }

      // 2. Update profile data in Supabase database
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
          avatar_url: newAvatarUrl, // Update with new logo URL
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating store settings:", error);
        toast.error("Failed to update store settings. Please try again.");
      } else {
        toast.success("Store settings updated successfully!");
        await refreshProfile();
        setSelectedLogoFile(null); // Clear selected file after successful upload
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

              <div className="grid gap-2">
                <Label>Store Logo</Label>
                <p className="text-xs text-muted-foreground">
                  Upload your store logo. Recommended: Square aspect ratio (e.g., 200x200px), max 2MB.
                  <br />
                  Supported formats: JPG, PNG, WebP. Image will be compressed for faster loading.
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {(logoPreview || profile?.avatar_url) ? (
                    <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                      <Image
                        src={logoPreview || profile!.avatar_url!}
                        alt="Store Logo Preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={handleRemoveLogo}
                        disabled={isUpdatingStore}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-md bg-muted">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <Label htmlFor="logo-upload" className="flex-1">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleLogoChange}
                      disabled={isUpdatingStore}
                    />
                    <Button asChild variant="outline" className="w-full" disabled={isUpdatingStore}>
                      <span>{logoPreview || profile?.avatar_url ? "Change Logo" : "Upload Logo"}</span>
                    </Button>
                  </Label>
                </div>
                {form.formState.errors.logo && (
                  <p className="text-destructive text-sm">{form.formState.errors.logo.message}</p>
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