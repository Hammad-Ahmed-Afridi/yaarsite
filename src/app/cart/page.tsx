"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCart } from '@/components/cart-context-provider';
import { ArrowLeft, Trash2, ShoppingCart, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook

const DELIVERY_CHARGE = 200; // Define delivery charge here

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();
  const [storeTenantSlug, setStoreTenantSlug] = useState<string | null>(null);
  const [isLoadingStoreSlug, setIsLoadingStoreSlug] = useState(true);
  const isMobile = useIsMobile(); // Use the hook

  useEffect(() => {
    async function fetchStoreSlug() {
      setIsLoadingStoreSlug(true);
      if (cartItems.length > 0) {
        // Assuming all items in the cart belong to the same store owner
        const storeOwnerId = cartItems[0].storeOwnerId;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_slug')
          .eq('id', storeOwnerId)
          .single();

        if (profileError || !profileData?.tenant_slug) {
          console.error("Error fetching store tenant slug:", profileError);
          setStoreTenantSlug(null); // Fallback to generic store if error
        } else {
          setStoreTenantSlug(profileData.tenant_slug);
        }
      } else {
        setStoreTenantSlug(null); // No items, no specific store slug
      }
      setIsLoadingStoreSlug(false);
    }

    fetchStoreSlug();
  }, [cartItems]); // Re-fetch when cartItems change

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const continueShoppingPath = storeTenantSlug ? `/store/${storeTenantSlug}` : '/store';
  const totalWithDelivery = cartTotal + DELIVERY_CHARGE; // Calculate total including delivery charge

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
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg p-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty.</p>
            <p className="text-sm text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            {/* Removed the "Start Shopping" button */}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {isMobile ? (
                <div className="grid gap-4">
                  {cartItems.map((item) => (
                    <Card key={item.id} className="bg-card text-card-foreground shadow-md">
                      <CardContent className="p-4 flex items-center gap-4">
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
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                              className="w-16 text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-semibold">Total: Rs{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-card text-card-foreground shadow-md">
                  <CardHeader>
                    <CardTitle>Cart Items</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                          {cartItems.map((item) => (
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
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                                    className="w-16 text-center"
                                    min="1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
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
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Items Total:</span>
                    <span>Rs{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Delivery Charges:</span>
                    <span>Rs{DELIVERY_CHARGE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Order Total:</span>
                    <span>Rs{totalWithDelivery.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" onClick={() => router.push('/checkout')}>
                    Proceed to Checkout
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