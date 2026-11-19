'use client'

import Link from 'next/link'
import { useWishlist } from '@/components/providers/wishlist-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { X, Heart } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category: string
  }
  addedAt: string
}

export default function WishlistPage() {
  const { data: session } = useSession()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (session) {
        try {
          setLoading(true)
          const res = await fetch('/api/wishlist')
          if (res.ok) {
            const data = await res.json()
            setWishlistItems(data.wishlistItems)
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching wishlist:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [session])

  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    try {
      const { getCSRFToken } = await import('@/lib/csrf-client')
      const csrfToken = await getCSRFToken()
      
      if (!csrfToken) {
        toast.error('Erreur de sécurité. Veuillez rafraîchir la page.')
        return
      }

      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ wishlistItemId }),
      })

      if (res.ok) {
        // Update UI immediately
        setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId))
        toast.success('Article retiré des favoris.')
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast.error(errorData.error || 'Impossible de retirer l\'article des favoris.')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error removing from wishlist:', error)
      toast.error('Impossible de retirer l\'article des favoris.')
    }
  }

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '0 DT'
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false
    if (typeof url !== 'string') return false
    if (url.trim() === '') return false
    if (url === 'undefined' || url === 'null') return false
    
    const trimmedUrl = url.trim()
    if (trimmedUrl.startsWith('data:') || 
        trimmedUrl.startsWith('http://') || 
        trimmedUrl.startsWith('https://') || 
        trimmedUrl.startsWith('/') ||
        trimmedUrl.includes('.')) {
      return true
    }
    
    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h3>
            <p className="text-gray-600 mb-6">You need to be signed in to view your wishlist.</p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ma Liste de Souhaits</h1>
          <p className="text-lg text-gray-600 mt-2">
            Vos articles artisanaux préférés, tous en un seul endroit.
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Votre liste de souhaits est vide</h3>
            <p className="text-gray-600 mb-6">Explorez nos produits et ajoutez vos favoris à votre liste de souhaits.</p>
            <Link href="/products">
              <Button>Explorer les Produits</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map((wishlistItem) => {
              const product = wishlistItem.product
              const productImage = product.images && product.images.length > 0 ? product.images[0] : null
              
              return (
                <Card key={wishlistItem.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative overflow-hidden rounded-t-lg aspect-square">
                    {productImage && isValidImageUrl(productImage) ? (
                      <Image
                        src={productImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                        <span className="text-4xl">🏺</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => handleRemoveFromWishlist(wishlistItem.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <div className="text-2xl font-bold text-amber-600">
                      {formatPrice(product.price)}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/products/${product.id}`}>Voir le Produit</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
