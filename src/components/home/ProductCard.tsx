'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart } from 'lucide-react'

export interface ProductCardProduct {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  stock: number
  featured?: boolean
}

interface ProductCardProps {
  product: ProductCardProduct
  formatPrice: (price: number) => string
  onAddToCart: (product: ProductCardProduct, e: React.MouseEvent) => void
  onToggleWishlist?: (product: ProductCardProduct, e: React.MouseEvent) => void
  isInWishlist?: (productId: string) => boolean
  priority?: boolean
}

export function ProductCard({
  product,
  formatPrice,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  priority = false,
}: ProductCardProps) {
  const inWishlist = isInWishlist?.(product.id) ?? false
  const imageSrc = product.images?.[0]?.trim() || '/placeholder-product.jpg'
  const hasImage = product.images?.length && product.images[0]?.trim() !== ''

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <article className="flex flex-col h-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-md hover:shadow-lg border border-transparent hover:border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] min-w-0 md:rounded-lg md:shadow-sm md:hover:shadow-md">
        {/* Image: tall aspect ratios for a premium, gallery-like feel */}
        <div className="relative aspect-[2/3] md:aspect-[3/4] overflow-hidden bg-[var(--muted)]">
          {hasImage ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 320px"
              className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
              <span className="text-4xl">—</span>
            </div>
          )}

          {/* Wishlist heart - subtle, top right */}
          {onToggleWishlist && (
            <button
              type="button"
              aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-sm z-10 hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleWishlist(product, e)
              }}
            >
              <Heart
                className={`h-4 w-4 ${inWishlist ? 'fill-foreground text-foreground' : 'text-foreground'}`}
              />
            </button>
          )}

          {/* Add to cart - fades in on hover; on touch always visible so button stays in bounds */}
          <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/50 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden">
            <Button
              size="sm"
              className="w-full min-w-0 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 font-medium transition-colors duration-300 text-xs sm:text-sm justify-center py-2"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToCart(product, e)
              }}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mr-1.5 sm:mr-2" />
              <span className="min-w-0 truncate" title={product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}>{product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}</span>
            </Button>
          </div>
        </div>

        {/* Content: more vertical padding and spacing on mobile for premium feel */}
        <div className="px-4 py-5 flex flex-col flex-grow md:p-4">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-2 md:mb-1">
            {product.category}
          </p>
          <h3
            className="font-serif text-[var(--foreground)] text-base sm:text-lg leading-snug mb-3 line-clamp-2 md:mb-2"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            {product.name}
          </h3>
          <p className="text-sm font-semibold text-[var(--foreground)] mt-auto pt-0.5">
            {formatPrice(product.price)}
            {product.originalPrice != null && product.originalPrice > product.price && (
              <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </p>
        </div>
      </article>
    </Link>
  )
}
