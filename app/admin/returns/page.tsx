
'use client';

import { useEffect, useState } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface ReturnRequest {
  id: number;
  createdAt: string;
  status: string;
  receiptId: string;
}

export default function AdminReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const response = await fetch('/api/admin/returns');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch return requests.');
        }
        const data = await response.json();
        setRequests(data.requests);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

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

  return (
    <div className="container mx-auto py-10">
        <Card className="w-full max-w-6xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className='text-3xl font-bold'>Manage Return Requests</CardTitle>
                <CardDescription>View and manage all customer return requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {requests.length > 0 ? (
                    <DataTable columns={columns} data={requests} />
                ) : (
                  <p className='text-center text-gray-500 py-8'>No return requests found.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
