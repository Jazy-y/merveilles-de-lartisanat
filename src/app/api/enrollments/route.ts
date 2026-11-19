import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const enrollments = await prisma.trainingBooking.findMany();

    return NextResponse.json({ enrollments }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
