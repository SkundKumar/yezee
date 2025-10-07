import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with the service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching address:', error);
      return new Response('Internal Server Error', { status: 500 });
    }

    return NextResponse.json({ address });
  } catch (error) {
      console.error('Caught an exception in GET /api/user/address:', error);
      return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    
    const { data, error } = await supabase
      .from('addresses')
      .upsert({ ...body.address, user_id: userId }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving address:', error);
      return new Response('Internal Server Error', { status: 500 });
    }

    return NextResponse.json({ address: data });
  } catch (error) {
    console.error('Caught an exception in POST /api/user/address:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
