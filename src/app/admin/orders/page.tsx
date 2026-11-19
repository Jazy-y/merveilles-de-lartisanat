'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Package, Truck, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createCSRFHeaders } from '@/lib/csrf-client'

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
  } | null;
  paymentMethod: string;
  shippingAddress: any;
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`,
        {
          method: 'PUT',
          headers: await createCSRFHeaders(),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setOrders(orders.map(order => 
          order.id === orderId 
            ? data.order
            : order
        ))
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-muted text-foreground'
      case 'CONFIRMED': return 'bg-muted text-foreground'
      case 'SHIPPED': return 'bg-muted text-foreground'
      case 'DELIVERED': return 'bg-foreground text-background'
      case 'CANCELLED': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-foreground'
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

  const getOrderCustomerDisplay = (order: Order) => {
    if (order.user) return { name: order.user.name || 'Utilisateur inconnu', email: order.user.email || '' }
    const s = order.shippingAddress || {}
    const name = [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Invité'
    return { name: `Invité - ${name}`, email: s.email || '' }
  }

  const filteredOrders = orders.filter(order => {
    const { name: userName, email: userEmail } = getOrderCustomerDisplay(order)
    const orderId = order.id || ''
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orderId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number | null | undefined) => {
    if (price == null || isNaN(price)) return '0,00 DT'
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-6">
              Gestion des Commandes
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
              Gérez et suivez toutes les commandes clients
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher des commandes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                  <SelectItem value="SHIPPED">Expédié</SelectItem>
                  <SelectItem value="DELIVERED">Livré</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucune commande trouvée</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Essayez d\'ajuster vos critères de recherche ou de filtre.'
                    : 'Aucune commande n\'a encore été passée.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">
                          Commande #{order.id?.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 text-xs`}>
                            {getStatusIcon(order.status)}
                            <span className="hidden sm:inline">{order.status === 'PENDING' ? 'En attente' : 
                             order.status === 'CONFIRMED' ? 'Confirmé' :
                             order.status === 'SHIPPED' ? 'Expédié' :
                             order.status === 'DELIVERED' ? 'Livré' :
                             order.status === 'CANCELLED' ? 'Annulé' :
                             order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            <span className="sm:hidden">{order.status === 'PENDING' ? 'Attente' : 
                             order.status === 'CONFIRMED' ? 'Confirmé' :
                             order.status === 'SHIPPED' ? 'Expédié' :
                             order.status === 'DELIVERED' ? 'Livré' :
                             order.status === 'CANCELLED' ? 'Annulé' :
                             order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : order.paymentMethod?.charAt(0).toUpperCase() + order.paymentMethod?.slice(1) || 'Inconnu'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="break-words">
                          <span className="font-medium">Client :</span> {getOrderCustomerDisplay(order).name}
                        </div>
                        <div className="break-words">
                          <span className="font-medium">Email :</span> <span className="break-all">{getOrderCustomerDisplay(order).email || 'Aucun email'}</span>
                        </div>
                        <div>
                          <span className="font-medium">Date :</span> {formatDate(order.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Articles :</span> {order.orderItems?.length || 0} article(s)
                        </div>
                        <div className="break-words">
                          <span className="font-medium">Paiement :</span> {order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : order.paymentMethod || 'Inconnu'}
                        </div>
                        <div>
                          <span className="font-medium">Total :</span> {formatPrice(order.total)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 pt-3 sm:pt-0 border-t sm:border-0">
                      <Select
                        value={order.status}
                        onValueChange={(value: Order['status']) => handleStatusUpdate(order.id!, value)}
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">En attente</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                          <SelectItem value="SHIPPED">Expédié</SelectItem>
                          <SelectItem value="DELIVERED">Livré</SelectItem>
                          <SelectItem value="CANCELLED">Annulé</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Voir les détails</span>
                        <span className="sm:hidden">Détails</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </main>
  )
}