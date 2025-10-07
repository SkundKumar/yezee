'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export const CartContext = createContext<any>(null);

const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error("Failed to fetch cart.");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
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
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      // Add the item optimistically using its own flat structure
      const newItem = { ...product, quantity: 1 };
      setItems(prev => [...prev, newItem]);
      toast.success(`${product.name} added to cart!`);
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
    
    setItems(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, quantity } 
        : item
    ));

    await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  };

  const removeItem = async (productId: number) => {
    if (!user) return;

    setItems(prev => prev.filter(item => item.id !== productId));
    toast.success("Item removed from cart.");

    await fetch('/api/cart', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
    });
  };
  
  const clearCart = () => {
    setItems([]);
    // Here you could also add a call to a backend endpoint to clear the cart in the DB
  }

  // **THE FIX**: This now uses the correct `item.price` which matches the API response.
  const cartTotal = items.reduce((total, item) => {
    const price = item.price || 0; // Use item.price directly
    const quantity = item.quantity || 0;
    return total + (parseFloat(price) * quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ isOpen, setIsOpen, items, addItem, removeItem, updateQuantity, cartTotal, isLoading, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
