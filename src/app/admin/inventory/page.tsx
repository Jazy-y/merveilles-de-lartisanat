'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Package, AlertTriangle, CheckCircle, Search, Plus, Minus, Edit } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [stockAdjustment, setStockAdjustment] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)

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
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleStockUpdate = async (productId: string, adjustment: number) => {
    try {
      setUpdating(productId)
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantityChange: adjustment }),
      });

      if (res.ok) {
        // Update local state
        setProducts(products.map(product => 
          product.id === productId 
            ? { 
                ...product, 
                stock: Math.max(0, (product.stock || 0) + adjustment),
                updatedAt: new Date().toISOString()
              }
            : product
        ))
        
        setIsStockDialogOpen(false)
        setStockAdjustment(0)
      } else {
        if (process.env.NODE_ENV === 'development') console.error('Error updating stock');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating stock:', error)
    } finally {
      setUpdating(null)
    }
  }

  const openStockDialog = (product: Product) => {
    setSelectedProduct(product)
    setStockAdjustment(0)
    setIsStockDialogOpen(true)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'Out of Stock' }
    if (stock <= 5) return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, text: 'Low Stock' }
    return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'In Stock' }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockProducts = products.filter(product => (product.stock || 0) <= 5)
  const outOfStockProducts = products.filter(product => (product.stock || 0) === 0)

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-6">
              Gestion des Stocks
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Suivre et gérer les niveaux de stock des produits
            </p>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => (p.stock || 0) > 5).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 mb-4">
                {lowStockProducts.length} product(s) are running low on stock:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => {
                  const status = getStockStatus(product.stock || 0)
                  const StatusIcon = status.icon
                  return (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {product.stock || 0}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStockDialog(product)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'No products have been added yet.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => {
              const status = getStockStatus(product.stock || 0)
              const StatusIcon = status.icon
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                              {product.name}
                            </h3>
                            <Badge className={`${status.color} text-xs`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.text}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">{product.category}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <span>Stock actuel : <strong>{product.stock || 0}</strong></span>
                            <span>Prix : <strong>{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(product.price)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 w-full sm:w-auto">
                        <div className="text-left sm:text-right sm:mr-4">
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {product.stock || 0}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">unités</p>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockUpdate(product.id!, 1)}
                            disabled={updating === product.id}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockUpdate(product.id!, -1)}
                            disabled={updating === product.id || (product.stock || 0) <= 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStockDialog(product)}
                            disabled={updating === product.id}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Stock Adjustment Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Ajuster le Niveau de Stock</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {selectedProduct && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">
                      Ajustement du stock pour <strong>{selectedProduct.name}</strong>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Stock actuel : <strong>{selectedProduct.stock || 0}</strong> unités
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="adjustment" className="text-xs sm:text-sm">Ajustement du Stock</Label>
                    <Input
                      id="adjustment"
                      type="number"
                      value={stockAdjustment}
                      onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                      placeholder="Nombre positif pour ajouter, négatif pour retirer"
                      className="w-full mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nouveau stock sera : {Math.max(0, (selectedProduct.stock || 0) + stockAdjustment)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsStockDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                onClick={() => selectedProduct && handleStockUpdate(selectedProduct.id!, stockAdjustment)}
                disabled={updating === selectedProduct?.id || stockAdjustment === 0}
                className="w-full sm:w-auto"
              >
                {updating === selectedProduct?.id ? 'Mise à jour...' : 'Mettre à Jour le Stock'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}