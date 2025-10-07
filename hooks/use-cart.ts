
import { useContext } from 'react';
import { CartContext } from '@/providers/cart-context';

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  // The context now provides the cart items, functions to modify the cart, and the loading state.
  return context;
};
