import type { Metadata } from 'next'
import { DM_Mono } from 'next/font/google'
import './globals.css'
import CartProvider from '@/providers/cart-context'
import { WishlistProvider } from '@/providers/wishlist-context'
import { Header } from '@/components/Header' // Import the new Header

const dmmono = DM_Mono({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Yeezy Clone',
  description: 'Fake yeezy website. This is just for learning purpose.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmmono.className}>
        <CartProvider>
          <WishlistProvider>
            <Header /> {/* Add the Header here */}
            <main>{children}</main> {/* Page content will render here */}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}