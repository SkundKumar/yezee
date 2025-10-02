import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { auth } from '@clerk/nextjs/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // <-- Use the new secret key
);

// Initialize WooCommerce API client
const wooCommerce = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3',
});

// GET the user's wishlist
export async function GET(request: NextRequest) {
  const { userId } = await auth(); // await is here
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: wishlistItems, error: supabaseError } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', userId);

  if (supabaseError) return NextResponse.json({ error: supabaseError.message }, { status: 500 });
  if (!wishlistItems || wishlistItems.length === 0) return NextResponse.json([]);

  const productIds = wishlistItems.map(item => item.product_id);
  try {
    const { data: products } = await wooCommerce.get('products', { include: productIds });
    return NextResponse.json(products);
  } catch (wooError: any) { return NextResponse.json({ error: wooError.message }, { status: 500 }); }
}

// POST a new item to the wishlist
export async function POST(request: NextRequest) {
  const { userId } = await auth(); // await is here
  const { productId } = await request.json();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert([{ user_id: userId, product_id: productId }]);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Item added to wishlist' });
}

// DELETE an item from the wishlist
export async function DELETE(request: NextRequest) {
    const { userId } = await auth(); // await is here
    const { productId } = await request.json();

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Item removed from wishlist' });
}