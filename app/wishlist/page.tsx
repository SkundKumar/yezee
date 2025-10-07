
'use client';
import ProductGrid from '@/components/ProductGrid';
import { FadeIn } from '@/components/ui/animation';
import { useWishlist } from '@/providers/wishlist-context';

const WishlistPage = () => {
  const { wishlist } = useWishlist();

  return (
    <FadeIn>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Your Wishlist</h1>
        {wishlist.length > 0 ? (
          <ProductGrid products={wishlist} />
        ) : (
          <p className="text-center text-gray-500">Your wishlist is empty.</p>
        )}
      </div>
    </FadeIn>
  );
};

export default WishlistPage;
