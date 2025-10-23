
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or service key is not defined in .env file');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        order_details,
        shipping_address_id,
        tracking_details ( status, tracking_number, courier ),
        addresses (*)
      `)
      .eq('id', orderId)
      .single(); // Use single() because we expect only one order

    if (error) {
      throw error;
    }

    if (!data) {
        return new NextResponse(
            JSON.stringify({ message: `Order with ID ${orderId} not found.` }), 
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // The query returns tracking_details as an array, so we extract the first element
    const trackingDetails = data.tracking_details && data.tracking_details.length > 0
                            ? data.tracking_details[0]
                            : { status: 'N/A', tracking_number: 'N/A', courier: 'N/A' };

    const orderDetails = {
      id: data.id,
      createdAt: data.created_at,
      lineItems: data.order_details?.line_items ?? [],
      total: data.order_details?.total ?? 0,
      receiptId: data.order_details?.receipt_id ?? 'N/A',
      tracking: trackingDetails,
      shippingAddress: data.addresses
    };

    return NextResponse.json({ order: orderDetails });

  } catch (error: any) {
    console.error(`API ERROR /api/admin/orders/[orderId]:`, error);
    return new NextResponse(
      JSON.stringify({ message: error.message || 'An internal server error occurred.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
