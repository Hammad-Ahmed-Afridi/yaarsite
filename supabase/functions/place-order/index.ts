import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      shipping_province, 
      shipping_city, 
      shipping_address_line, 
      total_amount, 
      items_json, // This now includes variantId and selectedAttributes
      user_id,
      payment_method 
    } = await req.json();

    if (!customer_name || !customer_email || !customer_phone || !shipping_province || !shipping_city || !shipping_address_line || !total_amount || !items_json || !user_id || !payment_method) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let calculatedTotalAmount = 0;
    const now = new Date();
    const productsToUpdate: { productId: string; newVariants: any[] }[] = []; // To store updated variants for stock reduction

    // --- Server-side Stock and Discount Validation ---
    for (const item of items_json) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('stock, price, discount_percentage, discount_start_date, discount_end_date, variants')
        .eq('id', item.id)
        .single();

      if (productError || !product) {
        return new Response(JSON.stringify({ message: `Product with ID ${item.id} not found.` }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let itemPrice = 0;
      let itemStock = 0;
      let updatedVariants = product.variants ? [...product.variants] : null;

      if (product.variants && item.variantId) {
        // Product has variants, find the specific variant
        const variantIndex = product.variants.findIndex((v: any) => v.id === item.variantId);
        if (variantIndex === -1) {
          return new Response(JSON.stringify({ message: `Variant with ID ${item.variantId} not found for product ${item.name}.` }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const selectedVariant = product.variants[variantIndex];
        itemPrice = selectedVariant.price;
        itemStock = selectedVariant.stock;

        // Prepare for stock reduction
        if (updatedVariants) {
          updatedVariants[variantIndex] = { ...selectedVariant, stock: selectedVariant.stock - item.quantity };
        }

      } else if (!product.variants && product.price !== null && product.stock !== null) {
        // Product has no variants, use main product price and stock
        itemPrice = product.price;
        itemStock = product.stock;
      } else {
        return new Response(JSON.stringify({ message: `Product ${item.name} has an invalid price/stock configuration.` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (itemStock < item.quantity) {
        return new Response(JSON.stringify({ message: `Insufficient stock for product: ${item.name} (Variant: ${JSON.stringify(item.selectedAttributes)}). Only ${itemStock} available.` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Apply product-level discount if active
      const isDiscountActive = product.discount_percentage && product.discount_start_date && product.discount_end_date &&
                               new Date(product.discount_start_date) <= now && new Date(product.discount_end_date) >= now;

      if (isDiscountActive && product.discount_percentage !== null) {
        itemPrice = itemPrice * (1 - product.discount_percentage / 100);
      }
      
      calculatedTotalAmount += itemPrice * item.quantity;

      // Add to productsToUpdate for later stock reduction
      productsToUpdate.push({
        productId: item.id,
        newVariants: updatedVariants,
      });
    }
    // --- End Server-side Stock and Discount Validation ---

    // Fetch delivery charge from profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('delivery_charge')
      .eq('id', user_id)
      .single();

    if (profileError || !profileData) {
      console.error("Error fetching delivery charge for store owner:", profileError);
      return new Response(JSON.stringify({ message: 'Failed to retrieve store delivery charge.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const deliveryCharge = profileData.delivery_charge || 0;
    calculatedTotalAmount += deliveryCharge;

    // Validate that the client-provided total_amount matches the server-calculated total
    if (Math.abs(calculatedTotalAmount - total_amount) > 0.01) { 
      return new Response(JSON.stringify({ message: `Price mismatch. Server calculated total: Rs${calculatedTotalAmount.toFixed(2)}, client provided: Rs${total_amount.toFixed(2)}.` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone,
        shipping_province,
        shipping_city,
        shipping_address_line,
        total_amount: calculatedTotalAmount, 
        items_json, 
        user_id,
        status: 'pending',
        payment_method, 
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return new Response(JSON.stringify({ message: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Stock Reduction ---
    for (const productUpdate of productsToUpdate) {
      if (productUpdate.newVariants) {
        // Update variants stock
        const { error: updateStockError } = await supabaseAdmin
          .from('products')
          .update({ variants: productUpdate.newVariants })
          .eq('id', productUpdate.productId);

        if (updateStockError) {
          console.error(`Error reducing variant stock for product ${productUpdate.productId}:`, updateStockError);
        }
      } else {
        // Update main product stock (if no variants)
        const { data: currentProduct, error: fetchProductError } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', productUpdate.productId)
          .single();

        if (fetchProductError || !currentProduct) {
          console.error(`Error fetching product ${productUpdate.productId} for stock update:`, fetchProductError);
          continue;
        }

        const itemInOrder = items_json.find((item: any) => item.id === productUpdate.productId);
        if (itemInOrder) {
          const { error: updateStockError } = await supabaseAdmin
            .from('products')
            .update({ stock: currentProduct.stock - itemInOrder.quantity })
            .eq('id', productUpdate.productId);

          if (updateStockError) {
            console.error(`Error reducing main product stock for product ${productUpdate.productId}:`, updateStockError);
          }
        }
      }
    }
    // --- End Stock Reduction ---

    return new Response(JSON.stringify({ message: 'Order placed successfully', order: data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Edge Function caught error:", error);
    return new Response(JSON.stringify({ message: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});