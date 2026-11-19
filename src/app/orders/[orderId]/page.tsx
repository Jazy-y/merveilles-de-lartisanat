'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Users, Truck, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  createdAt: string;
  updatedAt: string;
  items: any[];
  userName: string;
  userEmail: string;
  userId: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: any;
}

export default function UserOrderDetailsPage() {
  const { orderId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || typeof orderId !== 'string') {
        setError('Invalid Order ID')
        setLoading(false)
        return
      }

      if (!user) {
        setError('Please sign in to view order details')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order.userId !== (user as any).id) {
            setError('You are not authorized to view this order')
            return
          }
          setOrder(data.order);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching order details:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId, user])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': return <Package className="h-4 w-4" />
      case 'SHIPPED': return <Truck className="h-4 w-4" />
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
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

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-700 mb-6">The order you are looking for does not exist.</p>
          <Button onClick={() => router.push('/orders')}>View All Orders</Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/orders')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id?.slice(-8).toUpperCase()}</h1>
            <Badge className={`${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" /> Order Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600">Status:</span>
                  <Badge className={`w-fit ${getStatusColor(order.status)}`}>{order.status}</Badge>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600">Payment Method:</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600">Created At:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <span>{formatDate(order.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" /> Your Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="break-words">{order.userName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="break-all bg-gray-100 p-2 rounded">{order.userEmail}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" /> Shipping Address
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Recipient:</span>
                <span className="break-words">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Address:</span>
                <span className="break-words bg-gray-100 p-2 rounded min-h-[2.5rem]">
                  {order.shippingAddress.address || 'Not provided'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">City, Postal Code:</span>
                <span className="bg-gray-100 p-2 rounded min-h-[2.5rem]">
                  {order.shippingAddress.city && order.shippingAddress.postalCode
                    ? `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`
                    : 'Not provided'
                  }
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Country:</span>
                <span>{order.shippingAddress.country || 'Not provided'}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="break-all bg-gray-100 p-2 rounded min-h-[2.5rem]">
                  {order.shippingAddress.phone || 'Not provided'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" /> Order Items ({order.items?.length || 0} items)
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.length ? order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} width={64} height={64} className="w-full h-full object-cover rounded" />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.product?.name || 'Unknown Product'}</h4>
                      <p className="text-sm text-gray-600 font-mono">ID: {item.productId}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-medium">Qty: {item.quantity}</div>
                      <div className="text-sm text-gray-600">{formatPrice(item.price)} each</div>
                      <div className="font-semibold text-amber-600">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    No items found in this order.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
            <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-600" /> Order Summary
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatPrice(order.subtotal || order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>{formatPrice(order.tax || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>{formatPrice(order.shipping || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                  <span>Total:</span>
                  <span className="text-amber-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}