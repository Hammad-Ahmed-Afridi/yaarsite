import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { verify } from 'https://deno.land/x/djwt@v2.9/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('DEBUG: Authorization header missing or not starting with Bearer.'); // Minimal log
      return new Response(JSON.stringify({ message: 'Unauthorized: Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.substring(7);

    const SUPABASE_JWT_SECRET = Deno.env.get('APP_JWT_SECRET');
    if (!SUPABASE_JWT_SECRET) {
      console.error('DEBUG: APP_JWT_SECRET is NOT set in environment variables.'); // Minimal log
      return new Response(JSON.stringify({ message: 'Server configuration error: JWT secret missing. Please ensure APP_JWT_SECRET is set in Supabase Edge Function secrets.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // DEBUG: Confirm secret is loaded (length check is safe)
    console.log('DEBUG: APP_JWT_SECRET is loaded (length):', SUPABASE_JWT_SECRET.length);

    // Convert the string secret to a Uint8Array for the verify function
    const secretKey = new TextEncoder().encode(SUPABASE_JWT_SECRET);

    let authenticatedUserId: string;
    try {
      const { payload } = await verify(token, secretKey, 'HS256');
      if (!payload || !payload.sub) {
        throw new Error('Invalid JWT payload: Missing user ID (sub)');
      }
      authenticatedUserId = payload.sub;
      console.log('DEBUG: JWT verified successfully. Authenticated User ID:', authenticatedUserId); // Log user ID on success
    } catch (jwtError) {
      console.error('DEBUG: JWT verification failed:', jwtError);
      return new Response(JSON.stringify({ message: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { count: productsCount, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authenticatedUserId);

    if (productsError) throw productsError;

    const { count: ordersCount, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authenticatedUserId);

    if (ordersError) throw ordersError;

    const { data: profitData, error: profitError } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('user_id', authenticatedUserId)
      .eq('status', 'delivered');

    if (profitError) throw profitError;

    const totalProfit = profitData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // New: Fetch count of new orders (pending or processing)
    const { count: newOrdersCount, error: newOrdersError } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authenticatedUserId)
      .in('status', ['pending', 'processing']); // Filter for 'pending' or 'processing'

    if (newOrdersError) throw newOrdersError;

    return new Response(JSON.stringify({
      totalProducts: productsCount || 0,
      totalOrders: ordersCount || 0,
      totalProfit: totalProfit,
      newOrders: newOrdersCount || 0, // Add newOrders count to the response
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("DEBUG: Edge Function caught error:", error);
    return new Response(JSON.stringify({ message: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});