'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Truck, CheckCircle, Clock, Download, Eye } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  createdAt: string;
  items: any[];
  paymentMethod: string;
  paymentStatus: string;
}

const formatTND = (value: number) =>
  new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(value)

const statusToStepIndex: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
}

const OrderStatus = ({ status }: { status: Order['status'] }) => {
  const steps = [
    { key: 'pending', label: 'Passée', icon: Clock },
    { key: 'processing', label: 'Confirmée', icon: Package },
    { key: 'shipped', label: 'Expédiée', icon: Truck },
    { key: 'delivered', label: 'Livrée', icon: CheckCircle }
  ]
  const currentStep = status != null && status in statusToStepIndex
    ? Math.max(0, statusToStepIndex[status])
    : 0

  return (
    <div className="w-full">
      {/* Desktop Progress Bar */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-primary text-primary-foreground shadow-luxury'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className={`mt-2 text-sm font-medium ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
                {index === currentStep && (
                  <div className="mt-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Passée</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Package className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Confirmée</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Expédiée</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Livrée</span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

const getStatusColor = (status: Order['status']) => {
  const s = (status || '').toUpperCase()
  switch (s) {
    case 'PENDING':
      return 'bg-muted text-muted-foreground border-border'
    case 'CONFIRMED':
    case 'SHIPPED':
      return 'bg-muted text-foreground border-border'
    case 'DELIVERED':
      return 'bg-primary/10 text-foreground border-border'
    case 'CANCELLED':
      return 'bg-destructive/10 text-destructive border-border'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export default function OrdersTab() {
  const { data: session } = useSession()
  const user = session?.user
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/orders/my-orders');
          if (res.ok) {
            const data = await res.json();
            setOrders(data.orders);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching orders:', error);
        }
        setLoading(false)
      }
      fetchOrders();
    }
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground font-display">Mes commandes</h2>
        <Badge variant="outline" className="border-border text-foreground">
          {orders.length} {orders.length === 1 ? 'Commande' : 'Commandes'}
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card className="card-luxury border-2 border-dashed border-border bg-card">
          <CardContent className="text-center py-16 px-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Aucune commande pour le moment</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Explorez notre collection d&apos;artisanat tunisien authentique et commencez vos achats dès maintenant !
            </p>
            <Link href="/products">
              <Button className="px-8 py-6 text-base">
                Commencer mes achats
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="card-luxury hover:shadow-luxury-hover transition-all duration-300 bg-card border-border">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={order.id!} className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full space-y-2 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-5 h-5 text-foreground" />
                            <span className="font-semibold text-foreground">
                              Commande #{order.id!.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                          <Badge className={`${getStatusColor(order.status || 'pending')} border`}>
                            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
                          <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                          <span className="font-semibold text-foreground">{formatTND(order.total || 0)}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6">
                        {/* Order Progress */}
                        <div className="p-4 bg-muted rounded-lg border border-border">
                          <h4 className="font-semibold text-foreground mb-4 flex items-center">
                            <Truck className="w-5 h-5 text-foreground mr-2" />
                            Progression de la commande
                          </h4>
                          <OrderStatus status={order.status || 'pending'} />
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-4 flex items-center">
                            <Package className="w-5 h-5 text-foreground mr-2" />
                            Articles de la commande ({(order.items || []).length})
                          </h4>
                          <div className="space-y-3">
                            {(order.items || []).map((item, index) => (
                              <div key={item.productId} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center border border-border">
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">{item.productName || 'Produit inconnu'}</p>
                                  <p className="text-sm text-muted-foreground">Quantité : {item.quantity || 0}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-foreground">{formatTND(item.total || 0)}</p>
                                  <p className="text-sm text-muted-foreground">{formatTND(item.price || 0)} chacun</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h5 className="font-semibold text-foreground mb-2">Résumé de la commande</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Sous-total :</span>
                                <span>{formatTND(order.subtotal || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Taxe :</span>
                                <span>{formatTND(order.tax || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Livraison :</span>
                                <span>{formatTND(order.shipping || 0)}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Total :</span>
                                <span>{formatTND(order.total || 0)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-muted rounded-lg">
                            <h5 className="font-semibold text-foreground mb-2">Informations de paiement</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Méthode de paiement :</span>
                                <span className="capitalize">{order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : order.paymentMethod || 'Inconnue'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Statut du paiement :</span>
                                <Badge variant="outline" className={(order.paymentStatus || 'pending') === 'paid' ? 'bg-primary/10 text-foreground border-border' : 'bg-muted text-muted-foreground border-border'}>
                                  {(order.paymentStatus || 'pending') === 'paid' ? 'Payé' : 'En attente'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
                          <Button variant="outline" className="w-full sm:w-auto border-border">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir les détails
                          </Button>
                          <Button className="w-full sm:w-auto">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger la facture
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
