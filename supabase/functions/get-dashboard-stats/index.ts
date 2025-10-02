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
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ message: 'Missing user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch total products
    const { count: productsCount, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (productsError) throw productsError;

    // Fetch total orders
    const { count: ordersCount, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (ordersError) throw ordersError;

    // Fetch total profit (sum of delivered orders)
    const { data: profitData, error: profitError } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('user_id', user_id)
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