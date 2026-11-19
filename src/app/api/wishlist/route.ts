import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session || !(session as any).user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: (session as any).user.id,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ wishlistItems }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching wishlist items:', error);
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

    const session = await getServerSession(authOptions as any);

    if (!session || !(session as any).user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: (session as any).user.id,
        productId,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ wishlistItem }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    const session = await getServerSession(authOptions as any);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wishlistItemId } = await req.json();

    await prisma.wishlistItem.delete({
      where: {
        id: wishlistItemId,
      },
    });

    return NextResponse.json({ message: 'Item removed from wishlist' }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
