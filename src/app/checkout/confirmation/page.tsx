'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Truck, Mail, Clock } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
}

function CheckoutConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          const response = await fetch(`/api/orders/${orderId}`)
          if (response.ok) {
            const data = await response.json()
            setOrder(data.order)
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching order:', error)
        }
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderId])
  return (
    <main className="min-h-screen py-16 bg-gradient-to-b from-slate-50 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {loading ? (
            <div className="animate-pulse">
              <div className="bg-muted rounded-full p-4 w-20 h-20 mx-auto mb-6"></div>
              <div className="h-12 bg-muted rounded mb-6 max-w-md mx-auto"></div>
              <div className="h-6 bg-muted rounded max-w-2xl mx-auto"></div>
            </div>
          ) : (
            <>
              <div className={`rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg ${
                order?.status === 'PENDING' 
                  ? 'bg-amber-100 border-2 border-amber-300' 
                  : 'bg-emerald-100 border-2 border-emerald-400'
              }`}>
                {order?.status === 'PENDING' ? (
                  <Clock className="h-12 w-12 text-amber-600" />
                ) : (
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {order?.status === 'PENDING' ? 'Commande Reçue !' : 'Commande Confirmée !'}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {order?.status === 'PENDING' 
                  ? 'Merci pour votre commande ! Votre commande a été reçue et est en attente de confirmation. Vous serez notifié une fois qu\'elle sera confirmée par notre équipe.'
                  : 'Merci pour votre achat ! Votre commande a été passée avec succès et vous recevrez un e-mail de confirmation sous peu.'
                }
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="border-l-4 border-l-amber-400 bg-amber-50/50 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-amber-100">
                {order?.status === 'PENDING' ? (
                  <Clock className="h-6 w-6 text-amber-600" />
                ) : (
                  <Package className="h-6 w-6 text-amber-600" />
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                {order?.status === 'PENDING' ? 'En Attente de Confirmation' : 'Traitement de la Commande'}
              </h3>
              <p className="text-slate-600 text-sm">
                {order?.status === 'PENDING' 
                  ? 'Votre commande est en attente de confirmation par notre équipe'
                  : 'Votre commande est en cours de préparation par nos artisans'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-sky-400 bg-sky-50/50 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-sky-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Truck className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Livraison</h3>
              <p className="text-slate-600 text-sm">
                Vos articles seront expédiés dans les 2-3 jours ouvrables
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-400 bg-emerald-50/50 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-emerald-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Confirmation par E-mail</h3>
              <p className="text-slate-600 text-sm">
                Vérifiez votre e-mail pour les détails de la commande et les informations de suivi
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-t-4 border-t-foreground shadow-md">
          <CardHeader className="bg-slate-50/80 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-foreground">Détails de la Commande</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-muted-foreground">Numéro de Commande</span>
                <span className="font-semibold text-foreground">#{order?.id?.slice(-8).toUpperCase() || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-muted-foreground">Date de Commande</span>
                <span className="font-semibold">{order ? new Date(order.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-muted-foreground">Livraison Estimée</span>
                <span className="font-semibold">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-medium">Montant Total</span>
                <span className="font-bold text-emerald-700 text-lg">
                  {order ? new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(order.total) : '0,00 DT'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Des questions sur votre commande ? Contactez notre équipe de support client.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-foreground hover:bg-foreground/90">
              <Link href="/products">Continuer les Achats</Link>
            </Button>
            <Button variant="outline" asChild className="border-2 border-foreground text-foreground hover:bg-slate-100">
              <Link href="/contact">Contacter le Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="bg-muted rounded-full p-4 w-20 h-20 mx-auto mb-6"></div>
              <div className="h-12 bg-muted rounded mb-6 max-w-md mx-auto"></div>
            </div>
          </div>
        </div>
      </main>
    }>
      <CheckoutConfirmationContent />
    </Suspense>
  )
}

