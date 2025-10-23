
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or service key is not defined in .env file');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Join orders with tracking_details to get the status
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        order_details,
        tracking_details ( status )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const orders = data.map((order: any) => {
      // The status is now nested inside the tracking_details array
      const status = order.tracking_details && order.tracking_details.length > 0 
                     ? order.tracking_details[0].status 
                     : 'N/A';

      return {
        id: order.id,
        createdAt: order.created_at,
        total: order.order_details?.total ?? 0,
        status: status,
        receiptId: order.order_details?.receipt_id ?? 'N/A'
      };
    });

    return NextResponse.json({ orders: orders });

  } catch (error: any) {
    console.error('API ERROR /api/admin/orders:', error);
    return new NextResponse(
      JSON.stringify({ message: error.message || 'An internal server error occurred while fetching orders.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
