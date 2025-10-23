
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        order_details,
        shipping_address_id,
        tracking_details!left ( id, status, tracking_number, courier ),
        addresses (*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    if (!data) {
        return new NextResponse(
            JSON.stringify({ message: `Order with ID ${id} not found.` }), 
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    const trackingData = data.tracking_details;

    // Correctly extract line items, now including the 'note'
    const lineItems = data.order_details?.products?.map((item: any) => ({
        product_name: item.name,
        note: item.note ?? 'N/A', // Use note instead of variant
        quantity: item.quantity,
        price: item.price,
    })) ?? [];

    const orderDetails = {
      id: data.id,
      createdAt: data.created_at,
      lineItems: lineItems, // Use the updated line items
      total: data.order_details?.total ?? 0,
      receiptId: data.order_details?.receipt_id ?? 'N/A',
      tracking: {
        id: trackingData?.id ?? null,
        status: trackingData?.status ?? 'processing',
        tracking_number: trackingData?.tracking_number ?? 'N/A',
        courier: trackingData?.courier ?? 'N/A'
      },
      shippingAddress: data.addresses ?? {
        name: 'N/A', street_address: 'N/A', city: 'N/A', state: 'N/A', postal_code: 'N/A', country: 'N/A'
      }
    };

    return NextResponse.json({ order: orderDetails });

  } catch (error: any) {
    console.error(`API ERROR GET /api/admin/orders/[id]:`, error);
    return new NextResponse(
      JSON.stringify({ message: error.message || 'An internal server error occurred.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!status) {
      return new NextResponse(
        JSON.stringify({ message: 'Status is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const statusLowerCase = status.toLowerCase();
    const supabase = await getSupabaseClient();

    const { data: existingTracking, error: selectError } = await supabase
        .from('tracking_details')
        .select('id')
        .eq('order_id', id)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
    }

    if (existingTracking) {
      const { data, error } = await supabase
        .from('tracking_details')
        .update({ status: statusLowerCase, updated_at: new Date().toISOString() })
        .eq('id', existingTracking.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ updated: data });
    } else {
      const { data, error } = await supabase
        .from('tracking_details')
        .insert({
            order_id: parseInt(id),
            status: statusLowerCase,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ created: data });
    }

  } catch (error: any) {
    console.error(`API ERROR PUT /api/admin/orders/[id]:`, error);
    return new NextResponse(
      JSON.stringify({ message: error.message || 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
