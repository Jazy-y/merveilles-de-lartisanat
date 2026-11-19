'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/components/providers/cart-provider'
import { ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { getCSRFToken } from '@/lib/csrf-client'
import { ProductGrid } from './ProductGrid'
import type { ProductCardProduct } from './ProductCard'

interface WishlistItem {
  id: string
  product: ProductCardProduct
}

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { dispatch: cartDispatch } = useCart()
  const { data: session } = useSession()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/products/featured')
        if (res.ok) {
          const data = await res.json()
          setFeaturedProducts(data.products.slice(0, 6))
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development')
          console.error('Error loading featured products:', error)
        setFeaturedProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadFeaturedProducts()
  }, [])

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (session) {
        try {
          const res = await fetch('/api/wishlist')
          if (res.ok) {
            const data = await res.json()
            setWishlistItems(data.wishlistItems)
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development')
            console.error('Error fetching wishlist items:', error)
        }
      }
    }
    fetchWishlistItems()
  }, [session])

  const handleAddToCart = (product: ProductCardProduct, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/placeholder-product.jpg',
      },
    })
  }

  const handleToggleWishlist = async (product: ProductCardProduct, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      toast.error('Veuillez vous connecter pour ajouter des articles à vos favoris.')
      return
    }
    const wishlistItem = wishlistItems.find((item) => item.product.id === product.id)
    try {
      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        toast.error('Erreur de sécurité. Veuillez rafraîchir la page.')
        return
      }
      if (wishlistItem) {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
          body: JSON.stringify({ wishlistItemId: wishlistItem.id }),
        })
        if (res.ok) {
          setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistItem.id))
          toast.success('Article retiré des favoris.')
        } else {
          const errorData = await res.json().catch(() => ({}))
          toast.error(errorData.error || "Échec de la suppression de l'article des favoris.")
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
          body: JSON.stringify({ productId: product.id }),
        })
        if (res.ok) {
          const data = await res.json()
          setWishlistItems((prev) => [...prev, data.wishlistItem])
          toast.success('Article ajouté aux favoris.')
        } else {
          const errorData = await res.json().catch(() => ({}))
          toast.error(errorData.error || "Échec de l'ajout de l'article aux favoris.")
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development')
        console.error('Error updating wishlist:', error)
      toast.error('Échec de la mise à jour des favoris.')
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(price)

  const isInWishlist = (productId: string) =>
    wishlistItems.some((item) => item?.product?.id === productId)

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto max-w-xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 xl:gap-8 max-w-[1280px] mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="aspect-[4/5] w-full rounded-sm" />
                <Skeleton className="h-4 w-16 mt-4" />
                <Skeleton className="h-6 w-3/4 mt-2" />
                <Skeleton className="h-5 w-20 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-[var(--background)]" suppressHydrationWarning={true}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-serif text-[var(--foreground)] mb-4"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Notre collection
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto leading-relaxed">
            Une sélection de pièces artisanales — vaisselle, linge de table et décor — pour une maison raffinée.
          </p>
        </header>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[var(--muted-foreground)] mb-8">
              Nos artisans préparent des pièces pour vous. Revenez bientôt.
            </p>
            <Link href="/products">
              <Button
                variant="outline"
                className="border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-300"
              >
                Explorer la collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <ProductGrid
              products={featuredProducts}
              formatPrice={formatPrice}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={isInWishlist}
              priorityCount={4}
            />
            <div className="text-center mt-12">
              <Link href="/products">
                <Button
                  variant="outline"
                  className="border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-300 rounded-sm"
                >
                  Voir toute la collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
