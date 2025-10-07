
'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { navbarData } from '@/lib/data';

export default function MobileMenu() {
  return (
    <Sheet >
      <SheetTrigger asChild>
        <button className="p-2 md:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="top" className="w-full p-0">
        {/* Header for User Actions */}
        <SheetHeader className="flex-row items-center justify-between rounded-b-3xl p-4 border-1">
            <SignedIn>
                <div className="flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" />
                    <Link href="/orders" className="text-sm font-medium">My Orders</Link>
                </div>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="text-sm font-medium">Sign In</button>
                </SignInButton>
            </SignedOut>
        </SheetHeader>

        {/* Navigation Links */}
        <nav className="flex flex-col p-2 space-y-1">
          {navbarData.map((item) => (
            <Link 
              href={item.link} 
              key={item.idx} 
              className="block rounded-md p-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
