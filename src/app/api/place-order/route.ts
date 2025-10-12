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

    let SUPABASE_PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;

    if (!SUPABASE_PROJECT_ID) {
      SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
    }
    
    if (!SUPABASE_PROJECT_ID) {
      console.error("Environment variable SUPABASE_PROJECT_ID is not defined.");
      return NextResponse.json({ message: 'Supabase Project ID is not defined in environment variables. Please ensure either NEXT_PUBLIC_SUPABASE_PROJECT_ID or SUPABASE_PROJECT_ID is set in Vercel.' }, { status: 500 });
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
        items_json: items, // This now includes variantId and selectedAttributes
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