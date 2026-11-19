import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const { rating, comment } = await req.json();
    const { reviewId } = await params;

    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating,
        comment,
      },
    });

    return NextResponse.json({ review }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const { reviewId } = await params;

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
