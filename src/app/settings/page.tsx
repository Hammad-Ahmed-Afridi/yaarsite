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
import { compressImage, hexToHsl, hslToHex, getContrastingTextColor } from '@/lib/utils'; // Import getContrastingTextColor
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Copy, ExternalLink, Image as ImageIcon, X, Loader2, ArrowLeft, Phone, Palette, Paintbrush } from 'lucide-react'; // Import Palette and Paintbrush icons
import Image from 'next/image';
import { DashboardHeader } from '@/components/dashboard-header';
import { AppLoader } from '@/components/app-loader';

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Define the structure for a color palette
interface ColorPalette {
  id: string;
  name: string;
  primary: string; // HEX
  background: string; // HEX
  cardBackground: string; // HEX
  foreground: string; // HEX (text color on background)
  cardForeground: string; // HEX (text color on cardBackground)
}

// Pre-built premium, minimalistic color palettes (HEX values)
const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'yaarsite-default',
    name: 'Yaarsite Default',
    primary: '#29A399', // Teal
    background: '#FFFFFF', // White
    cardBackground: '#FFFFFF', // White
    foreground: '#222222', // Dark grey for white background
    cardForeground: '#222222', // Dark grey for white card background
  },
  {
    id: 'modern-grey',
    name: 'Modern Grey',
    primary: '#60A5FA', // Sky Blue
    background: '#F8FAFC', // Slate 50
    cardBackground: '#FFFFFF', // White
    foreground: '#222222',
    cardForeground: '#222222',
  },
  {
    id: 'soft-earth',
    name: 'Soft Earth',
    primary: '#84CC16', // Lime Green
    background: '#FFFBEB', // Amber 50
    cardBackground: '#FFFFFF', // White
    foreground: '#222222',
    cardForeground: '#222222',
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    primary: '#3B82F6', // Blue
    background: '#E0F2F7', // Cyan 50
    cardBackground: '#FFFFFF', // White
    foreground: '#222222',
    cardForeground: '#222222',
  },
  {
    id: 'midnight-plum',
    name: 'Midnight Plum',
    primary: '#A78BFA', // Lavender
    background: '#1E1B4B', // Dark Indigo
    cardBackground: '#2A245C', // Slightly lighter Indigo
    foreground: '#FFFFFF', // White for dark background
    cardForeground: '#FFFFFF', // White for dark card background
  },
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    primary: '#34D399', // Emerald Green
    background: '#F0FDF4', // Green 50
    cardBackground: '#FFFFFF', // White
    foreground: '#222222',
    cardForeground: '#222222',
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    primary: '#F97316', // Orange 500
    background: '#FFF7ED', // Orange 50
    cardBackground: '#FFFFFF',
    foreground: '#222222',
    cardForeground: '#222222',
  },
  {
    id: 'cool-breeze',
    name: 'Cool Breeze',
    primary: '#06B6D4', // Cyan 500
    background: '#F0F9FF', // Sky 50
    cardBackground: '#FFFFFF',
    foreground: '#222222',
    cardForeground: '#222222',
  },
  {
    id: 'elegant-rose',
    name: 'Elegant Rose',
    primary: '#EC4899', // Pink 500
    background: '#FDF2F8', // Pink 50
    cardBackground: '#FFFFFF',
    foreground: '#222222',
    cardForeground: '#222222',
  },
  {
    id: 'dark-charcoal',
    name: 'Dark Charcoal',
    primary: '#A8A29E', // Stone 400
    background: '#1F2937', // Gray 800
    cardBackground: '#374151', // Gray 700
    foreground: '#FFFFFF',
    cardForeground: '#FFFFFF',
  },
];

