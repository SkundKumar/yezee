
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { cartDetails } = await req.json();

    if (!cartDetails || !cartDetails.products || !cartDetails.shippingAddress) {
        return NextResponse.json({ message: 'Invalid cart data: Missing products or shipping address.' }, { status: 400 });
    }

    // --- Calculation ---
    const productsTotal = cartDetails.products.reduce((acc: number, p: any) => acc + (p.price || 0) * p.quantity, 0);
    const notesTotal = cartDetails.notes.reduce((acc: number, n: any) => acc + (n.note ? 10 : 0), 0);
    const totalAmount = productsTotal + notesTotal;
    const amountInPaise = Math.round(totalAmount * 100);
    const receiptId = `rcpt_${Date.now()}`;

    // --- Razorpay Order ---
    const razorpayOrder = await razorpay.orders.create({ amount: amountInPaise, currency: 'INR', receipt: receiptId });

    // --- THE FINAL FIX: Step 1: Upsert Address Record ---
    // This correctly handles new and existing addresses.
    const shippingAddressFromCart = cartDetails.shippingAddress;
    const addressToUpsert = { ...shippingAddressFromCart, user_id: userId };

    const { data: upsertedAddress, error: addrErr } = await supabase
        .from('addresses')
        .upsert(addressToUpsert)
        .select('id')
        .single();

    if (addrErr || !upsertedAddress) {
      throw new Error(`Could not save/update shipping address: ${addrErr?.message || 'No address data returned.'}`);
    }
    const shippingAddressId = upsertedAddress.id;

    // --- Step 2: Create the Order with Notes inside the JSON ---
    const productsWithNotes = cartDetails.products.map((p: any) => {
        const noteRecord = cartDetails.notes.find((n: any) => n.product_id === p.product_id);
        return { ...p, note: noteRecord ? noteRecord.note : '' };
    });

    const orderDetailsJson = { razorpay_order_id: razorpayOrder.id, receipt_id: receiptId, products: productsWithNotes, subtotal: productsTotal, notes_total: notesTotal, total: totalAmount };
    const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({ user_id: userId, order_details: orderDetailsJson, shipping_address_id: shippingAddressId }).select('id').single();
    if (orderErr) {
      throw new Error(`Could not save order: ${orderErr.message}`);
    }
    const newOrderId = newOrder.id;

    // --- Step 3: Create Order Note Records ---
    if (cartDetails.notes?.length > 0) {
        const notesToInsert = cartDetails.notes.filter((n: any) => n.note).map((n: any) => ({ order_id: newOrderId, product_id: n.product_id, note: n.note }));
        if (notesToInsert.length > 0) {
            const { error: notesErr } = await supabase.from('order_notes').insert(notesToInsert);
            if (notesErr) {
                console.error('Failed to save order notes to order_notes table, but continuing...', notesErr.message)
            }
        }
    }

    // --- Step 4: Create the initial Tracking Details Record ---
    const { error: trackingErr } = await supabase.from('tracking_details').insert({ order_id: newOrderId, status: 'processing' });
    if (trackingErr) {
        console.error('Failed to create initial tracking record:', trackingErr.message);
    }

    // --- Success ---
    return NextResponse.json({ order: razorpayOrder, newOrderId: newOrderId });

  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
