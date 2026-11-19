import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { csrfProtection } from '@/lib/csrf'

/**
 * Unified booking creation endpoint for both Workshops and Trainings
 * Prevents duplicate reservations for the same event, user, and date/time
 */
export async function POST(req: NextRequest) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    const session: any = await getServerSession(authOptions as any)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Veuillez vous connecter pour réserver.' },
        { status: 401 }
      )
    }

    const {
      eventType, // 'workshop' or 'training'
      eventId,
      slots,
      totalPrice,
      participantName,
      participantEmail,
      participantPhone,
      selectedDate,
      notes
    } = await req.json()

    // Validate required fields
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

    // Normalize selectedDate to ensure consistent format for duplicate checking
    const normalizedDate = selectedDate.trim()

    // Check for duplicate reservation (same user, event, and date/time)
    let existingBooking = null
    if (eventType === 'workshop') {
      existingBooking = await prisma.workshopBooking.findFirst({
        where: {
          userId: session.user.id,
          workshopId: eventId,
          selectedDate: normalizedDate,
          status: {
            notIn: ['CANCELLED', 'COMPLETED'] // Allow rebooking if cancelled or completed
          }
        }
      })
    } else {
      existingBooking = await prisma.trainingBooking.findFirst({
        where: {
          userId: session.user.id,
          trainingId: eventId,
          selectedDate: normalizedDate,
          status: {
            notIn: ['CANCELLED', 'COMPLETED'] // Allow rebooking if cancelled or completed
          }
        }
      })
    }

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Vous avez déjà réservé cet événement à cette date.' },
        { status: 409 }
      )
    }

    // Create booking
    let booking
    if (eventType === 'workshop') {
      // Verify workshop exists
      const workshop = await prisma.workshop.findUnique({
        where: { id: eventId }
      })

      if (!workshop) {
        return NextResponse.json(
          { error: 'Atelier introuvable.' },
          { status: 404 }
        )
      }

      booking = await prisma.workshopBooking.create({
        data: {
          workshopId: eventId,
          userId: session.user.id,
          slots: slots || 1,
          totalPrice: totalPrice || workshop.price,
          status: 'PENDING',
          participantName: participantName || session.user.name || null,
          participantEmail: participantEmail || session.user.email || null,
          participantPhone: participantPhone || null,
          selectedDate: normalizedDate,
          notes: notes || null
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
    } else {
      // Verify training exists
      const training = await prisma.training.findUnique({
        where: { id: eventId }
      })

      if (!training) {
        return NextResponse.json(
          { error: 'Formation introuvable.' },
          { status: 404 }
        )
      }

      booking = await prisma.trainingBooking.create({
        data: {
          trainingId: eventId,
          userId: session.user.id,
          slots: slots || 1,
          totalPrice: totalPrice || training.price,
          status: 'PENDING',
          participantName: participantName || session.user.name || null,
          participantEmail: participantEmail || session.user.email || null,
          participantPhone: participantPhone || null,
          selectedDate: normalizedDate,
          notes: notes || null
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
    }

    return NextResponse.json(
      {
        booking,
        message: 'Votre réservation a été enregistrée avec succès.'
      },
      { status: 201 }
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Impossible de traiter la réservation.' },
      { status: 500 }
    )
  }
}

