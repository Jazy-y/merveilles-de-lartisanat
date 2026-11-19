import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { quantityChange } = await req.json();
    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (product) {
      const newStock = Math.max(0, product.stock + quantityChange);

      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          stock: newStock,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ message: 'Stock updated successfully' }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
