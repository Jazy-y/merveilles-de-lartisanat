import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';

export async function GET() {
  try {
    const trainings = await prisma.training.findMany();

    return NextResponse.json({ trainings }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching trainings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication and admin role for creating trainings
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json();
    
    const { title, description, duration, format, level, price, images, category, startDate, endDate } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields: title, description, and category are required' }, { status: 400 });
    }

    // Parse dates if provided
    let parsedStartDate = null;
    let parsedEndDate = null;
    
    if (startDate) {
      parsedStartDate = new Date(startDate);
    }
    if (endDate) {
      parsedEndDate = new Date(endDate);
    }

    // Create training with multiple images
    const training = await prisma.training.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        duration: duration || '',
        format: format || 'Online',
        level: level || 'Beginner',
        price: parseFloat(price) || 0,
        images: Array.isArray(images) ? images.filter(item => typeof item === 'string') : [],
        category: category.trim(),
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });
    
    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.CREATE_TRAINING,
      training.id,
      { 
        trainingTitle: training.title,
        category: training.category,
        level: training.level,
        price: training.price
      }
    );

    return NextResponse.json({ training }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating training:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
