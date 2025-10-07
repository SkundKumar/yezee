
import type { Metadata } from 'next';
import { DM_Mono } from 'next/font/google';
import './globals.css';
import CartProvider from '@/providers/cart-context';
import { WishlistProvider } from '@/providers/wishlist-context';
import { Header } from '@/components/Header';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import { NotificationBar } from '@/components/NotificationBar';

const dmmono = DM_Mono({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = { title: 'RV' };
const notificationMessages = [
  'Amazing Deals! 🎉',
  'Free Shipping on All Orders! 🚚',
  'Explore Exclusive Designs! ✨',
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body className={dmmono.className}>
          <NotificationBar messages={notificationMessages} />
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main>{children}</main>
              <Toaster position="top-center" richColors />
            </WishlistProvider>
          </CartProvider>
          <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
        </body>
      </ClerkProvider>
    </html>
  );
}
