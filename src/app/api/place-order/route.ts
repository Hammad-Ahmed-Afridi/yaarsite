import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      shippingProvince, 
      shippingCity, 
      shippingAddressLine, 
      totalAmount, 
      items, 
      storeOwnerId,
      paymentMethod 
    } = await request.json();

    if (!customerName || !customerEmail || !customerPhone || !shippingProvince || !shippingCity || !shippingAddressLine || !totalAmount || !items || !storeOwnerId || !paymentMethod) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Get Supabase URL from environment variables
    const SUPABASE_URL = process.env.SUPABASE_URL || "https://vpfrtytxeimezwxhhtuf.supabase.co";
    
    // Extract project ID from the Supabase URL
    const SUPABASE_PROJECT_ID_MATCH = SUPABASE_URL.match(/https:\/\/(.*?)\.supabase\.co/);
    const SUPABASE_PROJECT_ID = SUPABASE_PROJECT_ID_MATCH ? SUPABASE_PROJECT_ID_MATCH[1] : null;

    if (!SUPABASE_PROJECT_ID) {
      console.error("Supabase Project ID could not be extracted from SUPABASE_URL.");
      return NextResponse.json({ message: 'Supabase Project ID is not defined or could not be extracted from SUPABASE_URL. Please ensure SUPABASE_URL is correctly set in your environment variables.' }, { status: 500 });
    }

    const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/place-order`;

    const edgeFunctionResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_province: shippingProvince,
        shipping_city: shippingCity,
        shipping_address_line: shippingAddressLine,
        total_amount: totalAmount,
        items_json: items,
        user_id: storeOwnerId,
        payment_method: paymentMethod,
      }),
    });

    if (!edgeFunctionResponse.ok) {
      const errorData = await edgeFunctionResponse.json();
      console.error("Edge Function error:", errorData);
      return NextResponse.json({ message: errorData.message || 'Failed to place order via Edge Function' }, { status: edgeFunctionResponse.status });
    }

    const result = await edgeFunctionResponse.json();
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/place-order:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}