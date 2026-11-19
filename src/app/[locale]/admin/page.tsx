'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/firebase-auth-provider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Package, DollarSign, ArrowLeft, Plus, Eye, Edit, Trash2, Calendar, GraduationCap, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { getProducts, getAllOrders, getUserCount, getAllUsers, Product, Order } from '@/lib/database-init'
import { ClientOnly } from '@/components/ui/client-only'

export default function AdminPage() {
  const { user, userData } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<Array<{
    id: string;
    name?: string;
    email?: string;
    role?: string;
    createdAt?: string;
  }>>([])
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productsData, ordersData, usersData, totalUsers] = await Promise.all([
          getProducts(),
          getAllOrders(),
          getAllUsers(),
          getUserCount()
        ])

        setProducts(productsData)
        setOrders(ordersData)
        setUsers(usersData.map((u: any) => ({
          id: u.id,
          name: u.name ?? undefined,
          email: u.email ?? undefined,
          role: u.role,
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined
        })))
        setUserCount(totalUsers)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Check if user is admin
  if (!user || userData?.role !== 'ADMIN') {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
              <div className="space-x-4">
                <Link href="/en/profile">
                  <Button>Go to Profile</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Go Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Calculate REAL stats from database
  const stats = {
    totalUsers: userCount,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <ClientOnly fallback={
      <main className="min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    }>
      <main className="min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/en/profile" className="inline-flex items-center text-amber-600 hover:text-amber-500 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your e-commerce platform</p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">#{order.id?.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-600">{(order as any).userName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt ? (typeof order.createdAt === 'string' ? order.createdAt : order.createdAt.toISOString()) : '')}</p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="p-1">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No orders yet</p>
                )}
                {orders.length > 0 && (
                  <div className="pt-2">
                    <Link href="/admin/orders">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="p-1">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="p-1">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="p-1 text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No products yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{user.name || 'No name'}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${
                        (user as any)?.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {(user as any)?.role || 'USER'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No users yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your product catalog</p>
              <div className="space-y-2">
                <Link href="/admin/products/new">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </Link>
                <Link href="/admin/products">
                  <Button variant="outline" className="w-full justify-start">
                    View All Products
                  </Button>
                </Link>
                <Link href="/admin/inventory">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Inventory Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Workshop Management</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage workshops and events</p>
              <div className="space-y-2">
                <Link href="/admin/workshops/new">
                  <Button className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add New Workshop
                  </Button>
                </Link>
                <Link href="/admin/workshops">
                  <Button variant="outline" className="w-full justify-start">
                    View All Workshops
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Training Management</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage training programs</p>
              <div className="space-y-2">
                <Link href="/admin/trainings/new">
                  <Button className="w-full justify-start">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Add New Training
                  </Button>
                </Link>
                <Link href="/admin/trainings">
                  <Button variant="outline" className="w-full justify-start">
                    View All Trainings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Process and track orders</p>
              <div className="space-y-2">
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full justify-start">
                    View All Orders
                  </Button>
                </Link>
                <Link href="/admin/orders?status=pending">
                  <Button variant="outline" className="w-full justify-start">
                    Pending Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
              <div className="space-y-2">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    View All Users
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  User Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Analyses</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Consultez les statistiques et rapports de votre entreprise</p>
              <div className="space-y-2">
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Tableau de bord des analyses
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  Rapport des ventes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Base de données</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Initialiser et gérer la base de données</p>
              <div className="space-y-2">
                <Link href="/en/admin/init-db">
                  <Button variant="outline" className="w-full justify-start">
                    Initialiser la base de données
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  Sauvegarder les données
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
    </ClientOnly>
  )
}
