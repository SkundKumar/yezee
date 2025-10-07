
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      .select(`
        id,
        product_id,
        quantity,
        cart_item_notes ( note )
      `)
      .eq('user_id', userId);
  
    if (supabaseError) return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    if (!cartItems || cartItems.length === 0) return NextResponse.json([]);
  
    const productIds = cartItems.map(item => item.product_id);
    try {
      const { data: products } = await wooCommerce.get('products', { include: productIds });
  
      const fullCartItems = products.map((product: any) => {
          const cartItem = cartItems.find(item => item.product_id === product.id);
          // **THE FIX IS HERE**
          // We now return BOTH the product ID (as `id`) and the unique cart_item_id.
          return {
              ...product, // Contains product.id from WooCommerce
              cart_item_id: cartItem ? cartItem.id : null, // The unique ID for the item in the cart table
              quantity: cartItem ? cartItem.quantity : 0,
              cart_item_notes: cartItem ? cartItem.cart_item_notes : [] // Pass the full notes array
          };
      });
      return NextResponse.json(fullCartItems);
    } catch (wooError: any) { return NextResponse.json({ error: wooError.message }, { status: 500 }); }
}

// POST (add or update) an item in the cart
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, quantity } = await request.json();

  const { data: existingItem, error: selectError } = await supabase
    .from('cart_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (existingItem && quantity > 0) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: quantity })
      .eq('id', existingItem.id)
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else if (quantity > 0) {
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity: quantity })
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Item removed from cart' });
  }
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
