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
      total_amount, // This is the client-provided total
      items_json, 
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

    let calculatedSubtotal = 0; // Calculate subtotal first
    const now = new Date();
    const fetchedProducts = new Map();

    for (const item of items_json) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('stock, price, discount_percentage, discount_start_date, discount_end_date')
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

      fetchedProducts.set(item.id, product);

      let itemPrice = product.price;
      
      calculatedSubtotal += itemPrice * item.quantity;
    }

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
    const calculatedTotalAmount = calculatedSubtotal + deliveryCharge;

    // Round both client-provided and server-calculated totals to 2 decimal places for robust comparison
    const roundedCalculatedTotal = parseFloat(calculatedTotalAmount.toFixed(2));
    const roundedClientTotal = parseFloat(total_amount.toFixed(2));

    console.log("Edge Function: Received total_amount from client:", total_amount);
    console.log("Edge Function: Calculated total_amount on server:", calculatedTotalAmount);
    console.log("Edge Function: Rounded calculated total:", roundedCalculatedTotal);
    console.log("Edge Function: Rounded client total:", roundedClientTotal);

    if (roundedCalculatedTotal !== roundedClientTotal) { 
      console.error(`Edge Function: Price mismatch detected. Server: ${roundedCalculatedTotal}, Client: ${roundedClientTotal}`);
      return new Response(JSON.stringify({ message: `Price mismatch. Server calculated total: Rs${roundedCalculatedTotal.toFixed(2)}, client provided: Rs${roundedClientTotal.toFixed(2)}.` }), {
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
        total_amount: roundedCalculatedTotal, // Use the rounded calculated total for insertion
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

    for (const item of items_json) {
      const fetchedProduct = fetchedProducts.get(item.id);
      if (fetchedProduct) {
        const { error: updateStockError } = await supabaseAdmin
          .from('products')
          .update({ stock: (fetchedProduct.stock - item.quantity) })
          .eq('id', item.id);

        if (updateStockError) {
          console.error(`Error reducing stock for product ${item.id}:`, updateStockError);
        }
      } else {
        console.error(`Product ${item.id} not found in fetchedProducts map during stock reduction.`);
      }
    }

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