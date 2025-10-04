"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import *s z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/session-context-provider';
import { v4 as uuidv4 } from 'uuid'; // For unique file names
import { compressImage } from '@/lib/utils'; // Import compressImage

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
const PRODUCT_LIMIT = 2; // Added constant for product limit

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }), // Changed from preprocess
  stock: z.coerce.number().int().min(0, { message: "Stock quantity cannot be negative." }), // Changed from preprocess
  images: z.array(z.instanceof(File)).max(2, { message: "You can upload a maximum of 2 images." }).optional(),
});

interface AddProductDialogProps {
  onProductAdded: () => void;
  currentProductCount: number; // New prop to receive current product count
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
      images: undefined, // Explicitly undefined for optional array
    },
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        let fileToUpload = file;
        if (file.size > 600 * 1024) { // Compress if larger than 600KB
          toast.info(`Compressing "${file.name}" for faster loading...`);
          fileToUpload = await compressImage(file);
          if (fileToUpload.size < file.size) {
            toast.success(`"${file.name}" compressed successfully!`);
          } else {
            toast.info(`"${file.name}" size is already optimized.`);
          }
        }

        validFiles.push(fileToUpload);
        newPreviews.push(URL.createObjectURL(fileToUpload));
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

    if (currentProductCount >= PRODUCT_LIMIT) { // Updated condition
      toast.error(`You have reached the maximum limit of ${PRODUCT_LIMIT} products.`); // Updated message
      setIsSubmitting(false); // Ensure submitting state is reset
      return;
    }

    setIsSubmitting(true);
    let imageUrls: string[] = [];

    try {
      // 1. Upload images to Supabase Storage
      if (selectedImageFiles.length > 0) {
        for (const file of selectedImageFiles) {
          const fileExtension = file.name.split('.').pop();
          const fileName = `${user.id}/${uuidv4()}.${fileExtension}`; // Store under user ID folder
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
          image_urls: imageUrls.length > 0 ? imageUrls : null, // Set to null if no images
        });

      if (insertError) {
        throw new Error(`Failed to add product: ${insertError.message}`);
      }

      toast.success("Product added successfully!");
      form.reset();
      setSelectedImageFiles([]);
      setImagePreviews([]);
      setIsOpen(false); // Close the dialog
      onProductAdded(); // Notify parent component to refresh product list

    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAddProductDisabled = currentProductCount >= PRODUCT_LIMIT;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 font-semibold" disabled={isAddProductDisabled}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight">Add New Product</DialogTitle>
          <DialogDescription className="text-sm md:text-base leading-relaxed">
            Fill in the details to add a new product to your store.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs md:text-sm font-medium">Product Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              className="text-sm md:text-base"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs md:text-sm">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-xs md:text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              className="text-sm md:text-base"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-destructive text-xs md:text-sm">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-xs md:text-sm font-medium">Price (Rs) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="text-sm md:text-base"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-destructive text-xs md:text-sm">{form.formState.errors.price.message}</p>
            )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock" className="text-xs md:text-sm font-medium">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                step="1"
                placeholder="0"
                className="text-sm md:text-base"
                {...form.register("stock", { valueAsNumber: true })}
              />
              {form.formState.errors.stock && (
                <p className="text-destructive text-xs md:text-sm">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs md:text-sm font-medium">Product Images ({selectedImageFiles.length}/2)</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload up to 2 high-quality images. Recommended: 1000x1000px or higher square aspect ratio, max 5MB per image.
              <br />
              Supported formats: JPG, PNG, WebP. Images will be compressed for faster loading.
            </p>
            <div className="flex gap-2 mt-2 flex-wrap"> {/* Added flex-wrap */}
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
                  <Image src={preview} alt={`Product preview ${index + 1}`} fill style={{ objectFit: 'cover' }} /> {/* Updated prop */}
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
                <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
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
              <p className="text-destructive text-xs md:text-sm">{form.formState.errors.images.message}</p>
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