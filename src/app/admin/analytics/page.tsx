'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createCSRFHeaders } from '@/lib/csrf-client'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  BookOpen,
  Calendar,
} from 'lucide-react'

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  orderItems: any[];
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface User {
  id: string;
}

interface Product {
  id: string;
}

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  pendingOrders: number
  completedOrders: number
  recentOrders: Order[]
  topProducts: { id: string; name: string; quantity: number; revenue: number }[]
  totalFormations: number
  totalWorkshops: number
  totalEnrollments: number
  totalBookings: number
  monthlyRevenue: number[]
  orderStatusCounts: Record<string, number>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        const [ordersRes, usersRes, productsRes, trainingsRes, workshopsRes, enrollmentsRes, bookingsRes] = await Promise.all([
          fetch('/api/orders', { headers: await createCSRFHeaders() }),
          fetch('/api/users', { headers: await createCSRFHeaders() }),
          fetch('/api/products', { headers: await createCSRFHeaders() }),
          fetch('/api/trainings', { headers: await createCSRFHeaders() }),
          fetch('/api/workshops', { headers: await createCSRFHeaders() }),
          fetch('/api/training-enrollments', { headers: await createCSRFHeaders() }),
          fetch('/api/workshop-bookings', { headers: await createCSRFHeaders() }),
        ]);

        const { orders }: { orders: Order[] } = await ordersRes.json();
        const { users }: { users: User[] } = await usersRes.json();
        const { products }: { products: Product[] } = await productsRes.json();
        const trainings = await trainingsRes.json();
        const workshops = await workshopsRes.json();
        const enrollments = await enrollmentsRes.json();
        const bookings = await bookingsRes.json();

        // Calculate analytics
        const totalRevenue = orders
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + order.total, 0)

        const totalOrders = orders.length
        const totalUsers = users.length
        const totalProducts = products.length
        const pendingOrders = orders.filter(order => order.status === 'pending').length
        const completedOrders = orders.filter(order => order.status === 'delivered').length
        const totalFormations = trainings.length
        const totalWorkshops = workshops.length
        const totalEnrollments = enrollments.length
        const totalBookings = bookings.length

        // Recent orders (last 10)
        const recentOrders = orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)

        // Top products by quantity sold
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
        orders.forEach(order => {
          if (order.orderItems && Array.isArray(order.orderItems)) {
            order.orderItems.forEach((item: any) => {
              if (!productSales[item.productId]) {
                productSales[item.productId] = {
                  name: item.product?.name || 'Unknown Product',
                  quantity: 0,
                  revenue: 0
                }
              }
              productSales[item.productId].quantity += item.quantity
              productSales[item.productId].revenue += item.price * item.quantity
            })
          }
        })

        const topProducts = Object.entries(productSales)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)

        // Monthly revenue (last 6 months)
        const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          
          return orders
            .filter(order => {
              const orderDate = new Date(order.createdAt)
              return orderDate >= monthStart && orderDate <= monthEnd && order.status === 'delivered'
            })
            .reduce((sum, order) => sum + order.total, 0)
        }).reverse()

        // Order status counts
        const orderStatusCounts = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        setAnalytics({
          totalRevenue,
          totalOrders,
          totalUsers,
          totalProducts,
          pendingOrders,
          completedOrders,
          recentOrders,
          topProducts,
          totalFormations,
          totalWorkshops,
          totalEnrollments,
          totalBookings,
          monthlyRevenue,
          orderStatusCounts
        })
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const formatPrice = (price: number | null | undefined) => {
    if (price == null || isNaN(price)) return '0,00 DT'
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!analytics) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Analytics Data</h1>
            <p className="text-gray-600">Unable to load analytics data.</p>
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
              Tableau de Bord Analytique
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Aperçu de la performance de votre entreprise
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Chiffre d'Affaires Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                    {formatPrice(analytics.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Commandes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 flex-shrink-0" />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training & Workshop Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 flex-shrink-0" />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Formations</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalFormations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Ateliers</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalWorkshops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600 flex-shrink-0" />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Inscriptions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalEnrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 flex-shrink-0" />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Réservations</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Aperçu des Statuts de Commandes</h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(analytics.orderStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(status)} text-xs sm:text-sm`}>
                        {status === 'PENDING' ? 'En attente' : 
                         status === 'CONFIRMED' ? 'Confirmé' :
                         status === 'SHIPPED' ? 'Expédié' :
                         status === 'DELIVERED' ? 'Livré' :
                         status === 'CANCELLED' ? 'Annulé' :
                         status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Statistiques Rapides</h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Commandes en Attente</span>
                  <span className="font-semibold text-sm sm:text-base text-yellow-600">{analytics.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Commandes Terminées</span>
                  <span className="font-semibold text-sm sm:text-base text-green-600">{analytics.completedOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Taux de Complétion</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {analytics.totalOrders > 0 
                      ? Math.round((analytics.completedOrders / analytics.totalOrders) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Valeur Moyenne de Commande</span>
                  <span className="font-semibold text-sm sm:text-base break-words">
                    {analytics.totalOrders > 0 
                      ? formatPrice(analytics.totalRevenue / analytics.totalOrders)
                      : formatPrice(0)
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Produits les Plus Vendus</h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {analytics.topProducts.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-600 text-center py-4">Aucune donnée de vente disponible</p>
                ) : (
                  analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base text-gray-900 break-words">{product.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{product.quantity} vendu{product.quantity !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{formatPrice(product.revenue)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Commandes Récentes</h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {analytics.recentOrders.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-600 text-center py-4">Aucune commande récente</p>
                ) : (
                  analytics.recentOrders.map((order) => (
                    <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="font-medium text-sm sm:text-base text-gray-900 break-words">#{order.id?.slice(-8).toUpperCase()}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{order.user?.name || 'Utilisateur inconnu'}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto sm:text-right">
                        <Badge className={`${getStatusColor(order.status)} text-xs`}>
                          {order.status === 'PENDING' ? 'En attente' : 
                           order.status === 'CONFIRMED' ? 'Confirmé' :
                           order.status === 'SHIPPED' ? 'Expédié' :
                           order.status === 'DELIVERED' ? 'Livré' :
                           order.status === 'CANCELLED' ? 'Annulé' :
                           order.status}
                        </Badge>
                        <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}