"use client";

import React, { useState } from 'react';
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
import { Plus, Image as ImageIcon, Loader2, X } from 'lucide-react';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }),
  stock: z.coerce.number().int().min(0, { message: "Stock quantity cannot be negative." }),
  images: z.array(z.instanceof(File)).max(2, { message: "You can upload a maximum of 2 images." }).optional(),
});

interface AddProductDialogProps {
  onProductAdded: () => void;
  currentProductCount: number;
}

export function AddProductDialog({ onProductAdded, currentProductCount }: AddProductDialogProps) {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0.01,
      stock: 0,
      images: undefined,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newFiles = [...selectedImageFiles, ...files];

      if (newFiles.length > 2) {
        toast.error("You can upload a maximum of 2 images.");
        return;
      }

      const validFiles: File[] = [];
      const newPreviews: string[] = [];

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
        newPreviews.push(URL.createObjectURL(file));
      }

      setSelectedImageFiles(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
      form.setValue("images", [...selectedImageFiles, ...validFiles]);
      form.clearErrors("images");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedFiles = selectedImageFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setSelectedImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    form.setValue("images", updatedFiles);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to add a product.");
      return;
    }

    if (currentProductCount >= 3) {
      toast.error("You have reached the maximum limit of 3 products.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    let imageUrls: string[] = [];

    try {
      // 1. Upload images to Supabase Storage
      if (selectedImageFiles.length > 0) {
        for (const file of selectedImageFiles) {
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
            imageUrls.push(publicUrlData.publicUrl);
          } else {
            throw new Error("Failed to get public URL for uploaded image.");
          }
        }
      }

      // 2. Insert product data into Supabase database
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: values.name,
          description: values.description,
          price: values.price,
          stock: values.stock,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
        });

      if (insertError) {
        throw new Error(`Failed to add product: ${insertError.message}`);
      }

      toast.success("Product added successfully!");
      form.reset();
      setSelectedImageFiles([]);
      setImagePreviews([]);
      setIsOpen(false);
      onProductAdded();

    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAddProductDisabled = currentProductCount >= 3;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 h-10 px-4 py-2 text-base font-semibold" disabled={isAddProductDisabled}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new product to your store.
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
            <Label className="text-sm font-medium">Product Images ({selectedImageFiles.length}/2)</Label>
            <p className="text-xs text-muted-foreground">
              Recommended: 800x800 pixels for product images.
              <br />
              • Use online image editor tools for the best possible outcomes
              <br />
              • Use online image compressor tools for the best possible outcomes
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden shadow-sm">
                  <Image src={preview} alt={`Product preview ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {selectedImageFiles.length < 2 && (
                <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add image</span>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    multiple
                  />
                </Label>
              )}
            </div>
            {form.formState.errors.images && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.images.message}</p>
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
                  Adding Product...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}