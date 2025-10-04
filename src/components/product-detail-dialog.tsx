"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShoppingCart, Image as ImageIcon, Ruler, Expand } from 'lucide-react'; // Added Ruler, Expand icons
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/components/cart-context-provider';
import { toast } from 'sonner';
import { format } from 'date-fns'; // Import format
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Import RadioGroup
import { Label } from '@/components/ui/label'; // Import Label
import { Input } from '@/components/ui/input'; // Import Input
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Import AlertDialog for size chart

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string; // Owner of the product
  image_urls: string[] | null;
  original_price: number | null; // New: original_price
  discount_percentage: number | null; // New: discount_percentage
  discount_start_date: string | null; // New: discount_start_date
  discount_end_date: string | null; // New: discount_end_date
  size_chart_url: string | null; // New: size_chart_url
  available_colors: string[] | null; // New: available_colors
}

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeOwnerId: string; // Pass store owner ID for adding to cart
}

export function ProductDetailDialog({ product, isOpen, onOpenChange, storeOwnerId }: ProductDetailDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined); // New: state for selected color
  const [selectedSizeInput, setSelectedSizeInput] = useState<string>(''); // New: state for size input
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0); // Reset image index when dialog opens
      setSelectedColor(product?.available_colors?.[0] || undefined); // Select first color by default
      setSelectedSizeInput(''); // Clear size input
    }
  }, [isOpen, product]);

  if (!product) {
    return null; // Don't render if no product is provided
  }

  const images = product.image_urls || [];
  const hasMultipleImages = images.length > 1;
  const hasColors = product.available_colors && product.available_colors.length > 0;
  const hasSizeChart = !!product.size_chart_url;

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }
    if (hasColors && !selectedColor) {
      toast.error("Please select a color.");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_urls?.[0], // Use the first image for cart display
      storeOwnerId: storeOwnerId,
      stock: product.stock, // Pass the product's stock
      selected_color: selectedColor, // New: pass selected color
      selected_size_input: selectedSizeInput, // New: pass selected size input
    });
    onOpenChange(false); // Close dialog after adding to cart
  };

  const isDiscountActive = product.discount_percentage && product.discount_start_date && product.discount_end_date &&
                           new Date(product.discount_start_date) <= new Date() && new Date(product.discount_end_date) >= new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">{product.name}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">Product details</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Slider */}
          <div className="relative w-full h-80 md:h-96 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="object-center"
                />
                {hasMultipleImages && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 rounded-full z-10"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 rounded-full z-10"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <ImageIcon className="h-24 w-24 text-muted-foreground" />
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold tracking-tight">{product.name}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">{product.description || "No description available."}</p>
            <div className="flex items-center justify-between">
              {isDiscountActive && product.original_price !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg text-muted-foreground line-through">Rs{product.original_price.toFixed(2)}</span>
                  <span className="text-4xl font-extrabold text-primary">Rs{product.price.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-4xl font-extrabold text-primary">Rs{product.price.toFixed(2)}</span>
              )}
              <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">
                {product.stock} in stock
              </Badge>
            </div>
            {isDiscountActive && (
              <>
                <Badge className="bg-green-500 text-white text-base px-3 py-1 font-medium">
                  {product.discount_percentage}% OFF!
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Valid from {format(new Date(product.discount_start_date!), "PPP")} to {format(new Date(product.discount_end_date!), "PPP")}
                </p>
              </>
            )}

            {/* Color Selection */}
            {hasColors && (
              <div className="space-y-2">
                <Label className="text-base font-medium">Select Color:</Label>
                <RadioGroup
                  value={selectedColor}
                  onValueChange={setSelectedColor}
                  className="flex flex-wrap gap-2"
                >
                  {product.available_colors?.map((color) => (
                    <div key={color} className="flex items-center">
                      <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
                      <Label
                        htmlFor={`color-${color}`}
                        className="flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer text-sm font-medium hover:bg-accent hover:text-accent-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Size Chart & Size Input */}
            <div className="space-y-2">
              {hasSizeChart && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center gap-2 font-semibold">
                      <Ruler className="h-4 w-4" /> View Size Chart
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-bold">Size Chart</AlertDialogTitle>
                      <AlertDialogDescription>
                        Refer to this chart to find your perfect size.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="relative w-full h-[60vh] flex items-center justify-center bg-muted rounded-md overflow-hidden">
                      <Image
                        src={product.size_chart_url!}
                        alt="Size Chart"
                        fill
                        style={{ objectFit: 'contain' }}
                        className="object-center"
                      />
                    </div>
                    <AlertDialogAction className="w-full font-semibold">Close</AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Label htmlFor="size-input" className="text-base font-medium">Your Size (e.g., Large, 36 waist)</Label>
              <Input
                id="size-input"
                placeholder="Enter your size based on the chart"
                value={selectedSizeInput}
                onChange={(e) => setSelectedSizeInput(e.target.value)}
              />
            </div>

            <Button
              className="w-full py-6 text-lg flex items-center gap-2 font-semibold"
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || (hasColors && !selectedColor)}
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}