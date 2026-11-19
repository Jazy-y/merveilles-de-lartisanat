import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

/**
 * Get booking status and history for a specific booking
 * Also returns all bookings for the same event by the same user (history)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session: any = await getServerSession(authOptions as any)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé.' },
        { status: 401 }
      )
    }

    const { bookingId } = await params

    // Try to find booking in workshop bookings first
    let booking: any = await prisma.workshopBooking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id
      },
      include: {
        workshop: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    let eventType = 'workshop'
    let eventId: string | null = null

    if (booking) {
      eventId = booking.workshopId
    } else {
      // Try training bookings
      booking = await prisma.trainingBooking.findFirst({
        where: {
          id: bookingId,
          userId: session.user.id
        },
        include: {
          training: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (booking) {
        eventType = 'training'
        eventId = booking.trainingId
      }
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable.' },
        { status: 404 }
      )
    }

    // Get booking history for the same event
    let history: any[] = []
    if (eventType === 'workshop' && eventId) {
      history = await prisma.workshopBooking.findMany({
        where: {
          userId: session.user.id,
          workshopId: eventId,
          id: {
            not: bookingId
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
    } else if (eventType === 'training' && eventId) {
      history = await prisma.trainingBooking.findMany({
        where: {
          userId: session.user.id,
          trainingId: eventId,
          id: {
            not: bookingId
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
        booking: {
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
            : (booking as any).training,
          eventType
        },
        history: history.map(h => ({
          id: h.id,
          status: h.status,
          selectedDate: h.selectedDate,
          createdAt: h.createdAt,
          updatedAt: h.updatedAt,
          adminMessage: h.adminMessage,
          slots: h.slots,
          totalPrice: h.totalPrice,
          event: eventType === 'workshop' 
            ? (h as any).workshop 
            : (h as any).training
        }))
      },
      { status: 200 }
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching booking status:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut de la réservation.' },
      { status: 500 }
    )
  }
}

