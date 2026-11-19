'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function ConfirmationPage() {
  const { dispatch } = useCart()

  useEffect(() => {
    // Clear the cart after a successful order
    dispatch({ type: 'CLEAR_CART' })
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank you for your order!
        </h1>
        <p className="text-gray-600 mb-8">
          Your order has been confirmed and will be processed shortly. You will receive an email with the details.
        </p>
        <div className="space-y-4">
          <Link href="/products">
            <Button className="w-full" size="lg">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/profile/orders">
            <Button variant="outline" className="w-full" size="lg">
              View Your Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
