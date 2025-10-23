
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, PackageOpen } from 'lucide-react';

interface ReturnDetails {
    id: number;
    created_at: string;
    status: string;
    reason: string;
    image_url?: string;
    tags_intact: boolean;
    order: {
        order_details: { receipt_id: string; line_items: any[] };
    };
    user: {
        name: string;
    };
}

export default function ReturnDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const returnId = params.id as string;

    const [details, setDetails] = useState<ReturnDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (returnId) {
            fetchReturnDetails();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [returnId]);

    const fetchReturnDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/returns/${returnId}`, { cache: 'no-store' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch return details');
            }
            const data = await response.json();
            setDetails(data.request);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: 'Accepted' | 'Denied' | 'Returned') => {
        setIsUpdating(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/returns/${returnId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }
            await fetchReturnDetails(); // Re-fetch to show the latest status
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUpdating(false);
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

    if (!details) {
        return <div className="container mx-auto p-4 md:p-8 text-center">Return request not found.</div>;
    }

    const { order_details } = details.order;
    const { user } = details;
    
    const renderActionButtons = () => {
        switch (details.status) {
            case 'Processing':
                return (
                    <CardFooter className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={() => handleUpdateStatus('Denied')} disabled={isUpdating}>
                            <XCircle className="mr-2 h-4 w-4" /> Deny
                        </Button>
                        <Button onClick={() => handleUpdateStatus('Accepted')} disabled={isUpdating}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Accept
                        </Button>
                    </CardFooter>
                );
            case 'Accepted':
                return (
                    <CardFooter className="flex justify-end space-x-4">
                        <Button onClick={() => handleUpdateStatus('Returned')} disabled={isUpdating}>
                            <PackageOpen className="mr-2 h-4 w-4" /> Mark as Returned
                        </Button>
                    </CardFooter>
                );
            default:
                return null; // No actions for 'Denied' or 'Returned' statuses
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/returns')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Returns
            </Button>
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Return Request Details</CardTitle>
                            <p className="text-sm text-muted-foreground pt-1">Order ID: {order_details.receipt_id}</p>
                        </div>
                        <Badge variant={details.status === 'Accepted' ? 'secondary' : details.status === 'Denied' ? 'destructive' : 'outline'}>
                            {details.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-semibold">Customer Information</h4>
                        <p>{user.name}</p>
                        
                        <h4 className="font-semibold pt-4">Reason for Return</h4>
                        <p className="text-sm p-4 bg-gray-50 rounded-md border">{details.reason}</p>
                        <p>Tags Intact: <span className="font-medium">{details.tags_intact ? 'Yes' : 'No'}</span></p>

                    </div>
                    <div>
                        <h4 className="font-semibold">Product Image</h4>
                        {details.image_url ? (
                            <a href={details.image_url} target="_blank" rel="noopener noreferrer">
                                <img src={details.image_url} alt="Return" className="rounded-lg border w-full max-w-sm" />
                            </a>
                        ) : (
                            <p>No image provided.</p>
                        )}
                    </div>
                </CardContent>
                {renderActionButtons()}
            </Card>
        </div>
    );
}
