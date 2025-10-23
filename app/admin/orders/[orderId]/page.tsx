'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LineItem {
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
}

interface TrackingDetails {
  status: string;
  tracking_number: string;
  courier: string;
}

interface ShippingAddress {
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface OrderDetails {
  id: number;
  createdAt: string;
  total: number;
  receiptId: string;
  lineItems: LineItem[];
  tracking: TrackingDetails;
  shippingAddress: ShippingAddress;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          const response = await fetch(`/api/admin/orders/${orderId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch order details');
          }
          const data = await response.json();
          setOrder(data.order);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return <div className="container mx-auto p-4 md:p-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-lg mx-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return <div className="container mx-auto p-4 md:p-8 text-center">Order not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Order #{order.receiptId}</CardTitle>
              <CardDescription>Date: {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.variant_name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right font-bold text-lg mt-4">
                Total: ₹{order.total.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p><Badge>{order.tracking.status}</Badge></p>
              <p className="mt-2"><strong>Courier:</strong> {order.tracking.courier}</p>
              <p><strong>Number:</strong> {order.tracking.tracking_number}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>{order.shippingAddress.name}</strong></p>
              <p>{order.shippingAddress.street_address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}</p>
              <p>{order.shippingAddress.country}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
