"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/session-context-provider';
import { v4 as uuidv4 } from 'uuid';

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
import { Image as ImageIcon, Loader2, X, Edit } from 'lucide-react';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }),
  stock: z.coerce.number().int().min(0, { message: "Stock quantity cannot be negative." }),
  newImages: z.array(z.instanceof(File)).max(2, { message: "You can upload a maximum of 2 new images." }).optional(),
});

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
  created_at: string;
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      newImages: undefined,
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
      });
      setExistingImageUrls(product.image_urls || []);
      setSelectedNewImageFiles([]);
      setNewImagePreviews([]);
    }
  }, [isOpen, product, form]);

  const handleNewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to edit a product.");
      return;
    }

    setIsSubmitting(true);
    let finalImageUrls: string[] = [...existingImageUrls];
    const oldImagePathsToRemove: string[] = [];

    try {
      const initialImageUrls = product.image_urls || [];
      for (const initialUrl of initialImageUrls) {
        if (!existingImageUrls.includes(initialUrl)) {
          const path = initialUrl.split('product-images/')[1];
          if (path) oldImagePathsToRemove.push(path);
        }
      }

      // 1. Upload new images to Supabase Storage
      if (selectedNewImageFiles.length > 0) {
        for (const file of selectedNewImageFiles) {
          const fileExtension = file.name.split('.').pop();
          const fileName = `${user.id}/${uuidv4()}.${fileExtension}`;
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

      // 2. Delete old images from Supabase Storage that were removed by the user
      if (oldImagePathsToRemove.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove(oldImagePathsToRemove);

        if (deleteError) {
          console.warn("Failed to delete old product images:", deleteError.message);
        }
      }

      // 3. Update product data in Supabase database
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: values.name,
          description: values.description,
          price: values.price,
          stock: values.stock,
          image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
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
        <Button variant="outline" size="sm" className="flex-1 h-9 px-3 text-sm">
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for your product.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              className="h-10 text-base focus-visible:ring-primary"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              className="min-h-[80px] text-base focus-visible:ring-primary"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-sm font-medium">Price (Rs) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-10 text-base focus-visible:ring-primary"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock" className="text-sm font-medium">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                step="1"
                placeholder="0"
                className="h-10 text-base focus-visible:ring-primary"
                {...form.register("stock", { valueAsNumber: true })}
              />
              {form.formState.errors.stock && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Product Images ({totalCurrentImages}/2)</Label>
            <p className="text-xs text-muted-foreground">
              Recommended: 800x800 pixels for product images.
              <br />
              • Use online image editor tools for the best possible outcomes
              <br />
              • Use online image compressor tools for the best possible outcomes
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {existingImageUrls.map((url, index) => (
                <div key={`existing-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden shadow-sm">
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
                <div key={`new-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden shadow-sm">
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
                <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
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
              <p className="text-destructive text-sm mt-1">{form.formState.errors.newImages.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Upload up to 2 high-quality images • Recommended 1000x1000px or higher square aspect ratio • Supported formats: JPG, PNG, WebP
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="h-10 px-4 py-2 text-base">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 px-4 py-2 text-base font-semibold">
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