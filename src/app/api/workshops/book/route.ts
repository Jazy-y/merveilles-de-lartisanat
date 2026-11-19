import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session || !(session as any).user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      workshopId, 
      slots, 
      totalPrice,
      participantName,
      participantEmail,
      participantPhone,
      selectedDate,
      notes
    } = await req.json();

    const booking = await prisma.workshopBooking.create({
      data: {
        workshopId,
        userId: (session as any).user.id,
        slots,
        totalPrice,
        status: 'PENDING',
        participantName,
        participantEmail,
        participantPhone,
        selectedDate,
        notes,
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
