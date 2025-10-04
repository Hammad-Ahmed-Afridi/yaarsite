"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/session-context-provider';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Percent, CalendarIcon, Loader2, Tag, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  discount_start_date: string | null; // New: discount_start_date
  discount_end_date: string | null;
  user_id: string;
}

interface DiscountDialogProps {
  products: Product[];
  onDiscountApplied: () => void;
}

const formSchema = z.object({
  discountScope: z.enum(["all", "selected"], {
    required_error: "Please select a discount scope.",
  }),
  selectedProductIds: z.array(z.string()).optional(),
  discountPercentage: z.coerce.number()
    .min(1, { message: "Discount percentage must be at least 1." })
    .max(99, { message: "Discount percentage cannot exceed 99." }),
  discountStartDate: z.date().optional(), // New: discountStartDate
  discountEndDate: z.date().optional(),
}).refine((data) => {
  // If both dates are provided, start date must be before or equal to end date
  if (data.discountStartDate && data.discountEndDate) {
    return data.discountStartDate <= data.discountEndDate;
  }
  return true;
}, {
  message: "Start date cannot be after end date.",
  path: ["discountEndDate"],
});

export function DiscountDialog({ products, onDiscountApplied }: DiscountDialogProps) {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountScope: "all",
      selectedProductIds: [],
      discountPercentage: 10,
      discountStartDate: undefined, // Initialize new field
      discountEndDate: undefined,
    },
  });

  const discountScope = form.watch("discountScope");
  const selectedProductIds = form.watch("selectedProductIds");

  const handleProductSelection = (productId: string, checked: boolean) => {
    const currentSelection = form.getValues("selectedProductIds") || [];
    if (checked) {
      form.setValue("selectedProductIds", [...currentSelection, productId]);
    } else {
      form.setValue("selectedProductIds", currentSelection.filter(id => id !== productId));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to apply discounts.");
      return;
    }

    setIsSubmitting(true);
    try {
      let productsToUpdate: Product[] = [];

      if (values.discountScope === "all") {
        productsToUpdate = products;
      } else if (values.discountScope === "selected") {
        if (!values.selectedProductIds || values.selectedProductIds.length === 0) {
          toast.error("Please select at least one product for the discount.");
          setIsSubmitting(false);
          return;
        }
        productsToUpdate = products.filter(p => values.selectedProductIds?.includes(p.id));
      }

      if (productsToUpdate.length === 0) {
        toast.error("No products found to apply the discount to.");
        setIsSubmitting(false);
        return;
      }

      const updates = productsToUpdate.map(product => {
        const newPrice = product.price * (1 - values.discountPercentage / 100);
        return {
          id: product.id,
          user_id: user.id,
          original_price: product.original_price === null ? product.price : product.original_price,
          price: newPrice,
          discount_percentage: values.discountPercentage,
          discount_start_date: values.discountStartDate ? values.discountStartDate.toISOString() : null, // Save start date
          discount_end_date: values.discountEndDate ? values.discountEndDate.toISOString() : null,
          updated_at: new Date().toISOString(),
        };
      });

      const { error } = await supabase
        .from('products')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        throw new Error(`Failed to apply discount: ${error.message}`);
      }

      toast.success("Discount applied successfully!");
      setIsOpen(false);
      onDiscountApplied();
      form.reset();

    } catch (error: any) {
      console.error("Error applying discount:", error);
      toast.error(error.message || "Failed to apply discount. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!user) {
      toast.error("You must be logged in to remove discounts.");
      return;
    }

    setIsSubmitting(true);
    try {
      let productsToUpdate: Product[] = [];

      if (discountScope === "all") {
        productsToUpdate = products;
      } else if (discountScope === "selected") {
        if (!selectedProductIds || selectedProductIds.length === 0) {
          toast.error("Please select at least one product to remove the discount from.");
          setIsSubmitting(false);
          return;
        }
        productsToUpdate = products.filter(p => selectedProductIds?.includes(p.id));
      }

      if (productsToUpdate.length === 0) {
        toast.error("No products found to remove the discount from.");
        setIsSubmitting(false);
        return;
      }

      const updates = productsToUpdate.map(product => ({
        id: product.id,
        user_id: user.id,
        price: product.original_price !== null ? product.original_price : product.price,
        original_price: null,
        discount_percentage: null,
        discount_start_date: null, // Clear start date
        discount_end_date: null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('products')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        throw new Error(`Failed to remove discount: ${error.message}`);
      }

      toast.success("Discount removed successfully!");
      setIsOpen(false);
      onDiscountApplied();
      form.reset();

    } catch (error: any) {
      console.error("Error removing discount:", error);
      toast.error(error.message || "Failed to remove discount. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRange = {
    from: form.watch("discountStartDate"),
    to: form.watch("discountEndDate"),
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 font-semibold">
          <Percent className="h-4 w-4" /> Discount
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden font-sans">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Apply Product Discount</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Set a percentage discount for your products and specify a duration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Apply Discount To</Label>
            <Controller
              name="discountScope"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-products" />
                    <Label htmlFor="all-products" className="text-base font-medium">All Products</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="selected-products" />
                    <Label htmlFor="selected-products" className="text-base font-medium">Selected Products</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {form.formState.errors.discountScope && (
              <p className="text-destructive text-sm">{form.formState.errors.discountScope.message}</p>
            )}
          </div>

          {discountScope === "selected" && (
            <div className="grid gap-2">
              <Label htmlFor="selectedProductIds" className="text-sm font-medium">Select Products</Label>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <div className="grid gap-2">
                  {products.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No products available to select.</p>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={selectedProductIds?.includes(product.id)}
                          onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                        />
                        <Label htmlFor={`product-${product.id}`} className="text-base font-medium">
                          {product.name} (Rs{product.price.toFixed(2)})
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              {form.formState.errors.selectedProductIds && (
                <p className="text-destructive text-sm">{form.formState.errors.selectedProductIds.message}</p>
            )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="discountPercentage" className="text-sm font-medium">Discount Percentage (%) *</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="discountPercentage"
                type="number"
                step="1"
                min="1"
                max="99"
                placeholder="e.g., 20"
                className="pl-10"
                {...form.register("discountPercentage", { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.discountPercentage && (
              <p className="text-destructive text-sm">{form.formState.errors.discountPercentage.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discountEndDate" className="text-sm font-medium">Discount Period (Optional)</Label>
            <Controller
              name="discountEndDate"
              control={form.control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && !form.watch("discountStartDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedRange.from ? (
                        selectedRange.to ? (
                          <>
                            {format(selectedRange.from, "PPP")} -{" "}
                            {format(selectedRange.to, "PPP")}
                          </>
                        ) : (
                          format(selectedRange.from, "PPP")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="range" // Changed to range mode
                      selected={selectedRange}
                      onSelect={(range) => {
                        form.setValue("discountStartDate", range?.from);
                        form.setValue("discountEndDate", range?.to);
                        form.clearErrors("discountEndDate"); // Clear error on selection
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.discountEndDate && (
              <p className="text-destructive text-sm">{form.formState.errors.discountEndDate.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="font-semibold">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleRemoveDiscount} disabled={isSubmitting} className="font-semibold">
              <XCircle className="mr-2 h-4 w-4" /> Remove Discount
            </Button>
            <Button type="submit" disabled={isSubmitting} className="font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying Discount...
                </>
              ) : (
                <>
                  <Tag className="mr-2 h-4 w-4" /> Apply Discount
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}