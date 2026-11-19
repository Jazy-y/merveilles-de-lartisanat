import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';
import { csrfProtection } from '@/lib/csrf';

export async function GET(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    const products = await prisma.product.findMany();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    // Check authentication and admin role for creating products
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const productData = await req.json();

    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, price, category' 
      }, { status: 400 });
    }

    // Filter out invalid fields and only keep what's in the Prisma schema
    const validProductData = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock) || 0,
      category: productData.category,
      images: Array.isArray(productData.images) ? productData.images.filter((img: any) => img && img.trim()) : [],
      featured: Boolean(productData.featured),
      isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
    };

    // Validate price and stock are positive numbers
    if (validProductData.price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    if (validProductData.stock < 0) {
      return NextResponse.json({ error: 'Stock cannot be negative' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: validProductData,
    });

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.CREATE_PRODUCT,
      product.id,
      { 
        productName: product.name,
        category: product.category,
        price: product.price
      }
    );

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
