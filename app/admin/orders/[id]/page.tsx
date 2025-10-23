'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from 'lucide-react';

const capitalize = (s: string) => {
  if (typeof s !== 'string' || s.length === 0) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface LineItem {
  product_name: string;
  note: string;
  quantity: number;
  price: number;
}

interface TrackingDetails {
  id: number | null;
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
  const { id } = params;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch order details');
      }
      const data = await response.json();
      setOrder(data.order);
      setSelectedStatus(capitalize(data.order.tracking.status));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !selectedStatus) return;

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: selectedStatus })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      await fetchOrderDetails(); 
      setUpdateMessage("Status updated successfully!");

    } catch (err: any) {
      setUpdateMessage(err.message || "An error occurred during the update.");
    } finally {
      setIsUpdating(false);
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 md:p-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-lg mx-4 border-red-500">
                <CardHeader><CardTitle className="text-red-600">Error</CardTitle></CardHeader>
                <CardContent><p>{error}</p></CardContent>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                    <TableHead>Note</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.note}</TableCell>
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
            <CardHeader><CardTitle>Manage Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">Current Status:</p>
                    <Badge>{capitalize(order.tracking.status)}</Badge>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Change status..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleStatusUpdate} disabled={isUpdating || selectedStatus.toLowerCase() === order.tracking.status.toLowerCase()} className="w-full">
                    {isUpdating ? "Updating..." : "Update Status"}
                </Button>
                {updateMessage && <p className="text-sm text-center text-gray-600 mt-2">{updateMessage}</p>}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader><CardTitle>Tracking</CardTitle></CardHeader>
            <CardContent>
              <p><strong>Courier:</strong> {order.tracking.courier}</p>
              <p><strong>Number:</strong> {order.tracking.tracking_number}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
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
