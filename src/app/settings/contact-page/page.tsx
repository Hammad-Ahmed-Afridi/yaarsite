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
import { Mail, Image as ImageIcon, X, Loader2, ArrowLeft, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';
import { DashboardHeader } from '@/components/dashboard-header';
import { AppLoader } from '@/components/app-loader';

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  contactPageHeading: z.string().max(100, { message: "Contact page heading cannot exceed 100 characters." }).optional(),
  contactPageDescription: z.string().max(500, { message: "Contact page description cannot exceed 500 characters." }).optional(),
  contactPageHeroImage: z.instanceof(File).optional(),
  storeContactEmail: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  storeContactPhoneNumber: z.string()
    .regex(/^03\d{9}$/, { message: "Phone number must start with 03 and be 11 digits long." })
    .optional()
    .or(z.literal('')),
  storeAddressLine: z.string().max(200, { message: "Address line cannot exceed 200 characters." }).optional().or(z.literal('')),
  storeCity: z.string().max(100, { message: "City cannot exceed 100 characters." }).optional().or(z.literal('')),
  storeProvince: z.string().max(100, { message: "Province cannot exceed 100 characters." }).optional().or(z.literal('')),
});

export default function ContactPageSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  const [selectedContactPageHeroImageFile, setSelectedContactPageHeroImageFile] = useState<File | null>(null);
  const [contactPageHeroImagePreview, setContactPageHeroImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactPageHeading: "",
      contactPageDescription: "",
      contactPageHeroImage: undefined,
      storeContactEmail: "", // Initialize as empty string
      storeContactPhoneNumber: "", // Initialize as empty string
      storeAddressLine: "",
      storeCity: "",
      storeProvince: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        contactPageHeading: profile.contact_page_heading || "",
        contactPageDescription: profile.contact_page_description || "",
        contactPageHeroImage: undefined,
        // Use the new store-specific contact fields
        storeContactEmail: profile.store_contact_email || "", 
        storeContactPhoneNumber: profile.store_contact_phone || "", 
        storeAddressLine: profile.store_address_line || "",
        storeCity: profile.store_city || "",
        storeProvince: profile.store_province || "",
      });
      setContactPageHeroImagePreview(profile.contact_page_hero_image_url || null);
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
    bucketName: 'store-logos' | 'store-content-images',
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
    bucketName: 'store-logos' | 'store-content-images',
    imageType: string,
    dbFieldName: ProfileImageKey
  ) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      if (currentImageUrl) {
        const path = currentImageUrl.split('store-content-images/')[1];
        if (path) {
          const { error: deleteStorageError } = await supabase.storage
            .from(bucketName)
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
      setIsUpdating(false);
    }
  }, [user, refreshProfile, profile]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update store settings.");
      return;
    }

    setIsUpdating(true);
    let newContactPageHeroImageUrl = profile?.contact_page_hero_image_url ?? null;

    try {
      const uploadImageAndGetUrl = async (
        file: File | null,
        currentUrl: string | null,
        imageType: string
      ): Promise<string | null> => {
        if (!file && !currentUrl) return null;

        if (file) {
          if (currentUrl) {
            const oldPath = currentUrl.split('store-content-images/')[1];
            if (oldPath) {
              const { error: deleteOldError } = await supabase.storage
                .from('store-content-images')
                .remove([oldPath]);
              if (deleteOldError) {
                console.warn(`Failed to delete old ${imageType} from storage:`, deleteOldError.message);
              }
            }
          }

          const fileExtension = file.name.split('.').pop();
          const fileName = `${user.id}/${imageType}-${uuidv4()}.${fileExtension}`;
          const { error: uploadError } = await supabase.storage
            .from('store-content-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`${imageType} upload failed: ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage
            .from('store-content-images')
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          } else {
            throw new Error(`Failed to get public URL for uploaded ${imageType}.`);
          }
        }
        return currentUrl;
      };

      newContactPageHeroImageUrl = await uploadImageAndGetUrl(selectedContactPageHeroImageFile, profile?.contact_page_hero_image_url ?? null, 'contact-page-hero-image');

      const { error } = await supabase
        .from('profiles')
        .update({
          contact_page_heading: values.contactPageHeading || null,
          contact_page_description: values.contactPageDescription || null,
          contact_page_hero_image_url: newContactPageHeroImageUrl,
          store_contact_email: values.storeContactEmail || null, // Use the new field name
          store_contact_phone: values.storeContactPhoneNumber || null, // Use the new field name
          store_address_line: values.storeAddressLine || null,
          store_city: values.storeCity || null,
          store_province: values.storeProvince || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating contact page settings:", error);
        toast.error("Failed to update contact page settings. Please try again.");
      } else {
        toast.success("Contact Us page settings updated successfully!");
        await refreshProfile();
        setSelectedContactPageHeroImageFile(null);
      }
    } catch (err) {
      console.error("Unexpected error during contact page settings update:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isSessionLoading) {
    return <AppLoader message="Loading contact page settings..." />;
  }

  if (!profile || profile.tenant_name === null) {
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

      <main className="flex-1 p-4 sm:p-8 flex justify-center"> {/* Adjusted padding */}
        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/"> {/* Changed href to dashboard root */}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Mail className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight">Contact Us Page Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Contact Page Hero Image</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This image will appear prominently at the top of your Contact Us page. Recommended: Wide aspect ratio (e.g., 16:9 or 2:1), max 5MB.
                </p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {(contactPageHeroImagePreview || profile?.contact_page_hero_image_url) ? (
                    <div className="relative w-48 h-24 border rounded-md overflow-hidden">
                      <Image
                        src={contactPageHeroImagePreview || profile!.contact_page_hero_image_url!}
                        alt="Contact Page Hero Image Preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage(profile?.contact_page_hero_image_url ?? null, setContactPageHeroImagePreview, setSelectedContactPageHeroImageFile, 'store-content-images', 'contact page hero image', 'contact_page_hero_image_url')}
                        disabled={isUpdating}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-48 h-24 border-2 border-dashed rounded-md bg-muted">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <Label htmlFor="contact-page-hero-image-upload" className="flex-1">
                    <Input
                      id="contact-page-hero-image-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, setSelectedContactPageHeroImageFile, setContactPageHeroImagePreview, "contactPageHeroImage", 'store-content-images', 'contact page hero image')}
                      disabled={isUpdating}
                    />
                    <Button asChild variant="outline" className="w-full font-semibold" disabled={isUpdating}>
                      <span>{contactPageHeroImagePreview || profile?.contact_page_hero_image_url ? "Change Image" : "Upload Image"}</span>
                    </Button>
                  </Label>
                </div>
                {form.formState.errors.contactPageHeroImage && (
                  <p className="text-destructive text-sm">{form.formState.errors.contactPageHeroImage.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPageHeading" className="text-sm font-medium">Contact Page Heading</Label>
                <Input
                  id="contactPageHeading"
                  placeholder="Get in Touch with Us!"
                  {...form.register("contactPageHeading")}
                />
                {form.formState.errors.contactPageHeading && (
                  <p className="text-destructive text-sm">{form.formState.errors.contactPageHeading.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPageDescription" className="text-sm font-medium">Contact Page Description</Label>
                <Textarea
                  id="contactPageDescription"
                  placeholder="We'd love to hear from you. Reach out with any questions or feedback."
                  rows={3}
                  {...form.register("contactPageDescription")}
                />
                {form.formState.errors.contactPageDescription && (
                  <p className="text-destructive text-sm">{form.formState.errors.contactPageDescription.message}</p>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">Contact Information</h3>
                <div className="grid gap-2">
                  <Label htmlFor="storeContactEmail" className="text-sm font-medium">Store Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeContactEmail"
                      type="email"
                      placeholder="your.store@example.com"
                      className="pl-10"
                      {...form.register("storeContactEmail")}
                    />
                  </div>
                  {form.formState.errors.storeContactEmail && (
                    <p className="text-destructive text-sm">{form.formState.errors.storeContactEmail.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="storeContactPhoneNumber" className="text-sm font-medium">Store Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeContactPhoneNumber"
                      type="tel"
                      placeholder="03001234567"
                      className="pl-10"
                      {...form.register("storeContactPhoneNumber")}
                    />
                  </div>
                  {form.formState.errors.storeContactPhoneNumber && (
                    <p className="text-destructive text-sm">{form.formState.errors.storeContactPhoneNumber.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="storeAddressLine" className="text-sm font-medium">Store Address Line</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeAddressLine"
                      type="text"
                      placeholder="House #123, Street 4"
                      className="pl-10"
                      {...form.register("storeAddressLine")}
                    />
                  </div>
                  {form.formState.errors.storeAddressLine && (
                    <p className="text-destructive text-sm">{form.formState.errors.storeAddressLine.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Adjusted for mobile responsiveness */}
                  <div className="grid gap-2">
                    <Label htmlFor="storeCity" className="text-sm font-medium">Store City</Label>
                    <Input
                      id="storeCity"
                      type="text"
                      placeholder="Lahore"
                      {...form.register("storeCity")}
                    />
                    {form.formState.errors.storeCity && (
                      <p className="text-destructive text-sm">{form.formState.errors.storeCity.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="storeProvince" className="text-sm font-medium">Store Province</Label>
                    <Input
                      id="storeProvince"
                      type="text"
                      placeholder="Punjab"
                      {...form.register("storeProvince")}
                    />
                    {form.formState.errors.storeProvince && (
                      <p className="text-destructive text-sm">{form.formState.errors.storeProvince.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Contact Us Page...
                  </>
                ) : (
                  "Update Contact Us Page"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}