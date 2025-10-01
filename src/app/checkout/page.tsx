"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { ArrowLeft, Loader2, CheckCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

// Function to generate a random 4-character alphanumeric code
const generateRandomCode = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const formSchema = z.object({
  customerName: z.string().min(1, { message: "Name is required." }),
  customerEmail: z.string().email({ message: "Please enter a valid email address." }),
  customerPhone: z.string()
    .regex(/^03\d{9}$/, { message: "Phone number must start with 03 and be 11 digits long." }),
  shippingProvince: z.string().min(1, { message: "Province is required." }),
  shippingCity: z.string().min(1, { message: "City is required." }),
  shippingAddressLine: z.string().min(1, { message: "Specific location/address is required." }),
  humanVerificationCode: z.string(), // Will be refined later
});

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [storeTenantSlug, setStoreTenantSlug] = useState<string | null>(null); // Used for initial "Continue Shopping" link before order
  const [finalRedirectPath, setFinalRedirectPath] = useState<string | null>(null); // New state for post-order redirect
  const [currentVerificationCode, setCurrentVerificationCode] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema.refine((data) => data.humanVerificationCode === currentVerificationCode, {
      message: "Incorrect verification code.",
      path: ["humanVerificationCode"],
    })),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingProvince: "",
      shippingCity: "",
      shippingAddressLine: "",
      humanVerificationCode: "",
    },
  });

  // Generate initial verification code on component mount
  useEffect(() => {
    setCurrentVerificationCode(generateRandomCode());
  }, []);

  // Re-generate code on refresh button click
  const refreshVerificationCode = useCallback(() => {
    setCurrentVerificationCode(generateRandomCode());
    form.setValue("humanVerificationCode", ""); // Clear input field
    form.clearErrors("humanVerificationCode"); // Clear error
  }, [form]);

  // Effect to fetch store slug for initial "Continue Shopping" link (before order is placed)
  useEffect(() => {
    async function fetchStoreSlugForInitialLink() {
      if (cartItems.length > 0) {
        const storeOwnerId = cartItems[0].storeOwnerId;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_slug')
          .eq('id', storeOwnerId)
          .single();

        if (profileError || !profileData?.tenant_slug) {
          console.error("Error fetching store tenant slug for initial link:", profileError);
          setStoreTenantSlug(null);
        } else {
          setStoreTenantSlug(profileData.tenant_slug);
        }
      } else {
        setStoreTenantSlug(null);
      }
    }

    fetchStoreSlugForInitialLink();
  }, [cartItems]);

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

      // Fetch the tenant slug for redirection *before* clearing the cart
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_slug')
        .eq('id', currentStoreOwnerId)
        .single();

      let determinedTenantSlug: string | null = null;
      if (profileError || !profileData?.tenant_slug) {
        console.error("Error fetching store tenant slug for redirection:", profileError);
        // Fallback to generic store if specific slug not found
        determinedTenantSlug = null;
      } else {
        determinedTenantSlug = profileData.tenant_slug;
      }

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          customerPhone: values.customerPhone,
          shippingProvince: values.shippingProvince,
          shippingCity: values.shippingCity,
          shippingAddressLine: values.shippingAddressLine,
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
      clearCart();
      
      // Set the final redirect path here, after successful order and before setting orderPlaced
      const path = determinedTenantSlug ? `/store/${determinedTenantSlug}` : '/store';
      setFinalRedirectPath(path); // Set the new state
      setOrderPlaced(true);

    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
      refreshVerificationCode(); // Refresh code on error
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    const redirectPath = finalRedirectPath || '/store'; // Use finalRedirectPath, with a fallback
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
      <header className="flex items-center p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Checkout</h1>
      </header>

      <main className="flex-1 p-8 flex items-center justify-center">
        <Card className="w-full max-w-lg bg-card text-card-foreground shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Confirm Your Order</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to finalize your purchase.
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
              <div className="grid gap-2">
                <Label htmlFor="customerName">Your Name</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="John Doe"
                  {...form.register("customerName")}
                />
                {form.formState.errors.customerName && (
                  <p className="text-destructive text-sm">{form.formState.errors.customerName.message}</p>
                )}
              </div>

              <div className="grid gap-2">
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

              <div className="grid gap-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="03001234567"
                  {...form.register("customerPhone")}
                />
                {form.formState.errors.customerPhone && (
                  <p className="text-destructive text-sm">{form.formState.errors.customerPhone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="shippingProvince">Province</Label>
                  <Input
                    id="shippingProvince"
                    type="text"
                    placeholder="Punjab"
                    {...form.register("shippingProvince")}
                  />
                  {form.formState.errors.shippingProvince && (
                    <p className="text-destructive text-sm">{form.formState.errors.shippingProvince.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shippingCity">City</Label>
                  <Input
                    id="shippingCity"
                    type="text"
                    placeholder="Lahore"
                    {...form.register("shippingCity")}
                  />
                  {form.formState.errors.shippingCity && (
                    <p className="text-destructive text-sm">{form.formState.errors.shippingCity.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shippingAddressLine">Specific Location / Address</Label>
                <Input
                  id="shippingAddressLine"
                  type="text"
                  placeholder="House #123, Street 4, DHA Phase 5"
                  {...form.register("shippingAddressLine")}
                />
                {form.formState.errors.shippingAddressLine && (
                  <p className="text-destructive text-sm">{form.formState.errors.shippingAddressLine.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="humanVerificationCode">Human Verification</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="humanVerificationCode"
                      type="text"
                      placeholder="Enter code"
                      className="pr-16"
                      {...form.register("humanVerificationCode")}
                    />
                    <div className="absolute right-0 top-0 h-full flex items-center bg-muted px-3 rounded-r-md border-l border-border">
                      <span className="font-mono text-lg font-bold text-primary">{currentVerificationCode}</span>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={refreshVerificationCode}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
                {form.formState.errors.humanVerificationCode && (
                  <p className="text-destructive text-sm">{form.formState.errors.humanVerificationCode.message}</p>
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