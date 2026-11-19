'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { WishlistItemDTO } from '@/types/domain'
import { addToCart } from '@/lib/cart-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, Eye, Star } from 'lucide-react'
import Link from 'next/link'
import { createCSRFHeaders } from '@/lib/csrf-client'

export default function WishlistTab() {
  const { data: session } = useSession()
  const [wishlist, setWishlist] = useState<WishlistItemDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/wishlist')
        if (res.ok) {
          const data = await res.json()
          const items: WishlistItemDTO[] = (data.wishlistItems ?? []).map((wi: any) => ({
            id: wi.id,
            userId: wi.userId,
            productId: wi.productId,
            name: wi.product.name,
            price: wi.product.price,
            image: wi.product.images?.[0] ?? '/placeholder-product.jpg',
            category: wi.product.category,
            addedAt: wi.createdAt,
          }))
          setWishlist(items)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session?.user])

  const handleAddToCart = useCallback(async (item: WishlistItemDTO) => {
    addToCart({ id: item.productId, name: item.name, price: item.price, images: [item.image] })
    toast.success(`${item.name} ajouté au panier`)
  }, [])

  const handleRemoveFromWishlist = useCallback(async (wishlistItemId: string) => {
    try {
      const headers = await createCSRFHeaders()
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ wishlistItemId })
      })

      if (res.ok) {
        // Update UI immediately
        setWishlist(prev => prev.filter(item => item.id !== wishlistItemId))
        toast.success('Article retiré des favoris.')
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast.error(errorData.error || 'Impossible de retirer l\'article des favoris.')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error removing from wishlist:', error)
      toast.error('Impossible de retirer l\'article des favoris.')
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground font-display">Ma liste de souhaits</h2>
        <Badge variant="outline" className="border-border text-foreground">
          {wishlist.length} {wishlist.length === 1 ? 'Article' : 'Articles'}
        </Badge>
      </div>

      {wishlist.length === 0 ? (
        <Card className="card-luxury border-2 border-dashed border-border bg-card">
          <CardContent className="text-center py-16 px-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-foreground fill-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Votre liste de souhaits est vide</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Ajoutez vos articles préférés à votre liste de souhaits pour les retrouver facilement plus tard !
            </p>
            <Link href="/products">
              <Button className="px-8 py-6 text-base">
                Découvrir les produits
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(item => (
            <Card key={item.id} className="card-luxury hover:shadow-luxury-hover transition-all duration-300 group bg-card border-border">
              <div className="relative overflow-hidden">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  width={300} 
                  height={200} 
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="w-8 h-8 p-0 rounded-full bg-card/90 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground border-0">
                    <Heart className="w-3 h-3 mr-1" />
                    Enregistré
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{item.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-foreground fill-current" />
                      <Star className="w-4 h-4 text-foreground fill-current" />
                      <Star className="w-4 h-4 text-foreground fill-current" />
                      <Star className="w-4 h-4 text-foreground fill-current" />
                      <Star className="w-4 h-4 text-foreground fill-current" />
                      <span className="text-sm text-muted-foreground ml-1">(4.8)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">${item.price.toFixed(2)}</p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-sm text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button 
                      onClick={() => handleAddToCart(item)}
                      className="w-full"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Ajouter au panier
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-border"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir les détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}