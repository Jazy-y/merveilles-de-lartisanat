import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
      },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
