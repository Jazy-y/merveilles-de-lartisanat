'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/components/providers/cart-provider'
import { ShoppingCart, Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { getCSRFToken } from '@/lib/csrf-client'

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
}

interface WishlistItem {
  id: string;
  product: Product;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { dispatch: cartDispatch } = useCart()
  const { data: session } = useSession()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (session) {
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            setWishlistItems(data.wishlistItems);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching wishlist items:', error);
        }
      }
    };

    fetchWishlistItems();
  }, [session]);

  const handleAddToCart = (product: Product) => {
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id!,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder-product.jpg',
        } as any
    })
  }

  const handleToggleWishlist = async (product: Product) => {
    if (!session) {
      toast.error('Veuillez vous connecter pour ajouter des articles à vos favoris.');
      return;
    }

    const wishlistItem = wishlistItems.find(item => item.product.id === product.id);

    try {
      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        toast.error('Erreur de sécurité. Veuillez rafraîchir la page.');
        return
      }

      if (wishlistItem) {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ wishlistItemId: wishlistItem.id }),
        });

        if (res.ok) {
          setWishlistItems(prev => prev.filter(item => item.id !== wishlistItem.id));
          toast.success('Article retiré des favoris.');
        } else {
          const errorData = await res.json().catch(() => ({}))
          toast.error(errorData.error || 'Échec de la suppression de l\'article des favoris.');
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ productId: product.id }),
        });

        if (res.ok) {
          const data = await res.json();
          setWishlistItems(prev => [...prev, data.wishlistItem]);
          toast.success('Article ajouté aux favoris.');
        } else {
          const errorData = await res.json().catch(() => ({}))
          toast.error(errorData.error || 'Échec de l\'ajout de l\'article aux favoris.');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating wishlist:', error)
      toast.error('Échec de la mise à jour des favoris.');
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-64 rounded-t-lg" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-6 w-16" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-lg text-gray-600 mt-2">
            Explore our collection of handcrafted items.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏺</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Check back soon for our handcrafted items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <Card className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      {product.images && product.images.length > 0 && product.images[0] && product.images[0].trim() !== '' ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={500}
                          height={500}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                          <span className="text-4xl">🏺</span>
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 bg-amber-500">
                        {product.category}
                      </Badge>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleWishlist(product)
                        }}
                      >
                        <Heart className={`h-4 w-4 ${wishlistItems.some(item => item.product.id === product.id) ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-bold text-amber-600">
                        {formatPrice(product.price)}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product)
                      }}
                      className="w-full"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}