
import { createClient } from '@supabase/supabase-js';
import { auth, clerkClient } from '@clerk/nextjs/server';
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

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user?.publicMetadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders });

  } catch (error: any) {
    // **THE FIX IS HERE**
    // We were hiding the real error. Now, we will return the actual exception
    // message, which will give us the root cause of the Internal Server Error.
    console.error('Caught an exception in GET /api/orders:', error);
    return NextResponse.json({ message: error.message || 'An unknown internal error occurred.' }, { status: 500 });
  }
}
