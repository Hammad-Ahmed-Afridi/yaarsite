"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useCart } from '@/components/cart-context-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

const formSchema = z.object({
  customerEmail: z.string().email({ message: "Please enter a valid email address." }),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [storeTenantSlug, setStoreTenantSlug] = useState<string | null>(null); // State to hold the tenant slug for redirection

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerEmail: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      router.push('/cart');
      return;
    }

    setIsPlacingOrder(true);
    toast.info("Placing your order...", { duration: 3000 });

    try {
      // Assuming all items in the cart belong to the same store owner
      const currentStoreOwnerId = cartItems[0]?.storeOwnerId;

      if (!currentStoreOwnerId) {
        throw new Error("Store owner information missing for cart items.");
      }

      // Fetch the tenant slug for redirection *before* clearing the cart
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_slug')
        .eq('id', currentStoreOwnerId)
        .single();

      if (profileError || !profileData?.tenant_slug) {
        console.error("Error fetching store tenant slug for redirection:", profileError);
        // If slug can't be found, storeTenantSlug remains null, and we'll fall back to generic /store
      } else {
        setStoreTenantSlug(profileData.tenant_slug);
      }

      // Call the Next.js API route to proxy the Edge Function call
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: values.customerEmail,
          totalAmount: cartTotal,
          items: cartItems,
          storeOwnerId: currentStoreOwnerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order.");
      }

      const result = await response.json();
      console.log("Order placed successfully:", result);

      toast.success("Thank you for your purchase. We will contact you soon.", { duration: 5000 });
      clearCart(); // Clear cart AFTER capturing storeOwnerId and attempting to fetch slug
      setOrderPlaced(true);

    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    // Determine the redirect path: to the specific store if slug is found, otherwise to generic /store
    const redirectPath = storeTenantSlug ? `/store/${storeTenantSlug}` : '/store';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
        <p className="text-lg text-muted-foreground mb-8">Thank you for your purchase. We will contact you soon.</p>
        <Button asChild>
          <Link href={redirectPath}>Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Checkout</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Confirm Your Order</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email to finalize your purchase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Items:</span>
                <span>{cartItems.reduce((count, item) => count + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold">
                <span>Order Total:</span>
                <span>Rs{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Your Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  {...form.register("customerEmail")}
                />
                {form.formState.errors.customerEmail && (
                  <p className="text-destructive text-sm">{form.formState.errors.customerEmail.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPlacingOrder || cartItems.length === 0}>
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}