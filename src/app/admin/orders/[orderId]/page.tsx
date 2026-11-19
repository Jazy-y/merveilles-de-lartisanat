'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { createCSRFHeaders } from '@/lib/csrf-client'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  DollarSign, 
  Settings,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items?: any[];
  orderItems?: any[];
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  paymentMethod: string;
  shippingAddress: any;
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        const o = data.order;
        setOrder({ ...o, items: o.items ?? o.orderItems ?? [] });
      }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return
    
    try {
      setUpdating(true)
      const res = await fetch(`/api/orders/${orderId}`,
        {
          method: 'PUT',
          headers: await createCSRFHeaders(),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const o = data.order;
        setOrder({ ...o, items: o.items ?? o.orderItems ?? [] });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating order status:', error)
    } finally {
      setUpdating(false)
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux Commandes
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Commande Introuvable</h1>
            <p className="text-muted-foreground">La commande que vous recherchez n'existe pas.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-3 sm:mb-4 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux Commandes
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
                Détails de la Commande - #{order.id?.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Informations complètes et gestion de la commande</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 text-xs sm:text-sm`}>
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
              <Badge variant="outline" className="text-xs sm:text-sm">
                {order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : order.paymentMethod?.charAt(0).toUpperCase() + order.paymentMethod?.slice(1) || 'Inconnu'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Order Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Order Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Informations de la Commande
              </h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID de Commande</Label>
                <div className="text-sm font-mono bg-muted p-3 rounded mt-1 break-all">
                  {order.id}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Méthode de Paiement</Label>
                <div className="text-sm capitalize mt-1">{order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : order.paymentMethod}</div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Créé le</Label>
                <div className="text-sm mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dernière Mise à Jour</Label>
                <div className="text-sm mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(order.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Informations Client {!order.user && <span className="text-xs font-normal text-muted-foreground">(Invité)</span>}
              </h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nom</Label>
                <div className="text-sm mt-1">
                  {order.user ? order.user.name || 'Utilisateur inconnu' : [order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(' ') || 'Invité'}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</Label>
                <div className="text-sm mt-1 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="break-all">{order.user?.email ?? order.shippingAddress?.email ?? 'Aucun email'}</span>
                </div>
              </div>
              {order.user ? (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID Utilisateur</Label>
                  <div className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                    {order.user.id}
                  </div>
                </div>
              ) : (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Téléphone</Label>
                  <div className="text-sm mt-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="break-all">{order.shippingAddress?.phone || '—'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                Adresse de Livraison
              </h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nom</Label>
                <div className="text-sm mt-1">
                  {order.shippingAddress?.firstName || ''} {order.shippingAddress?.lastName || ''}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Adresse</Label>
                <div className="text-sm mt-1 bg-muted p-3 rounded min-h-[3rem]">
                  {order.shippingAddress?.address || 'Non fournie'}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ville &amp; Code Postal</Label>
                <div className="text-sm mt-1 bg-muted p-3 rounded min-h-[3rem]">
                  {order.shippingAddress?.city && order.shippingAddress?.postalCode 
                    ? `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`
                    : 'Non fourni'
                  }
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pays</Label>
                <div className="text-sm mt-1">{order.shippingAddress?.country || 'Non fourni'}</div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Téléphone</Label>
                <div className="text-sm mt-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="bg-muted p-2 rounded min-h-[2rem] flex items-center">
                    {order.shippingAddress?.phone || 'Non fourni'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              Articles de la Commande ({(order.items ?? order.orderItems)?.length || 0} article{((order.items ?? order.orderItems)?.length || 0) !== 1 ? 's' : ''})
            </h3>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {((order.items ?? order.orderItems) ?? []).length ? ((order.items ?? order.orderItems) ?? []).map((item: any, index: number) => {
                const imageUrl = item.product?.images?.[0] ?? item.product?.image ?? null;
                return (
                  <div key={item.id ?? index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.product?.name ?? 'Product'}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized={imageUrl.startsWith('/api/')}
                        />
                      ) : (
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h4 className="font-medium text-sm sm:text-base text-foreground break-words">{item.product?.name || 'Produit inconnu'}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all">ID : {item.productId}</p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                      <div className="font-medium text-sm sm:text-base">Qté : {item.quantity}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{formatPrice(item.price)} chacun</div>
                      <div className="font-semibold text-foreground text-sm sm:text-base">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun article dans cette commande.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary and Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Order Totals */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Résumé de la Commande
              </h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total :</span>
                  <span className="text-foreground break-words font-semibold">{formatPrice(order.total)}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p className="break-words">Méthode de paiement : {order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : order.paymentMethod || 'Inconnu'}</p>
                  <p>Statut de la commande : {order.status === 'PENDING' ? 'En attente' : 
                     order.status === 'CONFIRMED' ? 'Confirmé' :
                     order.status === 'SHIPPED' ? 'Expédié' :
                     order.status === 'DELIVERED' ? 'Livré' :
                     order.status === 'CANCELLED' ? 'Annulé' : order.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Management */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                Gestion de la Commande
              </h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-foreground">Mettre à Jour le Statut de la Commande</Label>
                  <Select
                    value={order.status}
                    onValueChange={handleStatusUpdate}
                    disabled={updating}
                  >
                    <SelectTrigger className="w-full mt-2">
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
                </div>
                <div className="p-3 sm:p-4 bg-muted rounded-lg">
                  <p className="text-xs sm:text-sm text-foreground">
                    <strong>Note :</strong> Changer le statut en &quot;Confirmé&quot; réduira automatiquement le stock des produits.
                  </p>
                </div>
                {updating && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">Mise à jour du statut de la commande...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}