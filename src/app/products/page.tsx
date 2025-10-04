"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, Trash2, ArrowLeft, Percent } from 'lucide-react'; // Import ArrowLeft and Percent
import { useSession } from '@/components/session-context-provider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AddProductDialog } from '@/components/add-product-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { DiscountDialog } from '@/components/discount-dialog'; // Import DiscountDialog
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DashboardHeader } from '@/components/dashboard-header';
import { AppLoader } from '@/components/app-loader';
import Link from 'next/link'; // Import Link

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
  category: string | null;
  original_price: number | null; // New: original_price
  discount_percentage: number | null; // New: discount_percentage
  discount_end_date: string | null; // New: discount_end_date
  created_at: string;
}

const PRODUCT_LIMIT = 2; // Changed from 3 to 2

export default function ProductsPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setIsLoadingProducts(false);
      return;
    }
    setIsLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products.");
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setIsLoadingProducts(false);
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchProducts();
    }
  }, [isSessionLoading, user, fetchProducts]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
      toast.success("Signed out successfully!");
      router.push('/login');
    }
  };

  const handleDeleteProduct = async (productId: string, imageUrls: string[] | null) => {
    setIsDeletingProduct(true);
    try {
      if (imageUrls && imageUrls.length > 0 && user) {
        const imagePaths = imageUrls.map(url => {
          const path = url.split('product-images/')[1];
          return path;
        }).filter(Boolean) as string[];

        if (imagePaths.length > 0) {
          const { error: deleteStorageError } = await supabase.storage
            .from('product-images')
            .remove(imagePaths);

          if (deleteStorageError) {
            console.warn("Failed to delete product images from storage:", deleteStorageError.message);
          }
        }
      }

      const { error: deleteDbError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user?.id);

      if (deleteDbError) {
        throw new Error(`Failed to delete product: ${deleteDbError.message}`);
      }

      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product. Please try again.");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  if (isLoadingProducts) {
    return (
      <AppLoader message="Loading products..." />
    );
  }

  const isAddProductDisabled = products.length >= PRODUCT_LIMIT;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} /> {/* Removed currentPath */}

      <main className="flex-1 p-4 sm:p-8"> {/* Adjusted padding */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Product Management</h2>
        </div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground text-base leading-relaxed">
            {products.length}/{PRODUCT_LIMIT} products used
            {isAddProductDisabled && (
              <span className="ml-2 text-destructive"> (Maximum limit reached)</span>
            )}
          </p>
          <div className="flex gap-2">
            {/* Dedicated button for DiscountDialog */}
            <DiscountDialog products={products} onDiscountApplied={fetchProducts}>
              <Button className="flex items-center gap-2 font-semibold" variant="outline">
                <Percent className="h-4 w-4" /> Apply Discount
              </Button>
            </DiscountDialog>
            <AddProductDialog onProductAdded={fetchProducts} currentProductCount={products.length} />
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-3xl p-8">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4 font-semibold">No Products Yet</p>
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              Add your first product to start selling! You can add up to {PRODUCT_LIMIT} products.
            </p>
            <AddProductDialog onProductAdded={fetchProducts} currentProductCount={products.length} />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="bg-card text-card-foreground shadow-md rounded-3xl">
                {product.image_urls && product.image_urls.length > 0 && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
                    <Image
                      src={product.image_urls[0]}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description || "No description."}</p>
                  <div className="flex items-center justify-between">
                    {product.discount_percentage && product.discount_end_date && new Date(product.discount_end_date) > new Date() ? (
                      <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground line-through">Rs{product.original_price?.toFixed(2) || product.price.toFixed(2)}</span>
                        <span className="text-xl font-bold text-destructive">Rs{product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold">Rs{product.price.toFixed(2)}</span>
                    )}
                    <Badge variant="secondary" className="font-medium">{product.stock} in stock</Badge>
                  </div>
                  {product.discount_percentage && product.discount_end_date && new Date(product.discount_end_date) > new Date() && (
                    <Badge className="bg-green-500 text-white font-medium">
                      {product.discount_percentage}% OFF!
                    </Badge>
                  )}
                  {product.category && (
                    <Badge variant="outline" className="mt-2 font-medium text-xs">
                      {product.category}
                    </Badge>
                  )}
                  <div className="flex gap-2 mt-4">
                    <EditProductDialog product={product} onProductUpdated={fetchProducts} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1 font-semibold">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg font-semibold">Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-base leading-relaxed">
                            This action cannot be undone. This will permanently delete your product
                            and remove its data and images from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id, product.image_urls)}
                            disabled={isDeletingProduct}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                          >
                            {isDeletingProduct ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}