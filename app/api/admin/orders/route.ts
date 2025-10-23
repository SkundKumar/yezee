
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

async function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or service key is not defined in .env file');
    }
    return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient();

    // Efficiently fetch orders and their related tracking status
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        order_details,
        tracking_details!left(status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const orders = data.map(order => {
      // The result from a !left join will be an object or null
      const trackingStatus = order.tracking_details?.status ?? 'processing';

      return {
        id: order.id,
        receiptId: order.order_details?.receipt_id ?? 'N/A',
        createdAt: order.created_at,
        total: order.order_details?.total ?? 0,
        status: trackingStatus,
      };
    });

    return NextResponse.json({ orders });

  } catch (error: any) {
    console.error('API ERROR GET /api/admin/orders:', error);
    return new NextResponse(
      JSON.stringify({ message: error.message || 'An internal server error occurred.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
