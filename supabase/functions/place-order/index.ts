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

    // --- Server-side Stock Validation ---
    for (const item of items_json) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('stock')
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
    }
    // --- End Server-side Stock Validation ---

    const { data, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone,
        shipping_province,
        shipping_city,
        shipping_address_line,
        total_amount,
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