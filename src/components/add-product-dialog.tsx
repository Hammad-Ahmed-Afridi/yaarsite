"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/session-context-provider';
import { v4 as uuidv4 } from 'uuid'; // For unique file names
import { compressImage } from '@/lib/utils'; // Import compressImage
import { ProductVariant } from './edit-product-dialog'; // Import ProductVariant interface

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
import { Plus, Image as ImageIcon, Loader2, X, ChevronDown, Ruler, PlusCircle, MinusCircle } from 'lucide-react'; // Added PlusCircle, MinusCircle icons
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Import Table components

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PRODUCT_LIMIT = 2;

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  // Price and stock are now optional as they might be handled by variants
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }).optional().or(z.literal(0)),
  stock: z.coerce.number().int().min(0, { message: "Stock quantity cannot be negative." }).optional().or(z.literal(0)),
  images: z.array(z.instanceof(File)).max(2, { message: "You can upload a maximum of 2 images." }).optional(),
  category: z.string().optional(),
  sizeChartImage: z.instanceof(File).optional(),
  availableColors: z.string().optional(),
  // New: Variants field for form
  variants: z.array(z.object({
    id: z.string().optional(), // ID is optional for new variants
    attributes: z.record(z.string(), z.string().min(1, "Attribute value cannot be empty.")),
    price: z.coerce.number().min(0.01, { message: "Variant price must be greater than 0." }),
    stock: z.coerce.number().int().min(0, { message: "Variant stock cannot be negative." }),
  })).optional(),
  attributeNames: z.array(z.string().min(1, "Attribute name cannot be empty.")).optional(),
}).refine((data) => {
  // Custom validation: if variants are defined, price and stock on the main product should be 0 or undefined
  if (data.variants && data.variants.length > 0) {
    return (data.price === 0 || data.price === undefined) && (data.stock === 0 || data.stock === undefined);
  }
  // If no variants, price and stock must be defined and valid
  return (data.price !== undefined && data.price > 0) && (data.stock !== undefined && data.stock >= 0);
}, {
  message: "If variants are defined, main product price and stock must be 0. If no variants, price and stock are required.",
  path: ["price"], // Can point to either price or stock
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
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [selectedSizeChartFile, setSelectedSizeChartFile] = useState<File | null>(null);
  const [sizeChartPreview, setSizeChartPreview] = useState<string | null>(null);

  // New states for variant management
  const [attributeNames, setAttributeNames] = useState<string[]>([]);
  const [attributeValues, setAttributeValues] = useState<{[key: string]: string[]}>({});
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0.01,
      stock: 0,
      images: undefined,
      category: "",
      sizeChartImage: undefined,
      availableColors: "",
      variants: [],
      attributeNames: [],
    },
  });

  // Fetch existing categories when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      const fetchCategories = async () => {
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
  }, [isOpen, user]);

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

  const handleRemoveSizeChart = () => {
    setSelectedSizeChartFile(null);
    setSizeChartPreview(null);
    form.setValue("sizeChartImage", undefined);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "new-category") {
      setIsCreatingNewCategory(true);
      setSelectedCategory(''); // Clear selected category when creating new
      form.setValue("category", ''); // Clear form value
    } else {
      setIsCreatingNewCategory(false);
      setSelectedCategory(value);
      form.setValue("category", value);
    }
    form.clearErrors("category");
  };

  // New: Variant management functions
  const addAttribute = () => {
    const newAttributeName = `Attribute ${attributeNames.length + 1}`;
    setAttributeNames(prev => [...prev, newAttributeName]);
    setAttributeValues(prev => ({ ...prev, [newAttributeName]: [] }));
  };

  const removeAttribute = (nameToRemove: string) => {
    setAttributeNames(prev => prev.filter(name => name !== nameToRemove));
    setAttributeValues(prev => {
      const newValues = { ...prev };
      delete newValues[nameToRemove];
      return newValues;
    });
    // Also remove attribute from all variants
    setProductVariants(prev => prev.map(variant => {
      const newAttributes = { ...variant.attributes };
      delete newAttributes[nameToRemove];
      return { ...variant, attributes: newAttributes };
    }));
  };

  const handleAttributeNameChange = (oldName: string, newName: string) => {
    setAttributeNames(prev => prev.map(name => (name === oldName ? newName : name)));
    setAttributeValues(prev => {
      const newValues = { ...prev };
      newValues[newName] = newValues[oldName];
      delete newValues[oldName];
      return newValues;
    });
    setProductVariants(prev => prev.map(variant => {
      const newAttributes = { ...variant.attributes };
      if (newAttributes[oldName] !== undefined) {
        newAttributes[newName] = newAttributes[oldName];
        delete newAttributes[oldName];
      }
      return { ...variant, attributes: newAttributes };
    }));
  };

  const addAttributeValue = (attributeName: string) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeName]: [...(prev[attributeName] || []), `Value ${prev[attributeName]?.length + 1 || 1}`]
    }));
  };

  const removeAttributeValue = (attributeName: string, valueToRemove: string) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeName]: prev[attributeName].filter(val => val !== valueToRemove)
    }));
    // Also remove variants that contain this attribute value
    setProductVariants(prev => prev.filter(variant => variant.attributes[attributeName] !== valueToRemove));
  };

  const handleAttributeValueChange = (attributeName: string, oldValue: string, newValue: string) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeName]: prev[attributeName].map(val => (val === oldValue ? newValue : val))
    }));
    setProductVariants(prev => prev.map(variant => {
      if (variant.attributes[attributeName] === oldValue) {
        return { ...variant, attributes: { ...variant.attributes, [attributeName]: newValue } };
      }
      return variant;
    }));
  };

  const generateVariants = () => {
    const combinations: { [key: string]: string }[] = [];
    const attributeKeys = Object.keys(attributeValues);

    if (attributeKeys.length === 0) {
      setProductVariants([]);
      return;
    }

    function generate(index: number, currentCombination: { [key: string]: string }) {
      if (index === attributeKeys.length) {
        combinations.push(currentCombination);
        return;
      }

      const currentAttributeName = attributeKeys[index];
      const values = attributeValues[currentAttributeName];

      if (!values || values.length === 0) {
        return;
      }

      for (const value of values) {
        generate(index + 1, { ...currentCombination, [currentAttributeName]: value });
      }
    }

    generate(0, {});

    const newVariants: ProductVariant[] = combinations.map(combo => {
      const existingVariant = productVariants.find(v =>
        Object.keys(v.attributes).every(attr => v.attributes[attr] === combo[attr]) &&
        Object.keys(combo).every(attr => combo[attr] === v.attributes[attr])
      );

      return existingVariant || {
        id: uuidv4(),
        attributes: combo,
        price: 0.01, // Default price
        stock: 0,    // Default stock
      };
    });
    setProductVariants(newVariants);
    form.setValue("variants", newVariants);
  };

  const handleVariantChange = (variantId: string, field: 'price' | 'stock', value: string) => {
    setProductVariants(prev => prev.map(variant =>
      variant.id === variantId ? { ...variant, [field]: parseFloat(value) || 0 } : variant
    ));
    form.setValue("variants", productVariants.map(variant =>
      variant.id === variantId ? { ...variant, [field]: parseFloat(value) || 0 } : variant
    ));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to add a product.");
      return;
    }

    if (currentProductCount >= PRODUCT_LIMIT) {
      toast.error(`You have reached the maximum limit of ${PRODUCT_LIMIT} products.`);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    let imageUrls: string[] = [];
    let sizeChartUrl: string | null = null;

    try {
      if (selectedImageFiles.length > 0) {
        for (const file of selectedImageFiles) {
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
            imageUrls.push(publicUrlData.publicUrl);
          } else {
            throw new Error("Failed to get public URL for uploaded image.");
          }
        }
      }

      if (selectedSizeChartFile) {
        const fileExtension = selectedSizeChartFile.name.split('.').pop();
        const fileName = `${user.id}/size-charts/${uuidv4()}.${fileExtension}`;
        const { data, error: uploadError } = await supabase.storage
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
          sizeChartUrl = publicUrlData.publicUrl;
        } else {
          throw new Error("Failed to get public URL for uploaded size chart.");
        }
      }

      const availableColorsArray = values.availableColors
        ? values.availableColors.split(',').map(color => color.trim()).filter(Boolean)
        : null;

      // Prepare variants for database
      const finalVariants = productVariants.length > 0 ? productVariants : null;

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: values.name,
          description: values.description,
          // Set price and stock to null if variants exist, otherwise use form values
          price: finalVariants ? null : values.price,
          stock: finalVariants ? null : values.stock,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          category: values.category || null,
          original_price: finalVariants ? null : values.price, // Original price also depends on variants
          size_chart_url: sizeChartUrl,
          available_colors: availableColorsArray,
          variants: finalVariants, // New: Insert variants
        });

      if (insertError) {
        throw new Error(`Failed to add product: ${insertError.message}`);
      }

      toast.success("Product added successfully!");
      form.reset();
      setSelectedImageFiles([]);
      setImagePreviews([]);
      setSelectedCategory('');
      setIsCreatingNewCategory(false);
      setSelectedSizeChartFile(null);
      setSizeChartPreview(null);
      setAttributeNames([]); // Reset variant states
      setAttributeValues({});
      setProductVariants([]);
      setIsOpen(false);
      onProductAdded();

    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAddProductDisabled = currentProductCount >= PRODUCT_LIMIT;
  const hasVariants = productVariants && productVariants.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 font-semibold" disabled={isAddProductDisabled}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Add New Product</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Fill in the details to add a new product to your store.
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

          {/* Conditional Price and Stock inputs */}
          {!hasVariants && (
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
          )}

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
            <Label className="text-sm font-medium">Product Images ({selectedImageFiles.length}/2)</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload up to 2 high-quality images. Recommended: 1000x1000px or higher square aspect ratio, max 5MB per image.
              <br />
              Supported formats: JPG, PNG, WebP. Images will be compressed for faster loading.
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
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
              <p className="text-destructive text-sm">{form.formState.errors.images.message}</p>
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
              {sizeChartPreview ? (
                <div className="relative w-48 h-24 border rounded-md overflow-hidden">
                  <Image
                    src={sizeChartPreview}
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
                />
                <Button asChild variant="outline" className="w-full font-semibold">
                  <span>{sizeChartPreview ? "Change Size Chart" : "Upload Size Chart"}</span>
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

          {/* New: Variant Management Section */}
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-xl font-semibold tracking-tight">Product Variants</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Define attributes (e.g., Size, Material) and their values to create product variations.
              Each unique combination will have its own price and stock.
              If variants are defined, the main product's price and stock will be ignored.
            </p>

            {attributeNames.map((attrName, attrIndex) => (
              <div key={attrName} className="grid gap-2 border p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Input
                    value={attrName}
                    onChange={(e) => handleAttributeNameChange(attrName, e.target.value)}
                    placeholder="Attribute Name (e.g., Size)"
                    className="flex-1 font-medium"
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeAttribute(attrName)}>
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(attributeValues[attrName] || []).map((val, valIndex) => (
                    <div key={`${attrName}-${valIndex}`} className="flex items-center gap-1">
                      <Input
                        value={val}
                        onChange={(e) => handleAttributeValueChange(attrName, val, e.target.value)}
                        placeholder="Value (e.g., Small)"
                        className="w-32"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAttributeValue(attrName, val)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addAttributeValue(attrName)}>
                    <PlusCircle className="mr-1 h-4 w-4" /> Add Value
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addAttribute} className="w-full font-semibold">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Attribute
            </Button>

            {attributeNames.length > 0 && (
              <Button type="button" onClick={generateVariants} className="w-full font-semibold mt-4">
                Generate Variants
              </Button>
            )}

            {productVariants.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Variant Combinations</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {attributeNames.map(name => <TableHead key={name}>{name}</TableHead>)}
                        <TableHead>Price (Rs)</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productVariants.map(variant => (
                        <TableRow key={variant.id}>
                          {attributeNames.map(name => (
                            <TableCell key={`${variant.id}-${name}`}>
                              {variant.attributes[name]}
                            </TableCell>
                          ))}
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="1"
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {form.formState.errors.variants && (
                  <p className="text-destructive text-sm mt-2">{form.formState.errors.variants.message}</p>
                )}
              </div>
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