"use client";

import React, { useEffect, useState, useMemo } from 'react';
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
import { useStoreProfile } from '@/components/store-profile-context-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
  category: string | null; // New: category field
}

export default function StoreProductsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const { storeProfile: profile } = useStoreProfile();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all'); // New: state for category filter

  useEffect(() => {
    async function fetchStoreProducts() {
      setIsLoading(true);
      setError(null);

      if (!profile) {
        setError("Store profile not found. Please try refreshing the page.");
        setIsLoading(false);
        return;
      }

      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', profile.id);

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
  }, [profile]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  // Group products by category
  const categorizedProducts = useMemo(() => {
    const categories: { [key: string]: Product[] } = {};
    products.forEach(product => {
      const categoryName = product.category || 'No Category';
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(product);
    });
    return categories;
  }, [products]);

  const uniqueCategories = useMemo(() => {
    const categories = Object.keys(categorizedProducts);
    // Sort categories alphabetically, putting 'No Category' last
    return categories.sort((a, b) => {
      if (a === 'No Category') return 1;
      if (b === 'No Category') return -1;
      return a.localeCompare(b);
    });
  }, [categorizedProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategoryFilter === 'all') {
      return products;
    }
    return categorizedProducts[selectedCategoryFilter] || [];
  }, [products, categorizedProducts, selectedCategoryFilter]);

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
    <div className="font-sans p-4 sm:p-0"> {/* Adjusted padding */}
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
        <>
          <div className="mb-8 flex justify-start">
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-[180px] font-medium">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Products</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category} className="font-medium">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-4 font-semibold">No products in this category.</p>
              <p className="text-base text-muted-foreground leading-relaxed">Please select another category or view all products.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Adjusted grid for mobile */}
              {filteredProducts.map((product) => (
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
                    {product.category && (
                      <Badge variant="outline" className="mt-2 font-medium text-xs">
                        {product.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
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