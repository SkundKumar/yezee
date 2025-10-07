
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// CORRECTED INTERFACE: Add tracking_details to show the order status
interface Order {
  id: number;
  created_at: string;
  tracking_details: {
      status: string;
  } | null;
  order_details: {
    receipt_id: string;
    total: number;
    shipping_address: {
      name: string;
      phone_number: string;
      street_address: string;
      city: string;
      state: string;
      postal_code: string;
    } | null;
    products: {
      product_id: number;
      name: string;
      quantity: number;
      price: number;
      note?: string | null;
    }[];
  };
}

function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/order/${orderId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch order details.');
        }
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading order details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!order) {
    return <div className="flex justify-center items-center h-screen">Order not found.</div>;
  }

  const deliveryEstimate = new Date();
  deliveryEstimate.setDate(deliveryEstimate.getDate() + 7);

  return (
    <div className="container mx-auto p-4 md:p-8">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
            <CardHeader className="bg-green-50 text-center p-6">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
                <CardTitle className="text-3xl font-bold text-green-800 mt-4">Thank You For Your Order!</CardTitle>
                <CardDescription className='text-green-700'>Your order has been placed successfully.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className='text-center'>
                    <p className="font-semibold">Order ID: {order.order_details.receipt_id}</p>
                    <p className='text-sm text-gray-600'>Estimated Delivery: <strong>{deliveryEstimate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> (5-7 business days)</p>
                </div>

                {/* ADDED ORDER STATUS SECTION */}
                <div className="border-t pt-4 text-center">
                    <h3 className="font-bold text-lg mb-2">Order Status</h3>
                    <Badge variant="secondary" className="text-base font-semibold">{order.tracking_details?.status || 'Processing'}</Badge>
                </div>

                <div className="border-t border-b py-4">
                    <h3 className="font-bold text-lg mb-2">Items Ordered</h3>
                    <ul className="space-y-4">
                        {order.order_details.products.map((product, index) => (
                            <li key={index} className='text-sm'>
                                <div className="flex justify-between items-center">
                                    <span><strong>{product.quantity}x</strong> {product.name}</span>
                                    <span>${(product.price * product.quantity).toFixed(2)}</span>
                                </div>
                                {product.note && (
                                    <p className="text-xs text-gray-600 mt-1 pl-5 p-2 bg-gray-50 rounded-md"><em>Note: {product.note}</em></p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between items-center font-bold text-lg mt-4 pt-4 border-t">
                        <span>Total Paid</span>
                        <span>${order.order_details.total.toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-2">Shipping To</h3>
                    {order.order_details.shipping_address ? (
                        <div className='text-sm text-gray-700'>
                            <p><strong>{order.order_details.shipping_address.name}</strong></p>
                            <p>{order.order_details.shipping_address.street_address}</p>
                            <p>{order.order_details.shipping_address.city}, {order.order_details.shipping_address.state} {order.order_details.shipping_address.postal_code}</p>
                        </div>
                    ) : (
                        <p className='text-sm text-gray-500'>No shipping address provided.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

export default function SuccessPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessPage />
        </Suspense>
    );
}
