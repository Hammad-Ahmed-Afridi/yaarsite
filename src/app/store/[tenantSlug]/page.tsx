"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Store, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { MadeWithDyad } from '@/components/made-with-dyad';
import Image from 'next/image';
import { useCart } from '@/components/cart-context-provider';
import { ProductDetailDialog } from '@/components/product-detail-dialog';
import { AppLoader } from '@/components/app-loader'; // Import AppLoader

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
}

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  store_url: string | null;
  avatar_url: string | null; // Added avatar_url to Profile interface
}

export default function PublicStorePage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { itemCount } = useCart();

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchStoreData() {
      console.log("PublicStorePage: Starting fetchStoreData for tenantSlug:", tenantSlug);
      setIsLoading(true);
      setError(null);
      if (!tenantSlug) {
        console.error("PublicStorePage: Missing tenant slug.");
        setError("Store not found: Missing tenant slug.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("PublicStorePage: Fetching profile for tenantSlug:", tenantSlug);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('tenant_slug', tenantSlug)
          .single();

        if (profileError || !profileData) {
          console.error("PublicStorePage: Error fetching profile:", profileError);
          setError("Store not found or an error occurred.");
          setIsLoading(false);
          return;
        }
        setProfile(profileData);
        console.log("PublicStorePage: Profile fetched:", profileData);

        console.log("PublicStorePage: Fetching products for user_id:", profileData.id);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', profileData.id);

        if (productsError) {
          console.error("PublicStorePage: Error fetching products:", productsError);
          setError("Could not load products for this store.");
          setIsLoading(false);
          return;
        }
        setProducts(productsData || []);
        console.log("PublicStorePage: Products fetched:", productsData);

      } catch (err: any) {
        console.error("PublicStorePage: Unexpected error fetching store data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        console.log("PublicStorePage: Finished fetchStoreData. Setting isLoading to false.");
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
      <AppLoader message="Loading store..." />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.href = '/'} className="mt-6">Go to Dashboard</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Store Not Found</h1>
        <p className="text-lg text-muted-foreground">The store you are looking for does not exist.</p>
        <Button onClick={() => window.location.href = '/'} className="mt-6">Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          {profile?.avatar_url ? (
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              <Image
                src={profile.avatar_url}
                alt="Store Logo"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-full"
              />
            </div>
          ) : (
            <Store className="h-6 w-6 text-primary" />
          )}
          <h1 className="text-xl font-bold">{profile.tenant_name || "Public Store"}</h1>
        </div>
        <Button onClick={() => router.push('/cart')} variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full">
              {itemCount}
            </Badge>
          )}
          <span className="ml-2">Cart</span>
        </Button>
      </header>

      {/* Main Content - Product Grid */}
      <main className="flex-1 p-8">
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
      </main>
      <MadeWithDyad />

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