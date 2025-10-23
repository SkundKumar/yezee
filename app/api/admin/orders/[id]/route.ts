

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to check for admin role
async function isAdmin(req: NextRequest) {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === 'admin';
}

// GET handler to fetch a single order by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        order_details,
        shipping_address_id,
        addresses (*),
        tracking_details ( status, tracking_number, courier )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    const formattedOrder = {
        ...order,
        status: order.tracking_details[0]?.status || 'unknown'
    };

    return NextResponse.json({ order: formattedOrder });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PATCH handler to update the order status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    // Update the status in the tracking_details table
    const { error: updateError } = await supabase
      .from('tracking_details')
      .update({ status: status.toLowerCase() })
      .eq('order_id', id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ message: 'Order status updated successfully' });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
