import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfProtection } from '@/lib/csrf'

export async function GET(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    // Check authentication and admin role
    const session = await getServerSession(authOptions as any)
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all training enrollments
    const enrollments = await prisma.trainingBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        training: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            description: true,
            duration: true,
            format: true,
            level: true,
            category: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching training enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training enrollments' },
      { status: 500 }
    )
  }
}
