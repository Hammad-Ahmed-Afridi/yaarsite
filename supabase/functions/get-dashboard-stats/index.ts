import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { verify } from 'https://deno.land/x/djwt@v2.9/mod.ts'; // Import verify from djwt

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Extract JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized: Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.substring(7); // Remove 'Bearer '

    // 2. Get Supabase JWT Secret from environment variables
    // Changed from SUPABASE_JWT_SECRET to JWT_SECRET
    const JWT_SECRET = Deno.env.get('JWT_SECRET');
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables.');
      return new Response(JSON.stringify({ message: 'Server configuration error: JWT secret missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Verify the JWT and extract the user ID
    let authenticatedUserId: string;
    try {
      const { payload } = await verify(token, JWT_SECRET, 'HS256'); // Use JWT_SECRET
      if (!payload || !payload.sub) {
        throw new Error('Invalid JWT payload: Missing user ID (sub)');
      }
      authenticatedUserId = payload.sub;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return new Response(JSON.stringify({ message: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use the authenticatedUserId for database queries, ignoring any user_id from the request body
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch total products
    const { count: productsCount, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authenticatedUserId); // Use verified user ID

    if (productsError) throw productsError;

    // Fetch total orders
    const { count: ordersCount, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authenticatedUserId); // Use verified user ID

    if (ordersError) throw ordersError;

    // Fetch total profit (sum of delivered orders)
    const { data: profitData, error: profitError } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('user_id', authenticatedUserId) // Use verified user ID
      .eq('status', 'delivered');

    if (profitError) throw profitError;

    const totalProfit = profitData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    return new Response(JSON.stringify({
      totalProducts: productsCount || 0,
      totalOrders: ordersCount || 0,
      totalProfit: totalProfit,
    }), {
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