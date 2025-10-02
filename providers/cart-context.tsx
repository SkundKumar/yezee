'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export const CartContext = createContext<any>(null);

const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  // Fetches the full cart from our backend
  const fetchCart = async () => {
      if (!user) {
          setItems([]); // Clear cart if user logs out
          return;
      };
      try {
          // This GET request now fetches the user's saved cart from the DB
          const response = await fetch('/api/cart');
          if (!response.ok) throw new Error("Failed to fetch cart.");
          const data = await response.json();
          setItems(data);
      } catch (error) {
          console.error("Failed to fetch cart:", error);
      }
  };

  useEffect(() => {
      // Fetch the cart only when Clerk has loaded the user's status
      if(isLoaded) {
        fetchCart();
      }
  }, [isLoaded, user]);

  const addItem = async (product: any) => {
    if (!user) {
        toast.error("Please sign in to add items to your cart.");
        return;
    }

    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
        // If item exists, just update its quantity
        updateQuantity(product.id, existingItem.quantity + 1);
    } else {
        // Optimistically add to UI
        setItems(prev => [...prev, {...product, quantity: 1}]);
        toast.success(`${product.name} added to cart!`);

        // Sync with backend
        await fetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
    }
    setIsOpen(true);
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
        removeItem(productId);
        return;
    }

    // Optimistically update UI
    setItems(prev => prev.map(item => item.id === productId ? {...item, quantity} : item));

    // Sync with backend
    await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
    });
  };

  const removeItem = async (productId: number) => {
    if (!user) return;

    // Optimistically update UI
    setItems(prev => prev.filter(item => item.id !== productId));
    toast.success("Item removed from cart.");

    // Sync with backend
    await fetch('/api/cart', {
        method: 'DELETE',
        body: JSON.stringify({ productId }),
    });
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ isOpen, setIsOpen, items, addItem, removeItem, updateQuantity, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;