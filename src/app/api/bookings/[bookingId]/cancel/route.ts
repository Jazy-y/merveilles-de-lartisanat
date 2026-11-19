import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;
    const { type } = await req.json();

    if (type === 'workshop') {
      await prisma.workshopBooking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: 'CANCELLED',
        },
      });
    } else if (type === 'training') {
      await prisma.trainingBooking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: 'CANCELLED',
        },
      });
    }

    return NextResponse.json({ message: 'Booking cancelled successfully' }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error cancelling booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
