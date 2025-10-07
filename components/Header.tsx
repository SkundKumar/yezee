'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { navbarData } from '@/lib/data';
import { Heart, ShoppingBag, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'; // Ensure SheetContent is imported
import { useCart } from '@/hooks/use-cart';
import CartContent from './CartContent';
import MobileMenu from './MobileMenu';

export function Header() {
  const { 
    isOpen: isCartOpen, 
    setIsOpen: setIsCartOpen, 
    items: cartItems, 
    updateQuantity, 
  } = useCart();

  // Common Cart component to avoid repetition
  const renderCart = () => (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
            <button aria-label="Open cart" className="relative p-2 text-gray-600">
                <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-black text-white rounded-full">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
                )}
            </button>
        </SheetTrigger>
        <CartContent 
            cartItems={cartItems} 
            updateQuantity={updateQuantity}
        />
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* --- MOBILE HEADER (`md:hidden`) --- */}
          <div className="md:hidden flex w-full items-center justify-between">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-2">
              <MobileMenu />
              <Link href="/">
                <img className="w-20 h-auto" src="/logo.png" alt="Logo" />
              </Link>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-1">
              
              <Link href="/wishlist" aria-label="Wishlist" className="p-2 text-gray-600">
                <Heart className="h-5 w-5" />
              </Link>
              {renderCart()}
            </div>
          </div>

          {/* --- DESKTOP HEADER (`hidden md:flex`) --- */}
          <div className="hidden md:flex w-full items-center justify-between">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-6">
              <Link href="/">
                <img className="w-24 h-auto" src="/logo.png" alt="Logo" />
              </Link>
              <nav className="flex gap-6 items-center">
                {navbarData.map((item) => (
                  <Link href={item.link} key={item.idx} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: Actions + Icons */}
            <div className="flex items-center gap-4">
              <Link href="/wishlist" aria-label="Wishlist" className="p-2 text-gray-600 hover:text-black transition-colors">
                <Heart className="h-6 w-6" />
              </Link>
              
              <SignedIn>
                <Link href="/orders" aria-label="My Orders" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                    My Orders
                </Link>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black">Sign In</button>
                </SignInButton>
              </SignedOut>

              {renderCart()}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
