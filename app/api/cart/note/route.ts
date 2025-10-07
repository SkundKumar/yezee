
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, note } = await req.json();

    if (!itemId) {
      return NextResponse.json({ message: 'Item ID is required' }, { status: 400 });
    }

    // 1. Verify that the cart item exists and belongs to the user before proceeding.
    const { data: cartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single();

    // If the cart item doesn't exist, return a JSON error.
    if (fetchError || !cartItem) {
        return NextResponse.json({ message: 'Cart item not found. It may have been removed.' }, { status: 404 });
    }

    // 2. Upsert the note for the validated cart item.
    const { data, error } = await supabase
      .from('cart_item_notes')
      .upsert(
        { cart_item_id: itemId, note: note, user_id: userId },
        { onConflict: 'cart_item_id' }
      )
      .select();

    if (error) {
      console.error('Error saving note:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Caught an exception in POST /api/cart/note:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
