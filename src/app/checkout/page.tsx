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
import { ArrowLeft, Loader2, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  customerEmail: z.string().email({ message: "Please enter a valid email address." }),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [storeTenantSlug, setStoreTenantSlug] = useState<string | null>(null);

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
      const currentStoreOwnerId = cartItems[0]?.storeOwnerId;

      if (!currentStoreOwnerId) {
        throw new Error("Store owner information missing for cart items.");
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_slug')
        .eq('id', currentStoreOwnerId)
        .single();

      if (profileError || !profileData?.tenant_slug) {
        console.error("Error fetching store tenant slug for redirection:", profileError);
      } else {
        setStoreTenantSlug(profileData.tenant_slug);
      }

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

      toast.success("Order placed successfully! Check your email for confirmation.", { duration: 5000 });
      clearCart();
      setOrderPlaced(true);

    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    const redirectPath = storeTenantSlug ? `/store/${storeTenantSlug}` : '/';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-background p-4 text-center animate-in fade-in duration-500">
        <CheckCircle className="h-20 w-20 text-green-500 mb-6 animate-in zoom-in-90 duration-700" />
        <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">Thank you for your purchase. A confirmation email has been sent.</p>
        <Button asChild className="h-11 text-base font-semibold">
          <Link href={redirectPath}>Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 md:px-8 border-b border-border bg-card shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold ml-4">Checkout</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl border-2 border-primary/20 rounded-lg animate-in zoom-in-95 duration-500">
          <CardHeader className="text-center space-y-2 pt-8">
            <CardTitle className="text-3xl font-bold">Confirm Your Order</CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Enter your email to finalize your purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-md border border-border">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Items:</span>
                <span>{cartItems.reduce((count, item) => count + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-3xl font-bold text-primary">
                <span>Order Total:</span>
                <span>Rs{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-sm font-medium">Your Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10 h-11 text-base focus-visible:ring-primary"
                    {...form.register("customerEmail")}
                  />
                </div>
                {form.formState.errors.customerEmail && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.customerEmail.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isPlacingOrder || cartItems.length === 0}>
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