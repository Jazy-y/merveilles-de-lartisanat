import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ workshopId: string }> }) {
  try {
    const { workshopId } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: {
        id: workshopId,
      },
    });

    return NextResponse.json({ workshop }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching workshop:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ workshopId: string }> }) {
  try {
    // Check authentication and admin role for updating workshops
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const workshopData = await req.json();
    const { workshopId } = await params;

    // Process the data to handle images array
    const processedData = {
      ...workshopData,
      images: Array.isArray(workshopData.images) ? workshopData.images.filter((item: string) => typeof item === 'string' && item.trim() !== '') : [],
      videos: Array.isArray(workshopData.videos) ? workshopData.videos.filter((item: string) => typeof item === 'string' && item.trim() !== '') : [],
      price: workshopData.price ? parseFloat(workshopData.price) : undefined,
      slots: workshopData.slots ? parseInt(workshopData.slots) : undefined,
      availableSlots: workshopData.availableSlots ? parseInt(workshopData.availableSlots) : undefined,
    };

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(processedData).filter(([_, value]) => value !== undefined)
    );

    const workshop = await prisma.workshop.update({
      where: {
        id: workshopId,
      },
      data: cleanData,
    });

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.UPDATE_WORKSHOP,
      workshopId,
      { 
        workshopTitle: workshop.title,
        changes: workshopData
      }
    );

    return NextResponse.json({ workshop }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating workshop:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ workshopId: string }> }) {
  try {
    // Check authentication and admin role for deleting workshops
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { workshopId } = await params;

    // Get workshop info before deletion for audit log
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      select: { title: true, location: true, price: true }
    });

    await prisma.workshop.delete({
      where: {
        id: workshopId,
      },
    });

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.DELETE_WORKSHOP,
      workshopId,
      { 
        workshopTitle: workshop?.title,
        location: workshop?.location,
        price: workshop?.price
      }
    );

    return NextResponse.json({ message: 'Workshop deleted successfully' }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error deleting workshop:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
