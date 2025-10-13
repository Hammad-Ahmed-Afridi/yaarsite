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
import { ChevronLeft, ChevronRight, ShoppingCart, Image as ImageIcon, Ruler, Minus, Plus, Check } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setSelectedColor(product?.available_colors?.[0] || undefined);
      setQuantity(1);
      setShowFullDescription(false);
    }
  }, [isOpen, product]);

  if (!product) {
    return null;
  }

  const images = product.image_urls || [];
  const hasMultipleImages = images.length > 1;
  const hasColors = (product.available_colors !== null && product.available_colors.length > 0);
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
      selected_size_input: undefined,
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
        <React.Fragment>
          <DialogHeader className="mb-3 flex-shrink-0"> {/* Reduced mb */}
            <DialogTitle className="text-2xl font-bold tracking-tight break-words">{product.name}</DialogTitle> {/* Reduced text size */}
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground break-words">Product details</DialogDescription> {/* Reduced text size */}
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="grid md:grid-cols-2 gap-6"> {/* Reduced gap */}
              {/* Image Gallery */}
              <div className="flex flex-col gap-3"> {/* Reduced gap */}
                <div className="relative w-full h-[300px] md:h-[400px] bg-muted rounded-xl overflow-hidden flex items-center justify-center shadow-md"> {/* Reduced height */}
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 rounded-full z-10 h-8 w-8" // Reduced button size
                            onClick={handlePrevImage}
                          >
                            <ChevronLeft className="h-4 w-4" /> {/* Reduced icon size */}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 rounded-full z-10 h-8 w-8" // Reduced button size
                            onClick={handleNextImage}
                          >
                            <ChevronRight className="h-4 w-4" /> {/* Reduced icon size */}
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <ImageIcon className="h-20 w-20 text-muted-foreground" /> {/* Reduced icon size */}
                  )}
                </div>
                {hasMultipleImages && (
                  <div className="flex gap-1 justify-center"> {/* Reduced gap */}
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2", // Reduced thumbnail size
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
              <div className="space-y-4 w-full"> {/* Reduced space-y */}
                <h3 className="text-2xl font-bold tracking-tight break-words">{product.name}</h3> {/* Reduced text size */}
                
                {/* Price and Stock */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"> {/* Reduced gap */}
                  {isDiscountActive && product.original_price !== null ? (
                    <div className="flex items-baseline gap-1"> {/* Reduced gap */}
                      <span className="text-base text-muted-foreground line-through">Rs{product.original_price.toFixed(2)}</span> {/* Reduced text size */}
                      <span className="text-3xl font-extrabold text-primary">Rs{product.price.toFixed(2)}</span> {/* Reduced text size */}
                    </div>
                  ) : (
                    <span className="text-3xl font-extrabold text-primary">Rs{product.price.toFixed(2)}</span> {/* Reduced text size */}
                  )}
                  <Badge variant="secondary" className="text-sm px-3 py-1 font-medium"> {/* Reduced badge size */}
                    {product.stock} in stock
                  </Badge>
                </div>
                {isDiscountActive && (
                  <div className="space-y-1">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 font-medium"> {/* Reduced badge size */}
                      {product.discount_percentage}% OFF!
                    </Badge>
                    <p className="text-xs text-muted-foreground break-words"> {/* Reduced text size */}
                      Valid from {format(new Date(product.discount_start_date!), "PPP")} to {format(new Date(product.discount_end_date!), "PPP")}
                    </p>
                  </div>
                )}

              {/* Description */}
              <div className="space-y-1"> {/* Reduced space-y */}
                <p className="text-sm text-muted-foreground leading-relaxed break-words"> {/* Reduced text size */}
                  {showFullDescription ? product.description : shortDescription}
                </p>
                {canToggleDescription && (
                  <Button variant="link" onClick={() => setShowFullDescription(!showFullDescription)} className="p-0 h-auto text-primary text-sm"> {/* Reduced text size */}
                    {showFullDescription ? "Read Less" : "Read More"}
                  </Button>
                )}
              </div>

              {/* Color Selection */}
              {hasColors && (
                <div className="space-y-1"> {/* Reduced space-y */}
                  <Label className="text-sm font-medium">Select Color:</Label> {/* Reduced text size */}
                  <RadioGroup
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                    className="flex flex-wrap gap-2" {/* Reduced gap */}
                  >
                    {product.available_colors?.map((color) => (
                      <div key={color} className="flex items-center">
                        <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                        <Label
                          htmlFor={`color-${color}`}
                          className={cn(
                            "relative w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center", // Reduced swatch size
                            "peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:ring-offset-2",
                            "hover:ring-1 hover:ring-muted-foreground transition-all duration-200",
                            // Fallback border for light colors, or if color name isn't a valid CSS color
                            (color.toLowerCase() === 'white' || color.toLowerCase() === 'lightgray' || color.toLowerCase() === 'yellow') ? 'border-gray-300' : 'border-transparent'
                          )}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <Check className="h-4 w-4 text-white drop-shadow-sm" /> {/* Reduced icon size */}
                          )}
                          <span className="sr-only">{color}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-1"> {/* Reduced space-y */}
                <Label htmlFor="quantity" className="text-sm font-medium">Quantity:</Label> {/* Reduced text size */}
                <div className="flex items-center gap-1"> {/* Reduced gap */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7" // Reduced button size
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || product.stock <= 0}
                  >
                    <Minus className="h-3 w-3" /> {/* Reduced icon size */}
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    className="w-16 text-center text-sm" // Reduced input width and text size
                    min="1"
                    max={product.stock}
                    disabled={product.stock <= 0}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7" // Reduced button size
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock || product.stock <= 0}
                  >
                    <Plus className="h-3 w-3" /> {/* Reduced icon size */}
                  </Button>
                </div>
              </div>

              {/* Size Chart */}
              {hasSizeChart && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center gap-2 font-semibold text-sm py-2 h-auto"> {/* Reduced button size and padding */}
                      <Ruler className="h-4 w-4" /> View Size Chart
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-full max-w-3xl max-w-[90vw] max-h-[90vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold break-words">Size Chart</AlertDialogTitle> {/* Reduced text size */}
                      <AlertDialogDescription className="text-sm break-words"> {/* Reduced text size */}
                        Refer to this chart to find your perfect size.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="relative w-full h-auto max-h-[70vh] flex items-center justify-center bg-muted rounded-md overflow-hidden">
                      <Image
                        src={product.size_chart_url!}
                        alt="Size Chart"
                        fill
                        style={{ objectFit: 'contain' }}
                        className="object-center"
                      />
                    </div>
                    <AlertDialogAction className="w-full font-semibold text-sm py-2 h-auto">Close</AlertDialogAction> {/* Reduced button size */}
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <Button
            className={cn(
              "w-full py-3 text-base flex items-center gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 mt-4 flex-shrink-0" // Reduced button size and padding
            )}
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || (hasColors && !selectedColor)}
          >
            <ShoppingCart className="h-4 w-4" /> {/* Reduced icon size */}
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </React.Fragment>
      </DialogContent>
    </Dialog>
  );
}