const formSchema = z.object({
  storeName: z.string().min(3, { message: "Store name must be at least 3 characters." }),
  storeDescription: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  deliveryCharge: z.coerce.number().min(0, { message: "Delivery charge cannot be negative." }),
  jazzcashPhoneNumber: z.string()
    .regex(/^03\d{9}$/, { message: "Phone number must start with 03 and be 11 digits long." })
    .optional()
    .or(z.literal('')),
  easypaisaPhoneNumber: z.string()
    .regex(/^03\d{9}$/, { message: "Phone number must start with 03 and be 11 digits long." })
    .optional()
    .or(z.literal('')),
  logo: z.instanceof(File).optional(),
  storePrimaryAccentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Invalid HEX color format." }).optional().or(z.literal('')),
  storeBackgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Invalid HEX color format." }).optional().or(z.literal('')),
  storeCardHeaderFooterBackgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Invalid HEX color format." }).optional().or(z.literal('')),
  storeForegroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Invalid HEX color format." }).optional().or(z.literal('')), // New field
  storeCardForegroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Invalid HEX color format." }).optional().or(z.literal('')), // New field
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

  // State for live preview colors (HEX format)
  const [livePrimaryColor, setLivePrimaryColor] = useState<string | null>(null);
  const [liveBackgroundColor, setLiveBackgroundColor] = useState<string | null>(null);
  const [liveCardBackgroundColor, setLiveCardBackgroundColor] = useState<string | null>(null);
  const [liveForegroundColor, setLiveForegroundColor] = useState<string | null>(null); // New state
  const [liveCardForegroundColor, setLiveCardForegroundColor] = useState<string | null>(null); // New state

  // State for selected palette ID, 'custom' indicates manual input
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      deliveryCharge: 200,
      jazzcashPhoneNumber: "",
      easypaisaPhoneNumber: "",
      logo: undefined,
      storePrimaryAccentColor: "",
      storeBackgroundColor: "",
      storeCardHeaderFooterBackgroundColor: "",
      storeForegroundColor: "", // Default
      storeCardForegroundColor: "", // Default
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        storeName: profile.tenant_name || "",
        storeDescription: profile.store_description || "",
        deliveryCharge: profile.delivery_charge !== null ? profile.delivery_charge : 200,
        jazzcashPhoneNumber: profile.jazzcash_phone_number || "",
        easypaisaPhoneNumber: profile.easypaisa_phone_number || "",
        logo: undefined,
        storePrimaryAccentColor: "",
        storeBackgroundColor: "",
        storeCardHeaderFooterBackgroundColor: "",
        storeForegroundColor: "",
        storeCardForegroundColor: "",
      });
      setLogoPreview(profile.avatar_url || null);

      // Convert HSL from profile to HEX for comparison and live preview
      const currentPrimaryHex = profile.store_primary_color_hsl ? hslToHex(profile.store_primary_color_hsl) : null;
      const currentBackgroundHex = profile.store_background_color_hsl ? hslToHex(profile.store_background_color_hsl) : null;
      const currentCardBackgroundHex = profile.store_card_background_color_hsl ? hslToHex(profile.store_card_background_color_hsl) : null;
      const currentForegroundHex = profile.store_foreground_color_hsl ? hslToHex(profile.store_foreground_color_hsl) : null; // New
      const currentCardForegroundHex = profile.store_card_foreground_color_hsl ? hslToHex(profile.store_card_foreground_color_hsl) : null; // New

      // Try to find a matching preset palette
      let matchedPalette = PRESET_PALETTES.find(p =>
        p.primary === currentPrimaryHex &&
        p.background === currentBackgroundHex &&
        p.cardBackground === currentCardBackgroundHex &&
        p.foreground === currentForegroundHex && // Include new foreground colors
        p.cardForeground === currentCardForegroundHex // Include new card foreground colors
      );

      if (matchedPalette) {
        setSelectedPaletteId(matchedPalette.id);
        form.setValue("storePrimaryAccentColor", matchedPalette.primary);
        form.setValue("storeBackgroundColor", matchedPalette.background);
        form.setValue("storeCardHeaderFooterBackgroundColor", matchedPalette.cardBackground);
        form.setValue("storeForegroundColor", matchedPalette.foreground); // Set new form values
        form.setValue("storeCardForegroundColor", matchedPalette.cardForeground); // Set new form values
      } else {
        setSelectedPaletteId('custom'); // Indicate custom colors
        form.setValue("storePrimaryAccentColor", currentPrimaryHex || "");
        form.setValue("storeBackgroundColor", currentBackgroundHex || "");
        form.setValue("storeCardHeaderFooterBackgroundColor", currentCardBackgroundHex || "");
        form.setValue("storeForegroundColor", currentForegroundHex || ""); // Set new form values
        form.setValue("storeCardForegroundColor", currentCardForegroundHex || ""); // Set new form values
      }

      // Initialize live preview colors with profile values (whether preset or custom)
      setLivePrimaryColor(currentPrimaryHex);
      setLiveBackgroundColor(currentBackgroundHex);
      setLiveCardBackgroundColor(currentCardBackgroundHex);
      setLiveForegroundColor(currentForegroundHex); // Initialize new live states
      setLiveCardForegroundColor(currentCardForegroundHex); // Initialize new live states
    }
  }, [profile, form]);

  // Effect to apply live theme colors to the document root
  useEffect(() => {
    const root = document.documentElement;

    const applyLiveStyles = () => {
      if (livePrimaryColor) {
        const hsl = hexToHsl(livePrimaryColor);
        if (hsl) root.style.setProperty('--store-primary', hsl);
      } else {
        root.style.removeProperty('--store-primary'); // Revert to default
      }
      if (liveBackgroundColor) {
        const hsl = hexToHsl(liveBackgroundColor);
        if (hsl) root.style.setProperty('--store-background', hsl);
      } else {
        root.style.removeProperty('--store-background'); // Revert to default
      }
      if (liveCardBackgroundColor) {
        const hsl = hexToHsl(liveCardBackgroundColor);
        if (hsl) root.style.setProperty('--store-card-background', hsl);
      } else {
        root.style.removeProperty('--store-card-background'); // Revert to default
      }
      if (liveForegroundColor) { // New: Apply foreground color
        const hsl = hexToHsl(liveForegroundColor);
        if (hsl) root.style.setProperty('--store-foreground', hsl);
      } else {
        root.style.removeProperty('--store-foreground');
      }
      if (liveCardForegroundColor) { // New: Apply card foreground color
        const hsl = hexToHsl(liveCardForegroundColor);
        if (hsl) root.style.setProperty('--store-card-foreground', hsl);
      } else {
        root.style.removeProperty('--store-card-foreground');
      }
    };

    applyLiveStyles();

    // Cleanup function: revert to profile's saved colors or global defaults
    return () => {
      if (profile) {
        root.style.setProperty('--store-primary', profile.store_primary_color_hsl || 'var(--primary)');
        root.style.setProperty('--store-background', profile.store_background_color_hsl || 'var(--background)');
        root.style.setProperty('--store-card-background', profile.store_card_background_color_hsl || 'var(--card)');
        root.style.setProperty('--store-foreground', profile.store_foreground_color_hsl || 'var(--foreground)'); // Revert foreground
        root.style.setProperty('--store-card-foreground', profile.store_card_foreground_color_hsl || 'var(--card-foreground)'); // Revert card foreground
      } else {
        // If no profile, revert to global defaults
        root.style.removeProperty('--store-primary');
        root.style.removeProperty('--store-background');
        root.style.removeProperty('--store-card-background');
        root.style.removeProperty('--store-foreground');
        root.style.removeProperty('--store-card-foreground');
      }
    };
  }, [livePrimaryColor, liveBackgroundColor, liveCardBackgroundColor, liveForegroundColor, liveCardForegroundColor, profile]);


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
          toast.success(`"${file.name}" compressed successfully!`);
        } else {
          toast.info(`"${file.name}" size is already optimized.`);
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
        // Extract path within the bucket from the full public URL
        const bucketPathSegment = `${bucketName}/`;
        const bucketPathIndex = currentImageUrl.indexOf(bucketPathSegment);
        if (bucketPathIndex !== -1) {
          const path = currentImageUrl.substring(bucketPathIndex + bucketPathSegment.length);
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
      setIsUpdatingStore(false);
    }
  }, [user, refreshProfile, profile]);

  const handlePaletteChange = (paletteId: string) => {
    setSelectedPaletteId(paletteId);
    if (paletteId === 'custom') {
      // When switching to custom, retain current live colors in form fields
      form.setValue("storePrimaryAccentColor", livePrimaryColor || "");
      form.setValue("storeBackgroundColor", liveBackgroundColor || "");
      form.setValue("storeCardHeaderFooterBackgroundColor", liveCardBackgroundColor || "");
      form.setValue("storeForegroundColor", liveForegroundColor || ""); // Retain current foreground
      form.setValue("storeCardForegroundColor", liveCardForegroundColor || ""); // Retain current card foreground
    } else {
      const selected = PRESET_PALETTES.find(p => p.id === paletteId);
      if (selected) {
        setLivePrimaryColor(selected.primary);
        setLiveBackgroundColor(selected.background);
        setLiveCardBackgroundColor(selected.cardBackground);
        setLiveForegroundColor(selected.foreground); // Set new live states
        setLiveCardForegroundColor(selected.cardForeground); // Set new live states

        form.setValue("storePrimaryAccentColor", selected.primary);
        form.setValue("storeBackgroundColor", selected.background);
        form.setValue("storeCardHeaderFooterBackgroundColor", selected.cardBackground);
        form.setValue("storeForegroundColor", selected.foreground); // Set new form values
        form.setValue("storeCardForegroundColor", selected.cardForeground); // Set new form values
      }
    }
  };

  const handleColorInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setColorState: React.Dispatch<React.SetStateAction<string | null>>,
    formFieldName: keyof z.infer<typeof formSchema>
  ) => {
    const newColor = e.target.value;
    setColorState(newColor);
    form.setValue(formFieldName, newColor);
    setSelectedPaletteId('custom'); // Any manual change means it's custom
  };

  const handleResetToDefaultColors = () => {
    const defaultPalette = PRESET_PALETTES.find(p => p.id === 'yaarsite-default');
    if (defaultPalette) {
      handlePaletteChange(defaultPalette.id); // Use the existing handler
      toast.info("Colors reset to Yaarsite Default.");
    }
  };


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Settings Page: onSubmit started.");
    if (!user) {
      toast.error("You must be logged in to update store settings.");
      console.log("Settings Page: User not logged in, returning.");
      return;
    }

    setIsUpdatingStore(true);
    let newAvatarUrl = profile?.avatar_url ?? null;
    console.log("Settings Page: isUpdatingStore set to true.");

    try {
      const uploadImageAndGetUrl = async (
        file: File | null,
        currentUrl: string | null,
        bucketName: 'store-logos', // Only 'store-logos' bucket here
        imageType: string
      ): Promise<string | null> => {
        console.log(`Settings Page: uploadImageAndGetUrl for ${imageType} started.`);
        if (!file && !currentUrl) {
          console.log(`Settings Page: No file or current URL for ${imageType}, returning null.`);
          return null;
        }

        if (file) {
          console.log(`Settings Page: New file detected for ${imageType}.`);
          if (currentUrl) {
            console.log(`Settings Page: Existing URL found for ${imageType}, attempting to delete old image.`);
            const bucketPathSegment = `${bucketName}/`;
            const bucketPathIndex = currentUrl.indexOf(bucketPathSegment);
            if (bucketPathIndex !== -1) {
              const oldPath = currentUrl.substring(bucketPathIndex + bucketPathSegment.length);
              const { error: deleteOldError } = await supabase.storage
                .from(bucketName)
                .remove([oldPath]);
              if (deleteOldError) {
                console.warn(`Settings Page: Failed to delete old ${imageType} from storage:`, deleteOldError.message);
              } else {
                console.log(`Settings Page: Old ${imageType} deleted successfully.`);
              }
            } else {
              console.warn(`Settings Page: Could not extract old path for ${imageType} from URL: ${currentUrl}`);
            }
          }

          const fileExtension = file.name.split('.').pop();
          const fileName = `${user.id}/${imageType}-${uuidv4()}.${fileExtension}`;
          console.log(`Settings Page: Uploading new ${imageType} with fileName: ${fileName}`);
          const { data, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error(`Settings Page: ${imageType} upload failed:`, uploadError.message);
            throw new Error(`${imageType} upload failed: ${uploadError.message}`);
          }
          console.log(`Settings Page: ${imageType} uploaded successfully.`);

          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            console.log(`Settings Page: Public URL obtained for ${imageType}: ${publicUrlData.publicUrl}`);
            return publicUrlData.publicUrl;
          } else {
            console.error(`Settings Page: Failed to get public URL for uploaded ${imageType}.`);
            throw new Error(`Failed to get public URL for uploaded ${imageType}.`);
          }
        }
        console.log(`Settings Page: No new file for ${imageType}, returning current URL.`);
        return currentUrl;
      };

      newAvatarUrl = await uploadImageAndGetUrl(selectedLogoFile, profile?.avatar_url ?? null, 'store-logos', 'logo');
      console.log("Settings Page: Avatar URL determined:", newAvatarUrl);

      // Convert HEX colors (from live state, which reflects selected palette or initial custom) to HSL for storage
      const storePrimaryAccentColorHsl = livePrimaryColor ? hexToHsl(livePrimaryColor) : null;
      const storeBackgroundColorHsl = liveBackgroundColor ? hexToHsl(liveBackgroundColor) : null;
      const storeCardHeaderFooterBackgroundColorHsl = liveCardBackgroundColor ? hexToHsl(liveCardBackgroundColor) : null;
      const storeForegroundColorHsl = liveForegroundColor ? hexToHsl(liveForegroundColor) : null; // New
      const storeCardForegroundColorHsl = liveCardForegroundColor ? hexToHsl(liveCardForegroundColor) : null; // New
      console.log("Settings Page: Converted colors to HSL:", { storePrimaryAccentColorHsl, storeBackgroundColorHsl, storeCardHeaderFooterBackgroundColorHsl, storeForegroundColorHsl, storeCardForegroundColorHsl });


      console.log("Settings Page: Attempting to update profile in Supabase.");
      const { error } = await supabase
        .from('profiles')
        .update({
          tenant_name: values.storeName,
          store_description: values.storeDescription || null,
          avatar_url: newAvatarUrl,
          delivery_charge: values.deliveryCharge,
          jazzcash_phone_number: values.jazzcashPhoneNumber || null,
          easypaisa_phone_number: values.easypaisaPhoneNumber || null,
          store_primary_color_hsl: storePrimaryAccentColorHsl,
          store_background_color_hsl: storeBackgroundColorHsl,
          store_card_background_color_hsl: storeCardHeaderFooterBackgroundColorHsl,
          store_foreground_color_hsl: storeForegroundColorHsl, // New
          store_card_foreground_color_hsl: storeCardForegroundColorHsl, // New
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Settings Page: Error updating store settings in Supabase:", error);
        toast.error("Failed to update store settings. Please try again.");
      } else {
        console.log("Settings Page: Store settings updated successfully in Supabase.");
        toast.success("Store settings updated successfully!");
        console.log("Settings Page: Refreshing profile data.");
        await refreshProfile();
        setSelectedLogoFile(null);
        console.log("Settings Page: Profile refreshed, selected logo file cleared.");
      }
    } catch (err: any) {
      console.error("Settings Page: Unexpected error during store settings update:", err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsUpdatingStore(false);
      console.log("Settings Page: isUpdatingStore set to false (finally block).");
    }
  };

  const handleCopyStoreUrl = () => {
    const urlToCopy = profile?.store_url; // Simplified: only Yaarsite subdomain
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy);
      toast.info("Store URL copied to clipboard!");
    }
  };

  const handleOpenStoreUrl = () => {
    const urlToOpen = profile?.store_url; // Simplified: only Yaarsite subdomain
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }
  };

  const displayStoreUrl = profile?.store_url || "Not available"; // Simplified

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

      <main className="flex-1 p-4 sm:p-8 flex justify-center"> {/* Adjusted padding */}
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

                <h3 className="text-xl font-semibold tracking-tight mt-8">Payment Settings</h3>
                <div className="grid gap-2">
                  <Label htmlFor="jazzcashPhoneNumber" className="text-sm font-medium">JazzCash Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="jazzcashPhoneNumber"
                      type="tel"
                      placeholder="03001234567"
                      className="pl-10"
                      {...form.register("jazzcashPhoneNumber")}
                    />
                  </div>
                  {form.formState.errors.jazzcashPhoneNumber && (
                    <p className="text-destructive text-sm">{form.formState.errors.jazzcashPhoneNumber.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="easypaisaPhoneNumber" className="text-sm font-medium">EasyPaisa Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="easypaisaPhoneNumber"
                      type="tel"
                      placeholder="03001234567"
                      className="pl-10"
                      {...form.register("easypaisaPhoneNumber")}
                    />
                  </div>
                  {form.formState.errors.easypaisaPhoneNumber && (
                    <p className="text-destructive text-sm">{form.formState.errors.easypaisaPhoneNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                  <Paintbrush className="h-5 w-5 text-primary" /> Store Theme Colors
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choose a pre-built color palette or customize your own for your public store.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="colorPalette" className="text-sm font-medium">Select Color Palette</Label>
                  <Select
                    onValueChange={handlePaletteChange}
                    value={selectedPaletteId || ""} // Use empty string if null for Select component
                    disabled={isUpdatingStore}
                  >
                    <SelectTrigger id="colorPalette" className="font-medium">
                      <SelectValue placeholder="Select a Preset or Custom" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_PALETTES.map((palette) => (
                        <SelectItem key={palette.id} value={palette.id} className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              <span className="block h-4 w-4 rounded-full border border-border" style={{ backgroundColor: palette.primary }}></span>
                              <span className="block h-4 w-4 rounded-full border border-border" style={{ backgroundColor: palette.background }}></span>
                              <span className="block h-4 w-4 rounded-full border border-border" style={{ backgroundColor: palette.cardBackground }}></span>
                              <span className="block h-4 w-4 rounded-full border border-border" style={{ backgroundColor: palette.foreground }}></span> {/* New: foreground preview */}
                              <span className="block h-4 w-4 rounded-full border border-border" style={{ backgroundColor: palette.cardForeground }}></span> {/* New: card foreground preview */}
                            </div>
                            <span>{palette.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom" className="font-medium text-primary">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          <span>Custom Colors</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPaletteId === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="storeBackgroundColor" className="text-sm font-medium">Store Background Color</Label>
                      <Input
                        id="storeBackgroundColor"
                        type="color"
                        value={liveBackgroundColor || '#FFFFFF'} // Default to white if null for color picker
                        onChange={(e) => handleColorInputChange(e, setLiveBackgroundColor, "storeBackgroundColor")}
                      />
                      {form.formState.errors.storeBackgroundColor && (
                        <p className="text-destructive text-sm">{form.formState.errors.storeBackgroundColor.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="storeCardHeaderFooterBackgroundColor" className="text-sm font-medium">Card, Header & Footer Background Color</Label>
                      <Input
                        id="storeCardHeaderFooterBackgroundColor"
                        type="color"
                        value={liveCardBackgroundColor || '#FFFFFF'} // Default to white if null for color picker
                        onChange={(e) => handleColorInputChange(e, setLiveCardBackgroundColor, "storeCardHeaderFooterBackgroundColor")}
                      />
                      {form.formState.errors.storeCardHeaderFooterBackgroundColor && (
                        <p className="text-destructive text-sm">{form.formState.errors.storeCardHeaderFooterBackgroundColor.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="storePrimaryAccentColor" className="text-sm font-medium">Primary Accent Color (Buttons, Links, Icons)</Label>
                      <Input
                        id="storePrimaryAccentColor"
                        type="color"
                        value={livePrimaryColor || '#29A399'} // Default to Yaarsite primary if null for color picker
                        onChange={(e) => handleColorInputChange(e, setLivePrimaryColor, "storePrimaryAccentColor")}
                      />
                      {form.formState.errors.storePrimaryAccentColor && (
                        <p className="text-destructive text-sm">{form.formState.errors.storePrimaryAccentColor.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2"> {/* New: Store Foreground Color */}
                      <Label htmlFor="storeForegroundColor" className="text-sm font-medium">Store Foreground Color (Text on Background)</Label>
                      <Input
                        id="storeForegroundColor"
                        type="color"
                        value={liveForegroundColor || getContrastingTextColor(liveBackgroundColor || '#FFFFFF')} // Default based on background
                        onChange={(e) => handleColorInputChange(e, setLiveForegroundColor, "storeForegroundColor")}
                      />
                      {form.formState.errors.storeForegroundColor && (
                        <p className="text-destructive text-sm">{form.formState.errors.storeForegroundColor.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2"> {/* New: Store Card Foreground Color */}
                      <Label htmlFor="storeCardForegroundColor" className="text-sm font-medium">Card Foreground Color (Text on Cards)</Label>
                      <Input
                        id="storeCardForegroundColor"
                        type="color"
                        value={liveCardForegroundColor || getContrastingTextColor(liveCardBackgroundColor || '#FFFFFF')} // Default based on card background
                        onChange={(e) => handleColorInputChange(e, setLiveCardForegroundColor, "storeCardForegroundColor")}
                      />
                      {form.formState.errors.storeCardForegroundColor && (
                        <p className="text-destructive text-sm">{form.formState.errors.storeCardForegroundColor.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetToDefaultColors}
                  disabled={isUpdatingStore}
                  className="w-full font-semibold"
                >
                  Reset to Yaarsite Default Colors
                </Button>
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
                  value={displayStoreUrl}
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