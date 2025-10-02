'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs'; // Import the Clerk hook
import { toast } from 'sonner';

interface WishlistContextType {
  wishlistItems: any[];
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]); // Clear wishlist if user logs out
      return;
    }
    try {
      // The GET request no longer needs to send a user_id
      const response = await fetch(`/api/wishlist`);
      if (!response.ok) return;
      const data = await response.json();
      setWishlistItems(data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const addToWishlist = async (productId: number) => {
    if (!user) {
      toast.error("Please sign in to add items to your wishlist.");
      return;
    }
    try {
      // We only need to send the productId now
      const response = await fetch(`/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) throw new Error('Could not add to wishlist.');
      toast.success("Added to wishlist!");
      fetchWishlist();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    try {
        // We only need to send the productId now
        const response = await fetch(`/api/wishlist`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
        });
        if (!response.ok) throw new Error('Could not remove from wishlist.');
        toast.success("Removed from wishlist!");
        fetchWishlist();
    } catch (error: any) {
        toast.error(error.message);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId);
  };

  useEffect(() => {
    if (isLoaded) {
      fetchWishlist();
    }
  }, [isLoaded, user]);

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};