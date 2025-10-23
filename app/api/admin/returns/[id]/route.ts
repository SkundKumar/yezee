
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
      .from('return_requests')
      .select(`
        id,
        created_at,
        status,
        reason,
        image_url,
        tags_intact,
        order:orders (
          order_details,
          address:addresses ( name )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return new NextResponse(JSON.stringify({ message: `Return request with ID ${id} not found.` }), { status: 404 });
    }

    const finalDetails = {
      ...data,
      user: {
        name: data.order?.address?.name ?? 'N/A',
      },
    };

    return NextResponse.json({ request: finalDetails });

  } catch (error: any) {
    console.error(`API ERROR GET /api/admin/returns/[id]:`, error);
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
        const supabase = await getSupabaseClient();

        if (!['Accepted', 'Denied', 'Returned'].includes(status)) {
            return new NextResponse(JSON.stringify({ message: 'Invalid status update.' }), { status: 400 });
        }

        const { data, error } = await supabase
            .from('return_requests')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ updatedRequest: data });

    } catch (error: any) {
        console.error(`API ERROR PUT /api/admin/returns/[id]:`, error);
        return new NextResponse(
          JSON.stringify({ message: error.message || 'An internal server error occurred.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
