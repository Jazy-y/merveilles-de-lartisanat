import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;

    const reviews = await prisma.review.findMany({
      where: {
        productId,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session || !(session as any).user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comment } = await req.json();
    const { productId } = await params;

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        productId,
        userId: (session as any).user.id,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}