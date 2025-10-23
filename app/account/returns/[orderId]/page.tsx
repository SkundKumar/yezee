
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import ReturnForm from './ReturnForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Initialize Supabase client with the service role key for admin-level access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This is the server-side page component for submitting a return request.
// It fetches initial order data and handles user authentication securely on the server.
export default async function RequestReturnPage({ params }: { params: { orderId: string } }) {
  const orderId = params.orderId;

  // 1. Authentication & Authorization Check using Clerk on the server
  const { userId } = await auth(); // <-- CORRECTED: Added await here
  if (!userId) {
    // Redirect unauthenticated users to the sign-in page.
    redirect('/sign-in');
  }

  // 2. Data Fetching: Get the order details to display on the page.
  //    The user_id filter ensures a user can only fetch their own order.
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_details
    `)
    .eq('id', orderId)
    .eq('user_id', userId) // <-- Crucial security check
    .single();

  // 3. Error Handling: If the order doesn't exist or doesn't belong to the user, show an error.
  if (error || !order) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="max-w-md mx-auto border-red-500">
                <CardHeader><CardTitle className="text-red-600">Error</CardTitle></CardHeader>
                <CardContent><p>Could not find the requested order. It may not exist or you may not have permission to view it.</p></CardContent>
            </Card>
        </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Request a Return</CardTitle>
                <p className="text-sm text-muted-foreground pt-2">
                    Order ID: {order.order_details?.receipt_id || order.id}
                </p>
            </CardHeader>
            <CardContent>
                {/* The ReturnForm is a client component that handles the form submission logic */}
                <ReturnForm orderId={order.id} />
            </CardContent>
        </Card>
    </div>
  );
}
