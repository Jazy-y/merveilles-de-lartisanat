'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export default function WishlistPage() {
  const { data: session } = useSession()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

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
      setLoading(false);
    };

    fetchWishlistItems();
  }, [session]);

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
      });

      if (res.ok) {
        // Update UI immediately
        setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
        toast.success('Article retiré des favoris.');
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast.error(errorData.error || 'Impossible de retirer l\'article des favoris.');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error removing from wishlist:', error);
      toast.error('Impossible de retirer l\'article des favoris.');
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          <p className="text-lg text-gray-600 mt-2">
            Your favorite handcrafted items, all in one place.
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Explore our products and add your favorites to your wishlist.</p>
            <Link href="/products">
              <Button>Explore Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={500}
                    height={500}
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {item.product.name}
                  </h3>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatPrice(item.product.price)}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/products/${item.product.id}`}>View Product</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
