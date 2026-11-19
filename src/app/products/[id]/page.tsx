'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingCart, Heart, Star, ArrowLeft, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import ProductReviews from '@/components/product/ProductReviews'
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
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

interface Review {
  id: string;
  rating: number;
}

interface WishlistItem {
  id: string;
  product: Product;
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [reviewCount, setReviewCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { id } = useParams()
  const router = useRouter()
  const { dispatch: cartDispatch } = useCart()
  const { data: session } = useSession()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])

  // Helper function to validate image URL
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false
    if (typeof url !== 'string') return false
    if (url.trim() === '') return false
    if (url === 'undefined' || url === 'null') return false
    
    // Check for valid image URL patterns
    const trimmedUrl = url.trim()
    if (trimmedUrl.startsWith('data:') || 
        trimmedUrl.startsWith('http://') || 
        trimmedUrl.startsWith('https://') || 
        trimmedUrl.startsWith('/') ||
        trimmedUrl.includes('.')) { // Allow any URL with a file extension
      return true
    }
    
    return false
  }

  const handleAddToCart = () => {
    if (product) {
      cartDispatch({ 
        type: 'ADD_ITEM', 
        payload: { 
          id: product.id!,
          name: product.name,
          price: product.price,
          image: product.images?.[selectedImageIndex] || product.images?.[0] || ''
        } 
      })
      toast.success('Produit ajouté au panier.')
    }
  }

  const handleBuyNow = () => {
    if (product) {
      // Add the product to cart with the selected quantity
      for (let i = 0; i < quantity; i++) {
        cartDispatch({ 
          type: 'ADD_ITEM', 
          payload: { 
            id: product.id!,
            name: product.name,
            price: product.price,
            image: product.images?.[selectedImageIndex] || product.images?.[0] || ''
          } 
        })
      }
      
      // Redirect to checkout
      router.push('/checkout')
      toast.success('Redirection vers le paiement...')
    }
  }

  const handlePreviousImage = () => {
    if (product?.images) {
      const validImages = product.images.filter(img => isValidImageUrl(img))
      setSelectedImageIndex(prev => 
        prev === 0 ? validImages.length - 1 : prev - 1
      )
    }
  }

  const handleNextImage = () => {
    if (product?.images) {
      const validImages = product.images.filter(img => isValidImageUrl(img))
      setSelectedImageIndex(prev => 
        prev === validImages.length - 1 ? 0 : prev + 1
      )
    }
  }

  const handleToggleWishlist = async () => {
    if (!session) {
      toast.error('Veuillez vous connecter pour ajouter des articles à vos favoris.');
      return;
    }

    if (!product) return;

    const wishlistItem = wishlistItems.find(item => item.product.id === product.id);

    try {
      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        toast.error('Erreur de sécurité. Veuillez rafraîchir la page.');
        return
      }

      if (wishlistItem) {
        // Remove from wishlist
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ wishlistItemId: wishlistItem.id }),
        });

        if (res.ok) {
          // Update state immediately for instant feedback
          setWishlistItems(prev => prev.filter(item => item.id !== wishlistItem.id));
          toast.success('Article retiré des favoris.');
        } else {
          const errorData = await res.json().catch(() => ({}))
          toast.error(errorData.error || 'Échec de la suppression de l\'article des favoris.');
        }
      } else {
        // Add to wishlist
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
          // Update state immediately for instant feedback
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

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return

      try {
        setLoading(true)
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setSelectedImageIndex(0); // Reset to first image when product changes
        }
      } catch (err) {
        setError('Échec du chargement du produit. Veuillez réessayer plus tard.')
        if (process.env.NODE_ENV === 'development') console.error('Error loading product:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product?.images) return
      
      const validImages = product.images.filter(img => isValidImageUrl(img))
      if (validImages.length <= 1) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePreviousImage()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product?.images])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        const res = await fetch(`/api/products/${id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          const reviews: Review[] = data.reviews;
          setReviewCount(reviews.length)
          
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
            const avgRating = totalRating / reviews.length
            setAverageRating(Math.round(avgRating * 10) / 10)
          } else {
            setAverageRating(0)
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching reviews:', error);
      }
    }

    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (session) {
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            setWishlistItems(data.wishlistItems || []);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching wishlist items:', error);
        }
      } else {
        // Clear wishlist when user logs out
        setWishlistItems([]);
      }
    };

    fetchWishlistItems();
  }, [session]);

  // Refresh wishlist when product changes to ensure correct state
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (session && product) {
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            setWishlistItems(data.wishlistItems || []);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching wishlist items:', error);
        }
      }
    };

    if (product) {
      fetchWishlistItems();
    }
  }, [session, product?.id]);

  // Check if current product is in wishlist
  const isInWishlist = (): boolean => {
    if (!product || !wishlistItems.length) return false;
    return wishlistItems.some(item => item.product.id === product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Skeleton className="aspect-square rounded-lg" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <Skeleton className="h-20 w-20 rounded-lg" />
                <Skeleton className="h-20 w-20 rounded-lg" />
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-10 w-48 mb-6" />
              <Skeleton className="h-24 w-full mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive mb-4">Erreur</h2>
          <p className="text-muted-foreground">{error}</p>
          <Link href="/products">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux Produits
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏺</div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Produit introuvable</h2>
          <p className="text-muted-foreground">Le produit que vous recherchez n&apos;existe pas.</p>
          <Link href="/products">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux Produits
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 group">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Retour aux Produits
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 relative group">
              <InnerImageZoom
                src={product.images?.[selectedImageIndex] || '/placeholder-product.jpg'}
                zoomSrc={product.images?.[selectedImageIndex] || '/placeholder-product.jpg'}
                zoomType="hover"
                zoomScale={2}
              />
              
              {/* Navigation arrows - only show if there are multiple images */}
              {product.images && product.images.filter(img => isValidImageUrl(img)).length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                    onClick={handlePreviousImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Image counter */}
              {product.images && product.images.filter(img => isValidImageUrl(img)).length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {selectedImageIndex + 1} / {product.images.filter(img => isValidImageUrl(img)).length}
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {product.images && product.images.filter(img => isValidImageUrl(img)).length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images
                  .filter(img => isValidImageUrl(img))
                  .map((img, index) => (
                    <div 
                      key={index} 
                      className={`flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-foreground ring-2 ring-muted' 
                          : 'border-transparent hover:border-border'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={img!}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <Badge variant="outline" className="mb-2">{product.category}</Badge>
            <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>

            <div className="flex items-baseline space-x-2 mb-6">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-foreground mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="text-sm font-semibold text-muted-foreground">
                {product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold">Quantité :</span>
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={product.stock === 0}>-</Button>
                  <span className="px-4">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={product.stock === 0}>+</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button size="lg" className="w-full " onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0 ? 'Épuisé' : 'Ajouter au Panier'}
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="w-full border-2 border-primary bg-background text-primary hover:bg-muted" 
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Acheter Maintenant
              </Button>
              
              <Button 
                size="lg" 
                variant={isInWishlist() ? "default" : "outline"}
                className={`w-full ${
                  isInWishlist() 
                    ? 'bg-muted hover:bg-muted/80 text-destructive border-border' 
                    : ''
                }`}
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-5 w-5 mr-2 ${
                  isInWishlist() ? 'fill-current' : ''
                }`} />
                {isInWishlist() ? 'Retirer des Favoris' : 'Ajouter aux Favoris'}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Long Description / Reviews etc. */}
        <div className="mt-16">
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('description')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'description' 
                    ? 'text-foreground border-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Description Complète
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews' 
                    ? 'text-foreground border-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Avis
              </button>
            </nav>
          </div>
          
          <div className="py-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Description du Produit</h3>
                <p className="text-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Avis Clients</h3>
                {product.id && <ProductReviews productId={product.id} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}