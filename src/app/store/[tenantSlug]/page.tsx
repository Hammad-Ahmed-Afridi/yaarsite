"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Store, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { MadeWithDyad } from '@/components/made-with-dyad';
import Image from 'next/image';
import { useCart } from '@/components/cart-context-provider'; // Import useCart

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
}

export default function PublicStorePage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, itemCount } = useCart(); // Use cart context

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
        // Fetch tenant profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('tenant_slug', tenantSlug)
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching profile:", profileError);
          setError("Store not found or an error occurred.");
          setIsLoading(false);
          return;
        }
        setProfile(profileData);

        // Fetch products for this tenant's user_id
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', profileData.id); // Use the user_id from the fetched profile

        if (productsError) {
          console.error("Error fetching products:", productsError);
          setError("Could not load products for this store.");
          setIsLoading(false);
          return;
        }
        setProducts(productsData || []);

      } catch (err) {
        console.error("Unexpected error fetching store data:", err);
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreData();
  }, [tenantSlug]);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }
    if (!profile) {
      toast.error("Cannot add to cart: Store information missing.");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_urls?.[0],
      storeOwnerId: profile.id, // Pass the store owner's ID
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Loading store...</p>
      </div>
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
          <Store className="h-6 w-6 text-primary" />
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
              <Card key={product.id} className="bg-card text-card-foreground shadow-md">
                {product.image_urls && product.image_urls.length > 0 && ( // Ensure image_urls exists and is not empty
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image_urls[0]}
                      alt={product.name}
                      fill // Updated prop
                      style={{ objectFit: 'cover' }} // Updated prop
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{product.description || "No description available."}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">Rs{product.price.toFixed(2)}</span>
                    <Badge variant="secondary">{product.stock} in stock</Badge>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <MadeWithDyad />
    </div>
  );
}