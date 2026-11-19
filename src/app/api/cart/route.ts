import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfProtection } from '@/lib/csrf'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || !(session as any).user) {
      return NextResponse.json({ items: [] })
    }
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: (session as any).user.id },
      include: { 
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            isActive: true,
            stock: true
          }
        }
      }
    })
    
    // Filter out items for inactive products
    const activeCartItems = cartItems.filter(item => item.product.isActive)
    
    return NextResponse.json({ items: activeCartItems })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    const session = await getServerSession(authOptions as any)
    if (!session || !(session as any).user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const { productId, quantity } = await req.json()
    
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: 'Product ID and valid quantity required' 
      }, { status: 400 })
    }
    
    // Validate product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        name: true,
        price: true,
        isActive: true, 
        stock: true 
      }
    })
    
    if (!product || !product.isActive) {
      return NextResponse.json({ 
        error: 'Product not available' 
      }, { status: 400 })
    }
    
    if (product.stock < quantity) {
      return NextResponse.json({ 
        error: `Insufficient stock. Available: ${product.stock}` 
      }, { status: 400 })
    }
    
    // Add to cart or update existing item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: (session as any).user.id,
          productId: productId
        }
      },
      update: { quantity },
      create: {
        userId: (session as any).user.id,
        productId: productId,
        quantity: quantity
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            isActive: true,
            stock: true
          }
        }
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      cartItem,
      message: 'Item added to cart successfully'
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    const session = await getServerSession(authOptions as any)
    if (!session || !(session as any).user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const { productId } = await req.json()
    
    if (!productId) {
      return NextResponse.json({ 
        error: 'Product ID required' 
      }, { status: 400 })
    }
    
    // Remove item from cart
    await prisma.cartItem.deleteMany({
      where: {
        userId: (session as any).user.id,
        productId: productId
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Item removed from cart'
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    const session = await getServerSession(authOptions as any)
    if (!session || !(session as any).user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const { productId, quantity } = await req.json()
    
    if (!productId || quantity === undefined) {
      return NextResponse.json({ 
        error: 'Product ID and quantity required' 
      }, { status: 400 })
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.deleteMany({
        where: {
          userId: (session as any).user.id,
          productId: productId
        }
      })
      
      return NextResponse.json({ 
        success: true,
        message: 'Item removed from cart'
      })
    }
    
    // Validate product stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, isActive: true }
    })
    
    if (!product || !product.isActive) {
      return NextResponse.json({ 
        error: 'Product not available' 
      }, { status: 400 })
    }
    
    if (product.stock < quantity) {
      return NextResponse.json({ 
        error: `Insufficient stock. Available: ${product.stock}` 
      }, { status: 400 })
    }
    
    // Update cart item quantity
    const cartItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: (session as any).user.id,
          productId: productId
        }
      },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            isActive: true,
            stock: true
          }
        }
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      cartItem,
      message: 'Cart updated successfully'
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

