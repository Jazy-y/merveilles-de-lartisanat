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

    // Fetch all workshop bookings
    const bookings = await prisma.workshopBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workshop: {
          select: {
            id: true,
            title: true,
            schedule: true,
            hours: true,
            duration: true,
            location: true,
            price: true,
            description: true,
            slots: true,
            availableSlots: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching workshop bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshop bookings' },
      { status: 500 }
    )
  }
}
