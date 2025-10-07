
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all orders for the user, ordered by creation date
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, created_at, order_details, tracking_details(status)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Format the orders to be more frontend-friendly
    const formattedOrders = orders.map(order => ({
        id: order.id,
        createdAt: order.created_at,
        total: order.order_details.total,
        status: order.tracking_details?.status || 'Processing',
        receiptId: order.order_details.receipt_id,
    }));

    return NextResponse.json({ orders: formattedOrders });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
