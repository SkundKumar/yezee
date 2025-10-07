'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"; 
import { navbarData } from '@/lib/data';
import { Menu, X, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useCart } from '@/hooks/use-cart';
import CartContent from './CartContent'; // Updated import

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { 
    isOpen: isCartOpen, 
    setIsOpen: setIsCartOpen, 
    items: cartItems, 
    updateQuantity, 
  } = useCart();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Side: Logo */}
          <Link href="/" className="">
          <img className="w-24 h-15" src="/logo.png" alt="" />
          </Link>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            {navbarData.map((item) => (
              <Link href={item.link} key={item.idx} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Right Side: Actions (Wishlist, Cart, Auth, Mobile Menu) */}
          <div className="flex items-center gap-3">
            <Link href="/wishlist" aria-label="Wishlist" className="p-2 text-gray-600 hover:text-black transition-colors hidden sm:block">
              <Heart className="h-6 w-6" />
              
            </Link>
            
            <div className="sm:hidden w-full text-center">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="w-full text-sm border-1 p-2 rounded-xl border-black/30 font-semibold">Sign In</button>
                    </SignInButton>
                </SignedOut>

                <SignedIn>
    <UserButton afterSignOutUrl="/" />
  </SignedIn>
            </div>
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <button aria-label="Open cart" className="relative p-2 text-gray-600 hover:text-black transition-colors">
                  <ShoppingBag className="h-6 w-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-black text-white rounded-full">
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              {/* Use the new CartContent component */}
              <CartContent 
                cartItems={cartItems} 
                updateQuantity={updateQuantity}
              />
            </Sheet>

            <div className="hidden sm:flex items-center gap-2">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black">Sign In</button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
            
            {/* Mobile Menu Hamburger Button */}
            <button className="p-2 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t shadow-md p-4 flex flex-col items-center gap-4 z-20">
            {navbarData.map((item) => (
              <Link href={item.link} key={item.idx} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-primary py-2">
                {item.title}
              </Link>
            ))}
             
          </div>
        )}
      </div>
    </header>
  );
}