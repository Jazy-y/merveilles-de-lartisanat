import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

/**
 * Check if a user has already reserved an event for a specific date/time
 * Returns the booking if it exists, null otherwise
 */
export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)

    if (!session || !session.user) {
      return NextResponse.json(
        { hasReservation: false, booking: null },
        { status: 200 }
      )
    }

    const { searchParams } = new URL(req.url)
    const eventType = searchParams.get('eventType') // 'workshop' or 'training'
    const eventId = searchParams.get('eventId')
    const selectedDate = searchParams.get('selectedDate')

    if (!eventType || !eventId || !selectedDate) {
      return NextResponse.json(
        { error: 'Type d\'événement, ID et date sont requis.' },
        { status: 400 }
      )
    }

    if (eventType !== 'workshop' && eventType !== 'training') {
      return NextResponse.json(
        { error: 'Type d\'événement invalide.' },
        { status: 400 }
      )
    }

    // Normalize selectedDate
    const normalizedDate = selectedDate.trim()

    // Check for existing booking
    let booking = null
    if (eventType === 'workshop') {
      booking = await prisma.workshopBooking.findFirst({
        where: {
          userId: session.user.id,
          workshopId: eventId,
          selectedDate: normalizedDate,
          status: {
            notIn: ['CANCELLED'] // Consider completed bookings as valid for status view
          }
        },
        include: {
          workshop: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      booking = await prisma.trainingBooking.findFirst({
        where: {
          userId: session.user.id,
          trainingId: eventId,
          selectedDate: normalizedDate,
          status: {
            notIn: ['CANCELLED'] // Consider completed bookings as valid for status view
          }
        },
        include: {
          training: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(
      {
        hasReservation: !!booking,
        booking: booking ? {
          id: booking.id,
          status: booking.status,
          selectedDate: booking.selectedDate,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          adminMessage: booking.adminMessage,
          participantName: booking.participantName,
          participantEmail: booking.participantEmail,
          participantPhone: booking.participantPhone,
          slots: booking.slots,
          totalPrice: booking.totalPrice,
          notes: booking.notes,
          event: eventType === 'workshop' 
            ? (booking as any).workshop 
            : (booking as any).training
        } : null
      },
      { status: 200 }
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error checking booking:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la réservation.' },
      { status: 500 }
    )
  }
}

