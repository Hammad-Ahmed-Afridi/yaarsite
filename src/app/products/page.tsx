"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, ArrowLeft, LogOut, Store, Loader2, Trash2 } from 'lucide-react';
import { useSession } from '@/components/session-context-provider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AddProductDialog } from '@/components/add-product-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog'; // Import EditProductDialog
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string; // Add user_id to Product interface
  image_urls: string[] | null;
  created_at: string;
}

const PRODUCT_LIMIT = 3; // Define the product limit

export default function ProductsPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
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
      // 1. Delete images from storage if they exist
      if (imageUrls && imageUrls.length > 0 && user) {
        const imagePaths = imageUrls.map(url => {
          const path = url.split('product-images/')[1];
          return path;
        }).filter(Boolean) as string[]; // Filter out any undefined paths

        if (imagePaths.length > 0) {
          const { error: deleteStorageError } = await supabase.storage
            .from('product-images')
            .remove(imagePaths);

          if (deleteStorageError) {
            console.warn("Failed to delete product images from storage:", deleteStorageError.message);
            // Don't throw, proceed with database deletion
          }
        }
      }

      // 2. Delete product from database
      const { error: deleteDbError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user?.id); // Ensure only owner can delete

      if (deleteDbError) {
        throw new Error(`Failed to delete product: ${deleteDbError.message}`);
      }

      toast.success("Product deleted successfully!");
      fetchProducts(); // Refresh the list of products
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product. Please try again.");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-foreground">Loading products...</p>
      </div>
    );
  }

  const isAddProductDisabled = products.length >= PRODUCT_LIMIT;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">quick</h1>
            {profile?.tenant_slug && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                ID: {profile.tenant_slug}
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Product Management</h2>
          <AddProductDialog onProductAdded={fetchProducts} currentProductCount={products.length} />
        </div>
        <p className="text-muted-foreground mb-6">
          {products.length}/{PRODUCT_LIMIT} products used
          {isAddProductDisabled && (
            <span className="ml-2 text-destructive"> (Maximum limit reached)</span>
          )}
        </p>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg p-8">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">No Products Yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first product to start selling! You can add up to {PRODUCT_LIMIT} products.
            </p>
            <AddProductDialog onProductAdded={fetchProducts} currentProductCount={products.length} />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="bg-card text-card-foreground shadow-md">
                {product.image_urls && product.image_urls.length > 0 && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
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
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description || "No description."}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">Rs{product.price.toFixed(2)}</span>
                    <Badge variant="secondary">{product.stock} in stock</Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <EditProductDialog product={product} onProductUpdated={fetchProducts} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your product
                            and remove its data and images from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id, product.image_urls)}
                            disabled={isDeletingProduct}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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