
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('return_requests')
      .select(`
        id,
        created_at,
        status,
        order:orders (
            order_details
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Format the data to match the structure expected by the frontend table
    const requests = data.map(req => ({
        id: req.id,
        createdAt: req.created_at,
        status: req.status,
        receiptId: req.order?.order_details?.receipt_id ?? 'N/A',
    }));

    return NextResponse.json({ requests });

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ message: error.message || 'An internal server error occurred.' }), 
      { status: 500 }
    );
  }
}
