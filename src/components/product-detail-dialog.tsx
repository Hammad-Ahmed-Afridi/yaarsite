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
import { ChevronLeft, ChevronRight, ShoppingCart, Image as ImageIcon, Ruler, Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/components/cart-context-provider';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Product, ProductVariant } from './edit-product-dialog'; // Import Product and ProductVariant interfaces

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeOwnerId: string;
}

export function ProductDetailDialog({ product, isOpen, onOpenChange, storeOwnerId }: ProductDetailDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined); // Changed from null to undefined
  const [selectedAttributes, setSelectedAttributes] = useState<{[key: string]: string}>({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen && product) {
      setCurrentImageIndex(0);
      setQuantity(1);

      if (product.variants && product.variants.length > 0) {
        // Initialize selected attributes with the first variant's attributes
        const initialAttributes: {[key: string]: string} = {};
        Object.keys(product.variants[0].attributes).forEach(attrName => {
          initialAttributes[attrName] = product.variants![0].attributes[attrName];
        });
        setSelectedAttributes(initialAttributes);
        setSelectedVariant(product.variants[0]); // Select the first variant by default
      } else {
        setSelectedAttributes({});
        setSelectedVariant(undefined); // Changed from null to undefined
      }
    }
  }, [isOpen, product]);

  // Effect to update selectedVariant when selectedAttributes change
  useEffect(() => {
    if (product && product.variants && Object.keys(selectedAttributes).length > 0) {
      const foundVariant = product.variants.find(variant =>
        Object.keys(selectedAttributes).every(attrName =>
          variant.attributes[attrName] === selectedAttributes[attrName]
        )
      );
      setSelectedVariant(foundVariant || undefined); // Changed from null to undefined
    }
  }, [selectedAttributes, product]);

  if (!product) {
    return null;
  }

  const images = product.image_urls || [];
  const hasMultipleImages = images.length > 1;
  const hasSizeChart = !!product.size_chart_url;
  const hasVariants = product.variants && product.variants.length > 0;

  // Determine current price and stock based on selected variant or main product
  const currentPrice = selectedVariant?.price ?? product.price ?? 0;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const availableAttributeNames = hasVariants ? Array.from(new Set(product.variants!.flatMap(v => Object.keys(v.attributes)))) : [];

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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > currentStock) newQuantity = currentStock;
    setQuantity(newQuantity);
  };

  const handleAttributeSelection = (attrName: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [attrName]: value }));
  };

  const handleAddToCart = () => {
    if (currentStock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }
    if (hasVariants && !selectedVariant) {
      toast.error("Please select all product variations.");
      return;
    }
    if (quantity > currentStock) {
      toast.error(`Cannot add more than available stock (${currentStock} in stock).`);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image_url: product.image_urls?.[0],
      storeOwnerId: storeOwnerId,
      stock: currentStock,
      variantId: selectedVariant?.id, // Pass variant ID
      selectedAttributes: selectedAttributes, // Pass selected attributes
      original_price: product.original_price, // Pass product-level discount info
      discount_percentage: product.discount_percentage,
      discount_start_date: product.discount_start_date,
      discount_end_date: product.discount_end_date,
    }, quantity);
    onOpenChange(false);
  };

  const isDiscountActive = product.discount_percentage && product.discount_start_date && product.discount_end_date &&
                           new Date(product.discount_start_date) <= new Date() && new Date(product.discount_end_date) >= new Date();

  const discountedPrice = isDiscountActive && product.discount_percentage !== null
    ? currentPrice * (1 - product.discount_percentage / 100)
    : currentPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto font-sans p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-bold tracking-tight">{product.name}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-muted-foreground">Product details</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-80 md:h-96 bg-muted rounded-xl overflow-hidden flex items-center justify-center shadow-md">
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
            {hasMultipleImages && (
              <div className="flex gap-2 justify-center">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2",
                      index === currentImageIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Actions */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold tracking-tight">{product.name}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">{product.description || "No description available."}</p>
            
            {/* Price and Stock */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {isDiscountActive && product.original_price !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg text-muted-foreground line-through">Rs{product.original_price.toFixed(2)}</span>
                  <span className="text-4xl font-extrabold text-primary">Rs{discountedPrice.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-4xl font-extrabold text-primary">Rs{currentPrice.toFixed(2)}</span>
              )}
              <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">
                {currentStock} in stock
              </Badge>
            </div>
            {isDiscountActive && (
              <div className="space-y-1">
                <Badge className="bg-green-500 text-white text-base px-3 py-1 font-medium">
                  {product.discount_percentage}% OFF!
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Valid from {format(new Date(product.discount_start_date!), "PPP")} to {format(new Date(product.discount_end_date!), "PPP")}
                </p>
              </div>
            )}

            {/* Variant Selection */}
            {hasVariants && availableAttributeNames.map(attrName => (
              <div key={attrName} className="space-y-2">
                <Label className="text-base font-medium">Select {attrName}:</Label>
                <RadioGroup
                  value={selectedAttributes[attrName]}
                  onValueChange={(value) => handleAttributeSelection(attrName, value)}
                  className="flex flex-wrap gap-2"
                >
                  {Array.from(new Set(product.variants!.map(v => v.attributes[attrName]))).filter(Boolean).map((attrValue) => (
                    <div key={`${attrName}-${attrValue}`} className="flex items-center">
                      <RadioGroupItem value={attrValue} id={`${attrName}-${attrValue}`} className="peer sr-only" />
                      <Label
                        htmlFor={`${attrName}-${attrValue}`}
                        className="flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer text-sm font-medium 
                                   peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:font-bold
                                   hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                      >
                        {attrValue}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base font-medium">Quantity:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || currentStock <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  className="w-20 text-center text-base"
                  min="1"
                  max={currentStock}
                  disabled={currentStock <= 0}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= currentStock || currentStock <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Size Chart */}
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

            <Button
              className="w-full py-6 text-lg flex items-center gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              onClick={handleAddToCart}
              disabled={currentStock <= 0 || (hasVariants && !selectedVariant)}
            >
              <ShoppingCart className="h-5 w-5" />
              {currentStock <= 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}