"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/session-context-provider';
import { compressImage } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Copy, ExternalLink, Image as ImageIcon, X, Loader2, Home, Info, Phone, Package } from 'lucide-react';
import Image from 'next/image';
import { DashboardHeader } from '@/components/dashboard-header';
import { AppLoader } from '@/components/app-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components

const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_LOGO_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  storeName: z.string().min(3, { message: "Store name must be at least 3 characters." }),
  storeDescription: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  deliveryCharge: z.coerce.number().min(0, { message: "Delivery charge cannot be negative." }).optional().nullable(),
  logo: z.instanceof(File).optional(),
  homePageHeading: z.string().max(100, { message: "Heading cannot exceed 100 characters." }).optional(),
  homePageDescription: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  aboutPageContent: z.string().max(1000, { message: "Content cannot exceed 1000 characters." }).optional(),
  storePageWelcomeMessage: z.string().max(500, { message: "Welcome message cannot exceed 500 characters." }).optional(),
});

export default function StoreCustomizationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      deliveryCharge: 0,
      logo: undefined,
      homePageHeading: "",
      homePageDescription: "",
      aboutPageContent: "",
      storePageWelcomeMessage: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        storeName: profile.tenant_name || "",
        storeDescription: profile.store_description || "",
        deliveryCharge: profile.delivery_charge || 0,
        logo: undefined,
        homePageHeading: profile.home_page_heading || "",
        homePageDescription: profile.home_page_description || "",
        aboutPageContent: profile.about_page_content || "",
        storePageWelcomeMessage: profile.store_page_welcome_message || "",
      });
      setLogoPreview(profile.avatar_url || null);
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
      if (file.size > 500 * 1024) {
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
      toast.error("You must be logged in to update store customization.");
      return;
    }

    setIsUpdatingStore(true);
    let newAvatarUrl = profile?.avatar_url || null;

    try {
      if (selectedLogoFile) {
        if (profile?.avatar_url && profile.avatar_url !== logoPreview) {
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
        const fileName = `${user.id}/${uuidv4()}.${fileExtension}`;
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

      const appBaseUrl = window.location.origin;
      const newStoreUrl = `${appBaseUrl}/store/${profile?.tenant_slug}`;

      const { error } = await supabase
        .from('profiles')
        .update({
          tenant_name: values.storeName,
          store_url: newStoreUrl,
          store_description: values.storeDescription || null,
          avatar_url: newAvatarUrl,
          delivery_charge: values.deliveryCharge,
          home_page_heading: values.homePageHeading || null,
          home_page_description: values.homePageDescription || null,
          about_page_content: values.aboutPageContent || null,
          store_page_welcome_message: values.storePageWelcomeMessage || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating store customization:", error);
        toast.error("Failed to update store customization. Please try again.");
      } else {
        toast.success("Store customization updated successfully!");
        await refreshProfile();
        setSelectedLogoFile(null);
      }
    } catch (err) {
      console.error("Unexpected error during store customization update:", err);
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
      <AppLoader message="Loading customization..." />
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
      <DashboardHeader profile={profile} onSignOut={handleSignOut} currentPath={pathname} />

      <main className="flex-1 p-8 flex justify-center">
        <Card className="w-full max-w-3xl bg-card text-card-foreground shadow-lg"> {/* Increased max-w */}
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Store Customization</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5"> {/* Adjusted grid-cols */}
                <TabsTrigger value="general">
                  <Settings className="h-4 w-4 mr-2" /> General
                </TabsTrigger>
                <TabsTrigger value="home">
                  <Home className="h-4 w-4 mr-2" /> Home
                </TabsTrigger>
                <TabsTrigger value="about">
                  <Info className="h-4 w-4 mr-2" /> About Us
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <Phone className="h-4 w-4 mr-2" /> Contact Us
                </TabsTrigger>
                <TabsTrigger value="store">
                  <Package className="h-4 w-4 mr-2" /> Store
                </TabsTrigger>
              </TabsList>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <TabsContent value="general" className="space-y-6">
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
                    <Label htmlFor="deliveryCharge">Delivery Charge (Rs) *</Label>
                    <Input
                      id="deliveryCharge"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register("deliveryCharge", { valueAsNumber: true })}
                    />
                    {form.formState.errors.deliveryCharge && (
                      <p className="text-destructive text-sm">{form.formState.errors.deliveryCharge.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>Store Logo</Label>
                    <p className="text-xs text-muted-foreground">
                      Upload your store logo. Recommended: Square aspect ratio (e.g., 200x200px), max 2MB.
                      <br />
                      Supported formats: JPG, PNG, WebP. Image will be compressed for faster loading.
                    </p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
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
                </TabsContent>

                <TabsContent value="home" className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="homePageHeading">Home Page Heading</Label>
                    <Input
                      id="homePageHeading"
                      placeholder="Welcome to Our Store!"
                      {...form.register("homePageHeading")}
                    />
                    {form.formState.errors.homePageHeading && (
                      <p className="text-destructive text-sm">{form.formState.errors.homePageHeading.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="homePageDescription">Home Page Description</Label>
                    <Textarea
                      id="homePageDescription"
                      placeholder="Discover a wide range of products hand-picked just for you."
                      {...form.register("homePageDescription")}
                    />
                    {form.formState.errors.homePageDescription && (
                      <p className="text-destructive text-sm">{form.formState.errors.homePageDescription.message}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="about" className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="aboutPageContent">About Us Page Content</Label>
                    <Textarea
                      id="aboutPageContent"
                      placeholder="Tell your customers about your store, its mission, and values."
                      rows={8}
                      {...form.register("aboutPageContent")}
                    />
                    {form.formState.errors.aboutPageContent && (
                      <p className="text-destructive text-sm">{form.formState.errors.aboutPageContent.message}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6">
                  <p className="text-muted-foreground">
                    Your contact email and phone number are managed in your profile.
                    You can update them by editing your profile details.
                  </p>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={profile?.email || "N/A"} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone Number</Label>
                    <Input value={profile?.phone_number || "N/A"} readOnly />
                  </div>
                </TabsContent>

                <TabsContent value="store" className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="storePageWelcomeMessage">Store (Products) Page Welcome Message</Label>
                    <Textarea
                      id="storePageWelcomeMessage"
                      placeholder="A warm welcome message for your products page."
                      {...form.register("storePageWelcomeMessage")}
                    />
                    {form.formState.errors.storePageWelcomeMessage && (
                      <p className="text-destructive text-sm">{form.formState.errors.storePageWelcomeMessage.message}</p>
                    )}
                  </div>
                </TabsContent>

                <Button type="submit" className="w-full mt-6" disabled={isUpdatingStore}>
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
    </div>
  );
}