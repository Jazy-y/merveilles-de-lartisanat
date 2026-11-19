'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Product, Category } from '@/lib/database-init'
import { ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/providers/cart-provider'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { getCSRFToken } from '@/lib/csrf-client'

interface WishlistItem {
  id: string;
  product: Product;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ])
        
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData.products || [])
          setFilteredProducts(productsData.products || [])
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.categories || [])
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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
      }
    };

    fetchWishlistItems();
  }, [session]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory))
    }
  }, [selectedCategory, products])

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id!,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/placeholder-product.jpg',
      } as any
    })
    toast.success('Produit ajouté au panier.')
  }

  const handleToggleWishlist = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item?.product?.id === productId)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          {/* Category Filters Skeleton */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Card key={item}>
                <Skeleton className="aspect-square rounded-t-lg" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Nos Produits</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre collection de produits artisanaux créés par des artisans qualifiés
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Tous les Produits
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Count */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            Affichage de {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` dans ${selectedCategory}`}
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏺</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-6">Essayez de sélectionner une catégorie différente ou revenez plus tard.</p>
            <Button onClick={() => setSelectedCategory('all')}>
              Voir Tous les Produits
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative flex-shrink-0">
                  {product.images && product.images.length > 0 && isValidImageUrl(product.images[0]) ? (
                    <Image
                      src={product.images[0]!}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-4xl">🏺</span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.featured && (
                      <Badge className="bg-foreground text-background text-xs px-2 py-1">En Vedette</Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className={`rounded-full p-2 w-8 h-8 ${
                        isInWishlist(product.id!) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={(e) => handleToggleWishlist(product, e)}
                    >
                      <Heart className={`h-4 w-4 ${
                        isInWishlist(product.id!) ? 'fill-current' : ''
                      }`} />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-6 flex-grow flex flex-col">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:opacity-80 transition-opacity line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-3 sm:mb-4 line-clamp-3 flex-grow">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl sm:text-2xl font-bold text-foreground">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        Voir Détails
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      className="w-10 h-10 p-0"
                      disabled={product.stock === 0}
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}