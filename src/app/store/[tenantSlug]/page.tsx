"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useCart } from '@/components/cart-context-provider';
import { ProductDetailDialog } from '@/components/product-detail-dialog';
import { AppLoader } from '@/components/app-loader';
import { useStoreProfile } from '@/components/store-profile-context-provider'; // Import useStoreProfile

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
}

export default function StoreProductsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const { storeProfile: profile, setStoreProfile } = useStoreProfile(); // Use context
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchStoreProducts() {
      setIsLoading(true);
      setError(null);

      if (!profile) {
        // If profile is not yet available from context, wait for it or show error
        setError("Store profile not found. Please try refreshing the page.");
        setIsLoading(false);
        return;
      }

      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', profile.id); // Use profile.id from context

        if (productsError) {
          setError("Could not load products for this store.");
          setIsLoading(false);
          return;
        }
        setProducts(productsData || []);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreProducts();
  }, [profile]); // Depend on profile from context

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AppLoader message="Loading products..." isFullScreen={false} />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-3xl font-bold text-destructive mb-4 tracking-tight">Error</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Found</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">The store you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <h2 className="text-2xl font-bold mb-4 tracking-tight">Our Products</h2>
      {profile?.store_page_welcome_message && (
        <p className="text-lg text-muted-foreground mb-6 text-center max-w-prose mx-auto leading-relaxed">
          {profile.store_page_welcome_message}
        </p>
      )}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-4 font-semibold">No products available yet.</p>
          <p className="text-base text-muted-foreground leading-relaxed">Check back later or contact the store owner.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="bg-card text-card-foreground shadow-md cursor-pointer rounded-3xl" onClick={() => handleProductClick(product)}>
              {product.image_urls && product.image_urls.length > 0 ? (
                <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative h-48 w-full overflow-hidden rounded-t-3xl bg-muted flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description || "No description available."}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">Rs{product.price.toFixed(2)}</span>
                  <Badge variant="secondary" className="font-medium">{product.stock} in stock</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedProduct && profile && (
        <ProductDetailDialog
          product={selectedProduct}
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          storeOwnerId={profile.id}
        />
      )}
    </div>
  );
}