import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { customerEmail, totalAmount, items, storeOwnerId } = await request.json();

    // --- Start Debugging Logs ---
    console.log("--- Debugging Environment Variables in /api/place-order ---");
    console.log("process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID:", process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID);
    console.log("process.env.SUPABASE_PROJECT_ID:", process.env.SUPABASE_PROJECT_ID);
    // You can also log all environment variables, but be cautious with sensitive data
    // console.log("All process.env variables:", process.env); 
    console.log("----------------------------------------------------------");
    // --- End Debugging Logs ---

    if (!customerEmail || !totalAmount || !items || !storeOwnerId) {
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
        customer_email: customerEmail,
        total_amount: totalAmount,
        items_json: items,
        user_id: storeOwnerId,
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