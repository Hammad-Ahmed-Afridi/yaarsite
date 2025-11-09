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
import { ChevronLeft, ChevronRight, ShoppingCart, Image as ImageIcon, Ruler, Minus, Plus, Check, Shirt } from 'lucide-react'; // Added Shirt icon
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

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string; // Owner of the product
  image_urls: string[] | null;
  original_price: number | null;
  discount_percentage: number | null;
  discount_start_date: string | null;
  discount_end_date: string | null;
  size_chart_url: string | null;
  available_colors: string[] | null;
  available_sizes: string[] | null; // New: available_sizes
}

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeOwnerId: string; // Pass store owner ID for adding to cart
}

export function ProductDetailDialog({ product, isOpen, onOpenChange, storeOwnerId }: ProductDetailDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined); // New state for selected size
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false); // New state for description toggle

  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setSelectedColor(product?.available_colors?.[0] || undefined);
      setSelectedSize(product?.available_sizes?.[0] || undefined); // Initialize selected size
      setQuantity(1);
      setShowFullDescription(false); // Reset description toggle
    }
  }, [isOpen, product]);

  if (!product) {
    return null;
  }

  const images = product.image_urls || [];
  const hasMultipleImages = images.length > 1;
  const hasColors = (product.available_colors !== null && product.available_colors.length > 0);
  const hasSizes = (product.available_sizes !== null && product.available_sizes.length > 0); // New: check for available sizes
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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > product.stock) newQuantity = product.stock;
    setQuantity(newQuantity);
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
    if (hasSizes && !selectedSize) { // New: Validate size selection
      toast.error("Please select a size.");
      return;
    }
    if (quantity > product.stock) {
      toast.error(`Cannot add more than available stock (${product.stock} in stock).`);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_urls?.[0],
      storeOwnerId: storeOwnerId,
      stock: product.stock,
      selected_color: selectedColor,
      selected_size: selectedSize, // Pass the selected size
    }, quantity);
    onOpenChange(false);
  };

  const isDiscountActive = product.discount_percentage && product.discount_start_date && product.discount_end_date &&
                           new Date(product.discount_start_date) <= new Date() && new Date(product.discount_end_date) >= new Date();

  const shortDescription = product.description?.substring(0, 150) + (product.description && product.description.length > 150 ? '...' : '');
  const canToggleDescription = product.description && product.description.length > 150;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[900px] max-w-[90vw] max-h-[90vh] flex flex-col overflow-y-auto overflow-x-hidden font-sans p-4 sm:p-6">
        <div className="flex flex-col h-full"> {/* New wrapper div */}
          <DialogHeader className="mb-4 flex-shrink-0">
            <DialogTitle className="text-3xl font-bold tracking-tight break-words">{product.name}</DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-muted-foreground break-words">Product details</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <div className="flex flex-col gap-4">
                <div className="relative w-full h-[400px] md:h-[500px] bg-muted rounded-xl overflow-hidden flex items-center justify-center shadow-md">
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
                  <div className="flex gap-2 justify-center flex-wrap"> {/* Added flex-wrap here for thumbnails */}
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2", // Larger thumbnails
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
              <div className="space-y-6 w-full min-w-0"> {/* Added min-w-0 here */}
                <h3 className="text-3xl font-bold tracking-tight break-words">{product.name}</h3>
                
                {/* Price and Stock */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  <div className="space-y-1">
                    <Badge className="bg-green-500 text-white text-base px-3 py-1 font-medium">
                      {product.discount_percentage}% OFF!
                    </Badge>
                    <p className="text-sm text-muted-foreground break-words">
                      Valid from {format(new Date(product.discount_start_date!), "PPP")} to {format(new Date(product.discount_end_date!), "PPP")}
                    </p>
                  </div>
                )}

              {/* Description */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-lg leading-relaxed break-words">
                  {showFullDescription ? product.description : shortDescription}
                </p>
                {canToggleDescription && (
                  <Button variant="link" onClick={() => setShowFullDescription(!showFullDescription)} className="p-0 h-auto text-primary">
                    {showFullDescription ? "Read Less" : "Read More"}
                  </Button>
                )}
              </div>

              {/* Color Selection */}
              {hasColors && (
                <div className="space-y-2 pl-2"> {/* Changed pl-4 to pl-2 */}
                  <Label className="text-base font-medium">Select Color:</Label>
                  <RadioGroup
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                    className="flex flex-wrap gap-3"
                  >
                    {product.available_colors?.map((color) => (
                      <div key={color} className="flex items-center">
                        <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                        <Label
                          htmlFor={`color-${color}`}
                          className={cn(
                            "relative w-10 h-10 rounded-full border-2 cursor-pointer flex items-center justify-center",
                            "peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:ring-offset-2",
                            "hover:ring-1 hover:ring-muted-foreground transition-all duration-200",
                            // Fallback border for light colors, or if color name isn't a valid CSS color
                            (color.toLowerCase() === 'white' || color.toLowerCase() === 'lightgray' || color.toLowerCase() === 'yellow') ? 'border-gray-300' : 'border-transparent'
                          )}
                          style={{ backgroundColor: color.toLowerCase() }} // Use color name as background
                          title={color} // Show color name on hover
                        >
                          {selectedColor === color && (
                            <Check className="h-5 w-5 text-white drop-shadow-sm" /> // Checkmark for selected color
                          )}
                          <span className="sr-only">{color}</span> {/* Screen reader text */}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Size Selection */}
              {hasSizes && (
                <div className="space-y-2 pl-2"> {/* Changed pl-4 to pl-2 */}
                  <Label className="text-base font-medium">Select Size:</Label>
                  <RadioGroup
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                    className="flex flex-wrap gap-3"
                  >
                    {product.available_sizes?.map((size) => (
                      <div key={size} className="flex items-center">
                        <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${size}`}
                          className={cn(
                            "relative w-12 h-12 rounded-md border-2 cursor-pointer flex items-center justify-center text-base font-semibold",
                            "peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:ring-offset-2",
                            "hover:bg-muted transition-all duration-200"
                          )}
                        >
                          {size}
                          {selectedSize === size && (
                            <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                          )}
                          <span className="sr-only">{size}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-base font-medium">Quantity:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || product.stock <= 0}
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
                    max={product.stock}
                    disabled={product.stock <= 0}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock || product.stock <= 0}
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
                  <AlertDialogContent className="w-full max-w-3xl max-w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden"> {/* Added overflow-x-hidden here */}
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-bold break-words">Size Chart</AlertDialogTitle>
                      <AlertDialogDescription className="break-words">
                        Refer to this chart to find your perfect size.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="relative w-full h-[50vh] max-h-[70vh] flex items-center justify-center bg-muted rounded-md overflow-hidden">
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
            </div>
          </div>
          </div>
          <Button
            className={cn(
              "w-full py-6 text-lg flex items-center gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 mt-6 flex-shrink-0"
            )}
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || (hasColors && !selectedColor) || (hasSizes && !selectedSize)}
          >
            <ShoppingCart className="h-5 w-5" />
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div> {/* Closing tag for new wrapper div */}
      </DialogContent>
    </Dialog>
  );
}