'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Package, DollarSign, TrendingUp, Eye, Edit, GraduationCap, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  userName: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

interface WorkshopBooking {
  id: string;
  userName: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

interface TrainingEnrollment {
  id: string;
  userName: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalBookings: number
  totalEnrollments: number
  ordersToday: number
  revenueToday: number
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBookings: 0,
    totalEnrollments: 0,
    ordersToday: 0,
    revenueToday: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [recentBookings, setRecentBookings] = useState<WorkshopBooking[]>([])
  const [recentEnrollments, setRecentEnrollments] = useState<TrainingEnrollment[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [ordersRes, productsRes, usersRes, bookingsRes, enrollmentsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
          fetch('/api/users'),
          fetch('/api/bookings'),
          fetch('/api/enrollments'),
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const usersData = await usersRes.json();
        const bookingsData = await bookingsRes.json();
        const enrollmentsData = await enrollmentsRes.json();

        const orders = ordersData.orders || [];
        const products = productsData.products || [];
        const users = usersData.users || [];
        const bookings = bookingsData.bookings || [];
        const enrollments = enrollmentsData.enrollments || [];

        // Calculate stats
        const today = new Date().toDateString()
        const ordersToday = orders.filter((order: Order) => 
          new Date(order.createdAt).toDateString() === today
        )
        const revenueToday = ordersToday.reduce((sum: number, order: Order) => sum + order.total, 0)
        const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.total, 0)

        const dashboardStats: DashboardStats = {
          totalUsers: users.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          totalBookings: bookings.length,
          totalEnrollments: enrollments.length,
          ordersToday: ordersToday.length,
          revenueToday
        }

        setStats(dashboardStats)
        setRecentOrders(orders.slice(0, 5)) // Show 5 most recent orders
        setRecentProducts(products.slice(0, 5)) // Show 5 most recent products
        setRecentBookings(bookings.slice(0, 3)) // Show 3 most recent bookings
        setRecentEnrollments(enrollments.slice(0, 3)) // Show 3 most recent enrollments

      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('❌ Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatPrice = (price: number | null | undefined) => {
    if (price == null || isNaN(price)) return '0,00 DT'
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'Confirmé'
      case 'PENDING':
        return 'En attente'
      case 'SHIPPED':
        return 'Expédié'
      case 'DELIVERED':
        return 'Livré'
      case 'CANCELLED':
        return 'Annulé'
      default:
        return status
    }
  }
  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tableau de Bord Administrateur
            </h1>
            <p className="text-xl text-gray-600">
              Gérez votre boutique, commandes et produits
            </p>
          </div>

          {/* Loading Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Loading Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-6">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Gérez votre boutique, commandes et produits
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Utilisateurs enregistrés</p>
                </div>
                <div className="bg-blue-100 rounded-full p-2 sm:p-3 flex-shrink-0 ml-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Articles disponibles</p>
                </div>
                <div className="bg-green-100 rounded-full p-2 sm:p-3 flex-shrink-0 ml-2">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Chiffre d&apos;Affaires Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{formatPrice(stats.totalRevenue)}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Ventes de tous temps</p>
                </div>
                <div className="bg-amber-100 rounded-full p-2 sm:p-3 flex-shrink-0 ml-2">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Commandes Aujourd&apos;hui</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.ordersToday}</p>
                  <p className="text-xs sm:text-sm text-gray-500 break-words">{formatPrice(stats.revenueToday)} chiffre d&apos;affaires</p>
                </div>
                <div className="bg-purple-100 rounded-full p-2 sm:p-3 flex-shrink-0 ml-2">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Commandes Récentes</h2>
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">Voir Tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Aucune commande trouvée</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="font-semibold text-sm sm:text-base break-words">#{order.id?.slice(-8).toUpperCase()}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{order.userName}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto sm:text-right">
                        <p className="font-semibold text-sm sm:text-base">{formatPrice(order.total)}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Products */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Produits Récents</h2>
                <Link href="/admin/products">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">Voir Tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {recentProducts.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Aucun produit trouvé</p>
                  </div>
                ) : (
                  recentProducts.map((product) => (
                    <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="font-semibold text-sm sm:text-base break-words">{product.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{product.category}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Stock : {product.stock || 0}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto">
                        <p className="font-semibold text-sm sm:text-base">{formatPrice(product.price)}</p>
                        <div className="flex space-x-1">
                          <Link href={`/products/${product.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings & Enrollments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Recent Bookings */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Réservations Récentes</h2>
                <Link href="/admin/bookings">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">Voir Tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Aucune réservation trouvée</p>
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="font-semibold text-sm sm:text-base break-words">#{booking.id?.slice(-8).toUpperCase()}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.userName}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{formatDate(booking.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto sm:text-right">
                        <p className="font-semibold text-sm sm:text-base">{formatPrice(booking.totalAmount)}</p>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Inscriptions Récentes</h2>
                <Link href="/admin/enrollments">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">Voir Tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {recentEnrollments.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Aucune inscription trouvée</p>
                  </div>
                ) : (
                  recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="font-semibold text-sm sm:text-base break-words">#{enrollment.id?.slice(-8).toUpperCase()}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{enrollment.userName}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{formatDate(enrollment.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto sm:text-right">
                        <p className="font-semibold text-sm sm:text-base">{formatPrice(enrollment.totalAmount)}</p>
                        <Badge className={getStatusColor(enrollment.status)}>
                          {getStatusLabel(enrollment.status)}
                        </Badge>
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