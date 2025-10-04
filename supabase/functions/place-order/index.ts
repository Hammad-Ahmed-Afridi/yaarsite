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

    // Insert the order
    const { data: orderData, error: orderError } = await supabaseAdmin
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

    if (orderError) {
      console.error("Supabase insert order error:", orderError);
      return new Response(JSON.stringify({ message: orderError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrement product stock for each item in the order
    for (const item of items_json) {
      const { error: stockUpdateError } = await supabaseAdmin
        .from('products')
        .update({ stock: (item.stock || 0) - item.quantity }) // Assuming item.stock is the current stock, or fetch it
        .eq('id', item.id);

      if (stockUpdateError) {
        console.error(`Error updating stock for product ${item.id}:`, stockUpdateError);
        // Optionally, you might want to revert the order or log this more critically
        // For now, we'll let the order go through but log the stock error
      }
    }

    return new Response(JSON.stringify({ message: 'Order placed successfully', order: orderData }), {
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