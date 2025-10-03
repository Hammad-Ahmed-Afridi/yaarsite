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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Copy, ExternalLink, Image as ImageIcon, X, Loader2, Mail, Phone, MapPin } from 'lucide-react';
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
  homePageHeading: z.string().max(100, { message: "Home page heading cannot exceed 100 characters." }).optional(),
  homePageDescription: z.string().max(500, { message: "Home page description cannot exceed 500 characters." }).optional(),
  homePageHeroImage: z.instanceof(File).optional(), // New field for home page hero image
  homePageContentImage: z.instanceof(File).optional(), // New field for home page content image
  homePageContentText: z.string().max(1000, { message: "Home page content text cannot exceed 1000 characters." }).optional(), // New field for home page content text
  aboutPageContent: z.string().max(1000, { message: "About page content cannot exceed 1000 characters." }).optional(),
  aboutPageHeroImage: z.instanceof(File).optional(), // New field for about page hero image
  storePageWelcomeMessage: z.string().max(500, { message: "Store page welcome message cannot exceed 500 characters." }).optional(),
  contactPageHeading: z.string().max(100, { message: "Contact page heading cannot exceed 100 characters." }).optional(),
  contactPageDescription: z.string().max(500, { message: "Contact page description cannot exceed 500 characters." }).optional(),
  contactPageHeroImage: z.instanceof(File).optional(), // New field for contact page hero image
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  phoneNumber: z.string()
    .regex(/^03\d{9}$/, { message: "Phone number must start with 03 and be 11 digits long." })
    .optional()
    .or(z.literal('')),
  storeAddressLine: z.string().max(200, { message: "Address line cannot exceed 200 characters." }).optional().or(z.literal('')),
  storeCity: z.string().max(100, { message: "City cannot exceed 100 characters." }).optional().or(z.literal('')),
  storeProvince: z.string().max(100, { message: "Province cannot exceed 100 characters." }).optional().or(z.literal('')),
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

  // State for logo
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // State for Home Page images
  const [selectedHomePageHeroImageFile, setSelectedHomePageHeroImageFile] = useState<File | null>(null);
  const [homePageHeroImagePreview, setHomePageHeroImagePreview] = useState<string | null>(null);
  const [selectedHomePageContentImageFile, setSelectedHomePageContentImageFile] = useState<File | null>(null);
  const [homePageContentImagePreview, setHomePageContentImagePreview] = useState<string | null>(null);

  // State for About Page image
  const [selectedAboutPageHeroImageFile, setSelectedAboutPageHeroImageFile] = useState<File | null>(null);
  const [aboutPageHeroImagePreview, setAboutPageHeroImagePreview] = useState<string | null>(null);

  // State for Contact Page image
  const [selectedContactPageHeroImageFile, setSelectedContactPageHeroImageFile] = useState<File | null>(null);
  const [contactPageHeroImagePreview, setContactPageHeroImagePreview] = useState<string | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      deliveryCharge: 200,
      logo: undefined,
      homePageHeading: "",
      homePageDescription: "",
      homePageContentText: "", // New default
      homePageHeroImage: undefined, // New default
      homePageContentImage: undefined, // New default
      aboutPageContent: "",
      aboutPageHeroImage: undefined, // New default
      storePageWelcomeMessage: "",
      contactPageHeading: "",
      contactPageDescription: "",
      contactPageHeroImage: undefined, // New default
      email: "",
      phoneNumber: "",
      storeAddressLine: "",
      storeCity: "",
      storeProvince: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        storeName: profile.tenant_name || "",
        storeDescription: profile.store_description || "",
        deliveryCharge: profile.delivery_charge !== null ? profile.delivery_charge : 200,
        logo: undefined,
        homePageHeading: profile.home_page_heading || "",
        homePageDescription: profile.home_page_description || "",
        homePageContentText: profile.home_page_content_text || "", // Set value for new field
        homePageHeroImage: undefined,
        homePageContentImage: undefined,
        aboutPageContent: profile.about_page_content || "",
        aboutPageHeroImage: undefined,
        storePageWelcomeMessage: profile.store_page_welcome_message || "",
        contactPageHeading: profile.contact_page_heading || "",
        contactPageDescription: profile.contact_page_description || "",
        contactPageHeroImage: undefined,
        email: profile.email || "",
        phoneNumber: profile.phone_number || "",
        storeAddressLine: profile.store_address_line || "",
        storeCity: profile.store_city || "",
        storeProvince: profile.store_province || "",
      });
      setLogoPreview(profile.avatar_url || null);
      setHomePageHeroImagePreview(profile.home_page_hero_image_url || null);
      setHomePageContentImagePreview(profile.home_page_content_image_url || null);
      setAboutPageHeroImagePreview(profile.about_page_hero_image_url || null);
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
      if (file.size > 500 * 1024) {
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
      form.setValue(formFieldName, fileToUpload as any); // Cast to any because File is not directly assignable to string | undefined
      form.clearErrors(formFieldName);
    }
  }, [form]);

  const handleRemoveImage = useCallback(async (
    currentImageUrl: string | null,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>,
    bucketName: 'store-logos' | 'store-content-images',
    imageType: string
  ) => {
    if (!user) return;

    setIsUpdatingStore(true);
    try {
      if (currentImageUrl) {
        const pathSegment = bucketName === 'store-logos' ? 'store-logos/' : 'store-content-images/';
        const path = currentImageUrl.split(pathSegment)[1];
        if (path) {
          const { error: deleteStorageError } = await supabase.storage
            .from(bucketName)
            .remove([path]);

          if (deleteStorageError) {
            console.warn(`Failed to delete old ${imageType} from storage:`, deleteStorageError.message);
          }
        }
      }

      // Update the profile in DB to remove the URL
      const updateData: { [key: string]: string | null } = { updated_at: new Date().toISOString() };
      if (imageType === 'logo') updateData.avatar_url = null;
      if (imageType === 'home page hero image') updateData.home_page_hero_image_url = null;
      if (imageType === 'home page content image') updateData.home_page_content_image_url = null;
      if (imageType === 'about page hero image') updateData.about_page_hero_image_url = null;
      if (imageType === 'contact page hero image') updateData.contact_page_hero_image_url = null;


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
  }, [user, refreshProfile]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update store settings.");
      return;
    }

    setIsUpdatingStore(true);
    let newAvatarUrl = profile?.avatar_url || null;
    let newHomePageHeroImageUrl = profile?.home_page_hero_image_url || null;
    let newHomePageContentImageUrl = profile?.home_page_content_image_url || null;
    let newAboutPageHeroImageUrl = profile?.about_page_hero_image_url || null;
    let newContactPageHeroImageUrl = profile?.contact_page_hero_image_url || null;


    try {
      // Helper function to upload and get URL, and delete old image
      const uploadImageAndGetUrl = async (
        file: File | null,
        currentUrl: string | null,
        bucketName: 'store-logos' | 'store-content-images',
        imageType: string
      ): Promise<string | null> => {
        if (!file && !currentUrl) return null; // No file, no current URL, nothing to do

        // If a new file is selected
        if (file) {
          // Delete old image if it exists and is different from the new one
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
        // If no new file, but there was a current URL, keep it (unless it was explicitly removed via handleRemoveImage)
        return currentUrl;
      };

      // Process logo
      newAvatarUrl = await uploadImageAndGetUrl(selectedLogoFile, profile?.avatar_url, 'store-logos', 'logo');

      // Process Home Page images
      newHomePageHeroImageUrl = await uploadImageAndGetUrl(selectedHomePageHeroImageFile, profile?.home_page_hero_image_url, 'store-content-images', 'home-page-hero-image');
      newHomePageContentImageUrl = await uploadImageAndGetUrl(selectedHomePageContentImageFile, profile?.home_page_content_image_url, 'store-content-images', 'home-page-content-image');

      // Process About Page image
      newAboutPageHeroImageUrl = await uploadImageAndGetUrl(selectedAboutPageHeroImageFile, profile?.about_page_hero_image_url, 'store-content-images', 'about-page-hero-image');

      // Process Contact Page image
      newContactPageHeroImageUrl = await uploadImageAndGetUrl(selectedContactPageHeroImageFile, profile?.contact_page_hero_image_url, 'store-content-images', 'contact-page-hero-image');


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
          home_page_hero_image_url: newHomePageHeroImageUrl, // New field
          home_page_content_image_url: newHomePageContentImageUrl, // New field
          home_page_content_text: values.homePageContentText || null, // New field
          about_page_content: values.aboutPageContent || null,
          about_page_hero_image_url: newAboutPageHeroImageUrl, // New field
          store_page_welcome_message: values.storePageWelcomeMessage || null,
          contact_page_heading: values.contactPageHeading || null,
          contact_page_description: values.contactPageDescription || null,
          contact_page_hero_image_url: newContactPageHeroImageUrl, // New field
          email: values.email || null,
          phone_number: values.phoneNumber || null,
          store_address_line: values.storeAddressLine || null,
          store_city: values.storeCity || null,
          store_province: values.storeProvince || null,
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
        setSelectedHomePageHeroImageFile(null);
        setSelectedHomePageContentImageFile(null);
        setSelectedAboutPageHeroImageFile(null);
        setSelectedContactPageHeroImageFile(null);
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
      <DashboardHeader profile={profile} onSignOut={handleSignOut} currentPath={pathname} />

      <main className="flex-1 p-8 flex justify-center">
        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight">Customize Store</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> {/* Increased space-y */}
              {/* General Store Settings */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">General Store Settings</h3>
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
                          onClick={() => handleRemoveImage(profile?.avatar_url, setLogoPreview, setSelectedLogoFile, 'store-logos', 'logo')}
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
                        <span>{logoPreview || profile?.avatar_url ? "Change Logo" : "Upload Logo"}</span>
                      </Button>
                    </Label>
                  </div>
                  {form.formState.errors.logo && (
                    <p className="text-destructive text-sm">{form.formState.errors.logo.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">Contact Information</h3>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">Store Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.store@example.com"
                      className="pl-10"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">Store Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="03001234567"
                      className="pl-10"
                      {...form.register("phoneNumber")}
                    />
                  </div>
                  {form.formState.errors.phoneNumber && (
                    <p className="text-destructive text-sm">{form.formState.errors.phoneNumber.message}</p>
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

                <div className="grid grid-cols-2 gap-4">
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

              {/* Home Page Content */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">Home Page Content</h3>
                <div className="grid gap-2">
                  <Label htmlFor="homePageHeading" className="text-sm font-medium">Home Page Heading</Label>
                  <Input
                    id="homePageHeading"
                    placeholder="Welcome to our store!"
                    {...form.register("homePageHeading")}
                  />
                  {form.formState.errors.homePageHeading && (
                    <p className="text-destructive text-sm">{form.formState.errors.homePageHeading.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="homePageDescription" className="text-sm font-medium">Home Page Description</Label>
                  <Textarea
                    id="homePageDescription"
                    placeholder="Discover a wide range of products hand-picked just for you."
                    rows={3}
                    {...form.register("homePageDescription")}
                  />
                  {form.formState.errors.homePageDescription && (
                    <p className="text-destructive text-sm">{form.formState.errors.homePageDescription.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Home Page Hero Image</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This image will appear prominently at the top of your home page. Recommended: Wide aspect ratio (e.g., 16:9 or 2:1), max 5MB.
                  </p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {(homePageHeroImagePreview || profile?.home_page_hero_image_url) ? (
                      <div className="relative w-48 h-24 border rounded-md overflow-hidden">
                        <Image
                          src={homePageHeroImagePreview || profile!.home_page_hero_image_url!}
                          alt="Home Page Hero Image Preview"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => handleRemoveImage(profile?.home_page_hero_image_url, setHomePageHeroImagePreview, setSelectedHomePageHeroImageFile, 'store-content-images', 'home page hero image')}
                          disabled={isUpdatingStore}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-48 h-24 border-2 border-dashed rounded-md bg-muted">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <Label htmlFor="home-page-hero-image-upload" className="flex-1">
                      <Input
                        id="home-page-hero-image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, setSelectedHomePageHeroImageFile, setHomePageHeroImagePreview, "homePageHeroImage", 'store-content-images', 'home page hero image')}
                        disabled={isUpdatingStore}
                      />
                      <Button asChild variant="outline" className="w-full font-semibold" disabled={isUpdatingStore}>
                        <span>{homePageHeroImagePreview || profile?.home_page_hero_image_url ? "Change Image" : "Upload Image"}</span>
                      </Button>
                    </Label>
                  </div>
                  {form.formState.errors.homePageHeroImage && (
                    <p className="text-destructive text-sm">{form.formState.errors.homePageHeroImage.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Home Page Content Image</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This image will appear alongside a text section on your home page. Recommended: Square aspect ratio, max 5MB.
                  </p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {(homePageContentImagePreview || profile?.home_page_content_image_url) ? (
                      <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                        <Image
                          src={homePageContentImagePreview || profile!.home_page_content_image_url!}
                          alt="Home Page Content Image Preview"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => handleRemoveImage(profile?.home_page_content_image_url, setHomePageContentImagePreview, setSelectedHomePageContentImageFile, 'store-content-images', 'home page content image')}
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
                    <Label htmlFor="home-page-content-image-upload" className="flex-1">
                      <Input
                        id="home-page-content-image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, setSelectedHomePageContentImageFile, setHomePageContentImagePreview, "homePageContentImage", 'store-content-images', 'home page content image')}
                        disabled={isUpdatingStore}
                      />
                      <Button asChild variant="outline" className="w-full font-semibold" disabled={isUpdatingStore}>
                        <span>{homePageContentImagePreview || profile?.home_page_content_image_url ? "Change Image" : "Upload Image"}</span>
                      </Button>
                    </Label>
                  </div>
                  {form.formState.errors.homePageContentImage && (
                    <p className="text-destructive text-sm">{form.formState.errors.homePageContentImage.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="homePageContentText" className="text-sm font-medium">Home Page Content Text</Label>
                  <Textarea
                    id="homePageContentText"
                    placeholder="Add some engaging text to describe your store or products."
                    rows={5}
                    {...form.register("homePageContentText")}
                  />
                  {form.formState.errors.homePageContentText && (
                    <p className="text-destructive text-sm">{form.formState.errors.homePageContentText.message}</p>
                  )}
                </div>
              </div>

              {/* About Us Page Content */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">About Us Page Content</h3>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">About Us Page Hero Image</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This image will appear prominently at the top of your About Us page. Recommended: Wide aspect ratio (e.g., 16:9 or 2:1), max 5MB.
                  </p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {(aboutPageHeroImagePreview || profile?.about_page_hero_image_url) ? (
                      <div className="relative w-48 h-24 border rounded-md overflow-hidden">
                        <Image
                          src={aboutPageHeroImagePreview || profile!.about_page_hero_image_url!}
                          alt="About Page Hero Image Preview"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => handleRemoveImage(profile?.about_page_hero_image_url, setAboutPageHeroImagePreview, setSelectedAboutPageHeroImageFile, 'store-content-images', 'about page hero image')}
                          disabled={isUpdatingStore}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-48 h-24 border-2 border-dashed rounded-md bg-muted">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <Label htmlFor="about-page-hero-image-upload" className="flex-1">
                      <Input
                        id="about-page-hero-image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, setSelectedAboutPageHeroImageFile, setAboutPageHeroImagePreview, "aboutPageHeroImage", 'store-content-images', 'about page hero image')}
                        disabled={isUpdatingStore}
                      />
                      <Button asChild variant="outline" className="w-full font-semibold" disabled={isUpdatingStore}>
                        <span>{aboutPageHeroImagePreview || profile?.about_page_hero_image_url ? "Change Image" : "Upload Image"}</span>
                      </Button>
                    </Label>
                  </div>
                  {form.formState.errors.aboutPageHeroImage && (
                    <p className="text-destructive text-sm">{form.formState.errors.aboutPageHeroImage.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aboutPageContent" className="text-sm font-medium">About Us Content</Label>
                  <Textarea
                    id="aboutPageContent"
                    placeholder="We are dedicated to providing you with the best products and an exceptional shopping experience."
                    rows={5}
                    {...form.register("aboutPageContent")}
                  />
                  {form.formState.errors.aboutPageContent && (
                    <p className="text-destructive text-sm">{form.formState.errors.aboutPageContent.message}</p>
                  )}
                </div>
              </div>

              {/* Store Page Welcome Message */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">Store Page Welcome Message</h3>
                <div className="grid gap-2">
                  <Label htmlFor="storePageWelcomeMessage" className="text-sm font-medium">Welcome Message (above products)</Label>
                  <Textarea
                    id="storePageWelcomeMessage"
                    placeholder="Browse our latest collection and find something you'll love!"
                    rows={3}
                    {...form.register("storePageWelcomeMessage")}
                  />
                  {form.formState.errors.storePageWelcomeMessage && (
                    <p className="text-destructive text-sm">{form.formState.errors.storePageWelcomeMessage.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Us Page Content */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">Contact Us Page Content</h3>
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
                          onClick={() => handleRemoveImage(profile?.contact_page_hero_image_url, setContactPageHeroImagePreview, setSelectedContactPageHeroImageFile, 'store-content-images', 'contact page hero image')}
                          disabled={isUpdatingStore}
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
                        disabled={isUpdatingStore}
                      />
                      <Button asChild variant="outline" className="w-full font-semibold" disabled={isUpdatingStore}>
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