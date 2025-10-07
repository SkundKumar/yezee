
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: number;
  created_at: string;
  order_details: {
    receipt_id: string;
    total: number;
    notes_total: number;
    shipping_address: {
      name: string;
      phone_number: string;
      street_address: string;
      city: string;
      state: string;
      postal_code: string;
    };
    products: {
      name: string;
      quantity: number;
      price: number;
    }[];
    notes: {
        note: string;
    }[];
  };
}

export default function PackagingDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        // **THE FIX IS HERE**: We will now read the API response to get the real error.
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            setError('You do not have permission to view this page.');
          } else {
            // Display the actual error message from the API.
            throw new Error(data.message || 'Failed to fetch orders');
          }
        } else {
          setOrders(data.orders);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchOrders();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  if (loading || !isLoaded) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (!isSignedIn || !isAdmin) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                      <CardTitle>Access Denied</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p>You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.</p>
                  </CardContent>
              </Card>
          </div>
      );
  }

  // Now, if there is an error, we will see the detailed message.
  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className='text-red-500'>{error}</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Packaging Dashboard</h1>
      {orders.length === 0 ? (
        <Card><CardContent><p className='p-6'>No orders found.</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="flex flex-wrap justify-between items-center gap-2">
                    <span>Order: {order.order_details.receipt_id}</span>
                    <Badge variant="secondary">{new Date(order.created_at).toLocaleString()}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Shipping Address</h3>
                    <div className='text-sm'>
                        <p><strong>{order.order_details.shipping_address.name}</strong></p>
                        <p>{order.order_details.shipping_address.street_address}</p>
                        <p>{order.order_details.shipping_address.city}, {order.order_details.shipping_address.state} {order.order_details.shipping_address.postal_code}</p>
                        <p>Tel: {order.order_details.shipping_address.phone_number}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Items to Pack</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {order.order_details.products.map((product, index) => (
                            <li key={index}><strong>{product.quantity}x</strong> {product.name}</li>
                        ))}
                    </ul>
                </div>
                {order.order_details.notes && order.order_details.notes.length > 0 && (
                    <div className="md:col-span-2 space-y-2 pt-4 border-t">
                        <h3 className="font-bold text-lg">Special Instructions</h3>
                        {order.order_details.notes.map((note, index) => (
                            <p key={index} className='text-sm p-2 bg-yellow-100 rounded'>{note.note}</p>
                        ))}
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
