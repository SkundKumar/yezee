import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize WooCommerce API client
const wooCommerce = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3',
});

// Function to GET full wishlist product details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // 1. Get product IDs from Supabase
  const { data: wishlistItems, error: supabaseError } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', userId);

  if (supabaseError) {
    return NextResponse.json({ error: supabaseError.message }, { status: 500 });
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return NextResponse.json([]); // Return empty array if wishlist is empty
  }

  // 2. Get full product details from WooCommerce using the IDs
  const productIds = wishlistItems.map(item => item.product_id);
  try {
    const { data: products } = await wooCommerce.get('products', {
        include: productIds,
    });
    return NextResponse.json(products);
  } catch (wooError: any) {
    return NextResponse.json({ error: wooError.message }, { status: 500 });
  }
}

// Function to POST a new wishlist item (this stays the same)
export async function POST(request: NextRequest) {
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert([{ user_id: userId, product_id: productId }]);

    if (error) {
        console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Item added to wishlist' }, { status: 201 });
  }

  export async function DELETE(request: NextRequest) {
    const { userId, productId } = await request.json();
  
    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
    }
  
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
  
    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json({ message: 'Item removed from wishlist' });
  }