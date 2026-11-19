import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    // Check authentication and admin role for updating products
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const productData = await req.json();
    const { productId } = await params;

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: productData,
    });

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.UPDATE_PRODUCT,
      productId,
      { 
        productName: product.name,
        changes: productData
      }
    );

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    // Check authentication and admin role for deleting products
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { productId } = await params;

    // Get product info before deletion for audit log
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, category: true }
    });

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.DELETE_PRODUCT,
      productId,
      { 
        productName: product?.name,
        category: product?.category
      }
    );

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
