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

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string; // Owner of the product
  image_urls: string[] | null;
}

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  store_url: string | null;
  avatar_url: string | null;
  store_page_welcome_message: string | null; // New field
}

export default function StoreProductsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchStoreData() {
      setIsLoading(true);
      setError(null);
      if (!tenantSlug) {
        setError("Store not found: Missing tenant slug.");
        setIsLoading(false);
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, store_page_welcome_message')
          .eq('tenant_slug', tenantSlug)
          .single();

        if (profileError || !profileData) {
          setError("Store not found or an error occurred.");
          setIsLoading(false);
          return;
        }
        setProfile(profileData);

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', profileData.id);

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

    fetchStoreData();
  }, [tenantSlug]);

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <>
      {profile?.store_page_welcome_message && (
        <div className="mb-8 p-4 bg-muted rounded-lg text-center">
          <p className="text-lg text-muted-foreground">{profile.store_page_welcome_message}</p>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">Our Products</h2>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-4">No products available yet.</p>
          <p className="text-sm text-muted-foreground">Check back later or contact the store owner.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="bg-card text-card-foreground shadow-md cursor-pointer" onClick={() => handleProductClick(product)}>
              {product.image_urls && product.image_urls.length > 0 ? (
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description || "No description available."}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">Rs{product.price.toFixed(2)}</span>
                  <Badge variant="secondary">{product.stock} in stock</Badge>
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
    </>
  );
}