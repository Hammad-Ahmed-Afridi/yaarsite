"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const imageUrl = product.image_urls?.[0];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 space-y-2">
        <CardTitle className="text-lg font-semibold line-clamp-2">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3">{product.description || "No description available."}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-primary">Rs{product.price.toFixed(2)}</span>
          <Badge variant="secondary">{product.stock} in stock</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => onViewDetails(product)}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? "Out of Stock" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}