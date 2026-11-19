'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/providers/cart-provider'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createCSRFHeaders } from '@/lib/csrf-client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, DollarSign, ArrowLeft, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().refine(value => value.length >= 8, {
    message: 'Le numéro de téléphone est requis'
  }),
  address: z.string().min(1, 'L\'adresse est requise'),
  city: z.string().min(1, 'La ville est requise'),
  postalCode: z.string().min(1, 'Le code postal est requis'),
  country: z.string().min(1, 'Le pays est requis'),
  paymentMethod: z.enum(['cod'])
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

function CheckoutForm() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const { state: cartState, dispatch } = useCart()
  const { data: session, status } = useSession()
  const router = useRouter()

  // Guest checkout allowed: no redirect when not logged in

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: session?.user?.email ?? '',
      country: 'Tunisie',
      paymentMethod: 'cod'
    }
  })

  const DELIVERY_FEE = 8 // 8 DT delivery fee
  const TAX_FEE = 1 // 1 DT tax

  // Show loading only while session is resolving (optional for guest checkout)
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true)
    setError('')

    try {
      const subtotal = cartState?.total || 0
      const total = subtotal + DELIVERY_FEE + TAX_FEE

      // Create order in the database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: await createCSRFHeaders(),
        body: JSON.stringify({
          items: cartState?.items || [],
          subtotal: subtotal,
          deliveryFee: DELIVERY_FEE,
          total: total,
          shippingAddress: data,
          paymentMethod: 'cash_on_delivery'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la création de la commande')
        setIsProcessing(false)
        return
      }

      const orderData = await response.json()
      dispatch({ type: 'CLEAR_CART' });
      router.push(`/checkout/confirmation?orderId=${orderData.order.id}`)
    } catch (error) {
      setError('Une erreur s\'est produite lors du traitement de votre commande. Veuillez réessayer.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!cartState?.items || cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground mb-8">
            Ajoutez des articles à votre panier avant de passer à la caisse.
          </p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuer les Achats
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Finaliser la Commande
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Complétez votre commande en toute sécurité
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Checkout Form */}
          <div className="lg:col-span-3 space-y-12">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de Livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de Téléphone</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        {...field}
                        country={'tn'}
                        inputStyle={{ width: '100%' }}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code Postal</Label>
                    <Input
                      id="postalCode"
                      {...register('postalCode')}
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-destructive">{errors.postalCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      {...register('country')}
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Méthode de Paiement</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center space-x-2 p-4 border rounded-lg bg-success/15 border-success/30">
                  <DollarSign className="h-6 w-6 text-success" />
                  <div>
                    <p className="font-semibold text-success">Paiement à la Livraison</p>
                    <p className="text-sm text-success">Payez en espèces lors de la réception de votre commande</p>
                  </div>
                </div>
                <input type="hidden" {...register('paymentMethod')} value="cod" />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-16 border bg-white shadow-sm rounded-lg">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold">Résumé de la Commande</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="space-y-6">
                  {cartState?.items?.map((item) => (
                    <div key={item.id} className="flex items-start space-x-6">
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">Pas d'image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-foreground leading-tight">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Qté: {item.quantity}
                        </p>
                      </div>
                      <p className="text-base font-bold text-foreground">
                        {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4 text-lg">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(cartState?.total || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      Frais de livraison
                    </span>
                    <span className="font-semibold">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(DELIVERY_FEE)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Taxe</span>
                    <span className="font-semibold">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(TAX_FEE)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-2xl font-bold py-4">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format((cartState?.total || 0) + DELIVERY_FEE + TAX_FEE)}</span>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full py-3 text-lg font-semibold"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmer la Commande
                </Button>

                <div className="text-sm text-muted-foreground pt-6 space-y-3 text-center">
                  <p>• Paiement sécurisé à la livraison</p>
                  <p>• Politique de retour de 30 jours</p>
                  <p>• Livraison dans toute la Tunisie</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}
