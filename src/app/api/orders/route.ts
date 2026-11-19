import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';
import { csrfProtection } from '@/lib/csrf';
import { sanitizeFormData } from '@/lib/sanitize';

const DELIVERY_FEE = 8; // 8 DT delivery fee
const TAX_FEE = 1; // 1 DT tax

export async function GET() {
  try {
    // Check authentication and admin role for fetching all orders
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Return all orders (including guest orders where userId is null), newest first
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.VIEW_ORDERS,
      undefined,
      { 
        orderCount: orders.length
      }
    );

    return NextResponse.json({ orders }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(request as any)
    if (csrfResponse) {
      return csrfResponse
    }

    const session = await getServerSession(authOptions as any) as { user?: { id: string } } | null
    // Guest checkout: no session => userId will be null
    const userId = session?.user?.id ?? null

    const body = await request.json()
    
    // Sanitize all input data
    const sanitizedBody = sanitizeFormData(body)
    const { 
      items, 
      subtotal, 
      deliveryFee, 
      total, 
      shippingAddress, 
      paymentMethod 
    } = sanitizedBody

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // CRITICAL: Server-side price validation
    let calculatedSubtotal = 0
    const validatedItems = []
    
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { 
          id: true, 
          name: true, 
          price: true, 
          stock: true, 
          isActive: true 
        }
      })
      
      if (!product || !product.isActive) {
        return NextResponse.json({ 
          error: `Product ${item.id} not available` 
        }, { status: 400 })
      }
      
      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        }, { status: 400 })
      }
      
      const itemTotal = product.price * item.quantity
      calculatedSubtotal += itemTotal
      
      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price, // Server-validated price
      })
    }
    
    const calculatedTotal = calculatedSubtotal + (deliveryFee ?? DELIVERY_FEE) + TAX_FEE
    
    // Validate total matches client calculation
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return NextResponse.json({ 
        error: 'Price mismatch detected. Please refresh and try again.' 
      }, { status: 400 })
    }

    // Create order with validated data (userId null for guest checkout)
    const order = await prisma.order.create({
      data: {
        userId,
        total: calculatedTotal,
        subtotal: subtotal,
        tax: TAX_FEE,
        shipping: DELIVERY_FEE,
        status: 'PENDING',
        paymentMethod: paymentMethod || 'cash_on_delivery',
        shippingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        orderItems: {
          create: validatedItems
        }
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
