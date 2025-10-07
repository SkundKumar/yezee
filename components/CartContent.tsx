
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { toast } from 'sonner';
import { AddressForm } from '@/components/AddressForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
  name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface CartItem {
  id: number; // This is the product_id
  cart_item_id: number;
  name: string;
  price: string;
  quantity: number;
  images: { src: string }[];
  cart_item_notes: { note: string }[];
}

interface CartContentProps {
  cartItems: CartItem[];
  updateQuantity: (itemId: number, quantity: number) => void;
}

export default function CartContent({ cartItems, updateQuantity }: CartContentProps) {
  const { user } = useUser();
  const { clearCart, setIsOpen } = useCart();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [editingNote, setEditingNote] = useState<Record<number, boolean>>({});
  const [address, setAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!user) { setLoadingAddress(false); return; }
      try {
        const response = await fetch('/api/user/address');
        if (response.ok) setAddress((await response.json()).address);
      } catch (error) { console.error('Failed to fetch address', error); }
      finally { setLoadingAddress(false); }
    };

    if (user) fetchAddress();
    else setLoadingAddress(false);

  }, [user]);

  useEffect(() => {
    const initialNotes: Record<number, string> = {};
    const initialEditing: Record<number, boolean> = {};
    cartItems.forEach(item => {
        const noteKey = item.cart_item_id;
        const savedNote = item.cart_item_notes?.[0]?.note;
        initialNotes[noteKey] = savedNote || '';
        initialEditing[noteKey] = !savedNote;
    });
    setNotes(initialNotes);
    setEditingNote(initialEditing);
  }, [cartItems]);

  const handleNoteChange = (itemId: number, note: string) => {
    if (note.split(' ').filter(Boolean).length <= 20) {
      setNotes(prev => ({ ...prev, [itemId]: note }));
    }
  };

  const handleSaveNote = async (itemId: number) => {
    try {
      const response = await fetch('/api/cart/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, note: notes[itemId] || '' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note');
      }
      setEditingNote(prev => ({ ...prev, [itemId]: false }));
      toast.success('Note saved successfully!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handlePayment = async () => {
    if (!user) { toast.error('You must be logged in.'); return; }
    if (!address) { toast.error('Please provide a shipping address.'); return; }

    setIsOpen(false);

    // THE FINAL, CORRECTED PAYLOAD
    const cartDetails = {
        // FIX 1: The shipping address is now included
        shippingAddress: address,
        products: cartItems.map(item => ({
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price || '0'),
        })),
        // FIX 2: The notes are now correctly structured for the backend
        notes: Object.keys(notes)
          .map(cartItemIdStr => {
            const cartItemId = Number(cartItemIdStr);
            const item = cartItems.find(ci => ci.cart_item_id === cartItemId);
            return item ? {
              product_id: item.id, // item.id is the product_id
              note: notes[cartItemId]
            } : null;
          })
          .filter((n): n is { product_id: number; note: string; } => n !== null && !!n.note),
    };

    try {
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The body now contains the complete and correct data
        body: JSON.stringify({ cartDetails }),
      });

      const result = await checkoutResponse.json();
      if (!checkoutResponse.ok) {
          throw new Error(result.message || 'Checkout failed');
      }

      const { order, newOrderId } = result; 

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'RVRavien',
        description: 'Cart Payment',
        order_id: order.id,
        handler: async (response: any) => {
          toast.success('Payment successful! Your order has been placed.');
          clearCart();
          window.location.href = `/order/success?order_id=${newOrderId}`;
        },
        prefill: { name: address.name, contact: address.phone_number },
        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const { subtotal, notesTotal, total } = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price || '0') * item.quantity), 0);
    const notesTotal = Object.values(notes).reduce((acc, note) => acc + (note ? 10 : 0), 0);
    const total = subtotal + notesTotal;
    return { subtotal, notesTotal, total };
  }, [cartItems, notes]);


  if (loadingAddress) return <div>Loading...</div>;

  return (
    <SheetContent className="w-full sm:max-w-lg p-0">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <SheetHeader className="p-6 border-b"><SheetTitle>Shopping Cart</SheetTitle></SheetHeader>
      <div className="flex-1 overflow-y-auto px-6">
        {cartItems.length > 0 ? (
          <ul className="-my-6 divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.id} className="flex flex-col py-6">
                <div className="flex">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image src={item.images?.[0]?.src || '/placeholder.svg'} alt={item.name} width={96} height={96} className="h-full w-full object-contain p-1"/>
                  </div>
                  <div className="ml-4 flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium"><h3 className='pr-2'>{item.name}</h3><p className="ml-4">₹{item.price}</p></div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center"><button className="p-1" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button><span className="px-2">{item.quantity}</span><button className="p-1" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button></div>
                      <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500" onClick={() => updateQuantity(item.id, 0)}>Remove</button>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                    {editingNote[item.cart_item_id] ? (
                        <>
                        <Textarea placeholder="Add a note (max 20 words)..." value={notes[item.cart_item_id] || ''} onChange={(e) => handleNoteChange(item.cart_item_id, e.target.value)} />
                        <div className="text-xs text-gray-500 text-right mt-1">{notes[item.cart_item_id]?.split(' ').filter(Boolean).length || 0}/20 words</div>
                        <Button size="sm" className="mt-2" onClick={() => handleSaveNote(item.cart_item_id)} disabled={!notes[item.cart_item_id] || notes[item.cart_item_id].trim() === ''}>Save Note</Button>
                        </>
                    ) : (
                        <div className='flex items-center justify-between'>
                        <p className='text-sm text-gray-600 border p-2 rounded-md w-full'>Note: {notes[item.cart_item_id] || 'No note added.'}</p>
                        <Button size="sm" variant="outline" className="ml-2" onClick={() => setEditingNote({ ...editingNote, [item.cart_item_id]: true })}>Edit</Button>
                        </div>
                    )}
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-center py-10">Your cart is empty.</p>}
      </div>
      {cartItems.length > 0 && (
        <div className="border-t px-4 py-6 sm:px-6">
          <Card className="mb-4">
            <CardHeader><CardTitle>{address ? 'Shipping Address' : 'Add Shipping Address'}</CardTitle></CardHeader>
            <CardContent>
              {address ? (
                <div>
                  <p><strong>{address.name}</strong>, {address.phone_number}</p>
                  <p>{address.street_address}, {address.city}, {address.state} {address.postal_code}</p>
                  <Button onClick={() => setAddress(null)} variant="outline" className="mt-2">Edit Address</Button>
                </div>
              ) : <AddressForm onSave={(newAddress) => setAddress(newAddress)} />}
            </CardContent>
          </Card>
          <div className="flex justify-between text-base font-medium"><p>Subtotal</p><p>₹{subtotal.toFixed(2)}</p></div>
          <div className="flex justify-between text-sm font-medium text-gray-500"><p>Note Charges</p><p>₹{notesTotal.toFixed(2)}</p></div>
          <div className="flex justify-between text-base font-bold mt-2"><p>Total</p><p>₹{total.toFixed(2)}</p></div>
          <div className="mt-6">
            <Button onClick={handlePayment} disabled={!user || cartItems.length === 0 || !address} className="w-full flex items-center justify-center rounded-md border bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-indigo-700">Proceed to Pay</Button>
          </div>
        </div>
      )}
    </SheetContent>
  );
}
