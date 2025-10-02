'use client';
import { useWishlist } from '@/providers/wishlist-context';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react'; // Import the X icon

export default function WishlistPage() {
  // --- 1. GET THE removeFromWishlist FUNCTION ---
  const { wishlistItems, removeFromWishlist } = useWishlist();

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <main className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="mt-4">Your wishlist is empty.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product: any) => (
          <div key={product.id} className="group relative border p-4 rounded-lg">
            <Link href={`/product/${product.id}`} className="block">
              <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 group-hover:opacity-75">
                <Image
                  src={product.images[0]?.src || '/placeholder.svg'}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="h-full w-full object-contain object-center"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                      {product.name}
                  </h3>
                </div>
                <p className="text-sm font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: product.price_html }} />
              </div>
            </Link>
            
            {/* --- 2. ADD THE REMOVE BUTTON HERE --- */}
            <button 
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-black hover:bg-gray-100 transition"
              aria-label="Remove from wishlist"
            >
                <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}