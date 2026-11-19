import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';

export async function GET(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    // Check authentication and admin role for fetching users
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const users = await prisma.user.findMany();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
