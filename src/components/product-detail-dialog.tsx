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
import { ChevronLeft, ChevronRight, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/components/cart-context-provider';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string; // Owner of the product
  image_urls: string[] | null;
}

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeOwnerId: string; // Pass store owner ID for adding to cart
}

export function ProductDetailDialog({ product, isOpen, onOpenChange, storeOwnerId }: ProductDetailDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0); // Reset image index when dialog opens
    }
  }, [isOpen, product]);

  if (!product) {
    return null; // Don't render if no product is provided
  }

  const images = product.image_urls || [];
  const hasMultipleImages = images.length > 1;

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
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_urls?.[0], // Use the first image for cart display
      storeOwnerId: storeOwnerId,
    });
    onOpenChange(false); // Close dialog after adding to cart
  };

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
              <span className="text-4xl font-extrabold text-primary">Rs{product.price.toFixed(2)}</span>
              <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">
                {product.stock} in stock
              </Badge>
            </div>
            <Button
              className="w-full py-6 text-lg flex items-center gap-2 font-semibold"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
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