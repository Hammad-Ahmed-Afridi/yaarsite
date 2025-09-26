import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { customerEmail, totalAmount, items, storeOwnerId } = await request.json();

    if (!customerEmail || !totalAmount || !items || !storeOwnerId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const SUPABASE_PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    
    if (!SUPABASE_PROJECT_ID) {
      console.error("Environment variable NEXT_PUBLIC_SUPABASE_PROJECT_ID is not defined.");
      return NextResponse.json({ message: 'Supabase Project ID is not defined in environment variables.' }, { status: 500 });
    }

    const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/place-order`;

    const edgeFunctionResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header needed here, as the Edge Function will use the service role key
      },
      body: JSON.stringify({
        customer_email: customerEmail,
        total_amount: totalAmount,
        items_json: items,
        user_id: storeOwnerId, // This is the store owner's user_id
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