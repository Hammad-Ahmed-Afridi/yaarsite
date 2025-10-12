"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/session-context-provider';
import { v4 as uuidv4 } from 'uuid';
import { compressImage } from '@/lib/utils';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Loader2, X, Edit, ChevronDown, Ruler } from 'lucide-react'; // Added Ruler icon
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }),
  stock: z.coerce.number().int().min(0, { message: "Stock quantity cannot be negative." }),
  newImages: z.array(z.instanceof(File)).max(2, { message: "You can upload a maximum of 2 new images." }).optional(),
  category: z.string().optional(), // New: category field
  sizeChartImage: z.instanceof(File).optional(), // New: sizeChartImage
  availableColors: z.string().optional(), // New: availableColors as comma-separated string
});

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
  category: string | null; // New: category field
  original_price: number | null; // New: original_price
  discount_percentage: number | null; // New: discount_percentage
  discount_start_date: string | null; // New: discount_start_date
  discount_end_date: string | null; // New: discount_end_date
  created_at: string;
  size_chart_url: string | null; // New: size_chart_url
  available_colors: string[] | null; // New: available_colors
}

interface EditProductDialogProps {
  product: Product;
  onProductUpdated: () => void;
}

export function EditProductDialog({ product, onProductUpdated }: EditProductDialogProps) {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNewImageFiles, setSelectedNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]); // New: state for existing categories
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // New: state for selected category
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false); // New: state for creating new category
  const [selectedSizeChartFile, setSelectedSizeChartFile] = useState<File | null>(null); // New: state for size chart file
  const [sizeChartPreview, setSizeChartPreview] = useState<string | null>(null); // New: state for size chart preview

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      newImages: undefined,
      category: product.category || "", // Default category
      sizeChartImage: undefined,
      availableColors: product.available_colors?.join(', ') || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        newImages: undefined,
        category: product.category || "",
        sizeChartImage: undefined, // Reset file input
        availableColors: product.available_colors?.join(', ') || "",
      });
      setExistingImageUrls(product.image_urls || []);
      setSelectedNewImageFiles([]);
      setNewImagePreviews([]);
      setSelectedCategory(product.category || '');
      setIsCreatingNewCategory(false); // Reset new category creation state
      setSizeChartPreview(product.size_chart_url || null); // Set existing size chart preview

      // Fetch existing categories when dialog opens
      const fetchCategories = async () => {
        if (!user) return;
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        const uniqueCategories = Array.from(new Set(data.map(p => p.category).filter(Boolean) as string[]));
        setExistingCategories(uniqueCategories);
      };
      fetchCategories();
    }
  }, [isOpen, product, form, user]);

  const handleNewImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const totalImages = existingImageUrls.length + selectedNewImageFiles.length + files.length;

      if (totalImages > 2) {
        toast.error("You can have a maximum of 2 images in total (existing + new).");
        return;
      }

      const validFiles: File[] = [];
      const previews: string[] = [];

      for (const file of files) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`File "${file.name}" is not a valid image type (JPEG, PNG, WebP).`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File "${file.name}" is too large (max 5MB).`);
          continue;
        }

        let fileToUpload = file;
        if (file.size > 600 * 1024) {
          toast.info(`Compressing "${file.name}" for faster loading...`);
          fileToUpload = await compressImage(file);
          if (fileToUpload.size < file.size) {
            toast.success(`"${file.name}" compressed successfully!`);
          } else {
            toast.info(`"${file.name}" size is already optimized.`);
          }
        }

        validFiles.push(fileToUpload);
        previews.push(URL.createObjectURL(fileToUpload));
      }

      setSelectedNewImageFiles(prev => [...prev, ...validFiles]);
      setNewImagePreviews(prev => [...prev, ...previews]);
      form.setValue("newImages", [...selectedNewImageFiles, ...validFiles]);
      form.clearErrors("newImages");
    }
  };

  const handleRemoveExistingImage = (urlToRemove: string) => {
    setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    const updatedFiles = selectedNewImageFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = newImagePreviews.filter((_, index) => index !== indexToRemove);
    setSelectedNewImageFiles(updatedFiles);
    setNewImagePreviews(updatedPreviews);
    form.setValue("newImages", updatedFiles);
  };

  const handleSizeChartChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Invalid file type for size chart. Please upload a JPEG, PNG, or WebP image.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Size chart file is too large (max ${MAX_FILE_SIZE / (1024 * 1024)}MB).`);
        return;
      }

      let fileToUpload = file;
      if (file.size > 600 * 1024) { // Compress if larger than 600KB
        toast.info(`Compressing size chart for faster loading...`);
        fileToUpload = await compressImage(file);
        if (fileToUpload.size < file.size) {
          toast.success(`Size chart compressed successfully!`);
        } else {
          toast.info(`Size chart size is already optimized.`);
        }
      }

      setSelectedSizeChartFile(fileToUpload);
      setSizeChartPreview(URL.createObjectURL(fileToUpload));
      form.setValue("sizeChartImage", fileToUpload as any);
      form.clearErrors("sizeChartImage");
    }
  };

  const handleRemoveSizeChart = useCallback(async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (product.size_chart_url) {
        const path = product.size_chart_url.split('store-content-images/')[1];
        if (path) {
          const { error: deleteStorageError } = await supabase.storage
            .from('store-content-images')
            .remove([path]);

          if (deleteStorageError) {
            console.warn(`Failed to delete old size chart from storage:`, deleteStorageError.message);
          }
        }
      }

      const { error } = await supabase
        .from('products')
        .update({ size_chart_url: null, updated_at: new Date().toISOString() })
        .eq('id', product.id)
        .eq('user_id', user.id);

      if (error) {
        console.error(`Error removing size chart:`, error);
        toast.error(`Failed to remove size chart. Please try again.`);
      } else {
        toast.success(`Size chart removed successfully!`);
        setSelectedSizeChartFile(null);
        setSizeChartPreview(null);
        onProductUpdated(); // Refresh product list
      }
    } catch (err) {
      console.error(`Unexpected error during size chart removal:`, err);
      toast.error(`An unexpected error occurred during size chart removal.`);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, product, onProductUpdated]);

  const handleCategoryChange = (value: string) => {
    if (value === "new-category") {
      setIsCreatingNewCategory(true);
      setSelectedCategory('');
      form.setValue("category", '');
    } else {
      setIsCreatingNewCategory(false);
      setSelectedCategory(value);
      form.setValue("category", value);
    }
    form.clearErrors("category");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to edit a product.");
      return;
    }

    setIsSubmitting(true);
    let finalImageUrls: string[] = [...existingImageUrls];
    const oldImagePathsToRemove: string[] = [];
    let newSizeChartUrl = product.size_chart_url;

    try {
      const initialImageUrls = product.image_urls || [];
      for (const initialUrl of initialImageUrls) {
        if (!existingImageUrls.includes(initialUrl)) {
          const path = initialUrl.split('product-images/')[1];
          if (path) oldImagePathsToRemove.push(path);
        }
      }

      if (selectedNewImageFiles.length > 0) {
        for (const file of selectedNewImageFiles) {
          const fileExtension = file.name.split('.').pop();
          const fileName = `${user.id}/products/${uuidv4()}.${fileExtension}`;
          const { data, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            finalImageUrls.push(publicUrlData.publicUrl);
          } else {
            throw new Error("Failed to get public URL for uploaded image.");
          }
        }
      }

      // Handle size chart upload/update
      if (selectedSizeChartFile) {
        // If there was an old size chart, remove it first
        if (product.size_chart_url) {
          const oldPath = product.size_chart_url.split('store-content-images/')[1];
          if (oldPath) {
            const { error: deleteOldError } = await supabase.storage
              .from('store-content-images')
              .remove([oldPath]);
            if (deleteOldError) {
              console.warn(`Failed to delete old size chart from storage:`, deleteOldError.message);
            }
          }
        }

        const fileExtension = selectedSizeChartFile.name.split('.').pop();
        const fileName = `${user.id}/size-charts/${uuidv4()}.${fileExtension}`;
        const { error: uploadError } = await supabase.storage
          .from('store-content-images')
          .upload(fileName, selectedSizeChartFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Size chart upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('store-content-images')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          newSizeChartUrl = publicUrlData.publicUrl;
        } else {
          throw new Error("Failed to get public URL for uploaded size chart.");
        }
      } else if (sizeChartPreview === null && product.size_chart_url) {
        // If preview is null but product had a URL, it means it was removed
        const oldPath = product.size_chart_url.split('store-content-images/')[1];
        if (oldPath) {
          const { error: deleteOldError } = await supabase.storage
            .from('store-content-images')
            .remove([oldPath]);
          if (deleteOldError) {
            console.warn(`Failed to delete old size chart from storage:`, deleteOldError.message);
          }
        }
        newSizeChartUrl = null;
      }


      if (oldImagePathsToRemove.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove(oldImagePathsToRemove);

        if (deleteError) {
          console.warn("Failed to delete old product images:", deleteError.message);
        }
      }

      // Determine if price is being changed and if a discount is active
      const isPriceChanging = values.price !== product.price;
      const isDiscountActive = product.discount_percentage !== null && product.discount_end_date && new Date(product.discount_end_date) > new Date();

      let updatedPrice = values.price;
      let updatedOriginalPrice = product.original_price;
      let updatedDiscountPercentage = product.discount_percentage;
      let updatedDiscountStartDate = product.discount_start_date; // New: track start date
      let updatedDiscountEndDate = product.discount_end_date;

      if (isPriceChanging) {
        // If price is changed manually, any active discount should be removed
        // and the new price becomes the base price.
        updatedOriginalPrice = null;
        updatedDiscountPercentage = null;
        updatedDiscountStartDate = null; // Clear start date
        updatedDiscountEndDate = null;
      } else if (isDiscountActive) {
        // If price is not changing manually, but a discount is active,
        // ensure the original_price is preserved if it exists.
        updatedOriginalPrice = product.original_price !== null ? product.original_price : product.price;
      } else {
        // If no discount is active and price is not changing, ensure original_price is null
        updatedOriginalPrice = null;
      }

      const availableColorsArray = values.availableColors
        ? values.availableColors.split(',').map(color => color.trim()).filter(Boolean)
        : null;

      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: values.name,
          description: values.description,
          price: updatedPrice,
          stock: values.stock,
          image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
          category: values.category || null,
          original_price: updatedOriginalPrice,
          discount_percentage: updatedDiscountPercentage,
          discount_start_date: updatedDiscountStartDate, // Update start date
          discount_end_date: updatedDiscountEndDate,
          size_chart_url: newSizeChartUrl, // New: update size chart URL
          available_colors: availableColorsArray, // New: update available colors
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(`Failed to update product: ${updateError.message}`);
      }

      toast.success("Product updated successfully!");
      setIsOpen(false);
      onProductUpdated();

    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCurrentImages = existingImageUrls.length + selectedNewImageFiles.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 font-semibold">
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Edit Product</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Update the details for your product.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-destructive text-sm">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-sm font-medium">Price (Rs) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-destructive text-sm">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock" className="text-sm font-medium">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                step="1"
                placeholder="0"
                {...form.register("stock", { valueAsNumber: true })}
              />
              {form.formState.errors.stock && (
                <p className="text-destructive text-sm">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category" className="text-sm font-medium">Category</Label>
            {!isCreatingNewCategory ? (
              <Select onValueChange={handleCategoryChange} value={selectedCategory}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Select or create a category" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="font-medium">
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="new-category" className="font-medium text-primary">
                    + Create New Category
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  id="new-category-input"
                  placeholder="Enter new category name"
                  {...form.register("category")}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setIsCreatingNewCategory(false)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
            {form.formState.errors.category && (
              <p className="text-destructive text-sm">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Product Images ({totalCurrentImages}/2)</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload up to 2 high-quality images. Recommended: 1000x1000px or higher square aspect ratio, max 5MB per image.
              <br />
              Supported formats: JPG, PNG, WebP. Images will be compressed for faster loading.
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {existingImageUrls.map((url, index) => (
                <div key={`existing-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden">
                  <Image src={url} alt={`Existing product image ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => handleRemoveExistingImage(url)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {newImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden">
                  <Image src={preview} alt={`New product preview ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => handleRemoveNewImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {totalCurrentImages < 2 && (
                <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add image</span>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleNewImageChange}
                    multiple
                  />
                </Label>
              )}
            </div>
            {form.formState.errors.newImages && (
              <p className="text-destructive text-sm">{form.formState.errors.newImages.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Size Chart Image (Optional)</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload an image of your product's size chart. This will be visible to customers on the product page.
              <br />
              Recommended: Clear text, max 5MB. Supported formats: JPG, PNG, WebP.
            </p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {(sizeChartPreview || product.size_chart_url) ? (
                <div className="relative w-48 h-24 border rounded-md overflow-hidden">
                  <Image
                    src={sizeChartPreview || product.size_chart_url!}
                    alt="Size Chart Preview"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={handleRemoveSizeChart}
                    disabled={isSubmitting}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-48 h-24 border-2 border-dashed rounded-md bg-muted">
                  <Ruler className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <Label htmlFor="size-chart-upload" className="flex-1">
                <Input
                  id="size-chart-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleSizeChartChange}
                  disabled={isSubmitting}
                />
                <Button asChild variant="outline" className="w-full font-semibold" disabled={isSubmitting}>
                  <span>{(sizeChartPreview || product.size_chart_url) ? "Change Size Chart" : "Upload Size Chart"}</span>
                </Button>
              </Label>
            </div>
            {form.formState.errors.sizeChartImage && (
              <p className="text-destructive text-sm">{form.formState.errors.sizeChartImage.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="availableColors" className="text-sm font-medium">Available Colors (Optional)</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter colors separated by commas (e.g., "Red, Blue, Green"). Customers can select these.
            </p>
            <Input
              id="availableColors"
              placeholder="e.g., Red, Blue, Green"
              {...form.register("availableColors")}
            />
            {form.formState.errors.availableColors && (
              <p className="text-destructive text-sm">{form.formState.errors.availableColors.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Product...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}