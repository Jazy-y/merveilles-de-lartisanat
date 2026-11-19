import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';

export async function GET() {
  try {
    // Allow all users (including non-authenticated) to view active workshops
    const workshops = await prisma.workshop.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ workshops }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching workshops:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role for creating workshops
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const workshopData = await req.json();

    // Validate required fields
    if (!workshopData.title || !workshopData.description || !workshopData.location || !workshopData.schedule || !workshopData.hours || !workshopData.price || !workshopData.slots || !workshopData.category) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, location, schedule, hours, price, slots, and category are required' 
      }, { status: 400 });
    }

    const workshop = await prisma.workshop.create({
      data: {
        title: workshopData.title.trim(),
        description: workshopData.description.trim(),
        location: workshopData.location.trim(),
        schedule: workshopData.schedule.trim(),
        hours: workshopData.hours.trim(),
        duration: workshopData.duration?.trim() || '1 journée',
        price: parseFloat(workshopData.price),
        slots: parseInt(workshopData.slots),
        availableSlots: parseInt(workshopData.availableSlots || workshopData.slots),
        images: Array.isArray(workshopData.images) ? workshopData.images.filter((item: string) => typeof item === 'string' && item.trim() !== '') : [],
        videos: Array.isArray(workshopData.videos) ? workshopData.videos.filter((item: string) => typeof item === 'string' && item.trim() !== '') : [],
        category: workshopData.category.trim(),
        isActive: workshopData.isActive !== undefined ? Boolean(workshopData.isActive) : true,
      },
    });

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.CREATE_WORKSHOP,
      workshop.id,
      { 
        workshopTitle: workshop.title,
        location: workshop.location,
        schedule: workshop.schedule,
        hours: workshop.hours,
        price: workshop.price,
        slots: workshop.slots
      }
    );

    return NextResponse.json({ workshop }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating workshop:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
