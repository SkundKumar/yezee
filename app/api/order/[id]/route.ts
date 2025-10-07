
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    // Step 1: Fetch the core order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*, shipping_address_id')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!orderData) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Step 2: Fetch the linked shipping address
    let shippingAddress = null;
    if (orderData.shipping_address_id) {
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', orderData.shipping_address_id)
        .single();
      shippingAddress = addressData;
    }

    // Step 3: Fetch tracking details
    const { data: trackingData } = await supabase.from('tracking_details').select('*').eq('order_id', orderId).single();

    // THE FIX: The notes are now embedded in the 'order_details' JSON.
    // We no longer need to fetch them separately. The structure is already correct.

    // Step 4: Construct the final order object
    const formattedOrder = {
      id: orderData.id,
      created_at: orderData.created_at,
      tracking_details: trackingData,
      order_details: {
        ...orderData.order_details,
        shipping_address: shippingAddress, // Attach the correctly fetched address
      },
    };

    return NextResponse.json({ order: formattedOrder });

  } catch (error: any) {
    console.error('Error in GET /api/order/[id]:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
