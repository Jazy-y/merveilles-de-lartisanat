'use server'

import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/database-service'
import { csrfProtection } from '@/lib/csrf'

export async function POST(request: Request) {
  // CSRF protection
  const csrfResponse = await csrfProtection(request as any)
  if (csrfResponse) {
    return csrfResponse
  }

  const { userId, items, total, shippingAddress, paymentMethod } = await request.json()

  try {

    // Calculate shipping and tax
    const shipping = 10
    const tax = total * 0.1
    const subtotal = total

    // Create order data for PostgreSQL
    const orderData = {
      userId,
      total: subtotal + tax + shipping,
      status: 'PENDING' as const,
      paymentMethod: paymentMethod || 'card',
      paymentId: undefined,
      shippingAddress: {
        firstName: shippingAddress.firstName || '',
        lastName: shippingAddress.lastName || '',
        address1: shippingAddress.address || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || 'Tunisia',
        phone: shippingAddress.phone || ''
      }
    }

    const orderId = await createOrder(orderData)

    return NextResponse.json({ orderId })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('❌ Error creating order:', error)
    return new NextResponse('Error creating order', { status: 500 })
  }
}
