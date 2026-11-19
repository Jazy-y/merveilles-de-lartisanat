import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/components/providers/cart-provider'
import { AddToCartModal } from '@/components/cart/AddToCartModal'
import { WishlistProvider } from '@/components/providers/wishlist-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ErrorBoundary } from '@/components/error-boundary'
// Firestore debug removed after migration to Prisma
// import { HydrationCleanup } from '@/components/hydration-cleanup'

export const metadata: Metadata = {
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  preload: true
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  preload: true
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="/fix-hydration.js" async></script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} font-body`} suppressHydrationWarning={true}>
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                {/* <HydrationCleanup /> */}
                <div className="min-h-screen flex flex-col" suppressHydrationWarning={true}>
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
                <AddToCartModal />
                <Toaster />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}