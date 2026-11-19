import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ trainingId: string }> }) {
  try {
    const { trainingId } = await params;

    const training = await prisma.training.findUnique({
      where: {
        id: trainingId,
      },
    });

    return NextResponse.json({ training }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ trainingId: string }> }) {
  try {
    // Check authentication and admin role for updating trainings
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const trainingData = await req.json();
    const { trainingId } = await params;

    // Parse dates if provided
    let parsedStartDate = null;
    let parsedEndDate = null;
    
    if (trainingData.startDate) {
      parsedStartDate = new Date(trainingData.startDate);
    }
    if (trainingData.endDate) {
      parsedEndDate = new Date(trainingData.endDate);
    }

    // Remove the 'image' field since the database schema only has 'images'
    const { image, ...dataWithoutImage } = trainingData;
    
    const training = await prisma.training.update({
      where: {
        id: trainingId,
      },
      data: {
        ...dataWithoutImage,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });
    
    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.UPDATE_TRAINING,
      trainingId,
      { 
        trainingTitle: training.title,
        changes: trainingData
      }
    );

    return NextResponse.json({ training }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating training:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ trainingId: string }> }) {
  try {
    // Check authentication and admin role for deleting trainings
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { trainingId } = await params;

    // Get training info before deletion for audit log
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      select: { title: true, category: true, level: true }
    });

    await prisma.training.delete({
      where: {
        id: trainingId,
      },
    });

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.DELETE_TRAINING,
      trainingId,
      { 
        trainingTitle: training?.title,
        category: training?.category,
        level: training?.level
      }
    );

    return NextResponse.json({ message: 'Training deleted successfully' }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error deleting training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
