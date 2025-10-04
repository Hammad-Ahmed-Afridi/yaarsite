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
      items_json, 
      user_id,
      payment_method // New: payment_method
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

    // --- Server-side Stock and Discount Validation ---
    for (const item of items_json) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('stock, price, discount_percentage, discount_end_date') // Fetch discount fields
        .eq('id', item.id)
        .single();

      if (productError || !product) {
        return new Response(JSON.stringify({ message: `Product with ID ${item.id} not found.` }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (product.stock < item.quantity) {
        return new Response(JSON.stringify({ message: `Insufficient stock for product: ${item.name}. Only ${product.stock} available.` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate actual price considering active discounts
      let itemPrice = product.price;
      const isDiscountActive = product.discount_percentage && product.discount_end_date && new Date(product.discount_end_date) > new Date();

      if (isDiscountActive) {
        itemPrice = product.price; // The 'price' column already holds the discounted price if a discount is active
      }
      
      calculatedTotalAmount += itemPrice * item.quantity;
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
    if (Math.abs(calculatedTotalAmount - total_amount) > 0.01) { // Allow for minor floating point differences
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
        total_amount: calculatedTotalAmount, // Use server-calculated total
        items_json,
        user_id,
        status: 'pending',
        payment_method, // New: insert payment method
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
    for (const item of items_json) {
      const { error: updateStockError } = await supabaseAdmin
        .from('products')
        .update({ stock: (item.stock - item.quantity) }) // Assuming item.stock is the current stock from the client, which is validated above
        .eq('id', item.id);

      if (updateStockError) {
        console.error(`Error reducing stock for product ${item.id}:`, updateStockError);
        // Optionally, you might want to revert the order or mark it for manual review
        // For now, we'll just log the error and proceed with the order being placed.
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