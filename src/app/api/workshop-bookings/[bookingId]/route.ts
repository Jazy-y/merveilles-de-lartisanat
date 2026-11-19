import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfProtection } from '@/lib/csrf'

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId } = await params

    // Fetch the specific workshop booking
    const booking = await prisma.workshopBooking.findUnique({
      where: { id: bookingId },
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

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching workshop booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshop booking' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId } = await params
    const { status } = await req.json()

    // Validate status
    if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update the booking status
    const updatedBooking = await prisma.workshopBooking.update({
      where: { id: bookingId },
      data: { status: status as any },
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

    return NextResponse.json(updatedBooking)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating workshop booking:', error)
    return NextResponse.json(
      { error: 'Failed to update workshop booking' },
      { status: 500 }
    )
  }
}
