'use client';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/providers/wishlist-context';

export const WishlistButton = ({ productId }: { productId: number }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const isWishlisted = isInWishlist(productId);

    const handleClick = () => {
        if (isWishlisted) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(productId);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="p-2 border rounded-full hover:bg-gray-100 transition"
            aria-label="Toggle Wishlist"
        >
            <Heart
                className={`h-6 w-6 ${isWishlisted ? 'text-red-500' : 'text-gray-500'}`}
                fill={isWishlisted ? 'currentColor' : 'none'}
            />
        </button>
    );
};