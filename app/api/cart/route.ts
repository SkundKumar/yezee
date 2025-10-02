import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- THIS IS THE CORRECTED CONFIGURATION ---
const wooCommerce = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3',
});

// GET the user's full cart
export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
    const { data: cartItems, error: supabaseError } = await supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('user_id', userId);
  
    if (supabaseError) return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    if (!cartItems || cartItems.length === 0) return NextResponse.json([]);
  
    const productIds = cartItems.map(item => item.product_id);
    try {
      const { data: products } = await wooCommerce.get('products', { include: productIds });
  
      const fullCartItems = products.map((product: any) => {
          const cartItem = cartItems.find(item => item.product_id === product.id);
          return { ...product, quantity: cartItem ? cartItem.quantity : 0 };
      });
      return NextResponse.json(fullCartItems);
    } catch (wooError: any) { return NextResponse.json({ error: wooError.message }, { status: 500 }); }
}

// POST (add or update) an item in the cart
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, quantity } = await request.json();

  const { data, error } = await supabase
    .from('cart_items')
    .upsert({ user_id: userId, product_id: productId, quantity: quantity })
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE an item from the cart
export async function DELETE(request: NextRequest) {
    const { userId } =await  auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await request.json();

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Item removed from cart' });
}