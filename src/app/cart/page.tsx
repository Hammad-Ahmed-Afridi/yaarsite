"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCart } from '@/components/cart-context-provider';
import { ArrowLeft, Trash2, ShoppingCart, Minus, Plus, Store } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppLoader } from '@/components/app-loader'; // Import AppLoader

interface StoreInfo {
  tenant_name: string;
  tenant_slug: string;
}

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, itemCount, getStoreCartTotal, getStoreItemCount, getStoreIdsInCart } = useCart();
  const [storeInfoMap, setStoreInfoMap] = useState<Record<string, StoreInfo>>({});
  const [isLoadingStoreInfo, setIsLoadingStoreInfo] = useState(true);
  const isMobile = useIsMobile();

  const storeOwnerIdsInCart = getStoreIdsInCart();

  useEffect(() => {
    async function fetchStoreNames() {
      setIsLoadingStoreInfo(true);
      const newStoreInfoMap: Record<string, StoreInfo> = {};
      for (const storeOwnerId of storeOwnerIdsInCart) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_name, tenant_slug')
          .eq('id', storeOwnerId)
          .single();

        if (profileError || !profileData) {
          console.error(`Error fetching store info for ${storeOwnerId}:`, profileError);
          newStoreInfoMap[storeOwnerId] = { tenant_name: "Unknown Store", tenant_slug: "store" }; // Fallback
        } else {
          newStoreInfoMap[storeOwnerId] = {
            tenant_name: profileData.tenant_name || "Unnamed Store",
            tenant_slug: profileData.tenant_slug || "store",
          };
        }
      }
      setStoreInfoMap(newStoreInfoMap);
      setIsLoadingStoreInfo(false);
    }

    if (storeOwnerIdsInCart.length > 0) {
      fetchStoreNames();
    } else {
      setStoreInfoMap({});
      setIsLoadingStoreInfo(false);
    }
  }, [storeOwnerIdsInCart]);

  const handleUpdateQuantity = (storeOwnerId: string, productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(storeOwnerId, productId);
    } else {
      updateQuantity(storeOwnerId, productId, newQuantity);
    }
  };

  const handleRemoveItem = (storeOwnerId: string, productId: string) => {
    removeFromCart(storeOwnerId, productId);
  };

  // Determine "Continue Shopping" path
  const continueShoppingPath = storeOwnerIdsInCart.length === 1 && storeInfoMap[storeOwnerIdsInCart[0]]
    ? `/store/${storeInfoMap[storeOwnerIdsInCart[0]].tenant_slug}`
    : '/store'; // Generic store page if multiple or none

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Your Shopping Cart ({itemCount} items)</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {itemCount === 0 ? ( // Check overall itemCount
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg p-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty.</p>
            <p className="text-sm text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild>
              <Link href="/store">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {isLoadingStoreInfo ? (
                <AppLoader message="Loading cart details..." isFullScreen={false} />
              ) : (
                Object.entries(cartItems).map(([storeOwnerId, items]) => {
                  const storeInfo = storeInfoMap[storeOwnerId];
                  if (!storeInfo) return null; // Should not happen if fetchStoreNames works

                  return (
                    <Card key={storeOwnerId} className="bg-card text-card-foreground shadow-md">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary" />
                          <Link href={`/store/${storeInfo.tenant_slug}`} className="hover:underline">
                            {storeInfo.tenant_name}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          Total: Rs{getStoreCartTotal(storeOwnerId).toFixed(2)} ({getStoreItemCount(storeOwnerId)} items)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isMobile ? (
                          <div className="grid gap-4">
                            {items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                {item.image_url && (
                                  <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    style={{ objectFit: 'cover' }}
                                    className="rounded-md flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 space-y-1">
                                  <CardTitle className="text-lg">{item.name}</CardTitle>
                                  <p className="text-muted-foreground">Price: Rs{item.price.toFixed(2)}</p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleUpdateQuantity(storeOwnerId, item.id, item.quantity - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateQuantity(storeOwnerId, item.id, parseInt(e.target.value))}
                                      className="w-16 text-center"
                                      min="1"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleUpdateQuantity(storeOwnerId, item.id, item.quantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <p className="font-semibold">Total: Rs{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleRemoveItem(storeOwnerId, item.id)}
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[100px]">Product</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead className="text-center">Quantity</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {items.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      {item.image_url && (
                                        <Image
                                          src={item.image_url}
                                          alt={item.name}
                                          width={64}
                                          height={64}
                                          style={{ objectFit: 'cover' }}
                                          className="rounded-md"
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>Rs{item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={() => handleUpdateQuantity(storeOwnerId, item.id, item.quantity - 1)}
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                          type="number"
                                          value={item.quantity}
                                          onChange={(e) => handleUpdateQuantity(storeOwnerId, item.id, parseInt(e.target.value))}
                                          className="w-16 text-center"
                                          min="1"
                                        />
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={() => handleUpdateQuantity(storeOwnerId, item.id, item.quantity + 1)}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">Rs{(item.price * item.quantity).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemoveItem(storeOwnerId, item.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Items:</span>
                    <span>{itemCount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Subtotal:</span>
                    <span>Rs{cartTotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" onClick={() => router.push('/checkout')} disabled={itemCount === 0}>
                    Proceed to Checkout
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={continueShoppingPath}>Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}