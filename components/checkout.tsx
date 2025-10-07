
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
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

export default function Checkout() {
  const { user } = useUser();
  const [address, setAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const { items: cartItems, clearCart, isLoading: isCartLoading } = useCart();

  useEffect(() => {
    async function fetchAddress() {
      if (!user) {
        setLoadingAddress(false);
        return;
      }
      try {
        const response = await fetch('/api/user/address');
        if (response.ok) {
          const data = await response.json();
          setAddress(data.address);
        }
      } catch (error) {
        console.error('Failed to fetch address', error);
      } finally {
        setLoadingAddress(false);
      }
    }

    if (user) {
        fetchAddress();
    }
  }, [user]);

  const handlePayment = async () => {
    if (!user || !address) {
      toast.error('You must be logged in and have an address saved to proceed.');
      return;
    }

    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const { order, newOrderId } = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Your E-Commerce Store',
        description: 'Test Transaction',
        order_id: order.id,
        handler: async function (response: any) {
          toast.success('Payment successful!');
          clearCart();
          window.location.href = `/order/success?order_id=${newOrderId}`;
        },
        prefill: {
          name: address.name,
          contact: address.phone_number,
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) { 
      console.error('Payment failed:', error);
      toast.error('Failed to initiate payment.');
    }
  };

  const calculateTotal = () => {
    if (!cartItems) return '0.00';
    return cartItems.reduce((acc, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return acc + (parseFloat(price) * quantity);
    }, 0).toFixed(2);
  };

  if (loadingAddress || isCartLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{address ? 'Shipping Address' : 'Add Shipping Address'}</CardTitle>
              </CardHeader>
              <CardContent>
                {address ? (
                  <div>
                    <p><strong>{address.name}</strong></p>
                    <p>{address.street_address}</p>
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <p>Phone: {address.phone_number}</p>
                    <Button onClick={() => setAddress(null)} variant="outline" className="mt-4">Edit Address</Button>
                  </div>
                ) : (
                  <AddressForm onSave={(newAddress) => setAddress(newAddress)} />
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(cartItems || []).map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name || 'Item'} x {item.quantity}</span>
                      <span>₹{item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</span>
                    </div>
                  ))}
                </div>
                <hr className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <Button onClick={handlePayment} disabled={!address || !cartItems || cartItems.length === 0} className="w-full mt-6"> 
                  Proceed to Pay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
