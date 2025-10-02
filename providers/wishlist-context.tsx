'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const FAKE_USER_ID = 'guest_user_123';

// Define the shape of our context
interface WishlistContextType {
  wishlistItems: any[];
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist?user_id=${FAKE_USER_ID}`);
      if (!response.ok) return;
      const data = await response.json();
      setWishlistItems(data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const addToWishlist = async (productId: number) => {
    try {
      const response = await fetch(`/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: FAKE_USER_ID, productId }),
      });
      if (!response.ok) throw new Error('Could not add to wishlist.');
      fetchWishlist(); // Refresh the list
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      const response = await fetch(`/api/wishlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: FAKE_USER_ID, productId }),
      });
      if (!response.ok) throw new Error('Could not remove from wishlist.');
      fetchWishlist(); // Refresh the list
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  // Helper function to check if a product is in the wishlist
  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);
  
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