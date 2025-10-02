'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"; 
import { navbarData } from '@/lib/data';
import { Menu, X, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Checkout from './checkout';

// This is your working CartContent component, it remains unchanged
const CartContent = ({ cartItems, updateQuantity, removeFromCart, cartTotal }: any) => {
    return (
        <>
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
          </SheetHeader>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pt-20">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="font-semibold text-lg">Your cart is empty</h3>
              <p className="text-gray-500 text-sm">Add items to see them here.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6">
                <ul className="-my-6 divide-y divide-gray-200">
                  {cartItems.map((item: any) => (
                    <li key={item.id} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image src={item.images?.[0]?.src || '/placeholder.svg'} alt={item.name} width={96} height={96} className="h-full w-full object-contain p-1"/>
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">₹{item.price}</p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center">
                            <button className="p-1" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                            <p className="mx-2">{item.quantity}</p>
                            <button className="p-1" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                          </div>
                          <div className="flex">
                            <button onClick={() => removeFromCart(item.id)} type="button" className="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Subtotal</p>
                  <p>₹{cartTotal}</p>
                </div>
                <Checkout />
              </div>
            </div>
          )}
        </>
      );
};


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { 
    isOpen: isCartOpen, 
    setIsOpen: setIsCartOpen, 
    items: cartItems, 
    updateQuantity, 
    removeItem: removeFromCart, 
    cartTotal 
  } = useCart();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Side: Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tighter">RV</Link>

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
              <SheetContent className="w-full sm:max-w-lg p-0">
                 <CartContent 
                    cartItems={cartItems} 
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    cartTotal={cartTotal}
                 />
              </SheetContent>
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
             <div className="sm:hidden mt-4 border-t w-full text-center pt-4">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="w-full px-4 py-2 text-lg font-medium">Sign In</button>
                    </SignInButton>
                </SignedOut>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}