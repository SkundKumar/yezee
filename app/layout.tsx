import type { Metadata } from 'next';
import { DM_Mono } from 'next/font/google';
import './globals.css';
import CartProvider from '@/providers/cart-context';
import { WishlistProvider } from '@/providers/wishlist-context';
import { Header } from '@/components/Header';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';

const dmmono = DM_Mono({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = { title: 'Yeezy Clone' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={dmmono.className}>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main>{children}</main>
              <Toaster position="top-center" richColors />
            </WishlistProvider>
          </CartProvider>
          <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
        </body>
      </html>
    </ClerkProvider>
  );
}