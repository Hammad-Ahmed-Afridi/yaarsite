"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/app-loader';
import { Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useStoreProfile } from '@/components/store-profile-context-provider';
import { ProductCard } from '@/components/product-card'; // New component
import { ProductDetailDialog } from '@/components/product-detail-dialog'; // Existing component

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
  const { storeProfile: profile } = useStoreProfile();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    console.log("StoreProductsPage: Attempting to fetch products.");
    if (!profile?.id) {
      console.warn("StoreProductsPage: Profile ID is missing, cannot fetch products.");
      setIsLoadingProducts(false);
      setError("Store owner information is missing. Cannot load products.");
      return;
    }
    setIsLoadingProducts(true);
    setError(null);

    console.log("StoreProductsPage: Fetching products for user_id:", profile.id);
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("StoreProductsPage: Error fetching products:", fetchError);
      setError(`Failed to load products: ${fetchError.message}.`);
      setProducts([]);
    } else {
      console.log("StoreProductsPage: Products fetched:", data);
      setProducts(data || []);
    }
    setIsLoadingProducts(false);
  }, [profile]);

  useEffect(() => {
    console.log("StoreProductsPage: useEffect triggered. Profile:", profile, "isLoadingProducts:", isLoadingProducts);
    if (profile) {
      fetchProducts();
    } else if (!profile && !isLoadingProducts) {
      // If profile is null and we're not loading, it means the layout couldn't find the store
      console.error("StoreProductsPage: Profile is null after layout loading, indicating store not found or error.");
      setError("Store profile not found. Please ensure the store slug is correct and the store exists.");
    }
  }, [profile, fetchProducts, isLoadingProducts]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  if (isLoadingProducts) {
    return <AppLoader message="Loading products..." isFullScreen={false} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Store Not Found</h1>
        <p className="text-lg text-muted-foreground">The store you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        {profile.store_page_welcome_message || `Welcome to ${profile.tenant_name}'s Store!`}
      </h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg p-8">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-4">No Products Available</p>
          <p className="text-sm text-muted-foreground mb-6">
            This store currently has no products listed. Please check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}

      {selectedProduct && (
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