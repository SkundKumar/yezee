
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Initialize Supabase client with the service role key for admin-level access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const reason = formData.get('reason') as string;
    const tagsIntact = formData.get('tagsIntact') === 'true';
    const file = formData.get('image') as File | null;

    let imageUrl: string | undefined;

    // 1. Handle Image Upload (if a file is provided)
    if (file && file.size > 0) {
      const fileExtension = file.name.split('.').pop();
      // CORRECTED: Generate a unique filename without UUID
      const fileName = `${userId}-${Date.now()}.${fileExtension}`; 
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('return_images')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }
      
      // Construct the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
          .from('return_images')
          .getPublicUrl(uploadData.path);

      imageUrl = publicUrlData.publicUrl;

    } else {
        // Explicitly set imageUrl to undefined if no file is uploaded.
        imageUrl = undefined;
    }

    // 2. Insert Return Request into the database
    const { data: requestData, error: requestError } = await supabase
      .from('return_requests')
      .insert({
        order_id: parseInt(orderId),
        reason: reason,
        image_url: imageUrl,
        tags_intact: tagsIntact,
        user_id: userId, // Associate the request with the logged-in user
        status: 'Processing', // Default status
      })
      .select()
      .single();

    if (requestError) {
      throw new Error(`Database insert failed: ${requestError.message}`);
    }

    return NextResponse.json({ success: true, request: requestData });

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        message: 'An unexpected error occurred.',
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

