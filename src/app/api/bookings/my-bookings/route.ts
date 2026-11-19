import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session || !(session as any).user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workshopBookings = await prisma.workshopBooking.findMany({
      where: {
        userId: (session as any).user.id,
      },
      include: {
        workshop: true,
      },
    });

    const trainingBookings = await prisma.trainingBooking.findMany({
      where: {
        userId: (session as any).user.id,
      },
      include: {
        training: true,
      },
    });

    const bookings = [
      ...workshopBookings.map(b => ({ ...b, type: 'workshop' })),
      ...trainingBookings.map(b => ({ ...b, type: 'training' })),
    ];

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
