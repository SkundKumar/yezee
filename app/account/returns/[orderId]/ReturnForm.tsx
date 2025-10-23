
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ReturnFormProps {
  orderId: number;
}

// This is the client-side component that renders the actual return request form.
export default function ReturnForm({ orderId }: ReturnFormProps) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [tagsIntact, setTagsIntact] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('orderId', String(orderId));
    formData.append('reason', reason);
    formData.append('tagsIntact', String(tagsIntact));
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        body: formData, // No need for Content-Type header, browser sets it for FormData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }
      
      setSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
        <div className="text-center p-8">
            <CardTitle className="mb-4">Request Submitted!</CardTitle>
            <p className="text-muted-foreground mb-6">Your return request has been submitted for review. We will notify you of the outcome shortly.</p>
            <Button onClick={() => router.push('/orders')}>Back to My Orders</Button>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Return</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please describe the issue with the item..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Upload a Photo</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          required
        />
        <p className="text-sm text-muted-foreground">Please provide a clear photo of the item, showing any defects if applicable.</p>
      </div>

      <div className="flex items-center space-x-2">
         <Checkbox
            id="tagsIntact"
            checked={tagsIntact}
            onCheckedChange={(checked) => setTagsIntact(checked === true)} 
        />
        <Label htmlFor="tagsIntact">Are the original tags still attached?</Label>
      </div>

      <CardFooter className="flex justify-end p-0 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </CardFooter>
    </form>
  );
}
