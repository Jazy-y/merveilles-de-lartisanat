'use client'

import { ProductCard, type ProductCardProduct } from './ProductCard'

interface ProductGridProps {
  products: ProductCardProduct[]
  formatPrice: (price: number) => string
  onAddToCart: (product: ProductCardProduct, e: React.MouseEvent) => void
  onToggleWishlist?: (product: ProductCardProduct, e: React.MouseEvent) => void
  isInWishlist?: (productId: string) => boolean
  /** Set true for the first N images (e.g. first 4) for LCP */
  priorityCount?: number
}

export function ProductGrid({
  products,
  formatPrice,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  priorityCount = 0,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 md:gap-5 xl:gap-8 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          formatPrice={formatPrice}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={isInWishlist}
          priority={index < priorityCount}
        />
      ))}
    </div>
  )
}
