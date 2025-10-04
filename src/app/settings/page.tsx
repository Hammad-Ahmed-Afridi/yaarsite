"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession, ProfileImageKey } from '@/components/session-context-provider';
import { compressImage } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Copy, ExternalLink, Image as ImageIcon, X, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { DashboardHeader } from '@/components/dashboard-header';
import { AppLoader } from '@/components/app-loader';

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  storeName: z.string().min(3, { message: "Store name must be at least 3 characters." }),
  storeDescription: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  deliveryCharge: z.coerce.number().min(0, { message: "Delivery charge cannot be negative." }),
  logo: z.instanceof(File).optional(),
});

const DELIVERY_CHARGE_OPTIONS = [
  { label: "Free Delivery", value: 0 },
  { label: "Rs 100", value: 100 },
  { label: "Rs 200", value: 200 },
  { label: "Rs 300", value: 300 },
];

export default function SettingsPage() {
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
      deliveryCharge: 200,
      logo: undefined,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        storeName: profile.tenant_name || "",
        storeDescription: profile.store_description || "",
        deliveryCharge: profile.delivery_charge !== null ? profile.delivery_charge : 200,
        logo: undefined,
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

  const handleImageChange = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    formFieldName: keyof z.infer<typeof formSchema>,
    bucketName: 'store-logos', // Only 'store-logos' bucket here
    imageType: string
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Invalid file type for ${imageType}. Please upload a JPEG, PNG, or WebP image.`);
        return;
      }
      if (file.size > MAX_IMAGE_FILE_SIZE) {
        toast.error(`File for ${imageType} is too large (max ${MAX_IMAGE_FILE_SIZE / (1024 * 1024)}MB).`);
        return;
      }

      let fileToUpload = file;
      if (file.size > 600 * 1024) { // Compress if larger than 600KB
        toast.info(`Compressing ${imageType} for faster loading...`);
        fileToUpload = await compressImage(file);
        if (fileToUpload.size < file.size) {
          toast.success(`${imageType} compressed successfully!`);
        } else {
          toast.info(`${imageType} size is already optimized.`);
        }
      }

      setSelectedFile(fileToUpload);
      setPreview(URL.createObjectURL(fileToUpload));
      form.setValue(formFieldName, fileToUpload as any);
      form.clearErrors(formFieldName);
    }
  }, [form]);

  const handleRemoveImage = useCallback(async (
    currentImageUrl: string | null,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>,
    bucketName: 'store-logos', // Only 'store-logos' bucket here
    imageType: string,
    dbFieldName: ProfileImageKey
  ) => {
    if (!user) return;

    setIsUpdatingStore(true);
    try {
      if (currentImageUrl) {
        const pathSegment = bucketName === 'store-logos' ? 'store-logos/' : 'store-content-images/';
        const path = currentImageUrl.split(pathSegment)[1];
        if (path) {
          const { error: deleteStorageError } = await supabase.storage
            .from(bucketName) // Use bucketName here
            .remove([path]);

          if (deleteStorageError) {
            console.warn(`Failed to delete old ${imageType} from storage:`, deleteStorageError.message);
          }
        }
      }

      const updateData: { [key: string]: string | null } = { updated_at: new Date().toISOString() };
      updateData[dbFieldName as string] = null;


      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error(`Error removing ${imageType}:`, error);
        toast.error(`Failed to remove ${imageType}. Please try again.`);
      } else {
        toast.success(`${imageType} removed successfully!`);
        setSelectedFile(null);
        setPreview(null);
        await refreshProfile();
      }
    } catch (err) {
      console.error(`Unexpected error during ${imageType} removal:`, err);
      toast.error(`An unexpected error occurred during ${imageType} removal.`);
    } finally {
      setIsUpdatingStore(false);
    }
  }, [user, refreshProfile, profile]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update store settings.");
      return;
    }

    setIsUpdatingStore(true);
    let newAvatarUrl = profile?.avatar_url ?? null;

    try {
      const uploadImageAndGetUrl = async (
        file: File | null,
        currentUrl: string | null,
        bucketName: 'store-logos', // Only 'store-logos' bucket here
        imageType: string
      ): Promise<string | null> => {
        if (!file && !currentUrl) return null;

        if (file) {
          if (currentUrl) {
            const pathSegment = bucketName === 'store-logos' ? 'store-logos/' : 'store-content-images/';
            const oldPath = currentUrl.split(pathSegment)[1];
            if (oldPath) {
              const { error: deleteOldError } = await supabase.storage
                .from(bucketName)
                .remove([oldPath]);
              if (deleteOldError) {
                console.warn(`Failed to delete old ${imageType} from storage:`, deleteOldError.message);
              }
            }
          }

          const fileExtension = file.name.split('.').pop();
          const fileName = `${user.id}/${imageType}-${uuidv4()}.${fileExtension}`;
          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`${imageType} upload failed: ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          } else {
            throw new Error(`Failed to get public URL for uploaded ${imageType}.`);
          }
        }
        return currentUrl;
      };

      newAvatarUrl = await uploadImageAndGetUrl(selectedLogoFile, profile?.avatar_url ?? null, 'store-logos', 'logo');

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
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating store settings:", error);
        toast.error("Failed to update store settings. Please try again.");
      } else {
        toast.success("Store settings updated successfully!");
        await refreshProfile();
        setSelectedLogoFile(null);
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
      <AppLoader message="Loading settings..." />
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Configured</h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">Please set up your store first from the dashboard.</p>
        <Button asChild className="font-semibold">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} /> {/* Removed currentPath */}

      <main className="flex-1 p-8 flex justify-center">
        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/"> {/* Changed href to dashboard root */}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight">General Store Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">Store Details</h3>
                <div className="grid gap-2">
                  <Label htmlFor="storeName" className="text-sm font-medium">Store Name *</Label>
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
                  <Label htmlFor="storeDescription" className="text-sm font-medium">Store Description</Label>
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
                  <Label htmlFor="deliveryCharge" className="text-sm font-medium">Delivery Charge *</Label>
                  <Select
                    onValueChange={(value) => form.setValue("deliveryCharge", parseFloat(value))}
                    value={form.watch("deliveryCharge")?.toString()}
                    disabled={isUpdatingStore}
                  >
                    <SelectTrigger id="deliveryCharge" className="font-medium">
                      <SelectValue placeholder="Select delivery charge" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_CHARGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()} className="font-medium">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.deliveryCharge && (
                    <p className="text-destructive text-sm">{form.formState.errors.deliveryCharge.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Store Logo</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
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
                          onClick={() => handleRemoveImage(profile?.avatar_url ?? null, setLogoPreview, setSelectedLogoFile, 'store-logos', 'logo', 'avatar_url')}
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
                        onChange={(e) => handleImageChange(e, setSelectedLogoFile, setLogoPreview, "logo", 'store-logos', 'logo')}
                        disabled={isUpdatingStore}
                      />
                      <Button asChild variant="outline" className="w-full font-semibold" disabled={isUpdatingStore}>
                        <span>{logoPreview || profile?.avatar_url ? "Change Image" : "Upload Image"}</span>
                      </Button>
                    </Label>
                  </div>
                  {form.formState.errors.logo && (
                    <p className="text-destructive text-sm">{form.formState.errors.logo.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isUpdatingStore}>
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
              <h3 className="text-xl font-semibold tracking-tight">Store Status</h3>
              <div className="flex items-center gap-2 text-base">
                <Badge className="bg-green-500 text-white font-medium">Active</Badge>
                <span className="text-muted-foreground">Store ID: {profile.tenant_slug}</span>
              </div>

              <h3 className="text-xl font-semibold mt-6 tracking-tight">Store URL</h3>
              <div className="flex items-center gap-2">
                <Input
                  value={profile.store_url || "Not available"}
                  readOnly
                  className="flex-1 text-base"
                />
                <Button variant="outline" size="icon" onClick={handleCopyStoreUrl} disabled={!profile.store_url}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleOpenStoreUrl} disabled={!profile.store_url}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">This URL works in any browser and doesn't require login</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}