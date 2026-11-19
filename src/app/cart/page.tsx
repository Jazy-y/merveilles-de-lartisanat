'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/components/providers/cart-provider'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
  const { state, dispatch } = useCart()

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id)
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    }
  }

  if (state.items.length === 0) {
    return (
      <main className="min-h-screen py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-muted rounded-full p-6 sm:p-8 w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base px-2">
              Il semble que vous n&apos;ayez pas encore ajouté d&apos;articles à votre panier.
            </p>
            <Button asChild className="min-h-11 touch-manipulation">
              <Link href="/products">Continuer les Achats</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-6 sm:py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-6">
            Panier d&apos;Achat
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground px-1">
            Vérifiez vos articles et procédez au paiement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {state.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 sm:p-6">
                  {/* Mobile: stacked layout; Desktop: single row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4">
                    <div className="flex gap-3 sm:contents">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                          {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2 flex-wrap">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 shrink-0 touch-manipulation"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-7 sm:w-8 text-center text-sm sm:text-base tabular-nums">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 shrink-0 touch-manipulation"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base sm:text-lg tabular-nums">
                          {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(item.price * item.quantity)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 shrink-0 text-destructive hover:text-destructive/90 touch-manipulation"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary - sticky on desktop, flows on mobile */}
          <div className="lg:col-span-1 order-first lg:order-none">
            <Card className="lg:sticky lg:top-24">
              <CardHeader className="pb-2 sm:pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Résumé de la Commande</h2>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-semibold tabular-nums">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(state.total)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-semibold tabular-nums">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(8)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Taxe</span>
                  <span className="font-semibold tabular-nums">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(1)}</span>
                </div>
                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-primary tabular-nums">
                      {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(state.total + 8 + 1)}
                    </span>
                  </div>
                </div>
                <Button className="w-full min-h-11 sm:min-h-12 touch-manipulation" size="lg" asChild>
                  <Link href="/checkout">Procéder au Paiement</Link>
                </Button>
                <Button variant="outline" className="w-full min-h-11 sm:min-h-12 touch-manipulation" asChild>
                  <Link href="/products">Continuer les Achats</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}